#include "page_runes.h"
#include "page_rune_app.h"
#include "slate_app.h"
#include "sheikah_theme.h"
#include "game/game.h"
#include "game/store.h"
#include "img/img_all.h"
#include "audio/sfx.h"
static lv_obj_t *screen,*cells[6],*title,*description,*footer,*header,*badge;
static int selected,tab;
static bool tab_focus;
static const game_id_t ids[]={GAME_BOMB,GAME_BOMB,GAME_MAGNET,GAME_STASIS,GAME_CRYONIS,GAME_CAMERA};
static const lv_image_dsc_t *icons[]={&img_rune_bomb,&img_rune_cube,&img_rune_magnet,&img_rune_stasis,&img_rune_cryonis,&img_rune_camera};
static const char *names[]={"Remote Bomb / Round","Remote Bomb / Cube","Magnesis","Stasis","Cryonis","Camera"};
static void refresh(void) {
    lv_obj_clean(header); sk_tabs_header(header,tab);
    for(int i=0;i<6;i++) sk_set_selected(cells[i],!tab_focus && i==selected);
    const char *tab_names[]={"Rune trials","Hyrule Compendium","Adventure Log","System"};
    lv_label_set_text(title,tab_focus?tab_names[tab]:names[selected]);
    lv_label_set_text(description,tab_focus?"Choose a section. Press OK to enter.":game_goal(ids[selected]));
    lv_label_set_text(lv_obj_get_child(footer,0),tab_focus?"UP/DN  Section     OK  Enter":"UP/DN  Rune     OK  Use");
    lv_label_set_text(badge,tab_focus?"HOLD OK: STANDBY":(store_progress.completed&(1<<ids[selected])?"COMPLETE   |   HOLD UP: SECTIONS":"HOLD UP: SECTIONS"));
}
void page_runes_enter(void) {
    screen=sk_screen_create();
    header=sk_box(screen,0,0,320,29,0,0);
    sk_text(screen,"SHEIKAH RUNES",16,44,280,SK_BLUE);
    for(int i=0;i<6;i++) {
        cells[i]=sk_box(screen,12+i*50,74,46,50,SK_BLUE,15);
        sk_image(cells[i],icons[i],3,5);
    }
    sk_box(screen,16,140,288,1,SK_BLUE,90);
    title=sk_label_create(screen,"",&SK_FONT_LARGE,SK_TEXT);
    lv_obj_set_pos(title,16,150); lv_obj_set_width(title,288);
    description=sk_text(screen,"",16,178,292,SK_TEXT);
    badge=sk_text(screen,"",16,201,288,SK_TEXT_MUTED);
    lv_obj_set_style_text_font(badge,&SK_FONT_SMALL,0);
    footer=sk_footer_create(screen,""); refresh(); lv_screen_load(screen);
}
void page_runes_exit(void) { lv_obj_delete(screen); screen=NULL; }
void page_runes_key(bsp_btn_t key,bsp_btn_ev_t ev) {
    if(ev==BSP_BTN_LONG) {
        if(key==BSP_BTN_UP) { tab_focus=true; refresh(); }
        if(key==BSP_BTN_OK) {
            if(!tab_focus) { tab_focus=true; refresh(); }
            else slate_open(PAGE_STANDBY);
        }
        return;
    }
    if(ev!=BSP_BTN_CLICK) return;
    if(key!=BSP_BTN_OK) {
        int delta=key==BSP_BTN_UP?-1:1;
        if(tab_focus) tab=(tab+delta+4)%4; else selected=(selected+delta+6)%6;
        refresh(); sfx_play(SFX_TICK); return;
    }
    if(tab_focus) {
        if(tab==0) { tab_focus=false; refresh(); }
        else { static const page_id_t pages[]={PAGE_RUNES,PAGE_COMPENDIUM,PAGE_QUEST,PAGE_SETTINGS}; slate_open(pages[tab]); }
    } else {
        page_rune_app_configure(ids[selected],selected==1);
        slate_open(PAGE_RUNE_APP);
    }
    sfx_play(SFX_CONFIRM);
}
int page_runes_get_selected_page(void) { return PAGE_RUNE_APP; }
int page_runes_get_selected_rune(void) { return ids[selected]; }
