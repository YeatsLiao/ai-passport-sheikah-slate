/* Prototype mechanics in logical pixels; one active simulation, no LVGL calls. */
#include "offline.h"
#include <math.h>
#include <stdlib.h>
#include <string.h>
#define PI 3.14159265358979323846f
static float clampf(float x,float a,float b){return x<a?a:x>b?b:x;}
static float ease(float x){x=clampf(x,0,1);return x*x*(3-2*x);}
static void phase(of_game_t *g,of_phase_t p){g->phase=p;g->phase_ms=0;}
static uint32_t decay(uint32_t value,uint32_t ms){return value>ms?value-ms:0;}
static void finish(of_game_t *g,bool ok){if(g->phase==OF_WON||g->phase==OF_LOST)return;phase(g,ok?OF_WON:OF_LOST);g->events|=ok?OF_EV_WIN:OF_EV_FAIL;}
void of_game_init(of_game_t *g,unsigned id){
 memset(g,0,sizeof(*g));g->id=id<9?id:0;g->phase=OF_READY;g->power=50;g->x=36;g->y=120;g->angle=-.32f;g->direction=1;g->zoom=1;g->grounded=true;g->focus_target=-1;g->walker_scale=1;
 if(id==1){g->cursor=90;g->platform=56;g->y=132;}
 if(id==2){g->x=82;g->y=99;}
 if(id==3){g->x=52;g->y=129;}
 if(id==4){g->x=34;g->y=112;g->cursor=of_ice_sites[0];}
 if(id==5){g->x=110;g->y=91;}
 if(id==6){g->world=30;g->y=136-of_geometry.cycle_height;}
 if(id==7){g->x=190;g->y=48;g->walker_x=48;}
 if(id==8){g->x=30;g->y=195;g->heading=-PI/2;g->choice=1;}
}
void of_game_direction(of_game_t *g,int d){g->input=d<0?-1:d>0?1:0;}
bool of_magnet_support(const of_game_t *g,bool *left,bool *right){
 const of_geometry_t *b=&of_geometry;
 float l=fmaxf(0,fminf(b->left,g->x+b->half)-fmaxf(8,g->x-b->half));
 float r=fmaxf(0,fminf(312,g->x+b->half)-fmaxf(b->right,g->x-b->half));
 *left=l>=b->support;*right=r>=b->support;return *left&&*right;
}
float of_camera_zoom(const of_game_t *g){static const float zooms[]={.75f,1,1.5f};return zooms[g->zoom<3?g->zoom:1];}
void of_camera_geometry(const of_game_t *g,unsigned i,float *x,float *y,float *size){
 float t=g->time/1000.0f,z=of_camera_zoom(g);
 *x=160+(40+i*92+sinf(t*(i==2?1.3f:.4f)+i)*(i==2?18:5)-g->x)*z;
 *y=91+sinf(t*.8f+i)*10;*size=25*z;
}
static int camera_candidate(const of_game_t *g){
 float z=of_camera_zoom(g),rock=160+(260-g->x*.6f)*z;
 for(int i=0;i<5;i++){float x,y,size;of_camera_geometry(g,i,&x,&y,&size);
  bool frame=fabsf(x-160)+size/2<=38&&fabsf(y-91)+size/2<=30;
  bool obscured=fabsf(x-rock)<(43*z+size)/2&&fabsf(y-130)<(43*z+size)/2;
  if(frame&&size>=18&&size<=45&&!obscured)return i;
 }return -1;
}
void of_camera_retake(of_game_t *g){phase(g,OF_READY);g->review=false;g->focus_ms=0;g->focus_target=-1;}
void of_game_release(of_game_t *g){
 if(g->id!=3||g->phase!=OF_ACTIVE)return;
 float speed=g->hits?45+15*g->hits*g->hits:0;
 g->freeze_ms=0;g->vx=cosf(g->angle)*speed;g->vy=g->hits?sinf(g->angle)*speed-45:0;
 g->old_x=g->x;g->distance=0;phase(g,OF_DROP);g->events|=OF_EV_RELEASE;
}
void of_sensor_target(of_game_t *g,unsigned target){
 bool unlocked=g->tracking_unlocked;of_game_init(g,8);g->tracking_unlocked=unlocked;g->target_kind=target&&unlocked;
}
static void sensor_branch(const of_game_t *g,float *x,float *y,float *angle){
 *angle=g->heading+((int)g->choice-1)*PI/2;
 *x=clampf(g->x+cosf(*angle)*40,10,230);*y=clampf(g->y+sinf(*angle)*40,10,230);
}
void of_game_key(of_game_t *g,int key){
 if(g->paused)return;
 if(g->id==5&&g->phase==OF_REVEAL){if(key==2)of_camera_retake(g);return;}
 if(g->id==7&&g->phase==OF_CLAIMED){if(key==2){unsigned choice=g->choice;of_game_init(g,7);g->choice=choice;}return;}
 if(g->phase==OF_WON||g->phase==OF_LOST){
  if(key==2){
   if(g->id==8&&g->phase==OF_WON&&!g->target_kind)return; // The app opens the corresponding map.
   if(g->id==4&&g->phase==OF_LOST){phase(g,OF_READY);g->x=34;g->y=112;g->leg=0;g->walker_scale=1;}
   else {unsigned id=g->id;of_game_init(g,id);}
  }return;
 }
 int d=key==0?-1:1;
 if(g->id<2&&g->cooldown)return;
 switch(g->id){
 case 0:
  if(key==2&&g->phase==OF_READY){phase(g,OF_ACTIVE);g->x=36;g->y=89;g->vx=55+g->power*1.25f;g->vy=-62-g->power*.25f;g->events|=OF_EV_ACTION;}
  else if(key==2&&g->phase==OF_ACTIVE){g->shot_x=g->x;g->shot_y=g->y;g->flash_ms=600;g->cooldown=2500;g->events|=OF_EV_RELEASE;
   if(hypotf(g->x-257,g->y-125)<47)finish(g,true);else phase(g,OF_COOLDOWN);
  }break;
 case 1:
  if(key==2&&!g->placed){g->placed=true;g->on_platform=fabsf(g->cursor-g->platform)<26;g->x=g->cursor;g->y=g->on_platform?107:132;g->events|=OF_EV_ACTION;}
  else if(key==2){g->shot_x=g->x;g->shot_y=g->y;g->placed=false;g->flash_ms=500;g->cooldown=2500;g->events|=OF_EV_RELEASE;if(hypotf(g->x-264,g->y-87)<32)finish(g,true);}
  break;
 case 2:
  if(key==2&&g->phase==OF_READY){g->held=true;g->lifting=true;phase(g,OF_LIFT);g->events|=OF_EV_ACTION;}
  else if(key==2&&g->phase==OF_ACTIVE){g->held=false;g->vy=0;phase(g,OF_DROP);g->events|=OF_EV_RELEASE;}break;
 case 3:
  if(key==2&&g->phase==OF_READY){phase(g,OF_ACTIVE);g->hits=0;g->freeze_ms=10000;g->vx=g->vy=0;g->events|=OF_EV_ACTION;}
  else if(key==2&&g->phase==OF_ACTIVE){if(g->hits<6){g->hits++;g->pulse_ms=200;g->events|=OF_EV_HIT;}else of_game_release(g);}break;
 case 4:
  if(g->phase!=OF_READY)break;
  if(key!=2){g->choice=(g->choice+5+d)%5;g->cursor=of_ice_sites[g->choice];break;}
  if(g->ice&(1u<<g->choice)){
   g->ice&=~(1u<<g->choice);unsigned k=0;while(k<g->pillar_count&&g->pillar_order[k]!=g->choice)k++;
   for(unsigned i=k;i+1<g->pillar_count;i++)g->pillar_order[i]=g->pillar_order[i+1];if(g->pillar_count)g->pillar_count--;g->events|=OF_EV_BREAK;
  }else{
   if(g->pillar_count==3){g->ice&=~(1u<<g->pillar_order[0]);g->pillar_order[0]=g->pillar_order[1];g->pillar_order[1]=g->pillar_order[2];g->pillar_count--;g->events|=OF_EV_BREAK;}
   g->pillar_order[g->pillar_count++]=g->choice;g->ice|=1u<<g->choice;g->ice_birth[g->choice]=g->time;g->events|=OF_EV_ACTION;
  }
  g->gate=false;for(int i=0;i<5;i++)if((g->ice&(1u<<i))&&abs(of_ice_sites[i]-214)<18)g->gate=true;
  if(g->pillar_count==3){phase(g,OF_SETTLE);g->x=34;g->y=112;g->leg=0;g->leg_ms=0;}break;
 case 5:
  if(key==2&&g->phase==OF_READY){int candidate=camera_candidate(g);g->capture_valid=candidate>=0&&g->focus_ms>=700;g->choice=g->capture_valid?candidate:255;
   if(g->capture_valid)g->seen|=1u<<candidate;g->review=true;g->flash_ms=140;g->events|=OF_EV_ACTION;if(g->capture_valid)g->events|=OF_EV_WIN;phase(g,OF_REVEAL);
  }break;
 case 6:
  if(g->phase==OF_READY&&key==2){g->speed=82;phase(g,OF_ACTIVE);g->events|=OF_EV_ACTION;break;}
  if(g->phase==OF_ACTIVE){if(key==1)g->brake_ms=1200;else g->jump_buffer=200;}break;
 case 7:
  if(key!=2&&g->phase==OF_READY)g->choice=(g->choice+3+d)%3;
  if(key==2){if(g->phase==OF_READY){phase(g,OF_LIFT);g->events|=OF_EV_ACTION;}
   else if(g->phase==OF_CHEST){g->old_x=g->walker_x;phase(g,OF_APPROACH);}
   else if(g->phase==OF_REWARD){phase(g,OF_CROSS);g->events|=OF_EV_COLLECT;}
  }break;
 case 8:
  if(g->phase!=OF_READY)break;
  if(key!=2){g->choice=(g->choice+3+d)%3;g->stage=0;break;}
  sensor_branch(g,&g->target,&g->target_y,&g->target_heading);
  if(hypotf(g->target-g->x,g->target_y-g->y)<1){g->stage=1;break;}
  g->stage=0;g->old_x=g->x;g->old_y=g->y;g->walking=true;phase(g,OF_ACTIVE);break;
 }
}
bool of_cycle_gap(float x){return (x>350&&x<402)||(x>745&&x<797);}
void of_game_step(of_game_t *g,uint32_t ms){
 if(g->paused)return;
 if(g->id==5&&g->phase==OF_REVEAL){g->flash_ms=decay(g->flash_ms,ms);return;}
 if(ms>40)ms=40;float dt=ms/1000.0f;g->time+=ms;g->phase_ms+=ms;g->cooldown=decay(g->cooldown,ms);g->flash_ms=decay(g->flash_ms,ms);g->pulse_ms=decay(g->pulse_ms,ms);
 if(g->phase==OF_WON||g->phase==OF_LOST||g->phase==OF_CLAIMED)return;
 switch(g->id){
 case 0:
  if(g->phase==OF_READY)g->power=clampf(g->power+g->input*48*dt,15,100);
  if(g->phase==OF_COOLDOWN&&!g->cooldown)phase(g,OF_READY);
  if(g->phase==OF_ACTIVE){g->vy+=160*dt;g->x+=g->vx*dt;g->y+=g->vy*dt;float floor=100+(g->x-30)*.14f;
   if(g->y>=floor){g->y=floor;if(g->vy>14){g->vy=-g->vy*.3f;g->vx*=.88f;}else{g->vy=0;g->vx+=12*dt;}}
   if(g->x>312)finish(g,false);
  }break;
 case 1:
  g->platform=160+sinf(g->time*.0008f)*104;
  if(!g->placed)g->cursor=clampf(g->cursor+g->input*70*dt,35,280);else if(g->on_platform){g->x=g->platform;g->y=107;}break;
 case 2:
  if(g->held){g->x=clampf(g->x+g->input*46*dt,of_geometry.half+8,312-of_geometry.half);
   if(g->lifting){g->y=fmaxf(65,g->y-45*dt);if(g->y<=65){g->lifting=false;phase(g,OF_ACTIVE);}}
  }else if(g->phase==OF_DROP){float before=g->y;bool l,r;g->vy+=180*dt;g->y+=g->vy*dt;
   float land=of_geometry.top-of_geometry.surface_offset;
   if(of_magnet_support(g,&l,&r)&&before<=land+.01f&&g->y>=land){g->y=land;g->vy=0;phase(g,OF_SETTLE);}
   else{g->roll=(l&&!r?1:r&&!l?-1:0)*clampf(g->phase_ms/1000.0f,0,1)*.35f;if(g->y>177)finish(g,false);}
  }else if(g->phase==OF_SETTLE&&g->phase_ms>=600)phase(g,OF_CROSS);
  else if(g->phase==OF_CROSS&&g->phase_ms>=3200)finish(g,true);break;
 case 3:
  if(g->phase==OF_READY||g->phase==OF_ACTIVE)g->angle=clampf(g->angle+g->input*.65f*dt,-.68f,-.12f);
  if(g->phase==OF_READY){float before=g->x;g->x+=g->direction*52*dt;if(g->x>=222){g->x=222;g->direction=-1;}if(g->x<=48){g->x=48;g->direction=1;}g->roll+=(g->x-before)/18;g->y=129;}
  else if(g->phase==OF_ACTIVE){uint32_t before=g->freeze_ms;g->freeze_ms=decay(g->freeze_ms,ms);if(before>1683&&g->freeze_ms<=1683)g->events|=OF_EV_TIMER;if(!g->freeze_ms)of_game_release(g);}
  else if(g->phase==OF_DROP){g->vy+=220*dt;g->x+=g->vx*dt;g->y+=g->vy*dt;g->roll+=g->vx*dt*PI/120;
   g->distance=fmaxf(0,(g->x-g->old_x)/6);g->camera=fmaxf(0,g->x-120);g->camera_y=fminf(0,g->y-70);
   if(g->y>=129&&g->vy>=0&&g->phase_ms>120){g->y=129;g->vy=0;g->camera_y=0;phase(g,OF_LANDING);}
  }else if(g->phase==OF_LANDING){float before=g->x;g->x+=g->vx*dt;g->vx*=expf(-5*dt);g->roll+=(g->x-before)/18;g->camera=fmaxf(0,g->x-120);g->distance=fmaxf(0,(g->x-g->old_x)/6);if(g->phase_ms>=800)finish(g,g->hits==6);}break;
 case 4:
  if(g->phase==OF_SETTLE&&g->phase_ms>=550){phase(g,OF_CROSS);g->leg_ms=0;}
  else if(g->phase==OF_RETREAT){float u=fminf(1,g->phase_ms/550.0f);g->x=g->old_x-sinf(u*PI)*5;g->y=g->old_y-sinf(u*PI)*5;g->walker_scale=1;if(g->phase_ms>=550)finish(g,false);}
  else if(g->phase==OF_FINISH){if(g->phase_ms>=350)finish(g,true);}
  else if(g->phase==OF_CROSS){
   float path[5]={34,0,0,0,284};unsigned n=1;for(int i=0;i<5;i++)if(g->ice&(1u<<i))path[n++]=of_ice_sites[i];
   if(g->leg>=4){phase(g,OF_FINISH);break;}
   float from=path[g->leg],to=path[g->leg+1],from_foot=g->leg==0?112:80,to_foot=g->leg==3?112:80;
   if(to-from>74||(!g->gate&&from<205&&to>205)){g->old_x=from;g->old_y=from_foot;phase(g,OF_RETREAT);break;}
   g->leg_ms+=ms;float u=clampf((g->leg_ms-140.0f)/580,0,1);g->x=from+(to-from)*u;g->y=from_foot+(to_foot-from_foot)*ease(u)-sinf(PI*u)*24;
   g->walker_scale=g->leg_ms<140?1-.12f*sinf(PI*g->leg_ms/140.0f):g->leg_ms>720?1-.1f*sinf(PI*(g->leg_ms-720)/140.0f):1;
   if(g->leg_ms>=860){g->x=to;g->y=to_foot;g->walker_scale=1;g->leg++;g->leg_ms=0;}
  }break;
 case 5:
  if(g->phase==OF_READY){g->x=clampf(g->x+g->input*72*dt,25,440);int candidate=camera_candidate(g);
   if(candidate>=0&&candidate==g->focus_target&&!g->input){uint32_t before=g->focus_ms;g->focus_ms+=ms;if(g->focus_ms>1000)g->focus_ms=1000;if(before<700&&g->focus_ms>=700)g->events|=OF_EV_DETECT;}
   else{g->focus_ms=0;g->focus_target=candidate;}
  }break;
 case 6:
  if(g->phase==OF_ACTIVE){
   g->brake_ms=decay(g->brake_ms,ms);g->jump_buffer=decay(g->jump_buffer,ms);g->speed+=((g->brake_ms?58:82)-g->speed)*fminf(1,dt*5);
   if(g->jump_buffer&&(g->grounded||(g->coyote&&g->air_ms<140))){g->events|=OF_EV_BIKE_JUMP;g->vy=-120;g->grounded=false;g->coyote=false;g->jump_buffer=0;g->air_ms=0;}
   g->world+=g->speed*dt;float floor=136-of_geometry.cycle_height;
   if(g->grounded&&of_cycle_gap(g->world)){g->grounded=false;g->coyote=true;g->air_ms=0;g->vy=0;}
   if(g->grounded)g->y=floor;else{g->air_ms+=ms;g->vy+=220*dt;g->y+=g->vy*dt;if(!of_cycle_gap(g->world)&&g->y>=floor&&g->vy>0){g->events|=OF_EV_BIKE_LAND;g->y=floor;g->grounded=true;g->coyote=false;g->air_ms=0;g->vy=0;}}
   bool hit=false;float rock_y=136-of_geometry.rock_ground;
   for(int wheel=-1;wheel<=1;wheel+=2)if(hypotf(g->world+wheel*of_geometry.axle-550,g->y+of_geometry.wheel_y-rock_y)<of_geometry.wheel_radius+of_geometry.rock_radius-2)hit=true;
   if(g->y>166||hit){phase(g,OF_CRASH);g->vy=-28;}
   else if(g->world>=1100&&g->grounded)finish(g,true);
  }else if(g->phase==OF_CRASH){g->speed*=expf(-5*dt);g->world+=g->speed*dt;g->vy+=160*dt;g->y=fminf(of_cycle_gap(g->world)?185:136-of_geometry.cycle_height,g->y+g->vy*dt);if(g->phase_ms>=650)finish(g,false);}break;
 case 7:
  if(g->phase==OF_LIFT&&g->phase_ms>=1200){g->y=42;g->vy=0;phase(g,OF_DROP);}
  else if(g->phase==OF_DROP){g->vy+=260*dt;g->y+=g->vy*dt;if(g->y>=111){g->y=111;phase(g,OF_SETTLE);}}
  else if(g->phase==OF_SETTLE){g->y=111-sinf(PI*fminf(1,g->phase_ms/280.0f))*3;if(g->phase_ms>=280){g->y=111;phase(g,OF_CHEST);}}
  else if(g->phase==OF_APPROACH){g->walker_x=g->old_x+(g->x-44-g->old_x)*ease(g->phase_ms/650.0f);if(g->phase_ms>=650){phase(g,OF_REVEAL);g->events|=OF_EV_OPEN;}}
  else if(g->phase==OF_REVEAL&&g->phase_ms>=800){phase(g,OF_REWARD);g->events|=OF_EV_REWARD;}
  else if(g->phase==OF_CROSS&&g->phase_ms>=550){phase(g,OF_CLAIMED);g->events|=OF_EV_WIN;}break;
 case 8:{
   if(g->phase==OF_REVEAL){if(g->phase_ms>=3200)finish(g,true);break;}
   if(g->walking){float u=fminf(1,g->phase_ms/1000.0f);g->x=g->old_x+(g->target-g->old_x)*u;g->y=g->old_y+(g->target_y-g->old_y)*u;if(u>=1){g->heading=g->target_heading;g->walking=false;g->choice=1;phase(g,OF_READY);}}
   float tx=g->target_kind?90:190,ty=g->target_kind?50:40,dist=hypotf(tx-g->x,ty-g->y),bx,by,angle;
   if(g->walking){bx=g->target;by=g->target_y;}else sensor_branch(g,&bx,&by,&angle);
   float next=hypotf(tx-bx,ty-by);g->signal=(uint8_t)lroundf(clampf((1-dist/300)*(next<dist?1:.25f)*4,0,4));
   g->tone_ms+=ms;if(g->signal&&g->tone_ms>1650-g->signal*300){g->tone_ms=0;g->events|=OF_EV_SENSOR;}
   if(dist<15){g->walking=false;phase(g,OF_REVEAL);g->events|=OF_EV_FOUND;}
  }break;
 }
}
const char *of_game_hint(const of_game_t *g){
 if(g->id==5&&g->phase==OF_REVEAL)return of_text("临时预览 · OK 返回取景","PREVIEW · OK return");
 if(g->id==7&&g->phase==OF_CHEST)return of_text("OK 走近开箱","OK approach and open");
 if(g->id==7&&g->phase==OF_REWARD)return of_text("OK 收取奖励","OK collect");
 if(g->id==8&&g->phase==OF_WON&&!g->target_kind)return of_text("OK 在地图查看","OK view on map");
 if(g->phase==OF_WON||g->phase==OF_LOST||g->phase==OF_CLAIMED)return of_text("OK 再试一次","OK try again");
 static const char *cn[]={"上下调力度 · OK 投掷/引爆","上下选落点 · OK 放置/引爆","OK 抓取/放下 · 上下搬运","上下调角度 · OK 锁定/击打","上下选点 · OK 造冰/碎冰","上下平移 · OK 快门","OK/上 起跳 · 下 短暂减速","上下选角色 · OK 读取","上下选路 · OK 自动前进"};
 static const char *en[]={"UP/DN power · OK throw/blast","UP/DN aim · OK place/blast","OK grab/drop · UP/DN move","UP/DN angle · OK lock/strike","UP/DN site · OK ice/break","UP/DN pan · OK shutter","OK/UP jump · DN brake","UP/DN figure · OK scan","UP/DN path · OK follow"};
 return of_text(cn[g->id],en[g->id]);
}
