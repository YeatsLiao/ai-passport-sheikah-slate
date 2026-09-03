// main/page_standby.h -- 待机页: 希卡之眼 Logo
#pragma once
#include "bsp_button.h"

void page_standby_enter(void);
void page_standby_exit(void);
void page_standby_key(bsp_btn_t btn, bsp_btn_ev_t ev);
