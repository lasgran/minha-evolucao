'use strict';
const PUSH_API=localStorage.getItem('me_push_api')||'https://minha-evolucao-push.lasgran.workers.dev',VAPID_PUB='BKsrGve4vhjc1xcucfI1zRArIB_XsIOLpWS3NnzWjIVM-ybo8Qxh2FmiPt71VDmfjWTKiLzDEfwSyMBveI6K4SU';
const PS={get:()=>LS.get('me_push',{}),set:v=>LS.set('me_push',{...PS.get(),...v})};
const isIOS=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const isStandalone=()=>navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;
const pushSupported=()=>'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;
const pushId=()=>{let p=PS.get();if(!p.id){p.id=(crypto.randomUUID?crypto.randomUUID():uid()+uid()+uid()).replace(/-/g,'').slice(0,32);PS.set({id:p.id})}return p.id};
const prefsP=()=>({task:true,evening:true,photo:true,...(PS.get().prefs||{})});
const tz=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'America/Sao_Paulo'}catch{return'America/Sao_Paulo'}};
const u8=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((s.length+3)%4)),c=>c.charCodeAt(0));
async function api(path,body){const r=await fetch(PUSH_API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:pushId(),...body})});const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||r.status),{status:r.status});return j}
async function snapshot(){const d=today(),l=tasksFor(d),dn=new Set(D()[d]||[]),ks=await keys(),mp={};ks.forEach(k=>{const m=k.split('|')[0];mp[m]=(mp[m]||0)+1});
 return{tz:tz(),prefs:prefsP(),tasks:T().filter(t=>t.time).map(t=>({id:t.id,t:t.t,time:t.time,date:t.date||null})),sync:{day:d,pending:l.filter(t=>!dn.has(t.id)).length,monthPhotos:mp}}}
let syncT;function syncSoon(ms=1500){if(!PS.get().on)return;clearTimeout(syncT);syncT=setTimeout(async()=>{try{await api('/sync',await snapshot())}catch(e){if(e.status===404)resubscribe()}},ms)}
async function subscribe(){const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(VAPID_PUB)});
 await api('/subscribe',{sub:sub.toJSON(),...await snapshot()});PS.set({on:true});return sub}
async function resubscribe(){try{if(Notification.permission==='granted')await subscribe()}catch{}}
async function enablePush(){if(!pushSupported())throw new Error('unsupported');const perm=await Notification.requestPermission();if(perm!=='granted')throw new Error('denied');return subscribe()}
async function disablePush(){try{const reg=await navigator.serviceWorker.ready,s=await reg.pushManager.getSubscription();s&&await s.unsubscribe()}catch{}try{await api('/unsubscribe',{})}catch{}PS.set({on:false})}
const _set=LS.set;LS.set=(k,v)=>{_set(k,v);if(k==='me_tasks'||k==='me_done')syncSoon()};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncSoon(500)});
function notifSection(){const on=PS.get().on&&typeof Notification!=='undefined'&&Notification.permission==='granted',pr=prefsP();
 if(isIOS()&&!isStandalone())return`<div class="feat" style="margin-top:18px;background:var(--sun-s);border:0;align-items:flex-start"><div class="ico-b" style="background:var(--surf);color:var(--sun)">${ic('bell')}</div><div><b>Notificações no iPhone</b><div class="t-sm" style="margin-top:4px">Elas só funcionam com o app na tela de início:<br>1. Toque em <b>Compartilhar</b> (o quadrado com a seta) no Safari<br>2. Escolha <b>Adicionar à Tela de Início</b><br>3. Abra o app pelo ícone e volte aqui em Ajustes</div></div></div>`;
 if(!pushSupported())return`<div class="feat" style="margin-top:18px"><div class="ico-b" style="background:var(--bg2);color:var(--tx2)">${ic('bell')}</div><div><b>Notificações indisponíveis</b><div class="t-sm">Este navegador não suporta notificações. No iPhone, precisa do iOS 16.4 ou mais novo.</div></div></div>`;
 if(Notification.permission==='denied')return`<div class="feat" style="margin-top:18px"><div class="ico-b" style="background:var(--rose-s);color:var(--rose)">${ic('bell')}</div><div><b>Notificações bloqueadas</b><div class="t-sm">Libere em Ajustes do iPhone → Notificações → Evolução.</div></div></div>`;
 const tg=(k,t,d)=>`<label class="tgl"><div class="grow"><b>${t}</b><div class="t-sm">${d}</div></div><input type="checkbox" data-pref="${k}" ${pr[k]?'checked':''}><span></span></label>`;
 return`<label class="f" style="margin-top:20px">Notificações</label>${on?`<div class="card" style="padding:6px 16px;margin:0">${tg('task','Lembrete das tarefas','No horário de cada tarefa com hora')}${tg('evening','Resumo das 20h','Se ainda tiver tarefas pendentes')}${tg('photo','Fotos do mês','Dia 1 às 10h e dia 5 se faltar foto')}</div>
 <div class="row" style="margin-top:10px"><button class="btn plain grow" id="nTest">${ic('bell')}Enviar notificação de teste</button></div><button class="btn plain full" id="nOff" style="margin-top:8px;background:none;color:var(--tx2);min-height:40px">Desativar notificações</button>`
 :`<button class="btn full" id="nOn">${ic('bell')}Ativar notificações</button><p class="t-xs" style="text-align:center;margin-top:6px">Lembretes das tarefas, resumo das 20h e fotos do mês</p>`}`}
function bindNotif(s,close){const on=$('#nOn',s);if(on)on.onclick=async()=>{on.disabled=true;on.textContent='Ativando…';try{await enablePush();haptic(15);toast('Notificações ativadas');close();setTimeout(openSettings,450)}catch(e){on.disabled=false;on.innerHTML=ic('bell')+'Ativar notificações';toast(e.message==='denied'?'Permissão negada':'Não deu pra ativar agora')}};
 const t=$('#nTest',s);if(t)t.onclick=async()=>{t.disabled=true;try{const r=await api('/test',{});toast(r.ok?'Enviada! Confira em instantes':'Falhou, tente reativar')}catch(e){toast(e.status===429?'Aguarde uns segundos':'Sem conexão com o servidor')}setTimeout(()=>t.disabled=false,3000)};
 const off=$('#nOff',s);if(off)off.onclick=async()=>{await disablePush();toast('Notificações desativadas');close()};
 $$('[data-pref]',s).forEach(c=>c.onchange=()=>{PS.set({prefs:{...prefsP(),[c.dataset.pref]:c.checked}});haptic();syncSoon(200)})}
