// 同源场景渲染，固件与主机截图共用。
#pragma once
#include "game/game.h"
#include "lvgl.h"
typedef struct {
    lv_obj_t *root,*background,*props[8],*reticle,*effect,*arrow,*chain,*water;
    lv_point_precise_t arrow_points[5];
    game_id_t id;
} game_view_t;
void game_view_create(game_view_t *v,lv_obj_t *parent,game_id_t id);
void game_view_update(game_view_t *v,const game_t *g);
void game_view_photo(game_view_t *v,const photo_t *photo);
