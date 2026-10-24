---
provenance: "Unvetted Synthetic"
---

# GPT-Live API readiness for Atech

Research date: 2026-10-24. Workspace revision: `502e43af5377a6553ff17a365e73859abf7b316a`, with existing uncommitted documentation preserved. This worker owns API discovery only. The main thread owns the PRD, app architecture, status, and the storage decision.

The configured Azure `gpt-live-1` access test passed using root `.env`. The backend owner subsequently verified authenticated deployed WSS, real Azure Live synthetic PCM, agent saving, and owned Turso reread on the previous Better Auth build. Those application results do not verify the newly requested fixed-user build. Big Kit capture/playback, Lovable browser voice, and 300-second runtime reconnect remain untested. The earlier Realtime rejection used the wrong protocol and is superseded as a Live blocker. A direct OpenAI project key is not required for this Azure path.

The hardware requirement is voice through Atech's actual microphone and speaker. The deployed synthetic PCM test proves the same-service relay and agent persistence, not physical hardware. Hosting is the existing Vercel project with existing Turso storage. Earlier laptop/VM hosting proposals are superseded; the former Azure VM is confirmed deallocated.

## Current shared-user correction

The developer explicitly removed Better Auth and chose one fixed shared user ID. Source inspection confirms exported `DEMO_USER_ID = "demo-user"` in [demo-owner.ts](../backend/apps/server/src/demo-owner.ts), used by `createApp(db, config, providerFetch?)` and device admission. All visitors share pages and Journal records without login. This is an expedient demo architecture, not per-visitor isolation. Provider and storage keys remain on the backend. Direct Journal/BlockNote, Turso, Vercel, and Azure Live remain unchanged. Fixed-user tests and deployment verification are still pending.

The sanity-check owner, thread `a26234d0-9cf4-4db1-986a-1f3d5d532255`, owns auth reconciliation in PRD, app-structure, flexible-pages-journal, and root README, and coordinates the existing implementation owners. This note makes no device credential decision. Source confirms the shared identity; deployed no-login persistence, session/device admission, and audio behavior remain pending owner verification. There is no additional runtime probe from this thread.

## Previous Better Auth application deployment

The previous build integrated direct Journal domain/agent/device writing, without held proposals or a speech-confirmation gate. Source inspection at that handoff confirmed Journal POST, revision-checked PATCH, and the owned `POST /api/v1/voice/sessions/:id/agent` callback returning `{text,entries}`. Its client used `voice_session_id` and optional entry targets instead of a check-in dependency. Auth-related integration must now follow the revised owner contract.

The backend owner externally verified production `https://pink-hack.vercel.app`, deployment `dpl_Ak43VzrcBBiwjuD27reY4y6e4WNF`, immutable host `https://pink-hack-38g1zdff7-quasr.vercel.app`. Health returned 200 and unauthenticated API access 401. Authenticated Better Auth session, real Turso direct Journal POST/reload/PATCH, exact retry, conflicting payload, and stale revision checks passed. Both `http://localhost:8080` and canonical public Lovable preview CORS/trusted origins passed. This supersedes the earlier pending-deployment diagnostics.

Additive Turso migration passed with a private pre-migration backup, unchanged legacy row counts, and an empty foreign-key check. The previous client modules and direct voice callback were handed off for frontend wiring. Authenticated device WSS subsequently passed the synthetic PCM/agent-save test below. The backend owner ran these checks; this thread did not duplicate them or repeat paid startup/provisioning. This evidence predates removal of Better Auth.

## Previous-build authenticated PCM and agent-save proof

The same Vercel deployment's `wss://pink-hack.vercel.app/api/v1/device/audio` passed an authenticated roundtrip with real Azure Live 16 kHz PCM and synthetic speech. The relay sent 132,200 input PCM bytes and received 256,000 output PCM bytes. The application agent saved an owned `source:"atech"` entry at revision 1. HTTP reread confirmed the synthetic heard garden wording and matching BlockNote content. No errors occurred.

The backend owner conditionally released the synthetic demo-device claim after WebSocket closure. The real owner can now provision privately; no duplicate synthetic claim or paid startup test is needed. This is not Arduino microphone/speaker evidence. Lovable browser voice and the 300-second device-function reconnect have not been runtime exercised by this test.

