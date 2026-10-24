---
provenance: "Unvetted Synthetic"
---

# Local PCM hardware test

Atech SDK `1.0.0a11`, board `14port`. Confirmed connections:
microphone **1-2**, speaker **13-14**, button **3**, light grid **4**.

From the repository root:

```sh
atech validate hardware/atech
atech build hardware/atech
atech upload hardware/atech --port /dev/cu.usbmodem1101
atech check --port /dev/cu.usbmodem1101
atech monitor --port /dev/cu.usbmodem1101 --json
```

The first build downloads the ESP32 compiler, about 2.4 GB once.
Stop the monitor before another SDK command uses USB.

Hold the button and say "Pink Hack audio test, one two three." Release to hear
the same recording at 40% volume. Capture stops at two seconds. Press during playback to interrupt.
Repeat several times. Blue is idle, green recording, amber playback, red error.

The monitor reports `pcm_capture` sample count, elapsed time, RMS, peak and clipping.
`pcm_state` reports state and free heap. A playback-completed event is not proof
of audibility: the person must hear clear speech and verify interruption.
No network, transcription, cloud credentials or stored audio is used.

Drivers are copied from the installed MIT Atech SDK. [Local changes](modules/README.md)
bound and erase recordings, synchronize capture/reset, and flush speaker DMA on stop.
Keep source in `project.yaml` and `modules/`; never edit generated `build/`.

Voice example: [Clawd firmware and agent](https://github.com/davidstalmarck/clawd-bot).
Its laptop bridge is a reference, not our deployment path.

Verified on 2026-10-24: SDK build/upload and boot check passed. Four physical
button-triggered captures produced 17,408-31,744 PCM samples with zero clipped
samples; the developer confirmed audible replay. Volume was then doubled from
20% to 40% and flashed persistently. Physical interruption and long-run heap
stability remain unmeasured. This is local PCM evidence, not GPT-Live/WSS voice.
