import type { Database } from "@backend/db";
import { z } from "zod";
import { cancelCheckin, commitCheckin, getCheckin, getJournalEntry, getPage, getVoiceContext, prepareDraft, prepareJournalUpdate } from "../domain/journal";
import { cancelSchema, commitSchema, prepareDraftSchema, prepareJournalUpdateSchema, recordIdSchema, validate } from "../domain/contracts";
import { DomainError } from "../domain/errors";

const empty = z.object({}).strict();
const pageId = z.object({ page_id: recordIdSchema }).strict();
const entryId = z.object({ entry_id: recordIdSchema }).strict();
const definitions = [
  { name: "get_context", description: "Read every active owned context page and current journal context.", schema: empty },
  { name: "get_page", description: "Read an owned context page by ID.", schema: pageId },
  { name: "get_journal_entry", description: "Read an owned Journal entry with flexible properties and BlockNote content.", schema: entryId },
  { name: "get_checkin", description: "Read the authoritative check-in draft, revision, target and confirmation state.", schema: empty },
  { name: "prepare_journal_draft", description: "Prepare a generic Journal draft for explicit confirmation. Day plan is ordinary content blocks, not a separate resource.", schema: prepareDraftSchema },
  { name: "prepare_journal_update", description: "Prepare replacement content/properties for an owned entry through a new check-in, preserving unrelated entry content.", schema: prepareJournalUpdateSchema },
  { name: "commit_journal_entry", description: "Commit only using an existing backend confirmation receipt issued after explicit user confirmation. This tool cannot issue confirmation.", schema: commitSchema },
  { name: "cancel_checkin", description: "Cancel without writing a Journal entry.", schema: cancelSchema },
];
export const journalToolDefinitions = definitions.map(({ name, description, schema }) => ({ name, description, parameters: z.toJSONSchema(schema, { io: "input", reused: "ref" }) }));

export async function dispatchJournalTool(db: Database, ownerId: string, checkinId: string, name: string, input: unknown) {
  switch (name) {
    case "get_context": validate(empty, input); return getVoiceContext(db, ownerId, checkinId);
    case "get_page": return getPage(db, ownerId, validate(pageId, input).page_id);
    case "get_journal_entry": return getJournalEntry(db, ownerId, validate(entryId, input).entry_id);
    case "get_checkin": validate(empty, input); return getCheckin(db, ownerId, checkinId);
    case "prepare_journal_draft": return prepareDraft(db, ownerId, checkinId, validate(prepareDraftSchema, input));
    case "prepare_journal_update": return prepareJournalUpdate(db, ownerId, checkinId, validate(prepareJournalUpdateSchema, input));
    case "commit_journal_entry": return commitCheckin(db, ownerId, checkinId, validate(commitSchema, input));
    case "cancel_checkin": validate(empty, input); return cancelCheckin(db, ownerId, checkinId);
    default: throw new DomainError(422, "unknown_tool", "The requested tool is not available.");
  }
}
