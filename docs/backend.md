---
provenance: "Unvetted Synthetic"
---

# Backend foundation

The developer requested Better-T-Stack and removed Notion from the product. [Voice-Guided Notion Medical Journal](t3-thread://v1/a8307cba-accb-4578-a28f-68d56993b723) supplies the product requirements: personal and medical needs pages, daily journals, and one API for Lovable and Atech. The Notion event page remains a research source.

## Stack and ownership

`backend/` is a separate pnpm workspace generated with Better-T-Stack. Hono runs on Node, Better Auth provides accounts and sessions, and Drizzle uses SQLite/libSQL. Lovable remains the frontend. There is no Next.js app or Notion API integration.

The local SQLite file is an expedient development store. Use a persistent disk or a hosted libSQL/Turso database for a deployed backend. An ephemeral deployment filesystem will lose it. `DATABASE_AUTH_TOKEN` supports a remote libSQL database. This scaffold does not provision hosting or a hosted database.

The API owns record validation, authenticated ownership, revision checks, confirmation and writes. Journal entries, reviewed observations and day plans are separate records. The commit transaction saves them and the session state together. Unique constraints prevent repeated journal saves and multiple accepted plans for the same owner/date. Context pages have fixed text/checklist sections rather than a universal rich-text editor.

## Run locally

From the repository root:

```sh
pnpm -C backend install
pnpm -C backend setup:local
pnpm -C backend/packages/db db:migrate
pnpm -C backend dev:server
```

`setup:local` creates `backend/apps/server/.env` with a random authentication secret only if the file does not exist. It preserves existing configuration. The environment file is ignored by Git. A non-secret template is at `backend/apps/server/.env.example`.

The generated local server URL is `http://localhost:3000`. Configure `CORS_ORIGIN` to the exact frontend origin, including its port. Set `BETTER_AUTH_URL` to the backend URL and use HTTPS plus `NODE_ENV=production` when deployed. The app and backend can share a parent domain for cookie authentication. For a frontend on an unrelated domain, browser third-party cookie policy can interfere; the provided bearer plugin also accepts a Better Auth session token. Keep browser bearer tokens in memory, not in a public build variable.

The `dev:server` and `start` launcher reads provider settings from the repository root `.env`, then overlays nonempty provider settings from `backend/apps/server/.env` without logging them. This prevents stale inherited host credentials from overriding the supplied local settings. All other backend settings remain in the server's own environment file. Use Node 22.6 or later.

The configured path uses `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, and `AZURE_OPENAI_REALTIME_DEPLOYMENT` for Azure **Live**, despite the deployment variable's historical name. It calls `/openai/v1/live/sessions` with the `api-key` header and client delegation. The endpoint validator accepts the Azure OpenAI and Foundry services hostname forms. No direct OpenAI key is required for this Azure path.

An alternative direct OpenAI path uses `OPENAI_API_KEY` and Responses delegation; `OPENAI_BACKEND_MODEL` defaults to `gpt-6-luna`. It requires project access to both that backend model and `gpt-live-1`. Azure keys are never sent to `api.openai.com`. Complete Azure settings take precedence over direct OpenAI settings; partial Azure settings produce a configuration error.

## Implemented REST contract

`GET /health` is public. Everything under `/api/v1` requires a Better Auth session cookie or `Authorization: Bearer <session token>`. The owner comes from that session; request bodies cannot supply an owner ID. Responses containing application data use `Cache-Control: no-store`. Browser origins are checked separately from CORS. Request bodies are limited to 128 KiB.

Authentication is exposed under `/api/auth/*`. Start with `POST /api/auth/sign-up/email` or `/api/auth/sign-in/email` using `{ "name": "...", "email": "...", "password": "..." }` for sign-up, and email/password for sign-in. The sign-in response supplies a token; the `set-auth-token` response header supplies the bearer-plugin token. Password reset and email verification delivery are not configured.

| Method and route | Input or result |
| --- | --- |
| `GET /api/v1/context` | Profile and the two owned pages; first read creates empty pages |
| `PATCH /api/v1/profile` | `expected_revision`, optional `timezone`, optional `allow_medical_voice_context` |
| `PATCH /api/v1/pages/:id` | `expected_revision`, `sections`, optional `title` |
| `POST /api/v1/checkins` | `{ "source": "app", "operation_id": "capture-id" }`; returns a check-in, retries return the same ID |
| `GET /api/v1/checkins/:id` | Stage, draft and revision, captured local date, saved entry ID |
| `PUT /api/v1/checkins/:id/draft` | `{ "expected_revision": 0, "draft": ... }`; invalidates earlier confirmation |
| `POST /api/v1/checkins/:id/confirm` | `draft_revision`, `action: "save"`, `operation_id`, optional `plan_state: "draft" or "accepted"`, optional `replace_plan_id`; returns receipt |
| `POST /api/v1/checkins/:id/commit` | `confirmation_receipt`, the same save `operation_id`; returns saved entry and associated records |
| `POST /api/v1/checkins/:id/cancel` | Empty body or `{}`; closes without journal save |
| `GET /api/v1/journal` | Optional `from`, `to`, `limit` and opaque `cursor`; returns `entries` and `next_cursor` |
| `GET /api/v1/journal/:id` | Owned entry, confirmed observations, associated day plans |
| `POST /api/v1/voice/sessions` | `checkin_id`, new `operation_id`, `transport: { "type": "webrtc", "sdp": "..." }` |
| `POST /api/v1/voice/sessions/:id/tools` | Local voice ID, `call_id`, allowed tool `name`, JSON `arguments`; returns `call_id` and `output` |

Validation schemas live in `backend/apps/server/src/domain/contracts.ts`. Requests use snake_case. A draft requires `title`, `original_text`, `note`, `observations`, and nullable `proposed_plan`. Observations support `energy`, `mood`, `sleep_hours`, and `symptom`. Energy uses an integer self-report from 1 to 5 with shared labels: 1 Very low, 2 Low, 3 Moderate, 4 High, 5 Very high. `energyLabels` exports those labels. Unknown values are absent, not zero. New writes reject the earlier three text categories; no stored categories are automatically reinterpreted as numbers. A proposed plan contains `items` with stable IDs, text and state.

Errors have `{ "error": { "code": "...", "message": "...", "retryable": false }, "request_id": "..." }`. Missing authentication is 401, inaccessible records 404, stale revisions or closed sessions 409, invalid inputs 422, and storage failures 503. Storage retries keep the same capture/save operation ID. Journal date is captured at check-in creation from the user's stored timezone, initially UTC. Multiple entries per day are allowed.

## GPT-Live handoff

The browser creates its microphone/speaker WebRTC connection and sends the SDP offer to the authenticated backend. The backend posts trusted configuration and the offer to the selected provider's Live endpoint, keeping its key server-side. It returns `{ id, provider, model, delegation, session: { id }, transport: { type, sdp } }`. The outer `id` is our local voice record ID; `session.id` is the provider session ID. Apply `transport.sdp` as the answer and wait for a matching `session.started`. Audio travels directly between the client and the provider. The backend's `active` voice record means successful HTTP negotiation, not verified audio or receipt of `session.started`.

The direct OpenAI path configures Responses delegation with `get_context`, `get_checkin`, and `prepare_journal_draft`. The client handles completed function items from nested `response.output_item.done`, parses their arguments, and relays them to our tools endpoint. It returns `JSON.stringify(output)` as the matching `function_call_output` using Live `response.item.create`, then sends `response.create` after submitting all pending results. The backend validates all arguments. Draft tool results include `saved: false`; confirm/commit are not model tools. Saving is an explicit action in the app.

Azure follows the verified reference's client delegation. The application receives delegation metadata and must run its own reasoning workflow using transcripts and verified backend state. It returns the result through correlated `session.thinking.append` events. No task text exists in the delegation metadata. The transport callback is provided; a complete client-delegation reasoning agent is not implemented by this foundation. Both paths share the same authenticated journal API and save permissions.

## Browser integration module

`backend/packages/client/src/` adapts `claude-impact-lab`'s `live-protocol.ts` and the transport parts of `use-realtime-voice.ts`. It contains no finance or demo-store code. `createVoiceConnection` is framework-independent and can be imported from `@backend/client` in this workspace or brought into the Lovable frontend as the two source modules. Supply the API base URL, check-in ID, session-token getter, status/transcript callbacks, and an `onDelegation` callback for the application's reasoning workflow.

Call `start()` from a user click. It captures microphone permission, creates the event channel before the SDP offer, waits for ICE candidates, and validates the provider's session ID/model/delegation before enabling microphone/audio. Transcript fragments are lossy and are not guaranteed to be final turns. The Azure callback receives bounded transcript history, a check-in ID and an abort signal; it must retrieve current backend state and honor cancellation before writing. `close()` disables capture, cancels local agent work, sends `session.close`, and waits up to 15 seconds for finalization. Its `{ confirmed }` result distinguishes provider closure from timeout or disconnection.

The module handles Responses tool batches and client-delegation callbacks. It has not been installed into the cloud Lovable project or exercised with real microphone audio in this repo. Connect the frontend and its reasoning workflow before treating this as a complete voice journal flow.

Medical needs pages and previous journal text are omitted from voice context when the stored medical-context opt-in is false. Page contents cannot override that flag. Draft provenance records the permitted context revisions used. Existing current-draft content still belongs to the resumed check-in. Raw audio is not stored by this backend and OpenAI session storage is set to false; provider retention is a separate consideration.

Session initialization has a durable limit of five attempts per user per hour. Replaying an initialization operation returns 409 rather than reusing an SDP answer or creating a second paid session. Provider requests have a 20-second timeout and no automatic retry. The client must close Live with `session.close`, wait for `session.closed`, and then release its microphone/connection. There is no backend sideband, provider hangup route, or durable live-connection lifecycle manager yet. If initialization loses its response, provider finalization is unconfirmed.

## Evidence and remaining integration

Twelve local automated tests pass using synthetic data. They exercise real Better Auth, migration-backed SQLite, context edits, owner isolation, revision conflicts, rollback, cancellation, concurrent/duplicate saves, accepted-plan replacement, paging, database reopen, both Live provider request boundaries, and transcript/session protocol helpers. Type checks and a production server build also pass. These checks do not establish real audio or device operation.

The PRD thread's corrected root-`.env` Azure Live probe passed: `session.started` confirmed `gpt-live-1`, followed by graceful `session.closed`, WebSocket code 1000, and final usage 0.0 seconds. It used no audio, tools or application writes. Its earlier Realtime `OperationNotSupported` result tested the wrong protocol and is superseded as a GPT-Live blocker. See [API readiness](api-readiness.md). The reference project also records user-confirmed audible speech, which is evidence for the reference implementation, not this app.

Lovable needs an app sign-in flow, this API base URL and its forms/review UI connected. Atech needs verified hardware, audio transport and device authentication; the foundation explicitly rejects `source: "atech"` instead of treating an unpaired device as an app account. Patterns, saved-entry editing, standalone plan editing/acceptance, profile name/locale, device pairing, and voice-confirmed saves remain requirements for later implementation. This backend foundation is not the complete PRD or an established demo candidate.
