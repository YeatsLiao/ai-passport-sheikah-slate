#!/usr/bin/env python3
# tools/gen_synth.py -- 合成希卡风音效 -> assets/audio/<id>.wav
#
# 对齐旷野之息希卡 UI 音效的四个特征:
#   1. 玻璃质感: 双振荡器轻微失谐 (chorus), 软攻击, 没有毛刺感
#   2. 钟形泛音: 选中/激活音用非整数倍分音 (2.4x/2.76x/3.9x), 像蒙了布的铃
#   3. 神庙混响: Schroeder 混响 (4 comb + 2 allpass), 所有音都有"室内"尾巴
#   4. 符文专属音色: 每个能力有独特声音签名 (磁力=电磁嗡鸣, 制冰=水晶上行,
#      时停=金属下滑, 炸弹=低频冲击, 相机=机械快门)
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

# ---- activate: 打开符文轮盘 -- 游戏原版是明亮的金属 "shwing" ----
# 快速上滑 + 高八度失谐泛音 + 收尾双铃, 攻击更脆 (tau 缩短), 尾音更长
s = chirp(280, 1100, 0.45, amp=0.65, tau=0.4, atk=0.03)
mix(s, glass(560, 0.45, amp=0.25, tau=0.35), 0.0)
mix(s, bell(880, 0.4, amp=0.5, tau=0.15), 0.42)
mix(s, bell(1320, 0.5, amp=0.42, tau=0.18), 0.55)
mix(s, glass(1760, 0.3, amp=0.12, tau=0.1), 0.55)   # 高频空气感
write_wav("activate", normalize(sheikah_reverb(s, wet=0.38, tail=0.45)))

# ---- tick: 轮盘旋转的轻快玻璃 "嗒" (混响要少, 快速连按不糊) ----
s = glass(2100, 0.05, amp=0.55, tau=0.012, atk=0.002)
mix(s, noise_click(0.006, amp=0.12, tau=0.002, lp=0.92), 0.0)
write_wav("tick", normalize(sheikah_reverb(s, wet=0.1, tail=0.12)))

# ---- confirm: 选中确认 -- 游戏原版是清脆的双铃上行 "叮-叮" ----
s = bell(880, 0.2, amp=0.55, tau=0.07)
mix(s, bell(1320, 0.3, amp=0.55, tau=0.09), 0.1)
mix(s, glass(1760, 0.15, amp=0.1, tau=0.05), 0.1)   # 高频泛音增加明亮度
write_wav("confirm", normalize(sheikah_reverb(s, wet=0.3, tail=0.3)))

# ---- bomb_place: 放置炸弹 低频下滑 "噗" + 机械咔哒 ----
s = chirp(170, 90, 0.12, amp=0.7, tau=0.05, atk=0.005)
mix(s, noise_click(0.01, amp=0.3, tau=0.003, lp=0.75), 0.08)
write_wav("bomb_place", normalize(sheikah_reverb(s, wet=0.2, tail=0.2)))

# ---- bomb_boom: 引爆 (低通噪声 + 90->38Hz 下滑冲击 + 初爆瞬态) ----
s = noise_click(1.1, amp=0.8, tau=0.25, lp=0.12)
mix(s, chirp(90, 38, 0.5, amp=0.8, tau=0.16, atk=0.002), 0.0)
mix(s, noise_click(0.03, amp=0.9, tau=0.008, lp=0.95), 0.0)
write_wav("bomb_boom", normalize(sheikah_reverb(s, wet=0.25, tail=0.4)))

