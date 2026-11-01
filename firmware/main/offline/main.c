#include "offline.h"
#include "screenshot.h"
#include "input.h"
#include "bsp_display.h"
#include "bsp_i2c.h"
#include "bsp_battery.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "nvs_flash.h"
#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include <stdatomic.h>
typedef struct {uint8_t key;bool pressed;uint32_t time;} edge_t;
static QueueHandle_t keys;
static input_state_t gestures;
static uint32_t generation;
static _Atomic bool overflow;
static void callback(bsp_btn_t key,bsp_btn_ev_t ev,void *user){(void)user;if(!keys||(ev!=BSP_BTN_PRESS&&ev!=BSP_BTN_RELEASE))return;edge_t e={key,ev==BSP_BTN_PRESS,(uint32_t)(esp_timer_get_time()/1000)};if(xQueueSend(keys,&e,0)!=pdTRUE)atomic_store(&overflow,true);}
static void sync_input(void){if(of_app_generation()!=generation){generation=of_app_generation();input_reset(&gestures);for(int i=0;i<3;i++)of_app_edge(i,false);}}
static void dispatch(int key,input_result_t result){if(result==INPUT_NONE)return;of_app_key(key,result==INPUT_LONG);sync_input();}
static void tick(lv_timer_t *t){(void)t;if(atomic_exchange(&overflow,false)){xQueueReset(keys);input_reset(&gestures);for(int i=0;i<3;i++)of_app_edge(i,false);return;}edge_t e;while(xQueueReceive(keys,&e,0)==pdTRUE){of_app_edge(e.key,e.pressed);if(e.key==BSP_BTN_OK)dispatch(e.key,input_edge(&gestures,e.key,e.pressed,e.time));sync_input();}uint32_t now=esp_timer_get_time()/1000;dispatch(BSP_BTN_OK,input_poll(&gestures,BSP_BTN_OK,now));sync_input();}
void app_main(void){
 esp_err_t err=nvs_flash_init();if(err!=ESP_OK){ESP_LOGE("offline","NVS initialization failed (%s); preserve existing data, no automatic erase",esp_err_to_name(err));return;}
 if(bsp_i2c_init()!=ESP_OK){ESP_LOGE("offline","I2C init failed");return;}
 if(bsp_display_init()!=ESP_OK||!bsp_lvgl_init()){ESP_LOGE("offline","Display init failed");return;}
 keys=xQueueCreate(12,sizeof(edge_t));if(!keys||bsp_button_init(callback,NULL)!=ESP_OK){ESP_LOGE("offline","Input init failed");return;}
 if(!bsp_lvgl_lock(1000)){ESP_LOGE("offline","LVGL startup lock timeout");return;}
 input_reset(&gestures);of_app_init();generation=of_app_generation();lv_timer_create(tick,20,NULL);
 if(!of_screenshot_init(lv_display_get_default()))ESP_LOGW("offline","Screenshot console unavailable");
 bsp_lvgl_unlock();
 // No Wi-Fi/BLE initialization, sockets, HTTP clients, or online assets.
}
