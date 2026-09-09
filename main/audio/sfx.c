// main/audio/sfx.c -- 希卡音效播放 (ES8311 + audio worker task)
//
// 架构: sfx_play() 只向 FreeRTOS 队列投递音效 ID (按键回调/LVGL 定时器内安全);
//      audio 任务从队列取出, 懒初始化 bsp_audio, 再分块写 PCM 到 I2S。
// 所有音效统一 16kHz/16bit/mono (gen_audio.py 已转好), set_format 只在首次生效。

#include "sfx.h"
#include "bsp_audio.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"

static const char *TAG = "sfx";

#define SFX_QUEUE_LEN     4
#define SFX_TASK_STACK    4096
#define SFX_TASK_PRIO     3        // 低于 LVGL(4)/按键任务, 音频慢半拍不卡 UI
#define SFX_VOLUME        70       // 0..100
#define SFX_WRITE_CHUNK   2048     // 每次写 2048 采样 (4KB), 避免单次阻塞过久

static QueueHandle_t s_queue;
static bool s_audio_ready;

static void audio_task(void *arg)
{
    (void)arg;
    int id;
    for (;;) {
        if (xQueueReceive(s_queue, &id, portMAX_DELAY) != pdTRUE) continue;
        if (id < 0 || id >= SFX_COUNT) continue;

        const sfx_entry_t *e = &SFX[id];
        if (!e->pcm || e->samples == 0) continue;   // 素材未放入, 静默跳过

        if (!s_audio_ready) {
            if (bsp_audio_init() != ESP_OK) {
                ESP_LOGW(TAG, "bsp_audio_init 失败, 音效不可用");
                vTaskDelay(pdMS_TO_TICKS(1000));    // 别空转刷屏日志
                continue;
            }
            bsp_audio_set_volume(SFX_VOLUME);
            s_audio_ready = true;
            ESP_LOGI(TAG, "audio ready");
        }
        bsp_audio_set_format(16000, 16, 1);         // 同格式重复调用是廉价的

        uint32_t off = 0;
        while (off < e->samples) {
            uint32_t n = e->samples - off;
            if (n > SFX_WRITE_CHUNK) n = SFX_WRITE_CHUNK;
            if (bsp_audio_write(e->pcm + off, n * 2) != ESP_OK) {
                ESP_LOGW(TAG, "write failed @sfx %d", id);
                break;
            }
            off += n;
        }
    }
}

void sfx_init(void)
{
    if (s_queue) return;
    s_queue = xQueueCreate(SFX_QUEUE_LEN, sizeof(int));
    if (!s_queue) {
        ESP_LOGW(TAG, "queue create failed");
        return;
    }
    if (xTaskCreate(audio_task, "sfx", SFX_TASK_STACK, NULL, SFX_TASK_PRIO, NULL)
            != pdPASS) {
        ESP_LOGW(TAG, "task create failed");
        s_queue = NULL;
    }
}

void sfx_play(int id)
{
    if (!s_queue) return;
    xQueueSend(s_queue, &id, 0);    // 不等待, 队列满即丢弃
}
