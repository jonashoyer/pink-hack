import { randomUUID, createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import type { Database } from "@backend/db";
import { contextPages, pages, journalEntries, checkinSessions, observations, dayPlans, operationReceipts } from "@backend/db/schema/journal";
import type { BlockContent, PageSection, LegacyJournalDraft, JournalDraft, JournalProperties, JsonValue, PlanItem, JournalEntryResult } from "@backend/db/schema/journal";
import { journalDraftSchema, blockContentSchema, propertiesSchema } from "./contracts";
import { DomainError } from "./errors";
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
// Explicit administrator/startup migration. It never runs implicitly on reads.
// All owners are converted in one transaction; original legacy records remain.
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
      if (entry.content !== null && entry.properties !== null) continue;
      const reported = await tx.select().from(observations).where(and(eq(observations.owner_id, entry.owner_id), eq(observations.entry_id, entry.id)));
      const plans = await tx.select().from(dayPlans).where(and(eq(dayPlans.owner_id, entry.owner_id), eq(dayPlans.entry_id, entry.id)));
      const converted = convertLegacyJournal(entry.note, reported, plans, entry.id);
      const content = entry.content ?? converted.content;
      const properties = entry.properties ?? converted.properties;
      assertConvertible(content, properties);
      await tx.update(journalEntries).set({ content, properties }).where(and(eq(journalEntries.id, entry.id), eq(journalEntries.owner_id, entry.owner_id)));
      counts.journal_entries++;
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
      const [entry] = await tx.select().from(journalEntries).where(and(eq(journalEntries.id, checkin.saved_entry_id), eq(journalEntries.owner_id, checkin.owner_id)));
      if (!entry || entry.content === null || entry.properties === null) throw new DomainError(409, "legacy_conversion_invalid", "Legacy saved check-in references an unavailable entry. No records were converted.");
      const { note: _note, ...rest } = entry;
      const result: JournalEntryResult = { ...rest, content: entry.content, properties: entry.properties };
      await tx.insert(operationReceipts).values({ id: randomUUID(), owner_id: checkin.owner_id, operation_id: confirmation.operation_id, request_hash: hash, result, created_at: entry.created_at });
    }
    return counts;
  });
}
