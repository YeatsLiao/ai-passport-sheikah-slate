// main/page_standby.c -- 待机页: 希卡之眼启动画面
//
// 石板深蓝背景 (烘焙扫描线/暗角) + 四角角饰 + 希卡之眼辉光呼吸。
// 辉光用【纯色半透明圆盘 + bg_opa 呼吸】实现, 不用 LVGL shadow:
// C3 无 PSRAM, 软件阴影模糊每帧重算代价高; 圆盘填充 + 图片混合仅重绘
// ~164x164 区域, 约 3ms/帧, 呼吸动画流畅且不饿死其他任务。

#include "page_standby.h"
#include "sheikah_theme.h"
#include "bsp_display.h"
#include "img/img_all.h"
#include "esp_log.h"

static const char *TAG = "standby";

static lv_obj_t *s_scr;
static lv_obj_t *s_glow;   // 辉光圆盘
static lv_obj_t *s_eye;    // 希卡之眼图片
static lv_obj_t *s_hint;   // 底部提示
static lv_obj_t *s_boot_text;  // 启动序列文字
static bool s_first_boot = true;  // 首次启动标志

// ---- 动画执行回调 (只改样式 opa, 廉价) ----
static void anim_bg_opa(void *o, int32_t v)    { lv_obj_set_style_bg_opa((lv_obj_t *)o, (lv_opa_t)v, 0); }
static void anim_img_opa(void *o, int32_t v)   { lv_obj_set_style_image_opa((lv_obj_t *)o, (lv_opa_t)v, 0); }
static void anim_text_opa(void *o, int32_t v)  { lv_obj_set_style_text_opa((lv_obj_t *)o, (lv_opa_t)v, 0); }

// 前向声明
static void start_breathe(lv_obj_t *var, lv_anim_exec_xcb_t cb,
                          int32_t lo, int32_t hi, uint32_t dur);

// 启动序列完成后: 删除启动文字, 开始呼吸动画
static void boot_done_cb(lv_anim_t *a)
{
    (void)a;
    if (s_boot_text) {
        lv_obj_delete(s_boot_text);
        s_boot_text = NULL;
    }
    // 开始呼吸动画
    start_breathe(s_glow, anim_bg_opa,   LV_OPA_10, LV_OPA_40,     2200);
    start_breathe(s_eye,  anim_img_opa,  205,       255,          2200);
    start_breathe(s_hint, anim_text_opa, LV_OPA_40, LV_OPA_COVER,  1600);
    s_first_boot = false;
}

static void start_breathe(lv_obj_t *var, lv_anim_exec_xcb_t cb,
                          int32_t lo, int32_t hi, uint32_t dur)
{
    lv_anim_t a;
    lv_anim_init(&a);
    lv_anim_set_var(&a, var);
    lv_anim_set_exec_cb(&a, cb);
    lv_anim_set_values(&a, lo, hi);
    lv_anim_set_duration(&a, dur);
    lv_anim_set_playback_duration(&a, dur);
    lv_anim_set_repeat_count(&a, LV_ANIM_REPEAT_INFINITE);
    lv_anim_set_path_cb(&a, lv_anim_path_ease_in_out);
    lv_anim_start(&a);
}

