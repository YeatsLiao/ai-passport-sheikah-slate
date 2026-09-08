// main/sheikah_theme.h -- 希卡石板配色与全局样式
// 色值来源: zelda-hyrule-ui/packages/core/styles/variables.less
// 标题字体: Hylia Serif (游戏原版), 正文: Montserrat (小写可读)
#pragma once

#include "lvgl.h"

// ---- Hylia Serif 字体 (tools/gen_font.mjs 生成于 main/font/) ----
LV_FONT_DECLARE(hylia_serif_16)
LV_FONT_DECLARE(hylia_serif_20)
LV_FONT_DECLARE(hylia_serif_28)

// ---- 希卡配色 (游戏 token, 16-bit RGB565 兼容) ----
#define SK_BLUE         0x3CD3FC  // 希卡蓝 - 选中高亮/边框
#define SK_BLUE_DARK    0x0A8DD7  // 深蓝 - 次级高亮
#define SK_BLUE_GLOW    0x4FC0FF  // 辉光蓝 - shadow/发光
#define SK_RUNE_CYAN    0x00BFFA  // 符文青 - 能力图标本色
#define SK_YELLOW       0xFFE460  // 希卡黄 - 激活条目/标题
#define SK_BG           0x0A1628  // 石板深蓝底 (SheikahBackground)
#define SK_PANEL_BG     0x0A1428  // 面板底色 (深蓝黑)
#define SK_PAGE_BG      0x0A1628  // 页面底层背景 (兼容旧引用)
#define SK_TEXT         0xE9E1D1  // 正文暖白
#define SK_TEXT_MUTED   0x9A9484  // 弱化文字
#define SK_TEXT_RED     0xF15050  // 危险/红色
#define SK_EFFECT_GOLD  0xFCC413  // 金色效果
#define SK_BLACK        0x000000
#define SK_WHITE        0xFFFFFF
#define SK_TAN          0xE2DED3  // 塞尔达 Tan 色 (边框/装饰/角饰)

// ---- 字体映射 ----
#define SK_FONT_TITLE   hylia_serif_28           // 大标题 / 待机提示
#define SK_FONT_LARGE   hylia_serif_20           // 面板标题 / 符文名
#define SK_FONT_CAPS    hylia_serif_16           // 小号大写标签 / 页脚
#define SK_FONT_BODY    lv_font_montserrat_16    // 正文
#define SK_FONT_SMALL   lv_font_montserrat_14    // 辅助文字

// ---- 布局常量 (240x320 竖屏) ----
#define SK_SCREEN_W     240
#define SK_SCREEN_H     320
#define SK_HEADER_H     44   // 顶部标题栏高度
#define SK_FOOTER_H     28   // 底部提示栏高度

// ---- 公共样式函数 ----

// 创建带希卡主题的背景屏幕:
// 深蓝底色 + 全屏 img_slate_bg (渐变/中心辉光/暗角/扫描线, 已烘焙)。
// 背景图作为第一个子对象, 位于 z 序最底层。
lv_obj_t *sk_screen_create(void);

// 在屏幕顶部创建标题栏 (Hylia Serif 标题 + 两侧 tan 角饰)
lv_obj_t *sk_header_create(lv_obj_t *parent, const char *title);

// 在屏幕底部创建按键提示栏 (Hylia Serif 小号大写)
lv_obj_t *sk_footer_create(lv_obj_t *parent, const char *hint);

// 创建一个希卡风格的面板 (深蓝黑底 + 希卡蓝边框)
lv_obj_t *sk_panel_create(lv_obj_t *parent, int x, int y, int w, int h);

// 给面板/对象设置选中态 (希卡蓝边框 + 辉光)
void sk_set_selected(lv_obj_t *obj, bool selected);

// 创建一个希卡风格的文本标签
lv_obj_t *sk_label_create(lv_obj_t *parent, const char *text,
                          const lv_font_t *font, uint32_t color);

// ---- 游戏级装饰 (新增) ----

// 在对象四角放置括号角饰 (img_corner, 90° 倍数旋转 = 像素精确无损)
// w/h = 被装饰区域的宽高 (全屏用 SK_SCREEN_W/H, 面板用面板尺寸)
void sk_corner_frame(lv_obj_t *parent, int w, int h);

// 给任意对象加希卡蓝辉光 (shadow), 用于选中/激活态
void sk_glow(lv_obj_t *obj, uint32_t color, int width, lv_opa_t opa);
