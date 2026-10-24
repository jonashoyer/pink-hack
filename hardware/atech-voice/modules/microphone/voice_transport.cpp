#include "voice_transport.h"
#include "tls_roots.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <esp_system.h>
#include <time.h>

namespace {
constexpr const char* HOST = "pink-hack.vercel.app";
constexpr const char* AUDIO_PATH = "/api/v1/device/audio";
constexpr const char* PROVISION_URL = "https://pink-hack.vercel.app/api/v1/device/provision";
constexpr uint32_t STALE_INPUT_MS = 450;
constexpr uint32_t READY_TIMEOUT_MS = 45000;
struct PersistentIdentity {
    uint32_t version = 1;
    char operation[37] = {};
    char session[129] = {};
};
bool contains(const uint8_t* p, size_t n, const char* value) {
    size_t length = strlen(value);
    if (!p || n < length) return false;
    for (size_t i = 0; i <= n-length; ++i) if (!memcmp(p+i, value, length)) return true;
    return false;
}
bool safeId(const char* s) {
    if (!s || !*s || strlen(s) > 128) return false;
    for (; *s; ++s) if (!isalnum((unsigned char)*s) && *s != '-' && *s != '_') return false;
    return true;
}
bool validToken(const char* s) { return s && strlen(s) == 43 && safeId(s); }
String uuid() {
    uint8_t b[16]; esp_fill_random(b, sizeof(b)); b[6] = (b[6]&15)|64; b[8] = (b[8]&63)|128;
    char s[37]; snprintf(s, sizeof(s), "%02x%02x%02x%02x-%02x%02x-%02x%02x-%02x%02x-%02x%02x%02x%02x%02x%02x",
        b[0],b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8],b[9],b[10],b[11],b[12],b[13],b[14],b[15]);
    return String(s);
}
bool clockReady() { time_t now = time(nullptr); return now >= 1767225600 && now < 4102444800LL; }
// HTTPClient decodes chunked transfers into this fixed-capacity sink. A large
// response fails its write instead of allocating an unbounded String.
class ProvisionBody : public Stream {
public:
    char bytes[4097] = {};
    size_t length = 0;
    bool overflow = false;
    size_t write(uint8_t b) override { return write(&b, 1); }
    size_t write(const uint8_t* source, size_t n) override {
        size_t copied = min(n, (size_t)4096-length);
        memcpy(bytes+length, source, copied); length += copied;
        if (copied != n) overflow = true;
        return copied;
    }
    int available() override { return 0; }
    int read() override { return -1; }
    int peek() override { return -1; }
};
}

