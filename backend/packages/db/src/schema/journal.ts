import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export type PageSection = { id: string; title: string; type: "text" | "checklist"; body?: string; items?: { id: string; text: string; checked: boolean }[] };
export type ReviewedObservation = { metric: "energy" | "mood" | "sleep_hours" | "symptom"; value: string | number; unit?: string; observed_at?: string; symptom_name?: string; note?: string };
export type PlanItem = { id: string; text: string; timing?: string; rationale?: string; smaller_alternative?: string; state: "active" | "deferred" | "removed" };
export type JournalDraft = { title: string; original_text: string; note: string; observations: ReviewedObservation[]; proposed_plan: { items: PlanItem[] } | null };
export type Confirmation = { receipt: string; operation_id: string; draft_revision: number; plan_state: "draft" | "accepted"; replace_plan_id?: string };
const owner = () => text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" });

export const profiles = sqliteTable("profiles", {
  owner_id: owner().primaryKey(), timezone: text("timezone").notNull().default("UTC"),
  allow_medical_voice_context: integer("allow_medical_voice_context", { mode: "boolean" }).notNull().default(false),
  revision: integer("revision").notNull().default(0), updated_at: text("updated_at").notNull(),
});
export const contextPages = sqliteTable("context_pages", {
  id: text("id").primaryKey(), owner_id: owner(), kind: text("kind", { enum: ["personal_needs", "medical_needs"] }).notNull(),
  title: text("title").notNull(), sections: text("sections", { mode: "json" }).$type<PageSection[]>().notNull(),
  revision: integer("revision").notNull().default(0), updated_at: text("updated_at").notNull(),
}, (t) => [uniqueIndex("context_owner_kind").on(t.owner_id, t.kind)]);
export const checkinSessions = sqliteTable("checkin_sessions", {
  id: text("id").primaryKey(), owner_id: owner(), source: text("source", { enum: ["app"] }).notNull(), operation_id: text("operation_id").notNull(),
  stage: text("stage", { enum: ["created", "draft", "awaiting_confirmation", "saved", "canceled"] }).notNull(),
  journal_date: text("journal_date").notNull(), draft: text("draft", { mode: "json" }).$type<JournalDraft>(),
  draft_revision: integer("draft_revision").notNull().default(0), context_revisions: text("context_revisions", { mode: "json" }).$type<Record<string, number>>().notNull(),
  voice_context_revisions: text("voice_context_revisions", { mode: "json" }).$type<Record<string, number>>(),
  confirmation_operation_id: text("confirmation_operation_id"),
  confirmation: text("confirmation", { mode: "json" }).$type<Confirmation>(), saved_entry_id: text("saved_entry_id"),
  created_at: text("created_at").notNull(), updated_at: text("updated_at").notNull(),
}, (t) => [uniqueIndex("checkin_owner_operation").on(t.owner_id, t.operation_id), uniqueIndex("checkin_confirmation_operation").on(t.owner_id, t.confirmation_operation_id)]);
export const journalEntries = sqliteTable("journal_entries", {
  id: text("id").primaryKey(), owner_id: owner(), journal_date: text("journal_date").notNull(),
  title: text("title").notNull(), original_text: text("original_text").notNull(), note: text("note").notNull(), source: text("source", { enum: ["app"] }).notNull(),
  session_id: text("session_id").notNull().references(() => checkinSessions.id, { onDelete: "cascade" }), operation_id: text("operation_id").notNull(),
  context_revisions: text("context_revisions", { mode: "json" }).$type<Record<string, number>>().notNull(), revision: integer("revision").notNull().default(1),
  created_at: text("created_at").notNull(), updated_at: text("updated_at").notNull(),
}, (t) => [uniqueIndex("entry_owner_operation").on(t.owner_id, t.operation_id), uniqueIndex("entry_session").on(t.session_id), index("entry_owner_date").on(t.owner_id, t.journal_date, t.id)]);
export const observations = sqliteTable("observations", {
  id: text("id").primaryKey(), owner_id: owner(), entry_id: text("entry_id").notNull().references(() => journalEntries.id, { onDelete: "cascade" }),
  metric: text("metric").notNull(), value: text("value", { mode: "json" }).$type<string | number>().notNull(), unit: text("unit"), symptom_name: text("symptom_name"), note: text("note"),
  observed_at: text("observed_at").notNull(), confirmation_state: text("confirmation_state", { enum: ["confirmed"] }).notNull(), source_reference: text("source_reference").notNull(), revision: integer("revision").notNull().default(1),
}, (t) => [index("observation_owner_entry").on(t.owner_id, t.entry_id)]);
export const dayPlans = sqliteTable("day_plans", {
  id: text("id").primaryKey(), owner_id: owner(), entry_id: text("entry_id").notNull().references(() => journalEntries.id, { onDelete: "cascade" }), journal_date: text("journal_date").notNull(),
  source_entry_ids: text("source_entry_ids", { mode: "json" }).$type<string[]>().notNull(), context_revisions: text("context_revisions", { mode: "json" }).$type<Record<string, number>>().notNull(),
  items: text("items", { mode: "json" }).$type<PlanItem[]>().notNull(), state: text("state", { enum: ["draft", "accepted"] }).notNull(), revision: integer("revision").notNull().default(1),
  created_at: text("created_at").notNull(), updated_at: text("updated_at").notNull(),
}, (t) => [index("plan_owner_date").on(t.owner_id, t.journal_date), uniqueIndex("plan_one_accepted_per_day").on(t.owner_id, t.journal_date).where(sql`${t.state} = 'accepted'`)]);
