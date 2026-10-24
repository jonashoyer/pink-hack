---
provenance: "Unvetted Synthetic"
---

# Worker verification

Active device deadline: 2026-10-24 16:34:32 Europe/Copenhagen, 14:34:32 UTC.
The user requires an audible device conversation and genuine Journal save.
The authorized temporary Mac backend remains the demo target.

Outcome on 2026-10-24: scoped native firmware implemented and buildable. Physical integration remains with root. The shared checkout's base HEAD was `e2d33adf15363239f64b2fd5610bb85ad8e3eb61`; this worker created only `hardware/atech-voice/`, with no commit or PR. Other owners' changes were preserved.

Final SDK commands:

```sh
atech validate hardware/atech-voice
atech build hardware/atech-voice
```

Both exited 0. Validation printed `ok`. The final build printed `[SUCCESS]`, with 66,484 bytes of 327,680 static RAM and 1,563,541 bytes of 3,342,336 flash capacity. Environment was installed Atech SDK `1.0.0a11`, board `esp32-s3-devkitc-1`, PlatformIO Espressif32 `8.0.0`, Arduino ESP32 `3.3.12`, Xtensa toolchain `14.2.0`. Build paths describe an 8 MB ESP32-S3 target without a PSRAM requirement. Dependency downloads were limited to this firmware's module manifests and the bundled SDK neopixel dependency. No global package install or generated-build edit occurred.

Final artifact `build/.pio/build/esp32-s3-devkitc-1/firmware.bin` is 1,605,728 bytes, SHA-256 `0cae18c446967885a4d00efc50f03dbdccbd0bbcb3776d4026e7407e273d5878`. The excluded local `build-check.log` contains SDK output. This identifies the built worker artifact; a later root `atech upload` regenerates/builds through the SDK.

`sh hardware/atech-voice/scripts/test-drivers.sh` exited 0 with:

```text
PASS microphone fresh FIFO, single consumption, release drain, bounded overflow, discard
PASS speaker stop clears queued/inflight DMA; new generation has no stale PCM
PASS speaker queue bound, bad frame rejection, write failure detection/flush
```

These tests compile the actual microphone/speaker sources against host FreeRTOS/I2S stubs. They exercise task concurrency, single consumption, frozen release drain, warmup rejection, 8,192-sample capture bound/overruns, generation exclusion after stop, volume scaling, bounded output, invalid frames, and write failure. They do not emulate ESP32 I2S timing or execute the network transport. Root independently reported the same three host checks passing.

Source review reconciled the following before the final build:

- Provisioning decodes both chunked and Content-Length responses with HTTPClient's supported `writeToStream` into a fixed 4,096-byte sink, with finite HTTP/TLS timeouts. It validates the fixed demo/PCM contract and never uses unbounded `getString`.
- The pinned WebSocket library's handshake disconnect reasons expose HTTP 401/403/409. Unknown failures and lease conflicts have capped retry counts, with explicit restart/reset diagnostics. Token rotation never follows a connection retry.
- The operation UUID/session pair uses one atomic NVS blob. Deliberate stop/cancel and terminal server results retire it; disconnect/interrupt/function reconnect preserve active identity. The backend owner confirmed this terminal-stop correction is being deployed; root owns deployment readiness verification.
- TX uses a first-packet-anchored phase clock. Each deadline advances by PCM duration. Over 16 ms of phase lag or a blocked send past its next deadline aborts rather than accumulating drift or sending a catch-up burst. This was compiled and reviewed, not measured against actual WiFi latency.
- Every speaker write and stop barrier use the same mutex. Stop executes stop, zero DMA, and restart individually, advances generation, and drains the software queue. Close and ordered flush clear output before later binary.
- `tls_roots.h` was checked byte-for-byte against the checked-in Google bundle plus ISRG Root X1. Root reported independent live-host OpenSSL chain validation with `google-roots.pem`, verify return code 0. GTS Root R1 is self-signed in that bundle.

