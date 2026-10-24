---
provenance: "Unvetted Synthetic"
---

# Simple page and Journal API

This follows [the latest PRD](../PRD.md) and [coordinator correction](flexible-pages-journal.md). The active product has custom pages, one Journal, and direct agent writes. There is no stored proposal or required check-in/draft/confirm/commit sequence. [backend.md](backend.md) remains the record of actual implementation evidence.

## Runtime and ownership

Keep the existing Hono/Node, Better Auth, Drizzle/libSQL backend. The backend owner handles source, runtime, migrations, and deployment in the existing [Vercel project](https://vercel.com/quasr/pink-hack). The existing Turso database is the sole deployed store; do not provision another database service/container.

Load root `.env` `DATABASE_URL` and `DATABASE_API_KEY` privately and verify their mapping to libSQL authentication. Provider keys also stay server-side. Local SQLite checks are separate from Turso persistence evidence.

The sole Lovable writer owns the canonical testing frontend. It consumes the backend API with Better Auth session credentials. No database/provider credentials go into the browser. Exact origins and the verified Vercel runtime API URL come from the backend owner; remove previous Azure hosting origins. Azure GPT-Live is the voice provider, not the app host.

Vercel native WSS/device-relay support is being checked. No device WSS URL or replacement bridge is promised until the owner verifies platform capability and reports the result.

## Frontend and records

The sidebar contains custom page titles, Add page, and Journal. The selected page or Journal entry uses the standard BlockNote core/react/shadcn editor. Save native document JSON; derived Markdown/text is not a second editable source.

| Record | Fields |
| --- | --- |
| Page | `id,title,content,revision,created_at,updated_at` |
| JournalEntry | `id,title,content,properties,original_text,journal_date,source,context_revisions,revision,created_at,updated_at`, creation operation metadata |
| VoiceSession | Owned session identity, provider session metadata, optional current entry reference; no held journal document |
| Auth/device | Existing account and authenticated device metadata where supported |

`content` is bounded native BlockNote block JSON. The shared backend validator records supported types and limits. Preserve styles, nested blocks, and unrelated content.

`properties` is a string-keyed map of text, finite numbers, booleans, null, or lists of those scalar values. Missing values remain absent. No fixed energy/mood/symptom schema exists. The Journal view derives custom columns from stored properties. A day plan is ordinary entry content.

## Direct REST contract

All `/api/v1` routes authenticate the person or bound device. The backend derives the owner; no request body selects another user. Responses are direct records unless a wrapper is shown.

| Method and route | Input | Result |
| --- | --- | --- |
| `GET /api/v1/context` | Authenticated owner | `{profile,pages}`, all live owned pages and revisions |
| `GET /api/v1/pages` | Optional cursor | `{pages,next_cursor}` |
| `GET /api/v1/pages/:id` | Page ID | Page |
| `POST /api/v1/pages` | `title,content,operation_id` | Page |
| `PATCH /api/v1/pages/:id` | `expected_revision,operation_id,title?,content?` | Page |
| `DELETE /api/v1/pages/:id` | `expected_revision,operation_id` | Archive acknowledgement |
| `GET /api/v1/journal` | `from?,to?,limit?,cursor?` | `{entries,next_cursor}` |
| `GET /api/v1/journal/:id` | Entry ID | JournalEntry |
| `POST /api/v1/journal` | `title,content,properties,original_text?,operation_id` | Saved JournalEntry |
| `PATCH /api/v1/journal/:id` | `expected_revision,operation_id,title?,content?,properties?` | Saved JournalEntry |

These are the agreed direct-write target. The owner must report source/runtime readiness; the new POST and voice signatures are not assumed to work merely because they are documented.

POST writes immediately. PATCH preserves omitted fields. Supplied content/properties replaces that field after the client/agent merges against the current record. Expected revision rejects stale merges. A stable mutation operation ID survives retries; identical replay returns the prior result and changed payload conflicts.

Journal creation operation metadata remains immutable provenance. A PATCH request's operation ID is separate retry metadata; do not compare it to the entry's creation operation ID to verify saving.

## Voice agent

The agent reads context and current entries, then calls `create_journal_entry` or `update_journal_entry` directly in response to user writing requests. Tools use the same authenticated services as POST/PATCH. The backend validates ownership, blocks/properties, expected revisions, and stable action/retry IDs.

There is no required prepare/confirm/commit tool chain, receipt minting, held proposal record, or separate review screen. The agent asks a normal conversational clarification if intent or the target entry is unclear. Stored page text is context, not permission to run commands.

A successful tool returns the actual saved entry and revision. Failure is reported honestly. Stopping or interrupting cancels further agent work; already saved records remain editable. Normal unsaved editor text may remain locally, without becoming backend proposal storage.

## Owned voice-session target

`POST /api/v1/voice/sessions` should accept `operation_id,transport:{type:"webrtc",sdp},entry_id?` without requiring a check-in. It returns the existing voice DTO `{id,provider,model,delegation,session:{id},transport:{type,sdp}}`. The outer ID is the owned app voice session; the inner ID belongs to the provider.

The target application callback is `POST /api/v1/voice/sessions/:id/agent` with `delegation_id,messages:[{role,content}],entry_id?`. It resolves the owner/target from trusted session state and current records. Return `{text,entries:[{id,revision}]}` only for actual persisted writes, with an empty entries list when none occurred. The client returns text to Live and refreshes Journal after writes. Final signatures must be verified by the backend owner before UI wiring.

Azure client delegation provides metadata and lossy transcript fragments, not task text. Use current backend state, bounded/merged messages, and cancellation. The agent callback does not require a stored journal draft or check-in identity.

## Reusable client and auth

`@backend/client` is private workspace code, not assumed published. The sole frontend writer can copy/adapt its two framework-independent source modules into remote `src/lib/voice/`, preserving relative imports and reporting changes to the backend owner.

Update `createVoiceConnection` to use the owned voice session and optional entry ID, without creating a check-in. Call start from a user action and close on stop/unmount. Validate the exact provider session/model before enabling audio and report graceful-close confirmation accurately.

Better Auth sign-up/sign-in uses `/api/auth/*`. Use session cookies or an in-memory bearer token. Verify identity independently of context retrieval so an oversized context cannot prevent the user managing their pages.

## Storage transition and checks

Keep legacy check-in, draft, and receipt data/routes only as compatibility while the owner transitions active clients. Do not delete Turso or legacy contents to simplify the API. New journal writes use direct services and no separate proposal resource.

Retain input limits and error envelope `{error:{code,message,retryable},request_id}`. Missing auth is 401, foreign-owned records 404, stale/state/operation conflicts 409, invalid input 422, and storage failure 503.

Verify direct authenticated POST/PATCH, arbitrary properties/blocks, owner isolation, stale revisions, same-operation replay, data preservation, and retrieval across app restart on existing Turso. Then exercise the real voice callback and frontend. Earlier staged-workflow tests and Azure access-only startup do not prove this simpler path.
