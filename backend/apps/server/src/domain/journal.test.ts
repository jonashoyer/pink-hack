import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDb } from "@backend/db";
import { user } from "@backend/db/schema/auth";
import * as tables from "@backend/db/schema/journal";
import { getTableConfig, SQLiteDialect } from "drizzle-orm/sqlite-core";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { sql, is, SQL, eq } from "drizzle-orm";
import type { Database } from "@backend/db";
import { Hono } from "hono";
import { createJournalRoutes } from "../routes/journal";
import { DomainError, getContext, patchPage, patchProfile, createCheckin, getCheckin, prepareDraft, confirmDraft, commitCheckin, cancelCheckin, getJournalEntry, listJournal, getVoiceContext, journalDate, journalDraftSchema } from "./journal";

// Test-only DDL derives from actual table definitions, without migrations or
// touching the application database. All stored content is synthetic.
async function setup() {
  const dir = await mkdtemp(join(tmpdir(), "pink-journal-test-"));
  const db = createDb({ DATABASE_URL: `file:${join(dir, "test.db")}` });
  const dialect = new SQLiteDialect();
  const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
  const render = (value: SQL) => dialect.sqlToQuery(value).sql;
  await db.run(sql.raw("PRAGMA foreign_keys = ON"));
  for (const table of [user, ...Object.values(tables)] as SQLiteTable[]) {
    const config = getTableConfig(table);
    const columns = config.columns.map((col) => {
      let out = `${quote(col.name)} ${col.getSQLType()}${col.primary ? " PRIMARY KEY" : ""}${col.notNull ? " NOT NULL" : ""}${col.isUnique ? " UNIQUE" : ""}`;
      if (col.default !== undefined) {
        const v = col.default;
        out += ` DEFAULT ${is(v, SQL) ? render(v) : typeof v === "string" ? `'${v.replaceAll("'", "''")}'` : Number(v)}`;
      }
      return out;
    });
    for (const fk of config.foreignKeys) {
      const ref = fk.reference();
      columns.push(`FOREIGN KEY (${ref.columns.map((c) => quote(c.name)).join(",")}) REFERENCES ${quote(getTableConfig(ref.foreignTable).name)} (${ref.foreignColumns.map((c) => quote(c.name)).join(",")}) ON DELETE ${fk.onDelete}`);
    }
    await db.run(sql.raw(`CREATE TABLE ${quote(config.name)} (${columns.join(",")})`));
    for (const index of config.indexes) {
      const { name, unique, columns: fields, where } = index.config;
      await db.run(sql.raw(`CREATE ${unique ? "UNIQUE " : ""}INDEX ${quote(name!)} ON ${quote(config.name)} (${fields.map((f) => is(f, SQL) ? render(f) : quote(f.name)).join(",")})${where ? ` WHERE ${render(where)}` : ""}`));
    }
  }
  for (const owner of ["alice", "bob"]) await db.insert(user).values({ id: owner, name: owner, email: `${owner}@example.test` });
  return { db, close: async () => { db.$client.close(); await rm(dir, { recursive: true, force: true }); } };
}
const draft: tables.JournalDraft = { title: "Synthetic check-in", original_text: "I would like a short walk. I rate my energy two out of five.", note: "A short walk is today's priority. Reported energy: 2 out of 5.", observations: [{ metric: "energy", value: 2 }, { metric: "sleep_hours", value: 6 }], proposed_plan: { items: [{ id: "walk", text: "Consider a short walk", state: "active" }] } };
const rejects = (code: string) => (error: unknown) => error instanceof DomainError && error.code === code;
async function pending(db: Database, operation: string) {
  const checkin = await createCheckin(db, "alice", { source: "app", operation_id: `capture-${operation}` });
  await prepareDraft(db, "alice", checkin.id, { expected_revision: 0, draft });
  return checkin;
}
async function confirm(db: Database, checkinId: string, operation_id: string, draft_revision = 1, plan_state: "draft" | "accepted" = "draft", replace_plan_id?: string) {
  return confirmDraft(db, "alice", checkinId, { draft_revision, action: "save", operation_id, plan_state, ...(replace_plan_id ? { replace_plan_id } : {}) });
}
async function commit(db: Database, checkinId: string, receipt: { receipt: string; operation_id: string }) {
  return commitCheckin(db, "alice", checkinId, { confirmation_receipt: receipt.receipt, operation_id: receipt.operation_id });
}