void page_standby_enter(void)
{
    ESP_LOGI(TAG, "enter standby");
    s_scr = sk_screen_create();   // 已含全屏石板背景图

    // 四角括号角饰
    sk_corner_frame(s_scr, SK_SCREEN_W, SK_SCREEN_H);

    // 扫描线侧边装饰 (CRT 质感, 半透明)
    lv_obj_t *scan_l = lv_image_create(s_scr);
    lv_image_set_src(scan_l, &img_scanline_side);
    lv_obj_set_pos(scan_l, 2, 70);
    lv_obj_set_style_image_opa(scan_l, LV_OPA_20, 0);
    lv_obj_t *scan_r = lv_image_create(s_scr);
    lv_image_set_src(scan_r, &img_scanline_side);
    lv_obj_set_pos(scan_r, SK_SCREEN_W - 12, 70);
    lv_obj_set_style_image_opa(scan_r, LV_OPA_20, 0);

    // 标题 (Hylia Serif, 大写)
    lv_obj_t *title = sk_label_create(s_scr, "SHEIKAH SLATE", &SK_FONT_LARGE, SK_YELLOW);
    lv_obj_set_style_text_align(title, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_align(title, LV_ALIGN_TOP_MID, 0, 42);

    // 辉光圆盘 (透明底 + 蓝色半透明填充)
    s_glow = lv_obj_create(s_scr);
    lv_obj_remove_flag(s_glow, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_size(s_glow, 164, 164);
    lv_obj_set_style_radius(s_glow, LV_RADIUS_CIRCLE, 0);
    lv_obj_set_style_bg_color(s_glow, lv_color_hex(SK_BLUE_GLOW), 0);
    lv_obj_set_style_bg_opa(s_glow, LV_OPA_20, 0);
    lv_obj_set_style_border_width(s_glow, 0, 0);
    lv_obj_set_style_pad_all(s_glow, 0, 0);
    lv_obj_align(s_glow, LV_ALIGN_CENTER, 0, -2);

    // 希卡之眼图片 (150x150, 居中)
    s_eye = lv_image_create(s_scr);
    lv_image_set_src(s_eye, &img_sheikah_eye);
    lv_obj_align(s_eye, LV_ALIGN_CENTER, 0, -2);

    // 底部提示 (Hylia caps)
    s_hint = sk_label_create(s_scr, "PRESS OK", &SK_FONT_CAPS, SK_BLUE);
    lv_obj_set_style_text_align(s_hint, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_align(s_hint, LV_ALIGN_BOTTOM_MID, 0, -48);

    if (s_first_boot) {
        s_first_boot = false;   // 无论本次是否播完, 上电只播一次
        // 首次启动序列: "INITIALIZING..." 文字渐入 → 眼睛渐入 → 文字渐出 → 开始呼吸
        s_boot_text = sk_label_create(s_scr, "INITIALIZING...", &SK_FONT_CAPS, SK_RUNE_CYAN);
        lv_obj_set_style_text_align(s_boot_text, LV_TEXT_ALIGN_CENTER, 0);
        lv_obj_align(s_boot_text, LV_ALIGN_BOTTOM_MID, 0, -80);

        // 初始状态: 眼睛透明, 提示透明
        lv_obj_set_style_image_opa(s_eye, LV_OPA_TRANSP, 0);
        lv_obj_set_style_text_opa(s_hint, LV_OPA_TRANSP, 0);
        lv_obj_set_style_bg_opa(s_glow, LV_OPA_TRANSP, 0);

        // 启动文字渐入 (0 -> 255, 600ms)
        lv_anim_t a;
        lv_anim_init(&a);
        lv_anim_set_var(&a, s_boot_text);
        lv_anim_set_exec_cb(&a, anim_text_opa);
        lv_anim_set_values(&a, 0, LV_OPA_COVER);
        lv_anim_set_duration(&a, 600);
        lv_anim_set_delay(&a, 300);  // 稍等片刻再开始
        lv_anim_start(&a);

        // 眼睛渐入 (0 -> 255, 800ms, 延迟 900ms)
        lv_anim_init(&a);
        lv_anim_set_var(&a, s_eye);
        lv_anim_set_exec_cb(&a, anim_img_opa);
        lv_anim_set_values(&a, 0, 255);
        lv_anim_set_duration(&a, 800);
        lv_anim_set_delay(&a, 900);
        lv_anim_start(&a);

        // 辉光渐入 (0 -> 20, 800ms, 延迟 900ms)
        lv_anim_init(&a);
        lv_anim_set_var(&a, s_glow);
        lv_anim_set_exec_cb(&a, anim_bg_opa);
        lv_anim_set_values(&a, 0, LV_OPA_20);
        lv_anim_set_duration(&a, 800);
        lv_anim_set_delay(&a, 900);
        lv_anim_start(&a);

        // 启动文字渐出 (255 -> 0, 400ms, 延迟 1800ms); 完成后由 boot_done_cb 接管呼吸
        lv_anim_init(&a);
        lv_anim_set_var(&a, s_boot_text);
        lv_anim_set_exec_cb(&a, anim_text_opa);
        lv_anim_set_values(&a, LV_OPA_COVER, 0);
        lv_anim_set_duration(&a, 400);
        lv_anim_set_delay(&a, 1800);
        lv_anim_set_completed_cb(&a, boot_done_cb);
        lv_anim_start(&a);
    } else {
        // 非首次: 直接开始呼吸动画
        start_breathe(s_glow, anim_bg_opa,   LV_OPA_10, LV_OPA_40,     2200);
        start_breathe(s_eye,  anim_img_opa,  205,       255,          2200);
        start_breathe(s_hint, anim_text_opa, LV_OPA_40, LV_OPA_COVER,  1600);
    }

    lv_screen_load(s_scr);
}

void page_standby_exit(void)
{
    // ★ 删屏前必须停掉作用于其对象的所有动画, 否则动画回调会访问已释放内存 → 崩溃。
    if (s_glow) lv_anim_delete(s_glow, NULL);
    if (s_eye)  lv_anim_delete(s_eye, NULL);
    if (s_hint) lv_anim_delete(s_hint, NULL);
    if (s_boot_text) lv_anim_delete(s_boot_text, NULL);
    if (s_scr)  lv_obj_delete(s_scr);
    s_scr = s_glow = s_eye = s_hint = s_boot_text = NULL;
}

void page_standby_key(bsp_btn_t btn, bsp_btn_ev_t ev)
{
    if (btn == BSP_BTN_OK && ev == BSP_BTN_CLICK) {
        ESP_LOGI(TAG, "OK -> activate runes");
    }
}
