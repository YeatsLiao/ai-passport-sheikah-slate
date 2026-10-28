# -*- coding: utf-8 -*-
"""生成 prototype/js/compendium-data.js
数据源:tools/compendium_all.json(官方 API 全量元数据,389 条)
       + cn_creatures/cn_monsters/cn_materials/cn_equipment(中文名)
       + master_mode-BOTW 5 条(大师模式金色怪/天空八爪怪,追加编号 390-394)
输出:COMP_CATS(全量 have=total) + COMP_ENTRIES(394 条,img 指向 gen/prototype 的 snake_case 图)
"""
import json, os, sys

ROOT = r'D:\Project\ai-passport-sheikah-slate'
sys.path.insert(0, ROOT + r'\tools')
from cn_creatures import CN as CN_CRE
from cn_monsters import CN as CN_MON
from cn_materials import CN_MATERIALS, CN_TREASURE
from cn_equipment import CN as CN_EQ

d = json.load(open(ROOT + r'\tools\compendium_all.json', encoding='utf-8'))
data = sorted(d['data'], key=lambda e: e['id'])

CAT_ALIAS = {'treasure': 'treasures'}
CN_MAP = {}
CN_MAP.update(CN_CRE); CN_MAP.update(CN_MON)
CN_MAP.update(CN_MATERIALS); CN_MAP.update(CN_TREASURE); CN_MAP.update(CN_EQ)

META_LABEL = {
    'creatures': '栖息地', 'monsters': '出没', 'materials': '获取',
    'equipment': '来源', 'treasure': '发现',
}

def js_str(v):
    return json.dumps(v, ensure_ascii=False)

def entry_obj(e, mm=False):
    name = e['name']
    cn = CN_MAP.get(name, name.title())
    no = '%03d' % e['id']
    locs = e.get('common_locations') or []
    loc = locs[0] if locs else ''
    cat = e['category']
    label = META_LABEL.get(cat, '信息')
    img = name.replace(' ', '_') + '.png'
    out = ['{', f"  no: {js_str(no)},", f"  name: {js_str(name.upper())},", f"  cn: {js_str(cn)},",
           f"  img: {js_str(img)},", '  got: true,']
    if loc:
        out.append(f"  meta: [{js_str(label)}, {js_str(loc)}],")
    if mm:
        out.append('  mm: true,')
    out.append(f"  desc: {js_str(e['description'])}")
    out.append('}')
    return '\n'.join(out)

# 全量条目
by_cat = {'creatures': [], 'monsters': [], 'materials': [], 'equipment': [], 'treasures': []}
missing_cn = []
for e in data:
    cat = CAT_ALIAS.get(e['category'], e['category'])
    if e['name'] not in CN_MAP:
        missing_cn.append(e['name'])
    by_cat[cat].append(entry_obj(e))

# 大师模式追加 5 条(编号 390-394,monsters)
MM = [
    ('golden bokoblin', '黄金波克布林'), ('golden moblin', '黄金莫力布林'),
    ('golden lizalfos', '黄金蜥蜴战士'), ('golden lynel', '黄金莱尼尔'),
    ('sky octorok', '天空八爪怪'),
]
for i, (name, cn) in enumerate(MM):
    no = '%03d' % (390 + i)
    img = name.replace(' ', '_') + '.png'
    desc = {
        'golden bokoblin': '大师模式的黄金波克布林。大师模式中部分波克布林以金色姿态出现，拥有远超寻常的体魄与掉落的珍贵战利品。',
        'golden moblin': '大师模式的黄金莫力布林。大师模式中出现的强化个体，攻击与耐性都显著提升。',
        'golden lizalfos': '大师模式的黄金蜥蜴战士。大师模式中出现的强化个体，行动依旧敏捷而致命。',
        'golden lynel': '大师模式的黄金莱尼尔。大师模式中最强的莱尼尔个体，几乎无人能在正面交锋中取胜。',
        'sky octorok': '大师模式中会喷出炸弹的八爪怪，漂浮在天空。一旦进入视野，随时可能发起轰炸。',
    }[name]
    by_cat['monsters'].append(
        '{\n' + '\n'.join([
            f"  no: {js_str(no)},", f"  name: {js_str(name.upper())},", f"  cn: {js_str(cn)},",
            f"  img: {js_str(img)},", '  got: true,', f"  meta: [{js_str('出没')}, {js_str('大师模式 · 全海拉鲁')}],",
            '  mm: true,', f"  desc: {js_str(desc)}",
        ]) + '\n}'
    )

# 分类汇总
cats_total = {c: len(by_cat[c]) for c in by_cat}
COMP_CATS = [
    ('creatures', 'CREATURES', '生物', 'cp_horse.png', 'cat_creatures.png'),
    ('monsters', 'MONSTERS', '怪物', 'cp_bokoblin.png', 'cat_monsters.png'),
    ('materials', 'MATERIALS', '材料', 'cp_apple.png', 'cat_materials.png'),
    ('equipment', 'EQUIPMENT', '装备', 'cp_master_sword.png', 'cat_equipment.png'),
    ('treasures', 'TREASURE', '宝物', 'cp_treasure_chest.png', 'cat_treasures.png'),
]
lines = []
lines.append('// 海拉鲁图鉴全量数据 · 由 tools/gen_compendium_js.py 生成,请勿手改')
lines.append('// 来源:Hyrule Compendium API(官方元数据)+ 中文译名整理 + 大师模式补充')
lines.append('const COMP_CATS = [')
for i, (cid, label, cn, cover, art) in enumerate(COMP_CATS):
    t = cats_total[cid]
    lines.append(f"  {{ id: {js_str(cid)}, label: {js_str(label)}, cn: {js_str(cn)}, cover: {js_str(cover)}, art: {js_str(art)}, have: {t}, total: {t} }}{'' if i == len(COMP_CATS)-1 else ','}")
lines.append('];')
lines.append('')
lines.append('const COMP_ENTRIES = {')
for cid in by_cat:
    lines.append(f"  {cid}: [")
    for i, eo in enumerate(by_cat[cid]):
        lines.append('    ' + eo.replace('\n', '\n    ') + ('' if i == len(by_cat[cid])-1 else ','))
    lines.append('  ],')
lines.append('};')

out_path = ROOT + r'\prototype\js\compendium-data.js'
open(out_path, 'w', encoding='utf-8').write('\n'.join(lines))
print('written:', out_path)
print('counts:', {c: len(by_cat[c]) for c in by_cat})
print('missing_cn:', missing_cn if missing_cn else 'none')
