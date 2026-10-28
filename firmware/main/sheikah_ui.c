#include "sheikah_ui.h"
#include "sheikah_theme.h"
static lv_obj_t *popup;

lv_obj_t *sk_list_create(lv_obj_t *parent,int x,int y,int w,int h) {
    lv_obj_t *o=sk_box(parent,x,y,w,h,SK_PANEL_BG,30);
    lv_obj_add_flag(o,LV_OBJ_FLAG_SCROLLABLE); lv_obj_set_flex_flow(o,LV_FLEX_FLOW_COLUMN);
    return o;
}
lv_obj_t *sk_list_add_item(lv_obj_t *list,const lv_image_dsc_t *icon,const char *title,const char *subtitle) {
    lv_obj_t *o=sk_box(list,0,0,lv_obj_get_width(list),subtitle?48:28,SK_PANEL_BG,20);
    if(icon) sk_image(o,icon,4,3);
    sk_text(o,title,icon?40:8,4,lv_obj_get_width(list)-48,SK_TEXT);
    if(subtitle) sk_text(o,subtitle,icon?40:8,26,lv_obj_get_width(list)-48,SK_TEXT_MUTED);
    return o;
}
lv_obj_t *sk_tabs_create(lv_obj_t *parent,int y,const char **labels,int count,int *selected) {
    lv_obj_t *o=sk_box(parent,0,y,320,32,0,0);
    for(int i=0;i<count;i++) {
        lv_obj_t *c=sk_box(o,i*(320/count)+2,0,320/count-4,30,SK_BLUE,0);
        sk_text(c,labels[i],4,5,320/count-8,SK_TEXT);
    }
    if(selected) *selected=0;
    sk_tabs_update(o,0);
    return o;
}
lv_obj_t *sk_icon_tabs_create(lv_obj_t *parent,int y,const lv_image_dsc_t **icons,int count,int *selected) {
    lv_obj_t *o=sk_box(parent,0,y,320,34,0,0);
    for(int i=0;i<count;i++) {
        lv_obj_t *c=sk_box(o,i*(320/count)+2,0,320/count-4,32,SK_BLUE,0);
        sk_image(c,icons[i],6,2);
    }
    if(selected) *selected=0;
    sk_tabs_update(o,0);
    return o;
}
void sk_tabs_update(lv_obj_t *container,int selected) {
    for(int i=0;i<(int)lv_obj_get_child_count(container);i++) sk_set_selected(lv_obj_get_child(container,i),i==selected);
}
void sk_popup_show(lv_obj_t *parent,const char *title,const char *body) {
    sk_popup_close();
    popup=sk_box(parent,0,0,320,240,SK_BLACK,160);
    lv_obj_t *panel=sk_panel_create(popup,24,43,272,157);
    sk_text(panel,title,14,12,244,SK_BLUE);
    sk_box(panel,14,36,244,1,SK_BLUE,95);
    sk_text(panel,body,14,48,244,SK_TEXT);
    sk_text(panel,"OK  Close",14,128,244,SK_TEXT_MUTED);
}
void sk_popup_close(void) { if(popup) lv_obj_delete(popup); popup=NULL; }
bool sk_popup_is_open(void) { return popup!=NULL; }
