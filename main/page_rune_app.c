// main/page_rune_app.c -- 游戏符文能力模拟 (REMOTE BOMBS/MAGNESIS/STASIS/CRYONIS/CAMERA)
//
// 模拟旷野之息中 5 个符文能力的使用体验 (纯 LVGL 绘制, 无新素材):
//   REMOTE BOMBS: OK 放置炸弹(引信闪烁) -> 再按 OK 引爆 (冲击环 + 白闪 + 画面震动)
//   MAGNESIS:     UP/DOWN 移动准星, OK 吸附/释放金属箱 (吸附后箱子跟随准星)
//   STASIS:       石块持续左右移动, OK 时停 5 秒 (橙色冰封 + 大字倒计时, 结束解冻)
//   CRYONIS:      OK 从水面升起冰柱 (生长动画, 最多 3 根, 第 4 次最早一根融化)
//   CAMERA:       取景框 + 对焦环, OK 拍照 (白闪 + 底片条 + SAVED 提示)
// 退出: 长按 OK (main.c 全局路由回符文页)。
//
// 注意: 所有 lv_timer 在 enter 创建 / exit 删除, 回调内不创建不删除定时器;
//      删除带动画的对象前必须先 lv_anim_delete, 防止动画回调访问悬空指针。

#include "page_rune_app.h"
#include "page_runes.h"
#include "sheikah_theme.h"
#include "audio/sfx.h"
#include "bsp_display.h"
#include "esp_log.h"
#include <math.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

static const char *TAG = "rune_app";

// ---- 符文下标 (与 page_runes.c 的 RUNES[] 顺序一致) ----
enum { RUNE_BOMB = 0, RUNE_MAGNET, RUNE_STASIS, RUNE_CRYONIS, RUNE_CAMERA };

static const char *RUNE_TITLES[] = {
    "REMOTE BOMBS", "MAGNESIS", "STASIS", "CRYONIS", "CAMERA",
};
static const char *RUNE_HINTS[] = {
    "UP/DN  AIM    OK  THROW/BOOM",
    "UP/DN  AIM       OK  GRAB",
    "OK  FREEZE",
    "OK  RAISE PILLAR",
    "UP/DN  AIM    OK  SHUTTER",
};

// ---- 模拟区域 (标题栏与页脚之间) ----
#define AREA_X   8
#define AREA_Y   (SK_HEADER_H + 6)
#define AREA_W   (SK_SCREEN_W - 16)                                  // 224
#define AREA_H   (SK_SCREEN_H - SK_HEADER_H - SK_FOOTER_H - 12)      // 236
#define AREA_CX  (AREA_W / 2)
#define AREA_CY  (AREA_H / 2)

// ---- 通用状态 ----
static lv_obj_t *s_scr;
static lv_obj_t *s_area;          // 模拟区容器 (震动时整体平移)
static int       s_rune = -1;

// ---- 炸弹 ----
static lv_obj_t *s_bomb;            // 已放置的炸弹
static lv_obj_t *s_target;          // 投掷瞄准指示器 (虚线圆)
static lv_obj_t *s_blast_ring;      // 爆炸范围指示 (半透明大圆)
static int       s_bomb_target_y;   // 投掷目标 Y (UP/DOWN 调整)
static int       s_boom_x, s_boom_y; // 引爆中心 (爆炸动画用)
enum { BOMB_IDLE = 0, BOMB_ARMED }; // IDLE=可投掷, ARMED=已放置可引爆
static int       s_bomb_state;

// ---- 磁力 ----
#define MAG_OBJ_COUNT 3
static lv_obj_t *s_cross;                    // 准星
static lv_obj_t *s_objs[MAG_OBJ_COUNT];      // 3 个金属物体
static lv_obj_t *s_shadows[MAG_OBJ_COUNT];   // 地面阴影
static int       s_obj_ground_y[MAG_OBJ_COUNT]; // 各物体地面 Y (释放后落回)
static lv_obj_t *s_mag_status;
static int       s_grab_idx;                 // -1 = 未抓取, 0-2 = 抓取下标

// ---- 时停 ----
static lv_obj_t  *s_stone;        // 移动石块
static lv_obj_t  *s_frost;        // 冰封遮罩
static lv_obj_t  *s_count;        // 倒计时
static lv_timer_t *s_move_timer;
static lv_timer_t *s_count_timer;
static lv_timer_t *s_boost_timer; // 解冻后加速计时器
static int        s_dir;
static int        s_countdown;
static int        s_stone_speed;  // 当前速度 (正常 3, 加速 6)

// ---- 制冰 ----
static lv_obj_t  *s_pillars[3];   // 冰柱对象 (NULL = 空)
static int        s_pillar_h[3];  // 当前高度 (融化动画起始值用)
static int        s_pillar_next;  // 下一根放下标 (循环)
static lv_obj_t  *s_cryo_crate;   // 水面漂浮箱子
static int        s_cryo_crate_base_y; // 箱子水面基准 Y

