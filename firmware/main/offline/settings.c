/* Settings page, standby canvases and the battery snapshot row. */
#include "app_internal.h"
#include <stdio.h>
#include "esp_heap_caps.h"

lv_obj_t *standby_clock,*standby_date,*standby_brand,*standby_toast,*settings_battery_row;
int settings_mode,confirm_choice;
static lv_obj_t *rows[6],*row_labels[6];
const uint16_t standby_seconds[]={0,30,60,120,300},screen_seconds[]={0,30,60,120,300,600},cycle_seconds[]={0,15,30,60,300};
static const char *style_cn[]={"静谧科技","晨光旷野","古地图","神庙石碑","林间薄雾","极简黑金"};
static const char *style_en[]={"QUIET TECH","DAWN FIELD","ANTIQUE MAP","SHRINE STELE","MISTY FOREST","BLACK & GOLD"};
static const char *const bg_value_cn[OF_BG_COUNT]={"眼纹","石材","眼角","字符环"},*const bg_value_en[OF_BG_COUNT]={"CREST","STONE","CORNER","GLYPHS"};

int setting_value(int field){switch(field){case SET_LANG:return of_state.lang;case SET_VOLUME:return of_state.volume;case SET_BRIGHTNESS:return of_state.brightness;case SET_SCANLINES:return of_state.scanlines;case SET_STANDBY:return of_state.standby_delay;case SET_SCREEN:return of_state.idle_timeout;case SET_CYCLE:return of_state.standby_cycle;case SET_BG:return of_state.bg_style;default:return of_state.standby_style;}}
void setting_assign(int field,int value){switch(field){case SET_LANG:of_state.lang=value;break;case SET_VOLUME:of_state.volume=value;break;case SET_BRIGHTNESS:of_state.brightness=value;break;case SET_SCANLINES:of_state.scanlines=value;break;case SET_STANDBY:of_state.standby_delay=value;break;case SET_SCREEN:of_state.idle_timeout=value;break;case SET_CYCLE:of_state.standby_cycle=value;break;case SET_STYLE:of_state.standby_style=value;break;case SET_BG:of_state.bg_style=value;break;}of_state_dirty();}
void battery_row_text(char *out,size_t capacity){
 if(battery>=0){if(battery_millivolts>=0)snprintf(out,capacity,"%s %d%% · %d mV",of_text("电量","BATTERY"),battery,battery_millivolts);else snprintf(out,capacity,"%s %d%%",of_text("电量","BATTERY"),battery);return;}
 const char *status=of_text(battery_status==BATTERY_READING?"电量读取中":battery_status==BATTERY_NO_DEVICE?"电量计未应答":battery_status==BATTERY_NOT_READY?"电量未就绪":"电量读取失败",battery_status==BATTERY_READING?"BATTERY READING":battery_status==BATTERY_NO_DEVICE?"GAUGE NOT RESPONDING":battery_status==BATTERY_NOT_READY?"SOC NOT READY":"BATTERY READ FAILED");
 if(battery_millivolts>=0)snprintf(out,capacity,"%s · %d mV",status,battery_millivolts);else snprintf(out,capacity,"%s",status);
}
static void list_row(int i,const char *text,bool on){rows[i]=box(content,8,8+i*26,304,25,CYAN,on?80:0);row_labels[i]=label(rows[i],text,5,3,294,false,on?FG:CYAN);select_style(rows[i],on);}
void settings_render(void){
 const char *cn[]={"语言","音量","亮度","扫描线","进入待机","待机后熄屏","自动切换画布","待机风格","背景","年份","月份","日期","小时","分钟","USB 一键校时","电量","诊断信息","重置进度"};
 const char *en[]={"LANGUAGE","VOLUME","BRIGHTNESS","SCANLINES","ENTER STANDBY","SCREEN OFF AFTER","CANVAS INTERVAL","STANDBY STYLE","BACKGROUND","YEAR","MONTH","DAY","HOUR","MINUTE","USB TIME SYNC","BATTERY","DIAGNOSTICS","RESET PROGRESS"};
 int start=selected/6*6;for(int row=0;row<6&&start+row<SETTINGS_COUNT;row++){int i=start+row;char value[64]="";
  if(i==SET_LANG)snprintf(value,sizeof(value),"%s",of_state.lang?"ENGLISH":"简体中文");
  else if(i==SET_VOLUME||i==SET_BRIGHTNESS)snprintf(value,sizeof(value),"%d",setting_value(i));
  else if(i==SET_SCANLINES)snprintf(value,sizeof(value),"%s",of_text(of_state.scanlines?"开":"关",of_state.scanlines?"ON":"OFF"));
  else if(i>=SET_STANDBY&&i<=SET_CYCLE){unsigned seconds=i==SET_STANDBY?standby_seconds[of_state.standby_delay]:i==SET_SCREEN?screen_seconds[of_state.idle_timeout]:cycle_seconds[of_state.standby_cycle];if(seconds)snprintf(value,sizeof(value),"%us",seconds);else snprintf(value,sizeof(value),"%s",of_text(i==SET_CYCLE?"手动":"关闭",i==SET_CYCLE?"MANUAL":"OFF"));}
  else if(i==SET_STYLE)snprintf(value,sizeof(value),"%c · %s",'E'+of_state.standby_style,of_text(style_cn[of_state.standby_style],style_en[of_state.standby_style]));
  else if(i==SET_BG)snprintf(value,sizeof(value),"%s",of_text(bg_value_cn[of_state.bg_style],bg_value_en[of_state.bg_style]));
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
void standby_update(uint32_t now){
 char time_text[24],date_text[96];of_clock_text(time_text,sizeof(time_text),date_text,sizeof(date_text));text_changed(standby_clock,time_text);text_changed(standby_date,date_text);

 visible(standby_toast,(uint32_t)(now-standby_changed_at)<3500);
}
void standby_render(void){
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
