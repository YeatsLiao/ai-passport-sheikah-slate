/* Three playable prototypes. Original backgrounds and existing bitmap sprites only.
   All distances and timings are prototype tuning, independent of firmware. */
const RUNE_GAMES = new Set(['bomb','magnet','stasis','bomb_cube','cryonis','camera','cycle','amiibo','sensor']);
// Shared geometry for the visible slab and both support checks.
const MAGNET_BRIDGE = {half:74, bottom:11, left:112, right:208, top:128, support:8};
function magnetContact(g) {
  const b=MAGNET_BRIDGE;
  const left=Math.max(0,Math.min(b.left,g.x+b.half)-Math.max(8,g.x-b.half));
  const right=Math.max(0,Math.min(312,g.x+b.half)-Math.max(b.right,g.x-b.half));
  return {left:left>=b.support,right:right>=b.support,both:left>=b.support && right>=b.support};
}
const runeGames = new Map();
let runeGameDirection = 0;
let runeGameRAF = 0;
let runeGameLast = 0;
let runeGameRoute = null;
const gameClamp = (v,a,b) => Math.max(a,Math.min(b,v));
function currentRuneGame() {
  const p=routeParts();
  return p[0]==='rune' && RUNE_GAMES.has(p[1]) ? p[1] : null;
}
function getRuneGame(id) {
  if(!runeGames.has(id)) runeGames.set(id, {
    id, paused:false, tool:false, lifting:false, phase:'ready', time:0, cooldown:0, message:'', flash:0, language:state.lang,
    power:50, x:id==='magnet'?82:id==='stasis'?52:36, y:id==='magnet'?117:id==='stasis'?129:120,
    vx:0, vy:0, angle:id==='stasis'?-.32:0, held:false, axis:'x', hits:0, freeze:0, pulse:0,
    roll:0, camera:0, cameraY:0, distance:0, startX:0, rollingDirection:1, cross:0, landed:0, travel:0, shotX:0, shotY:0, effort:0, hitsWall:false
  });
  return runeGames.get(id);
}
function resetRuneGame(id) { runeGames.delete(id); runeGameDirection=0; render(); }
function pauseRuneGame() {
  const id=currentRuneGame(); if(!id) return;
  const g=getRuneGame(id);
  if(g.tool){g.tool=false;g.paused=false;if(id==='camera'){const e=initExtra(g);e.preview=null;g.phase='ready';}}
  else g.paused=!g.paused;
  runeGameDirection=0;
  render(); beep('back');
}
function gameInputActive() {
  const id=currentRuneGame(); return id && !getRuneGame(id).paused && !getRuneGame(id).tool;
}
function gameSetDirection(dir) {
  const id=currentRuneGame();
  if(id && SINGLE_KEY_RUNES.has(id)) {runeGameDirection=0;if(dir) singleRunePress(getRuneGame(id),dir);return;}
  runeGameDirection=dir;
}
function gameReleaseStasis(g) {
  const speed=g.hits ? 45+15*g.hits*g.hits : 0;
  g.freeze=0;g.phase='flying';g.vx=Math.cos(g.angle)*speed;
  g.vy=g.hits ? Math.sin(g.angle)*speed-45 : 0;
  g.travel=0;g.startX=g.x;g.distance=0;
  g.message=g.hits===6?L('满蓄力释放！跟随石头飞向远方。','Full power! Follow the boulder into the distance.'):g.hits?L('势能释放，击打越多飞得越远。','Energy released. More strikes send it farther.'):L('没有蓄力，石头继续滚动。','No energy stored. The stone settles back.');
}
function gamePrimary() {
  const id=currentRuneGame(); if(!id) return;
  const g=getRuneGame(id); if(g.paused) return;
  if(id==='sensor' && g.phase==='won' && !initExtra(g).target) {showSensorMap();return;}
  if(id==='cryonis' && g.phase==='lost') {
    g.phase='ready';const e=initExtra(g);e.walker=34;e.walkerFoot=ICE_SURFACES.shore;e.walkerScale=1;e.leg=0;e.legTime=0;
    extraMessage(g,'保留现有冰柱，调整位置后再尝试。','Existing pillars kept. Adjust them and try again.');paintExtra(g);return;
  }
  if(['won','lost'].includes(g.phase)) {resetRuneGame(id);return;}
  if(EXTRA_RUNE_GAMES.has(id)) {extraPrimary(g);return;}
  if(id==='bomb') {
    if(g.cooldown>0) return;
    if(g.phase==='ready') {
      g.phase='flight';g.x=36;g.y=89;g.vx=55+g.power*1.25;g.vy=-62-g.power*.25;
      g.message=L('观察滚动，在岩石附近引爆。','Watch the roll. Detonate near the rocks.');
    } else if(g.phase==='flight') {
      g.shotX=g.x;g.shotY=g.y;g.flash=.6;g.cooldown=2.5;
      const hit=Math.hypot(g.x-257,g.y-125)<47;
      g.phase=hit?'won':'cooldown';
      g.message=hit?L('岩石被炸开，通路开启。','Rocks destroyed. The path is open.'):L('爆炸没有击中岩石。冷却后调整力度再试。','Missed the rocks. Adjust the throw after cooling down.');
    }
  } else if(id==='magnet') {
    if(['falling','settling','crossing'].includes(g.phase)) return;
    if(!g.held) {
      g.held=true;g.phase='carry';g.vy=0;g.axis='x';g.lifting=true;
      g.message=L('▲▼ 移动；OK 打开操作菜单，可随时切换方向或放下。','▲▼ move; OK opens tools to switch axes or release.');
    } else {g.tool=true;runeGameDirection=0;render();return;}
  } else if(id==='stasis') {
    if(g.cooldown>0) return;
    if(g.phase==='ready') {
      g.phase='frozen';g.freeze=10;g.hits=0;g.vx=0;g.vy=0;
      g.message=L('▲▼ 调整施力方向 · OK 击打；倒计时结束释放','▲▼ aim force · OK strike; energy releases when time expires');
    } else if(g.phase==='frozen') {
      if(g.hits<6) {g.hits++;g.pulse=.2;}
      else gameReleaseStasis(g);
    }
  }
  beep('ok'); paintRuneGame(g);
}
function runeGameAction(action) {
  const id=currentRuneGame();if(!id) return;
  const g=getRuneGame(id);
  if(action==='pause'||action==='resume') {pauseRuneGame();return;}
  if(action==='retry') {resetRuneGame(id);return;}
  if(action==='exit') {runeGameDirection=0;go('#/runes');return;}
  if(action==='release' && id==='stasis' && g.phase==='frozen') {g.paused=false;gameReleaseStasis(g);render();return;}
  if(id==='magnet' && action==='tools-close') {g.tool=false;render();return;}
  if(id==='magnet' && action==='axis-x' && g.held) {g.axis='x';g.tool=false;render();return;}
  if(id==='magnet' && action==='axis-y' && g.held) {g.axis='y';g.lifting=false;g.tool=false;render();return;}
  if(id==='magnet' && action==='drop' && g.held && !g.paused) {
    const landY=MAGNET_BRIDGE.top-MAGNET_BRIDGE.bottom;
    if(g.y>landY+.01) {g.message=L('铁板低于桥台，请先抬高。','Lift the slab above the supports first.');g.tool=false;g.axis='y';render();return;}
    g.held=false;g.tool=false;g.lifting=false;g.phase='falling';g.vy=0;
    g.message=L('磁力已解除，检查两端支撑。','Released. Checking both supports.');render();return;
  }
  if(EXTRA_RUNE_GAMES.has(id) && extraAction(g,action)) return;
  if(action==='primary') gamePrimary();
}
function stepRuneGame(g,dt) {
  g.time+=dt;g.flash=Math.max(0,g.flash-dt);g.pulse=Math.max(0,g.pulse-dt);
  g.cooldown=Math.max(0,g.cooldown-dt);
  if(g.phase==='won'||g.phase==='lost') return;
  if(EXTRA_RUNE_GAMES.has(g.id)) {stepExtra(g,dt);return;}
  if(g.id==='bomb') {
    if(g.phase==='ready') g.power=gameClamp(g.power+runeGameDirection*dt*48,15,100);
    if(g.phase==='cooldown' && !g.cooldown) g.phase='ready';
    if(g.phase==='flight') {
      g.vy+=160*dt;g.x+=g.vx*dt;g.y+=g.vy*dt;
      const floor=100+(g.x-30)*.14;
      if(g.y>=floor) {
        g.y=floor;
        if(g.vy>14) {g.vy=-g.vy*.3;g.vx*=.88;} else {g.vy=0;g.vx+=12*dt;}
      }
      if(g.x>312) {g.phase='lost';g.message=L('炸弹滚出了范围，试着早一点引爆。','The bomb rolled away. Try detonating earlier.');}
    }
  } else if(g.id==='magnet') {
    if(g.held) {
      if(g.lifting) {g.y=Math.max(82,g.y-45*dt);if(g.y<=82) g.lifting=false;}
      if(g.axis==='x') g.x=gameClamp(g.x+runeGameDirection*dt*46,MAGNET_BRIDGE.half+8,312-MAGNET_BRIDGE.half);
      else g.y=gameClamp(g.y+runeGameDirection*dt*34,55,MAGNET_BRIDGE.top-MAGNET_BRIDGE.bottom);
    } else if(g.phase==='falling') {
      const previousY=g.y;
      g.vy+=180*dt;g.y+=g.vy*dt;
      const supported=magnetContact(g).both;
      const landY=MAGNET_BRIDGE.top-MAGNET_BRIDGE.bottom;
      if(supported && previousY<=landY+.01 && g.y>=landY) {
        g.y=landY;g.vy=0;g.phase='settling';g.landed=0;
        g.message=L('两端已搭上桥台，等待铁板稳定。','Both ends supported. Let the slab settle.');
      } else if(g.y>177) {
        g.phase='lost';g.message=L('铁板一端失去支撑，掉进断口。重新试着对准两边。','An unsupported end tipped into the gap. Align both ends and retry.');
      }
    } else if(g.phase==='settling') {
      g.landed+=dt;
      if(g.landed>.6) {g.phase='crossing';g.message=L('桥面稳定，林克正在通过。','Bridge stable. Link is crossing.');}
    } else if(g.phase==='crossing') {
      g.cross=Math.min(1,g.cross+dt/3.2);
      if(g.cross===1) {g.phase='won';g.message=L('成功跨过断口，铁板桥搭好了！','Gap crossed. The metal bridge holds!');}
    }
  } else if(g.id==='stasis') {
    if(g.phase==='ready') {
      const before=g.x;g.x+=g.rollingDirection*52*dt;
      if(g.x>=222) {g.x=222;g.rollingDirection=-1;}
      if(g.x<=48) {g.x=48;g.rollingDirection=1;}
      g.roll+=(g.x-before)/18*180/Math.PI;g.y=129;
      g.angle=gameClamp(g.angle+runeGameDirection*dt*.65,-.68,-.12);
    } else if(g.phase==='frozen') {
      g.angle=gameClamp(g.angle+runeGameDirection*dt*.65,-.68,-.12);
      g.freeze=Math.max(0,g.freeze-dt);
      if(!g.freeze) gameReleaseStasis(g);
    } else if(g.phase==='flying') {
      g.travel+=dt;g.vy+=220*dt;g.x+=g.vx*dt;g.y+=g.vy*dt;
      g.roll+=g.vx*dt*1.5;
      g.distance=Math.max(0,(g.x-g.startX)/6);
      g.camera=Math.max(0,g.x-120);g.cameraY=Math.min(0,g.y-70);
      if(g.y>=129 && g.vy>=0 && g.travel>.12) {g.y=129;g.cameraY=0;g.vy=0;g.phase='landing';g.landed=0;}
    } else if(g.phase==='landing') {
      const before=g.x;g.landed+=dt;g.x+=g.vx*dt;g.vx*=Math.exp(-5*dt);
      g.roll+=(g.x-before)/18*180/Math.PI;g.camera=Math.max(0,g.x-120);
      g.distance=Math.max(0,(g.x-g.startX)/6);
      if(g.landed>.8) {
        g.phase=g.hits===6?'won':'lost';
        g.message=L(`飞行与落地滑行共 ${Math.round(g.distance)} 米。${g.hits===6?'满蓄力远射完成！':'试着蓄满六次，飞得更远。'}`,`Travelled ${Math.round(g.distance)} m. ${g.hits===6?'Full-power launch complete!':'Try all six strikes for a longer launch.'}`);
      }
    }
  }
}
function gameWords(g) {
  if(g.phase==='won') return {status:L('试炼完成','TRIAL COMPLETE'),primary:L('再次挑战','PLAY AGAIN'),hint:L('OK 重试 · 长按 OK 暂停菜单','OK retry · hold OK for menu')};
  if(g.phase==='lost') return {status:L('再试一次','TRY AGAIN'),primary:L('重试','RETRY'),hint:L('OK 重试 · 长按 OK 暂停菜单','OK retry · hold OK for menu')};
  if(g.id==='bomb') return {status:g.cooldown?L(`冷却 ${g.cooldown.toFixed(1)} 秒`,`COOLDOWN ${g.cooldown.toFixed(1)}s`):L(`投掷力度 ${Math.round(g.power)}%`,`THROW ${Math.round(g.power)}%`),primary:g.phase==='flight'?L('引爆','DETONATE'):L('投掷','THROW'),hint:L('▲ 减力 · ▼ 加力 · OK 投掷 / 引爆','▲ less · ▼ more · OK throw / detonate')};
  if(g.id==='magnet') {
    const aligned=magnetContact(g).both;
    return {status:g.held?L(aligned?'两端对齐 · 可放下':g.x<160?'向右搬运':'向左搬运',aligned?'ALIGNED · RELEASE':g.x<160?'MOVE RIGHT':'MOVE LEFT'):L('铁板搭桥','BRIDGE THE GAP'),primary:!g.held?L('抓取','GRAB'):L('磁力操作','TOOLS'),hint:!g.held?L('OK 抓取铁板','OK grab the slab'):g.axis==='x'?L('▲ 左移 · ▼ 右移 · OK 操作菜单','▲ left · ▼ right · OK tools'):L('▲ 抬升 · ▼ 降低 · OK 操作菜单','▲ lift · ▼ lower · OK tools')};
  }
  const flight=['flying','landing'].includes(g.phase);
  return {status:g.phase==='frozen'?L(`时停 ${g.freeze.toFixed(1)} 秒 · ${g.hits}/6`,`STASIS ${g.freeze.toFixed(1)}s · ${g.hits}/6`):flight?L(`飞出 ${Math.round(g.distance)} 米`,`DISTANCE ${Math.round(g.distance)} m`):L('滚石运动中','BOULDER ROLLING'),primary:g.phase==='ready'?L('锁定','LOCK'):flight?L('飞行中','IN FLIGHT'):g.hits<6?L('击打','STRIKE'):L('释放','RELEASE'),hint:L('▲▼ 调角度 · OK 锁定 / 击打 · 六次后再按释放','▲▼ aim · OK lock / strike · OK after six releases')};
}
function viewRuneGame(id) {
  if(EXTRA_RUNE_GAMES.has(id)) return viewAdditionalRuneGame(id);
  const g=getRuneGame(id),r=RUNE_BY_ID[id];
  if(g.language!==state.lang) { g.language=state.lang; g.message=''; }
  const title=g.id==='bomb'?L('滚动的爆破','ROLLING BLAST'):g.id==='magnet'?L('铁板搭桥','BRIDGE THE GAP'):L('蓄积的力量','STORED POWER');
  const goal=g.id==='bomb'?L('在右侧岩石附近引爆炸弹','Detonate near the rocks on the right'):g.id==='magnet'?L('让铁板两端搭住断口两侧','Rest both slab ends on the banks'):L('停止滚石，击打六次后向远处释放','Freeze the rolling stone. Store six strikes and launch');
  return topbar('runes')+`<div class="body scene-body rune-game" data-game="${id}"><div class="scene" style="${runeSceneStyle(id)}"></div><div class="scene-shade"></div>${sceneTop(r,'')}<div class="game-goal"><b>${title}</b><span>${goal}</span></div><div class="game-arena" aria-label="${goal}">
    <div class="game-ground ${id==='bomb'?'sloped':''}"></div>
    ${id==='magnet'?'<div class="bridge-gap"></div><div class="bridge-bank left"></div><div class="bridge-bank right"></div><span id="bridgeWalker" class="bridge-walker"></span>':''}
    ${id==='bomb'?'<span class="ability-sprite game-obstacle" style="background-position:100% 0%"></span>':''}
    <span id="gameActor" class="${id==='magnet'?'game-bridge':'ability-sprite'} game-actor" style="background-position:${id==='bomb'?'0%':id==='magnet'?'66.6667%':'100%'} 0%"></span>
    ${id==='stasis'?'<div id="gameDistance" class="game-distance"></div><div id="gameMilestones" class="game-milestones">'+[0,50,100,150,200,250,300].map(m=>'<span style="left:'+(m*6)+'px">'+m+' m</span>').join('')+'</div>':''}
    <div id="gameForce" class="game-force"><i></i></div><div id="gameBlast" class="ability-sprite game-blast" style="background-position:100% 100%"></div>
    <div id="gameResult" class="game-result"></div>
    </div><div class="game-message" id="gameMessage"></div><div class="game-controls"><button class="chip" data-action="game:primary" data-focus id="gamePrimary"></button><button class="chip" data-action="game:pause" data-focus>${L('暂停','PAUSE')}</button></div></div>`+footer('<span id="gameHint"></span>',L('长按 OK 暂停','HOLD OK PAUSE'))+(g.paused?`<div class="game-pause" role="dialog" aria-modal="true" aria-label="${L('暂停','Paused')}"><div class="game-pause-card"><h2>${L('已暂停','PAUSED')}</h2><button class="chip" data-focus data-start data-action="game:resume">${L('继续','RESUME')}</button>${g.id==='stasis'&&g.phase==='frozen'?'<button class="chip" data-action="game:release">'+L('提前解除','RELEASE EARLY')+'</button>':''}<button class="chip" data-focus data-action="game:retry">${L('重新开始','RESTART')}</button><button class="chip" data-focus data-action="game:exit">${L('返回符文','RUNES')}</button></div></div>`:'')+(g.tool?magnetTools(g):'');
}
function magnetTools(g) {
  const next=magnetContact(g).both?'drop':g.axis==='x'?'axis-y':'axis-x';
  return `<div class="game-pause game-tool" role="dialog" aria-modal="true" aria-label="${L('磁力操作','Magnesis tools')}"><div class="game-pause-card"><h2>${L('磁力操作','MAGNESIS')}</h2><button class="chip" data-focus ${next==='axis-x'?'data-start':''} data-action="game:axis-x">${L('水平移动','MOVE HORIZONTALLY')}</button><button class="chip" data-focus ${next==='axis-y'?'data-start':''} data-action="game:axis-y">${L('升降铁板','LIFT / LOWER')}</button><button class="chip" data-focus ${next==='drop'?'data-start':''} data-action="game:drop">${L('解除磁力 · 放下','RELEASE SLAB')}</button><button class="chip" data-focus data-action="game:tools-close">${L('继续调整','KEEP ADJUSTING')}</button></div></div>`;
}
function gameText(el, value) { if(el.textContent!==value) el.textContent=value; }
function paintRuneGame(g) {
  if(EXTRA_RUNE_GAMES.has(g.id)) {paintExtra(g);return;}
  const actor=document.getElementById('gameActor');if(!actor) return;
  const words=gameWords(g);
  actor.style.left=(g.x-g.camera-(g.id==='magnet'?MAGNET_BRIDGE.half:18))+'px';actor.style.top=(g.y-g.cameraY-(g.id==='magnet'?17:18))+'px';
  if(g.id==='magnet') {
    actor.style.width=(MAGNET_BRIDGE.half*2)+'px';
    const contact=magnetContact(g);
    document.querySelector('.bridge-bank.left').classList.toggle('supported',g.held && contact.left);
    document.querySelector('.bridge-bank.right').classList.toggle('supported',g.held && contact.right);
  }
  const ground=document.querySelector('.rune-game .game-ground');if(g.id==='stasis' && ground) ground.style.top=(147-g.cameraY)+'px';
  actor.style.transform=`rotate(${g.id==='bomb'?g.x*2:g.id==='stasis'?g.roll:g.phase==='lost'?18:0}deg) scale(${1+g.pulse*.6})`;
  setRuneSprite(actor,g.id==='bomb'?0:g.id==='magnet'?2:3,g.id==='magnet'?MAGNET_BRIDGE.half*2:36,g.id==='magnet'?34:36);
  actor.classList.toggle('locked',g.held);actor.classList.toggle('frozen',g.phase==='frozen');
  actor.hidden=g.id==='bomb' && !['flight'].includes(g.phase);
  gameText(document.querySelector('.rune-game .scene-stat'),words.status);
  gameText(document.getElementById('gamePrimary'),words.primary);
  document.getElementById('gamePrimary').disabled=(!['won','lost'].includes(g.phase) && g.cooldown>0) || ['falling','settling','crossing','flying','landing'].includes(g.phase);
  gameText(document.getElementById('gameHint'),words.hint);
  gameText(document.getElementById('gameMessage'),g.message || (g.id==='bomb'?L('先调整投掷力度，再按 OK。','Adjust the throw, then press OK.'):g.id==='magnet'?L('抓取铁板，将它搬到断口上方。','Grab the slab and carry it over the gap.'):L('观察石头滚动，按 OK 将它静止。','Watch the stone roll. Press OK to stop it.')));
  const result=document.getElementById('gameResult');gameText(result,['won','lost'].includes(g.phase)?words.status:'');result.classList.toggle('success',g.phase==='won');
  const force=document.getElementById('gameForce');force.hidden=g.id!=='stasis'||!['ready','frozen'].includes(g.phase);
  const forceWidth=20+g.hits*12;
  force.style.left=(g.x-g.camera)+'px';force.style.top=(g.y-7)+'px';force.style.width=forceWidth+'px';force.style.transform=`rotate(${g.angle}rad)`;
  setRuneRegion(force,'world','force',forceWidth,14);force.style.filter=g.hits===6?'hue-rotate(-24deg)':'none';
  const blast=document.getElementById('gameBlast');blast.hidden=g.flash<=0;blast.style.left=((g.id==='bomb'?g.shotX:257)-37)+'px';blast.style.top=((g.id==='bomb'?g.shotY:112)-37)+'px';blast.style.opacity=Math.min(1,g.flash*3);
  paintRuneBlast(blast,g.flash);
  document.querySelectorAll('.bridge-bank').forEach(n=>setRuneRegion(n,'world','bank',104,25));
  if(ground) setRuneRegion(ground,'world','road',g.id==='bomb'?281:286,18);
  const obstacle=document.querySelector('.game-obstacle');if(obstacle) {setRuneSprite(obstacle,3,48);obstacle.classList.toggle('broken',g.phase==='won');}
  const walker=document.getElementById('bridgeWalker');if(walker) {walker.style.left=(26+g.cross*260)+'px';setRuneSprite(walker,14,40,40);}
  const distance=document.getElementById('gameDistance');if(distance) {gameText(distance,Math.round(g.distance)+' m');distance.hidden=!['flying','landing','won','lost'].includes(g.phase);}
  const marks=document.getElementById('gameMilestones');if(marks) marks.style.transform=`translate(${-g.camera}px,${-g.cameraY}px)`;
  const early=document.getElementById('gameRelease');if(early) early.disabled=g.phase!=='frozen';
}
function syncRuneGame() {
  const id=currentRuneGame();runeGameDirection=0;
  if (runeGameRoute !== id) {
    if (runeGameRoute) getRuneGame(runeGameRoute).paused=true;
    runeGameRoute=id;
    runeGameLast=0;
  }
  if(!id) {cancelAnimationFrame(runeGameRAF);runeGameRAF=0;runeGameLast=0;return;}
  paintRuneGame(getRuneGame(id));
  if(runeGameRAF) return;
  runeGameLast=0;
  const frame=now=>{
    const active=currentRuneGame();if(!active) {runeGameRAF=0;runeGameLast=0;return;}
    const dt=runeGameLast?Math.min(.04,(now-runeGameLast)/1000):0;runeGameLast=now;
    const g=getRuneGame(active);if(!g.paused && !g.tool) stepRuneGame(g,dt);
    paintRuneGame(g);
    runeGameRAF=requestAnimationFrame(frame);
  };
  runeGameRAF=requestAnimationFrame(frame);
}