That build's source is integrated in `99c316c`; verification notes are committed in `4d45f10`. The owner reported 51/51 tests, all workspace type checks, and build passing. [Backend evidence and device contract](backend.md) record the test and its limits. These are backend-owner results for the previous Better Auth build, not fixed-user acceptance or a duplicate probe by this documentation thread.

## Corrected Azure GPT-Live access probe

Tested on 2026-10-24 at approximately 12:39 Europe/Copenhagen. After the developer named `/Users/j/Documents/claude-impact-lab`, this thread inspected its [Azure Live adapter](/Users/j/Documents/claude-impact-lab/apps/web/src/lib/server/azure-live.ts) and [voice notes](/Users/j/Documents/claude-impact-lab/docs/voice.md). Those files implement and record a previously verified Azure Live SDP connection. No source files were copied by this PRD thread. The relevant adapter and client-protocol paths were handed to the backend owner for reuse with this app's authentication and journal contracts.

Microsoft's [GPT-Live reference](https://learn.microsoft.com/en-us/azure/foundry/openai/gpt-live-reference) confirms that the primary WebSocket connects to `/openai/v1/live/sessions` and receives `session.start`. Its [WebRTC guide](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/gpt-live-webrtc) confirms the corresponding HTTP SDP exchange. GPT-Live uses Live session events, not Azure Realtime events or ephemeral client keys.

The isolated test loaded the root `.env` directly, opened one Azure Live WebSocket with the configured resource key, and sent a client-delegation startup configuration. It immediately requested graceful closure after startup. No audio, model tool calls, or application writes were sent. Configured key, resource URL, deployment value, and session ID remained out of logs and documentation.

```json
{
  "env_file": ".env",
  "provider": "azure_gpt_live",
  "protocol": "live_primary_websocket",
  "connection_attempts": 1,
  "confirmed_model": "gpt-live-1",
  "session_started": true,
  "session_closed": true,
  "close_reason": "close_requested",
  "websocket_close_code": 1000,
  "usage_seconds": 0.0,
  "elapsed_seconds": 1.49,
  "audio_input_sent": false,
  "tool_calls_executed": 0,
  "application_writes": 0,
  "outcome": "passed"
}
```

The backend owner received this initial access-only result and the reference adapter paths. Subsequent deployed synthetic PCM, application-agent saving, and Turso reread are recorded above. Remaining runtime checks are Lovable browser voice, actual Arduino capture/playback, and 300-second device reconnect. Direct `api.openai.com` access was not tested and is unnecessary for this Azure connection.

## Earlier .env Realtime probe, superseded as a Live blocker

Tested on 2026-10-24 at approximately 12:35 Europe/Copenhagen. The developer explicitly requested `.env` for API testing. The backend owner acknowledged this thread's probe ownership and confirmed they were not running a duplicate authenticated probe.

