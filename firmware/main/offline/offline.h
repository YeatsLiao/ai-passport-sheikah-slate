#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include "lvgl.h"
#include "bsp_button.h"
#define OF_COMP_COUNT 394
#define OF_QUEST_COUNT 152
#define OF_PLACE_COUNT 177
#define OF_INV_COUNT 24
#define OF_RUNE_COUNT 9
#define OF_SAVE_SIZE 512
#define OF_ALBUM_CAPACITY 12
#define OF_PHOTO_SCENE_VERSION 1
#define OF_SCENE_Y 24
#define OF_SCENE_H 198
#define OF_STANDBY_STYLES 6
#define OF_BG_COUNT 4

typedef struct {const char *cn,*en,*cn_body,*en_body,*image; uint8_t category,slot; uint16_t value;} of_item_t;
typedef struct {const char *cn,*en,*kind; int16_t x,y;} of_place_t;
typedef struct {const char *cn,*en,*time,*place_cn,*place,*number,*thumb,*big;} of_album_t;
typedef struct {int16_t half,surface_offset,left,right,top,support,cycle_height,wheel_y,wheel_radius,axle,rock_ground,rock_radius;} of_geometry_t;
extern const of_album_t of_album[12];
extern const of_geometry_t of_geometry;
extern const int16_t of_ice_sites[5];
extern const uint8_t of_amiibo_gifts[3];
extern const of_item_t of_comp[OF_COMP_COUNT],of_quests[OF_QUEST_COUNT],of_inventory[OF_INV_COUNT];
extern const of_place_t of_places[OF_PLACE_COUNT];
extern const uint32_t of_pack_index_crc;
extern const uint16_t of_camera_subjects[5];
extern const char *of_rune_cn[9],*of_rune_en[9];
extern const char *of_rune_desc_cn[9],*of_rune_desc_en[9];
extern const char *of_rune_tile_cn[9];
extern const lv_font_t of_chinese_10,of_chinese_12,of_chinese_14,of_chinese_16;
extern const lv_font_t of_clock_28,of_clock_40,of_clock_52;
typedef struct {uint16_t pan;uint8_t zoom,subject;uint16_t scene_version;uint32_t sequence;} of_photo_t;
typedef struct {uint8_t lang,volume,brightness,equipped[5],scanlines,idle_timeout,photo_count,standby_delay,standby_style,standby_cycle,bg_style;int64_t last_clock_epoch;uint32_t photo_sequence;of_photo_t photos[OF_ALBUM_CAPACITY];uint16_t completed,supplies[3],album_deleted;uint8_t comp[50],quests[19],places[23];} of_state_t;
extern of_state_t of_state;
void of_state_load(void);
void of_state_dirty(void);
bool of_state_flush(void);
bool of_state_save_error(void);
bool of_state_save_pending(void);
void of_state_reset_progress(void);
void of_photo_save(uint16_t pan,uint8_t zoom,uint8_t subject);
void of_photo_delete(unsigned index);
void of_clock_init(void);
bool of_clock_valid(void);
void of_clock_text(char *time_text,size_t time_size,char *date_text,size_t date_size);
int of_clock_field(unsigned field);
void of_clock_adjust(unsigned field,int direction);
void of_clock_edit_begin(void);
bool of_clock_edit_commit(void);
void of_clock_edit_cancel(void);
bool of_clock_set_epoch(int64_t epoch);
void of_state_tick(uint32_t now);
bool of_bit(const uint8_t *bits,unsigned n);
void of_set_bit(uint8_t *bits,unsigned n,bool value);
const char *of_text(const char *cn,const char *en);
bool of_resources_init(void);
const char *of_resource_error(void);
const void *of_resource(const char *name,size_t *size);
const lv_image_dsc_t *of_image(const char *name);
void of_resources_page_reset(void);
void of_audio_init(void);
void of_audio_play(const char *name,bool loop,bool priority);
void of_audio_stop(void);
void of_audio_stop_kind(const char *name);
void of_audio_settings(void);
void of_app_init(void);
void of_app_key(bsp_btn_t key,bool long_press);
void of_app_edge(bsp_btn_t key,bool pressed);
uint32_t of_app_generation(void);

typedef enum {OF_READY,OF_LIFT,OF_ACTIVE,OF_DROP,OF_SETTLE,OF_CROSS,OF_REVEAL,OF_REWARD,OF_WON,OF_LOST,OF_COOLDOWN,OF_LANDING,OF_RETREAT,OF_FINISH,OF_CHEST,OF_APPROACH,OF_CRASH,OF_CLAIMED} of_phase_t;
enum { OF_EV_ACTION=1,OF_EV_HIT=2,OF_EV_WIN=4,OF_EV_FAIL=8,OF_EV_RELEASE=16,OF_EV_OPEN=32,OF_EV_BREAK=64,OF_EV_TIMER=128,OF_EV_PHOTO=256,OF_EV_DETECT=512,OF_EV_FOUND=1024,OF_EV_SENSOR=2048,OF_EV_COLLECT=4096 };
// Logical pixels and seconds follow the prototype. Millisecond clocks never
// advance while paused; drawing and collision use these same coordinates.
typedef struct {
 uint8_t id,choice,hits,seen,ice,stage,pillar_count,pillar_order[3],zoom,leg,target_kind;
 bool paused,held,review,capture_valid,coyote,grounded,placed,on_platform,lifting,gate,walking,tracking_unlocked;
 of_phase_t phase;
 uint32_t time,phase_ms,cooldown,focus_ms,air_ms,jump_buffer,flash_ms,pulse_ms,freeze_ms,leg_ms,brake_ms,tone_ms,ice_birth[5],events;
 float x,y,vx,vy,target,target_y,target_heading,angle,distance,world,roll,camera,camera_y,power,platform,cursor,shot_x,shot_y,old_x,old_y,speed,walker_x,walker_foot,walker_scale,heading;
 int8_t direction,input;int8_t focus_target;uint8_t signal;
} of_game_t;
void of_game_init(of_game_t *g,unsigned id);
void of_game_key(of_game_t *g,int key);
void of_game_step(of_game_t *g,uint32_t ms);
void of_game_direction(of_game_t *g,int direction);
void of_game_release(of_game_t *g);
void of_sensor_target(of_game_t *g,unsigned target);
void of_camera_geometry(const of_game_t *g,unsigned i,float *x,float *y,float *size);
float of_camera_zoom(const of_game_t *g);
bool of_magnet_support(const of_game_t *g,bool *left,bool *right);
void of_camera_retake(of_game_t *g);
bool of_cycle_gap(float world);
const char *of_game_hint(const of_game_t *g);
