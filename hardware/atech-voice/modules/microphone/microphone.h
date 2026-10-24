// Streaming design adapted from davidstalmarck/clawd-bot, MIT, pinned in SOURCES.md.
#pragma once
#include <Arduino.h>
#include <atomic>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>

class Microphone {
public:
    static constexpr int SAMPLE_RATE = 16000;
    static constexpr int BUFFER_SAMPLES = 512;
    static constexpr int STREAM_SAMPLES = 8192; // 16 KiB, 512 ms maximum.
    Microphone(int lr, int ws, int sck, int sd);
    void begin();
    bool initialized() const { return _initialized; }
    bool startStream();
    void endStream(); // Freeze at PTT release; leave unread samples for paced drain.
    void stopStream(); // Abort and erase unread samples.
    int readStream(int16_t* destination, int maxSamples);
    uint32_t streamOverruns();
    uint32_t pendingSamples();
    uint32_t oldestAgeMs();
    int16_t getSoundLevel() const { return _level.load(); }
private:
    void capture();
    static void task(void* context);
    int _lr, _ws, _sck, _sd;
    bool _initialized = false;
    int16_t _ring[STREAM_SAMPLES] = {};
    uint32_t _head = 0, _tail = 0, _count = 0, _overruns = 0;
    uint32_t _epoch = 0, _startedAt = 0, _consumed = 0;
    uint8_t _warmupBlocks = 0;
    bool _streaming = false;
    portMUX_TYPE _mux = portMUX_INITIALIZER_UNLOCKED;
    std::atomic<int16_t> _level{0};
};
