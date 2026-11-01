/* Game scene rendering, pause menus and game event sound dispatch. */
#include "app_internal.h"
#include <stdio.h>
#include <string.h>
#include <math.h>

of_game_t game;
of_game_t saved_games[9];
bool game_saved[9];
bool paused;
bool magnet_sounding;
int pause_mode,pause_choice;
static lv_obj_t *reward;
static unsigned player_frame=255;
static lv_obj_t *objects[8],*choices[5],*road_groups[3],*road_tiles[3][2];
static unsigned object_count;
static struct {lv_obj_t *scene,*shade,*blast,*beam,*shadow,*gate,*force,*aim,*lock,*bar,*reveal,*glow,*rock,*result,*primary,*marks[7];} art;
static float unit(float x){return x<0?0:x>1?1:x;}
static float smooth(float x){x=unit(x);return x*x*(3-2*x);}
static void sprite_at(lv_obj_t *o,float cx,float cy,float w,float h){
 if(!o)return;const lv_image_dsc_t *d=lv_image_get_src(o);if(!d||!d->header.w||!d->header.h)return;
 lv_image_set_pivot(o,0,0);lv_image_set_scale_x(o,(uint32_t)fmaxf(1,w*256/d->header.w));lv_image_set_scale_y(o,(uint32_t)fmaxf(1,h*256/d->header.h));
 lv_obj_set_pos(o,(int)lroundf(cx-w/2),(int)lroundf(cy-h/2));
}
static void player_at(float x,float foot,float height,unsigned frame){
 if(!player)return;if(player_frame!=frame){char key[24];snprintf(key,sizeof(key),"link/%u",frame);const lv_image_dsc_t *d=of_image(key);if(d)lv_image_set_src(player,d);player_frame=frame;}
 sprite_at(player,x,foot-height*.45f,height*32/52,height);
}
void game_render(void){
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
void game_draw(void){
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
int pause_count(void){return game.id==5||(game.id==3&&game.phase==OF_ACTIVE)||game.id==8?4:3;}
void pause_render(void){
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
void events(void){
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
void enter_game(unsigned id){
 page_selected[P_RUNES]=selected;of_audio_stop();of_audio_play("activate",false,true);page=P_GAME;
 if(game_saved[id]){game=saved_games[id];paused=true;}else{of_game_init(&game,id);paused=false;}
 if(id==8)game.tracking_unlocked=game_saved[5]&&(saved_games[5].seen&1);
 game.paused=paused;game.input=0;held_key=-1;pause_mode=0;pause_choice=0;magnet_sounding=false;scroll_elapsed=0;generation++;render();
}
