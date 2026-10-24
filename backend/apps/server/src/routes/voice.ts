import { createHash, randomUUID } from "node:crypto";
import type { Database } from "@backend/db";
import { voiceSessions, voiceToolCalls } from "@backend/db/schema/voice";
import { and, eq, gte } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { DomainError } from "../domain/errors";
import { getVoiceContext, prepareDraft, prepareDraftSchema, recordIdSchema, validate } from "../domain/journal";
import { buildBackendInstructions, conversationInstructions } from "../voice/prompts";

export type VoiceConfig = { OPENAI_API_KEY?: string; OPENAI_BACKEND_MODEL: string };
const emptyArguments = z.object({}).strict();
const sessionInput = z.object({
  checkin_id: recordIdSchema,
  operation_id: recordIdSchema,
  transport: z.object({ type: z.literal("webrtc"), sdp: z.string().min(1).max(64000).refine((sdp) => sdp.startsWith("v=0"), "An SDP offer is required") }).strict(),
}).strict();
const toolInput = z.object({ call_id: recordIdSchema, name: z.enum(["get_context", "get_checkin", "prepare_journal_draft"]), arguments: z.unknown() }).strict();
const providerResult = z.object({ session: z.object({ id: z.string().min(1).max(256) }), transport: z.object({ type: z.literal("webrtc"), sdp: z.string().min(1).max(128000) }) });
async function jsonBody(request: Request) {
  try { return await request.json(); }
  catch { throw new DomainError(422, "invalid_json", "A valid JSON body is required."); }
}
export const voiceTools = [
  { type: "function", name: "get_context", description: "Read the current personal context, permitted medical context and recent journal entries.", parameters: z.toJSONSchema(emptyArguments, { io: "input" }), strict: false },
  { type: "function", name: "get_checkin", description: "Read this check-in's current workflow stage and draft revision.", parameters: z.toJSONSchema(emptyArguments, { io: "input" }), strict: false },
  { type: "function", name: "prepare_journal_draft", description: "Prepare or revise a journal draft for user review in the app. This does not confirm or save a journal entry.", parameters: z.toJSONSchema(prepareDraftSchema, { io: "input" }), strict: false },
];

export function createVoiceRoutes(db: Database, config: VoiceConfig, providerFetch: typeof fetch = fetch) {
  const routes = new Hono<{ Variables: { userId: string } }>();
  routes.post("/voice/sessions", async (c) => {
    const input = validate(sessionInput, await jsonBody(c.req.raw));
    const ownerId = c.get("userId");
    const context = await getVoiceContext(db, ownerId, input.checkin_id);
    if (!config.OPENAI_API_KEY) throw new DomainError(503, "voice_not_configured", "Configure OPENAI_API_KEY on the backend to enable voice.");
    const rowId = randomUUID();
    await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(voiceSessions).where(and(eq(voiceSessions.ownerId, ownerId), eq(voiceSessions.operationId, input.operation_id)));
      if (existing) throw new DomainError(409, "voice_operation_used", "This voice initialization was already attempted. Reconnect using a new operation ID; do not replay the SDP.");
      const attempts = await tx.select({ id: voiceSessions.id }).from(voiceSessions).where(and(eq(voiceSessions.ownerId, ownerId), gte(voiceSessions.createdAt, Date.now() - 3600000))).limit(5);
      if (attempts.length >= 5) throw new DomainError(429, "voice_limit", "The hourly voice initialization limit has been reached.");
      await tx.insert(voiceSessions).values({ id: rowId, ownerId, checkinId: input.checkin_id, operationId: input.operation_id, state: "creating", createdAt: Date.now() });
    });
    try {
      const response = await providerFetch("https://api.openai.com/v1/live/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${config.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ session: {
          model: "gpt-live-1", store: false, instructions: conversationInstructions,
          delegation: { type: "responses", responses: { model: config.OPENAI_BACKEND_MODEL, instructions: buildBackendInstructions(context), tools: voiceTools, tool_choice: "auto" } },
        }, transport: input.transport }),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new DomainError(502, "voice_provider_failed", "GPT-Live session initialization failed. Check the backend's project access and configuration.");
      const parsed = providerResult.safeParse(await response.json());
      if (!parsed.success) throw new DomainError(502, "voice_provider_response_invalid", "GPT-Live returned an unexpected session response.");
      await db.update(voiceSessions).set({ state: "active", providerSessionId: parsed.data.session.id }).where(eq(voiceSessions.id, rowId));
      return c.json({ id: rowId, ...parsed.data }, 201);
    } catch (error) {
      await db.update(voiceSessions).set({ state: "failed" }).where(eq(voiceSessions.id, rowId));
      if (error instanceof DomainError) throw error;
      throw new DomainError(502, "voice_initialization_incomplete", "Voice initialization did not complete. It was not automatically retried.");
    }
  });

  // The authenticated client relays completed Live function calls here, then
  // returns this output over its Live data channel. No model save tool exists.
  routes.post("/voice/sessions/:id/tools", async (c) => {
    const input = validate(toolInput, await jsonBody(c.req.raw));
    const ownerId = c.get("userId");
    const [voice] = await db.select().from(voiceSessions).where(and(eq(voiceSessions.id, c.req.param("id")), eq(voiceSessions.ownerId, ownerId), eq(voiceSessions.state, "active")));
    if (!voice) throw new DomainError(404, "not_found", "Voice session was not found.");
    const context = await getVoiceContext(db, ownerId, voice.checkinId);
    if (input.name !== "prepare_journal_draft") {
      validate(emptyArguments, input.arguments);
      return c.json({ call_id: input.call_id, output: input.name === "get_context" ? context : context.checkin });
    }
    const argumentsHash = createHash("sha256").update(JSON.stringify(input.arguments)).digest("hex");
    const [cached] = await db.select().from(voiceToolCalls).where(and(eq(voiceToolCalls.voiceSessionId, voice.id), eq(voiceToolCalls.callId, input.call_id)));
    if (cached) {
      if (cached.name !== input.name || cached.argumentsHash !== argumentsHash) throw new DomainError(409, "tool_call_conflict", "Tool call ID was reused with different arguments.");
      return c.json({ call_id: input.call_id, output: cached.result });
    }
    const draft = await prepareDraft(db, ownerId, voice.checkinId, validate(prepareDraftSchema, input.arguments));
    const result = { status: "draft_prepared", checkin_id: draft.id, draft_revision: draft.draft_revision, saved: false };
    await db.insert(voiceToolCalls).values({ id: randomUUID(), voiceSessionId: voice.id, callId: input.call_id, name: input.name, argumentsHash, result }).onConflictDoNothing();
    return c.json({ call_id: input.call_id, output: result });
  });
  return routes;
}
