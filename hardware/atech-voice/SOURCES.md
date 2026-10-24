---
provenance: "Unvetted Synthetic"
---

# Source and dependencies

The custom microphone uses the installed Atech SDK's ICS-43434 I2S wiring and PCM conversion, matching the locally heard record/replay project. Its consuming stream API and bounded ring design are adapted from [davidstalmarck/clawd-bot](https://github.com/davidstalmarck/clawd-bot/tree/5d842a8f2231607783e9625404d1b35b97b4330a/firmware/modules/microphone), pinned commit `5d842a8f2231607783e9625404d1b35b97b4330a`. [The upstream MIT license](modules/microphone/LICENSE.upstream) is included. This adaptation adds cross-core locking, PTT boundary epochs, DMA warmup, a release freeze that preserves unread samples, buffer erasure, and explicit overruns. It removes recording and raw-audio Serial APIs.

The speaker preserves the SDK's MAX98357A port-pin mapping and stereo I2S framing. This project's implementation replaces blocking PCM writes and the tone task with a bounded PCM queue, one writer, small I2S writes, failure detection, a generation barrier, and stop/zero/start of DMA under the writer mutex. The known-safe project at `hardware/atech/` was only read.

Project-scoped dependencies are declared only in `modules/microphone/module.yaml`:

- `links2004/WebSockets@2.7.2`, LGPL-2.1. The installed source passes `HTTP <status>` in handshake-disconnect reasons. `OneAttemptWebSocket` uses its protected retry timestamp to prevent an internal reconnect bypassing our backoff. Retest this wrapper before changing that version.
- `bblanchon/ArduinoJson@6.21.5`, MIT.
- `tzapu/WiFiManager@2.0.17`, MIT. `setConfigPortalBlocking(false)` and `process()` run on the network task. Debug output is disabled before using WiFi settings. Its credential-saving path uses persistent WiFi configuration.
- The bundled SDK neopixel manifest resolves `Adafruit NeoPixel@1.15.5` in this build. This is SDK-owned, without a shared dependency-file change.

Public CA files were downloaded on 2026-10-24 from [Google's published root bundle](https://pki.goog/roots.pem) and [ISRG Root X1](https://letsencrypt.org/certs/isrgrootx1.pem). `tls_roots.h` embeds exactly those checked-in public files. Google GTS Root R1 is present as a self-signed anchor, alongside the other published Google bundle roots. Root reported independent `openssl s_client -verify_return_error` verification of `pink-hack.vercel.app` with this `google-roots.pem`, returning code 0. The observed chain was `*.vercel.app → GTS WR1 → GTS Root R1`, with a GlobalSign cross-sign. That host verification is separate from ESP32 TLS runtime verification.

The firmware always supplies its CA bundle to HTTPS and WSS, uses the fixed host for SNI/hostname verification, waits for an NTP-synchronized plausible clock, and follows no provisioning redirects. There is no insecure TLS branch. Regenerate the public header with `python3 hardware/atech-voice/scripts/generate-tls-header.py` after an intentional root-bundle update, then rebuild through the SDK. No private file is needed.
