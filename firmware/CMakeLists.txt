cmake_minimum_required(VERSION 3.16)

set(EXTRA_COMPONENT_DIRS "components")

# `idf.py merge-bin` writes the full flash image under this stable name
# (read by esptool_py's merge-bin target at configure time).
set(ENV{ESP_MERGE_BIN_OUTPUT} "${CMAKE_CURRENT_BINARY_DIR}/ai-passport-sheikah-slate-full.bin")

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(ai-passport-sheikah-slate)
