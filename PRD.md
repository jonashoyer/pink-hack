---
provenance: "Unvetted Synthetic"
---

# Kindalong product requirements

## Approved interface direction

The user's latest selected identity is [Kindalong](design/README.md), using the previous pink/rose theme. The Here With You name and Airy Sage palette are superseded. Kindalong branding is published on the existing landing and app at source `a3fc982cbf666e963c5eeef7eb10428dc984940b`; this rebrand did not change app behavior or layout. The selected listening-line geometry, **Home / Journal / Symptom** navigation, and self-reported daily overall health rating remain the approved interface requirements. That document is the single visual specification. The navigation, rating, and trend views still need the [in-place migration](design/lovable-handoff.md) and runtime verification; this repository contains design references and backend code, not the external frontend's route components.

The developer's latest instruction removes Better Auth and uses one fixed server-owned user ID. The app opens directly into the shared demo journal, without accounts, sign-in, cookies, or user-session tokens. Direct voice-agent writing remains: no stored proposal, required draft review, or separate check-in approval workflow. [The coordinator brief](docs/flexible-pages-journal.md) records the corrections.

## Goal

Build Kindalong around daily voice notes, a Journal, symptom trends, and a self-reported daily health rating. Retain user-created context pages and one fixed Journal database. Each entry has flexible properties and an editable BlockNote page body. The assistant uses the person's pages to guide a conversation and writes new entries or changes existing content directly in response to their requests. A day plan is ordinary content inside the entry.

The event demo centers on women living with the lasting effects of breast cancer treatment between oncology appointments. Its fictional composite Emma records fatigue, joint pain, worry and medication self-reports alongside everyday priorities. [The demo script](docs/demo-script.md) defines the breast-cancer case. Page names, questions and journal properties remain user-chosen; this demo does not turn them into fixed clinical categories.

