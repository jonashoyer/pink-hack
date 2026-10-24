import { Hono } from "hono";
import type { Context } from "hono";
import type { Database } from "@backend/db";
import type { z } from "zod";
import { DomainError, validate, pageCreateSchema, pagePatchSchema, pageArchiveSchema, pageQuerySchema, profilePatchSchema, createCheckinSchema, prepareDraftSchema, updateDraftSchema, confirmSchema, commitSchema, cancelSchema, journalPatchSchema, journalCreateSchema, journalQuerySchema, getContext, listPages, getPage, createPage, patchPage, archivePage, patchProfile, createCheckin, getCheckin, prepareDraft, prepareJournalUpdate, confirmDraft, commitCheckin, cancelCheckin, listJournal, getJournalEntry, patchJournalEntry, createJournalEntry } from "../domain/journal";

type Env = { Variables: { userId: string } };
async function body<T>(c: Context<Env>, schema: z.ZodType<T>, emptyAllowed = false): Promise<T> {
  const declared = Number(c.req.header("content-length"));
  if (declared > 524288) throw new DomainError(422, "invalid_input", "JSON body exceeds 512 KiB.");
  const raw = await c.req.text();
  if (Buffer.byteLength(raw, "utf8") > 524288) throw new DomainError(422, "invalid_input", "JSON body exceeds 512 KiB.");
  let input: unknown;
  try { input = emptyAllowed && !raw.trim() ? {} : JSON.parse(raw); } catch { throw new DomainError(422, "invalid_input", "A valid JSON body is required."); }
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
  app.get("/pages", async (c) => c.json(await listPages(db, c.get("userId"), validate(pageQuerySchema, c.req.query()))));
  app.get("/pages/:id", async (c) => c.json(await getPage(db, c.get("userId"), c.req.param("id"))));
  app.post("/pages", async (c) => c.json(await createPage(db, c.get("userId"), await body(c, pageCreateSchema))));
  app.patch("/pages/:id", async (c) => c.json(await patchPage(db, c.get("userId"), c.req.param("id"), await body(c, pagePatchSchema))));
  app.delete("/pages/:id", async (c) => c.json(await archivePage(db, c.get("userId"), c.req.param("id"), await body(c, pageArchiveSchema))));
  app.post("/checkins", async (c) => c.json(await createCheckin(db, c.get("userId"), await body(c, createCheckinSchema))));
  app.get("/checkins/:id", async (c) => c.json(await getCheckin(db, c.get("userId"), c.req.param("id"))));
  app.put("/checkins/:id/draft", async (c) => c.json(await prepareDraft(db, c.get("userId"), c.req.param("id"), await body(c, prepareDraftSchema))));
  app.post("/checkins/:id/prepare-update", async (c) => c.json(await prepareJournalUpdate(db, c.get("userId"), c.req.param("id"), await body(c, updateDraftSchema))));
  app.post("/checkins/:id/confirm", async (c) => c.json(await confirmDraft(db, c.get("userId"), c.req.param("id"), await body(c, confirmSchema))));
  app.post("/checkins/:id/commit", async (c) => c.json(await commitCheckin(db, c.get("userId"), c.req.param("id"), await body(c, commitSchema))));
  app.post("/checkins/:id/cancel", async (c) => { await body(c, cancelSchema, true); return c.json(await cancelCheckin(db, c.get("userId"), c.req.param("id"))); });
  app.post("/journal", async (c) => c.json(await createJournalEntry(db, c.get("userId"), await body(c, journalCreateSchema))));
  app.get("/journal", async (c) => c.json(await listJournal(db, c.get("userId"), validate(journalQuerySchema, c.req.query()))));
  app.get("/journal/:id", async (c) => c.json(await getJournalEntry(db, c.get("userId"), c.req.param("id"))));
  app.patch("/journal/:id", async (c) => c.json(await patchJournalEntry(db, c.get("userId"), c.req.param("id"), await body(c, journalPatchSchema))));
  return app;
}
