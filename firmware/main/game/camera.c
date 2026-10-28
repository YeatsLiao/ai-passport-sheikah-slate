#include "game.h"
#include <math.h>
#include <stdlib.h>
#include <string.h>

void camera_snapshot(const game_t *g,photo_t *s) {
    if (g->state==GS_PHOTO || g->state==GS_DONE) { *s=g->photo; return; }
    memset(s,0,sizeof(*s));
    static const int base[5]={172,236,320,402,469};
    s->center=(int16_t)g->x; s->zoom=(uint8_t)g->axis; s->target=-1;
    for (int i=0;i<5;i++) {
        s->x[i]=(int16_t)base[i]; s->y[i]=158;
        if (i==0) s->x[i]+=(int16_t)(12*sinf(g->elapsed/1300.0f));
        if (i==2) s->x[i]+=(int16_t)(32*sinf(g->elapsed/1800.0f));
    }
    s->target=(int8_t)camera_detect(s);
}
int camera_detect(const photo_t *s) {
    // 与渲染共用世界坐标。岩石遮挡区位于334..370，目标中心必须露出。
    int best=-1, distance=10000;
    float zoom=s->zoom?1.5f:1.0f;
    for (int i=0;i<5;i++) {
        float dx=(s->x[i]-s->center)*zoom;
        float dy=(s->y[i]-158)*zoom;
        if (fabsf(dx)>28 || fabsf(dy)>24) continue;
        if (i==2 && s->x[i]>334 && s->x[i]<370) continue;
        if (dx-22*zoom < -130 || dx+22*zoom>130) continue;
        int d=abs(s->x[i]-s->center);
        if (d<distance) { best=i; distance=d; }
    }
    return best;
}
void camera_input(game_t *g,game_input_t in) {
    if (g->state==GS_PHOTO) {
        if (in==GAME_PREV || in==GAME_NEXT) g->photo_choice^=1;
        if (in==GAME_OK) {
            if (!g->photo_choice && g->progress) {
                bool fresh=progress_add_photo(g->progress,&g->photo);
                g->events|=GE_SAVE;
                if (fresh) g->events|=GE_FOUND;
                g->message=fresh?"New entry registered.":"Photo saved in the album.";
                if (g->progress->discovered==31) { game_complete(g); return; }
            } else g->message="Adjust the view and try again.";
            g->state=GS_READY;
        }
        return;
    }
    if (in==GAME_PREV) g->x=game_clamp(g->x-8,160,480);
    if (in==GAME_NEXT) g->x=game_clamp(g->x+8,160,480);
    if (in==GAME_SECONDARY) g->axis^=1;
    if (in==GAME_OK) {
        camera_snapshot(g,&g->photo);
        g->detected=g->photo.target;
        g->state=GS_PHOTO; g->photo_choice=0;
        g->events|=GE_SHUTTER; g->effect=160;
    }
}
void camera_step(game_t *g,uint32_t ms) {
    (void)ms;
    photo_t p;
    camera_snapshot(g,&p);
    if (g->detected!=p.target && p.target>=0) g->events|=GE_FOUND;
    g->detected=p.target;
}
