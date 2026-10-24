---
provenance: "Unvetted Synthetic"
---

# Direct voice Journal implementation plan

The developer removed held proposals and the staged check-in workflow. Follow [PRD](../PRD.md), [direct contracts](app-structure.md), and [coordinator brief](flexible-pages-journal.md). The voice agent writes directly to Journal through authenticated POST/PATCH.

## Owners

The existing backend owner retains source, migrations, runtime, deployment, and agent implementation. The sole assigned Lovable writer retains all remote frontend mutations in project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5`. The coordinator owns the correction brief/status; this thread reconciles shared requirements/contracts. Device work remains with its owner.

Hosting is the existing Vercel Pink Hack project, with the existing Turso database. Preserve Turso data. Remove former Azure VM host references from active frontend/device instructions; Azure GPT-Live remains the voice provider.

Sections 1 and 2 are implemented in the completed backend handoff. There are no pending backend contract changes. The sole frontend writer is integrating the canonical Jonas app and checking browser acceptance; the Atech owner is conducting physical SDK testing. These owners retain the remaining runtime work.

## 1. Simplify the existing services

Expose direct `POST /api/v1/journal` and revision-checked `PATCH /api/v1/journal/:id` over generic BlockNote content and flexible properties. Reuse authentication, ownership validation, transactions, and operation-ID retry checks.

Expose `create_journal_entry` and `update_journal_entry` agent tools using those same services. Remove mandatory held drafts, review/confirmation receipts, and staged commit prerequisites from the active flow. Agent conversation context is sufficient for composing write arguments.

Preserve legacy data/routes for compatibility while migrating clients. No destructive database cleanup is implied.

Evidence must cover immediate direct creation, updates preserving unrelated content, same-operation retries, stale revisions, foreign-user rejection, and existing Turso persistence across app restart.

## 2. Remove the check-in dependency from voice

Use owned voice-session identity and an optional journal entry target for session setup and the application reasoning callback. Read all owned custom pages and relevant journal context. Execute direct tools for user writing requests and return verified saved entry IDs/revisions.

Clarify ambiguous intent conversationally. Do not add another proposal/approval subsystem. Merge bounded transcript fragments, honor abort, and stop subsequent actions on interruption. Already saved entries remain ordinary editable records.

The reusable client and backend signatures are frozen for frontend wiring. Keep exact provider session/model validation and graceful closure. The deployed synthetic PCM test proves the agent/write path; browser WebRTC acceptance remains separate.

## 3. Wire the sole Lovable frontend

Keep the simple BlockNote custom-page sidebar and one Journal. Direct page/journal editing calls the shared API. Normal dirty editor memory and failed-save recovery remain honest local editing behavior.

Remove inactive legacy check-in creation and staged review methods from the new voice path. Copy/adapt the private framework-independent client modules locally; do not assume an external npm publication.

Wire the verified fixed API `https://pink-hack.vercel.app`. The backend owner confirmed both `http://localhost:8080` and the canonical public Lovable preview in CORS and trusted authentication, plus real Turso Journal POST/reload/PATCH and retry/conflict behavior. Use the frozen client modules and current owned voice-session callback. Complete active frontend mutations sequentially; no competing writer.

Verify page and journal save/reload against real Turso-backed API, then voice creation and a direct Day-plan update.

## 4. Verify device transport on current hosting

The device owner aligns prompts with direct journal tools and no mandatory review-revision/confirmation-phrase gate. PTT, interruption, stop, and connection states remain audio controls. Authentication and record revisions still apply.

The backend owner verified the same-service authenticated WSS endpoint `wss://pink-hack.vercel.app/api/v1/device/audio` with real Azure Live and synthetic 16 kHz PCM. The agent saved an owned Turso entry, and HTTP reread confirmed the heard wording and BlockNote content. Use that fixed contract; no Azure VM hosting or laptop bridge is required by this verified deployment.

The confirmed Big Kit 14-port layout is microphone 1-2, speaker 13-14, button 3, light grid 4. The Atech owner has physical testing with SDK `atech==1.0.0a11` in progress and owns adaptation of the SDK's USB serial defaults to direct device WSS. The sole frontend writer owns Lovable browser voice acceptance. The 300-second device-function reconnect has not been runtime exercised and needs an explicit check. The synthetic singleton claim has been released, so the real owner can provision privately. Follow the Uno Q skill exactly if that board becomes part of deployment; do not repeat paid startup or create another synthetic claim.

## 5. Verify the simple demo

Add unfamiliar custom pages, use them in conversation, directly create a Journal entry with unfamiliar properties, reload it, and update the Day plan in its page body without replacing unrelated content.

Check duplicate retries, stale edits, foreign-user access, failed-write feedback, and stop preventing further actions. Record actual backend/frontend revisions, verified Vercel URL, Turso persistence, audio evidence, and remaining gaps. Do not claim new direct-write readiness from old staged tests or a prior Azure host health check.

## Current handoff

Production HTTPS and authenticated WSS are verified at fixed `https://pink-hack.vercel.app`, deployment `dpl_Ak43VzrcBBiwjuD27reY4y6e4WNF`. The backend owner passed HTTP/auth/direct Turso checks and the synthetic PCM/real Azure Live/agent-save roundtrip with owned reread. Source is integrated in `99c316c`, verification docs committed in `4d45f10`, and final 51/51 tests, workspace types, and build passed. Frozen client and bounds are in current app contracts. Lovable browser voice, physical Arduino capture/playback, and 300-second reconnect remain owner runtime checks. The synthetic singleton claim is released. Test/source ownership stays with its assigned workers.
