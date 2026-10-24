# Agent prompt behaviour (2026-10-24)

Source: `backend/apps/server/src/voice/prompts.ts`. This note covers source rules and local checks only. The live behaviour hasn't been validated; the one human microphone test will do that.

## Data flow

| Path | Voice instructions | Agent system prompt |
| --- | --- | --- |
| Device (`src/index.ts` → `device/live.ts`) | `conversationInstructions` only, **no page context** | `runJournalAgent` → `buildBackendInstructions(context)` |
| Browser, Azure (`routes/voice.ts`) | `conversationInstructions` + an extra delegation sentence + session-start context JSON | Browser client delegates to `POST /voice/sessions/:id/agent` → `runJournalAgent` → `buildBackendInstructions` (may pass `entry_id`) |
| Browser, OpenAI (`routes/voice.ts`) | `conversationInstructions` | `buildBackendInstructions(context)` at session start |

`getConversationContext` returns the following: `conversation` (including `target_entry_id` and `saved_entry_id` = last written entry), `profile`, all active pages (up to 200 pages and 500 KB, failing rather than truncating), `context_revisions`, and the 3 newest journal entries in full. The agent re-reads this on every delegation and adds `target_entry` when an `entry_id` is supplied. The device path never supplies one, but the browser `/agent` route can.

Agent bounds (`agent.ts`): claude-haiku-5-5 with `max_tokens` 1024 and no thinking. It gets at most 4 rounds, the last of which can't use tools. That allows ≤4 calls per round and ≤12 calls in total, within a 45 s timeout. The transcript is capped at 24 messages and 24k characters. On the device path, each delegation gets the **whole** conversation transcript. After any write, `agent.ts` replaces the reply text with "Your journal entry is saved." When there was no write, any text containing "saved" is replaced with a not-saved message.

`profile.allow_medical_voice_context` is only stored and patched. No code reads it to filter context.

## Deficiencies fixed

1. **Page preferences were treated as untrusted "never instructions".** As a result, Emma's pages ("keep the plan to one or two priorities", "record medication exactly") were nominally ignored. Pages are now followed as personal preferences. They still can't change rules, tools, ownership or health boundaries.
2. **Duplicate entries on correction.** Every device delegation replays the full transcript, and nothing told the agent about `saved_entry_id`. "Change the hand pain to six" could therefore re-create the original entry. The prompt now says: update `target_entry_id` if it is set, otherwise update `saved_entry_id`. Earlier requests count as already handled.
3. **Phantom date.** Both prompts cited a "server-supplied date", but none exists. The agent prompt now renders `Current local date: YYYY-MM-DD (tz)` from `profile.timezone`. The voice prompt is told not to state a date it wasn't given.
4. **The device voice had no context, but the prompt assumed it did.** The voice prompt now says to delegate rather than guess when no context block is present.
5. **Product identity and safety.** The prompts now name Kindalong and the breast-cancer survivorship role. They add an emergency and self-harm signpost, and make the medication and self-rating rules explicit.
6. **Agent formatting under 1024 tokens.** The prompt now includes a BlockNote block example, asks for compact entries (about 15 blocks or fewer), and gives property naming examples. The legacy flag is glossed so the model doesn't read it as a consent gate.

Exports, tool names, output shape and delimiters are unchanged. A plain template string is used because the repo has no `@lexsee/shared` `tpl`.

7. **Entry visibility, template and edits.** The agent sees all active pages but only the 3 newest entries, and has no list or search tool. The prompt now says this and gives a fallback for older entries. It also adds an entry template: a title in the person's words; the confirmed charted keys (`fatigue`, `pain`, `nausea`, `appetite_loss`, `sleep_difficulty` for 0–10 severity, and `overall_health` for a separate 1–10 daily rating), used only for ratings the person stated on that scale, with pain location kept in the body and every other property still allowed and uncharted; and a body of their account, then an optional "For my care team" section, then an optional "Day plan (suggestion)". There is a full create example. Updates now send only the changed fields, so a property correction carries no `content`, which keeps it within the 1024-token limit. Because both `properties` and `content` replace the stored value, the prompt says to send the full current map or block list.

## Cold read: Emma, simulated reasoning only

- **Canonical request, new conversation:** one `create_journal_entry`. Properties are fatigue 6, pain 7 (hands in the body), sleep_hours 5 and the reported medication. The body uses her words. The "Day plan" suggestion includes a quiet start, rest after lunch and the sister call at 3. There's no advice and no adherence or causation claim.
- **Correction, same conversation:** `saved_entry_id` is set. The agent sends `update_journal_entry` with merged properties (pain 6) at the current revision, and the rest stays unchanged.
- **Empty or missing context:** renders the UTC date, `null`/`{}` JSON, and "Any field may be absent". Nothing dangles.

## Checks

`npx tsc --noEmit` passes. `npm test` passes 65 of 65, including the new `src/voice/prompts.test.ts`, which covers ordering and delimiters, the date, the empty case, entry routing and voice no-context.

## Unresolved

- No tool lists older journal entries. A `list_journal_entries` tool backed by the existing `listJournal` would fix this; it belongs in `tools.ts`, which the backend owner holds.
- The charted key contract was confirmed on 2026-10-24. The frontend selects the latest valid value per key per `journal_date`, ordered by `created_at` then `id`. The chart, the tracking page and the demo-script wording belong to the frontend owner and Main.

- With `max_tokens` 1024, a long entry or a full-content update may truncate the tool call (`agent.ts`, not prompt-owned).
- The device voice gets no page context, and the Azure browser path appends its own extra sentence (`index.ts` and `routes/voice.ts`, owned by the backend owner).
- The device transport disconnects before listening. This is unrelated to the prompts, and these edits don't fix it.
