// main/main.c -- Sheikah Slate 希卡石板 主程序
//
// 页面路由状态机:
//   STANDBY --[OK]--> RUNES
//   RUNES --[OK on compendium]--> COMPENDIUM
//   RUNES --[OK on quest]--> QUEST
//   RUNES --[长按OK]--> STANDBY
//   子页面 --[长按OK]--> RUNES

#include "bsp_button.h"
#include "bsp_display.h"
#include "bsp_i2c.h"
#include "bsp_battery.h"
#include "page_standby.h"
#include "page_runes.h"
#include "page_compendium.h"
#include "page_quest.h"
#include "page_settings.h"
#include "sheikah_ui.h"
#include "esp_log.h"
#include "nvs_flash.h"

static const char *TAG = "main";

// 页面 ID
typedef enum {
    PAGE_STANDBY = 0,
    PAGE_RUNES,
    PAGE_COMPENDIUM,
    PAGE_QUEST,
    PAGE_SETTINGS,
    PAGE_COUNT,
} page_id_t;

typedef struct {
    void (*enter)(void);
    void (*exit)(void);
    void (*key)(bsp_btn_t, bsp_btn_ev_t);
} page_ops_t;

// 外部函数声明
extern int  page_runes_get_selected_page(void);
extern bool page_settings_wants_standby(void);

static const page_ops_t PAGES[PAGE_COUNT] = {
    [PAGE_STANDBY]    = { page_standby_enter,    page_standby_exit,    page_standby_key    },
    [PAGE_RUNES]      = { page_runes_enter,      page_runes_exit,      page_runes_key      },
    [PAGE_COMPENDIUM] = { page_compendium_enter, page_compendium_exit, page_compendium_key },
    [PAGE_QUEST]      = { page_quest_enter,     page_quest_exit,      page_quest_key      },
    [PAGE_SETTINGS]   = { page_settings_enter,   page_settings_exit,   page_settings_key   },
};

static page_id_t s_current = PAGE_STANDBY;

static void switch_page(page_id_t next)
{
    if (next == s_current) return;
    if (next < 0 || next >= PAGE_COUNT) return;

    if (!bsp_lvgl_lock(1000)) {
        ESP_LOGW(TAG, "LVGL lock timeout during page switch");
        return;
    }

    PAGES[s_current].exit();
    s_current = next;
    PAGES[s_current].enter();

    bsp_lvgl_unlock();
    ESP_LOGI(TAG, "Switched to page %d", (int)next);
}

// 按键回调 (运行在 button 组件任务中)
static void on_key(bsp_btn_t btn, bsp_btn_ev_t ev, void *user)
{
    (void)user;

    if (!bsp_lvgl_lock(500)) return;

    // 全局: 长按 OK 返回上一级
    if (btn == BSP_BTN_OK && ev == BSP_BTN_LONG) {
        if (sk_popup_is_open()) {
            sk_popup_close();
            bsp_lvgl_unlock();
            return;
        }
        switch (s_current) {
        case PAGE_STANDBY:
            break;  // 待机页不回退
        case PAGE_RUNES:
            PAGES[s_current].key(btn, ev);
            bsp_lvgl_unlock();
            switch_page(PAGE_STANDBY);
            return;
        case PAGE_COMPENDIUM:
        case PAGE_QUEST:
        case PAGE_SETTINGS:
            PAGES[s_current].key(btn, ev);
            bsp_lvgl_unlock();
            switch_page(PAGE_RUNES);
            return;
        default:
            break;
        }
    }

    // 待机页: OK 进入符文页
    if (s_current == PAGE_STANDBY && btn == BSP_BTN_OK && ev == BSP_BTN_CLICK) {
        PAGES[s_current].key(btn, ev);
        bsp_lvgl_unlock();
        switch_page(PAGE_RUNES);
        return;
    }

    // 符文页: OK 进入子页面
    if (s_current == PAGE_RUNES && btn == BSP_BTN_OK && ev == BSP_BTN_CLICK) {
        PAGES[s_current].key(btn, ev);
        int target = page_runes_get_selected_page();
        bsp_lvgl_unlock();
        switch (target) {
        case 1: switch_page(PAGE_COMPENDIUM); return;
        case 2: switch_page(PAGE_QUEST); return;
        case 3: switch_page(PAGE_SETTINGS); return;
        default: return;  // 无子页面的符文 (炸弹/磁力/静止/制冰/相机)
        }
    }

    // 设置页: OK on "Return to Standby"
    if (s_current == PAGE_SETTINGS && btn == BSP_BTN_OK && ev == BSP_BTN_CLICK) {
        PAGES[s_current].key(btn, ev);
        if (page_settings_wants_standby()) {
            bsp_lvgl_unlock();
            switch_page(PAGE_STANDBY);
            return;
        }
    }

    // 默认: 传递给当前页面
    PAGES[s_current].key(btn, ev);
    bsp_lvgl_unlock();
}

void app_main(void)
{
    ESP_LOGI(TAG, "Sheikah Slate - AI Passport Edition");

    // NVS (LVGL / BLE 可能需要)
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    // I2C + 电量计 (可选)
    bsp_i2c_init();
    bsp_i2c_scan();
    if (bsp_battery_init() == ESP_OK) {
        ESP_LOGI(TAG, "Battery: %d%%", bsp_battery_soc());
    }

    // 显示
    if (bsp_display_init() != ESP_OK || !bsp_lvgl_init()) {
        ESP_LOGE(TAG, "Display init failed");
        return;
    }
    bsp_display_backlight(100);

    // 按键
    if (bsp_button_init(on_key, NULL) != ESP_OK) {
        ESP_LOGE(TAG, "Button init failed");
        return;
    }

    // 进入待机页
    if (bsp_lvgl_lock(1000)) {
        PAGES[PAGE_STANDBY].enter();
        bsp_lvgl_unlock();
    }

    ESP_LOGI(TAG, "Ready - Press OK to activate the Sheikah Slate");
}
