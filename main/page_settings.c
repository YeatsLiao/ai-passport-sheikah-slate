// main/page_settings.c -- 设置页
//
// 亮度/音量/音效开关 + 关于 + 返回待机。

#include "page_settings.h"
#include "sheikah_theme.h"
#include "sheikah_ui.h"
#include "bsp_display.h"
#include "audio/sfx.h"
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
    { "BRIGHTNESS",      10, 100, 100 },   // 0: 亮度
    { "VOLUME",          0,  100, 80  },   // 1: 音量
    { "SOUND FX",        0,  1,   1   },   // 2: 音效开关 (0=OFF, 1=ON)
    { "ABOUT",           0,  0,   0   },   // 3: 关于
    { "RETURN TO STANDBY", 0, 0,  0   },   // 4: 返回待机
};
#define SETTINGS_COUNT (sizeof(S_SETTINGS) / sizeof(S_SETTINGS[0]))

static lv_obj_t *s_scr;
static lv_obj_t *s_items[SETTINGS_COUNT];
static lv_obj_t *s_value_labels[SETTINGS_COUNT];
static lv_obj_t *s_footer;
static int       s_sel = 0;
static bool      s_editing = false;   // 编辑模式: UP/DOWN 调值, OK 确认退出

static void update_footer(void)
{
    if (s_footer) {
        lv_obj_t *lbl = lv_obj_get_child(s_footer, 0);
        if (lbl) {
            lv_label_set_text(lbl, s_editing ? "UP/DN ADJUST   OK DONE"
                                             : "UP/DN MOVE   OK ADJUST");
        }
    }
}

