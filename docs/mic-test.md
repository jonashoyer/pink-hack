---
provenance: "Unvetted Synthetic"
---

# Public browser microphone test

Coordinator: [Public app microphone test](t3-thread://v1/mcp:1e1bffb3-737b-4d88-b24c-f0c9a4ccd80b). This record owns microphone evidence only. Backend, frontend, seed/story, demo and hardware retain their existing writers.

## Current state

The first actual human Start attempt failed with HTTP 429 before session creation. Ten fictional history entries are now saved, with three later unattributed records observed in the latest readback. No genuine polished voice-agent loop is established. The coordinator performed no Start click, provider probe, Journal write, context edit, deployment or hardware action. Current active-session state is unknown. Agent-only frontend is public, but the no-raw backend prompt is not yet deployed. No new human Start is requested; an existing conversation may continue. The earlier Anna/two-page script is superseded as test input.

The frontend owner reports the corrected publication ready for initial human testing. This is readiness evidence, not spoken end-to-end proof.

| Part | Pin or evidence |
| --- | --- |
| Public app | https://pink-hack-journal.lovable.app/app |
| Current app name | Held, owner-reported current public branding |
| Current publication source | `0924f3e58167aeb29203fe4f4bc2d2020f76ce44`, floating voice bar, owner-reported |
| Current Lovable deployment | `d51a6f93-0260-44fb-9e4a-88c38aed4554` |
| Agent-only correction source/deployment | `536a78d95b2486eaa76fa67874a59c53d7f842e3` / `f968f7f7-6ba5-4f04-863a-58f55730247a` |
| Prior unchanged deployment attempt | `d1bca071-eb8e-4d23-baa1-604c5f656619`, served unchanged earlier source/asset |
| Kindalong release deployment | `bc2ab442-b0d5-4acc-a4c9-1cc6ad8b3b62` |
| Agent-only correction operation | `umsg_01m5q59p43fdztqfeqw1vpgqjg`, queued handoff then corrected publication, owner-reported |
| Current app behavior | `536a78d95b2486eaa76fa67874a59c53d7f842e3`, removes raw-transcript save fallback |
| Prior Stop-aware app/client baseline | `65f746ff2fa69255e0660d6c01da70ce975e4f66` |
| Prior app/client deployment | `98d4193d-486f-4d7c-966e-9818336dbe04` |
| App/client correction operation | `umsg_01m5py4fdse1hbg0dkdjk0t40k`, completed, owner-reported |
| Prior publication asset evidence | `app-DbtVxipI.js` at `65f746ff`, owner-reported Stop endpoint, `backendStopped`, Retry Stop and independent feedback |
| Current backend source | `e8c22dfc942e80e3ef0ab1241cf0ca0caeaba9b3`, backend owner verified production Git metadata; no-raw prompt is not deployed |
| Deployed candidate base | `f932d52b23f774ead4cb9c6488e7064031c5e7fe` plus only quota removal in `routes/voice.ts` and regression in `routes/voice.test.ts` |
| Current backend deployment | `dpl_BwahCqZmXetNR5d4YgVtyMat6xuJ`, READY, backend-owner metadata verified |
| Accepted quota-removal source/deployment | `1396ab5835dadf5f90848b2c6e5467af1ab9d9ae` / `dpl_3RPxVYsSXfwcTEUrc3DBVH4QGpvr` |
| Prior backend source/deployment | `1bf7d24ceebd8ae706aacfee74624ffe3a7c77fc` / `dpl_D4keCEU8SgHaPMTyzLEMuQdNKQ6u` |
| Configured API | https://pink-hack.vercel.app |
| Immutable backend | https://pink-hack-gshrbahb6-quasr.vercel.app |
| Context/Journal baseline | Context 4/3/1; ten October 14–23 seeds revision 2 plus three later unattributed records, total 13 at 14:48:50 UTC |

Frontend owner reports `VOICE_ENABLED=true`, anonymous public HTTP 200, 38 focused mocked tests and harness compilation, plus a temporary page save/reload/archive. None involved Start or a provider session. Backend owner reports 64 regressions, types/build and deployed CORS/replay/Stop checks; bounded source review is closed. These checks do not establish human speech or voice writing.

Prior landing publication `919d8ed59587495a56cad6c1a402f2b2f4608de7`, deployment `86d524d8-75d5-4c76-ae9b-1be95fc540e1`, used Here With You. Its handoff reports that the writer inspected the exact diff and restored PinkApp, global styles, voice client, controller, config and tests byte-for-byte to `65f746ff` before publishing. Seven landing tests, the candidate build, public HTML/assets and the CTA were checked. The final clean build after restoration was not independently logged.

Latest Kindalong handoff reports an inspected `919d8ed` to `a3fc982` diff limited to branding, landing palette/logo/image/docs, app/root metadata and two visible app brand/ARIA literals. App behavior, layout/classes, global styles, API, client, voice, config, probes and dependencies were unchanged. Seven focused tests and harness compilation passed as reported. Anonymous root and `/app` returned 200 with Kindalong branding; the new app image showed the three context pages, empty Journal and Server connected. Neither publication changed retained context/data or involved Start, provider or writes. Neither adds spoken, save, callback-replay or Stop proof. The existing human Start instruction remains pending; no second attempt is requested.

The latest owner-reported app screenshots also show Voice closed. This is a pre-test display state, not a provider-finalization or durable Stop receipt from a real session.

Controls reported by the frontend owner are Start voice, Stop voice and Retry Stop. Provider-finalization feedback and persistent write-retirement feedback are separate. A pre-session startup failure can show both flags false with Retry Stop despite having no backend session ID. Capture that failure rather than treating it as a stopped receipt or starting repeated sessions.

T3 preview opened a separate background tab at the public app. Its initial title was `Shared Journal · Pink Hack`. The first snapshot failed with `Preview automation snapshot timed out after 15000ms.` No Start or other interaction occurred. This does not verify current rendered controls.

A second snapshot after public-app navigation failed with the same raw timeout. Under the documented fallback, a read-only Chrome DevTools tab inventory showed only `1: about:blank`, with no human app tab attached. Exact callback request-body capture is therefore unavailable from the current browser tools. Backend delegation records retain a hash/result rather than original request bytes. Do not reconstruct a request for replay; that check remains pending unless the actual human browser's network evidence becomes available. This evidence limitation does not hold the initial microphone test.

Fresh coordinator read-only public-origin GET `/context` at `2026-10-24T12:49:36.226915Z` returned HTTP 200, exact public-origin CORS, fixed owner `demo-user`, unchanged profile and all three full native pages. Tracking `578460c0-8796-4e86-94b3-424022f6259e` is revision 2, helps `be00b449-8435-461b-bd33-d28957168fb9` is revision 2 and recovery `70a2f3a4-15af-47bb-8923-a9eeaef08373` is revision 1. GET `/journal?limit=100` at `2026-10-24T12:49:38.631974Z` returned HTTP 200 and exactly `{"entries":[],"next_cursor":null}`. The backend owner is also refreshing its read-only baseline for subsequent captured-session verification. No Journal history is seeded for this test.

## Evidence to collect from the one human session

All live fields below remain pending. Use the final breast-cancer composite request, fictional information and the user's own microphone. The coordinator never clicks Start on the user's behalf.

1. Record the final context IDs, revisions and content snapshot, frontend/backend pins and fresh Journal baseline.
2. Record actual Start time, conversation/provider aliases, user transcript, callback delegation ID and exact submitted request bytes or hash, preserving optional-field omissions.
3. After the agent's saved response, coordinate backend-owned readback of exactly one new entry. Record entry/operation IDs, title, source, revision, native body, flexible properties, context trace and request-to-save timing. Separate spoken success from confirmed durable persistence.
4. Have the user open the same public Journal row and verify reload. Record readback and screenshot when available.
5. In the same active session, use one spoken correction to update the same entry. Compare revision, unrelated body blocks and properties against the prior saved snapshot.
6. Before explicit Stop, backend owner replays only an already completed identical callback with the same delegation ID/messages/target. Record unchanged count, entry/revision and no model rerun. Never invent or vary a callback body.
7. After explicit Stop, record actual `{confirmed,backendStopped}`, durable stopped state, exact late-callback denial and retained committed entry. Provider confirmation alone does not prove durable revocation. A COMMIT already in progress may win before Stop; Stop does not roll back saved entries.

Saved fictional Journal evidence is retained for presentation unless Main decides otherwise. Report results and failures to Main and the demo owner before they use them as pitch proof. Do not create an entry manually to substitute for voice success.

## Coordination

The sole frontend owner received one pin/status request and supplied the corrected publication handoff. Backend owner owns read-only Turso/count/provenance/update evidence and captured exact callback replay/late denial. Reviewer interprets captured evidence without another microphone session or provider probe. Status owns the controlled two-page revisions, added fictional recovery page, and story/manifest reconciliation. The final manifest and canonical Emma request are received; the coordinator can now guide the one human session.

Backend owner refreshed the baseline at `2026-10-24T12:50:54.001Z`, confirming Journal count 0, null cursor and the three canonical page revisions 2/2/1. Its full private snapshot is `backend/.deploy/browser-mic-baseline.json`.

Initial human instruction was delivered: open the public app, click Start voice once, allow the microphone and report Listening or the exact error before speaking the canonical request. The actual failed outcome is now reported below. The exact attempt timestamp and request bytes were not captured; no session ID was created by this quota rejection.

## First human attempt and quota correction

Status relayed the user's actual public startup failure: HTTP 429, `The hourly voice initialization limit has been reached.` The UI showed Voice Error and Retry Stop, with `Connection closed locally — provider finalization not confirmed` and `Assistant writes not confirmed stopped — Retry Stop before starting again.` These are the reported exact strings, not an independently captured screenshot.

The old quota rejected the request before recording a new initialization or creating a conversation/contacting the provider. The false flags are not a Stop receipt or evidence of a live unretired provider session. No spoken transcript, persisted voice entry, callback replay, timing-to-save or real Stop proof exists from this attempt. No Retry Stop loop or repeat paid session is needed for this rejection.

The user explicitly requested removal of API rate limits. The existing backend owner removed the five-attempts/hour browser-start quota and found no other app-owned limiter. Its clean candidate passed 65/65 tests, types and build. The regression accepted two failed mock starts followed by seven distinct successful starts, while reused operation IDs still returned 409 without another provider call. No production voice/provider/device request or data mutation was used for verification. Deployment readiness and public health/context/Journal GET 200 plus OPTIONS 204/exact public-origin CORS were owner-verified.

Candidate file SHA-256 values are `997fe916b633311ccb744391a8f7be615af6a2f0eaafd0d26620446ca5dadaca` for `routes/voice.ts` and `04fd8f96faa16ce2ca593ba2aedb949e5936d6907735f7ddde39b14f352b57cf` for `routes/voice.test.ts`. The owner deployed without changing the shared Git index/rebase. Current readback reports tracking revision 3, helps revision 2, recovery revision 1 and Journal count 0. Wait for Status's full revision-3 manifest before instructing one controlled human reload/Start. Preserve all retained data.

## Context drift before the next attempt

The sole seed worker reported a fresh complete public snapshot at `2026-10-24T13:44:38.250274Z`, saved privately as `/tmp/pink-hack-chart-v3-before.json`. Tracking is now revision 3, titled `What I want to track`; its first paragraph is `This journal follows Emma's life after breast cancer treatment.` Its four blocks preserve the remaining medication/physical/emotional copy but contain none of the three proposed chart-convention paragraphs. Native-content hash is `ff44d9257605acb5da3773c172534356cbfec8abd64c358dd7c0d40144a37294`.

Helps is now revision 3, titled `What helps me`, with the prior synthetic label removed from its first paragraph. Native-content hash is `316229880fc69e31a01d234149bec171c396eb8d4040465352fe08c111eb1ff9`. Recovery remains revision 1 and deeply equal to its prior payload, hash `28b53dd8388b294617b06c76f12fac39e1c2c582c64bc272da4ce224198a4f6c`. All individual GETs match the full public context/pages snapshot. Journal is empty and the profile is unchanged.

The worker stopped before any PATCH, retry, POST or manifest edit. Operation `demo-seed-emma-tracking-chart-conventions-20261024-v3` was not used. The old expected revision 2 is stale and the existing revision 3 does not establish chart conventions. Preserve the current edits; Main/Status must reconcile and rebaseline any bounded append against actual revision 3. The next microphone Start remains held until the canonical manifest is returned. Quota-free backend readiness remains established.

## Reconciled manifest and controlled retry

The final seed-worker handoff clears the context prerequisite. Tracking is revision 4 after one additive PATCH with `expected_revision: 3`, operation `demo-seed-emma-tracking-chart-conventions-20261024-v4`. Its four prior native blocks were preserved exactly and only three authorized convention paragraphs were appended. One identical receipt replay returned the same revision 4. Helps remains revision 3 and recovery revision 1, both deeply unchanged. Full public GET/context at `2026-10-24T13:48:52.517994Z` matched all canonical native content, with Journal empty and profile unchanged. This is context/persistence proof only.

The frontend owner explicitly authorized proceeding with one controlled quota-free reload/Start on the existing public publication. Pending no-session UI recovery operations `umsg_01m5q2gg63en9sre93egev36sv` and sequential capture recovery `umsg_01m5q2tc9rf83v9nkzhc08mzmr` have mocked verification reports but no claimable corrected public pin yet. Preserve the current public pin until a concrete publication handoff arrives. Initial reload clears the old local failed state. No chart/data tests or parallel provider session will run while this human attempt is active.

Coordinator public-origin baseline at `2026-10-24T13:51:02.749156Z` independently matched the current native-content hashes for tracking/helps/recovery at 4/3/1. Journal GET at `2026-10-24T13:51:03.222756Z` returned count 0 and null cursor. Both were HTTP 200 with exact public-origin CORS. One controlled human refresh/Start instruction has been released; its first Listening/error outcome remains pending.

## No-session UI publication limitation

The sole frontend owner reports a tested detached fix at `540c17cbd7dc0a223429729e4760dea7eee4fac6`. It adds `hasBackendSession(): boolean` while retaining `close(): Promise<{confirmed,backendStopped}>`. Unowned settled failure clears local Retry Stop and receipt-like presentation while preserving the error; known or late IDs still require durable Stop. Red/green 429 coverage, 38 focused mocked tests and build passed as reported, without provider/API/device/session actions.

Both correction operations returned no associated managed edit. `get_diff(message)` returned 400, project/edit metadata stayed at `a3fc982`, and detached source read/diff returned 502. The bounded deployment `d1bca071-eb8e-4d23-baa1-604c5f656619` completed serving unchanged `app-D6PBLnaN.js` with no `hasBackendSession` mentions. The fix is therefore not claimed public. The sole writer owns active-branch/edit capture resolution; no competing frontend/backend mutation or provider test is requested. This platform publication problem does not hold the already released quota-free refresh/Start attempt.

## Ten fictional entries and new Start hold

The user's new explicit instruction authorizes the existing seed worker to create exactly ten clearly fictional Journal entries aligned with Emma's presentation and current pages. This supersedes the prior no-synthetic-Journal decision for those ten records only. They are presentation data, not voice evidence. Earlier empty-Journal baselines remain historical checks.

New human Starts are held until seed completion and a new baseline handoff. Because the released retry has no received result, the coordinator has asked the user whether the browser currently has an active voice session. Do not infer inactivity from silence. If active, let genuine output finish and preserve its entries; do not stop a human session merely to seed or start another one. Main and Status received this exact unknown-state report. No provider, Stop, seed or data mutation was performed by the coordinator.

## Two observed persisted entries before historical seeding

Status reported two public Journal entries while the ten-entry seed worker had performed zero POSTs. Coordinator GET `/journal?limit=100` at `2026-10-24T14:19:00.989596Z` independently returned HTTP 200, exactly these two entries and null cursor. Individual GETs at `14:19:02.055753Z` and `14:19:03.046634Z` returned the same complete objects. Both remain untouched.

| Field | First entry | Second entry |
| --- | --- | --- |
| ID | `d674033d-c2ce-4ada-9c00-300550e747bc` | `6de24801-f382-484b-8cf9-a30afb2f9b30` |
| Title | Voice entry · Oct 24, 2026, 4:15 PM | Voice entry · Oct 24, 2026, 4:16 PM |
| Revision | 1 | 1 |
| Created/updated UTC | `2026-10-24T14:15:57.262Z` | `2026-10-24T14:16:36.091Z` |
| Operation ID | `69e77157-266b-4211-9b29-b831263473d2` | `8a4ae34b-1fe4-4c6f-b5ca-e6bc2a64145e` |
| Capture ID | `c43ef87e-806b-4e0b-b595-ca8b31429e4b` | `ad424200-18fe-4695-9e09-327f814efd79` |

Both have owner `demo-user`, journal date `2026-10-24`, source `app`, properties `{}`, and null `device_id`, `voice_conversation_id` and `session_id`. Both record `context_revisions` as tracking 4, recovery 1 and helps 3. These metadata revisions do not establish model inference or plan generation.

First `original_text`, preserving its paragraph break:

```text
Hello, hello, this is a

test
```

Second `original_text`, preserving its paragraph break and punctuation:

```text
So, today I'm feeling slightly fatigue. I would say maybe a 3 out of 10, and then I feel like I have some brain fog

, maybe 5 out of 10 And then I also, I kind of feel um, some pain in my body, and I would say it's like a 2 out of 10
```

Each native body contains exactly two paragraph blocks, each with one text node and empty styles, matching the two transcript fragments above. No Day-plan blocks or numeric properties are present. The spoken side of the interaction, user confirmation, provider session, callback bytes, assistant reply, save latency, update preservation and Stop flags remain unverified. Backend owner was asked for read-only Turso/session/operation/provenance correlation. Titles and source `app` alone do not establish speech/model/provider provenance. These are not the ten historical seeds, which have not begun. Do not delete, overwrite or count either entry as synthetic seed data. Presentation must show Journal as it currently loads, not claim it is empty.

Backend owner's completed read-only correlation reports direct REST source `app`, exactly one operation receipt per entry, zero matching `agent_delegations` or `browser_voice_tool_calls`, and null conversation/session IDs. This supports direct persistence only. The coordinator has asked how the user created/saved these two entries; dictation provenance remains pending their answer. No new Start, Stop, replay or reconstructed request is needed to explain existing records. The separate current active-state question remains pending and seed clearance is not yet granted.

## Final artifact requirement and demo population

The user answered the creation question with `An agent did yes`. This is recorded as their attribution; it does not supply a voice-session ID, agent callback, actual microphone method or save timing, and does not change the backend direct-REST correlation above.

Latest user requirements reject raw-transcript Journal saves as the product result. A passing flow must have the application agent use persona/context/tracking pages, create a polished native entry with explicit properties and a Day plan, then support readback and Stop. The sole frontend writer owns removal of the `storeRecording` direct-save bypass. Backend owner owns the separately authorized cleanup of only the two exact unchanged raw test entries and the contract handoff. This supersedes the prior preservation restriction for those two records only; preserve any genuine active-conversation output and retain their captured evidence. No cleanup is performed by this coordinator.

The user reaffirmed `We need to demo populate our database`. The existing seed writer owns exactly ten labelled fictional presentation entries aligned with Emma's current pages, polished bodies/properties/Day plans, not voice proof. It is preparing payloads while current mic/voice state remains unknown. The coordinator asked whether a session is running now and requested backend-owned read-only active-conversation metadata. Neither silence nor the user attribution establishes inactivity. New Starts are held, and no Journal POST clearance is granted yet. Do not stop a genuine session to seed or test the rejected transcript bypass again.

## Direct database replacement authorization

The latest explicit user instruction authorizes direct removal of existing demo Journal records and population of exactly ten prepared October 14–23 clearly labelled fictional daily artifacts. Main assigns the backend owner as sole live database writer, replacing only demo-user Journal and preserving context, profile, conversations, runtime and other owners. This supersedes the earlier seed-clearance hold for the replacement itself. The seed worker now owns prepared payload/manifest handoff only and performs no duplicate POST or database mutation.

The coordinator notified both existing owners of that ownership transfer and requested the exact post-replacement baseline/count/IDs/dates/provenance evidence. An existing genuine conversation may continue; no Stop, restart or additional Start is required to populate the demo. Active-session state remains unknown, not inferred inactive. Capture any actual conversation result separately from the authorized baseline replacement. The ten entries must never count as real agent or voice proof. Prior readbacks of the two raw-test entries remain historical evidence even after authorized removal. Replacement completion is pending the backend owner's concrete handoff.

## Agent-only frontend publication

The sole frontend owner supplied concrete public source `536a78d95b2486eaa76fa67874a59c53d7f842e3`, deployment `f968f7f7-6ba5-4f04-863a-58f55730247a`. The associated diff changes PinkApp, focused UI tests and a verification note. It removes `storeRecording`, raw transcript refs and save-on-Stop/closed/error, with no direct raw Journal POST fallback or capture-derived `original_text`. Actual WebRTC `createVoiceConnection`, owned session ID and actual delegation ID remain the capture/agent path. No SpeechRecognition or providerless adapter is used.

The existing agent callback maps messages, forwards abort, checks returned entry IDs/revisions, protects dirty drafts and refreshes records before returning response text. Read-only, aborted or unverified turns create no fallback entry. Owner reports 46 focused tests and compilation, plus public HTTP 200 and inspection of `app-R0MMlVUx.js` showing no `journal:voice-` fallback marker and the retained agent/delegation contract. No real service/provider/record mutation occurred during these checks. Held branding remains public.

This is frontend readiness, not spoken end-to-end proof. Backend prompt no-raw `original_text` default readiness and one real artifact-writing loop remain unverified here. Backend owner was asked for its concrete deployed prompt pin and ten-entry replacement baseline. The separate floating-voice-bar/no-ping request is sequential UI-only work, with no client/transport/data changes. No new human Start has been requested by the coordinator.

## Completed fictional history baseline

The canonical [seed manifest](demo-seed.md), reported SHA-256 `37d06c4ac00814a0e535406da8cd99a1f723a4766c5aca915bc89fd559023611`, documents backend-owned atomic replacement and cosmetic updates. Ten labelled October 14–23 fictional artifacts are saved at revision 2, source `app`, empty `original_text`, null voice/session links, final native bodies and accepted ratings/properties. Internal seed property keys are omitted and reported medicine uses a single medication string. Do not restore historical internal metadata. This is manual synthetic AI-composed artifact/persistence evidence only.

The original transaction at 14:35:45–56 UTC removed three existing demo-user records, `d674033d-c2ce-4ada-9c00-300550e747bc`, `6de24801-f382-484b-8cf9-a30afb2f9b30` and `49401299-5cb1-471b-8f85-22522cef8261`, then inserted ten revision-1 seeds. The backend preserved seven other-owner Journal rows and unrelated tables inside the transaction. Later cosmetic receipts/readback verify revision 2 for all ten. Outer device lease/conversation snapshots vary; do not claim those outer snapshots are byte-identical or attribute their changes.

Coordinator public GET `/journal?limit=100` at `2026-10-24T14:48:50.952846Z` returned HTTP 200, thirteen entries and null cursor. All ten canonical seed IDs match the final manifest at revision 2. Three later October 24 records remain preserved and unattributed: `a13574b3-33f6-4618-a4ae-5e91fd107dc6`, `e681c604-af75-425f-857c-c1caf57c3037` and `7f9ea00b-7271-42d2-99ef-41a27595788d`. Their voice-conversation/session IDs are null. The seed worker's eleven-row snapshot at 14:40:25 UTC is historical; two later records have since appeared. No extra cleanup is authorized or performed by this coordinator. GET context at `14:48:51.512397Z` confirms pages 4/3/1 and profile revision 0.

The ten full native payloads, IDs, creation/cosmetic operation mappings and readback evidence live in the canonical seed manifest and `backend/.deploy/demo-journal-final-rev2/{http-readback,metadata,cas-receipts-db-readback}.json`. Final semantic payload fingerprints and receipts match current DB/HTTP as owner-verified; original raw HTTP request bytes were not retained. These seeded operations must never be replayed as a live voice callback or counted as voice proof.

## Production prompt readiness gap

Backend owner verified authenticated read-only Vercel metadata for current production `dpl_BwahCqZmXetNR5d4YgVtyMat6xuJ`, Git SHA `e8c22dfc942e80e3ef0ab1241cf0ca0caeaba9b3`. Exact-source `prompts.ts` hash `253c9b730d0aa10483abea45f8fd87403cb24f48a237b709140465e6d3c68c8f` still requires an `original_text` transcript. Therefore the no-raw prompt correction is not deployed. Quota route content matches the accepted removal; historical CREATE date support is absent in this deployed pin.

A clean offline candidate based on `d30de37` plus only the three accepted prompt files has 74 passing tests, types and build as owner-reported. Main owns isolated Git pinning of those files. The coordinator reports actual current human-session state unknown and does not infer deployment/device clearance, stop a session, restart anything or run a provider probe. Next genuine polished-artifact test awaits concrete deployed prompt readiness and actual human coordination.

## Floating voice bar publication

The sole frontend owner published `0924f3e58167aeb29203fe4f4bc2d2020f76ce44`, deployment `d51a6f93-0260-44fb-9e4a-88c38aed4554`. The inspected edit changes presentation, scoped CSS, focused tests and notes, with no transport, agent/API/config/data changes. The fixed rose bar has a steady Listening indicator and no ping/pulse. Current visible controls are Start recording, Stop recording and Retry Stop, retaining existing handlers and durable retirement gating.

Owner reports 20 focused UI tests, compilation and read-only desktop/phone/editor/drawer/long-content checks. Public `/app` returned 200; served `app-D4Tb2l7o.js` retained the agent endpoint and lacked `animate-ping` and `journal:voice-` raw-fallback markers. Held branding and agent-only entry-ID readback remain intact. Actual screenshots are in `presentation/assets/kindalong-0924f3e5-floating-voice-{desktop,phone}-{journal,editor}.png`. They show real current data, including manually seeded history, not a microphone session. Physical-phone keyboard/safe-area and real mic/provider remain unverified by this UI task. No new Start, recording, provider or record mutation occurred in this publication check.
