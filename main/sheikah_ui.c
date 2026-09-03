// main/sheikah_ui.c -- 希卡石板通用 UI 组件实现
#include "sheikah_ui.h"
#include "sheikah_theme.h"
#include <string.h>

// ---- 列表 ----

lv_obj_t *sk_list_create(lv_obj_t *parent, int x, int y, int w, int h)
{
    lv_obj_t *list = lv_list_create(parent);
    lv_obj_set_pos(list, x, y);
    lv_obj_set_size(list, w, h);
    lv_obj_set_style_bg_color(list, lv_color_hex(SK_PANEL_BG), 0);
    lv_obj_set_style_border_color(list, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_border_width(list, 1, 0);
    lv_obj_set_style_border_opa(list, LV_OPA_30, 0);
    lv_obj_set_style_radius(list, 4, 0);
    lv_obj_set_style_pad_all(list, 2, 0);

    // 自定义滚动条 (LVGL 9: 用 LV_PART_SCROLLBAR 选择器)
    lv_obj_set_style_bg_color(list, lv_color_hex(SK_BLUE), LV_PART_SCROLLBAR);
    lv_obj_set_style_bg_opa(list, LV_OPA_50, LV_PART_SCROLLBAR);
    lv_obj_set_style_width(list, 3, LV_PART_SCROLLBAR);
    return list;
}

lv_obj_t *sk_list_add_item(lv_obj_t *list, const char *title, const char *subtitle)
{
    lv_obj_t *btn = lv_list_add_button(list, NULL, title);
    lv_obj_set_style_bg_color(btn, lv_color_hex(SK_PANEL_BG), 0);
    lv_obj_set_style_bg_opa(btn, LV_OPA_TRANSP, 0);
    lv_obj_set_style_text_color(btn, lv_color_hex(SK_TEXT), 0);
    lv_obj_set_style_text_font(btn, &SK_FONT_BODY, 0);
    lv_obj_set_style_border_color(btn, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_border_width(btn, 0, 0);
    lv_obj_set_style_border_side(btn, LV_BORDER_SIDE_BOTTOM, 0);
    lv_obj_set_style_border_opa(btn, LV_OPA_20, 0);
    lv_obj_set_style_pad_ver(btn, 6, 0);
    lv_obj_set_style_radius(btn, 0, 0);

    // LVGL 9 list button 内部有 label, 用 lv_obj_get_child 取到它来加副标题
    if (subtitle && subtitle[0]) {
        lv_obj_t *sub = lv_label_create(btn);
        lv_label_set_text(sub, subtitle);
        lv_obj_set_style_text_font(sub, &SK_FONT_SMALL, 0);
        lv_obj_set_style_text_color(sub, lv_color_hex(SK_TEXT_MUTED), 0);
        lv_obj_set_width(sub, lv_pct(100));
        lv_label_set_long_mode(sub, LV_LABEL_LONG_DOT);
    }
    return btn;
}

// ---- 分类标签栏 ----

static lv_obj_t **s_tab_btns = NULL;
static int s_tab_count = 0;

lv_obj_t *sk_tabs_create(lv_obj_t *parent, int y, const char **labels, int count,
                         int *selected_out)
{
    lv_obj_t *cont = lv_obj_create(parent);
    lv_obj_remove_flag(cont, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_pos(cont, 0, y);
    lv_obj_set_size(cont, SK_SCREEN_W, 32);
    lv_obj_set_style_bg_opa(cont, LV_OPA_TRANSP, 0);
    lv_obj_set_style_border_width(cont, 0, 0);
    lv_obj_set_style_pad_all(cont, 0, 0);
    lv_obj_set_flex_flow(cont, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(cont, LV_FLEX_ALIGN_SPACE_EVENLY, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);

    if (s_tab_btns) lv_free(s_tab_btns);
    s_tab_btns = lv_malloc(sizeof(lv_obj_t *) * count);
    s_tab_count = count;

    int tab_w = (SK_SCREEN_W - 8) / count;
    for (int i = 0; i < count; i++) {
        lv_obj_t *btn = lv_obj_create(cont);
        lv_obj_remove_flag(btn, LV_OBJ_FLAG_SCROLLABLE);
        lv_obj_set_size(btn, tab_w, 28);
        lv_obj_set_style_bg_color(btn, lv_color_hex(SK_PANEL_BG), 0);
        lv_obj_set_style_bg_opa(btn, LV_OPA_TRANSP, 0);
        lv_obj_set_style_border_width(btn, 0, 0);
        lv_obj_set_style_border_side(btn, LV_BORDER_SIDE_BOTTOM, 0);
        lv_obj_set_style_radius(btn, 0, 0);
        lv_obj_set_style_pad_all(btn, 0, 0);

        lv_obj_t *lbl = lv_label_create(btn);
        lv_label_set_text(lbl, labels[i]);
        lv_obj_set_style_text_font(lbl, &SK_FONT_SMALL, 0);
        lv_obj_center(lbl);
        s_tab_btns[i] = btn;
    }

    if (selected_out) *selected_out = 0;
    sk_tabs_update(cont, 0);
    return cont;
}

void sk_tabs_update(lv_obj_t *tabs_container, int selected)
{
    for (int i = 0; i < s_tab_count; i++) {
        lv_obj_t *btn = s_tab_btns[i];
        if (i == selected) {
            lv_obj_set_style_bg_opa(btn, LV_OPA_30, 0);
            lv_obj_set_style_bg_color(btn, lv_color_hex(SK_BLUE), 0);
            lv_obj_set_style_border_width(btn, 2, 0);
            lv_obj_set_style_border_color(btn, lv_color_hex(SK_BLUE), 0);
            lv_obj_set_style_text_color(lv_obj_get_child(btn, 0),
                                        lv_color_hex(SK_BLUE), 0);
        } else {
            lv_obj_set_style_bg_opa(btn, LV_OPA_TRANSP, 0);
            lv_obj_set_style_border_width(btn, 0, 0);
            lv_obj_set_style_text_color(lv_obj_get_child(btn, 0),
                                        lv_color_hex(SK_TEXT_MUTED), 0);
        }
    }
}

// ---- 弹窗 ----

static lv_obj_t *s_popup = NULL;

void sk_popup_show(lv_obj_t *parent, const char *title, const char *body)
{
    sk_popup_close();

    // 半透明遮罩
    s_popup = lv_obj_create(parent);
    lv_obj_set_size(s_popup, SK_SCREEN_W, SK_SCREEN_H);
    lv_obj_set_pos(s_popup, 0, 0);
    lv_obj_set_style_bg_color(s_popup, lv_color_hex(SK_BLACK), 0);
    lv_obj_set_style_bg_opa(s_popup, LV_OPA_70, 0);
    lv_obj_set_style_border_width(s_popup, 0, 0);
    lv_obj_set_style_pad_all(s_popup, 0, 0);
    lv_obj_set_style_radius(s_popup, 0, 0);
    lv_obj_remove_flag(s_popup, LV_OBJ_FLAG_SCROLLABLE);

    // 内容面板
    int pw = 210, ph = 200;
    int px = (SK_SCREEN_W - pw) / 2;
    int py = (SK_SCREEN_H - ph) / 2;
    lv_obj_t *panel = sk_panel_create(s_popup, px, py, pw, ph);
    lv_obj_set_style_border_opa(panel, LV_OPA_COVER, 0);
    lv_obj_add_flag(panel, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_scroll_dir(panel, LV_DIR_VER);

    // 标题
    lv_obj_t *ttl = sk_label_create(panel, title, &SK_FONT_LARGE, SK_YELLOW);
    lv_obj_set_width(ttl, lv_pct(100));
    lv_label_set_long_mode(ttl, LV_LABEL_LONG_WRAP);

    // 分隔线
    lv_obj_t *sep = lv_obj_create(panel);
    lv_obj_set_size(sep, lv_pct(100), 1);
    lv_obj_set_style_bg_color(sep, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_bg_opa(sep, LV_OPA_40, 0);
    lv_obj_set_style_border_width(sep, 0, 0);
    lv_obj_set_style_radius(sep, 0, 0);

    // 正文
    lv_obj_t *desc = sk_label_create(panel, body ? body : "", &SK_FONT_SMALL, SK_TEXT);
    lv_obj_set_width(desc, lv_pct(100));
    lv_label_set_long_mode(desc, LV_LABEL_LONG_WRAP);
}

void sk_popup_close(void)
{
    if (s_popup) {
        lv_obj_delete(s_popup);
        s_popup = NULL;
    }
}

bool sk_popup_is_open(void)
{
    return s_popup != NULL;
}
