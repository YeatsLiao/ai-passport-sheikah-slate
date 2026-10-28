// 三键共用的短按/长按分类器；页面切换和队列溢出后丢弃未完成手势。
#pragma once
#include <stdbool.h>
#include <stdint.h>
typedef struct { uint32_t down[3]; bool held[3], consumed[3]; } input_state_t;
typedef enum { INPUT_NONE, INPUT_CLICK, INPUT_LONG } input_result_t;
void input_reset(input_state_t *s);
input_result_t input_edge(input_state_t *s,int key,bool pressed,uint32_t now);
input_result_t input_poll(input_state_t *s,int key,uint32_t now);