test("owned pages, profile revisions, timezone and device rejection", async () => {
  const { db, close } = await setup();
  try {
    const context = await getContext(db, "alice");
    assert.equal(context.pages.length, 2);
    const page = context.pages[0]!;
    await assert.rejects(patchPage(db, "bob", page.id, { expected_revision: 0, sections: [] }), rejects("not_found"));
    assert.equal((await patchPage(db, "alice", page.id, { expected_revision: 0, sections: [{ id: "one", title: "Preference", type: "text", body: "Synthetic text" }] })).revision, 1);
    await assert.rejects(patchPage(db, "alice", page.id, { expected_revision: 0, sections: [] }), rejects("revision_conflict"));
    await patchProfile(db, "alice", { expected_revision: 0, timezone: "Pacific/Kiritimati" });
    await assert.rejects(patchProfile(db, "alice", { expected_revision: 0, timezone: "UTC" }), rejects("revision_conflict"));
    assert.equal(journalDate("Pacific/Kiritimati", new Date("2026-10-24T23:00:00Z")), "2026-10-25");
    await assert.rejects(createCheckin(db, "alice", { source: "atech", operation_id: "device" }), rejects("device_not_supported"));
    await assert.rejects(createCheckin(db, "alice", { source: "app", device_id: "device", operation_id: "device" }), rejects("device_not_supported"));
  } finally { await close(); }
});

test("revision-bound confirmation, atomic commit, owner isolation and stable retries", async () => {
  const { db, close } = await setup();
  try {
    const checkin = await pending(db, "one");
    assert.equal((await createCheckin(db, "alice", { source: "app", operation_id: "capture-one" })).id, checkin.id);
    await assert.rejects(getCheckin(db, "bob", checkin.id), rejects("not_found"));
    await assert.rejects(confirm(db, checkin.id, "save-one", 0), rejects("revision_conflict"));
    const stale = await confirm(db, checkin.id, "save-one");
    await prepareDraft(db, "alice", checkin.id, { expected_revision: 1, draft: { ...draft, note: "Revised synthetic note" } });
    await assert.rejects(commit(db, checkin.id, stale), rejects("confirmation_required"));
    const receipt = await confirm(db, checkin.id, "save-one", 2, "accepted");
    assert.deepEqual(await confirm(db, checkin.id, "save-one", 2, "accepted"), receipt);
    const entry = await commit(db, checkin.id, receipt);
    assert.equal(entry.original_text, draft.original_text);
    assert.equal(entry.observations.length, 2);
    assert.equal(entry.day_plans[0]!.state, "accepted");
    assert.equal((await commit(db, checkin.id, receipt)).id, entry.id);
    assert.equal((await listJournal(db, "alice")).entries.length, 1);
    assert.equal((await listJournal(db, "bob")).entries.length, 0);
    await assert.rejects(getJournalEntry(db, "bob", entry.id), rejects("not_found"));
    await assert.rejects(cancelCheckin(db, "alice", checkin.id), rejects("checkin_closed"));
    await assert.rejects(getVoiceContext(db, "alice", checkin.id), rejects("checkin_closed"));
    const other = await pending(db, "two");
    await assert.rejects(confirm(db, other.id, "save-one"), rejects("operation_conflict"));
  } finally { await close(); }
});

test("storage failure rolls back all writes and permits retry; cancellation is terminal", async () => {
  const { db, close } = await setup();
  try {
    const checkin = await pending(db, "failure");
    const receipt = await confirm(db, checkin.id, "save-failure");
    await db.run(sql.raw("CREATE TRIGGER synthetic_failure BEFORE INSERT ON observations BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END"));
    await assert.rejects(commit(db, checkin.id, receipt), rejects("storage_unavailable"));
    assert.equal((await listJournal(db, "alice")).entries.length, 0);
    assert.equal((await getCheckin(db, "alice", checkin.id)).stage, "awaiting_confirmation");
    await db.run(sql.raw("DROP TRIGGER synthetic_failure"));
    await commit(db, checkin.id, receipt);
    const canceled = await pending(db, "cancel");
    await cancelCheckin(db, "alice", canceled.id);
    assert.equal((await cancelCheckin(db, "alice", canceled.id)).stage, "canceled");
    await assert.rejects(prepareDraft(db, "alice", canceled.id, { expected_revision: 1, draft }), rejects("checkin_closed"));
    await assert.rejects(getVoiceContext(db, "alice", canceled.id), rejects("checkin_closed"));
  } finally { await close(); }
});

test("voice opt-in controls pages and journal text; new drafts attach actual context revisions", async () => {
  const { db, close } = await setup();
  try {
    const checkin = await pending(db, "voice");
    const personal = (await getContext(db, "alice")).pages.find((p) => p.kind === "personal_needs")!;
    await patchPage(db, "alice", personal.id, { expected_revision: 0, sections: [] });
    const voice = await getVoiceContext(db, "alice", checkin.id);
    assert.equal(voice.pages.length, 1);
    assert.equal(voice.pages[0]!.kind, "personal_needs");
    assert.equal(voice.context_revisions[personal.id], 1);
    assert.equal(voice.checkin.context_revisions[personal.id], 0);
    assert.deepEqual(voice.recent_journal_entries, []);
    const revised = await prepareDraft(db, "alice", checkin.id, { expected_revision: 1, draft });
    assert.deepEqual(revised.context_revisions, voice.context_revisions);
    await patchProfile(db, "alice", { expected_revision: 0, allow_medical_voice_context: true });
    assert.equal((await getVoiceContext(db, "alice", checkin.id)).pages.length, 2);
    await prepareDraft(db, "alice", checkin.id, { expected_revision: 2, draft });
    await commit(db, checkin.id, await confirm(db, checkin.id, "save-voice", 3));
    const second = await createCheckin(db, "alice", { source: "app", operation_id: "second-voice" });
    assert.equal((await getVoiceContext(db, "alice", second.id)).recent_journal_entries.length, 1);
    await patchProfile(db, "alice", { expected_revision: 1, allow_medical_voice_context: false });
    assert.equal((await getVoiceContext(db, "alice", second.id)).recent_journal_entries.length, 0);
  } finally { await close(); }
});

