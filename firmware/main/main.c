// main/main.c -- Sheikah Slate 希卡石板 主程序 (横屏 320x240)
//
// 路由由 slate_app 负责；按键任务只把原始按下/抬起投递到有界队列，
// 短按/长按统一在 LVGL 线程里按实际按住时间分类，避免双击延迟吞掉
// 时停的连续敲击，也避免长按返回后在新页面再触发一次短按。

#include "bsp_button.h"
#include "bsp_display.h"
#include "bsp_i2c.h"
#include "bsp_battery.h"
#include "slate_app.h"
#include "game/input.h"
#include "game/store.h"
#include "audio/sfx.h"
#include "lvgl.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "nvs_flash.h"

static const char *TAG = "main";

#define KEY_QUEUE_LEN  12   // 只保留最近的三键动作, 队列满时丢弃最旧事件
#define INPUT_TICK_MS  20

typedef struct {
    uint8_t  key;
    bool     pressed;
    uint32_t time;
} key_event_t;

static QueueHandle_t  s_keys;
static input_state_t  s_input;
static uint32_t       s_generation;
static int            s_brightness = 100;

static uint32_t now_ms(void) { return (uint32_t)(esp_timer_get_time() / 1000); }

// 按键任务上下文: 不做任何阻塞或 UI 操作。
static void on_key(bsp_btn_t btn, bsp_btn_ev_t ev, void *user)
{
    (void)user;
    if (ev != BSP_BTN_PRESS && ev != BSP_BTN_RELEASE) return;
    if (!s_keys) return;

    const key_event_t e = { (uint8_t)btn, ev == BSP_BTN_PRESS, now_ms() };
    if (xQueueSend(s_keys, &e, 0) != pdTRUE) {
        key_event_t stale;
        xQueueReceive(s_keys, &stale, 0);   // 丢掉最旧的一条, 保证最新动作不丢
        xQueueSend(s_keys, &e, 0);
    }
}

// 页面切换后清除旧手势: 长按打开下一层时, 抬起与后续动作不能穿透。
static void sync_page(void)
{
    if (slate_generation() == s_generation) return;
    s_generation = slate_generation();
    input_reset(&s_input);
}

static void dispatch(int key, input_result_t result)
{
    if (result == INPUT_NONE) return;
    slate_key((bsp_btn_t)key, result == INPUT_LONG ? BSP_BTN_LONG : BSP_BTN_CLICK);
    sync_page();
}

// LVGL 线程: 消费队列 + 轮询长按, 每个物理动作只派发一次。
static void input_tick(lv_timer_t *timer)
{
    (void)timer;
    key_event_t e;
    while (xQueueReceive(s_keys, &e, 0) == pdTRUE)
        dispatch(e.key, input_edge(&s_input, e.key, e.pressed, e.time));

    const uint32_t now = now_ms();
    for (int k = 0; k < 3; k++) dispatch(k, input_poll(&s_input, k, now));
    sync_page();
}

void app_main(void)
{
    ESP_LOGI(TAG, "Sheikah Slate - AI Passport Edition");

    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    // 进度/设置先读出来, 背光与音量随后直接生效。
    store_load();
    s_brightness = store_progress.brightness;

    bsp_i2c_init();
    bsp_i2c_scan();
    if (bsp_battery_init() == ESP_OK) {
        ESP_LOGI(TAG, "Battery: %d%%", bsp_battery_soc());
    }

    if (bsp_display_init() != ESP_OK || !bsp_lvgl_init()) {
        ESP_LOGE(TAG, "Display init failed");
        return;
    }
    bsp_display_backlight(s_brightness);

    sfx_init();
    sfx_set_volume(store_progress.volume);
    sfx_set_enabled(store_progress.sound != 0);

    s_keys = xQueueCreate(KEY_QUEUE_LEN, sizeof(key_event_t));
    input_reset(&s_input);
    if (!s_keys || bsp_button_init(on_key, NULL) != ESP_OK) {
        ESP_LOGE(TAG, "Button init failed");
        return;
    }

    if (!bsp_lvgl_lock(1000)) {
        ESP_LOGE(TAG, "LVGL lock timeout at startup");
        return;
    }
    slate_init();
    s_generation = slate_generation();
    lv_timer_create(input_tick, INPUT_TICK_MS, NULL);
    bsp_lvgl_unlock();

    ESP_LOGI(TAG, "Ready - landscape 320x240, press OK to activate");
}
