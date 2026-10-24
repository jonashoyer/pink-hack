import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDb } from "@backend/db";
import type { Database } from "@backend/db";
import { devices } from "@backend/db/schema/device";
import { user } from "@backend/db/schema/auth";
import * as tables from "@backend/db/schema/journal";
import { getTableConfig, SQLiteDialect } from "drizzle-orm/sqlite-core";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { sql, is, SQL } from "drizzle-orm";
import { Hono } from "hono";
import { DomainError } from "../domain/errors";
import { createPage, createCheckin, getCheckin, prepareDraft, confirmDraft, commitCheckin, getJournalEntry, listJournal } from "../domain/journal";
import { runJournalAgent, journalAgentRequestSchema } from "./agent";
import { createAssistantRoutes } from "../routes/assistant";

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
const config = { ANTHROPIC_API_KEY: "synthetic-test-key" };
const draft: tables.JournalDraft = {
  title: "Greenhouse notes", original_text: "I watered the seedlings and want help carrying compost.",
  properties: { "seedling trays": 7, "help wanted": ["compost", null], "watered": true },
  content: [{ id: "note", type: "paragraph", content: [{ type: "text", text: "I watered the seedlings.", styles: { bold: true } }] }, { id: "plan", type: "heading", props: { level: 2 }, content: "Day plan" }, { id: "task", type: "checkListItem", props: { checked: false }, content: "Ask for help carrying compost." }],
};
const tool = (id: string, name: string, input: Record<string, unknown> = {}) => ({ type: "tool_use", id, name, input });
const answer = (text = "What matters to you today?") => ({ content: [{ type: "text", text }], stop_reason: "end_turn" });
const use = (...content: unknown[]) => ({ content, stop_reason: "tool_use" });
function mock(responses: unknown[], inspect?: (body: any, round: number) => void): typeof fetch {
  let round = 0;
  return async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, "claude-haiku-5-5");
    assert.equal(new Headers(init?.headers).get("anthropic-version"), "2023-06-01");
    inspect?.(body, round);
    assert.ok(round < responses.length, "unexpected provider round");
    return Response.json(responses[round++]);
  };
}
async function input(db: Database) {
  const checkin = await createCheckin(db, "alice", { source: "app", operation_id: "synthetic-capture" });
  return { ownerId: "alice", checkinId: checkin.id, messages: [{ role: "user" as const, content: draft.original_text }] };
}
const rejects = (code: string) => (e: unknown) => e instanceof DomainError && e.code === code;

test("all arbitrary owned pages reach context; native blocks and unfamiliar properties prepare without saving", async () => {
  const { db, close } = await setup();
  try {
    await createPage(db, "alice", { title: "Greenhouse routines", content: draft.content, operation_id: "greenhouse" });
    await createPage(db, "alice", { title: "Track seedling trays", content: [{ type: "paragraph", content: "Track seedling trays and help wanted." }], operation_id: "trays" });
    await createPage(db, "bob", { title: "Foreign private page", content: [], operation_id: "foreign" });
    const request = await input(db);
    const fetcher = mock([use(tool("prepare", "prepare_journal_draft", { expected_revision: 0, draft })), answer("Your journal entry is saved.")], (body, round) => {
      assert.ok(body.system.includes("Greenhouse routines"));
      assert.ok(body.system.includes("Track seedling trays"));
      assert.ok(body.system.includes("checkListItem"));
      assert.ok(!body.system.includes("Foreign private page"));
      assert.ok(!body.tools.some((t: any) => /confirm/.test(t.name)));
      if (round === 1) assert.ok(JSON.stringify(body.messages).includes('"seedling trays":7'));
    });
    const output = await runJournalAgent(db, config, request, undefined, fetcher);
    assert.equal(output.stage, "draft");
    assert.equal(output.draft_revision, 1);
    assert.equal(output.saved_entry_id, null);
    assert.match(output.text, /Would you like to save it\?/);
    assert.deepEqual((await getCheckin(db, "alice", request.checkinId)).draft, draft);
    assert.deepEqual((await listJournal(db, "alice", {})).entries, []);
  } finally { await close(); }
});

test("a spoken yes and a model-invented receipt cannot save", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    await prepareDraft(db, "alice", request.checkinId, { expected_revision: 0, draft });
    request.messages[0]!.content = "Yes, save it.";
    await assert.rejects(runJournalAgent(db, config, request, undefined, mock([use(tool("commit", "commit_journal_entry", { confirmation_receipt: "invented", operation_id: "invented-op" }))])), rejects("confirmation_required"));
    assert.equal((await getCheckin(db, "alice", request.checkinId)).stage, "draft");
    assert.equal((await listJournal(db, "alice", {})).entries.length, 0);
  } finally { await close(); }
});

