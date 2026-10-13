/* Cinematic intro for Tiếng Trung Hem Khó. No changes to auth or user data. */
;(()=>{
'use strict';
if(window.TTHK_CINEMA)return;
const D=window.TTHK, $=s=>document.querySelector(s);
const reduced=!!window.matchMedia?.('(prefers-reduced-motion:reduce)').matches;
const saving=navigator.connection?.saveData===true;
function icon(kind){
 const glyphs={arrow:'00001000,00000100,11111110,11111111,11111110,00000100,00001000,00000000',play:'00011000,00111100,00111110,00111111,00111111,00111110,00111100,00011000',pause:'11000110,11000110,11000110,11000110,11000110,11000110,11000110,11000110',star:'00011000,00011000,00111100,11111111,11111111,00111100,00011000,00011000'};
 const rows=(glyphs[kind]||glyphs.star).split(',');
 let out='';
 rows.forEach((line,y)=>{[...line].forEach((bit,x)=>{if(bit==='1')out+='<rect x="'+(x*2)+'" y="'+(y*2)+'" width="2" height="2"/>';});});
 return '<svg aria-hidden="true" width="17" height="17" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges">'+out+'</svg>';
}
function start(){
 const intro=$('#intro'),oldHero=intro?.querySelector('.hero'),site=$('#site');
 if(!intro||!oldHero||!site||$('#tthkCinematicHome'))return;
 const section=document.createElement('section');section.id='tthkCinematicHome';section.className='tthk-cinematic-home';
 section.setAttribute('aria-label','Video giới thiệu hành trình học tiếng Trung');
 section.innerHTML='<div class="tthk-cinema-stage">'+
 '<div class="tthk-cinema-scene" aria-hidden="true"><div class="tthk-cinema-poster"></div>'+
 '<video id="tthkCinemaVideo" playsinline muted loop preload="none" tabindex="-1"></video>'+
 '<div class="tthk-cinema-soften"></div><span class="tthk-cinema-hanzi a" lang="zh">学</span><span class="tthk-cinema-hanzi b" lang="zh">好</span></div>'+
 '<div class="tthk-cinema-copy">'+
 '<div class="tthk-cinema-topline">'+icon('star')+'<span>TIẾNG TRUNG HEM KHÓ · LEARN WITH JOY</span></div>'+
 '<div class="tthk-cinema-greeting" lang="zh">你好 <small>nǐ hǎo</small></div>'+
 '<h2>Học từng chữ Hán.<br><em>Thêm một niềm vui.</em></h2>'+
 '<p>Từ một lời chào đến cả thế giới mới: học từ vựng, luyện viết và khám phá tiếng Trung theo nhịp độ của riêng bạn.</p>'+
 '<div class="tthk-cinema-actions"><button type="button" class="tthk-cinema-primary" data-cinema-target="vocab">Bắt đầu học '+icon('arrow')+'</button>'+
 '<button type="button" class="tthk-cinema-secondary" data-cinema-target="flash">Học với Hành '+icon('star')+'</button></div>'+
 '<div class="tthk-cinema-note"><span></span> BƯỚC NHỎ MỖI NGÀY · CẢM HỨNG LỚN MAI SAU</div></div>'+
 '<button class="tthk-cinema-video-toggle" type="button" aria-pressed="false" aria-label="Tạm dừng video nền">'+icon('pause')+'<span>Video nền</span></button>'+
 '<div class="tthk-cinema-orbit" aria-hidden="true"></div></div>'+
 '<div class="tthk-cinema-numbers"><div><strong>300</strong><span>Từ vựng HSK</span></div>'+
 '<div><strong>02</strong><span>Cấp độ HSK</span></div><div><strong>05</strong><span>Thành viên dự án</span></div>'+
 '<div class="tthk-cinema-motto"><span></span><b>Học đều · Nhớ lâu · Vui hơn</b></div></div>'+
 '<div class="tthk-cinema-marquee" aria-hidden="true"><div>中文不难 <i>✦</i> LEARN SOMETHING NEW <i>✦</i> HỌC VỚI HÀNH <i>✦</i> 中文不难 <i>✦</i> LEARN SOMETHING NEW <i>✦</i> HỌC VỚI HÀNH <i>✦</i></div></div>';
 intro.insertBefore(section,oldHero);
 const video=section.querySelector('video'),toggle=section.querySelector('.tthk-cinema-video-toggle');
 let visible=false,paused=reduced||saving,loaded=false;
 function pageReady(){return !site.hidden&&intro.classList.contains('on')&&!document.hidden;}
 function loadVideo(){
  if(loaded)return;loaded=true;
  for(const [url,type] of [
   ['https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm','video/webm'],
   ['https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4','video/mp4']]){
    const s=document.createElement('source');s.src=url;s.type=type;video.appendChild(s);
  }
  video.load();
 }
 function play(force){
  if(!visible||!pageReady()||paused||((reduced||saving)&&!force))return;
  loadVideo();
  const promise=video.play();promise?.catch?.(()=>section.classList.add('tthk-cinema-static'));
 }
 function buttonState(){
  toggle.innerHTML=icon(paused?'play':'pause')+'<span>'+(paused?'Phát video':'Tạm dừng')+'</span>';
  toggle.setAttribute('aria-pressed',String(paused));
  toggle.setAttribute('aria-label',paused?'Phát video nền':'Tạm dừng video nền');
  section.classList.toggle('tthk-cinema-paused',paused);
 }
 if(paused){section.classList.add('tthk-cinema-static');buttonState();}
 toggle.onclick=()=>{paused=!paused;buttonState();if(paused)video.pause();else play(true);};
 video.addEventListener('playing',()=>section.classList.remove('tthk-cinema-static'));
 video.addEventListener('error',()=>section.classList.add('tthk-cinema-static'));
 section.querySelectorAll('[data-cinema-target]').forEach(b=>b.onclick=()=>D?.page?.(b.dataset.cinemaTarget));
 if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>{
   visible=entries.some(e=>e.isIntersecting);
   if(visible)play(false);else video.pause();
  },{threshold:.10,rootMargin:'50px'}).observe(section);
 }else{visible=true;play(false);}
 document.addEventListener('visibilitychange',()=>document.hidden?video.pause():play(false));
 new MutationObserver(()=>site.hidden?video.pause():play(false)).observe(site,{attributes:true,attributeFilter:['hidden']});
 const original=D?.page;
 if(typeof original==='function'){
  D.page=function(id){const r=original.apply(this,arguments);if(id==='intro')requestAnimationFrame(()=>play(false));else video.pause();return r;};
 }
 if(!reduced&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('tthk-is-visible');observer.unobserve(e.target);}});
  },{threshold:.06,rootMargin:'0px 0px -15px 0px'});
  function register(){
   intro.querySelectorAll('#tthkCinematicHome,#intro>.grid>.box,#intro .teams>.member').forEach((el,i)=>{
    if(el.dataset.tthkMotionReady)return;
    el.dataset.tthkMotionReady='1';
    el.style.setProperty('--tthk-delay',Math.min(i%5,4)*65+'ms');
    el.classList.add('tthk-reveal');observer.observe(el);
   });
  }
  register();
  new MutationObserver(register).observe(intro,{childList:true,subtree:true});
 }
 window.TTHK_CINEMA={version:'cinematic-v1',pause:()=>video.pause(),resume:()=>{paused=false;buttonState();play(true)}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();