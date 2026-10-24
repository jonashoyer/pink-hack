import { randomUUID } from "node:crypto";
import { and, eq, desc, gte, lte, lt, or } from "drizzle-orm";
import type { Database } from "@backend/db";
import { profiles, contextPages, checkinSessions, journalEntries, observations, dayPlans } from "@backend/db/schema/journal";
import { DomainError } from "./errors";
import { validate, createCheckinSchema, prepareDraftSchema, confirmSchema, commitSchema, profilePatchSchema, pagePatchSchema, journalQuerySchema, dateSchema, recordIdSchema } from "./contracts";
import type { CreateCheckinInput, DraftInput, ConfirmInput, CommitInput } from "./contracts";
import { z } from "zod";

export * from "./contracts";
export { DomainError } from "./errors";
type Store = Pick<Database, "select" | "insert" | "update">;
export type Checkin = typeof checkinSessions.$inferSelect;
const now = () => new Date().toISOString();
const id = () => randomUUID();
const missing = () => new DomainError(404, "not_found", "Record was not found.");
const conflict = () => new DomainError(409, "revision_conflict", "Revision changed. Reload the record before retrying.");
function assertOpen(checkin: Checkin) {
  if (checkin.stage === "saved" || checkin.stage === "canceled") throw new DomainError(409, "checkin_closed", "Saved and canceled check-ins cannot be changed.");
}
async function write<T>(db: Database, fn: (tx: Store) => Promise<T>): Promise<T> {
  try { return await db.transaction(fn); }
  catch (error) {
    if (error instanceof DomainError) throw error;
    throw new DomainError(503, "storage_unavailable", "Storage failed. Reload the check-in and retry with the same operation ID.", true);
  }
}
export function journalDate(timezone: string, at = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(at);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
async function ensureContext(db: Store, ownerId: string) {
  const timestamp = now();
  await db.insert(profiles).values({ owner_id: ownerId, updated_at: timestamp }).onConflictDoNothing();
  for (const kind of ["personal_needs", "medical_needs"] as const) {
    await db.insert(contextPages).values({ id: id(), owner_id: ownerId, kind, title: kind === "personal_needs" ? "Personal needs" : "Medical needs", sections: [], updated_at: timestamp }).onConflictDoNothing();
  }
  const [profile] = await db.select().from(profiles).where(eq(profiles.owner_id, ownerId));
  if (!profile) throw missing();
  const pages = await db.select().from(contextPages).where(eq(contextPages.owner_id, ownerId)).orderBy(contextPages.kind);
  return { profile, pages };
}
export async function getContext(db: Database, ownerId: string) {
  return write(db, (tx) => ensureContext(tx, ownerId));
}
export async function patchProfile(db: Database, ownerId: string, input: z.infer<typeof profilePatchSchema>) {
  const data = validate(profilePatchSchema, input);
  return write(db, async (tx) => {
    const { profile } = await ensureContext(tx, ownerId);
    if (profile.revision !== data.expected_revision) throw conflict();
    const [updated] = await tx.update(profiles).set({ ...(data.timezone !== undefined ? { timezone: data.timezone } : {}), ...(data.allow_medical_voice_context !== undefined ? { allow_medical_voice_context: data.allow_medical_voice_context } : {}), revision: profile.revision + 1, updated_at: now() }).where(and(eq(profiles.owner_id, ownerId), eq(profiles.revision, data.expected_revision))).returning();
    if (!updated) throw conflict();
    return updated;
  });
}
export async function patchPage(db: Database, ownerId: string, pageId: string, input: z.infer<typeof pagePatchSchema>) {
  validate(recordIdSchema, pageId);
  const data = validate(pagePatchSchema, input);
  return write(db, async (tx) => {
    const [page] = await tx.select().from(contextPages).where(and(eq(contextPages.id, pageId), eq(contextPages.owner_id, ownerId)));
    if (!page) throw missing();
    if (page.revision !== data.expected_revision) throw conflict();
    const [updated] = await tx.update(contextPages).set({ sections: data.sections, title: data.title ?? page.title, revision: page.revision + 1, updated_at: now() }).where(and(eq(contextPages.id, pageId), eq(contextPages.owner_id, ownerId), eq(contextPages.revision, data.expected_revision))).returning();
    if (!updated) throw conflict();
    return updated;
  });
}
async function readOwnedCheckin(db: Store, ownerId: string, checkinId: string): Promise<Checkin> {
  validate(recordIdSchema, checkinId);
  const [checkin] = await db.select().from(checkinSessions).where(and(eq(checkinSessions.id, checkinId), eq(checkinSessions.owner_id, ownerId)));
  if (!checkin) throw missing();
  return checkin;
}
export async function getCheckin(db: Database, ownerId: string, checkinId: string) {
  return readOwnedCheckin(db, ownerId, checkinId);
}
export async function createCheckin(db: Database, ownerId: string, input: CreateCheckinInput) {
  const data = validate(createCheckinSchema, input);
  if (data.source === "atech" || data.device_id !== undefined) throw new DomainError(403, "device_not_supported", "Device pairing and Atech authentication are not implemented. Use an authenticated app check-in.");
  return write(db, async (tx) => {
    const [existing] = await tx.select().from(checkinSessions).where(and(eq(checkinSessions.owner_id, ownerId), eq(checkinSessions.operation_id, data.operation_id)));
    if (existing) return existing;
    const { profile, pages } = await ensureContext(tx, ownerId);
    const timestamp = now();
    const [created] = await tx.insert(checkinSessions).values({ id: id(), owner_id: ownerId, source: "app", operation_id: data.operation_id, stage: "created", journal_date: journalDate(profile.timezone, new Date(timestamp)), context_revisions: Object.fromEntries(pages.map((p) => [p.id, p.revision])), created_at: timestamp, updated_at: timestamp }).returning();
    return created!;
  });
}
export async function prepareDraft(db: Database, ownerId: string, checkinId: string, input: DraftInput) {
  const data = validate(prepareDraftSchema, input);
  return write(db, async (tx) => {
    const checkin = await readOwnedCheckin(tx, ownerId, checkinId);
    assertOpen(checkin);
    if (checkin.draft_revision !== data.expected_revision) throw conflict();
    const [updated] = await tx.update(checkinSessions).set({ draft: data.draft, context_revisions: checkin.voice_context_revisions ?? checkin.context_revisions, draft_revision: checkin.draft_revision + 1, confirmation: null, confirmation_operation_id: null, stage: "draft", updated_at: now() }).where(and(eq(checkinSessions.id, checkinId), eq(checkinSessions.owner_id, ownerId), eq(checkinSessions.draft_revision, data.expected_revision))).returning();
    if (!updated) throw conflict();
    return updated;
  });
}
function sameConfirmation(a: NonNullable<Checkin["confirmation"]>, b: ConfirmInput) {
  return a.operation_id === b.operation_id && a.draft_revision === b.draft_revision && a.plan_state === b.plan_state && a.replace_plan_id === b.replace_plan_id;
}
export async function confirmDraft(db: Database, ownerId: string, checkinId: string, input: ConfirmInput) {
  const data = validate(confirmSchema, input);
  return write(db, async (tx) => {
    const checkin = await readOwnedCheckin(tx, ownerId, checkinId);
    if (checkin.confirmation && sameConfirmation(checkin.confirmation, data) && checkin.stage !== "canceled") return checkin.confirmation;
    assertOpen(checkin);
    if (!checkin.draft) throw new DomainError(409, "draft_required", "Prepare a draft before confirming.");
    if (checkin.draft_revision !== data.draft_revision) throw conflict();
    if (checkin.confirmation) throw new DomainError(409, "confirmation_conflict", "This revision already has a confirmation. Revise the draft to change it.");
    if (!checkin.draft.proposed_plan && (data.plan_state === "accepted" || data.replace_plan_id)) throw new DomainError(422, "invalid_plan_confirmation", "No proposed plan is available to accept.");
    if (data.replace_plan_id && data.plan_state !== "accepted") throw new DomainError(422, "invalid_plan_confirmation", "Replacement requires accepting the proposed plan.");
    const [existingEntry] = await tx.select({ id: journalEntries.id }).from(journalEntries).where(and(eq(journalEntries.owner_id, ownerId), eq(journalEntries.operation_id, data.operation_id)));
    const [otherConfirmation] = await tx.select({ id: checkinSessions.id }).from(checkinSessions).where(and(eq(checkinSessions.owner_id, ownerId), eq(checkinSessions.confirmation_operation_id, data.operation_id)));
    if (existingEntry || (otherConfirmation && otherConfirmation.id !== checkinId)) throw new DomainError(409, "operation_conflict", "Save operation ID is already used by another check-in.");
    const confirmation = { receipt: id(), operation_id: data.operation_id, draft_revision: data.draft_revision, plan_state: data.plan_state, ...(data.replace_plan_id ? { replace_plan_id: data.replace_plan_id } : {}) };
    await tx.update(checkinSessions).set({ confirmation, confirmation_operation_id: data.operation_id, stage: "awaiting_confirmation", updated_at: now() }).where(and(eq(checkinSessions.id, checkinId), eq(checkinSessions.owner_id, ownerId)));
    return confirmation;
  });
}
async function readEntry(db: Store, ownerId: string, entryId: string) {
  const [entry] = await db.select().from(journalEntries).where(and(eq(journalEntries.id, entryId), eq(journalEntries.owner_id, ownerId)));
  if (!entry) throw missing();
  return { ...entry, observations: await db.select().from(observations).where(and(eq(observations.entry_id, entryId), eq(observations.owner_id, ownerId))), day_plans: await db.select().from(dayPlans).where(and(eq(dayPlans.entry_id, entryId), eq(dayPlans.owner_id, ownerId))) };
}
export async function commitCheckin(db: Database, ownerId: string, checkinId: string, input: CommitInput) {
  const data = validate(commitSchema, input);
  return write(db, async (tx) => {
    const checkin = await readOwnedCheckin(tx, ownerId, checkinId);
    const confirmation = checkin.confirmation;
    if (!confirmation || confirmation.receipt !== data.confirmation_receipt || confirmation.operation_id !== data.operation_id || confirmation.draft_revision !== checkin.draft_revision) throw new DomainError(409, "confirmation_required", "Confirm the current draft revision with this operation ID before saving.");
    if (checkin.stage === "saved" && checkin.saved_entry_id) return readEntry(tx, ownerId, checkin.saved_entry_id);
    assertOpen(checkin);
    if (checkin.stage !== "awaiting_confirmation" || !checkin.draft) throw new DomainError(409, "confirmation_required", "Current draft is not confirmed.");
    const draft = checkin.draft;
    const timestamp = now();
    const entryId = id();
    if (draft.proposed_plan && confirmation.plan_state === "accepted") {
      const accepted = await tx.select().from(dayPlans).where(and(eq(dayPlans.owner_id, ownerId), eq(dayPlans.journal_date, checkin.journal_date), eq(dayPlans.state, "accepted")));
      if (accepted.length && (accepted.length !== 1 || accepted[0]!.id !== confirmation.replace_plan_id)) throw new DomainError(409, "plan_replacement_required", "An accepted plan already exists for this day. Revise and confirm with its replace_plan_id.");
      if (!accepted.length && confirmation.replace_plan_id) throw new DomainError(409, "plan_changed", "The plan to replace is no longer accepted. Revise and confirm again.");
      if (accepted.length) await tx.update(dayPlans).set({ state: "draft", revision: accepted[0]!.revision + 1, updated_at: timestamp }).where(and(eq(dayPlans.id, accepted[0]!.id), eq(dayPlans.owner_id, ownerId)));
    }
    await tx.insert(journalEntries).values({ id: entryId, owner_id: ownerId, journal_date: checkin.journal_date, title: draft.title, original_text: draft.original_text, note: draft.note, source: checkin.source, session_id: checkinId, operation_id: data.operation_id, context_revisions: checkin.context_revisions, created_at: timestamp, updated_at: timestamp });
    if (draft.observations.length) await tx.insert(observations).values(draft.observations.map((observation) => ({ id: id(), owner_id: ownerId, entry_id: entryId, metric: observation.metric, value: observation.value, unit: observation.unit, symptom_name: observation.symptom_name, note: observation.note, observed_at: observation.observed_at ?? checkin.created_at, confirmation_state: "confirmed" as const, source_reference: entryId })));
    if (draft.proposed_plan) await tx.insert(dayPlans).values({ id: id(), owner_id: ownerId, entry_id: entryId, journal_date: checkin.journal_date, source_entry_ids: [entryId], context_revisions: checkin.context_revisions, items: draft.proposed_plan.items, state: confirmation.plan_state, created_at: timestamp, updated_at: timestamp });
    await tx.update(checkinSessions).set({ stage: "saved", saved_entry_id: entryId, updated_at: timestamp }).where(and(eq(checkinSessions.id, checkinId), eq(checkinSessions.owner_id, ownerId)));
    return readEntry(tx, ownerId, entryId);
  });
}
export async function cancelCheckin(db: Database, ownerId: string, checkinId: string) {
  return write(db, async (tx) => {
    const checkin = await readOwnedCheckin(tx, ownerId, checkinId);
    if (checkin.stage === "canceled") return checkin;
    assertOpen(checkin);
    const [updated] = await tx.update(checkinSessions).set({ stage: "canceled", confirmation: null, updated_at: now() }).where(and(eq(checkinSessions.id, checkinId), eq(checkinSessions.owner_id, ownerId))).returning();
    return updated!;
  });
}
export async function getJournalEntry(db: Database, ownerId: string, entryId: string) {
  validate(recordIdSchema, entryId);
  return readEntry(db, ownerId, entryId);
}
const cursorSchema = z.object({ journal_date: dateSchema, id: recordIdSchema }).strict();
export async function listJournal(db: Database, ownerId: string, input: z.input<typeof journalQuerySchema> = {}) {
  const data = validate(journalQuerySchema, input);
  const filters = [eq(journalEntries.owner_id, ownerId)];
  if (data.from) filters.push(gte(journalEntries.journal_date, data.from));
  if (data.to) filters.push(lte(journalEntries.journal_date, data.to));
  if (data.cursor) {
    let decoded: unknown;
    try { decoded = JSON.parse(Buffer.from(data.cursor, "base64url").toString("utf8")); } catch { throw new DomainError(422, "invalid_cursor", "Cursor is invalid."); }
    const cursor = validate(cursorSchema, decoded);
    filters.push(or(lt(journalEntries.journal_date, cursor.journal_date), and(eq(journalEntries.journal_date, cursor.journal_date), lt(journalEntries.id, cursor.id)))!);
  }
  const rows = await db.select().from(journalEntries).where(and(...filters)).orderBy(desc(journalEntries.journal_date), desc(journalEntries.id)).limit(data.limit + 1);
  const entries = rows.slice(0, data.limit);
  const last = entries.at(-1);
  return { entries, next_cursor: rows.length > data.limit && last ? Buffer.from(JSON.stringify({ journal_date: last.journal_date, id: last.id })).toString("base64url") : null };
}
export async function getVoiceContext(db: Database, ownerId: string, checkinId: string) {
  return write(db, async (tx) => {
    const checkin = await readOwnedCheckin(tx, ownerId, checkinId);
    assertOpen(checkin);
    const { profile, pages } = await ensureContext(tx, ownerId);
    const permitted = pages.filter((page) => page.kind === "personal_needs" || profile.allow_medical_voice_context);
    const revisions = Object.fromEntries(permitted.map((p) => [p.id, p.revision]));
    // Pending context is separate from the existing draft's provenance.
    // Only prepareDraft attaches it to a new revision.
    const [updated] = await tx.update(checkinSessions).set({ voice_context_revisions: revisions, updated_at: now() }).where(and(eq(checkinSessions.id, checkinId), eq(checkinSessions.owner_id, ownerId))).returning();
    const recentEntries = profile.allow_medical_voice_context
      ? await tx.select().from(journalEntries).where(eq(journalEntries.owner_id, ownerId)).orderBy(desc(journalEntries.created_at), desc(journalEntries.id)).limit(10)
      : [];
    return { checkin: updated!, profile, pages: permitted, context_revisions: revisions, recent_journal_entries: recentEntries };
  });
}
