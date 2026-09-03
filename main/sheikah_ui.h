// main/sheikah_ui.h -- 希卡石板通用 UI 组件
#pragma once

#include "lvgl.h"

// 创建一个可滚动的希卡风格列表 (带选中高亮)
// 返回: 列表容器 (lv_list), 条目通过 sk_list_add_item 添加
lv_obj_t *sk_list_create(lv_obj_t *parent, int x, int y, int w, int h);

// 向列表添加一个条目, 返回条目对象
lv_obj_t *sk_list_add_item(lv_obj_t *list, const char *title, const char *subtitle);

// 分类标签栏: 创建水平标签, 返回标签容器
// labels: NULL 结尾的字符串数组
lv_obj_t *sk_tabs_create(lv_obj_t *parent, int y, const char **labels, int count,
                         int *selected_out);

// 更新标签选中态
void sk_tabs_update(lv_obj_t *tabs_container, int selected);

// 详情弹窗: 标题 + 多行描述文本
void sk_popup_show(lv_obj_t *parent, const char *title, const char *body);

// 关闭当前弹窗
void sk_popup_close(void);

// 当前是否有弹窗打开
bool sk_popup_is_open(void);
