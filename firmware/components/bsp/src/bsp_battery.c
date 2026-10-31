// components/bsp/src/bsp_battery.c
// 移植自 trae_card/components/platform/platform_esp32/src/battery_cw2017.c
// Original AI Passport: configured profile mirrors the official upstream driver.
#include "bsp_battery.h"
#include "bsp_i2c.h"
#include "bsp_pins.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include <stdbool.h>

static const char *TAG = "bsp_batt";

#define CW_REG_VERSION   0x00   // 版本号,上电应答即代表芯片在位
#define CW_REG_VCELL_H   0x02   // 14bit 电压,V(uV) = raw * 312.5
#define CW_REG_SOC_H     0x04   // 高字节 = 整数百分比;低字节(0x05)= 1/256 %
#define CW_REG_CONFIG    0x08   // 0xF0=睡眠 / 0x30=复位态 / 0x00=正常
#define CW_REG_SOC_ALERT 0x0B   // bit7: installed profile update flag
#define CW_CONFIG_RESTART 0x30
#define CW_CONFIG_ACTIVE  0x00
#define CW_CONFIG_SLEEP   0xF0
#define CW_REG_PROFILE    0x10
#define CW_UPDATE_FLAG    0x80
#define CW_PROFILE_SIZE   80

// Derived from assets/battery/wanli-500mah-profile2-xil40x-20261020.txt.
// Source and byte hashes are recorded alongside that file.
static const uint8_t s_battery_profile[] = {
    0x5A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0xAF, 0xCA, 0xCA, 0xC0, 0xB4, 0xA8, 0xCB, 0xAA,
    0x9F, 0xCF, 0xB5, 0x8A, 0x70, 0x56, 0x4B, 0x40,
    0x34, 0x2B, 0x22, 0x55, 0x41, 0xD2, 0x30, 0xD7,
    0xC9, 0xBE, 0xAE, 0xC8, 0xAE, 0x97, 0x9D, 0x98,
    0x94, 0x9F, 0xB6, 0x89, 0x73, 0x65, 0x57, 0x49,
    0x3D, 0x50, 0x74, 0x87, 0xA3, 0x9B, 0x5E, 0x38,
    0x00, 0x00, 0xAB, 0x02, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB7,
};
_Static_assert(sizeof(s_battery_profile)==CW_PROFILE_SIZE,"CW2017 profile must be 80 bytes");

static i2c_master_dev_handle_t s_dev;
static bool s_restart_attempted;
static unsigned s_profile_write_attempts;

static esp_err_t cw_read(uint8_t reg, uint8_t *buf, size_t n) {
    if (!s_dev) return ESP_ERR_INVALID_STATE;
    return i2c_master_transmit_receive(s_dev, &reg, 1, buf, n, 100);
}

static esp_err_t cw_write(uint8_t reg, uint8_t val) {
    if (!s_dev) return ESP_ERR_INVALID_STATE;
    uint8_t b[2] = { reg, val };
    return i2c_master_transmit(s_dev, b, 2, 100);
}

static esp_err_t cw_set_mode(uint8_t mode) {
    esp_err_t e=cw_write(CW_REG_CONFIG,CW_CONFIG_RESTART);if(e!=ESP_OK)return e;
    vTaskDelay(pdMS_TO_TICKS(20));
    e=cw_write(CW_REG_CONFIG,mode);if(e!=ESP_OK)return e;
    vTaskDelay(pdMS_TO_TICKS(10));
    uint8_t actual=0xFF;e=cw_read(CW_REG_CONFIG,&actual,1);if(e!=ESP_OK)return e;
    return actual==mode?ESP_OK:ESP_ERR_INVALID_RESPONSE;
}

static esp_err_t cw_profile_matches(bool *matches) {
    *matches=false;uint8_t status=0;
    esp_err_t e=cw_read(CW_REG_SOC_ALERT,&status,1);if(e!=ESP_OK)return e;
    if(!(status&CW_UPDATE_FLAG))return ESP_OK;
    for(unsigned i=0;i<CW_PROFILE_SIZE;i++){
        uint8_t value=0;e=cw_read((uint8_t)(CW_REG_PROFILE+i),&value,1);if(e!=ESP_OK)return e;
        if(value!=s_battery_profile[i])return ESP_OK;
    }
    *matches=true;return ESP_OK;
}

