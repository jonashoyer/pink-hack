import type { Database } from "@backend/db";
import { z } from "zod";
import { DomainError } from "../domain/errors";
import { getCheckin, getVoiceContext } from "../domain/journal";
import { recordIdSchema, validate } from "../domain/contracts";
import { buildBackendInstructions } from "./prompts";
import { dispatchJournalTool, journalToolDefinitions } from "./tools";

export type JournalAgentConfig = { ANTHROPIC_API_KEY?: string };
export type JournalAgentInput = { ownerId: string; checkinId: string; messages: Array<{ role: "user" | "assistant"; content: string }> };
export const journalAgentRequestSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(24_000) }).strict()).min(1).max(24),
}).strict().refine(({ messages }) => messages.reduce((n, m) => n + m.content.length, 0) <= 24_000);
export const journalAgentResponseSchema = z.object({
  text: z.string().trim().min(1).max(4_000), checkin_id: recordIdSchema,
  draft_revision: z.number().int().nonnegative(),
  stage: z.enum(["created", "draft", "awaiting_confirmation", "saved", "canceled"]),
  saved_entry_id: recordIdSchema.nullable(),
}).strict();
export type JournalAgentResult = z.infer<typeof journalAgentResponseSchema>;

const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("thinking"), thinking: z.string().max(64_000), signature: z.string().min(1).max(64_000) }),
  z.object({ type: z.literal("redacted_thinking"), data: z.string().min(1).max(64_000) }),
  z.object({ type: z.literal("text"), text: z.string().max(16_000) }),
  z.object({ type: z.literal("tool_use"), id: z.string().min(1).max(200), name: z.string().min(1).max(80), input: z.record(z.string(), z.unknown()) }),
]);
const providerSchema = z.object({ content: z.array(blockSchema).min(1).max(8), stop_reason: z.enum(["end_turn", "tool_use"]) });
type Block = z.infer<typeof blockSchema>;
type ToolResult = { type: "tool_result"; tool_use_id: string; content: string };
type Message = { role: "user" | "assistant"; content: string | (Block | ToolResult)[] };
const unavailable = () => new DomainError(502, "assistant_unavailable", "The assistant could not finish. Please try again.", true);
function checkAbort(signal: AbortSignal) {
  if (signal.aborted) throw new DomainError(408, "assistant_aborted", "The assistant request was canceled or timed out.");
}
function boundedJson(value: unknown) {
  const result = JSON.stringify(value);
  if (Buffer.byteLength(result, "utf8") > 750_000) throw new DomainError(409, "context_overflow", "The assistant context exceeds its limit. No pages were silently omitted.");
  return result;
}
async function providerJson(response: Response, signal: AbortSignal): Promise<unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw unavailable();
  const chunks: Uint8Array[] = [];
  let size = 0;
  const cancel = () => { void reader.cancel().catch(() => undefined); };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    checkAbort(signal);
    for (;;) {
      const { done, value } = await reader.read();
      checkAbort(signal);
      if (done) break;
      size += value.byteLength;
      if (size > 131_072) { await reader.cancel(); throw unavailable(); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    checkAbort(signal);
    throw unavailable();
  } finally {
    signal.removeEventListener("abort", cancel);
    reader.releaseLock();
  }
}
function transcript(messages: JournalAgentInput["messages"]): Message[] {
  const merged: Message[] = [];
  for (const message of messages) {
    const last = merged.at(-1);
    if (last?.role === message.role) last.content = `${last.content}\n${message.content}`;
    else merged.push({ ...message });
  }
  // Live transcripts can omit the start or end of a conversation. These markers
  // establish provider message ordering without inventing user statements.
  if (merged[0]?.role === "assistant") merged.unshift({ role: "user", content: "The following is an incomplete voice transcript. Use it only as conversation context." });
  if (merged.at(-1)?.role === "assistant") merged.push({ role: "user", content: "Continue from the incomplete transcript using current server context. This marker is not confirmation." });
  return merged;
}
async function result(db: Database, input: JournalAgentInput, text: string, prepared: boolean): Promise<JournalAgentResult> {
  const state = await getCheckin(db, input.ownerId, input.checkinId);
  if (state.stage === "saved" && state.saved_entry_id) text = "Your journal entry is saved.";
  else if (state.stage === "canceled") text = "The check-in is canceled.";
  else if (prepared && state.draft) text = "I've prepared your journal draft. Would you like to save it?";
  else if (/\b(saved|committed)\b/i.test(text)) text = state.draft ? "Your journal draft is ready. Would you like to save it?" : "Your journal entry has not been saved. What would you like to record?";
  const parsed = journalAgentResponseSchema.safeParse({ text, checkin_id: state.id, draft_revision: state.draft_revision, stage: state.stage, saved_entry_id: state.saved_entry_id });
  if (!parsed.success) throw unavailable();
  return parsed.data;
}

