# -*- coding: utf-8 -*-
"""生成 prototype/js/quest-data.js:BotW 完整主线(15)+支线(76)任务数据。
官方译名转简体(zhconv);带 * 的为 wiki 未收录、社区/自拟译名。
"""
import io, sys, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from zhconv import convert

from quest_data_main import MAIN_QUESTS
from quest_data_side import SIDE_QUESTS

def esc(s):
    return (s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n'))

def to_cn(raw):
    # 转简体,同时去掉自拟标记星号信息留在注释
    return convert(raw, 'zh-cn')

def build(name, items, prefix):
    out = []
    for i, (en, cn, loc, desc) in enumerate(items, 1):
        custom = ' *' in cn or cn.endswith('*')
        clean = cn.rstrip('*').strip()
        out.append(
            "    { id: '%s%d', title: \"%s\", cn: \"%s\", loc: \"%s\", desc: \"%s\"%s }" % (
                prefix, i, esc(en), esc(to_cn(clean)), esc(to_cn(loc)),
                esc(to_cn(desc)), '' if not custom else ' /* 译名自拟 */'))
    return "  %s: [\n%s\n  ]" % (name, ',\n'.join(out))

js = "/* BotW 完整任务数据(自动生成,勿手改;源:tools/quest_data_main.py, tools/quest_data_side.py)\n"
js += "   中文名以 Zelda Wiki 官方译名为准(繁体转简体);标注「译名自拟」的条目 wiki 未收录官方译名。\n"
js += "   主线按剧情顺序 15 条;支线按英文名 A-Z 76 条。 */\n"
js += "const QUESTS = {\n"
js += build('main', MAIN_QUESTS, 'm') + ',\n'
js += build('side', SIDE_QUESTS, 's') + '\n};\n'

out_path = r'D:\Project\ai-passport-sheikah-slate\prototype\js\quest-data.js'
with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(js)

print('written:', out_path, len(js), 'chars, main=%d side=%d' % (len(MAIN_QUESTS), len(SIDE_QUESTS)))
# 抽查转换结果
import random
for item in [MAIN_QUESTS[7], SIDE_QUESTS[1], SIDE_QUESTS[47], SIDE_QUESTS[72]]:
    print(to_cn(item[1]), '|', to_cn(item[2]), '|', to_cn(item[3])[:20])
