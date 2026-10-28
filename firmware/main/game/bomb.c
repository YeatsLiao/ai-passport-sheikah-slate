#include "game.h"
#include <math.h>

void bomb_input(game_t *g,game_input_t in) {
    if (g->state==GS_COOLDOWN || g->state==GS_MOVING) return;
    if ((g->state==GS_READY || g->state==GS_HELD) && (in==GAME_PREV || in==GAME_NEXT))
        g->aim=game_clamp(g->aim+(in==GAME_PREV?-10:10),75,275);
    if (in!=GAME_OK) return;
    switch (g->state) {
    case GS_READY:
        g->state=GS_HELD; g->x=48; g->y=155; g->events|=GE_PLACE;
        g->message="Choose a landing point. Throw."; break;
    case GS_HELD:
        g->state=GS_MOVING; g->timer=0; g->message="Wait for the landing."; break;
    case GS_ACTIVE:
        g->events|=GE_BLAST; g->effect=500;
        if (fabsf(g->x-248)<43 && fabsf(g->y-177)<32) game_complete(g);
        else { g->state=GS_COOLDOWN; g->cooldown=BOMB_COOLDOWN_MS; g->message="Too far from the wall. Try again."; }
        break;
    default: break;
    }
}
void bomb_step(game_t *g,uint32_t ms) {
    if (g->state==GS_MOVING) {
        g->timer+=ms;
        float t=game_clamp(g->timer/650.0f,0,1);
        g->x=48+(g->aim-48)*t; g->y=155+22*t-85*4*t*(1-t);
        if (t>=1) { g->state=GS_ACTIVE; g->message="Detonate near the cracked wall."; }
    } else if (g->state==GS_ACTIVE && !g->cube) {
        g->x=game_clamp(g->x+ms*0.028f,30,295);
    } else if (g->state==GS_COOLDOWN && !g->cooldown) {
        g->state=GS_READY; g->message=game_goal(g->id);
    }
}
