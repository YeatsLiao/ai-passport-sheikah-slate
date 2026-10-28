#include "game.h"

int cryonis_slot_x(int slot) { return 30+slot*48; }
static void remove_pillar(game_t *g,int at) {
    for (int i=at;i<g->pillar_count-1;i++) g->pillars[i]=g->pillars[i+1];
    g->pillars[--g->pillar_count]=-1;
    g->events|=GE_SHATTER; g->effect=300;
}
void cryonis_input(game_t *g,game_input_t in) {
    if (in==GAME_PREV) g->selection=(g->selection+5)%6;
    if (in==GAME_NEXT) g->selection=(g->selection+1)%6;
    if (in!=GAME_OK || g->cooldown || g->growing>=0) return;
    if (!g->selection) { g->message="Aim at water, not dry land."; return; }
    for (int i=0;i<g->pillar_count;i++) {
        if (g->pillars[i]==g->selection) {
            remove_pillar(g,i); g->message="Ice shattered."; return;
        }
    }
    if (g->pillar_count==3) remove_pillar(g,0);
    g->pillars[g->pillar_count++]=g->selection;
    g->growing=g->selection; g->grow_ms=0; g->events|=GE_ICE;
    g->cooldown=ICE_COOLDOWN_MS; g->message="Ice rises from the water.";
}
void cryonis_step(game_t *g,uint32_t ms) {
    if (g->growing<0) return;
    g->grow_ms+=ms;
    if (g->grow_ms>=650) {
        bool opens=g->growing==4;
        g->growing=-1;
        if (opens) game_complete(g);
        else g->message="Try lifting the gate from below.";
    }
}
