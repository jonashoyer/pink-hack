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
import { createPage, createVoiceConversation, getJournalEntry, patchJournalEntry, listJournal } from "../domain/journal";
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
const journal: tables.JournalDraft = {
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
async function input(db: Database, ownerId = "alice", operationId = "synthetic-capture") {
  const conversation = await createVoiceConversation(db, ownerId, { source: "app", operation_id: operationId });
  return { ownerId, voiceSessionId: conversation.id, delegationId: "delegation-1", messages: [{ role: "user" as const, content: `Save this journal note: ${journal.original_text}` }] };
}
const rejects = (code: string) => (e: unknown) => e instanceof DomainError && e.code === code;
const create = () => use(tool("create-entry", "create_journal_entry", journal));

test("all arbitrary owned pages reach context and direct creation persists native blocks and unfamiliar properties", async () => {
  const { db, close } = await setup();
  try {
    await createPage(db, "alice", { title: "Greenhouse routines", content: journal.content, operation_id: "greenhouse" });
    await createPage(db, "alice", { title: "Track seedling trays", content: [{ type: "paragraph", content: "Track seedling trays and help wanted." }], operation_id: "trays" });
    await createPage(db, "bob", { title: "Foreign private page", content: [], operation_id: "foreign" });
    const request = await input(db);
    const fetcher = mock([create(), answer("The note is ready.")], (body, round) => {
      assert.ok(body.system.includes("Greenhouse routines"));
      assert.ok(body.system.includes("Track seedling trays"));
      assert.ok(body.system.includes("checkListItem"));
      assert.ok(!body.system.includes("Foreign private page"));
      assert.deepEqual(body.tools.map((t: any) => t.name).sort(), ["get_context", "get_page", "get_journal_entry", "create_journal_entry", "update_journal_entry"].sort());
      if (round === 1) assert.equal(JSON.parse(body.messages.at(-1).content[0].content).properties["seedling trays"], 7);
    });
    const output = await runJournalAgent(db, config, request, undefined, fetcher);
    assert.equal(output.text, "Your journal entry is saved.");
    assert.equal(output.entries.length, 1);
    const stored = await getJournalEntry(db, "alice", output.entries[0]!.id);
    assert.deepEqual(stored.content, journal.content);
    assert.deepEqual(stored.properties, journal.properties);
    assert.equal(output.entries[0]!.revision, stored.revision);
    assert.equal((await listJournal(db, "alice", {})).entries.length, 1);
    assert.ok(!("draft_revision" in output));
    assert.ok(!("checkin_id" in output));
  } finally { await close(); }
});

test("ambiguous intent is clarified with an empty write list; text alone cannot claim save", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    request.messages[0]!.content = "Maybe change that thing about tomorrow.";
    const output = await runJournalAgent(db, config, request, undefined, mock([answer("Which journal entry and what would you like to change?")]));
    assert.equal(output.text, "Which journal entry and what would you like to change?");
    assert.deepEqual(output.entries, []);
    assert.equal((await listJournal(db, "alice", {})).entries.length, 0);
    const proposed = await runJournalAgent(db, config, request, undefined, mock([answer("Your journal entry is saved.")]));
    assert.match(proposed.text, /haven't saved any changes/);
    assert.deepEqual(proposed.entries, []);
  } finally { await close(); }
});

test("response revisions are re-read from storage after tool execution", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    const provider = mock([create(), answer()]);
    let round = 0;
    let initialRevision = -1;
    const fetcher: typeof fetch = async (url, init) => {
      if (round++ === 1) {
        const entry = (await listJournal(db, "alice", {})).entries[0]!;
        initialRevision = entry.revision;
        await patchJournalEntry(db, "alice", entry.id, { expected_revision: entry.revision, operation_id: "concurrent-edit", title: "Updated by authenticated editor" });
      }
      return provider(url, init);
    };
    const output = await runJournalAgent(db, config, request, undefined, fetcher);
    const entry = await getJournalEntry(db, "alice", output.entries[0]!.id);
    assert.equal(entry.title, "Updated by authenticated editor");
    assert.deepEqual(output.entries, [{ id: entry.id, revision: entry.revision }]);
    assert.equal(entry.revision, initialRevision + 1);
  } finally { await close(); }
});

