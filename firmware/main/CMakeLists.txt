set(SLATE_SRCS
    "main.c"
    "slate_app.c"
    "game_view.c"
    "sheikah_theme.c"
    "sheikah_ui.c"
    "page_standby.c"
    "page_runes.c"
    "page_rune_app.c"
    "page_compendium.c"
    "page_quest.c"
    "page_settings.c"
    "game/game.c"
    "game/bomb.c"
    "game/magnet.c"
    "game/stasis.c"
    "game/cryonis.c"
    "game/camera.c"
    "game/input.c"
    "game/progress.c"
    "game/store.c"
    "game/catalog.c"
    "audio/sfx.c"
    "audio/sfx_data.c"
    "font/hylia_serif_16.c"
    "font/hylia_serif_20.c"
    "font/hylia_serif_28.c"
)

# 28 项素材（含希卡之眼）；旧五页的 img_*.c 已随 assets 整理删除。
include(${CMAKE_CURRENT_LIST_DIR}/images.cmake)

# 旧JSON素材保留在 assets/data，固件只编译生成好的只读目录(catalog.c)。
idf_component_register(
    SRCS ${SLATE_SRCS} ${SLATE_IMAGES}
    INCLUDE_DIRS "."
    REQUIRES bsp
    PRIV_REQUIRES nvs_flash esp_timer
)
