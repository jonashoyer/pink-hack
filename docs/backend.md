---
provenance: "Unvetted Synthetic"
---

# Backend

The demo API is **https://pink-hack.vercel.app** in the existing [quasr/pink-hack Vercel project](https://vercel.com/quasr/pink-hack). Existing Turso is the only deployed database. Azure is the GPT-Live provider, not the application host. Lovable uses this API; Notion is not product storage.

`backend/` is a Better-T-Stack pnpm workspace using Hono, Drizzle and libSQL. There is no Next.js requirement. Vercel's HTTP function exports a callable `getRequestListener` from the built `src/vercel.ts`. Its native device WebSocket function exports an **unlistened** Node HTTP server from `src/index.ts`; Vercel owns the listener. Both functions belong to this project and relay code runs inside this deployment. Local Node execution listens normally.

## Storage and fixed owner

Root `.env` supplies `DATABASE_URL` and `DATABASE_API_KEY` privately. The key was verified as a database auth token with a non-disclosing connection check and is mapped to libSQL `authToken`. `DATABASE_AUTH_TOKEN` remains a compatibility alias. Vercel production variables contain these credentials, Azure Live configuration and the Anthropic application-agent key. No credentials belong in frontend builds or firmware source.

All app and voice requests use the server-owned `DEMO_USER_ID = "demo-user"`, exported from `src/demo-owner.ts`. `ensureDemoOwner(db)` inserts that legacy-compatible user row idempotently before app API/device requests. No account, login, cookie or session token is required. `/api/auth/*` routes are removed. Request owner fields are rejected; authorization/cookie/user headers cannot select another owner. Existing legacy users, sessions, accounts and owned records remain in Turso, under their original ownership, without being merged into the shared demo space.

`createApp(db, config, providerFetch?)` no longer takes an auth object. Better Auth runtime, workspace package, dependencies, scripts and required env values are removed. `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` are removed from Vercel production. The retained database tables support old rows and foreign keys only.

Exact allowed demo browser origins are the backend origin, `https://id-preview--ee916e8c-7f2f-4989-9c6e-cedcff1793b5.lovable.app`, the public app `https://pink-hack-journal.lovable.app`, and the authorized test harness `http://localhost:8080`. CORS is exact and does not enable credentials. Data responses are `Cache-Control: no-store`. `GET /context` exposes `profile.owner_id: "demo-user"`.

## Direct REST contract

| Route | Body or result |
| --- | --- |
| `GET /health` | Public `{status:"ok",service:"pink-hack-backend"}` |
| `GET /api/v1/context` | `{profile,pages}` containing all active owned custom pages |
| `GET /api/v1/pages` | `{pages,next_cursor}`; optional limit/cursor |
| `GET /api/v1/pages/:id` | Direct Page |
| `POST /api/v1/pages` | `{title,content,operation_id}` → direct Page |
| `PATCH /api/v1/pages/:id` | `{expected_revision,operation_id,title?,content?}` → direct Page |
| `DELETE /api/v1/pages/:id` | `{expected_revision,operation_id}` → `{id,revision,archived:true}` |
| `GET /api/v1/journal` | `{entries,next_cursor}`; optional from/to/limit/cursor |
| `GET /api/v1/journal/:id` | Direct JournalEntry |
| `POST /api/v1/journal` | `{title,content,properties,original_text?,operation_id}` → saved JournalEntry, HTTP 200 |
| `PATCH /api/v1/journal/:id` | `{expected_revision,operation_id,title?,content?,properties?}` → saved JournalEntry, HTTP 200 |
| `POST /api/v1/voice/sessions` | `{operation_id,transport:{type:"webrtc",sdp},entry_id?}` → voice session, HTTP 201 |
| `POST /api/v1/voice/sessions/:id/agent` | `{delegation_id,messages:[{role,content}],entry_id?}` → `{text,entries:[{id,revision}]}` |

Page fields are `id,title,content,revision,created_at,updated_at`. Journal entries add `original_text,properties,journal_date,source,context_revisions,capture_id,voice_conversation_id,device_id,session_id,operation_id`. Timestamps are UTC ISO strings. Initial revision is 1. Creation `operation_id` remains immutable metadata when PATCH runs; mutation IDs belong to the operation ledger. Exact retries return the prior result, and changed payloads with the same ID conflict.

Content is native BlockNote block JSON, not a fixed text/checklist section model. Properties are a map of strings, finite numbers, booleans, null, or lists of those values. Supplied content/properties replace only their supplied field; merge edits against the current full document first. Omitted fields and original transcript text remain unchanged. Day plans are ordinary blocks inside the entry.

