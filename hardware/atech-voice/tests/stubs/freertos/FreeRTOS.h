#pragma once
#include <mutex>
#include <thread>
#include <chrono>
#define portMUX_TYPE std::mutex
#define portMUX_INITIALIZER_UNLOCKED {}
#define portENTER_CRITICAL(p) (p)->lock()
#define portEXIT_CRITICAL(p) (p)->unlock()
#define pdMS_TO_TICKS(n) (n)
#define portMAX_DELAY 0xffffffffU
#define pdPASS 1
#define pdTRUE 1
#define taskYIELD() std::this_thread::yield()
using TickType_t = unsigned;
