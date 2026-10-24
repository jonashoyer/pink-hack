---
provenance: "Unvetted Synthetic"
---

# WebSockets 2.7.2 local adaptation

Copied the installed `links2004/WebSockets@2.7.2` sources and LGPL-2.1 license.
The SDK references this directory through a project-local PlatformIO symlink.

Only disconnect visibility is changed. A no-op protected hook runs before a
received Close payload is freed and before locally initiated close cleanup.
A second no-op hook runs before the client socket is deleted. The Atech
subclass retains the first cause, bounded reason bytes and ESP32 TLS error code.
It publishes sanitized metadata only when `voice_status` is explicitly requested.
No frame encoding, handshake, provider protocol or debug setting is changed.
