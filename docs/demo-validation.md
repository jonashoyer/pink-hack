---
provenance: "Unvetted Synthetic"
---

# Demo validation

This document checks the planned demo story against the running product before the pitch is written. It separates what was observed from what other owners have reported and what is still untested. **Status: in progress. The demo story is not validated yet.**

## Pinned revisions and environment

Case revision: breast-cancer-centered Emma, three context pages. The new canonical seed manifest supersedes the earlier two-page evidence below. Corrected frontend `65f746ff2fa69255e0660d6c01da70ce975e4f66`, deployment `98d4193d-486f-4d7c-966e-9818336dbe04`, is published with Start voice enabled for initial human testing. No genuine spoken result is established by publication; the mic coordinator waits for the revised seed readback.

| Part | Revision | Source of evidence |
| --- | --- | --- |
| Backend source | `1bf7d24ceebd8ae706aacfee74624ffe3a7c77fc` (final pin, pushed to main) | Backend owner report |
| Backend deployment | `dpl_D4keCEU8SgHaPMTyzLEMuQdNKQ6u` READY; fixed https://pink-hack.vercel.app, immutable https://pink-hack-e6yzy81tk-quasr.vercel.app. Migration `20261024120532_wide_annihilus` applied, legacy rows and FKs preserved. | Backend owner report ([backend.md](backend.md)) |
| Lovable frontend | Published `65f746ff2fa69255e0660d6c01da70ce975e4f66`, operation `umsg_01m5py4fdse1hbg0dkdjk0t40k`, publish deployment `98d4193d-486f-4d7c-966e-9818336dbe04`, at https://pink-hack-journal.lovable.app/app. `VOICE_ENABLED=true`; Stop, `backendStopped` and Retry Stop are wired. Earlier pins: op6 `f648b423` (storage E2E), `381ae914` (old auth). | Writer report: anonymous 200; served asset contains the Stop strings; 38 focused mocked tests; real temporary page save, reload and archive (`c4315906…`, archived at rev 2). Seed pages stayed at rev 1 and the Journal was empty. **No Start, session or provider action yet.** Known limit: a startup failure before any session exists can show Retry Stop with false flags. That is not a stopped receipt. |
| Atech firmware | Flashed: SHA-256 `35834e85…1410d2a`, volume 0.4, ESP32-S3 rev 0.2. An 8 KiB WiFi build passed but is **not flashed**: the Mac sees no USB device after replug, and ROM recovery is being worked through with the user. No WiFi, token, Live or write proof. | Hardware owner report via Main. Proven: local mic/speaker capture and playback only, which remains the device fallback for the pitch. Latest (reported ~15:3x): the deferral and toggle build passed upload, boot and auth. The device still disconnects before listening: no PCM and no Journal write. **No physical voice claim.** |

## Observed by this worker

| Time (CEST) | Check | Result |
| --- | --- | --- |
| 13:55 | `GET /health` | 200 `{status:"ok"}` |
| 13:55 | `GET /api/v1/context`, no cookie or token | 200, `profile.owner_id:"demo-user"`, **0 pages** |
| 13:55 | `GET /api/v1/journal?limit=100`, no cookie or token | 200, **0 entries** |
| 13:55 | `GET /api/auth/get-session` | 404 (auth removed) |
| 13:57 | Open the preview URL in T3 browser (incognito and default profiles) | **Redirected to lovable.dev login** ("Internal Lovable project"). The app UI was not reachable. |
| 14:3x | Anonymous `curl -L` of https://pink-hack-journal.lovable.app/ and `/app` | Both 200, 0 redirects |
| 14:3x | Incognito T3 browser, landing page | Title "Pink Hack — Your day, in your words."; copy: flexible journal for life after cancer treatment, context pages, Journal, day plan; shows "App integration in progress". No voice, device, statistic or clinical claim. Screenshot timed out. |
| 14:21 | `GET /api/v1/context` and `/journal`, no token | Exactly the two seeded pages at revision 1: `578460c0-8796-4e86-94b3-424022f6259e` "What I want to track (demo)" and `be00b449-8435-461b-bd33-d28957168fb9` "What helps me (demo)". Journal has 0 entries; profile revision 0. |
| 14:23 | Incognito T3 browser, https://pink-hack-journal.lovable.app/app (read-only) | Loads without login: "Server connected"; sidebar shows "What helps me (demo)" and "What I want to track (demo)"; Journal "No journal entries loaded"; banner "Shared demo — use fictional information. Everyone can see these entries."; "Voice is temporarily unavailable." No interaction performed. *This predates publication of `65f746ff`, which enables Start.* |
| 14:49 | `GET /api/v1/context` and `/journal`, no token | Exactly three pages: `578460c0…` "What I want to track (demo)" rev 2, `be00b449…` "What helps me (demo)" rev 2, `70a2f3a4-15af-47bb-8923-a9eeaef08373` "My breast cancer recovery (demo)" rev 1. Journal 0 entries; profile rev 0. Matches the Status owner's three-page manifest ([demo-seed.md](demo-seed.md)). The earlier two-page rev 1 Anna case is superseded. |
| 15:23 | Landing showcase published (writer report): source `919d8ed59587495a56cad6c1a402f2b2f4608de7`, deploy `86d524d8-75d5-4c76-ae9b-1be95fc540e1`; `/app` app code restored byte-for-byte to `65f746ff` | Anonymous `/` and `/app` both return 200 (this worker). The desktop screenshot was inspected and saved as `presentation/assets/landing-here-with-you-919d8ed5-desktop.png`. It shows: "Here With You", "A companion for life after breast cancer.", "App integration in progress", the shared-demo notice, and a device concept labeled "Device connection is being tested". It contains no dose, statistic or outcome claim. The 15:14:47 publishing target was missed; the page was published by 15:21:58. |

