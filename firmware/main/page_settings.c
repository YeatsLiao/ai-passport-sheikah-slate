#include "page_settings.h"
#include "sheikah_theme.h"
#include "sheikah_ui.h"
#include "slate_app.h"
#include "game/store.h"
#include "bsp_display.h"
#include "audio/sfx.h"
#include <stdio.h>
static lv_obj_t *screen,*rows[5],*values[3],*footer;
static int selected;
static bool editing,dirty;
static void apply(void) {
    bsp_display_backlight(store_progress.brightness);
    sfx_set_volume(store_progress.volume); sfx_set_enabled(store_progress.sound!=0);
}
static void refresh(void) {
    for(int i=0;i<5;i++) sk_set_selected(rows[i],i==selected);
    char text[20];
    snprintf(text,sizeof(text),"%u%%",store_progress.brightness); lv_label_set_text(values[0],text);
    snprintf(text,sizeof(text),"%u%%",store_progress.volume); lv_label_set_text(values[1],text);
    lv_label_set_text(values[2],store_progress.sound?"On":"Off");
    lv_label_set_text(lv_obj_get_child(footer,0),editing?"UP/DN  Adjust    OK  Save":"UP/DN  Select    OK  Edit");
}
static void save(void) {
    if(!dirty) return;
    if(store_save()) dirty=false;
    else sk_popup_show(screen,"Save failed","Settings remain active in RAM. Press OK to retry saving.");
}
void page_settings_enter(void) {
    editing=false; dirty=false; screen=sk_screen_create(); sk_tabs_header(screen,3);
    sk_text(screen,"System settings",14,39,280,SK_BLUE);
    const char *labels[]={"Brightness","Volume","Sound effects","About","Standby"};
    for(int i=0;i<5;i++) {
        rows[i]=sk_box(screen,12,65+i*29,296,26,SK_BLUE,0);
        sk_text(rows[i],labels[i],8,4,197,SK_TEXT);
        if(i<3) values[i]=sk_text(rows[i],"",218,4,65,SK_BLUE);
    }
    footer=sk_footer_create(screen,""); refresh(); lv_screen_load(screen);
}
void page_settings_exit(void) {
    // 路由前已经尝试保存；退出不能创建依附于即将销毁页面的弹窗。
    if(dirty) store_save();
    lv_obj_delete(screen); screen=NULL;
}
void page_settings_key(bsp_btn_t key,bsp_btn_ev_t ev) {
    if(ev==BSP_BTN_LONG && key==BSP_BTN_OK) {
        if(dirty) { save(); if(dirty) return; }
        slate_open(PAGE_RUNES); return;
    }
    if(ev!=BSP_BTN_CLICK) return;
    if(key==BSP_BTN_OK) {
        if(selected<3) {
            if(editing) { save(); if(dirty) return; }
            editing=!editing;
        } else if(selected==3) {
            sk_popup_show(screen,"Sheikah Slate","Five rune trials\n320 x 240 landscape\nESP32-C3 / LVGL 9.5\nFan-made 2D simulation");
        } else { slate_open(PAGE_STANDBY); return; }
    } else if(editing && selected<3) {
        uint8_t *v=selected==0?&store_progress.brightness:selected==1?&store_progress.volume:&store_progress.sound;
        int n=selected==2?!*v:(int)*v+(key==BSP_BTN_UP?-10:10);
        int min=selected==0?10:0,max=selected==2?1:100;
        *v=(uint8_t)(n<min?min:n>max?max:n); dirty=true; apply();
    } else selected=(selected+(key==BSP_BTN_UP?-1:1)+5)%5;
    refresh();
}
bool page_settings_wants_standby(void) { return false; }
