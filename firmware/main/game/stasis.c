#include "game.h"

static void release(game_t *g) {
    g->state=GS_MOVING;
    // 提前释放按冻结使用时长计冷却，最低一秒。
    g->cooldown=g->timer<1000?1000:g->timer;
    g->timer=0; g->events|=GE_RELEASE; g->effect=350;
    g->message=g->power?"Stored energy released.":"No force was stored.";
}
void stasis_input(game_t *g,game_input_t in) {
    if (g->state==GS_READY && in==GAME_OK) {
        g->state=GS_ACTIVE; g->timer=0; g->power=0;
        g->events|=GE_FREEZE; g->message="Strike to store force. Aim right.";
    } else if (g->state==GS_ACTIVE) {
        if (in==GAME_PREV) g->direction=-1;
        if (in==GAME_NEXT) g->direction=1;
        if (in==GAME_OK) {
            if (g->power<STASIS_MAX_HITS) g->power++;
            g->hit_direction=g->direction;
            g->events|=GE_HIT; g->effect=130;
        }
        if (in==GAME_SECONDARY) release(g);
    }
}
void stasis_step(game_t *g,uint32_t ms) {
    if (g->state==GS_ACTIVE) {
        g->timer+=ms;
        if (g->timer>=STASIS_MS) { g->timer=STASIS_MS; release(g); }
    } else if (g->state==GS_MOVING) {
        g->timer+=ms;
        g->x+=g->power*g->hit_direction*ms*0.06f;
        if (g->x>=220 && g->power>=4 && g->hit_direction>0) {
            g->effect=500; g->events|=GE_SHATTER; game_complete(g);
        } else if (g->timer>=1000 || g->x<15 || g->x>=220) {
            g->state=GS_COOLDOWN; g->x=84;
            g->message="Use at least four hits toward the wall.";
        }
    } else if (g->state==GS_COOLDOWN && !g->cooldown) {
        g->state=GS_READY; g->power=0; g->message=game_goal(g->id);
    }
}
