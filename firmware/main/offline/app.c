/* Offline V1 pages; one LVGL owner, current-page objects only. */
#include "offline.h"
#include "src/misc/cache/instance/lv_image_cache.h"
#include "bsp_display.h"
#include "bsp_battery.h"
#include "esp_log.h"
#include "esp_heap_caps.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <math.h>
#include <stdatomic.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
typedef enum {P_STANDBY,P_HOME,P_INVENTORY,P_RUNES,P_GAME,P_MAP,P_COMP,P_QUEST,P_SETTINGS,P_ALBUM} page_t;
static page_t page=P_STANDBY;
static lv_obj_t *screen,*content,*title,*footer,*notice,*world,*actor,*player,*effect,*game_info,*modal;
static lv_obj_t *reward;
static unsigned player_frame=255;
static lv_obj_t *objects[8],*choices[5],*rows[6],*row_labels[6],*scan_overlay,*save_warning,*road_groups[3],*road_tiles[3][2];
static unsigned object_count;
static bool resource_ok,paused,editing;
static int selected,category,home_selection,pause_choice,map_axis,map_zoom=1,map_x=384,map_y=320,map_selected;
static int pause_mode,inventory_choice,album_mode,album_choice,settings_mode,confirm_choice;
static bool inventory_menu,blanked,wake_consumed[3];
static uint32_t last_activity,diagnostic_at,standby_entered_at,standby_changed_at;
static const uint16_t standby_seconds[]={0,30,60,120,300},screen_seconds[]={0,30,60,120,300,600},cycle_seconds[]={0,15,30,60,300};
static const char *style_cn[]={"静谧科技","晨光旷野","古地图","神庙石碑","林间薄雾","极简黑金"};
static const char *style_en[]={"QUIET TECH","DAWN FIELD","ANTIQUE MAP","SHRINE STELE","MISTY FOREST","BLACK & GOLD"};
static lv_obj_t *standby_clock,*standby_date,*standby_brand,*standby_toast,*settings_battery_row;
static uint32_t generation,last_tick,refresh_at,battery_at,held_at;
static int held_key=-1,editing_before;
static int ids[OF_COMP_COUNT],filtered;
static of_game_t game;
enum {BATTERY_READING,BATTERY_READY,BATTERY_NO_DEVICE,BATTERY_READ_ERROR,BATTERY_NOT_READY};
static int battery=-1,battery_millivolts=-1,battery_status=BATTERY_READING;
static _Atomic int battery_sample=-1,battery_voltage_sample=-1,battery_status_sample=BATTERY_READING;
// Only this worker accesses the gauge; UI consumes a cached snapshot.
static void battery_worker(void *arg){
 (void)arg;bool ready=false;int previous_state=-1,previous_percent=-2;
 for(;;){
  esp_err_t init_error=ready?ESP_OK:bsp_battery_init();
  bsp_battery_reading_t reading;bsp_battery_read_status(&reading);
  int status;
  if(reading.soc_error==ESP_ERR_INVALID_STATE)status=BATTERY_NO_DEVICE;
  else if(reading.soc_error!=ESP_OK||reading.voltage_error!=ESP_OK||reading.config_error!=ESP_OK||reading.profile_error!=ESP_OK)status=BATTERY_READ_ERROR;
  else if(init_error!=ESP_OK||!bsp_battery_reading_valid(&reading))status=BATTERY_NOT_READY;
  else status=BATTERY_READY;
  ready=status==BATTERY_READY;int percent=ready?reading.percent:-1;
  atomic_store(&battery_sample,percent);atomic_store(&battery_voltage_sample,reading.millivolts);atomic_store(&battery_status_sample,status);
  if(status!=previous_state||status!=BATTERY_READY||percent!=previous_percent){
   ESP_LOGI("bsp_batt","sample: state=%d init=%s SOC_read=%s raw=0x%04X percent=%d voltage=%d mV V_read=%s config=0x%02X C_read=%s profile=0x%02X P_read=%s",
            status,esp_err_to_name(init_error),esp_err_to_name(reading.soc_error),(unsigned)reading.raw_soc,percent,reading.millivolts,
            esp_err_to_name(reading.voltage_error),(unsigned)reading.config,esp_err_to_name(reading.config_error),(unsigned)reading.profile_status,esp_err_to_name(reading.profile_error));
  }
  previous_state=status;previous_percent=percent;vTaskDelay(pdMS_TO_TICKS(10000));
 }
}
static char message[192],image_paths[32][72];
static unsigned image_path_count;
static int page_selected[10],page_category[10],item_selected[3][5],pending_category,read_choice;
static bool read_menu,repeat_started,game_saved[9];
static of_game_t saved_games[9];
static uint32_t scroll_elapsed;
typedef struct {lv_obj_t *label;int overflow;} scroll_text_t;
static scroll_text_t scroll_texts[6];static unsigned scroll_count;
static struct {lv_obj_t *scene,*shade,*blast,*beam,*shadow,*gate,*force,*aim,*lock,*bar,*reveal,*glow,*rock,*result,*primary,*marks[7];} art;
static int item_page(void){return page==P_INVENTORY?0:page==P_COMP?1:2;}
static int bounded(int x,int lo,int hi){return x<lo?lo:x>hi?hi:x;}
static float unit(float x){return x<0?0:x>1?1:x;}
static float smooth(float x){x=unit(x);return x*x*(3-2*x);}
static void text_changed(lv_obj_t *o,const char *value){if(o&&strcmp(lv_label_get_text(o),value))lv_label_set_text(o,value);}

static uint8_t scan_pixels[320*2*4];
static const lv_image_dsc_t scan_image={.header={.magic=LV_IMAGE_HEADER_MAGIC,.cf=LV_COLOR_FORMAT_ARGB8888,.w=320,.h=2,.stride=1280},.data_size=2560,.data=scan_pixels};
static const uint32_t BG=0x06151e,FG=0xe5e6d3,CYAN=0x56cbe0,GOLD=0xe1c37b;
static const char *home_cn[]={"装备","符文","地图","海拉鲁图鉴","冒险日志","设置","相册","待机"};
static const char *home_en[]={"EQUIPMENT","RUNES","MAP","COMPENDIUM","ADVENTURE LOG","SETTINGS","ALBUM","STANDBY"};
static void render(void);
static void show(page_t next){
 of_audio_stop();of_state_flush();page_selected[page]=selected;page_category[page]=category;
 if(page==P_GAME){game.input=0;saved_games[game.id]=game;saved_games[game.id].paused=true;game_saved[game.id]=true;}
 if(page==P_INVENTORY||page==P_COMP||page==P_QUEST)item_selected[item_page()][category]=selected;
 if(next==P_STANDBY){standby_entered_at=standby_changed_at=lv_tick_get();}
 page=next;paused=false;editing=false;inventory_menu=read_menu=false;album_mode=settings_mode=pause_mode=0;held_key=-1;repeat_started=false;
 selected=page_selected[page];category=page_category[page];scroll_elapsed=0;generation++;render();
}
uint32_t of_app_generation(void){return generation;}
static lv_obj_t *box(lv_obj_t *p,int x,int y,int w,int h,uint32_t color,lv_opa_t opacity){lv_obj_t *o=lv_obj_create(p);lv_obj_remove_style_all(o);lv_obj_set_pos(o,x,y);lv_obj_set_size(o,w,h);lv_obj_set_style_bg_color(o,lv_color_hex(color),0);lv_obj_set_style_bg_opa(o,opacity,0);lv_obj_remove_flag(o,LV_OBJ_FLAG_SCROLLABLE);return o;}
static lv_obj_t *label(lv_obj_t *p,const char *text,int x,int y,int w,bool large,uint32_t color){lv_obj_t *o=lv_label_create(p);lv_obj_set_pos(o,x,y);lv_obj_set_width(o,w);lv_label_set_text(o,text);lv_obj_set_style_text_font(o,large?&of_chinese_14:&of_chinese_12,0);lv_obj_set_style_text_color(o,lv_color_hex(color),0);return o;}
static lv_obj_t *picture(lv_obj_t *parent,const char *name,int x,int y){const lv_image_dsc_t *src=of_image(name);if(!src)return NULL;lv_obj_t *o=lv_image_create(parent);lv_image_set_src(o,src);lv_obj_set_pos(o,x,y);return o;}
static const lv_image_dsc_t *equipment_source(const char *name,int pixels){
 if(!name||strncmp(name,"photo/eq_",9))return NULL;size_t length=strlen(name);if(length<10||strcmp(name+length-4,".jpg"))return NULL;
 char key[64];int n=snprintf(key,sizeof(key),"equip/%d/%.*s",pixels,(int)(length-10),name+6);
 return n<0||n>=(int)sizeof(key)?NULL:of_image(key);
}
static lv_obj_t *photo(lv_obj_t *p,const char *name,int x,int y,int scale){
 if(!name||!*name)return NULL;
 if(!strncmp(name,"photo/eq_",9)){
  const lv_image_dsc_t *src=equipment_source(name,scale<=75?24:scale<=96?32:44);if(!src)return NULL;
  lv_obj_t *o=lv_image_create(p);lv_image_set_src(o,src);lv_obj_set_pos(o,x,y);return o;
 }
 if(image_path_count>=32)return NULL;char *path=image_paths[image_path_count++];snprintf(path,72,"R:%s",name);size_t size;if(!of_resource(name,&size))return NULL;lv_obj_t *o=lv_image_create(p);lv_image_set_src(o,path);lv_obj_set_pos(o,x,y);if(scale!=256){lv_image_set_pivot(o,0,0);lv_image_set_scale(o,scale);}return o;
}
static int scroll_offset(int max){if(max<=0)return 0;uint32_t travel=(uint32_t)max*1000/14,at=scroll_elapsed%(travel+3300);return at<1500?0:at<1500+travel?(int)((at-1500)*14/1000):max;}
static lv_obj_t *scrolling_text(lv_obj_t *p,const char *text,int x,int y,int w,int h){
 lv_obj_t *viewport=box(p,x,y,w,h,BG,0);lv_obj_t *o=label(viewport,text,0,0,w,false,FG);lv_label_set_long_mode(o,LV_LABEL_LONG_WRAP);lv_obj_update_layout(o);
 int overflow=lv_obj_get_height(o)>h?lv_obj_get_height(o)-h:0;lv_obj_set_y(o,-scroll_offset(overflow));
 if(scroll_count<6)scroll_texts[scroll_count++]=(scroll_text_t){o,overflow};return viewport;
}
static void scroll_tick(uint32_t dt){
 if(paused||editing||inventory_menu||read_menu||album_mode>=2)return;scroll_elapsed+=dt;
 for(unsigned i=0;i<scroll_count;i++){int max=scroll_texts[i].overflow;if(max<=0)continue;
  lv_obj_set_y(scroll_texts[i].label,-scroll_offset(max));
 }
}
static const char *name_of(const of_item_t *e){return of_text(e->cn,e->en);}
static const char *body_of(const of_item_t *e){return of_text(e->cn_body,e->en_body);}
static void set_footer(const char *s){text_changed(footer,s);lv_obj_set_style_text_font(footer,&of_chinese_10,0);lv_obj_set_height(footer,18);lv_label_set_long_mode(footer,LV_LABEL_LONG_SCROLL_CIRCULAR);}
static void select_style(lv_obj_t *o,bool on){lv_obj_set_style_bg_opa(o,on?100:0,0);lv_obj_set_style_border_width(o,on?1:0,0);lv_obj_set_style_border_color(o,lv_color_hex(CYAN),0);}
static void list_row(int i,const char *text,bool on){rows[i]=box(content,8,8+i*26,304,25,CYAN,on?80:0);row_labels[i]=label(rows[i],text,5,3,294,false,on?FG:CYAN);select_style(rows[i],on);}
static void filter_items(void){filtered=0;if(page==P_COMP){for(int i=0;i<OF_COMP_COUNT;i++)if(of_comp[i].category==category)ids[filtered++]=i;}else if(page==P_QUEST){for(int i=0;i<OF_QUEST_COUNT;i++)if(of_quests[i].category==category)ids[filtered++]=i;}else{for(int i=0;i<OF_INV_COUNT;i++)if(of_inventory[i].category==category)ids[filtered++]=i;}if(selected>filtered)selected=0;}
static int slot_for(const of_item_t *e){if(e->category<2)return e->category;return e->slot;}
static const char *category_name(int c){
 static const char *cc[]={"生物","怪物","材料","装备","宝物"},*ce[]={"CREATURES","MONSTERS","MATERIALS","EQUIPMENT","TREASURE"};
 static const char *qc[]={"主线","神庙挑战","迷你挑战"},*qe[]={"MAIN","SHRINE","SIDE"};
 return page==P_COMP?of_text(cc[c],ce[c]):of_text(qc[c],qe[c]);
}
static void read_item(void){
 filter_items();selected=bounded(selected,0,filtered?filtered-1:0);if(!filtered){label(content,of_text("暂无条目","NO ENTRIES"),8,35,304,false,FG);return;}
 const of_item_t *e=(page==P_COMP?of_comp:of_quests)+ids[selected];int n=page==P_COMP?5:3;
 for(int i=0;i<n;i++){int w=304/n;lv_obj_t *tab=box(content,8+i*w,0,w-2,20,CYAN,i==category?70:0);lv_obj_t *t=label(tab,category_name(i),2,3,w-4,false,i==category?GOLD:CYAN);lv_obj_set_style_text_font(t,&of_chinese_10,0);}
 lv_obj_t *name=label(content,name_of(e),8,25,304,true,GOLD);lv_obj_set_height(name,19);lv_label_set_long_mode(name,LV_LABEL_LONG_SCROLL_CIRCULAR);
 int x=8,width=304;if(e->image&&*e->image){photo(content,e->image,8,50,256);x=104;width=208;}
 scrolling_text(content,body_of(e),x,50,width,105);
 snprintf(message,sizeof(message),"%s · %d/%d",category_name(category),selected+1,filtered);text_changed(title,message);
 bool done=page==P_QUEST?of_bit(of_state.quests,ids[selected]):of_bit(of_state.comp,ids[selected]);
 label(content,of_text(page==P_QUEST?(done?"已完成":"未完成"):(done?"已登记":"未登记"),page==P_QUEST?(done?"COMPLETE":"INCOMPLETE"):(done?"RECORDED":"NOT RECORDED")),8,160,304,false,CYAN);
 set_footer(of_text("上/下 切条目 · OK 操作/分类 · 长按返回","UP/DN previous/next · OK actions/category · hold back"));
 if(read_menu){modal=box(screen,72,64,176,112,BG,255);const char *cn[]={page==P_QUEST?(done?"标为未完成":"标为已完成"):(done?"取消登记":"登记条目"),"切换分类","关闭菜单"};const char *en[]={done?"UNMARK":"MARK","CATEGORY","CLOSE"};
  for(int i=0;i<3;i++){lv_obj_t *r=box(modal,5,8+i*32,166,29,CYAN,read_choice==i?90:0);label(r,of_text(cn[i],en[i]),7,6,154,false,FG);}
 }
}
static void category_menu(void){modal=box(screen,36,48,248,144,BG,255);lv_obj_set_style_border_width(modal,1,0);lv_obj_set_style_border_color(modal,lv_color_hex(CYAN),0);int n=page==P_COMP?5:3;
 static const char *cc[]={"生物","怪物","材料","装备","宝物"},*ce[]={"CREATURES","MONSTERS","MATERIALS","EQUIPMENT","TREASURE"};
 static const char *qc[]={"主线","神庙挑战","迷你挑战"},*qe[]={"MAIN","SHRINE","SIDE"};
 static const char *ic[]={"武器","盾牌","防具"},*ie[]={"WEAPONS","SHIELDS","ARMOR"};
 for(int i=0;i<n;i++){lv_obj_t *o=box(modal,4,4+i*26,240,25,CYAN,pending_category==i?100:0);label(o,page==P_COMP?of_text(cc[i],ce[i]):page==P_QUEST?of_text(qc[i],qe[i]):of_text(ic[i],ie[i]),5,3,230,false,FG);}}
