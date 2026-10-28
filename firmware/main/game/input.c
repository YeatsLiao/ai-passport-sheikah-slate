#include "input.h"
#include <string.h>
#define HOLD_MS 550
void input_reset(input_state_t *s) { memset(s,0,sizeof(*s)); }
input_result_t input_poll(input_state_t *s,int k,uint32_t now) {
    if (k<0 || k>=3 || !s->held[k] || s->consumed[k]) return INPUT_NONE;
    if ((uint32_t)(now-s->down[k])<HOLD_MS) return INPUT_NONE;
    s->consumed[k]=true;
    return INPUT_LONG;
}
input_result_t input_edge(input_state_t *s,int k,bool pressed,uint32_t now) {
    if (k<0 || k>=3) return INPUT_NONE;
    if (pressed) {
        if (!s->held[k]) { s->held[k]=true; s->consumed[k]=false; s->down[k]=now; }
        return INPUT_NONE;
    }
    if (!s->held[k]) return INPUT_NONE;
    input_result_t result=input_poll(s,k,now);
    if (result==INPUT_NONE && !s->consumed[k]) result=INPUT_CLICK;
    s->held[k]=false;
    return result;
}
