/* Page renderers (home/runes/inventory/compendium+quests/map/album) and their state. */
#include "app_internal.h"
#include <stdio.h>
#include <string.h>
#include <limits.h>

page_t page=P_STANDBY;
int selected,category,home_selection;
int map_axis,map_zoom=1,map_x=384,map_y=320,map_selected;
int inventory_choice,album_mode,album_choice,read_choice,pending_category;
bool inventory_menu,read_menu,editing;
int ids[OF_COMP_COUNT],filtered;
int page_selected[10],page_category[10],item_selected[3][5];
static const char *home_cn[]={"装备","符文","地图","海拉鲁图鉴","冒险日志","设置","相册","待机"};
static const char *home_en[]={"EQUIPMENT","RUNES","MAP","COMPENDIUM","ADVENTURE LOG","SETTINGS","ALBUM","STANDBY"};

int item_page(void){return page==P_INVENTORY?0:page==P_COMP?1:2;}
void filter_items(void){filtered=0;if(page==P_COMP){for(int i=0;i<OF_COMP_COUNT;i++)if(of_comp[i].category==category)ids[filtered++]=i;}else if(page==P_QUEST){for(int i=0;i<OF_QUEST_COUNT;i++)if(of_quests[i].category==category)ids[filtered++]=i;}else{for(int i=0;i<OF_INV_COUNT;i++)if(of_inventory[i].category==category)ids[filtered++]=i;}if(selected>filtered)selected=0;}
int slot_for(const of_item_t *e){if(e->category<2)return e->category;return e->slot;}
static const char *category_name(int c){
 static const char *cc[]={"生物","怪物","材料","装备","宝物"},*ce[]={"CREATURES","MONSTERS","MATERIALS","EQUIPMENT","TREASURE"};
 static const char *qc[]={"主线","神庙挑战","迷你挑战"},*qe[]={"MAIN","SHRINE","SIDE"};
 return page==P_COMP?of_text(cc[c],ce[c]):of_text(qc[c],qe[c]);
}
void read_item(void){
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
void category_menu(void){modal=box(screen,36,48,248,144,BG,255);lv_obj_set_style_border_width(modal,1,0);lv_obj_set_style_border_color(modal,lv_color_hex(CYAN),0);int n=page==P_COMP?5:3;
 static const char *cc[]={"生物","怪物","材料","装备","宝物"},*ce[]={"CREATURES","MONSTERS","MATERIALS","EQUIPMENT","TREASURE"};
 static const char *qc[]={"主线","神庙挑战","迷你挑战"},*qe[]={"MAIN","SHRINE","SIDE"};
 static const char *ic[]={"武器","盾牌","防具"},*ie[]={"WEAPONS","SHIELDS","ARMOR"};
 for(int i=0;i<n;i++){lv_obj_t *o=box(modal,4,4+i*26,240,25,CYAN,pending_category==i?100:0);label(o,page==P_COMP?of_text(cc[i],ce[i]):page==P_QUEST?of_text(qc[i],qe[i]):of_text(ic[i],ie[i]),5,3,230,false,FG);}}
void map_render(void){
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
void home_grid(void){
 text_changed(title,of_text("主目录","MAIN MENU"));
 for(int i=0;i<8;i++){lv_obj_t *tile=box(content,8+(i%2)*154,8+(i/2)*41,148,35,CYAN,i==home_selection?85:20);select_style(tile,i==home_selection);label(tile,of_text(home_cn[i],home_en[i]),10,9,128,false,i==home_selection?GOLD:FG);}
 set_footer(of_text("上下选择 · OK 进入 · 长按返回","UP/DN select · OK enter · hold back"));
}
void rune_grid(void){
 text_changed(title,of_text("符文选择","RUNES"));
 for(int i=0;i<9;i++){lv_obj_t *tile=box(content,8+(i%3)*68,7+(i/3)*55,64,51,CYAN,i==selected?85:10);select_style(tile,i==selected);char key[24];snprintf(key,sizeof(key),"ui/rune%d",i);picture(tile,key,19,3);
  lv_obj_t *name=label(tile,of_state.lang?of_rune_en[i]:of_rune_tile_cn[i],2,32,60,false,FG);lv_obj_set_style_text_font(name,&of_chinese_10,0);lv_obj_set_style_text_align(name,LV_TEXT_ALIGN_CENTER,0);lv_obj_set_height(name,16);lv_label_set_long_mode(name,LV_LABEL_LONG_SCROLL_CIRCULAR);
  if(of_state.completed&(1u<<i)){lv_obj_t *mark=label(tile,"*",2,1,12,false,GOLD);lv_obj_set_style_text_font(mark,&of_chinese_10,0);}
 }
 lv_obj_t *name=label(content,of_text(of_rune_cn[selected],of_rune_en[selected]),218,8,94,true,GOLD);lv_obj_set_height(name,21);lv_label_set_long_mode(name,LV_LABEL_LONG_SCROLL_CIRCULAR);
 scrolling_text(content,of_text(of_rune_desc_cn[selected],of_rune_desc_en[selected]),218,36,94,132);
 set_footer(of_text("上下选符文 · OK 使用 · 长按返回","UP/DN select rune · OK enter · hold back"));
}
void inventory_grid(void){
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
int album_count(void){int n=0;for(int i=0;i<12;i++)if(!(of_state.album_deleted&(1u<<i)))n++;return n;}
int album_index(int pos){for(int i=0;i<12;i++)if(!(of_state.album_deleted&(1u<<i))&&pos--==0)return i;return 0;}
void album_render(void){
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
void open_category(void){pending_category=category;editing=true;read_menu=inventory_menu=false;held_key=-1;of_audio_play("menu",false,true);generation++;render();}
