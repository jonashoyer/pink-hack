---
provenance: "Unvetted Synthetic"
---

# Direct voice Journal implementation plan

The developer removed held proposals, the staged check-in workflow, and Better Auth. Follow [PRD](../PRD.md), [direct contracts](app-structure.md), and [coordinator brief](flexible-pages-journal.md). The voice agent writes directly to Journal through POST/PATCH under the fixed shared user ID `demo-user`. Source inspection confirms exported `DEMO_USER_ID = "demo-user"` in [demo-owner.ts](../backend/apps/server/src/demo-owner.ts), used by `createApp(db, config, providerFetch?)` and device admission. Tests and deployment verification for this change remain pending.

This is an expedient demo architecture. All visitors share the same pages and Journal records, with no login or per-visitor record isolation. Provider and database keys stay on the backend.

## Owners

The existing backend owner retains source, migrations, runtime, deployment, and agent implementation. The sole assigned Lovable writer retains all remote frontend mutations in project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5`. The sanity-check owner, thread `a26234d0-9cf4-4db1-986a-1f3d5d532255`, coordinates the auth correction and owns auth reconciliation in PRD, app-structure, flexible-pages-journal, and root README. Main retains status. This thread updates this plan, API-readiness notes, and the superseded design only. Device work remains with its owner.

Hosting is the existing Vercel Pink Hack project, with the existing Turso database. Preserve Turso data. Remove former Azure VM host references from active frontend/device instructions; Azure GPT-Live remains the voice provider.

The previous backend handoff completed the direct-write domain and voice path. The shared-user correction now requires coordinated backend/frontend/device changes and fresh verification. Its identity is confirmed in source as `demo-user`; integrated device admission and fixed-user runtime verification remain pending. The sole frontend writer owns canonical Jonas integration and browser acceptance; the Atech owner owns physical SDK testing. No duplicate implementation or runtime probe is assigned here.

## 1. Simplify the existing services

Keep direct `POST /api/v1/journal` and revision-checked `PATCH /api/v1/journal/:id` over generic BlockNote content and flexible properties. Resolve the shared user ID on the backend rather than accepting a caller-selected owner. Preserve record/session scoping to that identity, input validation, transactions, and operation-ID retry checks while removing Better Auth.

Expose `create_journal_entry` and `update_journal_entry` agent tools using those same services. Remove mandatory held drafts, review/confirmation receipts, and staged commit prerequisites from the active flow. Agent conversation context is sufficient for composing write arguments.

Preserve legacy data/routes for compatibility while migrating clients. No destructive database cleanup is implied.

Fresh evidence must cover requests without login, two browser contexts seeing the same pages and Journal, immediate direct creation, updates preserving unrelated content, same-operation retries, stale revisions, and existing Turso persistence. Any handling of legacy user-owned records belongs to the backend owner; the identity correction does not authorize deleting them.

## 2. Remove the check-in dependency from voice

Bind voice sessions and optional journal entry targets to the backend's fixed shared identity. Read its custom pages and relevant journal context. Execute direct tools for user writing requests and return verified saved entry IDs/revisions.

Clarify ambiguous intent conversationally. Do not add another proposal/approval subsystem. Merge bounded transcript fragments, honor abort, and stop subsequent actions on interruption. Already saved entries remain ordinary editable records.

The existing client is the integration base; auth-related signatures must follow the backend owner's revised contract. Keep exact provider session/model validation and graceful closure. The deployed synthetic PCM test proved the previous Better Auth build's agent/write path and does not verify the fixed-user change.

## 3. Wire the sole Lovable frontend

Keep the simple BlockNote custom-page sidebar and one Journal. Direct page/journal editing calls the shared API. Normal dirty editor memory and failed-save recovery remain honest local editing behavior.

Remove inactive legacy check-in creation and staged review methods from the new voice path. Copy/adapt the private framework-independent client modules locally; do not assume an external npm publication.

Keep fixed API `https://pink-hack.vercel.app`. The prior build passed CORS/trusted-origin and Turso direct-write checks; the revised no-login app needs fresh CORS, shared-record, and voice callback verification. Remove sign-in/session prerequisites through the sole frontend writer and use the revised client contract. Complete frontend mutations sequentially; no competing writer.

Verify page and journal save/reload against real Turso-backed API, then voice creation and a direct Day-plan update.

## 4. Verify device transport on current hosting

The device owner aligns prompts with direct journal tools and no mandatory review-revision/confirmation-phrase gate. PTT, interruption, stop, and connection states remain audio controls. Use the backend owner's final device admission and shared voice-session contract; removing Better Auth does not establish what happens to device credentials. Record revision protections remain.

The previous Better Auth build passed same-service authenticated WSS at `wss://pink-hack.vercel.app/api/v1/device/audio` with real Azure Live and synthetic 16 kHz PCM. The agent saved a Turso entry, and HTTP reread confirmed the heard wording and BlockNote content. The fixed-user build still needs verification of device admission, session binding, and direct persistence. Vercel hosting, Turso storage, and Azure Live provider remain unchanged.

The confirmed Big Kit 14-port layout is microphone 1-2, speaker 13-14, button 3, light grid 4. The Atech owner has physical testing with SDK `atech==1.0.0a11` in progress and owns adaptation of the SDK's USB serial defaults to direct device WSS. The sole frontend writer owns Lovable browser voice acceptance. The 300-second device-function reconnect has not been runtime exercised and needs an explicit check. The synthetic singleton claim has been released, so the real owner can provision privately. Follow the Uno Q skill exactly if that board becomes part of deployment; do not repeat paid startup or create another synthetic claim.

## 5. Verify the simple demo

Add unfamiliar custom pages, use them in conversation, directly create a Journal entry with unfamiliar properties, reload it, and update the Day plan in its page body without replacing unrelated content.

Check shared records across visitors without login, duplicate retries, stale edits, failed-write feedback, and stop preventing further actions. Record actual backend/frontend revisions, verified Vercel URL, Turso persistence, audio evidence, and remaining gaps. Do not claim fixed-user readiness from the previous Better Auth build's checks.

## Current handoff

Previous-build evidence is deployment `dpl_Ak43VzrcBBiwjuD27reY4y6e4WNF`, source `99c316c`, and verification docs `4d45f10`. The backend owner passed Better Auth HTTP/direct Turso checks, synthetic PCM/real Azure Live/agent-save roundtrip with owned reread, 51/51 tests, workspace types, and build. Those results remain historical evidence, not acceptance of the shared-user change. Fresh fixed-user deployment, browser WebRTC, physical Big Kit capture/playback, and 300-second reconnect checks remain with their owners. The synthetic singleton claim was released. Test/source ownership stays with its assigned workers.