Deck asset notes: `presentation/assets/web-home.png` is captioned "Final visual prototype · example data". It shows an "Overall health 7/10" rating and symptom trends, which the app doesn't have. It may only be used labeled as a design prototype, never as the app. `listening-line.png` is the brand mark.

**Branding update (user):** the product is now **Kindalong**, with the earlier pink/rose theme, in both Lovable and the deck. "Here With You" and Airy Sage are superseded. `landing-here-with-you-919d8ed5-desktop.png`, `web-home.png` and `listening-line.png` carry the old brand and must not be presented as current. The deck waits for the Lovable writer's Kindalong source and a real screenshot.

| 15:3x | Kindalong published (writer report): source `a3fc982cbf666e963c5eeef7eb10428dc984940b`, deploy `bc2ab442-b0d5-4acc-a4c9-1cc6ad8b3b62`; only brand, palette and assets changed, app behavior unchanged | Anonymous `/` and `/app` return 200 (this worker). Screenshots inspected visually and saved as current deck assets: `presentation/assets/kindalong-landing-a3fc982c-desktop.png` (pink theme, "A companion for life after breast cancer.", "App integration in progress", shared-demo notice, labeled device concept) and `presentation/assets/kindalong-app-a3fc982c.png` (sidebar with the three demo pages, empty Journal, "Server connected", Start voice visible, Voice closed). The landing capture shows the fallback CTA before hydration. Mobile captures are writer-reported only. |
| ~15:4x | **First human Start** (mic coordinator `mcp:1e1bffb3`, see [mic-test.md](mic-test.md)) | **Failed with 429**: "The hourly voice initialization limit has been reached." The UI showed Voice Error and Retry Stop, with provider finalization not confirmed and backend retirement not confirmed. The quota rejected the request before any session or provider was created, so there is **no transcript, write or Stop proof**. The backend owner removed the quota and deployed `dpl_3RPxVYsSXfwcTEUrc3DBVH4QGpvr` (base `f932d52` plus voice-route and test changes; 65 tests reported passing; no production provider probe). The next human attempt waits for the Status owner's rev 3 tracking manifest. Readback: pages at 3/2/1, Journal 0. **Update:** `dpl_3RPx…` is READY, and tracking rev 3 is verified by the backend owner. The one controlled retry belongs to the coordinator. Check-in is confirmed done. |
| 15:54 | `GET /api/v1/context` and `/journal`, no token | `578460c0…` "What I want to track" rev 4, `be00b449…` "What helps me" rev 3, `70a2f3a4…` "My breast cancer recovery (demo)" rev 1. Journal 0. Main independently matched the v4 manifest. The 13:44 rev 3 halt is historical. Device: authenticates to a local backend, but disconnects (RFC1002) before listening or PCM; no device-to-Journal claim. |
| ~16:0x | Atech physical connection (hardware owner report) | With the corrected auth-header CRLF, firmware `5e3046c…` reaches wss_connected, then baseline, then connecting, then **LISTENING**, through a pinned Mac backend, tunnel and Azure Live. Session `b7f15241-26fc-4715-92fe-04ca9f05e058`, attempt 1, no faults, PCM 0 before the user speaks. **Device gate: connection proven (owner-reported); speech capture to save is pending.** Vercel physical route not tested. No transcript, entry or readback yet. Do not restart or redeploy the active runtime. |
| 16:19 | `GET /api/v1/journal`, no token | **Two entries**: `d674033d-c2ce-4ada-9c00-300550e747bc` "Voice entry · Oct 24, 2026, 4:15 PM" (hello/test) and `6de24801-f382-484b-8cf9-a30afb2f9b30` "… 4:16 PM" (fatigue 3, brain fog 5, body pain 2). Both rev 1, source app, `properties {}`, voice_conversation_id and session_id null, no Day plan. They are not the ten seeds. **Backend read-only correlation (owner):** these are direct REST Journal writes. Each has exactly one operation receipt (`69e77157…`, `8a4ae34b…`), zero matching agent_delegations or browser_voice_tool_calls, and null conversation and session. Context revisions 4/3/1 are mutation-time stamps, not proof the model used them. **Persistence proof only.** Dictation or input provenance awaits the writer or coordinator. Not a voice, agent or Day plan claim. **User correction:** raw transcript rows are not the intended outcome; the intended outcome is an agent-written entry with tracked values and a Day plan. The backend owner archives exactly these two unchanged rows, which are not retained as demo examples. The frontend and backend owners are correcting the bypass. Raw evidence stays private in `backend/.deploy/`. |
| 16:37–16:40 | `GET /api/v1/journal` and a read-only Playwright capture of public `/app` (load the page, click one existing title; no save) | **Ten seeded fictional entries**, Oct 14–23, `f5f6e0c2…` through `77dc8324…`. These were the user-directed direct DB replacement by the backend owner; the two raw rows are gone. They are now rev 2 after a cosmetic property cleanup (Oct 23 updated 14:37:48Z), with properties fatigue, pain, sleep_hours, appetite_loss, overall_health and medication. Each body says "Fictional demo entry… seeded for the presentation, not recorded through voice" and has a Day plan. **There is also an 11th row**: `a13574b3-33f6-4618-a4ae-5e91fd107dc6`, "Oct 24, 2026, 4:38 PM", created 14:38:35Z, source app, `properties {}`, conversation and session null, text "Uh .I am feeling Uh .five out of ten fatigue today". Its provenance is unverified, it is not a voice proof, and it is kept untouched. Captures: `presentation/assets/kindalong-entry-20261023-seeded-1637.png` (slide 3) and `kindalong-journal-seeded-1637.png`. |

