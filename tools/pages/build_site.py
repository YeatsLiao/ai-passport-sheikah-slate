"""Assemble the GitHub Pages site from prototype/ + whitelisted assets.
策略（2026-11-01）：静音演示——原作 WAV 不入站；resources.bin/固件件不入站；
思源黑体做网页子集（同文件名替换，CSS 无需改动）。缺失音效时站点正常、无声。
用法：python -B tools/pages/build_site.py -o dist
"""
import argparse,glob,os,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]

def copy_tree(src,dst):
    n=0
    for dp,_,fns in os.walk(src):
        rel=Path(dp).relative_to(src)
        for fn in fns:
            t=Path(dst)/rel/fn;t.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(os.path.join(dp,fn),t);n+=1
    return n

def subset_font(src,dst):
    from fontTools import subset
    chars=set()
    for f in glob.glob(str(ROOT/'prototype'/'**'/'*.*'),recursive=True):
        if Path(f).suffix in ('.js','.css','.html'):
            chars.update(Path(f).read_text(encoding='utf-8',errors='replace'))
    text=''.join(sorted(c for c in chars if ord(c)>=0x20))
    opts=subset.Options();opts.layout_features=['*'];opts.name_IDs=[1,2,3,4,6]
    font=subset.load_font(src,opts)
    ss=subset.Subsetter(opts);ss.populate(text=text);ss.subset(font)
    subset.save_font(font,dst,opts)
    return os.path.getsize(dst)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('-o',default='dist')
    ap.add_argument('--with-audio',action='store_true',help='站点包含 40 段原作音效（默认静音演示，版权自担）')
    a=ap.parse_args()
    out=Path(a.o);shutil.rmtree(out,ignore_errors=True);out.mkdir(parents=True)
    n=copy_tree(ROOT/'prototype',out/'prototype')
    n+=copy_tree(ROOT/'assets/gen/prototype',out/'assets/gen/prototype')
    n+=copy_tree(ROOT/'assets/ui',out/'assets/ui')
    (out/'assets/maps').mkdir(parents=True)
    shutil.copy2(ROOT/'assets/maps/botw-map-base.webp',out/'assets/maps/')
    (out/'assets/fonts').mkdir(parents=True)
    size=subset_font(ROOT/'assets/fonts/SourceHanSansSC-Medium.otf',out/'assets/fonts/SourceHanSansSC-Medium.otf')
    shutil.copy2(ROOT/'assets/fonts/SourceHanSans-LICENSE.txt',out/'assets/fonts/')
    n+=2
    if a.with_audio:
        n+=copy_tree(ROOT/'assets/audio/botw',out/'assets/audio/botw')
    (out/'index.html').write_text(
     '<!doctype html><meta charset="utf-8"><title>Sheikah Slate · AI Passport</title>'
     '<meta name="viewport" content="width=device-width,initial-scale=1">'
     '<style>body{background:#06151e;color:#e5e6d3;font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0}'
     'a{color:#56cbe0}div{text-align:center;padding:2rem}</style>'
     '<div><h1>🗡️ 希卡石板 · AI Passport</h1>'
     '<p><a href="./prototype/" style="font-size:1.4rem">进入原型 →</a></p>'
     +('<p>含原作音效演示。</p>' if a.with_audio else '<p style="opacity:.7">本站为静音演示；原作音效请自备（见仓库 README）。</p>')
     +'<p style="opacity:.5">非官方粉丝项目；《塞尔达传说》相关权利归 Nintendo 所有。</p></div>',
     encoding='utf-8')
    total=sum(os.path.getsize(os.path.join(dp,fn)) for dp,_,fns in os.walk(out) for fn in fns)
    count=sum(len(fns) for _,_,fns in os.walk(out))
    print(f'site: {count} files / {total/1048576:.1f}MB  font subset: {size/1048576:.2f}MB  audio: {"on" if a.with_audio else "off"}')
if __name__=='__main__':main()
