// SDK I2S wiring/conversion, consuming ring adapted from clawd-bot (MIT).
#include "microphone.h"
#include <driver/i2s.h>
#include <math.h>

Microphone::Microphone(int lr, int ws, int sck, int sd): _lr(lr), _ws(ws), _sck(sck), _sd(sd) {}
void Microphone::begin() {
    pinMode(_lr, OUTPUT); digitalWrite(_lr, LOW);
    i2s_config_t config = {};
    config.mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX);
    config.sample_rate = SAMPLE_RATE;
    config.bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT;
    config.channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT;
    config.communication_format = I2S_COMM_FORMAT_STAND_I2S;
    config.dma_buf_count = 4; config.dma_buf_len = 256;
    i2s_pin_config_t pins = {};
    pins.bck_io_num = _sck; pins.ws_io_num = _ws;
    pins.data_out_num = I2S_PIN_NO_CHANGE; pins.data_in_num = _sd;
    if (i2s_driver_install(I2S_NUM_1, &config, 0, nullptr) != ESP_OK) return;
    if (i2s_set_pin(I2S_NUM_1, &pins) != ESP_OK) {
        i2s_driver_uninstall(I2S_NUM_1); return;
    }
    // Capture's compiled frame is ~5.2 KiB. Keep room for I2S and scheduler
    // calls, matching the stack used by the physically tested SDK microphone.
    _initialized = xTaskCreatePinnedToCore(task, "VoiceMic", 8192, this, 2, nullptr, 0) == pdPASS;
    if (!_initialized) i2s_driver_uninstall(I2S_NUM_1);
}
bool Microphone::startStream() {
    if (!_initialized) return false;
    portENTER_CRITICAL(&_mux);
    ++_epoch; _head = _tail = _count = _overruns = _consumed = 0;
    _startedAt = millis(); _warmupBlocks = 2; _streaming = true;
    portEXIT_CRITICAL(&_mux);
    return true;
}
void Microphone::endStream() {
    portENTER_CRITICAL(&_mux);
    _streaming = false; ++_epoch;
    portEXIT_CRITICAL(&_mux);
}
void Microphone::stopStream() {
    portENTER_CRITICAL(&_mux);
    _streaming = false; ++_epoch; _head = _tail = _count = 0;
    // Erase only RAM audio; no filesystem/serial audio storage exists.
    memset(_ring, 0, sizeof(_ring));
    portEXIT_CRITICAL(&_mux);
}
int Microphone::readStream(int16_t* destination, int maxSamples) {
    if (!destination || maxSamples <= 0) return 0;
    portENTER_CRITICAL(&_mux);
    int n = min(maxSamples, (int)_count);
    for (int i = 0; i < n; ++i) {
        destination[i] = _ring[_tail]; _ring[_tail] = 0;
        _tail = (_tail + 1) % STREAM_SAMPLES;
    }
    _count -= n; _consumed += n;
    portEXIT_CRITICAL(&_mux);
    return n;
}
uint32_t Microphone::streamOverruns() {
    portENTER_CRITICAL(&_mux); uint32_t n = _overruns; portEXIT_CRITICAL(&_mux); return n;
}
uint32_t Microphone::pendingSamples() {
    portENTER_CRITICAL(&_mux); uint32_t n = _count; portEXIT_CRITICAL(&_mux); return n;
}
uint32_t Microphone::oldestAgeMs() {
    portENTER_CRITICAL(&_mux);
    uint32_t elapsed = millis() - _startedAt;
    uint32_t consumedMs = _consumed * 1000ULL / SAMPLE_RATE;
    uint32_t age = _count && elapsed > consumedMs ? elapsed - consumedMs : 0;
    portEXIT_CRITICAL(&_mux); return age;
}
void Microphone::task(void* context) { static_cast<Microphone*>(context)->capture(); }
void Microphone::capture() {
    int32_t raw[BUFFER_SAMPLES * 2];
    int16_t mono[BUFFER_SAMPLES];
    while (true) {
        portENTER_CRITICAL(&_mux); uint32_t epoch = _epoch; portEXIT_CRITICAL(&_mux);
        size_t bytes = 0;
        if (i2s_read(I2S_NUM_1, raw, sizeof(raw), &bytes, pdMS_TO_TICKS(50)) != ESP_OK || bytes < 8) {
            vTaskDelay(pdMS_TO_TICKS(2)); continue;
        }
        int n = min((int)(bytes / 8), BUFFER_SAMPLES);
        int64_t squares = 0;
        for (int i = 0; i < n; ++i) {
            mono[i] = (int16_t)(raw[i * 2] >> 16);
            squares += (int64_t)mono[i] * mono[i];
        }
        _level.store((int16_t)sqrt((double)squares / n));
        portENTER_CRITICAL(&_mux);
        // Reject the block spanning a start/release boundary. Never replay a snapshot.
        if (_streaming && epoch == _epoch) {
            // RX DMA can still contain pre-PTT sound. Drain its 4*256 frames
            // before retaining audio, including any speaker echo at the boundary.
            if (_warmupBlocks) {
                --_warmupBlocks; _startedAt = millis();
            } else {
                for (int i = 0; i < n; ++i) {
                    if (_count == STREAM_SAMPLES) { ++_overruns; continue; }
                    _ring[_head] = mono[i]; _head = (_head + 1) % STREAM_SAMPLES; ++_count;
                }
            }
        }
        portEXIT_CRITICAL(&_mux);
        memset(raw, 0, sizeof(raw)); memset(mono, 0, sizeof(mono));
    }
}
