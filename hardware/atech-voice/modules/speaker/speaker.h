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
    Speaker(int bclk, int lrclk, int data): _bclk(bclk), _lrclk(lrclk), _data(data) {}
    void begin();
    bool initialized() const { return _initialized; }
    bool enqueuePCM(const uint8_t* bytes, size_t length);
    void stop(); // Serializes against every <=4 ms I2S write, then stops/zeros DMA.
    void setVolume(float volume);
    float getVolume() const { return _volume.load(); }
    bool isPlaying() const;
    uint32_t queuedBytes() const { return _queuedBytes.load(); }
    uint32_t playedBytes() const { return _writtenBytes.load(); } // Accepted by I2S, not human hearing.
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
    std::atomic<uint32_t> _drainUntil{0};
    std::atomic<bool> _inflight{false};
};
