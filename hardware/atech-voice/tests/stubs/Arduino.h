#pragma once
#include <algorithm>
#include <chrono>
#include <cstdint>
#include <cstring>
#include <cstdlib>
#include <thread>
using std::min;
template<class T> T constrain(T n, T low, T high) { return std::max(low, std::min(n, high)); }
inline uint32_t millis() {
    static auto began = std::chrono::steady_clock::now();
    return std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now()-began).count();
}
constexpr int OUTPUT = 1, LOW = 0;
inline void pinMode(int, int) {}
inline void digitalWrite(int, int) {}