Independent reviewer (reported, ~14:30): in T3 without login, they opened `/app` and clicked each demo page. Each page rendered its exact saved paragraphs, and both stayed at revision 1. Start is visibly unavailable before the client copy. No writes were made. **Rendering of the demo pages (G2/UI) passed.** This is not spoken-write proof. The final bounded backend review found no further high-signal defect and approves the frozen client plus one genuine loop. The backend gate is closed; the remaining gate is the sole writer enabling Start after the corrected wiring, then one genuine spoken loop.

No writes were made by this worker.

## Blocking issues

1. **Resolved for the landing page:** the public landing at https://pink-hack-journal.lovable.app/ (source `822c5410`, Lovable deployment `33b15b63`) opens anonymously. The `id-preview` URL still requires a Lovable login; `/app` on the public host is the candidate app link. Its API CORS check is with the audit owner. Earlier note: Anonymous access to the `id-preview` URL is blocked. The user has now authorized publishing a minimal public landing page through the sole Lovable writer. The published URL and anonymous access still need verification by 15:00 Europe/Copenhagen; this preview is not a verified public submission link.
2. **Breast-cancer case replacement verified.** The two owned pages are at revision 2 and the recovery page is at revision 1. Full saved content and public context match [demo-seed.md](demo-seed.md). Journal remains reserved for genuine voice output.
3. **Independent UI validation is blocked for this worker.** No Lovable MCP or `localhost:8080` harness is available in this session. UI acceptance relies on the frontend writer's evidence until one of those is available.

## Revised breast cancer case readback

The seed worker updated the two owned pages and added the recovery page. Status independently verified fresh page GETs and public all-page context against the full native payloads in [demo-seed.md](demo-seed.md):

