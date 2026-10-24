import { Hono } from "hono";
import type { Context } from "hono";
import type { Database } from "@backend/db";
import type { z } from "zod";
import { DomainError, validate, pagePatchSchema, profilePatchSchema, createCheckinSchema, prepareDraftSchema, confirmSchema, commitSchema, cancelSchema, journalQuerySchema, getContext, patchPage, patchProfile, createCheckin, getCheckin, prepareDraft, confirmDraft, commitCheckin, cancelCheckin, listJournal, getJournalEntry } from "../domain/journal";

type Env = { Variables: { userId: string } };
async function body<T>(c: Context<Env>, schema: z.ZodType<T>): Promise<T> {
  const declared = Number(c.req.header("content-length"));
  if (declared > 262144) throw new DomainError(422, "invalid_input", "JSON body exceeds 256 KiB.");
  const raw = await c.req.text();
  if (Buffer.byteLength(raw, "utf8") > 262144) throw new DomainError(422, "invalid_input", "JSON body exceeds 256 KiB.");
  let input: unknown;
  try { input = JSON.parse(raw); } catch { throw new DomainError(422, "invalid_input", "A valid JSON body is required."); }
  return validate(schema, input);
}
export function createJournalRoutes(db: Database): Hono<Env> {
  const app = new Hono<Env>();
  app.use("*", async (c, next) => {
    if (!c.get("userId")) throw new DomainError(401, "unauthorized", "Authentication is required.");
    await next();
  });
  app.get("/context", async (c) => c.json(await getContext(db, c.get("userId"))));
  app.patch("/profile", async (c) => c.json(await patchProfile(db, c.get("userId"), await body(c, profilePatchSchema))));
  app.patch("/pages/:id", async (c) => c.json(await patchPage(db, c.get("userId"), c.req.param("id"), await body(c, pagePatchSchema))));
  app.post("/checkins", async (c) => c.json(await createCheckin(db, c.get("userId"), await body(c, createCheckinSchema))));
  app.get("/checkins/:id", async (c) => c.json(await getCheckin(db, c.get("userId"), c.req.param("id"))));
  app.put("/checkins/:id/draft", async (c) => c.json(await prepareDraft(db, c.get("userId"), c.req.param("id"), await body(c, prepareDraftSchema))));
  app.post("/checkins/:id/confirm", async (c) => c.json(await confirmDraft(db, c.get("userId"), c.req.param("id"), await body(c, confirmSchema))));
  app.post("/checkins/:id/commit", async (c) => c.json(await commitCheckin(db, c.get("userId"), c.req.param("id"), await body(c, commitSchema))));
  app.post("/checkins/:id/cancel", async (c) => {
    const raw = await c.req.text();
    if (raw.trim()) {
      let input: unknown;
      try { input = JSON.parse(raw); } catch { throw new DomainError(422, "invalid_input", "A valid JSON body is required."); }
      validate(cancelSchema, input);
    }
    return c.json(await cancelCheckin(db, c.get("userId"), c.req.param("id")));
  });
  app.get("/journal", async (c) => c.json(await listJournal(db, c.get("userId"), validate(journalQuerySchema, c.req.query()))));
  app.get("/journal/:id", async (c) => c.json(await getJournalEntry(db, c.get("userId"), c.req.param("id"))));
  return app;
}
