#pragma once
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include <ctype.h>

// Retain bounded wire metadata until the next attempt. Nothing is logged here.
struct ClosureRecord {
    bool observed = false, received = false, codePresent = false, truncated = false;
    bool socketErrorCaptured = false;
    uint16_t code = 0;
    int socketError = 0, httpStatus = 0;
    size_t reasonBytes = 0;
    char reason[65] = {};

    void capture(uint16_t value, const uint8_t* bytes, size_t length, bool fromPeer) {
        if (observed) return; // Cleanup's 1000 must not replace the actual cause.
        observed = true; received = fromPeer; code = value; codePresent = value != 0;
        reasonBytes = bytes ? length : 0;
        size_t n = reasonBytes < 64 ? reasonBytes : 64;
        if (n) memcpy(reason, bytes, n);
        reason[n] = 0; truncated = reasonBytes > n;
    }
    void socket(int value, bool captured, int http, const char* localReason) {
        if (!observed) capture(0, reinterpret_cast<const uint8_t*>(localReason), localReason ? strlen(localReason) : 0, false);
        socketError = value; socketErrorCaptured = captured; httpStatus = http;
    }
    void safeReason(char* out, size_t capacity, const char* token = nullptr, const char* password = nullptr) const {
        if (!capacity) return;
        char lowered[65] = {};
        for (size_t i = 0; i < 64 && reason[i]; ++i) lowered[i] = (char)tolower((unsigned char)reason[i]);
        bool redact = truncated || strstr(lowered, "bearer") || strstr(lowered, "token") || strstr(lowered, "password") ||
            strstr(lowered, "authorization") || strchr(reason, '{') || strchr(reason, '[') ||
            (token && *token && strstr(reason, token)) || (password && *password && strstr(reason, password));
        unsigned run = 0;
        for (size_t i = 0; i < 64 && reason[i]; ++i) {
            unsigned char c = reason[i];
            run = isalnum(c) || c == '_' || c == '-' || c == '.' ? run + 1 : 0;
            if (run >= 32) redact = true;
        }
        if (redact) { const char* text = "[redacted]"; size_t n = strlen(text); if (n >= capacity) n = capacity-1; memcpy(out,text,n); out[n]=0; return; }
        size_t i = 0;
        for (; i+1 < capacity && i < 64 && reason[i]; ++i) out[i] = reason[i] >= 32 && reason[i] <= 126 ? reason[i] : '?';
        out[i] = 0;
    }
};
