---
provenance: "Unvetted Synthetic"
---

# Native Atech voice

Current status: toggle firmware is flashed and passes boot, WiFi and private
backend authentication. The socket closes before session readiness, so physical
GPT speech and Journal saving remain blocked. The latest source-only close
visibility update is built and tested but not flashed. See `VERIFICATION.md`.

Buildable ESP32-S3 firmware for the fixed Pink Hack service. This project is separate from the heard local PCM fallback in `../atech/`. All new files live here. No board, USB, serial port, provisioning endpoint, or paid voice session was accessed by the implementation worker.

Hardware is `14port`, microphone `mic` on 1-2, speaker `spk` on 13-14, button `btn` on 3, and neopixel grid `led` on 4. SDK port mapping supplies every GPIO. Speaker volume defaults to `0.4f`.

## Build and root handoff

Use the already installed SDK wrapper, which selects the project's existing PlatformIO environment:

```sh
atech validate hardware/atech-voice
atech build hardware/atech-voice
sh hardware/atech-voice/scripts/test-drivers.sh
```

Root alone may run `atech upload hardware/atech-voice` and SDK board/monitor/action commands. Upload rebuilds through the SDK. Do not edit `build/`, run another compiler during upload, or open a second serial owner. Generated firmware is `build/.pio/build/esp32-s3-devkitc-1/firmware.bin`. The current demo compiles WiFi details from an ignored, private `private_wifi.h`, as requested by the user. Without that file, saved WiFi and the onboard portal remain available. The device token stays in NVS; never put credentials in tracked files or logs.

## Onboard setup

1. After root flashes, the device tries ESP32's saved 2.4 GHz WiFi credentials. The microphone retains no audio while setup or transport startup is pending.
2. If saved WiFi is missing or unreachable for 20 seconds, join the temporary open AP `PinkHack-Setup`. Open `http://192.168.4.1` if the captive portal does not open automatically. Select the WiFi network and enter its password directly in that local device portal. Neither chat nor a laptop configuration helper is involved.
3. The portal offers WiFi and exit only. It expires after 180 seconds and shuts down when station WiFi connects. `voice_setup` deliberately opens it again. Saved WiFi remains onboard. No SSID or password appears in firmware diagnostics.
4. After NTP time synchronization, the device reads its NVS token. If absent, it makes one verified HTTPS `POST {}` to `/api/v1/device/provision`. It validates `device_id:"demo"`, the credential revision, token shape, audio path, and every fixed audio format/limit field before storing the token. It accepts bounded decoded chunked or Content-Length JSON, at most 4,096 bytes. No provider or database key is used.
5. The token is reused across connections and reboots as `Authorization: Bearer <token>` on the fixed WSS upgrade. It is never printed or placed in a URL. After `listening`, press the physical button once to record, then press again to finish the turn. Speaking before readiness is not queued for later replay.

Expected setup events are `wifi_saved_connecting`, optionally `wifi_setup` with AP/address, `time_sync`, `device_provisioning`, `device_token_stored`, `wss_connecting`, `wss_connected`, `connecting`, and `listening`. Their exact ordering can vary when saved WiFi/token/time are already available. A provision operation is marked pending in NVS before the request. An ambiguous/failing response stops automatic provisioning; it does not repeatedly rotate the singleton token.

For `device_token_invalid_reset_required`, `provision_failed_reset_required`, or `provision_uncertain_reset_required`, root may deliberately issue `voice_reset_token`. This clears the token and uncertainty marker, then permits one fresh onboard provisioning request. It rotates the server's singleton demo-device credential and is a recovery action. `voice_start` alone never clears or rotates a token.

## Audio and conversation behavior

WSS is always `wss://pink-hack.vercel.app:443/api/v1/device/audio`. Binary data is 16,000 Hz mono signed PCM16LE, without WAV/base64 framing. Capture sends up to 1,024 bytes per packet, paced at 32,000 bytes/second on a phase-locked clock anchored to the first fresh packet. Deadlines advance by audio duration so task/socket overhead does not accumulate. Phase lag over 16 ms, or a send finishing past its next deadline, aborts rather than bursting through a backlog. Received frames must be nonempty, even, and at most 2,048 bytes.

The microphone ring holds 16,384 bytes. It consumes each retained sample once, rejects the read spanning a PTT boundary, and drains two subsequent blocks to remove pre-PTT RX DMA audio. Allow roughly 96 ms after capture starts before speaking. The second press freezes capture, drains existing ring and final partial packet at the same pace, then sends `audio_turn_end`. There is no endpoint/commit guarantee: the server adds its documented one second of paced silence. Overruns or input older than 450 ms abort the turn, discard pending speech, report an error, and require release before another turn.

The speaker queue holds 32,768 PCM bytes, plus at most one 1,024-byte task frame. Including stereo DMA, PCM-equivalent output buffering is at most 35,840 bytes. The pinned WebSocket library can additionally allocate a bounded 15 KiB received frame; the total remains below the 64,000-byte direction limit. Only the speaker task calls I2S write. Each write contains at most 64 mono samples and has a 5 ms timeout; partial/failing writes signal an error and flush. A received chunk older than 1,500 ms is stale and is rejected. Queue overflow never reports successful playback.

