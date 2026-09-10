#!/usr/bin/env python3
# tools/gen_audio.py -- 音效转换管线: assets/audio/<id>.wav -> main/audio/sfx_data.{c,h}
#
# 用法:  python tools/gen_audio.py
#   1. 按下方 MANIFEST 把游戏原版音效下载为 assets/audio/<id>.wav (16bit PCM WAV 最佳,
#      其他位深/采样率/声道也能转; mp3 不支持, 请下载 wav 格式)
#   2. 运行本脚本, 生成 16kHz/16bit/单声道 PCM 的 C 数组 + 索引表
#   3. 重新 idf.py build
#
# 转换: ffmpeg 优先(装了就自动用); 没装则用纯 Python wave 模块解码 PCM WAV
#      (手动做单声道下混 + 线性重采样到 16kHz + 首尾静音裁剪)。
# Flash 预算: 16kHz mono 16bit = 32KB/s, 每个音效 0.2~1s ≈ 6~32KB。

import os
import struct
import subprocess
import sys
import wave

SRC_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "audio")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "main", "audio")
SRATE = 16000

# ---- 音效清单 (id 顺序即 SFX_* 枚举值, 换音频不改代码, 只换 assets/audio 下的 wav) ----
MANIFEST = [
    ("activate",           "石板激活 (待机 OK 进符文页)"),
    ("tick",               "符文轮盘旋转 (UP/DOWN)"),
    ("confirm",            "符文选中 (OK)"),
    ("bomb_place",         "炸弹放置"),
    ("bomb_boom",          "炸弹引爆"),
    ("magnesis_activate",  "磁力激活 (电磁嗡鸣)"),
    ("stasis_freeze",      "时停冻结"),
    ("stasis_unfreeze",    "时停解冻"),
    ("cryonis_activate",   "制冰激活 (水晶上行)"),
    ("shutter",            "相机快门"),
]

TRIM_SILENCE_THRESHOLD = 80   # int16 振幅阈值, 首尾裁剪


def decode_with_ffmpeg(path):
    """ffmpeg 解码任意格式 -> 16kHz mono s16le 原始 PCM 字节。失败返回 None。"""
    try:
        out = subprocess.run(
            ["ffmpeg", "-v", "error", "-i", path, "-f", "s16le",
             "-ac", "1", "-ar", str(SRATE), "-"],
            capture_output=True, timeout=60)
        if out.returncode == 0 and out.stdout:
            return list(struct.unpack("<%dh" % (len(out.stdout) // 2), out.stdout))
    except (OSError, subprocess.SubprocessError):
        pass
    return None


def decode_with_wave(path):
    """纯 Python 解码 PCM WAV -> 单声道 -> 线性重采样到 16kHz。"""
    with wave.open(path, "rb") as w:
        if w.getcomptype() != "NONE":
            raise ValueError("compressed wav (需 ffmpeg)")
        nch, sw, rate, nframes = (w.getnchannels(), w.getsampwidth(),
                                  w.getframerate(), w.getnframes())
        raw = w.readframes(nframes)

    # 转成 int16 样本列表
    if sw == 2:
        samples = list(struct.unpack("<%dh" % (len(raw) // 2), raw))
    elif sw == 1:   # 无符号 8bit -> 有符号 16bit
        samples = [(b - 128) << 8 for b in raw]
    elif sw == 3:   # 24bit 小端 -> 16bit
        samples = [int.from_bytes(raw[i:i + 3], "little", signed=True) >> 8
                   for i in range(0, len(raw) - 2, 3)]
    elif sw == 4:   # 32bit -> 16bit
        samples = [v >> 16 for (v,) in struct.iter_unpack("<i", raw)]
    else:
        raise ValueError("sampwidth=%d" % sw)

    # 多声道下混 (取平均)
    if nch > 1:
        samples = [sum(samples[i:i + nch]) // nch
                   for i in range(0, len(samples) - nch + 1, nch)]

    # 线性重采样到 16kHz
    if rate != SRATE and samples:
        out_n = int(len(samples) * SRATE / rate)
        res = []
        for j in range(out_n):
            src = j * (len(samples) - 1) / max(out_n - 1, 1)
            i = int(src)
            frac = src - i
            i2 = min(i + 1, len(samples) - 1)
            res.append(int(samples[i] * (1 - frac) + samples[i2] * frac))
        samples = res
    return samples


def trim(samples):
    """裁掉首尾静音 (阈值以下视为静音)。"""
    first, last = 0, len(samples) - 1
    while first <= last and abs(samples[first]) < TRIM_SILENCE_THRESHOLD:
        first += 1
    while last >= first and abs(samples[last]) < TRIM_SILENCE_THRESHOLD:
        last -= 1
    return samples[first:last + 1] if first <= last else samples


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    entries, arrays, report = [], [], []

    for sid, desc in MANIFEST:
        path = os.path.join(SRC_DIR, sid + ".wav")
        if not os.path.exists(path):
            entries.append(None)
            report.append("  MISS  %-16s %s" % (sid, desc))
            continue
        samples = decode_with_ffmpeg(path)
        if samples is None:
            samples = decode_with_wave(path)
        samples = trim(samples)
        if not samples:
            entries.append(None)
            report.append("  EMPTY %-16s %s" % (sid, desc))
            continue
        entries.append(len(arrays))
        arrays.append((sid, samples))
        report.append("  OK    %-16s %5.2fs  %6.1fKB  %s"
                      % (sid, len(samples) / SRATE,
                         len(samples) * 2 / 1024.0, desc))

    # ---- 生成 sfx_data.c ----
    c = ["// main/audio/sfx_data.c -- 由 tools/gen_audio.py 生成, 勿手改",
         "#include \"sfx_data.h\"", ""]
    for sid, samples in arrays:
        c.append("static const int16_t pcm_%s[] = {" % sid)
        for i in range(0, len(samples), 12):
            row = samples[i:i + 12]
            c.append("    " + ",".join("%6d" % v for v in row) + ",")
        c.append("};")
        c.append("")
    c.append("const sfx_entry_t SFX[SFX_COUNT] = {")
    for idx, (sid, _desc) in enumerate(MANIFEST):
        if entries[idx] is None:
            c.append("    { NULL, 0 },")
        else:
            c.append("    { pcm_%s, sizeof(pcm_%s) / sizeof(pcm_%s[0]) },"
                     % (sid, sid, sid))
    c.append("};")
    with open(os.path.join(OUT_DIR, "sfx_data.c"), "w", encoding="utf-8") as f:
        f.write("\n".join(c) + "\n")

    # ---- 生成 sfx_data.h ----
    h = ["// main/audio/sfx_data.h -- 由 tools/gen_audio.py 生成, 勿手改",
         "#pragma once", "", "#include <stdint.h>", "",
         "#define SFX_COUNT %d" % len(MANIFEST), "",
         "typedef struct {", "    const int16_t *pcm;    // 16kHz/16bit/mono",
         "    uint32_t samples;", "} sfx_entry_t;", "",
         "extern const sfx_entry_t SFX[SFX_COUNT];", ""]
    for idx, (sid, _desc) in enumerate(MANIFEST):
        h.append("#define SFX_%-16s %d   // %s"
                 % (sid.upper(), idx, _desc))
    with open(os.path.join(OUT_DIR, "sfx_data.h"), "w", encoding="utf-8") as f:
        f.write("\n".join(h) + "\n")

    print("gen_audio: %d/%d 个音效就绪" % (sum(1 for e in entries if e is not None),
                                          len(MANIFEST)))
    print("\n".join(report))


if __name__ == "__main__":
    main()
