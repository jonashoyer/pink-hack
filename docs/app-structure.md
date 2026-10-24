---
provenance: "Unvetted Synthetic"
---

# App structure and shared contracts

Implementation companion to [the PRD](../PRD.md). Routes and interfaces below describe the full intended product. A subset is now implemented in the separate Better-T-Stack Hono/Node backend at `backend/`; see [actual endpoints and evidence](backend.md). Lovable remains the external frontend awaiting connection. Storage belongs to our backend; there is no Notion dependency.

## Component ownership

| Component | Owns | Depends on |
| --- | --- | --- |
| Lovable app | Navigation, page editing, table views, draft review, optional browser voice | Shared application API |
| Better-T-Stack application backend | Authentication, device ownership, Live session configuration, schema validation, workflow transitions | Storage, OpenAI adapter; local backend owner |
| Context store | Personal-needs and medical-needs page revisions | App database |
| Journal store | Drafts, confirmed journal entries, retry handling | App database |
| Voice workflow | Conversation context, draft preparation, confirmation receipt | Context and journal operations |
| GPT-Live adapter | Session lifecycle and provider-specific event conversion | OpenAI Live API |
| Atech adapter and bridge | Microphone capture, speaker playback, button events, connection state | Actual device transport, Live audio transport, application API |

The dedicated Better-T-Stack Hono/Node backend implements the shared REST API, with Better Auth and Drizzle SQLite/libSQL. Lovable consumes it as an external frontend. Configure its exact origin; the backend validates its own session cookies or bearer tokens. The current backend does not implement the persistent Atech audio bridge.

Persistent Atech audio belongs in a laptop or service runtime that supports long connections. Do not assume that a short HTTP request can own an indefinite audio bridge.

## Navigation and routes

```text
App shell
  /                         Today and latest saved day plan
  About me
  /needs/personal           Personal-needs page
  /needs/medical            Medical-needs page
  /journal                  Daily-journal database table
  /journal/new              Text entry and check-in draft
  /journal/$entryId         Saved entry as an editable page
  /patterns                 Confirmed observations with source entries
  /assistant                Voice controls and current review
  /settings                 Timezone, context consent, device management
  /sign-in                  Authentication
```

Primary navigation retains Today, Journal, Patterns, and About me from the [existing design](superpowers/specs/2026-10-24-today-first-companion-design.md). Assistant controls and settings are secondary destinations. Personal needs and medical needs are About me child pages.

The journal table shows local date, title, energy, mood, symptom summary, and source. Each row opens a page with original text, observations, note, and day plan. Blank energy or mood is "not recorded", not zero. The Today page retrieves all today's entries in the user's timezone and shows the latest accepted plan. Patterns shows confirmed observations at their actual timestamps with coverage, gaps, and links to source entries. It does not average multiple daily reports implicitly.

Personal needs contains communication preferences, routines, priorities, support needs, and helpful activities. Medical needs contains self-reported treatment context, symptoms to track, care-team instructions, and care-team questions. Fixed section types and a small supported block set, such as text and checklist, provide page editing without a universal document editor.

## Data model

Every user-owned table carries `owner_id`. The API derives it from authentication. Access policies enforce it again at the database layer.

| Table | Essential fields and constraints |
| --- | --- |
| `profiles` | `owner_id`, `preferred_name`, `timezone`, `locale`, `allow_medical_voice_context`; one profile per user |
| `context_pages` | `id`, `owner_id`, `kind: personal_needs or medical_needs`, `title`, `sections`, `revision`, `updated_at`; unique owner and kind |
| `journal_entries` | `id`, `owner_id`, `journal_date`, `created_at`, `updated_at`, `title`, `original_text`, `note`, `source: app or atech`, `session_id`, `context_revisions`, `revision`, `operation_id`; unique owner and operation ID |
| `observations` | `id`, `owner_id`, `entry_id`, `metric`, `value`, optional `unit`, `observed_at`, `confirmation_state`, `source_reference`, `revision`; source entry required |
| `day_plans` | `id`, `owner_id`, `journal_date`, `source_entry_ids`, `context_revisions`, `items`, `state: draft or accepted`, `revision`, timestamps; accepting a replacement requires explicit user choice |
| `checkin_sessions` | `id`, `owner_id`, `device_id`, `source`, `stage`, `draft`, `draft_revision`, `context_revisions`, `saved_entry_id`, `created_at`, `updated_at`; resumes independently of a voice transport |
| `devices` | `id`, `owner_id`, `gateway_device_ref`, `display_name`, `credential_hash`, `revoked_at`, `last_seen_at`; plaintext device credentials are never returned after pairing |

