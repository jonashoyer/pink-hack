import { randomUUID } from "node:crypto";
import { and, eq, desc, gte, lte, lt, or, isNull } from "drizzle-orm";
import { z } from "zod";
import type { Database } from "@backend/db";
import { profiles, pages, checkinSessions, journalEntries, operationReceipts, observations, dayPlans } from "@backend/db/schema/journal";
import type { JournalDraft, JournalEntryResult } from "@backend/db/schema/journal";
import { DomainError } from "./errors";
import { validate, createCheckinSchema, prepareDraftSchema, updateDraftSchema, confirmSchema, commitSchema, profilePatchSchema, pageCreateSchema, pagePatchSchema, pageArchiveSchema, pageQuerySchema, journalPatchSchema, journalQuerySchema, dateSchema, recordIdSchema } from "./contracts";
import type { CreateCheckinInput, DraftInput, JournalUpdateInput, JournalPatchInput, ConfirmInput, CommitInput } from "./contracts";
import { write, missing, conflict, now, fingerprint } from "./store";
import type { Store } from "./store";
import { convertLegacyJournal, normalizeLegacyDraft } from "./legacy";

export * from "./contracts";
export * from "./legacy";
export { DomainError } from "./errors";
type StoredCheckin = typeof checkinSessions.$inferSelect;
export type Page = Pick<typeof pages.$inferSelect, "id" | "title" | "content" | "revision" | "created_at" | "updated_at">;
export type Checkin = Omit<StoredCheckin, "draft" | "legacy_draft"> & { draft: JournalDraft | null; legacy_draft_requires_review: boolean };
const id = () => randomUUID();
function assertOpen(checkin: StoredCheckin) {
  if (checkin.stage === "saved" || checkin.stage === "canceled") throw new DomainError(409, "checkin_closed", "Saved and canceled check-ins cannot be changed.");
}
function publicCheckin(row: StoredCheckin): Checkin {
  const { legacy_draft: _legacy, draft, ...rest } = row;
  return { ...rest, draft: draft ? normalizeLegacyDraft(draft, row.id) : null, legacy_draft_requires_review: !!draft && !("content" in draft) };
}
function publicPage(row: typeof pages.$inferSelect): Page {
  return { id: row.id, title: row.title, content: row.content, revision: row.revision, created_at: row.created_at, updated_at: row.updated_at };
}
export function journalDate(timezone: string, at = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(at);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
async function getProfile(tx: Store, ownerId: string) {
  await tx.insert(profiles).values({ owner_id: ownerId, updated_at: now() }).onConflictDoNothing();
  const [profile] = await tx.select().from(profiles).where(eq(profiles.owner_id, ownerId));
  if (!profile) throw missing();
  return profile;
}
async function readContext(tx: Store, ownerId: string) {
  const profile = await getProfile(tx, ownerId);
  const rows = await tx.select().from(pages).where(and(eq(pages.owner_id, ownerId), isNull(pages.archived_at))).orderBy(pages.id).limit(201);
  if (rows.length > 200 || Buffer.byteLength(JSON.stringify(rows), "utf8") > 500000) throw new DomainError(409, "context_overflow", "All context pages exceed the context limit. Review and archive unnecessary pages; no pages were silently omitted.");
  return { profile, pages: rows.map(publicPage) };
}
export async function getContext(db: Database, ownerId: string) { return write(db, (tx) => readContext(tx, ownerId)); }
export async function patchProfile(db: Database, ownerId: string, input: z.infer<typeof profilePatchSchema>) {
  const data = validate(profilePatchSchema, input);
  return write(db, async (tx) => {
    const profile = await getProfile(tx, ownerId);
    if (profile.revision !== data.expected_revision) throw conflict();
    const [updated] = await tx.update(profiles).set({ timezone: data.timezone ?? profile.timezone, allow_medical_voice_context: data.allow_medical_voice_context ?? profile.allow_medical_voice_context, revision: profile.revision + 1, updated_at: now() }).where(and(eq(profiles.owner_id, ownerId), eq(profiles.revision, data.expected_revision))).returning();
    if (!updated) throw conflict();
    return updated;
  });
}
async function lookupOperation<T>(tx: Store, ownerId: string, operationId: string, request: unknown): Promise<T | undefined> {
  const [receipt] = await tx.select().from(operationReceipts).where(and(eq(operationReceipts.owner_id, ownerId), eq(operationReceipts.operation_id, operationId)));
  if (!receipt) return undefined;
  if (receipt.request_hash !== fingerprint(request)) throw new DomainError(409, "operation_conflict", "Operation ID was already used for a different request.");
  return receipt.result as T;
}
async function assertAvailableOperation(tx: Store, ownerId: string, operationId: string, permittedCheckinId?: string) {
  const [receipt] = await tx.select({ id: operationReceipts.id }).from(operationReceipts).where(and(eq(operationReceipts.owner_id, ownerId), eq(operationReceipts.operation_id, operationId)));
  const [confirmed] = await tx.select({ id: checkinSessions.id }).from(checkinSessions).where(and(eq(checkinSessions.owner_id, ownerId), eq(checkinSessions.confirmation_operation_id, operationId)));
  const [entry] = await tx.select({ id: journalEntries.id }).from(journalEntries).where(and(eq(journalEntries.owner_id, ownerId), eq(journalEntries.operation_id, operationId)));
  const [page] = await tx.select({ id: pages.id }).from(pages).where(and(eq(pages.owner_id, ownerId), eq(pages.operation_id, operationId)));
  const [capture] = await tx.select({ id: checkinSessions.id }).from(checkinSessions).where(and(eq(checkinSessions.owner_id, ownerId), eq(checkinSessions.operation_id, operationId)));
  if (receipt || entry || page || capture || (confirmed && confirmed.id !== permittedCheckinId)) throw new DomainError(409, "operation_conflict", "Operation ID is already used. Use a new operation ID for a new action.");
}
async function recordOperation<T extends object>(tx: Store, ownerId: string, operationId: string, request: unknown, result: T): Promise<T> {
  await tx.insert(operationReceipts).values({ id: id(), owner_id: ownerId, operation_id: operationId, request_hash: fingerprint(request), result: result as Record<string, unknown>, created_at: now() });
  return result;
}
async function readPage(tx: Store, ownerId: string, pageId: string) {
  validate(recordIdSchema, pageId);
  const [page] = await tx.select().from(pages).where(and(eq(pages.id, pageId), eq(pages.owner_id, ownerId), isNull(pages.archived_at)));
  if (!page) throw missing();
  return page;
}
export async function getPage(db: Database, ownerId: string, pageId: string) { return publicPage(await readPage(db, ownerId, pageId)); }
const pageCursorSchema = z.object({ id: recordIdSchema }).strict();
function decodeCursor<T>(schema: z.ZodType<T>, value: string): T {
  let decoded: unknown;
  try { decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf8")); } catch { throw new DomainError(422, "invalid_cursor", "Cursor is invalid."); }
  return validate(schema, decoded);
}
const encodeCursor = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
export async function listPages(db: Database, ownerId: string, input: z.input<typeof pageQuerySchema> = {}) {
  const data = validate(pageQuerySchema, input);
  const filters = [eq(pages.owner_id, ownerId), isNull(pages.archived_at)];
  if (data.cursor) filters.push(lt(pages.id, decodeCursor(pageCursorSchema, data.cursor).id));
  const rows = await db.select().from(pages).where(and(...filters)).orderBy(desc(pages.id)).limit(data.limit + 1);
  const result = rows.slice(0, data.limit).map(publicPage);
  return { pages: result, next_cursor: rows.length > data.limit ? encodeCursor({ id: result.at(-1)!.id }) : null };
}
export async function createPage(db: Database, ownerId: string, input: z.infer<typeof pageCreateSchema>) {
  const data = validate(pageCreateSchema, input);
  const request = { kind: "page_create", input: data };
  return write(db, async (tx) => {
    const replay = await lookupOperation<Page>(tx, ownerId, data.operation_id, request);
    if (replay) return replay;
    await assertAvailableOperation(tx, ownerId, data.operation_id);
    const timestamp = now();
    const [page] = await tx.insert(pages).values({ id: id(), owner_id: ownerId, title: data.title, content: data.content, operation_id: data.operation_id, creation_hash: fingerprint(data), created_at: timestamp, updated_at: timestamp }).returning();
    return recordOperation(tx, ownerId, data.operation_id, request, publicPage(page!));
  });
}
export async function patchPage(db: Database, ownerId: string, pageId: string, input: z.infer<typeof pagePatchSchema>) {
  validate(recordIdSchema, pageId);
  const data = validate(pagePatchSchema, input);
  const request = { kind: "page_patch", page_id: pageId, input: data };
  return write(db, async (tx) => {
    const replay = await lookupOperation<Page>(tx, ownerId, data.operation_id, request);
    if (replay) return replay;
    await assertAvailableOperation(tx, ownerId, data.operation_id);
    const page = await readPage(tx, ownerId, pageId);
    if (page.revision !== data.expected_revision) throw conflict();
    const [updated] = await tx.update(pages).set({ title: data.title ?? page.title, content: data.content ?? page.content, revision: page.revision + 1, updated_at: now() }).where(and(eq(pages.id, pageId), eq(pages.owner_id, ownerId), eq(pages.revision, data.expected_revision), isNull(pages.archived_at))).returning();
    if (!updated) throw conflict();
    return recordOperation(tx, ownerId, data.operation_id, request, publicPage(updated));
  });
}
export async function archivePage(db: Database, ownerId: string, pageId: string, input: z.infer<typeof pageArchiveSchema>) {
  validate(recordIdSchema, pageId);
  const data = validate(pageArchiveSchema, input);
  const request = { kind: "page_archive", page_id: pageId, input: data };
  return write(db, async (tx) => {
    const replay = await lookupOperation<{ id: string; revision: number; archived: boolean }>(tx, ownerId, data.operation_id, request);
    if (replay) return replay;
    await assertAvailableOperation(tx, ownerId, data.operation_id);
    const page = await readPage(tx, ownerId, pageId);
    if (page.revision !== data.expected_revision) throw conflict();
    const timestamp = now();
    const [updated] = await tx.update(pages).set({ archived_at: timestamp, updated_at: timestamp, revision: page.revision + 1 }).where(and(eq(pages.id, pageId), eq(pages.owner_id, ownerId), eq(pages.revision, data.expected_revision), isNull(pages.archived_at))).returning();
    if (!updated) throw conflict();
    return recordOperation(tx, ownerId, data.operation_id, request, { id: pageId, revision: updated.revision, archived: true });
  });
}
async function readOwnedCheckin(tx: Store, ownerId: string, checkinId: string): Promise<StoredCheckin> {
  validate(recordIdSchema, checkinId);
  const [checkin] = await tx.select().from(checkinSessions).where(and(eq(checkinSessions.id, checkinId), eq(checkinSessions.owner_id, ownerId)));
  if (!checkin) throw missing();
  return checkin;
}
export async function getCheckin(db: Database, ownerId: string, checkinId: string) { return publicCheckin(await readOwnedCheckin(db, ownerId, checkinId)); }
export async function createCheckin(db: Database, ownerId: string, input: CreateCheckinInput) {
  const data = validate(createCheckinSchema, input);
  if (data.source === "atech" || data.device_id !== undefined) throw new DomainError(403, "device_not_supported", "Device pairing and Atech authentication are not implemented. Use an authenticated app check-in.");
  const request = { kind: "checkin_create", input: data };
  return write(db, async (tx) => {
    const replay = await lookupOperation<Checkin>(tx, ownerId, data.operation_id, request);
    if (replay) return replay;
    await assertAvailableOperation(tx, ownerId, data.operation_id);
    const context = await readContext(tx, ownerId);
    const timestamp = now();
    const [created] = await tx.insert(checkinSessions).values({ id: id(), owner_id: ownerId, source: "app", operation_id: data.operation_id, stage: "created", journal_date: journalDate(context.profile.timezone, new Date(timestamp)), context_revisions: Object.fromEntries(context.pages.map((p) => [p.id, p.revision])), created_at: timestamp, updated_at: timestamp }).returning();
    return recordOperation(tx, ownerId, data.operation_id, request, publicCheckin(created!));
  });
}
async function storeDraft(tx: Store, ownerId: string, checkin: StoredCheckin, draft: JournalDraft, expectedRevision: number, target?: JournalEntryResult) {
  assertOpen(checkin);
  if (checkin.draft_revision !== expectedRevision) throw conflict();
  const [updated] = await tx.update(checkinSessions).set({ draft, legacy_draft: checkin.draft && !("content" in checkin.draft) ? checkin.draft : checkin.legacy_draft, target_entry_id: target?.id ?? null, target_entry_revision: target?.revision ?? null, journal_date: target?.journal_date ?? checkin.journal_date, context_revisions: checkin.voice_context_revisions ?? checkin.context_revisions, draft_revision: checkin.draft_revision + 1, confirmation: null, confirmation_operation_id: null, stage: "draft", updated_at: now() }).where(and(eq(checkinSessions.id, checkin.id), eq(checkinSessions.owner_id, ownerId), eq(checkinSessions.draft_revision, expectedRevision))).returning();
  if (!updated) throw conflict();
  return publicCheckin(updated);
}
export async function prepareDraft(db: Database, ownerId: string, checkinId: string, input: DraftInput) {
  const data = validate(prepareDraftSchema, input);
  return write(db, async (tx) => storeDraft(tx, ownerId, await readOwnedCheckin(tx, ownerId, checkinId), data.draft, data.expected_revision));
}
export async function prepareJournalUpdate(db: Database, ownerId: string, checkinId: string, input: JournalUpdateInput) {
  const data = validate(updateDraftSchema, input);
  return write(db, async (tx) => {
    const checkin = await readOwnedCheckin(tx, ownerId, checkinId);
    assertOpen(checkin);
    const entry = await readEntry(tx, ownerId, data.entry_id);
    if (entry.revision !== data.expected_entry_revision) throw conflict();
    // The selected original user text remains immutable during saved-entry edits.
    if (data.draft.original_text !== entry.original_text) throw new DomainError(422, "original_text_immutable", "Keep the saved original_text unchanged when preparing an update.");
    return storeDraft(tx, ownerId, checkin, data.draft, data.expected_revision, entry);
  });
}
function publicConfirmation(confirmation: NonNullable<StoredCheckin["confirmation"]>) {
  return { confirmation_receipt: confirmation.receipt, operation_id: confirmation.operation_id, draft_revision: confirmation.draft_revision };
}
export async function confirmDraft(db: Database, ownerId: string, checkinId: string, input: ConfirmInput) {
  const data = validate(confirmSchema, input);
  return write(db, async (tx) => {
    const checkin = await readOwnedCheckin(tx, ownerId, checkinId);
    if (checkin.confirmation && checkin.confirmation.operation_id === data.operation_id && checkin.confirmation.draft_revision === data.draft_revision && checkin.stage !== "canceled") return publicConfirmation(checkin.confirmation);
    assertOpen(checkin);
    if (!checkin.draft) throw new DomainError(409, "draft_required", "Prepare a draft before confirming.");
    if (!("content" in checkin.draft)) throw new DomainError(409, "legacy_draft_requires_review", "Prepare and review the converted legacy draft before confirming.");
    if (checkin.draft_revision !== data.draft_revision) throw conflict();
    if (checkin.confirmation) throw new DomainError(409, "confirmation_conflict", "This revision is already confirmed. Revise the draft to change it.");
    await assertAvailableOperation(tx, ownerId, data.operation_id, checkinId);
    const confirmation = { receipt: id(), operation_id: data.operation_id, draft_revision: data.draft_revision };
    await tx.update(checkinSessions).set({ confirmation, confirmation_operation_id: data.operation_id, stage: "awaiting_confirmation", updated_at: now() }).where(and(eq(checkinSessions.id, checkinId), eq(checkinSessions.owner_id, ownerId)));
    return publicConfirmation(confirmation);
  });
}
async function entryResult(tx: Store, row: typeof journalEntries.$inferSelect): Promise<JournalEntryResult> {
  let converted: ReturnType<typeof convertLegacyJournal> | undefined;
  if (row.content === null || row.properties === null) {
    const reported = await tx.select().from(observations).where(and(eq(observations.entry_id, row.id), eq(observations.owner_id, row.owner_id)));
    const plans = await tx.select().from(dayPlans).where(and(eq(dayPlans.entry_id, row.id), eq(dayPlans.owner_id, row.owner_id)));
    converted = convertLegacyJournal(row.note, reported, plans, row.id);
  }
  return { id: row.id, owner_id: row.owner_id, title: row.title, original_text: row.original_text, content: row.content ?? converted!.content, properties: row.properties ?? converted!.properties, journal_date: row.journal_date, source: row.source, session_id: row.session_id, operation_id: row.operation_id, context_revisions: row.context_revisions, revision: row.revision, created_at: row.created_at, updated_at: row.updated_at };
}
async function readEntry(tx: Store, ownerId: string, entryId: string) {
  validate(recordIdSchema, entryId);
  const [entry] = await tx.select().from(journalEntries).where(and(eq(journalEntries.id, entryId), eq(journalEntries.owner_id, ownerId)));
  if (!entry) throw missing();
  return entryResult(tx, entry);
}
export async function getJournalEntry(db: Database, ownerId: string, entryId: string) { return readEntry(db, ownerId, entryId); }
export async function patchJournalEntry(db: Database, ownerId: string, entryId: string, input: JournalPatchInput) {
  validate(recordIdSchema, entryId);
  const data = validate(journalPatchSchema, input);
  const request = { kind: "journal_patch", entry_id: entryId, input: data };
  return write(db, async (tx) => {
    const replay = await lookupOperation<JournalEntryResult>(tx, ownerId, data.operation_id, request);
    if (replay) return replay;
    await assertAvailableOperation(tx, ownerId, data.operation_id);
    const entry = await readEntry(tx, ownerId, entryId);
    if (entry.revision !== data.expected_revision) throw conflict();
    const [updated] = await tx.update(journalEntries).set({ title: data.title ?? entry.title, content: data.content ?? entry.content, properties: data.properties ?? entry.properties, revision: entry.revision + 1, updated_at: now() }).where(and(eq(journalEntries.id, entryId), eq(journalEntries.owner_id, ownerId), eq(journalEntries.revision, data.expected_revision))).returning();
    if (!updated) throw conflict();
    return recordOperation(tx, ownerId, data.operation_id, request, await entryResult(tx, updated));
  });
}
export async function commitCheckin(db: Database, ownerId: string, checkinId: string, input: CommitInput) {
  validate(recordIdSchema, checkinId);
  const data = validate(commitSchema, input);
  const request = { kind: "checkin_commit", checkin_id: checkinId, input: data };
  return write(db, async (tx) => {
    const checkin = await readOwnedCheckin(tx, ownerId, checkinId);
    const replay = await lookupOperation<JournalEntryResult>(tx, ownerId, data.operation_id, request);
    if (replay) return replay;
    const confirmation = checkin.confirmation;
    if (!confirmation || confirmation.receipt !== data.confirmation_receipt || confirmation.operation_id !== data.operation_id || confirmation.draft_revision !== checkin.draft_revision) throw new DomainError(409, "confirmation_required", "Confirm this draft revision and operation ID before saving.");
    if (checkin.stage === "saved" && checkin.saved_entry_id) return readEntry(tx, ownerId, checkin.saved_entry_id);
    assertOpen(checkin);
    if (checkin.stage !== "awaiting_confirmation" || !checkin.draft || !("content" in checkin.draft)) throw new DomainError(409, "confirmation_required", "The current generic draft must be reviewed and confirmed.");
    await assertAvailableOperation(tx, ownerId, data.operation_id, checkinId);
    const draft = checkin.draft;
    const timestamp = now();
    let entryId: string;
    if (checkin.target_entry_id) {
      const target = await readEntry(tx, ownerId, checkin.target_entry_id);
      if (target.revision !== checkin.target_entry_revision) throw conflict();
      if (target.original_text !== draft.original_text) throw new DomainError(409, "original_text_immutable", "Saved original_text must remain unchanged.");
      const [updated] = await tx.update(journalEntries).set({ title: draft.title, content: draft.content, properties: draft.properties, revision: target.revision + 1, context_revisions: checkin.context_revisions, updated_at: timestamp }).where(and(eq(journalEntries.id, target.id), eq(journalEntries.owner_id, ownerId), eq(journalEntries.revision, checkin.target_entry_revision!))).returning();
      if (!updated) throw conflict();
      entryId = target.id;
    } else {
      entryId = id();
      await tx.insert(journalEntries).values({ id: entryId, owner_id: ownerId, journal_date: checkin.journal_date, title: draft.title, original_text: draft.original_text, content: draft.content, properties: draft.properties, note: "", source: checkin.source, session_id: checkinId, operation_id: data.operation_id, context_revisions: checkin.context_revisions, created_at: timestamp, updated_at: timestamp });
    }
    await tx.update(checkinSessions).set({ stage: "saved", saved_entry_id: entryId, updated_at: timestamp }).where(and(eq(checkinSessions.id, checkinId), eq(checkinSessions.owner_id, ownerId)));
    return recordOperation(tx, ownerId, data.operation_id, request, await readEntry(tx, ownerId, entryId));
  });
}
export async function cancelCheckin(db: Database, ownerId: string, checkinId: string) {
  return write(db, async (tx) => {
    const checkin = await readOwnedCheckin(tx, ownerId, checkinId);
    if (checkin.stage === "canceled") return publicCheckin(checkin);
    assertOpen(checkin);
    const [updated] = await tx.update(checkinSessions).set({ stage: "canceled", confirmation: null, updated_at: now() }).where(and(eq(checkinSessions.id, checkinId), eq(checkinSessions.owner_id, ownerId))).returning();
    return publicCheckin(updated!);
  });
}
const journalCursorSchema = z.object({ journal_date: dateSchema, id: recordIdSchema }).strict();
export async function listJournal(db: Database, ownerId: string, input: z.input<typeof journalQuerySchema> = {}) {
  const data = validate(journalQuerySchema, input);
  const filters = [eq(journalEntries.owner_id, ownerId)];
  if (data.from) filters.push(gte(journalEntries.journal_date, data.from));
  if (data.to) filters.push(lte(journalEntries.journal_date, data.to));
  if (data.cursor) {
    const cursor = decodeCursor(journalCursorSchema, data.cursor);
    filters.push(or(lt(journalEntries.journal_date, cursor.journal_date), and(eq(journalEntries.journal_date, cursor.journal_date), lt(journalEntries.id, cursor.id)))!);
  }
  const rows = await db.select().from(journalEntries).where(and(...filters)).orderBy(desc(journalEntries.journal_date), desc(journalEntries.id)).limit(data.limit + 1);
  const entries: JournalEntryResult[] = [];
  for (const row of rows.slice(0, data.limit)) entries.push(await entryResult(db, row));
  return { entries, next_cursor: rows.length > data.limit ? encodeCursor({ journal_date: entries.at(-1)!.journal_date, id: entries.at(-1)!.id }) : null };
}
export async function getVoiceContext(db: Database, ownerId: string, checkinId: string) {
  return write(db, async (tx) => {
    const checkin = await readOwnedCheckin(tx, ownerId, checkinId);
    assertOpen(checkin);
    const context = await readContext(tx, ownerId);
    const revisions = Object.fromEntries(context.pages.map((p) => [p.id, p.revision]));
    const [updated] = await tx.update(checkinSessions).set({ voice_context_revisions: revisions, updated_at: now() }).where(and(eq(checkinSessions.id, checkinId), eq(checkinSessions.owner_id, ownerId))).returning();
    const recent = await tx.select().from(journalEntries).where(eq(journalEntries.owner_id, ownerId)).orderBy(desc(journalEntries.created_at), desc(journalEntries.id)).limit(3);
    const recentEntries: JournalEntryResult[] = [];
    for (const row of recent) recentEntries.push(await entryResult(tx, row));
    return { checkin: publicCheckin(updated!), ...context, context_revisions: revisions, recent_journal_entries: recentEntries };
  });
}
