// Runs the actual drivers against task/queue/I2S stubs; no USB or real audio.
#include "microphone.h"
#include "speaker.h"
#include "driver/i2s.h"
#include <cassert>
#include <condition_variable>
#include <cstdio>
#include <deque>
#include <vector>
#include <atomic>

std::mutex audioMutex;
std::condition_variable inputReady;
std::deque<std::vector<int32_t>> input;
std::vector<int16_t> dma;
std::atomic<unsigned> reads{0}, waiters{0};
std::atomic<bool> failWrites{false};
std::atomic<unsigned> writeDelay{1}, stopCalls{0}, clearCalls{0}, startCalls{0};
int i2s_read(int, void* destination, size_t maxBytes, size_t* bytes, unsigned timeout) {
    std::unique_lock<std::mutex> lock(audioMutex); ++waiters;
    bool ready = inputReady.wait_for(lock, std::chrono::milliseconds(timeout), []{return !input.empty();});
    --waiters;
    if (!ready) { *bytes=0; return -1; }
    *bytes=std::min(maxBytes, input.front().size()*sizeof(int32_t));
    memcpy(destination, input.front().data(), *bytes); input.pop_front(); ++reads; return ESP_OK;
}
int i2s_write(int, const void* source, size_t bytes, size_t* written, unsigned) {
    std::this_thread::sleep_for(std::chrono::milliseconds(writeDelay.load()));
    if (failWrites) { *written=0; return -1; }
    std::lock_guard<std::mutex> lock(audioMutex);
    auto* pcm = static_cast<const int16_t*>(source); dma.insert(dma.end(), pcm, pcm+bytes/2);
    *written=bytes; return ESP_OK;
}
int i2s_stop(int) { ++stopCalls; return ESP_OK; }
int i2s_zero_dma_buffer(int) { ++clearCalls; std::lock_guard<std::mutex> l(audioMutex); dma.clear(); return ESP_OK; }
int i2s_start(int) { ++startCalls; return ESP_OK; }
template<class F> void until(F predicate, const char* why) {
    auto began = millis();
    while (!predicate()) { if (millis()-began>1000) { fprintf(stderr,"timeout: %s\n",why); std::abort(); } vTaskDelay(1); }
}
void feed(int first, bool ascending=false) {
    unsigned expected=reads+1;
    std::vector<int32_t> block(1024,0);
    for (int i=0;i<512;++i) block[i*2]=(first+(ascending?i:0))*65536;
    { std::lock_guard<std::mutex> lock(audioMutex); input.push_back(block); }
    inputReady.notify_one(); until([&]{return reads>=expected;},"mic block consumption"); vTaskDelay(2);
}
int main() {
    Microphone mic(1,2,3,4); // Stub pins only. Firmware receives SDK port pins.
    mic.begin(); until([]{return waiters>0;},"capture task start");
    assert(mic.startStream());
    feed(-100); feed(-100); feed(-100); // Old read epoch and two DMA warmup blocks.
    assert(mic.pendingSamples()==0);
    feed(100,true); until([&]{return mic.pendingSamples()==512;},"fresh ring block");
    int16_t samples[8192];
    assert(mic.readStream(samples,256)==256);
    for (int i=0;i<256;++i) assert(samples[i]==100+i);
    mic.endStream(); feed(999); // Release freezes producer but preserves pending PCM.
    assert(mic.readStream(samples,8192)==256);
    for (int i=0;i<256;++i) assert(samples[i]==356+i);
    assert(mic.readStream(samples,512)==0);
    until([]{return waiters>0;},"next capture read");
    assert(mic.startStream()); feed(0); feed(0); feed(0);
    for (int i=0;i<17;++i) feed(i+1);
    assert(mic.pendingSamples()==8192); assert(mic.streamOverruns()==512);
    mic.stopStream(); assert(mic.pendingSamples()==0); assert(mic.readStream(samples,512)==0);
    puts("PASS microphone fresh FIFO, single consumption, release drain, bounded overflow, discard");

    Speaker speaker(1,2,3); speaker.begin(); speaker.setVolume(0.4f);
    int16_t oldPCM[512], newPCM[512]; std::fill_n(oldPCM,512,1000); std::fill_n(newPCM,512,2000);
    assert(!speaker.enqueuePCM((uint8_t*)oldPCM,3)); assert(!speaker.enqueuePCM((uint8_t*)oldPCM,2050));
    assert(speaker.enqueuePCM((uint8_t*)oldPCM,sizeof(oldPCM)));
    until([&]{return speaker.playedBytes()>0;},"speaker writes"); speaker.stop();
    assert(stopCalls && clearCalls && startCalls); assert(!speaker.isPlaying());
    assert(speaker.enqueuePCM((uint8_t*)newPCM,sizeof(newPCM)));
    until([&]{return !speaker.isPlaying();},"physical drain deadline");
    { std::lock_guard<std::mutex> lock(audioMutex); assert(!dma.empty()); for (auto value: dma) assert(value==800); }
    puts("PASS speaker stop clears queued/inflight DMA; new generation has no stale PCM");
    writeDelay=4; bool full=false;
    for (int i=0;i<100;++i) if (!speaker.enqueuePCM((uint8_t*)newPCM,sizeof(newPCM))) { full=true; break; }
    // The counter can include the single dequeued worker frame while it waits
    // for the write mutex. Queue + worker PCM is still <=33 KiB, below 64 kB.
    assert(full); assert(speaker.queuedBytes()<=33*1024); speaker.stop();
    failWrites=true; auto faults=speaker.faults(); assert(speaker.enqueuePCM((uint8_t*)newPCM,sizeof(newPCM)));
    until([&]{return speaker.faults()>faults;},"write failure signal");
    until([&]{return !speaker.isPlaying();},"write failure flush");
    puts("PASS speaker queue bound, bad frame rejection, write failure detection/flush");
    fflush(stdout); std::_Exit(0); // Driver tasks intentionally run for firmware lifetime.
}