The repository root `.env` contains configured `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, and `AZURE_OPENAI_REALTIME_DEPLOYMENT`. It contains no direct `OPENAI_API_KEY`, `OPENAI_PROJECT_API_KEY`, or `GPT_LIVE_API_KEY`. `backend/apps/server/.env` also contains no configured direct OpenAI key. Both env files are ignored by Git. Values were read only inside the test process; no key, resource URL, or deployment value was printed or copied into documentation.

Used Node 24's `parseEnv` to load the root file and the already-installed Python `websockets` 15.0.1 for an isolated probe. No dependencies, backend source, or env files were changed. Microsoft's [Azure Realtime WebSocket guide](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio-websockets) documents `/openai/v1/realtime?model=<deployment>` with an `api-key` header and no API-version parameter. That documented GA connection returned HTTP 400. One diagnostic reproduction retrieved the same provider error without exposing configured values.

Sanitized aggregate evidence:

```json
{
  "env_file": ".env",
  "provider": "azure_openai_realtime",
  "authenticated_connection_attempts": 2,
  "http_status": 400,
  "provider_code": "OperationNotSupported",
  "provider_message": "The realtime operation does not work with the specified model. Please choose different model and try again.",
  "sessions_created": 0,
  "session_configured": false,
  "audio_or_text_generation": false,
  "application_writes": 0,
  "direct_gpt_live_access_tested": false,
  "termination": "not_applicable_no_session_created"
}
```

This only confirms rejection of the configured deployment for Azure's Realtime operation. It was the wrong protocol for the requested GPT-Live model. The later Live probe above establishes successful access with the same root-file Azure settings. Azure credentials were not sent to `api.openai.com`. The backend owner received both the initial result and its correction.

## Initial credential and secure-test findings

Before the `.env` follow-up above, presence checks inspected process environment names and whether relevant variables were nonempty. No secret values were printed. That initial repository-scoped search found no `.env`, `.env.*`, or `*.env` files outside excluded dependency, build, and Git directories. The subsequent test supersedes that file-presence result. No credential stores or files outside this repository were searched.

Sanitized result:

```json
{
  "OPENAI_API_KEY_present": false,
  "OPENAI_PROJECT_API_KEY_present": false,
  "GPT_LIVE_API_KEY_present": false,
  "AZURE_OPENAI_API_KEY_present": true,
  "AZURE_OPENAI_BASE_URL_present": true,
  "AZURE_OPENAI_RESOURCE_NAME_present": true,
  "repository_env_files_found": 0,
  "authenticated_openai_requests": 0,
  "live_sessions_created": 0,
  "access_test": "not_run_missing_direct_openai_project_key",
  "session_termination": "not_applicable_no_session_created"
}
```

Azure credentials do not establish authentication or GPT-Live access at `api.openai.com`. They were not tested during the initial research; the later Azure probe is recorded above. Access through the agent's own model provider also does not supply a project key to this application.

The exposed T3 `request_secret` tool returns a one-use `secretRef`, without returning the secret value. The only exposed consumers found were `schedule_task` and `update_scheduled_task`, for webhook signature configuration. Neither is an outbound HTTP API tester. No exposed HTTP test tool accepts a `secretRef`, and terminal commands cannot resolve one. No secret was requested, no scheduler task was created, and no substitute secret-resolution mechanism was invented.

No probe was added under `scripts/`. The backend scaffold thread owns backend source, dependencies, and integration. This PRD thread ran the isolated developer-authorized access probe and owns its evidence. The root-file Azure settings are sufficient for the tested Live connection; backend loading and deployment configuration still need integration. Public availability alone does not establish permissions or quota.

## Verified direct OpenAI documentation

The sections below document the direct OpenAI API as an alternative provider. The configured and tested provider is Azure, using its resource authentication and `/openai/v1/live/sessions` path above.

The OpenAI documentation tools were used to search and fetch the current guides, model page, event-reference sections, endpoint inventory, and the session-creation OpenAPI specification. This is documentation verification, not a test against the authenticated service.

- The [model page][model] identifies `gpt-live-1`, audio/text input and output, streaming, and function calling. Its supported endpoint is Live.
- The [September 10, 2026 changelog][changelog] states GPT-Live 1 is generally available. It lists voice at $0.05 per minute, billed per second, with backend model and tool usage billed separately.
- The [getting-started guide][live] separates the voice conversation from delegated backend reasoning. Applications still execute their own functions, check permissions, and persist records.
- The [WebSocket guide][ws] and [WebRTC guide][rtc] document different startup procedures. Existing Realtime clients require migration; they are not evidence of GPT-Live compatibility.

### Primary WebSocket for a device bridge

Connect the trusted bridge to:

```text
wss://api.openai.com/v1/live/sessions
```

Authenticate using `Authorization: Bearer <OpenAI project API key>`. Use no model query parameter. Send `session.start` as the first message and wait for `session.started` before audio or application commands. The server-assigned ID is `event.session.id`. Keep the key on the trusted bridge or backend.

This protocol specimen isolates session access from backend model and storage access. It is not a runnable or executed probe:

```json
{
  "type": "session.start",
  "event_id": "readiness_start_1",
  "session": {
    "model": "gpt-live-1",
    "audio": {
      "format": { "type": "audio/pcm", "rate": 16000 },
      "output": { "voice": "marin" }
    },
    "delegation": { "type": "client" },
    "store": false
  }
}
```

The [startup schema][start-schema] confirms mono signed 16-bit little-endian PCM at either 16,000 or 24,000 Hz. The same startup format applies to both input and output. Voice, audio format, frontend model, and delegation mode cannot change within that session. The documented default voice is `marin`; the default PCM rate is 24,000 Hz.

For PCM input, send JSON with `type: "session.input_audio.append"` and `audio` containing base64 raw bytes, without a WAV header. Each PCM chunk must contain complete two-byte samples. Supply a continuous ordered stream paced to the recording rate. Changing a configuration value does not resample incoming bytes. [Audio schema][input-audio], [WebSocket guide][ws]

Output arrives as `session.output_audio.delta`, with base64 audio in `delta`. Decode and queue it in delivery order in the selected format. Primary WebSocket output has no timing fields and no output-audio-done event. The bridge must track actual speaker playback and its queue. Reflected sideband audio differs: it is always 24 kHz PCM16LE, and reflected output includes `start_ms` and `end_ms`. [Output schema][output-audio], [server controls][sideband]

### WebRTC session creation

WebRTC is OpenAI's recommended audio transport, including for servers. Its trusted server request is:

```text
POST https://api.openai.com/v1/live/sessions
Authorization: Bearer <OpenAI project API key>
Content-Type: application/json
```

The JSON body contains `session` and `transport: { "type": "webrtc", "sdp": "<real SDP offer>" }`. The creation OpenAPI spec confirms `201 Created`, the ID at `result.session.id`, and the SDP answer at `result.transport.sdp`. Apply the answer and wait for `session.started`. HTTP creation starts the session; do not send `session.start` again on the data channel. WebRTC negotiates the media format, so the WebSocket-only `audio.format` field is not its resampling control. [Quickstart][rtc], [creation reference][create-ref]

A valid negotiated SDP and a WebRTC-capable runtime are needed. A placeholder SDP, HTTP 201 alone, or a successful model-list request does not prove working audio. The quickstart requires an OpenAI project key with GPT-Live access and a compatible SDK; its Node server example requires Node 22.6 or later. Its browser microphone instructions are a sample transport demonstration, not a replacement for the required Atech microphone and speaker.

WebRTC initialization bills 15 seconds of voice duration, credited against running-session duration after startup. Creating and abandoning sessions is not a free access test. [Quickstart][rtc]

### Sideband control

For an existing WebRTC or SIP session, attach a trusted server using the same project authentication to:

```text
wss://api.openai.com/v1/live/sessions/{session_id}/attach
```

Use the saved session ID unchanged. Do not send `session.start` again. A sideband carries commands and events while primary media continues separately. If the device bridge already owns a primary WebSocket, that connection can execute tools and receive transcripts; a second sideband is unnecessary for those responsibilities. Assign one executor per action even when multiple connections receive the same event. [Server controls][sideband]

## Delegation and storage-tool execution

Responses delegation is the documented starting point when OpenAI should run the reasoning backend. Configure `session.delegation.type = "responses"`, `session.delegation.responses.model`, and the backend's instructions and tools. The current delegation guide recommends starting with `gpt-6-luna`, or evaluating `gpt-6-sol` for more complex work. Backend model access must be verified separately from voice access. [Delegation guide][delegation]

Application functions belong in `session.delegation.responses.tools`, using the function fields `type`, `name`, `description`, `parameters`, and `strict`. Hosted tools run at OpenAI; application record reads, writes, and device operations require the application's own authorized executor. [App contracts](app-structure.md) now define the proposed tools and app-owned storage.

The event schema establishes the following flow:

1. `session.delegation.created` contains metadata at `event.delegation.id`, `event.delegation.target`, and, for Responses work, `event.delegation.response_id`. It does not contain task text. [Delegation event schema][delegation-event]
2. Responses stream events arrive inside a top-level `response.event`. Dispatch on `envelope.event.type`. The outer `delegation_id` associates work with the Live delegation, but the schema allows that field to be absent or null. Track the backend response ID from nested `response.created` as well. [Envelope schema][response-event]
3. Read completed function calls from nested `response.output_item.done`, using its function item `call_id`, `name`, and completed `arguments`. An arguments-done event alone is insufficient. Forwarded lifecycle snapshots, including `response.completed`, have an empty output array even when functions need results. [Function execution guide][function-flow]
4. Parse and validate arguments, resolve the application's record identity on the backend, check record/session scope, and execute each permitted operation once. This demo uses the backend's fixed shared user ID after the auth correction. Deduplicate repeated calls and write retries. Do not accept a transcript or model-requested owner ID as the application identity.
5. Return a matching `function_call_output` with `response.item.create` for every pending function call. After all required results are submitted, send `response.create` to continue backend work. The continuation uses the session's stored backend configuration, not a standalone Responses request body. [Function execution guide][function-flow]

These documented wire specimens illustrate the result and continuation. The IDs and output are synthetic; no storage function ran:

```json
{
  "type": "response.item.create",
  "event_id": "readiness_tool_result_1",
  "item": {
    "type": "function_call_output",
    "call_id": "call_example",
    "output": "{\"status\":\"saved\",\"record_id\":\"synthetic_example\"}"
  }
}
```

```json
{
  "type": "response.create",
  "event_id": "readiness_continue_1"
}
```

`response.item.create` has no separate success acknowledgment. Continue processing errors and nested Responses events. `session.started` and `session.updated` do not await asynchronous Responses configuration validation. Listen for `responses_validation_failed`, correct unsupported settings, and test a real delegated call before claiming backend readiness. [Delegation guide][delegation]

Client delegation is also supported, but the application must retain transcripts and task state and run the backend itself. Its delegation event contains metadata rather than the user's request. Updates use `session.commentary.append` for speakable results or `session.thinking.append` for quiet context, with the original client delegation ID. Appends require `content`, limited to 500 tokens, and `delegation_id`; use null for general session context. [Delegation guide][delegation]

## Session termination and verification criteria

An authorized access probe should open one primary WebSocket, send the synthetic startup specimen, wait for `session.started`, then close immediately without audio, backend work, or record writes. The socket handshake alone is insufficient. Record only sanitized status, event types, selected model/format, close reason, and numeric duration. Do not log authorization headers, configuration secrets, transcripts, raw audio, SDP, or full error bodies.

Register the terminal-event receiver before sending:

```json
{ "type": "session.close", "event_id": "readiness_close_1" }
```

Continue receiving until `session.closed`, then release the socket. The terminal event includes `reason`, `session`, and final cumulative `usage.seconds`. `close_requested` is the expected reason for this probe. Running usage updates are cumulative snapshots; keep the latest value rather than adding them. If startup or finalization times out, release resources and record the failed or incomplete state. The WebSocket sample uses a 15-second close timeout. [Close command schema][close-schema], [terminal event schema][closed-schema], [graceful-close guide][close-guide]

Finish required function results and continuations before closing a production conversation. Closing rejects further commands and cancels queued Responses work. An active response may finish, but a response waiting for a function result cannot continue after closing starts. Client-owned work needs its own finish/cancel decision. A socket closing without `session.closed` does not confirm finalization or final usage. [Graceful-close guide][close-guide]

The endpoint inventory and SIP guide also document `POST /v1/live/sessions/{session_id}/hangup`, with no body and `200 OK` on success. Keep the sideband alive for `session.closed`. This was verified in the [SIP guide][sip-close]; the OpenAPI tool could not retrieve that listed endpoint, and its linked method-document fetch returned 404. The proposed access probe uses the separately verified `session.close` event, not an assumed HTTP fallback.

The initial access-only pass proves provider startup and clean termination. The later deployed synthetic speech test separately proved authenticated PCM relay, application-agent saving, and owned Turso reread on the previous Better Auth build. Full acceptance now requires re-verifying the fixed-user build, actual Atech microphone/speaker and Lovable browser interaction, plus the 300-second runtime reconnect check. Do not generalize synthetic audio to hardware playback.

## Atech and app dependencies for the main thread

The existing platform research reports Atech Clawd firmware with 512-sample base64 PCM microphone chunks and `play_pcm` output at 16 kHz mono signed 16-bit audio. Current OpenAI primary WebSocket schemas accept 16 kHz PCM, so a bridge may be able to preserve that rate. This is a format match, not proof of compatible event framing, throughput, capture behavior, or playback.

The initial unauthenticated retrieval of `https://atech.dev/code/clawd.cpp` returned HTTP 403. That historical format claim did not verify hardware behavior. The device owner has since inspected the Clawd SDK reference and confirmed the Big Kit 14-port board, with microphone 1-2, speaker 13-14, button 3, and light grid 4. SDK `atech==1.0.0a11` is installed and physical testing is in progress. Its USB serial defaults require firmware adaptation for direct device WSS. Capture/playback rates, interruption behavior, and authenticated device integration still need runtime evidence. See the [current device guide](atech-firmware-guide.md) and [physical test project](../hardware/atech/README.md).

