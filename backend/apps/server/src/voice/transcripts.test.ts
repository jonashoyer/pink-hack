import test from "node:test";
import assert from "node:assert/strict";
import { deviceMessages } from "./transcripts";
test("cadence fragments merge before the agent message bound without losing text", () => {
  const fragments = Array.from({ length: 60 }, () => ({ role: "user" as const, text: "word " }));
  assert.deepEqual(deviceMessages(fragments), [{ role: "user", content: "word ".repeat(60) }]);
});
test("context and alternating turn bounds fail explicitly instead of dropping fragments", () => {
  assert.throws(() => deviceMessages([{ role: "user", text: "a".repeat(24001) }]));
  assert.throws(() => deviceMessages(Array.from({ length: 25 }, (_, index) => ({ role: index % 2 ? "assistant" as const : "user" as const, text: "turn" }))));
});