Frozen validation lives in `src/domain/contracts.ts`: title 1–200 characters; content 200,000 UTF-8 bytes, eight block levels and 1,000 total blocks; properties 50,000 bytes, 100 keys and 100 values per list; original text 30,000 characters; request body 512 KiB. Context exceeds its explicit limit at 200 active pages or 500,000 bytes, returning `context_overflow` rather than silently dropping pages. Page list/archive and auth remain available to recover. Lists default to 30 and allow at most 100 items.

Errors use `{error:{code,message,retryable},request_id}`: invalid device credential 401, inaccessible record 404, stale revision/invalid state 409, invalid input 422, storage failure 503. Ownership, revision validation and operation receipts surround atomic writes.

## Voice

`createVoiceConnection` in `packages/client/src/index.ts` is framework-independent. Supply the fixed API origin, optional `entryId`, status/transcript callbacks and `onDelegation({voiceSessionId,entryId?,delegationId,transcripts,signal}) → Promise<string>`. The `sessionToken` option is removed; browser requests use `credentials: "omit"` and Content-Type only. Call start from a user action. It negotiates WebRTC through the API, waits for a matching provider `session.started`, and then enables capture/playback.

Session responses contain `{id,voice_session_id,provider,model,delegation,session:{id},transport:{type,sdp}}`. The two outer IDs alias the owned conversation; the nested ID belongs to Live. Azure client delegation calls the application agent and returns its `text` over correlated Live thinking events. Refresh Journal for returned `entries`; an empty list means no write during that delegation. Cadence fragments merge by adjacent role; a 24,000-character or 24-turn bound fails explicitly.

The application agent uses the configured Anthropic key with fixed Haiku 5.5. Its tools read owned context/pages/entries and call `create_journal_entry` or `update_journal_entry` through the same services as HTTP. It writes on the user's writing request, without a held proposal, required check-in, review screen or confirmation receipt. Durable callback receipts bind owner, conversation, delegation ID and request hash. Completed retries return the prior result without rerunning the model, even if it would generate different tool IDs. A 60-second execution lease excludes concurrent workers; an expired crashed callback recovers committed action receipts without repeating writes. Changed messages or target with the same delegation ID conflict. Mutation ordinals are server-derived. Actual saved IDs/revisions are re-read before successful output. Uncertain intent or target is clarified conversationally. Stop aborts further work; it does not undo committed entries.

Owned `voice_conversations` stores metadata only. Active `journal_documents` is separate from legacy `journal_entries`. Additive migrations preserve old check-in tables/routes and copy legacy entries with IDs preserved. Canonical corrections do not overwrite legacy rows. The active path creates no check-ins.

Browser `close()` returns `{confirmed,backendStopped}`. `confirmed` means provider `session.closed` was received; `backendStopped` means `POST /api/v1/voice/sessions/:id/stop {}` returned `{voice_session_id,state:"stopped"}` from durable storage. These are separate facts. The backend stop is idempotent and also runs when a known conversation closes before `session.started`. Queued tool calls carry an abort signal. The Stop route aborts local agent work and persists revocation; every mutation validates active conversation state inside its transaction. If a commit wins that transaction order, its entry survives Stop. If revocation or cancellation wins before commit, the mutation fails or rolls back.

Callback failures after a committed mutation return a known saved result and preserve it for replay. Requests aborted by Stop do not announce new success; saved entries remain readable in Journal. Callback receipts hold outcomes/entry IDs, not proposed documents or a confirmation workflow.

Current limitations: content/properties still replace the supplied whole field, and real model preservation depends on its read/merge behavior. Synthetic regression inputs prove server preservation of supplied merges, not arbitrary model accuracy. The agent's 1,024-token output cap limits large-document replacement. `context_revisions` currently reflects pages at mutation time, which can differ from the inference snapshot after concurrent page edits. Browser voice initialization still has a shared five-attempt/hour limit. A real spoken browser loop is a separate remaining verification.

## Atech device contract

Fixed endpoint: **wss://pink-hack.vercel.app/api/v1/device/audio**. Call `POST /api/v1/device/provision {}` without an app token or cookie. It provisions the private device transport credential for `demo-user`. It returns `{device_id,credential_revision,token,audio_path,audio:{type,rate,channels,sample_format,max_chunk_bytes,recommended_chunk_bytes}}`. Send `Authorization: Bearer <device token>` on the WSS upgrade, never a URL query. The database stores only its hash. The singleton `demo` device is bound to the fixed owner. A repeat provisioning call rotates its transport credential. Keep that response private; provisioning is not an account flow.

