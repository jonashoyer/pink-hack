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

The best voice-agent reference is the MIT [Clawd example](https://github.com/davidstalmarck/clawd-bot).
It provides SDK firmware, a streaming microphone extension and a Python voice bridge.
Its laptop bridge and Claude Code integration do not belong in our demo architecture.
The example was source-inspected; its authors do not establish hardware audio acceptance.

The published SDK provides USB serial transport only. Direct WiFi/WSS needs firmware
adaptation; use the verified single Vercel backend at `https://pink-hack.vercel.app`,
existing Turso storage and Azure Live provider. App and device share one fixed
server-owned demo user; no sign-in or account-session token is required. Device
transport retains its private Bearer credential bound to `demo-user`. Provision it
privately through `POST https://pink-hack.vercel.app/api/v1/device/provision {}`;
no cookie or account token is needed. WSS is `wss://pink-hack.vercel.app/api/v1/device/audio`.
Never print the returned device token or put it in a URL. Journal writes are direct user-requested
creates/updates, without staged review/confirmation.

Sources: [Atech SDK reference](https://atech.dev/llms.txt), [SDK on PyPI](https://pypi.org/project/atech/1.0.0a11/).