static esp_err_t cw_update_profile(void) {
    if(s_profile_write_attempts>=2){ESP_LOGE(TAG,"CW2017 profile retry limit reached");return ESP_ERR_INVALID_STATE;}
    s_profile_write_attempts++;
    esp_err_t e=cw_set_mode(CW_CONFIG_SLEEP);if(e!=ESP_OK)return e;
    for(unsigned i=0;i<CW_PROFILE_SIZE;i++){
        e=cw_write((uint8_t)(CW_REG_PROFILE+i),s_battery_profile[i]);
        if(e!=ESP_OK){ESP_LOGE(TAG,"CW2017 profile write failed: index=%u error=%s",i,esp_err_to_name(e));return e;}
    }
    for(unsigned i=0;i<CW_PROFILE_SIZE;i++){
        uint8_t value=0;e=cw_read((uint8_t)(CW_REG_PROFILE+i),&value,1);if(e!=ESP_OK)return e;
        if(value!=s_battery_profile[i]){ESP_LOGE(TAG,"CW2017 profile verify failed: index=%u expected=0x%02X actual=0x%02X",i,(unsigned)s_battery_profile[i],(unsigned)value);return ESP_ERR_INVALID_RESPONSE;}
    }
    uint8_t status=0;e=cw_read(CW_REG_SOC_ALERT,&status,1);if(e!=ESP_OK)return e;
    e=cw_write(CW_REG_SOC_ALERT,status|CW_UPDATE_FLAG);if(e!=ESP_OK)return e;
    e=cw_read(CW_REG_SOC_ALERT,&status,1);if(e!=ESP_OK)return e;
    if(!(status&CW_UPDATE_FLAG))return ESP_ERR_INVALID_RESPONSE;
    return cw_set_mode(CW_CONFIG_ACTIVE);
}

bool bsp_battery_reading_valid(const bsp_battery_reading_t *reading) {
    return reading&&reading->soc_error==ESP_OK&&reading->voltage_error==ESP_OK&&
           reading->config_error==ESP_OK&&reading->profile_error==ESP_OK&&
           reading->percent>=0&&reading->percent<=100&&reading->millivolts>0&&
           reading->config==CW_CONFIG_ACTIVE&&(reading->profile_status&CW_UPDATE_FLAG);
}

esp_err_t bsp_battery_read_status(bsp_battery_reading_t *reading) {
    if (!reading) return ESP_ERR_INVALID_ARG;
    *reading = (bsp_battery_reading_t){.raw_soc=UINT16_MAX,.percent=-1,.millivolts=-1,
                                     .config=0xFF,.profile_status=0xFF};
    uint8_t soc[2]={0},voltage[2]={0};
    reading->soc_error=cw_read(CW_REG_SOC_H,soc,sizeof(soc));
    reading->voltage_error=cw_read(CW_REG_VCELL_H,voltage,sizeof(voltage));
    reading->config_error=cw_read(CW_REG_CONFIG,&reading->config,1);
    reading->profile_error=cw_read(CW_REG_SOC_ALERT,&reading->profile_status,1);
    if(reading->soc_error==ESP_OK){
        reading->raw_soc=((uint16_t)soc[0]<<8)|soc[1];
        if(soc[0]<=100)reading->percent=soc[0];
    }
    if(reading->voltage_error==ESP_OK){
        uint32_t raw=(((uint32_t)voltage[0]<<8)|voltage[1])&0x3FFF;
        reading->millivolts=(int)((raw*3125)/10000);
    }
    if(reading->soc_error!=ESP_OK)return reading->soc_error;
    return reading->percent>=0?ESP_OK:ESP_ERR_INVALID_RESPONSE;
}

