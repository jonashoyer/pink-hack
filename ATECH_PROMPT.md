---
provenance: "Unvetted Synthetic"
---

# Atech backend and GPT-Live demo prompt

Run [the standalone PCM test](ATECH_PCM_TEST_PROMPT.md) first. Then paste the block below into [atech.dev/editor](https://atech.dev/editor). This demo uses one deployed backend and one fixed device connection. The backend thread has accepted the deployment request; its public URL and device contract are pending.

```text
Build Atech firmware connecting our tested microphone/speaker to gpt-live-1
through ONE deployed dev/demo backend.

Ask for the confirmed ESP32-S3 board/port map and standalone PCM test results.
Owned microphone/speaker each take 2 ports; button_module takes 1. Use available
neopixel_grid/status display/volume knob only if confirmed. Invent no pins.
Double-width pairs: 1-2, 2-3, 3-4, 4-5, 5-6, 9-10, 10-11, 13-14.
Port 8 is USB-C; 12 is reset.

Before connection code, obtain the deployed backend's actual fixed HTTPS/WSS
URL and published device contract. These are pending; invent neither routes
nor messages. Required contract facts: private device credential provisioning,
start/resume, audio frames, turn-end, interruption/flush, stop/cancel,
state/save acknowledgments, errors, PCM encoding/chunk limits and reconnect.
If absent, list those missing facts and wait. They are values for this one
deployment, not a request to choose environments or configure a bridge.

Connect directly over 2.4 GHz WiFi to that one authenticated public WSS route.
Put its fixed URL in the firmware. Privately provision a scoped credential
linked to the demo user/device, following the backend contract. Validate TLS
certificates. Do not disable certificate checks or spoof source app.
No bridge configuration, separate laptop service, provider/transport selector
or environment settings UI. Any audio relay/conversion runs inside the same
Better-T-Stack backend service. Azure/OpenAI/database secrets stay backend-side.

The backend uses configured Azure gpt-live-1. Startup/close are verified;
device audio is not. Firmware owns only PCM, button, playback and indicators.
Use the tested PCM format and exact deployed contract. Any rate conversion
belongs backend-side by agreement. Bound buffers and preserve frame/turn order.

States: idle, connecting, listening, thinking, speaking, review, saved, error.
Hold requests start/resume; capture only after ready. Release ends the turn,
not saving or closing the session. Hold during speech interrupts and flushes
old playback, then captures when ready. Spoken/app commands stop or cancel.
Disable microphone while idle, speaking, errored or disconnected. Stop/cancel/
disconnect never commits unconfirmed changes. Reconnect loads backend state
without replaying stale audio/writes. Show Saved only after backend commit
acknowledgment; failed writes show Not saved and retain the draft.

The assistant uses all owned user-created context pages. One Journal stores
flexible properties and BlockNote JSON entry content; day-plan headings/tasks
are inside that content. No fixed questionnaire, personal/medical kinds, or
separate plan database. Voice summarizes proposed creates/updates and asks
explicit confirmation, which can be spoken. Backend alone owns schema/storage,
authentication, ownership, revision checks and idempotent writes. Lovable
displays persisted entries; no mandatory app-only Save step.

Deliver buildable firmware, confirmed hardware map, fixed URL, exact published
device contract and acceptance steps. Verify actual device conversation with
audible GPT speech, voice-confirmed Journal create/update surviving Lovable
refresh, cancel without writes, retry without duplicates, draft recovery and
interruption. Separate generated/compiled results from real hardware evidence.
```

The [backend thread](t3-thread://v1/dac033a2-a1c4-48ee-a7cb-39cb86afe1a7) is deploying the existing service with device audio handled inside it. It must supply the fixed reachable URL, device authentication and exact PCM/message contract. No separate bridge setup is part of this demo.

The remaining hardware input is the actual board/port map and a physical PCM test pass. Product/storage behavior follows [the flexible pages and Journal correction](docs/flexible-pages-journal.md).
