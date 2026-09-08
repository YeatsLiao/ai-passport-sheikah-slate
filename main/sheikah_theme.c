// main/sheikah_theme.c -- 希卡石板主题样式实现
//
// 视觉规格来自 zelda-hyrule-ui 的 *.module.less:
//   - 深蓝石板底 + 烘焙扫描线/暗角 (img_slate_bg)
//   - 标题用 Hylia Serif + 两侧 tan 角饰 (ornament)
//   - 选中态 = 希卡蓝边框 + 辉光 shadow (运行时叠加, 不烘焙进图)
#include "sheikah_theme.h"
#include "img/img_all.h"

lv_obj_t *sk_screen_create(void)
{
    lv_obj_t *scr = lv_obj_create(NULL);
    lv_obj_remove_flag(scr, LV_OBJ_FLAG_SCROLLABLE);
    // 深蓝底 + 全屏背景图 (渐变/中心辉光/暗角/扫描线已烘焙进 RGB565 图)
    lv_obj_set_style_bg_color(scr, lv_color_hex(SK_BG), 0);
    lv_obj_set_style_bg_opa(scr, LV_OPA_COVER, 0);
    lv_obj_set_style_bg_image_src(scr, &img_slate_bg, 0);
    lv_obj_set_style_border_width(scr, 0, 0);
    lv_obj_set_style_pad_all(scr, 0, 0);
    lv_obj_set_style_radius(scr, 0, 0);
    return scr;
}

