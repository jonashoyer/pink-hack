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

Configure `OPENAI_API_KEY` in the backend's private environment to enable GPT-Live. The root repository `.env` is separate and is not automatically loaded by this workspace. `OPENAI_BACKEND_MODEL` defaults to `gpt-6-luna`; the selected OpenAI project must have access to both that backend model and `gpt-live-1`. Azure credentials cannot authenticate requests to `api.openai.com`.

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

The browser creates its microphone/speaker WebRTC connection and sends the SDP offer to the authenticated backend. The backend posts trusted configuration and the offer to OpenAI `POST /v1/live/sessions`, keeping the project key server-side. It returns `{ id, session: { id }, transport: { type, sdp } }`. The outer `id` is our local voice record ID; `session.id` is OpenAI's session ID. Apply `transport.sdp` as the answer and wait for `session.started`. Audio then travels directly between the client and OpenAI. The backend's `active` voice record means successful HTTP negotiation, not verified audio or receipt of `session.started`.

Responses delegation is configured with `get_context`, `get_checkin`, and `prepare_journal_draft`. The client handles completed function items from nested `response.output_item.done`, parses their arguments, and relays them to our tools endpoint. It returns `JSON.stringify(output)` as the matching `function_call_output` using Live `response.item.create`, then sends `response.create` after submitting all pending results. The backend validates all arguments. Draft tool results include `saved: false`; confirm/commit are not exposed as model tools. Saving is an explicit action in the app. A complete client executor has not been built in Lovable yet.

Medical needs pages and previous journal text are omitted from voice context when the stored medical-context opt-in is false. Page contents cannot override that flag. Draft provenance records the permitted context revisions used. Existing current-draft content still belongs to the resumed check-in. Raw audio is not stored by this backend and OpenAI session storage is set to false; provider retention is a separate consideration.

Session initialization has a durable limit of five attempts per user per hour. Replaying an initialization operation returns 409 rather than reusing an SDP answer or creating a second paid session. Provider requests have a 20-second timeout and no automatic retry. The client must close Live with `session.close`, wait for `session.closed`, and then release its microphone/connection. There is no backend sideband, provider hangup route, or durable live-connection lifecycle manager yet. If initialization loses its response, provider finalization is unconfirmed.

## Evidence and remaining integration

Eight local automated tests pass using synthetic data. They exercise real Better Auth, migration-backed SQLite, context edits, owner isolation, revision conflicts, rollback, cancellation, concurrent/duplicate saves, accepted-plan replacement, paging, database reopen, and the Live request/response boundary with a synthetic provider. Type checks and a production server build also pass. These checks do not establish real audio or device operation.

The PRD thread's `.env` access probe found only Azure credentials. Its configured deployment returned `400 OperationNotSupported`; no session was created. Direct `gpt-live-1` remains untested. See [API readiness](api-readiness.md) for that independent probe.

Lovable needs an app sign-in flow, this API base URL and its forms/review UI connected. Atech needs verified hardware, audio transport and device authentication; the foundation explicitly rejects `source: "atech"` instead of treating an unpaired device as an app account. Patterns, saved-entry editing, standalone plan editing/acceptance, profile name/locale, device pairing, and voice-confirmed saves remain requirements for later implementation. This backend foundation is not the complete PRD or an established demo candidate.
