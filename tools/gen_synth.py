#!/usr/bin/env python3
# tools/gen_synth.py -- 合成希卡风音效 -> assets/audio/<id>.wav
#
# 游戏原版音效下载不到时的兜底。声音设计对齐旷野之息希卡 UI 的三个特征:
#   1. 玻璃质感: 双振荡器轻微失谐 (chorus), 软攻击, 没有毛刺感
#   2. 钟形泛音: 选中/激活音用非整数倍分音 (2.4x/2.76x), 像蒙了布的铃
#   3. 神庙混响: Schroeder 混响 (4 comb + 2 allpass), 所有音都有"室内"尾巴
# 产物走标准管线:
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


def secs(dur):
    return int(dur * SR)


def normalize(samples, peak=0.9):
    m = max((abs(v) for v in samples), default=1.0) or 1.0
    k = peak / m
    return [v * k for v in samples]


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


def mix(dest, src, offset_s, gain=1.0):
    """把 src 叠加进 dest 的 offset 秒处。"""
    off = secs(offset_s)
    need = off + len(src)
    if need > len(dest):
        dest.extend([0.0] * (need - len(dest)))
    for i, v in enumerate(src):
        dest[off + i] += v * gain


def chirp(f0, f1, dur, amp=0.8, tau=0.3, atk=0.02):
    """指数扫频 (f0->f1, 先快后慢, 接近原版滑音的手感) + 软攻击 + 指数衰减。"""
    n = secs(dur)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        k = t / dur
        f = f0 * (f1 / f0) ** k
        phase += 2 * math.pi * f / SR
        env = min(t / atk, 1.0) * math.exp(-t / tau)
        out.append(amp * env * math.sin(phase))
    return out


def glass(f, dur, amp=0.8, tau=0.3, detune=0.006, atk=0.015):
    """失谐双振荡玻璃音 -- 希卡 UI"水感"的来源。"""
    n = secs(dur)
    out = []
    for i in range(n):
        t = i / SR
        env = min(t / atk, 1.0) * math.exp(-t / tau)
        v = (math.sin(2 * math.pi * f * t)
             + math.sin(2 * math.pi * f * (1 + detune) * t)) * 0.5
        out.append(amp * env * v)
    return out


def bell(f, dur, amp=0.8, tau=0.25, atk=0.012):
    """钟音: 基频 + 非整数倍分音 (2.4x/3.9x), 原版选中音的"叮"就是这种蒙布的铃。"""
    n = secs(dur)
    out = []
    for i in range(n):
        t = i / SR
        env = min(t / atk, 1.0) * math.exp(-t / tau)
        v = (math.sin(2 * math.pi * f * t)
             + 0.45 * math.sin(2 * math.pi * f * 2.4 * t)
             + 0.2 * math.sin(2 * math.pi * f * 3.9 * t))
        out.append(amp * env * v / 1.65)
    return out


def noise_click(dur, amp=0.7, tau=0.01, lp=0.6):
    """噪声爆发: 一阶低通 + 指数衰减。lp 越小越闷(爆炸), 越大越脆(快门)。"""
    n = secs(dur)
    out, y = [], 0.0
    for i in range(n):
        t = i / SR
        y += lp * (random.uniform(-1, 1) - y)
        out.append(amp * math.exp(-t / tau) * y)
    return out


def sheikah_reverb(dry, wet=0.3, tail=0.35):
    """Schroeder 混响: 4 并联 comb + 2 串联 allpass, 再补 tail 秒静音让尾巴自然衰减。
    这就是原版音效"在神庙里响"的空间感。"""
    dry = dry + [0.0] * secs(tail)
    n = len(dry)
    rv = [0.0] * n
    for d_ms, g in ((29.7, 0.77), (37.1, 0.71), (41.1, 0.63), (43.7, 0.595)):
        d = int(SR * d_ms / 1000.0)
        buf = [0.0] * d
        for i in range(n):
            y = dry[i] + g * buf[i % d]
            buf[i % d] = y
            rv[i] += y
    rv = [v * 0.25 for v in rv]
    for d_ms, fb in ((5.0, 0.5), (1.7, 0.5)):
        d = int(SR * d_ms / 1000.0)
        buf = [0.0] * d
        for i in range(n):
            x = rv[i]
            b = buf[i % d]
            rv[i] = b - x
            buf[i % d] = x + b * fb
    return [dry[i] + wet * rv[i] for i in range(n)]


