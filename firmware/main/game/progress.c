#include "progress.h"
#include <string.h>

unsigned progress_count(uint8_t bits) {
    unsigned n=0;
    for (; bits; bits>>=1) n+=bits&1;
    return n;
}
void progress_default(progress_t *p) {
    memset(p,0,sizeof(*p));
    p->brightness=80; p->volume=65; p->sound=1;
}
static bool photo_valid(const photo_t *s) {
    if (s->center<160 || s->center>480 || s->zoom>1 || s->target < -1 || s->target>=SUBJECT_COUNT) return false;
    for (int i=0;i<SUBJECT_COUNT;i++)
        if (s->x[i]<0 || s->x[i]>640 || s->y[i]<0 || s->y[i]>240) return false;
    return true;
}
bool progress_add_photo(progress_t *p, const photo_t *s) {
    if (!photo_valid(s)) return false;
    p->photos[p->next]=*s;
    p->next=(p->next+1)%PHOTO_CAPACITY;
    if (p->count<PHOTO_CAPACITY) p->count++;
    bool fresh=s->target>=0 && !(p->discovered&(1u<<s->target));
    if (s->target>=0) p->discovered|=1u<<s->target;
    if (p->discovered==31) p->completed|=1u<<4;
    return fresh;
}
static uint32_t hash(const uint8_t *b, size_t n) {
    uint32_t v=2166136261u;
    while (n--) v=(v^*b++)*16777619u;
    return v;
}
static void put16(uint8_t **b, int16_t v) { *(*b)++=(uint8_t)v; *(*b)++=(uint16_t)v>>8; }
static int16_t get16(const uint8_t **b) { unsigned v=*(*b)++; v|=(unsigned)*(*b)++<<8; return (int16_t)v; }
void progress_encode(const progress_t *p, uint8_t out[PROGRESS_BYTES]) {
    memset(out,0,PROGRESS_BYTES);
    memcpy(out,"SKS2",4); out[4]=1;
    out[5]=p->completed; out[6]=p->discovered; out[7]=p->count; out[8]=p->next;
    out[9]=p->brightness; out[10]=p->volume; out[11]=p->sound;
    uint8_t *b=out+12;
    for (int i=0;i<PHOTO_CAPACITY;i++) {
        const photo_t *s=&p->photos[i];
        put16(&b,s->center); *b++=s->zoom; *b++=(uint8_t)s->target;
        for (int j=0;j<SUBJECT_COUNT;j++) { put16(&b,s->x[j]); put16(&b,s->y[j]); }
    }
    uint32_t h=hash(out,PROGRESS_BYTES-4);
    for (int i=0;i<4;i++) out[PROGRESS_BYTES-4+i]=(uint8_t)(h>>(8*i));
}
bool progress_decode(progress_t *p, const uint8_t *data, size_t size) {
    progress_default(p);
    if (!data || size!=PROGRESS_BYTES || memcmp(data,"SKS2",4) || data[4]!=1) return false;
    uint32_t h=0;
    for (int i=0;i<4;i++) h|=(uint32_t)data[PROGRESS_BYTES-4+i]<<(8*i);
    if (h!=hash(data,PROGRESS_BYTES-4)) return false;
    if (data[5]>31 || data[6]>31 || data[7]>8 || data[8]>=8 || data[9]<10 || data[9]>100 || data[10]>100 || data[11]>1) return false;
    if (data[7]<8 && data[8]!=data[7]) return false;
    progress_t tmp={0};
    tmp.completed=data[5]; tmp.discovered=data[6]; tmp.count=data[7]; tmp.next=data[8];
    tmp.brightness=data[9]; tmp.volume=data[10]; tmp.sound=data[11];
    const uint8_t *b=data+12;
    for (int i=0;i<PHOTO_CAPACITY;i++) {
        photo_t *s=&tmp.photos[i];
        s->center=get16(&b); s->zoom=*b++; s->target=(int8_t)*b++;
        for (int j=0;j<SUBJECT_COUNT;j++) { s->x[j]=get16(&b); s->y[j]=get16(&b); }
        if (i<tmp.count && !photo_valid(s)) return false;
    }
    *p=tmp;
    return true;
}