Observation metrics include energy as a labeled integer self-report from 1 to 5, matching the approved written design, optional self-reported mood, optional sleep hours, and symptom reports with name, optional reported severity, and note. Use the same energy labels in capture, validation, extraction review, and charts; the mockup's three categories are illustrative only. Final labels remain a product choice. Missing values remain null or absent. Plan items have stable IDs, text, optional timing, rationale, smaller alternatives, and active/deferred/removed state. Acceptance and activity completion are separate. All text and lists have bounded sizes in the shared schema.

Keep observations and plans as separate records, as proposed in the existing design. Embedding everything in one journal JSON field would be an expedient persistence test, but would complicate chart provenance, corrections, and plan acceptance. This spec chooses separate records for implementation. A confirmed journal commit writes the entry, reviewed observations, associated plan, and saved session state atomically. Corrections retain source references and mark affected suggestions for review. Deleting an entry removes its observation points and marks dependent plans for review.

No date uniqueness constraint exists on journal entries. App text entry gets its own capture/session ID. `context_revisions` maps each context page ID to the revision read for this session. Provider session IDs are session metadata, not owner credentials.

The server chooses `journal_date` from the user's timezone at capture start. A user can explicitly correct it. It stores UTC timestamps separately. Later edits increment the entry revision.

## Shared application API

These are application endpoints on the Better-T-Stack backend. They wrap OpenAI and app storage; clients do not call privileged provider APIs or the database with service credentials. The backend owner maps these contracts to the generated framework and documents any equivalent endpoint names.

| Method and path | Input | Result |
| --- | --- | --- |
| `POST /api/v1/profile` | Authenticated user, timezone, stable operation ID | Idempotent profile and empty personal/medical context pages; no mutation on context GET |
| `PATCH /api/v1/profile` | Editable preferences and context-use choice, expected revision | Updated owned profile and revision |
| `GET /api/v1/context` | Authenticated user | Profile, allowed context pages, revisions |
| `PATCH /api/v1/pages/:id` | Validated sections, `expected_revision` | Saved page and new revision |
| `GET /api/v1/journal` | Date range, opaque cursor | Owned entries and next cursor |
| `GET /api/v1/journal/:id` | Entry ID | Owned journal page |
| `PATCH /api/v1/journal/:id` | Editable fields, `expected_revision` | Saved entry and new revision |
| `GET /api/v1/patterns` | Metric, date range | Owned confirmed observation points, source entry IDs, coverage |
| `PATCH /api/v1/observations/:id` | Reviewed value, `expected_revision` | Corrected observation with source reference |
| `PATCH /api/v1/day-plans/:id` | Edited items, `expected_revision` | Saved plan draft |
| `GET /api/v1/day-plans` | Local date | Owned drafts and accepted plan for Today |
| `POST /api/v1/day-plans` | Source entry IDs, manual items, stable operation ID | New owned draft with source revisions; no accepted-plan replacement |
| `POST /api/v1/day-plans/:id/generate` | Plan expected revision, source revisions, stable operation ID | AI-generated draft from confirmed observations and permitted context; preserves prior draft on failure |
| `POST /api/v1/day-plans/:id/accept` | Plan revision, explicit replacement choice if needed | Accepted plan without silent replacement |
| `POST /api/v1/checkins` | `source`, optional paired `device_id`, stable `operation_id` | Session ID, stage, allowed context |
| `GET /api/v1/checkins/:id` | Session ID | Current stage, draft revision, saved entry ID |
| `PUT /api/v1/checkins/:id/draft` | Structured draft, `expected_revision` | Validated draft and new revision |
| `POST /api/v1/checkins/:id/extract` | Source text revision, draft expected revision, stable operation ID | Unconfirmed observation suggestions; never overwrites reviewed values |
| `POST /api/v1/checkins/:id/confirm` | `draft_revision`, save action, unique operation ID | Confirmation receipt bound to owner, session, and revision |
| `POST /api/v1/checkins/:id/commit` | Confirmation receipt, same operation ID | Saved entry ID and revision; retry returns original result |
| `POST /api/v1/checkins/:id/cancel` | Session ID | Canceled state; no journal write |
| `POST /api/v1/voice/sessions` | Check-in ID, supported transport offer | Provider session ID and negotiated connection data |
| `POST /api/v1/voice/sessions/:id/close` | Owned provider session ID | Provider close acknowledgement and retained draft state |
| `POST /api/v1/devices/pair` | Authenticated user and one-time pairing challenge | Owned device identity and scoped bridge credential |
| `DELETE /api/v1/devices/:id` | Owned device ID | Revocation acknowledgement |

