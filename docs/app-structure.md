---
provenance: "Unvetted Synthetic"
---

# Flexible app structure and API contracts

This implements the intent in [the correction brief](flexible-pages-journal.md) and [PRD](../PRD.md). It supersedes fixed page kinds, metrics, and separate plan/observation product resources. The routes below are the agreed target; [backend.md](backend.md) remains the authority for actual implemented endpoints and verification evidence.

## Ownership and runtime

The existing backend thread owns source, dependencies, migrations, application reasoning, and runtime configuration. The PRD/API thread owns these contracts and reconciliation. One assigned Lovable worker owns every remote frontend mutation in testing project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5`. The Atech owner handles device and bridge details.

Keep Hono/Node, Better Auth, Drizzle SQLite/libSQL, and the existing transaction/revision/idempotency checks. Lovable is the external frontend, not another storage backend.

The known local API is `http://localhost:3000`. A verified public HTTPS API URL has not been supplied. The developer authorized one deployed demo service; the backend owner is preparing it and must provide one fixed reachable URL and the exact actual frontend origin. CORS and origin checks do not replace authentication.

The same service hosts the device audio relay and one authenticated WSS ingress. The owner publishes the fixed device JSON/binary contract and PCM rate/encoding/chunk limits. No laptop bridge, bridge configuration product, or environment selector is part of this demo. Actual authenticated device binding and bidirectional audio remain unverified.

## Minimal frontend

    Sidebar
      Add page
      User-created page titles
      Journal

    /pages/$pageId             Arbitrary context page editor
    /journal                   Fixed Journal table
    /journal/$entryId          Properties and editable entry body
    /sign-in                   Authentication

Voice controls and connection/confirmation status accompany the selected page or Journal. There are no compulsory Today, About me, Patterns, personal-needs, or medical-needs destinations.

Use `@blocknote/core`, `@blocknote/react`, and `@blocknote/shadcn`. Mount the editor on the client, save `editor.document`, and load saved blocks as `initialContent` using the chosen package version's documented lifecycle. Validate that lifecycle in the real Lovable scaffold. Native JSON is authoritative; Markdown exports or plain text are derived context only.

The Journal view derives visible property columns from stored entries. Do not build a second database-definition product. The standard title/date/source metadata coexists with custom properties. Day plans are ordinary content blocks.

## Record contracts

| Record | Current target fields |
| --- | --- |
| Page | `id`, `title`, `content`, `revision`, `created_at`, `updated_at`; authenticated owner stored server-side |
| JournalDraft | `title`, `original_text`, `content`, `properties` |
| JournalEntry | Draft fields plus `id`, `journal_date`, `source`, `context_revisions`, `revision`, UTC timestamps, capture/session/operation metadata |
| Checkin | Existing session/stage/draft/revision metadata plus create/update action, optional bound target entry and expected target revision, confirmation, saved result |
| Profile/device | Existing authenticated ownership/runtime preferences; paired device identity when implemented |

`content` is an array of bounded native BlockNote block objects. Support the block types installed by the frontend's selected standard editor. Preserve nested document structure and styles; validate object depth, size, and allowed block fields centrally. The backend owner records exact limits in the shared validator.

`properties` is a string-keyed map. Values are string, finite number, boolean, null, or lists of these scalars. Missing values remain absent. The shared validator bounds key lengths, item counts, list lengths, and total size. No mandatory energy/mood/symptom enum exists. A user's chosen Energy property may use a numeric scale, but that is content-specific.

Dates and owner IDs remain server-controlled metadata. The server captures journal date from the user's timezone at check-in creation; multiple entries per day are allowed. Content revisions record the custom pages used by a proposal.

## Storage change

Add a generic `pages` table while preserving legacy `context_pages` for migration. Add native `content` and `properties` fields to `journal_entries`. Keep legacy note/observation/day-plan data for explicit migration/audit until the backend owner verifies preservation. The active API reads and writes the generic model.

Day plans do not create a new table, separate API resource, or acceptance state. Existing plan/checklist text can be migrated into entry blocks without inventing facts or changing metric meaning. Migration records must identify source data and be verified before legacy cleanup. No permanent dual-write product model is required.

## Agreed REST endpoints

All `/api/v1` operations authenticate a Better Auth cookie or an in-memory session bearer token. The backend derives owner identity. Request names use snake_case. Resource responses below are direct records unless a wrapper is shown.

| Method and route | Input | Result |
| --- | --- | --- |
| `GET /api/v1/context` | Authenticated owner | `{profile,pages}`, all live owned pages and revisions |
| `GET /api/v1/pages` | Optional cursor | `{pages,next_cursor}` |
| `GET /api/v1/pages/:id` | Page ID | Page |
| `POST /api/v1/pages` | `title,content,operation_id` | Page |
| `PATCH /api/v1/pages/:id` | `expected_revision,operation_id,title?,content?` | Page |
| `DELETE /api/v1/pages/:id` | `expected_revision,operation_id` | Archive acknowledgement; omitted from future context |
| `GET /api/v1/journal` | `from?,to?,limit?,cursor?` | `{entries,next_cursor}` |
| `GET /api/v1/journal/:id` | Entry ID | JournalEntry |
| `PATCH /api/v1/journal/:id` | `expected_revision,operation_id,title?,content?,properties?` | JournalEntry |
| `POST /api/v1/checkins` | `source,operation_id` | Checkin |
| `GET /api/v1/checkins/:id` | Check-in ID | Checkin |
| `PUT /api/v1/checkins/:id/draft` | `expected_revision,draft:JournalDraft` | Checkin |
| `POST /api/v1/checkins/:id/prepare-update` | `entry_id,expected_entry_revision,expected_revision,draft` | Checkin with bound update target |
| `POST /api/v1/checkins/:id/confirm` | `draft_revision,action:"save",operation_id` | Confirmation receipt and bound proposal metadata |
| `POST /api/v1/checkins/:id/commit` | `confirmation_receipt,operation_id` | Saved JournalEntry |
| `POST /api/v1/checkins/:id/cancel` | Empty body | Canceled state; no journal write |

