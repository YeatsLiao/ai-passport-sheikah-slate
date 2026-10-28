// 所有路由在LVGL线程执行；先切到过渡屏再释放旧页面。
#include "slate_app.h"
#include "lvgl.h"
#include "page_standby.h"
#include "page_runes.h"
#include "page_rune_app.h"
#include "page_compendium.h"
#include "page_quest.h"
#include "page_settings.h"
#include "audio/sfx.h"
#include "sheikah_ui.h"
typedef struct { void (*enter)(void); void (*exit)(void); void (*key)(bsp_btn_t,bsp_btn_ev_t); } page_ops_t;
static const page_ops_t pages[PAGE_COUNT]={
    {page_standby_enter,page_standby_exit,page_standby_key},
    {page_runes_enter,page_runes_exit,page_runes_key},
    {page_compendium_enter,page_compendium_exit,page_compendium_key},
    {page_quest_enter,page_quest_exit,page_quest_key},
    {page_settings_enter,page_settings_exit,page_settings_key},
    {page_rune_app_enter,page_rune_app_exit,page_rune_app_key}
};
static page_id_t current=PAGE_COUNT;
static uint32_t generation;
void slate_init(void) { slate_open(PAGE_STANDBY); }
page_id_t slate_page(void) { return current; }
uint32_t slate_generation(void) { return generation; }
void slate_open(page_id_t page) {
    if(page<0 || page>=PAGE_COUNT || current==page) return;
    lv_obj_t *bridge=lv_obj_create(NULL);
    lv_screen_load(bridge);
    sk_popup_close(); sfx_cancel();
    if(current<PAGE_COUNT) pages[current].exit();
    current=page; generation++;
    pages[current].enter();
    lv_obj_delete(bridge);
}
void slate_key(bsp_btn_t key,bsp_btn_ev_t event) {
    if(current>=PAGE_COUNT) return;
    if(sk_popup_is_open()) { if(event==BSP_BTN_CLICK || event==BSP_BTN_LONG) sk_popup_close(); return; }
    pages[current].key(key,event);
}
