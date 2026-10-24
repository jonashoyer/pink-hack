#pragma once
#include "FreeRTOS.h"
#include <condition_variable>
#include <deque>
#include <vector>
#include <cstring>
struct HostQueue {
    size_t capacity, elementSize;
    std::mutex mutex;
    std::condition_variable ready;
    std::deque<std::vector<uint8_t>> entries;
};
using QueueHandle_t = HostQueue*;
inline QueueHandle_t xQueueCreate(size_t n, size_t size) { auto* q = new HostQueue; q->capacity=n; q->elementSize=size; return q; }
inline size_t uxQueueSpacesAvailable(QueueHandle_t q) { std::lock_guard<std::mutex> l(q->mutex); return q->capacity-q->entries.size(); }
inline int xQueueSend(QueueHandle_t q, const void* data, TickType_t) {
    std::lock_guard<std::mutex> l(q->mutex);
    if (q->entries.size() == q->capacity) return 0;
    const uint8_t* b = static_cast<const uint8_t*>(data);
    q->entries.emplace_back(b, b+q->elementSize); q->ready.notify_one(); return pdTRUE;
}
inline int xQueueReceive(QueueHandle_t q, void* dest, TickType_t timeout) {
    std::unique_lock<std::mutex> l(q->mutex);
    if (q->entries.empty() && timeout) q->ready.wait_for(l, std::chrono::milliseconds(timeout), [&]{return !q->entries.empty();});
    if (q->entries.empty()) return 0;
    memcpy(dest, q->entries.front().data(), q->elementSize); q->entries.pop_front(); return pdTRUE;
}
