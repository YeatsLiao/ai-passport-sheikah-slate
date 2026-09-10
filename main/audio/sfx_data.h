// main/audio/sfx_data.h -- 由 tools/gen_audio.py 生成, 勿手改
#pragma once

#include <stdint.h>

#define SFX_COUNT 10

typedef struct {
    const int16_t *pcm;    // 16kHz/16bit/mono
    uint32_t samples;
} sfx_entry_t;

extern const sfx_entry_t SFX[SFX_COUNT];

#define SFX_ACTIVATE         0   // 石板激活 (待机 OK 进符文页)
#define SFX_TICK             1   // 符文轮盘旋转 (UP/DOWN)
#define SFX_CONFIRM          2   // 符文选中 (OK)
#define SFX_BOMB_PLACE       3   // 炸弹放置
#define SFX_BOMB_BOOM        4   // 炸弹引爆
#define SFX_MAGNESIS_ACTIVATE 5   // 磁力激活 (电磁嗡鸣)
#define SFX_STASIS_FREEZE    6   // 时停冻结
#define SFX_STASIS_UNFREEZE  7   // 时停解冻
#define SFX_CRYONIS_ACTIVATE 8   // 制冰激活 (水晶上行)
#define SFX_SHUTTER          9   // 相机快门
