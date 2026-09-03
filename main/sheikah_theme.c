// main/sheikah_theme.c -- 希卡石板主题样式实现
#include "sheikah_theme.h"

lv_obj_t *sk_screen_create(void)
{
    lv_obj_t *scr = lv_obj_create(NULL);
    lv_obj_remove_flag(scr, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_bg_color(scr, lv_color_hex(SK_PANEL_BG), 0);
    lv_obj_set_style_border_width(scr, 0, 0);
    lv_obj_set_style_pad_all(scr, 0, 0);
    return scr;
}

lv_obj_t *sk_header_create(lv_obj_t *parent, const char *title)
{
    lv_obj_t *hdr = lv_obj_create(parent);
    lv_obj_remove_flag(hdr, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_size(hdr, SK_SCREEN_W, SK_HEADER_H);
    lv_obj_set_pos(hdr, 0, 0);
    lv_obj_set_style_bg_color(hdr, lv_color_hex(SK_BLUE_DARK), 0);
    lv_obj_set_style_bg_opa(hdr, LV_OPA_60, 0);
    lv_obj_set_style_border_width(hdr, 0, 0);
    lv_obj_set_style_border_side(hdr, LV_BORDER_SIDE_BOTTOM, 0);
    lv_obj_set_style_border_color(hdr, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_border_width(hdr, 2, 0);
    lv_obj_set_style_border_opa(hdr, LV_OPA_70, 0);
    lv_obj_set_style_pad_all(hdr, 0, 0);
    lv_obj_set_style_radius(hdr, 0, 0);

    lv_obj_t *lbl = lv_label_create(hdr);
    lv_label_set_text(lbl, title);
    lv_obj_set_style_text_font(lbl, &SK_FONT_LARGE, 0);
    lv_obj_set_style_text_color(lbl, lv_color_hex(SK_BLUE), 0);
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
    lv_obj_set_style_border_width(ftr, 0, 0);
    lv_obj_set_style_border_side(ftr, LV_BORDER_SIDE_TOP, 0);
    lv_obj_set_style_border_color(ftr, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_border_width(ftr, 1, 0);
    lv_obj_set_style_border_opa(ftr, LV_OPA_40, 0);
    lv_obj_set_style_pad_all(ftr, 0, 0);
    lv_obj_set_style_radius(ftr, 0, 0);

    lv_obj_t *lbl = lv_label_create(ftr);
    lv_label_set_text(lbl, hint ? hint : "");
    lv_obj_set_style_text_font(lbl, &SK_FONT_SMALL, 0);
    lv_obj_set_style_text_color(lbl, lv_color_hex(SK_TEXT_MUTED), 0);
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
    lv_obj_set_style_border_color(p, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_border_width(p, 2, 0);
    lv_obj_set_style_border_opa(p, LV_OPA_50, 0);
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
        lv_obj_set_style_shadow_width(obj, 8, 0);
        lv_obj_set_style_shadow_color(obj, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_shadow_opa(obj, LV_OPA_30, 0);
    } else {
        lv_obj_set_style_border_color(obj, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_border_width(obj, 2, 0);
        lv_obj_set_style_border_opa(obj, LV_OPA_50, 0);
        lv_obj_set_style_shadow_width(obj, 0, 0);
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