// ---- 相机 ----
#define CAM_TARGET_COUNT 4
static lv_obj_t  *s_view;         // 取景框
static lv_obj_t  *s_focus_ring;   // 对焦框 (UP/DOWN 移动)
static lv_obj_t  *s_targets[CAM_TARGET_COUNT]; // 目标区域框
static int        s_target_y[CAM_TARGET_COUNT]; // 目标区域 Y 中心
static bool       s_target_found[CAM_TARGET_COUNT]; // 已发现
static const char *s_target_names[CAM_TARGET_COUNT] = { "Hinox", "Stalnox", "Lizalfos", "Molduga" };
static lv_obj_t  *s_photo_n;      // "PHOTOS xN"
static int        s_photos;
static bool       s_shooting;     // 快门动画进行中 (防连按重复计数)

// ============================ 工具 ============================

// 创建模拟区内无滚动无边框的透明容器/对象
static lv_obj_t *plain_obj(lv_obj_t *parent)
{
    lv_obj_t *o = lv_obj_create(parent);
    lv_obj_remove_flag(o, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_bg_opa(o, LV_OPA_TRANSP, 0);
    lv_obj_set_style_border_width(o, 0, 0);
    lv_obj_set_style_pad_all(o, 0, 0);
    return o;
}

// 在 (cx,cy) 创建居中圆环 (可继续覆盖边框颜色/宽度)
static lv_obj_t *ring_obj(lv_obj_t *parent, int cx, int cy, int d, uint32_t color, int bw)
{
    lv_obj_t *o = plain_obj(parent);
    lv_obj_set_size(o, d, d);
    lv_obj_set_pos(o, cx - d / 2, cy - d / 2);
    lv_obj_set_style_radius(o, LV_RADIUS_CIRCLE, 0);
    lv_obj_set_style_border_color(o, lv_color_hex(color), 0);
    lv_obj_set_style_border_width(o, bw, 0);
    return o;
}

static void one_shot_anim(lv_obj_t *var, lv_anim_exec_xcb_t exec,
                          int32_t from, int32_t to, uint32_t ms,
                          lv_anim_ready_cb_t ready)
{
    lv_anim_t a;
    lv_anim_init(&a);
    lv_anim_set_var(&a, var);
    lv_anim_set_exec_cb(&a, exec);
    lv_anim_set_values(&a, from, to);
    lv_anim_set_duration(&a, ms);
    lv_anim_set_path_cb(&a, lv_anim_path_linear);
    if (ready) lv_anim_set_ready_cb(&a, ready);
    lv_anim_start(&a);
}

// ============================ 炸弹 ============================

static void boom_delete_cb(lv_anim_t *a) { lv_obj_delete((lv_obj_t *)a->var); }

static void boom_ring_exec(void *var, int32_t v)
{
    lv_obj_t *ring = (lv_obj_t *)var;
    int32_t d = 16 + (180 - 16) * v / 100;
    lv_obj_set_size(ring, d, d);
    lv_obj_set_pos(ring, s_boom_x - d / 2, s_boom_y - d / 2);
    lv_obj_set_style_border_opa(ring, LV_OPA_COVER - (int)LV_OPA_COVER * v / 100, 0);
}

static void flash_exec(void *var, int32_t v)   // v: 200 -> 0
{
    lv_obj_set_style_bg_opa((lv_obj_t *)var, (lv_opa_t)v, 0);
}

static void toast_exec(void *var, int32_t v)   // SAVED 文字淡出
{
    lv_obj_set_style_text_opa((lv_obj_t *)var, (lv_opa_t)v, 0);
}

static void shake_exec(void *var, int32_t v)
{
    double decay = 1.0 - v / 130.0;
    int dx = (int)(5.0 * sin(v * 0.25) * decay);   // ~4 个衰减周期
    lv_obj_set_x((lv_obj_t *)var, AREA_X + dx);
}

static void shake_done_cb(lv_anim_t *a)
{
    lv_obj_set_x((lv_obj_t *)a->var, AREA_X);
}

static void fuse_exec(void *var, int32_t v)    // 引信呼吸 80..220
{
    lv_obj_set_style_border_opa((lv_obj_t *)var, (lv_opa_t)v, 0);
}

static void bomb_move_target(void)
{
    if (s_target) lv_obj_set_y(s_target, s_bomb_target_y - 12);
    if (s_blast_ring) lv_obj_set_pos(s_blast_ring, AREA_CX - 45, s_bomb_target_y - 45);
}

static void bomb_show_target(void)
{
    if (s_target) lv_obj_delete(s_target);
    if (s_blast_ring) lv_obj_delete(s_blast_ring);
    // 爆炸范围 (大圆, 半透明)
    s_blast_ring = ring_obj(s_area, AREA_CX, s_bomb_target_y, 90, SK_YELLOW, 1);
    lv_obj_set_style_bg_opa(s_blast_ring, LV_OPA_10, 0);
    // 瞄准十字 (小圆 + 十字线)
    s_target = ring_obj(s_area, AREA_CX, s_bomb_target_y, 24, SK_RUNE_CYAN, 2);
    lv_obj_t *ch = plain_obj(s_target);
    lv_obj_set_size(ch, 16, 2);
    lv_obj_set_pos(ch, 5, 11);
    lv_obj_set_style_bg_color(ch, lv_color_hex(SK_RUNE_CYAN), 0);
    lv_obj_set_style_bg_opa(ch, LV_OPA_80, 0);
    lv_obj_t *cv = plain_obj(s_target);
    lv_obj_set_size(cv, 2, 16);
    lv_obj_set_pos(cv, 11, 5);
    lv_obj_set_style_bg_color(cv, lv_color_hex(SK_RUNE_CYAN), 0);
    lv_obj_set_style_bg_opa(cv, LV_OPA_80, 0);
}

static void key_bomb(bsp_btn_t btn)
{
    if (s_bomb_state == BOMB_ARMED) {
        // 已放置: OK 引爆, UP/DOWN 忽略
        if (btn != BSP_BTN_OK) return;
        int cx = lv_obj_get_x(s_bomb) + 15;
        int cy = lv_obj_get_y(s_bomb) + 15;
        lv_anim_delete(s_bomb, NULL);
        lv_obj_delete(s_bomb); s_bomb = NULL;

        // 冲击环
        lv_obj_t *ring = ring_obj(s_area, cx, cy, 16, SK_YELLOW, 3);
        s_boom_x = cx; s_boom_y = cy;
        one_shot_anim(ring, boom_ring_exec, 0, 100, 380, boom_delete_cb);
        // 爆炸范围圆 (淡出)
        lv_obj_t *blast = ring_obj(s_area, cx, cy, 20, SK_YELLOW, 2);
        lv_obj_set_style_bg_opa(blast, LV_OPA_10, 0);
        one_shot_anim(blast, boom_ring_exec, 0, 100, 400, boom_delete_cb);
        // 白闪
        lv_obj_t *flash = plain_obj(s_area);
        lv_obj_set_size(flash, AREA_W, AREA_H);
        lv_obj_set_style_bg_color(flash, lv_color_hex(SK_WHITE), 0);
        lv_obj_set_style_bg_opa(flash, (lv_opa_t)200, 0);
        one_shot_anim(flash, flash_exec, 200, 0, 300, boom_delete_cb);
        // 震动
        one_shot_anim(s_area, shake_exec, 0, 100, 340, shake_done_cb);
        sfx_play(SFX_BOMB_BOOM);
        s_bomb_state = BOMB_IDLE;
        bomb_show_target();   // 重新显示瞄准器
        ESP_LOGI(TAG, "boom!");
        return;
    }

    // BOMB_IDLE: UP/DOWN 调整投掷距离, OK 投掷
    switch (btn) {
    case BSP_BTN_UP:
        s_bomb_target_y -= 16;
        if (s_bomb_target_y < 30) s_bomb_target_y = 30;
        bomb_move_target();
        break;
    case BSP_BTN_DOWN:
        s_bomb_target_y += 16;
        if (s_bomb_target_y > AREA_H - 50) s_bomb_target_y = AREA_H - 50;
        bomb_move_target();
        break;
    case BSP_BTN_OK:
        // 投掷: 删瞄准器, 在目标位置创建炸弹
        if (s_target) { lv_obj_delete(s_target); s_target = NULL; }
        if (s_blast_ring) { lv_obj_delete(s_blast_ring); s_blast_ring = NULL; }
        s_bomb = plain_obj(s_area);
        lv_obj_set_size(s_bomb, 30, 30);
        lv_obj_set_pos(s_bomb, AREA_CX - 15, s_bomb_target_y - 15);
        lv_obj_set_style_radius(s_bomb, LV_RADIUS_CIRCLE, 0);
        lv_obj_set_style_bg_color(s_bomb, lv_color_hex(0x14263C), 0);
        lv_obj_set_style_bg_opa(s_bomb, LV_OPA_COVER, 0);
        lv_obj_set_style_border_color(s_bomb, lv_color_hex(SK_RUNE_CYAN), 0);
        lv_obj_set_style_border_width(s_bomb, 3, 0);
        // 高光点
        lv_obj_t *glint = plain_obj(s_bomb);
        lv_obj_set_size(glint, 6, 6);
        lv_obj_set_pos(glint, 7, 6);
        lv_obj_set_style_radius(glint, LV_RADIUS_CIRCLE, 0);
        lv_obj_set_style_bg_color(glint, lv_color_hex(0x3A5A80), 0);
        lv_obj_set_style_bg_opa(glint, LV_OPA_COVER, 0);
        // 引信闪烁
        lv_anim_t a;
        lv_anim_init(&a);
        lv_anim_set_var(&a, s_bomb);
        lv_anim_set_exec_cb(&a, fuse_exec);
        lv_anim_set_values(&a, LV_OPA_80, LV_OPA_COVER);
        lv_anim_set_duration(&a, 400);
        lv_anim_set_path_cb(&a, lv_anim_path_ease_in_out);
        lv_anim_set_repeat_count(&a, LV_ANIM_REPEAT_INFINITE);
        lv_anim_start(&a);
        s_bomb_state = BOMB_ARMED;
        sfx_play(SFX_BOMB_PLACE);
        ESP_LOGI(TAG, "bomb thrown to y=%d", s_bomb_target_y);
        break;
    default: break;
    }
}

// ============================ 磁力 ============================

static const char *MAG_NAMES[MAG_OBJ_COUNT] = { "CRATE", "BARREL", "ORB" };
static const int MAG_GRAB_RANGE = 32;  // 吸附距离阈值

static void mag_update(void)
{
    int cx = lv_obj_get_x(s_cross) + 14;   // 准星中心
    int cy = lv_obj_get_y(s_cross) + 14;
    if (s_grab_idx >= 0) {
        // 抓取的物体跟随准星 (抬高 20px)
        lv_obj_set_pos(s_objs[s_grab_idx], cx - 20, cy - 35);
    }
}

// 找离准星最近的金属物体, 返回下标 (-1 = 无在范围内)
static int mag_nearest(int cross_cy)
{
    int best = -1, best_d = MAG_GRAB_RANGE + 1;
    for (int i = 0; i < MAG_OBJ_COUNT; i++) {
        int oy = lv_obj_get_y(s_objs[i]) + 15;
        int d = abs(cross_cy - oy);
        if (d < best_d) { best_d = d; best = i; }
    }
    return (best_d <= MAG_GRAB_RANGE) ? best : -1;
}

static void mag_status_text(const char *text, uint32_t color)
{
    lv_label_set_text(s_mag_status, text);
    lv_obj_set_style_text_color(s_mag_status, lv_color_hex(color), 0);
}

static void key_magnet(bsp_btn_t btn)
{
    switch (btn) {
    case BSP_BTN_UP:
    case BSP_BTN_DOWN: {
        int y = lv_obj_get_y(s_cross) + (btn == BSP_BTN_UP ? -10 : 10);
        if (y < 4) y = 4;
        if (y > AREA_H - 32) y = AREA_H - 32;
        lv_obj_set_y(s_cross, y);
        mag_update();
        if (s_grab_idx < 0) {
            int near = mag_nearest(y + 14);
            if (near >= 0)
                mag_status_text("IN RANGE - OK TO GRAB", SK_BLUE);
            else
                mag_status_text("RELEASED", SK_TEXT_MUTED);
        }
        break;
    }
    case BSP_BTN_OK:
        if (s_grab_idx < 0) {
            // 未抓取: 尝试吸附
            int near = mag_nearest(lv_obj_get_y(s_cross) + 14);
            if (near >= 0) {
                s_grab_idx = near;
                mag_update();
                // 阴影留在地面, 物体抬高
                lv_obj_set_style_bg_opa(s_shadows[near], LV_OPA_30, 0); // 阴影变淡
                char buf[32];
                snprintf(buf, sizeof(buf), "GRABBED %s", MAG_NAMES[near]);
                mag_status_text(buf, SK_RUNE_CYAN);
            } else {
                mag_status_text("NOT METAL HERE", SK_TEXT_RED);
            }
        } else {
            // 释放: 物体落回地面
            int idx = s_grab_idx;
            lv_obj_set_pos(s_objs[idx], lv_obj_get_x(s_objs[idx]), s_obj_ground_y[idx]);
            lv_obj_set_style_bg_opa(s_shadows[idx], LV_OPA_60, 0); // 阴影恢复
            s_grab_idx = -1;
            mag_status_text("RELEASED", SK_TEXT_MUTED);
        }
        break;
    default: break;
    }
}

// ============================ 时停 ============================

static void move_timer_cb(lv_timer_t *t)
{
    (void)t;
    int x = lv_obj_get_x(s_stone) + s_dir * s_stone_speed;
    if (x < 4)              { x = 4;              s_dir = 1;  }
    if (x > AREA_W - 36)    { x = AREA_W - 36;    s_dir = -1; }
    lv_obj_set_x(s_stone, x);
}

static void boost_timer_cb(lv_timer_t *t)
{
    (void)t;
    s_stone_speed = 3;  // 恢复正常速度
    lv_timer_pause(s_boost_timer);
}

static void count_timer_cb(lv_timer_t *t)
{
    (void)t;
    s_countdown--;
    if (s_countdown > 0) {
        char buf[16];                            // GCC 无法证明范围, 按最坏 int 宽度给
        snprintf(buf, sizeof(buf), "%d", s_countdown);
        lv_label_set_text(s_count, buf);
        return;
    }
    // 解冻: 关倒计时 -> 撤冰封 -> 反弹加速
    lv_timer_pause(s_count_timer);
    lv_obj_delete(s_frost);   s_frost = NULL;
    lv_obj_delete(s_count);   s_count = NULL;
    // 反弹: 反向 + 加速 2 秒
    s_dir = -s_dir;
    s_stone_speed = 6;
    lv_timer_set_period(s_boost_timer, 2000);
    lv_timer_resume(s_boost_timer);
    lv_timer_resume(s_move_timer);
    lv_obj_set_style_border_color(s_stone, lv_color_hex(SK_TAN), 0);
    sfx_play(SFX_STASIS_UNFREEZE);
}

static void key_stasis(void)
{
    if (s_frost) return;                               // 已冰封
    s_countdown = 5;
    lv_timer_pause(s_move_timer);
    // 橙色冰封遮罩 (时停标志色) + 大字倒计时
    s_frost = plain_obj(s_area);
    lv_obj_set_size(s_frost, 44, 44);
    lv_obj_set_pos(s_frost, lv_obj_get_x(s_stone) - 6, lv_obj_get_y(s_stone) - 6);
    lv_obj_set_style_radius(s_frost, 6, 0);
    lv_obj_set_style_bg_color(s_frost, lv_color_hex(0xF97F26), 0);
    lv_obj_set_style_bg_opa(s_frost, LV_OPA_40, 0);
    lv_obj_set_style_border_color(s_frost, lv_color_hex(0xF97F26), 0);
    lv_obj_set_style_border_width(s_frost, 2, 0);

    s_count = lv_label_create(s_area);
    lv_obj_set_style_text_font(s_count, &SK_FONT_TITLE, 0);
    lv_obj_set_style_text_color(s_count, lv_color_hex(SK_YELLOW), 0);
    lv_obj_set_width(s_count, lv_pct(100));
    lv_obj_set_style_text_align(s_count, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_set_y(s_count, lv_obj_get_y(s_stone) - 56);
    lv_label_set_text(s_count, "5");

    lv_timer_resume(s_count_timer);
    sfx_play(SFX_STASIS_FREEZE);
    ESP_LOGI(TAG, "stasis freeze");
}

// ============================ 制冰 ============================

#define PILLAR_MAX_H 150

// 冰柱生长/融化动画: v 直接作为高度, 底边锚在水面上
static void pillar_exec(void *var, int32_t h)
{
    lv_obj_t *p = (lv_obj_t *)var;
    if (h < 8) h = 8;
    int x = (int)(intptr_t)lv_obj_get_user_data(p);
    lv_obj_set_size(p, 34, h);
    lv_obj_set_pos(p, x, (AREA_H - 64) - h);
}

static void pillar_style(lv_obj_t *p)
{
    lv_obj_set_style_radius(p, 3, 0);
    lv_obj_set_style_bg_color(p, lv_color_hex(0xCDEFFB), 0);
    lv_obj_set_style_bg_opa(p, LV_OPA_COVER, 0);
    lv_obj_set_style_border_color(p, lv_color_hex(0x7FD4EE), 0);
    lv_obj_set_style_border_width(p, 2, 0);
}

static void key_cryonis(void)
{
    const int xs[3] = { 28, AREA_CX - 17, AREA_W - 62 };
    const int pillar_w = 34;
    int slot = s_pillar_next;

    if (s_pillars[slot]) {
        // 融化最早一根: 先停其生长动画再收高度, 收到 8 后删除
        lv_obj_t *old = s_pillars[slot];
        s_pillars[slot] = NULL;
        lv_anim_delete(old, NULL);
        one_shot_anim(old, pillar_exec, s_pillar_h[slot], 8, 300, boom_delete_cb);
        // 如果箱子在这根柱子上, 落回水面
        int crate_x = lv_obj_get_x(s_cryo_crate);
        if (crate_x + 30 > xs[slot] && crate_x < xs[slot] + pillar_w) {
            lv_obj_set_y(s_cryo_crate, s_cryo_crate_base_y);
        }
    }
    // 新柱: 底边锚在水面, 高度 8 -> 150
    lv_obj_t *p = plain_obj(s_area);
    pillar_style(p);
    lv_obj_set_user_data(p, (void *)(intptr_t)xs[slot]);
    pillar_exec(p, 8);
    lv_obj_t *hi = plain_obj(p);                       // 冰面高光竖条
    lv_obj_set_size(hi, 4, 10);
    lv_obj_set_pos(hi, 5, 3);
    lv_obj_set_style_bg_color(hi, lv_color_hex(SK_WHITE), 0);
    lv_obj_set_style_bg_opa(hi, LV_OPA_70, 0);
    one_shot_anim(p, pillar_exec, 8, PILLAR_MAX_H, 420, NULL);
    s_pillars[slot] = p;
    s_pillar_h[slot] = PILLAR_MAX_H;
    s_pillar_next = (slot + 1) % 3;

    // 如果箱子在新柱子范围内, 推上去
    int crate_x = lv_obj_get_x(s_cryo_crate);
    if (crate_x + 30 > xs[slot] && crate_x < xs[slot] + pillar_w) {
        lv_obj_set_y(s_cryo_crate, s_cryo_crate_base_y - PILLAR_MAX_H);
    }
}

// ============================ 相机 ============================

static void photos_update(void)
{
    char buf[24];   // "PHOTOS x" + int 最坏 10 位, 16 不够 (-Werror=format-truncation)
    snprintf(buf, sizeof(buf), "PHOTOS x%d", s_photos);
    lv_label_set_text(s_photo_n, buf);
}

static int s_discovered_idx = -1; // 本次拍照发现的目标下标 (-1 = 无)

static void flash_del_cb(lv_anim_t *a)
{
    lv_obj_delete((lv_obj_t *)a->var);
    s_shooting = false;
    // 快门后: 计数 + 底片条 + 发现提示
    s_photos++;
    photos_update();

    // 底片条: 取景框底部缩略图 (最多 8 张)
    int idx = s_photos - 1;
    if (idx < 8) {
        lv_obj_t *th = plain_obj(s_view);
        lv_obj_set_size(th, 22, 16);
        lv_obj_set_pos(th, 8 + idx * 25, lv_obj_get_height(s_view) - 22);
        lv_obj_set_style_bg_color(th, lv_color_hex(SK_BLUE_DARK), 0);
        lv_obj_set_style_bg_opa(th, LV_OPA_COVER, 0);
        lv_obj_set_style_border_color(th, lv_color_hex(SK_WHITE), 0);
        lv_obj_set_style_border_width(th, 1, 0);
    }
    // 发现提示: "Discovered XX!" 或 "SAVED!"
    lv_obj_t *toast = lv_label_create(s_view);
    lv_obj_set_style_text_font(toast, &SK_FONT_LARGE, 0);
    lv_obj_set_style_text_color(toast, lv_color_hex(SK_YELLOW), 0);
    lv_obj_set_width(toast, lv_pct(100));
    lv_obj_set_style_text_align(toast, LV_TEXT_ALIGN_CENTER, 0);
    lv_obj_align(toast, LV_ALIGN_CENTER, 0, 0);
    if (s_discovered_idx >= 0) {
        char buf[32];
        snprintf(buf, sizeof(buf), "DISCOVERED %s!", s_target_names[s_discovered_idx]);
        lv_label_set_text(toast, buf);
        s_discovered_idx = -1;
    } else {
        lv_label_set_text(toast, "SAVED!");
    }
    one_shot_anim(toast, toast_exec, LV_OPA_COVER, 0, 900, boom_delete_cb);
}

// 检查对焦框是否与某个目标区域重叠
static int camera_check_target(void)
{
    int fy = lv_obj_get_y(s_focus_ring) + 22; // 对焦框中心 Y
    for (int i = 0; i < CAM_TARGET_COUNT; i++) {
        if (s_target_found[i]) continue; // 已发现跳过
        if (abs(fy - s_target_y[i]) < 28) return i; // 重叠
    }
    return -1;
}

static void key_camera(bsp_btn_t btn)
{
    if (s_shooting) return;

    switch (btn) {
    case BSP_BTN_UP:
    case BSP_BTN_DOWN: {
        int y = lv_obj_get_y(s_focus_ring) + (btn == BSP_BTN_UP ? -14 : 14);
        int vh = lv_obj_get_height(s_view);
        if (y < 10) y = 10;
        if (y > vh - 54) y = vh - 54;
        lv_obj_set_y(s_focus_ring, y);
        // 检查是否对准目标, 改变对焦框颜色
        int hit = camera_check_target();
        lv_obj_set_style_border_color(s_focus_ring,
            lv_color_hex(hit >= 0 ? SK_YELLOW : SK_BLUE), 0);
        break;
    }
    case BSP_BTN_OK:
        s_shooting = true;
        s_discovered_idx = camera_check_target();
        if (s_discovered_idx >= 0) {
            s_target_found[s_discovered_idx] = true;
            // 标记目标为已发现 (边框变绿)
            lv_obj_set_style_border_color(s_targets[s_discovered_idx],
                lv_color_hex(0x4CAF50), 0);
        }
        // 白闪 (快门)
        lv_obj_t *flash = plain_obj(s_view);
        lv_obj_set_size(flash, lv_obj_get_width(s_view), lv_obj_get_height(s_view));
        lv_obj_set_style_bg_color(flash, lv_color_hex(SK_WHITE), 0);
        lv_obj_set_style_bg_opa(flash, LV_OPA_COVER, 0);
        one_shot_anim(flash, flash_exec, LV_OPA_COVER, 0, 180, flash_del_cb);
        sfx_play(SFX_SHUTTER);
        ESP_LOGI(TAG, "shutter");
        break;
    default: break;
    }
}

// ============================ 页面生命周期 ============================

void page_rune_app_set_rune(int rune_index)
{
    if (rune_index < 0 || rune_index > RUNE_CAMERA) rune_index = RUNE_BOMB;
    s_rune = rune_index;
}

void page_rune_app_enter(void)
{
    ESP_LOGI(TAG, "enter rune app: %s", RUNE_TITLES[s_rune]);
    s_scr = sk_screen_create();
    sk_corner_frame(s_scr, SK_SCREEN_W, SK_SCREEN_H);
    sk_header_create(s_scr, RUNE_TITLES[s_rune]);
    sk_footer_create(s_scr, RUNE_HINTS[s_rune]);

    s_area = plain_obj(s_scr);
    lv_obj_set_size(s_area, AREA_W, AREA_H);
    lv_obj_set_pos(s_area, AREA_X, AREA_Y);

    switch (s_rune) {
    case RUNE_BOMB:
        s_bomb = NULL;
        s_target = NULL;
        s_blast_ring = NULL;
        s_bomb_target_y = AREA_CY;
        s_bomb_state = BOMB_IDLE;
        bomb_show_target();
        break;

    case RUNE_MAGNET: {
        // 3 个金属物体: 箱子(左)/圆桶(中)/铁球(右), 沿底部排列
        const int obj_w[MAG_OBJ_COUNT] = { 40, 28, 24 };
        const int obj_h[MAG_OBJ_COUNT] = { 30, 34, 24 };
        const int obj_x[MAG_OBJ_COUNT] = { 20, AREA_CX - 14, AREA_W - 56 };
        const uint32_t obj_color[MAG_OBJ_COUNT] = { 0x7E8B9C, 0x6B7A8C, 0x9EAAB8 };
        const int ground_y = AREA_H - 46;
        for (int i = 0; i < MAG_OBJ_COUNT; i++) {
            // 阴影 (地面椭圆)
            s_shadows[i] = plain_obj(s_area);
            lv_obj_set_size(s_shadows[i], obj_w[i] + 8, 8);
            lv_obj_set_pos(s_shadows[i], obj_x[i] - 4, ground_y + obj_h[i] - 2);
            lv_obj_set_style_radius(s_shadows[i], LV_RADIUS_CIRCLE, 0);
            lv_obj_set_style_bg_color(s_shadows[i], lv_color_hex(0x000000), 0);
            lv_obj_set_style_bg_opa(s_shadows[i], LV_OPA_60, 0);
            // 物体
            s_objs[i] = plain_obj(s_area);
            lv_obj_set_size(s_objs[i], obj_w[i], obj_h[i]);
            lv_obj_set_pos(s_objs[i], obj_x[i], ground_y);
            lv_obj_set_style_radius(s_objs[i], (i == 2) ? LV_RADIUS_CIRCLE : 3, 0);
            lv_obj_set_style_bg_color(s_objs[i], lv_color_hex(obj_color[i]), 0);
            lv_obj_set_style_bg_opa(s_objs[i], LV_OPA_COVER, 0);
            lv_obj_set_style_border_color(s_objs[i], lv_color_hex(SK_TAN), 0);
            lv_obj_set_style_border_width(s_objs[i], 2, 0);
            s_obj_ground_y[i] = ground_y;
        }
        // 准星 (初始在中上)
        s_cross = ring_obj(s_area, AREA_CX, 40, 28, SK_BLUE, 2);
        lv_obj_t *cl = plain_obj(s_cross);
        lv_obj_set_size(cl, 12, 2);
        lv_obj_set_pos(cl, 8, 13);
        lv_obj_set_style_bg_color(cl, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_bg_opa(cl, LV_OPA_COVER, 0);
        lv_obj_t *cv = plain_obj(s_cross);
        lv_obj_set_size(cv, 2, 12);
        lv_obj_set_pos(cv, 13, 8);
        lv_obj_set_style_bg_color(cv, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_bg_opa(cv, LV_OPA_COVER, 0);
        s_mag_status = lv_label_create(s_area);
        lv_obj_set_style_text_font(s_mag_status, &SK_FONT_CAPS, 0);
        lv_obj_set_style_text_color(s_mag_status, lv_color_hex(SK_TEXT_MUTED), 0);
        lv_obj_set_width(s_mag_status, lv_pct(100));
        lv_obj_set_style_text_align(s_mag_status, LV_TEXT_ALIGN_CENTER, 0);
        lv_obj_set_y(s_mag_status, AREA_H - 22);
        lv_label_set_text(s_mag_status, "RELEASED");
        s_grab_idx = -1;
        break;
    }

    case RUNE_STASIS:
        s_stone = plain_obj(s_area);
        lv_obj_set_size(s_stone, 32, 32);
        lv_obj_set_pos(s_stone, 20, AREA_CY - 16);
        lv_obj_set_style_radius(s_stone, 5, 0);
        lv_obj_set_style_bg_color(s_stone, lv_color_hex(0x2A3A50), 0);
        lv_obj_set_style_bg_opa(s_stone, LV_OPA_COVER, 0);
        lv_obj_set_style_border_color(s_stone, lv_color_hex(SK_TAN), 0);
        lv_obj_set_style_border_width(s_stone, 2, 0);
        s_dir = 1;
        s_stone_speed = 3;
        s_frost = NULL;
        s_count = NULL;
        s_move_timer = lv_timer_create(move_timer_cb, 33, NULL);     // 持续移动
        s_count_timer = lv_timer_create(count_timer_cb, 1000, NULL); // 倒计时
        s_boost_timer = lv_timer_create(boost_timer_cb, 2000, NULL); // 加速计时
        lv_timer_pause(s_count_timer);
        lv_timer_pause(s_boost_timer);
        break;

    case RUNE_CRYONIS: {
        // 水面 (底部 64px)
        lv_obj_t *water = plain_obj(s_area);
        lv_obj_set_size(water, AREA_W, 64);
        lv_obj_set_pos(water, 0, AREA_H - 64);
        lv_obj_set_style_bg_color(water, lv_color_hex(SK_BLUE_DARK), 0);
        lv_obj_set_style_bg_opa(water, LV_OPA_50, 0);
        lv_obj_set_style_border_color(water, lv_color_hex(SK_RUNE_CYAN), 0);
        lv_obj_set_style_border_width(water, 2, 0);
        lv_obj_set_style_border_side(water, LV_BORDER_SIDE_TOP, 0);
        // 水面漂浮箱子 (初始在中间柱子位置)
        s_cryo_crate = plain_obj(s_area);
        lv_obj_set_size(s_cryo_crate, 30, 24);
        s_cryo_crate_base_y = AREA_H - 64 - 24;  // 水面上一半
        lv_obj_set_pos(s_cryo_crate, AREA_CX - 15, s_cryo_crate_base_y);
        lv_obj_set_style_radius(s_cryo_crate, 3, 0);
        lv_obj_set_style_bg_color(s_cryo_crate, lv_color_hex(0x8B6F47), 0);
        lv_obj_set_style_bg_opa(s_cryo_crate, LV_OPA_COVER, 0);
        lv_obj_set_style_border_color(s_cryo_crate, lv_color_hex(SK_TAN), 0);
        lv_obj_set_style_border_width(s_cryo_crate, 2, 0);
        memset(s_pillars, 0, sizeof(s_pillars));
        s_pillar_next = 0;
        break;
    }

    case RUNE_CAMERA: {
        s_view = plain_obj(s_area);
        int vw = AREA_W - 24, vh = AREA_H - 24;
        lv_obj_set_size(s_view, vw, vh);
        lv_obj_set_pos(s_view, 12, 12);
        sk_corner_frame(s_view, vw, vh);               // 取景框四角
        // 4 个目标区域 (虚线框效果: 半透明边框)
        s_target_y[0] = 40;  s_target_y[1] = 90;
        s_target_y[2] = 140; s_target_y[3] = 190;
        for (int i = 0; i < CAM_TARGET_COUNT; i++) {
            s_targets[i] = ring_obj(s_view, vw / 2, s_target_y[i], 40, SK_BLUE, 1);
            lv_obj_set_style_border_opa(s_targets[i], LV_OPA_40, 0);
            s_target_found[i] = false;
        }
        // 对焦框 (可移动, 初始在中间)
        s_focus_ring = ring_obj(s_view, vw / 2, vh / 2, 44, SK_BLUE, 2);
        lv_obj_t *rl = plain_obj(s_focus_ring);        // 对焦横线
        lv_obj_set_size(rl, 20, 2);
        lv_obj_set_pos(rl, 11, 21);
        lv_obj_set_style_bg_color(rl, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_bg_opa(rl, LV_OPA_60, 0);
        lv_obj_t *rv = plain_obj(s_focus_ring);        // 对焦竖线
        lv_obj_set_size(rv, 2, 20);
        lv_obj_set_pos(rv, 21, 11);
        lv_obj_set_style_bg_color(rv, lv_color_hex(SK_BLUE), 0);
        lv_obj_set_style_bg_opa(rv, LV_OPA_60, 0);
        s_photo_n = lv_label_create(s_view);
        lv_obj_set_style_text_font(s_photo_n, &SK_FONT_CAPS, 0);
        lv_obj_set_style_text_color(s_photo_n, lv_color_hex(SK_YELLOW), 0);
        lv_obj_set_pos(s_photo_n, 8, 6);
        s_photos = 0;
        s_discovered_idx = -1;
        photos_update();
        break;
    }
    }
    lv_screen_load(s_scr);
}

void page_rune_app_exit(void)
{
    // 定时器先删 (回调会访问页面对象), 再停全部页面动画, 最后删屏
    if (s_move_timer)  { lv_timer_delete(s_move_timer);  s_move_timer = NULL; }
    if (s_count_timer) { lv_timer_delete(s_count_timer); s_count_timer = NULL; }
    if (s_boost_timer) { lv_timer_delete(s_boost_timer); s_boost_timer = NULL; }
    lv_anim_delete_all();
    if (s_scr) lv_obj_delete(s_scr);
    s_scr = NULL;
    s_area = NULL;
    s_bomb = s_target = s_blast_ring = NULL;
    s_cross = s_mag_status = NULL;
    memset(s_objs, 0, sizeof(s_objs));
    memset(s_shadows, 0, sizeof(s_shadows));
    s_grab_idx = -1;
    s_shooting = false;
    s_stone = s_frost = s_count = NULL;
    memset(s_pillars, 0, sizeof(s_pillars));
    s_cryo_crate = NULL;
    s_view = s_photo_n = s_focus_ring = NULL;
    memset(s_targets, 0, sizeof(s_targets));
    ESP_LOGI(TAG, "exit rune app");
}

void page_rune_app_key(bsp_btn_t btn, bsp_btn_ev_t ev)
{
    if (ev != BSP_BTN_CLICK || s_rune < 0) return;

    switch (s_rune) {
    case RUNE_BOMB:    key_bomb(btn);                        break;
    case RUNE_MAGNET:  key_magnet(btn);                      break;
    case RUNE_STASIS:  if (btn == BSP_BTN_OK) key_stasis();  break;
    case RUNE_CRYONIS: if (btn == BSP_BTN_OK) key_cryonis(); break;
    case RUNE_CAMERA:  key_camera(btn);                    break;
    default: break;
    }
}
