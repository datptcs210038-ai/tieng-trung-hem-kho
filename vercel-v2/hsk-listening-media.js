/* TTHK media synchronization: saved Supabase images appear in all learner views.
   Works across existing tabs, sign-ins and background/foreground transitions. */
;(()=>{
 'use strict';
 const D=window.TTHK;
 if(!D||window.TTHK_HSK_MEDIA)return;
 const DEFAULT_PHOTOS={...(D.photos||{})};
 const state={records:{},inFlight:false,pending:false,lastUser:'',lastRead:0,managed:new Set(),channel:null};
 const key=q=>(q.block||q.kind||'')+'|'+(q.audio||q.zh||'')+'|'+(q.options||[]).join('|');
 const validUrl=s=>typeof s==='string'&&/^https:\/\/[^\s<>"']{3,1000}$/i.test(s);
 const ctx=()=>D.profileContext?.()||{};
 const report=(label,error)=>console.warn('[TTHK media] '+label,error?.message||error);
 const managedImage=(url,hanzi)=>validUrl(url)&&(!/\/vocab-icons\//.test(url)||!DEFAULT_PHOTOS[hanzi]);
 function redraw(){
   try{D.vocab?.()}catch(e){report('vocabulary redraw',e)}
   try{D.lookup?.()}catch(e){report('search redraw',e)}
   try{D.topicLibrary?.search?.()}catch(e){report('topic redraw',e)}
 }
 function navEditor(isEditor){
   const nav=document.querySelector('.side .nav');
   if(!nav)return;
   const existing=document.getElementById('tthkMediaAdminLink');
   if(!isEditor){existing?.remove();return}
   if(existing)return;
   const btn=document.createElement('button');btn.id='tthkMediaAdminLink';
   btn.type='button';btn.textContent='🖼️ Kho ảnh HSK';
   btn.title='Quản lý ảnh từ vựng và bài nghe HSK';
   btn.onclick=()=>location.assign('/content-images.html');
   nav.insertBefore(btn,document.getElementById('logout'));
 }
 function applyWords(rows){
   D.photos=D.photos||{};
   const next=new Set();
   for(const row of rows||[]){
     if(!managedImage(row.image_url,row.hanzi))continue;
     D.photos[row.hanzi]=row.image_url;
     next.add(row.hanzi);
   }
   for(const hanzi of state.managed)if(!next.has(hanzi)){
     if(DEFAULT_PHOTOS[hanzi])D.photos[hanzi]=DEFAULT_PHOTOS[hanzi];
     else delete D.photos[hanzi];
   }
   state.managed=next;
   redraw();
   window.dispatchEvent(new Event('tthk-word-photos-updated'));
 }
 async function load(force=false){
   const c=ctx(),user=c.user;
   if(!c.db||!user)return;
   const now=Date.now();
   if(!force&&state.lastUser===user.id&&now-state.lastRead<15000)return;
   if(state.inFlight){state.pending=state.pending||force;return}
   state.inFlight=true;
   let succeeded=false;
   try{
     // Independent requests ensure one optional feature cannot block vocabulary photos.
     const [wordResponse,examResponse,editorResponse]=await Promise.allSettled([
       c.db.from('word_content').select('hanzi,image_url'),
       c.db.from('hsk_listening_media').select('question_key,image_url,choice_images'),
       c.db.from('site_editors').select('user_id').eq('user_id',user.id).maybeSingle()
     ]);
     if(wordResponse.status==='fulfilled'&&!wordResponse.value.error){
       applyWords(wordResponse.value.data||[]);
       succeeded=true;
     }else report('word images read',wordResponse.reason||wordResponse.value?.error);
     if(examResponse.status==='fulfilled'&&!examResponse.value.error){
       state.records=Object.fromEntries((examResponse.value.data||[]).map(x=>[x.question_key,x]));
       window.dispatchEvent(new Event('tthk-hsk-media-ready'));
       succeeded=true;
     }else report('listening images read',examResponse.reason||examResponse.value?.error);
     if(editorResponse.status==='fulfilled'&&!editorResponse.value.error){
       navEditor(Boolean(editorResponse.value.data));
     }else report('editor check',editorResponse.reason||editorResponse.value?.error);
     if(succeeded){state.lastUser=user.id;state.lastRead=Date.now()}
   }catch(e){report('sync',e)}
   finally{
     state.inFlight=false;
     if(state.pending){state.pending=false;load(true)}
   }
 }
 function reset(){
   state.lastRead=0;state.lastUser='';state.records={};navEditor(false);
 }
 window.TTHK_HSK_MEDIA={get(q){return state.records[key(q)]||null},validUrl,refresh:()=>load(true)};
 function start(){
   if(!document.getElementById('tthk-hsk-photo-style')){
     const style=document.createElement('style');style.id='tthk-hsk-photo-style';
     style.textContent='.hsk20-picture .hsk20-managed-img{display:block;width:auto;max-width:min(100%,420px);max-height:240px;object-fit:contain;margin:auto;border-radius:12px}.hsk20-choice .hsk20-managed-img{display:block;width:min(100%,160px);height:105px;object-fit:contain;border-radius:10px;margin:auto}.hsk20-icon:has(.hsk20-managed-img){display:block;width:100%}';
     document.head.append(style);
   }
   const site=document.getElementById('site');
   if(!site)return;
   new MutationObserver(()=>{if(site.hidden)reset();else load(true)})
     .observe(site,{attributes:true,attributeFilter:['hidden']});
   document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!site.hidden)load(true)});
   window.addEventListener('focus',()=>{if(!site.hidden)load()});
   window.addEventListener('pageshow',()=>{if(!site.hidden)load(true)});
   window.addEventListener('storage',e=>{if(e.key==='tthk-media-updated'&&!site.hidden)load(true)});
   if('BroadcastChannel' in window){
     state.channel=new BroadcastChannel('tthk-media');
     state.channel.onmessage=e=>{if(e.data?.type==='updated'&&!site.hidden)load(true)};
   }
   if(!site.hidden)load(true);
   setTimeout(()=>{if(!site.hidden)load()},1200);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();