test("only an authenticated current receipt permits a persisted save and storage-derived response", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    await prepareDraft(db, "alice", request.checkinId, { expected_revision: 0, draft });
    const receipt = await confirmDraft(db, "alice", request.checkinId, { draft_revision: 1, action: "save", operation_id: "confirmed-save" });
    const output = await runJournalAgent(db, config, request, undefined, mock([use(tool("commit", "commit_journal_entry", { confirmation_receipt: receipt.confirmation_receipt, operation_id: receipt.operation_id })), answer("A proposal is ready.")]));
    const state = await getCheckin(db, "alice", request.checkinId);
    assert.equal(output.stage, "saved");
    assert.equal(output.saved_entry_id, state.saved_entry_id);
    assert.equal(output.text, "Your journal entry is saved.");
    assert.equal((await listJournal(db, "alice", {})).entries[0]?.id, output.saved_entry_id);
  } finally { await close(); }
});

test("draft mutation invalidates receipt before a subsequent model commit", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    await prepareDraft(db, "alice", request.checkinId, { expected_revision: 0, draft });
    const receipt = await confirmDraft(db, "alice", request.checkinId, { draft_revision: 1, action: "save", operation_id: "old-save" });
    await assert.rejects(runJournalAgent(db, config, request, undefined, mock([use(tool("revise", "prepare_journal_draft", { expected_revision: 1, draft }), tool("commit", "commit_journal_entry", { confirmation_receipt: receipt.confirmation_receipt, operation_id: receipt.operation_id }))])), rejects("confirmation_required"));
    assert.equal((await getCheckin(db, "alice", request.checkinId)).draft_revision, 2);
    assert.equal((await listJournal(db, "alice", {})).entries.length, 0);
  } finally { await close(); }
});

test("journal update reads the owned entry and keeps its saved content until confirmed", async () => {
  const { db, close } = await setup();
  try {
    const original = await input(db);
    await prepareDraft(db, "alice", original.checkinId, { expected_revision: 0, draft });
    const receipt = await confirmDraft(db, "alice", original.checkinId, { draft_revision: 1, action: "save", operation_id: "initial-save" });
    const entry = await commitCheckin(db, "alice", original.checkinId, { confirmation_receipt: receipt.confirmation_receipt, operation_id: receipt.operation_id });
    const next = await createCheckin(db, "alice", { source: "app", operation_id: "update-capture" });
    const updated = { ...draft, content: [...draft.content.slice(0, 2), { ...draft.content[2], content: "Ask for help tomorrow instead." }] };
    const request = { ownerId: "alice", checkinId: next.id, messages: [{ role: "user" as const, content: "Move the compost help to tomorrow." }] };
    const output = await runJournalAgent(db, config, request, undefined, mock([
      use(tool("read-entry", "get_journal_entry", { entry_id: entry.id })),
      use(tool("prepare-update", "prepare_journal_update", { entry_id: entry.id, expected_entry_revision: entry.revision, expected_revision: 0, draft: updated })),
      answer("The plan is saved."),
    ]));
    assert.equal(output.stage, "draft");
    assert.equal(output.saved_entry_id, null);
    assert.match(output.text, /Would you like to save it\?/);
    assert.deepEqual((await getJournalEntry(db, "alice", entry.id)).content, draft.content);
    const confirmation = await confirmDraft(db, "alice", next.id, { draft_revision: 1, action: "save", operation_id: "update-save" });
    const saved = await runJournalAgent(db, config, request, undefined, mock([
      use(tool("commit-update", "commit_journal_entry", { confirmation_receipt: confirmation.confirmation_receipt, operation_id: confirmation.operation_id })), answer(),
    ]));
    assert.equal(saved.saved_entry_id, entry.id);
    const stored = await getJournalEntry(db, "alice", entry.id);
    assert.deepEqual(stored.properties, draft.properties);
    assert.deepEqual(stored.content, updated.content);
    assert.equal(stored.original_text, draft.original_text);
  } finally { await close(); }
});

test("repeated tool IDs execute once and provider thinking is preserved", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    const thinking = { type: "thinking", thinking: "Synthetic reasoning", signature: "synthetic-signature" };
    const call = tool("same-id", "prepare_journal_draft", { expected_revision: 0, draft });
    const output = await runJournalAgent(db, config, request, undefined, mock([use(thinking, call), use(call), answer()], (body, round) => {
      if (round === 1) assert.deepEqual(body.messages[1].content[0], thinking);
    }));
    assert.equal(output.draft_revision, 1);
  } finally { await close(); }
});

test("conflicting tool IDs reject without a second write", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    await assert.rejects(runJournalAgent(db, config, request, undefined, mock([use(tool("same", "prepare_journal_draft", { expected_revision: 0, draft })), use(tool("same", "cancel_checkin"))])), rejects("tool_call_conflict"));
    assert.equal((await getCheckin(db, "alice", request.checkinId)).stage, "draft");
  } finally { await close(); }
});

