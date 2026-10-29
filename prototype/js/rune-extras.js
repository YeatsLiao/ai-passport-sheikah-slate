/* Remaining six prototypes. Existing game backgrounds and referenced bitmap props.
   Camera previews are session-only: no album writes or persistence. */
const EXTRA_RUNE_GAMES = new Set(['bomb_cube','cryonis','camera','cycle','amiibo','sensor']);
const SINGLE_KEY_RUNES=new Set(['cryonis','cycle','amiibo','sensor']);
const CYCLE_CONTACT={height:22,wheelY:13,wheelRadius:8,axle:18,rockSize:20,rockGround:9,rockRadius:7};
const ICE_SURFACES={shore:112,pillar:80,footOffset:17};
const easeRune=t=>{t=gameClamp(t,0,1);return t*t*(3-2*t);};
function cycleJump(e) {e.jumpBuffer=.14;}

const ICE_SITES=[88,120,152,184,216];
const CYCLE_GAPS=[[350,402],[745,797]];
const EXTRA_FIGURES=[
  {cn:'林克（弓）',en:'Link (Archer)',img:'inventory/bg.png',item:'soldiers_broadsword'},
  {cn:'林克（骑乘）',en:'Link (Rider)',img:'inventory/bg.png',item:'wooden_shield'},
  {cn:'波克布林',en:'Bokoblin',img:'cut_bokoblin.png',item:'dragonbone_boko_club'}
];
function initExtra(g) {
  if(g.extra) return g.extra;
  return g.extra={cursor:g.id==='cryonis'?ICE_SITES[0]:90,ice:[],walker:34,leg:0,legTime:0,pan:110,zoom:1,seen:[],preview:null,focus:0,focusTarget:-1,
    speed:0,fuel:100,brake:0,rideX:30,rideY:cycleFloor(30)-CYCLE_CONTACT.height,rideVY:0,grounded:true,jumpBuffer:0,airTime:0,canCoyote:false,
    animTime:0,iceBirth:{},walkerFoot:ICE_SURFACES.shore,walkerScale:1,discoverTime:0,dropV:0,playerFrom:48,playerX:48,figure:0,selectClock:0,scanTime:0,dropY:48,reward:null,
    iceSite:0,routeChoice:1,routeTravel:0,routeFrom:null,routeTo:null,px:30,py:195,heading:-Math.PI/2,walking:false,target:0,tone:0,signal:0,
    cubeX:46,cubeY:132,cubePlaced:false,onPlatform:false,platform:56,gate:false};
}
function singleRunePress(g,dir) {
  const e=initExtra(g);
  if(g.paused || g.tool || ['won','lost'].includes(g.phase)) return;
  if(g.id==='cryonis' && g.phase==='ready') {e.iceSite=(e.iceSite+dir+ICE_SITES.length)%ICE_SITES.length;e.cursor=ICE_SITES[e.iceSite];}
  else if(g.id==='amiibo' && g.phase==='ready') {e.figure=(e.figure+dir+EXTRA_FIGURES.length)%EXTRA_FIGURES.length;}
  else if(g.id==='cycle' && g.phase==='riding') {
    if(dir<0) cycleJump(e);
    else if(dir>0) e.brake=1.2;
  } else if(g.id==='sensor' && !e.walking && g.phase==='ready') e.routeChoice=(e.routeChoice+dir+3)%3;
  paintExtra(g);
}
function sensorBranch(e) {
  const angle=e.heading+(e.routeChoice-1)*Math.PI/2;
  return {x:gameClamp(e.px+Math.cos(angle)*40,10,230),y:gameClamp(e.py+Math.sin(angle)*40,10,230),angle};
}
function extraMessage(g,cn,en) {g.message=L(cn,en);}
function cycleFloor(x) {return 136;}
function cycleGap(x) {return CYCLE_GAPS.some(([a,b])=>x>a&&x<b);}
function icePath(e) {return [34,...e.ice.slice().sort((a,b)=>a-b),284];}
function cameraTargets(g) {
  const e=initExtra(g);
  return CAM_TARGETS.map((t,i)=>({t,index:i,x:160+((40+i*92+Math.sin(g.time*(i===2?1.3:.4)+i)*(i===2?18:5))-e.pan)*e.zoom,y:91+Math.sin(g.time*.8+i)*10,size:25*e.zoom}));
}
function cameraRecognition(g) {
  const e=initExtra(g),rock=160+(260-e.pan*.6)*e.zoom;
  return cameraTargets(g).find(o=>{
    const inFrame=Math.abs(o.x-160)+o.size/2<=38 && Math.abs(o.y-91)+o.size/2<=30;
    const obscured=Math.abs(o.x-rock)<(43*e.zoom+o.size)/2 && Math.abs(o.y-130)<(43*e.zoom+o.size)/2;
    return inFrame && o.size>=18 && o.size<=45 && !obscured;
  });
}
function extraBusy(g) {return ['scanning','dropping','chest-settle','approaching','opening','collecting','crossing','ice-ready','ice-retreat','ice-finish','crashing','discovering'].includes(g.phase);}
function extraPrimary(g) {
  const e=initExtra(g);
  if(extraBusy(g)) return;
  if(g.id==='bomb_cube') {
    if(g.cooldown) return;
    if(!e.cubePlaced) {
      e.cubePlaced=true;e.cubeX=e.cursor;e.onPlatform=Math.abs(e.cursor-e.platform)<26;
      e.cubeY=e.onPlatform?107:132;
      extraMessage(g,e.onPlatform?'方弹已放上平台，等待运到障碍附近。':'方弹停在原地，不会滚动。',e.onPlatform?'Bomb aboard. Wait until the platform approaches the rocks.':'The cube stays where placed.');
    } else {
      g.shotX=e.cubeX;g.shotY=e.cubeY;g.flash=.5;e.cubePlaced=false;g.cooldown=2.5;
      if(Math.hypot(e.cubeX-264,e.cubeY-87)<32) {g.phase='won';extraMessage(g,'障碍炸开，平台通路恢复！','Obstacle cleared. The platform route is open!');}
      else extraMessage(g,'没有炸到障碍。冷却后可重新选择放置位置。','Missed. Choose a new placement after cooldown.');
    }
  } else if(g.id==='cryonis') {
    if(g.phase!=='ready') return;
    const found=e.ice.findIndex(x=>Math.abs(x-e.cursor)<17);
    if(found>=0) {e.ice.splice(found,1);extraMessage(g,'冰柱已碎裂，可以重新选点。','Pillar shattered. Choose another spot.');}
    else {
      if(e.ice.length===3) e.ice.shift();e.ice.push(e.cursor);e.iceBirth[e.cursor]=g.time;
      extraMessage(g,'冰柱升起。靠近旧冰柱可碎冰，第四根会替换最早的一根。','Pillar raised. Target an existing pillar to shatter it. A fourth replaces the oldest.');
    }
    e.gate=e.ice.some(x=>Math.abs(x-214)<18);
    if(e.ice.length===3) {g.phase='ice-ready';e.animTime=0;e.walker=34;e.walkerFoot=ICE_SURFACES.shore;e.leg=0;e.legTime=0;extraMessage(g,'等待冰柱升稳，再开始通过。','Let the ice settle before crossing.');}
  } else if(g.id==='camera') {
    const candidate=cameraRecognition(g);
    const target=e.focus>=.7?candidate:null;
    e.preview={img:target?target.t.big||target.t.img:null,name:target?L(target.t.cn,target.t.name):L('未识别目标','Unidentified subject'),recognized:Boolean(target),index:target?.index};
    if(target && !e.seen.includes(target.index)) e.seen.push(target.index);
    g.phase='preview';g.tool=true;render();return;
  } else if(g.id==='cycle') {
    if(g.phase==='ready') {g.phase='riding';e.speed=82;extraMessage(g,'自动前进，遇到沟或岩石按 OK 跳过。','Auto-riding. Press OK to jump over gaps and rocks.');}
    else cycleJump(e);
  } else if(g.id==='amiibo') {
    if(g.phase==='ready') {
      e.cursor=190;g.phase='scanning';e.scanTime=0;e.animTime=0;
      extraMessage(g,'正在读取，补给将自动落下。','Scanning. Supplies will drop automatically.');
    } else if(g.phase==='chest') {
      g.phase='approaching';e.animTime=0;e.playerFrom=e.playerX;extraMessage(g,'正在靠近宝箱…','Approaching the chest…');}
    else if(g.phase==='reward') {
      const item=EXTRA_FIGURES[e.figure].item;
      state.inventory.rewards ||= {};state.inventory.rewards[item]=(state.inventory.rewards[item]||0)+1;
      g.phase='collecting';e.animTime=0;extraMessage(g,'正在收取奖励…','Collecting the reward…');
    } else if(g.phase==='claimed') {g.phase='ready';e.scanTime=0;}
  } else if(g.id==='sensor') {
    if(e.walking || g.phase!=='ready') return;
    const branch=sensorBranch(e);
    if(Math.hypot(branch.x-e.px,branch.y-e.py)<1) {extraMessage(g,'这边走不通，换一条路。','This path is blocked. Choose another.');return;}
    e.routeFrom={x:e.px,y:e.py};e.routeTo=branch;e.routeTravel=0;e.walking=true;
    extraMessage(g,'沿选定方向前进，留意信号是否增强。','Following the chosen path. Listen for a stronger signal.');
  }
  beep('ok');paintExtra(g);
}
function extraAction(g,action) {
  if(action==='sensor-map' && g.id==='sensor' && g.phase==='won' && !initExtra(g).target) {showSensorMap();return true;}
  const e=initExtra(g);
  if(action==='ice-cross' && g.id==='cryonis') {
    g.paused=false;g.tool=false;g.phase='ice-ready';e.animTime=0;e.walker=34;e.walkerFoot=ICE_SURFACES.shore;e.walkerScale=1;e.leg=0;e.legTime=0;
    extraMessage(g,'正在尝试通过，冰柱位置与闸门都要合适。','Trying the route. Pillar spacing and the gate both matter.');render();return true;
  }
  if(action==='camera-tools' && g.id==='camera') {g.paused=false;g.tool=true;render();return true;}
  if(action.startsWith('zoom-') && g.id==='camera') {e.zoom=Number(action.slice(5));g.tool=false;render();return true;}
  if(action==='camera-back' && g.id==='camera') {e.preview=null;g.phase='ready';g.tool=false;render();return true;}
  if(action==='refuel' && g.id==='cycle' && g.paused) {e.fuel=Math.min(100,e.fuel+35);extraMessage(g,'投入材料，燃料已补充。','Materials added. Fuel replenished.');render();return true;}
  if(action==='sensor-target' && g.id==='sensor') {
    const known=initExtra(getRuneGame('camera')).seen.includes(0);
    if(!known) return true;
    e.target=e.target?0:1;e.walking=false;g.phase='ready';g.paused=false;render();return true;
  }
  return false;
}
function stepExtra(g,dt) {
  const e=initExtra(g),dir=runeGameDirection;
  if(g.id==='bomb_cube') {
    e.platform=160+Math.sin(g.time*.8)*104;
    if(!e.cubePlaced) e.cursor=gameClamp(e.cursor+dir*70*dt,35,280);
    else if(e.onPlatform) {e.cubeX=e.platform;e.cubeY=107;}
  } else if(g.id==='cryonis') {
    if(g.phase==='ice-ready') {e.animTime+=dt;if(e.animTime>=.55)g.phase='crossing';}
    else if(g.phase==='ice-retreat') {
      e.animTime+=dt;e.walkerScale=1;
      e.walker=e.safeX+Math.sin(Math.min(1,e.animTime/.55)*Math.PI)*-5;
      e.walkerFoot=e.safeFoot-Math.sin(Math.min(1,e.animTime/.55)*Math.PI)*5;
      if(e.animTime>=.55) {e.walker=e.safeX;e.walkerFoot=e.safeFoot;g.phase='lost';}
    } else if(g.phase==='ice-finish') {e.animTime+=dt;if(e.animTime>.35){g.phase='won';extraMessage(g,'冰柱通路通过了！','Ice crossing complete!');}}
    else if(g.phase==='crossing') {
      const path=icePath(e),from=path[e.leg],to=path[e.leg+1];
      if(to===undefined) {g.phase='ice-finish';e.animTime=0;return;}
      const fromFoot=e.leg===0?ICE_SURFACES.shore:ICE_SURFACES.pillar;
      const toFoot=e.leg===path.length-2?ICE_SURFACES.shore:ICE_SURFACES.pillar;
      if(to-from>74 || (!e.gate && from<205 && to>205)) {
        e.safeX=from;e.safeFoot=fromFoot;e.animTime=0;g.phase='ice-retreat';
        extraMessage(g,to-from>74?'下一处太远，林克退回安全落脚点。':'闸门未打开，林克退回安全落脚点。',to-from>74?'Next foothold is too far. Link retreats safely.':'Gate closed. Link retreats safely.');return;
      }
      e.legTime+=dt;
      const u=gameClamp((e.legTime-.14)/.58,0,1);
      e.walker=from+(to-from)*u;
      e.walkerFoot=fromFoot+(toFoot-fromFoot)*easeRune(u)-Math.sin(Math.PI*u)*24;
      e.walkerScale=e.legTime<.14?1-.12*Math.sin(Math.PI*e.legTime/.14):e.legTime>.72?1-.1*Math.sin(Math.PI*(e.legTime-.72)/.14):1;
      if(e.legTime>=.86) {e.walker=to;e.walkerFoot=toFoot;e.walkerScale=1;e.leg++;e.legTime=0;}
    }
  } else if(g.id==='camera') {
    e.pan=gameClamp(e.pan+dir*72*dt,25,440);
    const subject=cameraRecognition(g);
    if(subject && subject.index===e.focusTarget && !dir) e.focus=Math.min(1,e.focus+dt);
    else {e.focus=0;e.focusTarget=subject?.index??-1;}
  } else if(g.id==='cycle' && g.phase==='riding') {
    e.brake=Math.max(0,e.brake-dt);e.jumpBuffer=Math.max(0,e.jumpBuffer-dt);
    e.speed+=((e.brake>0?58:82)-e.speed)*Math.min(1,dt*5);
    if(e.jumpBuffer>0 && (e.grounded || (e.canCoyote && e.airTime<.1))) {e.rideVY=-120;e.grounded=false;e.canCoyote=false;e.jumpBuffer=0;e.airTime=0;}
    e.rideX+=e.speed*dt;
    const floor=cycleFloor(e.rideX)-CYCLE_CONTACT.height;
    if(e.grounded && cycleGap(e.rideX)) {e.grounded=false;e.canCoyote=true;e.airTime=0;e.rideVY=0;}
    if(e.grounded) e.rideY=floor;
    else {e.airTime+=dt;e.rideVY+=220*dt;e.rideY+=e.rideVY*dt;if(!cycleGap(e.rideX)&&e.rideY>=floor&&e.rideVY>0){e.rideY=floor;e.grounded=true;e.canCoyote=false;e.airTime=0;e.rideVY=0;}}
    const rockY=cycleFloor(550)-CYCLE_CONTACT.rockGround;
    const wheelHit=[-CYCLE_CONTACT.axle,CYCLE_CONTACT.axle].some(offset=>Math.hypot(e.rideX+offset-550,e.rideY+CYCLE_CONTACT.wheelY-rockY)<CYCLE_CONTACT.wheelRadius+CYCLE_CONTACT.rockRadius-2);
    if(e.rideY>166 || wheelHit) {g.phase='crashing';e.animTime=0;e.rideVY=-28;extraMessage(g,wheelHit?'轮子碰到了石头。下次提前一点起跳。':'掉进沟里了。下次在沟边起跳。',wheelHit?'A wheel hit the rock. Jump a little earlier.':'Fell into the gap. Jump near its edge.');}
    else if(e.rideX>=1100 && e.grounded) {g.phase='won';extraMessage(g,'越过岩石与沟壑，骑行完成！','Rocks and gaps cleared. Ride complete!');}
  } else if(g.id==='cycle' && g.phase==='crashing') {
    e.animTime+=dt;e.speed*=Math.exp(-5*dt);e.rideX+=e.speed*dt;e.rideVY+=160*dt;e.rideY=Math.min(cycleGap(e.rideX)?185:cycleFloor(e.rideX)-CYCLE_CONTACT.height,e.rideY+e.rideVY*dt);
    if(e.animTime>.65) g.phase='lost';
  } else if(g.id==='amiibo') {
    if(g.phase==='scanning') {e.scanTime+=dt;if(e.scanTime>1.2) {g.phase='dropping';e.dropY=42;e.dropV=0;extraMessage(g,'补给正在落下…','Supplies incoming…');}}
    else if(g.phase==='dropping') {e.dropV+=260*dt;e.dropY+=e.dropV*dt;if(e.dropY>=111){e.dropY=111;g.phase='chest-settle';e.animTime=0;beep('ok');}}
    else if(g.phase==='chest-settle') {e.animTime+=dt;e.dropY=111-Math.sin(Math.PI*Math.min(1,e.animTime/.28))*3;if(e.animTime>=.28){e.dropY=111;g.phase='chest';extraMessage(g,'宝箱已落稳，按 OK 靠近打开。','Chest settled. Press OK to approach and open it.');}}
    else if(g.phase==='approaching') {e.animTime+=dt;const u=easeRune(e.animTime/.65);e.playerX=e.playerFrom+(e.cursor-44-e.playerFrom)*u;if(e.animTime>=.65){g.phase='opening';e.animTime=0;extraMessage(g,'正在打开宝箱…','Opening the chest…');}}
    else if(g.phase==='opening') {e.animTime+=dt;if(e.animTime>=.8){g.phase='reward';e.animTime=0;extraMessage(g,'获得装备，按 OK 收取。','Equipment revealed. Press OK to collect.');}}
    else if(g.phase==='reward') e.animTime=Math.min(1,e.animTime+dt);
    else if(g.phase==='collecting') {e.animTime+=dt;if(e.animTime>=.55){g.phase='claimed';extraMessage(g,'奖励已收入背包。','Reward added to your inventory.');}}
  } else if(g.id==='sensor') {
    if(g.phase==='discovering') {e.discoverTime+=dt;if(e.discoverTime>=3.2){g.phase='won';if(!e.target)discoverSensorShrine();extraMessage(g,e.target?'蓝夜光草已发现！':'神庙已发现，按 OK 在地图查看。',e.target?'Blue nightshade discovered!':'Shrine discovered. Press OK to view it on the map.');}return;}
    if(e.walking && e.routeTo) {
      e.routeTravel=Math.min(1,e.routeTravel+dt/1.0);
      e.px=e.routeFrom.x+(e.routeTo.x-e.routeFrom.x)*e.routeTravel;
      e.py=e.routeFrom.y+(e.routeTo.y-e.routeFrom.y)*e.routeTravel;
      if(e.routeTravel===1) {e.heading=e.routeTo.angle;e.walking=false;e.routeChoice=1;extraMessage(g,'到达岔口。选路比较信号，再按 OK 前进。','At a fork. Compare paths, then press OK.');}
    }
    const [tx,ty]=e.target?[90,50]:[190,40],dx=tx-e.px,dy=ty-e.py,dist=Math.hypot(dx,dy);
    const branch=e.walking?e.routeTo:sensorBranch(e);
    const nextDist=Math.hypot(tx-branch.x,ty-branch.y);
    const alignment=nextDist<dist?1:.25;
    e.signal=Math.round(gameClamp((1-dist/300)*alignment*4,0,4));
    e.tone+=dt;if(e.signal && e.tone>1.65-e.signal*.3) {e.tone=0;beep('move');}
    if(dist<15) {e.walking=false;g.phase='discovering';e.discoverTime=0;extraMessage(g,'发现目标，正在展开…','Target found. Revealing…');}
  }
}
function extraDialog(g) {
  const e=initExtra(g),button=(action,cn,en,start='')=>`<button class="chip" data-focus ${start} data-action="game:${action}">${L(cn,en)}</button>`;
  if(g.id==='camera' && g.tool) {
    if(e.preview) return `<div class="game-pause extra-photo" role="dialog" aria-modal="true" aria-label="${L('临时预览','Temporary preview')}"><div class="game-pause-card"><h2>${e.preview.name}</h2>${e.preview.img?`<span class="preview-subject" role="img" aria-label="${e.preview.name}" style="${runeSpriteStyle(8+e.preview.index,90)}"></span>`:'<p>'+L('未识别到清晰目标，调整取景后再拍。','No clear subject. Adjust the view and retry.')+'</p>'}<p>${L('临时预览 · 相册功能留待后续讨论','Temporary preview · album deferred')}</p>${button('camera-back','返回取景','BACK TO CAMERA','data-start')}</div></div>`;
    return `<div class="game-pause" role="dialog" aria-modal="true" aria-label="${L('相机设置','Camera settings')}"><div class="game-pause-card"><h2>${L('缩放','ZOOM')}</h2>${[.75,1,1.5].map((z,i)=>button('zoom-'+z,z+'×',z+'×',i===1?'data-start':'')).join('')}${button('camera-back','返回取景','BACK')}</div></div>`;
  }
  if(!g.paused) return '';
  const extra=g.id==='camera'?button('camera-tools','调整缩放','ADJUST ZOOM'):g.id==='sensor' && initExtra(getRuneGame('camera')).seen.includes(0)?button('sensor-target','切换追踪目标','SWITCH TARGET'):'';
  return `<div class="game-pause" role="dialog" aria-modal="true" aria-label="${L('暂停','Paused')}"><div class="game-pause-card"><h2>${L('已暂停','PAUSED')}</h2>${button('resume','继续','RESUME','data-start')}${extra}${button('retry','重新开始','RESTART')}${button('exit','返回符文','RUNES')}</div></div>`;
}
function extraArt(g) {
  const e=initExtra(g),sprite=(id,cell,cls='')=>`<span id="${id}" class="ability-sprite extra-prop ${cls}" style="background-position:${cell%4*100/3}% ${Math.floor(cell/4)*100/3}%"></span>`;
  if(g.id==='bomb_cube') return '<div id="cubePlatform" class="cube-platform"></div><div id="cubeAim" class="aim hot"></div>'+sprite('cubeBomb',1)+sprite('cubeObstacle',3)+sprite('cubeBlast',7);
  if(g.id==='cryonis') return '<div class="ice-sites">'+ICE_SITES.map((x,i)=>'<span id="iceSite'+i+'" style="left:'+(x-5)+'px">'+(i+1)+'</span>').join('')+'</div><div class="ice-water"></div><div class="ice-shore left"></div><div class="ice-shore right"></div>'+[0,1,2].map(i=>sprite('icePillar'+i,4,'ice-pillar')).join('')+'<div id="iceAim" class="aim hot"></div><div id="iceGate" class="ice-gate"></div><span id="iceWalker" class="extra-link"></span>';
  if(g.id==='camera') return '<div class="extra-viewfinder"></div><div id="cameraLock" class="camera-lock"></div>'+CAM_TARGETS.map((t,i)=>'<span id="cameraSubject'+i+'" class="camera-subject"></span>').join('')+sprite('cameraRock',3)+'<div class="camera-reticle">＋</div><div class="camera-focus-meter"><i id="cameraFocus"></i></div>';
  if(g.id==='cycle') return '<div id="cycleTerrain">'+Array.from({length:3},(_,i)=>'<div id="terrain'+i+'" class="cycle-terrain"></div>').join('')+'</div>'+sprite('cycleBike',5,'cycle-player')+sprite('cycleRock',3)+'<span id="cycleCue" class="cycle-cue"></span><span id="cycleProgress" class="cycle-progress"></span><span class="cycle-finish" id="cycleFinish"></span>';
  if(g.id==='amiibo') return '<span id="amiiboFigure" class="amiibo-figure-art"></span><div id="amiiboAim" class="aim hot"></div><div id="amiiboBeam" class="amiibo-scan-beam"></div>'+'<span id="amiiboShadow" class="amiibo-shadow"></span>'+sprite('amiiboChest',6)+sprite('amiiboChestOpen',7)+sprite('amiiboObstacle',3)+[0,1,2].map(i=>'<span id="amiiboFood'+i+'" class="amiibo-food"></span>').join('')+'<img id="amiiboReward" class="amiibo-reward-art" alt=""><span id="amiiboName" class="extra-caption"></span>';
  return '<div class="sensor-explore"><span id="sensorTemple" class="sensor-temple"></span><div id="sensorBearing" class="sensor-bearing"></div><div class="sensor-paths"><span id="sensorPath0"></span><span id="sensorPath1"></span><span id="sensorPath2"></span></div></div><div id="sensorSignal" class="sensor-signal"></div><div id="sensorReveal" class="sensor-reveal"><div id="sensorRevealRing"></div><strong id="sensorRevealTitle"></strong></div><span id="sensorTarget" class="extra-caption"></span>';
}
function viewAdditionalRuneGame(id) {
  const g=getRuneGame(id),e=initExtra(g),r=RUNE_BY_ID[id];
  if(g.language!==state.lang) {g.language=state.lang;g.message='';}
  const titles={bomb_cube:['平台爆破','PLATFORM DEMOLITION'],cryonis:['水上通路','ICE CROSSING'],camera:['野外摄影','FIELD PHOTOGRAPHY'],cycle:['原野骑行','CROSS-COUNTRY RIDE'],amiibo:['召唤补给','SUMMON SUPPLIES'],sensor:['探索寻踪','FOLLOW THE SIGNAL']};
  const goals={bomb_cube:['用平台运送方弹，在岩石旁引爆','Carry the cube bomb on the platform'],cryonis:['五个落点，选三处造冰搭通路','Pick three of five sites to build a path'],camera:['平移取景，清晰识别后拍摄','Pan and frame a clear subject'],cycle:['自动骑行，看准时机按 OK 跳跃','Auto-ride. Time your OK jumps'],amiibo:['选角色、读取、开箱，全程单键确认','Select, scan and open with single presses'],sensor:['选一条信号更强的路，自动前进','Choose the stronger signal and follow the path']};
  const background=r.scene||'rune_scene_'+(id==='bomb_cube'?'bomb':id)+'.png';
  const secondary=id==='camera'?'<button class="chip" data-focus data-action="game:camera-tools">'+L('缩放','ZOOM')+'</button>':'';
  return topbar('runes')+`<div class="body scene-body rune-game extra-game" data-game="${id}"><div class="scene" style="${runeSceneStyle(id)}"></div><div class="scene-shade"></div>${sceneTop(r,'')}<div class="game-goal"><b>${L(...titles[id])}</b><span>${L(...goals[id])}</span></div><div class="extra-arena">${extraArt(g)}</div><div id="extraMessage" class="game-message"></div><div class="game-controls"><button class="chip" data-focus data-action="game:primary" id="extraPrimary"></button>${secondary}<button class="chip" data-focus data-action="game:pause">${L('暂停','PAUSE')}</button></div></div>`+footer('<span id="extraHint"></span>',L('长按 OK 暂停','HOLD OK PAUSE'))+extraDialog(g);
}
function paintExtra(g) {
  const e=initExtra(g),el=id=>document.getElementById(id);
  if(!el('extraPrimary')) return;
  const place=(id,x,y,w=30,h=w)=>{const n=el(id);if(!n)return;n.style.left=(x-w/2)+'px';n.style.top=(y-h/2)+'px';n.style.width=w+'px';n.style.height=h+'px';};
  const visible=(id,show)=>{const n=el(id);if(n)n.hidden=!show;};
  const txt=(id,value)=>{if(el(id))gameText(el(id),value);};
  let status='',primary='',hint='',fallback='';
  const done=['won','lost'].includes(g.phase);
  if(g.id==='bomb_cube') {
    place('cubePlatform',e.platform,125,52,16);setRuneSprite(el('cubePlatform'),2,52,16);place('cubeAim',e.cursor,121,25,25);place('cubeBomb',e.cubeX,e.cubeY,29);place('cubeObstacle',264,87,45);setRuneSprite(el('cubeBomb'),1,29);setRuneSprite(el('cubeObstacle'),3,45);
    visible('cubeBomb',e.cubePlaced);visible('cubeAim',!e.cubePlaced);el('cubeObstacle').style.opacity=g.phase==='won'?.15:1;
    place('cubeBlast',g.shotX,g.shotY,75);visible('cubeBlast',g.flash>0);el('cubeBlast').style.opacity=Math.min(1,g.flash*3);
    paintRuneBlast(el('cubeBlast'),g.flash,75);
    status=g.cooldown?L(`冷却 ${g.cooldown.toFixed(1)} 秒`,`COOLDOWN ${g.cooldown.toFixed(1)}s`):L('平台连续运行','PLATFORM MOVING');primary=e.cubePlaced?L('引爆','DETONATE'):L('放置方弹','PLACE CUBE');hint=L('▲▼ 选落点 · OK 放置 / 引爆','▲▼ position · OK place / detonate');fallback=L('把光标移到平台上，在合适时机放置。','Aim at the moving platform and place at the right moment.');
  } else if(g.id==='cryonis') {
    e.ice.forEach((x,i)=>{
      place('icePillar'+i,x,112,55,66);setRuneSprite(el('icePillar'+i),4,55,66);
      const rise=easeRune((g.time-(e.iceBirth[x]??-1))/.45);
      el('icePillar'+i).style.transform=`scaleY(${Math.max(.02,rise)})`;el('icePillar'+i).style.transformOrigin='50% 100%';
    });[0,1,2].forEach(i=>visible('icePillar'+i,i<e.ice.length));place('iceAim',e.cursor,110,25,25);
    const actorHeight=38*(e.walkerScale||1);
    // Sprite foot is 95% down its cell, not the bottom of its bounding element.
    place('iceWalker',e.walker,e.walkerFoot-.45*actorHeight,38,actorHeight);setRuneSprite(el('iceWalker'),14,38,actorHeight);
    el('iceGate').style.transform=e.gate?'translateY(-112px)':'';
    document.querySelectorAll('.ice-shore').forEach(n=>setRuneRegion(n,'world','shore',42,22));
    setRuneRegion(el('iceGate'),'world','gate',18,79);
    ICE_SITES.forEach((_,i)=>el('iceSite'+i).classList.toggle('selected',e.iceSite===i));
    status=L(`落点 ${e.iceSite+1} · 冰柱 ${e.ice.length}/3`, `SITE ${e.iceSite+1} · ICE ${e.ice.length}/3`);primary=e.ice.some(x=>Math.abs(x-e.cursor)<17)?L('碎冰','SHATTER'):L('造冰','CREATE');hint=L('▲▼ 选点 · OK 造冰 · 三根自动试走','▲▼ site · OK ice · auto-cross at three');fallback=L('五处落点选三处；留意落脚间距和最右侧闸门。','Choose three of five sites. Mind the gaps and the right gate.');
  } else if(g.id==='camera') {
    cameraTargets(g).forEach(o=>{place('cameraSubject'+o.index,o.x,o.y,o.size);setRuneSprite(el('cameraSubject'+o.index),8+o.index,o.size);});
    const rock=160+(260-e.pan*.6)*e.zoom;place('cameraRock',rock,130,43*e.zoom);setRuneSprite(el('cameraRock'),3,43*e.zoom);
    const recognized=cameraRecognition(g);el('cameraFocus').style.width=Math.min(100,e.focus/.7*100)+'%';visible('cameraLock',Boolean(recognized));if(recognized)place('cameraLock',recognized.x,recognized.y,recognized.size+12);
    status=L(`识别 ${e.seen.length}/5 · ${e.zoom}×`,`SEEN ${e.seen.length}/5 · ${e.zoom}×`);primary=L('快门','SHUTTER');hint=L('▲▼ 平移 · OK 拍摄 · 缩放见暂停菜单','▲▼ pan · OK shutter · pause menu for zoom');fallback=recognized?(e.focus>=.7?L(recognized.t.cn,recognized.t.name):L('保持取景稳定，等待对焦。','Hold the view steady to focus.')):L('目标完整入框且不被岩石遮挡时会出现识别框。','A clear, unobstructed subject receives a recognition frame.');
  } else if(g.id==='cycle') {
    const cam=Math.max(0,e.rideX-66);
    const banks=[[0,350],[402,745],[797,1550]];
    banks.forEach(([start,end],i)=>{
      const n=el('terrain'+i),left=start-cam,right=end-cam;
      n.hidden=right<0||left>320;
      n.style.left=left+'px';n.style.top=cycleFloor(start)+'px';
      n.style.width=Math.max(0,right-left)+'px';n.style.height='64px';
      n.style.transform='none';n.style.clipPath='inset(0)';
      // Use the opaque interior of the road image: its visible top is the
      // collision line, without the original sprite's transparent grass margin.
      setRuneRegion(n,'world','cycleRoad',Math.max(1,right-left),64);
    });
    const bikeFoot=24;
    place('cycleBike',e.rideX-cam,e.rideY+CYCLE_CONTACT.height-bikeFoot,62,48);setRuneSprite(el('cycleBike'),5,62,48);el('cycleBike').style.transform=`rotate(${e.grounded?Math.atan2(cycleFloor(e.rideX+8)-cycleFloor(e.rideX-8),16):g.phase==='crashing'||g.phase==='lost'?.35:-.12}rad)`;
    place('cycleRock',550-cam,cycleFloor(550)-CYCLE_CONTACT.rockGround,CYCLE_CONTACT.rockSize);setRuneSprite(el('cycleRock'),3,CYCLE_CONTACT.rockSize);place('cycleFinish',1160-cam,cycleFloor(1160)-12.5,25);
    setRuneRegion(el('cycleFinish'),'world','destination',25,25);
    const hazard=[350,550,745].find(x=>x>e.rideX-12);
    txt('cycleCue',g.phase==='riding'&&hazard-e.rideX<110&&hazard-e.rideX>28?L('准备跳跃','GET READY TO JUMP'):'');
    txt('cycleProgress',L(`路程 ${Math.min(100,Math.round(e.rideX/11))}%`,`ROUTE ${Math.min(100,Math.round(e.rideX/11))}%`));
    status=L(`自动骑行 · ${Math.round(e.speed)}`,`AUTO RIDE · ${Math.round(e.speed)}`);primary=g.phase==='ready'?L('开始骑行','START RIDING'):L('起跳','JUMP');hint=L('OK / ▲ 跳跃 · ▼ 短暂减速','OK / ▲ jump · ▼ briefly slow down');fallback=L('自动前进，只用 OK 看准沟边和岩石起跳。','Auto-riding. Time a single OK press before gaps and rocks.');
  } else if(g.id==='amiibo') {
    const figure=EXTRA_FIGURES[e.figure],item=INV_BY_ID[figure.item];
    setRuneSprite(el('amiiboFigure'),14,52,68);
    const walking=g.phase==='approaching',walkBob=walking?Math.sin(e.animTime/.65*Math.PI*4)*.7:0;
    place('amiiboFigure',e.playerX,111+walkBob,52,68);visible('amiiboFigure',true);
    const rewardStage=['opening','reward','collecting','claimed'].includes(g.phase);
    txt('amiiboName',g.phase==='ready'?L(figure.cn,figure.en):item?invName(item):'');
    visible('amiiboName',g.phase==='ready'||['reward','claimed'].includes(g.phase));
    el('amiiboName').style.left=g.phase==='ready'?'12px':'222px';el('amiiboName').style.top=g.phase==='ready'?'50px':'103px';
    visible('amiiboAim',false);visible('amiiboObstacle',false);
    place('amiiboBeam',e.cursor,91,28,76);visible('amiiboBeam',g.phase==='scanning'||g.phase==='dropping');
    setRuneRegion(el('amiiboBeam'),'fx','beam',28,76);
    const opening=g.phase==='opening'?easeRune((e.animTime-.12)/.55):rewardStage?1:0;
    const landed=['chest-settle','chest','approaching','opening','reward','collecting','claimed'].includes(g.phase);
    place('amiiboShadow',e.cursor,144,44,6);visible('amiiboShadow',g.phase==='dropping'||landed);el('amiiboShadow').style.opacity=String(gameClamp((e.dropY-42)/69,0,1)*.65);
    setRuneRegion(el('amiiboShadow'),'fx','shadow',44,6);
    place('amiiboChest',e.cursor,e.dropY,67);setRuneSprite(el('amiiboChest'),6,67);visible('amiiboChest',g.phase==='dropping'||landed);el('amiiboChest').style.opacity=String(1-opening);
    place('amiiboChestOpen',e.cursor,e.dropY-2.5,67);setRuneSprite(el('amiiboChestOpen'),7,67);visible('amiiboChestOpen',rewardStage);el('amiiboChestOpen').style.opacity=String(opening);el('amiiboChestOpen').style.filter=`drop-shadow(0 0 ${opening*7}px #f3d68b66)`;
    [0,1,2].forEach(i=>{place('amiiboFood'+i,e.cursor+38,e.dropY+20,26);setRuneSprite(el('amiiboFood'+i),13,26);visible('amiiboFood'+i,i===0 && (g.phase==='dropping'||landed) && !['collecting','claimed'].includes(g.phase));});
    if(item && el('amiiboReward').getAttribute('src')!==IMG(item.img))el('amiiboReward').src=IMG(item.img);
    const reveal=g.phase==='opening'?easeRune((e.animTime-.35)/.45):1,collect=g.phase==='collecting'?easeRune(e.animTime/.55):0;
    const rewardX=(e.cursor+(246-e.cursor)*reveal)*(1-collect)+300*collect;
    const rewardY=(e.dropY-8+(82-(e.dropY-8))*reveal)*(1-collect)+24*collect;
    place('amiiboReward',rewardX,rewardY,22*(1-collect*.65));visible('amiiboReward',rewardStage&&g.phase!=='claimed');el('amiiboReward').style.opacity=String(reveal*(1-collect));
    status=L('模拟读取','SIMULATED SCAN');primary=L(...({ready:['读取','SCAN'],placement:['读取','SCAN'],scanning:['读取中…','SCANNING…'],dropping:['补给落下','DROPPING'],'chest-settle':['落地中…','SETTLING…'],chest:['靠近开箱','OPEN CHEST'],approaching:['走近中…','APPROACHING…'],opening:['开箱中…','OPENING…'],collecting:['收取中…','COLLECTING…'],reward:['收取','COLLECT'],claimed:['再次体验','AGAIN']}[g.phase]||['继续','CONTINUE']));hint=g.phase==='ready'?L('▲▼ 选角色 · OK 读取','▲▼ character · OK scan'):g.phase==='chest'?L('OK 走近并打开宝箱','OK approach and open chest'):g.phase==='reward'?L('OK 收取奖励','OK collect reward'):g.phase==='claimed'?L('OK 再次体验','OK try again'):L('动画播放中 · 长按 OK 暂停','Animation playing · hold OK to pause');fallback=L('选好角色后按 OK，其余移动自动完成。','Choose a character and press OK. Movement is automatic.');
  } else if(g.id==='sensor') {
    const [tx,ty]=e.target?[90,50]:[190,40],dist=Math.hypot(tx-e.px,ty-e.py);
    const bearing=Math.atan2(ty-e.py,tx-e.px),offset=bearing-e.heading;
    const facing=Math.cos(offset),revealing=g.phase==='discovering'||g.phase==='won',found=g.phase==='won';
    const revealProgress=revealing?easeRune(e.discoverTime/3.2):0;
    const size=found?132:gameClamp(154-dist*.35,64,128);
    place('sensorTemple',found?168:160+Math.sin(offset)*112,110,size);
    setRuneSprite(el('sensorTemple'),e.target?8:15,size);
    el('sensorTemple').style.opacity=found?'1':String(gameClamp((1-dist/290)*Math.max(.15,facing),.18,.95));
    visible('sensorTemple',Boolean(e.target) && (found||facing>-.12));
    const scene=document.querySelector('.extra-game .scene');
    if(scene && !e.target) {
      const approach=found?1:gameClamp(1-dist/250,0,1);
      scene.style.transform=`scale(${1+approach*.16+revealProgress*.18})`;scene.style.transformOrigin='50% 62%';
      scene.style.filter=`saturate(${.7+approach*.3+revealProgress*.15}) brightness(${.65+approach*.35+revealProgress*.12})`;
    }
    document.querySelector('.sensor-paths').hidden=revealing;visible('sensorBearing',!revealing);visible('sensorSignal',!revealing);visible('sensorTarget',!revealing);
    visible('sensorReveal',revealing);
    txt('sensorRevealTitle',e.target?L('蓝夜光草已发现','BLUE NIGHTSHADE FOUND'):L('神庙已发现','SHRINE DISCOVERED'));
    el('sensorRevealTitle').style.opacity=String(easeRune((e.discoverTime-.7)/.8));
    el('sensorRevealTitle').style.transform=`translateY(${(1-easeRune((e.discoverTime-.7)/.8))*5}px)`;
    el('sensorRevealRing').style.transform=`scale(${.6+revealProgress*1.3})`;el('sensorRevealRing').style.opacity=String(Math.sin(Math.PI*Math.min(1,e.discoverTime/3.2))*.7);
    setRuneRegion(el('sensorRevealRing'),'fx','reveal',96,70);
    txt('sensorBearing',e.walking?L('正在沿路前进…','FOLLOWING THE PATH…'):L('比较三条路的信号','COMPARE THE THREE PATHS'));
    [0,1,2].forEach(i=>{txt('sensorPath'+i,L(['左路','直行','右路'][i],['LEFT','AHEAD','RIGHT'][i]));el('sensorPath'+i).classList.toggle('selected',e.routeChoice===i);});
    txt('sensorSignal','▮'.repeat(e.signal)+'▯'.repeat(4-e.signal));
    txt('sensorTarget',e.target?L('追踪：蓝夜光草','TRACKING: BLUE NIGHTSHADE'):L('追踪：未发现的神庙','TRACKING: SHRINE'));
    status=revealing?L(found?'发现完成':'神庙显现中',found?'DISCOVERED':'REVEALING'):L('岔路寻踪','FOLLOW THE SIGNAL');primary=e.walking?L('前进中…','WALKING…'):L('走这条路','TAKE THIS PATH');hint=L('▲▼ 选路 · OK 自动前进一段','▲▼ path · OK walk to the next fork');fallback=L('选路时听信号，声音更密、信号更强的路更接近目标。','Compare signals. Faster chimes and stronger bars point closer to the target.');
  }
  if(done) {status=g.phase==='won'?L('完成','COMPLETE'):L('再试一次','TRY AGAIN');primary=g.id==='cryonis' && g.phase==='lost'?L('调整冰柱','ADJUST PILLARS'):L('重新开始','RESTART');}
  if(g.id==='sensor' && g.phase==='won' && !e.target) {primary=L('在地图查看','VIEW ON MAP');hint=L('OK 查看神庙地图 · 长按 OK 菜单','OK view shrine map · hold OK menu');}
  gameText(document.querySelector('.extra-game .scene-stat'),status);txt('extraPrimary',primary);txt('extraHint',hint);txt('extraMessage',g.message||fallback);
  if(extraBusy(g)) {
    if(g.id==='cryonis') primary=L(g.phase==='ice-retreat'?'退回中…':'通行中…',g.phase==='ice-retreat'?'RETREATING…':'CROSSING…');
    if(g.id==='sensor') primary=L('神庙展开中…','REVEALING…');
    if(g.id==='cycle') primary=L('落地中…','SETTLING…');
    txt('extraPrimary',primary);
  }
  el('extraPrimary').disabled=!done && (g.cooldown>0||extraBusy(g)||(g.id==='sensor' && e.walking));
}
