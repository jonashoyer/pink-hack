import { agentMutationId, type AgentExecution } from "../domain/agent-execution";
import { createHash } from "node:crypto";
import type { Database } from "@backend/db";
import { z } from "zod";
import { createJournalForConversation, patchJournalForConversation, getConversationContext, getJournalEntry, getPage } from "../domain/journal";
import { journalCreateSchema, journalPatchSchema, recordIdSchema, validate } from "../domain/contracts";
import { DomainError } from "../domain/errors";
const empty = z.object({}).strict();
const pageId = z.object({ page_id: recordIdSchema }).strict();
const entryId = z.object({ entry_id: recordIdSchema }).strict();
const createInput = journalCreateSchema.omit({ operation_id: true });
const updateInput = z.object({ ...journalPatchSchema.shape, entry_id: recordIdSchema }).omit({ operation_id: true }).strict().refine(v => v.title !== undefined || v.content !== undefined || v.properties !== undefined, "Supply an editable field");
const definitions = [
  { name: "get_context", description: "Read all active owned context pages and recent journal context.", schema: empty },
  { name: "get_page", description: "Read an owned context page.", schema: pageId },
  { name: "get_journal_entry", description: "Read an owned journal entry and its current revision before updating.", schema: entryId },
  { name: "create_journal_entry", description: "Immediately save a journal entry requested by the user. Content is native BlockNote JSON; day plans are ordinary blocks. No proposal or confirmation stage is required.", schema: createInput },
  { name: "update_journal_entry", description: "Immediately update an owned entry requested by the user at its expected revision. Read and merge current content and properties first, preserving unrelated blocks and values. Omitted fields remain unchanged.", schema: updateInput },
];
export const journalToolDefinitions = definitions.map(({ name, description, schema }) => ({ name, description, parameters: z.toJSONSchema(schema, { io: "input", reused: "ref" }) }));
export async function dispatchJournalTool(db: Database, ownerId: string, voiceSessionId: string, name: string, input: unknown, toolCallId?: string, execution?: AgentExecution, signal?: AbortSignal) {
  await getConversationContext(db, ownerId, voiceSessionId);
  const operationId = () => {
    if (execution) return agentMutationId(ownerId, voiceSessionId, execution.delegationId, execution.mutationIndex);
    if (!toolCallId || toolCallId.length > 500) throw new DomainError(422, "missing_tool_action", "A stable application tool action ID is required.");
    return createHash("sha256").update(JSON.stringify([ownerId, voiceSessionId, name, toolCallId])).digest("hex");
  };
  switch (name) {
    case "get_context": validate(empty, input); return getConversationContext(db, ownerId, voiceSessionId);
    case "get_page": return getPage(db, ownerId, validate(pageId, input).page_id);
    case "get_journal_entry": return getJournalEntry(db, ownerId, validate(entryId, input).entry_id);
    case "create_journal_entry": return createJournalForConversation(db, ownerId, voiceSessionId, { ...validate(createInput, input), operation_id: operationId() }, execution, signal);
    case "update_journal_entry": {
      const { entry_id, ...patch } = validate(updateInput, input);
      return patchJournalForConversation(db, ownerId, voiceSessionId, entry_id, { ...patch, operation_id: operationId() }, execution, signal);
    }
    default: throw new DomainError(422, "unknown_tool", "The requested tool is not available.");
  }
}
