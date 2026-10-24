import { z } from "zod";
import type { JsonValue, PartialBlock } from "@backend/db/schema/journal";
import { DomainError } from "./errors";

export const recordIdSchema = z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/);
export const operationIdSchema = recordIdSchema;
const revision = z.number().int().min(0).max(2147483646);
const title = z.string().trim().min(1).max(200);
const safeName = z.string().min(1).max(100).refine((v) => !["__proto__", "prototype", "constructor"].includes(v));
const scalar = z.union([z.string().max(10000), z.number().finite(), z.boolean(), z.null()]);
const jsonCache = new Map<number, z.ZodType<JsonValue>>();
function jsonAtDepth(depth: number): z.ZodType<JsonValue> {
  const cached = jsonCache.get(depth);
  if (cached) return cached;
  const schema: z.ZodType<JsonValue> = depth === 0 ? scalar : z.union([
    scalar, z.array(jsonAtDepth(depth - 1)).max(200),
    z.record(safeName, jsonAtDepth(depth - 1)).refine((v) => Object.keys(v).length <= 100),
  ]);
  jsonCache.set(depth, schema);
  return schema;
}
const richJson = jsonAtDepth(10);
function blockAtDepth(depth: number): z.ZodType<PartialBlock> {
  return z.object({
    id: recordIdSchema.optional(), type: z.string().min(1).max(100).optional(),
    props: z.record(safeName, richJson).optional(),
    content: z.union([z.string().max(30000), z.array(richJson).max(500), z.record(safeName, richJson)]).optional(),
    children: depth === 0 ? z.array(z.never()).max(0).optional() : z.array(blockAtDepth(depth - 1)).max(500).optional(),
  }).strict();
}
export const blockContentSchema = z.array(blockAtDepth(7)).max(500).superRefine((blocks, ctx) => {
  const seen = new Set<string>();
  let total = 0;
  const walk = (list: PartialBlock[]) => {
    for (const block of list) {
      total++;
      if (block.id) {
        if (seen.has(block.id)) ctx.addIssue({ code: "custom", message: "Block IDs must be unique" });
        seen.add(block.id);
      }
      if (block.children) walk(block.children);
    }
  };
  walk(blocks);
  if (total > 1000 || Buffer.byteLength(JSON.stringify(blocks), "utf8") > 200000) ctx.addIssue({ code: "custom", message: "Document exceeds content limits" });
});
export const propertiesSchema = z.record(safeName, z.union([scalar, z.array(scalar).max(100)])).superRefine((v, c) => {
  if (Object.keys(v).length > 100 || Buffer.byteLength(JSON.stringify(v), "utf8") > 50000) c.addIssue({ code: "custom", message: "Properties exceed limits" });
});
export const journalDraftSchema = z.object({ title, original_text: z.string().max(30000), content: blockContentSchema, properties: propertiesSchema }).strict();
const editable = { title: title.optional(), content: blockContentSchema.optional(), properties: propertiesSchema.optional(), original_text: z.string().max(30000).optional() };
export const journalPatchSchema = z.object({ expected_revision: revision, operation_id: operationIdSchema, title: editable.title, content: editable.content, properties: editable.properties }).strict().refine((v) => ["title", "content", "properties"].some((key) => v[key as keyof typeof v] !== undefined), "Supply an editable field");
export const updateDraftSchema = z.object({ entry_id: recordIdSchema, expected_entry_revision: revision, expected_revision: revision, draft: journalDraftSchema }).strict();
export const prepareJournalUpdateSchema = updateDraftSchema;
export const pageCreateSchema = z.object({ title, content: blockContentSchema, operation_id: operationIdSchema }).strict();
export const pagePatchSchema = z.object({ operation_id: operationIdSchema, expected_revision: revision, title: title.optional(), content: blockContentSchema.optional() }).strict().refine((v) => v.title !== undefined || v.content !== undefined, "Supply a page field");
export const pageArchiveSchema = z.object({ operation_id: operationIdSchema, expected_revision: revision }).strict();
export const pageQuerySchema = z.object({ cursor: z.string().max(1000).optional(), limit: z.coerce.number().int().min(1).max(100).default(30) }).strict();
export const profilePatchSchema = z.object({ expected_revision: revision, timezone: z.string().min(1).max(100).refine((value) => { try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; } }, "Invalid timezone").optional(), allow_medical_voice_context: z.boolean().optional() }).strict().refine((v) => v.timezone !== undefined || v.allow_medical_voice_context !== undefined, "Supply a profile field");
export const createCheckinSchema = z.object({ source: z.enum(["app", "atech"]), device_id: recordIdSchema.optional(), operation_id: operationIdSchema }).strict();
export const prepareDraftSchema = z.object({ expected_revision: revision, draft: journalDraftSchema }).strict();
export const confirmSchema = z.object({ draft_revision: revision, action: z.literal("save"), operation_id: operationIdSchema }).strict();
export const commitSchema = z.object({ confirmation_receipt: recordIdSchema, operation_id: operationIdSchema }).strict();
export const cancelSchema = z.object({}).strict();
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((v) => { const d = new Date(`${v}T00:00:00Z`); return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v; }, "Invalid date");
export const journalQuerySchema = z.object({ from: dateSchema.optional(), to: dateSchema.optional(), cursor: z.string().max(1000).optional(), limit: z.coerce.number().int().min(1).max(100).default(30) }).strict().refine((v) => !v.from || !v.to || v.from <= v.to, "Invalid date range").refine((v) => !v.from || !v.to || new Date(v.to).valueOf() - new Date(v.from).valueOf() <= 366 * 86400000, "Date range exceeds 366 days");
export function validate<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new DomainError(422, "invalid_input", "Input does not match the required schema.");
  return parsed.data;
}
export type DraftInput = z.infer<typeof prepareDraftSchema>;
export type JournalUpdateInput = z.infer<typeof prepareJournalUpdateSchema>;
export type JournalPatchInput = z.infer<typeof journalPatchSchema>;
export type ConfirmInput = z.infer<typeof confirmSchema>;
export type CommitInput = z.infer<typeof commitSchema>;
export type CreateCheckinInput = z.infer<typeof createCheckinSchema>;
