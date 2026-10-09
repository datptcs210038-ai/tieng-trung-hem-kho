(()=>{
'use strict';
const $=s=>document.querySelector(s);
const track='https://soundcloud.com/dung-nguyen-149884056/calm-and-relaxing-lofi-music-for-studying-reading-and-stress-relief-one-hour-of-music';
const css=document.createElement('link');css.rel='stylesheet';css.href='/lofi-wallpaper.css?v=2';document.head.append(css);
const on='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="square" aria-hidden="true"><path d="M3 9h5l5-4v14l-5-4H3V9Z"/><path d="M16 9c2 1 2 5 0 6M19 6c4 3 4 9 0 12"/></svg>';
const off='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="square" aria-hidden="true"><path d="M3 9h5l5-4v14l-5-4H3V9Z"/><path d="m17 9 5 6m0-6-5 6"/></svg>';
const button=(id)=>{const b=document.createElement('button');b.type='button';b.id=id;b.className='lofi-toggle';b.innerHTML=off;return b};
const gateButton=button('lofiAuthButton');document.body.append(gateButton);
const siteButton=button('lofiSiteButton');
const topBar=$('.user-top-bar'),quick=$('#quickSignOut');
if(topBar){if(quick)topBar.insertBefore(siteButton,quick);else topBar.append(siteButton)}
else{const main=$('#site main');if(main)main.prepend(siteButton)}
const link=document.createElement('a');link.id='lofiSourceLink';link.href=track;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Nhạc: Dung Nguyen · SoundCloud';document.body.append(link);
const feedback=document.createElement('span');feedback.id='lofiAudioStatus';feedback.hidden=true;feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');document.body.append(feedback);
function notify(message){feedback.textContent=message;feedback.hidden=!message;clearTimeout(notify.timer);if(message)notify.timer=setTimeout(()=>feedback.hidden=true,6500)}
const frame=document.createElement('iframe');frame.id='lofiWidgetFrame';frame.allow='autoplay';frame.title='SoundCloud Lofi Music';
let want=true;try{want=localStorage.getItem('tthk-lofi-desired-v1')!=='false'}catch(e){}
let playing=false,ready=false,widget=null;
frame.src='https://w.soundcloud.com/player/?url='+encodeURIComponent(track)+'&auto_play='+want+'&show_artwork=false&show_comments=false&show_user=false&show_playcount=false&sharing=false&buying=false&download=false&visual=false';
document.body.append(frame);
function reflect(){
 for(const b of [gateButton,siteButton]){
   b.innerHTML=playing?on:off;
   b.classList.toggle('is-playing',playing);b.classList.toggle('is-pending',want&&!playing);
   const label=playing?'Tắt nhạc lofi':want?'Phát lofi (hãy bấm loa nếu trình duyệt chặn tự phát)':'Bật nhạc lofi';
   b.title=label;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(playing));
 }
 gateButton.hidden=!$('#gate')||$('#gate').hidden;
 siteButton.hidden=!$('#site')||$('#site').hidden;
 link.hidden=!want;
}
function play(){
 if(!want||!ready||!widget)return;
 try{widget.setVolume(35);widget.play()}catch(e){notify('Không phát được SoundCloud. Bạn có thể mở nhạc qua liên kết nguồn.')}
}
function toggle(){
 want=!want;
 try{localStorage.setItem('tthk-lofi-desired-v1',String(want))}catch(e){}
 if(want){if(ready)play();else notify('Đang kết nối SoundCloud…')}
 else{playing=false;if(widget&&ready)try{widget.pause()}catch(e){}}
 reflect();
}
gateButton.onclick=toggle;siteButton.onclick=toggle;
function initializeWidget(){
 if(!window.SC?.Widget){notify('Chưa kết nối được SoundCloud.');return}
 widget=window.SC.Widget(frame);
 widget.bind(window.SC.Widget.Events.READY,()=>{
   ready=true;if(want)play();reflect();
 });
 widget.bind(window.SC.Widget.Events.PLAY,()=>{playing=true;reflect()});
 widget.bind(window.SC.Widget.Events.PAUSE,()=>{playing=false;reflect()});
 widget.bind(window.SC.Widget.Events.FINISH,()=>{playing=false;reflect();if(want){widget.seekTo(0);widget.play()}});
 widget.bind(window.SC.Widget.Events.ERROR,()=>{playing=false;reflect();notify('SoundCloud chưa phát được bài này. Nhấn liên kết nhạc để kiểm tra.')});
}
if(window.SC?.Widget)initializeWidget();else{
 const script=document.createElement('script');script.async=true;script.src='https://w.soundcloud.com/player/api.js';
 script.onload=initializeWidget;script.onerror=()=>notify('Không tải được SoundCloud.');document.head.append(script);
}
let usedGesture=false;
document.addEventListener('pointerdown',event=>{
 if(usedGesture||!want||!ready||playing)return;
 if(event.target.closest?.('.lofi-toggle'))return;
 usedGesture=true;play();
},{capture:true});
const gate=$('#gate'),site=$('#site');
const observer=new MutationObserver(reflect);
[gate,site].filter(Boolean).forEach(el=>observer.observe(el,{attributes:true,attributeFilter:['hidden']}));
reflect();
if(gate&&window.supabase){
 const db=window.supabase.createClient('https://wcgzdbjmwhyroszvyetv.supabase.co','sb_publishable_rS5k1n1aKhqPaq_4En2pKw_hXYe3WcJ');
 db.from('site_assets').select('image_path,updated_at').eq('slug','login-background').maybeSingle()
 .then(({data,error})=>{
   if(error||!data?.image_path)return;
   const publicUrl=db.storage.from('login-backgrounds').getPublicUrl(data.image_path).data?.publicUrl;
   if(!publicUrl)return;
   const url=publicUrl+'?v='+encodeURIComponent(data.updated_at||'1');
   const preview=new Image();
   preview.onload=()=>{gate.style.setProperty('--login-wallpaper','url("'+url.replaceAll('"','%22')+'")');gate.classList.add('custom-login-bg')};
   preview.src=url;
 }).catch(err=>console.warn('Login background unavailable',err));
}
})();