The previous deployment has authenticated WSS/synthetic PCM proof. The shared-user change needs fresh device admission and persistence verification. Actual hardware must still preserve audio order and pace, bound speaker queues, and handle interruption/flush and echo. Drive indicators from verified capture/playback state; transcript or backend completion does not establish physical playback. Follow the backend owner's revised contract in backend.md. Laptop/VM bridge proposals are historical, not the current implementation.

The backend source resolves record/session scope to exported `DEMO_USER_ID = "demo-user"` while preserving context reads, direct Journal writes, validation, revision/retry protections, and saved entry IDs/revisions after persistence succeeds. Device admission also uses that constant. Fixed-user tests, deployment, and device admission runtime verification remain pending. The sole frontend writer owns canonical Jonas browser WebRTC acceptance, and the Atech owner owns physical capture/playback and device integration. Keep provider and storage credentials on the backend.

The developer confirmed app-owned storage with no Notion integration. The existing Better-T-Stack backend owns the shared API and same-service device audio relay, with Lovable as external frontend. Latest deployment direction uses the existing Turso database through root `.env` `DATABASE_URL` and `DATABASE_API_KEY`; no new database service/container is provisioned. The backend owner handles private token mapping, migrations, and Turso persistence verification. The PRD and app contracts define generic pages and flexible journal content/properties. GPT-Live `store` controls optional provider session recording, not the app's database. The access-only Live probe provides no Turso persistence evidence.

