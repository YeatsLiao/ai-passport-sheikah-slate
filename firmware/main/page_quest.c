#include "page_quest.h"
#include "sheikah_theme.h"
#include "sheikah_ui.h"
#include "slate_app.h"
#include "game/game.h"
#include "game/store.h"
static lv_obj_t *screen,*rows[GAME_COUNT];
static int selected;
static void refresh(void) { for(int i=0;i<GAME_COUNT;i++) sk_set_selected(rows[i],i==selected); }
void page_quest_enter(void) {
    screen=sk_screen_create(); sk_tabs_header(screen,2);
    sk_text(screen,"Rune trials",14,39,280,SK_BLUE);
    for(int i=0;i<GAME_COUNT;i++) {
        rows[i]=sk_box(screen,12,64+i*29,296,26,SK_BLUE,0);
        sk_text(rows[i],game_title((game_id_t)i),8,4,175,SK_TEXT);
        sk_text(rows[i],store_progress.completed&(1<<i)?"Complete":"In progress",180,4,109,store_progress.completed&(1<<i)?SK_BLUE:SK_TEXT_MUTED);
    }
    sk_footer_create(screen,"UP/DN  Browse    OK  Objective"); refresh(); lv_screen_load(screen);
}
void page_quest_exit(void) { lv_obj_delete(screen); screen=NULL; }
void page_quest_key(bsp_btn_t key,bsp_btn_ev_t ev) {
    if(ev==BSP_BTN_LONG && key==BSP_BTN_OK) { slate_open(PAGE_RUNES); return; }
    if(ev!=BSP_BTN_CLICK) return;
    if(key==BSP_BTN_OK) sk_popup_show(screen,game_title((game_id_t)selected),game_goal((game_id_t)selected));
    else { selected=(selected+(key==BSP_BTN_UP?-1:1)+GAME_COUNT)%GAME_COUNT; refresh(); }
}
