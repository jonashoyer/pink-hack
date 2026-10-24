import assert from "node:assert/strict";
import test from "node:test";
import { LiveTranscripts, liveThinkingParts, validLiveSession } from "./live-protocol";

test("Live transcript fragments preserve roles and bounded correlated context", () => {
  const transcript = new LiveTranscripts();
  assert.equal(transcript.append({ type: "session.input_transcript.delta", delta: "I feel ", start_ms: 0, end_ms: 100 })?.text, "I feel ");
  assert.equal(transcript.append({ type: "session.input_transcript.delta", delta: "tired.", start_ms: 100, end_ms: 200 })?.text, "I feel tired.");
  assert.equal(transcript.append({ type: "session.output_transcript.delta", delta: "What would help?" })?.role, "assistant");
  assert.equal(transcript.append({ type: "session.input_transcript.delta", delta: "Rest." })?.text, "Rest.");
  const parts = liveThinkingParts("a".repeat(900), "delegation-synthetic");
  assert.equal(parts.map((part) => part.content).join(""), "a".repeat(900));
  assert.ok(parts.every((part) => part.content.length <= 350 && part.delegation_id === "delegation-synthetic"));
});
test("microphone startup checks the exact Live session/model/delegation", () => {
  const expected = { session: { id: "live_synthetic" }, model: "gpt-live-1", delegation: "client" };
  assert.equal(validLiveSession({ type: "session.started", session: { id: "live_synthetic", model: "gpt-live-1", delegation: { type: "client" } } }, expected), true);
  assert.equal(validLiveSession({ type: "session.started", session: { id: "other", model: "gpt-live-1" } }, expected), false);
  assert.equal(validLiveSession({ type: "session.started", session: { id: "live_synthetic", model: "gpt-live-1", delegation: { type: "responses" } } }, expected), false);
});
