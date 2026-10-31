// components/bsp/include/bsp_battery.h
// CellWise CW2017 电量计:I2C 0x63,与 ES8311 共用总线。
// 原厂 AI Passport：使用官方配置的万锂 500mAh profile2 / XIL40X 参数。
#pragma once

#include "esp_err.h"
#include <stdint.h>
#include <stdbool.h>

typedef struct {
    esp_err_t soc_error, voltage_error, config_error, profile_error;
    uint16_t raw_soc;
    uint8_t config, profile_status;
    int percent, millivolts;
} bsp_battery_reading_t;

// Always fills available raw/status fields, even when SOC is not ready.
// Read-only; callers must serialize access with initialization.
esp_err_t bsp_battery_read_status(bsp_battery_reading_t *reading);
bool bsp_battery_reading_valid(const bsp_battery_reading_t *reading);

// 初始化。内部会调 bsp_i2c_init()(幂等)。
// 检查并按需唤醒，最多等待 5 秒 SOC；返回实际 I2C 错误或就绪超时。
// 检查 profile 标志及全部 80 字节，必要时写入并回读；匹配则复用。
// 仅在后台任务调用，勿阻塞 LVGL。
esp_err_t bsp_battery_init(void);

// 剩余电量百分比 0..100;读失败返回 -1。
int bsp_battery_soc(void);

// 电池电压 mV;读失败返回 -1。
int bsp_battery_mv(void);
