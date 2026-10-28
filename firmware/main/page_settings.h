// main/page_settings.h -- 设置页
#pragma once
#include <stdbool.h>
#include "bsp_button.h"

void page_settings_enter(void);
void page_settings_exit(void);
void page_settings_key(bsp_btn_t btn, bsp_btn_ev_t ev);

// 返回用户是否请求了"返回待机" (OK on "Return to Standby")
bool page_settings_wants_standby(void);