test("direct update reads an owned entry and preserves unrelated blocks/properties", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    const original = await runJournalAgent(db, config, request, undefined, mock([create(), answer()]));
    const entry = await getJournalEntry(db, "alice", original.entries[0]!.id);
    const content = [...journal.content.slice(0, 2), { ...journal.content[2], content: "Ask for help tomorrow instead." }];
    request.messages[0]!.content = "Move the compost help to tomorrow in the entry we just saved.";
    const output = await runJournalAgent(db, config, { ...request, delegationId: "delegation-update", entryId: entry.id }, undefined, mock([
      use(tool("read-entry", "get_journal_entry", { entry_id: entry.id })),
      use(tool("update-entry", "update_journal_entry", { entry_id: entry.id, expected_revision: entry.revision, content })), answer("I have a suggested change."),
    ], (body) => assert.ok(body.system.includes('"target_entry"'))));
    assert.deepEqual(output.entries, [{ id: entry.id, revision: entry.revision + 1 }]);
    const stored = await getJournalEntry(db, "alice", entry.id);
    assert.deepEqual(stored.properties, journal.properties);
    assert.deepEqual(stored.content, content);
    assert.equal(stored.original_text, journal.original_text);
    const readOnly = await runJournalAgent(db, config, request, undefined, mock([answer("What else matters today?")]));
    assert.deepEqual(readOnly.entries, []);
  } finally { await close(); }
});

test("stale entry revisions reject the update and preserve writing", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    const output = await runJournalAgent(db, config, request, undefined, mock([create(), answer()]));
    const entry = await getJournalEntry(db, "alice", output.entries[0]!.id);
    await assert.rejects(runJournalAgent(db, config, request, undefined, mock([use(tool("stale", "update_journal_entry", { entry_id: entry.id, expected_revision: entry.revision + 1, title: "Wrong revision" }))])), rejects("revision_conflict"));
    assert.equal((await getJournalEntry(db, "alice", entry.id)).title, journal.title);
  } finally { await close(); }
});

test("repeated tool IDs execute once within a turn and thinking blocks are preserved", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    const thinking = { type: "thinking", thinking: "Synthetic reasoning", signature: "synthetic-signature" };
    const call = tool("same-id", "create_journal_entry", journal);
    const output = await runJournalAgent(db, config, request, undefined, mock([use(thinking, call), use(call), answer()], (body, round) => {
      if (round === 1) assert.deepEqual(body.messages[1].content[0], thinking);
    }));
    assert.equal(output.entries.length, 1);
    assert.equal((await listJournal(db, "alice", {})).entries.length, 1);
  } finally { await close(); }
});

test("stable delegation/tool IDs replay creation across requests without duplicates", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    const first = await runJournalAgent(db, config, request, undefined, mock([create(), answer()]));
    const second = await runJournalAgent(db, config, request, undefined, mock([create(), answer()]));
    assert.deepEqual(second.entries, first.entries);
    assert.equal((await listJournal(db, "alice", {})).entries.length, 1);
    const third = await runJournalAgent(db, config, { ...request, delegationId: "different-delegation" }, undefined, mock([create(), answer()]));
    assert.notEqual(third.entries[0]!.id, first.entries[0]!.id);
    assert.equal((await listJournal(db, "alice", {})).entries.length, 2);
  } finally { await close(); }
});

test("duplicate calls in one provider response produce one write and one continuation call", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    const call = tool("duplicate", "create_journal_entry", journal);
    const output = await runJournalAgent(db, config, request, undefined, mock([use(call, call), answer()], (body, round) => {
      if (round === 1) {
        assert.equal(body.messages[1].content.filter((block: any) => block.type === "tool_use").length, 1);
        assert.equal(body.messages[2].content.length, 1);
      }
    }));
    assert.equal(output.entries.length, 1);
    assert.equal((await listJournal(db, "alice", {})).entries.length, 1);
  } finally { await close(); }
});

test("conflicting tool IDs reject without a second write", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    await assert.rejects(runJournalAgent(db, config, request, undefined, mock([create(), use(tool("create-entry", "create_journal_entry", { ...journal, title: "Changed payload" }))])), rejects("tool_call_conflict"));
    assert.equal((await listJournal(db, "alice", {})).entries.length, 1);
  } finally { await close(); }
});

test("abort before context or after provider response starts no journal writes", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(runJournalAgent(db, config, request, controller.signal, mock([])), rejects("assistant_aborted"));
    const during = new AbortController();
    const fetcher: typeof fetch = async () => { during.abort(); return Response.json(create()); };
    await assert.rejects(runJournalAgent(db, config, request, during.signal, fetcher), rejects("assistant_aborted"));
    assert.equal((await listJournal(db, "alice", {})).entries.length, 0);
  } finally { await close(); }
});

