#include "speaker.h"
#include <driver/i2s.h>

void Speaker::begin() {
    i2s_config_t config = {};
    config.mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX);
    config.sample_rate = 16000; config.bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT;
    config.channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT;
    config.communication_format = I2S_COMM_FORMAT_STAND_I2S;
    config.dma_buf_count = 4; config.dma_buf_len = 256; config.tx_desc_auto_clear = true;
    i2s_pin_config_t pins = {};
    pins.bck_io_num = _bclk; pins.ws_io_num = _lrclk;
    pins.data_out_num = _data; pins.data_in_num = I2S_PIN_NO_CHANGE;
    if (i2s_driver_install(I2S_NUM_0, &config, 0, nullptr) != ESP_OK) return;
    if (i2s_set_pin(I2S_NUM_0, &pins) != ESP_OK) { i2s_driver_uninstall(I2S_NUM_0); return; }
    _queue = xQueueCreate(QUEUE_CHUNKS, sizeof(Chunk)); _mutex = xSemaphoreCreateMutex();
    if (!_queue || !_mutex) return;
    _initialized = xTaskCreatePinnedToCore(task, "VoiceSpeaker", 4096, this, 3, nullptr, 0) == pdPASS;
}
void Speaker::setVolume(float volume) { _volume.store(constrain(volume, 0.0f, 1.0f)); }
bool Speaker::isPlaying() const {
    return _queuedBytes.load() || _inflight.load() || (int32_t)(_drainUntil.load() - millis()) > 0;
}
bool Speaker::enqueuePCM(const uint8_t* bytes, size_t length) {
    if (!_initialized || !bytes || !length || length > 2048 || (length & 1)) return false;
    xSemaphoreTake(_mutex, portMAX_DELAY);
    size_t chunks = (length + 1023) / 1024;
    if (uxQueueSpacesAvailable(_queue) < chunks) { xSemaphoreGive(_mutex); ++_faults; return false; }
    for (size_t offset = 0; offset < length; offset += 1024) {
        Chunk c = {}; c.generation = _generation.load(); c.arrived = millis();
        c.samples = min((size_t)512, (length - offset) / 2);
        for (size_t i = 0; i < c.samples; ++i) c.pcm[i] = (int16_t)((uint16_t)bytes[offset + i*2] | ((uint16_t)bytes[offset + i*2+1] << 8));
        // Count before publishing: the consumer takes the same mutex before subtracting.
        _queuedBytes.fetch_add(c.samples * 2);
        xQueueSend(_queue, &c, 0);
        memset(&c, 0, sizeof(c));
    }
    xSemaphoreGive(_mutex); return true;
}
void Speaker::stop() {
    if (!_initialized) return;
    xSemaphoreTake(_mutex, portMAX_DELAY);
    ++_generation;
    Chunk c;
    while (xQueueReceive(_queue, &c, 0) == pdTRUE) memset(&c, 0, sizeof(c));
    _queuedBytes = 0;
    // No writer can enter while the barrier holds this mutex. A dequeued old
    // task-local chunk fails the generation check before its next write.
    esp_err_t stopped = i2s_stop(I2S_NUM_0);
    esp_err_t cleared = i2s_zero_dma_buffer(I2S_NUM_0);
    esp_err_t started = i2s_start(I2S_NUM_0);
    if (stopped != ESP_OK || cleared != ESP_OK || started != ESP_OK) ++_faults;
    _drainUntil = 0; _inflight = false; ++_flushes;
    xSemaphoreGive(_mutex);
}
void Speaker::task(void* context) { static_cast<Speaker*>(context)->playback(); }
void Speaker::playback() {
    Chunk c = {}; int16_t stereo[128] = {};
    while (true) {
        if (xQueueReceive(_queue, &c, pdMS_TO_TICKS(10)) != pdTRUE) continue;
        xSemaphoreTake(_mutex, portMAX_DELAY);
        bool valid = c.generation == _generation.load();
        if (valid) { _queuedBytes.fetch_sub(c.samples * 2); _inflight = true; }
        xSemaphoreGive(_mutex);
        if (valid && millis() - c.arrived > 1500) { ++_faults; stop(); valid = false; }
        for (size_t offset = 0; valid && offset < c.samples;) {
            xSemaphoreTake(_mutex, portMAX_DELAY);
            if (c.generation != _generation.load()) { xSemaphoreGive(_mutex); break; }
            size_t n = min((size_t)64, (size_t)c.samples - offset);
            float volume = _volume.load();
            for (size_t i = 0; i < n; ++i) stereo[2*i] = stereo[2*i+1] = (int16_t)(c.pcm[offset+i] * volume);
            size_t written = 0;
            esp_err_t result = i2s_write(I2S_NUM_0, stereo, n * 4, &written, pdMS_TO_TICKS(5));
            bool failed = result != ESP_OK || !written || (written % 4);
            offset += written / 4; _writtenBytes.fetch_add(written / 2);
            // DMA has 4*256 stereo frames, 64 ms at 16 kHz. Add 16 ms margin.
            _drainUntil = millis() + 80;
            xSemaphoreGive(_mutex);
            if (failed) { ++_faults; stop(); break; }
            taskYIELD();
        }
        xSemaphoreTake(_mutex, portMAX_DELAY);
        if (c.generation == _generation.load()) _inflight = false;
        xSemaphoreGive(_mutex);
        memset(&c, 0, sizeof(c)); memset(stereo, 0, sizeof(stereo));
    }
}
