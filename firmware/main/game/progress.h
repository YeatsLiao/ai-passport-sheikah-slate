// 可移植进度与相册；持久化采用显式小端编码，避免结构体填充差异。
#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#define PHOTO_CAPACITY 8
#define SUBJECT_COUNT 5
#define PROGRESS_BYTES 256

typedef struct {
    int16_t center;
    int16_t x[SUBJECT_COUNT], y[SUBJECT_COUNT];
    uint8_t zoom;
    int8_t target;
} photo_t;

typedef struct {
    uint8_t completed, discovered, count, next;
    uint8_t brightness, volume, sound;
    photo_t photos[PHOTO_CAPACITY];
} progress_t;

void progress_default(progress_t *p);
bool progress_add_photo(progress_t *p, const photo_t *photo);
void progress_encode(const progress_t *p, uint8_t out[PROGRESS_BYTES]);
bool progress_decode(progress_t *p, const uint8_t *data, size_t size);
unsigned progress_count(uint8_t bits);