Binary audio is fixed mono signed PCM16LE at 16,000 Hz. Recommended chunk is 1,024 bytes/32 ms; maximum is 2,048 even bytes. Pace capture in real time. Each direction has a 64,000-byte queue limit.

JSON controls are `start{operation_id,voice_session_id?,entry_id?}`, `audio_turn_end`, `interrupt`, `stop` and `cancel`, each with `type`. Resume supplies the existing voice-session ID and forbids `entry_id` retargeting. Legacy `confirm` is rejected. State events are `{type:"state",state,voice_session_id,last_entry_id}` with connecting/listening/thinking/speaking/error/stopped. Save events are `{type:"saved",entry_id,revision,voice_session_id}` after owned persisted-entry verification.

Process `flush{generation}` in WebSocket order as a barrier: clear all queued/inflight speaker audio before accepting subsequent binary. Begin capture after a listening state. Speaking describes transmitted output, not physical playback completion. Interrupt aborts work, flushes output and closes/reopens Live; old-generation deltas are suppressed. Explicit Stop/cancel marks the conversation stopped and revokes writing, preserving committed entries. Network loss, interrupt and automatic function reconnect retain the active conversation ID. A stopped ID cannot resume; start a new conversation.

Live has no documented PTT commit/output-cancel event. Turn end appends one second of paced silence for automatic endpointing; interrupt uses documented session close/reopen. A synthetic PTT request succeeded, but endpoint timing is not a provider guarantee. Vercel Functions have a 300-second duration limit, so firmware must reconnect with the same owned voice-session ID. A Turso CAS lease excludes another instance, renews every 10 seconds and expires after 30 seconds using database time. Credential rotation invalidates renewal; stale release cannot erase a newer lease.

## Verification and operation

Latest fixed-owner deployment `dpl_DPC2xZNK5MY8tVpVcWELTqs5SHKy` is READY at the fixed Vercel origin. Requests without cookies or tokens passed context (`profile.owner_id: "demo-user"`), direct Journal POST/PATCH/reload, exact replay, changed-payload and stale-revision conflicts. Owner fields were rejected and forged old-user headers could not read foreign legacy records. Removed account routes returned 404. No-account provisioning and private-device-token native WSS open/stop passed, with zero provider requests. New synthetic smoke records/credential were conditionally removed; no legacy rows were deleted.

The fixed-owner cutover made no schema changes. A private pre-cutover snapshot was captured, the fixed user was seeded idempotently, existing row counts were preserved and foreign-key checks passed. No device existed at cutover. Existing device credentials, when present, can be rebound to the fixed owner without rotating their token; old user-owned journal/context records are retained separately. The 51-test suite, workspace type checks and build pass after Better Auth removal.


Historical pre-simplification evidence: on 2026-10-24 deployment `dpl_Ak43VzrcBBiwjuD27reY4y6e4WNF` was READY and aliased to the fixed host. External health returned 200; unAPI and WSS upgrade returned 401. Authenticated HTTP tests passed identity, exact localhost:8080 CORS, direct Turso Journal create/reload/PATCH, unchanged creation metadata, exact retries, changed-payload conflicts and stale revisions.

One authenticated in-service device test used synthetic speech, not hardware. Azure Live accepted 16 kHz startup. The relay sent 132,200 PCM input bytes, received 256,000 output bytes, and returned a verified saved event. Owned HTTP reread confirmed `source:"atech"`, the exact revision, original heard garden wording and matching BlockNote content. No errors occurred. The synthetic device credential/claim was conditionally removed afterward. This establishes deployed bidirectional PCM and one PTT/direct-write path, not Arduino capture/playback or a full Lovable browser voice conversation.

51 tests pass, alongside type checking and build. Tests include direct/legacy storage, ownership, rollback/replay, agent failures and bounded calls, real local WS with synthetic provider, generation flush, durable multi-client lease and fixed-owner HTTP without cookies/tokens. Turso migration had a private pre-migration backup; legacy row counts were preserved and `foreign_key_check` was empty. No new database was provisioned.

For source deployment, use `vercel deploy --prod --yes --scope quasr` from repository root. `.vercelignore` excludes private env files, local databases and probe artifacts. Production migrations are controlled maintenance, never per request. After building, `node backend/scripts/run-server.mjs migrate` loads server/root env privately and runs committed SQL plus idempotent legacy conversion. `dev` and `start` use the same launcher. Local SQLite remains a test option only. The superseded Azure VM was deallocated; its earlier deployment is not the active API.