| Page | ID | Revision |
| --- | --- | --- |
| My breast cancer recovery (demo) | `70a2f3a4-15af-47bb-8923-a9eeaef08373` | 1 |
| What I want to track (demo) | `578460c0-8796-4e86-94b3-424022f6259e` | 2 |
| What helps me (demo) | `be00b449-8435-461b-bd33-d28957168fb9` | 2 |

Both updated pages kept their IDs. Exact PATCH retries did not duplicate or increment them again. The worker's Journal baseline remained zero and profile was unchanged. Original seed/story evidence is preserved in [case history](demo-case-history-2026-10-24.md). Notion Demo and deck outline were re-fetched after the breast-cancer rewrite. This closes case alignment and API persistence; microphone speech/save/readback remains unproven.

## Story under validation

Reconciled with the live Notion Event context, current research and the user's breast-cancer correction. The [canonical script](demo-script.md) uses **Emma, The Compounding Burden**, consistently as a fictional composite.

- Emma has finished active hospital treatment for breast cancer and is eighteen months into ongoing prescribed hormone therapy. Joint pain, fatigue and worry compound each other between oncology appointments.
- Her goal is a short account of physical and emotional experiences for her next follow-up and a manageable everyday plan using her own preferences.
- The demo's existing letrozole 2.5 mg daily prescription and three o'clock sister call are explicitly synthetic scenario details. They are not inferred clinical facts or treatment recommendations.
- The three-page case is My breast cancer recovery (demo), What I want to track (demo), and What helps me (demo). Exact canonical identities and revisions are maintained in [demo-seed.md](demo-seed.md).
- The spoken request records fatigue 6, hand pain 7, five hours' sleep, worry about follow-up and a medication self-report, then requests direct Journal saving and a Day plan. No mandatory confirmation workflow or Notion product storage remains.

Case alignment and persistence are separate from genuine voice proof. The mic coordinator verifies the new case after the seed manifest; no Journal output is fabricated.

### Citation check

- Kim, Chen, Reid. *Current and future advances in practice: aromatase inhibitor-induced arthralgia.* Rheumatol Adv Pract 2024;8(2):rkae024 (PMID 38601139). The abstract, retrieved via PubMed E-utilities, reports **mean AIA incidence 39.1%** and **mean discontinuation due to AIA 9.3%**, and calls AIA "a frequent AI toxicity contributing to non-adherence and discontinuation."
- The Notion statement that "roughly 1 in 5 women quit" is **not supported** by this source and is not used in the pitch.

## Voice blockers reported by the readiness auditor

Reported by auditor thread `e8b461f1`, positions 50–53. The backend owner (`dac033a2`) owns the fixes. This worker did not reproduce them, and runs no new probe or rehearsal until they are fixed.

- **Duplicate writes on callback retry.** Two in-memory agent runs had the same delegation ID and different generated tool-call IDs. They produced two Journal entries (`sameEntry:false`, `entryCount:2`), because the mutation ID includes the provider tool-call ID (`voice/agent.ts`, `voice/tools.ts`).
- **Stop leaves the backend conversation active.** Browser `close()` sends only provider `session.close`, `POST /voice/sessions/:id/stop` returned 404, and the conversation state stayed `active`. `stopVoiceConversation` has no production caller, and device stop doesn't persist state either.
- **The audited Lovable revision `381ae914` still uses the removed session routes.** Op6 is meant to replace it.

Frontend writer update: op6 validates the no-login UI and storage, plus one browser transport start/close. After that, the writer will copy in the fixed client once the backend owner deploys the durable replay fix and `/voice/sessions/:id/stop`. Until a rehearsal on that fixed build passes, voice writing and Stop are not presented as validated. Evidence from the affected build doesn't count.

## Backend fix evidence (OWNER-REPORTED, final pin)

Not independently re-run by this worker. The backend owner reports that 64 tests, types and build pass. Coverage includes retryable no-write recovery, replay without rerunning the model, crash recovery, stale fencing, and Stop/cancel boundaries. Read-only checks against the deployment also passed: callback replay, changed-message 409, idempotent Stop 200 with the stopped state persisted, late agent call 409, and public-origin CORS (GET 200, OPTIONS 204, no credentials). No spoken provider loop was run. The two voice blockers above are **fixed as reported**. Stop semantics: `close()` returns `{confirmed, backendStopped}`. `confirmed` means only that the provider finalized. `backendStopped` means only that backend writing was revoked persistently. An in-progress commit may still win the database boundary; a saved entry survives Stop. Voice writing is still **not demonstrated** until the frontend copies the frozen client, shows both Stop flags (`confirmed`, `backendStopped`), and runs one genuine spoken loop.

