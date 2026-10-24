import assert from "node:assert/strict";
import test from "node:test";
import { readLiveAnswer, voiceProvider, plausibleLiveSdp } from "../voice/provider";

const azure = { AZURE_OPENAI_ENDPOINT: "https://synthetic-resource.services.ai.azure.com/openai/v1", AZURE_OPENAI_API_KEY: "synthetic-azure-key", AZURE_OPENAI_REALTIME_DEPLOYMENT: "gpt-live-1", OPENAI_BACKEND_MODEL: "gpt-6-luna" };
test("Azure Live selects the verified endpoint, deployment, api-key and client delegation", () => {
  const provider = voiceProvider(azure);
  assert.equal(provider.url, "https://synthetic-resource.services.ai.azure.com/openai/v1/live/sessions");
  assert.deepEqual(provider.headers, { "api-key": azure.AZURE_OPENAI_API_KEY });
  assert.equal(provider.model, "gpt-live-1");
  assert.equal(provider.delegation, "client");
  assert.equal(voiceProvider({ ...azure, AZURE_OPENAI_ENDPOINT: "https://synthetic-resource.openai.azure.com" }).provider, "azure");
  for (const endpoint of ["http://synthetic-resource.openai.azure.com", "https://example.com", "https://synthetic-resource.openai.azure.com/other", "https://secret@synthetic-resource.openai.azure.com", "https://synthetic-resource.openai.azure.com?key=secret"]) {
    assert.throws(() => voiceProvider({ ...azure, AZURE_OPENAI_ENDPOINT: endpoint }));
  }
});
test("Live SDP answers require audio and events, expected model and no echoed secret", async () => {
  const provider = voiceProvider(azure);
  const sdp = "v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n";
  assert.equal(plausibleLiveSdp(sdp), true);
  assert.equal(plausibleLiveSdp("v=0\r\n"), false);
  const response = (id: string, model: string) => new Response(JSON.stringify({ session: { id, model }, transport: { sdp } }));
  assert.equal((await readLiveAnswer(response("live_synthetic", "gpt-live-1"), provider)).session.id, "live_synthetic");
  await assert.rejects(readLiveAnswer(response(azure.AZURE_OPENAI_API_KEY, "gpt-live-1"), provider));
  await assert.rejects(readLiveAnswer(response("live_synthetic", "wrong-model"), provider));
});
