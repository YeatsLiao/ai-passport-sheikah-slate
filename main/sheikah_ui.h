// main/sheikah_ui.h -- 希卡石板通用 UI 组件
#pragma once

#include "lvgl.h"
#include <stdbool.h>

// 创建一个可滚动的希卡风格列表 (带选中高亮)
// 返回: 列表容器 (lv_list), 条目通过 sk_list_add_item 添加
lv_obj_t *sk_list_create(lv_obj_t *parent, int x, int y, int w, int h);

// 向列表添加一个条目, 返回条目对象 (lv_list button)
// icon: 可选左侧图标 (lv_image_dsc_t*, 传 NULL 则无图标)
// subtitle: 可选副标题, 显示在标题下方 (弱化色, 单行省略)
lv_obj_t *sk_list_add_item(lv_obj_t *list, const lv_image_dsc_t *icon,
                           const char *title, const char *subtitle);

// 分类标签栏 (文字): 创建水平标签, 返回标签容器
// labels: 字符串数组
lv_obj_t *sk_tabs_create(lv_obj_t *parent, int y, const char **labels, int count,
                         int *selected_out);

// 分类标签栏 (图标): 用游戏分类图标代替文字, 返回标签容器
// icons: lv_image_dsc_t* 数组 (通常 28x28)
lv_obj_t *sk_icon_tabs_create(lv_obj_t *parent, int y, const lv_image_dsc_t **icons,
                              int count, int *selected_out);

// 更新标签选中态 (文字/图标标签通用)
void sk_tabs_update(lv_obj_t *tabs_container, int selected);

// 详情弹窗 (游戏对话框风格): 遮罩 + 深蓝面板 + 四角角饰 + Hylia 标题 + 分隔线 + 正文
void sk_popup_show(lv_obj_t *parent, const char *title, const char *body);

// 关闭当前弹窗
void sk_popup_close(void);

// 当前是否有弹窗打开
bool sk_popup_is_open(void);
