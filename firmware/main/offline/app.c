/* Offline app core: render dispatch, tick, input handling and the battery worker.
   Page renderers live in pages.c/settings.c/game_view.c; shared state in app_internal.h. */
#include "app_internal.h"
#include "src/misc/cache/instance/lv_image_cache.h"
#include "bsp_display.h"
#include "bsp_battery.h"
#include "esp_log.h"
#include "esp_heap_caps.h"
#include <stdio.h>
#include <string.h>
#include <stdatomic.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

bool resource_ok;
static lv_obj_t *save_warning,*scan_overlay;
int held_key=-1;
uint32_t generation;
uint32_t standby_changed_at,standby_entered_at;
static bool blanked,wake_consumed[3];
static uint32_t last_activity,diagnostic_at,last_tick,refresh_at,battery_at,held_at;
static bool repeat_started;
static int editing_before;
int battery=-1,battery_millivolts=-1,battery_status=BATTERY_READING;
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
static uint8_t scan_pixels[320*2*4];
static const lv_image_dsc_t scan_image={.header={.magic=LV_IMAGE_HEADER_MAGIC,.cf=LV_COLOR_FORMAT_ARGB8888,.w=320,.h=2,.stride=1280},.data_size=2560,.data=scan_pixels};
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
void render(void){
 // Load a new root before deleting the previous tree. No decoder is left pointing at reused descriptors.
 lv_display_t *display=lv_display_get_default();lv_display_rotation_t rotation=resource_ok&&page==P_STANDBY&&of_state.standby_style>=3?LV_DISPLAY_ROTATION_90:LV_DISPLAY_ROTATION_0;
 if(lv_display_get_rotation(display)!=rotation)lv_display_set_rotation(display,rotation);
 standby_clock=standby_date=standby_brand=standby_toast=settings_battery_row=NULL;
 scroll_count=0;lv_obj_t *old=screen;screen=lv_obj_create(NULL);lv_obj_remove_style_all(screen);lv_obj_set_style_bg_color(screen,lv_color_hex(BG),0);lv_obj_set_style_bg_opa(screen,255,0);lv_screen_load(screen);if(old)lv_obj_delete(old);lv_image_cache_drop(NULL);of_resources_page_reset();image_path_count=0;save_warning=scan_overlay=NULL;modal=NULL;world=actor=player=effect=game_info=notice=NULL;
 if(resource_ok&&page!=P_STANDBY){ // Switchable 160x120 plate upscaled 2x; first child = behind everything.
  static const char *const bg_names[]={"ui/bg0","ui/bg1","ui/bg2","ui/bg3"};
  lv_obj_t *bg=picture(screen,bg_names[of_state.bg_style],0,0);
  if(bg){lv_image_set_pivot(bg,0,0);lv_image_set_scale(bg,512);}
  }
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
  else if(selected<SET_YEAR){int value=setting_value(selected),delta=-d;const int lo[]={0,0,1,0,0,0,0,0,0},hi[]={1,5,5,1,4,5,4,5,3};setting_assign(selected,bounded(value+delta,lo[selected],hi[selected]));bsp_display_backlight(of_state.brightness*20);of_audio_settings();of_audio_play("move",false,false);}
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
