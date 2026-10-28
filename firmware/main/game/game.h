// 五种试炼的纯C模型，与平台、LVGL及音频解耦。
#pragma once
#include "progress.h"

typedef enum { GAME_BOMB, GAME_MAGNET, GAME_STASIS, GAME_CRYONIS, GAME_CAMERA, GAME_COUNT } game_id_t;
typedef enum { GAME_PREV, GAME_NEXT, GAME_OK, GAME_SECONDARY } game_input_t;
typedef enum { GS_READY, GS_HELD, GS_MOVING, GS_ACTIVE, GS_COOLDOWN, GS_PHOTO, GS_DONE } game_state_t;
enum {
    GE_PLACE=1u, GE_BLAST=2u, GE_GRAB=4u, GE_FREEZE=8u, GE_RELEASE=16u,
    GE_ICE=32u, GE_SHUTTER=64u, GE_HIT=128u, GE_SHATTER=256u,
    GE_FOUND=512u, GE_COMPLETE=1024u, GE_SAVE=2048u
};
enum { STASIS_MS=10000, STASIS_COOLDOWN_MS=10000, STASIS_MAX_HITS=6,
       BOMB_COOLDOWN_MS=2500, ICE_COOLDOWN_MS=800, GAME_MAX_STEP_MS=100 };

typedef struct {
    game_id_t id;
    game_state_t state;
    progress_t *progress;
    uint32_t elapsed, timer, cooldown, effect;
    unsigned events;
    bool paused, cube;
    int selection, direction, hit_direction, power, axis;
    float x, y, aim, start_x, start_y;
    int pillars[3], pillar_count, growing;
    uint32_t grow_ms;
    photo_t photo;
    int photo_choice, detected;
    const char *message;
} game_t;

void game_init(game_t *g, game_id_t id, bool cube, progress_t *progress);
void game_reset(game_t *g);
void game_input(game_t *g, game_input_t input);
void game_step(game_t *g, uint32_t milliseconds);
void game_complete(game_t *g);
const char *game_title(game_id_t id);
const char *game_goal(game_id_t id);
float game_clamp(float x, float lo, float hi);
void bomb_input(game_t *, game_input_t);
void bomb_step(game_t *, uint32_t);
void magnet_input(game_t *, game_input_t);
void magnet_step(game_t *, uint32_t);
void stasis_input(game_t *, game_input_t);
void stasis_step(game_t *, uint32_t);
void cryonis_input(game_t *, game_input_t);
void cryonis_step(game_t *, uint32_t);
void camera_input(game_t *, game_input_t);
void camera_step(game_t *, uint32_t);
void camera_snapshot(const game_t *, photo_t *);
int camera_detect(const photo_t *);
int cryonis_slot_x(int slot);
