#include "game.h"
#include <math.h>

void magnet_input(game_t *g,game_input_t in) {
    if (g->state==GS_MOVING) return;
    if (g->state==GS_READY) {
        if (in==GAME_PREV) g->selection=(g->selection+2)%3;
        if (in==GAME_NEXT) g->selection=(g->selection+1)%3;
        if (in==GAME_OK) {
            if (g->selection) { g->message="Only metal responds to Magnesis."; return; }
            g->state=GS_HELD; g->axis=0; g->events|=GE_GRAB;
            g->message="Align the slab with the bridge supports.";
        }
    } else if (g->state==GS_HELD) {
        if (in==GAME_SECONDARY) g->axis^=1;
        if (in==GAME_PREV || in==GAME_NEXT) {
            float delta=in==GAME_PREV?-8:8;
            if (g->axis) g->y=game_clamp(g->y+delta,65,208);
            else g->x=game_clamp(g->x+delta,-30,350);
        }
        if (in==GAME_OK) {
            g->state=GS_MOVING; g->timer=0;
            g->start_x=g->x; g->start_y=g->y;
        }
    }
}
void magnet_step(game_t *g,uint32_t ms) {
    if (g->state!=GS_MOVING) return;
    g->timer+=ms;
    // 放下后必须在桥台范围内稳定落位，不能仅靠抓取触发完成。
    if (fabsf(g->start_x-180)<17 && fabsf(g->start_y-148)<13) {
        float t=game_clamp(g->timer/350.0f,0,1);
        g->x=g->start_x+(180-g->start_x)*t;
        g->y=g->start_y+(148-g->start_y)*t;
        if (t>=1) game_complete(g);
    } else {
        g->y=game_clamp(g->start_y+g->timer*0.08f,65,205);
        if (g->timer>=550) {
            g->state=GS_READY; g->selection=0;
            g->x=60; g->y=178;
            g->message="The slab slipped. Lift it onto the supports.";
        }
    }
}
