import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { createDb } from "@backend/db";
import { createApp } from "../app";

test("voice starts have no hourly quota, including failed attempts, but operation replay is rejected", async () => {
  const folder = await mkdtemp(join(tmpdir(), "pink-voice-quota-"));
  const config = {
    DATABASE_URL: pathToFileURL(join(folder, "test.db")).href,
    CORS_ORIGIN: "http://localhost:8080",
    OPENAI_BACKEND_MODEL: "unused",
    AZURE_OPENAI_API_KEY: "synthetic-key",
    AZURE_OPENAI_ENDPOINT: "https://synthetic.openai.azure.com",
    AZURE_OPENAI_REALTIME_DEPLOYMENT: "gpt-live-1",
  };
  const db = createDb(config);
  try {
    const migrations = new URL("../../../../packages/db/src/migrations/", import.meta.url);
    for (const dir of (await readdir(migrations, { withFileTypes: true })).filter(x => x.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      await db.$client.executeMultiple(await readFile(new URL(`${dir.name}/migration.sql`, migrations), "utf8"));
    }
    const sdp = "v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n";
    let calls = 0;
    const provider = (async () => {
      calls++;
      if (calls <= 2) return new Response("", { status: 503 });
      return Response.json({ session: { id: `synthetic-${calls}`, model: "gpt-live-1" }, transport: { type: "webrtc", sdp } });
    }) as typeof fetch;
    const app = createApp(db, config, provider);
    const start = (operation_id: string) => app.request("http://localhost:3000/api/v1/voice/sessions", {
      method: "POST", headers: { Origin: config.CORS_ORIGIN, "Content-Type": "application/json" },
      body: JSON.stringify({ operation_id, transport: { type: "webrtc", sdp } }),
    });
    for (let attempt = 1; attempt <= 9; attempt++) {
      const response = await start(`quota-test-${attempt}`);
      assert.equal(response.status, attempt <= 2 ? 502 : 201, `attempt ${attempt}`);
    }
    assert.equal(calls, 9);
    for (const operation of ["quota-test-1", "quota-test-9"]) {
      const replay = await start(operation);
      assert.equal(replay.status, 409);
      const error = await replay.json() as { error: { code: string } };
      assert.equal(error.error.code, "voice_operation_used");
    }
    assert.equal(calls, 9, "operation replay must not contact the provider");
    assert.equal((await db.$client.execute("SELECT count(*) AS n FROM journal_documents")).rows[0]?.n, 0);
  } finally {
    db.$client.close();
    await rm(folder, { recursive: true, force: true });
  }
});
