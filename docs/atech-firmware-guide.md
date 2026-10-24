---
provenance: "Unvetted Synthetic"
---

# Atech SDK setup

Use the Python SDK instead of editor prompts. Installed version: `atech==1.0.0a11`.
The isolated environment is `/Users/j/.local/share/pink-hack-atech/venv`;
`atech` is available through `/Users/j/.local/bin/atech`.

The developer confirmed the Big Kit's 14-port board and this local test layout:
microphone 1-2, speaker 13-14, button 3, light grid 4. SDK detects USB at
`/dev/cu.usbmodem1101`. The test project is [hardware/atech](../hardware/atech/README.md).

```sh
atech guide
atech describe hardware/atech
atech validate hardware/atech
atech build hardware/atech
atech upload hardware/atech --port /dev/cu.usbmodem1101
atech check --port /dev/cu.usbmodem1101
atech monitor --port /dev/cu.usbmodem1101 --json
```

Only one process may hold the USB port. Stop monitoring before another command.
Upload success does not establish audible speech; use the physical test in the project README.

The official native reference is [Atech voice agent](https://github.com/atechdotdev/atech-voice-agent),
pinned at `611e086feb56d4544948fae32149229a2f8e947f`. Its deferred-send pattern
is adapted; its ElevenLabs protocol and hold gesture are not used. The MIT
[Clawd repository](https://github.com/davidstalmarck/clawd-bot) supplies the
streaming-microphone reference. No laptop bridge is used.

The published SDK provides USB serial transport only. Native WiFi/WSS code is in
[hardware/atech-voice](../hardware/atech-voice/README.md). Build and driver tests
passed. The flashed toggle build boots and authenticates over WiFi/WSS, but
disconnects before backend session readiness. GPT speech and Journal saving
on the physical device remain blocked.
[Current evidence](../hardware/atech-voice/VERIFICATION.md) separates these results.
Use the verified single Vercel backend at `https://pink-hack.vercel.app`,
existing Turso storage and Azure Live provider. App and device share one fixed
server-owned demo user; no sign-in or account-session token is required. Device
transport retains its private Bearer credential bound to `demo-user`. Provision it
privately through `POST https://pink-hack.vercel.app/api/v1/device/provision {}`;
no cookie or account token is needed. WSS is `wss://pink-hack.vercel.app/api/v1/device/audio`.
Never print the returned device token or put it in a URL. Journal writes are direct user-requested
creates/updates, without staged review/confirmation.

Sources: [Atech SDK reference](https://atech.dev/llms.txt), [SDK on PyPI](https://pypi.org/project/atech/1.0.0a11/).

Atech MCP is configured at `https://atech.dev/mcp` and was used for its overview
and tool catalogue. [Hardware verification](../hardware/atech-voice/VERIFICATION.md)
records the current build and the remaining blocker.
