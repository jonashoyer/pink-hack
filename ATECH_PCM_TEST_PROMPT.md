---
provenance: "Unvetted Synthetic"
---

# Atech microphone/speaker PCM test prompt

Paste this into [atech.dev/editor](https://atech.dev/editor) first. It tests the hardware locally without the backend. This file specifies a test; microphone capture and audible playback have not yet been verified on our board.

```text
Build standalone local RAM capture/replay firmware for Atech ESP32-S3.

First ask for the exact board and occupied ports of the owned microphone
(2 ports), speaker (2), button_module (1), and any available neopixel_grid,
display or volume knob. Validate the map; invent no pins. Double-width pairs:
1-2, 2-3, 3-4, 4-5, 5-6, 9-10, 10-11, 13-14. Port 8 is USB-C; 12 is reset.

Use no network, backend, GPT or laptop bridge. USB serial may print numeric
diagnostics, but must not stream or persist raw audio.

Hold the button to capture up to two seconds of 16 kHz mono signed 16-bit
little-endian PCM, at most 32,000 samples/64,000 raw bytes. Release or reaching
the limit stops capture and replays exactly those samples through the speaker
at volume 0.2. Disable the microphone during playback. A press during playback
stops and flushes output, clears the run and returns idle. Require release
and a new press before recording again; a held button must not retrigger.

Use true Atech sample-capture and PCM-playback APIs, not sound levels or beeps.
https://atech.dev/code/clawd.cpp demonstrates mic.getSamples, PCM base64 chunks
of up to 512 samples, speaker.playPCMBase64 and speaker.stop. Adapt the APIs
to our confirmed ports. Verify the capture rate and sample format; report
unsupported 16 kHz capture rather than label another rate as 16 kHz.

Bound raw buffers, encoding scratch space and playback queues. Report allocation
failure, zero samples, unsupported APIs, underruns or clipping. Print configured
rate, sample count, measured capture duration/rate, RMS, peak, clipping and
allocation/playback diagnostics. Show ready, recording, playback,
awaiting audible confirmation, or error through owned LEDs/display and serial.
Clear captured RAM after every completed/interrupted run. Repeated cycles
must not grow memory usage.

Deliver buildable firmware, confirmed module map, upload/test steps and an
evidence table separating generated, compiled, numerical and hardware results.
Test with the spoken phrase: Pink Hack audio test, one two three.
PASS requires the operator to hear the same phrase clearly from the device
speaker, without gaps or feedback, and verify interruption and repeated runs.
Firmware may report playback completed; it must not claim audibility by itself.
Compilation, RMS readings and tones alone do not establish PCM speech support.
```

After a physical pass, use [the demo connection prompt](ATECH_PROMPT.md). Record the actual board/ports, firmware revision, capture format, replay result and any errors so the integration uses the tested hardware facts.
