---
provenance: "Unvetted Synthetic"
---

# Atech firmware guide

Firmware-authoring companion to [the PRD](../PRD.md). Checked against Atech's public docs on 2026-10-24. Board, modules, ports, and speech streaming remain unverified on our hardware.

## Working in atech.dev

1. Open [atech.dev/editor](https://atech.dev/editor) in desktop Chrome, Edge, or another Chromium browser. Upload requires Web Serial and a USB-C data cable.
2. Paste the prompt below. Confirm the board, owned modules, and occupied ports before generation. Match the editor's module diagram to the physical board. Moving a module requires updating the diagram and uploading again.
3. Connect USB-C. In the connection pill, choose WiFi and enter the 2.4 GHz network credentials, or choose USB and click **Connect device via USB**. Transport selection changes the firmware.
4. Review the generated module map, firmware, and JSON contract, then click **Upload Code**. Check **Receiving frames** in the connection pill. Find the project ID in **Docs → Your project** for the bridge.
5. Test microphone speech and speaker playback through the bridge. Sound-level events and beeps alone do not meet the voice requirement. If upload fails, close other tabs or serial monitors using the port, check the cable, and reconnect or reset.

## Components

These are requested components, not a confirmed inventory. Double-width modules use adjacent ports on the same side. Port 8 is USB-C; port 12 is reset.

| Component | Atech module ID | Ports | Role |
| --- | --- | --- | --- |
| ESP32-S3 motherboard | Confirm board in editor | 12 module ports | Runs firmware and connects to bridge |
| Microphone | `microphone` | 2 | Required speech input, needs PCM extension |
| Speaker | `speaker` | 2 | Required spoken output, needs PCM playback |
| Button | `button_module` | 1 | Required push-to-talk and interruption |
| Light Grid | `neopixel_grid` | 1 | Requested visible connection/conversation status |
| Color Display | `st7735_tft` | 2 | Optional status text and short prompts |
| Knob | `rotary_encoder_knob` | 2 | Optional volume, or an explicit energy rating with a defined mode |
| Temperature & Humidity | `aht20_sensor` | 1 | Optional room readings, not body temperature or clinical evidence |

## Integration and interactions

Firmware sends microphone audio and button events to a persistent laptop/service bridge. The bridge connects to GPT-Live and our authenticated Better-T-Stack API. The backend owns personal/medical context, consent, draft revisions, confirmation, and journal storage. Lovable reads the saved records. The proposed bridge is not yet implemented or verified.

The proposed control is hold-to-talk. Release ends a spoken turn; it does not save or close the check-in. Holding during playback interrupts the assistant. Spoken or app commands stop, cancel, correct, or confirm. Only a successful backend commit permits the device to indicate **Saved**. Stop/disconnect retains a draft; cancel never commits it.

Atech's standard catalogue documents microphone levels and speaker tones. Its [Clawd example](https://atech.dev/code/clawd.cpp) adds PCM capture/playback. That extension needs adaptation and hardware testing. Continuous 16 kHz mono signed 16-bit audio is 32 KB/s before encoding; standard 115200-baud JSON serial is insufficient. Verify WiFi throughput or a faster transport before claiming live speech works. A gateway project ID identifies a route; it does not establish authenticated access to our app.

## Paste-ready firmware prompt

Paste this whole block into Atech. It includes the relevant PRD requirements so the editor does not need our repository.

```text
Write Atech firmware for a cancer-after-treatment voice companion. First ask
which ESP32-S3 board we have, which modules we own, their occupied ports, and
the bridge transport. Wait for answers. Use confirmed hardware and Atech APIs;
never invent pins or ports. This target is Atech ESP32-S3, not Arduino Uno Q.

Users report energy, mood, symptoms and today's priority. gpt-live-1 asks one
question at a time, prepares a journal/day-plan draft, reads a summary, and
accepts correction/save/cancel. Saving requires explicit user confirmation.

Required: microphone (2 ports), speaker (2), button_module (1), neopixel_grid
(1). Optional: st7735_tft (2) for status text; rotary_encoder_knob (2) for
volume or explicit self-reported energy 1-5 with a defined mode; aht20_sensor
(1) for room temperature/humidity only. Allowed double-width pairs:
1-2, 2-3, 3-4, 4-5, 5-6, 9-10, 10-11, 13-14. Port 8 is USB-C; 12 is reset.

Firmware captures audio/button events, plays speech and displays bridge state.
A persistent laptop/service bridge owns the Atech link, adapts audio to the
documented GPT-Live transport, and calls our authenticated Better-T-Stack API.
The backend owns context pages, medical-context permission, credentials,
workflow, confirmation, revision checks and journal storage. Lovable displays
persisted entries. Keep OpenAI/database keys off firmware. Atech project ID is
routing, not app authentication. Saved requires a successful backend commit
relayed by the bridge, never model speech or a timeout.

Hold button to talk; first hold requests start/resume, with capture only after
the bridge is ready. Release ends the turn. Hold during playback stops and
flushes speech, tells the bridge to interrupt, then records. Stop/cancel uses
spoken intent or app controls, not a conflicting long-hold gesture. Stop or
disconnect retains the backend draft; cancel never saves. Disable microphone
when idle, speaking, disconnected or in error. Bound buffers; reconnect must
not automatically replay audio or save requests.

States: idle, connecting, listening, thinking, speaking, review, saved, error.
Use distinct Light Grid patterns and optional display text. On save failure
show Not saved; a transport failure shows disconnected/error.

Speech needs PCM, not sound_level events or tones. Reference
https://atech.dev/code/clawd.cpp: listen 0|1, base64 pcm events in up to 512
samples, play_pcm at 16 kHz mono signed16, and stop. Verify microphone rate.
Define exact format, ordering, bounded chunk sizes, overflow/underflow and
stop-flush behavior. Standard 115200-baud JSON USB cannot carry continuous
base64 PCM at this rate; require tested WiFi or a verified faster path.
Unsupported speech is a blocker, not a browser-microphone substitute.

WiFi bridge: wss://gateway.atech.dev/ws/live/<project id>
Receive: {"type":"device_event","payload":{...}}
Send: {"type":"send_to_device","device_id":"<project id>",
       "payload":{"action":"...","value":...}}
Publish the exact event schema, resolving type/event_type differences.
Clearly label new PCM/state messages as custom firmware extensions.

Deliver module map, buildable firmware, JSON events/actions, bridge handoff
contract and test checklist. Verify real microphone speech, audible speaker,
interruption, indicators, capture off on disconnect, stop/cancel without save,
and backend-confirmed saving visible after Lovable refresh.
```

Sources: [Atech setup and protocol](https://atech.dev/docs), [module reference](https://atech.dev/llms.txt), [PCM example](https://atech.dev/code/clawd.cpp). Shared application operations are in [app structure](app-structure.md).
