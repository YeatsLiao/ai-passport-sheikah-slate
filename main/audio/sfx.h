// main/audio/sfx.h -- 希卡音效播放 (非阻塞)
//
// 用法: 上电调一次 sfx_init(), 任意上下文 (含按键回调) 直接 sfx_play(SFX_XXX)。
// 音效 ID 与数据见 sfx_data.h (tools/gen_audio.py 生成)。
// 播放在独立 audio 任务里做 bsp_audio_write, 绝不阻塞按键/LVGL 任务。
#pragma once
#include "sfx_data.h"

// 创建 audio 任务与播放队列。幂等, 重复调用无害。
void sfx_init(void);

// 播放一个音效。非阻塞: 队列满/未初始化/条目为空时静默丢弃。
void sfx_play(int id);
