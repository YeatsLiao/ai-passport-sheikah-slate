#pragma once
#include "lvgl.h"

/* Call once, after app startup, with the LVGL lock held. */
bool of_screenshot_init(lv_display_t *display);
