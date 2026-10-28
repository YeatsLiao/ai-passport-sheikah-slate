#include "page_compendium.h"
#include "sheikah_theme.h"
#include "sheikah_ui.h"
#include "slate_app.h"
#include "game/catalog.h"
#include "game/store.h"
#include "game_view.h"
#include <stdio.h>
static lv_obj_t *screen,*body,*header;
static int selected,mode,photo_index;
static game_view_t album_view;
static void refresh(void) {
    lv_obj_clean(body);
    if(mode==2) {
        if(store_progress.count) {
            int slot=(store_progress.next+PHOTO_CAPACITY-1-photo_index)%PHOTO_CAPACITY;
            game_view_create(&album_view,body,GAME_CAMERA);
            game_view_photo(&album_view,&store_progress.photos[slot]);
            char count[64]; snprintf(count,sizeof(count),"Album  %d / %d",photo_index+1,store_progress.count);
            sk_header_create(body,count);
            sk_footer_create(body,"UP/DN  Photo    HOLD OK  Back");
        } else {
            sk_text(body,"Your album is empty.",30,90,270,SK_TEXT);
            sk_text(body,"Save a picture with the Camera rune.",30,119,260,SK_TEXT_MUTED);
            sk_footer_create(body,"HOLD OK  Back");
        }
        sk_visible(header,false); return;
    }
    sk_visible(header,true);
    char count[48]; snprintf(count,sizeof(count),"Hyrule Compendium    %u / 5",progress_count(store_progress.discovered));
    sk_text(body,count,15,43,290,SK_BLUE);
    if(mode==0) {
        for(int i=0;i<5;i++) {
            bool seen=store_progress.discovered&(1<<i);
            lv_obj_t *cell=sk_box(body,13+i*60,76,54,61,SK_BLUE,10);
            sk_set_selected(cell,i==selected);
            if(seen) {
                lv_obj_t *img=sk_image(cell,subjects[i].image,5,7);
                if(subjects[i].image->header.h>48) lv_image_set_scale(img,220);
            } else { lv_obj_t *q=sk_label_create(cell,"?",&SK_FONT_LARGE,SK_TEXT_MUTED); lv_obj_center(q); }
        }
        const subject_t *s=&subjects[selected];
        sk_text(body,s->category,16,149,288,SK_BLUE);
        sk_text(body,store_progress.discovered&(1<<selected)?s->name:"Unregistered subject",16,172,288,SK_TEXT);
        sk_text(body,"Hold UP to open the album",16,197,288,SK_TEXT_MUTED);
        sk_footer_create(body,"UP/DN  Browse    OK  Details");
    } else {
        const subject_t *s=&subjects[selected];
        sk_text(body,s->name,16,72,290,SK_TEXT);
        sk_panel_create(body,14,101,90,90);
        lv_obj_t *img=sk_image(body,s->image,26,116); lv_image_set_scale(img,350);
        sk_text(body,s->description,115,103,191,SK_TEXT);
        sk_text(body,s->location,115,181,190,SK_BLUE);
        sk_footer_create(body,"OK / HOLD OK  Back");
    }
    lv_obj_move_foreground(header);
}
void page_compendium_enter(void) {
    mode=0; photo_index=0;
    screen=sk_screen_create(); body=sk_box(screen,0,0,320,240,0,0);
    header=sk_box(screen,0,0,320,29,0,0); sk_tabs_header(header,1);
    refresh(); lv_screen_load(screen);
}
void page_compendium_exit(void) { lv_obj_delete(screen); screen=NULL; }
void page_compendium_key(bsp_btn_t key,bsp_btn_ev_t ev) {
    if(ev==BSP_BTN_LONG && key==BSP_BTN_OK) {
        if(mode) { mode=0; refresh(); } else slate_open(PAGE_RUNES);
        return;
    }
    if(ev==BSP_BTN_LONG && key==BSP_BTN_UP && mode==0) { mode=2; photo_index=0; refresh(); return; }
    if(ev!=BSP_BTN_CLICK) return;
    if(mode==2) {
        if(store_progress.count && key!=BSP_BTN_OK)
            photo_index=(photo_index+(key==BSP_BTN_UP?-1:1)+store_progress.count)%store_progress.count;
    } else if(mode==1) { if(key==BSP_BTN_OK) mode=0; }
    else if(key==BSP_BTN_OK) {
        if(store_progress.discovered&(1<<selected)) mode=1;
        else { sk_popup_show(screen,"Unregistered","Find this subject in the Camera trial and save its photo."); return; }
    } else selected=(selected+(key==BSP_BTN_UP?-1:1)+5)%5;
    refresh();
}