VoiceTransport& VoiceTransport::instance() { static VoiceTransport transport; return transport; }
void VoiceTransport::begin(Microphone& mic, Speaker& speaker) {
    _mic = &mic; _speaker = &speaker;
    _events = xQueueCreate(16, sizeof(Event));
    if (!_events || !mic.initialized() || !speaker.initialized()) {
        _enabled = false; _indicator = Indicator::Error;
        if (_events) error("audio_initialization_failed");
        return;
    }
    if (xTaskCreatePinnedToCore(task, "VoiceNetwork", 12288, this, 1, nullptr, 1) != pdPASS) {
        _enabled = false; _indicator = Indicator::Error; error("network_task_failed");
    }
}
VoiceTransport::Indicator VoiceTransport::indicator() const {
    if ((int32_t)(_savedUntil.load()-millis()) > 0) return Indicator::Saved;
    if (_speaker && _speaker->isPlaying()) return Indicator::Speaking;
    if (_captureActive.load()) return Indicator::Capturing;
    return _indicator.load();
}
void VoiceTransport::tick(bool held) {
    bool before = _held.exchange(held);
    if (!held) {
        _needRelease = false;
        if (_captureActive.exchange(false)) {
            _mic->endStream(); _endPending = true; _ready = false;
            state("capture_draining");
        }
    }
    if (held && !before && _speaker && _speaker->isPlaying()) {
        // Local silence does not wait for the network task or a provider event.
        _ready = false; _awaitFlush = true; _interruptRequested = true;
        flushLocal(); state("interrupt_pending");
    }
    if (held && _enabled && _ready && !_awaitFlush && !_needRelease && !_endPending && !_captureActive && !_speaker->isPlaying()) {
        if (_mic->startStream()) {
            ++_turnSerial; _captureActive = true; state("capturing");
        } else { error("capture_start_failed"); _needRelease = true; }
    }
    Event event;
    // SDK owns Serial reads and built-in button events. All network logs drain here.
    for (int i=0; _events && i<3 && xQueueReceive(_events, &event, 0) == pdTRUE; ++i) Serial.println(event.line);
}
void VoiceTransport::flushLocal() {
    _ready = false; _captureActive = false; _endPending = false; ++_discardSerial;
    if (_mic) _droppedBytes.fetch_add(_mic->pendingSamples()*2);
    if (_speaker) _droppedBytes.fetch_add(_speaker->queuedBytes());
    if (_mic) _mic->stopStream();
    if (_speaker) _speaker->stop();
}
void VoiceTransport::requestStop(bool cancel) {
    _enabled = false; _needRelease = true; _stopRequested = cancel ? 2 : 1;
    _retireRequested = true;
    flushLocal(); _indicator = Indicator::Stopped;
}
void VoiceTransport::requestStart() { _needRelease = true; _enabled = true; _reconnectRequested = true; }
void VoiceTransport::requestReconnect() { _needRelease = true; flushLocal(); _reconnectRequested = true; }
void VoiceTransport::requestSetup() { _needRelease = true; flushLocal(); _setupRequested = true; }
void VoiceTransport::requestTokenReset() {
    _needRelease = true; flushLocal(); _resetRequested = true;
}
void VoiceTransport::emit(const char* key, JsonDocument& value) {
    if (!_events) return;
    StaticJsonDocument<1024> envelope;
    envelope["type"] = "event";
    auto payload = envelope.createNestedObject("payload");
    payload["event_type"] = "state"; payload["key"] = key; payload["value"].set(value.as<JsonVariantConst>());
    Event e = {};
    if (envelope.overflowed() || measureJson(envelope) >= sizeof(e.line)) { ++_diagDropped; return; }
    serializeJson(envelope, e.line, sizeof(e.line));
    if (xQueueSend(_events, &e, 0) != pdTRUE) ++_diagDropped;
}
void VoiceTransport::state(const char* text) {
    StaticJsonDocument<192> d; d["state"] = text; d["uptime_ms"] = millis(); emit("voice_state", d);
}
void VoiceTransport::error(const char* code) {
    _indicator = Indicator::Error;
    StaticJsonDocument<192> d; d["code"] = code; emit("voice_error", d);
}
void VoiceTransport::reportFromTask() {
    StaticJsonDocument<768> d;
    d["connected"] = _connected; d["ready"] = _ready.load(); d["held"] = _held.load();
    d["capturing"] = _captureActive.load(); d["draining"] = _endPending.load();
    d["await_flush"] = _awaitFlush.load(); d["physical_output"] = _speaker->isPlaying();
    d["wifi_connected"] = WiFi.status() == WL_CONNECTED; d["setup_ap"] = _portal;
    d["tx_bytes"] = _txBytes.load(); d["rx_bytes"] = _rxBytes.load(); d["dropped_bytes"] = _droppedBytes.load();
    d["tx_queue_bytes"] = _mic->pendingSamples()*2 + _txSamples*2;
    d["rx_queue_bytes"] = _speaker->queuedBytes(); d["i2s_written_bytes"] = _speaker->playedBytes();
    d["mic_overruns"] = _mic->streamOverruns(); d["speaker_faults"] = _speaker->faults();
    d["flush_count"] = _speaker->flushCount(); d["generation"] = _generation; d["turns"] = _turns.load();
    d["attempt"] = _attempts; d["retry_ms"] = (int32_t)(_nextAttempt-millis()) > 0 ? _nextAttempt-millis() : 0;
    d["free_heap"] = ESP.getFreeHeap(); d["diag_dropped"] = _diagDropped.load();
    emit("voice_stats", d);
    StaticJsonDocument<512> identity;
    identity["operation_id"] = _operation; identity["voice_session_id"] = _session; identity["last_entry_id"] = _lastEntry;
    emit("voice_identity", identity);
}
void VoiceTransport::persistIdentity() {
    if (!_nvsReady) return;
    PersistentIdentity identity;
    strlcpy(identity.operation, _operation.c_str(), sizeof(identity.operation));
    strlcpy(identity.session, _session.c_str(), sizeof(identity.session));
    // One NVS value keeps creation retry ID and session lifecycle atomic.
    if (_prefs.putBytes("identity", &identity, sizeof(identity)) != sizeof(identity)) {
        _enabled = false; error("identity_persist_failed");
    }
}
void VoiceTransport::retireIdentity() {
    _session = ""; _operation = uuid(); _lastEntry = "";
    persistIdentity(); state("conversation_retired");
}
void VoiceTransport::clearTx() { memset(_tx, 0, sizeof(_tx)); _txSamples = 0; _pendingAt = 0; }
void VoiceTransport::scheduleRetry(bool busy) {
    ++_failures;
    // Leave enough 409 retries for a crashed owner's 30 s lease to expire.
    // Empty/unknown handshake failures are bounded too; root can deliberately
    // restart or reset the stored token after checking service/network state.
    if (_failures >= (busy ? 12U : 6U)) {
        _enabled = false;
        error(busy ? "lease_busy_start_required" : "wss_unavailable_start_or_reset_required");
        return;
    }
    uint32_t delayMs = busy ? 5000 : min((uint32_t)30000, (uint32_t)(1000U << min(_failures-1, (uint32_t)5)));
    _nextAttempt = millis()+delayMs+(esp_random()%251);
    StaticJsonDocument<192> d; d["state"] = busy ? "lease_busy" : "reconnect_wait"; d["retry_ms"] = delayMs; d["attempt"] = _attempts;
    emit("voice_state", d);
}
void VoiceTransport::closeSocket(bool retry) {
    flushLocal(); clearTx();
    _connected = false; _attempt = false; _closePending = false;
    _awaitFlush = false; _flushSeen = false; _readyDeadline = 0;
    _needRelease = true; // Never resume/replay an interrupted held utterance after loss.
    _ws.disconnect();
    // disconnect() may invoke our callback; consume that callback's close flag.
    _closePending = false;
    if (retry && _enabled && !_invalidToken) scheduleRetry(_leaseBusy);
    _leaseBusy = false;
}
bool VoiceTransport::sendControl(const char* type) {
    StaticJsonDocument<512> d; d["type"] = type;
    if (!strcmp(type, "start")) {
        d["operation_id"] = _operation;
        if (_session.length()) d["voice_session_id"] = _session;
        // Resume never carries entry_id. The device relays audio, not write tools.
    }
    char buffer[512]; size_t n = serializeJson(d, buffer, sizeof(buffer));
    if (!_connected || d.overflowed() || n >= sizeof(buffer) || !_ws.sendTXT(buffer, n)) {
        error("control_send_failed"); _closePending = true; return false;
    }
    return true;
}
void VoiceTransport::openSocket() {
    _attempt = true; _connected = false; _closePending = false; ++_attempts;
    _openedAt = millis(); _readyDeadline = _openedAt+READY_TIMEOUT_MS;
    _indicator = Indicator::Connecting; _ready = false; _generation = 0;
    _authHeader = "Authorization: Bearer " + _token + "\r\n";
    _ws.beginSslWithCA(HOST, 443, AUDIO_PATH, PINKHACK_CA_ROOTS, "");
    _ws.setExtraHeaders(_authHeader.c_str());
    // One library attempt at a time. On disconnect we stop calling loop and
    // schedule our own capped backoff, including HTTP 409 lease conflicts.
    _ws.armAttempt();
    _ws.enableHeartbeat(10000, 5000, 2);
    state("wss_connecting");
}
void VoiceTransport::websocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    if (type == WStype_CONNECTED) {
        _connected = true; state("wss_connected"); sendControl("start"); return;
    }
    if (type == WStype_DISCONNECTED) {
        _connected = false; _ready = false; flushLocal(); clearTx(); _closePending = true;
        if (contains(payload, length, "401") || contains(payload, length, "403")) {
            _invalidToken = true; _enabled = false; error("device_token_invalid_reset_required");
        } else if (contains(payload, length, "409")) _leaseBusy = true;
        else state("wss_closed");
        return;
    }
    if (type == WStype_TEXT) { receiveControl(payload, length); return; }
    if (type == WStype_BIN) {
        if (!_connected || !_enabled || _awaitFlush || _interruptRequested || _stopRequested || _closePending) {
            _droppedBytes.fetch_add(length); return;
        }
        if (!_speaker->enqueuePCM(payload, length)) { _droppedBytes.fetch_add(length); abortTurn("output_queue_or_format_error"); return; }
        // Provider output during a held capture is interrupted before further PCM.
        if (_captureActive) { _interruptRequested = true; _awaitFlush = true; flushLocal(); return; }
        _rxBytes.fetch_add(length); _ready = false; _outputSettledAt = millis();
        _indicator = Indicator::Speaking;
        return;
    }
    if (type == WStype_FRAGMENT_BIN_START || type == WStype_FRAGMENT_TEXT_START || type == WStype_FRAGMENT || type == WStype_FRAGMENT_FIN || type == WStype_ERROR) {
        abortTurn("unsupported_websocket_frame");
    }
}
void VoiceTransport::receiveControl(const uint8_t* payload, size_t length) {
    if (!payload || !length || length > 4096) { abortTurn("invalid_control_size"); return; }
    StaticJsonDocument<1024> d;
    if (deserializeJson(d, payload, length) || d.overflowed()) { abortTurn("invalid_control_json"); return; }
    const char* type = d["type"] | "";
    if (!strcmp(type, "flush")) {
        if (!d["generation"].is<uint32_t>() || d["generation"].as<uint32_t>() <= _generation) { abortTurn("invalid_flush_generation"); return; }
        // Synchronous barrier completes before WebSockets dispatches the next frame.
        flushLocal(); clearTx(); _generation = d["generation"]; _flushSeen = true;
        state("flush_applied"); return;
    }
    if (!strcmp(type, "state")) {
        const char* serverState = d["state"] | "";
        const char* session = d["voice_session_id"] | "";
        const char* entry = d["last_entry_id"] | "";
        if (*session) {
            if (!safeId(session) || (_session.length() && _session != session)) { abortTurn("session_identity_mismatch"); return; }
            if (_session != session) { _session = session; persistIdentity(); }
        }
        if (*entry && safeId(entry)) _lastEntry = entry;
        if (!strcmp(serverState, "listening")) {
            if (!_session.length()) { abortTurn("missing_session_identity"); return; }
            if (_awaitFlush && !_flushSeen) return;
            _awaitFlush = false; _flushSeen = false; _readyDeadline = 0; _failures = 0;
            _ready = _enabled && !_endPending && !_interruptRequested;
            _indicator = Indicator::Listening; state("listening");
        } else if (!strcmp(serverState, "connecting")) {
            _ready = false; _indicator = Indicator::Connecting; state("connecting");
        } else if (!strcmp(serverState, "thinking")) {
            _ready = false; _indicator = Indicator::Thinking; state("thinking");
        } else if (!strcmp(serverState, "speaking")) {
            _ready = false; _indicator = Indicator::Speaking; state("speaking");
        } else if (!strcmp(serverState, "error")) {
            _ready = false; _indicator = Indicator::Error; flushLocal(); _closePending = true; state("server_error");
        } else if (!strcmp(serverState, "stopped")) {
            _enabled = false; flushLocal(); retireIdentity(); _closePending = true;
            _indicator = Indicator::Stopped; state("stopped");
        } else abortTurn("invalid_server_state");
        return;
    }
    if (!strcmp(type, "saved")) {
        const char* entry = d["entry_id"] | "";
        const char* session = d["voice_session_id"] | "";
        if (!safeId(entry) || _session != session || !d["revision"].is<uint32_t>() || d["revision"].as<uint32_t>() < 1) { abortTurn("invalid_saved_metadata"); return; }
        _lastEntry = entry; _savedUntil = millis()+1000;
        StaticJsonDocument<512> saved;
        saved["entry_id"] = entry; saved["revision"] = d["revision"]; saved["voice_session_id"] = session;
        emit("voice_saved", saved); return;
    }
    if (!strcmp(type, "error")) {
        const char* code = d["code"] | "";
        // Codes only, never arbitrary server text or transcripts.
        error(safeId(code) ? code : "server_error_code_invalid");
        if (!strcmp(code, "conversation_stopped")) {
            _enabled = false; retireIdentity(); state("fresh_start_required");
        }
        _ready = false; flushLocal(); _closePending = true; return;
    }
    abortTurn("unknown_server_control");
}
void VoiceTransport::abortTurn(const char* code) {
    error(code); _needRelease = true; _awaitFlush = true; _interruptRequested = true;
    flushLocal(); clearTx();
}
void VoiceTransport::pumpCapture() {
    if (_seenDiscard != _discardSerial.load()) { _seenDiscard = _discardSerial; clearTx(); }
    if (_seenTurn != _turnSerial.load()) {
        _seenTurn = _turnSerial; clearTx(); _sendAt = millis(); _pacingStarted = false;
    }
    if ((!_captureActive && !_endPending) || !_connected || _awaitFlush) return;
    if (_mic->streamOverruns()) { abortTurn("input_ring_overflow"); return; }
    if (_mic->oldestAgeMs() > STALE_INPUT_MS || (_txSamples && millis()-_pendingAt > STALE_INPUT_MS)) { abortTurn("stale_input_dropped"); return; }
    int n = _mic->readStream(_tx+_txSamples, 512-_txSamples);
    if (n && !_txSamples) _pendingAt = millis();
    _txSamples += n;
    bool finishing = _endPending.load() && !_mic->pendingSamples();
    if (_txSamples && (_txSamples == 512 || finishing) && (!_pacingStarted || (int32_t)(millis()-_sendAt) >= 0)) {
        size_t bytes = _txSamples*2;
        // Anchor to the first retained packet, after RX DMA warmup. Advance
        // this clock by audio duration, not WS/task overhead on each packet.
        if (!_pacingStarted) { _sendAt = millis(); _pacingStarted = true; }
        if ((int32_t)(millis()-_sendAt) > 16) { abortTurn("input_pacing_deadline_missed"); return; }
        // A concurrent local interruption invalidates this packet before send.
        if (_seenDiscard != _discardSerial.load() || _interruptRequested || _stopRequested) { clearTx(); return; }
        // ESP32 is little-endian; no WAV/base64 framing, fixed 16 kHz mono PCM16.
        if (!_ws.sendBIN(reinterpret_cast<uint8_t*>(_tx), bytes)) { abortTurn("audio_send_failed"); _closePending = true; return; }
        _txBytes.fetch_add(bytes);
        uint32_t duration = (bytes*1000+31999)/32000;
        _sendAt += duration;
        clearTx();
        // Never catch up with back-to-back sends after a blocked write. One
        // packet per loop and <=16 ms phase lag leave a gap before the next.
        if ((int32_t)(millis()-_sendAt) > 0) { abortTurn("input_send_deadline_missed"); return; }
    }
    if (_endPending && !_mic->pendingSamples() && !_txSamples && (int32_t)(millis()-_sendAt) >= 0) {
        _endPending = false; _mic->stopStream();
        if (sendControl("audio_turn_end")) { ++_turns; _indicator = Indicator::Thinking; state("audio_turn_end_sent"); }
    }
}
bool VoiceTransport::provision() {
    // Persist uncertainty BEFORE POST. An ambiguous response never causes
    // automatic repeated rotation on reconnect or reboot.
    if (_prefs.getBool("prov_pending", false)) { error("provision_uncertain_reset_required"); _enabled = false; return false; }
    if (!_prefs.putBool("prov_pending", true)) { error("nvs_write_failed"); _enabled = false; return false; }
    state("device_provisioning");
    WiFiClientSecure tls; tls.setCACert(PINKHACK_CA_ROOTS); tls.setHandshakeTimeout(10);
    HTTPClient http; http.setConnectTimeout(10000); http.setTimeout(10000);
    http.setFollowRedirects(HTTPC_DISABLE_FOLLOW_REDIRECTS);
    bool valid = false;
    if (http.begin(tls, PROVISION_URL)) {
        http.addHeader("Content-Type", "application/json");
        int status = http.POST("{}");
        int size = http.getSize();
        if (status == 200 && size != 0 && size <= 4096) {
            ProvisionBody body;
            int read = http.writeToStream(&body);
            StaticJsonDocument<2048> d;
            if (read > 0 && read == (int)body.length && !body.overflow &&
                !deserializeJson(d, body.bytes, body.length) && !d.overflowed()) {
                const char* token = d["token"] | "";
                const char* device = d["device_id"] | "";
                const char* path = d["audio_path"] | "";
                auto audio = d["audio"];
                valid = !strcmp(device, "demo") && !strcmp(path, AUDIO_PATH) && validToken(token) &&
                    d["credential_revision"].is<uint32_t>() && d["credential_revision"].as<uint32_t>() > 0 &&
                    !strcmp(audio["type"] | "", "audio/pcm") && audio["rate"] == 16000 && audio["channels"] == 1 &&
                    !strcmp(audio["sample_format"] | "", "s16le") && audio["max_chunk_bytes"] == 2048 && audio["recommended_chunk_bytes"] == 1024;
                if (valid) {
                    _token = token;
                    valid = _prefs.putString("token", _token) == _token.length();
                    if (valid) valid = _prefs.putBool("prov_pending", false) == 1;
                }
            }
            memset(body.bytes, 0, sizeof(body.bytes)); d.clear();
        }
        http.end();
    }
    if (valid) { state("device_token_stored"); return true; }
    _token = ""; _enabled = false; error("provision_failed_reset_required"); return false;
}
void VoiceTransport::startPortal() {
    closeSocket(false); _portalExhausted = false;
    _wifi.setDebugOutput(false);
    _wifi.setConfigPortalBlocking(false); _wifi.setConfigPortalTimeout(180);
    _wifi.setAPClientCheck(false); _wifi.setConnectTimeout(10); _wifi.setConnectRetries(1);
    _wifi.setShowPassword(false); _wifi.setShowStaticFields(false); _wifi.setShowDnsFields(false);
    _wifi.setShowInfoErase(false); _wifi.setShowInfoUpdate(false);
    std::vector<const char*> menu = {"wifi", "exit"};
    _wifi.setMenu(menu);
    _wifi.startConfigPortal("PinkHack-Setup"); _portal = true; _portalSince = millis();
    StaticJsonDocument<256> d; d["state"] = "wifi_setup"; d["ap"] = "PinkHack-Setup";
    d["portal"] = "http://192.168.4.1"; d["timeout_seconds"] = 180; emit("voice_state", d);
}
void VoiceTransport::task(void* context) { static_cast<VoiceTransport*>(context)->network(); }
void VoiceTransport::network() {
    _nvsReady = _prefs.begin("pink-voice", false);
    if (!_nvsReady) { _enabled = false; error("nvs_open_failed"); }
    if (_nvsReady) {
        _token = _prefs.getString("token", "");
        if (_prefs.isKey("identity")) {
            PersistentIdentity identity;
            bool valid = _prefs.getBytesLength("identity") == sizeof(identity) &&
                _prefs.getBytes("identity", &identity, sizeof(identity)) == sizeof(identity) && identity.version == 1 &&
                identity.operation[36] == 0 && identity.session[128] == 0 && strlen(identity.operation) == 36 &&
                safeId(identity.operation) && (!*identity.session || safeId(identity.session));
            if (valid) { _operation = identity.operation; _session = identity.session; }
            else { _enabled = false; error("invalid_stored_identity"); }
        }
        if (_token.length() && !validToken(_token.c_str())) { _invalidToken = true; _enabled = false; error("device_token_invalid_reset_required"); }
        if (!_operation.length()) { _operation = uuid(); persistIdentity(); }
    }
    _ws.onEvent([this](WStype_t type, uint8_t* payload, size_t length) { websocketEvent(type, payload, length); });
    _wifi.setDebugOutput(false);
    WiFi.persistent(true); WiFi.mode(WIFI_STA); WiFi.setAutoReconnect(true); WiFi.setSleep(false);
    WiFi.begin(); _wifiSince = millis(); _wifiRetryAt = _wifiSince;
    state("wifi_saved_connecting");
    while (true) {
        uint32_t now = millis();
        if (_reportRequested.exchange(false) || now-_lastReport >= 5000) { reportFromTask(); _lastReport = now; }
        int stop = _stopRequested.exchange(0);
        if (stop) {
            if (_connected) sendControl(stop == 2 ? "cancel" : "stop");
            closeSocket(false); _indicator = Indicator::Stopped; state("stopped_local");
        }
        if (_retireRequested.exchange(false)) retireIdentity();
        if (_resetRequested.exchange(false)) {
            if (_connected) sendControl("cancel");
            closeSocket(false);
            if (!_nvsReady || (!_prefs.remove("token") && _prefs.isKey("token"))) { error("token_reset_failed"); _enabled = false; }
            else {
                _prefs.putBool("prov_pending", false); _token = ""; _authHeader = ""; _invalidToken = false;
                _enabled = true; _nextAttempt = now; state("token_reset_requested");
            }
        }
        if (_setupRequested.exchange(false)) startPortal();
        if (_reconnectRequested.exchange(false)) { closeSocket(false); _failures = 0; _nextAttempt = now; }
        if (_portal) {
            _wifi.process();
            if (WiFi.status() == WL_CONNECTED || millis()-_portalSince >= 180000) {
                _wifi.stopConfigPortal(); _portal = false; _portalExhausted = true;
                if (WiFi.status() == WL_CONNECTED) { WiFi.mode(WIFI_STA); state("wifi_connected"); }
                else error("wifi_setup_timeout");
            }
        }
        if (WiFi.status() != WL_CONNECTED) {
            if (_attempt) closeSocket(true);
            if (!_portal && !_portalExhausted && now-_wifiSince >= 20000) startPortal();
            if (!_portal && now-_wifiRetryAt >= 10000) { WiFi.reconnect(); _wifiRetryAt = now; }
            _timeSince = 0;
            vTaskDelay(pdMS_TO_TICKS(5)); continue;
        }
        _wifiSince = now;
        if (!clockReady()) {
            if (!_timeSince) { configTime(0, 0, "time.google.com", "pool.ntp.org"); _timeSince = now; state("time_sync"); }
            if (now-_timeSince > 30000) { error("time_sync_failed"); _timeSince = now; }
            vTaskDelay(pdMS_TO_TICKS(10)); continue;
        }
        if (!_enabled || _invalidToken || !_nvsReady) { vTaskDelay(pdMS_TO_TICKS(10)); continue; }
        if (!_token.length() && !provision()) continue;
        if (!_attempt && (int32_t)(now-_nextAttempt) >= 0) openSocket();
        if (_attempt) _ws.loop(); // All blocking TLS/socket calls belong to this task.
        if (_closePending) { closeSocket(true); vTaskDelay(pdMS_TO_TICKS(5)); continue; }
        if (_interruptRequested.exchange(false)) {
            _awaitFlush = true; _flushSeen = false; clearTx();
            _readyDeadline = millis()+READY_TIMEOUT_MS;
            if (_connected) { sendControl("interrupt"); state("interrupt_sent"); }
            else closeSocket(true);
        }
        if (_speaker->faults() != _lastSpeakerFaults) {
            _lastSpeakerFaults = _speaker->faults(); abortTurn("speaker_playback_failed");
        }
        if (_connected && !_closePending) pumpCapture();
        // The server's speaking state marks transport output. With no done
        // event, local queue/DMA completion plus a short silence gap re-arms PTT.
        if (_connected && !_awaitFlush && !_captureActive && !_endPending && !_speaker->isPlaying() &&
            _indicator == Indicator::Speaking && millis()-_outputSettledAt >= 160) {
            _indicator = Indicator::Listening; _ready = true; state("physical_playback_idle");
        }
        if (_attempt && (_readyDeadline && (int32_t)(millis()-_readyDeadline) >= 0)) {
            error("server_ready_timeout"); closeSocket(true);
        }
        // Refresh before the 300 s function limit. Do not replay queued speech
        // or application writes; resume only the owned conversation identity.
        if (_connected && millis()-_openedAt >= 270000) { state("function_reconnect"); closeSocket(true); }
        vTaskDelay(pdMS_TO_TICKS(2));
    }
}
