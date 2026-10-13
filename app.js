'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],V=$('#view');
const POSES=['Frente','Lado','Costas'];
const SECS=[['manha','Manhã','sun'],['tarde','Tarde','sunset'],['noite','Noite','moon']];
const CATS={saude:['Saúde','drop','#5CA8D6','var(--sky-s)'],treino:['Treino','dumbbell','#F2A579','var(--peach-s)'],beleza:['Beleza','sparkle','#D9668A','var(--rose-s)'],alimento:['Alimentação','leaf','#5FB38C','var(--sage-s)'],mente:['Mente','heart','#8A6AD6','var(--plum-s)'],outros:['Outros','tag','#E9B44C','var(--sun-s)']};
const MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],MESL=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DOW=['D','S','T','Q','Q','S','S'];
const pad=n=>String(n).padStart(2,'0'),dkey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),today=()=>dkey(new Date()),curM=()=>today().slice(0,7);
const addD=(k,n)=>{const d=new Date(k+'T12:00');d.setDate(d.getDate()+n);return dkey(d)},addM=(m,n)=>{const d=new Date(m+'-15T12:00');d.setMonth(d.getMonth()+n);return dkey(d).slice(0,7)};
const mLabel=m=>MESL[+m.slice(5)-1]+' '+m.slice(0,4),mShort=m=>MES[+m.slice(5)-1]+' '+m.slice(2,4),mName=m=>MESL[+m.slice(5)-1];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const uid=()=>Math.random().toString(36).slice(2,10),num=s=>parseFloat(String(s||'').replace(',','.'));
const haptic=(ms=8)=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch{}};
/* ---------- icons ---------- */
const P={home:'<path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-5.5h-6v5.5H5A1.5 1.5 0 0 1 3.5 19z"/>',
camera:'<path d="M4.5 7.5h2.8l1.7-2.5h6l1.7 2.5h2.8A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5V9a1.5 1.5 0 0 1 1.5-1.5z"/><circle cx="12" cy="13.5" r="3.6"/>',
compare:'<rect x="3.5" y="4" width="17" height="16" rx="3"/><path d="M12 2.5v19"/><path d="m8 10-2 2 2 2M16 10l2 2-2 2"/>',
check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',list:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="m7.5 9 1.5 1.5 3-3M14 9.5h3M7.5 15l1.5 1.5 3-3M14 15.5h3"/>',
settings:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
plus:'<path d="M12 5v14M5 12h14"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',chevL:'<path d="m14.5 18-6-6 6-6"/>',chevR:'<path d="m9.5 18 6-6-6-6"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
sunset:'<path d="M12 3v3M5.3 7.8l1.4 1.4M18.7 7.8l-1.4 1.4M3 15.5h18M7 15.5a5 5 0 0 1 10 0M7 19.5h10"/>',
moon:'<path d="M20 14.6A8 8 0 1 1 9.4 4a6.5 6.5 0 0 0 10.6 10.6z"/>',
flame:'<path d="M12 3c.8 3.4 5.5 5.6 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.3 1-3.9 2.3-5 .2 1.9 1.1 3 2.3 3.3C10.6 9 10.8 5.7 12 3z"/>',
clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',scale:'<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M8 10a5.5 5.5 0 0 1 8 0M12 10.5l1.5-2"/>',
download:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14"/>',upload:'<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 20h14"/>',
bell:'<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/>',image:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="9" cy="9" r="1.8"/><path d="m20.5 15.5-5-5-10 10"/>',
drop:'<path d="M12 3.5s6 6.3 6 10.8a6 6 0 0 1-12 0C6 9.8 12 3.5 12 3.5z"/>',dumbbell:'<path d="M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11"/>',
sparkle:'<path d="M12 3.5 13.9 9l5.6 2-5.6 2L12 18.5 10.1 13 4.5 11l5.6-2z"/><path d="M19 3.5v3M17.5 5h3"/>',
leaf:'<path d="M5 19c0-8 5-13.5 14.5-14-.3 9.5-6 14.5-14 14z"/><path d="M5 19 13 11"/>',heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
tag:'<path d="M3.5 12V4.5a1 1 0 0 1 1-1H12l8.5 8.5-8.5 8.5z"/><circle cx="8" cy="8" r="1.5"/>',trash:'<path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l1 12.5a1 1 0 0 0 1 .9h7a1 1 0 0 0 1-.9l1-12.5M9.5 7V4.5h5V7"/>',
dots:'<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',arrows:'<path d="m9 8-4 4 4 4M15 8l4 4-4 4"/>',
cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',trend:'<path d="m3.5 16.5 5.5-5.5 4 4 7.5-7.5"/><path d="M15 7.5h5.5V13"/>',
user:'<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',shield:'<path d="M12 3.5 19.5 6v5.5c0 4.5-3.2 8-7.5 9-4.3-1-7.5-4.5-7.5-9V6z"/><path d="m9 12 2 2 4-4"/>'};
const ic=(n,c='')=>`<svg class="i ${c}" viewBox="0 0 24 24">${P[n]||''}</svg>`;
const SIL={Frente:'<ellipse cx="50" cy="22" rx="12" ry="15"/><path d="M50 40c-12 0-20 4-23 10l-8 45 6 2 9-34 1 38-3 89h12l4-75h4l4 75h12l-3-89 1-38 9 34 6-2-8-45c-3-6-11-10-23-10z"/>',
Lado:'<ellipse cx="52" cy="22" rx="11" ry="15"/><path d="M50 40c-7 0-11 5-11 13l1 46 2 2-1 89h12l3-80 4-30c1-12-1-24-4-30 3 12 1 22-1 30l-1-38c0-2-2-2-4-2z"/>',
Costas:'<ellipse cx="50" cy="22" rx="12" ry="15"/><path d="M50 40c-12 0-20 4-23 10l-8 45 6 2 9-34 1 38-3 89h12l4-75h4l4 75h12l-3-89 1-38 9 34 6-2-8-45c-3-6-11-10-23-10z"/><path d="M50 44v52"/>'};
const sil=p=>`<svg class="sil" viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">${SIL[p]}</svg>`;
/* illustrations */
const ILL={
photo:`<svg class="ill float" viewBox="0 0 160 130"><defs><linearGradient id="ia" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7C3D2"/><stop offset="1" stop-color="#D7C8F6"/></linearGradient></defs><ellipse cx="80" cy="120" rx="48" ry="6" fill="#C46FB6" opacity=".12"/><rect x="30" y="22" width="62" height="84" rx="14" fill="url(#ia)" transform="rotate(-8 61 64)"/><rect x="66" y="18" width="62" height="84" rx="14" fill="#fff" stroke="#F2B8C8" stroke-width="2" transform="rotate(7 97 60)"/><g transform="rotate(7 97 60)"><circle cx="97" cy="44" r="9" fill="#F2B8C8"/><path d="M80 90c2-14 9-22 17-22s15 8 17 22" fill="#F2B8C8"/></g><path d="M128 20l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#E9B44C"/><circle cx="26" cy="36" r="4" fill="#8A6AD6" opacity=".5"/></svg>`,
mirror:`<svg class="ill float" viewBox="0 0 160 130"><ellipse cx="80" cy="120" rx="50" ry="6" fill="#C46FB6" opacity=".12"/><rect x="34" y="14" width="44" height="96" rx="22" fill="#FCE9EE" stroke="#F2B8C8" stroke-width="2"/><rect x="82" y="14" width="44" height="96" rx="22" fill="#EFE9FB" stroke="#D7C8F6" stroke-width="2"/><circle cx="56" cy="44" r="8" fill="#F2B8C8"/><path d="M44 84c1-14 6-22 12-22s11 8 12 22" fill="#F2B8C8"/><circle cx="104" cy="44" r="8" fill="#C7B6F0"/><path d="M92 84c1-14 6-22 12-22s11 8 12 22" fill="#C7B6F0"/><circle cx="80" cy="62" r="13" fill="#fff" stroke="#D9668A" stroke-width="2"/><path d="m75 62-3 0m11 0h3M76 58l-4 4 4 4M84 58l4 4-4 4" stroke="#D9668A" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
list:`<svg class="ill float" viewBox="0 0 160 130"><ellipse cx="80" cy="120" rx="46" ry="6" fill="#C46FB6" opacity=".12"/><rect x="40" y="12" width="80" height="98" rx="16" fill="#fff" stroke="#F2B8C8" stroke-width="2"/><g stroke-linecap="round" stroke-width="3" fill="none"><circle cx="58" cy="38" r="7" fill="#5FB38C" stroke="none"/><path d="m55 38 2 2 4-4" stroke="#fff" stroke-width="2"/><path d="M72 38h32" stroke="#F2B8C8"/><circle cx="58" cy="61" r="7" stroke="#F2B8C8" stroke-width="2"/><path d="M72 61h26" stroke="#F2B8C8"/><circle cx="58" cy="84" r="7" stroke="#D7C8F6" stroke-width="2"/><path d="M72 84h22" stroke="#D7C8F6"/></g><path d="M128 28l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#E9B44C"/><circle cx="30" cy="70" r="5" fill="#F2A579" opacity=".6"/></svg>`};
const OBART=[`<svg class="art float" viewBox="0 0 300 300"><defs><linearGradient id="o1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E2749A"/><stop offset=".55" stop-color="#C46FB6"/><stop offset="1" stop-color="#8A6AD6"/></linearGradient></defs><circle cx="150" cy="150" r="120" fill="#fff" opacity=".55"/><circle cx="150" cy="150" r="92" fill="none" stroke="#F3E3EA" stroke-width="18"/><circle cx="150" cy="150" r="92" fill="none" stroke="url(#o1)" stroke-width="18" stroke-linecap="round" stroke-dasharray="578" stroke-dashoffset="150" transform="rotate(-90 150 150)"/><path d="M150 108l9 26 26 9-26 9-9 26-9-26-26-9 26-9z" fill="url(#o1)"/><circle cx="240" cy="70" r="10" fill="#F2A579"/><circle cx="58" cy="230" r="7" fill="#8A6AD6" opacity=".6"/><path d="M250 220l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill="#E9B44C"/></svg>`,
`<svg class="art float" viewBox="0 0 300 300"><circle cx="150" cy="150" r="120" fill="#fff" opacity=".55"/><g transform="rotate(-8 110 150)"><rect x="62" y="70" width="96" height="140" rx="20" fill="#FCE9EE" stroke="#F2B8C8" stroke-width="3"/><circle cx="110" cy="115" r="16" fill="#F2B8C8"/><path d="M84 190c3-28 13-42 26-42s23 14 26 42" fill="#F2B8C8"/></g><g transform="rotate(8 190 150)"><rect x="142" y="70" width="96" height="140" rx="20" fill="#fff" stroke="#D7C8F6" stroke-width="3"/><circle cx="190" cy="115" r="16" fill="#C7B6F0"/><path d="M164 190c3-28 13-42 26-42s23 14 26 42" fill="#C7B6F0"/></g><circle cx="150" cy="236" r="22" fill="#fff" stroke="#D9668A" stroke-width="3"/><path d="m143 230-7 6 7 6M157 230l7 6-7 6" stroke="#D9668A" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
`<svg class="art float" viewBox="0 0 300 300"><circle cx="150" cy="150" r="120" fill="#fff" opacity=".55"/><rect x="80" y="62" width="140" height="176" rx="26" fill="#fff" stroke="#F2B8C8" stroke-width="3"/><g stroke-linecap="round" fill="none"><circle cx="112" cy="108" r="13" fill="#5FB38C"/><path d="m106 108 4 4 8-8" stroke="#fff" stroke-width="3"/><path d="M136 108h56" stroke="#F2B8C8" stroke-width="6"/><circle cx="112" cy="150" r="13" fill="#D9668A"/><path d="m106 150 4 4 8-8" stroke="#fff" stroke-width="3"/><path d="M136 150h44" stroke="#F2B8C8" stroke-width="6"/><circle cx="112" cy="192" r="12" stroke="#D7C8F6" stroke-width="3"/><path d="M136 192h50" stroke="#D7C8F6" stroke-width="6"/></g><path d="M235 60c3 8 12 13 12 25a12 12 0 0 1-24 0c0-6 3-9 5-11 1 4 3 6 5 7 0-8 0-14 2-21z" fill="#F2A579"/></svg>`];
/* ---------- state ---------- */
let dbp;const db=()=>dbp||(dbp=new Promise((r,j)=>{const q=indexedDB.open('minha-evolucao',1);q.onupgradeneeded=()=>q.result.createObjectStore('photos');q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)}));
const tx=async(mode,fn)=>{const d=await db();return new Promise((r,j)=>{const t=d.transaction('photos',mode),q=fn(t.objectStore('photos'));t.oncomplete=()=>r(q&&q.result);t.onerror=()=>j(t.error)})};
const pPut=(k,b)=>tx('readwrite',s=>s.put(b,k)),pGet=k=>tx('readonly',s=>s.get(k)),pDel=k=>tx('readwrite',s=>s.delete(k)),pKeys=()=>tx('readonly',s=>s.getAllKeys());
const urls={};async function pURL(k){if(urls[k])return urls[k];const b=await pGet(k);return b?(urls[k]=URL.createObjectURL(b)):null}
const dropURL=k=>{if(urls[k]){URL.revokeObjectURL(urls[k]);delete urls[k]}};
async function compress(file){let img;try{img=await createImageBitmap(file,{imageOrientation:'from-image'})}catch{img=await new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=URL.createObjectURL(file)})}
 const s=Math.min(1,1280/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
 return new Promise(r=>c.toBlob(r,'image/jpeg',.84))}
const meta=()=>LS.get('me_meta',{}),prof=()=>LS.get('me_profile',{}),T=()=>LS.get('me_tasks',[]),D=()=>LS.get('me_done',{});
let keyCache=null;const keys=async()=>keyCache||(keyCache=await pKeys());const bust=()=>keyCache=null;
async function months(){const ks=await keys(),s=new Set(ks.map(k=>k.split('|')[0]));Object.keys(meta()).forEach(m=>s.add(m));return[...s].sort().reverse()}
const tasksFor=d=>T().filter(t=>!t.date||t.date===d);
function dayStat(d){const l=tasksFor(d),s=new Set(D()[d]||[]),n=l.filter(t=>s.has(t.id)).length;return{n,t:l.length,p:l.length?n/l.length:0}}
function streak(){let k=today(),c=0;if(dayStat(k).p<1)k=addD(k,-1);for(let i=0;i<400;i++){const s=dayStat(k);if(s.t&&s.p===1){c++;k=addD(k,-1)}else break}return c}
function bestStreak(){let b=0,c=0;for(let i=60;i>=0;i--){const s=dayStat(addD(today(),-i));if(s.t&&s.p===1){c++;b=Math.max(b,c)}else c=0}return b}
const greet=()=>{const h=new Date().getHours();return h<5?'Boa noite':h<12?'Bom dia':h<18?'Boa tarde':'Boa noite'};
const sortT=a=>a.sort((x,y)=>(x.time||'99').localeCompare(y.time||'99')||(x.ord||0)-(y.ord||0));
/* ---------- ui helpers ---------- */
let toastT;function toast(t){let e=$('.toast');if(!e){e=document.createElement('div');e.className='toast glass';document.body.append(e)}e.innerHTML=ic('check')+esc(t);requestAnimationFrame(()=>e.classList.add('on'));clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2200)}
function ring(p,size=140,w=12,lab='',sub=''){const r=(size-w)/2,c=2*Math.PI*r;return`<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle class="trk" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${w}"/><circle class="val" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${w}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${c*(1-p)}"/></svg><div class="lab"><b style="font-size:${Math.round(size*.24)}px">${lab}</b>${sub?`<span>${sub}</span>`:''}</div></div>`}
const animate=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{$$('.ring .val[data-off]').forEach(c=>{c.style.strokeDashoffset=c.dataset.off});$$('.week .bar i[data-h]').forEach(i=>i.style.height=i.dataset.h)}));
function seg(id,items,cur){return`<div class="seg" id="${id}"><span class="pill"></span>${items.map(([v,l])=>`<button data-v="${v}" class="${v===cur?'on':''}">${l}</button>`).join('')}</div>`}
function placePills(){$$('.seg').forEach(s=>{const b=$('button.on',s),p=$('.pill',s);if(b&&p){p.style.left=b.offsetLeft+'px';p.style.width=b.offsetWidth+'px'}})}
function bindSeg(id,fn){$$('#'+id+' button').forEach(b=>b.onclick=()=>{haptic();$$('#'+id+' button').forEach(x=>x.classList.toggle('on',x===b));placePills();setTimeout(()=>fn(b.dataset.v),180)})}
const empty=(ill,t,p,btn='')=>`<div class="empty">${ILL[ill]}<div class="t-lg">${t}</div><p>${p}</p>${btn}</div>`;
function sheet(html,onMount){const L=$('#layer');L.innerHTML=`<div class="scrim"></div><div class="sheet"><div class="grab"></div>${html}</div>`;const sc=$('.scrim',L),sh=$('.sheet',L);
 requestAnimationFrame(()=>{sc.classList.add('on');sh.classList.add('on')});const close=()=>{sc.classList.remove('on');sh.classList.remove('on');setTimeout(()=>L.innerHTML='',400)};sc.onclick=close;
 let y0=null;sh.addEventListener('touchstart',e=>{if(sh.scrollTop<=0)y0=e.touches[0].clientY},{passive:true});sh.addEventListener('touchend',e=>{if(y0!=null&&e.changedTouches[0].clientY-y0>90)close();y0=null});
 onMount&&onMount(sh,close);return close}
/* ---------- nav ---------- */
const TABS=[['home','Início','home'],['evo','Evolução','camera'],['cmp','Comparar','compare'],['rot','Rotina','list']];
let tab='home',prevIdx=0;
$('#tabs').innerHTML='<span class="blob"></span>'+TABS.map(([k,l,i])=>`<button data-t="${k}" aria-label="${l}">${ic(i)}<span>${l}</span></button>`).join('');
$$('#tabs button').forEach(b=>b.onclick=()=>{haptic();go(b.dataset.t)});
function placeBlob(){const b=$(`#tabs button[data-t="${tab}"]`),bl=$('#tabs .blob');bl.style.left=b.offsetLeft+'px';bl.style.width=b.offsetWidth+'px'}
async function go(k,dir){const i=TABS.findIndex(t=>t[0]===k);dir=dir||(i>prevIdx?'r':i<prevIdx?'l':'u');prevIdx=i;tab=k;
 $$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===k));placeBlob();
 await ({home:renderHome,evo:renderEvo,cmp:renderCmp,rot:renderRot})[k]();
 V.className='';void V.offsetWidth;V.className='enter-'+dir;placePills();animate();if(!dir.startsWith('s'))scrollTo({top:0})}
