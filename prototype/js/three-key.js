/* Device input policy. No mouse action is required to reach a device function. */
const inputUI={dialog:null,edit:null,memory:new Map()};
function rememberInputPage(){
  if(!screenEl.firstElementChild||inputUI.dialog||screenEl.querySelector('.input-dialog'))return;
  const scroll=[...screenEl.querySelectorAll('.quest-list,.entry-list,.story-page,.entry-info')].map(n=>[n.className,n.scrollTop]);
  inputUI.memory.set(prevHash||routeHash(),{key:focusKey,scroll});
}
function restoreInputPage(){
  const saved=inputUI.memory.get(routeHash());if(!saved||inputUI.dialog)return;
  for(const [cls,y] of saved.scroll){const n=[...screenEl.querySelectorAll('[class]')].find(n=>n.className===cls);if(n)n.scrollTop=y;}
}
function viewHome(){
  return `<div class="body device-home"><h2>${L('主目录','MAIN MENU')}</h2><div class="home-grid">${TABS.map(([id,label])=>`<button class="chip" data-action="go:#/${id}" ${id==='runes'?'data-start':''}>${t(label)}</button>`).join('')}<button class="chip" data-action="go:#/standby">${t('standby')}</button></div></div>`+footer(L('▲▼ 选择 · OK 进入','▲▼ select · OK open'));
}
function openInputMenu(title,items){rememberInputPage();stopNav();inputUI.dialog={title,items};render();}
function closeInputMenu(){
  if(inputUI.edit){state.settings[inputUI.edit.key]=inputUI.edit.before;inputUI.edit=null;}
  inputUI.dialog=null;render();
}
function inputDialogHTML(){
  const d=inputUI.dialog;if(!d)return '';
  return `<div class="input-dialog" role="dialog" aria-modal="true" aria-label="${esc(d.title)}"><div class="game-pause-card"><h2>${esc(d.title)}</h2>${inputUI.edit?`<p>${L('▲▼ 调整数值 · OK 保存 · 长按取消','▲▼ adjust · OK save · hold cancel')}</p><strong>${state.settings[inputUI.edit.key]*20}%</strong>`:d.items.map((item,i)=>`<button class="chip" data-action="ui:choose:${i}" ${i===0?'data-start':''}>${esc(item.label)}</button>`).join('')}</div></div>`;
}
function inputReadingNode(){
  if(inputUI.dialog)return null;
  const p=routeParts();
  if(p[0]==='log'&&p[2])return screenEl.querySelector('.story-page');
  if(p[0]==='compendium'&&p[2]!==undefined)return screenEl.querySelector('.entry-info');
  return screenEl.querySelector('.input-reading');
}
function inputNavigate(dir){
  if(inputUI.edit){const e=inputUI.edit;state.settings[e.key]=Math.max(e.key==='volume'?0:1,Math.min(5,state.settings[e.key]-dir));render();return true;}
  const reading=inputReadingNode();
  if(reading){reading.scrollTop=Math.max(0,Math.min(reading.scrollHeight-reading.clientHeight,reading.scrollTop+dir*Math.max(20,reading.clientHeight*.7)));return true;}
  if(routeParts()[0]==='inventory'&&!inputUI.dialog){
    const inv=state.inventory,items=inventoryItems(inv.category),index=items.findIndex(i=>i.id===inv.selected[inv.category]);
    const next=Math.max(0,Math.min(items.length-1,index+dir));inv.selected[inv.category]=items[next].id;inv.pages[inv.category]=Math.floor(next/INV_PAGE_SIZE);focusKey='inv:equip:'+items[next].id;render();return true;
  }
  return false;
}
function inputPrimary(){
  if(inputUI.edit){inputUI.edit=null;inputUI.dialog=null;render();return true;}
  if(inputUI.dialog){activateFocused();return true;}
  const reading=inputReadingNode();
  if(reading){
    if(reading.classList.contains('input-reading')){closeInputMenu();return true;}
    const items=[...screenEl.querySelectorAll('.story-controls [data-action]:not([disabled]),.chiprow [data-action]:not([disabled])')].map(n=>({label:n.textContent.trim(),action:n.dataset.action}));
    openInputMenu(L('阅读操作','READING OPTIONS'),items);return true;
  }
  return false;
}
function inventoryMenu(id){
  const item=INV_BY_ID[id];if(!item)return;
  openInputMenu(invName(item),[
    {label:isEquipped(item)?L('卸下','UNEQUIP'):L('装备','EQUIP'),action:'ui:equip:'+id},
    {label:L('阅读说明','READ DESCRIPTION'),action:'ui:read:'+id},
    {label:L('切换装备分类','CHANGE CATEGORY'),action:'ui:categories'},
    {label:L('取消','CANCEL'),action:'ui:close'}]);
}
function inputAction(parts){
  const [kind,arg]=parts;
  if(kind==='choose'){
    const item=inputUI.dialog?.items[Number(arg)];if(!item)return;
    inputUI.dialog=null;render();run(item.action);return;
  }
  if(kind==='close'){closeInputMenu();return;}
  if(kind==='equip'){inventoryAction('equip',arg);return;}
  if(kind==='read'){
    const item=INV_BY_ID[arg];
    inputUI.dialog=null;
    screenEl.insertAdjacentHTML('beforeend',`<div class="input-dialog"><div class="game-pause-card"><h2>${esc(invName(item))}</h2><article class="input-reading">${esc(state.lang==='cn'?(item.description_cn||item.description):item.description)}</article><small>${L('▲▼ 阅读 · OK 关闭','▲▼ read · OK close')}</small></div></div>`);updateInputHint();return;
  }
  if(kind==='categories'){openInputMenu(L('装备分类','CATEGORY'),INV_CATS.map(c=>({label:L({weapons:'武器',shields:'盾牌',armors:'防具'}[c.id],c.label),action:'go:#/inventory/'+c.id})));return;}
  if(kind==='edit'){
    rememberInputPage();inputUI.edit={key:arg,before:state.settings[arg]};inputUI.dialog={title:t(arg),items:[]};render();return;
  }
  if(kind==='delete-photo'){
    openInputMenu(L('删除这张照片？','DELETE THIS PHOTO?'),[{label:L('取消','CANCEL'),action:'ui:close'},{label:L('确认删除','DELETE'),action:'ui:confirm-delete:'+arg}]);return;
  }
  if(kind==='confirm-delete'){albumAction('delete',arg);return;}
}
function previewRuneFocus(){
  if(routeParts()[0]!=='runes')return;
  const n=focusables()[state.focus];if(!n?.dataset.action?.startsWith('pick:'))return;
  const index=Number(n.dataset.action.split(':')[1]),r=RUNES[index];if(!r)return;
  state.runeIndex=index;
  screenEl.querySelectorAll('.rune-tile').forEach((n,i)=>n.classList.toggle('sel',i===index));
  const card=screenEl.querySelector('.detail-card');if(!card)return;
  card.querySelector('h2').textContent=L(r.cn,r.label);card.querySelector('p').textContent=L(r.desc,r.en_desc||r.desc);
  card.querySelector('.eyebrow').textContent=L('符文 ','RUNE ')+String(index+1).padStart(2,'0');
  card.querySelector('.stats').innerHTML=r.stats.map(([k,v])=>`<div><span>${state.lang==='cn'?(RUNE_STAT_CN[k]||k):k}</span><b>${state.lang==='cn'?(RUNE_STAT_VAL_CN[v]||v):v}</b></div>`).join('');
}
function updateInputHint(){
  const footerEl=screenEl.querySelector('.footer');if(!footerEl)return;
  let hint='';
  if(inputUI.edit)hint=L('▲▼ 调整数值 · OK 保存 · 长按取消','▲▼ adjust · OK save · hold cancel');
  else if(inputUI.dialog)hint=L('▲▼ 选择 · OK 确认 · 长按关闭','▲▼ select · OK confirm · hold close');
  else if(inputReadingNode())hint=L('▲▼ 阅读 · OK 操作 · 长按返回','▲▼ read · OK options · hold back');
  else if(routeParts()[0]==='inventory')hint=L('▲▼ 选择物品 · OK 操作 · 长按主目录','▲▼ item · OK options · hold main menu');
  else if(routeParts()[0]==='map'){
    const mode=state.map.control||'x';
    hint=mode==='x'?L('▲▼ 左右移动','▲▼ pan left/right'):mode==='y'?L('▲▼ 上下移动','▲▼ pan up/down'):L('▲ 放大 · ▼ 缩小','▲ zoom in · ▼ zoom out');
    hint+=L(' · OK 切换 · 长按返回',' · OK switch · hold back');
  }
  screenEl.classList.toggle('reading-mode',Boolean(inputReadingNode()));
  if(hint){footerEl.firstElementChild.textContent=hint;if(footerEl.children[1])footerEl.children[1].textContent='';}
}
