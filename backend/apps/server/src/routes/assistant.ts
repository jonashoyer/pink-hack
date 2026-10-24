import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { Database } from "@backend/db";
import { DomainError } from "../domain/errors";
import { validate } from "../domain/contracts";
import { journalAgentRequestSchema, journalAgentResponseSchema, runJournalAgent, type JournalAgentConfig } from "../voice/agent";

type Env = { Variables: { userId: string } };
export function createAssistantRoutes(db: Database, config: JournalAgentConfig): Hono<Env> {
  const app = new Hono<Env>();
  app.use("*", async (c, next) => {
    if (!c.get("userId")) throw new DomainError(401, "unauthenticated", "Sign in to continue.");
    await next();
  });
  app.use("*", bodyLimit({ maxSize: 128 * 1024, onError: () => { throw new DomainError(413, "body_too_large", "Assistant request exceeds 128 KiB."); } }));
  app.post("/checkins/:id/agent", async (c) => {
    let raw: unknown;
    try { raw = await c.req.json(); } catch { throw new DomainError(422, "invalid_input", "A valid JSON body is required."); }
    const input = validate(journalAgentRequestSchema, raw);
    const output = await runJournalAgent(db, config, { ownerId: c.get("userId"), checkinId: c.req.param("id"), messages: input.messages }, c.req.raw.signal);
    const response = journalAgentResponseSchema.safeParse(output);
    if (!response.success) throw new DomainError(502, "assistant_unavailable", "The assistant could not finish. Please try again.");
    return c.json(response.data);
  });
  return app;
}
