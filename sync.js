'use strict';
/* ---------- conta por e-mail + sincronização ---------- */
const AC={get:()=>LS.get('me_acct',{}),set:v=>localStorage.setItem('me_acct',JSON.stringify(v))};
const SY={get:()=>LS.get('me_sync',{}),set:v=>localStorage.setItem('me_sync',JSON.stringify(v))};
const DOCK=['profile','meta','tasks','done'];
const logged=()=>!!AC.get().token;
let mailOn=LS.get('me_mail_on',false);
async function aReq(method,path,body,raw){const h={};const t=AC.get().token;if(t)h.Authorization='Bearer '+t;if(body&&!raw)h['Content-Type']='application/json';
 const r=await fetch(PUSH_API+path,{method,headers:h,body:raw?body:body?JSON.stringify(body):undefined});
 if(raw==='blob'&&r.ok)return r.blob();const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||r.status),{status:r.status});return j}
fetch(PUSH_API+'/auth/status').then(r=>r.json()).then(j=>{mailOn=!!j.mail;localStorage.setItem('me_mail_on',JSON.stringify(mailOn))}).catch(()=>{});
/* rastreia mudanças locais */
let applying=false;const _lset=LS.set;
LS.set=(k,v)=>{_lset(k,v);const K=k.slice(3);if(!applying&&k.startsWith('me_')&&DOCK.includes(K)){const s=SY.get();s.ts={...(s.ts||{}),[K]:Date.now()};SY.set(s);syncLater()}};
function phMark(k,del){const s=SY.get();s.ph={...(s.ph||{}),[k]:del?{ts:Date.now(),del:true}:{ts:Date.now()}};SY.set(s);syncLater()}
function phMarkAll(keysNow){const s=SY.get(),n=Date.now(),ph={};for(const k of keysNow)ph[k]={ts:n};for(const k in s.ph||{})if(!ph[k])ph[k]={ts:n,del:true};s.ph=ph;s.ts={profile:n,meta:n,tasks:n,done:n};SY.set(s);syncLater()}
const nonEmpty=v=>v!=null&&(Array.isArray(v)?v.length>0:typeof v==='object'?Object.keys(v).length>0:true);
function merge(K,l,s){if(K==='tasks'){const m=new Map();(l||[]).forEach(t=>m.set(t.id,t));(s||[]).forEach(t=>m.set(t.id,t));return[...m.values()]}
 if(K==='done'){const o={...(l||{})};for(const[d,ids]of Object.entries(s||{}))o[d]=[...new Set([...(o[d]||[]),...ids])];return o}
 if(K==='meta')return{...(l||{}),...(s||{})};
 return{...(l||{}),...(s||{}),name:(s&&s.name)||(l&&l.name)||'',onboarded:true}}
let syT,busy=false,again=false;
function syncLater(ms=1800){if(!logged())return;clearTimeout(syT);syT=setTimeout(syncNow,ms)}
async function syncNow(){if(!logged()||!navigator.onLine)return;if(busy){again=true;return}busy=true;let changed=false;
 try{const st=SY.get(),ts={...(st.ts||{})},ph={...(st.ph||{})},first=!st.first,now=Date.now(),up={k:{},ph:{}};
  const d=await aReq('GET','/data/doc');
  const apply=(K,v)=>{applying=true;try{LS.set('me_'+K,v)}finally{applying=false}changed=true};
  for(const K of DOCK){const lv=LS.get('me_'+K,null),s=d.k[K];
   if(first){if(s&&nonEmpty(lv)){const m=merge(K,lv,s.v);apply(K,m);ts[K]=now;up.k[K]={v:m,ts:now}}else if(s){apply(K,s.v);ts[K]=s.ts}else if(nonEmpty(lv)){ts[K]=now;up.k[K]={v:lv,ts:now}}}
   else{const lt=ts[K]||0,stt=s?s.ts:0;if(lt>stt&&lv!=null)up.k[K]={v:lv,ts:lt};else if(stt>lt){apply(K,s.v);ts[K]=stt}}}
  const lk=new Set(await pKeys());
  for(const k of lk){const s=d.ph[k];if(!ph[k]||ph[k].del)ph[k]={ts:(s&&!s.del&&first)?0:first?now:(ph[k]&&!ph[k].del?ph[k].ts:now)};
   const lt=ph[k].ts;
   if(s&&s.ts>=lt){if(s.del){await pDel(k);dropURL(k);delete ph[k];changed=true}else if(s.ts>lt){await pPut(k,await aReq('GET','/data/photo?k='+encodeURIComponent(k),null,'blob'));dropURL(k);ph[k]={ts:s.ts};changed=true}}
   else{const b=await pGet(k);if(b){await aReq('PUT','/data/photo?k='+encodeURIComponent(k)+'&ts='+lt,b,true)}}}
  for(const[k,s]of Object.entries(d.ph)){if(lk.has(k))continue;const l=ph[k];
   if(l&&l.del&&l.ts>s.ts){if(!s.del)up.ph[k]={ts:l.ts,del:true}}
   else if(!s.del&&s.ts>(l?l.ts:0)){await pPut(k,await aReq('GET','/data/photo?k='+encodeURIComponent(k),null,'blob'));dropURL(k);ph[k]={ts:s.ts};changed=true}
   else if(s.del)delete ph[k]}
  for(const[k,l]of Object.entries(ph))if(l.del&&!d.ph[k])up.ph[k]=l;
  if(Object.keys(up.k).length||Object.keys(up.ph).length)await aReq('POST','/data/sync',up);
  SY.set({...SY.get(),ts,ph,first:true,last:Date.now()});
 }catch(e){if(e.status===401){AC.set({});toast('Sessão expirada, entre de novo')}}
 finally{busy=false;if(changed){bust();rerender();window.syncSoon&&syncSoon(800)}if(again){again=false;syncLater(300)}}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncLater(400)});
