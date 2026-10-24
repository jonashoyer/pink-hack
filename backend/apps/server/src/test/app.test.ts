import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { createAuth } from "@backend/auth";
import { createDb } from "@backend/db";
import { createApp } from "../app";

test("authenticated journal workflow persists, isolates owners and negotiates Live without sending medical pages", async () => {
  const folder = await mkdtemp(join(tmpdir(), "pink-hack-api-"));
  const config = {
    NODE_ENV: "test", DATABASE_URL: pathToFileURL(join(folder, "test.db")).href,
    BETTER_AUTH_SECRET: randomBytes(32).toString("hex"), BETTER_AUTH_URL: "http://localhost:3000",
    CORS_ORIGIN: "http://localhost:5173", OPENAI_API_KEY: "synthetic-test-key", OPENAI_BACKEND_MODEL: "gpt-6-luna",
  };
  let db = createDb(config);
  try {
    const migrations = new URL("../../../../packages/db/src/migrations/", import.meta.url);
    for (const entry of (await readdir(migrations, { withFileTypes: true })).filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      await db.$client.executeMultiple(await readFile(new URL(`${entry.name}/migration.sql`, migrations), "utf8"));
    }
    let requestCount = 0;
    let sentConfig: any;
    let sentUrl: string | undefined;
    let sentHeaders: Headers | undefined;
    const provider = (async (url, init) => {
      requestCount++;
      sentUrl = String(url);
      sentHeaders = new Headers(init?.headers);
      sentConfig = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ session: { id: "live_synthetic" }, transport: { type: "webrtc", sdp: "v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n" } }), { status: 201 });
    }) as typeof fetch;
    let app = createApp(db, createAuth(config, db), config, provider);
    const request = async (path: string, token?: string, method = "GET", body?: unknown, origin = config.CORS_ORIGIN) => {
      const response = await app.request(`http://localhost:3000${path}`, { method, headers: {
        Origin: origin, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
      return { status: response.status, headers: response.headers, body: await response.json() as any };
    };
    const signUp = async (email: string) => {
      const result = await request("/api/auth/sign-up/email", undefined, "POST", { name: "Synthetic user", email, password: "synthetic-password-123" });
      assert.equal(result.status, 200);
      const token = result.headers.get("set-auth-token") ?? result.body.token;
      assert.ok(token);
      return token as string;
    };
    assert.equal((await request("/health")).status, 200);
    assert.equal((await request("/api/v1/context")).status, 401);
    const token = await signUp("synthetic-one@example.test");
    const otherToken = await signUp("synthetic-two@example.test");
    const context = await request("/api/v1/context", token);
    assert.equal(context.status, 200);
    assert.equal(context.headers.get("cache-control"), "no-store");
    const medical = context.body.pages.find((page: any) => page.kind === "medical_needs");
    const pageChange = { expected_revision: medical.revision, sections: [{ id: "medical", title: "Care instructions", type: "text", body: "SYNTHETIC_MEDICAL_CONTEXT" }] };
    assert.equal((await request(`/api/v1/pages/${medical.id}`, token, "PATCH", pageChange)).status, 200);
    assert.equal((await request(`/api/v1/pages/${medical.id}`, token, "PATCH", pageChange)).status, 409);
    assert.equal((await request(`/api/v1/pages/${medical.id}`, otherToken, "PATCH", pageChange)).status, 404);
    assert.equal((await request("/api/v1/context", token, "GET", undefined, "https://untrusted.example")).status, 403);
    const checkin = await request("/api/v1/checkins", token, "POST", { source: "app", operation_id: "capture-one" });
    assert.equal(checkin.status, 200);
    const checkinId = checkin.body.id;
    const unconfigured = createApp(db, createAuth(config, db), { ...config, OPENAI_API_KEY: undefined }, provider);
    const offer = "v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n";
    const disabledVoice = await unconfigured.request("http://localhost:3000/api/v1/voice/sessions", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ checkin_id: checkinId, operation_id: "not-configured", transport: { type: "webrtc", sdp: offer } }) });
    assert.equal(disabledVoice.status, 503);
    assert.equal((await disabledVoice.json() as any).error.code, "voice_not_configured");
    assert.equal(requestCount, 0);
    const repeated = await request("/api/v1/checkins", token, "POST", { source: "app", operation_id: "capture-one" });
    assert.equal(repeated.body.id, checkinId);
    assert.equal((await request(`/api/v1/checkins/${checkinId}`, otherToken)).status, 404);
    const live = await request("/api/v1/voice/sessions", token, "POST", { checkin_id: checkinId, operation_id: "live-one", transport: { type: "webrtc", sdp: offer } });
    assert.equal(live.status, 201);
    assert.equal(live.body.session.id, "live_synthetic");
    assert.equal(requestCount, 1);
    const openaiApp = app;
    const openaiConfig = sentConfig;
    app = createApp(db, createAuth(config, db), { ...config, AZURE_OPENAI_API_KEY: "synthetic-azure-key", AZURE_OPENAI_ENDPOINT: "https://synthetic-resource.services.ai.azure.com", AZURE_OPENAI_REALTIME_DEPLOYMENT: "gpt-live-1" }, provider);
    const azureLive = await request("/api/v1/voice/sessions", token, "POST", { checkin_id: checkinId, operation_id: "azure-live-one", transport: { type: "webrtc", sdp: offer } });
    assert.equal(azureLive.status, 201);
    assert.equal(azureLive.body.provider, "azure");
    assert.equal(azureLive.body.delegation, "client");
    assert.equal(sentUrl, "https://synthetic-resource.services.ai.azure.com/openai/v1/live/sessions");
    assert.equal(sentHeaders?.get("api-key"), "synthetic-azure-key");
    assert.equal(sentHeaders?.get("Authorization"), null);
    assert.deepEqual(sentConfig.session.delegation, { type: "client" });
    app = openaiApp;
    assert.equal(openaiConfig.session.model, "gpt-live-1");
    assert.equal(openaiConfig.session.store, false);
    assert.equal(openaiConfig.transport.type, "webrtc");
    assert.ok(!openaiConfig.session.delegation.responses.instructions.includes("SYNTHETIC_MEDICAL_CONTEXT"));
    assert.deepEqual(openaiConfig.session.delegation.responses.tools.map((tool: any) => tool.name), ["get_context", "get_checkin", "prepare_journal_draft"]);
    const voiceRetry = await request("/api/v1/voice/sessions", token, "POST", { checkin_id: checkinId, operation_id: "live-one", transport: { type: "webrtc", sdp: offer } });
    assert.equal(voiceRetry.status, 409);
    assert.equal(requestCount, 2);
    const draft = { title: "Morning check-in", original_text: "I rate my energy two out of five and want to visit my sister.", note: "Reported energy 2 out of 5. Wants to visit sister.", observations: [{ metric: "energy", value: 2 }], proposed_plan: { items: [{ id: "visit", text: "Suggestion: a short visit with a rest afterward.", state: "active" }] } };
    const call = { call_id: "call-one", name: "prepare_journal_draft", arguments: { expected_revision: 0, draft } };
    const prepared = await request(`/api/v1/voice/sessions/${live.body.id}/tools`, token, "POST", call);
    assert.equal(prepared.status, 200);
    assert.equal(prepared.body.output.saved, false);
    const toolRetry = await request(`/api/v1/voice/sessions/${live.body.id}/tools`, token, "POST", call);
    assert.deepEqual(toolRetry.body, prepared.body);
    assert.equal((await request(`/api/v1/voice/sessions/${live.body.id}/tools`, otherToken, "POST", call)).status, 404);
    assert.equal((await request(`/api/v1/checkins/${checkinId}/commit`, token, "POST", { operation_id: "save-one", confirmation_receipt: "invented" })).status, 409);
    assert.equal((await request("/api/v1/journal", token)).body.entries.length, 0);
    const confirmation = await request(`/api/v1/checkins/${checkinId}/confirm`, token, "POST", { draft_revision: 1, action: "save", operation_id: "save-one", plan_state: "accepted" });
    assert.equal(confirmation.status, 200);
    const commit = { operation_id: "save-one", confirmation_receipt: confirmation.body.receipt };
    const saved = await request(`/api/v1/checkins/${checkinId}/commit`, token, "POST", commit);
    assert.equal(saved.status, 200);
    assert.equal(saved.body.original_text, draft.original_text);
    assert.equal(saved.body.observations[0].confirmation_state, "confirmed");
    assert.equal(saved.body.day_plans[0].state, "accepted");
    assert.equal((await request(`/api/v1/checkins/${checkinId}/commit`, token, "POST", commit)).body.id, saved.body.id);
    assert.equal((await request("/api/v1/journal", token)).body.entries.length, 1);
    assert.equal((await request(`/api/v1/journal/${saved.body.id}`, otherToken)).status, 404);
    assert.equal((await request("/api/v1/journal", otherToken)).body.entries.length, 0);
    const cancelled = await request("/api/v1/checkins", token, "POST", { source: "app", operation_id: "capture-cancel" });
    assert.equal((await request(`/api/v1/checkins/${cancelled.body.id}/cancel`, token, "POST", {})).status, 200);
    assert.equal((await request(`/api/v1/checkins/${cancelled.body.id}/draft`, token, "PUT", { expected_revision: 0, draft })).status, 409);
    assert.equal((await request("/api/v1/checkins", token, "POST", { source: "atech", operation_id: "device-capture" })).status, 403);
    const malformed = await app.request("http://localhost:3000/api/v1/checkins", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: "{" });
    assert.equal(malformed.status, 422);
    const oversized = await app.request("http://localhost:3000/api/v1/checkins", { method: "POST", headers: { "Content-Type": "application/json" }, body: "x".repeat(128 * 1024 + 1) });
    assert.equal(oversized.status, 413);
    // Reopen the file and auth service: saved records and login sessions survive.
    db.$client.close();
    db = createDb(config);
    app = createApp(db, createAuth(config, db), config, provider);
    assert.equal((await request(`/api/v1/journal/${saved.body.id}`, token)).body.id, saved.body.id);
  } finally {
    db.$client.close();
    await rm(folder, { recursive: true, force: true });
  }
});