`spk.stop()` takes the same mutex as the writer, advances its generation, drains the queue, and stops/zeros/restarts I2S DMA before returning. An old task-local chunk cannot write after that barrier. Main-loop stop can wait for the current small I2S write, but never for an entire audio chunk or TLS request. Network connection, portal, HTTPS, and WSS processing run on a separate task. Speaker physical activity includes queued PCM, task PCM, and a conservative 80 ms DMA drain deadline. It is an estimate of hardware drain, not evidence of human hearing.

Pressing during physical output silences locally immediately and sends `interrupt`. Old binary is ignored until an ordered server `flush` followed by new `listening`. Every server flush clears queued/inflight speaker audio before another frame can be dispatched. The recording toggle remains on after that barrier; fresh capture starts at readiness. Close, stop, cancel, and reconnect also clear capture/output. No microphone samples or transcripts are emitted on Serial or saved to files.

The firmware sends only `start`, `audio_turn_end`, `interrupt`, `stop`, and `cancel`. `start` carries a stable UUID operation ID and an optional owned resume session ID, never a resumed `entry_id`. It relays audio; the server's direct voice agent writes Journal content/properties. There is no local ASR, special save phrase, draft, confirmation, or check-in path. Only server `saved` metadata pulses green and reports an entry/revision. Conversation continues after a save, and stopping never rolls back a saved entry.

Operation/session identity is one atomic NVS value. Disconnect, interrupt, and the proactive 270-second function reconnect retain it. Incomplete startup retries reuse the same creation UUID. No captured speech or write request is replayed. A dropped connection requires releasing and pressing again after readiness. Retry delay grows from 1 to at most 30 seconds with small jitter. HTTP 409 lease conflicts retry at 5-second intervals, allowing the 30-second lease to expire; 12 failures stop automatic retries. Other unidentified failures stop after 6. `voice_start` deliberately retries after that limit.

Deliberate stop/cancel, server `stopped`, and `conversation_stopped` retire the session and mint a new creation UUID. A later deliberate `voice_start` starts a fresh conversation. The backend owner verified this correction in deployment `dpl_D4keCEU8SgHaPMTyzLEMuQdNKQ6u`, source `1bf7d24`, on 2026-10-24. Physical stop/restart testing remains pending. `conversation_stopped` retires identity and requires fresh start instead of repeatedly resuming a terminal session.

## Diagnostic protocol

The SDK owns Serial input and acknowledgements. Network diagnostics are queued and printed by SDK main as complete JSON lines. Examples contain no credentials or audio:

```json
{"type":"event","payload":{"event_type":"state","key":"voice_state","value":{"state":"listening","uptime_ms":12000}}}
{"type":"event","payload":{"event_type":"state","key":"voice_saved","value":{"entry_id":"owned-entry-id","revision":1,"voice_session_id":"owned-session-id"}}}
```

`voice_stats` reports readiness/button/physical output, WiFi/AP booleans, cumulative TX/RX/drop/I2S byte counts, queue bytes, microphone overruns, speaker faults, flush count/generation, completed turn count, connection attempt/retry delay, free heap, and dropped diagnostic count. `voice_identity` separately reports the stable operation/session IDs and last saved entry ID. Counters describe transport/I2S acceptance, not heard voice or verified Journal content. Root must reread each saved entry through the existing app/API to verify its contents.

Custom SDK actions all take no value and receive `atechDone` acknowledgement that the request was accepted; completion arrives as events:

| Action | Outcome |
| --- | --- |
| `voice_status` | Queue current stats and identity |
| `voice_stop` | Immediate local flush, terminal stop, retire identity |
| `voice_cancel` | Immediate local flush, terminal cancel, retire identity |
| `voice_start` | Deliberate start/retry; require release before capture |
| `voice_reconnect` | Flush and reconnect with active identity; require release |
| `voice_setup` | Flush and reopen the temporary WiFi portal |
| `voice_reset_token` | Deliberately clear token/uncertainty and reprovision onboard |
| `spk_set_volume` | SDK module action, float 0..1, preferred 0.4 |

LEDs are pulsing blue for setup/connection, cyan for listening, green for capture, amber for thinking, pale violet for physical output, a short green saved pulse, red for error, and off for stopped. Error events carry only codes. WiFiManager debug and ESP32 core debug are disabled. There is no credential/status dump action.

## Verification and remaining device checks

The worker ran SDK validation/build and host tests, with details in `VERIFICATION.md`. Root reported trust-chain verification. No physical voice, ESP32 WiFi, portal submission, onboard token provisioning, paid GPT-Live conversation, real saved Journal content, barge-in hearing, or long-lived reconnect was tested by this worker.

Root's live checks should cover setup and AP closure, token reuse after reboot, PTT release/drain, real heard input/output, save plus owned entry reread, physical barge-in and generation barrier, disconnected-held audio discard, forced function reconnect with the same session, and terminal stop followed by fresh start. Network TLS calls can still block their background task for library timeouts; local PTT/flush stays independent. Static build RAM does not prove enough runtime heap during simultaneous portal/TLS operation. Stock ESP32 NVS is onboard persistence, without a claim of encrypted flash storage.
