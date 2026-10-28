#include "game_view.h"
#include "game/catalog.h"
#include "sheikah_theme.h"
#include "img/img_all.h"
#include <string.h>

static void recolor(lv_obj_t *o,uint32_t color,lv_opa_t opacity) {
    lv_obj_set_style_image_recolor(o,lv_color_hex(color),0);
    lv_obj_set_style_image_recolor_opa(o,opacity,0);
}
static void source(lv_obj_t *o,const lv_image_dsc_t *image) {
    if (lv_image_get_src(o)!=image) lv_image_set_src(o,image);
}
void game_view_create(game_view_t *v,lv_obj_t *parent,game_id_t id) {
    memset(v,0,sizeof(*v)); v->id=id;
    v->root=sk_box(parent,0,0,320,240,0,255);
    v->background=sk_image(v->root,id==GAME_CAMERA?&img_field:&img_shrine,0,0);
    if (id==GAME_MAGNET) {
        // 扫描网格是薄线，不创建整屏ARGB中间层。
        for(int x=0;x<320;x+=32) sk_box(v->root,x,60,1,146,0xbc326a,35);
        for(int y=80;y<210;y+=24) sk_box(v->root,0,y,320,1,0xbc326a,35);
    }
    if (id==GAME_CRYONIS) {
        v->water=sk_box(v->root,50,162,270,50,0x1a9eb7,165);
        for(int i=0;i<5;i++) sk_box(v->water,12+i*47,13+(i%2)*15,23,1,0xbbf6ed,110);
    }
    for(int i=0;i<8;i++) { v->props[i]=sk_image(v->root,&img_stone,0,0); sk_visible(v->props[i],false); }
    v->reticle=sk_box(v->root,0,0,48,48,0,0); sk_corner_frame(v->reticle,48,48);
    sk_visible(v->reticle,false);
    v->chain=sk_box(v->root,0,0,64,56,0,0);
    for(int i=0;i<5;i++) {
        lv_obj_t *link=sk_box(v->chain,i*12,19,17,12,0,0);
        lv_obj_set_style_border_width(link,2,0);
        lv_obj_set_style_border_color(link,lv_color_hex(SK_YELLOW),0);
        lv_obj_set_style_radius(link,5,0);
    }
    sk_visible(v->chain,false);
    v->arrow=lv_line_create(v->root);
    lv_obj_set_style_line_width(v->arrow,3,0);
    lv_obj_set_style_line_color(v->arrow,lv_color_hex(SK_YELLOW),0);
    lv_obj_set_pos(v->arrow,0,0); sk_visible(v->arrow,false);
    v->effect=sk_image(v->root,&img_blast_0,0,0); sk_visible(v->effect,false);
}
static void prop(game_view_t *v,int i,const lv_image_dsc_t *src,int x,int y) {
    source(v->props[i],src); lv_obj_set_pos(v->props[i],x,y); sk_visible(v->props[i],true);
}
void game_view_photo(game_view_t *v,const photo_t *p) {
    float z=p->zoom?1.5f:1.0f;
    lv_image_set_scale(v->background,(uint32_t)(512*z));
    lv_obj_set_pos(v->background,(int)(160-p->center*z),(int)(120-155*z));
    for(int i=0;i<5;i++) {
        const lv_image_dsc_t *src=subjects[i].image;
        int x=(int)(160+(p->x[i]-p->center)*z-src->header.w*z/2);
        int y=(int)(132+(p->y[i]-158)*z-src->header.h*z/2);
        prop(v,i,src,x,y); lv_image_set_scale(v->props[i],(uint32_t)(256*z));
        sk_visible(v->props[i],x>-80 && x<320);
    }
    prop(v,5,&img_stone,(int)(160+(334-p->center)*z),(int)(132-10*z));
    lv_image_set_scale(v->props[5],(uint32_t)(192*z));
    sk_visible(v->reticle,false); sk_visible(v->chain,false); sk_visible(v->arrow,false);
}
void game_view_update(game_view_t *v,const game_t *g) {
    bool done=g->state==GS_DONE;
    switch (g->id) {
    case GAME_BOMB:
        prop(v,0,&img_wall,215,91); sk_visible(v->props[0],!done);
        prop(v,1,g->cube?&img_bomb_cube:&img_bomb_round,(int)g->x-14,(int)g->y-14);
        sk_visible(v->props[1],g->state==GS_HELD || g->state==GS_MOVING || g->state==GS_ACTIVE);
        lv_obj_set_pos(v->reticle,(int)g->aim-24,153);
        sk_visible(v->reticle,g->state==GS_READY || g->state==GS_HELD);
        break;
    case GAME_MAGNET: {
        prop(v,0,&img_gap,95,127);
        prop(v,1,&img_crate,24,112); prop(v,2,&img_stone,260,143);
        prop(v,3,&img_metal,(int)g->x-44,(int)g->y-18);
        recolor(v->props[3],g->state==GS_READY && g->selection!=0?0xd0428f:SK_YELLOW,done?0:100);
        int x=g->selection==1?45:(g->selection==2?284:(int)g->x);
        int y=g->selection==1?132:(g->selection==2?164:(int)g->y);
        lv_obj_set_pos(v->reticle,x-24,y-24); sk_visible(v->reticle,!done);
        bool held=g->state==GS_HELD;
        sk_visible(v->arrow,held);
        if(held) {
            v->arrow_points[0]=(lv_point_precise_t){155,211};
            v->arrow_points[1]=(lv_point_precise_t){145,(g->y+211)/2};
            v->arrow_points[2]=(lv_point_precise_t){g->x,g->y};
            lv_line_set_points(v->arrow,v->arrow_points,3);
            lv_obj_set_style_line_color(v->arrow,lv_color_hex(0xe098cc),0);
        }
        break;
    }
    case GAME_STASIS: {
        prop(v,0,&img_wall,231,92); sk_visible(v->props[0],!done);
        prop(v,1,&img_stone,(int)g->x-24,(int)g->y-24); sk_visible(v->props[1],!done);
        bool frozen=g->state==GS_ACTIVE;
        recolor(v->props[1],SK_YELLOW,frozen?135:0);
        lv_obj_set_pos(v->chain,(int)g->x-32,(int)g->y-28); sk_visible(v->chain,frozen);
        sk_visible(v->arrow,frozen && g->power>0);
        if(frozen && g->power) {
            int x=(int)g->x, y=(int)g->y-38, tip=x+g->hit_direction*(25+g->power*11);
            v->arrow_points[0]=(lv_point_precise_t){x,y}; v->arrow_points[1]=(lv_point_precise_t){tip,y};
            v->arrow_points[2]=(lv_point_precise_t){tip-g->hit_direction*10,y-7};
            v->arrow_points[3]=(lv_point_precise_t){tip,y};
            v->arrow_points[4]=(lv_point_precise_t){tip-g->hit_direction*10,y+7};
            lv_line_set_points(v->arrow,v->arrow_points,5);
            lv_obj_set_style_line_color(v->arrow,lv_color_hex(g->power>=4?0xff6a31:SK_YELLOW),0);
        }
        lv_obj_set_pos(v->reticle,(int)g->x-24,(int)g->y-24);
        sk_visible(v->reticle,g->state==GS_READY);
        break;
    }
    case GAME_CRYONIS: {
        float raise=done?1:(g->growing==4?game_clamp(g->grow_ms/650.0f,0,1):0);
        prop(v,0,&img_gate,186,79-(int)(raise*62));
        for(int i=0;i<3;i++) {
            if(i>=g->pillar_count) { sk_visible(v->props[i+1],false); continue; }
            int slot=g->pillars[i];
            float height=slot==g->growing?game_clamp(g->grow_ms/650.0f,0.04f,1):1;
            prop(v,i+1,&img_ice,cryonis_slot_x(slot)-24,207-(int)(height*76));
            lv_image_set_scale_y(v->props[i+1],(uint32_t)(256*height));
        }
        lv_obj_set_pos(v->reticle,cryonis_slot_x(g->selection)-24,159);
        sk_visible(v->reticle,!done && g->growing<0);
        break;
    }
    case GAME_CAMERA: {
        photo_t shot; camera_snapshot(g,&shot); game_view_photo(v,&shot);
        if(g->state==GS_READY && shot.target>=0) {
            int i=shot.target; float z=shot.zoom?1.5f:1;
            lv_obj_set_pos(v->reticle,(int)(160+(shot.x[i]-shot.center)*z-24),108);
            sk_visible(v->reticle,true);
        }
        break;
    }
    default: break;
    }
    bool blast=g->effect && (g->id==GAME_BOMB || (g->id==GAME_STASIS && done));
    sk_visible(v->effect,blast);
    if(blast) {
        static const lv_image_dsc_t *frames[]={&img_blast_0,&img_blast_1,&img_blast_2,&img_blast_3};
        unsigned i=(500-g->effect)/125; if(i>3)i=3;
        source(v->effect,frames[i]); lv_obj_set_pos(v->effect,(int)g->x-48,(int)g->y-48);
    }
}
