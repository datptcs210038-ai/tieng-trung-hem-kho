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
     const r=await ctx.db.from('hsk_listening_media').select('question_key,image_url,choice_images');
     if(r.error)throw r.error;
     state.records=Object.fromEntries((r.data||[]).map(x=>[x.question_key,x]));
     state.lastUser=userId;
     window.dispatchEvent(new Event('tthk-hsk-media-ready'));
   }catch(e){console.warn('HSK listening media not available:',e.message)}
   finally{state.loading=false}
 }
 function observe(){
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