import { z } from "zod";
import { DomainError } from "./errors";

const shortText = z.string().trim().min(1).max(200);
export const recordIdSchema = z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/);
export const operationIdSchema = recordIdSchema;
const revision = z.number().int().min(0).max(2147483646);
const uniqueIds = (items: { id: string }[]) => new Set(items.map((item) => item.id)).size === items.length;
export const sectionSchema = z.discriminatedUnion("type", [
  z.object({ id: recordIdSchema, title: shortText, type: z.literal("text"), body: z.string().max(10000) }).strict(),
  z.object({ id: recordIdSchema, title: shortText, type: z.literal("checklist"), items: z.array(z.object({ id: recordIdSchema, text: z.string().min(1).max(1000), checked: z.boolean() }).strict()).max(50).refine(uniqueIds, "Item IDs must be unique") }).strict(),
]);
export const pagePatchSchema = z.object({ expected_revision: revision, title: shortText.optional(), sections: z.array(sectionSchema).max(20).refine(uniqueIds, "Section IDs must be unique") }).strict();
export const profilePatchSchema = z.object({ expected_revision: revision, timezone: z.string().min(1).max(100).refine((value) => { try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; } }, "Invalid timezone").optional(), allow_medical_voice_context: z.boolean().optional() }).strict().refine((v) => v.timezone !== undefined || v.allow_medical_voice_context !== undefined, "Supply a profile field");
export const observationSchema = z.object({
  metric: z.enum(["energy", "mood", "sleep_hours", "symptom"]), value: z.union([z.string().min(1).max(200), z.number().finite()]),
  unit: z.string().min(1).max(40).optional(), observed_at: z.iso.datetime().optional(), symptom_name: shortText.optional(), note: z.string().max(2000).optional(),
}).strict().superRefine((v, c) => {
  if (v.metric === "energy" && (typeof v.value !== "number" || !Number.isInteger(v.value) || v.value < 1 || v.value > 5)) c.addIssue({ code: "custom", message: "Energy must be an integer self-report from 1 to 5" });
  if (v.metric === "sleep_hours" && (typeof v.value !== "number" || v.value < 0 || v.value > 24)) c.addIssue({ code: "custom", message: "Sleep hours must be between 0 and 24" });
  if (v.metric === "mood" && typeof v.value !== "string") c.addIssue({ code: "custom", message: "Mood must be text" });
  if (v.metric === "symptom" && typeof v.value === "number" && (v.value < 0 || v.value > 10)) c.addIssue({ code: "custom", message: "Numeric symptom severity must be between 0 and 10" });
  if (v.metric === "symptom" && !v.symptom_name) c.addIssue({ code: "custom", message: "Symptom name is required" });
});
export const energyLabels = { 1: "Very low", 2: "Low", 3: "Moderate", 4: "High", 5: "Very high" } as const;
export const planItemSchema = z.object({ id: recordIdSchema, text: z.string().min(1).max(1000), timing: shortText.optional(), rationale: z.string().max(2000).optional(), smaller_alternative: z.string().max(1000).optional(), state: z.enum(["active", "deferred", "removed"]) }).strict();
export const journalDraftSchema = z.object({ title: shortText, original_text: z.string().max(30000), note: z.string().max(30000), observations: z.array(observationSchema).max(50), proposed_plan: z.object({ items: z.array(planItemSchema).min(1).max(20).refine(uniqueIds, "Plan item IDs must be unique") }).strict().nullable() }).strict();
export const createCheckinSchema = z.object({ source: z.enum(["app", "atech"]), device_id: recordIdSchema.optional(), operation_id: operationIdSchema }).strict();
export const prepareDraftSchema = z.object({ expected_revision: revision, draft: journalDraftSchema }).strict();
export const confirmSchema = z.object({ draft_revision: revision, action: z.literal("save"), operation_id: operationIdSchema, plan_state: z.enum(["draft", "accepted"]).default("draft"), replace_plan_id: recordIdSchema.optional() }).strict();
export const cancelSchema = z.object({}).strict();
export const commitSchema = z.object({ confirmation_receipt: recordIdSchema, operation_id: operationIdSchema }).strict();
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((v) => { const d = new Date(`${v}T00:00:00Z`); return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v; }, "Invalid date");
export const journalQuerySchema = z.object({ from: dateSchema.optional(), to: dateSchema.optional(), cursor: z.string().max(1000).optional(), limit: z.coerce.number().int().min(1).max(100).default(30) }).strict().refine((v) => !v.from || !v.to || v.from <= v.to, "Invalid date range").refine((v) => !v.from || !v.to || new Date(v.to).valueOf() - new Date(v.from).valueOf() <= 366 * 86400000, "Date range exceeds 366 days");
export function validate<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new DomainError(422, "invalid_input", "Input does not match the required schema.");
  return parsed.data;
}
export type DraftInput = z.infer<typeof prepareDraftSchema>;
export type ConfirmInput = z.infer<typeof confirmSchema>;
export type CommitInput = z.infer<typeof commitSchema>;
export type CreateCheckinInput = z.infer<typeof createCheckinSchema>;
