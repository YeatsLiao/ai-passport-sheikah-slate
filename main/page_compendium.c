// main/page_compendium.c -- 海拉鲁图鉴
//
// 5 个分类标签 (生物/怪物/材料/装备/宝物), UP/DOWN 切换标签和列表,
// OK 进入详情弹窗。数据从嵌入的 JSON 文件解析。

#include "page_compendium.h"
#include "sheikah_theme.h"
#include "sheikah_ui.h"
#include "esp_log.h"
#include <string.h>
#include <stdlib.h>

static const char *TAG = "compendium";

// 嵌入的 JSON 数据 (由 CMakeLists.txt EMBED_TXTFILES 烧入 Flash)
extern const char compendium_creatures_json_start[]  asm("_binary_compendium_creatures_json_start");
extern const char compendium_creatures_json_end[]    asm("_binary_compendium_creatures_json_end");
extern const char compendium_monsters_json_start[]   asm("_binary_compendium_monsters_json_start");
extern const char compendium_monsters_json_end[]     asm("_binary_compendium_monsters_json_end");
extern const char compendium_materials_json_start[]  asm("_binary_compendium_materials_json_start");
extern const char compendium_materials_json_end[]    asm("_binary_compendium_materials_json_end");
extern const char compendium_equipment_json_start[]  asm("_binary_compendium_equipment_json_start");
extern const char compendium_equipment_json_end[]    asm("_binary_compendium_equipment_json_end");
extern const char compendium_treasures_json_start[]  asm("_binary_compendium_treasures_json_start");
extern const char compendium_treasures_json_end[]    asm("_binary_compendium_treasures_json_end");

// ---- 分类 ----
#define CAT_COUNT 5
static const char *CAT_NAMES[CAT_COUNT] = {
    "Creatures", "Monsters", "Materials", "Equipment", "Treasures"
};

typedef struct {
    const char *start;
    const char *end;
} cat_data_t;

static const cat_data_t CAT_DATA[CAT_COUNT] = {
    { compendium_creatures_json_start, compendium_creatures_json_end },
    { compendium_monsters_json_start,  compendium_monsters_json_end  },
    { compendium_materials_json_start, compendium_materials_json_end },
    { compendium_equipment_json_start, compendium_equipment_json_end },
    { compendium_treasures_json_start, compendium_treasures_json_end },
};

// ---- 简易 JSON 解析 ----
// 格式: [{"name":"...","desc":"...","location":"..."}, ...]
// 极简解析: 不引入 cJSON 库 (C3 RAM 紧张), 用字符串查找

#define MAX_ENTRIES 20
typedef struct {
    char name[32];
    char desc[64];
    char location[48];
} entry_t;

static entry_t s_entries[MAX_ENTRIES];
static int     s_entry_count = 0;

// 从 JSON 文本中提取 "key":"value" 的值, 从 base 位置开始搜索
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

// 解析当前分类 JSON 到 s_entries[]
static void parse_category(int cat)
{
    s_entry_count = 0;
    const char *data = CAT_DATA[cat].start;
    const char *end  = CAT_DATA[cat].end;
    (void)end;

    const char *p = data;
    while (s_entry_count < MAX_ENTRIES) {
        // 找下一个 {
        const char *obj_start = strchr(p, '{');
        if (!obj_start) break;

        entry_t *e = &s_entries[s_entry_count];
        memset(e, 0, sizeof(*e));

        // 从当前对象位置开始搜索字段 (避免总匹配到第一个)
        json_extract(obj_start, "name", e->name, sizeof(e->name));
        json_extract(obj_start, "desc", e->desc, sizeof(e->desc));
        json_extract(obj_start, "location", e->location, sizeof(e->location));

        if (e->name[0]) {
            s_entry_count++;
        }

        // 跳到下一个 }
        p = strchr(obj_start, '}');
        if (!p) break;
        p++;
    }
    ESP_LOGI(TAG, "Category %d: %d entries", cat, s_entry_count);
}

