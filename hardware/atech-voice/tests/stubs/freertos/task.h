#pragma once
#include "FreeRTOS.h"
using TaskHandle_t = void*;
inline int xTaskCreatePinnedToCore(void(*fn)(void*), const char*, unsigned, void* context, int, TaskHandle_t*, int) {
    std::thread(fn, context).detach(); return pdPASS;
}
inline void vTaskDelay(TickType_t ms) { std::this_thread::sleep_for(std::chrono::milliseconds(ms)); }
