/* Mandarin voice coach — concise controls & natural Mandarin preference */
(()=>{
'use strict';
const D=window.TTHK;
if(!D)return;
const synth=window.speechSynthesis;
const KEY_VOICE='tthk_voice_v4',KEY_SPEED='tthk_voice_speed_v4';
let allVoices=[],chosen=localStorage.getItem(KEY_VOICE)||'auto';
let speed=Number(localStorage.getItem(KEY_SPEED))||0.85;
const $=s=>document.querySelector(s);
function mandarin(voice){
 const lang=(voice.lang||'').toLowerCase().replace(/_/g,'-');
 return lang==='zh-cn'||lang==='zh-hans'||lang.startsWith('zh-hans-cn')||lang.startsWith('cmn-')||lang==='cmn';
}
function score(v){
 const name=(v.name||'').toLowerCase();
 let points=0;
 if(/natural|neural|premium|online|enhanced/.test(name))points+=100;
 if(/xiaoxiao|xiaoyi|xiaohan|ting.?ting|meijia|google.*(普通话|mandarin|chinese)/i.test(name))points+=65;
 if(/microsoft|google|apple/.test(name))points+=12;
 if(/mainland|mandarin|普通话/.test(name))points+=10;
 if(v.localService===false)points+=7;
 if(/yuxi|yunxi|yunjian/.test(name))points+=30;
 if(/compact|eSpeak|espeak|old/.test(name))points-=90;
 return points;
}
function selectedVoice(){
 return allVoices.find(v=>v.voiceURI===chosen)||allVoices[0]||null;
}
function refresh(){
 allVoices=synth?synth.getVoices().filter(mandarin).sort((a,b)=>score(b)-score(a)||a.name.localeCompare(b.name)):[];
 const pick=$('#speechVoice'),message=$('#speechStatus');
 if(!pick)return;
 pick.replaceChildren();
 pick.add(new Option('Đề xuất · Quan thoại rõ', 'auto'));
 for(const v of allVoices){
  const label=(v.name||'Giọng tiếng Trung')+' · '+v.lang;
  pick.add(new Option(label,v.voiceURI));
 }
 pick.value=allVoices.some(v=>v.voiceURI===chosen)?chosen:'auto';
 if(message)message.textContent=allVoices.length
  ?'Có '+allVoices.length+' giọng Quan thoại trên thiết bị. Mặc định ưu tiên giọng rõ, tự nhiên.'
  :'Thiết bị chưa tải giọng tiếng Trung. Hãy cài thêm giọng Quan thoại trong cài đặt hệ điều hành.';
}
function speak(text){
 if(!synth||!window.SpeechSynthesisUtterance){
  const msg=$('#speechStatus');if(msg)msg.textContent='Thiết bị chưa hỗ trợ đọc tiếng Trung.';return;
 }
 const value=String(text||'').trim().slice(0,220);
 if(!value)return;
 synth.cancel();
 const u=new SpeechSynthesisUtterance(value);
 u.lang='zh-CN';u.rate=speed;u.pitch=1;u.volume=1;
 const voice=selectedVoice();
 if(voice)u.voice=voice;
 u.onerror=e=>{
  if(!['canceled','interrupted'].includes(e.error)){
   const msg=$('#speechStatus');
   if(msg)msg.textContent='Chưa phát được giọng này. Hãy thử “Đề xuất” hoặc chọn một giọng khác.';
  }
 };
 synth.speak(u);
}
D.speak=speak;
function init(){
 const section=$('#vocab'),grid=$('#wordGrid');
 if(!section||$('#speechPanel'))return;
 const panel=document.createElement('details');
 panel.id='speechPanel';panel.className='speech-panel compact-collapsible';
 panel.innerHTML='<summary class="compact-detail-summary"><span class="detail-icon" aria-hidden="true">◖))</span><span>Giọng đọc tiếng Trung</span><small>Chạm để chọn giọng và tốc độ</small><span class="detail-caret" aria-hidden="true">⌄</span></summary>'
 +'<div class="speech-controls">'
 +'<label for="speechVoice">Giọng Quan thoại</label><select id="speechVoice" aria-label="Chọn giọng đọc Quan thoại"></select>'
 +'<label for="speechSpeed">Tốc độ phát âm</label><select id="speechSpeed"><option value="0.75">Rõ từng từ · 0,75×</option><option value="0.85">Luyện nghe · 0,85×</option><option value="1">Tự nhiên · 1,0×</option></select>'
 +'<button type="button" class="btn soft" id="speechTest">▶ Nghe thử 你好</button>'
 +'<p id="speechStatus" role="status"></p>'
 +'</div>';
 if(grid)section.insertBefore(panel,grid);else section.append(panel);
 const sel=$('#speechVoice'),rate=$('#speechSpeed');
 rate.value=String([.75,.85,1].includes(speed)?speed:.85);
 speed=Number(rate.value);
 rate.onchange=()=>{speed=Number(rate.value);localStorage.setItem(KEY_SPEED,String(speed))};
 sel.onchange=()=>{chosen=sel.value;localStorage.setItem(KEY_VOICE,chosen);speak('你好，我正在学习中文。')};
 $('#speechTest').onclick=()=>speak('你好，我正在学习中文。');
 refresh();
 if(synth){
  if(typeof synth.addEventListener==='function')synth.addEventListener('voiceschanged',refresh);
  else synth.onvoiceschanged=refresh;
  setTimeout(refresh,350);setTimeout(refresh,1400);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();