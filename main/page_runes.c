// main/page_runes.c -- 符文选择器 (环形轮盘)
//
// 8 个符文沿圆环排列 (对齐 zelda-hyrule-ui quickSelectorScreen 规格):
//   - UP/DOWN 沿环逆/顺时针旋转选中
//   - 选中符文放大 (scale 256) + 全亮 + 辉光盘, 未选中缩小 (210) + 半暗
//   - 轮盘中心 hub 显示选中符文图标, 下方显示名称 (Hylia) + 描述
// 全部 8 个符文均有真实图标 (含 Compendium/Adventure Log/Settings)。

#include "page_runes.h"
#include "sheikah_theme.h"
#include "bsp_display.h"
#include "img/img_all.h"
#include "esp_log.h"
#include <math.h>
#include <string.h>

static const char *TAG = "runes";

#define PI 3.14159265358979323846

// ---- 符文定义 ----
typedef struct {
    const char *name;
    const char *desc;
    const lv_image_dsc_t *icon;
    int page_id;   // 子页面 ID (1=图鉴 2=冒险 3=设置 4=符文能力模拟, -1 = 无)
} rune_info_t;

static const rune_info_t RUNES[] = {
    { "REMOTE BOMBS",  "Create remote-detonated bombs",  &img_rune_bomb,       4 },
    { "MAGNESIS",      "Lift and move metal objects",    &img_rune_magnet,     4 },
    { "STASIS",        "Freeze objects in time",         &img_rune_stasis,     4 },
    { "CRYONIS",       "Create pillars of ice",          &img_rune_cryonis,    4 },
    { "CAMERA",        "Capture photos of Hyrule",       &img_rune_camera,     4 },
    { "COMPENDIUM",    "Encyclopedia of Hyrule",         &img_rune_compendium,  1 },
    { "ADVENTURE LOG", "Track quests and memories",      &img_rune_quest,       2 },
    { "SETTINGS",      "Brightness & system config",     &img_rune_settings,    3 },
};
#define RUNE_COUNT (sizeof(RUNES) / sizeof(RUNES[0]))

// ---- 轮盘几何 ----
#define WHEEL_CX    120
#define WHEEL_CY    116
#define WHEEL_R      70
#define ICON_HALF    28      // 图标原生 56x56 的一半
#define SCALE_SEL    256     // 选中: 100%
#define SCALE_UNSEL  210     // 未选中: ~82%
#define GLOW_HALF    38      // 辉光盘 76x76 的一半

static lv_obj_t *s_scr;
static lv_obj_t *s_icons[RUNE_COUNT];
static lv_obj_t *s_glow;       // 选中辉光盘
static lv_obj_t *s_hub_icon;   // 中心选中符文图标
static lv_obj_t *s_name;
static lv_obj_t *s_desc;
static int       s_sel = 0;
static int       s_pos[RUNE_COUNT][2];   // 预计算环上坐标

static void compute_positions(void)
{
    for (int i = 0; i < (int)RUNE_COUNT; i++) {
        double ang = (-90.0 + i * 45.0) * PI / 180.0;   // 符文 0 在正上方
        s_pos[i][0] = (int)(WHEEL_CX + WHEEL_R * cos(ang));
        s_pos[i][1] = (int)(WHEEL_CY + WHEEL_R * sin(ang));
    }
}

static void refresh_selection(void)
{
    for (int i = 0; i < (int)RUNE_COUNT; i++) {
        bool on = (i == s_sel);
        lv_image_set_scale(s_icons[i], on ? SCALE_SEL : SCALE_UNSEL);
        lv_obj_set_style_image_opa(s_icons[i], on ? LV_OPA_COVER : (lv_opa_t)130, 0);
    }
    // 辉光盘移到选中符文
    lv_obj_set_pos(s_glow, s_pos[s_sel][0] - GLOW_HALF, s_pos[s_sel][1] - GLOW_HALF);
    // 中心 hub 显示选中符文图标 + 名称/描述
    lv_image_set_src(s_hub_icon, RUNES[s_sel].icon);
    lv_label_set_text(s_name, RUNES[s_sel].name);
    lv_label_set_text(s_desc, RUNES[s_sel].desc);
}

