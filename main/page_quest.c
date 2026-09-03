// main/page_quest.c -- 冒险记录
//
// 任务列表 (主线/支线/回忆), UP/DOWN 滚动, OK 查看详情。

#include "page_quest.h"
#include "sheikah_theme.h"
#include "sheikah_ui.h"
#include "esp_log.h"
#include <string.h>
#include <stdlib.h>

static const char *TAG = "quest";

// 嵌入的 JSON 数据
extern const char quest_data_json_start[] asm("_binary_quest_data_json_start");
extern const char quest_data_json_end[]   asm("_binary_quest_data_json_end");

#define MAX_QUESTS 20
typedef struct {
    char title[48];
    char type[16];    // "Main" / "Side" / "Memory"
    char desc[128];
} quest_entry_t;

static quest_entry_t s_quests[MAX_QUESTS];
static int s_quest_count = 0;

// 简易 JSON 解析: 从 base 位置开始搜索
static bool json_extract(const char *base, const char *key, char *out, int out_sz)
{
    char pattern[40];
    snprintf(pattern, sizeof(pattern), "\"%s\":\"", key);
    const char *p = strstr(base, pattern);
    if (!p) return false;
    p += strlen(pattern);
    const char *end = strchr(p, '"');
    if (!end) return false;
    int len = (int)(end - p);
    if (len >= out_sz) len = out_sz - 1;
    memcpy(out, p, len);
    out[len] = '\0';
    return true;
}

static void parse_quests(void)
{
    s_quest_count = 0;
    const char *p = quest_data_json_start;

    while (s_quest_count < MAX_QUESTS) {
        const char *obj_start = strchr(p, '{');
        if (!obj_start) break;

        quest_entry_t *q = &s_quests[s_quest_count];
        memset(q, 0, sizeof(*q));

        json_extract(obj_start, "title", q->title, sizeof(q->title));
        json_extract(obj_start, "type", q->type, sizeof(q->type));
        json_extract(obj_start, "desc", q->desc, sizeof(q->desc));

        if (q->title[0]) s_quest_count++;

        p = strchr(obj_start, '}');
        if (!p) break;
        p++;
    }
    ESP_LOGI(TAG, "Loaded %d quests", s_quest_count);
}

// ---- UI ----
static lv_obj_t *s_scr;
static lv_obj_t *s_list;
static int       s_sel = 0;

static void update_sel(void);  // 前向声明

static uint32_t type_color(const char *type)
{
    if (strcmp(type, "Main") == 0) return SK_YELLOW;
    if (strcmp(type, "Side") == 0) return SK_BLUE;
    if (strcmp(type, "Memory") == 0) return SK_EFFECT_GOLD;
    return SK_TEXT;
}

static void build_list(void)
{
    parse_quests();
    s_sel = 0;

    s_list = sk_list_create(s_scr, 8, SK_HEADER_H + 4,
                            SK_SCREEN_W - 16,
                            SK_SCREEN_H - SK_HEADER_H - SK_FOOTER_H - 12);

    for (int i = 0; i < s_quest_count; i++) {
        lv_obj_t *btn = sk_list_add_item(s_list, s_quests[i].title, NULL);

        // 类型标签色块
        lv_obj_t *tag = lv_obj_create(btn);
        lv_obj_remove_flag(tag, LV_OBJ_FLAG_SCROLLABLE);
        lv_obj_set_size(tag, 6, 6);
        lv_obj_set_style_radius(tag, 3, 0);
        lv_obj_set_style_bg_color(tag, lv_color_hex(type_color(s_quests[i].type)), 0);
        lv_obj_set_style_border_width(tag, 0, 0);
        lv_obj_set_style_pad_all(tag, 0, 0);

        // 描述副标题
        lv_obj_t *sub = lv_label_create(btn);
        lv_label_set_text_fmt(sub, "[%s] %s", s_quests[i].type, s_quests[i].desc);
        lv_obj_set_style_text_font(sub, &SK_FONT_SMALL, 0);
        lv_obj_set_style_text_color(sub, lv_color_hex(SK_TEXT_MUTED), 0);
        lv_obj_set_width(sub, lv_pct(100));
        lv_label_set_long_mode(sub, LV_LABEL_LONG_DOT);
    }

    // 高亮第一项
    update_sel();
}

static void update_sel(void)
{
    int n = lv_obj_get_child_count(s_list);
    for (int i = 0; i < n; i++) {
        lv_obj_t *c = lv_obj_get_child(s_list, i);
        if (i == s_sel) {
            lv_obj_set_style_bg_color(c, lv_color_hex(SK_BLUE), 0);
            lv_obj_set_style_bg_opa(c, LV_OPA_20, 0);
            lv_obj_scroll_to_view(c, LV_ANIM_ON);
        } else {
            lv_obj_set_style_bg_opa(c, LV_OPA_TRANSP, 0);
        }
    }
}

void page_quest_enter(void)
{
    ESP_LOGI(TAG, "enter quest");
    s_scr = sk_screen_create();

    sk_header_create(s_scr, "Adventure Log");
    build_list();

    sk_footer_create(s_scr, LV_SYMBOL_UP "/" LV_SYMBOL_DOWN ":Browse  "
                                LV_SYMBOL_OK ":Details");

    lv_screen_load(s_scr);
}

void page_quest_exit(void)
{
    s_scr = NULL;
    s_list = NULL;
    s_sel = 0;
}

void page_quest_key(bsp_btn_t btn, bsp_btn_ev_t ev)
{
    if (ev != BSP_BTN_CLICK) return;

    if (sk_popup_is_open()) {
        sk_popup_close();
        return;
    }

    switch (btn) {
    case BSP_BTN_UP:
        if (s_sel > 0) { s_sel--; update_sel(); }
        break;
    case BSP_BTN_DOWN:
        if (s_sel < s_quest_count - 1) { s_sel++; update_sel(); }
        break;
    case BSP_BTN_OK:
        if (s_sel < s_quest_count) {
            quest_entry_t *q = &s_quests[s_sel];
            sk_popup_show(s_scr, q->title, q->desc);
        }
        break;
    }
}