esp_err_t bsp_battery_init(void) {
    esp_err_t e = bsp_i2c_init();
    if (e != ESP_OK) return e;

    i2c_device_config_t dc = {
        .dev_addr_length = I2C_ADDR_BIT_LEN_7,
        .device_address  = BSP_I2C_CW2017_ADDR,
        .scl_speed_hz    = 100000,
    };
    if(!s_dev){
        e = i2c_master_bus_add_device(bsp_i2c_bus(), &dc, &s_dev);
        if (e != ESP_OK) { ESP_LOGE(TAG, "添加 I2C 设备失败: %s", esp_err_to_name(e)); return e; }
        s_restart_attempted=false;
    }
    uint8_t ver = 0;
    e=cw_read(CW_REG_VERSION, &ver, 1);
    if (e != ESP_OK) {
        ESP_LOGW(TAG, "CW2017 未应答 —— 用 bsp_i2c_scan() 确认 0x%02X 是否在线;"
                      "无电量计的板子可忽略本项", BSP_I2C_CW2017_ADDR);
        i2c_master_bus_rm_device(s_dev);
        s_dev = NULL;
        return e;
    }
    ESP_LOGI(TAG, "检测到 CW2017 VERSION=0x%02X", ver);

    bool matches=false;e=cw_profile_matches(&matches);
    if(e!=ESP_OK){ESP_LOGE(TAG,"CW2017 profile read: %s",esp_err_to_name(e));return e;}
    if(!matches){
        ESP_LOGI(TAG,"CW2017 installing official profile: Wanli 500mAh profile2 XIL40X 20261020");
        e=cw_update_profile();if(e!=ESP_OK){ESP_LOGE(TAG,"CW2017 profile update: %s",esp_err_to_name(e));return e;}
        e=cw_profile_matches(&matches);if(e!=ESP_OK)return e;
        if(!matches)return ESP_ERR_INVALID_RESPONSE;
        s_restart_attempted=true;
        ESP_LOGI(TAG,"CW2017 profile verified: 80 bytes and UPDATE_FLAG");
    }else ESP_LOGI(TAG,"CW2017 official profile already matches; no rewrite");

    bsp_battery_reading_t reading;bsp_battery_read_status(&reading);
    if(reading.config_error!=ESP_OK)return reading.config_error;
    if(reading.config!=CW_CONFIG_ACTIVE||(!s_restart_attempted&&reading.soc_error==ESP_OK&&reading.percent<0)){
        e=cw_set_mode(CW_CONFIG_ACTIVE);if(e!=ESP_OK)return e;s_restart_attempted=true;
    }
    unsigned stable=0;
    for(unsigned attempt=0;attempt<50;attempt++){
        vTaskDelay(pdMS_TO_TICKS(100));bsp_battery_read_status(&reading);
        if(reading.soc_error!=ESP_OK)return reading.soc_error;
        if(reading.voltage_error!=ESP_OK)return reading.voltage_error;
        if(reading.config_error!=ESP_OK)return reading.config_error;
        if(reading.profile_error!=ESP_OK)return reading.profile_error;
        // Zero percent can be real; zero volts is the post-reset placeholder.
        // Require two complete samples instead of accepting the first zero SOC.
        stable=bsp_battery_reading_valid(&reading)?stable+1:0;
        if(stable>=2){
            ESP_LOGI(TAG,"CW2017 ready: SOC=%d%% voltage=%d mV raw=0x%04X config=0x%02X profile=0x%02X",
                     reading.percent,reading.millivolts,(unsigned)reading.raw_soc,(unsigned)reading.config,(unsigned)reading.profile_status);
            return ESP_OK;
        }
    }
    ESP_LOGW(TAG,"CW2017 SOC not ready: raw=0x%04X voltage=%d mV config=0x%02X profile=0x%02X; official profile verified",
             (unsigned)reading.raw_soc,reading.millivolts,(unsigned)reading.config,(unsigned)reading.profile_status);
    return ESP_ERR_TIMEOUT;
}

int bsp_battery_soc(void) {
    uint8_t b[2] = { 0 };
    if (cw_read(CW_REG_SOC_H, b, 2) != 0) return -1;
    int soc = b[0];                       // 高字节即整数百分比
    if (soc > 100) return -1;             // 芯片未就绪时可能读到 0xFF
    return soc;
}

int bsp_battery_mv(void) {
    uint8_t b[2] = { 0 };
    if (cw_read(CW_REG_VCELL_H, b, 2) != 0) return -1;
    uint32_t raw = ((uint32_t)b[0] << 8 | b[1]) & 0x3FFF;   // 14bit
    return (int)((raw * 3125) / 10000);                     // raw * 312.5uV → mV
}