Public CA SHA-256 values are `ec989df46c8f4419ef2ee2517cad7619d555e4973f3307be697662aa2497e480` for `google-roots.pem` and `22b557a27055b33606b6559f37703928d3e4ad79f110b407d04986e1843543d1` for `isrgrootx1.pem`.

No device/serial connection, WiFi portal submission, HTTPS provision request, live provider session, real speech roundtrip, or Journal write was performed by this worker. No private SSID/password/token/header was created or requested. Root must verify the real portal, NVS persistence, runtime heap/TLS, voice quality and pacing, barge-in clearing, actual saved entry contents, network/function reconnect, and terminal stop/fresh-start against the deployed backend. Human hearing and a persisted-entry reread remain required for a physical voice claim. The firmware uses an expedient local drain deadline and library timeouts; these need target-device measurement.

Compilation is finished. Root has sole USB/flash/live-test ownership. The worker will not start another build while root flashes.

## Root hardware integration

Root validated and uploaded the worker artifact above on 2026-10-24. SDK upload
exited 0 and verified every written image hash. The board is ESP32-S3 revision
0.2 with embedded 2 MB PSRAM; this firmware does not require PSRAM.

Initial startup did not pass. SDK boot-report checks timed out at 5 and 12 seconds, and
`voice_status` received no acknowledgement. After physical reset, USB captured
repeating Core 0 unhandled-debug-exception panics with a corrupted scheduler
backtrace. The light grid stayed blue. No onboard provisioning or live speech
was reached.

The microphone capture function has a compiled 5,248-byte frame against its
6,144-byte task stack. Root changed only that stack to 8,192 bytes, matching the
physically tested local microphone. After USB returned and this change was
flashed, startup and SDK acknowledgements passed without the observed panic.

The revised artifact is SHA-256
`c5f46a5f9ba49bb0bcf8fbff13e71008098ee468635231551d763e275adc0c3b`.
Its build exited 0. One upload initially failed while USB was absent; a later
SDK upload succeeded when the board reappeared. No BOOT button or guessed pins
were needed. Native USB's 256-byte TX ring also truncated status JSON; a bounded
4,096-byte ring and whole-line capacity check restored complete diagnostics.

Backend owner verified terminal stop/cancel deployment
`dpl_D4keCEU8SgHaPMTyzLEMuQdNKQ6u`, source `1bf7d24`, at the fixed
`pink-hack.vercel.app` HTTPS/WSS host. It matches the firmware's identity
retirement behavior. No device provisioning or provider audio probe accompanied
that backend deployment.

Previous failed flashed candidate SHA-256 is
`aabfe86ef8817005a9b2cfe169faae7f7da2439450283ad122ac10f25457238b`.
SDK build/upload and boot passed. It includes the requested recording toggle,
25 ms button debounce, and deferred session sends after WebSocket maintenance.
The latter pattern follows official `atechdotdev/atech-voice-agent` commit
`611e086feb56d4544948fae32149229a2f8e947f`; it did not resolve the disconnect.
WiFi details requested by the user are compiled from an ignored, mode-600 local
header. No password or device token appears in tracked source or these logs.

Physical WiFi and private-token WSS authentication passed, including token
reuse after reboot. The session still closes after the initial `stopped:null`
transport baseline, before `connecting` or `listening`. A bounded earlier
capture recorded a 70-byte start control, successful `sendTXT`, no local
close-pending/error/fragment branch, and a zero-length disconnect callback with
no exposed close code. Main reported zero backend start receipts for the
captured operations. PCM TX/RX remained zero; GPT speech and a Journal save
have not been tested successfully. Automatic retries and the USB monitor are
stopped. Temporary wire tracing and periodic realtime stats were removed;
`voice_status` still requests a bounded readback. Coordination is Main only.

