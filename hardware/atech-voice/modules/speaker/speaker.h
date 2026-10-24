#pragma once
#include <Arduino.h>
#include <atomic>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <freertos/semphr.h>
#include <freertos/task.h>

class Speaker {
public:
    static constexpr size_t CHUNK_SAMPLES = 512;
    static constexpr size_t QUEUE_CHUNKS = 32;
    static constexpr size_t WRITE_SAMPLES = 256;      // 16 ms per I2S write
    static constexpr uint32_t PREBUFFER_BYTES = 6400; // 200 ms before a reply starts
    static constexpr uint32_t STALL_MS = 150;         // shorter replies play once arrivals stop
    static constexpr int32_t TARGET_PEAK = 20000;     // pre-volume speech peak
    static constexpr float MAX_GAIN = 128.0f;         // quiet replies; silence stays near silent
    Speaker(int bclk, int lrclk, int data): _bclk(bclk), _lrclk(lrclk), _data(data) {}
    void begin();
    bool initialized() const { return _initialized; }
    bool enqueuePCM(const uint8_t* bytes, size_t length);
    void stop(); // Serializes against one 16 ms I2S write with a 100 ms timeout.
    void setVolume(float volume);
    float getVolume() const { return _volume.load(); }
    bool isPlaying() const;
    uint32_t queuedBytes() const { return _queuedBytes.load(); }
    uint32_t playedBytes() const { return _writtenBytes.load(); } // Accepted by I2S, not human hearing.
    uint32_t pcmPeak() const { return _pcmPeak.load(); } // Accepted post-volume amplitude.
    uint32_t flushCount() const { return _flushes.load(); }
    uint32_t faults() const { return _faults.load(); }
private:
    struct Chunk { uint32_t generation, arrived; uint16_t samples; int16_t pcm[CHUNK_SAMPLES]; };
    static void task(void* context);
    void playback();
    int _bclk, _lrclk, _data;
    bool _initialized = false;
    QueueHandle_t _queue = nullptr;
    SemaphoreHandle_t _mutex = nullptr;
    std::atomic<float> _volume{0.4f};
    std::atomic<uint32_t> _generation{0}, _queuedBytes{0}, _writtenBytes{0}, _flushes{0}, _faults{0};
    std::atomic<uint32_t> _pcmPeak{0};
    std::atomic<uint32_t> _drainUntil{0}, _lastEnqueue{0};
    int32_t _envelope = 0; // Guarded by _mutex.
    std::atomic<bool> _inflight{false};
};
