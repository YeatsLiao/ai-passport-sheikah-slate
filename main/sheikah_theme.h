// main/sheikah_theme.h -- 希卡石板配色与全局样式
// 色值来源: zelda-hyrule-ui/packages/core/styles/variables.less
#pragma once

#include "lvgl.h"

// ---- 希卡配色 (16-bit RGB565 兼容) ----
#define SK_BLUE         0x3CD3FC  // 希卡蓝 - 选中高亮/边框
#define SK_BLUE_DARK    0x0A8DD7  // 深蓝 - 次级高亮
#define SK_YELLOW       0xFFE460  // 希卡黄 - 激活条目
#define SK_PANEL_BG     0x0A1428  // 面板底色 (深蓝黑)
#define SK_PAGE_BG      0x66645D  // 页面底层背景
#define SK_TEXT         0xE9E1D1  // 正文暖白
#define SK_TEXT_MUTED   0x9A9484  // 弱化文字
#define SK_TEXT_RED     0xF15050  // 危险/红色
#define SK_EFFECT_GOLD  0xFCC413  // 金色效果
#define SK_BLACK        0x000000
#define SK_WHITE        0xFFFFFF
#define SK_TAN          0xE2DED3  // 塞尔达 Tan 色 (边框/装饰)

// ---- 字体映射 ----
#define SK_FONT_TITLE   lv_font_montserrat_24
#define SK_FONT_BODY    lv_font_montserrat_16
#define SK_FONT_SMALL   lv_font_montserrat_14
#define SK_FONT_LARGE   lv_font_montserrat_20

// ---- 布局常量 (240x320 竖屏) ----
#define SK_SCREEN_W     240
#define SK_SCREEN_H     320
#define SK_HEADER_H     40   // 顶部标题栏高度
#define SK_FOOTER_H     30   // 底部提示栏高度

// ---- 公共样式函数 ----

// 创建带希卡主题的背景屏幕 (深蓝黑底)
lv_obj_t *sk_screen_create(void);

// 在屏幕顶部创建标题栏
lv_obj_t *sk_header_create(lv_obj_t *parent, const char *title);

// 在屏幕底部创建按键提示栏 (UP/DOWN/OK)
lv_obj_t *sk_footer_create(lv_obj_t *parent, const char *hint);

// 创建一个希卡风格的面板 (深蓝黑底 + 希卡蓝边框)
lv_obj_t *sk_panel_create(lv_obj_t *parent, int x, int y, int w, int h);

// 给面板/对象设置选中态 (希卡蓝边框 + 微亮)
void sk_set_selected(lv_obj_t *obj, bool selected);

// 创建一个希卡风格的文本标签
lv_obj_t *sk_label_create(lv_obj_t *parent, const char *text,
                          const lv_font_t *font, uint32_t color);