/** Application reasoning for Live client delegation. Only storage can authorize a commit. */
export async function runJournalAgent(db: Database, config: JournalAgentConfig, input: JournalAgentInput, signal?: AbortSignal, fetcher: typeof fetch = fetch): Promise<JournalAgentResult> {
  const activeSignal = signal ? AbortSignal.any([signal, AbortSignal.timeout(45_000)]) : AbortSignal.timeout(45_000);
  try {
    checkAbort(activeSignal);
    validate(recordIdSchema, input.ownerId);
    validate(recordIdSchema, input.checkinId);
    const request = validate(journalAgentRequestSchema, { messages: input.messages });
    const key = config.ANTHROPIC_API_KEY?.trim();
    if (!key) throw new DomainError(503, "assistant_not_configured", "The application assistant is not configured.");
    const context = await getVoiceContext(db, input.ownerId, input.checkinId);
    checkAbort(activeSignal);
    boundedJson(context);
    const system = buildBackendInstructions(context);
    const messages = transcript(request.messages);
    const tools = journalToolDefinitions.map(({ name, description, parameters }) => ({ name, description, input_schema: parameters }));
    const seen = new Map<string, { request: string; content: string }>();
    let count = 0;
    let prepared = false;
    for (let round = 0; round < 4; round++) {
      checkAbort(activeSignal);
      const response = await fetcher("https://api.anthropic.com/v1/messages", {
        method: "POST", cache: "no-store", signal: activeSignal,
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-haiku-5-5", max_tokens: 1_024, system, messages, tools }),
      });
      checkAbort(activeSignal);
      if (!response.ok) { await response.body?.cancel().catch(() => undefined); throw unavailable(); }
      const generated = providerSchema.safeParse(await providerJson(response, activeSignal));
      if (!generated.success) throw unavailable();
      const calls = generated.data.content.filter((block) => block.type === "tool_use");
      if (!calls.length) {
        const text = generated.data.content.filter((block) => block.type === "text").map((block) => block.text).join("\n").trim();
        if (generated.data.stop_reason !== "end_turn" || !text || text.length > 4_000) throw unavailable();
        checkAbort(activeSignal);
        return await result(db, input, text, prepared);
      }
      if (generated.data.stop_reason !== "tool_use" || calls.length > 4 || round === 3 || count + calls.length > 12) throw unavailable();
      const results: ToolResult[] = [];
      const roundIds = new Set<string>();
      for (const call of calls) {
        checkAbort(activeSignal);
        count++;
        const requestKey = boundedJson({ name: call.name, input: call.input });
        const cached = seen.get(call.id);
        if (cached && cached.request !== requestKey) throw new DomainError(409, "tool_call_conflict", "A tool call ID was reused for a different request.");
        let content = cached?.content;
        if (content === undefined) {
          if (call.name === "commit_journal_entry") {
            const state = await getCheckin(db, input.ownerId, input.checkinId);
            const receipt = state.confirmation;
            if (!receipt || receipt.draft_revision !== state.draft_revision || receipt.receipt !== call.input.confirmation_receipt || receipt.operation_id !== call.input.operation_id) {
              throw new DomainError(409, "confirmation_required", "Confirm the current draft through the authenticated client before saving.");
            }
          }
          // No tool, including draft/context writes, starts after cancellation.
          checkAbort(activeSignal);
          content = boundedJson(await dispatchJournalTool(db, input.ownerId, input.checkinId, call.name, call.input));
          seen.set(call.id, { request: requestKey, content });
          if (call.name === "prepare_journal_draft" || call.name === "prepare_journal_update") prepared = true;
        }
        if (!roundIds.has(call.id)) results.push({ type: "tool_result", tool_use_id: call.id, content });
        roundIds.add(call.id);
      }
      // Signed thinking must be replayed unchanged in the next provider request.
      messages.push({ role: "assistant", content: generated.data.content }, { role: "user", content: results });
    }
    throw unavailable();
  } catch (error) {
    checkAbort(activeSignal);
    if (error instanceof DomainError) throw error;
    throw unavailable();
  }
}