Atech MCP was added with `codex mcp add atech --url https://atech.dev/mcp` and
used through MCP initialize, tools/list and `atech_overview`. It is a read-only
documentation server, not an alternate provider or a replacement device bridge.

## Source-only close visibility

Main requested a bounded local adaptation after the failed actual candidate.
The installed WebSockets 2.7.2 release parser discarded a received Close frame's
code/reason before `WStype_DISCONNECTED`. The pinned LGPL-2.1 library is now
vendored under `vendor/WebSockets` with two no-op hooks before payload/socket
cleanup. Encoder, handshake and debug settings remain unchanged.

`voice_status` explicitly requests an additional `voice_close` record. It
retains the first cause, distinguishes received Close from local failure,
reports whether an RFC code exists, and captures the numeric ESP32 TLS error.
Reasons are capped at 64 bytes and sanitized; credentials, bodies, long
high-entropy strings and truncated text are redacted. Nothing is periodically
published or sent to the backend by this change.

`sh scripts/test-closure.sh` passed cause/cleanup preservation, peer/no-code,
local transport, socket error, bounded text and redaction checks. SDK build
passed in 22.13 seconds with 66,580 bytes RAM and 1,575,057 bytes flash.
The source-only artifact SHA-256 is
`ece227481eae0d74a3ab17aecb1cf8f8a28a219db431d3143bd180b331093d48`.
At that source-only stage it was not flashed and did not establish a functional fix. No new session,
provisioning, token rotation, provider request or audio attempt accompanied it.
The next permitted hardware action is Main's authorized actual E2E attempt.

## Mac backend and upgrade fix

The user authorized parallel workers and a temporary backend on this Mac.
The existing native backend runs without watch on port 8787, using existing
Turso, `demo-user` and Azure `gpt-live-1`. The trusted tunnel is
`https://timer-cab-continuously-ghz.trycloudflare.com`; HTTPS health returned
200 and the served chain verified against GTS Root R4 already in the firmware.
Runtime hashes and stop command are in
`/Users/j/.local/share/pink-hack-atech/local-backend/manifest.json`.
No device credential was rotated or reprovisioned.

The first actual local candidate received Close 1002 before any start receipt.
Root found `_authHeader` included a trailing CRLF while the pinned library
already appends CRLF after extra headers. This ended the upgrade early and left
`User-Agent` bytes in the WebSocket stream. An independent worker confirmed it.
The backend's actual `ws` Receiver rejected that synthetic remainder with 1002
and `WS_ERR_UNEXPECTED_RSV_2_3`; corrected headers left no remainder and a
masked start frame was accepted. No backend or JSON changes were required.

Root removed that trailing CRLF, validated and uploaded through Atech. Flashed
SHA-256 is `5e3046c19791cdadf151f21b49c295957f2d55ad9dec86d6443336478a4432e0`.
Actual device events reached `wss_connected`, `connecting`, then `listening`.
The first explicit status showed connected/ready, attempt 1, no close or driver
faults. Two provider failures occurred after about 30 seconds without audio,
followed by successful reconnects; their provider cause is not established.
The human was asked to use toggle recording for a Journal writing request.
Vercel has not been retested.

The human's actual toggle attempt sent 235,520 microphone PCM bytes and received
43,392 reply PCM bytes. I2S accepted 47,872 PCM-equivalent bytes, but the human
heard no reply. Three speaker faults and 36 flushes were observed. Incoming reply
audio during capture repeatedly triggered interruption and generation restart;
three `audio_turn_end` controls were recorded. There was no `saved` event or
entry ID. Root stopped the failed conversation to repair playback, not for seed
work. The runtime, token and database remained untouched.

Root increased the timeout for each 64-sample I2S write from 5 to 20 ms, preserving
the mutex/flush barrier and bounded queue. The physically heard local SDK uses a
100 ms write timeout. All three actual-driver host checks and Atech validation
passed. This scheduling-margin change is a candidate until a human hears it.
