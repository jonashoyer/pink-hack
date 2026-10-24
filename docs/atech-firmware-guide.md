---
provenance: "Unvetted Synthetic"
---

# Atech firmware guide

Companion to [the PRD](../PRD.md), checked against public docs on 2026-10-24. Our board, modules, ports, and speech streaming remain unverified.

## Working in atech.dev

1. Open [atech.dev/editor](https://atech.dev/editor) in desktop Chromium with a USB-C data cable.
2. Start with the [standalone PCM test prompt](../ATECH_PCM_TEST_PROMPT.md). Confirm hardware and ports; match the generated diagram to the board. Moving modules requires updating the diagram and uploading again.
3. Upload the local test over USB-C. After its physical pass, wait for the verified Vercel connection contract before uploading network firmware. The Azure VM endpoint is retired.
4. Review firmware and its JSON contract; click **Upload Code**. Check **Receiving frames**. Copy the bridge's project ID from **Docs → Your project**.
5. Verify local recorded speech playback, then real GPT-Live speech through the deployed backend. For upload failures, close competing serial connections, check the cable, and reconnect/reset.

## Components

Requested inventory, subject to confirmation. Double-width modules need adjacent ports on one side; 8 is USB-C and 12 is reset.

| Component | Atech module ID | Ports | Role |
| --- | --- | --- | --- |
| ESP32-S3 motherboard | Confirm board in editor | 12 module ports | Runs firmware and connects to bridge |
| Microphone | `microphone` | 2 | Required speech input, needs PCM extension |
| Speaker | `speaker` | 2 | Required spoken output, needs PCM playback |
| Button | `button_module` | 1 | Required push-to-talk and interruption |
| Light Grid | `neopixel_grid` | 1 | Requested visible connection/conversation status |
| Color Display | `st7735_tft` | 2 | Optional status text and short prompts |
| Knob | `rotary_encoder_knob` | 2 | Optional speaker volume |
| Temperature & Humidity | `aht20_sensor` | 1 | Optional room readings, not body temperature or clinical evidence |

## Integration and interactions

Firmware handles audio, button events and status. The target is the existing Vercel project with Turso storage. The device transport and direct-write session contract are pending verification. There is no separate laptop bridge or bridge configuration. Hold-to-talk, interruption and recovery are specified in the root integration prompt.

Standard modules expose sound levels and tones. The [Clawd example](https://atech.dev/code/clawd.cpp) adds speech PCM, which needs adaptation/testing. At 16 kHz mono signed16, raw audio is 32 KB/s; 115200-baud JSON serial is insufficient. Verify WiFi or a faster path. A gateway project ID supplies routing, not app authentication.

## Paste-ready firmware prompt

Use [ATECH_PCM_TEST_PROMPT.md](../ATECH_PCM_TEST_PROMPT.md) now for local capture/replay. Use [ATECH_PROMPT.md](../ATECH_PROMPT.md) only after the Vercel contract is verified. The agent writes directly on user requests to one flexible Journal with BlockNote content. Day plans stay inside entries; there is no required proposal/confirmation stage. Schema, storage and deployment remain with the backend owner.

Sources: [Atech setup and protocol](https://atech.dev/docs), [module reference](https://atech.dev/llms.txt), [PCM example](https://atech.dev/code/clawd.cpp). Shared application operations are in [app structure](app-structure.md).
