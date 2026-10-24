#!/usr/bin/env python3
"""Embed checked-in public trust anchors. This reads no private configuration."""
from pathlib import Path

module = Path(__file__).resolve().parents[1] / "modules" / "microphone"
roots = (module / "google-roots.pem").read_text() + "\n" + (module / "isrgrootx1.pem").read_text()
assert roots.count("-----BEGIN CERTIFICATE-----") == roots.count("-----END CERTIFICATE-----")
assert "-----BEGIN CERTIFICATE-----" in roots and ')PEM"' not in roots
(module / "tls_roots.h").write_text(
    '// Public CA trust anchors. Sources and root verification are in SOURCES.md.\n'
    '#pragma once\nstatic const char PINKHACK_CA_ROOTS[] = R"PEM(\n' + roots + ')PEM";\n'
)
print("Generated public TLS trust header; no credentials consumed.")
