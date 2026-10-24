---
provenance: "Unvetted Synthetic"
---

# Simple page and Journal API

This follows [the latest PRD](../PRD.md) and [coordinator correction](flexible-pages-journal.md). The active product has custom pages, one Journal, and direct agent writes. There is no stored proposal or required check-in/draft/confirm/commit sequence. [backend.md](backend.md) remains the record of actual implementation evidence.

## Runtime and ownership

Keep the existing Hono/Node, Better Auth, Drizzle/libSQL backend. The backend owner handles source, runtime, migrations, and deployment in the existing [Vercel project](https://vercel.com/quasr/pink-hack). The existing Turso database is the sole deployed store; do not provision another database service/container.

Load root `.env` `DATABASE_URL` and `DATABASE_API_KEY` privately and verify their mapping to libSQL authentication. Provider keys also stay server-side. Local SQLite checks are separate from Turso persistence evidence.

The sole Lovable writer owns the canonical testing frontend. It consumes the verified fixed backend `https://pink-hack.vercel.app` with Better Auth session credentials. The backend owner verified both `http://localhost:8080` and the canonical public Lovable preview origin in CORS and trusted authentication. No database/provider credentials go into the browser. Remove previous Azure hosting origins. Azure GPT-Live is the voice provider, not the app host.

Vercel native WSS/device-relay support is being checked. No device WSS URL or replacement bridge is promised until the owner verifies platform capability and reports the result.

## Frontend and records

The sidebar contains custom page titles, Add page, and Journal. The selected page or Journal entry uses the standard BlockNote core/react/shadcn editor. Save native document JSON; derived Markdown/text is not a second editable source.

| Record | Fields |
| --- | --- |
| Page | `id,title,content,revision,created_at,updated_at` |
| JournalEntry | `id,title,content,properties,original_text,journal_date,source,context_revisions,revision,created_at,updated_at`, creation operation metadata |
| VoiceSession | Owned session identity, provider session metadata, optional current entry reference; no held journal document |
| Auth/device | Existing account and authenticated device metadata where supported |

`content` is native BlockNote block JSON, limited to 200,000 serialized bytes, 8 nesting levels, and 1,000 blocks. Preserve styles, nested blocks, and unrelated content.

`properties` is a string-keyed map of text, finite numbers, booleans, null, or lists of those scalar values. It is limited to 50,000 serialized bytes, 100 keys, and 100 values per list. Missing values remain absent. Title length is 1–200 characters; `original_text` is limited to 30,000 characters. Request bodies are limited to 512 KiB. No fixed energy/mood/symptom schema exists. The Journal view derives custom columns from stored properties. A day plan is ordinary entry content.

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

The backend owner verified production HTTP and Turso direct Journal POST/reload/PATCH on `https://pink-hack.vercel.app`, including exact retry, changed-payload conflict, and stale revision rejection. Both Journal POST and PATCH return a saved entry with HTTP 200. Voice-session creation returns HTTP 201. Real voice/agent and authenticated device-audio verification remain separate checks.

POST writes immediately. PATCH preserves omitted fields. Supplied content/properties replaces that field after the client/agent merges against the current record. Expected revision rejects stale merges. A stable mutation operation ID survives retries; identical replay returns the prior result and changed payload conflicts.

Journal creation operation metadata remains immutable provenance. A PATCH request's operation ID is separate retry metadata; do not compare it to the entry's creation operation ID to verify saving.

## Voice agent

The agent reads context and current entries, then calls `create_journal_entry` or `update_journal_entry` directly in response to user writing requests. Tools use the same authenticated services as POST/PATCH. The backend validates ownership, blocks/properties, expected revisions, and stable action/retry IDs.

There is no required prepare/confirm/commit tool chain, receipt minting, held proposal record, or separate review screen. The agent asks a normal conversational clarification if intent or the target entry is unclear. Stored page text is context, not permission to run commands.

A successful tool returns the actual saved entry and revision. Failure is reported honestly. Stopping or interrupting cancels further agent work; already saved records remain editable. Normal unsaved editor text may remain locally, without becoming backend proposal storage.

## Owned voice-session target

Current source accepts `POST /api/v1/voice/sessions` with `operation_id,transport:{type:"webrtc",sdp},entry_id?`, without a check-in. It returns `{id,voice_session_id,provider,model,delegation,session:{id},transport:{type,sdp}}`. `id` and `voice_session_id` identify the owned app voice conversation; `session.id` belongs to the provider.

The current application callback is `POST /api/v1/voice/sessions/:id/agent` with `delegation_id,messages:[{role,content}],entry_id?`. It resolves the owner/target from trusted session state and current records and returns `{text,entries:[{id,revision}]}` for actual persisted writes, with an empty entries list when none occurred. Messages are bounded to 24 items and 24,000 total characters in the current validator. Client transcripts use `text`; map that to message `content`, merge fragments appropriately, and send the abort signal. Return response text to Live and refresh Journal after writes. The backend owner must verify the deployed route before enabling the integrated flow.

Azure client delegation provides metadata and lossy transcript fragments, not task text. Use current backend state, bounded/merged messages, and cancellation. The agent callback does not require a stored journal draft or check-in identity.

## Reusable client and auth

`@backend/client` is private workspace code, not assumed published. The sole frontend writer can copy/adapt its two framework-independent source modules into remote `src/lib/voice/`, preserving relative imports and reporting changes to the backend owner.

The updated `createVoiceConnection` uses optional `entryId` and supplies `voiceSessionId`, optional `entryId`, `delegationId`, transcripts, and an abort signal to `onDelegation`, without creating a check-in. Copy the latest upstream modules rather than the earlier check-in version. Call start from a user action and close on stop/unmount. Validate the exact provider session/model before enabling audio and report graceful-close confirmation accurately.

Better Auth sign-up/sign-in uses `/api/auth/*`. Use session cookies or an in-memory bearer token. Verify identity independently of context retrieval so an oversized context cannot prevent the user managing their pages.

## Storage transition and checks

Keep legacy check-in, draft, and receipt data/routes only as compatibility while the owner transitions active clients. Do not delete Turso or legacy contents to simplify the API. New journal writes use direct services and no separate proposal resource.

Retain input limits and error envelope `{error:{code,message,retryable},request_id}`. Missing auth is 401, foreign-owned records 404, stale/state/operation conflicts 409, invalid input 422, and storage failure 503.

Verify direct authenticated POST/PATCH, arbitrary properties/blocks, owner isolation, stale revisions, same-operation replay, data preservation, and retrieval across app restart on existing Turso. Then exercise the real voice callback and frontend. Earlier staged-workflow tests and Azure access-only startup do not prove this simpler path.

The backend owner reports the additive Turso migration passed with a private pre-migration backup, unchanged legacy row counts, and an empty foreign-key check. Verified production is deployment `dpl_Ak43VzrcBBiwjuD27reY4y6e4WNF`, immutable host `https://pink-hack-38g1zdff7-quasr.vercel.app`, fixed alias `https://pink-hack.vercel.app`. External health returned 200, unauthenticated API access 401, and authenticated Better Auth session plus direct Journal persistence checks passed. Device WSS returned 401 without authentication; that does not prove authenticated upgrade or audio. No duplicate paid startup or singleton-device provision is required by frontend wiring.
