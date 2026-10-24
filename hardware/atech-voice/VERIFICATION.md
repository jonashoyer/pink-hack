---
provenance: "Unvetted Synthetic"
---

# Worker verification

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

Startup did not pass. SDK boot-report checks timed out at 5 and 12 seconds, and
`voice_status` received no acknowledgement. After physical reset, USB captured
repeating Core 0 unhandled-debug-exception panics with a corrupted scheduler
backtrace. The light grid stayed blue. No onboard provisioning or live speech
was reached.

The microphone capture function has a compiled 5,248-byte frame against its
6,144-byte task stack. Root changed only that stack to 8,192 bytes, matching the
physically tested local microphone, and rebuilt successfully. Hardware retest
is pending USB reconnection. This is a stack-exhaustion hypothesis, not yet a
verified startup fix or physical voice result.

The revised artifact is SHA-256
`c5f46a5f9ba49bb0bcf8fbff13e71008098ee468635231551d763e275adc0c3b`.
Its build exited 0. The next upload failed because the Mac no longer detected
an Atech USB device, despite reported reconnection with the original cable.
This revised artifact has not reached the board. BOOT/FLASH-button availability
is being confirmed before attempting documented ESP32-S3 recovery.

Backend owner verified terminal stop/cancel deployment
`dpl_D4keCEU8SgHaPMTyzLEMuQdNKQ6u`, source `1bf7d24`, at the fixed
`pink-hack.vercel.app` HTTPS/WSS host. It matches the firmware's identity
retirement behavior. No device provisioning or provider audio probe accompanied
that backend deployment.
