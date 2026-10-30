/* Exact WAV bytes imported from the Switch BotW Sounds Resource archive.
   Per-file source paths and hashes: assets/audio/prototype/botw/manifest.json. */
const SFX_FILES={...BOTW_SFX_FILES,complete:'Sys_Challenge_Complete-audible.wav'};
const sfxCache=new Map(),activeSfx=new Set(),sfxLast=new Map();
function stopSfxKind(kind){for(const a of activeSfx)if(a.dataset.sound===kind){a.pause();activeSfx.delete(a);}}
function stopSfx(){for(const a of activeSfx)a.pause();activeSfx.clear();}
function beep(kind){
  if(!state.settings.sfx||!state.settings.volume)return;
  const name=kind==='move'&&routeParts()[0]!=='inventory'?'cursor':kind;
  const file=SFX_FILES[name];if(!file)return; // No invented substitute for missing rune SFX.
  const now=performance.now(),cooldown=['move','cursor','zoom'].includes(name)?85:35;
  if(now-(sfxLast.get(name)??-Infinity)<cooldown)return;sfxLast.set(name,now);
  if(!sfxCache.has(file)){const a=new Audio('../assets/audio/prototype/botw/'+file);a.preload='auto';sfxCache.set(file,a);}
  if(['move','cursor','zoom','sensor'].includes(name))for(const a of activeSfx)if(a.dataset.sound===name){a.pause();activeSfx.delete(a);}
  while(activeSfx.size>=6){const a=activeSfx.values().next().value;a.pause();activeSfx.delete(a);}
  const node=sfxCache.get(file).cloneNode();node.dataset.sound=name;node.loop=name==='magnet_move';
  node.volume=Math.min(1,state.settings.volume/5*(['move','cursor'].includes(name)?.3:name==='boom'?.4:.6));
  activeSfx.add(node);const done=()=>activeSfx.delete(node);
  node.addEventListener('ended',done,{once:true});node.addEventListener('error',done,{once:true});
  const promise=node.play();if(promise?.catch)promise.catch(done);
}
function runeSoundFeedback(g){
  const e=g.extra,previous=g.soundState;
  const current={phase:g.phase,blast:g.flash>0,ice:e?.ice.length||0,focus:e?.focus>=.7,target:e?.focusTarget,hits:g.hits||0,moving:g.id==='magnet'&&g.held&&!g.paused&&!g.tool&&(g.lifting||runeGameDirection!==0),warning:g.id==='stasis'&&g.phase==='frozen'&&g.freeze<=1.683&&!g.paused&&!g.tool};
  g.soundState=current;if(!previous)return;
  if(current.warning&&!previous.warning)beep('stasis_timer');
  if(previous.warning&&!current.warning)stopSfxKind('stasis_timer');
  if(current.blast&&!previous.blast)beep('boom');
  if(current.ice>previous.ice)beep('cryonis');
  if(current.focus&&!previous.focus)beep('detect');
  if(current.hits>previous.hits)beep(current.hits===6?'stasis_hit_end':'stasis_hit');
  if(current.moving&&!previous.moving)beep('magnet_move');
  if(!current.moving&&previous.moving){stopSfxKind('magnet_move');if(g.held)beep('magnet_stop');}
  if(current.phase===previous.phase)return;
  if(g.id==='magnet'){
    if(current.phase==='carry')beep('magnet_catch');
    if(previous.phase==='carry'&&current.phase!=='carry')beep('magnet_release');
  }
  if(g.id==='stasis'){
    if(current.phase==='frozen')beep('stasis_start');
    if(current.phase==='flying')beep('stasis_release_'+(g.hits<=2?1:g.hits<=4?2:3));
  }
  if(g.id==='amiibo'){
    if(current.phase==='opening')beep('chest_open');
    if(current.phase==='collecting')beep('ok');
  }
  if(current.phase==='lost')beep('invalid');
  if(current.phase==='flight'&&g.id==='bomb')beep('place');
  if(current.phase==='scanning')beep('amiibo');
  if(current.phase==='preview')beep('shutter');
  // Edge-triggered completion: render/pause cannot replay the reward.
  // Camera completes a successful capture; amiibo completes after collection.
  const completed=current.phase==='won'
    || (g.id==='amiibo'&&current.phase==='claimed')
    || (g.id==='camera'&&current.phase==='preview'&&e?.preview?.recognized);
  if(g.id==='sensor'&&current.phase==='discovering')beep('found');
  if(completed){stopSfx();beep('complete');}
}