PATCH preserves omitted fields. Supplied `content` or `properties` replaces that field, so the client or agent must merge an edit into the complete current field before submission. It must preserve unrelated blocks and properties. The expected revision prevents a stale merge from replacing newer writing.

Page creation and PATCH operations use stable operation IDs. Replay with the same payload returns the prior result; reuse with changed payload conflicts. The backend owner must report any final signature adjustment before frontend wiring.

## Confirmed create and update

A new check-in collects a generic draft. To update a saved entry, create a new check-in, read that entry, then prepare-update with its expected revision. Saved/canceled sessions remain terminal.

Confirmation binds owner, check-in, draft revision, action, target entry/expected revision, and operation ID. Confirming an update cannot authorize a different entry or later revision. Draft changes invalidate confirmation. Commit atomically creates or updates the bound entry and records the saved session result. A repeated commit returns the original record. Revision mismatch rejects the whole mutation.

The authenticated client records explicit spoken confirmation or a deliberate UI action. This is independent of model tool execution. The model cannot mint a receipt or self-confirm. Speech fragments, unrelated replies, cancellation, and a draft changed during interruption do not authorize saving.

Direct manual editing calls the same storage services with revisions and operation IDs. Voice uses proposal/confirmation/commit for journal writes. There is no separate plan-state field in the generic flow.

## Agent and context boundary

Tools use the same backend services:

| Tool | Behavior |
| --- | --- |
| `get_context` | Read all owned custom pages and relevant recent history |
| `get_page`, `get_journal_entry`, `get_checkin` | Read current owned records and revisions |
| `prepare_journal_draft` | Prepare a generic new-entry proposal |
| `prepare_journal_update` | Prepare content/properties changes for a bound entry revision |
| `commit_journal_entry` | Execute only with a matching existing confirmation receipt |
| `cancel_checkin` | Cancel without saving |

There is no model confirmation tool. The existing `POST /api/v1/voice/sessions/:id/tools` validates allowed names, arguments, ownership, and receipts. Success output identifies the saved entry/revision only after persistence.

All live owned custom pages are eligible context. Content supplies preferences and facts, not executable policy. The workflow tracks page revisions and handles context-size limits explicitly rather than silently dropping categories or pages. Reconcile existing user privacy choices without guessing sensitivity from page titles. Recent journal history is selected separately; every historical entry is not required on every turn.

## Reusable voice module and authentication

Existing `POST /api/v1/voice/sessions` accepts `checkin_id,operation_id,transport:{type:"webrtc",sdp}`. It returns `{id,provider,model,delegation,session:{id},transport:{type,sdp}}`. The outer ID is our voice record; the inner session ID is the provider's. The client validates the exact model, session, and delegation before enabling audio.

`@backend/client` is a private workspace package, not a published dependency. The sole Lovable writer can copy/adapt the two framework-independent source modules `backend/packages/client/src/index.ts` and `live-protocol.ts` into remote `src/lib/voice/`, retaining their relative import. Import `createVoiceConnection` locally. The backend owner owns upstream source; report changes rather than maintaining an unrelated protocol implementation.

Supply `apiBaseUrl,checkinId,sessionToken,onStatus,onTranscript,onError,onDelegation`. Start from a user click, close on stop/unmount, and report `close().confirmed` accurately. The modules contain no provider secret or finance/demo storage.

Authentication uses `/api/auth/sign-up/email` and `/api/auth/sign-in/email`. Browser calls use credentials include or a session bearer token kept in memory. Provider keys never enter the client. A remote Lovable page must be able to reach the backend; local health checks do not establish that.

Azure uses client delegation. `onDelegation` receives delegation metadata, bounded lossy transcripts, check-in ID, and an abort signal. It needs a trusted application reasoning workflow that retrieves current backend records and executes allowed tools. That callback/agent endpoint is not established by the transport module. Do not fabricate a successful callback or save while it is missing. The fixed demo connection uses the configured Azure provider; existing direct OpenAI code is not a product selector.

## Failure and verification

Retain the existing error envelope `{error:{code,message,retryable},request_id}`. Use 401 for missing auth, 404 for inaccessible records, 409 for revision/state/idempotency conflicts, 422 for invalid content/properties, and 503 for storage failure. A failed write retains its proposal. Automatic retries keep the same operation ID and never create a fresh paid voice session.

The existing twelve-test foundation and Azure startup/close probe verify the prior schema and provider access respectively. New schema/migration, generic CRUD, voice-confirmed writes, application reasoning, cloud frontend, and real Atech audio need new evidence. No public HTTPS API URL or complete demo candidate is established.
