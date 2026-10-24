#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <WebSocketsClient.h>
#include <WiFiManager.h>
#include <atomic>
#include "microphone.h"
#include "speaker.h"

// The pinned library may reconnect inside loop() immediately after detecting
// loss. Hold its internal retry clock; VoiceTransport alone starts attempts.
class OneAttemptWebSocket : public WebSocketsClient {
public:
    void armAttempt() {
        setReconnectInterval(0x7fffffffUL);
        _lastConnectionFail = millis() - 0x7fffffffUL;
    }
};

class VoiceTransport {
public:
    enum class Indicator { Connecting, Listening, Capturing, Thinking, Speaking, Saved, Error, Stopped };
    static VoiceTransport& instance();
    void begin(Microphone& mic, Speaker& speaker);
    void tick(bool held); // Only SDK main calls this; it never runs WiFi/TLS work.
    Indicator indicator() const;
    void report() { _reportRequested = true; }
    void requestStop(bool cancel);
    void requestStart();
    void requestReconnect();
    void requestSetup();
    void requestTokenReset();
private:
    VoiceTransport() = default;
    static void task(void* context);
    void network();
    void websocketEvent(WStype_t type, uint8_t* payload, size_t length);
    void openSocket();
    void closeSocket(bool retry);
    bool sendControl(const char* type);
    void receiveControl(const uint8_t* payload, size_t length);
    bool provision();
    void startPortal();
    void flushLocal();
    void abortTurn(const char* code);
    void emit(const char* key, JsonDocument& value);
    void state(const char* text);
    void error(const char* code);
    void reportFromTask();
    void persistIdentity();
    void retireIdentity();
    void pumpCapture();
    void clearTx();
    void scheduleRetry(bool leaseBusy);
    struct Event { char line[768]; };
    Microphone* _mic = nullptr;
    Speaker* _speaker = nullptr;
    QueueHandle_t _events = nullptr;
    std::atomic<Indicator> _indicator{Indicator::Connecting};
    std::atomic<bool> _held{false}, _ready{false}, _captureActive{false}, _endPending{false};
    std::atomic<bool> _awaitFlush{false}, _needRelease{false}, _enabled{true};
    std::atomic<bool> _interruptRequested{false}, _reconnectRequested{false}, _setupRequested{false}, _resetRequested{false}, _reportRequested{false}, _retireRequested{false};
    std::atomic<int> _stopRequested{0}; // 1=stop, 2=cancel.
    std::atomic<uint32_t> _turnSerial{0}, _discardSerial{0}, _savedUntil{0}, _diagDropped{0};
    std::atomic<uint32_t> _txBytes{0}, _rxBytes{0}, _droppedBytes{0}, _turns{0};
    OneAttemptWebSocket _ws;
    WiFiManager _wifi;
    Preferences _prefs;
    String _token, _authHeader, _session, _operation, _lastEntry;
    bool _attempt = false, _connected = false, _closePending = false, _leaseBusy = false, _invalidToken = false;
    bool _portal = false, _portalExhausted = false, _nvsReady = false, _flushSeen = false;
    uint32_t _portalSince = 0, _wifiSince = 0, _wifiRetryAt = 0, _nextAttempt = 0;
    uint32_t _openedAt = 0, _readyDeadline = 0, _timeSince = 0, _lastReport = 0, _outputSettledAt = 0;
    uint32_t _generation = 0, _attempts = 0, _failures = 0, _lastSpeakerFaults = 0;
    uint32_t _seenTurn = 0, _seenDiscard = 0, _sendAt = 0, _pendingAt = 0;
    bool _pacingStarted = false;
    uint16_t _txSamples = 0;
    int16_t _tx[512] = {};
};
