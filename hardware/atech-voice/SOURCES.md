---
provenance: "Unvetted Synthetic"
---

# Source and dependencies

The official [Atech Clawd voice example](https://atech.dev/code/clawd.cpp) was
source-inspected on 2026-10-24. Its compatible reference behavior is module
initialization through the speaker/microphone APIs, mono signed PCM16 at
16 kHz in 512-sample blocks, volume clamping, speaker stop, and button-edge
dispatch. The microphone/speaker drivers below come from the MIT SDK and
Clawd repository; the published desk-buddy's displays, sensors and chirps are
not part of this device. Its press edge is adapted to the requested debounced
recording toggle. Its `AtechSerial` object named `wifi` is USB serial, not a
native WiFi implementation. That transport, laptop bridge and providers were
not copied. Native WSS still uses the pinned library listed below.

The official native [atech-voice-agent](https://github.com/atechdotdev/atech-voice-agent)
repository was inspected at `611e086feb56d4544948fae32149229a2f8e947f`.
Its `voice_assistant.cpp` queues session controls and sends them in `update()`
after WiFi maintenance. This project independently adapts that deferral pattern
while retaining its own protocol, toggle and synchronous flush barrier. The
repository's licence is undeclared; no whole-source copying permission is
asserted. Its ElevenLabs integration, early PCM, continuous silence, hold gesture
and 15-second hangup are not adopted. Its recursive WS mutex is unnecessary
here because one network task owns every WS operation. Hardware testing showed
that deferral alone did not resolve our connection close.

The custom microphone uses the installed Atech SDK's ICS-43434 I2S wiring and PCM conversion, matching the locally heard record/replay project. Its consuming stream API and bounded ring design are adapted from [davidstalmarck/clawd-bot](https://github.com/davidstalmarck/clawd-bot/tree/5d842a8f2231607783e9625404d1b35b97b4330a/firmware/modules/microphone), pinned commit `5d842a8f2231607783e9625404d1b35b97b4330a`. [The upstream MIT license](modules/microphone/LICENSE.upstream) is included. This adaptation adds cross-core locking, PTT boundary epochs, DMA warmup, a release freeze that preserves unread samples, buffer erasure, and explicit overruns. It removes recording and raw-audio Serial APIs.

The speaker preserves the SDK's MAX98357A port-pin mapping and stereo I2S framing. This project's implementation replaces blocking PCM writes and the tone task with a bounded PCM queue, one writer, small I2S writes, failure detection, a generation barrier, and stop/zero/start of DMA under the writer mutex. The known-safe project at `hardware/atech/` was only read.

Project-scoped dependencies are declared only in `modules/microphone/module.yaml`:

- `links2004/WebSockets@2.7.2`, LGPL-2.1, pinned locally through `WebSockets=symlink://../vendor/WebSockets`. [Local hooks](vendor/PATCHES.md) preserve close metadata without changing the encoder or handshake. `OneAttemptWebSocket` uses its protected retry timestamp to prevent an internal reconnect bypassing our backoff. Retest this wrapper before changing that version.
- `bblanchon/ArduinoJson@6.21.5`, MIT.
- `tzapu/WiFiManager@2.0.17`, MIT. `setConfigPortalBlocking(false)` and `process()` run on the network task. Debug output is disabled before using WiFi settings. Its credential-saving path uses persistent WiFi configuration.
- The bundled SDK neopixel manifest resolves `Adafruit NeoPixel@1.15.5` in this build. This is SDK-owned, without a shared dependency-file change.

Public CA files were downloaded on 2026-10-24 from [Google's published root bundle](https://pki.goog/roots.pem) and [ISRG Root X1](https://letsencrypt.org/certs/isrgrootx1.pem). `tls_roots.h` embeds exactly those checked-in public files. Google GTS Root R1 is present as a self-signed anchor, alongside the other published Google bundle roots. Root reported independent `openssl s_client -verify_return_error` verification of `pink-hack.vercel.app` with this `google-roots.pem`, returning code 0. The observed chain was `*.vercel.app → GTS WR1 → GTS Root R1`, with a GlobalSign cross-sign. That host verification is separate from ESP32 TLS runtime verification.

The firmware always supplies its CA bundle to HTTPS and WSS, uses the fixed host for SNI/hostname verification, waits for an NTP-synchronized plausible clock, and follows no provisioning redirects. There is no insecure TLS branch. Regenerate the public header with `python3 hardware/atech-voice/scripts/generate-tls-header.py` after an intentional root-bundle update, then rebuild through the SDK. No private file is needed.
