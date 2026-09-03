// main/page_runes.h -- 符文选择器 (主菜单)
#pragma once
#include "bsp_button.h"

void page_runes_enter(void);
void page_runes_exit(void);
void page_runes_key(bsp_btn_t btn, bsp_btn_ev_t ev);

// 返回当前选中符文的 page_id (-1 = 无子页面)
int page_runes_get_selected_page(void);
