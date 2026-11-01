/* Explicit little-endian V2 save. Reads the earlier 128-byte V1 without erasing it. */
#include "offline.h"
#include "nvs.h"
#include "esp_rom_crc.h"
#include <string.h>
#include <stdatomic.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
of_state_t of_state;
static bool dirty;
static _Atomic bool save_error;
static uint32_t revision,queued_revision;
static _Atomic uint32_t saved_revision;
typedef struct {uint32_t revision;uint8_t bytes[OF_SAVE_SIZE];} save_request_t;
static QueueHandle_t saves;
static void save_worker(void *arg){
 (void)arg;save_request_t request;
 for(;;){if(xQueueReceive(saves,&request,portMAX_DELAY)!=pdTRUE)continue;
  nvs_handle_t h;esp_err_t e=nvs_open("slate_offline",NVS_READWRITE,&h);
  if(e==ESP_OK){e=nvs_set_blob(h,"state",request.bytes,sizeof(request.bytes));if(e==ESP_OK)e=nvs_commit(h);nvs_close(h);}
  atomic_store(&save_error,e!=ESP_OK);if(e==ESP_OK)atomic_store(&saved_revision,request.revision);
 }
}
static uint32_t changed_at;
static uint16_t u16(const uint8_t *p){return p[0]|((uint16_t)p[1]<<8);}
static uint32_t u32(const uint8_t *p){return u16(p)|((uint32_t)u16(p+2)<<16);}
static void put16(uint8_t *p,uint16_t v){p[0]=v;p[1]=v>>8;}
static void put32(uint8_t *p,uint32_t v){put16(p,v);put16(p+2,v>>16);}
bool of_bit(const uint8_t *p,unsigned n){return (p[n/8]&(1u<<(n%8)))!=0;}
void of_set_bit(uint8_t *p,unsigned n,bool v){if(v)p[n/8]|=1u<<(n%8);else p[n/8]&=~(1u<<(n%8));}
const char *of_text(const char *cn,const char *en){return of_state.lang?en:cn;}
bool of_state_save_error(void){return atomic_load(&save_error);}
bool of_state_save_pending(void){return dirty&&revision!=atomic_load(&saved_revision);}
void of_state_load(void){
 saves=xQueueCreate(1,sizeof(save_request_t));
 if(saves&&xTaskCreate(save_worker,"slate_save",4096,NULL,1,NULL)!=pdPASS){vQueueDelete(saves);saves=NULL;}
 atomic_store(&save_error,saves==NULL);
 memset(&of_state,0,sizeof(of_state));of_state.volume=3;of_state.brightness=5;of_state.idle_timeout=2;of_state.standby_delay=1;memset(of_state.equipped,255,5);
 nvs_handle_t h;if(nvs_open("slate_offline",NVS_READONLY,&h)!=ESP_OK)return;
 uint8_t b[OF_SAVE_SIZE]={0};size_t n=sizeof(b);esp_err_t err=nvs_get_blob(h,"state",b,&n);nvs_close(h);
 bool old=n==128&&!memcmp(b,"SL3\1",4),current=n==OF_SAVE_SIZE&&!memcmp(b,"SL3\2",4);
 if(err!=ESP_OK||(!old&&!current)||esp_rom_crc32_le(0,b,n-4)!=u32(b+n-4))return;
 if(b[4]>1||b[5]>5||b[6]<1||b[6]>5)return;
 for(int i=0;i<5;i++)if(b[10+i]!=255&&b[10+i]>=OF_INV_COUNT)return;
 if(current&&(b[114]>1||b[115]>5||b[116]>OF_ALBUM_CAPACITY))return;
 if(current)for(int i=0;i<b[116];i++){const uint8_t *p=b+160+i*12;if(u16(p)>320||p[2]>2||(p[3]>4&&p[3]!=255))return;}
 of_state.lang=b[4];of_state.volume=b[5];of_state.brightness=b[6];of_state.completed=u16(b+8)&0x1ff;memcpy(of_state.equipped,b+10,5);
 memcpy(of_state.comp,b+16,50);memcpy(of_state.quests,b+66,19);memcpy(of_state.places,b+85,23);for(int i=0;i<3;i++)of_state.supplies[i]=u16(b+108+i*2);
 if(current){of_state.scanlines=b[114];of_state.idle_timeout=b[115];of_state.photo_count=b[116];of_state.album_deleted=u16(b+117)&0xfff;of_state.photo_sequence=u32(b+120);
  of_state.last_clock_epoch=(int64_t)((uint64_t)u32(b+128)|((uint64_t)u32(b+132)<<32));
  // Reserved-byte extension; old V2 saves retain the defaults above.
  if(!memcmp(b+136,"SB1\1",4)&&b[140]<=4&&b[141]<OF_STANDBY_STYLES&&b[142]<=4){of_state.standby_delay=b[140];of_state.standby_style=b[141];of_state.standby_cycle=b[142];}
  if(!memcmp(b+144,"SBG\1",4)&&b[148]<OF_BG_COUNT)of_state.bg_style=b[148];
  for(int i=0;i<of_state.photo_count;i++){const uint8_t *p=b+160+i*12;of_state.photos[i]=(of_photo_t){.pan=u16(p),.zoom=p[2],.subject=p[3],.scene_version=u16(p+4),.sequence=u32(p+8)};}
 }
}
void of_state_dirty(void){revision++;dirty=true;changed_at=lv_tick_get();}
bool of_state_flush(void){
 if(!dirty)return true;
 if(revision==atomic_load(&saved_revision)){dirty=false;return true;}
 if(!saves){atomic_store(&save_error,true);return false;}
 if(queued_revision==revision&&!atomic_load(&save_error))return true;
 save_request_t request={.revision=revision};uint8_t *b=request.bytes;memcpy(b,"SL3\2",4);b[4]=of_state.lang;b[5]=of_state.volume;b[6]=of_state.brightness;
 put16(b+8,of_state.completed);memcpy(b+10,of_state.equipped,5);memcpy(b+16,of_state.comp,50);memcpy(b+66,of_state.quests,19);memcpy(b+85,of_state.places,23);
 for(int i=0;i<3;i++)put16(b+108+i*2,of_state.supplies[i]);
 b[114]=of_state.scanlines;b[115]=of_state.idle_timeout;b[116]=of_state.photo_count;put16(b+117,of_state.album_deleted);put32(b+120,of_state.photo_sequence);
 uint64_t epoch=(uint64_t)of_state.last_clock_epoch;put32(b+128,epoch);put32(b+132,epoch>>32);
 memcpy(b+136,"SB1\1",4);b[140]=of_state.standby_delay;b[141]=of_state.standby_style;b[142]=of_state.standby_cycle;
 memcpy(b+144,"SBG\1",4);b[148]=of_state.bg_style;
 for(int i=0;i<of_state.photo_count;i++){uint8_t *p=b+160+i*12;const of_photo_t *photo=&of_state.photos[i];put16(p,photo->pan);p[2]=photo->zoom;p[3]=photo->subject;put16(p+4,photo->scene_version);put32(p+8,photo->sequence);}
 put32(b+508,esp_rom_crc32_le(0,b,508));
 if(xQueueOverwrite(saves,&request)!=pdTRUE){atomic_store(&save_error,true);return false;}
 queued_revision=revision;return true; // Accepted, not a claim that Flash is committed.
}
void of_state_tick(uint32_t now){
 if(dirty&&revision==atomic_load(&saved_revision))dirty=false;
 if(dirty&&(uint32_t)(now-changed_at)>=1000&&(queued_revision!=revision||atomic_load(&save_error))){of_state_flush();changed_at=now;}
}
void of_photo_save(uint16_t pan,uint8_t zoom,uint8_t subject){if(pan>320||zoom>2||(subject>4&&subject!=255))return;
 if(of_state.photo_count==OF_ALBUM_CAPACITY){memmove(of_state.photos,of_state.photos+1,(OF_ALBUM_CAPACITY-1)*sizeof(of_photo_t));of_state.photo_count--;}
 of_state.photos[of_state.photo_count++]=(of_photo_t){.pan=pan,.zoom=zoom,.subject=subject,.scene_version=OF_PHOTO_SCENE_VERSION,.sequence=++of_state.photo_sequence};of_state_dirty();
}
void of_photo_delete(unsigned index){if(index>=of_state.photo_count)return;memmove(of_state.photos+index,of_state.photos+index+1,(of_state.photo_count-index-1)*sizeof(of_photo_t));of_state.photo_count--;memset(of_state.photos+of_state.photo_count,0,sizeof(of_photo_t));of_state_dirty();}
void of_state_reset_progress(void){of_state.album_deleted=0;of_state.completed=0;memset(of_state.equipped,255,5);memset(of_state.comp,0,50);memset(of_state.quests,0,19);memset(of_state.places,0,23);memset(of_state.supplies,0,sizeof(of_state.supplies));memset(of_state.photos,0,sizeof(of_state.photos));of_state.photo_count=0;of_state.photo_sequence=0;of_state_dirty();}
