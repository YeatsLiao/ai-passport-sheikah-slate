// 页面仅管理显示与生命周期；游戏规则在game/中。
#include "page_rune_app.h"
#include "game_view.h"
#include "game/store.h"
#include "game/catalog.h"
#include "slate_app.h"
#include "sheikah_theme.h"
#include "img/img_all.h"
#include "audio/sfx.h"
#include <stdio.h>
#include <string.h>

static game_t game;
static game_view_t view;
static game_id_t selected;
static bool cube;
static lv_obj_t *screen,*message,*status,*secondary,*footer,*coolbar,*pause_panel,*pause_rows[3],*result,*result_text,*flash;
static lv_timer_t *timer;
static uint32_t last_tick;
static int pause_selection;

static void text(lv_obj_t *o,const char *value) {
    if(strcmp(lv_label_get_text(o),value)) lv_label_set_text(o,value);
}
static void events(void) {
    unsigned bits=game.events; game.events=0;
    if(bits&GE_SAVE) {
        if(!store_save()) game.message="Save failed. Progress kept in RAM.";
    }
    if(bits&GE_COMPLETE) sfx_play(SFX_COMPLETE);
    else if(bits&GE_BLAST) sfx_play(SFX_BOMB_BOOM);
    else if(bits&GE_RELEASE) sfx_play(SFX_STASIS_UNFREEZE);
    else if(bits&GE_FREEZE) sfx_play(SFX_STASIS_FREEZE);
    else if(bits&GE_HIT) sfx_play(SFX_HIT);
    else if(bits&GE_SHUTTER) sfx_play(SFX_SHUTTER);
    else if(bits&GE_SHATTER) sfx_play(SFX_SHATTER);
    else if(bits&GE_ICE) sfx_play(SFX_CRYONIS_ACTIVATE);
    else if(bits&GE_GRAB) sfx_play(SFX_MAGNESIS_ACTIVATE);
    else if(bits&GE_PLACE) sfx_play(SFX_BOMB_PLACE);
    else if(bits&GE_FOUND) sfx_play(SFX_FOUND);
}
static void render(void) {
    game_view_update(&view,&game);
    char info[96]="";
    const char *hint="OK  Use",*extra="HOLD OK: PAUSE";
    if(game.cooldown) snprintf(info,sizeof(info),"Recharging  %.1fs",game.cooldown/1000.0);
    switch(game.id) {
    case GAME_BOMB:
        hint=game.state==GS_HELD?"UP/DN  Aim    OK  Throw":game.state==GS_ACTIVE?"OK  Detonate":"UP/DN  Aim    OK  Create";
        if(game.state==GS_MOVING) hint="Bomb in flight";
        break;
    case GAME_MAGNET:
        hint=game.state==GS_HELD?"UP/DN  Move    OK  Drop":"UP/DN  Target    OK  Grab";
        if(game.state==GS_HELD) {
            snprintf(info,sizeof(info),"Move %s",game.axis?"vertically":"horizontally");
            extra="HOLD UP: CHANGE AXIS  |  HOLD OK: PAUSE";
        }
        break;
    case GAME_STASIS:
        hint=game.state==GS_ACTIVE?"UP/DN  Direction    OK  Strike":"OK  Freeze";
        if(game.state==GS_ACTIVE) {
            snprintf(info,sizeof(info),"%.1fs   %d/6 hits   %s",(STASIS_MS-game.timer)/1000.0,game.power,game.direction>0?">":"<");
            extra="HOLD UP: RELEASE  |  HOLD OK: PAUSE";
        }
        break;
    case GAME_CRYONIS:
        hint="UP/DN  Aim    OK  Raise / Break";
        if(!game.cooldown) snprintf(info,sizeof(info),"%d/3 ice pillars",game.pillar_count);
        break;
    case GAME_CAMERA: {
        hint="UP/DN  Pan    OK  Shutter"; extra="HOLD UP: ZOOM  |  HOLD OK: PAUSE";
        snprintf(info,sizeof(info),"%s  |  %u/5 registered",game.axis?"1.5x":"1.0x",progress_count(store_progress.discovered));
        if(game.state==GS_PHOTO) {
            hint=game.photo_choice?"Save     [ Retake ]     OK":"[ Save ]     Retake     OK";
            extra=store_progress.count==8?"ALBUM FULL: SAVE REPLACES OLDEST":"UP/DN: CHOOSE  |  HOLD OK: PAUSE";
        }
        int target=game.state==GS_PHOTO?game.photo.target:game.detected;
        if(target>=0 && game.state!=GS_DONE) {
            text(message,subjects[target].name);
            lv_obj_set_style_text_color(message,lv_color_hex(store_progress.discovered&(1<<target)?SK_BLUE:0xffb04b),0);
        } else {
            text(message,game.state==GS_PHOTO?"No subject identified":game.message);
            lv_obj_set_style_text_color(message,lv_color_hex(SK_TEXT),0);
        }
        break;
    }
    default: break;
    }
    if(game.id!=GAME_CAMERA) text(message,game.message);
    if(game.state==GS_COOLDOWN) hint="Wait for the rune to recharge";
    text(status,info); text(secondary,extra); text(lv_obj_get_child(footer,0),hint);
    unsigned max=game.id==GAME_STASIS?STASIS_COOLDOWN_MS:(game.id==GAME_BOMB?BOMB_COOLDOWN_MS:ICE_COOLDOWN_MS);
    sk_visible(coolbar,game.cooldown>0);
    if(game.cooldown) lv_obj_set_width(coolbar,1+(int)(90*(max-game.cooldown)/max));
    sk_visible(result,game.state==GS_DONE);
    if(game.state==GS_DONE) { text(result_text,game.id==GAME_CAMERA?"Compendium updated":"Trial complete"); text(lv_obj_get_child(footer,0),"OK  Retry    HOLD OK  Menu"); }
    sk_visible(pause_panel,game.paused);
    if(game.paused) for(int i=0;i<3;i++) sk_set_selected(pause_rows[i],i==pause_selection);
    lv_obj_set_style_bg_opa(flash,game.id==GAME_CAMERA && game.effect?(lv_opa_t)(game.effect*180/160):0,0);
}
static void tick(lv_timer_t *t) {
    (void)t;
    uint32_t now=lv_tick_get();
    game_step(&game,now-last_tick); last_tick=now;
    events(); render();
}
void page_rune_app_configure(game_id_t id,bool square) { selected=id; cube=square; }
void page_rune_app_set_rune(int id) { page_rune_app_configure((game_id_t)id,false); }
const game_t *page_rune_app_model(void) { return &game; }
void page_rune_app_enter(void) {
    game_init(&game,selected,cube,&store_progress);
    screen=sk_screen_create(); game_view_create(&view,screen,game.id);
    sk_box(screen,0,0,320,57,SK_BLACK,180);
    static const lv_image_dsc_t *icons[]={&img_rune_bomb,&img_rune_magnet,&img_rune_stasis,&img_rune_cryonis,&img_rune_camera};
    lv_obj_t *icon=sk_image(screen,cube && selected==GAME_BOMB?&img_rune_cube:icons[selected],8,8);
    lv_image_set_scale(icon,180);
    sk_text(screen,game_title(game.id),46,7,262,SK_TEXT);
    status=sk_text(screen,"",46,29,262,SK_BLUE);
    coolbar=sk_box(screen,46,52,90,2,SK_BLUE,255);
    message=sk_text(screen,game.message,10,65,300,SK_TEXT);
    lv_obj_set_style_text_outline_stroke_color(message,lv_color_hex(0x102021),0);
    lv_obj_set_style_text_outline_stroke_width(message,1,0);
    secondary=sk_text(screen,"",8,200,304,SK_TEXT);
    lv_obj_set_style_text_font(secondary,&SK_FONT_SMALL,0);
    footer=sk_footer_create(screen,"");
    if(game.id==GAME_CAMERA) {
        lv_obj_t *frame=sk_box(screen,22,87,276,104,0,0); sk_corner_frame(frame,276,104);
        sk_box(frame,136,44,4,1,SK_TEXT,220); sk_box(frame,137,42,1,5,SK_TEXT,220);
    }
    result=sk_panel_create(screen,32,91,256,58);
    result_text=sk_label_create(result,"Trial complete",&SK_FONT_LARGE,SK_TEXT);
    lv_obj_center(result_text); sk_visible(result,false);
    flash=sk_box(screen,0,0,320,240,0xffffff,0);
    pause_panel=sk_panel_create(screen,39,48,242,147);
    sk_text(pause_panel,"PAUSED",15,10,210,SK_BLUE);
    const char *labels[]={"Continue","Restart trial","Return to runes"};
    for(int i=0;i<3;i++) {
        pause_rows[i]=sk_box(pause_panel,12,37+i*33,218,29,SK_BLUE,0);
        sk_text(pause_rows[i],labels[i],9,5,200,SK_TEXT);
    }
    sk_visible(pause_panel,false); last_tick=lv_tick_get();
    timer=lv_timer_create(tick,33,NULL); render(); lv_screen_load(screen);
}
void page_rune_app_exit(void) {
    if(timer) { lv_timer_delete(timer); timer=NULL; }
    lv_anim_delete(screen,NULL); lv_obj_delete(screen); screen=NULL;
}
void page_rune_app_key(bsp_btn_t key,bsp_btn_ev_t ev) {
    if(ev==BSP_BTN_LONG && key==BSP_BTN_OK) {
        game.paused=!game.paused; pause_selection=0; last_tick=lv_tick_get(); render(); return;
    }
    if(game.paused) {
        if(ev!=BSP_BTN_CLICK) return;
        if(key==BSP_BTN_UP) pause_selection=(pause_selection+2)%3;
        else if(key==BSP_BTN_DOWN) pause_selection=(pause_selection+1)%3;
        else {
            if(pause_selection==2) { slate_open(PAGE_RUNES); return; }
            if(pause_selection==1) game_reset(&game);
            game.paused=false; last_tick=lv_tick_get();
        }
        render(); return;
    }
    if(game.state==GS_DONE && key==BSP_BTN_OK && ev==BSP_BTN_CLICK) game_reset(&game);
    else if(ev==BSP_BTN_LONG && key==BSP_BTN_UP) game_input(&game,GAME_SECONDARY);
    else if(ev==BSP_BTN_CLICK) game_input(&game,key==BSP_BTN_UP?GAME_PREV:key==BSP_BTN_DOWN?GAME_NEXT:GAME_OK);
    events(); render();
}
