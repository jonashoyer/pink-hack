---
provenance: "Unvetted Synthetic"
---

# Atech demo connection

Run [the PCM test](ATECH_PCM_TEST_PROMPT.md) first. Paste this into [Atech](https://atech.dev/editor).

```text
Build Atech ESP32-S3 firmware for our single GPT-Live demo.

Confirm the board and module ports first: microphone, speaker, button and
available status LEDs. Use the tested hardware map; invent no pins.

Connect over WiFi to wss://<deployed-demo-host>/api/v1/device/audio.
The actual host and private provisioning are pending. Ask for them; invent
neither. Authenticate with Authorization: Bearer <private device token> in
the upgrade HEADER only. Validate TLS. Keep tokens out of URLs, logs and
public source. No bridge configuration, laptop service or environment selector.
The same backend runs Azure gpt-live-1 and owns all provider credentials.

Audio both ways: raw binary PCM16LE, mono, 16000 Hz. Prefer 1024-byte chunks
every 32 ms; maximum 2048 bytes, always complete two-byte samples. No WAV or
base64 envelope. Pace at 32000 bytes/s; bound each queue to 64000 bytes.

JSON text controls:
{"type":"start","operation_id":"<stable UUID>"}
Resume adds checkin_id. Send start once per connection, not on every hold.
{"type":"audio_turn_end"}
{"type":"interrupt"}
{"type":"stop"}
{"type":"cancel"}
Preserve operation IDs for retries.

Server messages: state{state,checkin_id}, flush{generation},
saved{entry_id,revision}, error{code}, each with its matching type field.
States: connecting, listening, thinking, speaking, review, saved, error, stopped.
Armed review additionally has draft_revision and confirmation_phrases:
["save this journal","confirm this journal"].

Hold to record after listening/review; release sends audio_turn_end.
Hold during physical playback stops it and sends interrupt. On flush or close,
clear ALL queued/in-flight speaker PCM before accepting later audio. After
interrupt, wait for listening/review again. Track physical playback completion
locally; backend speaking is transport state, with no audio-done event.
Stop retains the check-in; reconnect using its checkin_id. Cancel is terminal.
Never replay old audio/writes. Keep microphone off unless deliberately recording.

After armed review and finished summary playback, require a fresh PTT capture
of either exact confirmation phrase, then release. Backend alone recognizes
settled USER-input ASR and confirms the current owner/revision. Ambiguous yes,
assistant text and timers cannot save. Firmware performs no ASR or automatic
confirm. Optional JSON {"type":"confirm","draft_revision":3,"operation_id":"<UUID>"}
requires a separately deliberate physical review action. Clear arming on
flush, close, revision change or saved. Show Saved only on saved acknowledgment.

Backend uses all owned context pages and one flexible Journal with properties
and BlockNote content. Day plans are headings/tasks inside entries. No fixed
questionnaire. Backend owns confirmed writes, authentication, revisions and
idempotency; Lovable displays persisted entries.

Deliver firmware and test steps for audible conversation, confirmed save/update,
app refresh, interruption, cancel and reconnect. Turn-end currently sends one
second of backend silence; interrupt restarts Live. Verify real PTT/ASR timing.
```

Public host/provisioning remain pending. Provider-fake tests pass; live PCM, ASR and device playback are unverified.