// ---- UI ----
static lv_obj_t *s_scr;
static lv_obj_t *s_tabs;
static lv_obj_t *s_list;
static int       s_cat_sel = 0;   // 当前分类
static int       s_item_sel = 0;  // 当前选中条目

static void rebuild_list(void)
{
    // 删除旧列表
    if (s_list) {
        lv_obj_delete(s_list);
    }
    s_item_sel = 0;

    parse_category(s_cat_sel);

    s_list = sk_list_create(s_scr, 8, SK_HEADER_H + 36, SK_SCREEN_W - 16,
                            SK_SCREEN_H - SK_HEADER_H - SK_FOOTER_H - 44);

    for (int i = 0; i < s_entry_count; i++) {
        sk_list_add_item(s_list, s_entries[i].name, s_entries[i].desc);
    }

    // 高亮第一项
    if (s_entry_count > 0) {
        lv_obj_t *first = lv_obj_get_child(s_list, 0);
        if (first) {
            lv_obj_set_style_bg_color(first, lv_color_hex(SK_BLUE), 0);
            lv_obj_set_style_bg_opa(first, LV_OPA_20, 0);
        }
    }
}

static void update_list_selection(void)
{
    int child_count = lv_obj_get_child_count(s_list);
    for (int i = 0; i < child_count; i++) {
        lv_obj_t *child = lv_obj_get_child(s_list, i);
        if (i == s_item_sel) {
            lv_obj_set_style_bg_color(child, lv_color_hex(SK_BLUE), 0);
            lv_obj_set_style_bg_opa(child, LV_OPA_20, 0);
            lv_obj_scroll_to_view(child, LV_ANIM_ON);
        } else {
            lv_obj_set_style_bg_opa(child, LV_OPA_TRANSP, 0);
        }
    }
}

void page_compendium_enter(void)
{
    ESP_LOGI(TAG, "enter compendium");
    s_scr = sk_screen_create();

    sk_header_create(s_scr, "Hyrule Compendium");

    // 分类标签
    s_tabs = sk_tabs_create(s_scr, SK_HEADER_H, CAT_NAMES, CAT_COUNT, &s_cat_sel);

    rebuild_list();

    sk_footer_create(s_scr, LV_SYMBOL_UP "/" LV_SYMBOL_DOWN ":Browse  "
                                LV_SYMBOL_OK ":Details");

    lv_screen_load(s_scr);
}

void page_compendium_exit(void)
{
    s_scr = NULL;
    s_list = NULL;
    s_tabs = NULL;
    s_cat_sel = 0;
    s_item_sel = 0;
}

void page_compendium_key(bsp_btn_t btn, bsp_btn_ev_t ev)
{
    if (ev != BSP_BTN_CLICK) return;

    if (sk_popup_is_open()) {
        // 弹窗中: 任意键关闭
        sk_popup_close();
        return;
    }

    switch (btn) {
    case BSP_BTN_UP:
        if (s_item_sel > 0) {
            s_item_sel--;
            update_list_selection();
        } else {
            // 切到上一个分类
            s_cat_sel = (s_cat_sel + CAT_COUNT - 1) % CAT_COUNT;
            sk_tabs_update(s_tabs, s_cat_sel);
            rebuild_list();
        }
        break;

    case BSP_BTN_DOWN:
        if (s_item_sel < s_entry_count - 1) {
            s_item_sel++;
            update_list_selection();
        } else {
            // 切到下一个分类
            s_cat_sel = (s_cat_sel + 1) % CAT_COUNT;
            sk_tabs_update(s_tabs, s_cat_sel);
            rebuild_list();
        }
        break;

    case BSP_BTN_OK:
        if (s_item_sel < s_entry_count) {
            entry_t *e = &s_entries[s_item_sel];
            char body[200];
            snprintf(body, sizeof(body), "%s\n\nLocation: %s",
                     e->desc, e->location[0] ? e->location : "Unknown");
            sk_popup_show(s_scr, e->name, body);
        }
        break;
    }
}
