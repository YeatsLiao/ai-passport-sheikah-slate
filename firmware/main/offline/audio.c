/* Six bounded Flash-backed voices; only this worker touches the codec. */
#include "offline.h"
#include "bsp_audio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include <string.h>
#include <stdio.h>
#include <stdatomic.h>
static QueueHandle_t queue;
static _Atomic uint32_t generation;
static _Atomic int volume=60;
static bool ready;
typedef enum {OF_AUDIO_PLAY, OF_AUDIO_STOP_KIND} audio_command_t;
typedef struct {char name[64];bool loop;audio_command_t command;uint32_t generation;} request_t;
typedef struct {const uint8_t *data;char name[64];uint32_t count,pos,started;int predictor,index,gain;bool loop;} voice_t;
#define VOICE_COUNT 6
#define PCM_SAMPLES 512
static const int steps[89]={7,8,9,10,11,12,13,14,16,17,19,21,23,25,28,31,34,37,41,45,50,55,60,66,73,80,88,97,107,118,130,143,157,173,190,209,230,253,279,307,337,371,408,449,494,544,598,658,724,796,876,963,1060,1166,1282,1411,1552,1707,1878,2066,2272,2499,2749,3024,3327,3660,4026,4428,4871,5358,5894,6484,7132,7845,8630,9493,10442,11487,12635,13899,15289,16818,18500,20350,22385,24623,27086,29794,32767};
static const int indices[16]={-1,-1,-1,-1,2,4,6,8,-1,-1,-1,-1,2,4,6,8};
static int decode(int code,int *predictor,int *index){int step=steps[*index],diff=step>>3;if(code&1)diff+=step>>2;if(code&2)diff+=step>>1;if(code&4)diff+=step;*predictor+=(code&8)?-diff:diff;if(*predictor>32767)*predictor=32767;if(*predictor< -32768)*predictor=-32768;*index+=indices[code];if(*index<0)*index=0;if(*index>88)*index=88;return *predictor;}
static bool any_voice(const voice_t *voices){for(int i=0;i<VOICE_COUNT;i++)if(voices[i].data)return true;return false;}
static void admit(voice_t *voices,const request_t *r,uint32_t *sequence){
 bool replace=!strcmp(r->name,"audio/move")||!strcmp(r->name,"audio/cursor")||!strcmp(r->name,"audio/zoom")||!strcmp(r->name,"audio/sensor");
 for(int i=0;i<VOICE_COUNT;i++)if(voices[i].data&&!strcmp(voices[i].name,r->name)){
  if(r->command==OF_AUDIO_STOP_KIND||replace)voices[i].data=NULL;
  else if(r->loop||!strcmp(r->name,"audio/stasis_timer"))return;
 }
 if(r->command==OF_AUDIO_STOP_KIND)return;
 size_t size=0;const uint8_t *data=of_resource(r->name,&size);if(!data||size<12||memcmp(data,"ADP1",4))return;
 uint32_t rate,count;memcpy(&rate,data+4,4);memcpy(&count,data+8,4);
 if(rate!=16000||!count||(uint64_t)count>(uint64_t)(size-12)*2)return;
 int slot=0;for(int i=0;i<VOICE_COUNT;i++){
  if(!voices[i].data){slot=i;break;}
  if(*sequence-voices[i].started>*sequence-voices[slot].started)slot=i;
 }
 voice_t *v=&voices[slot];memset(v,0,sizeof(*v));v->data=data+12;v->count=count;v->loop=r->loop;v->started=(*sequence)++;
 snprintf(v->name,sizeof(v->name),"%s",r->name);
 v->gain=(!strcmp(r->name,"audio/move")||!strcmp(r->name,"audio/cursor"))?77:!strcmp(r->name,"audio/boom")?102:154;
}
static void worker(void *arg){
 (void)arg;request_t r;voice_t voices[VOICE_COUNT]={0};int16_t pcm[PCM_SAMPLES];
 uint32_t epoch=atomic_load(&generation),sequence=0;int applied_volume=-1;
 for(;;){
  uint32_t current=atomic_load(&generation);if(epoch!=current){memset(voices,0,sizeof(voices));epoch=current;}
  if(xQueueReceive(queue,&r,any_voice(voices)?0:portMAX_DELAY)==pdTRUE){
   do {
    current=atomic_load(&generation);if(epoch!=current){memset(voices,0,sizeof(voices));epoch=current;}
    if(r.generation==epoch)admit(voices,&r,&sequence);
   }while(xQueueReceive(queue,&r,0)==pdTRUE);
  }
  if(!any_voice(voices))continue;
  int output_volume=atomic_load(&volume);if(!output_volume){memset(voices,0,sizeof(voices));continue;}
  if(!ready){
   if(bsp_audio_init()!=ESP_OK||bsp_audio_set_format(16000,16,1)!=ESP_OK){memset(voices,0,sizeof(voices));vTaskDelay(pdMS_TO_TICKS(100));continue;}
   ready=true;applied_volume=-1;
  }
  if(output_volume!=applied_volume){bsp_audio_set_volume(output_volume);applied_volume=output_volume;}
  for(unsigned sample=0;sample<PCM_SAMPLES;sample++){
   int mixed=0;
   for(int i=0;i<VOICE_COUNT;i++){
    voice_t *v=&voices[i];if(!v->data)continue;
    if(v->pos==v->count){if(!v->loop){v->data=NULL;continue;}v->pos=0;v->predictor=v->index=0;}
    int code=(v->data[v->pos/2]>>((v->pos%2)*4))&15;v->pos++;
    mixed+=decode(code,&v->predictor,&v->index)*v->gain/256;
   }
   pcm[sample]=mixed>32767?32767:mixed< -32768?-32768:mixed;
  }
  if(epoch!=atomic_load(&generation))continue;
  if(bsp_audio_write(pcm,sizeof(pcm))!=ESP_OK){memset(voices,0,sizeof(voices));vTaskDelay(pdMS_TO_TICKS(20));}
  // Blocking I2S writes provide pacing; do not delay between successful refills.
 }
}
void of_audio_init(void){queue=xQueueCreate(12,sizeof(request_t));if(queue&&xTaskCreate(worker,"slate_audio",8192,NULL,5,NULL)!=pdPASS){vQueueDelete(queue);queue=NULL;}}
void of_audio_stop(void){atomic_fetch_add(&generation,1);if(queue)xQueueReset(queue);}
void of_audio_settings(void){atomic_store(&volume,of_state.volume*20);if(!of_state.volume)of_audio_stop();}
static void enqueue(const request_t *r,bool urgent){if(xQueueSend(queue,r,0)==pdTRUE)return;if(urgent){request_t discarded;xQueueReceive(queue,&discarded,0);xQueueSend(queue,r,0);}}
void of_audio_play(const char *name,bool loop,bool priority){
 if(!queue||!name||!atomic_load(&volume))return;
 if(!strcmp(name,"complete"))of_audio_stop(); // Prototype completion stops all SFX.
 request_t r={.loop=loop,.command=OF_AUDIO_PLAY,.generation=atomic_load(&generation)};snprintf(r.name,sizeof(r.name),"audio/%s",name);enqueue(&r,priority);
}
void of_audio_stop_kind(const char *name){if(!queue||!name)return;request_t r={.command=OF_AUDIO_STOP_KIND,.generation=atomic_load(&generation)};snprintf(r.name,sizeof(r.name),"audio/%s",name);enqueue(&r,true);}
