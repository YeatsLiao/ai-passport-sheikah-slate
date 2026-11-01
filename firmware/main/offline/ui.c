/* Shared LVGL kit: widget pointers, buffers and drawing helpers. */
#include "app_internal.h"
#include <stdio.h>
#include <string.h>

lv_obj_t *screen,*content,*title,*footer,*notice,*modal;
lv_obj_t *world,*actor,*player,*effect,*game_info;
char message[192];
static char image_paths[32][72];
unsigned image_path_count;
uint32_t scroll_elapsed;
scroll_text_t scroll_texts[6];
unsigned scroll_count;
const uint32_t BG=0x06151e,FG=0xe5e6d3,CYAN=0x56cbe0,GOLD=0xe1c37b;

lv_obj_t *box(lv_obj_t *p,int x,int y,int w,int h,uint32_t color,lv_opa_t opacity){lv_obj_t *o=lv_obj_create(p);lv_obj_remove_style_all(o);lv_obj_set_pos(o,x,y);lv_obj_set_size(o,w,h);lv_obj_set_style_bg_color(o,lv_color_hex(color),0);lv_obj_set_style_bg_opa(o,opacity,0);lv_obj_remove_flag(o,LV_OBJ_FLAG_SCROLLABLE);return o;}
lv_obj_t *label(lv_obj_t *p,const char *text,int x,int y,int w,bool large,uint32_t color){lv_obj_t *o=lv_label_create(p);lv_obj_set_pos(o,x,y);lv_obj_set_width(o,w);lv_label_set_text(o,text);lv_obj_set_style_text_font(o,large?&of_chinese_14:&of_chinese_12,0);lv_obj_set_style_text_color(o,lv_color_hex(color),0);return o;}
lv_obj_t *picture(lv_obj_t *parent,const char *name,int x,int y){const lv_image_dsc_t *src=of_image(name);if(!src)return NULL;lv_obj_t *o=lv_image_create(parent);lv_image_set_src(o,src);lv_obj_set_pos(o,x,y);return o;}
const lv_image_dsc_t *equipment_source(const char *name,int pixels){
 if(!name||strncmp(name,"photo/eq_",9))return NULL;size_t length=strlen(name);if(length<10||strcmp(name+length-4,".jpg"))return NULL;
 char key[64];int n=snprintf(key,sizeof(key),"equip/%d/%.*s",pixels,(int)(length-10),name+6);
 return n<0||n>=(int)sizeof(key)?NULL:of_image(key);
}
lv_obj_t *photo(lv_obj_t *p,const char *name,int x,int y,int scale){
 if(!name||!*name)return NULL;
 if(!strncmp(name,"photo/eq_",9)){
  const lv_image_dsc_t *src=equipment_source(name,scale<=75?24:scale<=96?32:44);if(!src)return NULL;
  lv_obj_t *o=lv_image_create(p);lv_image_set_src(o,src);lv_obj_set_pos(o,x,y);return o;
 }
 if(image_path_count>=32)return NULL;char *path=image_paths[image_path_count++];snprintf(path,72,"R:%s",name);size_t size;if(!of_resource(name,&size))return NULL;lv_obj_t *o=lv_image_create(p);lv_image_set_src(o,path);lv_obj_set_pos(o,x,y);if(scale!=256){lv_image_set_pivot(o,0,0);lv_image_set_scale(o,scale);}return o;
}
static int scroll_offset(int max){if(max<=0)return 0;uint32_t travel=(uint32_t)max*1000/14,at=scroll_elapsed%(travel+3300);return at<1500?0:at<1500+travel?(int)((at-1500)*14/1000):max;}
lv_obj_t *scrolling_text(lv_obj_t *p,const char *text,int x,int y,int w,int h){
 lv_obj_t *viewport=box(p,x,y,w,h,BG,0);lv_obj_t *o=label(viewport,text,0,0,w,false,FG);lv_label_set_long_mode(o,LV_LABEL_LONG_WRAP);lv_obj_update_layout(o);
 int overflow=lv_obj_get_height(o)>h?lv_obj_get_height(o)-h:0;lv_obj_set_y(o,-scroll_offset(overflow));
 if(scroll_count<6)scroll_texts[scroll_count++]=(scroll_text_t){o,overflow};return viewport;
}
void scroll_tick(uint32_t dt){
 if(paused||editing||inventory_menu||read_menu||album_mode>=2)return;scroll_elapsed+=dt;
 for(unsigned i=0;i<scroll_count;i++){int max=scroll_texts[i].overflow;if(max<=0)continue;
  lv_obj_set_y(scroll_texts[i].label,-scroll_offset(max));
 }
}
const char *name_of(const of_item_t *e){return of_text(e->cn,e->en);}
const char *body_of(const of_item_t *e){return of_text(e->cn_body,e->en_body);}
void text_changed(lv_obj_t *o,const char *value){if(o&&strcmp(lv_label_get_text(o),value))lv_label_set_text(o,value);}
void set_footer(const char *s){text_changed(footer,s);lv_obj_set_style_text_font(footer,&of_chinese_10,0);lv_obj_set_height(footer,18);lv_label_set_long_mode(footer,LV_LABEL_LONG_SCROLL_CIRCULAR);}
void select_style(lv_obj_t *o,bool on){lv_obj_set_style_bg_opa(o,on?100:0,0);lv_obj_set_style_border_width(o,on?1:0,0);lv_obj_set_style_border_color(o,lv_color_hex(CYAN),0);}
void visible(lv_obj_t *o,bool on){if(!o)return;if(on)lv_obj_remove_flag(o,LV_OBJ_FLAG_HIDDEN);else lv_obj_add_flag(o,LV_OBJ_FLAG_HIDDEN);}
int bounded(int x,int lo,int hi){return x<lo?lo:x>hi?hi:x;}
