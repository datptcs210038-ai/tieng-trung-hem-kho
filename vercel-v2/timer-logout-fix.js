;(()=>{const css="\n.user-top-bar{display:flex;align-items:center;justify-content:flex-end;gap:15px;min-height:48px;margin:0 0 19px}\n.user-top-bar #hello{display:block!important;min-width:0;margin:0!important;max-width:calc(100% - 131px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;font-weight:700;color:#567f96}\n.quick-signout{flex-shrink:0;border-radius:13px;border:1px solid #c9deef;background:#eaf5fc;color:#0a5d8d;padding:10px 13px;font-size:12px;font-weight:800;cursor:pointer}\n.quick-signout:hover{background:#d8ecfa}.quick-signout:disabled{opacity:.55;cursor:wait}\n#timerFloatingWindow{position:fixed;z-index:176;right:22px;bottom:99px;width:277px;padding:16px;border-radius:22px;background:#fffffff5;backdrop-filter:blur(18px);border:1px solid #d0e5f2;box-shadow:0 18px 48px #073f6736;color:#12415a}\n#timerFloatingWindow[hidden],#timerFloatingChip[hidden]{display:none!important}\n.timer-mini-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.timer-mini-head strong{font-size:14px;color:#084870}\n.mini-icon{background:#e9f4fd;border:1px solid #d0e6f5;border-radius:10px;color:#174d6d;padding:5px 11px;font-size:18px;cursor:pointer}\n.timer-float-time{text-align:center;font-size:42px;font-weight:850;line-height:1.2;letter-spacing:-.05em;font-variant-numeric:tabular-nums;color:#095984;margin:12px 0 6px}\n.timer-float-phase{text-align:center;margin:0 0 14px;color:#6a8ba1;font-size:12px}\n.timer-float-actions{display:flex;gap:8px}.timer-float-actions .btn{flex:1;padding:10px 8px!important;font-size:11px}\n#timerFloatingChip{position:fixed;z-index:176;right:93px;bottom:24px;display:flex;align-items:center;gap:9px;border:1px solid #c9e2f2;border-radius:17px;background:#fffffff5;color:#0c608c;box-shadow:0 9px 28px #0d486f34;padding:12px 16px;font-size:15px;font-weight:850;cursor:pointer;font-variant-numeric:tabular-nums}\n.timer-chip-dot{height:8px;width:8px;border-radius:50%;background:#17a2da;animation:miniPulse 1.2s infinite}\n#timerFloatingChip.paused .timer-chip-dot{background:#e8a654;animation:none}\n#toast{z-index:10001!important;bottom:189px!important;right:20px!important;background:#f9fdff!important;border:1px solid #a8d5ec!important;box-shadow:0 21px 50px #06456c47!important}\n@keyframes miniPulse{50%{opacity:.32}}\n@media(max-width:820px){.user-top-bar{justify-content:space-between;margin:0 0 14px!important;gap:8px}.user-top-bar #hello{font-size:11px;max-width:calc(100% - 115px)}.quick-signout{padding:9px 10px;font-size:11px}#timerFloatingWindow{right:12px;bottom:169px;width:min(277px,calc(100vw - 24px))}#timerFloatingChip{right:72px;bottom:161px}#toast{bottom:230px!important;right:10px!important;max-width:calc(100vw - 20px)!important}}\n@media(prefers-reduced-motion:reduce){.timer-chip-dot{animation:none}}\n";const style=document.createElement('style');style.textContent=css;document.head.append(style)})();
(()=>{
'use strict';
const D=window.TTHK,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
if(!D||!$('#site')||!$('#toggleClock')||!$('#logout'))return;
let logoutBusy=false;
async function signOut(){
 if(logoutBusy)return;
 logoutBusy=true;
 const buttons=[$('#logout'),$('#quickSignOut')].filter(Boolean);
 buttons.forEach(b=>{b.disabled=true;b.dataset.originalText=b.textContent;b.textContent='Đang đăng xuất…'});
 try{
  const {db}=D.profileContext?.()||{};
  if(!db)throw Error('Chưa có kết nối tài khoản. Vui lòng tải lại trang.');
  const result=await db.auth.signOut({scope:'local'});
  if(result.error)throw result.error;
  D.stopTimerOnLogout?.();
  const screen=$('#pageTabLoader');
  if(screen){screen.classList.remove('active');screen.setAttribute('aria-hidden','true')}
  $('#site').hidden=true;$('#gate').hidden=false;
  $('#music').hidden=true;
  const p=$('#passLogin');if(p)p.value='';
  document.querySelectorAll('.authpane').forEach(x=>x.classList.toggle('on',x.id==='paneLogin'));
  $('#authStatus').textContent='✅ Đã đăng xuất thành công!';
  window.scrollTo(0,0);
 }catch(error){
  const msg='Không thể đăng xuất: '+(error?.message||String(error));
  if($('#hello'))$('#hello').textContent=msg;
  window.alert(msg);
 }finally{
  logoutBusy=false;
  buttons.forEach(b=>{b.disabled=false;b.textContent=b.dataset.originalText||'↪ Đăng xuất'});
 }
}
D.signOut=signOut;
$('#logout').onclick=signOut;
if(!$('#quickSignOut')){
 const hello=$('#hello');
 const wrap=document.createElement('div');
 wrap.className='user-top-bar';
 hello?.parentElement?.insertBefore(wrap,hello);
 if(hello)wrap.append(hello);
 const b=document.createElement('button');
 b.id='quickSignOut';b.type='button';b.className='quick-signout';b.textContent='↪ Đăng xuất';b.onclick=signOut;
 wrap.append(b);
}
let mode='pomo',phase='study',remaining=25*60*1000,elapsed=0,deadline=0,startWatchAt=0,running=false,miniVisible=false,minimized=false,ticker=0;
const mini=document.createElement('aside');mini.id='timerFloatingWindow';mini.hidden=true;mini.setAttribute('role','timer');mini.setAttribute('aria-label','Đồng hồ học tập nổi');
mini.innerHTML='<div class="timer-mini-head"><strong>⏱ <span id="timerFloatName">Pomodoro</span></strong><button type="button" id="timerFloatMin" class="mini-icon" title="Thu nhỏ đồng hồ" aria-label="Thu nhỏ đồng hồ">−</button></div><div id="timerFloatTime" class="timer-float-time">25:00</div><p id="timerFloatPhase" class="timer-float-phase">Đang học</p><div class="timer-float-actions"><button type="button" id="timerFloatToggle" class="btn soft">⏸ Tạm dừng</button><button type="button" id="timerFloatExpand" class="btn soft">Mở rộng ↗</button></div>';
document.body.append(mini);
const chip=document.createElement('button');chip.id='timerFloatingChip';chip.type='button';chip.hidden=true;chip.title='Mở lại đồng hồ Pomodoro';
chip.innerHTML='<span class="timer-chip-dot" aria-hidden="true"></span><span id="timerChipReadout">25:00</span><span aria-hidden="true">↗</span>';
document.body.append(chip);
const duration=()=>({study:Math.max(1,60*(Number($('#studyMin').value)||0)+(Number($('#studySec').value)||0))*1000,break:Math.max(1,60*(Number($('#breakMin').value)||0)+(Number($('#breakSec').value)||0))*1000});
function format(ms,watch){const s=Math.max(0,Math.floor(ms/1000));const mm=String(Math.floor(s/60)%60).padStart(2,'0'),ss=String(s%60).padStart(2,'0');return watch?String(Math.floor(s/3600)).padStart(2,'0')+':'+mm+':'+ss:String(Math.floor(s/60)).padStart(2,'0')+':'+ss}
function current(){return mode==='watch'?(running?elapsed+Date.now()-startWatchAt:elapsed):(running?Math.max(0,deadline-Date.now()):remaining)}
function syncMini(){
 const allowed=miniVisible&&!$('#site').hidden;
 mini.hidden=!allowed||minimized;
 chip.hidden=!allowed||!minimized;
 chip.classList.toggle('paused',!running);
}
function beep(){
 try{
  const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;
  const audio=new AudioCtx(),base=audio.currentTime;
  [880,1046.5,1318.5].forEach((frequency,i)=>{
   const osc=audio.createOscillator(),gain=audio.createGain(),at=base+i*.23;
   osc.type='sine';osc.frequency.value=frequency;
   gain.gain.setValueAtTime(.0001,at);
   gain.gain.exponentialRampToValueAtTime(.09,at+.025);
   gain.gain.exponentialRampToValueAtTime(.0001,at+.4);
   osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+.44);
  });
  setTimeout(()=>audio.close().catch(()=>{}),1850);
 }catch(e){console.warn('Sound notification unavailable',e)}
}
function completed(){
 const finished=phase;
 running=false;clearInterval(ticker);ticker=0;deadline=0;
 phase=finished==='study'?'break':'study';remaining=duration()[phase];
 const title=finished==='study'?'🌿 Hết giờ học — đến giờ nghỉ!':'📚 Hết giờ nghỉ — quay lại học nhé!';
 $('#toastTitle').textContent=title;$('#toast').hidden=false;
 beep();
 if('Notification'in window&&Notification.permission==='granted'){
  try{new Notification('Tiếng Trung Hem Khó',{body:title,icon:'/logo-tthk.webp',tag:'study-reminder'})}catch(e){console.warn('Native notification unavailable',e)}
 }
}
function render(){
 if(running&&mode==='pomo'&&Date.now()>=deadline)completed();
 const time=format(current(),mode==='watch');
 $('#clock').textContent=time;
 $('#timerFloatTime').textContent=time;$('#timerChipReadout').textContent=time;
 $('#timerFloatName').textContent=mode==='watch'?'Stopwatch':'Pomodoro';
 $('#timerFloatPhase').textContent=mode==='watch'?'⏱ Đang bấm giờ':phase==='study'?'📚 Phiên học':'🌿 Phiên nghỉ';
 $('#toggleClock').textContent=running?'⏸ Tạm dừng':miniVisible?'▶ Tiếp tục':'▶ Bắt đầu';
 $('#timerFloatToggle').textContent=running?'⏸ Tạm dừng':'▶ Tiếp tục';
 syncMini();
}
function toggle(){
 if(running){
  if(mode==='watch')elapsed+=Math.max(0,Date.now()-startWatchAt);
  else remaining=Math.max(0,deadline-Date.now());
  running=false;clearInterval(ticker);ticker=0;
 }else{
  if(mode==='pomo'){if(!miniVisible)remaining=duration().study;deadline=Date.now()+remaining}
  else startWatchAt=Date.now();
  running=true;miniVisible=true;
  clearInterval(ticker);ticker=setInterval(render,250);
  if('Notification'in window&&Notification.permission==='default'){
   try{Notification.requestPermission().catch(()=>{})}catch(e){}
  }
 }
 render();
}
$('#toggleClock').onclick=toggle;
$('#timerFloatToggle').onclick=toggle;
$('#timerFloatMin').onclick=()=>{minimized=true;syncMini()};
chip.onclick=()=>{minimized=false;syncMini()};
$('#timerFloatExpand').onclick=()=>{minimized=true;syncMini();D.page('timer')};
$('#resetClock').onclick=()=>{
 running=false;clearInterval(ticker);ticker=0;phase='study';remaining=duration().study;elapsed=0;deadline=0;startWatchAt=0;miniVisible=false;minimized=false;
 $('#toast').hidden=true;render();
};
$$('[data-timer]').forEach(button=>button.onclick=()=>{
 running=false;clearInterval(ticker);ticker=0;phase='study';elapsed=0;startWatchAt=0;deadline=0;
 mode=button.dataset.timer;remaining=duration().study;miniVisible=false;minimized=false;
 $$('[data-timer]').forEach(b=>b.classList.toggle('on',b===button));
 $('#pomofields').hidden=mode==='watch';$('#toast').hidden=true;render();
});
['studyMin','studySec','breakMin','breakSec'].forEach(id=>$('#'+id)?.addEventListener('input',()=>{if(!running&&!miniVisible&&mode==='pomo'){remaining=duration().study;render()}}));
$('#notify').onclick=async()=>{
 if(!('Notification'in window)){$('#timeMessage').textContent='Trình duyệt không hỗ trợ thông báo hệ thống; thông báo trong trang vẫn hoạt động.';return}
 try{const p=await Notification.requestPermission();$('#timeMessage').textContent=p==='granted'?'🔔 Đã bật thông báo khi hết giờ.':'Chưa có quyền thông báo hệ thống; thông báo trên web vẫn hoạt động.'}
 catch(e){$('#timeMessage').textContent='Không bật được thông báo hệ thống; thông báo trên web vẫn hoạt động.'}
};
$('#dismiss').onclick=()=>$('#toast').hidden=true;
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
window.addEventListener('focus',render);
const authObserver=new MutationObserver(syncMini);authObserver.observe($('#site'),{attributes:true,attributeFilter:['hidden']});
D.stopTimerOnLogout=()=>{running=false;clearInterval(ticker);ticker=0;miniVisible=false;minimized=false;elapsed=0;remaining=duration().study;$('#toast').hidden=true;syncMini()};
render();
})();