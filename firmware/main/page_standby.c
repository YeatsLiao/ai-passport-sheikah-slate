#include "page_standby.h"
#include "sheikah_theme.h"
#include "img/img_all.h"
#include "slate_app.h"
#include "audio/sfx.h"
static lv_obj_t *screen,*eye;
static void breathe(void *o,int32_t opacity) { lv_obj_set_style_image_opa(o,(lv_opa_t)opacity,0); }
void page_standby_enter(void) {
    screen=sk_screen_create();
    sk_box(screen,32,38,256,1,SK_BLUE,80);
    sk_box(screen,32,194,256,1,SK_BLUE,80);
    eye=sk_image(screen,&img_sheikah_eye,112,52); lv_image_set_scale(eye,164);
    lv_obj_t *title=sk_label_create(screen,"SHEIKAH SLATE",&SK_FONT_LARGE,SK_TEXT);
    lv_obj_align(title,LV_ALIGN_TOP_MID,0,158);
    lv_obj_t *hint=sk_text(screen,"OK  Activate",0,209,320,SK_BLUE);
    lv_obj_set_style_text_align(hint,LV_TEXT_ALIGN_CENTER,0);
    lv_anim_t a; lv_anim_init(&a); lv_anim_set_var(&a,eye);
    lv_anim_set_exec_cb(&a,breathe); lv_anim_set_values(&a,90,235);
    lv_anim_set_duration(&a,1600); lv_anim_set_playback_duration(&a,1600);
    lv_anim_set_repeat_count(&a,LV_ANIM_REPEAT_INFINITE); lv_anim_start(&a);
    lv_screen_load(screen);
}
void page_standby_exit(void) {
    lv_anim_delete(eye,NULL); lv_obj_delete(screen); screen=NULL; eye=NULL;
}
void page_standby_key(bsp_btn_t key,bsp_btn_ev_t ev) {
    if(key==BSP_BTN_OK && ev==BSP_BTN_CLICK) { slate_open(PAGE_RUNES); sfx_play(SFX_ACTIVATE); }
}