addEventListener('online',()=>syncLater(400));
setInterval(()=>{if(!document.hidden)syncLater(10)},45000);
if(logged())syncLater(800);
/* ---------- UI ---------- */
const ago=t=>{if(!t)return'ainda não';const s=(Date.now()-t)/1000;return s<60?'agora mesmo':s<3600?`há ${Math.round(s/60)} min`:new Date(t).toLocaleString('pt-BR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})};
function dataNote(){return logged()?'Fotos e rotina ficam neste aparelho e sincronizadas na sua conta. Entre com o mesmo e-mail no celular e no computador.':'Fotos e rotina ficam salvas apenas neste aparelho. Entre com seu e-mail pra usar no celular e no computador, ou faça backup de vez em quando.'}
function acctSection(){const a=AC.get();
 if(a.token)return`<label class="f" style="margin-top:20px">Sua conta</label><div class="card acct" style="margin:0"><div class="row"><div class="ico-b" style="background:var(--plum-s);color:var(--plum)">${ic('user')}</div><div class="grow"><b style="word-break:break-all">${esc(a.email)}</b><div class="t-sm" id="aLast">Sincronizado ${ago(SY.get().last)}</div></div></div>
 <div class="row" style="margin-top:12px"><button class="btn plain grow sm" id="aSync">${ic('arrows')}Sincronizar agora</button><button class="btn plain sm" id="aOut" style="color:var(--tx2)">Sair</button></div></div>`;
 if(!mailOn)return'';
 return`<label class="f" style="margin-top:20px">Sua conta</label><button class="btn full" id="aIn">${ic('user')}Entrar com e-mail</button><p class="t-xs" style="text-align:center;margin-top:6px">Mesma conta no celular e no computador, tudo sincronizado</p>`}
function bindAcct(s,close){const i=$('#aIn',s);if(i)i.onclick=()=>{close();setTimeout(loginSheet,420)};
 const y=$('#aSync',s);if(y)y.onclick=async()=>{y.disabled=true;await syncNow();$('#aLast',s).textContent='Sincronizado '+ago(SY.get().last);toast('Sincronizado');y.disabled=false};
 const o=$('#aOut',s);if(o)o.onclick=async()=>{if(!confirm('Sair da conta? Seus dados continuam neste aparelho.'))return;try{await aReq('POST','/auth/logout',{})}catch{}AC.set({});const st=SY.get();delete st.first;SY.set(st);close();toast('Você saiu da conta')}}
function loginSheet(){let email=LS.get('me_last_email','');
 sheet(`<div class="disp" style="font-size:28px;margin-bottom:6px">Entrar</div><p class="t-sm" style="margin-bottom:18px">Vamos mandar um código de 6 dígitos pro seu e-mail. Seus dados atuais vão junto pra conta.</p>
 <div id="st1"><label class="f">E-mail</label><input id="lE" type="email" inputmode="email" autocomplete="email" placeholder="voce@email.com" value="${esc(email)}"><button class="btn full" id="lGo" style="margin-top:16px">Enviar código</button></div>
 <div id="st2" style="display:none"><label class="f">Código</label><input id="lC" class="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••"><p class="t-xs" id="lTo" style="margin:8px 4px 0"></p><button class="btn full" id="lOk" style="margin-top:16px">Entrar</button><button class="btn full plain" id="lBack" style="margin-top:8px;background:none">Usar outro e-mail</button></div>`,(s,close)=>{
  const go=$('#lGo',s),ok=$('#lOk',s);
  go.onclick=async()=>{email=$('#lE',s).value.trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email)){$('#lE',s).style.borderColor='var(--rose)';return}go.disabled=true;go.textContent='Enviando…';
   try{const r=await aReq('POST','/auth/start',{email});localStorage.setItem('me_last_email',JSON.stringify(email));if(r.dev)window.__devCode=r.dev;$('#st1',s).style.display='none';$('#st2',s).style.display='';$('#lTo',s).textContent='Enviado para '+email+'. Confira também o spam.';setTimeout(()=>$('#lC',s).focus(),100)}
   catch(e){toast(e.status===429?'Aguarde uns segundos':'Não deu pra enviar agora')}go.disabled=false;go.textContent='Enviar código'};
  $('#lE',s).onkeydown=e=>{if(e.key==='Enter')go.click()};
  $('#lBack',s).onclick=()=>{$('#st2',s).style.display='none';$('#st1',s).style.display=''};
  const verify=async()=>{const code=$('#lC',s).value.replace(/\D/g,'');if(code.length!==6)return;ok.disabled=true;ok.textContent='Entrando…';
   try{const r=await aReq('POST','/auth/verify',{email,code});AC.set({token:r.token,email:r.email});const st=SY.get();delete st.first;SY.set(st);haptic(15);close();toast('Conta conectada');await syncNow();toast('Tudo sincronizado')}
   catch(e){toast(e.message==='código incorreto'?'Código incorreto':e.message==='código expirado'?'Código expirou, peça outro':'Não deu pra entrar');ok.disabled=false;ok.textContent='Entrar'}};
  ok.onclick=verify;$('#lC',s).oninput=e=>{if(e.target.value.replace(/\D/g,'').length===6)verify()};
  setTimeout(()=>$('#lE',s).focus(),350)})}
