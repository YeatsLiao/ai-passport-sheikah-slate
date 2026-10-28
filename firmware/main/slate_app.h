#pragma once
#include "bsp_button.h"
#include <stdint.h>
typedef enum { PAGE_STANDBY, PAGE_RUNES, PAGE_COMPENDIUM, PAGE_QUEST, PAGE_SETTINGS, PAGE_RUNE_APP, PAGE_COUNT } page_id_t;
void slate_init(void);
void slate_open(page_id_t page);
void slate_key(bsp_btn_t key,bsp_btn_ev_t event);
uint32_t slate_generation(void);
page_id_t slate_page(void);
