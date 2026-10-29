"""Generate map points from archived game coordinates and bilingual text rows."""
import json
from pathlib import Path
from html.parser import HTMLParser
import yaml

ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'assets/raw/05_world/maps'

class TextRows(HTMLParser):
    def __init__(self):
        super().__init__();self.cells=[];self.text=None;self.names={}
    def handle_starttag(self,tag,attrs):
        if tag=='tr':self.cells=[]
        if tag in ('td','th'):self.text=''
    def handle_data(self,data):
        if self.text is not None:self.text+=data
    def handle_endtag(self,tag):
        if tag in ('td','th') and self.text is not None:
            self.cells.append(self.text.strip());self.text=None
        if tag=='tr' and len(self.cells)>=5:
            key,cn,_,_,en=self.cells[:5]
            if key and cn and en:self.names[key]=(cn,en)

if __name__=='__main__':
    yaml.SafeLoader.add_constructor('!u',lambda loader,node:int(loader.construct_scalar(node),0))
    source=yaml.safe_load((RAW/'locations-game-source.yml').read_text(encoding='utf-8-sig'))
    english=json.loads((RAW/'location-names-game.json').read_text(encoding='utf-8-sig'))
    parser=TextRows()
    localized=RAW/'location-names-multilingual.html'
    if localized.exists():parser.feed(localized.read_text(encoding='utf-8'))
    points=[];seen=set()
    for item in source['LocationMarker']:
        key=item.get('MessageID');icon=item.get('Icon');pos=item['Translate']
        if not icon or key not in english:continue
        identity=(key,icon,round(pos['X']),round(pos['Z']))
        if identity in seen:continue
        seen.add(identity)
        kind='shrine' if icon=='Dungeon' else 'tower' if icon=='Tower' else 'stable' if icon=='Hatago' else 'village' if icon=='Village' else 'shop' if icon.startswith('Shop') else 'landmark'
        cn,en=parser.names.get(key,('',english[key]))
        points.append(dict(id=key+'_'+str(len(points)),gameId=key,kind=kind,x=pos['X'],z=pos['Z'],cn=cn,en=en))
    points.sort(key=lambda p:(p['z'],p['x'],p['gameId']))
    output=ROOT/'prototype/js/map-data.js'
    output.write_text('/* Generated from archived game map records; see tools/gen_map_places.py. */\nconst MAP_PLACES = '+json.dumps(points,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    print(f'{len(points)} points, {sum(bool(p["cn"]) for p in points)} Chinese names; '+str(output.relative_to(ROOT)))
