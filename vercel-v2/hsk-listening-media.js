/* Tiếng Trung Hem Khó — live image sync across browsers and devices.
   Supabase Realtime (Postgres Changes) + same-browser notification + reconnect fallback.
   Edits are authorized by the database; this module only reads and renders them. */
;(()=>{
'use strict';
const D=window.TTHK;
if(!D||window.TTHK_HSK_MEDIA)return;
const defaultPhotos={...(D.photos||{})};
const S={records:{},managed:new Set(),inFlight:false,pending:false,lastUser:'',lastRead:0,
  realtime:null,realtimeDb:null,realtimeUser:'',realtimeStatus:'',browserChannel:null,
  revision:0,backgroundImage:null};
const ctx=()=>D.profileContext?.()||{};
const key=q=>(q.block||q.kind||'')+'|'+(q.audio||q.zh||'')+'|'+(q.options||[]).join('|');
const validUrl=s=>typeof s==='string'&&/^https:\/\/[^\s<>"']{3,1000}$/i.test(s);
const report=(label,e)=>console.warn('[TTHK media] '+label,e?.message||e);
const managedImage=(url,hanzi)=>validUrl(url)&&(!/\/vocab-icons\//.test(url)||!defaultPhotos[hanzi]);
function redraw(){
  try{D.vocab?.()}catch(e){report('vocabulary redraw',e)}
  try{D.lookup?.()}catch(e){report('search redraw',e)}
  try{D.topicLibrary?.search?.()}catch(e){report('topic redraw',e)}
}
function dispatchWords(){
  redraw();
  window.dispatchEvent(new Event('tthk-word-photos-updated'));
}
function restoreWord(hanzi){
  if(defaultPhotos[hanzi])D.photos[hanzi]=defaultPhotos[hanzi];
  else delete D.photos[hanzi];
  S.managed.delete(hanzi);
}
function applyWord(row,removed=false){
  if(!row?.hanzi)return;
  D.photos=D.photos||{};
  if(removed||!managedImage(row.image_url,row.hanzi))restoreWord(row.hanzi);
  else{D.photos[row.hanzi]=row.image_url;S.managed.add(row.hanzi)}
  dispatchWords();
}
function applyWords(rows){
  D.photos=D.photos||{};
  const next=new Set();
  for(const row of rows||[]){
    if(!managedImage(row.image_url,row.hanzi))continue;
    D.photos[row.hanzi]=row.image_url;
    next.add(row.hanzi);
  }
  for(const hanzi of S.managed)if(!next.has(hanzi)){
    if(defaultPhotos[hanzi])D.photos[hanzi]=defaultPhotos[hanzi];
    else delete D.photos[hanzi];
  }
  S.managed=next;
  dispatchWords();
}
function updateListening(payload){
  const row=payload.eventType==='DELETE'?payload.old:payload.new;
  if(!row?.question_key){load(true);return}
  if(payload.eventType==='DELETE')delete S.records[row.question_key];
  else S.records[row.question_key]=row;
  window.dispatchEvent(new Event('tthk-hsk-media-ready'));
}
function navEditor(isEditor){
  const nav=document.querySelector('.side .nav');
  if(!nav)return;
  const prior=document.getElementById('tthkMediaAdminLink');
  if(!isEditor){prior?.remove();return}
  if(prior)return;
  const btn=document.createElement('button');
  btn.id='tthkMediaAdminLink';btn.type='button';btn.textContent='🖼️ Kho ảnh HSK';
  btn.title='Quản lý ảnh từ vựng và bài nghe HSK';
  btn.onclick=()=>location.assign('/content-images.html');
  nav.insertBefore(btn,document.getElementById('logout'));
}
function updateLoginWallpaper(asset){
  if(asset?.slug!=='login-background'||!asset.image_path)return;
  const c=ctx(),gate=document.getElementById('gate');
  if(!c.db||!gate)return;
  const url=c.db.storage.from('login-backgrounds').getPublicUrl(asset.image_path).data?.publicUrl;
  if(!validUrl(url))return;
  const src=url+'?v='+encodeURIComponent(asset.updated_at||Date.now());
  const image=new Image();
  image.onload=()=>{if(!gate.isConnected)return;gate.style.setProperty('--login-wallpaper','url("'+src.replaceAll('"','%22')+'")');gate.classList.add('custom-login-bg')};
  image.src=src;
  S.backgroundImage=image;
}
function updateSiteAssets(payload){
  const row=payload.eventType==='DELETE'?payload.old:payload.new;
  if(row?.slug==='login-background'&&payload.eventType!=='DELETE')updateLoginWallpaper(row);
  if(typeof window.TTHK_REFRESH_SITE_ASSETS==='function'){
    try{void window.TTHK_REFRESH_SITE_ASSETS()}catch(e){report('asset refresh',e)}
  }
}
function onChange(payload){
  ++S.revision;
  if(document.getElementById('site')?.hidden)return;
  if(payload.table==='word_content'){
    const row=payload.eventType==='DELETE'?payload.old:payload.new;
    if(!row?.hanzi){load(true);return}
    applyWord(row,payload.eventType==='DELETE');
  }else if(payload.table==='hsk_listening_media')updateListening(payload);
  else if(payload.table==='site_assets')updateSiteAssets(payload);
}
function stopRealtime(){
  const db=S.realtimeDb,channel=S.realtime;
  S.realtime=null;S.realtimeDb=null;S.realtimeUser='';S.realtimeStatus='';
  if(db&&channel)try{void db.removeChannel(channel)}catch(e){report('realtime cleanup',e)}
}
function ensureRealtime(db,userId){
  if(S.realtime&&S.realtimeDb===db&&S.realtimeUser===userId)return;
  stopRealtime();
  if(!db?.channel)return;
  S.realtimeDb=db;S.realtimeUser=userId;
  try{
    const channel=db.channel('tthk-media-live-'+userId);
    for(const table of ['word_content','hsk_listening_media','site_assets']){
      channel.on('postgres_changes',{event:'*',schema:'public',table},onChange);
    }
    S.realtime=channel;
    channel.subscribe((status,error)=>{
      if(channel!==S.realtime)return;
      S.realtimeStatus=status;
      if(status==='SUBSCRIBED')load(true);
      if((status==='CHANNEL_ERROR'||status==='TIMED_OUT')&&error)report('realtime subscription',error);
    });
  }catch(e){report('realtime setup',e);stopRealtime()}
}
async function load(force=false){
  const c=ctx(),user=c.user;
  if(!c.db||!user)return;
  ensureRealtime(c.db,user.id);
  const now=Date.now();
  if(!force&&S.lastUser===user.id&&now-S.lastRead<15000)return;
  if(S.inFlight){S.pending=S.pending||force;return}
  S.inFlight=true;
  let success=false;
  const startingRevision=S.revision;
  try{
    const [words,exam,editor]=await Promise.allSettled([
      c.db.from('word_content').select('hanzi,image_url'),
      c.db.from('hsk_listening_media').select('question_key,image_url,choice_images'),
      c.db.from('site_editors').select('user_id').eq('user_id',user.id).maybeSingle()
    ]);
    if(words.status==='fulfilled'&&!words.value.error){
      applyWords(words.value.data||[]);
      success=true;
    }else report('vocabulary photos read',words.reason||words.value?.error);
    if(exam.status==='fulfilled'&&!exam.value.error){
      S.records=Object.fromEntries((exam.value.data||[]).map(x=>[x.question_key,x]));
      window.dispatchEvent(new Event('tthk-hsk-media-ready'));success=true;
    }else report('listening photos read',exam.reason||exam.value?.error);
    if(editor.status==='fulfilled'&&!editor.value.error){
      navEditor(Boolean(editor.value.data));
    }else report('admin status',editor.reason||editor.value?.error);
    if(success){S.lastUser=user.id;S.lastRead=Date.now()}
    if(S.revision!==startingRevision)S.pending=true;
  }catch(e){report('sync failure',e)}
  finally{
    S.inFlight=false;
    if(S.pending){S.pending=false;void load(true)}
  }
}
function reset(){
  stopRealtime();S.lastUser='';S.lastRead=0;S.records={};
  for(const hanzi of S.managed){
    if(defaultPhotos[hanzi])D.photos[hanzi]=defaultPhotos[hanzi];
    else delete D.photos[hanzi];
  }
  S.managed.clear();navEditor(false);
}
window.TTHK_HSK_MEDIA={
  get(q){return S.records[key(q)]||null},
  validUrl,
  refresh:()=>load(true),
  get realtimeStatus(){return S.realtimeStatus}
};
function start(){
  if(!document.getElementById('tthk-hsk-photo-style')){
    const style=document.createElement('style');style.id='tthk-hsk-photo-style';
    style.textContent='.hsk20-picture .hsk20-managed-img{display:block;width:auto;max-width:min(100%,420px);max-height:240px;object-fit:contain;margin:auto;border-radius:12px}.hsk20-choice .hsk20-managed-img{display:block;width:min(100%,160px);height:105px;object-fit:contain;border-radius:10px;margin:auto}.hsk20-icon:has(.hsk20-managed-img){display:block;width:100%}';
    document.head.append(style);
  }
  const site=document.getElementById('site');
  if(!site)return;
  new MutationObserver(()=>{if(site.hidden)reset();else void load(true)})
    .observe(site,{attributes:true,attributeFilter:['hidden']});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!site.hidden)void load(true)});
  window.addEventListener('focus',()=>{if(!site.hidden)void load()});
  window.addEventListener('pageshow',()=>{if(!site.hidden)void load(true)});
  window.addEventListener('storage',e=>{if(e.key==='tthk-media-updated'&&!site.hidden)void load(true)});
  if('BroadcastChannel' in window){
    S.browserChannel=new BroadcastChannel('tthk-media');
    S.browserChannel.onmessage=e=>{if(e.data?.type==='updated'&&!site.hidden)void load(true)};
  }
  // Fallback for clients that cannot maintain a websocket connection.
  setInterval(()=>{
    if(!document.hidden&&!site.hidden&&S.realtimeStatus!=='SUBSCRIBED')void load(true);
  },30000);
  if(!site.hidden)void load(true);
  setTimeout(()=>{if(!site.hidden)void load()},1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();