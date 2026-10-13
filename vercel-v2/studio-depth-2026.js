/* TIẾNG TRUNG HEM KHÓ / Modern UI icons + editorial motion, nonintrusive enhancement. */
;(()=>{
'use strict';
if(window.TTHK_STUDIO_DEPTH)return;
const $=q=>document.querySelector(q);
const reduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
const paths={
 intro:'<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-7h6v7"/>',
 vocab:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
 lookup:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 writing:'<path d="m4 20 5-.8L20 8a3 3 0 0 0-4-4L5 15z"/><path d="m14.8 6.3 3 3"/>',
 flash:'<rect x="2" y="7" width="16" height="14" rx="2"/><path d="M6 3h14a2 2 0 0 1 2 2v12M7 11l2 2 4-4"/>',
 exams:'<rect x="5" y="3" width="14" height="19" rx="2"/><path d="M9 2v4M15 2v4M9 11h7M9 15h7"/><path d="m9 19 1 1 2-2"/>',
 rank:'<path d="M4 20V11h5v9M10 20V4h5v16M16 20v-7h4v7"/><path d="M2 21h20"/>',
 timer:'<circle cx="12" cy="13" r="8"/><path d="M12 13V8M12 13l4 2M9 2h6M12 3V1"/>',
 notes:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h6M2 9h4M2 16h4"/>',
 profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 logout:'<path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 16l4-4-4-4M8 12h10"/>',
 facebook:'<path d="M14.5 21v-8.3h2.9l.45-3.4H14.5V7.1c0-1 .3-1.7 1.8-1.7h1.8v-3a21 21 0 0 0-2.6-.14c-2.6 0-4.4 1.6-4.4 4.5v2.5H8.4v3.4h2.7V21"/>',
 sound:'<path d="m5 9 5-4v14l-5-4H2V9h3M14 9a4 4 0 0 1 0 6M17 6a8 8 0 0 1 0 12"/>',
 sparkle:'<path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2ZM20 17l.8 2.2L23 20l-2.2.8L20 23l-.8-2.2L17 20l2.2-.8L20 17Z"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 pause:'<path d="M8 5v14M16 5v14"/>',
 play:'<path d="m8 5 11 7-11 7V5Z"/>'
};
function svg(kind,size=19){
 return '<svg class="studio-lucide" aria-hidden="true" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision">'+(paths[kind]||paths.sparkle)+'</svg>';
}
function navIcons(){
 document.querySelectorAll('#site .nav button[data-page],#site .nav button#logout').forEach(btn=>{
  const k=btn.id==='logout'?'logout':btn.dataset.page;
  const old=btn.querySelector('.pixel-nav-icon,.studio-nav-icon');
  if(old){
   if(old.dataset.studioIcon===k)return;
   old.classList.remove('pixel-nav-icon');old.classList.add('studio-nav-icon');
   old.dataset.studioIcon=k;old.innerHTML=svg(k);
  }else if(!btn.querySelector('.studio-nav-icon')){
   const el=document.createElement('span');el.className='studio-nav-icon';el.innerHTML=svg(k);
   btn.prepend(el);
  }
 });
 document.querySelectorAll('.mobile-dock button[data-quick-page]').forEach(btn=>{
  const old=btn.querySelector('.dock-icon,.studio-dock-icon');
  if(!old)return;
  const k=btn.dataset.quickPage;
  if(old.dataset.studioIcon===k)return;
  old.dataset.studioIcon=k;old.classList.remove('dock-icon');old.classList.add('studio-dock-icon');
  old.innerHTML=svg(k,20);
 });
 const facebook=$('.facebook-float');
 if(facebook&&!facebook.dataset.studioIcon){
  facebook.dataset.studioIcon='facebook';
  facebook.innerHTML=svg('facebook',24);
 }
}
function chrome(){
 const brand=$('#intro .pixel-hero-tag');
 if(brand&&brand.dataset.studioLabel!=='1'){
  brand.textContent='KHÁM PHÁ · HỌC TẬP · KẾT NỐI';
  brand.dataset.studioLabel='1';
 }
 document.querySelectorAll('#gate .login-chips span').forEach(span=>{
  if(span.dataset.studioClean)return;
  span.textContent=span.textContent.replace(/^[\s✦✧◈✍♫♪🎵📖📚]+/u,'').trim();
  span.dataset.studioClean='1';
 });
 const greeting=$('#gate .login-kicker');
 if(greeting)greeting.textContent='HỌC TIẾNG TRUNG · KHÁM PHÁ THẾ GIỚI';
}
function actionIcons(){
 // Restore sleek modern line icons only on study utility buttons.
 document.querySelectorAll('#wordGrid button[data-say],#wordGrid button[data-write],#result button[data-say],#result button[data-write]').forEach(btn=>{
  if(btn.dataset.studioAction)return;
  const action=btn.hasAttribute('data-say')?'sound':'writing';
  const label=action==='sound'?'Nghe':'Luyện viết';
  btn.dataset.studioAction=action;
  btn.innerHTML=svg(action,16)+'<span>'+label+'</span>';
 });
}
function editorial(){
 const root=$('#tthkCinematicHome');
 if(!root||root.dataset.studioEditorial)return false;
 root.dataset.studioEditorial='1';
 const header=root.querySelector('.tthk-cinema-copy h2');
 if(header)header.innerHTML='<span>MỖI CHỮ HÁN.</span><br><em>MỘT THẾ GIỚI MỚI.</em>';
 const description=root.querySelector('.tthk-cinema-copy p');
 if(description)description.textContent='Không chỉ học từ vựng. Đây là hành trình khám phá ngôn ngữ, văn hóa và những điều mới — bắt đầu từ hôm nay.';
 const kicker=root.querySelector('.tthk-cinema-topline span');
 if(kicker)kicker.textContent='TIẾNG TRUNG HEM KHÓ · KHÁM PHÁ THEO CÁCH CỦA BẠN';
 const art=root.querySelector('.tthk-cinema-topline svg');
 if(art)art.outerHTML=svg('sparkle',18);
 root.querySelectorAll('[data-cinema-target]').forEach(button=>{
  const k=button.dataset.cinemaTarget==='vocab'?'arrow':'sparkle';
  const icon=button.querySelector('svg');
  if(icon)icon.outerHTML=svg(k,18);
 });
 const note=root.querySelector('.tthk-cinema-note');
 if(note)note.setAttribute('aria-label','Bước nhỏ mỗi ngày, cảm hứng lớn mai sau');
 root.querySelectorAll('.tthk-cinema-marquee i').forEach(i=>i.textContent='·');
 if(!reduced&&window.matchMedia?.('(pointer:fine)').matches){
  const stage=root.querySelector('.tthk-cinema-stage');
  if(stage){
   let frame=0;
   stage.addEventListener('pointermove',e=>{
    if(frame)return;
    frame=requestAnimationFrame(()=>{
     const box=stage.getBoundingClientRect();
     const x=Math.max(0,Math.min(100,(e.clientX-box.left)/box.width*100)).toFixed(1)+'%';
     const y=Math.max(0,Math.min(100,(e.clientY-box.top)/box.height*100)).toFixed(1)+'%';
     stage.style.setProperty('--studio-mouse-x',x);
     stage.style.setProperty('--studio-mouse-y',y);
     frame=0;
    });
   },{passive:true});
  }
 }
 return true;
}
function sync(){navIcons();chrome();actionIcons();editorial();}
function init(){
 sync();
 const nav=$('#site .nav'),intro=$('#intro'),gate=$('#gate'),dock=$('.mobile-dock');
 let queued=false;
 const observer=new MutationObserver(()=>{
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;sync();});
 });
 const opts={childList:true,subtree:true};
 if(nav)observer.observe(nav,opts);
 if(intro)observer.observe(intro,opts);
 if(gate)observer.observe(gate,opts);
 if(dock)observer.observe(dock,opts);
 const words=$('#wordGrid'),results=$('#result');
 if(words)observer.observe(words,{childList:true});
 if(results)observer.observe(results,{childList:true});
 window.TTHK_STUDIO_DEPTH={sync,version:'studio-depth-v1'};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();