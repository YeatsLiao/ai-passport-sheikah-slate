#include "game.h"
#include <string.h>

static const char *titles[GAME_COUNT]={"Remote Bombs","Magnesis","Stasis","Cryonis","Camera"};
static const char *goals[GAME_COUNT]={"Break the cracked stone wall.","Lay the metal slab across the gap.","Store force. Clear the barricade.","Raise the gate from underneath.","Photograph five different subjects."};
float game_clamp(float x,float lo,float hi) { return x<lo?lo:(x>hi?hi:x); }
const char *game_title(game_id_t id) { return id<GAME_COUNT && id>=0?titles[id]:""; }
const char *game_goal(game_id_t id) { return id<GAME_COUNT && id>=0?goals[id]:""; }
void game_init(game_t *g,game_id_t id,bool cube,progress_t *p) {
    memset(g,0,sizeof(*g));
    g->id=(id>=0 && id<GAME_COUNT)?id:GAME_BOMB; g->cube=cube; g->progress=p;
    g->state=GS_READY; g->direction=1; g->hit_direction=1; g->growing=-1; g->detected=-1;
    g->message=game_goal(g->id);
    for (int i=0;i<3;i++) g->pillars[i]=-1;
    switch (g->id) {
    case GAME_BOMB: g->aim=155; g->x=48; g->y=165; break;
    case GAME_MAGNET: g->x=60; g->y=178; break;
    case GAME_STASIS: g->x=84; g->y=174; break;
    case GAME_CRYONIS: g->selection=1; break;
    case GAME_CAMERA: g->x=160; camera_step(g,0); break;
    default: break;
    }
}
void game_reset(game_t *g) { game_init(g,g->id,g->cube,g->progress); }
void game_complete(game_t *g) {
    if (g->state==GS_DONE) return;
    g->state=GS_DONE; g->message="Trial complete";
    if (g->progress) g->progress->completed|=1u<<g->id;
    g->events|=GE_COMPLETE|GE_SAVE;
}
void game_input(game_t *g,game_input_t input) {
    if (g->paused || g->state==GS_DONE) return;
    switch (g->id) {
    case GAME_BOMB: bomb_input(g,input); break;
    case GAME_MAGNET: magnet_input(g,input); break;
    case GAME_STASIS: stasis_input(g,input); break;
    case GAME_CRYONIS: cryonis_input(g,input); break;
    case GAME_CAMERA: camera_input(g,input); break;
    default: break;
    }
}
void game_step(game_t *g,uint32_t ms) {
    if (g->paused) return;
    if (ms>GAME_MAX_STEP_MS) ms=GAME_MAX_STEP_MS;
    g->effect=g->effect>ms?g->effect-ms:0;
    if (g->state==GS_DONE || g->state==GS_PHOTO) return;
    g->elapsed+=ms;
    g->cooldown=g->cooldown>ms?g->cooldown-ms:0;
    switch (g->id) {
    case GAME_BOMB: bomb_step(g,ms); break;
    case GAME_MAGNET: magnet_step(g,ms); break;
    case GAME_STASIS: stasis_step(g,ms); break;
    case GAME_CRYONIS: cryonis_step(g,ms); break;
    case GAME_CAMERA: camera_step(g,ms); break;
    default: break;
    }
}