Lovable is the frontend. The existing Hono/Node backend provides page and Journal operations for the fixed demo user. Hosting is the existing [Vercel Pink Hack project](https://vercel.com/quasr/pink-hack); the existing Turso database is the sole deployed storage. Azure `gpt-live-1` remains the voice provider. There is no Notion product integration or new database deployment.

## Fixed demo user

The backend assigns every app request and device conversation to `DEMO_USER_ID = "demo-user"`, exported from `backend/apps/server/src/demo-owner.ts`. Clients do not choose or send an owner ID. Initialize the fixed user row idempotently to satisfy existing record references, and preserve legacy users and data. Existing device transport credentials remain bound to the fixed user and do not require an account or login.

This is an expedient hackathon design: all visitors share the same pages and Journal. A future personal product would need separate users and access control. Keep provider/database credentials server-side, record scoping, input validation, revision checks, and retry protection in the current demo.

## App

The primary desktop sidebar and phone bottom navigation both contain Home, Journal, and Symptom. Home shows today's self-reported rating, recording action, and note preview. Journal opens dated editable notes. Symptom shows the selected period's individual or combined symptom trends. Existing context pages remain available through secondary settings; preserve their records and the assistant's use of them. Pages and entry bodies use the same standard BlockNote React/shadcn editor. Save native block JSON and reload it into that editor. Plain text for model context is derived from the saved blocks.

Journal presents dated entries and their editable body as in the approved screenshots, retaining date/title/source metadata and flexible properties in the data model. The earlier table layout is not a second required design. Day-plan headings, paragraphs, and checkboxes live in the body, without a separate plan table or acceptance screen.

Overall health is explicitly self-reported on 1 = very poor through 10 = very good, with missing values shown as Not rated. Symptom severity uses a separate 0 = none through 10 = severe scale where applicable. All overlays compatible individual symptom series without an aggregate health calculation. The design spec defines missing observations, dates, and source rules. Stable symptom metadata and one source of truth for a daily rating across multiple entries need implementation alignment; the screenshots do not add a backend API or schema. Do not derive ratings from qualitative speech or seed the illustrative 7/10 in real records.

The voice agent composes the final Journal entry from the conversation, saved persona/profile, context pages and tracking preferences. Speech and transcripts remain working conversation context by default. The app must not directly POST a raw recording transcript as a Journal entry or put it into durable `original_text` by default. The saved artifact is an organized native BlockNote note, with explicitly requested self-reported metrics and a manageable page-informed Day plan when requested. The assistant claims saving only after that artifact is persisted.

The user can still create normal editor entries and edit pages or Journal entries directly. The separately authorized ten clearly labelled fictional manual demo entries remain permitted. Neither normal editor writing nor fictional seeding is evidence of an agent-composed voice save. Normal unsaved editor text can remain locally while editing or recovering from a failed save; that is not a stored agent proposal workflow.

## Direct voice flow

1. The user starts the assistant. The backend uses the fixed demo user and its voice conversation.
2. The agent reads the saved persona/profile, all live owned context pages, tracking preferences and relevant journal history.
3. It uses speech as working context and composes the final native BlockNote artifact requested by the user, retaining physical and emotional experiences, explicitly requested metrics and any requested page-informed Day plan.
4. The agent creates that artifact through Journal POST or updates the selected entry through Journal PATCH. The recording/transcript control must not bypass the agent with a raw-transcript POST.
5. The backend validates the owner, content, operation ID, and expected revision, then persists the write to Turso.
6. The assistant reports the actual saved result. Later corrections are direct updates to that entry.

The agent composes tool arguments in its conversation context. It does not create a held server-side proposal or require a draft/confirm/commit sequence. It asks a conversational clarification when intent or the target entry is ambiguous.

Stopping voice prevents further actions. It does not silently undo entries already saved. Those remain ordinary editable Journal entries.

## Shared API

| Operation | Purpose |
| --- | --- |
| Page list/read/create/update/archive | User-owned custom context pages |
| Journal GET | Browse or retrieve saved entries |
| Journal POST | Create an entry directly |
| Journal PATCH | Update current content/properties directly |
| Voice session and agent callback | Audio lifecycle, context, and direct journal tools |

[Detailed contracts](docs/app-structure.md) are shared by the voice agent, app, and device integration. The agent tools are `create_journal_entry` and `update_journal_entry`, using the same services as the app. Existing check-in records/routes can remain as legacy compatibility data; they are not required by the new flow.

## Requirements

- Context pages have arbitrary titles and native BlockNote content, without mandatory page kinds.
- The assistant uses all live owned pages, tracking revisions and reporting context limits explicitly.
- Journal properties accept bounded text, finite numbers, booleans, null, or lists of those values. Missing properties remain absent.
- Day-plan edits preserve unrelated blocks and properties.
- Every write uses the server-owned fixed user ID and validates its input. Request bodies and headers cannot select a different owner.
- Journal updates require the current expected revision. A stale write conflicts instead of replacing newer content.
- A stable operation ID makes retrying a write return the original result. The same ID with changed content conflicts.
- The agent announces successful saving only after a storage response confirms it.
- Raw speech is working context, not the durable Journal body or `original_text` by default. The voice path saves the agent-composed artifact using the person's saved context and explicit tracking choices.
- Failed requests report failure honestly. Conversation working text and normal local editor text can support retry without a separate proposal resource.
- Provider and Turso credentials remain server-side. Root `.env` supplies existing Turso `DATABASE_URL` and `DATABASE_API_KEY`, with token mapping verified by the backend owner.
- Preserve legacy records during the transition. Do not delete old data merely because the active API is simpler.
- The assistant organizes self-reports and planning; it does not diagnose, change treatment, or invent missing observations.

## Owners and current evidence

The [backend owner](t3-thread://v1/dac033a2-a1c4-48ee-a7cb-39cb86afe1a7) retains source, migration, runtime, and deployment work. The sole Lovable writer owns remote UI changes in canonical testing project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5`. The coordinator owns the change brief and status; this thread owns PRD/contracts reconciliation.

The fixed-user backend is verified at `https://pink-hack.vercel.app`, deployment `dpl_DPC2xZNK5MY8tVpVcWELTqs5SHKy`. The owner confirmed no-token context retrieval, direct Journal POST/reload/PATCH, exact retry, changed-payload and stale-revision conflicts, owner-selector rejection, and removed auth routes. All 51 tests, types, and build pass. Turso data is preserved with no schema changes. Device provision needs no user account; private-token WSS open/stop passed without starting a provider session. [Backend documentation](docs/backend.md) records the details. The sole Lovable writer is applying the no-login revision.

The following audio evidence describes the previous build and does not establish real voice behavior after the fixed-user cutover.

Production HTTPS and authenticated WSS are verified on the same `https://pink-hack.vercel.app` service, deployment `dpl_Ak43VzrcBBiwjuD27reY4y6e4WNF`. The backend owner verified Turso direct Journal writes and a real Azure Live 16 kHz PCM roundtrip using synthetic speech: 132,200 input bytes, 256,000 output bytes, and an agent-saved `source:"atech"` entry at revision 1. Owned HTTP reread confirmed the heard synthetic garden wording and BlockNote content, with no errors. Source is integrated in `99c316c`; verification notes are committed in `4d45f10`. The owner reports 51/51 tests, workspace types, and build passing. Lovable browser voice and actual Arduino capture/playback remain runtime checks for their owners. The 300-second device-function reconnect path has not been runtime exercised.

The fixed-user backend deployment and no-token persistence checks are complete at source `e2d33ad`. The backend owner removed only the exact new synthetic test records/device claim after verification and preserved legacy data. No-login Lovable integration and physical device audio remain with their existing owners.

The original [independent voice audit](docs/demo-validation.md#voice-blockers-reported-by-the-readiness-auditor) found callback retry and Stop defects. The backend owner has corrected and deployed them at source `1bf7d24`, with 64 tests and deployed replay/Stop/public CORS checks reported passing. The corrected Lovable client is published for initial human testing. A genuine spoken save and readback remain required to validate the integrated breast-cancer demo.

The [breast cancer demo story](docs/demo-script.md) uses the current Notion composite Emma to join physical symptoms, emotions, a reported prescription and everyday plans in one record between oncology appointments. It is a synthetic scenario, not a patient account or evidence of clinical outcomes. Presentation follows the validated candidate; broader user-chosen journaling remains supported.

## Acceptance

Verify adding unfamiliar context pages, saving/reloading native blocks, and a page-informed voice conversation that directly creates a final Journal artifact with explicit requested properties and a manageable Day plan. Verify the recording control cannot create a raw-transcript entry, that raw speech is not persisted in `original_text` by default, and that the saved claim follows the actual artifact write. Verify a direct Day-plan update preserves the rest of the page. Normal user-authored editor entries and the ten authorized fictional manual examples remain supported.

Verify requests without cookies or user tokens, rejection of client-supplied owner changes, inaccessible legacy-owner records, duplicate retry behavior, stale revision conflicts, failed-write feedback, and stop/interruption preventing subsequent actions. Real microphone/speaker and application-agent checks are distinct from access-only session startup.

The confirmed hardware is Atech Big Kit's 14-port board, with microphone on ports 1-2, speaker on 13-14, button on 3, and light grid on 4. The Atech owner has SDK physical testing in progress. The backend's authenticated endpoint is `wss://pink-hack.vercel.app/api/v1/device/audio`, verified with synthetic 16 kHz PCM speech and direct Journal persistence. Physical capture/playback and device integration remain unverified. The synthetic demo-device claim was released after closure so the real owner can provision privately. Follow [the device guide](docs/atech-firmware-guide.md) and [actual backend/device contract](docs/backend.md); do not duplicate the paid startup test or provision another synthetic singleton.

The existing Turso database is the only deployed storage. Cleanup of obsolete non-Turso resources remains with its assigned worker, preserving the app and Turso data. A complete deployed demo candidate has not been established by this document.