static void update_selection(void)
{
    for (int i = 0; i < (int)SETTINGS_COUNT; i++) {
        lv_obj_t *item = s_items[i];
        bool on = (i == s_sel);
        lv_obj_set_style_bg_color(item, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_bg_opa(item, on ? LV_OPA_20 : LV_OPA_TRANSP, 0);
        lv_obj_set_style_border_color(item,
            lv_color_hex((on && s_editing) ? SK_YELLOW : SK_BLUE), 0);
        lv_obj_set_style_border_width(item, on ? 2 : 1, 0);
        lv_obj_set_style_border_opa(item, on ? LV_OPA_COVER : LV_OPA_30, 0);
        if (on) sk_glow(item, (on && s_editing) ? SK_YELLOW : SK_BLUE_GLOW, 10, LV_OPA_40);
        else    sk_glow(item, SK_BLUE_GLOW, 0, LV_OPA_TRANSP);
    }
    update_footer();
}

static void update_value_label(int idx)
{
    if (!s_value_labels[idx]) return;
    char buf[16];
    switch (idx) {
    case 0:  // BRIGHTNESS
        snprintf(buf, sizeof(buf), "%d%%", S_SETTINGS[0].value);
        break;
    case 1:  // VOLUME
        snprintf(buf, sizeof(buf), "%d%%", S_SETTINGS[1].value);
        break;
    case 2:  // SOUND FX
        snprintf(buf, sizeof(buf), "%s", S_SETTINGS[2].value ? "ON" : "OFF");
        break;
    default:
        return;
    }
    lv_label_set_text(s_value_labels[idx], buf);
}

void page_settings_enter(void)
{
    ESP_LOGI(TAG, "enter settings");
    s_scr = sk_screen_create();

    sk_header_create(s_scr, "SETTINGS");

    // 设置项列表
    int y = SK_HEADER_H + 12;
    for (int i = 0; i < (int)SETTINGS_COUNT; i++) {
        lv_obj_t *row = lv_obj_create(s_scr);
        lv_obj_remove_flag(row, LV_OBJ_FLAG_SCROLLABLE);
        lv_obj_set_pos(row, 12, y + i * 46);   // 46px 间距, 5 行不压页脚
        lv_obj_set_size(row, SK_SCREEN_W - 24, 42);
        lv_obj_set_style_bg_color(row, lv_color_hex(SK_PANEL_BG), 0);
        lv_obj_set_style_bg_opa(row, LV_OPA_TRANSP, 0);
        lv_obj_set_style_border_color(row, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_border_width(row, 1, 0);
        lv_obj_set_style_border_opa(row, LV_OPA_30, 0);
        lv_obj_set_style_radius(row, 4, 0);
        lv_obj_set_style_pad_all(row, 4, 0);

        lv_obj_t *name = sk_label_create(row, S_SETTINGS[i].name,
                                         &SK_FONT_CAPS, SK_TEXT);
        lv_obj_align(name, LV_ALIGN_LEFT_MID, 8, 0);

        // 值标签 (仅对有范围的项)
        if (S_SETTINGS[i].value_max > S_SETTINGS[i].value_min) {
            lv_obj_t *val = lv_label_create(row);
            char buf[16];
            snprintf(buf, sizeof(buf), "%d%%", S_SETTINGS[i].value);
            lv_label_set_text(val, buf);
            lv_obj_set_style_text_font(val, &SK_FONT_CAPS, 0);
            lv_obj_set_style_text_color(val, lv_color_hex(SK_YELLOW), 0);
            lv_obj_align(val, LV_ALIGN_RIGHT_MID, -8, 0);
            s_value_labels[i] = val;
        } else {
            s_value_labels[i] = NULL;
        }

        s_items[i] = row;
    }

    // 初始值文本 (SFX 项显示 ON/OFF 而非百分比)
    for (int i = 0; i < 3; i++) update_value_label(i);

    s_footer = sk_footer_create(s_scr, "UP/DN MOVE   OK ADJUST");

    update_selection();
    lv_screen_load(s_scr);
}

void page_settings_exit(void)
{
    sk_popup_close();               // 防止跨页残留悬空 popup 指针
    if (s_scr) lv_obj_delete(s_scr);   // 删屏修复旧实现的屏幕泄漏
    s_scr = NULL;
    memset(s_items, 0, sizeof(s_items));
    memset(s_value_labels, 0, sizeof(s_value_labels));
    s_footer = NULL;
    s_sel = 0;
    s_editing = false;
}

// 应用一个可调项的修改 (亮度/音量/音效开关)
static void apply_setting(int idx)
{
    int v = S_SETTINGS[idx].value;
    switch (idx) {
    case 0: bsp_display_backlight(v);   break;
    case 1: sfx_set_volume(v);          break;
    case 2: sfx_set_enabled(v != 0);    break;
    default: break;
    }
    update_value_label(idx);
}

// 调整当前可调项 (dir=+1/-1); SFX 项切换开关
static void adjust_current(int dir)
{
    int *v = &S_SETTINGS[s_sel].value;
    if (s_sel == 2) {
        *v = !(*v);   // SFX 开关切换
    } else {
        *v += dir * 10;
        if (*v < S_SETTINGS[s_sel].value_min) *v = S_SETTINGS[s_sel].value_min;
        if (*v > S_SETTINGS[s_sel].value_max) *v = S_SETTINGS[s_sel].value_max;
    }
    apply_setting(s_sel);
}

void page_settings_key(bsp_btn_t btn, bsp_btn_ev_t ev)
{
    // 弹窗打开时: 任意键先关弹窗 (与图鉴/冒险记录行为一致)
    if (sk_popup_is_open()) {
        sk_popup_close();
        return;
    }

    // 长按 UP/DOWN: 快速调值 (编辑模式外的便捷入口)
    if (ev == BSP_BTN_LONG && btn != BSP_BTN_OK && s_sel <= 2) {
        adjust_current(btn == BSP_BTN_UP ? -1 : 1);
        return;
    }

    if (ev != BSP_BTN_CLICK) return;

    switch (btn) {
    case BSP_BTN_UP:
        if (s_editing && s_sel <= 2) {
            adjust_current(-1);                    // 编辑中: 调值
        } else {
            s_sel = (s_sel + SETTINGS_COUNT - 1) % SETTINGS_COUNT;
            update_selection();
        }
        break;

    case BSP_BTN_DOWN:
        if (s_editing && s_sel <= 2) {
            adjust_current(1);                     // 编辑中: 调值
        } else {
            s_sel = (s_sel + 1) % SETTINGS_COUNT;
            update_selection();
        }
        break;

    case BSP_BTN_OK:
        if (s_sel <= 2) {
            s_editing = !s_editing;                // 进入/退出编辑模式
            update_selection();
        } else if (s_sel == 3) {
            // ABOUT
            sk_popup_show(s_scr, "SHEIKAH SLATE",
                          "Firmware v1.0\n"
                          "ESP32-C3 + ST7789P3\n"
                          "LVGL 9 + ESP-IDF 5.5\n\n"
                          "BotW Sheikah Slate\n"
                          "Replica Edition");
        }
        // s_sel == 4 (RETURN TO STANDBY) 由 main.c 的 wants_standby() 处理
        break;
    }
}

// 返回是否请求返回待机
bool page_settings_wants_standby(void)
{
    return s_sel == 4;  // RETURN TO STANDBY
}
