/* Glass top navigation – no destructive DOM rewrites or navigation delays. */
;(()=>{
'use strict';
if(window.TTHK_TOP_GLASS_NAV)return;
const reduce=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
function init(){
 const site=document.querySelector('#site');
 const nav=site?.querySelector('.side .nav');
 const bar=site?.querySelector('.side');
 if(!site||!nav||!bar)return;
 let lens=nav.querySelector('.tg-glass-lens');
 if(!lens){lens=document.createElement('span');lens.className='tg-glass-lens';lens.setAttribute('aria-hidden','true');nav.insertBefore(lens,nav.firstChild);}
 let queued=false,lastActive=null;
 const update=(scrollToActive=false)=>{
   queued=false;
   const active=nav.querySelector('button[data-page].on')||nav.querySelector('button.on');
   if(!active||site.hidden){lens.classList.remove('tg-ready');return}
   if(scrollToActive&&nav.scrollWidth>nav.clientWidth){
     const left=active.getBoundingClientRect().left-nav.getBoundingClientRect().left;
     const right=left+active.getBoundingClientRect().width;
     if(left<0||right>nav.clientWidth){
       active.scrollIntoView({block:'nearest',inline:'nearest',behavior:reduce?'instant':'smooth'});
     }
   }
   const navRect=nav.getBoundingClientRect();
   const rect=active.getBoundingClientRect();
   const x=rect.left-navRect.left+nav.scrollLeft;
   lens.style.width=rect.width+'px';
   lens.style.transform='translate3d('+x+'px,0,0)';
   lens.classList.add('tg-ready');
   lastActive=active;
   nav.querySelectorAll('button[data-page]').forEach(b=>{
     if(b===active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
   });
 };
 function requestUpdate(scroll=false){
   if(queued)return;
   queued=true;requestAnimationFrame(()=>update(scroll));
 }
 const observer=new MutationObserver(changes=>{
   const selected=nav.querySelector('button[data-page].on')||nav.querySelector('button.on');
   const changed=selected!==lastActive;
   if(changed||changes.some(x=>x.type==='childList'))requestUpdate(changed);
 });
 observer.observe(nav,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
 const onNavScroll=()=>requestUpdate();
 nav.addEventListener('scroll',onNavScroll,{passive:true});
 const windowScroll=()=>{
   bar.classList.toggle('tg-scrolled',window.scrollY>15);
 };
 window.addEventListener('scroll',windowScroll,{passive:true});
 windowScroll();
 nav.addEventListener('click',e=>{
   if(e.target.closest('button[data-page]'))requestAnimationFrame(()=>requestUpdate(true));
 });
 if('ResizeObserver' in window){
   const observer=new ResizeObserver(()=>requestUpdate());
   observer.observe(nav);observer.observe(bar);
 }
 window.addEventListener('resize',()=>requestUpdate(),{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestUpdate()});
 const stateObserver=new MutationObserver(()=>{if(!site.hidden)requestUpdate()});
 stateObserver.observe(site,{attributes:true,attributeFilter:['hidden']});
 requestAnimationFrame(()=>update());
 window.TTHK_TOP_GLASS_NAV={version:'top-glass-refinement-v1',refresh:()=>update()};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();