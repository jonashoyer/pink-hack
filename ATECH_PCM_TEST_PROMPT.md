---
provenance: "Unvetted Synthetic"
---

# Atech PCM test

Paste this into [Atech](https://atech.dev/editor).

```text
Build a standalone microphone-to-speaker PCM test for Atech ESP32-S3.
First confirm the board and microphone, speaker and button ports. Invent no pins.

Hold to record up to two seconds of 16000 Hz mono signed PCM16 little endian,
maximum 32000 samples/64000 bytes in RAM. Release or reaching the limit replays
the SAME samples at speaker volume 0.2. Disable microphone during playback.
Press during playback to stop/flush; require release and a new press to record.

Use real sample capture/playback, not levels or beeps. Reference
https://atech.dev/code/clawd.cpp for mic.getSamples, speaker.playPCMBase64 and
speaker.stop; adapt to our ports. Verify the actual sample rate.

Use bounded buffers, clear captured RAM afterward, and report allocation,
empty capture, clipping and playback errors. Print rate, duration, sample
count, RMS/peak and memory usage over repeated runs. Show status using owned LEDs.

No network, backend or stored/streamed raw audio. Deliver firmware and test steps.
Test phrase: Pink Hack audio test, one two three.
PASS requires a person to hear the same phrase clearly, test interruption,
and repeat without memory growth. Compilation or numeric levels alone cannot pass.
```

Hardware playback is untested. After a physical pass, use [the demo connection prompt](ATECH_PROMPT.md).