random.seed(42)   # 固定种子, 产物可复现

# ---- activate: 打开符文轮盘 "wwoop-" 上滑 + 高八度失谐泛音 + 收尾双铃 ----
s = chirp(250, 950, 0.5, amp=0.6, tau=0.5, atk=0.05)
mix(s, glass(500, 0.5, amp=0.22, tau=0.4), 0.0)
mix(s, bell(740, 0.35, amp=0.45, tau=0.12), 0.5)
mix(s, bell(1108, 0.4, amp=0.38, tau=0.14), 0.62)
write_wav("activate", normalize(sheikah_reverb(s, wet=0.35)))

# ---- tick: 轮盘旋转的轻快玻璃 "嗒" (混响要少, 快速连按不糊) ----
s = glass(1900, 0.06, amp=0.6, tau=0.014, atk=0.003)
mix(s, noise_click(0.008, amp=0.15, tau=0.003, lp=0.9), 0.0)
write_wav("tick", normalize(sheikah_reverb(s, wet=0.12, tail=0.15)))

# ---- confirm: 选中确认 蒙布双铃 "叮-叮" (纯五度上行) ----
s = bell(740, 0.22, amp=0.55, tau=0.08)
mix(s, bell(1108, 0.3, amp=0.55, tau=0.1), 0.11)
write_wav("confirm", normalize(sheikah_reverb(s, wet=0.3)))

# ---- bomb_place: 放置炸弹 低频下滑 "噗" + 机械咔哒 ----
s = chirp(170, 90, 0.12, amp=0.7, tau=0.05, atk=0.005)
mix(s, noise_click(0.01, amp=0.3, tau=0.003, lp=0.75), 0.08)
write_wav("bomb_place", normalize(sheikah_reverb(s, wet=0.2, tail=0.2)))

# ---- bomb_boom: 引爆 (低通噪声 + 90->38Hz 下滑冲击 + 初爆瞬态) ----
s = noise_click(1.1, amp=0.8, tau=0.25, lp=0.12)
mix(s, chirp(90, 38, 0.5, amp=0.8, tau=0.16, atk=0.002), 0.0)
mix(s, noise_click(0.03, amp=0.9, tau=0.008, lp=0.95), 0.0)
write_wav("bomb_boom", normalize(sheikah_reverb(s, wet=0.25, tail=0.4)))

# ---- stasis_freeze: 时停冻结 金属感下滑 (基频 + 2.76x 金属分音 + 失谐对) ----
s = chirp(1400, 350, 0.55, amp=0.5, tau=0.45, atk=0.03)
mix(s, chirp(1424, 356, 0.55, amp=0.25, tau=0.4, atk=0.03), 0.0)
mix(s, chirp(3864, 966, 0.55, amp=0.15, tau=0.3, atk=0.03), 0.0)
write_wav("stasis_freeze", normalize(sheikah_reverb(s, wet=0.35)))

# ---- stasis_unfreeze: 解冻 反向上滑 ----
s = chirp(350, 1400, 0.55, amp=0.5, tau=0.45, atk=0.03)
mix(s, chirp(356, 1424, 0.55, amp=0.25, tau=0.4, atk=0.03), 0.0)
mix(s, chirp(966, 3864, 0.55, amp=0.15, tau=0.3, atk=0.03), 0.0)
write_wav("stasis_unfreeze", normalize(sheikah_reverb(s, wet=0.35)))

# ---- shutter: 快门 双咔哒 (前帘 + 后帘), 基本干声, 只留一点空间感 ----
s = noise_click(0.02, amp=0.8, tau=0.006, lp=0.85)
mix(s, glass(1000, 0.03, amp=0.4, tau=0.008, atk=0.002), 0.0)
mix(s, noise_click(0.02, amp=0.7, tau=0.006, lp=0.85), 0.09)
mix(s, glass(800, 0.03, amp=0.35, tau=0.008, atk=0.002), 0.09)
write_wav("shutter", normalize(sheikah_reverb(s, wet=0.1, tail=0.15)))

print("gen_synth: 8 个希卡风音效已写入 assets/audio/")
