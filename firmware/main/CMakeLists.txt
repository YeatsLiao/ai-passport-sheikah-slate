# Offline V1. Generate data/fonts/resources with tools/build_offline_pack.py --fonts first.
set(OFFLINE_SRCS
    "offline/main.c" "offline/app.c" "offline/model.c" "offline/state.c"
    "offline/resources.c" "offline/audio.c" "offline/clock.c" "offline/data.c"
    "offline/font_10.c" "offline/font_12.c" "offline/font_14.c" "offline/font_16.c" "offline/font_clock.c" "offline/font_clock_40.c" "offline/font_clock_52.c" "offline/screenshot.c" "game/input.c"
)
foreach(source IN LISTS OFFLINE_SRCS)
    if(NOT EXISTS "${CMAKE_CURRENT_LIST_DIR}/${source}")
        message(FATAL_ERROR "Missing ${source}; run python -B tools/build_offline_pack.py --fonts from repository root")
    endif()
endforeach()
idf_component_register(SRCS ${OFFLINE_SRCS} INCLUDE_DIRS "." "offline"
    REQUIRES bsp PRIV_REQUIRES nvs_flash esp_timer esp_partition esp_mm esp_driver_usb_serial_jtag vfs)

# Offline V1 is intentionally written in a dense, one-statement-per-line style;
# the indentation heuristic misfires on it, so disable only that check here.
target_compile_options(${COMPONENT_LIB} PRIVATE -Wno-misleading-indentation)
