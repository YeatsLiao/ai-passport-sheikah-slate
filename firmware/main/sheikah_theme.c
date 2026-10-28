// 横屏主题：薄框、暖白正文、克制的希卡青色，不分配全屏混合层。
#include "sheikah_theme.h"
#include "img/img_all.h"

lv_obj_t *sk_box(lv_obj_t *parent,int x,int y,int w,int h,uint32_t color,lv_opa_t opacity) {
    lv_obj_t *o=lv_obj_create(parent);
    lv_obj_remove_style_all(o);
    lv_obj_remove_flag(o,LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_pos(o,x,y); lv_obj_set_size(o,w,h);
    lv_obj_set_style_bg_color(o,lv_color_hex(color),0);
    lv_obj_set_style_bg_opa(o,opacity,0);
    return o;
}
lv_obj_t *sk_screen_create(void) {
    lv_obj_t *o=sk_box(NULL,0,0,SK_SCREEN_W,SK_SCREEN_H,SK_BG,LV_OPA_COVER);
    lv_obj_set_style_bg_image_src(o,&img_slate_bg,0);
    return o;
}
lv_obj_t *sk_label_create(lv_obj_t *parent,const char *text,const lv_font_t *font,uint32_t color) {
    lv_obj_t *o=lv_label_create(parent);
    lv_obj_set_style_text_font(o,font?font:&SK_FONT_BODY,0);
    lv_obj_set_style_text_color(o,lv_color_hex(color),0);
    lv_label_set_text(o,text?text:"");
    return o;
}
lv_obj_t *sk_text(lv_obj_t *parent,const char *text,int x,int y,int w,uint32_t color) {
    lv_obj_t *o=sk_label_create(parent,text,&SK_FONT_SMALL,color);
    lv_obj_set_pos(o,x,y); lv_obj_set_width(o,w);
    lv_label_set_long_mode(o,LV_LABEL_LONG_WRAP);
    return o;
}
lv_obj_t *sk_image(lv_obj_t *parent,const lv_image_dsc_t *src,int x,int y) {
    lv_obj_t *o=lv_image_create(parent);
    lv_image_set_src(o,src); lv_image_set_pivot(o,0,0); lv_obj_set_pos(o,x,y);
    return o;
}
void sk_visible(lv_obj_t *o,bool visible) {
    if (visible) lv_obj_remove_flag(o,LV_OBJ_FLAG_HIDDEN);
    else lv_obj_add_flag(o,LV_OBJ_FLAG_HIDDEN);
}
lv_obj_t *sk_header_create(lv_obj_t *parent,const char *title) {
    lv_obj_t *o=sk_box(parent,0,0,320,28,SK_BLACK,180);
    sk_box(o,12,27,296,1,SK_BLUE,100);
    lv_obj_t *t=sk_label_create(o,title,&SK_FONT_SMALL,SK_TEXT);
    lv_obj_center(t);
    return o;
}
void sk_tabs_header(lv_obj_t *parent,int selected) {
    static const char *names[]={"Runes","Compendium","Log","System"};
    static const int x[]={14,85,197,252},w[]={58,103,45,62};
    sk_box(parent,0,0,320,29,SK_BLACK,190);
    for(int i=0;i<4;i++) {
        sk_text(parent,names[i],x[i],7,w[i],i==selected?SK_TEXT:SK_TEXT_MUTED);
        if(i==selected) sk_box(parent,x[i],27,w[i]-8,2,SK_BLUE,255);
    }
}
lv_obj_t *sk_footer_create(lv_obj_t *parent,const char *hint) {
    lv_obj_t *o=sk_box(parent,0,216,320,24,SK_BLACK,210);
    lv_obj_t *t=sk_text(o,hint,8,4,304,SK_TEXT);
    lv_obj_set_style_text_align(t,LV_TEXT_ALIGN_CENTER,0);
    return o;
}
lv_obj_t *sk_panel_create(lv_obj_t *parent,int x,int y,int w,int h) {
    lv_obj_t *o=sk_box(parent,x,y,w,h,SK_PANEL_BG,245);
    lv_obj_set_style_border_width(o,1,0);
    lv_obj_set_style_border_color(o,lv_color_hex(SK_BLUE),0);
    lv_obj_set_style_border_opa(o,130,0);
    return o;
}
void sk_set_selected(lv_obj_t *o,bool selected) {
    lv_obj_set_style_border_width(o,selected?2:1,0);
    lv_obj_set_style_border_color(o,lv_color_hex(selected?SK_TEXT:SK_BLUE),0);
    lv_obj_set_style_border_opa(o,selected?255:70,0);
    lv_obj_set_style_bg_color(o,lv_color_hex(SK_BLUE),0);
    lv_obj_set_style_bg_opa(o,selected?35:8,0);
}
void sk_glow(lv_obj_t *o,uint32_t color,int width,lv_opa_t opa) {
    (void)width;
    // 使用轮廓代替软件阴影，避免大范围重绘。
    lv_obj_set_style_outline_color(o,lv_color_hex(color),0);
    lv_obj_set_style_outline_width(o,opa?1:0,0);
    lv_obj_set_style_outline_opa(o,opa,0);
}
void sk_corner_frame(lv_obj_t *parent,int w,int h) {
    for (int i=0;i<4;i++) {
        int x=(i&1)?w-12:0,y=(i&2)?h-12:0;
        sk_box(parent,x,(i&2)?h-2:0,12,2,SK_BLUE,220);
        sk_box(parent,(i&1)?w-2:0,y,2,12,SK_BLUE,220);
    }
}
