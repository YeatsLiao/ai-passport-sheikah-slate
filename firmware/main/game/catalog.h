#pragma once
#include "lvgl.h"
#include "progress.h"
typedef struct {
    const char *name, *category, *description, *location;
    const lv_image_dsc_t *image;
} subject_t;
extern const subject_t subjects[SUBJECT_COUNT];
