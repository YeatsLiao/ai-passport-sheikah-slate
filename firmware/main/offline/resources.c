/* Read-only, versioned assets partition. All image pointers remain Flash-backed. */
#include "offline.h"
#include "esp_partition.h"
#include "esp_rom_crc.h"
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdatomic.h>
#pragma pack(push,1)
typedef struct {char magic[8];uint32_t count,index_crc;} pack_header_t;
typedef struct {char name[64];uint32_t offset,size;uint16_t w,h;uint32_t format,crc;} pack_entry_t;
#pragma pack(pop)
_Static_assert(sizeof(pack_entry_t)==84,"pack index ABI");
static const uint8_t *base;
static const pack_entry_t *entries;
static uint32_t count;
static esp_partition_mmap_handle_t mapping;
static _Atomic(const char *) error="Resource pack not loaded";
static _Atomic bool validated[2048];
static lv_image_dsc_t descriptors[64];
static unsigned images;
static const pack_entry_t *lookup(const char *name){
 if(!base)return NULL;
 uint32_t lo=0,hi=count;
 while(lo<hi){uint32_t mid=lo+(hi-lo)/2;int order=strcmp(entries[mid].name,name);if(order<0)lo=mid+1;else hi=mid;}
 if(lo==count||strcmp(entries[lo].name,name))return NULL;
 const pack_entry_t *e=&entries[lo];
 if(!atomic_load(&validated[lo])){if(esp_rom_crc32_le(0,base+e->offset,e->size)!=e->crc){error="Resource checksum mismatch";return NULL;}atomic_store(&validated[lo],true);}
 return e;
}
const void *of_resource(const char *name,size_t *size){const pack_entry_t *e=lookup(name);if(!e)return NULL;if(size)*size=e->size;return base+e->offset;}
const char *of_resource_error(void){return atomic_load(&error);}
void of_resources_page_reset(void){images=0;}
const lv_image_dsc_t *of_image(const char *name){
 const pack_entry_t *e=lookup(name);if(!e||(e->format!=1&&e->format!=2&&e->format!=4)||!e->w||!e->h)return NULL;
 uint64_t bytes=(uint64_t)e->w*e->h*(e->format==2?4:e->format==4?3:2);if(bytes!=e->size)return NULL;
 for(unsigned i=0;i<images;i++)if(descriptors[i].data==base+e->offset)return &descriptors[i];
 if(images>=sizeof(descriptors)/sizeof(descriptors[0]))return NULL;
 lv_image_dsc_t *d=&descriptors[images++];memset(d,0,sizeof(*d));d->header.magic=LV_IMAGE_HEADER_MAGIC;d->header.cf=e->format==2?LV_COLOR_FORMAT_ARGB8888:e->format==4?LV_COLOR_FORMAT_RGB565A8:LV_COLOR_FORMAT_RGB565;
 d->header.w=e->w;d->header.h=e->h;d->header.stride=e->w*(e->format==2?4:2);d->data_size=e->size;d->data=base+e->offset;return d;
}
typedef struct {const pack_entry_t *entry;uint32_t pos;} file_t;
static void *fs_open(lv_fs_drv_t *drv,const char *path,lv_fs_mode_t mode){(void)drv;if(mode!=LV_FS_MODE_RD)return NULL;while(*path=='/')path++;const pack_entry_t *e=lookup(path);if(!e)return NULL;file_t *f=malloc(sizeof(*f));if(f){f->entry=e;f->pos=0;}return f;}
static lv_fs_res_t fs_close(lv_fs_drv_t *d,void *f){(void)d;free(f);return LV_FS_RES_OK;}
static lv_fs_res_t fs_read(lv_fs_drv_t *d,void *p,void *buf,uint32_t request,uint32_t *read){(void)d;file_t *f=p;uint32_t n=f->entry->size-f->pos;if(n>request)n=request;memcpy(buf,base+f->entry->offset+f->pos,n);f->pos+=n;*read=n;return LV_FS_RES_OK;}
static lv_fs_res_t fs_seek(lv_fs_drv_t *d,void *p,uint32_t pos,lv_fs_whence_t whence){(void)d;file_t *f=p;uint64_t n=pos;if(whence==LV_FS_SEEK_CUR)n+=f->pos;else if(whence==LV_FS_SEEK_END)n+=f->entry->size;if(n>f->entry->size)return LV_FS_RES_INV_PARAM;f->pos=n;return LV_FS_RES_OK;}
static lv_fs_res_t fs_tell(lv_fs_drv_t *d,void *p,uint32_t *pos){(void)d;*pos=((file_t*)p)->pos;return LV_FS_RES_OK;}
bool of_resources_init(void){
 const esp_partition_t *p=esp_partition_find_first(ESP_PARTITION_TYPE_DATA,0x40,"resources");
 if(!p){error="Missing resources partition";return false;}
 if(esp_partition_mmap(p,0,p->size,ESP_PARTITION_MMAP_DATA,(const void**)&base,&mapping)!=ESP_OK){error="Cannot map resource pack";return false;}
 const pack_header_t *h=(const void*)base;
 if(h->index_crc!=of_pack_index_crc||memcmp(h->magic,"SLATEPK1",8)||h->count>2048||!h->count)goto invalid;
 count=h->count;entries=(const void*)(base+sizeof(*h));uint32_t index_size=count*sizeof(*entries);
 if(sizeof(*h)+index_size>p->size||esp_rom_crc32_le(0,(const uint8_t*)entries,index_size)!=h->index_crc)goto invalid;
 for(uint32_t i=0;i<count;i++){
  const pack_entry_t *e=&entries[i];if(!memchr(e->name,0,64)||e->offset<sizeof(*h)+index_size||(e->offset&3)||e->offset>p->size||e->size>p->size-e->offset)goto invalid;
  if(i&&strcmp(entries[i-1].name,e->name)>=0)goto invalid;
 }
 static lv_fs_drv_t fs;lv_fs_drv_init(&fs);fs.letter='R';fs.open_cb=fs_open;fs.close_cb=fs_close;fs.read_cb=fs_read;fs.seek_cb=fs_seek;fs.tell_cb=fs_tell;lv_fs_drv_register(&fs);
 error=NULL;return true;
invalid:
 error="Invalid pack version/index/bounds";esp_partition_munmap(mapping);base=NULL;count=0;return false;
}
