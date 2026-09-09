#!/usr/bin/env python3
# tools/gen_synth.py -- 合成希卡风音效 -> assets/audio/<id>.wav
#
# 游戏原版音效下载不到时的兜底: 希卡 UI 音效本质是短促电子音 (扫频/双音/噪声爆),
# 用纯正弦+指数衰减+噪声就能合成出"原版味"。产物走标准管线:
#   python tools/gen_synth.py   # 合成 wav (版权干净, 可入库)
#   python tools/gen_audio.py   # wav -> C 数组
# 以后拿到游戏原版 wav, 直接覆盖 assets/audio/<id>.wav 重跑 gen_audio.py 即可换装。

import math
import os
import random
import struct
import wave

SR = 16000
SRC = os.path.join(os.path.dirname(__file__), "..", "assets", "audio")


def write_wav(sid, samples):
    os.makedirs(SRC, exist_ok=True)
    path = os.path.join(SRC, sid + ".wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(
            struct.pack("<h", max(-32767, min(32767, int(v * 32767))))
            for v in samples))
    print("  %-18s %5.2fs" % (sid + ".wav", len(samples) / SR))


def secs(dur):
    return int(dur * SR)


def mix(dest, src, offset_s, gain=1.0):
    """把 src 叠加进 dest 的 offset 秒处。"""
    off = secs(offset_s)
    need = off + len(src)
    if need > len(dest):
        dest.extend([0.0] * (need - len(dest)))
    for i, v in enumerate(src):
        dest[off + i] += v * gain


def chirp(f0, f1, dur, amp=0.8, tau=0.3, shape="exp"):
    """指数/线性扫频 + 快攻击 + 指数衰减。tau = 衰减时间常数(秒)。"""
    n = secs(dur)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        k = t / dur
        f = f0 * (f1 / f0) ** k if shape == "exp" else f0 + (f1 - f0) * k
        phase += 2 * math.pi * f / SR
        env = min(t / 0.005, 1.0) * math.exp(-t / tau)   # 5ms 攻击
        out.append(amp * env * math.sin(phase))
    return out


def tone(f, dur, amp=0.8, tau=0.15):
    return chirp(f, f, dur, amp=amp, tau=tau)


def noise_click(dur, amp=0.7, tau=0.01, lp=0.6):
    """噪声爆发: 一阶低通 + 指数衰减。lp 越小越闷(爆炸), 越大越脆(快门)。"""
    n = secs(dur)
    out, y = [], 0.0
    for i in range(n):
        t = i / SR
        y += lp * (random.uniform(-1, 1) - y)
        out.append(amp * math.exp(-t / tau) * y)
    return out


random.seed(42)   # 固定种子, 产物可复现

# ---- activate: 石板激活 "bwoop-bip" (低->高扫频 + 高八度泛音 + 收尾双音) ----
s = chirp(220, 880, 0.55, amp=0.55, tau=0.45)
mix(s, chirp(440, 1760, 0.55, amp=0.25, tau=0.35), 0.0)
mix(s, tone(660, 0.18, amp=0.5, tau=0.09), 0.58)
mix(s, tone(990, 0.18, amp=0.4, tau=0.09), 0.60)
write_wav("activate", s)

# ---- tick: 轮盘旋转的轻快 "嗒" ----
s = tone(1800, 0.07, amp=0.55, tau=0.015)
mix(s, noise_click(0.01, amp=0.3, tau=0.004, lp=0.9), 0.0)
write_wav("tick", s)

# ---- confirm: 选中确认 "叮-叮" 双音 (纯五度上行) ----
s = tone(880, 0.12, amp=0.55, tau=0.05)
mix(s, tone(1320, 0.16, amp=0.55, tau=0.06), 0.10)
write_wav("confirm", s)

# ---- bomb_place: 放置炸弹 低频 "噗" + 机械咔哒 ----
s = tone(180, 0.14, amp=0.7, tau=0.05)
mix(s, noise_click(0.012, amp=0.4, tau=0.004, lp=0.8), 0.09)
write_wav("bomb_place", s)

# ---- bomb_boom: 引爆 (低通噪声 + 55Hz 低频冲击 + 初爆瞬态) ----
s = noise_click(0.9, amp=0.85, tau=0.22, lp=0.15)
mix(s, tone(55, 0.35, amp=0.75, tau=0.12), 0.0)
mix(s, noise_click(0.03, amp=0.9, tau=0.008, lp=0.95), 0.0)
write_wav("bomb_boom", s)

# ---- stasis_freeze: 时停冻结 高->低 "咻————" ----
s = chirp(1400, 350, 0.5, amp=0.6, tau=0.4)
mix(s, chirp(2800, 700, 0.5, amp=0.2, tau=0.35), 0.0)
write_wav("stasis_freeze", s)

# ---- stasis_unfreeze: 解冻 低->高 ----
s = chirp(350, 1400, 0.5, amp=0.6, tau=0.4)
mix(s, chirp(700, 2800, 0.5, amp=0.2, tau=0.35), 0.0)
write_wav("stasis_unfreeze", s)

# ---- shutter: 快门 双咔哒 (前帘 + 后帘) ----
s = noise_click(0.02, amp=0.8, tau=0.006, lp=0.85)
mix(s, tone(1000, 0.03, amp=0.5, tau=0.008), 0.0)
mix(s, noise_click(0.02, amp=0.7, tau=0.006, lp=0.85), 0.09)
mix(s, tone(800, 0.03, amp=0.45, tau=0.008), 0.09)
write_wav("shutter", s)

print("gen_synth: 8 个希卡风音效已写入 assets/audio/")
