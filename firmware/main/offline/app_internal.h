/* Internal shared state for the offline app split: app.c (core), ui.c, pages.c,
   settings.c and game_view.c. Everything here was static in the pre-split app.c;
   keep definitions and this header in sync when moving code between modules. */
#pragma once
#include "offline.h"

typedef enum {P_STANDBY,P_HOME,P_INVENTORY,P_RUNES,P_GAME,P_MAP,P_COMP,P_QUEST,P_SETTINGS,P_ALBUM} page_t;
enum {BATTERY_READING,BATTERY_READY,BATTERY_NO_DEVICE,BATTERY_READ_ERROR,BATTERY_NOT_READY};
enum {SET_LANG,SET_VOLUME,SET_BRIGHTNESS,SET_SCANLINES,SET_STANDBY,SET_SCREEN,SET_CYCLE,SET_STYLE,SET_BG,SET_YEAR,SET_MONTH,SET_DAY,SET_HOUR,SET_MINUTE,SET_USB_TIME,SET_BATTERY,SET_DIAGNOSTICS,SET_RESET,SETTINGS_COUNT};

// Widgets. Defined in ui.c, except the standby/settings rows in settings.c.
extern lv_obj_t *screen,*content,*title,*footer,*notice,*modal;
extern lv_obj_t *world,*actor,*player,*effect,*game_info;
extern lv_obj_t *standby_clock,*standby_date,*standby_brand,*standby_toast,*settings_battery_row;

// App and page state. Definitions follow ownership: page state in pages.c,
// game state in game_view.c, core/timers in app.c, buffers in ui.c.
extern page_t page;
extern bool paused,editing,resource_ok;
extern int selected,category,home_selection;
extern int map_axis,map_zoom,map_x,map_y,map_selected;
extern int pause_mode,pause_choice;
extern int inventory_choice,album_mode,album_choice,read_choice,pending_category;
extern int settings_mode,confirm_choice;
extern bool inventory_menu,read_menu;
extern int ids[OF_COMP_COUNT],filtered;
extern int page_selected[10],page_category[10],item_selected[3][5];
extern int held_key;
extern uint32_t generation,scroll_elapsed,standby_changed_at,standby_entered_at;
extern of_game_t game;
extern of_game_t saved_games[9];
extern bool game_saved[9];
extern bool magnet_sounding;
extern int battery,battery_millivolts,battery_status;
extern const uint16_t standby_seconds[],screen_seconds[],cycle_seconds[];
extern char message[192];
extern unsigned image_path_count,scroll_count;
typedef struct {lv_obj_t *label;int overflow;} scroll_text_t;
extern scroll_text_t scroll_texts[6];

// ui.c kit.
extern const uint32_t BG,FG,CYAN,GOLD;
lv_obj_t *box(lv_obj_t *p,int x,int y,int w,int h,uint32_t color,lv_opa_t opacity);
lv_obj_t *label(lv_obj_t *p,const char *text,int x,int y,int w,bool large,uint32_t color);
lv_obj_t *picture(lv_obj_t *parent,const char *name,int x,int y);
lv_obj_t *photo(lv_obj_t *p,const char *name,int x,int y,int scale);
const lv_image_dsc_t *equipment_source(const char *name,int pixels);
lv_obj_t *scrolling_text(lv_obj_t *p,const char *text,int x,int y,int w,int h);
void scroll_tick(uint32_t dt);
void text_changed(lv_obj_t *o,const char *value);
void set_footer(const char *s);
void select_style(lv_obj_t *o,bool on);
void visible(lv_obj_t *o,bool on);
const char *name_of(const of_item_t *e);
const char *body_of(const of_item_t *e);
int bounded(int x,int lo,int hi);

// pages.c
int item_page(void);
void filter_items(void);
int slot_for(const of_item_t *e);
void read_item(void);
void category_menu(void);
void map_render(void);
void home_grid(void);
void rune_grid(void);
void inventory_grid(void);
void album_render(void);
int album_count(void);
int album_index(int pos);
void open_category(void);

// settings.c
void settings_render(void);
int setting_value(int field);
void setting_assign(int field,int value);
void standby_render(void);
void standby_update(uint32_t now);
void battery_row_text(char *out,size_t capacity);

// game_view.c
void game_render(void);
void game_draw(void);
void pause_render(void);
int pause_count(void);
void events(void);
void enter_game(unsigned id);

// app.c
void render(void);
