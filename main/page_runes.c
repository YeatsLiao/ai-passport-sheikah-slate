// main/page_runes.c -- 符文选择器 (主菜单)
//
// 8 个符文 (含 Settings) 水平轮转, 选中项放大 + 希卡蓝发光。
// 使用真实 48x48 RGB565 图片资源。

#include "page_runes.h"
#include "sheikah_theme.h"
#include "sheikah_ui.h"
#include "bsp_display.h"
#include "img/img_all.h"
#include "esp_log.h"
#include <string.h>

static const char *TAG = "runes";

// ---- 符文定义 ----
typedef struct {
    const char *name;
    const char *desc;
    const lv_image_dsc_t *icon;  // 图片资源 (NULL = 用文字缩写)
    int         page_id;         // 对应的子页面 ID (-1 = 无)
} rune_info_t;

static const rune_info_t RUNES[] = {
    { "Remote Bombs",     "Create remote-detonated bombs",      &img_rune_bomb,    -1 },
    { "Magnesis",         "Lift and move metal objects",        &img_rune_magnet,  -1 },
    { "Stasis",           "Freeze objects in time",             &img_rune_stasis,  -1 },
    { "Cryonis",          "Create pillars of ice",              &img_rune_cryonis, -1 },
    { "Camera",           "Capture photos of Hyrule",           &img_rune_camera,  -1 },
    { "Hyrule Compendium","Encyclopedia of Hyrule",             NULL,               1 },
    { "Adventure Log",    "Track your quests and memories",     NULL,               2 },
    { "Settings",         "Brightness, sleep & system config",  NULL,               3 },
};
#define RUNE_COUNT  (sizeof(RUNES) / sizeof(RUNES[0]))

// 无图片的符文用文字缩写
static const char *RUNE_LABELS[] = {
    NULL, NULL, NULL, NULL, NULL,
    "Cmp", "Log", "Set",
};

static lv_obj_t *s_scr;
static lv_obj_t *s_rune_slots[RUNE_COUNT];  // 图标/标签容器
static lv_obj_t *s_name_label;
static lv_obj_t *s_desc_label;
static int       s_sel = 0;

// 刷新选中态
static void refresh_selection(void)
{
    for (int i = 0; i < (int)RUNE_COUNT; i++) {
        lv_obj_t *slot = s_rune_slots[i];
        lv_obj_t *child = lv_obj_get_child(slot, 0);  // 图标或标签

        if (i == s_sel) {
            lv_obj_set_size(slot, 56, 56);
            lv_obj_set_style_bg_color(slot, lv_color_hex(SK_BLUE), 0);
            lv_obj_set_style_bg_opa(slot, LV_OPA_20, 0);
            lv_obj_set_style_border_color(slot, lv_color_hex(SK_BLUE), 0);
            lv_obj_set_style_border_width(slot, 3, 0);
            lv_obj_set_style_border_opa(slot, LV_OPA_COVER, 0);
            lv_obj_set_style_shadow_width(slot, 12, 0);
            lv_obj_set_style_shadow_color(slot, lv_color_hex(SK_BLUE), 0);
            lv_obj_set_style_shadow_opa(slot, LV_OPA_40, 0);
            if (child) {
                lv_obj_set_style_text_color(child, lv_color_hex(SK_BLUE), 0);
            }
        } else {
            lv_obj_set_size(slot, 44, 44);
            lv_obj_set_style_bg_opa(slot, LV_OPA_TRANSP, 0);
            lv_obj_set_style_border_color(slot, lv_color_hex(SK_BLUE), 0);
            lv_obj_set_style_border_width(slot, 1, 0);
            lv_obj_set_style_border_opa(slot, LV_OPA_30, 0);
            lv_obj_set_style_shadow_width(slot, 0, 0);
            if (child) {
                lv_obj_set_style_text_color(child, lv_color_hex(SK_TEXT_MUTED), 0);
            }
        }
    }

    lv_label_set_text(s_name_label, RUNES[s_sel].name);
    lv_label_set_text(s_desc_label, RUNES[s_sel].desc);
}

