// main/page_rune_app.h -- 游戏符文能力模拟页 (炸弹/磁力/静止/制冰/相机)
#pragma once
#include "bsp_button.h"

void page_rune_app_enter(void);
void page_rune_app_exit(void);
void page_rune_app_key(bsp_btn_t btn, bsp_btn_ev_t ev);

// 设置要模拟的符文 (page_runes.c 的 RUNES 下标 0-4), 必须在 enter 前调用
void page_rune_app_set_rune(int rune_index);
