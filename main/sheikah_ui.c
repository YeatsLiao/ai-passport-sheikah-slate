// main/sheikah_ui.c -- 希卡石板通用 UI 组件实现
//
// 视觉规格来自 zelda-hyrule-ui: 列表/标签透底显石板背景, 选中态用希卡蓝辉光,
// 弹窗为游戏对话框 (深蓝面板 + 四角角饰 + Hylia 标题 + 分隔线)。
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
    lv_obj_set_style_bg_opa(list, LV_OPA_40, 0);
    lv_obj_set_style_border_color(list, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_border_width(list, 1, 0);
    lv_obj_set_style_border_opa(list, LV_OPA_40, 0);
    lv_obj_set_style_radius(list, 4, 0);
    lv_obj_set_style_pad_all(list, 3, 0);
    lv_obj_set_style_pad_row(list, 2, 0);

    // 自定义滚动条 (LVGL 9: LV_PART_SCROLLBAR 选择器)
    lv_obj_set_style_bg_color(list, lv_color_hex(SK_BLUE), LV_PART_SCROLLBAR);
    lv_obj_set_style_bg_opa(list, LV_OPA_60, LV_PART_SCROLLBAR);
    lv_obj_set_style_width(list, 3, LV_PART_SCROLLBAR);
    return list;
}