static void map_render(void){
 int level=map_zoom-1,factor=1<<level,sw=384*factor,sh=320*factor,cx=map_x*factor/2,cy=map_y*factor/2;int left=cx-152,top=cy-82;
 lv_obj_t *viewport=box(content,8,0,304,164,BG,255); // Child images are clipped to this viewport.
 for(int ty=top/64-1;ty<=(top+164)/64+1;ty++)for(int tx=left/64-1;tx<=(left+304)/64+1;tx++){
  if(tx<0||ty<0||tx>=sw/64||ty>=sh/64)continue;
  int x=tx*64-left,y=ty*64-top;
  if(x<=-64||x>=304||y<=-64||y>=164)continue;
  char tile[40];snprintf(tile,sizeof(tile),"map/%d_%d_%d.jpg",level,tx,ty);photo(viewport,tile,x,y,256);
 }
 int best=INT_MAX;map_selected=0;
 for(int i=0;i<OF_PLACE_COUNT;i++){int dx=of_places[i].x-map_x,dy=of_places[i].y-map_y,d=dx*dx+dy*dy;if(d<best){best=d;map_selected=i;}}
 for(int i=0;i<OF_PLACE_COUNT;i++){int x=of_places[i].x*factor/2-left,y=of_places[i].y*factor/2-top;if(x<2||x>295||y<2||y>154)continue;
  // Markers reuse the shrine raster, not a software-drawn world prop.
  const char *icon=!strcmp(of_places[i].kind,"shrine")?"map/shrine":!strcmp(of_places[i].kind,"tower")?"map/tower":"map/place";lv_obj_t *mark=picture(viewport,icon,x-4,y-4);if(mark){lv_image_set_pivot(mark,0,0);lv_image_set_scale(mark,i==map_selected?256:171);if(of_bit(of_state.places,i)){lv_obj_set_style_image_recolor(mark,lv_color_hex(CYAN),0);lv_obj_set_style_image_recolor_opa(mark,150,0);}} 
 }
 snprintf(message,sizeof(message),"%s · %s",of_text(of_places[map_selected].cn,of_places[map_selected].en),of_bit(of_state.places,map_selected)?of_text("已发现","FOUND"):of_text("未发现","UNKNOWN"));label(content,message,8,168,304,false,GOLD);
 static const char *axes_cn[]={"横移","纵移","缩放"},*axes_en[]={"PAN X","PAN Y","ZOOM"};snprintf(message,sizeof(message),"%s · %d× · %d/177",of_text(axes_cn[map_axis],axes_en[map_axis]),1<<(map_zoom-1),map_selected+1);lv_label_set_text(title,message);set_footer(of_text("上下移动/缩放 · OK 切换 · 长按目录","UP/DN pan/zoom · OK axis · hold home"));
}
static void home_grid(void){
 text_changed(title,of_text("主目录","MAIN MENU"));
 for(int i=0;i<8;i++){lv_obj_t *tile=box(content,8+(i%2)*154,8+(i/2)*41,148,35,CYAN,i==home_selection?85:20);select_style(tile,i==home_selection);label(tile,of_text(home_cn[i],home_en[i]),10,9,128,false,i==home_selection?GOLD:FG);}
 set_footer(of_text("上下选择 · OK 进入 · 长按返回","UP/DN select · OK enter · hold back"));
}
static void rune_grid(void){
 text_changed(title,of_text("符文选择","RUNES"));
 for(int i=0;i<9;i++){lv_obj_t *tile=box(content,8+(i%3)*68,7+(i/3)*55,64,51,CYAN,i==selected?85:10);select_style(tile,i==selected);char key[24];snprintf(key,sizeof(key),"ui/rune%d",i);picture(tile,key,19,3);
  lv_obj_t *name=label(tile,of_state.lang?of_rune_en[i]:of_rune_tile_cn[i],2,32,60,false,FG);lv_obj_set_style_text_font(name,&of_chinese_10,0);lv_obj_set_style_text_align(name,LV_TEXT_ALIGN_CENTER,0);lv_obj_set_height(name,16);lv_label_set_long_mode(name,LV_LABEL_LONG_SCROLL_CIRCULAR);
  if(of_state.completed&(1u<<i)){lv_obj_t *mark=label(tile,"*",2,1,12,false,GOLD);lv_obj_set_style_text_font(mark,&of_chinese_10,0);}
 }
 lv_obj_t *name=label(content,of_text(of_rune_cn[selected],of_rune_en[selected]),218,8,94,true,GOLD);lv_obj_set_height(name,21);lv_label_set_long_mode(name,LV_LABEL_LONG_SCROLL_CIRCULAR);
 scrolling_text(content,of_text(of_rune_desc_cn[selected],of_rune_desc_en[selected]),218,36,94,132);
 set_footer(of_text("上下选符文 · OK 使用 · 长按返回","UP/DN select rune · OK enter · hold back"));
}
static int pause_count(void){return game.id==5||(game.id==3&&game.phase==OF_ACTIVE)||game.id==8?4:3;}
static void pause_render(void){
 modal=box(screen,48,42,224,166,BG,255);
 label(modal,of_text(pause_mode==1?"相机缩放":pause_mode==2?"追踪目标":"已暂停",pause_mode==1?"CAMERA ZOOM":pause_mode==2?"TRACK TARGET":"PAUSED"),10,5,204,true,GOLD);
 if(pause_mode){int n=pause_mode==1?3:2;const char *zoom[]={"0.75x","1x","1.5x"};for(int i=0;i<n;i++){bool on=pause_mode==1?game.zoom==i:game.target_kind==i;
   lv_obj_t *r=box(modal,5,32+i*29,214,27,CYAN,on?90:0);label(r,pause_mode==1?zoom[i]:of_text(i?"蓝夜光草":"神庙",i?"BLUE NIGHTSHADE":"SHRINE"),6,4,200,false,FG);
  }if(pause_mode==2&&!game.tracking_unlocked){lv_obj_t *t=label(modal,of_text("先用照相机识别蓝夜光草","Identify blue nightshade with the Camera first"),6,115,210,false,CYAN);lv_obj_set_style_text_font(t,&of_chinese_10,0);}return;
 }
 int n=pause_count();const char *cn[]={"继续",game.id==5?"调整缩放":game.id==3?"提前解除":"追踪目标","重新开始","返回符文"};
 const char *en[]={"RESUME",game.id==5?"ZOOM":game.id==3?"RELEASE EARLY":"TRACK TARGET","RESTART","RUNES"};
 for(int i=0;i<n;i++){int action=n==3?(i==0?0:i+1):i;lv_obj_t *r=box(modal,5,32+i*29,214,27,CYAN,pause_choice==i?90:0);label(r,of_text(cn[action],en[action]),6,4,200,false,FG);}
}
static void inventory_grid(void){
 filter_items();selected=bounded(selected,0,filtered?filtered-1:0);int start=selected/20*20;
 for(int i=0;i<3;i++){lv_obj_t *tab=box(content,8+i*52,0,48,23,CYAN,category==i?65:0);char key[24];snprintf(key,sizeof(key),"ui/category%d",i);picture(tab,key,14,1);}
 for(int cell=0;cell<20;cell++){int pos=start+cell;bool exists=pos<filtered;int x=8+(cell%5)*32,y=28+(cell/5)*30;
  lv_obj_t *slot=box(content,x,y,30,28,BG,120);lv_obj_set_style_border_width(slot,1,0);lv_obj_set_style_border_color(slot,lv_color_hex(exists&&pos==selected?GOLD:0x31404a),0);
  if(!exists)continue;const of_item_t *e=of_inventory+ids[pos];bool equipped=of_state.equipped[slot_for(e)]==ids[pos];if(equipped){lv_obj_set_style_bg_color(slot,lv_color_hex(0x2580db),0);lv_obj_set_style_bg_opa(slot,180,0);}
  photo(slot,e->image,3,1,70);snprintf(message,sizeof(message),"%u",e->value);lv_obj_t *value=label(slot,message,12,16,17,false,FG);lv_obj_set_style_text_font(value,&of_chinese_10,0);
  unsigned extra=0;for(int i=0;i<3;i++)if(of_amiibo_gifts[i]==ids[pos])extra+=of_state.supplies[i];if(extra){snprintf(message,sizeof(message),"+%u",extra);lv_obj_t *badge=label(slot,message,1,0,28,false,GOLD);lv_obj_set_style_text_font(badge,&of_chinese_10,0);}
 }
 picture(content,"ui/link",205,22);
 if(selected<filtered){const of_item_t *e=of_inventory+ids[selected];lv_obj_t *name=label(content,name_of(e),174,0,140,true,GOLD);lv_obj_set_height(name,18);lv_label_set_long_mode(name,LV_LABEL_LONG_SCROLL_CIRCULAR);
  snprintf(message,sizeof(message),of_text("属性 %u","VALUE %u"),e->value);label(content,message,174,19,140,false,CYAN);
  lv_obj_t *panel=box(content,174,83,140,69,BG,210);scrolling_text(panel,body_of(e),4,3,132,63);
 }
 for(int i=0;i<5;i++)if(of_state.equipped[i]!=255)photo(content,of_inventory[of_state.equipped[i]].image,176+i*27,157,70);
 snprintf(message,sizeof(message),"%02d / %02d · %d/%d",selected/20+1,(filtered+19)/20,selected+1,filtered);lv_obj_t *pager=label(content,message,8,153,162,false,CYAN);lv_obj_set_style_text_font(pager,&of_chinese_10,0);
 set_footer(of_text("上下选装备 · OK 操作/分类 · 长按返回","UP/DN equipment · OK actions/category · hold back"));
 if(inventory_menu){int mx=bounded(8+(selected%5)*32+34,6,204),my=bounded(54+(selected%20/5)*30,30,126);modal=box(screen,mx,my,110,83,BG,255);
  const char *cn[]={of_state.equipped[slot_for(of_inventory+ids[selected])]==ids[selected]?"卸下":"装备","切换分类","取消"};const char *en[]={of_state.equipped[slot_for(of_inventory+ids[selected])]==ids[selected]?"UNEQUIP":"EQUIP","CATEGORY","CANCEL"};
  for(int i=0;i<3;i++){lv_obj_t *r=box(modal,3,3+i*26,104,25,CYAN,inventory_choice==i?90:0);label(r,of_text(cn[i],en[i]),5,5,94,false,FG);}
 }
}
static int album_count(void){int n=0;for(int i=0;i<12;i++)if(!(of_state.album_deleted&(1u<<i)))n++;return n;}
static int album_index(int pos){for(int i=0;i<12;i++)if(!(of_state.album_deleted&(1u<<i))&&pos--==0)return i;return 0;}
static void album_render(void){
 int count=album_count();selected=bounded(selected,0,count?count-1:0);snprintf(message,sizeof(message),of_text("相册 · %d/12","ALBUM · %d/12"),count);text_changed(title,message);
 if(!count){label(content,of_text("相册为空","ALBUM IS EMPTY"),65,70,220,true,GOLD);set_footer(of_text("长按返回","Hold OK to return"));return;}
 const of_album_t *a=&of_album[album_index(selected)];
 if(album_mode){
  photo(content,a->big,0,0,256);
  lv_obj_t *fade=box(content,0,137,320,103,BG,255);lv_obj_set_style_bg_grad_dir(fade,LV_GRAD_DIR_VER,0);lv_obj_set_style_bg_grad_color(fade,lv_color_hex(BG),0);lv_obj_set_style_bg_main_opa(fade,0,0);lv_obj_set_style_bg_grad_opa(fade,255,0);
  lv_obj_t *name=label(content,of_text(a->cn,a->en),9,154,302,true,GOLD);lv_obj_set_height(name,19);lv_label_set_long_mode(name,LV_LABEL_LONG_SCROLL_CIRCULAR);
  snprintf(message,sizeof(message),of_text("编号 %s    时间 %s","NO %s    TIME %s"),a->number+3,a->time);lv_obj_t *meta=label(content,message,9,178,302,false,CYAN);lv_obj_set_style_text_font(meta,&of_chinese_10,0);
  snprintf(message,sizeof(message),"%s  %s",of_text("地点","PLACE"),of_text(a->place_cn,a->place));meta=label(content,message,9,194,302,false,CYAN);lv_obj_set_style_text_font(meta,&of_chinese_10,0);lv_obj_set_height(meta,15);lv_label_set_long_mode(meta,LV_LABEL_LONG_SCROLL_CIRCULAR);
  snprintf(message,sizeof(message),"%d / %d",selected+1,count);lv_obj_t *counter=label(content,message,247,8,64,false,CYAN);lv_obj_set_style_text_align(counter,LV_TEXT_ALIGN_RIGHT,0);
  set_footer(of_text("上/下 切照片 · OK 菜单 · 长按返回","UP/DN photo · OK menu · hold back"));
 }else{
  for(int i=0;i<count;i++){const of_album_t *item=&of_album[album_index(i)];int x=8+(i%4)*77,y=5+(i/4)*58;lv_obj_t *tile=box(content,x,y,73,55,CYAN,i==selected?70:0);select_style(tile,i==selected);photo(tile,item->thumb,0,0,256);lv_obj_t *no=label(tile,item->number,2,41,69,false,FG);lv_obj_set_style_text_font(no,&of_chinese_10,0);}
  set_footer(of_text("上下选照片 · OK 查看 · 长按返回","UP/DN select · OK open · hold back"));
 }
 if(album_mode>=2){modal=box(screen,48,65,224,104,BG,255);label(modal,of_text(album_mode==3?"删除这张照片？":"照片操作",album_mode==3?"DELETE PHOTO?":"PHOTO ACTIONS"),8,5,208,true,GOLD);
  for(int i=0;i<2;i++){lv_obj_t *r=box(modal,5,32+i*31,214,28,CYAN,album_choice==i?90:0);label(r,of_text(i?(album_mode==3?"确认删除":"删除照片"):(album_mode==3?"取消":"返回浏览"),i?(album_mode==3?"DELETE":"DELETE PHOTO"):"BACK"),6,5,202,false,FG);}
 }
}
enum {SET_LANG,SET_VOLUME,SET_BRIGHTNESS,SET_SCANLINES,SET_STANDBY,SET_SCREEN,SET_CYCLE,SET_STYLE,SET_YEAR,SET_MONTH,SET_DAY,SET_HOUR,SET_MINUTE,SET_USB_TIME,SET_BATTERY,SET_DIAGNOSTICS,SET_RESET,SETTINGS_COUNT};
static int setting_value(int field){switch(field){case SET_LANG:return of_state.lang;case SET_VOLUME:return of_state.volume;case SET_BRIGHTNESS:return of_state.brightness;case SET_SCANLINES:return of_state.scanlines;case SET_STANDBY:return of_state.standby_delay;case SET_SCREEN:return of_state.idle_timeout;case SET_CYCLE:return of_state.standby_cycle;default:return of_state.standby_style;}}
static void setting_assign(int field,int value){switch(field){case SET_LANG:of_state.lang=value;break;case SET_VOLUME:of_state.volume=value;break;case SET_BRIGHTNESS:of_state.brightness=value;break;case SET_SCANLINES:of_state.scanlines=value;break;case SET_STANDBY:of_state.standby_delay=value;break;case SET_SCREEN:of_state.idle_timeout=value;break;case SET_CYCLE:of_state.standby_cycle=value;break;case SET_STYLE:of_state.standby_style=value;break;}of_state_dirty();}
static void battery_row_text(char *out,size_t capacity){
 if(battery>=0){if(battery_millivolts>=0)snprintf(out,capacity,"%s %d%% · %d mV",of_text("电量","BATTERY"),battery,battery_millivolts);else snprintf(out,capacity,"%s %d%%",of_text("电量","BATTERY"),battery);return;}
 const char *status=of_text(battery_status==BATTERY_READING?"电量读取中":battery_status==BATTERY_NO_DEVICE?"电量计未应答":battery_status==BATTERY_NOT_READY?"电量未就绪":"电量读取失败",battery_status==BATTERY_READING?"BATTERY READING":battery_status==BATTERY_NO_DEVICE?"GAUGE NOT RESPONDING":battery_status==BATTERY_NOT_READY?"SOC NOT READY":"BATTERY READ FAILED");
 if(battery_millivolts>=0)snprintf(out,capacity,"%s · %d mV",status,battery_millivolts);else snprintf(out,capacity,"%s",status);
}
static void settings_render(void){
 const char *cn[]={"语言","音量","亮度","扫描线","进入待机","待机后熄屏","自动切换画布","待机风格","年份","月份","日期","小时","分钟","USB 一键校时","电量","诊断信息","重置进度"};
 const char *en[]={"LANGUAGE","VOLUME","BRIGHTNESS","SCANLINES","ENTER STANDBY","SCREEN OFF AFTER","CANVAS INTERVAL","STANDBY STYLE","YEAR","MONTH","DAY","HOUR","MINUTE","USB TIME SYNC","BATTERY","DIAGNOSTICS","RESET PROGRESS"};
 int start=selected/6*6;for(int row=0;row<6&&start+row<SETTINGS_COUNT;row++){int i=start+row;char value[64]="";
  if(i==SET_LANG)snprintf(value,sizeof(value),"%s",of_state.lang?"ENGLISH":"简体中文");
  else if(i==SET_VOLUME||i==SET_BRIGHTNESS)snprintf(value,sizeof(value),"%d",setting_value(i));
  else if(i==SET_SCANLINES)snprintf(value,sizeof(value),"%s",of_text(of_state.scanlines?"开":"关",of_state.scanlines?"ON":"OFF"));
  else if(i>=SET_STANDBY&&i<=SET_CYCLE){unsigned seconds=i==SET_STANDBY?standby_seconds[of_state.standby_delay]:i==SET_SCREEN?screen_seconds[of_state.idle_timeout]:cycle_seconds[of_state.standby_cycle];if(seconds)snprintf(value,sizeof(value),"%us",seconds);else snprintf(value,sizeof(value),"%s",of_text(i==SET_CYCLE?"手动":"关闭",i==SET_CYCLE?"MANUAL":"OFF"));}
  else if(i==SET_STYLE)snprintf(value,sizeof(value),"%c · %s",'E'+of_state.standby_style,of_text(style_cn[of_state.standby_style],style_en[of_state.standby_style]));
  else if(i>=SET_YEAR&&i<=SET_MINUTE)snprintf(value,sizeof(value),"%d",of_clock_field(i-SET_YEAR));
  else if(i==SET_USB_TIME)snprintf(value,sizeof(value),"%s",of_text(of_clock_valid()?"已校时":"未校时",of_clock_valid()?"SET":"UNSET"));
  snprintf(message,sizeof(message),"%s %s%s",of_text(cn[i],en[i]),value,editing&&i==selected?" <":"");if(i==SET_BATTERY)battery_row_text(message,sizeof(message));list_row(row,message,i==selected);if(i==SET_BATTERY)settings_battery_row=row_labels[row];lv_obj_set_height(row_labels[row],20);lv_label_set_long_mode(row_labels[row],LV_LABEL_LONG_SCROLL_CIRCULAR);
 }
 if(selected>=SET_STANDBY&&selected<=SET_STYLE){lv_obj_t *hint=label(content,of_text("待机：上下切换风格，OK 进入目录","Standby: UP/DN styles, OK opens menu"),8,176,304,false,CYAN);lv_obj_set_style_text_font(hint,&of_chinese_10,0);lv_obj_set_height(hint,15);lv_label_set_long_mode(hint,LV_LABEL_LONG_SCROLL_CIRCULAR);}
 set_footer(of_text(editing?"上下修改 · OK 保存 · 长按取消":"上下选择 · OK 修改 · 长按目录",editing?"UP/DN edit · OK save · hold cancel":"UP/DN select · OK edit · hold home"));
 if(selected==SET_BATTERY)set_footer(of_text("电量仅供查看 · 长按返回目录","Read only · hold OK for menu"));
 if(settings_mode==1){modal=box(screen,24,44,272,152,BG,255);label(modal,of_text("诊断信息","DIAGNOSTICS"),8,4,256,true,GOLD);snprintf(message,sizeof(message),"HEAP %u\nMIN %u\nLARGEST %u",(unsigned)heap_caps_get_free_size(MALLOC_CAP_INTERNAL),(unsigned)heap_caps_get_minimum_free_size(MALLOC_CAP_INTERNAL),(unsigned)heap_caps_get_largest_free_block(MALLOC_CAP_INTERNAL));label(modal,message,8,32,256,false,FG);label(modal,of_state_save_error()?of_text("存档失败，等待重试","SAVE FAILED; RETRY PENDING"):of_state_save_pending()?of_text("存档待写入","SAVE PENDING"):of_text("存档状态正常","STORAGE OK"),8,108,256,false,CYAN);}
 if(settings_mode==2){modal=box(screen,40,60,240,124,BG,255);label(modal,of_text("重置进度和相册？","RESET PROGRESS / ALBUM?"),8,5,224,true,GOLD);for(int i=0;i<2;i++){lv_obj_t *r=box(modal,5,40+i*31,230,29,CYAN,confirm_choice==i?95:0);label(r,of_text(i?"确认重置":"取消",i?"RESET":"CANCEL"),6,4,218,false,FG);}}
 if(settings_mode==3){modal=box(screen,24,44,272,152,BG,255);label(modal,of_text("USB 一键校时","USB TIME SYNC"),8,5,256,true,GOLD);scrolling_text(modal,of_text("连接电脑，关闭串口监视器，双击电脑端的校时脚本。设备收到成功回复后时间才会更新。无需联网。\n\nOK / 长按关闭","Connect USB, close serial monitors, then double-click the PC time-sync launcher. Check its success reply. No network needed.\n\nOK / hold to close"),8,34,256,110);}
}
static void visible(lv_obj_t *o,bool on){if(!o)return;if(on)lv_obj_remove_flag(o,LV_OBJ_FLAG_HIDDEN);else lv_obj_add_flag(o,LV_OBJ_FLAG_HIDDEN);}
static void sprite_at(lv_obj_t *o,float cx,float cy,float w,float h){
 if(!o)return;const lv_image_dsc_t *d=lv_image_get_src(o);if(!d||!d->header.w||!d->header.h)return;
 lv_image_set_pivot(o,0,0);lv_image_set_scale_x(o,(uint32_t)fmaxf(1,w*256/d->header.w));lv_image_set_scale_y(o,(uint32_t)fmaxf(1,h*256/d->header.h));
 lv_obj_set_pos(o,(int)lroundf(cx-w/2),(int)lroundf(cy-h/2));
}
static void player_at(float x,float foot,float height,unsigned frame){
 if(!player)return;if(player_frame!=frame){char key[24];snprintf(key,sizeof(key),"link/%u",frame);const lv_image_dsc_t *d=of_image(key);if(d)lv_image_set_src(player,d);player_frame=frame;}
 sprite_at(player,x,foot-height*.45f,height*32/52,height);
}
static void game_render(void){
 text_changed(title,of_text(of_rune_cn[game.id],of_rune_en[game.id]));char key[32];snprintf(key,sizeof(key),"scene/%u",game.id);
 world=box(content,0,0,320,198,BG,0);memset(&art,0,sizeof(art));art.scene=picture(world,key,0,0);object_count=0;actor=player=effect=reward=NULL;player_frame=255;
 lv_obj_t *arena=box(world,0,0,320,153,BG,0);
 if(game.id<2){
  actor=picture(arena,game.id?"sprite/1":"sprite/0",0,0);objects[object_count++]=picture(arena,"sprite/3",0,0);art.blast=picture(arena,"fx/blast0",0,0);
  if(game.id==1){art.rock=picture(arena,"world/plinth",229,113);objects[object_count++]=picture(arena,"world/plinth",0,0);art.aim=box(arena,0,0,16,3,GOLD,220);}
 }
 else if(game.id==2){actor=picture(arena,"sprite/2",0,0);player=picture(arena,"link/0",0,0);art.beam=picture(arena,"fx/beam",0,0);}
 else if(game.id==3){actor=picture(arena,"sprite/3",0,0);player=picture(arena,"link/0",0,0);art.force=picture(arena,"world/force",0,0);
  art.lock=box(arena,0,0,42,42,GOLD,0);lv_obj_set_style_border_width(art.lock,1,0);lv_obj_set_style_border_color(art.lock,lv_color_hex(GOLD),0);
  art.reveal=picture(arena,"fx/reward",0,0);
  for(int i=0;i<7;i++){snprintf(message,sizeof(message),"%d m",i*50);art.marks[i]=label(arena,message,0,146,45,false,CYAN);lv_obj_set_style_text_font(art.marks[i],&of_chinese_10,0);}
 }
 else if(game.id==4){
  picture(arena,"world/shore",-8,101);picture(arena,"world/shore",286,101);art.gate=picture(arena,"world/gate",205,33);player=picture(arena,"link/0",0,0);
  for(int i=0;i<5;i++){objects[object_count++]=picture(arena,"sprite/4",0,0);char n[4];snprintf(n,sizeof(n),"%d",i+1);choices[i]=label(arena,n,of_ice_sites[i]-6,117,18,false,CYAN);}
  art.aim=box(arena,0,0,24,2,GOLD,230);
 }
 else if(game.id==5){
  for(int i=0;i<5;i++){snprintf(key,sizeof(key),"camera/%d_%u",i,game.zoom);objects[object_count++]=picture(arena,key,0,0);}
  art.rock=picture(arena,"sprite/3",0,0);art.aim=box(arena,122,61,76,60,CYAN,0);lv_obj_set_style_border_width(art.aim,1,0);lv_obj_set_style_border_color(art.aim,lv_color_hex(CYAN),0);
  art.lock=box(arena,0,0,20,20,GOLD,0);lv_obj_set_style_border_width(art.lock,1,0);lv_obj_set_style_border_color(art.lock,lv_color_hex(GOLD),0);
  box(arena,120,126,80,4,BG,200);art.bar=box(arena,120,126,1,4,GOLD,255);
  if(game.phase==OF_REVEAL){lv_obj_t *preview=box(arena,45,12,230,139,BG,245);
   label(preview,of_text(game.capture_valid?"识别成功":"未识别目标",game.capture_valid?"IDENTIFIED":"UNIDENTIFIED"),8,7,214,true,GOLD);
   if(game.capture_valid&&game.choice<5){const of_item_t *item=of_comp+of_camera_subjects[game.choice];photo(preview,item->image,8,32,256);scrolling_text(preview,name_of(item),106,34,116,77);}
   else scrolling_text(preview,of_text("目标需要完整入框、尺寸合适且没有岩石遮挡。","Frame the whole subject at a suitable size without rock occlusion."),10,35,210,82);
  }
 }
 else if(game.id==6){
  for(int i=0;i<3;i++){road_groups[i]=box(arena,0,136,320,62,BG,0);for(int j=0;j<2;j++)road_tiles[i][j]=picture(road_groups[i],"world/road",j*896,0);}
  actor=picture(arena,"sprite/5",0,0);objects[object_count++]=picture(arena,"sprite/3",0,0);effect=picture(arena,"world/destination",0,0);art.reveal=picture(arena,"world/splash",0,0);
 }
 else if(game.id==7){
  player=picture(arena,"link/0",0,0);art.shadow=picture(arena,"fx/shadow",0,0);art.beam=picture(arena,"fx/summon",0,0);
  actor=picture(arena,"sprite/6",0,0);effect=picture(arena,"sprite/7",0,0);objects[object_count++]=picture(arena,"sprite/13",0,0);art.reveal=picture(arena,"fx/reward",0,0);
  reward=photo(world,of_inventory[of_amiibo_gifts[game.choice]].image,0,0,70);
 }
 else{
  art.shade=box(arena,0,0,320,198,0,85);actor=picture(arena,game.target_kind?"camera/0_1":"sprite/15",0,0);art.reveal=picture(arena,"fx/reveal",0,0);
  for(int i=0;i<3;i++)choices[i]=label(arena,of_text(i==0?"左路":i==1?"直行":"右路",i==0?"LEFT":i==1?"AHEAD":"RIGHT"),25+i*105,119,90,false,CYAN);
  for(int i=0;i<4;i++)objects[object_count++]=box(arena,130+i*12,106,8,9,CYAN,40);
 }
 box(content,0,0,320,20,BG,170);game_info=label(content,"",8,1,304,false,GOLD);lv_obj_set_height(game_info,17);lv_label_set_long_mode(game_info,LV_LABEL_LONG_SCROLL_CIRCULAR);
 lv_obj_t *strip=box(world,0,153,320,19,BG,205);notice=label(strip,"",8,3,304,false,FG);lv_obj_set_style_text_font(notice,&of_chinese_10,0);lv_obj_set_style_text_align(notice,LV_TEXT_ALIGN_CENTER,0);lv_obj_set_height(notice,15);lv_label_set_long_mode(notice,LV_LABEL_LONG_SCROLL_CIRCULAR);
 lv_obj_t *button=box(world,8,176,228,18,CYAN,65);art.primary=label(button,"",5,3,218,false,FG);lv_obj_set_style_text_font(art.primary,&of_chinese_10,0);lv_obj_set_height(art.primary,15);lv_label_set_long_mode(art.primary,LV_LABEL_LONG_SCROLL_CIRCULAR);
 lv_obj_t *pause=box(world,242,176,70,18,CYAN,30);lv_obj_t *pause_text=label(pause,of_text("长按暂停","HOLD PAUSE"),3,3,64,false,CYAN);lv_obj_set_style_text_font(pause_text,&of_chinese_10,0);lv_obj_set_height(pause_text,15);lv_label_set_long_mode(pause_text,LV_LABEL_LONG_SCROLL_CIRCULAR);
 art.result=box(world,64,44,192,56,BG,225);lv_obj_t *result=label(art.result,"",8,18,176,true,GOLD);lv_obj_set_style_text_align(result,LV_TEXT_ALIGN_CENTER,0);visible(art.result,false);
 set_footer(of_text("长按 OK 暂停 / 菜单","Hold OK: pause / menu"));
}
static void game_draw(void){
 if(!world||!game_info)return;float x=game.x,y=game.y;
 if(game.id<2){
  visible(actor,game.id==0?game.phase==OF_ACTIVE:game.placed);sprite_at(actor,x,y,game.id?22:36,game.id?22:36);
  sprite_at(objects[0],game.id?264:257,game.id?87:125,48,48);lv_obj_set_style_opa(objects[0],game.phase==OF_WON?38:255,0);
  if(game.id==0&&actor)lv_image_set_rotation(actor,(int)(game.time*2%3600));
  if(game.id==1){sprite_at(art.rock,264,115,48,14);lv_obj_set_style_opa(art.rock,170,0);sprite_at(objects[1],game.platform,125,52,16);visible(art.aim,!game.placed);lv_obj_set_pos(art.aim,(int)game.cursor-8,136);}
  visible(art.blast,game.flash_ms>0);if(game.flash_ms){char key[24];snprintf(key,sizeof(key),"fx/blast%d",bounded((600-(int)game.flash_ms)/150,0,3));const lv_image_dsc_t *d=of_image(key);if(d)lv_image_set_src(art.blast,d);float blast_size=fmaxf(16,fminf(74,2*(151-game.shot_y)));sprite_at(art.blast,game.shot_x,game.shot_y,blast_size,blast_size);lv_obj_set_style_opa(art.blast,bounded((int)game.flash_ms*3*255/1000,0,255),0);}
  if(game.cooldown)snprintf(message,sizeof(message),of_text("冷却 %d.%d 秒","COOLDOWN %d.%ds"),(int)(game.cooldown/1000),(int)(game.cooldown/100%10));
  else if(game.id==0)snprintf(message,sizeof(message),of_text("投掷力度 %d%%","THROW POWER %d%%"),(int)game.power);
  else snprintf(message,sizeof(message),"%s",of_text(game.placed?"方弹已放置":"平台连续运行",game.placed?"CUBE PLACED":"PLATFORM MOVING"));
 }
 else if(game.id==2){
  bool left,right;of_magnet_support(&game,&left,&right);sprite_at(actor,x,y+2.5f,148,17);lv_image_set_pivot(actor,74,8);lv_image_set_rotation(actor,(int)(game.roll*1800/3.14159265f));
  lv_obj_set_style_image_recolor(actor,lv_color_hex(GOLD),0);lv_obj_set_style_image_recolor_opa(actor,game.held?100:0,0);
  float walk=game.phase==OF_CROSS?smooth(game.phase_ms/3200.0f):game.phase==OF_WON?1:0;player_at(26+walk*260,of_geometry.top,38,game.held?3:walk>0&&walk<1?1+(game.time/160)%2:0);
  visible(art.beam,game.held);if(game.held){float dx=x-40,dy=y-58,length=hypotf(dx,dy);sprite_at(art.beam,40,58+length/2,8,length);lv_image_set_pivot(art.beam,4,0);lv_image_set_rotation(art.beam,(int)(atan2f(dy,dx)*1800/3.14159265f)-900);}
  snprintf(message,sizeof(message),"%s",of_text(game.lifting?"铁板抬升中":game.held?(left&&right?"两端已对齐 · OK 放下":"搬运铁板，对齐两岸"):game.phase==OF_CROSS?"桥面稳定，正在通过":"铁板搭桥",game.lifting?"LIFTING":game.held?(left&&right?"ALIGNED · OK DROP":"ALIGN BOTH BANKS"):game.phase==OF_CROSS?"CROSSING":"BRIDGE THE GAP"));
 }
 else if(game.id==3){
  float sx=x-game.camera,sy=y-game.camera_y;sprite_at(actor,sx,sy,36,36);lv_image_set_pivot(actor,24,24);lv_image_set_rotation(actor,(int)(game.roll*1800/3.14159265f));
  lv_obj_set_style_image_recolor(actor,lv_color_hex(GOLD),0);lv_obj_set_style_image_recolor_opa(actor,game.phase==OF_ACTIVE?120:0,0);
  player_at(25-game.camera,138-game.camera_y,38,game.phase==OF_ACTIVE?3:0);
  visible(art.lock,game.phase==OF_ACTIVE);lv_obj_set_pos(art.lock,(int)sx-21,(int)sy-21);
  bool aiming=game.phase==OF_READY||game.phase==OF_ACTIVE;visible(art.force,aiming);if(aiming){float width=20+game.hits*12;sprite_at(art.force,sx+width/2,sy,width,14);lv_image_set_pivot(art.force,0,7);lv_image_set_rotation(art.force,(int)(game.angle*1800/3.14159265f));lv_obj_set_style_image_recolor(art.force,lv_color_hex(game.hits==6?0xff7e32:GOLD),0);lv_obj_set_style_image_recolor_opa(art.force,game.hits==6?130:0,0);}
  visible(art.reveal,game.pulse_ms>0);if(game.pulse_ms){sprite_at(art.reveal,sx,sy,50,50);lv_obj_set_style_opa(art.reveal,game.pulse_ms*200/200,0);}
  for(int i=0;i<7;i++){int px=(int)(i*300-game.camera);lv_obj_set_pos(art.marks[i],px,138-(int)game.camera_y);visible(art.marks[i],px> -45&&px<320);}
  snprintf(message,sizeof(message),of_text("蓄力 %u/6 · %d.%ds · 距离 %dm","HITS %u/6 · %d.%ds · %dm"),game.hits,(int)game.freeze_ms/1000,(int)game.freeze_ms/100%10,(int)game.distance);
 }
 else if(game.id==4){
  for(int i=0;i<5;i++){bool on=game.ice&(1u<<i);visible(objects[i],on);if(on){float rise=smooth((game.time-game.ice_birth[i])/450.0f);sprite_at(objects[i],of_ice_sites[i],112-33*rise,55,fmaxf(1,66*rise));}lv_obj_set_style_text_color(choices[i],lv_color_hex(i==game.choice?GOLD:CYAN),0);}
  float gate=game.gate?smooth((game.time-game.ice_birth[4])/450.0f):0;lv_obj_set_y(art.gate,33-(int)(gate*112));lv_obj_set_pos(art.aim,(int)game.cursor-12,113);
  player_at(game.x,game.y,38*game.walker_scale,game.phase==OF_CROSS?1+(game.time/160)%2:0);
  snprintf(message,sizeof(message),of_text("落点 %u · 冰柱 %u/3 · %s","SITE %u · ICE %u/3 · %s"),game.choice+1,game.pillar_count,of_text(game.gate?"闸门开启":"闸门关闭",game.gate?"GATE OPEN":"GATE CLOSED"));
 }
 else if(game.id==5){
  for(int i=0;i<5;i++){float px,py,size;of_camera_geometry(&game,i,&px,&py,&size);sprite_at(objects[i],px,py,size,size);}
  float z=of_camera_zoom(&game);sprite_at(art.rock,160+(260-game.x*.6f)*z,130,43*z,43*z);
  bool found=game.focus_target>=0&&game.phase==OF_READY;visible(art.lock,found);if(found){float px,py,size;of_camera_geometry(&game,game.focus_target,&px,&py,&size);lv_obj_set_pos(art.lock,(int)(px-size/2-6),(int)(py-size/2-6));lv_obj_set_size(art.lock,(int)size+12,(int)size+12);}
  lv_obj_set_width(art.bar,bounded((int)(game.focus_ms*80/700),1,80));int seen=0;for(int i=0;i<5;i++)seen+=(game.seen>>i)&1;
  snprintf(message,sizeof(message),of_text("识别 %d/5 · %s · %s","SEEN %d/5 · %s · %s"),seen,game.zoom==0?"0.75x":game.zoom==1?"1x":"1.5x",of_text(game.focus_ms>=700?"对焦完成":"等待对焦",game.focus_ms>=700?"FOCUSED":"FOCUSING"));
 }
 else if(game.id==6){
  float cam=fmaxf(0,game.world-66);float starts[]={0,402,797},ends[]={350,745,1550};
  for(int i=0;i<3;i++){int left=(int)(starts[i]-cam),right=(int)(ends[i]-cam),l=bounded(left,0,320),r=bounded(right,0,320);visible(road_groups[i],r>l);
   if(r>l){lv_obj_set_pos(road_groups[i],l,136);lv_obj_set_width(road_groups[i],r-l);int offset=((int)cam+l)%896;for(int j=0;j<2;j++)if(road_tiles[i][j])lv_obj_set_x(road_tiles[i][j],j*896-offset);}
  }
  sprite_at(actor,game.world-cam,game.y+of_geometry.cycle_height-24,62,48);lv_image_set_pivot(actor,31,24);lv_image_set_rotation(actor,game.phase==OF_CRASH||game.phase==OF_LOST?200:game.grounded?0:-70);
  sprite_at(objects[0],550-cam,136-of_geometry.rock_ground,20,20);sprite_at(effect,1160-cam,123.5f,25,25);
  visible(art.reveal,game.phase==OF_CRASH&&of_cycle_gap(game.world));if(game.phase==OF_CRASH)sprite_at(art.reveal,game.world-cam,150,60,36);
  const float hazards[]={350,550,745};bool cue=false;for(int i=0;i<3;i++)if(hazards[i]-game.world>28&&hazards[i]-game.world<110)cue=true;
  snprintf(message,sizeof(message),of_text("路程 %d%% · %s","ROUTE %d%% · %s"),bounded((int)lroundf(game.world/11),0,100),of_text(cue?"准备跳跃":game.phase==OF_CRASH?"撞击 / 落水中":"自动骑行",cue?"GET READY TO JUMP":game.phase==OF_CRASH?"CRASHING":"AUTO RIDE"));
 }
 else if(game.id==7){
  bool landed=game.phase==OF_SETTLE||game.phase==OF_CHEST||game.phase==OF_APPROACH||game.phase==OF_REVEAL||game.phase==OF_REWARD||game.phase==OF_CROSS||game.phase==OF_CLAIMED;
  bool opening=game.phase==OF_REVEAL||game.phase==OF_REWARD||game.phase==OF_CROSS||game.phase==OF_CLAIMED;
  float u=game.phase==OF_REVEAL?smooth((game.phase_ms-120.0f)/550):opening?1:0;
  visible(art.beam,game.phase==OF_LIFT||game.phase==OF_DROP);sprite_at(art.beam,190,91,28,76);
  visible(art.shadow,game.phase==OF_DROP||landed);sprite_at(art.shadow,190,144,44,6);lv_obj_set_style_opa(art.shadow,(int)(unit((game.y-42)/69)*166),0);
  visible(actor,game.phase==OF_DROP||landed);sprite_at(actor,190,game.y,67,67);lv_obj_set_style_opa(actor,(int)((1-u)*255),0);
  visible(effect,opening);sprite_at(effect,190,game.y-2.5f,67,67);lv_obj_set_style_opa(effect,(int)(u*255),0);
  visible(objects[0],(game.phase==OF_DROP||landed)&&game.phase!=OF_CROSS&&game.phase!=OF_CLAIMED);sprite_at(objects[0],228,game.y+20,26,26);
  player_at(game.walker_x,141+(game.phase==OF_APPROACH?sinf(game.phase_ms/650.0f*3.14159265f*4)*.7f:0),68,game.phase==OF_APPROACH?1+(game.time/160)%2:0);
  float reveal=game.phase==OF_REVEAL?smooth((game.phase_ms-350.0f)/450):1,collect=game.phase==OF_CROSS?smooth(game.phase_ms/550.0f):0;
  bool shown=opening&&game.phase!=OF_CLAIMED;visible(reward,shown);visible(art.reveal,shown);if(shown){float rx=(190+56*reveal)*(1-collect)+300*collect,ry=(game.y-8+(82-(game.y-8))*reveal)*(1-collect)+24*collect;
   // Equipment is a native 24px transparent raster; only raw raster scaling occurs during collection.
   sprite_at(reward,rx,ry,22*(1-collect*.65f),22*(1-collect*.65f));lv_obj_set_style_opa(reward,(int)(reveal*(1-collect)*255),0);sprite_at(art.reveal,rx,ry,46,46);lv_obj_set_style_opa(art.reveal,(int)(reveal*(1-collect)*100),0);
  }
  const char *cn[]={"林克（弓）","林克（骑乘）","波克布林"},*en[]={"Link (Archer)","Link (Rider)","Bokoblin"};
  const of_item_t *gift=of_inventory+of_amiibo_gifts[game.choice];const lv_image_dsc_t *gift_image=equipment_source(gift->image,24);if(reward&&gift_image&&lv_image_get_src(reward)!=gift_image)lv_image_set_src(reward,gift_image);snprintf(message,sizeof(message),"%s",game.phase==OF_READY?of_text(cn[game.choice],en[game.choice]):name_of(gift));
 }
 else{
  float tx=game.target_kind?90:190,ty=game.target_kind?50:40,dist=hypotf(tx-x,ty-y),angle=atan2f(ty-y,tx-x)-game.heading;
  bool revealing=game.phase==OF_REVEAL||game.phase==OF_WON;float u=revealing?smooth(game.phase_ms/3200.0f):0;if(game.phase==OF_WON)u=1;
  float approach=unit(1-dist/250),scale=1+approach*.16f+u*.18f;
  if(art.scene&&!game.target_kind){lv_image_set_pivot(art.scene,160,104);lv_image_set_scale(art.scene,(int)(scale*256));}
  lv_obj_set_style_bg_opa(art.shade,(int)((1-approach)*90*(1-u)),0);
  bool found=game.phase==OF_WON;visible(actor,game.target_kind&&(found||cosf(angle)>-.12f));float size=found?96:fmaxf(54,fminf(88,114-dist*.24f));sprite_at(actor,found?168:160+sinf(angle)*104,100,size,size);
  visible(art.reveal,revealing);if(revealing){sprite_at(art.reveal,168,100,96*(.6f+u*1.3f),70*(.6f+u*1.3f));lv_obj_set_style_opa(art.reveal,(int)(sinf(3.14159265f*u)*178),0);}
  for(int i=0;i<3;i++){visible(choices[i],!revealing);lv_obj_set_style_text_color(choices[i],lv_color_hex(game.choice==i?GOLD:CYAN),0);}
  for(unsigned i=0;i<object_count;i++){visible(objects[i],!revealing);lv_obj_set_style_bg_opa(objects[i],i<game.signal?255:40,0);}
  snprintf(message,sizeof(message),"%s · %s",of_text(game.target_kind?"蓝夜光草":"追踪神庙",game.target_kind?"BLUE NIGHTSHADE":"SHRINE"),of_text(revealing?"发现目标":game.walking?"沿路前进中":game.stage?"此路不通，请换路":"比较三条路的信号",revealing?"DISCOVERED":game.walking?"WALKING":game.stage?"BLOCKED: CHOOSE ANOTHER PATH":"COMPARE SIGNALS"));
 }
 text_changed(game_info,message);
 static const char *tips_cn[]={"靠近岩石后引爆","对准平台放置，在高台旁引爆","铁板两端都要搭住岸边","锁定后击打蓄力，调整释放角度","选三处落点，冰柱可抬起闸门","完整入框，等待对焦后拍摄","观察前方缺口和岩石","宝箱落稳后，按 OK 开箱","比较三条路的信号强度"};
 static const char *tips_en[]={"Detonate beside the rocks","Place on platform; detonate by rocks","Rest both slab ends on the banks","Freeze, strike and aim the release","Three ice pillars; lift the gate","Frame the subject and wait for focus","Watch the gaps and the rock ahead","Wait for landing, then OK to open","Compare the three paths' signals"};
 const char *tip=of_text(tips_cn[game.id],tips_en[game.id]);
 if(game.id<2&&game.cooldown)tip=of_text("等待冷却后再操作","Wait for the cooldown");
 else if(game.id==7&&game.phase==OF_REWARD)tip=of_text("奖励已出现，按 OK 收入背包","Press OK to collect the reward");
 else if(game.id==5&&game.phase==OF_REVEAL)tip=of_text("临时预览，不写入固定相册","Temporary preview; album stays fixed");
 text_changed(notice,tip);
 const char *action=of_game_hint(&game);
 if(game.id==0)action=of_text(game.phase==OF_READY?"OK 投掷":game.phase==OF_ACTIVE?"OK 引爆":game.cooldown?"冷却中":"OK 再试一次",game.phase==OF_READY?"OK THROW":game.phase==OF_ACTIVE?"OK DETONATE":game.cooldown?"COOLDOWN":"OK RETRY");
 else if(game.id==1)action=of_text(game.placed?"OK 引爆":"OK 放置方弹",game.placed?"OK DETONATE":"OK PLACE CUBE");
 else if(game.id==2)action=of_text(game.lifting?"铁板抬升中":game.held?"OK 放下铁板":game.phase==OF_READY?"OK 抓取铁板":"等待铁板落稳 / 通行",game.lifting?"LIFTING":game.held?"OK DROP":game.phase==OF_READY?"OK GRAB":"SETTLING / CROSSING");
 else if(game.id==3)action=of_text(game.phase==OF_READY?"OK 锁定":game.phase==OF_ACTIVE?(game.hits==6?"OK 解除":"OK 击打"):"势能释放中",game.phase==OF_READY?"OK FREEZE":game.phase==OF_ACTIVE?(game.hits==6?"OK RELEASE":"OK STRIKE"):"ENERGY RELEASED");
 else if(game.id==4)action=of_text(game.phase==OF_READY?((game.ice&(1u<<game.choice))?"OK 碎冰":"OK 造冰"):"冰柱通行中",game.phase==OF_READY?((game.ice&(1u<<game.choice))?"OK SHATTER":"OK CREATE ICE"):"CROSSING");
 else if(game.id==5)action=of_text(game.phase==OF_REVEAL?"OK 返回取景":"OK 快门",game.phase==OF_REVEAL?"OK RETURN TO CAMERA":"OK SHUTTER");
 else if(game.id==6)action=of_text(game.phase==OF_READY?"OK 开始骑行":"OK / 上 起跳",game.phase==OF_READY?"OK START RIDING":"OK / UP JUMP");
 else if(game.id==7)action=of_text(game.phase==OF_READY?"OK 读取":game.phase==OF_CHEST?"OK 走近开箱":game.phase==OF_REWARD?"OK 收取奖励":game.phase==OF_CLAIMED?"OK 再次体验":"动画播放中",game.phase==OF_READY?"OK SCAN":game.phase==OF_CHEST?"OK OPEN CHEST":game.phase==OF_REWARD?"OK COLLECT":game.phase==OF_CLAIMED?"OK AGAIN":"ANIMATING");
 else action=of_text(game.walking?"沿路前进中":game.phase==OF_REVEAL?"目标显现中":game.phase==OF_WON&&!game.target_kind?"OK 在地图查看":"OK 走这条路",game.walking?"WALKING":game.phase==OF_REVEAL?"REVEALING":game.phase==OF_WON&&!game.target_kind?"OK VIEW MAP":"OK TAKE THIS PATH");
 if(game.id<2&&game.cooldown)action=of_text("冷却中","COOLDOWN");
 if(game.phase==OF_WON||game.phase==OF_LOST)action=of_game_hint(&game);
 text_changed(art.primary,action);
 bool done=game.phase==OF_WON||game.phase==OF_LOST||game.phase==OF_CLAIMED;visible(art.result,done);
 if(done){lv_obj_t *t=lv_obj_get_child(art.result,0);text_changed(t,of_text(game.phase==OF_LOST?"再试一次":game.id==8?(game.target_kind?"蓝夜光草已发现":"神庙已发现"):game.id==7?"奖励已收入背包":"完成",game.phase==OF_LOST?"TRY AGAIN":game.id==8?"DISCOVERED":game.id==7?"REWARD COLLECTED":"COMPLETE"));}
 set_footer(of_text(game.id==5&&game.phase==OF_REVEAL?"OK / 长按 OK 返回取景":of_game_hint(&game),game.id==5&&game.phase==OF_REVEAL?"OK / hold OK: return to camera":of_game_hint(&game)));
}
static void standby_update(uint32_t now){
 char time_text[24],date_text[96];of_clock_text(time_text,sizeof(time_text),date_text,sizeof(date_text));text_changed(standby_clock,time_text);text_changed(standby_date,date_text);

 visible(standby_toast,(uint32_t)(now-standby_changed_at)<3500);
}
static void standby_render(void){
 unsigned style=of_state.standby_style;bool portrait=style>=3,ink=style==2,gold=style==5;int w=portrait?240:320,h=portrait?320:240;
 uint32_t fg=ink?0x4b2c0d:FG,accent=ink?0x654419:gold?GOLD:CYAN;
 if(style!=5){char key[32];snprintf(key,sizeof(key),"standby/%u.jpg",style);photo(content,key,0,0,256);}
 else{box(content,0,0,w,h,0x060604,255);for(int i=0;i<4;i++){int x=i%2?w-8:8,y=i/2?h-8:8;box(content,i%2?x-24:x,y,24,1,0x66502d,255);box(content,x,i/2?y-24:y,1,24,0x66502d,255);lv_obj_t *dot=box(content,x-3,y-3,7,7,0x91713c,0);lv_obj_set_style_border_width(dot,1,0);lv_obj_set_style_border_color(dot,lv_color_hex(0x91713c),0);lv_obj_set_style_radius(dot,4,0);}}

 if(style==1||style==4){lv_obj_t *shade=box(content,0,0,w,h,0,130);lv_obj_set_style_bg_grad_dir(shade,LV_GRAD_DIR_VER,0);lv_obj_set_style_bg_grad_color(shade,lv_color_black(),0);lv_obj_set_style_bg_main_opa(shade,0,0);lv_obj_set_style_bg_grad_opa(shade,130,0);}
 const int logo_y[]={20,22,20,26,66,28},logo_w[]={128,154,136,158,148,156},eye_y[]={78,86,84,110,126,110},eye_size[]={52,42,48,64,46,58},clock_y[]={139,141,146,208,216,190},date_y[]={195,187,194,265,263,249};
 lv_obj_t *logo=picture(content,of_state.lang?"ui/title_en":"ui/title_cn",(w-logo_w[style])/2,logo_y[style]);
 if(logo){const lv_image_dsc_t *d=lv_image_get_src(logo);lv_image_set_pivot(logo,0,0);lv_image_set_scale(logo,logo_w[style]*256/d->header.w);if(ink){lv_obj_set_style_image_recolor(logo,lv_color_hex(fg),0);lv_obj_set_style_image_recolor_opa(logo,255,0);}}
 lv_obj_t *eye=picture(content,"ui/eye",(w-eye_size[style])/2,eye_y[style]);if(eye){const lv_image_dsc_t *d=lv_image_get_src(eye);lv_image_set_pivot(eye,0,0);lv_image_set_scale(eye,eye_size[style]*256/d->header.w);if(ink||gold){lv_obj_set_style_image_recolor(eye,lv_color_hex(accent),0);lv_obj_set_style_image_recolor_opa(eye,255,0);}}
 standby_clock=label(content,"",8,clock_y[style],w-16,true,fg);lv_obj_set_style_text_font(standby_clock,style==0||style==3||style==5?&of_clock_52:&of_clock_40,0);lv_obj_set_style_text_align(standby_clock,LV_TEXT_ALIGN_CENTER,0);
 standby_date=label(content,"",8,date_y[style],w-16,false,accent);lv_obj_set_style_text_font(standby_date,&of_chinese_10,0);lv_obj_set_style_text_align(standby_date,LV_TEXT_ALIGN_CENTER,0);
 standby_brand=label(content,"AI PASSPORT · SHEIKAH SLATE",8,h-20,w-16,false,ink?0x6b5029:gold?GOLD:0x91b0b8);lv_obj_set_style_text_font(standby_brand,&of_chinese_10,0);lv_obj_set_style_text_align(standby_brand,LV_TEXT_ALIGN_CENTER,0);
 snprintf(message,sizeof(message),"%c · %s  %u/6",'E'+style,of_text(style_cn[style],style_en[style]),style+1);standby_toast=label(content,message,8,3,w-16,false,accent);lv_obj_set_style_text_font(standby_toast,&of_chinese_10,0);lv_obj_set_height(standby_toast,14);lv_label_set_long_mode(standby_toast,LV_LABEL_LONG_SCROLL_CIRCULAR);
 standby_update(lv_tick_get());
}
static void render(void){
 // Load a new root before deleting the previous tree. No decoder is left pointing at reused descriptors.
 lv_display_t *display=lv_display_get_default();lv_display_rotation_t rotation=resource_ok&&page==P_STANDBY&&of_state.standby_style>=3?LV_DISPLAY_ROTATION_90:LV_DISPLAY_ROTATION_0;
 if(lv_display_get_rotation(display)!=rotation)lv_display_set_rotation(display,rotation);
 standby_clock=standby_date=standby_brand=standby_toast=settings_battery_row=NULL;
 scroll_count=0;lv_obj_t *old=screen;screen=lv_obj_create(NULL);lv_obj_remove_style_all(screen);lv_obj_set_style_bg_color(screen,lv_color_hex(BG),0);lv_obj_set_style_bg_opa(screen,255,0);lv_screen_load(screen);if(old)lv_obj_delete(old);lv_image_cache_drop(NULL);of_resources_page_reset();image_path_count=0;save_warning=scan_overlay=NULL;modal=NULL;world=actor=player=effect=game_info=notice=NULL;
 title=label(screen,"AI PASSPORT",8,5,304,true,CYAN);lv_obj_set_height(title,18);lv_label_set_long_mode(title,LV_LABEL_LONG_SCROLL_CIRCULAR);content=box(screen,0,24,320,198,BG,0);footer=label(screen,"",8,222,304,false,CYAN);
 if(!resource_ok){label(content,"RESOURCE PACK ERROR",8,10,304,true,GOLD);label(content,of_resource_error(),8,44,304,false,FG);label(content,"Upload the matching resources.bin to 0x410000. Firmware and pack versions must match.",8,80,304,false,FG);return;}
 if(page==P_STANDBY||(page==P_ALBUM&&album_mode)){lv_obj_add_flag(title,LV_OBJ_FLAG_HIDDEN);lv_obj_set_pos(content,0,0);lv_obj_set_size(content,lv_display_get_horizontal_resolution(display),lv_display_get_vertical_resolution(display));}
 switch(page){
 case P_STANDBY:lv_obj_add_flag(footer,LV_OBJ_FLAG_HIDDEN);standby_render();break;
 case P_HOME:home_grid();
 break;
 case P_RUNES:rune_grid();
 break;
 case P_INVENTORY:inventory_grid();
 break;
 case P_COMP:case P_QUEST:read_item();
 break;
 case P_ALBUM:album_render();
 break;
 case P_MAP:map_render();
 break;
 case P_GAME:game_render();
 game_draw();
 if(paused)pause_render();
 break;
 case P_SETTINGS:settings_render();
 break;
 }
 if((page==P_INVENTORY||page==P_COMP||page==P_QUEST)&&editing)category_menu();
 scan_overlay=NULL;if(of_state.scanlines){scan_overlay=lv_image_create(screen);lv_image_set_src(scan_overlay,&scan_image);lv_obj_set_size(scan_overlay,lv_display_get_horizontal_resolution(display),lv_display_get_vertical_resolution(display));lv_image_set_inner_align(scan_overlay,LV_IMAGE_ALIGN_TILE);lv_obj_remove_flag(scan_overlay,LV_OBJ_FLAG_CLICKABLE);}
 save_warning=label(screen,of_text("存档失败，正在重试","SAVE FAILED; RETRYING"),8,0,304,false,GOLD);if(!of_state_save_error())lv_obj_add_flag(save_warning,LV_OBJ_FLAG_HIDDEN);
}
static void events(void){
 uint32_t ev=game.events;game.events=0;if(!ev)return;
 if(ev&OF_EV_RELEASE){if(game.id==2)of_audio_stop_kind("magnet_move");if(game.id==3)of_audio_stop_kind("stasis_timer");
  const char *sound=game.id<2?"boom":game.id==2?"magnet_release":game.id==3?(game.hits<=2?"stasis_release_1":game.hits<=4?"stasis_release_2":"stasis_release_3"):"ok";of_audio_play(sound,false,true);
 }
 if(ev&OF_EV_OPEN)of_audio_play("chest_open",false,true);
 if(ev&OF_EV_BREAK)of_audio_play("ice_break",false,true);
 if(ev&OF_EV_TIMER)of_audio_play("stasis_timer",false,true);
 if(ev&OF_EV_HIT)of_audio_play(game.hits==6?"stasis_hit_end":"stasis_hit",false,true);
 if(ev&OF_EV_DETECT)of_audio_play("detect",false,true);
 if(ev&OF_EV_FOUND)of_audio_play("found",false,true);
 if(ev&OF_EV_SENSOR)of_audio_play("sensor",false,false);
 if(ev&OF_EV_ACTION){const char *sound=game.id<2?"place":game.id==2?"magnet_catch":game.id==3?"stasis_start":game.id==4?"cryonis":game.id==5?"shutter":game.id==7?"amiibo":"ok";of_audio_play(sound,false,true);}
 if(ev&OF_EV_COLLECT){if(of_state.supplies[game.choice]<UINT16_MAX)of_state.supplies[game.choice]++;of_state_dirty();of_audio_play("ok",false,true);}
 if(ev&OF_EV_FAIL)of_audio_play("invalid",false,true);
 if(ev&OF_EV_WIN){
  if(game.id!=5||game.seen==31)of_state.completed|=1u<<game.id;
  if(game.id==8&&!game.target_kind)for(int i=0;i<OF_PLACE_COUNT;i++)if(!strcmp(of_places[i].en,"Namika Ozz Shrine")){of_set_bit(of_state.places,i,true);break;}
  of_state_dirty();of_audio_play("complete",false,true);
 }
}
static bool magnet_sounding;
static void tick(lv_timer_t *timer){
 (void)timer;if(!resource_ok)return;uint32_t now=lv_tick_get(),dt=now-last_tick;last_tick=now;
 if(of_resource_error()){resource_ok=false;of_audio_stop();render();return;}
 of_state_tick(now);visible(save_warning,of_state_save_error());
 if(now-diagnostic_at>=60000){diagnostic_at=now;ESP_LOGI("offline","heap free=%u min=%u largest=%u",(unsigned)heap_caps_get_free_size(MALLOC_CAP_INTERNAL),(unsigned)heap_caps_get_minimum_free_size(MALLOC_CAP_INTERNAL),(unsigned)heap_caps_get_largest_free_block(MALLOC_CAP_INTERNAL));}
 bool busy=page==P_GAME&&!paused&&game.phase!=OF_WON&&game.phase!=OF_LOST&&game.phase!=OF_CLAIMED&&!(game.id==5&&game.phase==OF_REVEAL);
 if(busy)last_activity=now;
 if(!blanked&&!busy&&!editing&&page!=P_STANDBY&&of_state.standby_delay&&now-last_activity>=standby_seconds[of_state.standby_delay]*1000u){show(P_STANDBY);return;}
 uint32_t idle_since=page==P_STANDBY&&now-standby_entered_at<now-last_activity?standby_entered_at:last_activity;
 if(!blanked&&of_state.idle_timeout&&now-idle_since>=screen_seconds[of_state.idle_timeout]*1000u){of_state_flush();of_audio_stop();bsp_display_backlight(0);blanked=true;held_key=-1;}
 if(blanked)return;
 if(now-battery_at>=1000){battery=atomic_load(&battery_sample);battery_millivolts=atomic_load(&battery_voltage_sample);battery_status=atomic_load(&battery_status_sample);battery_at=now;if(page==P_SETTINGS&&settings_battery_row){battery_row_text(message,sizeof(message));text_changed(settings_battery_row,message);}}
 if(held_key>=0&&(page!=P_GAME||paused)&&now-held_at>=(repeat_started?120u:380u)){
  int key=held_key;uint32_t before=generation;of_app_key(key,false);
  if(before==generation){held_at=now;repeat_started=true;}else held_key=-1;
 }
 if(page==P_GAME&&!paused){
  of_game_direction(&game,held_key==BSP_BTN_UP?-1:held_key==BSP_BTN_DOWN?1:0);
  uint32_t remaining=dt>200?200:dt;while(remaining){uint32_t step=remaining>40?40:remaining;of_game_step(&game,step);events();remaining-=step;}
  bool moving=game.id==2&&game.held&&(game.lifting||game.input);
  if(moving&&!magnet_sounding)of_audio_play("magnet_move",true,true);
  if(!moving&&magnet_sounding){of_audio_stop_kind("magnet_move");if(game.held)of_audio_play("magnet_stop",false,true);}magnet_sounding=moving;
  game_draw();
 }
 scroll_tick(dt>200?200:dt);
 if(page==P_STANDBY){
  if(of_state.standby_cycle&&now-standby_changed_at>=cycle_seconds[of_state.standby_cycle]*1000u){of_state.standby_style=(of_state.standby_style+1)%OF_STANDBY_STYLES;standby_changed_at=now;generation++;render();return;}
  if(now-refresh_at>=1000){refresh_at=now;standby_update(now);}
 }
}
void of_app_init(void){
 for(unsigned x=0;x<320;x++)scan_pixels[(320+x)*4+3]=80;lv_image_cache_resize(24576,true);of_state_load();of_clock_init();last_activity=lv_tick_get();bsp_display_backlight(of_state.brightness*20);of_audio_init();of_audio_settings();resource_ok=of_resources_init();if(xTaskCreate(battery_worker,"slate_battery",3072,NULL,1,NULL)!=pdPASS)ESP_LOGW("offline","Battery worker unavailable");battery=atomic_load(&battery_sample);last_tick=lv_tick_get();render();lv_timer_create(tick,33,NULL);
 ESP_LOGI("offline","boot free=%u largest=%u",(unsigned)heap_caps_get_free_size(MALLOC_CAP_INTERNAL),(unsigned)heap_caps_get_largest_free_block(MALLOC_CAP_INTERNAL));
}
void of_app_edge(bsp_btn_t key,bool pressed){
 if(!resource_ok||key>BSP_BTN_OK)return;
 if(pressed){last_activity=lv_tick_get();if(blanked){blanked=false;wake_consumed[key]=true;bsp_display_backlight(of_state.brightness*20);return;}}
 if(wake_consumed[key]){if(!pressed&&key!=BSP_BTN_OK)wake_consumed[key]=false;return;}
 if(key==BSP_BTN_OK)return; // OK alone uses release/long-press classification.
 if(!pressed){if(held_key==key){held_key=-1;of_game_direction(&game,0);}return;}
 if(page==P_GAME&&!paused){
  if(game.id==0||game.id==1||game.id==2||game.id==3||game.id==5){held_key=key;of_game_direction(&game,key==BSP_BTN_UP?-1:1);return;}
  of_app_key(key,false);return; // Discrete runes never auto-repeat or fire on release.
 }
 uint32_t before=generation;of_app_key(key,false);
 if(before==generation&&page!=P_STANDBY){held_key=key;held_at=lv_tick_get();repeat_started=false;}
}
static void open_category(void){pending_category=category;editing=true;read_menu=inventory_menu=false;held_key=-1;of_audio_play("menu",false,true);generation++;render();}
static void enter_game(unsigned id){
 page_selected[P_RUNES]=selected;of_audio_stop();of_audio_play("activate",false,true);page=P_GAME;
 if(game_saved[id]){game=saved_games[id];paused=true;}else{of_game_init(&game,id);paused=false;}
 if(id==8)game.tracking_unlocked=game_saved[5]&&(saved_games[5].seen&1);
 game.paused=paused;game.input=0;held_key=-1;pause_mode=0;pause_choice=0;magnet_sounding=false;scroll_elapsed=0;generation++;render();
}
void of_app_key(bsp_btn_t key,bool long_press){
 if(!resource_ok||key>BSP_BTN_OK)return;last_activity=lv_tick_get();
 if(wake_consumed[key]){wake_consumed[key]=false;return;}
 if(long_press){
  if(key!=BSP_BTN_OK)return;held_key=-1;of_game_direction(&game,0);
  if(page==P_GAME){
   if(game.id==5&&game.phase==OF_REVEAL&&!paused){of_camera_retake(&game);generation++;render();return;}
   if(paused&&pause_mode){pause_mode=0;of_audio_play("back",false,true);generation++;render();return;}
   paused=!paused;game.paused=paused;pause_choice=0;of_audio_stop();of_audio_play(paused?"menu":"back",false,true);
   if(!paused&&game.id==3&&game.phase==OF_ACTIVE&&game.freeze_ms&&game.freeze_ms<=1683)of_audio_play("stasis_timer",false,true); // Warning window re-arms after pause cut the one-shot.
   magnet_sounding=false;generation++;render();return;
  }
  if(inventory_menu||read_menu){inventory_menu=read_menu=false;of_audio_play("back",false,true);generation++;render();return;}
  if(editing){
   if(page==P_SETTINGS&&selected<SET_YEAR){setting_assign(selected,editing_before);bsp_display_backlight(of_state.brightness*20);of_audio_settings();}
   if(page==P_SETTINGS&&selected>=SET_YEAR&&selected<=SET_MINUTE)of_clock_edit_cancel();
   editing=false;of_audio_play("back",false,true);generation++;render();return;
  }
  if(page==P_ALBUM&&album_mode){album_mode=album_mode>=2?album_mode-1:0;of_audio_play("back",false,true);generation++;render();return;}
  if(settings_mode){settings_mode=0;of_audio_play("back",false,true);generation++;render();return;}
  if(page==P_HOME)show(P_HOME);else{bool from_standby=page==P_STANDBY;show(P_HOME);of_audio_play(from_standby?"startup":"back",false,true);}
  return;
 }
 int d=key==BSP_BTN_UP?-1:1;
 if(page==P_GAME){
  if(paused){
   if(pause_mode==1){if(key!=BSP_BTN_OK){game.zoom=(game.zoom+3+d)%3;game.focus_ms=0;of_audio_play("move",false,false);}else{pause_mode=0;paused=game.paused=false;of_audio_play("zoom",false,true);}render();return;}
   if(pause_mode==2){if(key!=BSP_BTN_OK){unsigned target=game.target_kind?0:1;if(!target||game.tracking_unlocked){of_sensor_target(&game,target);game.paused=true;of_audio_play("move",false,false);}}else{pause_mode=0;paused=game.paused=false;}render();return;}
   int count=pause_count();if(key!=BSP_BTN_OK){pause_choice=(pause_choice+count+d)%count;of_audio_play("move",false,false);render();return;}
   int action=count==3?(pause_choice==0?0:pause_choice+1):pause_choice;
   if(action==3){show(P_RUNES);of_audio_play("back",false,true);return;}
   if(action==1){if(game.id==3){of_game_release(&game);events();paused=game.paused=false;}else pause_mode=game.id==5?1:2;render();return;}
   if(action==2){bool tracking=game.tracking_unlocked;unsigned id=game.id;of_audio_stop();of_game_init(&game,id);game.tracking_unlocked=tracking;}
   if(!action)of_audio_play("back",false,true); // Resume via menu choice; restart stays silent until the new run acts.
   paused=game.paused=false;generation++;render();return;
  }
  if(game.id==8&&game.phase==OF_WON&&!game.target_kind&&key==BSP_BTN_OK){
   int target=-1;for(int i=0;i<OF_PLACE_COUNT;i++)if(!strcmp(of_places[i].en,"Namika Ozz Shrine")){target=i;break;}
   if(target>=0){map_x=of_places[target].x;map_y=of_places[target].y;map_zoom=3;}show(P_MAP);return;
  }
  of_phase_t before=game.phase;of_game_key(&game,key);events();
  if(game.id==5&&before!=game.phase){generation++;scroll_elapsed=0;render();}else game_draw();return;
 }
 if(page==P_STANDBY){if(key==BSP_BTN_OK){show(P_HOME);of_audio_play("startup",false,true);}else{of_state.standby_style=(of_state.standby_style+OF_STANDBY_STYLES+d)%OF_STANDBY_STYLES;standby_changed_at=lv_tick_get();of_state_dirty();generation++;render();}return;}
 if(page==P_HOME){if(key==BSP_BTN_OK){static const page_t routes[]={P_INVENTORY,P_RUNES,P_MAP,P_COMP,P_QUEST,P_SETTINGS,P_ALBUM,P_STANDBY};show(routes[home_selection]);of_audio_play("page",false,true);}else{home_selection=bounded(home_selection+d,0,7);of_audio_play("cursor",false,false);render();}return;}
 if(page==P_RUNES){if(key==BSP_BTN_OK)enter_game(selected);else{selected=bounded(selected+d,0,8);of_audio_play("cursor",false,false);scroll_elapsed=0;render();}return;}
 if(page==P_MAP){int old_zoom=map_zoom;if(key==BSP_BTN_OK)map_axis=(map_axis+1)%3;else if(map_axis==2)map_zoom=bounded(map_zoom-d,1,3);else if(map_axis==0)map_x+=d*(32>>(map_zoom-1));else map_y+=d*(32>>(map_zoom-1));map_x=bounded(map_x,0,768);map_y=bounded(map_y,0,640);if(map_axis==2&&map_zoom!=old_zoom)of_audio_play("zoom",false,false);render();return;}
 if(page==P_ALBUM){
  int count=album_count();if(!count)return;
  if(album_mode>=2){if(key!=BSP_BTN_OK){album_choice=1-album_choice;of_audio_play("move",false,false);}
   else if(album_mode==2){if(album_choice){album_mode=3;album_choice=0;of_audio_play("menu",false,true);}else{album_mode=1;of_audio_play("back",false,true);}}
   else{if(album_choice){of_state.album_deleted|=1u<<album_index(selected);of_state_dirty();selected=bounded(selected,0,count>1?count-2:0);album_mode=0;of_audio_play("back",false,true);}else{album_mode=2;of_audio_play("menu",false,true);}album_choice=0;}
  }else if(key==BSP_BTN_OK){if(album_mode){album_mode=2;of_audio_play("menu",false,true);}else{album_mode=1;of_audio_play("ok",false,true);}album_choice=0;}else{selected=bounded(selected+d,0,count-1);scroll_elapsed=0;of_audio_play("move",false,false);}
  render();return;
 }
 if(page==P_SETTINGS){
  if(settings_mode==1||settings_mode==3){if(key==BSP_BTN_OK){settings_mode=0;of_audio_play("back",false,true);render();}return;}
  if(settings_mode==2){if(key!=BSP_BTN_OK){confirm_choice=1-confirm_choice;of_audio_play("move",false,false);}else{if(confirm_choice){of_state_reset_progress();memset(game_saved,0,sizeof(game_saved));of_audio_play("ok",false,true);}else of_audio_play("back",false,true);settings_mode=0;}render();return;}
  if(key==BSP_BTN_OK){
   if(selected==SET_DIAGNOSTICS){settings_mode=1;of_audio_play("menu",false,true);}else if(selected==SET_RESET){settings_mode=2;confirm_choice=0;of_audio_play("menu",false,true);}else if(selected==SET_USB_TIME){settings_mode=3;of_audio_play("menu",false,true);}else if(selected==SET_BATTERY)return;
   else if(!editing){if(selected<SET_YEAR)editing_before=setting_value(selected);else of_clock_edit_begin();editing=true;of_audio_play("menu",false,true);}
   else{if(selected>=SET_YEAR&&!of_clock_edit_commit()){of_audio_play("invalid",false,true);return;}editing=false;of_state_flush();of_audio_play(selected==SET_SCANLINES?(of_state.scanlines?"switch_on":"switch_off"):"ok",false,true);}
  }else if(!editing){selected=bounded(selected+d,0,SETTINGS_COUNT-1);of_audio_play("move",false,false);}
  else if(selected<SET_YEAR){int value=setting_value(selected),delta=-d;const int lo[]={0,0,1,0,0,0,0,0},hi[]={1,5,5,1,4,5,4,5};setting_assign(selected,bounded(value+delta,lo[selected],hi[selected]));bsp_display_backlight(of_state.brightness*20);of_audio_settings();of_audio_play("move",false,false);}
  else{of_clock_adjust(selected-SET_YEAR,-d);of_audio_play("move",false,false);}
  render();return;
 }
 if(page==P_INVENTORY||page==P_COMP||page==P_QUEST){
  filter_items();
  if(editing){int count=page==P_COMP?5:3;if(key!=BSP_BTN_OK){pending_category=(pending_category+count+d)%count;of_audio_play("move",false,false);}
   else{item_selected[item_page()][category]=selected;category=pending_category;selected=item_selected[item_page()][category];editing=false;filter_items();selected=bounded(selected,0,filtered?filtered-1:0);scroll_elapsed=0;of_audio_play("ok",false,true);generation++;}
   render();return;
  }
  if(inventory_menu){
   if(key!=BSP_BTN_OK){inventory_choice=bounded(inventory_choice+d,0,2);of_audio_play("move",false,false);}
   else{if(inventory_choice==1){open_category();return;}inventory_menu=false;if(inventory_choice==2)of_audio_play("back",false,true);
    if(inventory_choice==0&&filtered){int id=ids[selected],slot=slot_for(of_inventory+id);of_state.equipped[slot]=of_state.equipped[slot]==id?255:id;of_state_dirty();of_audio_play(of_state.equipped[slot]==255?"unequip":"equip",false,true);}
   }render();return;
  }
  if(read_menu){
   if(key!=BSP_BTN_OK){read_choice=bounded(read_choice+d,0,2);of_audio_play("move",false,false);}
   else{if(read_choice==1){open_category();return;}read_menu=false;if(read_choice==2)of_audio_play("back",false,true);if(read_choice==0&&filtered){uint8_t *bits=page==P_QUEST?of_state.quests:of_state.comp;of_set_bit(bits,ids[selected],!of_bit(bits,ids[selected]));of_state_dirty();of_audio_play("ok",false,true);}}
   render();return;
  }
  if(key==BSP_BTN_OK){if(page==P_INVENTORY){inventory_menu=true;inventory_choice=0;}else{read_menu=true;read_choice=0;}held_key=-1;of_audio_play("menu",false,true);generation++;}
  else{selected=bounded(selected+d,0,filtered?filtered-1:0);item_selected[item_page()][category]=selected;scroll_elapsed=0;of_audio_play(page==P_INVENTORY?"move":"cursor",false,false);}
  render();return;
 }
}