test("accepted plans require explicit replacement; cursors preserve multiple entries per day", async () => {
  const { db, close } = await setup();
  try {
    const first = await pending(db, "plan-one");
    const entry = await commit(db, first.id, await confirm(db, first.id, "save-plan-one", 1, "accepted"));
    const second = await pending(db, "plan-two");
    const receipt = await confirm(db, second.id, "save-plan-two", 1, "accepted");
    await assert.rejects(commit(db, second.id, receipt), rejects("plan_replacement_required"));
    assert.equal((await listJournal(db, "alice")).entries.length, 1);
    await prepareDraft(db, "alice", second.id, { expected_revision: 1, draft });
    await commit(db, second.id, await confirm(db, second.id, "save-plan-two", 2, "accepted", entry.day_plans[0]!.id));
    const plans = await db.select().from(tables.dayPlans).where(eq(tables.dayPlans.owner_id, "alice"));
    assert.equal(plans.filter((p) => p.state === "accepted").length, 1);
    assert.equal(plans.filter((p) => p.state === "draft").length, 1);
    const page = await listJournal(db, "alice", { limit: 1 });
    assert.ok(page.next_cursor);
    const next = await listJournal(db, "alice", { limit: 1, cursor: page.next_cursor });
    assert.equal(next.entries.length, 1);
    assert.notEqual(page.entries[0]!.id, next.entries[0]!.id);
    assert.equal(next.next_cursor, null);
    assert.equal((await listJournal(db, "bob", { cursor: page.next_cursor })).entries.length, 0);
    await assert.rejects(listJournal(db, "alice", { from: "2024-01-01", to: "2026-01-01" }), rejects("invalid_input"));
  } finally { await close(); }
});

test("routes reject malformed JSON, extra ownership, invalid dates and missing authentication", async () => {
  const { db, close } = await setup();
  try {
    const app = new Hono<{ Variables: { userId: string } }>();
    app.use("*", async (c, next) => { c.set("userId", "alice"); await next(); });
    app.route("/api/v1", createJournalRoutes(db));
    app.onError((error, c) => error instanceof DomainError ? c.json({ code: error.code }, error.status as 400) : c.json({ code: "unexpected" }, 500));
    for (const body of ["{", JSON.stringify({ source: "app", operation_id: "test", owner_id: "bob" }), JSON.stringify({ source: "app", operation_id: "x".repeat(129) })]) assert.equal((await app.request("/api/v1/checkins", { method: "POST", headers: { "Content-Type": "application/json" }, body })).status, 422);
    assert.equal((await app.request("/api/v1/journal?from=2026-02-30")).status, 422);
    assert.equal((await app.request("/api/v1/journal?cursor=garbage")).status, 422);
    assert.equal(journalDraftSchema.safeParse({ ...draft, observations: [{ metric: "sleep_hours", value: 25 }] }).success, false);
    for (const value of ["low", 0, 6, 2.5]) assert.equal(journalDraftSchema.safeParse({ ...draft, observations: [{ metric: "energy", value }] }).success, false);
    const anonymous = createJournalRoutes(db);
    anonymous.onError((error, c) => c.json({ code: error instanceof DomainError ? error.code : "unexpected" }, error instanceof DomainError ? error.status as 400 : 500));
    assert.equal((await anonymous.request("/context")).status, 401);
  } finally { await close(); }
});

test("concurrent saves either return one entry or a retryable storage error, then recover to one entry", async () => {
  const { db, close } = await setup();
  try {
    const checkin = await pending(db, "concurrent");
    const receipt = await confirm(db, checkin.id, "save-concurrent");
    const saves = await Promise.allSettled(Array.from({ length: 4 }, () => commit(db, checkin.id, receipt)));
    const entry = await commit(db, checkin.id, receipt);
    for (const result of saves) {
      if (result.status === "fulfilled") assert.equal(result.value.id, entry.id);
      else assert.ok(result.reason instanceof DomainError && result.reason.code === "storage_unavailable" && result.reason.retryable);
    }
    assert.equal((await listJournal(db, "alice")).entries.length, 1);
    assert.equal(entry.observations.length, 2);
    assert.equal(entry.day_plans.length, 1);
  } finally { await close(); }
});
