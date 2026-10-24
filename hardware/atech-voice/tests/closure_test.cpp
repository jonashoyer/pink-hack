#include "closure_record.h"
#include <cassert>
#include <cstdio>
#include <string>

int main() {
    ClosureRecord peer;
    const char* reason = "Invalid WebSocket frame: MASK must be set";
    peer.capture(1002, (const uint8_t*)reason, strlen(reason), true);
    peer.capture(1000, nullptr, 0, false); // Library cleanup must not mask peer cause.
    peer.socket(0, true, 101, nullptr);
    char output[65]; peer.safeReason(output, sizeof(output));
    assert(peer.received && peer.codePresent && peer.code == 1002);
    assert(!strcmp(output, reason) && peer.socketErrorCaptured);

    ClosureRecord empty;
    empty.capture(0, nullptr, 0, true);
    assert(empty.observed && empty.received && !empty.codePresent);
    ClosureRecord local;
    local.capture(1002, nullptr, 0, false);
    local.capture(1000, nullptr, 0, false);
    assert(!local.received && local.code == 1002);
    ClosureRecord transport;
    transport.socket(-76, true, 0, "Connection lost");
    assert(!transport.received && !transport.codePresent && transport.socketError == -76);
    puts("PASS received/local provenance, actual close code, cleanup preservation, socket error");

    for (const char* text : {"Authorization: Bearer test-secret", "{body}", "abcdefghijklmnopqrstuvwxyz0123456789abcdef"}) {
        ClosureRecord record; record.capture(1008, (const uint8_t*)text, strlen(text), true);
        record.safeReason(output, sizeof(output)); assert(!strcmp(output, "[redacted]"));
    }
    ClosureRecord privateValue;
    const char* text = "failed: demo-secret";
    privateValue.capture(1008, (const uint8_t*)text, strlen(text), true);
    privateValue.safeReason(output, sizeof(output), "demo-secret");
    assert(!strcmp(output, "[redacted]"));
    std::string longReason(200, 'x');
    ClosureRecord longRecord; longRecord.capture(1008, (const uint8_t*)longReason.data(), longReason.size(), true);
    assert(longRecord.reasonBytes == 200 && longRecord.truncated && strlen(longRecord.reason) == 64);
    longRecord.safeReason(output, sizeof(output)); assert(!strcmp(output, "[redacted]"));
    char tiny[4]; longRecord.safeReason(tiny, sizeof(tiny)); assert(tiny[3] == 0);
    puts("PASS bounded reasons, body/credential/high-entropy redaction, small output buffer");
}