void page_runes_enter(void)
{
    ESP_LOGI(TAG, "enter runes");
    s_scr = sk_screen_create();
    compute_positions();

    // 四角角饰
    sk_corner_frame(s_scr, SK_SCREEN_W, SK_SCREEN_H);

    // 选中辉光盘 (在图标之下, 无动画 -> 仅在换选时重定位)
    s_glow = lv_obj_create(s_scr);
    lv_obj_remove_flag(s_glow, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_size(s_glow, GLOW_HALF * 2, GLOW_HALF * 2);
    lv_obj_set_style_radius(s_glow, LV_RADIUS_CIRCLE, 0);
    lv_obj_set_style_bg_color(s_glow, lv_color_hex(SK_BLUE_GLOW), 0);
    lv_obj_set_style_bg_opa(s_glow, LV_OPA_30, 0);
    lv_obj_set_style_border_width(s_glow, 0, 0);
    lv_obj_set_style_pad_all(s_glow, 0, 0);

    // 8 个符文图标 (环上)
    for (int i = 0; i < (int)RUNE_COUNT; i++) {
        lv_obj_t *img = lv_image_create(s_scr);
        lv_image_set_src(img, RUNES[i].icon);
        lv_image_set_pivot(img, ICON_HALF, ICON_HALF);   // 绕中心缩放
        lv_obj_set_pos(img, s_pos[i][0] - ICON_HALF, s_pos[i][1] - ICON_HALF);
        s_icons[i] = img;
    }

    // 中心 hub: 圆环 + 选中符文图标
    lv_obj_t *hub = lv_obj_create(s_scr);
    lv_obj_remove_flag(hub, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_size(hub, 64, 64);
    lv_obj_set_pos(hub, WHEEL_CX - 32, WHEEL_CY - 32);
    lv_obj_set_style_radius(hub, LV_RADIUS_CIRCLE, 0);
    lv_obj_set_style_bg_color(hub, lv_color_hex(SK_PANEL_BG), 0);
    lv_obj_set_style_bg_opa(hub, LV_OPA_70, 0);
    lv_obj_set_style_border_color(hub, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_border_width(hub, 2, 0);
    lv_obj_set_style_border_opa(hub, LV_OPA_70, 0);
    lv_obj_set_style_pad_all(hub, 0, 0);

    s_hub_icon = lv_image_create(hub);
    lv_image_set_src(s_hub_icon, RUNES[s_sel].icon);
    lv_image_set_scale(s_hub_icon, 200);   // 56 -> ~44px, 适配 hub
    lv_image_set_pivot(s_hub_icon, ICON_HALF, ICON_HALF);
    lv_obj_center(s_hub_icon);

    // 符文名称 (Hylia Serif, 黄)
    s_name = lv_label_create(s_scr);
    lv_obj_set_style_text_font(s_name, &SK_FONT_LARGE, 0);
    lv_obj_set_style_text_color(s_name, lv_color_hex(SK_YELLOW), 0);
    lv_obj_set_width(s_name, SK_SCREEN_W - 24);
    lv_obj_set_style_text_align(s_name, LV_TEXT_ALIGN_CENTER, 0);
    lv_label_set_long_mode(s_name, LV_LABEL_LONG_DOT);
    lv_obj_align(s_name, LV_ALIGN_TOP_MID, 0, 222);

    // 符文描述 (Montserrat, 暖白, 换行)
    s_desc = lv_label_create(s_scr);
    lv_obj_set_style_text_font(s_desc, &SK_FONT_SMALL, 0);
    lv_obj_set_style_text_color(s_desc, lv_color_hex(SK_TEXT), 0);
    lv_obj_set_width(s_desc, SK_SCREEN_W - 32);
    lv_obj_set_style_text_align(s_desc, LV_TEXT_ALIGN_CENTER, 0);
    lv_label_set_long_mode(s_desc, LV_LABEL_LONG_WRAP);
    lv_obj_align(s_desc, LV_ALIGN_TOP_MID, 0, 250);

    // 底部提示
    sk_footer_create(s_scr, "UP/DN  ROTATE     OK  SELECT");

    refresh_selection();
    lv_screen_load(s_scr);
}

void page_runes_exit(void)
{
    // 无动画 (辉光静态), 直接删屏修复旧实现的屏幕泄漏
    if (s_scr) lv_obj_delete(s_scr);
    s_scr = NULL;
    memset(s_icons, 0, sizeof(s_icons));
    s_glow = s_hub_icon = s_name = s_desc = NULL;
}

int page_runes_get_selected_page(void)
{
    return RUNES[s_sel].page_id;
}

int page_runes_get_selected_rune(void)
{
    return s_sel;   // RUNES[] 下标 0-7, 0-4 为游戏符文
}

void page_runes_key(bsp_btn_t btn, bsp_btn_ev_t ev)
{
    if (ev != BSP_BTN_CLICK) return;

    switch (btn) {
    case BSP_BTN_UP:
        s_sel = (s_sel + RUNE_COUNT - 1) % RUNE_COUNT;   // 逆时针
        refresh_selection();
        break;
    case BSP_BTN_DOWN:
        s_sel = (s_sel + 1) % RUNE_COUNT;                // 顺时针
        refresh_selection();
        break;
    case BSP_BTN_OK:
        ESP_LOGI(TAG, "Select rune: %s (page=%d)", RUNES[s_sel].name, RUNES[s_sel].page_id);
        break;
    }
}
