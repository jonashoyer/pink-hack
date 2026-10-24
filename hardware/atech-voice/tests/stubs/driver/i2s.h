#pragma once
#include <cstddef>
#include <cstdint>
using esp_err_t = int;
using i2s_mode_t = int;
using i2s_port_t = int;
constexpr int ESP_OK=0, I2S_NUM_0=0, I2S_NUM_1=1, I2S_MODE_MASTER=1, I2S_MODE_RX=2, I2S_MODE_TX=4;
constexpr int I2S_BITS_PER_SAMPLE_16BIT=16, I2S_BITS_PER_SAMPLE_32BIT=32;
constexpr int I2S_CHANNEL_FMT_RIGHT_LEFT=1, I2S_COMM_FORMAT_STAND_I2S=1, I2S_PIN_NO_CHANGE=-1;
struct i2s_config_t { int mode, sample_rate, bits_per_sample, channel_format, communication_format, dma_buf_count, dma_buf_len; bool tx_desc_auto_clear; };
struct i2s_pin_config_t { int bck_io_num, ws_io_num, data_out_num, data_in_num; };
inline int i2s_driver_install(int, const i2s_config_t*, int, void*) { return ESP_OK; }
inline int i2s_set_pin(int, const i2s_pin_config_t*) { return ESP_OK; }
inline int i2s_driver_uninstall(int) { return ESP_OK; }
int i2s_read(int, void*, size_t, size_t*, unsigned);
int i2s_write(int, const void*, size_t, size_t*, unsigned);
int i2s_stop(int);
int i2s_zero_dma_buffer(int);
int i2s_start(int);
