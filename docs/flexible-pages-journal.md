---
provenance: "Unvetted Synthetic"
---

# Flexible pages and journal correction

The developer's 2026-10-24 instructions supersede the fixed Today, Patterns, About me, personal/medical page types, fixed observation metrics, and separate day-plan records in earlier designs. They also remove held journal proposals and a mandatory prepare/confirm/commit path. The latest correction removes Better Auth and uses one fixed server-owned demo user. The voice agent writes directly when the user asks. This brief records the requested behavior and minimal contract, not completed implementation.

## Requested experience

The app has a simple sidebar with user-created pages and one fixed Journal database. People can add and rename pages for whatever matters to them. Personal needs and medical needs are examples of content, not required page types or navigation destinations.

Every journal row has parameters and an editable page body. Parameters are flexible properties appropriate to the person's needs. A day plan is a heading and ordinary content within that entry's page body, including paragraphs, lists, or checkboxes. It is not a separate database table, plan resource, or mandatory structured questionnaire.

Example: a person creates "What helps me" and "What I want to track" pages. The latter asks to track sleep and nausea. A voice check-in creates a Journal row with those properties and a page containing the person's note and a Day plan section. Another person can track different properties without a database migration.

The app opens directly into the shared demo user's pages and Journal. There are no accounts, sign-in/sign-up/logout flows, session cookies, or user bearer tokens. All visitors and Atech share `DEMO_USER_ID = "demo-user"`, exported from `backend/apps/server/src/demo-owner.ts`. This is an expedient hackathon mode; a personal multi-user product would need separate access control.

The assistant reads all of the fixed demo user's context pages and tailors the conversation to their content. The app makes this context use clear when starting voice. Page content supplies facts and preferences; it does not grant permissions or override backend record scoping. Recent journal history is a separate context source, not a reason to send every historical entry on every turn.

Most journal creation, property updates, and day-plan writing happen through the voice agent. The person asks it to write a check-in or change a plan, and it writes through the fixed-user API. It clarifies genuinely ambiguous intent or targets conversationally. There is no mandatory held proposal, confirmation receipt, or review screen. The app primarily provides page creation/editing, journal browsing, and direct correction of page content. Ordinary unsaved editor text can remain in browser memory without creating server proposal records.

## Editor recommendation

