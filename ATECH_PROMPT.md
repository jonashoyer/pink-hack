---
provenance: "Unvetted Synthetic"
---

# Atech demo connection

Run [the local PCM test](ATECH_PCM_TEST_PROMPT.md) now. Hold this connection prompt until the Vercel deployment contract is verified. The Azure VM endpoint is retired and must not be flashed.

```text
Build Atech ESP32-S3 firmware for our single GPT-Live demo.
Confirm the microphone, speaker, button and status LED ports; invent no pins.

Deploy the backend to the existing Vercel project:
https://vercel.com/quasr/pink-hack
Turso is the sole runtime database. That project dashboard is not a device URL.
Wait for the backend owner to publish and verify the public HTTPS/WSS endpoint,
private device provisioning and final voice_session payload. Do not invent
an endpoint, use the retired Azure VM host or flash network firmware before
this contract is available. No transport fallback or separate bridge service.
Use Authorization: Bearer <private device token> in the upgrade HEADER only.
Validate TLS; keep tokens out of URLs, logs and public source. No bridge
configuration, laptop service or environment selector. Azure GPT-Live remains
the voice provider; its credentials stay backend-side.

Target audio contract, to verify on Vercel: raw binary PCM16LE, mono 16000 Hz.
Prefer 1024-byte chunks
every 32 ms; maximum 2048 bytes, complete two-byte samples, no WAV/base64.
Pace at 32000 bytes/s; bound each queue to 64000 bytes.

The backend uses owned POST /api/v1/voice/sessions identity with optional entry_id
and POST /api/v1/voice/sessions/:id/agent for application reasoning/direct writes.
Obtain the final device WSS start/resume mapping before generating connection
code; these HTTP routes do not define it. Do not create or require a checkin.
Planned JSON audio controls, subject to the verified Vercel contract:
{"type":"audio_turn_end"}
{"type":"interrupt"}
{"type":"stop"}
{"type":"cancel"}

Hold to record after backend readiness; release ends the audio turn.
Hold during playback stops it and sends interrupt. On flush{generation} or
close, clear ALL queued/in-flight speaker PCM before accepting subsequent audio.
Wait for readiness after interrupt. Physical playback completion belongs to
firmware; backend speaking is transport state, without an audio-done event.
Stop/cancel control audio, not journal approval or rollback. Never replay stale
audio/writes. Keep microphone off unless deliberately recording.

The backend uses gpt-live-1 and all owned context pages. The voice agent calls
create_journal_entry or update_journal_entry directly on the user's writing
request. No held proposal, review gate, special confirmation phrase or receipt.
Clarify genuinely ambiguous intent/target conversationally.

One Journal stores flexible properties and BlockNote content. Day plans are
headings/tasks within entries. POST /api/v1/journal writes immediately;
PATCH /api/v1/journal/:id updates directly, preserving unrelated content.
Backend owns user/device authentication, validation, expected target revisions,
stable operation IDs and atomic writes. Working text stays in agent context.
Announce/show Saved only after a persisted response, never on error.

Deliver firmware and tests for audible conversation, direct create/update,
app refresh, interruption and reconnect. Keep existing saved entries intact.
The prior relay used one second of silence for turn-end; verify Vercel PTT timing.
```

To validate the complete flow:

1. Say: "Write in my journal: I slept poorly. Add a Day plan with a ten-minute walk."
2. Say: "Change that walk to five minutes; keep everything else."
3. Refresh the app and verify both persisted changes. Test interruption and reconnect.

Vercel HTTPS/WSS, provisioning and direct-write session evidence are pending. Earlier Azure deployment and confirmation-based tests do not validate this new flow.
