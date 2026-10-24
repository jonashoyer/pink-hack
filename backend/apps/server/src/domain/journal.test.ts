import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDb } from "@backend/db";
import { devices } from "@backend/db/schema/device";
import { user } from "@backend/db/schema/auth";
import * as tables from "@backend/db/schema/journal";
import { getTableConfig, SQLiteDialect } from "drizzle-orm/sqlite-core";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { sql, is, SQL, eq } from "drizzle-orm";
import type { Database } from "@backend/db";
import { Hono } from "hono";
import { createJournalRoutes } from "../routes/journal";
import { DomainError, getContext, patchPage, patchProfile, createCheckin, getCheckin, prepareDraft, confirmDraft, commitCheckin, cancelCheckin, getJournalEntry, listJournal, getVoiceContext, journalDate, journalDraftSchema, blockContentSchema, propertiesSchema, createPage, getPage, listPages, archivePage, patchJournalEntry, prepareJournalUpdate, migrateLegacyData, createDeviceCheckin, createJournalEntry, createVoiceConversation, readVoiceConversation, getConversationContext, createJournalForConversation, patchJournalForConversation, stopVoiceConversation, normalizeLegacyDraft, blocksToText } from "./journal";

// Test-only DDL derives from actual table definitions, without migrations or
// touching the application database. All stored content is synthetic.
async function setup() {
  const dir = await mkdtemp(join(tmpdir(), "pink-journal-test-"));
  const db = createDb({ DATABASE_URL: `file:${join(dir, "test.db")}` });
  const dialect = new SQLiteDialect();
  const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
  const render = (value: SQL) => dialect.sqlToQuery(value).sql;
  await db.run(sql.raw("PRAGMA foreign_keys = ON"));
  for (const table of [user, devices, ...Object.values(tables)] as SQLiteTable[]) {
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
const content: tables.BlockContent = [
  { id: "note", type: "paragraph", content: [{ type: "text", text: "Synthetic note", styles: { bold: true } }, { type: "link", href: "https://example.test", content: [{ type: "text", text: "A link", styles: {} }] }] },
  { id: "plan-heading", type: "heading", props: { level: 2 }, content: "Day plan" },
  { id: "plan", type: "checkListItem", props: { checked: false }, content: "A short walk" },
  { id: "table", type: "table", content: { type: "tableContent", rows: [{ cells: [[{ type: "text", text: "Cell", styles: { italic: true } }]] }] } },
];
const draft: tables.JournalDraft = { title: "Synthetic journal", original_text: "I would like a short walk.", content, properties: { "garden time": 20, "support needed": ["a lift", null], "made tea": true, nausea: null, energy: "low" } };
const rejects = (code: string) => (error: unknown) => error instanceof DomainError && error.code === code;
async function pending(db: Database, operation: string) {
  const checkin = await createCheckin(db, "alice", { source: "app", operation_id: `capture-${operation}` });
  await prepareDraft(db, "alice", checkin.id, { expected_revision: 0, draft });
  return checkin;
}
async function confirm(db: Database, checkinId: string, operation_id: string, draft_revision = 1) {
  return confirmDraft(db, "alice", checkinId, { draft_revision, action: "save", operation_id });
}
async function commit(db: Database, checkinId: string, receipt: { confirmation_receipt: string; operation_id: string }) {
  return commitCheckin(db, "alice", checkinId, { confirmation_receipt: receipt.confirmation_receipt, operation_id: receipt.operation_id });
}
async function saved(db: Database, operation: string) {
  const checkin = await pending(db, operation);
  const receipt = await confirm(db, checkin.id, `save-${operation}`);
  return { checkin, receipt, entry: await commit(db, checkin.id, receipt) };
}

test("arbitrary pages reload rich BlockNote JSON; edits preserve omitted fields and replay exactly", async () => {
  const { db, close } = await setup();
  try {
    assert.deepEqual((await getContext(db, "alice")).pages, []);
    const input = { title: "What helps my garden days", content, operation_id: "page-create" };
    const page = await createPage(db, "alice", input);
    assert.deepEqual((await getPage(db, "alice", page.id)).content, content);
    const rename = { title: "Garden and support", expected_revision: 1, operation_id: "page-rename" };
    const renamed = await patchPage(db, "alice", page.id, rename);
    assert.deepEqual(renamed.content, content);
    const edited = await patchPage(db, "alice", page.id, { content: [], expected_revision: 2, operation_id: "page-body" });
    assert.equal(edited.title, renamed.title);
    assert.deepEqual(await createPage(db, "alice", input), page);
    assert.deepEqual(await patchPage(db, "alice", page.id, rename), renamed);
    await assert.rejects(createPage(db, "alice", { ...input, title: "Different" }), rejects("operation_conflict"));
    await assert.rejects(patchPage(db, "alice", page.id, { ...rename, title: "Different" }), rejects("operation_conflict"));
    await assert.rejects(patchPage(db, "alice", page.id, { expected_revision: 1, title: "Stale", operation_id: "stale" }), rejects("revision_conflict"));
    assert.equal((await getContext(db, "alice")).pages[0]!.title, edited.title);
    await assert.rejects(getPage(db, "bob", page.id), rejects("not_found"));
    await assert.rejects(patchPage(db, "bob", page.id, { expected_revision: 3, title: "Foreign", operation_id: "foreign" }), rejects("not_found"));
    const second = await createPage(db, "alice", { title: "Any other topic", content: [], operation_id: "page-second" });
    const listing = await listPages(db, "alice", { limit: 1 });
    assert.ok(listing.next_cursor);
    const next = await listPages(db, "alice", { limit: 1, cursor: listing.next_cursor });
    assert.notEqual(next.pages[0]!.id, listing.pages[0]!.id);
    assert.equal(next.next_cursor, null);
    const archiveInput = { expected_revision: 1, operation_id: "archive-second" };
    const archived = await archivePage(db, "alice", second.id, archiveInput);
    assert.deepEqual(await archivePage(db, "alice", second.id, archiveInput), archived);
    assert.equal((await getContext(db, "alice")).pages.length, 1);
    assert.equal((await listPages(db, "alice")).pages.length, 1);
    await assert.rejects(getPage(db, "alice", second.id), rejects("not_found"));
    assert.ok((await db.select().from(tables.pages).where(eq(tables.pages.id, second.id)))[0]!.archived_at);
  } finally { await close(); }
});

test("unfamiliar properties and body plan edit preserve all other content and original text", async () => {
  const { db, close } = await setup();
  try {
    const { entry, receipt, checkin } = await saved(db, "generic");
    assert.deepEqual(entry.properties, draft.properties);
    assert.deepEqual(entry.content, draft.content);
    assert.equal((await db.select().from(tables.observations)).length, 0);
    assert.equal((await db.select().from(tables.dayPlans)).length, 0);
    const newContent = structuredClone(entry.content);
    newContent[2]!.content = "Rest before the short walk";
    const patch = { expected_revision: 1, operation_id: "edit-plan", content: newContent };
    const updated = await patchJournalEntry(db, "alice", entry.id, patch);
    assert.equal(updated.revision, 2);
    assert.deepEqual(updated.content[0], entry.content[0]);
    assert.deepEqual(updated.content[3], entry.content[3]);
    assert.deepEqual(updated.properties, entry.properties);
    assert.equal(updated.original_text, entry.original_text);
    assert.deepEqual(await patchJournalEntry(db, "alice", entry.id, patch), updated);
    assert.deepEqual(await commit(db, checkin.id, receipt), entry);
    await assert.rejects(patchJournalEntry(db, "alice", entry.id, { ...patch, title: "Different" }), rejects("operation_conflict"));
    await assert.rejects(patchJournalEntry(db, "alice", entry.id, { expected_revision: 1, operation_id: "stale-edit", title: "Stale" }), rejects("revision_conflict"));
    await assert.rejects(getJournalEntry(db, "bob", entry.id), rejects("not_found"));
    await assert.rejects(patchJournalEntry(db, "bob", entry.id, { expected_revision: 2, operation_id: "foreign-entry", title: "Foreign" }), rejects("not_found"));
  } finally { await close(); }
});

test("confirmed update targets an owned expected revision; duplicate update returns original result", async () => {
  const { db, close } = await setup();
  try {
    const { entry } = await saved(db, "before-update");
    const checkin = await createCheckin(db, "alice", { source: "app", operation_id: "update-capture" });
    const updateDraft = { ...draft, title: "Revised journal", properties: { ...draft.properties, "garden time": 10 } };
    const input = { entry_id: entry.id, expected_entry_revision: 1, expected_revision: 0, draft: updateDraft };
    const prepared = await prepareJournalUpdate(db, "alice", checkin.id, input);
    assert.equal(prepared.target_entry_id, entry.id);
    const receipt = await confirm(db, checkin.id, "update-save");
    const updated = await commit(db, checkin.id, receipt);
    assert.equal(updated.id, entry.id);
    assert.equal(updated.revision, 2);
    assert.deepEqual(updated.properties, updateDraft.properties);
    assert.equal((await listJournal(db, "alice")).entries.length, 1);
    await patchJournalEntry(db, "alice", entry.id, { expected_revision: 2, operation_id: "later-edit", title: "Later" });
    assert.deepEqual(await commit(db, checkin.id, receipt), updated);
    await assert.rejects(prepareJournalUpdate(db, "alice", checkin.id, input), rejects("checkin_closed"));
    const stale = await createCheckin(db, "alice", { source: "app", operation_id: "stale-capture" });
    await assert.rejects(prepareJournalUpdate(db, "alice", stale.id, input), rejects("revision_conflict"));
    await prepareJournalUpdate(db, "alice", stale.id, { ...input, expected_entry_revision: 3 });
    const staleReceipt = await confirm(db, stale.id, "stale-save");
    await patchJournalEntry(db, "alice", entry.id, { expected_revision: 3, operation_id: "race-edit", title: "Concurrent edit" });
    await assert.rejects(commit(db, stale.id, staleReceipt), rejects("revision_conflict"));
    assert.equal((await getCheckin(db, "alice", stale.id)).stage, "awaiting_confirmation");
    const foreign = await createCheckin(db, "bob", { source: "app", operation_id: "foreign-capture" });
    await assert.rejects(prepareJournalUpdate(db, "bob", foreign.id, { ...input, expected_entry_revision: 4 }), rejects("not_found"));
    const invalid = await createCheckin(db, "alice", { source: "app", operation_id: "invalid-update" });
    await assert.rejects(prepareJournalUpdate(db, "alice", invalid.id, { ...input, expected_entry_revision: 4, draft: { ...draft, original_text: "Altered original" } }), rejects("original_text_immutable"));
  } finally { await close(); }
});

test("confirmation invalidates on revision; canceled and saved sessions are terminal", async () => {
  const { db, close } = await setup();
  try {
    const checkin = await pending(db, "revision");
    const receipt = await confirm(db, checkin.id, "save-revision");
    assert.deepEqual(await confirm(db, checkin.id, "save-revision"), receipt);
    await prepareDraft(db, "alice", checkin.id, { expected_revision: 1, draft: { ...draft, title: "Revised" } });
    await assert.rejects(commit(db, checkin.id, receipt), rejects("confirmation_required"));
    await assert.rejects(confirm(db, checkin.id, "new-confirm", 1), rejects("revision_conflict"));
    await commit(db, checkin.id, await confirm(db, checkin.id, "save-revision", 2));
    await assert.rejects(cancelCheckin(db, "alice", checkin.id), rejects("checkin_closed"));
    await assert.rejects(getVoiceContext(db, "alice", checkin.id), rejects("checkin_closed"));
    const canceled = await pending(db, "cancel");
    await cancelCheckin(db, "alice", canceled.id);
    assert.equal((await cancelCheckin(db, "alice", canceled.id)).stage, "canceled");
    await assert.rejects(prepareDraft(db, "alice", canceled.id, { expected_revision: 1, draft }), rejects("checkin_closed"));
    await assert.rejects(getCheckin(db, "bob", canceled.id), rejects("not_found"));
  } finally { await close(); }
});

test("failure after entry write rolls back and retains retryable draft; concurrent commits recover exactly once", async () => {
  const { db, close } = await setup();
  try {
    const checkin = await pending(db, "failure");
    const receipt = await confirm(db, checkin.id, "save-failure");
    await db.run(sql.raw("CREATE TRIGGER synthetic_failure BEFORE INSERT ON operation_receipts WHEN NEW.operation_id = 'save-failure' BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END"));
    await assert.rejects(commit(db, checkin.id, receipt), rejects("storage_unavailable"));
    assert.equal((await listJournal(db, "alice")).entries.length, 0);
    assert.equal((await getCheckin(db, "alice", checkin.id)).stage, "awaiting_confirmation");
    await db.run(sql.raw("DROP TRIGGER synthetic_failure"));
    const results = await Promise.allSettled(Array.from({ length: 4 }, () => commit(db, checkin.id, receipt)));
    const entry = await commit(db, checkin.id, receipt);
    for (const result of results) {
      if (result.status === "fulfilled") assert.deepEqual(result.value, entry);
      else assert.ok(result.reason instanceof DomainError && result.reason.retryable);
    }
    assert.equal((await listJournal(db, "alice")).entries.length, 1);
  } finally { await close(); }
});

test("all owned pages enter voice context regardless of legacy kinds; snapshot records actual revisions", async () => {
  const { db, close } = await setup();
  try {
    const page = await createPage(db, "alice", { title: "My treatment questions", content, operation_id: "context-page" });
    await createPage(db, "bob", { title: "Foreign page", content, operation_id: "context-page" });
    const checkin = await pending(db, "voice");
    await patchPage(db, "alice", page.id, { expected_revision: 1, operation_id: "context-edit", title: "Whatever I need" });
    const voice = await getVoiceContext(db, "alice", checkin.id);
    assert.equal(voice.pages.length, 1);
    assert.equal(voice.pages[0]!.title, "Whatever I need");
    assert.equal(voice.profile.allow_medical_voice_context, false);
    assert.equal(voice.context_revisions[page.id], 2);
    assert.equal(voice.checkin.context_revisions[page.id], 1);
    const revised = await prepareDraft(db, "alice", checkin.id, { expected_revision: 1, draft });
    assert.deepEqual(revised.context_revisions, voice.context_revisions);
    await archivePage(db, "alice", page.id, { expected_revision: 2, operation_id: "context-archive" });
    assert.deepEqual((await getVoiceContext(db, "alice", checkin.id)).pages, []);
  } finally { await close(); }
});

test("context overflow is explicit; page listings remain available for recovery", async () => {
  const { db, close } = await setup();
  try {
    for (let i = 0; i < 201; i++) await db.insert(tables.pages).values({ id: `page-${String(i).padStart(3, "0")}`, owner_id: "alice", title: "Synthetic", content: [], operation_id: `bulk-${i}`, creation_hash: "synthetic", created_at: "2026-10-24T00:00:00Z", updated_at: "2026-10-24T00:00:00Z" });
    await assert.rejects(getContext(db, "alice"), rejects("context_overflow"));
    assert.equal((await listPages(db, "alice", { limit: 100 })).pages.length, 100);
  } finally { await close(); }
});

test("legacy migration is atomic and idempotent; preserves records, original text and energy categories", async () => {
  const { db, close } = await setup();
  try {
    const timestamp = "2026-10-24T00:00:00Z";
    const legacyDraft: tables.LegacyJournalDraft = { title: "Legacy", original_text: "Unmodified original", note: "Legacy note", observations: [{ metric: "energy", value: "low" }, { metric: "sleep_hours", value: 6 }], proposed_plan: { items: [{ id: "item", text: "Rest", state: "deferred" }] } };
    await db.insert(tables.contextPages).values({ id: "legacy-page", owner_id: "alice", kind: "medical_needs", title: "Legacy custom title", sections: [{ id: "section", title: "Question", type: "checklist", items: [{ id: "question", text: "Synthetic question", checked: true }] }], revision: 4, updated_at: timestamp });
    await db.insert(tables.checkinSessions).values({ id: "legacy-saved", owner_id: "alice", source: "app", operation_id: "legacy-capture", stage: "saved", journal_date: "2026-10-24", draft: legacyDraft, draft_revision: 1, context_revisions: { "legacy-page": 4 }, saved_entry_id: "legacy-entry", confirmation: { receipt: "legacy-receipt", operation_id: "legacy-save", draft_revision: 1, plan_state: "accepted" }, confirmation_operation_id: "legacy-save", created_at: timestamp, updated_at: timestamp });
    await db.insert(tables.checkinSessions).values({ id: "legacy-pending", owner_id: "alice", source: "app", operation_id: "legacy-pending-capture", stage: "awaiting_confirmation", journal_date: "2026-10-24", draft: legacyDraft, draft_revision: 2, context_revisions: {}, confirmation: { receipt: "old-receipt", operation_id: "old-save", draft_revision: 2, plan_state: "accepted" }, confirmation_operation_id: "old-save", created_at: timestamp, updated_at: timestamp });
    await db.insert(tables.journalEntries).values({ id: "legacy-entry", owner_id: "alice", journal_date: "2026-10-24", title: "Legacy", original_text: legacyDraft.original_text, note: legacyDraft.note, source: "app", session_id: "legacy-saved", operation_id: "legacy-save", context_revisions: { "legacy-page": 4 }, created_at: timestamp, updated_at: timestamp });
    await db.insert(tables.observations).values({ id: "legacy-observation", owner_id: "alice", entry_id: "legacy-entry", metric: "energy", value: "low", observed_at: timestamp, confirmation_state: "confirmed", source_reference: "legacy-entry" });
    await db.insert(tables.dayPlans).values({ id: "legacy-plan", owner_id: "alice", entry_id: "legacy-entry", journal_date: "2026-10-24", source_entry_ids: ["legacy-entry"], context_revisions: {}, items: legacyDraft.proposed_plan!.items, state: "accepted", created_at: timestamp, updated_at: timestamp });
    assert.equal((await getCheckin(db, "alice", "legacy-pending")).legacy_draft_requires_review, true);
    assert.equal(normalizeLegacyDraft(legacyDraft).properties.energy, "low");
    assert.equal((await getJournalEntry(db, "alice", "legacy-entry")).properties.energy, "low");
    const before = { pages: await db.select().from(tables.contextPages), observations: await db.select().from(tables.observations), plans: await db.select().from(tables.dayPlans) };
    assert.deepEqual(await migrateLegacyData(db), { pages: 1, journal_entries: 0, pending_drafts: 1 });
    const entry = await getJournalEntry(db, "alice", "legacy-entry");
    assert.equal(entry.properties.energy, "low");
    assert.equal(entry.original_text, "Unmodified original");
    assert.match(blocksToText(entry.content), /Day plan/);
    await patchJournalEntry(db, "alice", entry.id, { expected_revision: 1, operation_id: "legacy-entry-edit", title: "Later legacy correction" });
    assert.deepEqual(await commitCheckin(db, "alice", "legacy-saved", { confirmation_receipt: "legacy-receipt", operation_id: "legacy-save" }), entry);
    const migrated = (await getContext(db, "alice")).pages[0]!;
    assert.equal(migrated.title, "Legacy custom title");
    assert.equal(migrated.content[1]!.props!.checked, true);
    const pendingCheckin = await getCheckin(db, "alice", "legacy-pending");
    assert.equal(pendingCheckin.draft_revision, 3);
    assert.equal(pendingCheckin.confirmation, null);
    assert.deepEqual((await db.select().from(tables.checkinSessions).where(eq(tables.checkinSessions.id, "legacy-pending")))[0]!.legacy_draft, legacyDraft);
    await patchPage(db, "alice", migrated.id, { expected_revision: 4, operation_id: "edit-migrated", title: "Edited after migration" });
    assert.deepEqual(await migrateLegacyData(db), { pages: 0, journal_entries: 0, pending_drafts: 0 });
    assert.equal((await getPage(db, "alice", migrated.id)).title, "Edited after migration");
    assert.deepEqual(await db.select().from(tables.contextPages), before.pages);
    assert.deepEqual(await db.select().from(tables.observations), before.observations);
    assert.deepEqual(await db.select().from(tables.dayPlans), before.plans);
    assert.equal((await db.select().from(tables.journalEntries))[0]!.note, "Legacy note");
  } finally { await close(); }
});

test("validators bound recursive rich JSON and properties; API rejects malformed JSON and extra ownership", async () => {
  const { db, close } = await setup();
  try {
    assert.equal(blockContentSchema.safeParse(content).success, true);
    assert.equal(blockContentSchema.safeParse([{ id: "duplicate" }, { children: [{ id: "duplicate" }] }]).success, false);
    let nested: tables.PartialBlock = { content: "Deep" };
    for (let i = 0; i < 9; i++) nested = { children: [nested] };
    assert.equal(blockContentSchema.safeParse([nested]).success, false);
    assert.equal(propertiesSchema.safeParse({ unfamiliar: ["value", 1, true, null] }).success, true);
    assert.equal(propertiesSchema.safeParse({ nested: { invalid: true } }).success, false);
    assert.equal(propertiesSchema.safeParse({ infinite: Infinity }).success, false);
    assert.equal(journalDraftSchema.safeParse(draft).success, true);
    const app = new Hono<{ Variables: { userId: string } }>();
    app.use("*", async (c, next) => { c.set("userId", "alice"); await next(); });
    app.route("/api/v1", createJournalRoutes(db));
    app.onError((error, c) => error instanceof DomainError ? c.json({ code: error.code }, error.status as 400) : c.json({ code: "unexpected" }, 500));
    for (const body of ["{", JSON.stringify({ title: "Page", content: [], operation_id: "test", owner_id: "bob" })]) assert.equal((await app.request("/api/v1/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body })).status, 422);
    assert.equal((await app.request("/api/v1/journal?from=2026-02-30")).status, 422);
    assert.equal((await app.request("/api/v1/pages?cursor=garbage")).status, 422);
    await assert.rejects(createCheckin(db, "alice", { source: "atech", operation_id: "device" }), rejects("device_not_supported"));
    await assert.rejects(createCheckin(db, "alice", { source: "app", device_id: "device", operation_id: "device" }), rejects("device_not_supported"));
    const anonymous = createJournalRoutes(db);
    anonymous.onError((error, c) => c.json({ code: error instanceof DomainError ? error.code : "unexpected" }, error instanceof DomainError ? error.status as 400 : 500));
    assert.equal((await anonymous.request("/context")).status, 401);
    await patchProfile(db, "alice", { expected_revision: 0, timezone: "Pacific/Kiritimati" });
    assert.equal(journalDate("Pacific/Kiritimati", new Date("2026-10-24T23:00:00Z")), "2026-10-25");
  } finally { await close(); }
});

test("verified owned device check-ins persist genuine Atech source; app payloads cannot spoof it", async () => {
  const { db, close } = await setup();
  try {
    await assert.rejects(createDeviceCheckin(db, "alice", "demo", { operation_id: "device-capture" }), rejects("device_access_denied"));
    await db.insert(devices).values({ id: "demo", owner_id: "alice", token_hash: "synthetic-hash", created_at: "2026-10-24T00:00:00Z", updated_at: "2026-10-24T00:00:00Z" });
    await assert.rejects(createDeviceCheckin(db, "bob", "demo", { operation_id: "device-capture" }), rejects("device_access_denied"));
    const checkin = await createDeviceCheckin(db, "alice", "demo", { operation_id: "device-capture" });
    assert.equal(checkin.source, "atech");
    assert.equal(checkin.device_id, "demo");
    assert.deepEqual(await createDeviceCheckin(db, "alice", "demo", { operation_id: "device-capture" }), checkin);
    await prepareDraft(db, "alice", checkin.id, { expected_revision: 0, draft });
    const entry = await commit(db, checkin.id, await confirm(db, checkin.id, "device-save"));
    assert.equal(entry.source, "atech");
    await assert.rejects(createCheckin(db, "alice", { source: "atech", operation_id: "spoofed" }), rejects("device_not_supported"));
  } finally { await close(); }
});

test("operation IDs cannot cross action types or change a committed receipt payload", async () => {
  const { db, close } = await setup();
  try {
    const page = await createPage(db, "alice", { title: "Synthetic", content: [], operation_id: "global-operation" });
    await assert.rejects(createCheckin(db, "alice", { source: "app", operation_id: "global-operation" }), rejects("operation_conflict"));
    await assert.rejects(archivePage(db, "alice", page.id, { expected_revision: 1, operation_id: "global-operation" }), rejects("operation_conflict"));
    const checkin = await pending(db, "global-conflict");
    await assert.rejects(confirm(db, checkin.id, "global-operation"), rejects("operation_conflict"));
    const receipt = await confirm(db, checkin.id, "global-save");
    await commit(db, checkin.id, receipt);
    await assert.rejects(commitCheckin(db, "alice", checkin.id, { confirmation_receipt: "changed-receipt", operation_id: "global-save" }), rejects("operation_conflict"));
  } finally { await close(); }
});

test("failed legacy conversion rolls back earlier conversions without altering legacy rows", async () => {
  const { db, close } = await setup();
  try {
    const timestamp = "2026-10-24T00:00:00Z";
    for (const [index, kind] of ["personal_needs", "medical_needs"].entries()) await db.insert(tables.contextPages).values({ id: `legacy-${index}`, owner_id: "alice", kind: kind as "personal_needs" | "medical_needs", title: `Legacy ${index}`, sections: [], updated_at: timestamp });
    await db.run(sql.raw("CREATE TRIGGER synthetic_conversion_failure BEFORE INSERT ON pages WHEN NEW.legacy_page_id = 'legacy-1' BEGIN SELECT RAISE(ABORT, 'synthetic conversion failure'); END"));
    await assert.rejects(migrateLegacyData(db), rejects("storage_unavailable"));
    assert.equal((await db.select().from(tables.pages)).length, 0);
    assert.equal((await db.select().from(tables.contextPages)).length, 2);
    await db.run(sql.raw("DROP TRIGGER synthetic_conversion_failure"));
    assert.equal((await migrateLegacyData(db)).pages, 2);
  } finally { await close(); }
});

test("standalone route accepts a valid draft above 256 KiB within the shared 512 KiB limit", async () => {
  const { db, close } = await setup();
  try {
    const checkin = await createCheckin(db, "alice", { source: "app", operation_id: "large-capture" });
    const largeDraft = { ...draft, original_text: "界".repeat(30000), content: Array.from({ length: 6 }, (_, i) => ({ id: `large-${i}`, type: "paragraph", content: "x".repeat(29000) })), properties: Object.fromEntries(Array.from({ length: 4 }, (_, i) => [`prop-${i}`, "x".repeat(10000)])) };
    const body = JSON.stringify({ expected_revision: 0, draft: largeDraft });
    assert.ok(Buffer.byteLength(body) > 262144 && Buffer.byteLength(body) < 524288);
    const app = new Hono<{ Variables: { userId: string } }>();
    app.use("*", async (c, next) => { c.set("userId", "alice"); await next(); });
    app.route("/api/v1", createJournalRoutes(db));
    app.onError((error, c) => c.json({ code: error instanceof DomainError ? error.code : "unexpected" }, error instanceof DomainError ? error.status as 400 : 500));
    const response = await app.request(`/api/v1/checkins/${checkin.id}/draft`, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
    assert.equal(response.status, 200);
    assert.equal((await getCheckin(db, "alice", checkin.id)).draft!.original_text, largeDraft.original_text);
  } finally { await close(); }
});

test("direct journal POST saves immediately without check-ins and replays the original result", async () => {
  const { db, close } = await setup();
  try {
    const input = { title: draft.title, content: draft.content, properties: draft.properties, original_text: draft.original_text, operation_id: "direct-create" };
    const app = new Hono<{ Variables: { userId: string } }>();
    app.use("*", async (c, next) => { c.set("userId", "alice"); await next(); });
    app.route("/api/v1", createJournalRoutes(db));
    app.onError((error, c) => c.json({ code: error instanceof DomainError ? error.code : "unexpected" }, error instanceof DomainError ? error.status as 400 : 500));
    const response = await app.request("/api/v1/journal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    assert.equal(response.status, 200);
    const entry = await response.json() as tables.JournalEntryResult;
    assert.equal(entry.source, "app");
    assert.equal(entry.session_id, null);
    assert.ok(entry.capture_id);
    assert.deepEqual(entry.content, input.content);
    assert.equal((await db.select().from(tables.checkinSessions)).length, 0);
    assert.equal((await db.select().from(tables.journalEntries)).length, 0);
    assert.equal((await db.select().from(tables.journalDocuments)).length, 1);
    await patchJournalEntry(db, "alice", entry.id, { expected_revision: 1, operation_id: "direct-patch", title: "Later correction" });
    assert.deepEqual(await createJournalEntry(db, "alice", input), entry);
    await assert.rejects(createJournalEntry(db, "alice", { ...input, title: "Changed" }), rejects("operation_conflict"));
    await assert.rejects(getJournalEntry(db, "bob", entry.id), rejects("not_found"));
    assert.equal((await listJournal(db, "bob")).entries.length, 0);
    assert.equal((await listJournal(db, "alice")).entries[0]!.title, "Later correction");
    const withoutOriginal = await createJournalEntry(db, "alice", { title: "No selected text", content: [], properties: {}, operation_id: "optional-original" });
    assert.equal(withoutOriginal.original_text, "");
  } finally { await close(); }
});

test("conversation writes update metadata atomically and use all custom context without drafts", async () => {
  const { db, close } = await setup();
  try {
    const page = await createPage(db, "alice", { title: "Anything that matters", content, operation_id: "conversation-page" });
    const input = { source: "app" as const, operation_id: "conversation-create" };
    const conversation = await createVoiceConversation(db, "alice", input);
    const context = await getConversationContext(db, "alice", conversation.id);
    assert.equal(context.pages[0]!.id, page.id);
    assert.equal(context.conversation.id, conversation.id);
    const create = { title: draft.title, content: draft.content, properties: draft.properties, operation_id: "conversation-save" };
    const entry = await createJournalForConversation(db, "alice", conversation.id, create);
    assert.equal(entry.voice_conversation_id, conversation.id);
    assert.equal(entry.session_id, null);
    assert.equal((await readVoiceConversation(db, "alice", conversation.id)).last_entry_id, entry.id);
    assert.equal((await readVoiceConversation(db, "alice", conversation.id)).saved_entry_id, entry.id);
    const patch = { expected_revision: 1, operation_id: "conversation-update", properties: { "new property": 7 } };
    const updated = await patchJournalForConversation(db, "alice", conversation.id, entry.id, patch);
    assert.equal(updated.revision, 2);
    assert.deepEqual(updated.content, entry.content);
    assert.deepEqual(await patchJournalForConversation(db, "alice", conversation.id, entry.id, patch), updated);
    assert.deepEqual(await createJournalForConversation(db, "alice", conversation.id, create), entry);
    assert.deepEqual(await createVoiceConversation(db, "alice", input), await readVoiceConversation(db, "alice", conversation.id));
    await assert.rejects(patchJournalForConversation(db, "alice", conversation.id, entry.id, { expected_revision: 1, operation_id: "stale-conversation-update", title: "Stale" }), rejects("revision_conflict"));
    await assert.rejects(readVoiceConversation(db, "bob", conversation.id), rejects("not_found"));
    await assert.rejects(createJournalForConversation(db, "bob", conversation.id, { ...create, operation_id: "foreign-conversation-write" }), rejects("not_found"));
    assert.equal((await getConversationContext(db, "alice", conversation.id)).recent_journal_entries[0]!.id, entry.id);
    assert.equal((await db.select().from(tables.checkinSessions)).length, 0);
    assert.equal((await db.select().from(tables.journalEntries)).length, 0);
    await stopVoiceConversation(db, "alice", conversation.id);
    await assert.rejects(getConversationContext(db, "alice", conversation.id), rejects("conversation_stopped"));
    await assert.rejects(createJournalForConversation(db, "alice", conversation.id, { ...create, operation_id: "stopped-create" }), rejects("conversation_stopped"));
    assert.deepEqual(await createJournalForConversation(db, "alice", conversation.id, create), entry);
  } finally { await close(); }
});

test("conversation target is owner-validated and direct edits preserve legacy source records", async () => {
  const { db, close } = await setup();
  try {
    const { entry } = await saved(db, "legacy-compatible");
    const legacyBefore = await db.select().from(tables.journalEntries);
    const captureBefore = await db.select().from(tables.checkinSessions);
    await assert.rejects(createVoiceConversation(db, "bob", { source: "app", entry_id: entry.id, operation_id: "foreign-target" }), rejects("not_found"));
    const conversation = await createVoiceConversation(db, "alice", { source: "app", entry_id: entry.id, operation_id: "target-create" });
    assert.equal(conversation.target_entry_id, entry.id);
    await assert.rejects(createJournalForConversation(db, "alice", conversation.id, { title: "New", content: [], properties: {}, operation_id: "wrong-create" }), rejects("conversation_target_exists"));
    const other = await createJournalEntry(db, "alice", { title: "Other", content: [], properties: {}, operation_id: "other-create" });
    await assert.rejects(patchJournalForConversation(db, "alice", conversation.id, other.id, { expected_revision: 1, operation_id: "wrong-target", title: "Wrong" }), rejects("conversation_target_conflict"));
    const updated = await patchJournalForConversation(db, "alice", conversation.id, entry.id, { expected_revision: 1, operation_id: "target-update", title: "Corrected legacy page" });
    assert.equal(updated.id, entry.id);
    assert.equal(updated.original_text, entry.original_text);
    assert.deepEqual(await db.select().from(tables.journalEntries), legacyBefore);
    assert.deepEqual(await db.select().from(tables.checkinSessions), captureBefore);
    await migrateLegacyData(db);
    assert.equal((await getJournalEntry(db, "alice", entry.id)).title, updated.title);
    assert.deepEqual(await db.select().from(tables.journalEntries), legacyBefore);
  } finally { await close(); }
});

test("conversation failure after document write rolls back both document and last-entry metadata", async () => {
  const { db, close } = await setup();
  try {
    const conversation = await createVoiceConversation(db, "alice", { source: "app", operation_id: "atomic-conversation" });
    const input = { title: "Atomic save", content: [], properties: {}, operation_id: "atomic-write" };
    await db.run(sql.raw("CREATE TRIGGER synthetic_direct_failure BEFORE INSERT ON operation_receipts WHEN NEW.operation_id = 'atomic-write' BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END"));
    await assert.rejects(createJournalForConversation(db, "alice", conversation.id, input), rejects("storage_unavailable"));
    assert.equal((await readVoiceConversation(db, "alice", conversation.id)).last_entry_id, null);
    assert.equal((await listJournal(db, "alice")).entries.length, 0);
    assert.equal((await db.select().from(tables.checkinSessions)).length, 0);
    await db.run(sql.raw("DROP TRIGGER synthetic_direct_failure"));
    const entry = await createJournalForConversation(db, "alice", conversation.id, input);
    assert.equal((await readVoiceConversation(db, "alice", conversation.id)).last_entry_id, entry.id);
    assert.deepEqual(await createJournalForConversation(db, "alice", conversation.id, input), entry);
  } finally { await close(); }
});

test("device conversations derive genuine Atech source and reject foreign or missing provisioning", async () => {
  const { db, close } = await setup();
  try {
    await assert.rejects(createVoiceConversation(db, "alice", { source: "atech", operation_id: "no-device" }), rejects("device_access_denied"));
    await db.insert(devices).values({ id: "demo", owner_id: "alice", token_hash: "synthetic-conversation-token", created_at: "2026-10-24T00:00:00Z", updated_at: "2026-10-24T00:00:00Z" });
    await assert.rejects(createVoiceConversation(db, "bob", { source: "atech", device_id: "demo", operation_id: "foreign-device" }), rejects("device_access_denied"));
    await assert.rejects(createVoiceConversation(db, "alice", { source: "app", device_id: "demo", operation_id: "spoofed-device" }), rejects("invalid_device_source"));
    const conversation = await createVoiceConversation(db, "alice", { source: "atech", device_id: "demo", operation_id: "device-conversation" });
    const entry = await createJournalForConversation(db, "alice", conversation.id, { title: "Device journal", content: [], properties: { "cup of tea": true }, operation_id: "device-direct-save" });
    assert.equal(entry.source, "atech");
    assert.equal(entry.device_id, "demo");
    assert.equal(entry.voice_conversation_id, conversation.id);
    assert.equal((await db.select().from(tables.checkinSessions)).length, 0);
  } finally { await close(); }
});