lv_obj_t *sk_header_create(lv_obj_t *parent, const char *title)
{
    lv_obj_t *hdr = lv_obj_create(parent);
    lv_obj_remove_flag(hdr, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_size(hdr, SK_SCREEN_W, SK_HEADER_H);
    lv_obj_set_pos(hdr, 0, 0);
    lv_obj_set_style_bg_color(hdr, lv_color_hex(SK_BLUE_DARK), 0);
    lv_obj_set_style_bg_opa(hdr, LV_OPA_30, 0);
    lv_obj_set_style_border_side(hdr, LV_BORDER_SIDE_BOTTOM, 0);
    lv_obj_set_style_border_color(hdr, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_border_width(hdr, 2, 0);
    lv_obj_set_style_border_opa(hdr, LV_OPA_60, 0);
    lv_obj_set_style_radius(hdr, 0, 0);
    lv_obj_set_style_pad_all(hdr, 0, 0);

    // 两侧 tan 角饰 (24x22)
    lv_obj_t *ol = lv_image_create(hdr);
    lv_image_set_src(ol, &img_ornament_left);
    lv_obj_align(ol, LV_ALIGN_LEFT_MID, 5, 0);

    lv_obj_t *orr = lv_image_create(hdr);
    lv_image_set_src(orr, &img_ornament_right);
    lv_obj_align(orr, LV_ALIGN_RIGHT_MID, -5, 0);

    // 标题 (Hylia Serif, 居中, 限宽避免压到角饰)
    lv_obj_t *lbl = lv_label_create(hdr);
    lv_label_set_text(lbl, title);
    lv_obj_set_style_text_font(lbl, &SK_FONT_LARGE, 0);
    lv_obj_set_style_text_color(lbl, lv_color_hex(SK_YELLOW), 0);
    lv_obj_set_width(lbl, SK_SCREEN_W - 72);
    lv_obj_set_style_text_align(lbl, LV_TEXT_ALIGN_CENTER, 0);
    lv_label_set_long_mode(lbl, LV_LABEL_LONG_DOT);
    lv_obj_center(lbl);
    return hdr;
}

lv_obj_t *sk_footer_create(lv_obj_t *parent, const char *hint)
{
    lv_obj_t *ftr = lv_obj_create(parent);
    lv_obj_remove_flag(ftr, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_size(ftr, SK_SCREEN_W, SK_FOOTER_H);
    lv_obj_set_pos(ftr, 0, SK_SCREEN_H - SK_FOOTER_H);
    lv_obj_set_style_bg_color(ftr, lv_color_hex(SK_BLACK), 0);
    lv_obj_set_style_bg_opa(ftr, LV_OPA_50, 0);
    lv_obj_set_style_border_side(ftr, LV_BORDER_SIDE_TOP, 0);
    lv_obj_set_style_border_color(ftr, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_border_width(ftr, 1, 0);
    lv_obj_set_style_border_opa(ftr, LV_OPA_40, 0);
    lv_obj_set_style_radius(ftr, 0, 0);
    lv_obj_set_style_pad_all(ftr, 0, 0);

    lv_obj_t *lbl = lv_label_create(ftr);
    lv_label_set_text(lbl, hint ? hint : "");
    lv_obj_set_style_text_font(lbl, &SK_FONT_CAPS, 0);
    lv_obj_set_style_text_color(lbl, lv_color_hex(SK_BLUE), 0);
    lv_obj_center(lbl);
    return ftr;
}

lv_obj_t *sk_panel_create(lv_obj_t *parent, int x, int y, int w, int h)
{
    lv_obj_t *p = lv_obj_create(parent);
    lv_obj_remove_flag(p, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_pos(p, x, y);
    lv_obj_set_size(p, w, h);
    lv_obj_set_style_bg_color(p, lv_color_hex(SK_PANEL_BG), 0);
    lv_obj_set_style_bg_opa(p, LV_OPA_90, 0);
    lv_obj_set_style_border_color(p, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_border_width(p, 2, 0);
    lv_obj_set_style_border_opa(p, LV_OPA_60, 0);
    lv_obj_set_style_radius(p, 4, 0);
    lv_obj_set_style_pad_all(p, 8, 0);
    return p;
}

void sk_set_selected(lv_obj_t *obj, bool selected)
{
    if (selected) {
        lv_obj_set_style_border_color(obj, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_border_width(obj, 3, 0);
        lv_obj_set_style_border_opa(obj, LV_OPA_COVER, 0);
        sk_glow(obj, SK_BLUE_GLOW, 12, LV_OPA_50);
    } else {
        lv_obj_set_style_border_color(obj, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_border_width(obj, 1, 0);
        lv_obj_set_style_border_opa(obj, LV_OPA_30, 0);
        sk_glow(obj, SK_BLUE_GLOW, 0, LV_OPA_TRANSP);
    }
}

lv_obj_t *sk_label_create(lv_obj_t *parent, const char *text,
                          const lv_font_t *font, uint32_t color)
{
    lv_obj_t *lbl = lv_label_create(parent);
    lv_label_set_text(lbl, text);
    lv_obj_set_style_text_font(lbl, font ? font : &SK_FONT_BODY, 0);
    lv_obj_set_style_text_color(lbl, lv_color_hex(color), 0);
    return lbl;
}

void sk_glow(lv_obj_t *obj, uint32_t color, int width, lv_opa_t opa)
{
    lv_obj_set_style_shadow_color(obj, lv_color_hex(color), 0);
    lv_obj_set_style_shadow_width(obj, width, 0);
    lv_obj_set_style_shadow_opa(obj, opa, 0);
    lv_obj_set_style_shadow_spread(obj, 0, 0);
}

void sk_corner_frame(lv_obj_t *parent, int w, int h)
{
    // img_corner = 锚定右下角的实心三角 (path M12 0 V12 H0 Z)。
    // 90° 倍数旋转像素精确无损, 把直角对齐到区域四角:
    //   TL=180  TR=90  BR=0  BL=270
    static const int rot[4] = { 180, 90, 0, 270 };
    static const int ax[4]  = { 0, 1, 1, 0 };  // 0=left, 1=right
    static const int ay[4]  = { 0, 0, 1, 1 };  // 0=top,  1=bottom
    for (int i = 0; i < 4; i++) {
        lv_obj_t *c = lv_image_create(parent);
        lv_image_set_src(c, &img_corner);
        lv_image_set_rotation(c, rot[i]);
        int x = ax[i] ? (w - 12) : 0;
        int y = ay[i] ? (h - 12) : 0;
        lv_obj_set_pos(c, x, y);
    }
}