test("abort before context or after provider response starts no draft writes", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(runJournalAgent(db, config, request, controller.signal, mock([])), rejects("assistant_aborted"));
    assert.equal((await getCheckin(db, "alice", request.checkinId)).voice_context_revisions, null);
    const during = new AbortController();
    const fetcher: typeof fetch = async () => { during.abort(); return Response.json(use(tool("prepare", "prepare_journal_draft", { expected_revision: 0, draft }))); };
    await assert.rejects(runJournalAgent(db, config, request, during.signal, fetcher), rejects("assistant_aborted"));
    assert.equal((await getCheckin(db, "alice", request.checkinId)).draft_revision, 0);
  } finally { await close(); }
});

test("provider failures and malformed/oversized responses are sanitized", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    const fetchers: Array<typeof fetch> = [
      async () => { throw new Error("private synthetic patient payload and secret"); },
      async () => new Response("private synthetic patient payload", { status: 500 }),
      async () => new Response("not-json"),
      async () => new Response("x".repeat(131_073)),
      mock([{ content: [{ type: "unknown", text: "private synthetic patient payload" }], stop_reason: "end_turn" }]),
    ];
    for (const fetcher of fetchers) {
      await assert.rejects(runJournalAgent(db, config, request, undefined, fetcher), (e: unknown) => e instanceof DomainError && e.code === "assistant_unavailable" && !/patient|secret|payload/.test(e.message));
    }
    assert.equal((await getCheckin(db, "alice", request.checkinId)).draft_revision, 0);
  } finally { await close(); }
});

test("dispatcher rejects unknown or invalid tool inputs", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    await assert.rejects(runJournalAgent(db, config, request, undefined, mock([use(tool("bad", "prepare_journal_draft", { expected_revision: 0, draft: { patient: "invalid" } }))])), rejects("invalid_input"));
    await assert.rejects(runJournalAgent(db, config, request, undefined, mock([use(tool("confirm", "confirm_draft"))])), rejects("unknown_tool"));
    assert.equal((await getCheckin(db, "alice", request.checkinId)).draft_revision, 0);
  } finally { await close(); }
});

test("lossy transcripts merge adjacent roles and enforce message/character limits", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    request.messages = [{ role: "user", content: "First fragment" }, { role: "user", content: "Second fragment" }];
    await runJournalAgent(db, config, request, undefined, mock([answer()], (body) => assert.deepEqual(body.messages, [{ role: "user", content: "First fragment\nSecond fragment" }])));
    await runJournalAgent(db, config, { ...request, messages: [{ role: "assistant", content: "What next?" }] }, undefined, mock([answer()], (body) => {
      assert.deepEqual(body.messages.map((m: any) => m.role), ["user", "assistant", "user"]);
      assert.match(body.messages.at(-1).content, /not confirmation/);
    }));
    assert.equal(journalAgentRequestSchema.safeParse({ messages: Array.from({ length: 25 }, () => ({ role: "user", content: "x" })) }).success, false);
    assert.equal(journalAgentRequestSchema.safeParse({ messages: [{ role: "user", content: "x".repeat(24_001) }] }).success, false);
  } finally { await close(); }
});

test("tool rounds are bounded and cancellation is storage-derived", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    await assert.rejects(runJournalAgent(db, config, request, undefined, mock(Array.from({ length: 4 }, (_, i) => use(tool(`read-${i}`, "get_checkin"))))), rejects("assistant_unavailable"));
    const output = await runJournalAgent(db, config, request, undefined, mock([use(tool("cancel", "cancel_checkin")), answer("Saved!")]));
    assert.equal(output.stage, "canceled");
    assert.equal(output.text, "The check-in is canceled.");
    assert.equal(output.saved_entry_id, null);
  } finally { await close(); }
});

test("assistant route requires authentication, ownership and valid request JSON", async (t) => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    const make = (owner?: string) => {
      const app = new Hono<{ Variables: { userId: string } }>();
      if (owner) app.use("*", async (c, next) => { c.set("userId", owner); await next(); });
      app.route("/api/v1", createAssistantRoutes(db, config));
      app.onError((e, c) => c.json({ code: e instanceof DomainError ? e.code : "unexpected" }, e instanceof DomainError ? e.status as 400 : 500));
      return app;
    };
    const url = `/api/v1/checkins/${request.checkinId}/agent`;
    const init = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: request.messages }) };
    assert.equal((await make().request(url, init)).status, 401);
    assert.equal((await make("bob").request(url, init)).status, 404);
    assert.equal((await make("alice").request(url, { ...init, body: "invalid-json" })).status, 422);
    assert.equal((await make("alice").request(url, { ...init, body: JSON.stringify({ messages: request.messages, ownerId: "bob" }) })).status, 422);
    t.mock.method(globalThis, "fetch", mock([answer("What would you like to add about the seedlings?")]));
    const response = await make("alice").request(url, init);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { text: "What would you like to add about the seedlings?", checkin_id: request.checkinId, draft_revision: 0, stage: "created", saved_entry_id: null });
  } finally { await close(); }
});