# ---- magnesis_activate: 磁力激活 -- 游戏原版是低频电磁嗡鸣 + 上升电弧 ----
# 50Hz 基频嗡鸣 (像变压器) + 失谐对拍 + 快速上滑电弧 "滋"
s = glass(55, 0.7, amp=0.5, tau=0.5, detune=0.03, atk=0.04)   # 电磁嗡鸣 (大失谐=拍频)
mix(s, glass(110, 0.6, amp=0.2, tau=0.4, detune=0.02), 0.0)   # 二次谐波
mix(s, chirp(400, 2800, 0.25, amp=0.35, tau=0.15, atk=0.01), 0.05)  # 电弧上滑
mix(s, noise_click(0.04, amp=0.25, tau=0.01, lp=0.7), 0.05)   # 电弧噪声
mix(s, bell(660, 0.3, amp=0.2, tau=0.1), 0.28)                # 收尾铃
write_wav("magnesis_activate", normalize(sheikah_reverb(s, wet=0.3, tail=0.35)))

# ---- stasis_freeze: 时停冻结 -- 游戏原版是金属感下滑 + 时间扭曲质感 ----
# 基频 + 2.76x 金属分音 + 失谐对 + 高频 "冻结" 闪烁
s = chirp(1500, 320, 0.6, amp=0.5, tau=0.5, atk=0.025)
mix(s, chirp(1526, 326, 0.6, amp=0.25, tau=0.45, atk=0.025), 0.0)   # 失谐对
mix(s, chirp(4140, 880, 0.6, amp=0.18, tau=0.35, atk=0.025), 0.0)   # 2.76x 金属分音
mix(s, glass(3000, 0.3, amp=0.08, tau=0.15, detune=0.01), 0.3)      # 高频冻结闪烁
write_wav("stasis_freeze", normalize(sheikah_reverb(s, wet=0.38, tail=0.4)))

# ---- stasis_unfreeze: 解冻 反向上滑 + 加速感 ----
s = chirp(320, 1500, 0.5, amp=0.5, tau=0.4, atk=0.02)
mix(s, chirp(326, 1526, 0.5, amp=0.25, tau=0.35, atk=0.02), 0.0)
mix(s, chirp(880, 4140, 0.5, amp=0.18, tau=0.3, atk=0.02), 0.0)
mix(s, bell(1320, 0.25, amp=0.2, tau=0.08), 0.45)   # 收尾确认铃
write_wav("stasis_unfreeze", normalize(sheikah_reverb(s, wet=0.35, tail=0.35)))

# ---- cryonis_activate: 制冰激活 -- 游戏原版是水晶上行闪烁 + 冰裂质感 ----
# 五度上行铃音列 (C5-G5-C6) + 高频冰裂噪声 + 长混响尾巴
s = bell(523, 0.35, amp=0.45, tau=0.12)                    # C5
mix(s, bell(784, 0.35, amp=0.4, tau=0.12), 0.12)           # G5
mix(s, bell(1047, 0.45, amp=0.45, tau=0.15), 0.24)         # C6
mix(s, glass(2093, 0.3, amp=0.12, tau=0.1, detune=0.008), 0.24)  # C7 空气感
mix(s, noise_click(0.06, amp=0.2, tau=0.015, lp=0.85), 0.0)      # 冰裂瞬态
mix(s, noise_click(0.04, amp=0.12, tau=0.01, lp=0.9), 0.28)      # 二次冰裂
write_wav("cryonis_activate", normalize(sheikah_reverb(s, wet=0.4, tail=0.5)))

# ---- shutter: 快门 双咔哒 (前帘 + 后帘), 基本干声, 只留一点空间感 ----
s = noise_click(0.018, amp=0.8, tau=0.005, lp=0.88)
mix(s, glass(1100, 0.025, amp=0.4, tau=0.007, atk=0.002), 0.0)
mix(s, noise_click(0.018, amp=0.7, tau=0.005, lp=0.88), 0.085)
mix(s, glass(880, 0.025, amp=0.35, tau=0.007, atk=0.002), 0.085)
write_wav("shutter", normalize(sheikah_reverb(s, wet=0.08, tail=0.12)))

print("gen_synth: 10 个希卡风音效已写入 assets/audio/")
