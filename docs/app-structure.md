---
provenance: "Unvetted Synthetic"
---

# Simple page and Journal API

This follows [the latest PRD](../PRD.md) and [coordinator correction](flexible-pages-journal.md). The active product has custom pages, one Journal, direct agent writes, and one fixed server-owned demo user. Better Auth, accounts, and user-session tokens are removed from the requested flow. There is no stored proposal or required check-in/draft/confirm/commit sequence. [backend.md](backend.md) remains the record of actual implementation evidence.

## Runtime and ownership

Keep the existing Hono/Node and Drizzle/libSQL backend, removing Better Auth runtime/dependencies and required authentication environment settings. The backend owner handles source, runtime, migrations, and deployment in the existing [Vercel project](https://vercel.com/quasr/pink-hack). The existing Turso database is the sole deployed store; do not provision another database service/container.

All application operations use `DEMO_USER_ID = "demo-user"`, exported from `backend/apps/server/src/demo-owner.ts`. Initialize its existing user-table row idempotently for foreign-key compatibility without deleting legacy users, sessions, or records. Clients cannot select an owner. All browser visitors and the device share this demo user's pages and Journal; this is an expedient demo configuration, not personal multi-user storage.

Load root `.env` `DATABASE_URL` and `DATABASE_API_KEY` privately and verify their mapping to libSQL authentication. Provider keys also stay server-side. Local SQLite checks are separate from Turso persistence evidence.

The sole Lovable writer owns the canonical testing frontend. It consumes fixed backend `https://pink-hack.vercel.app` with plain JSON requests and no user-session credentials or owner IDs. Keep exact CORS origins for `http://localhost:8080` and the canonical public Lovable preview. No database/provider credentials go into the browser. Remove previous Azure hosting origins. Azure GPT-Live is the voice provider, not the app host.

The same deployed Vercel service's authenticated device WSS relay is verified at `wss://pink-hack.vercel.app/api/v1/device/audio`. The backend owner exercised real Azure Live with synthetic PCM speech and verified the saved Journal entry through owned HTTP reread. This is evidence for this deployment, not Arduino capture/playback or Lovable browser voice. The device function has a 300-second lifetime; reconnect behavior has not been runtime exercised.

The fixed-user backend is deployed and its no-user-token contract is verified. The Atech owner is physically testing the confirmed Big Kit 14-port layout: microphone 1-2, speaker 13-14, button 3, light grid 4. The installed SDK is `atech==1.0.0a11`; its USB serial defaults still need firmware adaptation for direct device WSS. The sole frontend writer owns canonical Jonas no-login integration and browser WebRTC acceptance. Neither runtime check is established by the previous synthetic backend test.

## Frontend and records

The approved [Here With You interface](../design/README.md) has Home / Journal / Symptom primary navigation on both desktop and phone. Context pages remain data and are reachable through secondary settings rather than a Pages tab. The selected context page or Journal entry uses the standard BlockNote core/react/shadcn editor. Save native document JSON; derived Markdown/text is not a second editable source. The external frontend still requires the [in-place migration](../design/lovable-handoff.md); approval of the images is not deployment evidence.

The daily overall health rating and symptom charts are frontend requirements over the existing records, not new routes declared by this contract. Before implementing writes, align stable symptom/scale metadata and one source of truth for the local day's self-reported rating. Preserve generic properties and existing entries; do not add a competing health database. The approved design specifies the two scale directions and missing-data behavior.

| Record | Fields |
| --- | --- |
| Page | `id,title,content,revision,created_at,updated_at` |
| JournalEntry | `id,title,content,properties,original_text,journal_date,source,context_revisions,revision,created_at,updated_at`, creation operation metadata |
| VoiceSession | Owned session identity, provider session metadata, optional current entry reference; no held journal document |
| Fixed user/device | Fixed demo-user row and device credential metadata; legacy account tables are preserved without an authentication runtime |

`content` is native BlockNote block JSON, limited to 200,000 serialized bytes, 8 nesting levels, and 1,000 blocks. Preserve styles, nested blocks, and unrelated content.

`properties` is a string-keyed map of text, finite numbers, booleans, null, or lists of those scalar values. It is limited to 50,000 serialized bytes, 100 keys, and 100 values per list. Missing values remain absent. Title length is 1–200 characters; `original_text` is limited to 30,000 characters. Request bodies are limited to 512 KiB. No fixed energy/mood/symptom schema exists. The Journal view derives custom columns from stored properties. A day plan is ordinary entry content.

## Direct REST contract

Application `/api/v1` routes use the fixed demo user without sign-in, session cookies, or bearer user tokens. Device WSS retains its existing transport credential bound to that user. The backend supplies the owner; no request body or header selects another user. Removed `/api/auth/*` routes are not part of the app contract. Responses are direct records unless a wrapper is shown.

| Method and route | Input | Result |
| --- | --- | --- |
| `GET /api/v1/context` | No credentials or owner selector | `{profile,pages}`, all live fixed-user pages and revisions |
| `GET /api/v1/pages` | Optional cursor | `{pages,next_cursor}` |
| `GET /api/v1/pages/:id` | Page ID | Page |
| `POST /api/v1/pages` | `title,content,operation_id` | Page |
| `PATCH /api/v1/pages/:id` | `expected_revision,operation_id,title?,content?` | Page |
| `DELETE /api/v1/pages/:id` | `expected_revision,operation_id` | Archive acknowledgement |
| `GET /api/v1/journal` | `from?,to?,limit?,cursor?` | `{entries,next_cursor}` |
| `GET /api/v1/journal/:id` | Entry ID | JournalEntry |
| `POST /api/v1/journal` | `title,content,properties,original_text?,operation_id` | Saved JournalEntry |
| `PATCH /api/v1/journal/:id` | `expected_revision,operation_id,title?,content?,properties?` | Saved JournalEntry |

The backend owner verified production HTTP and Turso direct Journal POST/reload/PATCH on `https://pink-hack.vercel.app`, including exact retry, changed-payload conflict, and stale revision rejection. Both Journal POST and PATCH return a saved entry with HTTP 200. Voice-session creation returns HTTP 201. Authenticated device WSS plus real Azure Live synthetic PCM and agent saving also passed. Lovable browser voice and physical device audio remain separate checks.

POST writes immediately. PATCH preserves omitted fields. Supplied content/properties replaces that field after the client/agent merges against the current record. Expected revision rejects stale merges. A stable mutation operation ID survives retries; identical replay returns the prior result and changed payload conflicts.

Journal creation operation metadata remains immutable provenance. A PATCH request's operation ID is separate retry metadata; do not compare it to the entry's creation operation ID to verify saving.

## Voice agent

The agent reads context and current entries, then calls `create_journal_entry` or `update_journal_entry` directly in response to user writing requests. Tools use the same fixed-user services as POST/PATCH. The backend validates record scope, blocks/properties, expected revisions, and stable action/retry IDs.

There is no required prepare/confirm/commit tool chain, receipt minting, held proposal record, or separate review screen. The agent asks a normal conversational clarification if intent or the target entry is unclear. Stored page text is context, not permission to run commands.

A successful tool returns the actual saved entry and revision. Failure is reported honestly. Stopping or interrupting cancels further agent work; already saved records remain editable. Normal unsaved editor text may remain locally, without becoming backend proposal storage.

## Owned voice-session target

Current source accepts `POST /api/v1/voice/sessions` with `operation_id,transport:{type:"webrtc",sdp},entry_id?`, without a check-in. It returns `{id,voice_session_id,provider,model,delegation,session:{id},transport:{type,sdp}}`. `id` and `voice_session_id` identify the owned app voice conversation; `session.id` belongs to the provider.

The current application callback is `POST /api/v1/voice/sessions/:id/agent` with `delegation_id,messages:[{role,content}],entry_id?`. It resolves the owner/target from trusted session state and current records and returns `{text,entries:[{id,revision}]}` for actual persisted writes, with an empty entries list when none occurred. Messages are bounded to 24 items and 24,000 total characters in the current validator. Client transcripts use `text`; map that to message `content`, merge fragments appropriately, and send the abort signal. Return response text to Live and refresh Journal after writes. The backend owner must verify the deployed route before enabling the integrated flow.

Azure client delegation provides metadata and lossy transcript fragments, not task text. Use current backend state, bounded/merged messages, and cancellation. The agent callback does not require a stored journal draft or check-in identity.

## Reusable client

`@backend/client` is private workspace code, not assumed published. The sole frontend writer can copy/adapt its two framework-independent source modules into remote `src/lib/voice/`, preserving relative imports and reporting changes to the backend owner.

The updated `createVoiceConnection` uses optional `entryId` and supplies `voiceSessionId`, optional `entryId`, `delegationId`, transcripts, and an abort signal to `onDelegation`, without creating a check-in. Copy the latest upstream modules rather than the earlier check-in version. Call start from a user action and close on stop/unmount. Validate the exact provider session/model before enabling audio and report graceful-close confirmation accurately.

Remove sign-up/sign-in/logout UI, account state, session-token callbacks, Authorization headers, and cookie credentials from application requests. Open directly into pages and Journal using the fixed API origin. Context limits must not prevent managing the saved pages. The voice client uses the same no-user-auth requests; device transport credentials remain a separate backend/device concern.

## Storage transition and checks

Keep legacy check-in, draft, and receipt data/routes only as compatibility while the owner transitions active clients. Do not delete Turso or legacy contents to simplify the API. New journal writes use direct services and no separate proposal resource.

Retain input limits and error envelope `{error:{code,message,retryable},request_id}`. Records outside the fixed demo owner's scope return 404, stale/state/operation conflicts return 409, invalid input returns 422, and storage failure returns 503. Missing or invalid device transport credentials still return 401; application requests do not require user authentication.

Verify fresh fixed-user initialization, requests without cookies or user tokens, direct POST/PATCH, arbitrary properties/blocks, ignored/rejected owner selectors, inaccessible legacy-owner records, stale revisions, same-operation replay, data preservation, and retrieval across app restart on existing Turso. Then exercise the real voice callback and no-login frontend. Earlier authenticated-build checks do not prove this fixed-user revision.

Fixed-user production is verified at `https://pink-hack.vercel.app`, deployment `dpl_DPC2xZNK5MY8tVpVcWELTqs5SHKy`, immutable host `https://pink-hack-pad6g1eaa-quasr.vercel.app`. The backend owner confirmed no-token context retrieval with `profile.owner_id:"demo-user"`, removed auth routes returning 404, owner fields rejected with 422, forged headers unable to access legacy-owner records, direct Journal POST/reload/PATCH, exact retry, changed-payload conflicts, and stale revision rejection. No-account device provision and private-Bearer WSS open/stop passed with zero provider requests. All 51 tests, workspace types, and build pass; existing Turso rows and foreign keys are preserved with no schema changes. Upstream `createVoiceConnection` is frozen with no `sessionToken` option and `credentials:"omit"`/Content-Type-only requests. The sole Lovable writer is applying the no-login revision.

The fixed-user backend is committed in `e2d33ad`. Verification cleanup removed only the exact new synthetic page, journal entry, and test device claim; no legacy records were removed. Authenticated HTTP/WSS/agent-save evidence below describes the previous build. Real voice audio after this fixed-user change and physical hardware behavior remain separate checks.

The backend owner reports the additive Turso migration passed with a private pre-migration backup, unchanged legacy row counts, and an empty foreign-key check. Verified production is deployment `dpl_Ak43VzrcBBiwjuD27reY4y6e4WNF`, immutable host `https://pink-hack-38g1zdff7-quasr.vercel.app`, fixed alias `https://pink-hack.vercel.app`. External health, authenticated HTTP persistence, and authenticated device WSS/PCM/agent saving passed. The synthetic speech test sent 132,200 input bytes and received 256,000 output bytes; an owned reread confirmed the actual heard garden wording and BlockNote entry at revision 1, with no errors. The synthetic singleton claim was conditionally released after the socket closed. Source `99c316c` and verification docs `4d45f10` contain the integrated direct path; 51/51 tests, workspace types, and build passed. Hardware playback, Lovable browser voice, and the 300-second runtime reconnect remain unverified. No duplicate paid startup or synthetic singleton provision is required.

The device contract is fixed mono PCM16LE at 16,000 Hz, recommended 1,024-byte chunks and maximum 2,048 even bytes. Authenticate WSS with the privately provisioned device token. Start/resume, turn-end, interrupt, stop/cancel, ordered flush, and saved event semantics are in [backend.md](backend.md). Audio transmission state is not proof of physical speaker playback.
