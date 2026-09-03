// main/page_settings.c -- 设置页
//
// 亮度调节 + 返回待机。

#include "page_settings.h"
#include "sheikah_theme.h"
#include "sheikah_ui.h"
#include "bsp_display.h"
#include "esp_log.h"
#include <string.h>

static const char *TAG = "settings";

typedef struct {
    const char *name;
    int         value_min;
    int         value_max;
    int         value;
} setting_item_t;

static setting_item_t S_SETTINGS[] = {
    { "Brightness", 10, 100, 100 },
    { "Return to Standby", 0, 0, 0 },
};
#define SETTINGS_COUNT (sizeof(S_SETTINGS) / sizeof(S_SETTINGS[0]))

static lv_obj_t *s_scr;
static lv_obj_t *s_items[SETTINGS_COUNT];
static lv_obj_t *s_value_labels[SETTINGS_COUNT];
static int       s_sel = 0;

static void update_selection(void)
{
    for (int i = 0; i < (int)SETTINGS_COUNT; i++) {
        lv_obj_t *item = s_items[i];
        if (i == s_sel) {
            lv_obj_set_style_bg_color(item, lv_color_hex(SK_BLUE), 0);
            lv_obj_set_style_bg_opa(item, LV_OPA_20, 0);
        } else {
            lv_obj_set_style_bg_opa(item, LV_OPA_TRANSP, 0);
        }
    }
}

static void update_value_label(int idx)
{
    if (idx == 0 && s_value_labels[0]) {
        char buf[16];
        snprintf(buf, sizeof(buf), "%d%%", S_SETTINGS[0].value);
        lv_label_set_text(s_value_labels[0], buf);
    }
}

void page_settings_enter(void)
{
    ESP_LOGI(TAG, "enter settings");
    s_scr = sk_screen_create();

    sk_header_create(s_scr, "Settings");

    // 设置项列表
    int y = SK_HEADER_H + 12;
    for (int i = 0; i < (int)SETTINGS_COUNT; i++) {
        lv_obj_t *row = lv_obj_create(s_scr);
        lv_obj_remove_flag(row, LV_OBJ_FLAG_SCROLLABLE);
        lv_obj_set_pos(row, 12, y + i * 50);
        lv_obj_set_size(row, SK_SCREEN_W - 24, 42);
        lv_obj_set_style_bg_color(row, lv_color_hex(SK_PANEL_BG), 0);
        lv_obj_set_style_bg_opa(row, LV_OPA_TRANSP, 0);
        lv_obj_set_style_border_color(row, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_border_width(row, 1, 0);
        lv_obj_set_style_border_opa(row, LV_OPA_30, 0);
        lv_obj_set_style_radius(row, 4, 0);
        lv_obj_set_style_pad_all(row, 4, 0);

        lv_obj_t *name = sk_label_create(row, S_SETTINGS[i].name,
                                         &SK_FONT_BODY, SK_TEXT);
        lv_obj_align(name, LV_ALIGN_LEFT_MID, 8, 0);

        // 值标签 (仅对有范围的项)
        if (S_SETTINGS[i].value_max > S_SETTINGS[i].value_min) {
            lv_obj_t *val = lv_label_create(row);
            char buf[16];
            snprintf(buf, sizeof(buf), "%d%%", S_SETTINGS[i].value);
            lv_label_set_text(val, buf);
            lv_obj_set_style_text_font(val, &SK_FONT_BODY, 0);
            lv_obj_set_style_text_color(val, lv_color_hex(SK_YELLOW), 0);
            lv_obj_align(val, LV_ALIGN_RIGHT_MID, -8, 0);
            s_value_labels[i] = val;
        } else {
            s_value_labels[i] = NULL;
        }

        s_items[i] = row;
    }

    sk_footer_create(s_scr, LV_SYMBOL_UP "/" LV_SYMBOL_DOWN ":Select  "
                                LV_SYMBOL_OK ":Adjust/Enter");

    update_selection();
    lv_screen_load(s_scr);
}

void page_settings_exit(void)
{
    s_scr = NULL;
    memset(s_items, 0, sizeof(s_items));
    memset(s_value_labels, 0, sizeof(s_value_labels));
    s_sel = 0;
}

void page_settings_key(bsp_btn_t btn, bsp_btn_ev_t ev)
{
    if (ev != BSP_BTN_CLICK) return;

    switch (btn) {
    case BSP_BTN_UP:
        if (s_sel == 0) {
            // 亮度减小
            S_SETTINGS[0].value -= 10;
            if (S_SETTINGS[0].value < S_SETTINGS[0].value_min)
                S_SETTINGS[0].value = S_SETTINGS[0].value_min;
            bsp_display_backlight(S_SETTINGS[0].value);
            update_value_label(0);
        } else {
            s_sel = (s_sel + SETTINGS_COUNT - 1) % SETTINGS_COUNT;
            update_selection();
        }
        break;

    case BSP_BTN_DOWN:
        if (s_sel == 0) {
            // 亮度增大
            S_SETTINGS[0].value += 10;
            if (S_SETTINGS[0].value > S_SETTINGS[0].value_max)
                S_SETTINGS[0].value = S_SETTINGS[0].value_max;
            bsp_display_backlight(S_SETTINGS[0].value);
            update_value_label(0);
        } else {
            s_sel = (s_sel + 1) % SETTINGS_COUNT;
            update_selection();
        }
        break;

    case BSP_BTN_OK:
        if (s_sel == 1) {
            // "Return to Standby" - 由 main.c 处理
            ESP_LOGI(TAG, "Return to standby requested");
        }
        break;
    }
}

// 返回是否请求返回待机
bool page_settings_wants_standby(void)
{
    return s_sel == 1;  // 简化判断
}