test("provider failures and malformed/oversized responses are sanitized", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    const fetchers: Array<typeof fetch> = [
      async () => { throw new Error("private synthetic patient payload and secret"); },
      async () => new Response("private synthetic patient payload", { status: 500 }),
      async () => new Response("not-json"), async () => new Response("x".repeat(131_073)),
      mock([{ content: [{ type: "unknown", text: "private synthetic patient payload" }], stop_reason: "end_turn" }]),
    ];
    for (const fetcher of fetchers) await assert.rejects(runJournalAgent(db, config, request, undefined, fetcher), (e: unknown) => e instanceof DomainError && e.code === "assistant_unavailable" && !/patient|secret|payload/.test(e.message));
    assert.equal((await listJournal(db, "alice", {})).entries.length, 0);
  } finally { await close(); }
});

test("dispatcher rejects invalid inputs and legacy staged tools", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    await assert.rejects(runJournalAgent(db, config, request, undefined, mock([use(tool("bad", "create_journal_entry", { patient: "invalid" }))])), rejects("invalid_input"));
    for (const name of ["prepare_journal_draft", "confirm_draft", "commit_journal_entry", "cancel_checkin"]) await assert.rejects(runJournalAgent(db, config, request, undefined, mock([use(tool(name, name))])), rejects("unknown_tool"));
    assert.equal((await listJournal(db, "alice", {})).entries.length, 0);
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
      assert.match(body.messages.at(-1).content, /not a request to write/);
    }));
    assert.equal(journalAgentRequestSchema.safeParse({ delegation_id: "d", messages: Array.from({ length: 25 }, () => ({ role: "user", content: "x" })) }).success, false);
    assert.equal(journalAgentRequestSchema.safeParse({ delegation_id: "d", messages: [{ role: "user", content: "x".repeat(24_001) }] }).success, false);
  } finally { await close(); }
});

test("tool rounds are bounded without writes", async () => {
  const { db, close } = await setup();
  try {
    const request = await input(db);
    await assert.rejects(runJournalAgent(db, config, request, undefined, mock(Array.from({ length: 4 }, (_, i) => use(tool(`read-${i}`, "get_context"))))), rejects("assistant_unavailable"));
    assert.equal((await listJournal(db, "alice", {})).entries.length, 0);
  } finally { await close(); }
});

test("foreign voice sessions, optional targets and entry updates reject before writing", async () => {
  const { db, close } = await setup();
  try {
    const alice = await input(db);
    await assert.rejects(runJournalAgent(db, config, { ...alice, ownerId: "bob" }, undefined, mock([])), rejects("not_found"));
    const bob = await input(db, "bob", "bob-capture");
    const foreign = await runJournalAgent(db, config, bob, undefined, mock([create(), answer()]));
    const target = foreign.entries[0]!;
    await assert.rejects(runJournalAgent(db, config, { ...alice, entryId: target.id }, undefined, mock([])), rejects("not_found"));
    await assert.rejects(runJournalAgent(db, config, alice, undefined, mock([use(tool("foreign-update", "update_journal_entry", { entry_id: target.id, expected_revision: target.revision, title: "Intrusion" }))])), rejects("not_found"));
    assert.equal((await listJournal(db, "alice", {})).entries.length, 0);
  } finally { await close(); }
});

test("assistant HTTP contract validates server owner context and returns only this delegation's persisted entries", async (t) => {
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
    const url = `/api/v1/voice/sessions/${request.voiceSessionId}/agent`;
    const payload = { delegation_id: request.delegationId, messages: request.messages };
    const init = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) };
    assert.equal((await make().request(url, init)).status, 401);
    assert.equal((await make("bob").request(url, init)).status, 404);
    assert.equal((await make("alice").request(url, { ...init, body: "invalid-json" })).status, 422);
    assert.equal((await make("alice").request(url, { ...init, body: JSON.stringify({ ...payload, ownerId: "bob" }) })).status, 422);
    assert.equal((await make("alice").request(url, { ...init, body: JSON.stringify({ messages: request.messages }) })).status, 422);
    t.mock.method(globalThis, "fetch", mock([create(), answer(), answer("What else matters today?")]));
    const response = await make("alice").request(url, init);
    assert.equal(response.status, 200);
    const written = (await listJournal(db, "alice", {})).entries[0]!;
    assert.deepEqual(await response.json(), { text: "Your journal entry is saved.", entries: [{ id: written.id, revision: written.revision }] });
    const readOnly = await make("alice").request(url, { ...init, body: JSON.stringify({ ...payload, delegation_id: "read-only" }) });
    assert.deepEqual(await readOnly.json(), { text: "What else matters today?", entries: [] });
    assert.equal((await make("alice").request(`/api/v1/checkins/${request.voiceSessionId}/agent`, init)).status, 404);
  } finally { await close(); }
});
