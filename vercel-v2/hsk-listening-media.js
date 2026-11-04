/* TTHK media overlay for self-authored HSK listening practice.
   Keep original quiz bank, choices and answers unchanged. */
;(()=>{
 'use strict';
 const D=window.TTHK;
 const state={records:{},loading:false,lastUser:''};
 const key=q=>(q.block||q.kind||'')+'|'+(q.audio||q.zh||'')+'|'+(q.options||[]).join('|');
 const isUrl=s=>typeof s==='string'&&/^https:\/\/[^\s<>"']{3,1000}$/i.test(s);
 window.TTHK_HSK_MEDIA={
   get(q){return state.records[key(q)]||null},
   validUrl:isUrl,
   refresh:load
 };
 async function load(){
   const ctx=D?.profileContext?.();
   if(!ctx?.db||!ctx.user||state.loading)return;
   const userId=ctx.user.id;
   if(userId===state.lastUser)return;
   state.loading=true;
   try{
     const [r,w]=await Promise.all([ctx.db.from('hsk_listening_media').select('question_key,image_url,choice_images'),ctx.db.from('word_content').select('hanzi,image_url')]);
     if(r.error)throw r.error;
     if(w.error)throw w.error;
     state.records=Object.fromEntries((r.data||[]).map(x=>[x.question_key,x]));
     D.photos=D.photos||{};
     for(const item of (w.data||[]))if(isUrl(item.image_url))D.photos[item.hanzi]=item.image_url;
     D.vocab?.();
     state.lastUser=userId;
     window.dispatchEvent(new Event('tthk-hsk-media-ready'));
   }catch(e){console.warn('HSK listening media not available:',e.message)}
   finally{state.loading=false}
 }
 function observe(){
  if(!document.getElementById('tthk-hsk-photo-style')){const style=document.createElement('style');style.id='tthk-hsk-photo-style';style.textContent='.hsk20-picture .hsk20-managed-img{display:block;width:auto;max-width:min(100%,420px);max-height:240px;object-fit:contain;margin:auto;border-radius:12px}.hsk20-choice .hsk20-managed-img{display:block;width:min(100%,160px);height:105px;object-fit:contain;border-radius:10px;margin:auto}.hsk20-icon:has(.hsk20-managed-img){display:block;width:100%}';document.head.append(style)}
  const site=document.getElementById('site');
  if(!site)return;
  new MutationObserver(()=>{
   if(site.hidden){state.lastUser='';state.records={}}
   else load();
  }).observe(site,{attributes:true,attributeFilter:['hidden']});
  if(!site.hidden)load();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
})();