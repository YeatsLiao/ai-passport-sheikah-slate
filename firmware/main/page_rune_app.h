#pragma once
#include "bsp_button.h"
#include "game/game.h"
void page_rune_app_enter(void);
void page_rune_app_exit(void);
void page_rune_app_key(bsp_btn_t btn,bsp_btn_ev_t ev);
void page_rune_app_set_rune(int id);
void page_rune_app_configure(game_id_t id,bool cube);
const game_t *page_rune_app_model(void);