lv_obj_t *sk_list_add_item(lv_obj_t *list, const lv_image_dsc_t *icon,
                           const char *title, const char *subtitle)
{
    // lv_list button 本身是 FLEX_ROW: [icon?] [内容列]。
    // icon 交给 LVGL 自动建左侧图标; 标题/副标题放进竖直内容列 → 两行布局。
    lv_obj_t *btn = lv_list_add_button(list, icon, NULL);
    lv_obj_set_flex_align(btn, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_CENTER,
                          LV_FLEX_ALIGN_CENTER);
    lv_obj_set_style_bg_color(btn, lv_color_hex(SK_PANEL_BG), 0);
    lv_obj_set_style_bg_opa(btn, LV_OPA_TRANSP, 0);
    lv_obj_set_style_border_color(btn, lv_color_hex(SK_TAN), 0);
    lv_obj_set_style_border_width(btn, 1, 0);
    lv_obj_set_style_border_side(btn, LV_BORDER_SIDE_BOTTOM, 0);
    lv_obj_set_style_border_opa(btn, LV_OPA_20, 0);
    lv_obj_set_style_pad_ver(btn, 6, 0);
    lv_obj_set_style_pad_hor(btn, 8, 0);
    lv_obj_set_style_radius(btn, 2, 0);

    // 内容列 (标题 + 可选副标题), 竖直排列并填满图标右侧空间
    lv_obj_t *col = lv_obj_create(btn);
    lv_obj_remove_flag(col, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_flex_grow(col, 1);
    lv_obj_set_flex_flow(col, LV_FLEX_FLOW_COLUMN);
    lv_obj_set_flex_align(col, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_START,
                          LV_FLEX_ALIGN_START);
    lv_obj_set_style_bg_opa(col, LV_OPA_TRANSP, 0);
    lv_obj_set_style_border_width(col, 0, 0);
    lv_obj_set_style_pad_all(col, 0, 0);
    lv_obj_set_style_pad_row(col, 1, 0);

    lv_obj_t *t = lv_label_create(col);
    lv_label_set_text(t, title ? title : "");
    lv_obj_set_style_text_font(t, &SK_FONT_BODY, 0);
    lv_obj_set_style_text_color(t, lv_color_hex(SK_TEXT), 0);
    lv_obj_set_width(t, lv_pct(100));
    lv_label_set_long_mode(t, LV_LABEL_LONG_DOT);

    if (subtitle && subtitle[0]) {
        lv_obj_t *s = lv_label_create(col);
        lv_label_set_text(s, subtitle);
        lv_obj_set_style_text_font(s, &SK_FONT_SMALL, 0);
        lv_obj_set_style_text_color(s, lv_color_hex(SK_TEXT_MUTED), 0);
        lv_obj_set_width(s, lv_pct(100));
        lv_label_set_long_mode(s, LV_LABEL_LONG_DOT);
    }
    return btn;
}

// ---- 分类标签栏 (文字 / 图标共用骨架) ----

static lv_obj_t **s_tab_btns = NULL;
static int s_tab_count = 0;

// 创建标签容器 + 空按钮 (内容由调用方填文字或图标)
static lv_obj_t *tabs_build(lv_obj_t *parent, int y, int count)
{
    lv_obj_t *cont = lv_obj_create(parent);
    lv_obj_remove_flag(cont, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_pos(cont, 0, y);
    lv_obj_set_size(cont, SK_SCREEN_W, 40);
    lv_obj_set_style_bg_opa(cont, LV_OPA_TRANSP, 0);
    lv_obj_set_style_border_width(cont, 0, 0);
    lv_obj_set_style_pad_all(cont, 0, 0);
    lv_obj_set_flex_flow(cont, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(cont, LV_FLEX_ALIGN_SPACE_EVENLY,
                          LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);

    if (s_tab_btns) lv_free(s_tab_btns);
    s_tab_btns = lv_malloc(sizeof(lv_obj_t *) * count);
    s_tab_count = count;

    int tab_w = (SK_SCREEN_W - 12) / count;
    for (int i = 0; i < count; i++) {
        lv_obj_t *btn = lv_obj_create(cont);
        lv_obj_remove_flag(btn, LV_OBJ_FLAG_SCROLLABLE);
        lv_obj_set_size(btn, tab_w, 34);
        lv_obj_set_style_bg_opa(btn, LV_OPA_TRANSP, 0);
        lv_obj_set_style_border_color(btn, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_border_width(btn, 1, 0);
        lv_obj_set_style_border_opa(btn, LV_OPA_20, 0);
        lv_obj_set_style_radius(btn, 4, 0);
        lv_obj_set_style_pad_all(btn, 0, 0);
        s_tab_btns[i] = btn;
    }
    return cont;
}

lv_obj_t *sk_tabs_create(lv_obj_t *parent, int y, const char **labels, int count,
                         int *selected_out)
{
    lv_obj_t *cont = tabs_build(parent, y, count);
    for (int i = 0; i < count; i++) {
        lv_obj_t *lbl = lv_label_create(s_tab_btns[i]);
        lv_label_set_text(lbl, labels[i]);
        lv_obj_set_style_text_font(lbl, &SK_FONT_CAPS, 0);
        lv_obj_set_style_text_color(lbl, lv_color_hex(SK_TEXT_MUTED), 0);
        lv_obj_center(lbl);
    }
    if (selected_out) *selected_out = 0;
    sk_tabs_update(cont, 0);
    return cont;
}

lv_obj_t *sk_icon_tabs_create(lv_obj_t *parent, int y, const lv_image_dsc_t **icons,
                              int count, int *selected_out)
{
    lv_obj_t *cont = tabs_build(parent, y, count);
    for (int i = 0; i < count; i++) {
        lv_obj_t *img = lv_image_create(s_tab_btns[i]);
        lv_image_set_src(img, icons[i]);
        lv_obj_center(img);
    }
    if (selected_out) *selected_out = 0;
    sk_tabs_update(cont, 0);
    return cont;
}

void sk_tabs_update(lv_obj_t *tabs_container, int selected)
{
    (void)tabs_container;  // 用静态 s_tab_btns (同一时刻只有一个标签栏)
    for (int i = 0; i < s_tab_count; i++) {
        lv_obj_t *btn = s_tab_btns[i];
        bool on = (i == selected);
        lv_obj_set_style_bg_color(btn, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_bg_opa(btn, on ? LV_OPA_20 : LV_OPA_TRANSP, 0);
        lv_obj_set_style_border_width(btn, on ? 2 : 1, 0);
        lv_obj_set_style_border_opa(btn, on ? LV_OPA_COVER : LV_OPA_20, 0);
        if (on) sk_glow(btn, SK_BLUE_GLOW, 8, LV_OPA_40);
        else    sk_glow(btn, SK_BLUE_GLOW, 0, LV_OPA_TRANSP);

        // 文字标签重着色; 图标标签子对象是 image, 用类型检查跳过
        lv_obj_t *child = lv_obj_get_child(btn, 0);
        if (child && lv_obj_check_type(child, &lv_label_class)) {
            lv_obj_set_style_text_color(child,
                lv_color_hex(on ? SK_YELLOW : SK_TEXT_MUTED), 0);
        }
    }
}

// ---- 弹窗 (游戏对话框) ----

static lv_obj_t *s_popup = NULL;

void sk_popup_show(lv_obj_t *parent, const char *title, const char *body)
{
    sk_popup_close();

    // 半透明遮罩
    s_popup = lv_obj_create(parent);
    lv_obj_remove_flag(s_popup, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_size(s_popup, SK_SCREEN_W, SK_SCREEN_H);
    lv_obj_set_pos(s_popup, 0, 0);
    lv_obj_set_style_bg_color(s_popup, lv_color_hex(SK_BLACK), 0);
    lv_obj_set_style_bg_opa(s_popup, LV_OPA_70, 0);
    lv_obj_set_style_border_width(s_popup, 0, 0);
    lv_obj_set_style_radius(s_popup, 0, 0);
    lv_obj_set_style_pad_all(s_popup, 0, 0);

    // 深蓝面板
    int pw = 216, ph = 200;
    int px = (SK_SCREEN_W - pw) / 2;
    int py = (SK_SCREEN_H - ph) / 2;
    lv_obj_t *panel = lv_obj_create(s_popup);
    lv_obj_remove_flag(panel, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_pos(panel, px, py);
    lv_obj_set_size(panel, pw, ph);
    lv_obj_set_style_bg_color(panel, lv_color_hex(SK_PANEL_BG), 0);
    lv_obj_set_style_bg_opa(panel, LV_OPA_COVER, 0);
    lv_obj_set_style_border_color(panel, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_border_width(panel, 2, 0);
    lv_obj_set_style_border_opa(panel, LV_OPA_COVER, 0);
    lv_obj_set_style_radius(panel, 3, 0);
    lv_obj_set_style_pad_all(panel, 0, 0);
    sk_glow(panel, SK_BLUE_GLOW, 16, LV_OPA_40);

    // 四角角饰 (相对内容区, 内缩 4px 避开边框)
    sk_corner_frame(panel, pw - 4, ph - 4);

    // 标题 (Hylia Serif, 黄色)
    lv_obj_t *ttl = lv_label_create(panel);
    lv_label_set_text(ttl, title);
    lv_obj_set_style_text_font(ttl, &SK_FONT_LARGE, 0);
    lv_obj_set_style_text_color(ttl, lv_color_hex(SK_YELLOW), 0);
    lv_obj_set_width(ttl, pw - 48);
    lv_obj_set_style_text_align(ttl, LV_TEXT_ALIGN_CENTER, 0);
    lv_label_set_long_mode(ttl, LV_LABEL_LONG_WRAP);
    lv_obj_align(ttl, LV_ALIGN_TOP_MID, 0, 18);

    // 分隔线
    lv_obj_t *sep = lv_obj_create(panel);
    lv_obj_remove_flag(sep, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_size(sep, pw - 60, 2);
    lv_obj_align(sep, LV_ALIGN_TOP_MID, 0, 54);
    lv_obj_set_style_bg_color(sep, lv_color_hex(SK_BLUE), 0);
    lv_obj_set_style_bg_opa(sep, LV_OPA_50, 0);
    lv_obj_set_style_border_width(sep, 0, 0);
    lv_obj_set_style_radius(sep, 1, 0);
    lv_obj_set_style_pad_all(sep, 0, 0);

    // 正文 (暖白, 自动换行)
    lv_obj_t *desc = lv_label_create(panel);
    lv_label_set_text(desc, body ? body : "");
    lv_obj_set_style_text_font(desc, &SK_FONT_BODY, 0);
    lv_obj_set_style_text_color(desc, lv_color_hex(SK_TEXT), 0);
    lv_obj_set_width(desc, pw - 40);
    lv_label_set_long_mode(desc, LV_LABEL_LONG_WRAP);
    lv_obj_align(desc, LV_ALIGN_TOP_MID, 0, 70);
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