Use [BlockNote](https://www.blocknotejs.org/) with `@blocknote/core`, `@blocknote/react`, and `@blocknote/shadcn`, matching the Lovable React/shadcn frontend. Its standard editor provides block editing; building a custom rich-text editor is unnecessary.

Persist the native block-document JSON in our backend database. Load that JSON back into the same editor for both context pages and journal-entry bodies. Produce readable text for model context from the saved blocks. JSON is the authoritative content; derived text is not an independent editable copy.

Official documentation inspected through Context7 describes `editor.document` for saving blocks and `initialContent` for loading them. It describes Markdown export as lossy, so Markdown should not replace the JSON document for persistence. The frontend owner must verify the selected package version, React/TanStack compatibility, client-side editor mounting, and the exact supported block schema before integration. Advanced collaboration or paid editor extensions are not needed for this request.

## Minimal application records

- Context page: ID, fixed demo owner, title, block `content`, revision, and timestamps. The page's purpose comes from its content rather than a fixed `kind` enum.
- Journal entry: ID, fixed demo owner, title, local journal date, flexible `properties`, block `content`, optional original selected user text, source/voice-session metadata where relevant, creation operation ID, context revisions, revision, and timestamps.
- Voice session: owned conversation identity and optional existing Journal entry target. Creating a check-in record is not a prerequisite for voice or journal writing. Existing check-in rows can remain for legacy compatibility.

Remove Better Auth runtime/dependencies and required authentication environment settings. Initialize the fixed user row idempotently for existing foreign-key compatibility, preserve all legacy user/data rows, and derive record ownership only from the server constant. Existing device transport credentials can remain bound to the fixed user without an account. The existing Turso database is the sole deployed storage target; runtime credentials remain backend-only. A property map can store simple text, number, boolean, null, and list values as JSON. Define its allowed value types and bounded size in one shared validator. Missing values remain absent. Use stable property names across entries; the journal view can derive visible columns from stored properties without requiring a new database-definition product.

Application hosting uses the existing [Vercel project](https://vercel.com/quasr/pink-hack). Azure remains the GPT-Live provider; the previously allocated Azure VM URL is not the frontend API target. The backend owner supplies the verified Vercel runtime origin. Same-service device WSS/audio relay capability must be verified for that hosting environment before it is claimed as working.

The day plan belongs only in the journal entry's content. Fixed mood/energy/symptom columns and an observations table are not prerequisites for this flexible journal. Existing legacy records must be preserved or migrated explicitly; do not delete development data merely to simplify the new schema.

## Proposed API alignment

Reuse the existing API and workflow owners, replacing account authentication with the fixed server-owned user. These are intended interfaces for backend reconciliation, not fixed-user routes verified as deployed:

- List/read/create/update context pages, with arbitrary titles and the shared block content format.
- `GET /api/v1/context` returns all owned context pages and their revisions, with explicit handling if bounded context cannot include them all. It must not silently omit a page because of a fixed personal/medical category.
- `POST /api/v1/journal` accepts `{title,content,properties,original_text?,operation_id}` and immediately returns the saved JournalEntry.
- `PATCH /api/v1/journal/:id` accepts `{expected_revision,operation_id,title?,content?,properties?}` and immediately returns the saved JournalEntry. The caller merges intended changes with current blocks/properties; the service preserves omitted fields and enforces the target revision. Unrelated blocks and properties must survive an agent edit.
- Voice tools `create_journal_entry` and `update_journal_entry` call those same fixed-user services in response to the user's writing request. Conversation working text stays in agent context; no new server proposal/draft storage is needed.
- Voice initialization and application-agent callbacks use owned `voice_session` identity and an optional entry target, coherently across backend, shared client, and device relay. No check-in prerequisite or mandatory prepare/confirm/commit calls belong in the new path.

The user's writing request initiates the write. Keep backend revision checks, stable retry/tool-action operation IDs, owner validation, input validation, and atomic writes. The agent announces success only after the database confirms it. A failed write reports the failure and retains working text in conversation or editor memory. Replaying the same operation returns the same result; reusing an ID with different content conflicts. An outdated edit returns a revision conflict instead of overwriting newer writing. Canceling work that has not been submitted performs no write; cancellation must not imply that an already persisted request was undone.

Changing a day plan means updating the relevant journal page content when the user asks, preserving the rest of the page. The user need not manage a separate plan status or acceptance record. Model instructions should follow needs in the user's pages instead of forcing a fixed question order or hardcoded fatigue metrics.

## Current implementation gaps

The fixed-user backend is verified at `https://pink-hack.vercel.app`, deployment `dpl_DPC2xZNK5MY8tVpVcWELTqs5SHKy`, with no-token context and direct Journal POST/reload/PATCH, retry/stale protection, owner-selector rejection, and removed auth routes. All 51 tests, types, and build pass. Existing Turso records and foreign keys are preserved with no schema changes. No-account device provision and private-token WSS open/stop passed without provider requests. The sole Lovable writer is removing account/session state, Authorization and cookie credentials, and user-auth gating, then verifying real no-token saves/reloads. Preserve direct-write, revision, retry, and cancellation behavior. Earlier audio/agent-save evidence used Better Auth and is historical; it does not prove real audio after this cutover.

The source inspections below preceded the implemented direct-write backend and remain historical transition notes.

Latest coordinator source inspection on 2026-10-24 found generic page list/read/create/update/archive routes, flexible block content/properties, and saved Journal PATCH. `backend/apps/server/src/routes/journal.ts` still lacked direct Journal POST and exposed legacy staged check-in routes. `backend/apps/server/src/routes/voice.ts` still required `checkin_id` for session creation. Those prerequisites need removing from the new direct-write path while preserving legacy records.

The canonical Lovable testing project's implemented frontend was inspected at `8bb2289d`. A subsequent identity/archive/PATCH-verifier correction is in progress. Final fixed-host wiring and revised voice-session/agent signatures are pending. Earlier tests, HTTPS health, and voice startup/close do not establish the new direct-write flow or real Atech persistence.

## Ownership and verification

The coordinator owns this correction brief and reconciliation. The existing backend owner retains schema, migrations, API, workflow, and prompt implementation. The PRD/API thread reconciles the broader documents. The device thread adapts voice/bridge instructions. One Lovable writer owns frontend changes in testing project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` in Jonas' workspace; do not create a competing backend or Lovable database.

Verify opening the app without login, adding an arbitrarily named context page, saving editor blocks and reloading them, tailoring a check-in to that page, saving a Journal row with unfamiliar properties, and editing a Day plan section inside its body. Verify no-user-token requests, duplicate-save handling, stale-revision protection, owner-selector rejection, and isolation from legacy-owner records with the new contract. Actual Atech audio remains a separate required integration check.