const rerender=()=>go(tab,'s');
const header=(eyebrow,title,right='')=>`<header class="top"><div><div class="eyebrow">${eyebrow}</div><h1 class="disp">${title}</h1></div>${right}</header>`;
const setBtn=()=>`<button class="ibtn bg" id="setB" aria-label="Ajustes">${ic('settings')}</button>`;
document.addEventListener('click',e=>{if(e.target.closest('#setB')){haptic();openSettings()}});
/* ---------- home ---------- */
async function renderHome(){const p=prof(),nm=p.name||'',s=dayStat(today()),st=streak(),now=new Date(),hm=pad(now.getHours())+':'+pad(now.getMinutes());
 const dn=new Set(D()[today()]||[]),pend=sortT(tasksFor(today()).filter(t=>!dn.has(t.id)));const nxt=pend.find(t=>t.time&&t.time>=hm)||pend[0];
 const ms=await months(),ks=await keys(),cm=curM(),have=POSES.filter(x=>ks.includes(cm+'|'+x)).length;
 let last=null;for(const m of ms){for(const x of POSES)if(ks.includes(m+'|'+x)){last={m,x};break}if(last)break}
 const lu=last?await pURL(last.m+'|'+last.x):null;
 const dstr=now.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
 const msg=s.t===0?'Monte sua rotina pra começar':s.p===1?'Dia completo. Você é demais!':s.p>=.5?'Mais da metade, continua assim':s.n?'Bom começo, bora seguir':'Seu dia te espera';
 V.innerHTML=header(dstr,`${greet()}${nm?`,<br><em>${esc(nm)}</em>`:''}`,`<button class="avatar press" id="setB">${esc((nm||'?')[0].toUpperCase())}</button>`)+`<div class="wrap stag">
 <div class="card hero"><div class="row" style="gap:18px">${ring(s.p,128,12,Math.round(s.p*100)+'%','hoje')}<div class="grow col" style="gap:8px"><div class="t-lg" style="font-family:var(--f-disp);font-size:22px;font-weight:600;line-height:1.15">${msg}</div><div class="t-sm">${s.n} de ${s.t} tarefas</div><div><span class="chip">${ic('flame')}${st} ${st===1?'dia':'dias'} seguidos</span></div></div></div></div>
 <div class="card press" id="hNext" style="cursor:pointer"><div class="row">${nxt?catBox(nxt):`<div class="ico-b" style="background:var(--sage-s);color:var(--sage)">${ic('check')}</div>`}<div class="grow"><div class="t-xs" style="font-weight:700;letter-spacing:.05em;text-transform:uppercase">Próxima tarefa</div><div style="font-weight:700;font-size:16px;margin-top:2px">${nxt?esc(nxt.t):s.t?'Tudo feito por hoje':'Nenhuma tarefa ainda'}</div></div>${nxt&&nxt.time?`<div class="t-sm" style="font-weight:700;color:var(--rose)">${nxt.time}</div>`:''}${ic('chevR')}</div></div>
 ${have<3?`<div class="card press" id="hRem" style="background:linear-gradient(135deg,var(--peach-s),var(--rose-s));cursor:pointer"><div class="row"><div class="ico-b" style="background:var(--surf);color:var(--peach)">${ic('bell')}</div><div class="grow"><div style="font-weight:700">Fotos de ${mName(cm)}</div><div class="t-sm">${have?`Faltam ${3-have} de 3 poses`:'Hora do registro do mês: frente, lado e costas'}</div></div>${ic('chevR')}</div></div>`:''}
 <div class="g2"><div class="card stat press" id="hPh" style="padding:0;aspect-ratio:3/4;margin:0;cursor:pointer">${lu?`<img src="${lu}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"><div style="position:absolute;left:0;right:0;bottom:0;padding:30px 14px 12px;background:linear-gradient(transparent,rgba(20,8,14,.6));color:#fff"><div class="t-xs" style="color:#fffc;font-weight:700;text-transform:uppercase;letter-spacing:.05em">Última foto</div><b style="font-family:var(--f-disp);font-size:20px">${mShort(last.m)} · ${last.x}</b></div>`:`<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--rose);padding:14px;text-align:center">${ic('camera')}<b style="font-size:14px">Sua primeira foto</b><span class="t-xs">Toque para registrar</span></div>`}</div>
 <div class="col" style="gap:var(--s3)"><div class="card stat" style="margin:0;flex:1"><div class="ico-b" style="background:var(--peach-s);color:var(--peach)">${ic('flame')}</div><div class="v" style="margin-top:10px">${st}</div><div class="t-sm">sequência · recorde ${Math.max(st,bestStreak())}</div></div><div class="card stat" style="margin:0;flex:1"><div class="ico-b" style="background:var(--plum-s);color:var(--plum)">${ic('cal')}</div><div class="v" style="margin-top:10px">${ms.length}</div><div class="t-sm">${ms.length===1?'mês registrado':'meses registrados'}</div></div></div></div>
 <h2 class="sec">Sua semana</h2><div class="card">${weekChart()}</div></div>`;
 $('#hNext').onclick=()=>go('rot');$('#hPh').onclick=()=>go('evo');const r=$('#hRem');if(r)r.onclick=()=>{evoM=cm;go('evo')}}
function weekChart(){let h='<div class="week">';for(let i=6;i>=0;i--){const k=addD(today(),-i),s=dayStat(k),d=new Date(k+'T12:00');h+=`<div class="b ${i===0?'today':''}"><div class="bar"><i data-h="${Math.max(s.p*100,s.t?4:0)}%"></i></div><div class="d">${DOW[d.getDay()]}</div></div>`}
 let tot=0,cnt=0;for(let i=0;i<7;i++){const s=dayStat(addD(today(),-i));if(s.t){tot+=s.p;cnt++}}return h+`</div><div class="row between" style="margin-top:12px"><span class="t-sm">Média dos últimos 7 dias</span><b>${cnt?Math.round(tot/cnt*100):0}%</b></div>`}
const catOf=t=>CATS[t.cat]||CATS.outros;
const catBox=t=>{const c=catOf(t);return`<div class="catb" style="--c:${c[2]};--cs:${c[3]}">${ic(c[1])}</div>`};
/* ---------- evolução ---------- */
let evoM=curM(),evoPose=LS.get('me_pose','Frente');
async function renderEvo(){const mt=meta()[evoM]||{},ks=await keys(),ms=await months(),prevM=ms.find(m=>m<evoM);
 const slots=await Promise.all(POSES.map(async p=>{const u=await pURL(evoM+'|'+p),g=!u&&prevM?await pURL(prevM+'|'+p):null;
  return`<label class="slot ${u?'has':'empty'}" data-p="${p}">${u?`<img class="ph" src="${u}" alt="${p}"><button class="x" data-del="${p}" aria-label="Remover">${ic('x')}</button>`:(g?`<img class="ghost-img" src="${g}" alt="">`:sil(p))}<input type="file" accept="image/*" data-pose="${p}" ${u?'disabled':''}><span class="cap">${u?'':ic('plus')}${p}</span></label>`}));
 const tl=ms.length?(await Promise.all(ms.map(async m=>{const u=await pURL(m+'|'+evoPose),w=(meta()[m]||{}).peso;return`<div class="tlc press ${m===evoM?'now':''}" data-m="${m}">${u?`<img src="${u}" alt="">`:`<div class="nop">${ic('image')}</div>`}<div class="meta"><b>${mShort(m)}</b><span>${w?esc(w)+' kg':'&nbsp;'}</span></div></div>`}))).join(''):'';
 V.innerHTML=header('Fotos mensais','Evolução',setBtn())+`<div class="wrap stag">
 <div class="card"><div class="mnav"><button class="ibtn" id="mP">${ic('chevL')}</button><div class="mlab"><b>${mName(evoM)}</b><span class="t-sm">${evoM.slice(0,4)} · ${POSES.filter(p=>ks.includes(evoM+'|'+p)).length}/3 fotos</span><input type="month" id="mPick" value="${evoM}" max="${curM()}"></div><button class="ibtn" id="mN" ${evoM>=curM()?'disabled style="opacity:.25"':''}>${ic('chevR')}</button></div>
 <div class="slots">${slots.join('')}</div>
 <p class="t-xs" style="text-align:center;margin:12px 0 0">${prevM?'A foto clarinha é do mês anterior: use de guia pra repetir a pose':'Mesma luz, mesma distância e mesma pose todo mês'}</p>
 <div class="row" style="margin-top:var(--s4);align-items:flex-start"><div style="width:36%"><label class="f">Peso</label><div style="position:relative"><input id="peso" inputmode="decimal" placeholder="—" value="${esc(mt.peso)}"><span class="t-sm" style="position:absolute;right:12px;top:15px">kg</span></div></div><div class="grow"><label class="f">Notas</label><input id="notas" placeholder="Como se sente?" value="${esc(mt.notas)}"></div></div></div>
 <div class="row between" style="margin:var(--s6) 4px var(--s3)"><h2 class="sec" style="margin:0">Linha do tempo</h2><button class="btn sm soft" id="tips">${ic('camera')}Dicas</button></div>
 ${seg('pT',POSES.map(p=>[p,p]),evoPose)}<div style="height:12px"></div>
 ${ms.length?`<div class="tl">${tl}</div>`:`<div class="card">${empty('photo','Sua jornada começa aqui','Registre frente, lado e costas. Daqui a um mês você vai amar comparar.')}</div>`}</div>`;
 const setM=m=>{evoM=m;haptic();rerender()};
 $('#mP').onclick=()=>setM(addM(evoM,-1));$('#mN').onclick=()=>{if(evoM<curM())setM(addM(evoM,1))};$('#mPick').onchange=e=>e.target.value&&setM(e.target.value);
 $$('.slot input').forEach(i=>i.onchange=async()=>{const f=i.files[0];if(!f)return;const k=evoM+'|'+i.dataset.pose,sl=i.closest('.slot');sl.classList.add('loading');
  try{await pPut(k,await compress(f));dropURL(k);bust();syncSoon();haptic(15);toast(`${i.dataset.pose} salva`)}catch{toast('Não deu pra salvar a foto')}rerender()});
 $$('[data-del]').forEach(b=>b.onclick=async e=>{e.preventDefault();e.stopPropagation();if(!confirm('Remover esta foto?'))return;const k=evoM+'|'+b.dataset.del;await pDel(k);dropURL(k);bust();syncSoon();rerender()});
 const sv=()=>{const m=meta(),o={peso:$('#peso').value.trim(),notas:$('#notas').value.trim()};if(o.peso||o.notas)m[evoM]=o;else delete m[evoM];LS.set('me_meta',m)};$('#peso').onchange=sv;$('#notas').onchange=sv;
 bindSeg('pT',v=>{evoPose=v;LS.set('me_pose',v);rerender()});
 $$('.tlc').forEach(c=>c.onclick=()=>{evoM=c.dataset.m;haptic();go('evo','u')});
 $('#tips').onclick=()=>sheet(`<div class="disp" style="font-size:26px;margin-bottom:12px">Fotos consistentes</div>${[['sun','Mesma luz','De preferência luz natural, de frente pra janela.'],['user','Mesma distância','Corpo inteiro no quadro, celular na altura do umbigo.'],['clock','Mesmo horário','De manhã, em jejum, é o ideal pra comparar.'],['image','Use o guia','A foto clarinha do mês anterior ajuda a repetir a pose.']].map(([i,t,d])=>`<div class="feat"><div class="ico-b" style="background:var(--rose-s);color:var(--rose)">${ic(i)}</div><div><b>${t}</b><div class="t-sm">${d}</div></div></div>`).join('')}<button class="btn full" style="margin-top:18px" id="ok">Entendi</button>`,(s,c)=>$('#ok',s).onclick=c)}
/* ---------- comparar ---------- */
let cmp=LS.get('me_cmp',{a:null,b:null,p:'Frente',mode:'slider'});
async function renderCmp(){const ms=await months();
 if(ms.length<2){V.innerHTML=header('Antes e depois','Comparar',setBtn())+`<div class="wrap"><div class="card">${empty('mirror','Falta um mês','Com fotos de dois meses diferentes você compara aqui, com o deslizador ou lado a lado.',`<button class="btn" id="goE">${ic('camera')}Adicionar fotos</button>`)}</div></div>`;$('#goE').onclick=()=>go('evo');return}
 if(!ms.includes(cmp.a))cmp.a=ms[ms.length-1];if(!ms.includes(cmp.b))cmp.b=ms[0];
 const opt=s=>ms.map(m=>`<option value="${m}" ${m===s?'selected':''}>${mName(m).slice(0,3)} ${m.slice(0,4)}</option>`).join('');
 const ua=await pURL(cmp.a+'|'+cmp.p),ub=await pURL(cmp.b+'|'+cmp.p),ma=meta()[cmp.a]||{},mb=meta()[cmp.b]||{};
 const wa=num(ma.peso),wb=num(mb.peso),dw=!isNaN(wa)&&!isNaN(wb)?wb-wa:null;
 const span=(+cmp.b.slice(0,4)-+cmp.a.slice(0,4))*12+(+cmp.b.slice(5)-+cmp.a.slice(5));
 let viz;if(!ua||!ub)viz=empty('photo','Falta uma foto',`Não tem foto de <b>${cmp.p.toLowerCase()}</b> em ${mLabel(!ua?cmp.a:cmp.b)}.`);
 else if(cmp.mode==='sbs')viz=`<div class="sbs"><div><img src="${ua}"><span class="tag" style="left:10px">${mShort(cmp.a)}</span></div><div><img src="${ub}"><span class="tag" style="right:10px">${mShort(cmp.b)}</span></div></div>`;
 else viz=`<div class="ba" id="ba"><img src="${ub}" alt=""><img class="top" src="${ua}" alt=""><div class="bar"></div><div class="knob">${ic('arrows')}</div><span class="tag" style="left:12px">${mShort(cmp.a)}</span><span class="tag" style="right:12px">${mShort(cmp.b)}</span></div>`;
 V.innerHTML=header('Antes e depois','Comparar',setBtn())+`<div class="wrap stag">
 <div class="card"><div class="row"><div class="grow"><label class="f">Antes</label><select id="cA">${opt(cmp.a)}</select></div><div style="padding-top:22px;color:var(--tx3)">${ic('chevR')}</div><div class="grow"><label class="f">Depois</label><select id="cB">${opt(cmp.b)}</select></div></div>
 <div style="height:12px"></div>${seg('cP',POSES.map(p=>[p,p]),cmp.p)}</div>
 <div class="card" style="padding:10px">${viz}${ua&&ub?`<div style="height:10px"></div>${seg('cM',[['slider','Deslizar'],['sbs','Lado a lado']],cmp.mode)}`:''}</div>
 <h2 class="sec">Resumo</h2>
 <div class="g2"><div class="card stat" style="margin:0"><div class="ico-b" style="background:var(--sage-s);color:var(--sage)">${ic('scale')}</div><div class="v" style="margin-top:10px">${dw==null?'—':(dw>0?'+':'')+dw.toFixed(1).replace('.',',')}<span class="t-sm"> kg</span></div><div class="t-sm">${dw==null?'Registre o peso nos dois meses':`${esc(ma.peso)} → ${esc(mb.peso)} kg`}</div></div>
 <div class="card stat" style="margin:0"><div class="ico-b" style="background:var(--plum-s);color:var(--plum)">${ic('cal')}</div><div class="v" style="margin-top:10px">${Math.abs(span)}<span class="t-sm"> ${Math.abs(span)===1?'mês':'meses'}</span></div><div class="t-sm">de ${mShort(cmp.a)} a ${mShort(cmp.b)}</div></div></div>
 ${ma.notas||mb.notas?`<div class="card" style="margin-top:12px">${[[cmp.a,ma],[cmp.b,mb]].filter(x=>x[1].notas).map(([m,o])=>`<div style="margin:4px 0"><b class="t-sm" style="color:var(--rose)">${mShort(m)}</b><div>${esc(o.notas)}</div></div>`).join('')}</div>`:''}</div>`;
 const save=()=>{LS.set('me_cmp',cmp);rerender()};
 $('#cA').onchange=e=>{cmp.a=e.target.value;save()};$('#cB').onchange=e=>{cmp.b=e.target.value;save()};
 bindSeg('cP',v=>{cmp.p=v;save()});bindSeg('cM',v=>{cmp.mode=v;save()});
 const ba=$('#ba');if(ba){const set=x=>{const r=ba.getBoundingClientRect(),p=Math.max(0,Math.min(100,(x-r.left)/r.width*100));$('.top',ba).style.clipPath=`inset(0 ${100-p}% 0 0)`;$('.bar',ba).style.left=p+'%';$('.knob',ba).style.left=p+'%'};
  let dn=false;ba.onpointerdown=e=>{dn=true;ba.setPointerCapture(e.pointerId);set(e.clientX);haptic(5)};ba.onpointermove=e=>dn&&set(e.clientX);ba.onpointerup=ba.onpointercancel=()=>dn=false}}
/* ---------- rotina ---------- */
let rotD=today();
function renderRot(){const d=rotD,isT=d===today(),list=tasksFor(d),done=new Set(D()[d]||[]),s=dayStat(d),st=streak();
 const dt=new Date(d+'T12:00'),lab=isT?'Hoje':dt.toLocaleDateString('pt-BR',{weekday:'long'}),sub=dt.toLocaleDateString('pt-BR',{day:'numeric',month:'long'});
 const strip=[];for(let i=-3;i<=3;i++){const k=addD(d,i);if(k>today())continue;const x=new Date(k+'T12:00'),ds=dayStat(k);strip.push(`<button class="dchip ${k===d?'on':''}" data-d="${k}"><span>${DOW[x.getDay()]}</span><b>${x.getDate()}</b><i style="opacity:${ds.t?.25+ds.p*.75:0}"></i></button>`)}
 V.innerHTML=header(sub,`<span style="text-transform:capitalize">${lab}</span>`,setBtn())+`<div class="wrap stag">
 <div class="dstrip">${strip.join('')}</div>
 <div class="card"><div class="row" style="gap:18px">${ring(s.p,104,10,Math.round(s.p*100)+'%','')}<div class="grow"><div class="t-lg">${s.t===0?'Comece sua rotina':s.p===1?'Dia completo':s.n+' de '+s.t+' feitas'}</div><div class="t-sm" style="margin-top:4px">${s.p===1?'Todas as tarefas concluídas':s.t?`Faltam ${s.t-s.n}`:'Adicione tarefas em cada período'}</div><div class="row" style="gap:6px;margin-top:10px"><span class="cnt" style="display:inline-flex;align-items:center;gap:4px;color:var(--peach);background:var(--peach-s)">${ic('flame')}${st} ${st===1?'dia':'dias'}</span></div></div></div></div>
 ${SECS.map(([k,l,i])=>{const ts=sortT(list.filter(t=>t.sec===k)),dn=ts.filter(t=>done.has(t.id)).length;
  return`<div class="card"><div class="sech"><div class="ico-b" style="background:var(--bg2);color:var(--tx2)">${ic(i)}</div><div class="t-lg">${l}</div>${ts.length?`<span class="cnt">${dn}/${ts.length}</span>`:''}<button class="ibtn" data-add="${k}" aria-label="Adicionar em ${l}" style="color:var(--rose);background:var(--rose-s);width:38px;height:38px;border-radius:12px">${ic('plus')}</button></div>
  ${ts.length?ts.map(t=>{const c=catOf(t);return`<div class="task ${done.has(t.id)?'done':''}" data-id="${t.id}" style="--c:${c[2]};--cs:${c[3]}"><button class="chk" aria-label="Marcar ${esc(t.t)}"><svg viewBox="0 0 24 24" class="i"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></button><div class="grow" data-ed="${t.id}" style="cursor:pointer"><div class="tt">${esc(t.t)}</div><div class="tmeta"><span class="tag2">${ic(c[1])}${c[0]}</span>${t.time?`<span style="display:inline-flex;align-items:center;gap:3px">${ic('clock')}${t.time}</span>`:''}${t.date?'<span class="once">só neste dia</span>':''}</div></div><button class="ibtn" data-ed="${t.id}" aria-label="Editar">${ic('dots')}</button></div>`}).join(''):`<button class="addrow" data-add="${k}">${ic('plus')}Adicionar tarefa</button>`}</div>`}).join('')}
 ${T().length?'':`<div class="card">${empty('list','Sua rotina, do seu jeito','Crie tarefas pra manhã, tarde e noite. Elas voltam zeradas todo dia.')}</div>`}
 <h2 class="sec">Esta semana</h2><div class="card">${weekChart()}</div>
 <h2 class="sec">Últimos 28 dias</h2><div class="card"><div class="heat">${heat()}</div><div class="row" style="gap:12px;margin-top:12px;font-size:12px;color:var(--tx2)"><span class="row" style="gap:5px"><i style="width:12px;height:12px;border-radius:4px;background:var(--rose-s)"></i>começou</span><span class="row" style="gap:5px"><i style="width:12px;height:12px;border-radius:4px;background:var(--rose2)"></i>metade+</span><span class="row" style="gap:5px"><i style="width:12px;height:12px;border-radius:4px;background:var(--grad)"></i>completo</span></div></div></div>`;
 $$('.dchip').forEach(b=>b.onclick=()=>{haptic();const nd=b.dataset.d;const dir=nd>rotD?'r':'l';rotD=nd;go('rot',dir)});
 $$('.task .chk').forEach(b=>b.onclick=()=>toggle(b));
 $$('[data-add]').forEach(b=>b.onclick=()=>{haptic();editTask(null,b.dataset.add)});$$('[data-ed]').forEach(b=>b.onclick=()=>{haptic();editTask(b.dataset.ed)})}
function toggle(b){const row=b.closest('.task'),id=row.dataset.id,d=rotD,all=D(),s=new Set(all[d]||[]),was=dayStat(d).p,on=!s.has(id);on?s.add(id):s.delete(id);all[d]=[...s];LS.set('me_done',all);
 haptic(on?14:6);row.classList.toggle('done',on);b.classList.remove('pop','burst');void b.offsetWidth;if(on)b.classList.add('pop','burst');
 const np=dayStat(d).p;setTimeout(()=>{rerender();if(np===1&&was<1){confetti();toast('Dia completo!')}},420)}
function heat(){const out=[];for(let i=27;i>=0;i--){const k=addD(today(),-i),s=dayStat(k),c=!s.t||!s.n?'':s.p===1?'p3':s.p>=.5?'p2':'p1';out.push(`<div class="${c} ${i===0?'td':''}" title="${k}">${new Date(k+'T12:00').getDate()}</div>`)}return out.join('')}
function editTask(id,sec){const ts=T(),t=id?{...ts.find(x=>x.id===id)}:{id:uid(),t:'',sec,time:'',date:null,cat:'saude',ord:Date.now()};t.cat=t.cat||'outros';let once=!!t.date;
 sheet(`<div class="disp" style="font-size:28px;margin-bottom:16px">${id?'Editar tarefa':'Nova tarefa'}</div>
 <label class="f">Tarefa</label><input id="fT" placeholder="Ex: Beber 2L de água" value="${esc(t.t)}" maxlength="80">
 <label class="f" style="margin-top:16px">Categoria</label><div class="cats" id="fC">${Object.entries(CATS).map(([k,c])=>`<button data-c="${k}" class="${k===t.cat?'on':''}" style="--c:${c[2]};--cs:${c[3]}">${ic(c[1])}${c[0]}</button>`).join('')}</div>
 <div class="row" style="margin-top:16px;align-items:flex-end"><div class="grow"><label class="f">Período</label><select id="fS">${SECS.map(([k,l])=>`<option value="${k}" ${k===t.sec?'selected':''}>${l}</option>`).join('')}</select></div><div style="width:42%"><label class="f">Horário</label><input id="fH" type="time" value="${t.time||''}"></div></div>
 <label class="f" style="margin-top:16px">Repetir</label>${seg('fR',[['0','Todo dia'],['1','Só um dia']],once?'1':'0')}
 <input id="fD" type="date" value="${t.date||rotD}" style="margin-top:10px;${once?'':'display:none'}">
 <button class="btn full" id="fOk" style="margin-top:22px">${id?'Salvar':'Adicionar'}</button>
 ${id?`<button class="btn full plain" id="fDel" style="margin-top:10px;color:#D0546A">${ic('trash')}Excluir tarefa</button>`:''}`,(s,close)=>{
  placePills();$$('#fC button',s).forEach(b=>b.onclick=()=>{haptic();t.cat=b.dataset.c;$$('#fC button',s).forEach(x=>x.classList.toggle('on',x===b))});
  bindSeg('fR',v=>{once=v==='1';$('#fD').style.display=once?'':'none'});
  $('#fOk',s).onclick=()=>{const v=$('#fT').value.trim();if(!v){$('#fT').focus();$('#fT').style.borderColor='var(--rose)';return}Object.assign(t,{t:v,sec:$('#fS').value,time:$('#fH').value,date:once?$('#fD').value:null});
   LS.set('me_tasks',id?ts.map(x=>x.id===id?t:x):[...ts,t]);haptic(12);close();toast(id?'Tarefa salva':'Tarefa adicionada');rerender()};
  if(id)$('#fDel',s).onclick=()=>{if(!confirm('Excluir esta tarefa?'))return;LS.set('me_tasks',ts.filter(x=>x.id!==id));close();rerender()};
  if(!id)setTimeout(()=>$('#fT').focus(),350)})}
function confetti(){const c=document.createElement('canvas');c.className='confetti';const W=c.width=innerWidth*2,H=c.height=innerHeight*2;document.body.append(c);const g=c.getContext('2d'),cols=['#E2749A','#F2B8C8','#C46FB6','#8A6AD6','#F2A579','#E9B44C','#5FB38C'];
 const ps=[];for(let k=0;k<2;k++)for(let i=0;i<90;i++)ps.push({x:k?W*.85:W*.15,y:H*.75,vx:(k?-1:1)*(Math.random()*22+6),vy:-Math.random()*44-22,s:Math.random()*14+8,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[Math.random()*cols.length|0],t:Math.random()<.3});let f=0;
 (function st(){g.clearRect(0,0,W,H);for(const p of ps){p.vy+=1.1;p.vx*=.985;p.vy*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.globalAlpha=Math.max(0,1-f/150);g.fillStyle=p.c;if(p.t){g.beginPath();g.arc(0,0,p.s/3,0,7);g.fill()}else g.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);g.restore()}if(++f<150)requestAnimationFrame(st);else c.remove()})()}
/* ---------- settings / backup ---------- */
const b64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
function openSettings(){const p=prof();sheet(`<div class="disp" style="font-size:28px;margin-bottom:16px">Ajustes</div>
 <label class="f">Seu nome</label><input id="sN" value="${esc(p.name)}" placeholder="Como quer ser chamada?">
 <div class="feat" style="margin-top:18px;background:var(--sage-s);border:0"><div class="ico-b" style="background:var(--surf);color:var(--sage)">${ic('shield')}</div><div><b>Seus dados são só seus</b><div class="t-sm">Fotos e rotina ficam salvas apenas neste iPhone. Faça backup de vez em quando e guarde no Arquivos ou iCloud.</div></div></div>
 <button class="btn full" id="bEx" style="margin-top:16px">${ic('download')}Exportar backup</button>
 <label class="btn full plain" style="margin-top:10px">${ic('upload')}Importar backup<input type="file" id="bIm" accept=".json,application/json" hidden></label>
 ${notifSection()}
 <p class="t-xs" style="text-align:center;margin-top:16px">Minha Evolução · v3</p>`,(s,close)=>{bindNotif(s,close);
 $('#sN',s).onchange=e=>{LS.set('me_profile',{...prof(),name:e.target.value.trim()});if(tab==='home')rerender()};
 $('#bEx',s).onclick=async()=>{const ks=await pKeys(),ph={};for(const k of ks)ph[k]=await b64(await pGet(k));const data={app:'minha-evolucao',v:2,at:new Date().toISOString(),profile:prof(),meta:meta(),tasks:T(),done:D(),photos:ph};
  const bl=new Blob([JSON.stringify(data)],{type:'application/json'}),name=`minha-evolucao-${today()}.json`,file=new File([bl],name,{type:'application/json'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Backup Minha Evolução'});return}catch(e){if(e.name==='AbortError')return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=name;document.body.append(a);a.click();a.remove();toast('Backup exportado')};
 $('#bIm',s).onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(d.app!=='minha-evolucao')throw 0;if(!confirm('Importar vai substituir os dados atuais. Continuar?'))return;
  if(d.profile)LS.set('me_profile',{...d.profile,onboarded:true});LS.set('me_meta',d.meta||{});LS.set('me_tasks',d.tasks||[]);LS.set('me_done',d.done||{});await tx('readwrite',s=>s.clear());
  for(const[k,u]of Object.entries(d.photos||{})){await pPut(k,await(await fetch(u)).blob());dropURL(k)}bust();close();toast('Backup restaurado');rerender()}catch{toast('Arquivo de backup inválido')}}})}
/* ---------- onboarding ---------- */
function onboarding(){const o=document.createElement('div');o.className='ob';let i=0;
 o.innerHTML=`<div class="pages">
 <div class="pg">${OBART[0]}<div class="eyebrow" style="color:var(--rose)">Bem-vinda</div><h1 class="disp">Minha<br><em style="font-style:italic;color:var(--rose)">Evolução</em></h1><p>Seu cantinho pra acompanhar o corpo e a rotina, com carinho e no seu ritmo.</p></div>
 <div class="pg r">${OBART[1]}<div class="eyebrow" style="color:var(--rose)">Mês a mês</div><h1 class="disp">Veja sua<br><em style="font-style:italic;color:var(--rose)">transformação</em></h1><p>Fotos de frente, lado e costas todo mês, com guia de enquadramento e comparação antes e depois.</p></div>
 <div class="pg r">${OBART[2]}<div class="eyebrow" style="color:var(--rose)">Quase lá</div><h1 class="disp">Como posso<br><em style="font-style:italic;color:var(--rose)">te chamar?</em></h1><input class="nm" id="obN" placeholder="Seu nome" autocomplete="given-name" maxlength="24"><p class="t-xs" style="text-align:center;font-size:13px">Tudo fica só no seu celular.</p></div>
 </div><div class="dots"><i class="on"></i><i></i><i></i></div><button class="btn full" id="obB">Começar</button><button class="btn full plain" id="obS" style="margin-top:8px;background:none">Pular</button>`;
 document.body.append(o);const pg=$$('.pg',o),dots=$$('.dots i',o),B=$('#obB',o);
 const show=()=>{pg.forEach((p,k)=>p.className='pg'+(k<i?' l':k>i?' r':''));dots.forEach((d,k)=>d.classList.toggle('on',k===i));B.textContent=i===0?'Começar':i===1?'Continuar':'Entrar';$('#obS',o).style.visibility=i===2?'hidden':'visible'};
 const fin=()=>{LS.set('me_profile',{...prof(),name:($('#obN',o).value||'').trim(),onboarded:true});o.style.transition='opacity .5s,transform .5s';o.style.opacity=0;o.style.transform='scale(1.04)';setTimeout(()=>o.remove(),500);go('home','u')};
 B.onclick=()=>{haptic();if(i<2){i++;show();if(i===2)setTimeout(()=>$('#obN',o).focus(),500)}else fin()};$('#obS',o).onclick=()=>{i=2;show()};
 $('#obN',o).onkeydown=e=>{if(e.key==='Enter')fin()};
 let x0=null;o.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});o.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;if(dx<-50&&i<2){i++;show()}else if(dx>50&&i>0){i--;show()}x0=null})}
/* ---------- boot ---------- */
addEventListener('resize',()=>{placeBlob();placePills()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&rotD!==today()&&tab!=='rot')rotD=today();if(!document.hidden)rerender()});
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
setTimeout(()=>window.syncSoon&&syncSoon(500),2500);(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{go('home','u');if(!prof().onboarded)onboarding()});
