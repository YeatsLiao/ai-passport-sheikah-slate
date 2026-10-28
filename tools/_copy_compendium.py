# -*- coding: utf-8 -*-
"""复制图鉴图到 gen/prototype:BOTW 389(跳过 luminous_stone_deposit)+ master 5"""
import os, shutil

root = r'D:\Project\ai-passport-sheikah-slate'
src_dir = root + r'\assets\raw\03_compendium\BOTW'
mm_dir = root + r'\assets\raw\03_compendium\master_mode-BOTW'
dst_dir = root + r'\assets\gen\prototype'

os.makedirs(dst_dir, exist_ok=True)
skip = {'luminous_stone_deposit.png'}  # api 无对应条目的多余文件
copied, overwritten, skipped = 0, [], []

for fn in sorted(os.listdir(src_dir)):
    if fn in skip:
        skipped.append(fn)
        continue
    s, d = os.path.join(src_dir, fn), os.path.join(dst_dir, fn)
    if os.path.exists(d):
        overwritten.append(fn)
    shutil.copy2(s, d)
    copied += 1

for fn in sorted(os.listdir(mm_dir)):
    s, d = os.path.join(mm_dir, fn), os.path.join(dst_dir, fn)
    if os.path.exists(d):
        overwritten.append(fn)
    shutil.copy2(s, d)
    copied += 1

print('copied:', copied, 'skipped:', skipped, 'overwrote(gen已有同名):', overwritten)
