
(()=>{
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cats=[],objs=[];
const store={get(){try{return JSON.parse(localStorage.getItem('fav')||'[]')}catch{return[]}},set(v){try{localStorage.setItem('fav',JSON.stringify(v))}catch{}}};
const catName=id=>(cats.find(c=>c.id===id)||{}).name||id;
const img=o=>o.image?`<img class="thumb" src="${esc(o.image)}" alt="" loading="lazy" onerror="this.outerHTML='<span class=&quot;thumb ph&quot;>?</span>'">`:`<span class="thumb ph">?</span>`;
const item=o=>`<a class="card row" href="#/o/${encodeURIComponent(o.id)}">${img(o)}<span><b>${esc(o.name_ru)}</b><br><small>${esc(o.name_en||'')} · ${esc(catName(o.category))}</small></span></a>`;
const list=a=>`<div class="list">${a.map(item).join('')}</div>`;
const empty=t=>`<p class="empty">${t}</p>`;
const NONE='Пока нет проверенных данных. Добавьте JSON-файл по схеме из docs/SCHEMA.md.';
const pct=v=>(Math.round(v*1000)/10).toString().replace('.',',')+'%';
const rowT=(k,v)=>v==null||v===''?'':`<tr><th>${k}</th><td>${v}</td></tr>`;
async function load(){
  const j=u=>fetch(u).then(r=>{if(!r.ok)throw 0;return r.json()});
  cats=await j('data/categories.json');
  const m=await j('data/manifest.json');
  objs=(await Promise.all(m.files.map(f=>j(f).catch(()=>[])))).flat();
}
function home(){
  const pop=objs.filter(o=>o.popular).slice(0,6),upd=[...objs].sort((a,b)=>(b.updated||'').localeCompare(a.updated||'')).slice(0,5);
  return `<section class="hero box"><h1>Stardew Encyclopedia</h1><p>Энциклопедия Stardew Valley для Android и iOS</p>
  <form id="sf" role="search"><input class="big" type="search" id="q" placeholder="Найти статью" aria-label="Поиск"></form></section>
  <h2>Разделы</h2><div class="grid">${cats.map(c=>`<a class="card" href="#/c/${c.id}"><span class="ic">${c.icon}</span><b>${esc(c.name)}</b></a>`).join('')}</div>
  <h2>Популярные статьи</h2>${pop.length?list(pop):empty(NONE)}
  <h2>Последние обновления</h2>${upd.length?list(upd):empty('Обновлений пока нет.')}
  <h2>Справочники</h2><div class="grid">${['mechanics','items','crafting'].map(id=>`<a class="card" href="#/c/${id}"><b>${esc(catName(id))}</b></a>`).join('')}</div>`;
}
const catList=()=>`<h1>Разделы</h1><div class="grid">${cats.map(c=>`<a class="card" href="#/c/${c.id}"><span class="ic">${c.icon}</span><b>${esc(c.name)}</b><br><small>${objs.filter(o=>o.category===c.id).length} статей</small></a>`).join('')}</div>`;
function cat(id){
  const c=cats.find(x=>x.id===id);if(!c)return nf();
  const rar=[...new Set(objs.filter(o=>o.category===id&&o.rarity).map(o=>o.rarity))];
  return `<h1>${c.icon} ${esc(c.name)}</h1><div class="filters"><input id="f" type="search" placeholder="Фильтр по названию" aria-label="Фильтр">
  <select id="r" aria-label="Редкость"><option value="">Любая редкость</option>${rar.map(r=>`<option>${esc(r)}</option>`).join('')}</select>
  <select id="s" aria-label="Сортировка"><option value="ru">По названию (рус.)</option><option value="en">По названию (англ.)</option></select></div><div id="res"></div>`;
}
function fill(id){
  const f=$('#f'),r=$('#r'),s=$('#s'),res=$('#res');
  const go=()=>{const a=objs.filter(o=>o.category===id&&(!r.value||o.rarity===r.value)&&(o.name_ru+' '+(o.name_en||'')).toLowerCase().includes(f.value.toLowerCase()));
    const k=s.value==='en'?'name_en':'name_ru';a.sort((x,y)=>(x[k]||'').localeCompare(y[k]||''));
    res.innerHTML=a.length?list(a):empty(NONE)};
  [f,r,s].forEach(e=>e.oninput=go);go();
}
function search(q){
  const a=q?objs.filter(o=>[o.name_ru,o.name_en,o.description,catName(o.category)].join(' ').toLowerCase().includes(q.toLowerCase())):[];
  return `<h1>Поиск</h1><form id="sf"><input class="big" type="search" id="q" value="${esc(q)}" placeholder="Название, раздел, описание" aria-label="Поиск"></form><div style="height:16px"></div>${q?(a.length?list(a):empty('Ничего не найдено. Проверьте написание.')):empty('Введите запрос, чтобы искать по всем разделам.')}`;
}
function obj(id){
  const o=objs.find(x=>x.id===id);if(!o)return nf();
  const fav=store.get().includes(o.id),rel=(o.related||[]).map(i=>objs.find(x=>x.id===i)).filter(Boolean);
  const pr=(o.probabilities||[]).map(p=>`<div>${esc(p.label)}: <b>${pct(p.value)}</b><div class="bar-p"><i style="width:${Math.min(100,p.value*100)}%"></i></div></div>`).join('');
  const L=a=>(a||[]).map(esc).join('<br>');
  return `<p><a href="#/c/${o.category}">← ${esc(catName(o.category))}</a></p><div class="row">${img(o)}<div><h1>${esc(o.name_ru)}</h1><span class="muted">${esc(o.name_en||'')}</span></div></div>
  <p><button class="btn" id="fv" aria-pressed="${fav}">${fav?'★ В избранном':'☆ В избранное'}</button></p><p>${esc(o.description||'')}</p>
  <table>${rowT('Редкость',o.rarity?`<span class="tag">${esc(o.rarity)}</span>`:'')}${rowT('Местоположение',L(o.location))}${rowT('Условия получения',L(o.obtain))}${(o.prices||[]).map(p=>rowT(esc(p.label),esc(p.value))).join('')}${rowT('Вероятности',pr)}${rowT('Платформы',L(o.platforms))}${rowT('Версия игры',esc(o.version))}${rowT('Источники',(o.sources||[]).map(s=>`<a href="${esc(s.url)}" rel="noopener noreferrer" target="_blank">${esc(s.title)}</a>`).join('<br>'))}</table>
  ${rel.length?`<h2>Связанные объекты</h2>${list(rel)}`:''}`;
}
function favs(){const a=store.get().map(i=>objs.find(o=>o.id===i)).filter(Boolean);return `<h1>Избранное</h1>${a.length?list(a):empty('Здесь появятся статьи, отмеченные звёздочкой.')}`}
const nf=()=>`<div class="center"><h1>404</h1><p>Такой страницы нет.</p><a class="btn" href="#/">На главную</a></div>`;
function route(keepFocus){
  const parts=location.hash.slice(2).split('/'),p=parts[0],arg=decodeURIComponent(parts.slice(1).join('/'));
  let h,t=p||'home';
  if(!p)h=home();else if(p==='c')h=arg?cat(arg):catList();else if(p==='o'){h=obj(arg);t='c'}else if(p==='search')h=search(arg);else if(p==='fav')h=favs();else{h=nf();t=''}
  app.innerHTML=h;
  document.querySelectorAll('.tabs a').forEach(x=>x.classList.toggle('on',x.dataset.t===t));
  const sf=$('#sf');if(sf)sf.onsubmit=e=>{e.preventDefault();location.hash='#/search/'+encodeURIComponent($('#q').value)};
  if(p==='search'){const q=$('#q');q.oninput=()=>{clearTimeout(route.t);route.t=setTimeout(()=>{history.replaceState(null,'','#/search/'+encodeURIComponent(q.value));const v=q.value;route(true);const n=$('#q');n.focus();n.setSelectionRange(v.length,v.length)},250)}}
  if(p==='c'&&arg&&cats.some(c=>c.id===arg))fill(arg);
  const fv=$('#fv');if(fv)fv.onclick=()=>{let f=store.get();f=f.includes(arg)?f.filter(x=>x!==arg):[...f,arg];store.set(f);route(true)};
  if(!keepFocus)window.scrollTo(0,0);
}
$('#theme').onclick=()=>{const d=document.documentElement,n=d.dataset.theme==='dark'?'light':'dark';d.dataset.theme=n;try{localStorage.setItem('theme',n)}catch{}};
try{const t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch{}
addEventListener('hashchange',()=>route());
load().then(()=>route()).catch(()=>{app.innerHTML=empty('Не удалось загрузить данные. Откройте сайт через GitHub Pages, а не как локальный файл.')});
})();