Both explicit app save and voice-confirmed save follow confirmation then commit. Confirmation binds to the current draft; a changed draft invalidates it. Voice confirmation arrives from the authenticated client after the user's explicit answer and the backend rejects mismatched sessions or revisions. This is suitable for the proposed demo, not a clinical consent system.

The server commits the journal records and session's saved state together. Confirmation includes whether the displayed plan is accepted or saved as a draft. It enforces operation uniqueness and returns the prior entry for a retry. Session creation is also idempotent by owner and operation ID. Page, entry, observation, and plan edits require expected revisions. A stale edit returns `409 revision_conflict` with a reload hint.

Persisting writing with manual observations or no observations must succeed independently of AI. A saved check-in session remains terminal; later plan creation or generation uses the owned day-plan operations and references the saved entry. Validate plan/source revisions again before applying generated content. Failure or a stale result leaves the prior saved writing and plan intact. Context or observation changes mark affected suggestions for review rather than regenerating an accepted plan silently.

Errors use `{ error: { code, message, retryable }, request_id }`. Use `401` for missing authentication, `403` for rejected device access, `404` for inaccessible user-owned records, `409` for state/revision conflicts, `422` for invalid input, `429` for session limits, and `502/503` for provider or storage failure. Responses and logs omit secrets and private prompt contents.

## Assistant tool boundary

| Tool | Behavior |
| --- | --- |
| `get_context` | Read the permitted current context and recent journal entries |
| `get_checkin` | Read the authoritative check-in stage and draft |
| `prepare_journal_draft` | Validate and store a proposed draft; return its revision |
| `confirm_journal_draft` | Record the user's explicit save confirmation for that revision |
| `commit_journal_entry` | Commit only with a matching confirmation receipt; return verified entry ID |
| `cancel_checkin` | Cancel without committing |

Tools accept record IDs only within the authenticated session. The API owns medical-context consent, allowed destinations, validation, and state transitions. The voice model's output is input to this API, not proof of a successful action. Stored page content is user data and never becomes tool authorization.

GPT-Live conversation instructions stay short. The backend reasoning layer owns the detailed check-in procedure and tool definitions. Responses delegation or client delegation must follow the verified Live event contracts in [API readiness](api-readiness.md). No provider event payload is invented by this document.

## Workflow state

```text
created -> collecting -> draft -> awaiting_confirmation -> saved
                           ^              |
                           |---- revise --|
created / collecting / draft / awaiting_confirmation -> canceled
```

Connection state is separate from workflow stage. A transport error can occur in any unsaved stage without destroying the draft. Saved and canceled sessions are terminal. A new journal entry uses a new session. Refresh and reconnect read state from the API rather than replaying old tool calls blindly.

## Atech connection

The proposed bridge pairs with the user's account, resolves the permitted gateway device, and starts a check-in through the shared API. It translates actual microphone events into the audio transport accepted by GPT-Live and routes returned speech to the speaker. It relays tool events to the application API and returns matching tool results to GPT-Live. Button events start or stop a session; available LEDs display connection state.

Published Atech source indicates PCM streaming in one firmware implementation, but sample rates, throughput, speaker playback, interruption, echo behavior, gateway authorization, and available modules need testing. Browser voice is useful for isolating API problems, but does not satisfy device voice acceptance. Standalone device voice remains a separate unverified runtime option.

If Arduino Uno Q deployment becomes part of the work, read and follow `/Users/j/summer-uno-q/SKILL.md` and its board scripts exactly. No Uno Q deployment is part of this specification's evidence.

## Proposed source layout

Adapt frontend paths to Lovable's inspected routing conventions. The backend tree below names responsibilities; the backend owner reconciles paths with the actual Better-T-Stack output. These are future owners, not verified local files.

```text
Lovable project
  src/routes/                 App pages
  src/features/needs/         Context page forms and display
  src/features/journal/       Database table, entry page, review panel
  src/features/assistant/     Browser session controls and status
  src/features/devices/       Pairing and device management

Local Better-T-Stack backend
  API routes                  /api/v1 operations
  Shared contracts            Request, response, and record schemas
  Auth                        User and device authentication
  Context                     Context reads and revision-checked writes
  Journal                     Session transitions, confirmation, idempotent commit
  Voice                       GPT-Live adapter and tool dispatch
  Storage                     Database access and migrations
  Atech bridge                Persistent audio and gateway adapter
```

## Integration handoff

The app owner consumes the shared schemas and API without depending on audio firmware. The separate backend scaffold thread owns local backend files, dependency changes, API/storage implementation, and integration. The PRD thread owns these requirements and contracts and avoids backend edits. Voice and device ownership must be coordinated with the backend owner before implementation. The device owner verifies gateway/audio conversion and actual hardware. A demo candidate has not been established.
