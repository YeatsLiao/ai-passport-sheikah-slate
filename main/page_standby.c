// main/page_standby.c -- 待机页: 希卡之眼 Logo
//
// 使用 img_sheikah_eye (120x120 RGB565) 真实图片资源。
// 图片由 tools/img_to_c.py 从 assets/images/sheikah_eye.png 转换而来。

#include "page_standby.h"
#include "sheikah_theme.h"
#include "bsp_display.h"
#include "img/img_all.h"
#include "esp_log.h"

static const char *TAG = "standby";

static lv_obj_t *s_scr;
static lv_obj_t *s_eye_img;

// 呼吸闪烁动画 (希卡蓝微亮)
static void breathe(void *obj, int32_t val)
{
    lv_obj_set_style_img_opa((lv_obj_t *)obj, (lv_opa_t)val, 0);
}

static void start_breathe(lv_obj_t *obj)
{
    lv_anim_t a;
    lv_anim_init(&a);
    lv_anim_set_var(&a, obj);
    lv_anim_set_exec_cb(&a, breathe);
    lv_anim_set_values(&a, LV_OPA_40, LV_OPA_COVER);
    lv_anim_set_duration(&a, 1500);
    lv_anim_set_playback_duration(&a, 1500);
    lv_anim_set_repeat_count(&a, LV_ANIM_REPEAT_INFINITE);
    lv_anim_set_path_cb(&a, lv_anim_path_ease_in_out);
    lv_anim_start(&a);
}

void page_standby_enter(void)
{
    ESP_LOGI(TAG, "enter standby");
    s_scr = sk_screen_create();
    lv_obj_set_style_bg_color(s_scr, lv_color_hex(SK_BLACK), 0);

    // 希卡之眼图片 (120x120, 居中偏上)
    s_eye_img = lv_image_create(s_scr);
    lv_image_set_src(s_eye_img, &img_sheikah_eye);
    lv_obj_align(s_eye_img, LV_ALIGN_CENTER, 0, -20);

    // 呼吸动画
    start_breathe(s_eye_img);

    // 底部提示
    lv_obj_t *hint = sk_label_create(s_scr, "Press OK to activate",
                                     &SK_FONT_SMALL, SK_TEXT_MUTED);
    lv_obj_align(hint, LV_ALIGN_BOTTOM_MID, 0, -16);

    // 提示文字呼吸
    lv_anim_t a;
    lv_anim_init(&a);
    lv_anim_set_var(&a, hint);
    lv_anim_set_exec_cb(&a, breathe);
    lv_anim_set_values(&a, LV_OPA_30, LV_OPA_80);
    lv_anim_set_duration(&a, 2000);
    lv_anim_set_playback_duration(&a, 2000);
    lv_anim_set_repeat_count(&a, LV_ANIM_REPEAT_INFINITE);
    lv_anim_set_path_cb(&a, lv_anim_path_ease_in_out);
    lv_anim_start(&a);

    lv_screen_load(s_scr);
}

void page_standby_exit(void)
{
    s_scr = NULL;
    s_eye_img = NULL;
}

void page_standby_key(bsp_btn_t btn, bsp_btn_ev_t ev)
{
    if (btn == BSP_BTN_OK && ev == BSP_BTN_CLICK) {
        ESP_LOGI(TAG, "OK -> activate runes");
    }
}
