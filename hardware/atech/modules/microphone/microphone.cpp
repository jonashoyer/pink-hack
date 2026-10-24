/**
 * @file microphone.cpp
 * @brief I2S MEMS Microphone Module Implementation (ICS-43434)
 *
 * Audio capture runs in a background FreeRTOS task. The task continuously
 * reads I2S data and computes RMS/peak levels for the main loop to query.
 * Supports recording up to 10 seconds of audio into a heap buffer.
 */

#include "microphone.h"
#include <Arduino.h>
#include <driver/i2s.h>
#include <math.h>
#include <string.h>

// Static trampoline for FreeRTOS task
static void captureTaskTrampoline(void* param) {
    ((Microphone*)param)->_captureTaskLoop();
}

Microphone::Microphone(int lrPin, int wsPin, int sckPin, int sdPin)
    : _lrPin(lrPin)
    , _wsPin(wsPin)
    , _sckPin(sckPin)
    , _sdPin(sdPin)
    , _initialized(false)
    , _rmsLevel(0)
    , _peakLevel(0)
    , _sampleCount(0)
    , _recordBuffer(nullptr)
    , _recordLength(0)
    , _recording(false)
    , _captureTask(nullptr)
{
    memset(_sampleBuffer, 0, sizeof(_sampleBuffer));
}

void Microphone::begin() {
    // Set L/R channel select pin (LOW = left channel)
    pinMode(_lrPin, OUTPUT);
    digitalWrite(_lrPin, LOW);

    i2s_config_t i2s_config = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
        .sample_rate = SAMPLE_RATE,
        .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,  // ICS-43434 outputs 24-bit in 32-bit frame
        .channel_format = I2S_CHANNEL_FMT_RIGHT_LEFT,
        .communication_format = I2S_COMM_FORMAT_STAND_I2S,
        .intr_alloc_flags = 0,
        .dma_buf_count = 4,
        .dma_buf_len = 256,
        .use_apll = false,
        .tx_desc_auto_clear = false,
    };

    i2s_pin_config_t pin_config = {
        .bck_io_num = _sckPin,
        .ws_io_num = _wsPin,
        .data_out_num = I2S_PIN_NO_CHANGE,
        .data_in_num = _sdPin,
    };

    // Use I2S_NUM_1 to avoid conflict with speaker on I2S_NUM_0
    esp_err_t err = i2s_driver_install(I2S_NUM_1, &i2s_config, 0, NULL);
    if (err != ESP_OK) {
        Serial.print("Microphone I2S install failed: ");
        Serial.println(esp_err_to_name(err));
        return;
    }

    err = i2s_set_pin(I2S_NUM_1, &pin_config);
    if (err != ESP_OK) {
        Serial.print("Microphone I2S pin config failed: ");
        Serial.println(esp_err_to_name(err));
        return;
    }

    _initialized = true;

    // Create background capture task on Core 0
    xTaskCreatePinnedToCore(
        captureTaskTrampoline,
        "MicTask",
        8192,
        this,
        2,
        &_captureTask,
        0  // Core 0
    );
}

int16_t Microphone::getSoundLevel() {
    return _rmsLevel;
}

bool Microphone::isSoundDetected(int16_t threshold) {
    return _rmsLevel > threshold;
}

int16_t Microphone::getPeakAmplitude() {
    int16_t peak = _peakLevel;
    _peakLevel = 0;  // Reset after read
    return peak;
}

int Microphone::getSamples(int16_t* dest, int numSamples) {
    int count = min(numSamples, (int)_sampleCount);
    count = min(count, (int)BUFFER_SAMPLES);
    memcpy(dest, _sampleBuffer, count * sizeof(int16_t));
    return count;
}

void Microphone::clearRecording() {
    portENTER_CRITICAL(&_recordMux);
    _recording = false;
    int16_t* old = _recordBuffer;
    _recordBuffer = nullptr;
    _recordLength = 0;
    portEXIT_CRITICAL(&_recordMux);
    if (old) {
        memset(old, 0, MAX_RECORD_SAMPLES * sizeof(int16_t));
        free(old);
    }
}

void Microphone::startRecording() {
    clearRecording();
    if (!_initialized) return;
    int16_t* buffer = (int16_t*)calloc(MAX_RECORD_SAMPLES, sizeof(int16_t));
    if (!buffer) {
        Serial.println("Microphone: recording allocation failed");
        return;
    }
    portENTER_CRITICAL(&_recordMux);
    _recordBuffer = buffer;
    _recordLength = 0;
    _recording = true;
    portEXIT_CRITICAL(&_recordMux);
}

void Microphone::stopRecording() {
    portENTER_CRITICAL(&_recordMux);
    _recording = false;
    portEXIT_CRITICAL(&_recordMux);
}

bool Microphone::isRecording() {
    return _recording;
}

const int16_t* Microphone::getRecording() {
    return _recordBuffer;
}

int Microphone::getRecordingLength() {
    return _recordLength;
}

void Microphone::setChannel(bool right) {
    digitalWrite(_lrPin, right ? HIGH : LOW);
}

// ========== Background capture task ==========

void Microphone::_captureTaskLoop() {
    // Read stereo frames: each frame is [Left_32bit, Right_32bit]
    int32_t rawBuffer[BUFFER_SAMPLES * 2];  // Stereo pairs

    while (true) {
        size_t bytesRead = 0;
        esp_err_t err = i2s_read(I2S_NUM_1, rawBuffer, sizeof(rawBuffer), &bytesRead, pdMS_TO_TICKS(100));

        if (err != ESP_OK || bytesRead == 0) {
            vTaskDelay(pdMS_TO_TICKS(10));
            continue;
        }

        int totalSamples = bytesRead / sizeof(int32_t);  // L+R interleaved
        int monoSamples = totalSamples / 2;               // Only left channel
        int64_t sumSquares = 0;
        int16_t peak = 0;

        for (int i = 0; i < monoSamples; i++) {
            // Take left channel only (even indices), skip right (odd indices)
            // ICS-43434: 24-bit data left-aligned in 32-bit frame, shift down to 16-bit
            int16_t sample = (int16_t)(rawBuffer[i * 2] >> 16);
            _sampleBuffer[i] = sample;

            int32_t abs_sample = abs(sample);
            sumSquares += (int64_t)sample * sample;
            if (abs_sample > peak) peak = (int16_t)abs_sample;

        }

        // Copy each fresh I2S block once; protect reset/free against this task.
        portENTER_CRITICAL(&_recordMux);
        if (_recording && _recordBuffer) {
            int count = min(monoSamples, MAX_RECORD_SAMPLES - (int)_recordLength);
            memcpy(_recordBuffer + _recordLength, _sampleBuffer, count * sizeof(int16_t));
            _recordLength += count;
            if (_recordLength >= MAX_RECORD_SAMPLES) _recording = false;
        }
        portEXIT_CRITICAL(&_recordMux);

        _sampleCount = monoSamples;
        _rmsLevel = (int16_t)sqrt((double)sumSquares / monoSamples);

        if (peak > _peakLevel) _peakLevel = peak;
    }
}
