import { randomUUID, createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { Database } from "@backend/db";
import { contextPages, pages, journalEntries, checkinSessions, observations, dayPlans, operationReceipts, journalDocuments } from "@backend/db/schema/journal";
import type { BlockContent, PageSection, LegacyJournalDraft, JournalDraft, JournalProperties, JsonValue, PlanItem, JournalEntryResult } from "@backend/db/schema/journal";
import { journalDraftSchema, blockContentSchema, propertiesSchema } from "./contracts";
import { DomainError } from "./errors";
import type { Store } from "./store";
import { write, fingerprint } from "./store";

function blockId(source: string, index: number) { return `legacy-${createHash("sha256").update(`${source}:${index}`).digest("hex").slice(0, 24)}`; }
export function convertLegacySections(sections: PageSection[], source = "page"): BlockContent {
  const content: BlockContent = [];
  for (const section of sections) {
    content.push({ id: blockId(source, content.length), type: "heading", props: { level: 2 }, content: section.title });
    if (section.type === "checklist") {
      for (const item of section.items ?? []) content.push({ id: blockId(source, content.length), type: "checkListItem", props: { checked: item.checked }, content: item.text });
    } else content.push({ id: blockId(source, content.length), type: "paragraph", content: section.body ?? "" });
  }
  return content;
}
type LegacyObservation = { metric: string; value: string | number; unit?: string | null; symptom_name?: string | null; note?: string | null };
type LegacyPlan = { state?: string; items: PlanItem[] };
export function convertLegacyJournal(note: string, reported: LegacyObservation[] = [], plans: LegacyPlan[] = [], source = "journal") {
  const content: BlockContent = [{ id: blockId(source, 0), type: "paragraph", content: note }];
  const properties: JournalProperties = {};
  for (const observation of reported) {
    const key = observation.metric;
    const existing = properties[key];
    properties[key] = existing === undefined ? observation.value : Array.isArray(existing) ? [...existing, observation.value] : [existing, observation.value];
    content.push({ id: blockId(source, content.length), type: "paragraph", content: `${observation.symptom_name ?? observation.metric}: ${String(observation.value)}${observation.unit ? ` ${observation.unit}` : ""}${observation.note ? `. ${observation.note}` : ""}` });
  }
  for (const plan of plans) {
    content.push({ id: blockId(source, content.length), type: "heading", props: { level: 2 }, content: `Day plan${plan.state ? ` (${plan.state}, legacy)` : ""}` });
    for (const item of plan.items) {
      content.push({ id: blockId(source, content.length), type: "bulletListItem", content: `${item.text}${item.timing ? ` (${item.timing})` : ""} [legacy state: ${item.state}]` });
      if (item.rationale) content.push({ id: blockId(source, content.length), type: "paragraph", content: item.rationale });
      if (item.smaller_alternative) content.push({ id: blockId(source, content.length), type: "paragraph", content: `Smaller alternative: ${item.smaller_alternative}` });
    }
  }
  return { content, properties };
}
export function normalizeLegacyDraft(draft: JournalDraft | LegacyJournalDraft, source = "draft"): JournalDraft {
  if ("content" in draft) return draft;
  return { title: draft.title, original_text: draft.original_text, ...convertLegacyJournal(draft.note, draft.observations, draft.proposed_plan ? [draft.proposed_plan] : [], source) };
}
export function blocksToText(content: BlockContent): string {
  const inline = (value: JsonValue | undefined): string => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(inline).join("");
    if (value && typeof value === "object") {
      if (typeof value.text === "string") return value.text;
      if (value.content !== undefined) return inline(value.content);
      if (value.rows !== undefined) return inline(value.rows);
      if (value.cells !== undefined) return inline(value.cells);
    }
    return "";
  };
  return content.map((block) => [inline(block.content), block.children ? blocksToText(block.children) : ""].filter(Boolean).join("\n")).join("\n");
}
function assertConvertible(content: BlockContent, properties: JournalProperties) {
  if (!blockContentSchema.safeParse(content).success || !propertiesSchema.safeParse(properties).success) throw new DomainError(409, "legacy_conversion_invalid", "Legacy data exceeds the flexible document limits. No records were converted; retain the original data for explicit review.");
}
export function canonicalJournalResult(row: typeof journalDocuments.$inferSelect): JournalEntryResult {
  const { legacy_entry_id: _legacy, ...result } = row;
  return result;
}
export async function copyLegacyJournalEntry(tx: Store, entry: typeof journalEntries.$inferSelect) {
  const [existing] = await tx.select().from(journalDocuments).where(eq(journalDocuments.id, entry.id));
  if (existing) {
    if (existing.owner_id !== entry.owner_id) throw new DomainError(409, "legacy_identity_conflict", "Legacy journal identity conflicts with a canonical record.");
    return canonicalJournalResult(existing);
  }
  const reported = await tx.select().from(observations).where(and(eq(observations.owner_id, entry.owner_id), eq(observations.entry_id, entry.id)));
  const plans = await tx.select().from(dayPlans).where(and(eq(dayPlans.owner_id, entry.owner_id), eq(dayPlans.entry_id, entry.id)));
  const converted = convertLegacyJournal(entry.note, reported, plans, entry.id);
  const content = entry.content ?? converted.content;
  const properties = entry.properties ?? converted.properties;
  assertConvertible(content, properties);
  const [capture] = await tx.select({ device_id: checkinSessions.device_id }).from(checkinSessions).where(and(eq(checkinSessions.id, entry.session_id), eq(checkinSessions.owner_id, entry.owner_id)));
  const [copied] = await tx.insert(journalDocuments).values({ id: entry.id, owner_id: entry.owner_id, title: entry.title, original_text: entry.original_text, content, properties, source: entry.source, device_id: capture?.device_id ?? null, journal_date: entry.journal_date, capture_id: entry.session_id, session_id: entry.session_id, legacy_entry_id: entry.id, operation_id: entry.operation_id, context_revisions: entry.context_revisions, revision: entry.revision, created_at: entry.created_at, updated_at: entry.updated_at }).returning();
  return canonicalJournalResult(copied!);
}
// Explicit administrator/startup migration. Legacy journal rows are copied,
// never overwritten or deleted. Existing canonical corrections always win.
export async function migrateLegacyData(db: Database) {
  return write(db, async (tx) => {
    const counts = { pages: 0, journal_entries: 0, pending_drafts: 0 };
    for (const legacy of await tx.select().from(contextPages)) {
      const [existing] = await tx.select({ id: pages.id }).from(pages).where(and(eq(pages.owner_id, legacy.owner_id), eq(pages.legacy_page_id, legacy.id)));
      if (existing) continue;
      const content = convertLegacySections(legacy.sections, legacy.id);
      assertConvertible(content, {});
      await tx.insert(pages).values({ id: randomUUID(), owner_id: legacy.owner_id, title: legacy.title, content, revision: legacy.revision, operation_id: `legacy-${legacy.id}`, creation_hash: fingerprint({ title: legacy.title, content }), legacy_page_id: legacy.id, created_at: legacy.updated_at, updated_at: legacy.updated_at });
      counts.pages++;
    }
    for (const entry of await tx.select().from(journalEntries)) {
      const [existing] = await tx.select({ id: journalDocuments.id }).from(journalDocuments).where(and(eq(journalDocuments.id, entry.id), eq(journalDocuments.owner_id, entry.owner_id)));
      await copyLegacyJournalEntry(tx, entry);
      if (!existing) counts.journal_entries++;
    }
    for (const checkin of await tx.select().from(checkinSessions)) {
      if (!checkin.draft || "content" in checkin.draft || checkin.stage === "saved" || checkin.stage === "canceled") continue;
      const draft = normalizeLegacyDraft(checkin.draft, checkin.id);
      if (!journalDraftSchema.safeParse(draft).success) throw new DomainError(409, "legacy_conversion_invalid", "Legacy draft requires explicit review. No records were converted.");
      await tx.update(checkinSessions).set({ legacy_draft: checkin.draft, draft, draft_revision: checkin.draft_revision + 1, confirmation: null, confirmation_operation_id: null, stage: "draft" }).where(and(eq(checkinSessions.id, checkin.id), eq(checkinSessions.owner_id, checkin.owner_id)));
      counts.pending_drafts++;
    }
    // Give pre-upgrade saved confirmations a stable generic replay snapshot.
    for (const checkin of await tx.select().from(checkinSessions)) {
      if (checkin.stage !== "saved" || !checkin.saved_entry_id || !checkin.confirmation) continue;
      const confirmation = checkin.confirmation;
      const request = { kind: "checkin_commit", checkin_id: checkin.id, input: { confirmation_receipt: confirmation.receipt, operation_id: confirmation.operation_id } };
      const hash = fingerprint(request);
      const [existing] = await tx.select().from(operationReceipts).where(and(eq(operationReceipts.owner_id, checkin.owner_id), eq(operationReceipts.operation_id, confirmation.operation_id)));
      if (existing) {
        if (existing.request_hash !== hash) throw new DomainError(409, "legacy_operation_conflict", "Legacy save operation conflicts with an existing receipt. No records were converted.");
        continue;
      }
      const [entry] = await tx.select().from(journalDocuments).where(and(eq(journalDocuments.id, checkin.saved_entry_id), eq(journalDocuments.owner_id, checkin.owner_id)));
      if (!entry) throw new DomainError(409, "legacy_conversion_invalid", "Legacy saved check-in references an unavailable entry. No records were converted.");
      const result = canonicalJournalResult(entry);
      await tx.insert(operationReceipts).values({ id: randomUUID(), owner_id: checkin.owner_id, operation_id: confirmation.operation_id, request_hash: hash, result, created_at: entry.created_at });
    }
    return counts;
  });
}