No application, dependency install, firmware change, Arduino Uno Q deployment, adb/docker invocation, publication, or existing-document edit occurred in this task.

[model]: https://developers.openai.com/api/docs/models/gpt-live-1
[changelog]: https://developers.openai.com/api/docs/changelog#september-2026
[live]: https://developers.openai.com/api/docs/guides/live
[rtc]: https://developers.openai.com/api/docs/guides/voice-webrtc?api=live
[ws]: https://developers.openai.com/api/docs/guides/voice-websockets?api=live
[create-ref]: https://api.openai.com/v1/live/sessions
[sideband]: https://developers.openai.com/api/docs/guides/voice-server-controls?api=live
[delegation]: https://developers.openai.com/api/docs/guides/live-delegation?delegation-mode=responses
[function-flow]: https://developers.openai.com/api/docs/guides/live-delegation#run-a-custom-function-and-return-its-result
[start-schema]: https://developers.openai.com/api/reference/resources/live/primary-websocket#session.start
[input-audio]: https://developers.openai.com/api/reference/resources/live/primary-websocket#session.input_audio.append
[output-audio]: https://developers.openai.com/api/reference/resources/live/primary-websocket#session.output_audio.delta
[delegation-event]: https://developers.openai.com/api/reference/resources/live/primary-websocket#session.delegation.created
[response-event]: https://developers.openai.com/api/reference/resources/live/primary-websocket#response.event
[close-schema]: https://developers.openai.com/api/reference/resources/live/primary-websocket#session.close
[closed-schema]: https://developers.openai.com/api/reference/resources/live/primary-websocket#session.closed
[close-guide]: https://developers.openai.com/api/docs/guides/live-conversations#usage-and-graceful-close
[sip-close]: https://developers.openai.com/api/docs/guides/voice-sip?api=live#transfer-or-end-the-call
[clawd]: https://atech.dev/code/clawd.cpp
