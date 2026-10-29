# -*- coding: utf-8 -*-
"""生成 prototype/js/quest-data.js：BotW 主线20 + 神庙挑战42 + 迷你挑战90，共152条。
英文梗概与地点来自 quest_translations_en.json。
中文源已为简体；可选 zhconv 用于繁体转换。带 * 的为 wiki 未收录、社区/自拟译名。
"""
import io, sys, json
from pathlib import Path
from collections import Counter
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
try:
    from zhconv import convert
except ImportError:
    convert = None  # 当前任务源已为简体，无需安装转换依赖。

from quest_data_main import MAIN_QUESTS
from quest_data_side import SIDE_QUESTS
from quest_data_shrine import SHRINE_QUESTS

def esc(s):
    return (s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n'))

def to_cn(raw):
    # 转简体,同时去掉自拟标记星号信息留在注释
    return convert(raw, 'zh-cn') if convert else raw

ROOT = Path(__file__).resolve().parents[1]
def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"英文数据存在重复键：{key}")
        result[key] = value
    return result


ENGLISH = json.loads(
    Path(__file__).with_name("quest_translations_en.json").read_text(encoding="utf-8"),
    object_pairs_hook=unique_object,
)
GROUPS = (
    ('main', MAIN_QUESTS, 'm', {'base': 15, 'champions_ballad': 5}),
    ('shrine', SHRINE_QUESTS, 'sh', {'base': 42}),
    ('side', SIDE_QUESTS, 's', {'base': 76, 'master_trials': 7, 'champions_ballad': 6, 'xenoblade': 1}),
)


def validate():
    """在覆盖生成物前核对数量、内容包、唯一性和双语字段。"""
    titles, ids = set(), set()
    normalized_titles = set()
    packs = Counter()
    for name, items, prefix, expected in GROUPS:
        counts = Counter()
        for i, item in enumerate(items, 1):
            if len(item) not in (4, 5) or any(not isinstance(v, str) or not v.strip() for v in item):
                raise ValueError(f"{name} 第{i}条字段不完整")
            en, cn, loc, desc = item[:4]
            pack = item[4] if len(item) == 5 else 'base'
            if pack not in expected or not cn.rstrip('*').strip():
                raise ValueError(f"{en} 内容包或中文标题无效")
            quest_id = f'{prefix}{i}'
            if en.casefold() in normalized_titles or quest_id in ids:
                raise ValueError(f"重复任务：{quest_id} / {en}")
            translation = ENGLISH.get(en)
            if not isinstance(translation, dict) or any(
                not isinstance(translation.get(key), str) or not translation[key].strip()
                for key in ('en_desc', 'loc_en')
            ):
                raise ValueError(f"缺少英文梗概或地点：{en}")
            titles.add(en)
            normalized_titles.add(en.casefold())
            ids.add(quest_id)
            counts[pack] += 1
        if dict(counts) != expected:
            raise ValueError(f"{name} 数量不符：{dict(counts)}，预期 {expected}")
        packs.update(counts)
    if set(ENGLISH) != titles:
        raise ValueError(f"英文数据存在未使用条目：{set(ENGLISH) - titles}")
    if len(ids) != 152:
        raise ValueError(f"任务总数应为152，实际为{len(ids)}")
    return packs


def build(name, items, prefix):
    out = []
    for i, item in enumerate(items, 1):
        en, cn, loc, desc = item[:4]
        pack = item[4] if len(item) == 5 else 'base'
        custom = ' *' in cn or cn.endswith('*')
        clean = cn.rstrip('*').strip()
        out.append(
            "    { id: '%s%d', title: \"%s\", cn: \"%s\", loc: \"%s\", desc: \"%s\", en_desc: \"%s\", loc_en: \"%s\", pack: \"%s\"%s }" % (
                prefix, i, esc(en), esc(to_cn(clean)), esc(to_cn(loc)),
                esc(to_cn(desc)), esc(ENGLISH[en]['en_desc']), esc(ENGLISH[en]['loc_en']), esc(pack), '' if not custom else ' /* 社区译名，官方字形待核实 */'))
    return "  %s: [\n%s\n  ]" % (name, ',\n'.join(out))

packs = validate()
js = "/* BotW 任务数据（自动生成，勿手改；源：tools/quest_data_{main,shrine,side}.py）\n"
js += "   英文地点与自写梗概：tools/quest_translations_en.json；译名来源见各数据源。\n"
js += "   主线20 + 神庙挑战42 + 迷你挑战90 = 152；本体133 + DLC18 + 联动1。\n"
js += "   既有 m1–m15、s1–s76 编号不变；DLC与联动追加；神庙挑战使用 sh1–sh42。 */\n"
js += "const QUESTS = {\n"
js += ',\n'.join(build(name, items, prefix) for name, items, prefix, _ in GROUPS) + '\n};\n'

out_path = ROOT / 'prototype/js/quest-data.js'
with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(js)

print('written:', out_path, len(js), 'chars, main=%d shrine=%d side=%d total=152' %
      (len(MAIN_QUESTS), len(SHRINE_QUESTS), len(SIDE_QUESTS)))
print('内容包数量：', dict(packs))
