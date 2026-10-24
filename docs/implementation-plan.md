---
provenance: "Unvetted Synthetic"
---

# Direct voice Journal implementation plan

The developer removed held proposals and the staged check-in workflow. Follow [PRD](../PRD.md), [direct contracts](app-structure.md), and [coordinator brief](flexible-pages-journal.md). The voice agent writes directly to Journal through authenticated POST/PATCH.

## Owners

The existing backend owner retains source, migrations, runtime, deployment, and agent implementation. The sole assigned Lovable writer retains all remote frontend mutations in project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5`. The coordinator owns the correction brief/status; this thread reconciles shared requirements/contracts. Device work remains with its owner.

Hosting is the existing Vercel Pink Hack project, with the existing Turso database. Preserve Turso data. Remove former Azure VM host references from active frontend/device instructions; Azure GPT-Live remains the voice provider.

## 1. Simplify the existing services

Expose direct `POST /api/v1/journal` and revision-checked `PATCH /api/v1/journal/:id` over generic BlockNote content and flexible properties. Reuse authentication, ownership validation, transactions, and operation-ID retry checks.

Expose `create_journal_entry` and `update_journal_entry` agent tools using those same services. Remove mandatory held drafts, review/confirmation receipts, and staged commit prerequisites from the active flow. Agent conversation context is sufficient for composing write arguments.

Preserve legacy data/routes for compatibility while migrating clients. No destructive database cleanup is implied.

Evidence must cover immediate direct creation, updates preserving unrelated content, same-operation retries, stale revisions, foreign-user rejection, and existing Turso persistence across app restart.

## 2. Remove the check-in dependency from voice

Use owned voice-session identity and an optional journal entry target for session setup and the application reasoning callback. Read all owned custom pages and relevant journal context. Execute direct tools for user writing requests and return verified saved entry IDs/revisions.

Clarify ambiguous intent conversationally. Do not add another proposal/approval subsystem. Merge bounded transcript fragments, honor abort, and stop subsequent actions on interruption. Already saved entries remain ordinary editable records.

Revise the reusable client coherently with actual backend signatures before frontend wiring. Keep exact provider session/model validation and graceful closure. Existing access-only Azure startup/close evidence does not prove the revised agent/write path.

## 3. Wire the sole Lovable frontend

Keep the simple BlockNote custom-page sidebar and one Journal. Direct page/journal editing calls the shared API. Normal dirty editor memory and failed-save recovery remain honest local editing behavior.

Remove inactive legacy check-in creation and staged review methods from the new voice path. Copy/adapt the private framework-independent client modules locally; do not assume an external npm publication.

The backend owner supplies a verified Vercel runtime API URL and exact allowed origins/auth behavior. The Vercel dashboard is not an API URL. Complete unrelated active frontend mutation work sequentially; no competing writer.

Verify page and journal save/reload against real Turso-backed API, then voice creation and a direct Day-plan update.

## 4. Verify device transport on current hosting

The device owner aligns prompts with direct journal tools and no mandatory review-revision/confirmation-phrase gate. PTT, interruption, stop, and connection states remain audio controls. Authentication and record revisions still apply.

The backend owner checks Vercel native WSS capability before claiming a same-service device relay. Report a concrete hosting restriction if present; do not invent an endpoint or reintroduce Azure VM hosting or a configurable laptop bridge. Any incompatible requirement needs coordinator reconciliation.

Once a supported route exists, verify actual microphone/speaker PCM, ownership, direct journal writes, interruptions, and app retrieval. Follow the Uno Q skill exactly if that board becomes part of deployment.

## 5. Verify the simple demo

Add unfamiliar custom pages, use them in conversation, directly create a Journal entry with unfamiliar properties, reload it, and update the Day plan in its page body without replacing unrelated content.

Check duplicate retries, stale edits, foreign-user access, failed-write feedback, and stop preventing further actions. Record actual backend/frontend revisions, verified Vercel URL, Turso persistence, audio evidence, and remaining gaps. Do not claim new direct-write readiness from old staged tests or a prior Azure host health check.