## Op6 evidence boundary

- Accepted as reported: no-login UI and REST storage at `f648b423`, 93 tests.
- **Browser voice: not proven.** The browser hit an ICE timeout before the voice-session POST, so op6 gives no voice startup proof and no voice write proof.
- Gate rule: a fallback recording counts only if it shows a real validated run. If none exists, nothing substitutes for a failed live voice write. The pitch then drops the voice-write claim rather than showing an unvalidated or mocked recording.

## Deck rules (from Main, 14:20)

- The live voice-write gate (G3) covers every statement, slide and demo action that implies voice writing, not only the line "everything was live".
- The medical small print says the assistant is "instructed not to" diagnose or advise on treatment.
- The fallback recording (G10) exists only after a validated run has been recorded.
- The landing page (15:00) and the app demo (16:30) are separate links with separate checks.
- The pilot's duration is presented as a proposal.

## Delivery decisions

- Latest user priority is a minimal public Lovable landing link first, then the main app/backend. At 14:01:47 CEST the user said one hour for the link; use the existing 15:00 Europe/Copenhagen check-in as the practical deadline. Landing publication is authorized and belongs to the sole Lovable writer, sequentially after active op6. This supersedes the earlier publishing approval gate. No form submission is authorized. A published landing is not evidence of a working voice demo.
- Persona 1 is acceptable narrative grounding. Present it as a composite, never as patient validation.
- Prefer a concise problem description to incidence statistics. Omit the unsupported "1 in 5" claim.
- The latest user instruction authorizes revision of the two owned synthetic pages and addition of one explicit breast-cancer recovery page. The fictional prescription detail is labelled as an existing scenario prescription, never advice. [The seed worker](demo-seed.md) owns exact revision/operation/readback evidence. Preserve unrelated records and genuine Journal output.
- Keep browser voice and physical device evidence as separate claims.

The new top-level [Opus demo/outline thread](t3-thread://v1/mcp:ce64b6d8-c0c2-4150-ba33-578611d7a04e) owns `docs/demo-deck-outline.md` and can improve the planned story and draft slide outline now. The existing Demo worker retains this validation document, the demo script, and eventual deck execution. A finished deck must match the validated candidate. The outline thread does not edit frontend/backend/firmware, run paid probes, seed records, publish, submit forms, or add a Presentation status row.

## Pending

- ~~Landing gate~~ **Passed:** public landing anonymous 200 with the expected copy, independently confirmed by Main. Visual desktop/mobile smoke is reported by the writer only (snapshots timed out here). The app link `/app` is still gated on public-origin CORS, the fixed backend deployment, the stop-aware client and one genuine voice loop.
- Corrected backend (durable replay and `/voice/sessions/:id/stop`) deployed, the fixed client in Lovable, and one post-fix voice-write E2E coordinated by review thread `c2ad9013`.
- Final hostname, then an anonymous GET/OPTIONS/CORS check by the separate audit owner.
- Corrected `demo-deck-outline.md` (team names, hook, pilot wording, fallback).
- **Historical two-page G2 evidence, before the breast-cancer correction.** The seed worker created exactly two retained pages: `578460c0-8796-4e86-94b3-424022f6259e` (operation `demo-seed-anna-track-20261024-v1`) and `be00b449-8435-461b-bd33-d28957168fb9` (operation `demo-seed-anna-helps-20261024-v1`), both at revision 1. Its readback matches the demo-script quotations ([demo-seed.md](demo-seed.md)), and this worker confirmed both by GET at 14:21. Seen in the public `/app` sidebar at 14:23. Do not delete them.
- Story provenance is reconciled to the live Notion event/research pages and the user's breast-cancer-centered correction. The older Anna alias and granddaughter scenario are superseded; historical evidence remains in [case history](demo-case-history-2026-10-24.md).
- The one live mic test is coordinated by thread `mcp:1e1bffb3-737b-4d88-b24c-f0c9a4ccd80b` ("Public app microphone test"). The frontend writer keeps all Lovable wiring and fixes. This worker sent the demo request and the evidence list at 14:4x and runs no session of its own. The deck waits for that thread's transcript, timing, entry, readback and Stop result.
