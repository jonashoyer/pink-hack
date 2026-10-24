import assert from "node:assert/strict";
import { EventEmitter, once } from "node:events";
import { createServer } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import WebSocket from "ws";
import { createDb } from "@backend/db";
import { user } from "@backend/db/schema/auth";
import { devices } from "@backend/db/schema/device";
import * as journalTables from "@backend/db/schema/journal";
import { SQL, is, sql, eq } from "drizzle-orm";
import { getTableConfig, SQLiteDialect } from "drizzle-orm/sqlite-core";
import { Hono } from "hono";
import { createDeviceRoutes } from "../routes/device";
import { createVoiceConversation, readVoiceConversation, createJournalForConversation, patchJournalForConversation, createJournalEntry, getJournalEntry, listJournal } from "../domain/journal";
import { DomainError } from "../domain/errors";
import { provisionDevice, authenticateDevice, hashDeviceToken } from "./credentials";
import { attachDeviceAudio } from "./ingress";
import { DeviceLiveSession } from "./live";
import { claimDeviceLease, renewDeviceLease, releaseDeviceLease, DeviceLeaseGuard } from "./lease";
import { performance } from "node:perf_hooks";
import type { DeviceAudioConfig, DeviceApplication, DelegationContext } from "./contracts";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
async function until(check: () => boolean, timeout = 3000) {
  const deadline = Date.now() + timeout;
  while (!check()) { if (Date.now() > deadline) throw new Error("Timed out waiting for test condition."); await delay(5); }
}
// Test-only DBs derive DDL from current schema, without touching migrations.
async function database() {
  const dir = await mkdtemp(join(tmpdir(), "pink-device-test-"));
  const config = { DATABASE_URL: `file:${join(dir, "test.db")}` };
  const db = createDb(config);
  const dialect = new SQLiteDialect();
  const q = (name: string) => `"${name.replaceAll('"', '""')}"`;
  const render = (value: SQL) => dialect.sqlToQuery(value).sql;
  await db.run(sql.raw("PRAGMA foreign_keys = ON"));
  for (const table of [user, devices, ...Object.values(journalTables)]) {
    const t = getTableConfig(table);
    const columns = t.columns.map((col) => {
      const value = col.default;
      return `${q(col.name)} ${col.getSQLType()}${col.primary ? " PRIMARY KEY" : ""}${col.notNull ? " NOT NULL" : ""}${col.isUnique ? " UNIQUE" : ""}`
        + (value === undefined ? "" : ` DEFAULT ${is(value, SQL) ? render(value) : typeof value === "string" ? `'${value.replaceAll("'", "''")}'` : Number(value)}`);
    });
    for (const check of t.checks) columns.push(`CONSTRAINT ${q(check.name)} CHECK (${render(check.value)})`);
    for (const fk of t.foreignKeys) {
      const ref = fk.reference();
      columns.push(`FOREIGN KEY (${ref.columns.map((c) => q(c.name)).join(",")}) REFERENCES ${q(getTableConfig(ref.foreignTable).name)} (${ref.foreignColumns.map((c) => q(c.name)).join(",")}) ON DELETE ${fk.onDelete}`);
    }
    await db.run(sql.raw(`CREATE TABLE ${q(t.name)} (${columns.join(",")})`));
    for (const index of t.indexes) {
      const i = index.config;
      await db.run(sql.raw(`CREATE ${i.unique ? "UNIQUE " : ""}INDEX ${q(i.name)} ON ${q(t.name)} (${i.columns.map((c) => is(c, SQL) ? render(c) : q(c.name)).join(",")})${i.where ? ` WHERE ${render(i.where)}` : ""}`));
    }
  }
  await db.insert(user).values([{ id: "alice", name: "Synthetic Alice", email: "alice@example.test" }, { id: "bob", name: "Synthetic Bob", email: "bob@example.test" }]);
  return { db, config, close: async () => { db.$client.close(); await rm(dir, { recursive: true, force: true }); } };
}

class FakeProvider extends EventEmitter {
  readyState: number = WebSocket.CONNECTING;
  bufferedAmount = 0;
  sent: Record<string, any>[] = [];
  sentAt: number[] = [];
  constructor(readonly autoStart = true) {
    super(); setImmediate(() => { this.readyState = WebSocket.OPEN; this.emit("open"); });
  }
  send(value: string, callback?: (error?: Error) => void) {
    const event = JSON.parse(value); this.sent.push(event); this.sentAt.push(Date.now()); callback?.();
    if (event.type === "session.start" && this.autoStart) setImmediate(() => this.event({ type: "session.started", session: { id: "synthetic_live", model: "gpt-live-1", audio: { format: { type: "audio/pcm", rate: 16000 } } } }));
    if (event.type === "session.close") setImmediate(() => this.event({ type: "session.closed", reason: "close_requested", usage: { seconds: 0 } }));
  }
  event(value: unknown) { this.emit("message", Buffer.from(JSON.stringify(value)), false); }
  close() { this.terminate(); }
  terminate() { if (this.readyState === WebSocket.CLOSED) return; this.readyState = WebSocket.CLOSED; this.emit("close", 1000); }
  asSocket() { return this as unknown as WebSocket; }
}
const voice = { OPENAI_BACKEND_MODEL: "unused", AZURE_OPENAI_API_KEY: "synthetic-private-key", AZURE_OPENAI_ENDPOINT: "https://synthetic.openai.azure.com", AZURE_OPENAI_REALTIME_DEPLOYMENT: "gpt-live-1" };
const draft = { title: "Synthetic device check-in", original_text: "I want to water the plants.", content: [{ type: "paragraph", content: "Water the plants after resting." }], properties: { garden: true, sleep: 6 } };
function application(overrides: Partial<DeviceApplication> = {}): DeviceApplication {
  return {
    startConversation: (store, ownerId, deviceId, operationId, entryId) => createVoiceConversation(store, ownerId, { source: "atech", device_id: deviceId, operation_id: operationId, ...(entryId ? { entry_id: entryId } : {}) }),
    readConversation: (store, ownerId, _deviceId, voiceSessionId) => readVoiceConversation(store, ownerId, voiceSessionId),
    onDelegation: async () => ({ entries: [] }),
    ...overrides,
  };
}
async function fixture(overrides: Partial<DeviceApplication> = {}) {
  const storage = await database();
  const credential = await provisionDevice(storage.db, "alice");
  const providers: FakeProvider[] = [];
  const server = createServer((_req, res) => { res.writeHead(404); res.end(); });
  const app = application(overrides);
  const config: DeviceAudioConfig = { ...voice, instructions: "Synthetic test instructions.", application: app };
  const detach = attachDeviceAudio(server, storage.db, config, { providerSocketFactory: (url, options) => {
    assert.equal(url, "wss://synthetic.openai.azure.com/openai/v1/live/sessions");
    assert.deepEqual(options.headers, { "api-key": voice.AZURE_OPENAI_API_KEY });
    assert.equal(options.followRedirects, false);
    const provider = new FakeProvider(); providers.push(provider); return provider.asSocket();
  } });
  server.listen(0, "127.0.0.1"); await once(server, "listening");
  const address = server.address(); assert.ok(address && typeof address !== "string");
  const url = `ws://127.0.0.1:${address.port}/api/v1/device/audio`;
  const clients: WebSocket[] = [];
  async function connect(token = credential.token) {
    const ws = new WebSocket(url, { headers: { Authorization: `Bearer ${token}` } }); clients.push(ws);
    const frames: { json?: any; audio?: Buffer }[] = [];
    ws.on("message", (data, binary) => frames.push(binary ? { audio: Buffer.from(data as Buffer) } : { json: JSON.parse(data.toString()) }));
    await once(ws, "open");
    return { ws, frames, send: (value: unknown) => ws.send(JSON.stringify(value)) };
  }
  return { ...storage, credential, app, providers, url, connect, close: async () => {
    for (const client of clients) client.terminate();
    await detach(); await new Promise<void>((resolve) => server.close(() => resolve())); await storage.close();
  } };
}

test("provisioning stores only a hash, survives DB reopen, prevents claim, and rotates only its owner", async () => {
  const f = await database();
  try {
    const provisioned = await provisionDevice(f.db, "alice");
    const [stored] = await f.db.select().from(devices);
    assert.equal(stored!.token_hash, hashDeviceToken(provisioned.token));
    assert.equal(JSON.stringify(stored).includes(provisioned.token), false);
    const reopened = createDb(f.config);
    try { assert.equal((await authenticateDevice(reopened, `Bearer ${provisioned.token}`)).owner_id, "alice"); } finally { reopened.$client.close(); }
    await assert.rejects(provisionDevice(f.db, "bob"), (e: unknown) => e instanceof DomainError && e.code === "device_already_owned");
    const rotated = await provisionDevice(f.db, "alice");
    assert.equal(rotated.credential_revision, 2);
    await assert.rejects(authenticateDevice(f.db, `Bearer ${provisioned.token}`));
    assert.equal((await authenticateDevice(f.db, `Bearer ${rotated.token}`)).owner_id, "alice");
    await assert.rejects(f.db.insert(devices).values({ id: "other", owner_id: "bob", token_hash: "synthetic-other-hash", created_at: "now", updated_at: "now" }));
    const app = new Hono<{ Variables: { userId: string } }>();
    app.onError((error, c) => c.json({ code: error instanceof DomainError ? error.code : "failed" }, 401));
    app.route("/api/v1", createDeviceRoutes(f.db));
    assert.equal((await app.request("/api/v1/device/provision", { method: "POST" })).status, 401);
    const owner = new Hono<{ Variables: { userId: string } }>();
    owner.use("*", async (c, next) => { c.set("userId", "alice"); await next(); });
    owner.route("/api/v1", createDeviceRoutes(f.db));
    const response = await owner.request("/api/v1/device/provision", { method: "POST", body: "{}" });
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal((await response.json() as any).device_id, "demo");
  } finally { await f.close(); }
});

test("upgrades require header credentials before acceptance and admit only one active device", async () => {
  const f = await fixture();
  const rejected = async (url: string, token?: string) => {
    const ws = new WebSocket(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
    return new Promise<number>((resolve, reject) => {
      ws.on("unexpected-response", (_request, response) => { resolve(response.statusCode!); ws.terminate(); });
      ws.on("open", () => { ws.terminate(); reject(new Error("Unauthorized upgrade accepted.")); });
      ws.on("error", () => {});
    });
  };
  try {
    assert.equal(await rejected(f.url), 401);
    assert.equal(await rejected(`${f.url}?token=${f.credential.token}`, f.credential.token), 400);
    assert.equal(f.providers.length, 0);
    const first = await f.connect();
    assert.equal(await rejected(f.url, f.credential.token), 409);
    const closed = once(first.ws, "close");
    await provisionDevice(f.db, "alice"); await closed;
    assert.ok(first.frames.some((x) => x.json?.code === "device_credential_rotated"));
  } finally { await f.close(); }
});

test("bidirectional PCM stays ordered, paced, aligned, and bounded; turn end uses only documented append", async () => {
  const f = await fixture();
  try {
    const client = await f.connect(); client.send({ type: "start", operation_id: "capture-pcm" });
    await until(() => client.frames.some((x) => x.json?.state === "listening"));
    const provider = f.providers[0]!;
    assert.deepEqual(provider.sent[0]!.session.audio.format, { type: "audio/pcm", rate: 16000 });
    assert.equal(provider.sent[0]!.session.store, false);
    const input = Buffer.alloc(2048); input.writeInt16LE(123, 0); input.writeInt16LE(-321, 1024);
    client.ws.send(input); client.send({ type: "audio_turn_end" });
    await until(() => provider.sent.filter((e) => e.type === "session.input_audio.append").length >= 3);
    const chunks = provider.sent.filter((e) => e.type === "session.input_audio.append").map((e) => Buffer.from(e.audio, "base64"));
    assert.deepEqual(Buffer.concat(chunks.slice(0, 2)), input);
    assert.deepEqual(chunks[2], Buffer.alloc(1024));
    const appendIndexes = provider.sent.flatMap((event, i) => event.type === "session.input_audio.append" ? [i] : []);
    assert.ok(provider.sentAt[appendIndexes[1]!]! - provider.sentAt[appendIndexes[0]!]! >= 25);
    assert.equal(provider.sent.some((e) => /commit|turn_end|cancel/.test(e.type)), false);
    const output = Buffer.alloc(3072); output.writeInt16LE(456, 0); output.writeInt16LE(-654, 2048);
    provider.event({ type: "session.output_audio.delta", delta: output.toString("base64") });
    await until(() => client.frames.filter((x) => x.audio).length === 3);
    assert.deepEqual(Buffer.concat(client.frames.flatMap((x) => x.audio ? [x.audio] : [])), output);
    assert.ok(client.frames.filter((x) => x.audio).every((x) => x.audio!.length <= 2048 && x.audio!.length % 2 === 0));
    const closed = once(client.ws, "close"); client.ws.send(Buffer.alloc(3)); await closed;
    assert.ok(client.frames.some((x) => x.json?.code === "invalid_pcm_chunk"));
  } finally { await f.close(); }
});

test("interrupt aborts application work, flushes queued playback, suppresses old deltas and restarts Live", async () => {
  let delegated: DelegationContext | undefined;
  let finish: ((value: { text: string; entries: [] }) => void) | undefined;
  const f = await fixture({ onDelegation: async (context) => { delegated = context; return new Promise((resolve) => { finish = resolve; }); } });
  try {
    const client = await f.connect(); client.send({ type: "start", operation_id: "capture-interrupt" });
    await until(() => client.frames.some((x) => x.json?.state === "listening"));
    const old = f.providers[0]!;
    old.event({ type: "session.input_transcript.delta", delta: "Synthetic garden request.", start_ms: 0, end_ms: 100 });
    old.event({ type: "session.delegation.created", delegation: { id: "delegation-one", target: "client" } });
    await until(() => !!delegated);
    old.event({ type: "session.output_audio.delta", delta: Buffer.alloc(32000, 1).toString("base64") });
    client.send({ type: "interrupt" });
    await until(() => f.providers.length === 2 && client.frames.some((x) => x.json?.type === "flush"));
    assert.equal(delegated!.signal.aborted, true);
    assert.ok(old.sent.some((e) => e.type === "session.close"));
    old.event({ type: "session.output_audio.delta", delta: Buffer.alloc(1024, 99).toString("base64") });
    finish!({ text: "This canceled result must never be sent.", entries: [] });
    await delay(75);
    assert.equal(f.providers[1]!.sent.some((e) => e.type === "session.commentary.append"), false);
    const flushIndex = client.frames.findIndex((x) => x.json?.type === "flush");
    assert.equal(client.frames.slice(flushIndex + 1).some((x) => x.audio), false);
  } finally { finish?.({ text: "canceled", entries: [] }); await f.close(); }
});

test("direct delegation writes and updates journals without staged records; verified saved events are deduplicated", async () => {
  let entryId: string | undefined;
  const f = await fixture({ onDelegation: async (context) => {
    const entry = entryId
      ? await patchJournalForConversation(f.db, context.ownerId, context.voiceSessionId, entryId, { operation_id: "direct-update", expected_revision: 1, title: "Updated direct note" })
      : await createJournalForConversation(f.db, context.ownerId, context.voiceSessionId, { ...draft, operation_id: "direct-create" });
    entryId = entry.id;
    return { text: "The journal write completed.", entries: [{ id: entry.id, revision: entry.revision }] };
  } });
  try {
    const client = await f.connect(); client.send({ type: "start", operation_id: "direct-conversation" });
    await until(() => client.frames.some((x) => x.json?.state === "listening"));
    const voiceSessionId = client.frames.find((x) => x.json?.state === "listening")!.json.voice_session_id;
    f.providers[0]!.event({ type: "session.delegation.created", delegation: { id: "create-entry", target: "client" } });
    await until(() => client.frames.some((x) => x.json?.type === "saved"));
    const saved = client.frames.find((x) => x.json?.type === "saved")!.json;
    assert.equal(saved.voice_session_id, voiceSessionId);
    assert.equal(saved.revision, 1);
    assert.equal((await getJournalEntry(f.db, "alice", saved.entry_id)).voice_conversation_id, voiceSessionId);
    assert.equal((await f.db.select().from(journalTables.checkinSessions)).length, 0);
    assert.equal((await f.db.select().from(journalTables.journalDocuments)).length, 1);
    f.providers[0]!.event({ type: "session.delegation.created", delegation: { id: "update-entry", target: "client" } });
    await until(() => client.frames.filter((x) => x.json?.type === "saved").length === 2);
    assert.equal(client.frames.filter((x) => x.json?.type === "saved")[1]!.json.revision, 2);
    assert.equal((await getJournalEntry(f.db, "alice", saved.entry_id)).title, "Updated direct note");
    f.providers[0]!.event({ type: "session.delegation.created", delegation: { id: "update-replay", target: "client" } });
    await until(() => f.providers[0]!.sent.filter((x) => x.type === "session.commentary.append").length === 3);
    assert.equal(client.frames.filter((x) => x.json?.type === "saved").length, 2);
    assert.equal(client.frames.some((x) => x.json?.state === "review" || x.json?.draft_revision), false);
    client.send({ type: "confirm", operation_id: "legacy-save", draft_revision: 1 });
    await until(() => client.frames.some((x) => x.json?.code === "device_control_not_supported"));
    // Saved entries do not terminate an ongoing conversation or block PCM.
    client.ws.send(Buffer.alloc(1024));
    await until(() => f.providers[0]!.sent.some((x) => x.type === "session.input_audio.append"));
    const closed = once(client.ws, "close"); client.send({ type: "cancel" }); await closed;
    assert.equal((await getJournalEntry(f.db, "alice", saved.entry_id)).revision, 2);
  } finally { await f.close(); }
});

test("unpersisted, foreign and stale save claims emit no saved event or spoken success", async () => {
  let result: { text: string; entries: Array<{ id: string; revision: number }> } = { text: "Unsupported success claim", entries: [{ id: "missing-entry", revision: 1 }] };
  const f = await fixture({ onDelegation: async () => result });
  try {
    const client = await f.connect(); client.send({ type: "start", operation_id: "verification-conversation" });
    await until(() => client.frames.some((x) => x.json?.state === "listening"));
    const provider = f.providers[0]!;
    const invoke = (id: string) => provider.event({ type: "session.delegation.created", delegation: { id, target: "client" } });
    invoke("missing-claim");
    await until(() => client.frames.some((x) => x.json?.code === "not_found"));
    const foreign = await createJournalEntry(f.db, "bob", { ...draft, operation_id: "foreign-entry" });
    result = { text: "Foreign success", entries: [{ id: foreign.id, revision: 1 }] };
    invoke("foreign-claim");
    await until(() => client.frames.filter((x) => x.json?.code === "not_found").length === 2);
    const owned = await createJournalEntry(f.db, "alice", { ...draft, operation_id: "owned-entry" });
    result = { text: "Stale success", entries: [{ id: owned.id, revision: 8 }] };
    invoke("stale-claim");
    await until(() => client.frames.some((x) => x.json?.code === "device_save_revision_changed"));
    assert.equal(client.frames.some((x) => x.json?.type === "saved"), false);
    assert.equal(provider.sent.some((x) => x.type === "session.commentary.append"), false);
  } finally { await f.close(); }
});

test("stop and network disconnect retain the owned conversation for ID resume; target cannot be spoofed", async () => {
  const f = await fixture();
  try {
    const entry = await createJournalEntry(f.db, "alice", { ...draft, operation_id: "target-entry" });
    const first = await f.connect(); first.send({ type: "start", operation_id: "capture-stop", entry_id: entry.id });
    await until(() => first.frames.some((x) => x.json?.state === "listening"));
    const id = first.frames.find((x) => x.json?.state === "listening")!.json.voice_session_id;
    assert.equal((await readVoiceConversation(f.db, "alice", id)).target_entry_id, entry.id);
    const closed = once(first.ws, "close"); first.send({ type: "stop" }); await closed;
    assert.ok(first.frames.some((x) => x.json?.type === "flush"));
    assert.ok(f.providers[0]!.sent.some((e) => e.type === "session.close"));
    assert.equal((await readVoiceConversation(f.db, "alice", id)).state, "active");
    await delay(20);
    const second = await f.connect(); second.send({ type: "start", voice_session_id: id, operation_id: "resume-stop" });
    await until(() => second.frames.some((x) => x.json?.state === "listening"));
    assert.equal(second.frames.find((x) => x.json?.state === "listening")!.json.voice_session_id, id);
    const disconnected = once(second.ws, "close"); second.ws.close(); await disconnected; await delay(20);
    const third = await f.connect(); third.send({ type: "start", voice_session_id: id, operation_id: "resume-with-target", entry_id: entry.id });
    await until(() => third.frames.some((x) => x.json?.code === "invalid_device_control"));
    third.send({ type: "start", voice_session_id: id, operation_id: "resume-network" });
    await until(() => third.frames.some((x) => x.json?.state === "listening"));
    assert.equal((await listJournal(f.db, "alice")).entries.length, 1);
  } finally { await f.close(); }
});

test("foreign and app-source conversations are inaccessible to the device", async () => {
  const f = await fixture();
  try {
    const appConversation = await createVoiceConversation(f.db, "alice", { source: "app", operation_id: "app-conversation" });
    const foreign = await createVoiceConversation(f.db, "bob", { source: "app", operation_id: "foreign-conversation" });
    const client = await f.connect();
    client.send({ type: "start", voice_session_id: foreign.id, operation_id: "foreign-resume" });
    await until(() => client.frames.some((x) => x.json?.code === "not_found"));
    client.send({ type: "start", voice_session_id: appConversation.id, operation_id: "app-resume" });
    await until(() => client.frames.some((x) => x.json?.code === "device_conversation_mismatch"));
    assert.equal(f.providers.length, 0);
  } finally { await f.close(); }
});

test("durable device lease excludes another DB client, checks rotation, expires and releases conditionally", async () => {
  const f = await database();
  const peer = createDb(f.config);
  try {
    const credential = await provisionDevice(f.db, "alice");
    const device = await authenticateDevice(f.db, `Bearer ${credential.token}`);
    const first = await claimDeviceLease(f.db, device);
    await assert.rejects(claimDeviceLease(peer, device), (e: unknown) => e instanceof DomainError && e.code === "device_session_active");
    assert.equal(await renewDeviceLease(peer, first), true);
    await provisionDevice(peer, "alice");
    assert.equal(await renewDeviceLease(f.db, first), false);
    const [rotated] = await peer.select().from(devices);
    await assert.rejects(claimDeviceLease(peer, rotated!));
    await peer.update(devices).set({ lease_expires_at: 0 }).where(eq(devices.id, "demo"));
    assert.equal(await renewDeviceLease(f.db, first), false);
    const second = await claimDeviceLease(peer, rotated!);
    await releaseDeviceLease(f.db, first);
    assert.equal((await peer.select().from(devices))[0]!.lease_id, second.id);
    await releaseDeviceLease(peer, second);
    assert.equal((await peer.select().from(devices))[0]!.lease_id, null);
    const final = await claimDeviceLease(f.db, (await peer.select().from(devices))[0]!);
    let lost = false;
    const guard = new DeviceLeaseGuard(f.db, final, () => { lost = true; });
    final.deadline = performance.now() - 1;
    assert.equal(guard.valid(), false); assert.equal(lost, true);
    await guard.close();
  } finally { peer.$client.close(); await f.close(); }
});

test("provider startup waits for session.started and rejects explicitly wrong PCM rate; playback stays bounded", async () => {
  let provider: FakeProvider | undefined;
  const config = { ...voice, instructions: "Synthetic test", application: {} as DeviceApplication };
  const live = new DeviceLiveSession(config, () => {}, () => {}, () => { provider = new FakeProvider(false); return provider.asSocket(); });
  let started = false;
  const start = live.start().then(() => { started = true; });
  await until(() => !!provider?.sent.length);
  assert.equal(started, false);
  provider!.event({ type: "session.started", session: { model: "gpt-live-1", audio: { format: { type: "audio/pcm", rate: 24000 } } } });
  await assert.rejects(start); await live.close();
  const f = await fixture();
  try {
    const client = await f.connect(); client.send({ type: "start", operation_id: "capture-overflow" });
    await until(() => client.frames.some((x) => x.json?.state === "listening"));
    const closed = once(client.ws, "close");
    f.providers[0]!.event({ type: "session.output_audio.delta", delta: Buffer.alloc(65536).toString("base64") });
    await closed;
    assert.ok(client.frames.some((x) => x.json?.code === "device_provider_protocol_failed"));
    assert.equal(client.frames.some((x) => x.audio), false);
  } finally { await f.close(); }
});