void page_runes_enter(void)
{
    ESP_LOGI(TAG, "enter runes");
    s_scr = sk_screen_create();

    // 标题
    sk_header_create(s_scr, "Sheikah Slate");

    // 符文图标行 (居中, 两行 4+4)
    int icon_size = 44;
    int gap = 10;
    int cols = 4;
    int rows = 2;
    int total_w = cols * icon_size + (cols - 1) * gap;
    int start_x = (SK_SCREEN_W - total_w) / 2;
    int row_h = icon_size + gap;
    int start_y = 75;

    for (int i = 0; i < (int)RUNE_COUNT; i++) {
        int col = i % cols;
        int row = i / cols;
        int x = start_x + col * (icon_size + gap);
        int y = start_y + row * row_h;

        lv_obj_t *slot = lv_obj_create(s_scr);
        lv_obj_remove_flag(slot, LV_OBJ_FLAG_SCROLLABLE);
        lv_obj_set_pos(slot, x, y);
        lv_obj_set_size(slot, icon_size, icon_size);
        lv_obj_set_style_radius(slot, 8, 0);
        lv_obj_set_style_bg_color(slot, lv_color_hex(SK_PANEL_BG), 0);
        lv_obj_set_style_bg_opa(slot, LV_OPA_TRANSP, 0);
        lv_obj_set_style_border_width(slot, 1, 0);
        lv_obj_set_style_border_opa(slot, LV_OPA_30, 0);
        lv_obj_set_style_border_color(slot, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_pad_all(slot, 0, 0);

        if (RUNES[i].icon) {
            // 真实图片
            lv_obj_t *img = lv_image_create(slot);
            lv_image_set_src(img, RUNES[i].icon);
            lv_obj_center(img);
        } else if (RUNE_LABELS[i]) {
            // 文字缩写
            lv_obj_t *lbl = lv_label_create(slot);
            lv_label_set_text(lbl, RUNE_LABELS[i]);
            lv_obj_set_style_text_font(lbl, &SK_FONT_LARGE, 0);
            lv_obj_center(lbl);
        }

        s_rune_slots[i] = slot;
    }

    // 分隔装饰线
    int line_y = start_y + rows * row_h + 4;
    lv_obj_t *line = lv_obj_create(s_scr);
    lv_obj_set_size(line, 180, 2);
    lv_obj_set_pos(line, 30, line_y);
    lv_obj_set_style_bg_color(line, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_bg_opa(line, LV_OPA_30, 0);
    lv_obj_set_style_border_width(line, 0, 0);
    lv_obj_set_style_radius(line, 1, 0);

    // 符文名称
    s_name_label = lv_label_create(s_scr);
    lv_label_set_text(s_name_label, RUNES[s_sel].name);
    lv_obj_set_style_text_font(s_name_label, &SK_FONT_LARGE, 0);
    lv_obj_set_style_text_color(s_name_label, lv_color_hex(SK_YELLOW), 0);
    lv_obj_set_width(s_name_label, 220);
    lv_obj_set_style_text_align(s_name_label, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_align(s_name_label, LV_ALIGN_CENTER, 0, 50);

    // 符文描述
    s_desc_label = lv_label_create(s_scr);
    lv_label_set_text(s_desc_label, RUNES[s_sel].desc);
    lv_obj_set_style_text_font(s_desc_label, &SK_FONT_SMALL, 0);
    lv_obj_set_style_text_color(s_desc_label, lv_color_hex(SK_TEXT), 0);
    lv_obj_set_width(s_desc_label, 200);
    lv_obj_set_style_text_align(s_desc_label, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_align(s_desc_label, LV_ALIGN_CENTER, 0, 80);
    lv_label_set_long_mode(s_desc_label, LV_LABEL_LONG_WRAP);

    // 底部提示
    sk_footer_create(s_scr, "UP/DN:Select  OK:Enter");

    refresh_selection();
    lv_screen_load(s_scr);
}

void page_runes_exit(void)
{
    s_scr = NULL;
    memset(s_rune_slots, 0, sizeof(s_rune_slots));
    s_name_label = NULL;
    s_desc_label = NULL;
}

int page_runes_get_selected_page(void)
{
    return RUNES[s_sel].page_id;
}

void page_runes_key(bsp_btn_t btn, bsp_btn_ev_t ev)
{
    if (ev != BSP_BTN_CLICK) return;

    switch (btn) {
    case BSP_BTN_UP:
        s_sel = (s_sel + RUNE_COUNT - 1) % RUNE_COUNT;
        refresh_selection();
        break;
    case BSP_BTN_DOWN:
        s_sel = (s_sel + 1) % RUNE_COUNT;
        refresh_selection();
        break;
    case BSP_BTN_OK:
        ESP_LOGI(TAG, "Select rune: %s (page=%d)", RUNES[s_sel].name, RUNES[s_sel].page_id);
        break;
    }
}
