
;(()=>{
 'use strict';
 const NAME='TIẾNG TRUNG HEM KHÓ';
 document.title=NAME;
 const meta=[
  ['name','application-name',NAME],
  ['name','apple-mobile-web-app-title',NAME],
  ['property','og:title',NAME],
  ['name','twitter:title',NAME]
 ];
 for(const [attr,value,content] of meta){
  let node=document.head.querySelector('meta['+attr+'="'+value+'"]');
  if(!node){node=document.createElement('meta');node.setAttribute(attr,value);document.head.append(node);}
  node.setAttribute('content',content);
 }
 function replaceBrandText(){
  const body=document.body;
  if(!body)return;
  const walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT,{
   acceptNode(node){
    if(!node.nodeValue?.includes('Tiếng Trung Hem Khó'))return NodeFilter.FILTER_REJECT;
    if(node.parentElement?.closest('script,style,textarea,code,pre'))return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
   }
  });
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>node.nodeValue=node.nodeValue.replaceAll('Tiếng Trung Hem Khó',NAME));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',replaceBrandText,{once:true});
 else replaceBrandText();
})();

(()=>{
const D=window.TTHK,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];let db=null,user=null;D.profileContext=()=>({db,user});$('#team').innerHTML=D.team.map((x,i)=>'<div class="box member"><div class="memberpic" style="background-position:'+(i*25)+'% center"></div><h3>'+x[0]+'</h3><p class="muted">'+x[1]+'</p></div>').join('');
function pane(id){$$('.authpane').forEach(x=>x.classList.toggle('on',x.id===id));$('#authStatus').textContent=''}$$('[data-auth]').forEach(b=>b.onclick=()=>pane(b.dataset.auth));
async function session(){try{const r=await db.auth.getUser();if(r.error)throw r.error;user=r.data.user;$('#gate').hidden=!!user;$('#site').hidden=!user;$('#music').hidden=!user;if(user){$('#hello').textContent='Xin chào, '+(user.user_metadata?.full_name||user.email?.split('@')[0])+' 🌱';D.syncUserHeader?.();if(!D.words.length)D.loadWords().catch(e=>console.warn('Vocabulary data unavailable',e))}else{pane('paneLogin');D.syncUserHeader?.()}return !!user}catch(e){$('#authStatus').textContent='Không kiểm tra được phiên đăng nhập. Kiểm tra kết nối và thử tải lại trang.';return false}}
async function auth(){db=window.supabase?.createClient('https://wcgzdbjmwhyroszvyetv.supabase.co','sb_publishable_rS5k1n1aKhqPaq_4En2pKw_hXYe3WcJ');if(!db){$('#authStatus').textContent='Chưa tải được dịch vụ đăng nhập.';return}db.auth.onAuthStateChange(e=>{if(e==='PASSWORD_RECOVERY')pane('paneReset')});await session()}
$('#login').onclick=async()=>{const btn=$('#login');const email=$('#emailLogin').value.trim();const pass=$('#passLogin').value;if(!email||!pass){$('#authStatus').textContent='Vui lòng nhập email và mật khẩu.';return}btn.disabled=true;btn.textContent='Đang đăng nhập…';$('#authStatus').textContent='Đang xác thực với Supabase…';try{if(!db)throw new Error('Chưa kết nối được dịch vụ tài khoản, hãy tải lại trang.');let r=await db.auth.signInWithPassword({email,password:pass});if(r.error)throw r.error;$('#authStatus').textContent='Đăng nhập thành công, đang mở website…';const ok=await session();if(!ok)$('#authStatus').textContent='Đã xác thực, nhưng chưa tải được trang học tập. Vui lòng tải lại trang.';}catch(e){const message=String(e.message||e);$('#authStatus').textContent=/invalid login credentials/i.test(message)?'Email hoặc mật khẩu không chính xác. Bạn có thể chọn Quên mật khẩu để đặt lại.':/email not confirmed/i.test(message)?'Bạn cần xác nhận email trước khi đăng nhập.':message;}finally{btn.disabled=false;btn.textContent='Đăng nhập'}};
$('#register').onclick=async()=>{let full_name=$('#fullName').value.trim(),student_id=$('#studentId').value.trim().toUpperCase(),phone=$('#phone').value.trim(),email=$('#emailReg').value.trim().toLowerCase(),password=$('#passReg').value;if(!full_name||student_id.length<4||!/^0[0-9]{9}$/.test(phone)||!email.includes('@')||password.length<8){$('#authStatus').textContent='Nhập đủ họ tên, MSSV, SĐT 10 số, email và mật khẩu từ 8 ký tự.';return}let r=await db.auth.signUp({email,password,options:{data:{full_name,student_id,phone},emailRedirectTo:location.origin}});$('#authStatus').textContent=r.error?r.error.message:'Kiểm tra email xác nhận nếu được yêu cầu.'};
$('#recover').onclick=async()=>{let r=await db.auth.resetPasswordForEmail($('#recoverEmail').value.trim(),{redirectTo:location.origin});$('#authStatus').textContent=r.error?r.error.message:'Nếu email đã đăng ký, hãy kiểm tra hộp thư.'};$('#changePassword').onclick=async()=>{let r=await db.auth.updateUser({password:$('#newPassword').value});$('#authStatus').textContent=r.error?r.error.message:'Mật khẩu đã được cập nhật.'};$('#logout').onclick=async()=>{await db.auth.signOut();session()};
D.page=function(id){$$('.page').forEach(x=>x.classList.toggle('on',x.id===id));$$('.nav [data-page]').forEach(x=>x.classList.toggle('on',x.dataset.page===id));if(id==='writing')write();if(id==='rank')ranks();if(id==='lookup')D.lookup();window.scrollTo(0,0)};$$('[data-page]').forEach(b=>b.onclick=()=>D.page(b.dataset.page));
['level','topic','vocabQuery','onlyPhotos'].forEach(k=>$('#'+k).oninput=()=>{D.shown=32;D.vocab()});$('#loadMore').onclick=()=>{D.shown+=32;D.vocab()};$$('[data-lookup]').forEach(b=>b.onclick=()=>{D.lookupType=b.dataset.lookup;$$('[data-lookup]').forEach(x=>x.classList.toggle('on',x===b));D.lookup()});$('#query').oninput=D.lookup;$('#voice').onclick=()=>{let SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return alert('Trình duyệt chưa hỗ trợ nhận dạng giọng nói.');let r=new SR();r.lang='zh-CN';r.onresult=e=>{$('#query').value=e.results[0][0].transcript;D.lookup()};r.start()};
let writer=null;
let writingProgress={accepted:0,mistakes:0,completed:0,done:false};
let writingToken=0;
const resultPanel=document.createElement('div');
resultPanel.id='writingResult';
resultPanel.setAttribute('role','status');
resultPanel.style.cssText='margin-top:12px;padding:12px;border-radius:12px;background:#edf7ef;color:#185b40;line-height:1.8;';
$('#writingHelp').insertAdjacentElement('afterend',resultPanel);
function restartWriting(){
 writingProgress={accepted:0,mistakes:0,completed:0,done:false};
 D.charIndex=0;
 write();
}
function writingProgressText(){
 return 'Đang kiểm tra chữ '+(D.charIndex+1)+'/'+[...D.words[D.writeIndex].h].length+'. Hãy tự viết từng nét vào ô trống. Không có chữ hoặc nét gợi ý.';
}
function writingFinish(){
 writingProgress.done=true;
 const accepted=writingProgress.accepted,misses=writingProgress.mistakes;
 const score=accepted?Math.round(100*accepted/(accepted+misses)):0;
 resultPanel.replaceChildren();
 const heading=document.createElement('strong');
 heading.style.fontSize='22px';
 heading.textContent='✅ Mức độ khớp nét: '+score+'%';
 const detail=document.createElement('p');
 detail.textContent='Hoàn thành '+writingProgress.completed+' chữ · '+accepted+' nét được chấp nhận · '+misses+' lần viết chưa đúng.';
 const note=document.createElement('p');note.style.fontSize='12px';
 note.textContent='Điểm tham khảo dựa trên hướng, thứ tự và độ gần của nét do Hanzi Writer kiểm tra; không phải tỷ lệ trùng khớp ảnh hay chứng nhận chữ viết tay.';
 const reset=document.createElement('button');
 reset.type='button';reset.className='btn soft';reset.textContent='↺ Viết lại và chấm lại';reset.onclick=restartWriting;
 resultPanel.append(heading,detail,note,reset);
 $('#writingHelp').textContent='Đã hoàn thành. Bấm Hiện chữ để xem đáp án hoặc Viết lại để luyện tiếp.';
}
function write(){
 const w=D.words[D.writeIndex];if(!w)return;
 const chars=[...w.h];if(!chars.length)return;
 const token=++writingToken;
 try{writer?.cancelQuiz?.()}catch(e){}
 writer=null;
 $('#writeSelect').value=D.writeIndex;$('#writeSelect').hidden=D.isHidden;
 $('#hanzi').textContent=D.isHidden?'？':w.h;
 $('#pinyin').textContent=D.isHidden?'Đã ẩn pinyin':w.p;
 $('#meaning').textContent=w.m;
 $('#hideWord').textContent=D.isHidden?'👁 Hiện chữ':'🙈 Ẩn chữ';
 $('#chars').replaceChildren();
 if(D.isHidden){
  const status=document.createElement('span');status.className='muted';
  status.textContent='Đang kiểm tra chữ '+(D.charIndex+1)+' / '+chars.length;
  $('#chars').append(status);
 }else{
  $('#chars').innerHTML=chars.map((c,i)=>'<button type="button" class="btn soft" data-char="'+i+'">'+c+'</button>').join('');
  $$('[data-char]').forEach(b=>b.onclick=()=>{D.charIndex=+b.dataset.char;write()});
 }
 $('#writeCanvas').innerHTML='';
 if(!window.HanziWriter){
  $('#writingHelp').textContent='Không tải được công cụ kiểm tra nét. Hãy kiểm tra kết nối mạng rồi tải lại trang.';
  return;
 }
 writer=HanziWriter.create('writeCanvas',chars[D.charIndex],{
  width:265,height:265,padding:16,strokeColor:'#19815b',outlineColor:'#d4e9dd',
  drawingColor:'#178565',showCharacter:!D.isHidden,showOutline:!D.isHidden,
  showHintAfterMisses:false,highlightOnComplete:false,
  onLoadCharDataError:()=>{if(token===writingToken)$('#writingHelp').textContent='Chưa tải được dữ liệu nét chữ này; hãy thử lại.';}
 });
 if(!D.isHidden){
  resultPanel.hidden=true;
  $('#writingHelp').textContent='Xem chữ Hán và thứ tự nét, sau đó nhấn Ẩn chữ để viết không nhìn mẫu.';
  writer.animateCharacter();
  return;
 }
 resultPanel.hidden=false;resultPanel.replaceChildren();
 $('#writingHelp').textContent=writingProgressText();
 const message=document.createElement('p');message.textContent='✍️ Tự viết vào ô trống. Hệ thống sẽ kiểm tra từng nét và chấm điểm khi hoàn thành từ.';
 resultPanel.append(message);
 let correctOnChar=0;
 writer.quiz({
  showHintAfterMisses:false,acceptBackwardsStrokes:false,leniency:0.85,highlightOnComplete:false,
  onCorrectStroke:()=>{
   if(token!==writingToken)return;
   correctOnChar++;
  },
  onMistake:()=>{},
  onComplete:summary=>{
   if(token!==writingToken||writingProgress.done)return;
   writingProgress.accepted+=correctOnChar;
   writingProgress.mistakes+=summary.totalMistakes||0;
   writingProgress.completed++;
   if(D.charIndex+1<chars.length){
    $('#writingHelp').textContent='✅ Hoàn thành chữ '+(D.charIndex+1)+'/'+chars.length+'. Hãy chuyển sang chữ kế tiếp.';
    resultPanel.replaceChildren();
    const n=document.createElement('button');n.type='button';n.className='btn';
    n.textContent='Tiếp tục chữ '+(D.charIndex+2)+' / '+chars.length+' →';
    n.onclick=()=>{D.charIndex++;write()};
    resultPanel.append(n);
   }else writingFinish();
  }
 });
}
$('#writeSelect').onchange=e=>{D.writeIndex=+e.target.value;D.isHidden=false;restartWriting()};
$('#hideWord').onclick=()=>{D.isHidden=!D.isHidden;restartWriting()};
$('#hear').onclick=()=>D.speak(D.words[D.writeIndex]?.h||'你好');
$('#animate').textContent='▶ Xem mẫu';$('#animate').onclick=()=>{if(D.isHidden){D.isHidden=false;restartWriting()}else writer?.animateCharacter()};
$('#trace').textContent='✍ Bắt đầu chấm';$('#trace').onclick=()=>{D.isHidden=true;restartWriting()};
$('#clear').textContent='↺ Viết lại';$('#clear').onclick=restartWriting;
let quizWords=[],qi=0,correct=0,flash=false,testLevel=1,testNum=1;function begin(f){flash=f;testLevel=f?1:+$('#examLevel').value;testNum=f?Math.ceil(Math.random()*300):+$('#examNum').value;quizWords=D.shuffle(D.words.filter(w=>w.l<=testLevel),testLevel*813+testNum*179).slice(0,f?+$('#flashCount').value:testLevel===1?40:60);qi=0;correct=0;question()}
function question(){let box=flash?$('#flashBody'):$('#examBody');if(qi>=quizWords.length)return finish();let w=quizWords[qi],listen=!flash&&qi<quizWords.length/2,opts=D.shuffle([w,...D.shuffle(D.words.filter(x=>x.h!==w.h&&x.m!==w.m),qi*31).slice(0,3)],testNum+qi*7);box.innerHTML='<p>HSK'+testLevel+' · Câu '+(qi+1)+'/'+quizWords.length+'</p><h1 style="text-align:center">'+(listen?'🎧':w.h)+'</h1>'+(listen?'<button class="btn soft" id="listenQ">🔊 Nghe</button>':'')+opts.map((x,i)=>'<button class="choice" data-answer="'+i+'">'+x.m+'</button>').join('')+'<p id="feedback"></p>';if(listen)$('#listenQ').onclick=()=>D.speak(w.h);$$('[data-answer]').forEach(b=>b.onclick=()=>{if($('#feedback').dataset.done)return;$('#feedback').dataset.done='1';let ok=opts[+b.dataset.answer]===w;if(ok)correct++;$('#feedback').innerHTML=(ok?'✅ Chính xác!':'❌ Đáp án: '+w.m)+' <button class="btn" id="next">Tiếp theo</button>';$('#next').onclick=()=>{qi++;question()}})}
async function finish(){let rate=Math.round(correct/quizWords.length*100),box=flash?$('#flashBody'):$('#examBody');box.innerHTML='<h2>'+(flash?'🎉 Hoàn thành flashcard!':'🎉 Hoàn thành đề HSK!')+'</h2><h1>'+rate+'%</h1><p>'+correct+'/'+quizWords.length+' câu đúng.</p><p id="scoreSaved"></p><button class="btn" id="retry">Thử lại</button>';$('#retry').onclick=()=>begin(flash);if(flash)return;let r=await db.from('hsk_scores').insert({user_id:user.id,nickname:String(user.user_metadata?.full_name||user.email?.split('@')[0]||'Học viên').slice(0,40),level:testLevel,score:rate,correct,total:quizWords.length});$('#scoreSaved').textContent=r.error?r.error.message:'Đã lưu điểm lên bảng xếp hạng.'}$('#startExam').onclick=()=>begin(false);$('#startFlash').onclick=()=>begin(true);
async function ranks(){let r=await db.from('hsk_scores').select('user_id,nickname,level,score,total').order('score',{ascending:false}).limit(300);if(r.error)return;for(let l of [1,2]){let ids=new Set(),a=r.data.filter(x=>x.level===l&&x.total===(l===1?40:60)&&!ids.has(x.user_id)&&ids.add(x.user_id));let box=$('#rank'+l);box.replaceChildren();if(!a.length)box.textContent='Chưa có kết quả.';a.forEach((x,i)=>{let p=document.createElement('p');p.textContent=(i+1)+'. '+x.nickname+' — '+x.score+'%';box.append(p)})}}
let timerMode='pomo',phase='study',remain=1500000,elapsed=0,started=0,running=false,interval=null;function durations(){return{study:Math.max(1,(+$('#studyMin').value||0)*60+(+$('#studySec').value||0))*1000,break:Math.max(1,(+$('#breakMin').value||0)*60+(+$('#breakSec').value||0))*1000}}function clock(){let ms=running?(timerMode==='watch'?elapsed+Date.now()-started:Math.max(0,remain-Date.now()+started)):(timerMode==='watch'?elapsed:remain),n=Math.floor(ms/1000);$('#clock').textContent=timerMode==='watch'?String(Math.floor(n/3600)).padStart(2,'0')+':'+String(Math.floor(n/60)%60).padStart(2,'0')+':'+String(n%60).padStart(2,'0'):String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');if(running&&timerMode==='pomo'&&ms<=0){clearInterval(interval);running=false;phase=phase==='study'?'break':'study';remain=durations()[phase];$('#toastTitle').textContent=phase==='break'?'🌿 Đến giờ nghỉ rồi!':'📚 Quay lại học nhé!';$('#toast').hidden=false;$('#toggleClock').textContent='▶ Bắt đầu';if('Notification'in window&&Notification.permission==='granted')new Notification($('#toastTitle').textContent);clock()}}$('#toggleClock').onclick=()=>{if(running){let d=Date.now()-started;if(timerMode==='watch')elapsed+=d;else remain=Math.max(0,remain-d);clearInterval(interval);running=false;$('#toggleClock').textContent='▶ Tiếp tục'}else{started=Date.now();running=true;interval=setInterval(clock,280);$('#toggleClock').textContent='⏸ Tạm dừng'}clock()};$('#resetClock').onclick=()=>{clearInterval(interval);running=false;phase='study';remain=durations().study;elapsed=0;$('#toggleClock').textContent='▶ Bắt đầu';clock()};$$('[data-timer]').forEach(b=>b.onclick=()=>{clearInterval(interval);running=false;timerMode=b.dataset.timer;$$('[data-timer]').forEach(x=>x.classList.toggle('on',x===b));$('#pomofields').hidden=timerMode==='watch';elapsed=0;remain=durations().study;clock()});$('#notify').onclick=async()=>{if('Notification'in window){let r=await Notification.requestPermission();$('#timeMessage').textContent=r==='granted'?'Đã bật thông báo chạy nền.':'Trình duyệt chưa cấp quyền.'}};$('#dismiss').onclick=()=>$('#toast').hidden=true;clock();
$('#memo').value=localStorage.getItem('tthk_memo')||'';$('#memo').oninput=()=>localStorage.setItem('tthk_memo',$('#memo').value);$('#planDate').value=new Date().toISOString().slice(0,10);function plans(){let a=JSON.parse(localStorage.getItem('tthk_plans')||'[]');$('#planList').replaceChildren();a.forEach((x,i)=>{let p=document.createElement('p');p.textContent=x.date+' · '+x.text+' ';let del=document.createElement('button');del.textContent='Xóa';del.className='btn soft';del.onclick=()=>{a.splice(i,1);localStorage.setItem('tthk_plans',JSON.stringify(a));plans()};p.append(del);$('#planList').append(p)})}$('#addPlan').onclick=()=>{let a=JSON.parse(localStorage.getItem('tthk_plans')||'[]'),text=$('#plan').value.trim();if(!text)return;a.push({date:$('#planDate').value,text});localStorage.setItem('tthk_plans',JSON.stringify(a));$('#plan').value='';plans()};plans();
let audio=null,musicLoop=null,note=0,melody=[392,440,493.88,440,392,349.23,329.63];function playNote(){let t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain(),f=audio.createBiquadFilter();o.type='sawtooth';o.frequency.value=melody[note++%melody.length];f.type='lowpass';f.frequency.value=700;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.017,t+.2);g.gain.exponentialRampToValueAtTime(.0001,t+1.5);o.connect(f);f.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+1.6)}$('#music').onclick=async()=>{if(audio){clearInterval(musicLoop);await audio.close();audio=null;$('#music').textContent='🎻 Bật nhạc nhẹ'}else{audio=new(window.AudioContext||window.webkitAudioContext)();playNote();musicLoop=setInterval(playNote,1600);$('#music').textContent='🔇 Tắt nhạc'}};window.addEventListener('load',auth);

})();

(function(){
"use strict";
const D=window.TTHK;
if(!D)return;
const $=s=>document.querySelector(s);
const enhanceStyle=document.createElement('style');
enhanceStyle.textContent=`
.memberpic{background-image:url('/team.webp');background-repeat:no-repeat;background-size:500% 100%;width:100%;aspect-ratio:3/4;display:block;filter:none}
.member{max-width:330px;min-width:225px}
#profile .profile-grid{display:grid;grid-template-columns:minmax(160px,230px) 1fr;gap:22px}
#profile .profile-avatar{width:175px;height:175px;border-radius:50%;background:#e8f6ec;display:grid;place-items:center;overflow:hidden;font-size:72px;margin:6px auto 16px;border:4px solid #d1ebd8}
#profile .profile-avatar img{width:100%;height:100%;object-fit:cover}
#profile .profile-field{display:flex;flex-direction:column;gap:6px;min-width:0;margin-bottom:16px}
#profile .profile-field label{font-weight:700;font-size:12px;color:#53745e}
#profile .profile-field input{width:100%;max-width:100%;background:#fff}
#profile .profile-field input[readonly]{background:#edf4ed;color:#637b69;cursor:not-allowed}
#profile .profile-section{border:1px solid #dcebe1;border-radius:18px;padding:21px;background:#fff;margin:15px 0}
#profile .profile-status{font-weight:600;font-size:13px;line-height:1.7;color:#147b5d;min-height:18px}
#profile .subtext{font-size:12px;color:#7a9685;line-height:1.7}
#profile .profile-avatar-controls{text-align:center}
#profile .profile-avatar-controls input[type=file]{max-width:100%;font-size:12px}
.placeholder{flex-direction:column;gap:7px;color:#91a89a;font-size:28px!important}
.placeholder small{font-size:10px;color:#7b9687!important;font-family:'Be Vietnam Pro',sans-serif!important}
#flashBody{line-height:1.8}
@media(max-width:660px){#profile .profile-grid{grid-template-columns:1fr}#profile .profile-avatar{width:145px;height:145px}}
`;
document.head.appendChild(enhanceStyle);
const nav=$('.nav');
if(!nav)return;
const notesBtn=nav.querySelector('[data-page="notes"]');
if(notesBtn)notesBtn.textContent='📅 Lịch học & tài liệu';
const notesPage=$('#notes');
if(notesPage){
 const heading=notesPage.querySelector('h1');if(heading)heading.textContent='📅 Lịch học và tài liệu';
 const oldMemo=notesPage.querySelector('#memo')?.closest('.box');
 if(oldMemo)oldMemo.remove();
 const split=notesPage.querySelector('.split');if(split)split.style.display='block';
}
const flashBox=$('#flashBody');
if(flashBox)flashBox.textContent='Luyện tập và xem kết quả đúng/sai, không tính điểm vào bảng xếp hạng HSK.';
const navBtn=document.createElement('button');
navBtn.textContent='👤 Thông tin cá nhân';
navBtn.dataset.page='profile';
nav.insertBefore(navBtn,$('#logout'));
const section=document.createElement('section');
section.id='profile';section.className='page';
section.innerHTML=`
<h1>👤 Thông tin cá nhân</h1>
<p class="muted">Quản lý tên hiển thị, ảnh đại diện và mật khẩu. Email, số điện thoại và MSSV không thể thay đổi ở đây.</p>
<div class="profile-grid">
 <div class="box">
   <div id="profileAvatar" class="profile-avatar" aria-label="Ảnh đại diện">🐼</div>
   <div class="profile-avatar-controls">
     <label for="profilePhoto" style="font-weight:700">Ảnh đại diện cá nhân</label>
     <input id="profilePhoto" type="file" accept="image/jpeg,image/png,image/webp">
     <p class="subtext">JPG, PNG hoặc WebP · tối đa 10 MB. Ảnh đại diện có thể được xem công khai.</p>
     <button class="btn soft" type="button" id="uploadPhoto">📷 Cập nhật ảnh</button>
     <p class="profile-status" id="photoStatus" role="status"></p>
   </div>
 </div>
 <div>
 <div class="profile-section">
   <h3>Hồ sơ học viên</h3>
   <div class="profile-field"><label for="profileName">Họ tên / tên hiển thị</label><input id="profileName" maxlength="60" autocomplete="name"></div>
   <button class="btn" id="saveName">Lưu tên mới</button>
   <p class="profile-status" id="nameStatus" role="status"></p>
   <div class="profile-field"><label for="profileEmail">Email đăng nhập · không thể đổi</label><input id="profileEmail" type="email" readonly></div>
   <div class="profile-field"><label for="profilePhone">Số điện thoại · không thể đổi</label><input id="profilePhone" readonly></div>
   <div class="profile-field"><label for="profileStudent">MSSV · không thể đổi</label><input id="profileStudent" readonly></div>
 </div>
 <div class="profile-section">
   <h3>🔐 Thay đổi mật khẩu</h3>
   <p class="subtext">Mật khẩu mới phải dài ít nhất 8 ký tự.</p>
   <div class="profile-field"><label for="profileNewPassword">Mật khẩu mới</label><input id="profileNewPassword" type="password" autocomplete="new-password"></div>
   <div class="profile-field"><label for="profileConfirmPassword">Nhập lại mật khẩu mới</label><input id="profileConfirmPassword" type="password" autocomplete="new-password"></div>
   <button class="btn" id="saveProfilePassword">Đổi mật khẩu</button>
   <p class="profile-status" id="passwordStatus" role="status"></p>
 </div>
 </div>
</div>`;
const foot=document.querySelector('footer');
if(foot)foot.before(section);else document.querySelector('main')?.append(section);
const oldPage=D.page;
D.page=function(id){oldPage(id);if(id==='profile')loadProfile();};
navBtn.addEventListener('click',()=>D.page('profile'));
const getContext=()=>D.profileContext?.()||{};
function status(id,msg){const el=$('#'+id);if(el)el.textContent=msg;}
function renderAvatar(path){
 const area=$('#profileAvatar');area.replaceChildren();
 if(!path){area.textContent='🐼';return;}
 const {db}=getContext();
 if(!db){area.textContent='🐼';return;}
 const result=db.storage.from('student-avatars').getPublicUrl(path);
 const url=result.data?.publicUrl;
 if(!url){area.textContent='🐼';return;}
 const img=document.createElement('img');img.alt='Ảnh đại diện';
 img.src=url;img.onerror=()=>{area.textContent='🐼';};
 area.append(img);
}
async function loadProfile(){
 const {db,user}=getContext();if(!db||!user){status('nameStatus','Vui lòng đăng nhập lại.');return;}
 const meta=user.user_metadata||{};
 $('#profileEmail').value=user.email||'';
 $('#profileName').value=meta.full_name||meta.nickname||'';
 $('#profilePhone').value=meta.phone||'Chưa có';
 $('#profileStudent').value=meta.student_id||'Chưa có';
 renderAvatar(meta.avatar_path||'');
 const {data,error}=await db.from('student_profiles').select('full_name,phone,student_id,avatar_path').eq('user_id',user.id).maybeSingle();
 if(error){status('nameStatus','Chưa đọc được hồ sơ từ hệ thống.');return;}
 if(data){
  $('#profileName').value=data.full_name||meta.full_name||'';
  $('#profilePhone').value=data.phone||meta.phone||'Chưa có';
  $('#profileStudent').value=data.student_id||meta.student_id||'Chưa có';
  renderAvatar(data.avatar_path||meta.avatar_path||'');
 }
}
$('#saveName').onclick=async()=>{
 const {db,user}=getContext(),value=$('#profileName').value.trim();
 if(!db||!user)return status('nameStatus','Vui lòng đăng nhập.');
 if(value.length<2||value.length>60)return status('nameStatus','Tên cần dài 2–60 ký tự.');
 const btn=$('#saveName');btn.disabled=true;
 try{
  const rpc=await db.rpc('update_my_display_name',{new_full_name:value});
  if(rpc.error)throw rpc.error;
  const current=await db.auth.getUser();const up=await db.auth.updateUser({data:{...(current.data?.user?.user_metadata||user.user_metadata),full_name:value}});
  if(up.error)throw up.error;
  status('nameStatus','✅ Đã cập nhật tên hiển thị và tên trên bảng xếp hạng.'); D.syncUserHeader?.();
  $('#hello').textContent='Xin chào, '+value+' 🌱';
 }catch(e){status('nameStatus','Không cập nhật được: '+e.message);}finally{btn.disabled=false;}
};
$('#saveProfilePassword').onclick=async()=>{
 const {db,user}=getContext();
 if(!db||!user)return status('passwordStatus','Bạn cần đăng nhập.');
 const p=$('#profileNewPassword').value,c=$('#profileConfirmPassword').value;
 if(p.length<8)return status('passwordStatus','Mật khẩu phải có ít nhất 8 ký tự.');
 if(p!==c)return status('passwordStatus','Hai mật khẩu không khớp.');
 const btn=$('#saveProfilePassword');btn.disabled=true;
 try{
  const r=await db.auth.updateUser({password:p});
  if(r.error)throw r.error;
  $('#profileNewPassword').value='';$('#profileConfirmPassword').value='';
  status('passwordStatus','✅ Mật khẩu đã được thay đổi.');
 }catch(e){status('passwordStatus','Không đổi được mật khẩu: '+e.message);}
 finally{btn.disabled=false;}
};
$('#uploadPhoto').onclick=async()=>{
 const {db,user}=getContext();
 if(!db||!user)return status('photoStatus','Bạn cần đăng nhập.');
 const f=$('#profilePhoto').files?.[0];
 if(!f)return status('photoStatus','Hãy chọn một ảnh trước.');
 const extensions={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
 if(!extensions[f.type])return status('photoStatus','Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.');
 if(f.size>10*1024*1024)return status('photoStatus','Ảnh vượt giới hạn 10 MB. Hãy chọn ảnh nhỏ hơn.');
 const btn=$('#uploadPhoto');btn.disabled=true;status('photoStatus','Đang tải ảnh lên…');
 try{
  const path=user.id+'/'+Date.now()+'-'+(crypto.randomUUID?crypto.randomUUID().slice(0,8):'avatar')+'.'+extensions[f.type];
  const sent=await db.storage.from('student-avatars').upload(path,f,{contentType:f.type,upsert:false,cacheControl:'3600'});
  if(sent.error)throw sent.error;
  const update=await db.from('student_profiles').update({avatar_path:path}).eq('user_id',user.id);
  if(update.error)throw update.error;
  const current=await db.auth.getUser();const meta=await db.auth.updateUser({data:{...(current.data?.user?.user_metadata||user.user_metadata),avatar_path:path}});
  if(meta.error)throw meta.error;
  renderAvatar(path);
  status('photoStatus','✅ Ảnh đại diện đã được cập nhật.'); D.syncUserHeader?.();
 }catch(e){status('photoStatus','Tải ảnh thất bại: '+e.message);}
 finally{btn.disabled=false;}
};
}());

// Unified account chip on every page; remove the entire Notes / Calendar / Documents menu.
(()=>{
 const $=s=>document.querySelector(s);
 const D=window.TTHK;
 const navNotes=document.querySelector('.nav [data-page="notes"]');
 if(navNotes)navNotes.remove();
 const notesPage=$('#notes');
 if(notesPage)notesPage.remove();
 const hello=$('#hello');
 const top=document.createElement('div');top.id='accountTopBar';
 top.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:22px;';
 hello.parentNode.insertBefore(top,hello);top.append(hello);
 hello.style.margin='0';hello.style.color='#668372';hello.style.fontSize='14px';
 const accountBtn=document.createElement('button');
 accountBtn.type='button';accountBtn.id='accountHeaderButton';
 accountBtn.setAttribute('aria-label','Mở thông tin cá nhân');
 accountBtn.title='Nhấn để xem và sửa thông tin cá nhân';
 accountBtn.style.cssText='display:flex;align-items:center;gap:10px;max-width:100%;padding:7px 14px 7px 7px;border-radius:99px;border:1px solid #cfe5d5;background:#fff;color:#195b41;box-shadow:0 6px 22px #125b2b14;font-weight:700;cursor:pointer;';
 const avatar=document.createElement('span');avatar.id='accountAvatar';
 avatar.style.cssText='display:grid;place-items:center;overflow:hidden;width:39px;height:39px;border-radius:50%;background:#dcf1e4;font-size:23px;';
 avatar.textContent='🐼';
 const name=document.createElement('span');name.id='accountName';name.textContent='Học viên';
 const arrow=document.createElement('span');arrow.textContent='⌄';arrow.setAttribute('aria-hidden','true');
 accountBtn.append(avatar,name,arrow);top.append(accountBtn);
 accountBtn.onclick=()=>D.page('profile');
 let refreshCounter=0;
 D.syncUserHeader=async()=>{
  const {db,user}=D.profileContext?.()||{};
  const seq=++refreshCounter;
  if(!db||!user){name.textContent='Học viên';avatar.textContent='🐼';return;}
  const metadata=user.user_metadata||{};
  name.textContent=metadata.full_name||user.email?.split('@')[0]||'Học viên';
  let picPath=metadata.avatar_path||null;
  try{
   const r=await db.from('student_profiles').select('full_name,avatar_path').eq('user_id',user.id).maybeSingle();
   if(seq!==refreshCounter)return;
   if(!r.error&&r.data){
    name.textContent=r.data.full_name||name.textContent;
    picPath=r.data.avatar_path||picPath;
   }
  }catch(e){}
  if(seq!==refreshCounter)return;
  avatar.replaceChildren();
  if(picPath){
   const result=db.storage.from('student-avatars').getPublicUrl(picPath);
   const url=result.data?.publicUrl;
   if(url){
    const img=document.createElement('img');img.alt='Ảnh đại diện của bạn';
    img.style.cssText='width:100%;height:100%;object-fit:cover;';
    img.onerror=()=>{avatar.textContent='🐼';};
    img.src=url;avatar.append(img);return;
   }
  }
  avatar.textContent='🐼';
 };
 const prev=D.page;
 D.page=id=>{prev(id);D.syncUserHeader?.()};
 document.querySelector('#saveName')?.addEventListener('click',()=>setTimeout(()=>D.syncUserHeader?.(),1200));
 document.querySelector('#uploadPhoto')?.addEventListener('click',()=>setTimeout(()=>D.syncUserHeader?.(),1600));
})();

;(()=>{const css="\n:root{--brand-900:#084870;--brand-800:#125c85;--brand-700:#2c729b;--brand-200:#c8e0f0;--brand-100:#e9f4fb;--text-main:#163950}\nbody{background:radial-gradient(ellipse at 7% 4%,#d5ebfbb8,transparent 38%),linear-gradient(180deg,#fbfdff,#f0f8ff);color:var(--text-main)}\n.side{background:#ffffffed;backdrop-filter:blur(14px);border-right:1px solid #d5e6f3;padding-top:16px}\n.side h2{display:flex;align-items:center;justify-content:center;margin:0 0 23px;padding:0;font-size:16px;color:#084870}\n.side-brand{width:100%;max-width:210px;aspect-ratio:440/267;object-fit:contain;mix-blend-mode:multiply}\n.nav button{color:#557c95;transition:background .2s ease,color .2s ease,transform .2s ease}\n.nav button.on,.nav button:hover{background:linear-gradient(100deg,#dceefa,#ecf6fc);color:#084870;transform:translateX(2px)}\nh1,h2,h3{color:#084870}.muted,footer{color:#6c8b9d}\n.hero{background:linear-gradient(115deg,#ddecf9,#f9fcff 57%,#e3f1fa);border:1px solid #cde2f1;min-height:235px;box-shadow:0 20px 56px #08487012;position:relative;isolation:isolate;overflow:hidden}\n.hero h1,.hero p,.hero button{position:relative;z-index:2}.hero em{color:#1473a6}.hero:after{content:'';background:none!important}\n.hero-brand-watermark{position:absolute;right:-50px;top:-12%;width:min(46%,385px);opacity:.17;mix-blend-mode:multiply;pointer-events:none}\n.btn{background:linear-gradient(135deg,#1670a1,#084870);box-shadow:0 7px 18px #08487015;transition:transform .2s,box-shadow .2s}.btn:hover{transform:translateY(-2px);box-shadow:0 12px 27px #08487027}.btn.soft{background:#e6f2fb;color:#0b577f}\n.box{border-color:#d8e8f5;background:#fffffff2;box-shadow:0 12px 32px #0e52700e}.word h2,#hanzi{color:#0e6087!important}.word small{color:#397997}\n.searchbar{border-color:#b2d8ef;box-shadow:0 10px 30px #0848700b}input,select,textarea{border-color:#cfe3f1;color:#184159}\ninput:focus-visible,select:focus-visible,textarea:focus-visible,button:focus-visible{outline:3px solid #83c4ed;outline-offset:2px}.switch{background:#e6f1fa}.switch button.on{color:#0c5e8a}.popup{border-color:#aad7ee}\n#gate.authgate{grid-template-columns:minmax(0,1.12fr) minmax(320px,460px);gap:clamp(26px,5vw,76px);padding:clamp(20px,5vw,65px);background:radial-gradient(circle at 18% 50%,#ceeaff,transparent 46%),linear-gradient(122deg,#fafdff,#eaf5fd);overflow-y:auto;align-items:center;justify-items:center}\n.login-showcase{position:relative;z-index:1;width:min(100%,655px);padding:14px 12px 24px;animation:welcomeIn .8s both}\n.login-logo-frame{position:relative;border-radius:30px;background:#ffffffee;box-shadow:0 28px 72px #0b537018;border:1px solid #c4e3f3;padding:12px;margin-bottom:23px;overflow:hidden}\n.login-logo-frame:before{content:'';position:absolute;inset:15% 5%;background:#a9dffa5f;filter:blur(38px);border-radius:50%}\n.login-logo-frame img{position:relative;z-index:1;width:100%;height:auto;display:block;border-radius:18px;mix-blend-mode:multiply;animation:logoFloat 7s ease-in-out infinite}\n.login-showcase h1{font-size:clamp(28px,3.8vw,49px);letter-spacing:-1.8px;line-height:1.24;margin:12px 0;color:#073d61}\n.login-showcase h1 span{color:#1977a7}.login-showcase p{max-width:560px;color:#5b7f95;font-size:14px;line-height:1.9}\n.login-kicker{letter-spacing:2.4px;font-size:10px;font-weight:800;color:#297aa5}.login-chips{display:flex;flex-wrap:wrap;gap:9px;margin-top:18px}\n.login-chips span{padding:10px 12px;background:#ffffffdd;border:1px solid #d1e7f6;box-shadow:0 8px 24px #0848700b;border-radius:999px;font-size:11px;color:#1d6387;font-weight:700}\n#gate .authcard{position:relative;z-index:2;width:100%;max-width:465px;margin:0;border:1px solid #cee3f1;background:#ffffffee;backdrop-filter:blur(22px);box-shadow:0 30px 82px #08487025;border-radius:29px;padding:clamp(22px,3vw,36px);animation:cardIn .65s ease both}\n#gate .authcard:before{content:'✦';position:absolute;right:22px;top:18px;color:#a1d6f5;font-size:21px}#gate .authcard h2{font-size:29px;color:#084870;margin:12px 0 10px}\n#gate .authcard .authpane input{background:#f9fdff;border:1px solid #c6dfed;border-radius:14px;padding:14px 15px;margin:10px 0}\n#gate .authcard .authpane input:focus{border-color:#4c9dce;box-shadow:0 0 0 4px #c6e8fc85;outline:0}\n#gate .authcard .btn{padding:13px 18px;border-radius:13px}#gate .authcard .row{gap:10px}\n#gate .authcard #paneLogin #login{min-width:150px;flex:1}\n@keyframes welcomeIn{from{opacity:0;transform:translateY(21px)}to{opacity:1;transform:none}}\n@keyframes cardIn{from{opacity:0;transform:translateY(22px) scale(.985)}to{opacity:1;transform:none}}\n@keyframes logoFloat{50%{transform:translateY(-7px)}}\n@media(max-width:880px){#gate.authgate{grid-template-columns:1fr;gap:16px;padding:20px 16px;align-content:center}.login-showcase{max-width:470px;padding:4px}.login-logo-frame{max-width:410px;margin:0 auto 12px;padding:7px}.login-showcase h1{font-size:25px;text-align:center;margin:8px}.login-showcase p{display:none}.login-kicker{text-align:center;display:block}.login-chips{justify-content:center;margin-top:10px;gap:6px}.login-chips span{font-size:10px;padding:7px 9px}#gate .authcard{max-width:475px;padding:22px;border-radius:22px}}\n@media(max-width:480px){.login-showcase h1{font-size:21px}.login-logo-frame{max-width:265px;margin-bottom:8px}.login-chips span:nth-child(n+3){display:none}#gate .authcard .row{gap:7px}#gate .authcard .btn{font-size:12px;padding:11px}}\n@media(prefers-reduced-motion:reduce){.login-showcase,#gate .authcard,.login-logo-frame img{animation:none!important}}";const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);const logo="/logo-tthk.webp";const siteTitle=document.querySelector('.side h2');if(siteTitle){siteTitle.textContent='';const img=document.createElement('img');img.className='side-brand';img.alt='TIẾNG TRUNG HEM KHÓ';img.src=logo;img.onerror=()=>{siteTitle.textContent='中文不难 · TIẾNG TRUNG HEM KHÓ'};siteTitle.append(img)}const gate=document.querySelector('#gate');if(gate&&!gate.querySelector('.login-showcase')){const story=document.createElement('div');story.className='login-showcase';story.innerHTML="<div class=\"login-logo-frame\"><img src=\"/logo-tthk.webp\" alt=\"中文不难 — TIẾNG TRUNG HEM KHÓ\"></div><div class=\"login-kicker\">KHÁM PHÁ NGÔN NGỮ · 发现中文</div><h1>Mở ra một thế giới mới<br><span>qua từng chữ Hán.</span></h1><p>Góc học tập nhỏ để cùng nhau luyện từ vựng, nghe phát âm, tập viết chữ Hán và chinh phục HSK mỗi ngày.</p><div class=\"login-chips\"><span>✦ HSK 1–2</span><span>◈ Từ vựng trực quan</span><span>✍ Luyện viết</span><span>♫ Phát âm</span></div>";gate.insertBefore(story,gate.firstChild)}const intro=document.querySelector('#intro .hero');if(intro&&!intro.querySelector('.hero-brand-watermark')){const img=document.createElement('img');img.className='hero-brand-watermark';img.alt='';img.setAttribute('aria-hidden','true');img.src=logo;intro.append(img)}const fav=document.createElement('link');fav.rel='icon';fav.type='image/webp';fav.href=logo;document.head.append(fav);})();


;(() => {
 'use strict';
 const MEMBERS=['thanh-dat','hong-diep','yen-vi','ngoc-giau','phuong-nghi'];
 const style=document.createElement('style');
 style.textContent="#team .memberpic{background-image:none!important;background-color:#edf5fb!important;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;aspect-ratio:3/4!important}\n#team .memberpic:not(.has-image)::after{content:'Đang tải ảnh…';font-size:13px;font-weight:600;color:#7597ab;position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(105deg,#e9f2fa 0%,#f7fbfe 50%,#e9f2fa 100%);background-size:200% 100%;animation:portraitShimmer 1.7s infinite}\n#team .memberpic.no-image::after{content:'Chưa có ảnh';animation:none}\n#team .memberpic.has-image::after{content:none}\n#team .memberpic img{display:block;width:100%;height:100%;object-fit:contain;object-position:center;background:transparent;opacity:0;transition:opacity .25s ease}\n#team .memberpic.has-image img{opacity:1}\n@keyframes portraitShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}\n@media(prefers-reduced-motion:reduce){#team .memberpic:not(.has-image)::after{animation:none}#team .memberpic img{transition:none}}";
 document.head.append(style);
 const publicClient=window.supabase?.createClient('https://wcgzdbjmwhyroszvyetv.supabase.co','sb_publishable_rS5k1n1aKhqPaq_4En2pKw_hXYe3WcJ');
 if(!publicClient)return;
 function assetUrl(asset){
   const res=publicClient.storage.from('team-portraits').getPublicUrl(asset.image_path);
   if(!res.data?.publicUrl)return null;
   return res.data.publicUrl+'?v='+encodeURIComponent(asset.updated_at||'1');
 }
 function renderMember(i,asset){
   const slot=document.querySelectorAll('#team .memberpic')[i];
   if(!slot)return;
   slot.classList.remove('has-image','no-image');
   slot.replaceChildren();
   if(!asset){slot.classList.add('no-image');return;}
   const url=assetUrl(asset);
   if(!url){slot.classList.add('no-image');return;}
   const picture=new Image();
   picture.alt='Ảnh '+(window.TTHK?.team?.[i]?.[0]||'thành viên');
   picture.loading='eager';
   picture.decoding='async';
   picture.onload=()=>{if(slot.isConnected){slot.replaceChildren(picture);slot.classList.add('has-image');}};
   picture.onerror=()=>{slot.classList.add('no-image');};
   picture.src=url;
 }
 function updateLogo(asset){
   if(!asset)return;
   const url=assetUrl(asset);
   if(!url)return;
   for(const selector of ['.side-brand','.login-logo-frame img','.hero-brand-watermark']){
     const node=document.querySelector(selector);
     if(node?.tagName==='IMG'){node.src=url;node.style.objectFit='contain';}
   }
   const fav=document.querySelector('link[rel="icon"]');
   if(fav){fav.href=url;fav.type='image/png';}
 }
 async function fetchAssets(){
   const {data,error}=await publicClient.from('site_assets').select('slug,image_path,updated_at');
   if(error){MEMBERS.forEach((_,i)=>renderMember(i,null));console.warn('Could not retrieve team portraits',error);return;}
   const bySlug=Object.fromEntries((data||[]).map(a=>[a.slug,a]));
   MEMBERS.forEach((slug,i)=>renderMember(i,bySlug[slug]));
   updateLogo(bySlug.logo);
 }
 fetchAssets();
 const D=window.TTHK;
 if(D?.page){const original=D.page;D.page=id=>{original(id);if(id==='intro')fetchAssets();};}
})();

// Responsive premium design, animated tab transitions and Facebook fanpage shortcut.
;(()=>{
'use strict';
const D=window.TTHK;
if(!D||!document.querySelector('.site'))return;
const style=document.createElement('style');
style.id='premium-responsive-theme';
style.textContent="\n:root{--ui-navy:#084870;--ui-blue:#176c99;--ui-sky:#cce7f6;--ui-mist:#eff8ff;--ui-line:#d9e9f4;--ui-ink:#16374c;--ui-muted:#7893a6}\nbody{font-family:'Be Vietnam Pro',sans-serif;letter-spacing:-.012em;background:radial-gradient(ellipse at 5% 0%,#d4ebfbe0 0%,transparent 36%),radial-gradient(ellipse at 97% 95%,#e1f1fd 0%,transparent 34%),#f6fbff!important;color:var(--ui-ink);-webkit-font-smoothing:antialiased}\n.site{grid-template-columns:248px minmax(0,1fr)!important;align-items:stretch;min-width:0;max-width:none;margin:auto}\n.side{position:sticky;top:0;height:100dvh;min-height:0!important;overflow-y:auto;overflow-x:hidden;padding:22px 15px!important;background:linear-gradient(175deg,#fffffffa 0%,#f3fafff9 100%)!important;border-right:1px solid #d9e9f4!important;box-shadow:9px 0 36px #08487006;z-index:70}\n.side h2{margin:0 0 21px!important;border-radius:17px;padding:5px 8px 14px!important;border-bottom:1px solid #e6f0f7;display:flex;align-items:center;justify-content:center}\n.side-brand{max-width:188px!important;max-height:99px;object-fit:contain}\n.nav{display:flex;flex-direction:column;gap:5px}\n.nav button{width:100%;min-height:46px;text-align:left;border-radius:14px!important;background:transparent!important;border:1px solid transparent!important;padding:12px 14px!important;font-weight:650;color:#557791!important;line-height:1.45;transition:transform .22s,background .22s,color .22s,border-color .22s}\n.nav button:hover{background:#eaf5fd!important;border-color:#d5e7f3!important;color:#145b85!important;transform:translateX(3px)}\n.nav button.on{background:linear-gradient(110deg,#d8edfb,#f0f8fe)!important;border-color:#c6e1f1!important;color:#064a72!important;font-weight:800;box-shadow:0 7px 17px #154d7610;transform:none}\n.site main{width:100%;min-width:0;max-width:1560px;margin:0 auto;padding:clamp(22px,2.7vw,42px) clamp(20px,3.2vw,62px) 95px!important}\n.site main>p#hello{display:flex;align-items:center;justify-content:flex-end;min-height:42px;font-size:13px;font-weight:700;color:#5482a0;margin:0 0 21px}\n.page>h1{font-size:clamp(27px,3.1vw,42px);line-height:1.2;margin:0 0 15px;letter-spacing:-.055em;font-weight:800;color:#0b4467}\n.page>p.muted{font-size:14px;color:#708b9f;max-width:810px}\n.hero{min-height:250px;border:1px solid #cddfec!important;border-radius:29px!important;background:linear-gradient(120deg,#d7eaf8 0%,#f7fbff 62%,#e4f4fd 100%)!important;box-shadow:0 19px 55px #0b527a10!important;padding:clamp(27px,4vw,52px)!important}\n.hero h1{font-size:clamp(29px,3.6vw,51px);line-height:1.2;letter-spacing:-.06em;max-width:700px}\n.hero p{font-size:14px;line-height:1.9;color:#537892;max-width:600px!important}\n.hero .btn{margin-top:9px}\n.hero-brand-watermark{width:36%!important;right:-18px!important;opacity:.11!important}\n.box{background:#fffffff5!important;border:1px solid #dbe9f3!important;border-radius:23px!important;box-shadow:0 9px 30px #103f610b!important;transition:box-shadow .22s ease,transform .22s ease,border-color .22s ease}\n.box:hover{border-color:#c6e0f1!important;box-shadow:0 17px 39px #0b497016!important}\n#intro>.grid{margin-top:22px!important}\n#intro>.grid .box{padding:22px;min-height:112px}\n#intro>.grid .box h2{font-size:27px;font-weight:800;margin:5px 0 8px;color:#07557f}\n#intro>.grid .box p{margin:0;font-size:13px;color:#718c9f}\n#intro>.teams{margin-top:24px;gap:17px!important}\n#intro>h2{text-align:center;margin:47px 0 22px!important;font-size:clamp(22px,2.2vw,31px);letter-spacing:-.035em}\n.member{flex:0 1 calc((100% - 34px)/3);max-width:340px!important;min-width:210px!important;width:auto!important;padding:14px!important;border-radius:23px!important;text-align:center}\n.memberpic{width:100%!important;aspect-ratio:3/4!important;border-radius:17px!important;background-color:#eaf5fc!important;overflow:hidden}\n.memberpic img{width:100%!important;height:100%!important;object-fit:contain!important}\n.member h3{font-size:16px;margin:17px 0 5px;font-weight:800;color:#144665}\n.member p{font-size:12px;line-height:1.65;color:#6c889b!important;margin:0 0 3px}\n.btn{border-radius:14px!important;letter-spacing:-.015em;font-weight:800;transition:transform .18s ease,box-shadow .18s ease}\n.btn:not(:disabled):hover{transform:translateY(-2px)}\n.btn.soft{border:1px solid #d7e8f5!important;background:#e9f5fd!important;color:#0e5f88!important}\n.grid,.words,.split{min-width:0}\n.grid{gap:17px}\n.words{grid-template-columns:repeat(4,minmax(0,1fr));gap:17px}\n.word{padding:15px!important}\n.word img,.word .placeholder{border-radius:15px!important;aspect-ratio:4/3!important;object-fit:contain!important;background:#f9fcff!important}\n.word h2{font-size:clamp(34px,3.8vw,47px)!important;margin:12px 0 3px}\n.word p{margin:8px 0}\n.word .row{gap:8px!important;margin:12px 0 2px!important}\n.word .row .btn{min-width:47px}\n.searchbar{background:#fff;border-color:#b9daee!important;border-radius:21px!important;padding:10px!important;box-shadow:0 9px 29px #0d587915}\n.searchbar input{border:0!important;min-width:0!important;font-size:16px!important;flex:1}\n.switch{padding:7px!important;border-radius:16px!important;gap:5px!important;background:#e9f4fc!important}\n.switch button{border-radius:12px!important;font-weight:650}\n.switch button.on{font-weight:800}\ninput,select,textarea{border:1px solid #d2e5f1!important;border-radius:13px!important;background:#fafdff;color:#123e59;padding:12px 13px}\ninput:focus-visible,select:focus-visible,textarea:focus-visible,button:focus-visible{outline:3px solid #92ccef!important;outline-offset:2px}\n#examBody,#flash .box,#writing .box,#timer .box,#notes .box,#profile .box{padding:clamp(17px,2vw,29px)!important}\n.choice{border-radius:13px!important;transition:transform .15s,background .15s,border-color .15s}\n.choice:hover{transform:translateX(4px);background:#edf8ff!important;border-color:#afd7ed!important}\nfooter{border-top:1px solid #dfebf5!important;margin-top:70px!important}\n#music{display:none!important}\n.facebook-float{position:fixed;right:22px;bottom:20px;z-index:180;display:flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:19px;background:linear-gradient(135deg,#2175e6,#1154b3);border:1px solid #ffffffad;box-shadow:0 13px 34px #155abd55,0 0 0 5px #ffffff9c;text-decoration:none;transition:transform .2s,box-shadow .2s}\n.facebook-float:hover{transform:translateY(-5px) scale(1.06);box-shadow:0 19px 39px #145abc70}\n.facebook-float svg{width:28px;height:28px;fill:white}\n.facebook-float[hidden]{display:none!important}\n.mobile-dock{display:none}\n.page-loader{position:fixed;inset:0;z-index:9999;background:linear-gradient(142deg,#f4fbffeb,#e6f4ffec);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);display:grid;place-items:center;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .21s ease,visibility .21s ease}\n.page-loader.active{opacity:1;visibility:visible;pointer-events:all}\n.page-loader-inner{width:min(345px,calc(100vw - 54px));display:flex;flex-direction:column;align-items:center;gap:15px;border-radius:32px;background:#ffffffdb;padding:35px 23px 30px;border:1px solid #d4e7f5;box-shadow:0 27px 80px #0848701e;text-align:center}\n.page-loader-img{width:142px;max-height:142px;object-fit:contain;filter:drop-shadow(0 10px 17px #1c86b12c);animation:loaderFloat 1.5s ease-in-out infinite}\n.page-loader-title{font-size:19px;letter-spacing:-.035em;color:#074c72;font-weight:850}\n.page-loader-text{font-size:12px;color:#6e8b9d;margin:0}\n.page-loader-progress{width:min(205px,90%);height:5px;background:#dcecf8;border-radius:999px;overflow:hidden;margin-top:9px}\n.page-loader-progress>span{display:block;width:30%;height:100%;background:linear-gradient(90deg,#7cc3ec,#0d669c);border-radius:99px;animation:loaderSweep 1.25s cubic-bezier(.33,.13,.2,1) infinite}\n@keyframes loaderFloat{50%{transform:translateY(-8px) scale(1.02)}}@keyframes loaderSweep{0%{transform:translateX(-110%)}100%{transform:translateX(440%)}}\n@media(min-width:1450px){.site{grid-template-columns:272px minmax(0,1fr)!important}.side{padding:27px 18px!important}.nav button{font-size:14px;padding:14px 17px!important;min-height:49px}.words{grid-template-columns:repeat(5,minmax(0,1fr))}}\n@media(max-width:1180px){.site{grid-template-columns:220px minmax(0,1fr)!important}.side{padding:16px 10px!important}.words{grid-template-columns:repeat(3,minmax(0,1fr))}.member{flex:0 1 calc((100% - 19px)/2);max-width:350px}}\n@media(max-width:820px){.site{display:block!important}.side{position:sticky!important;top:0;height:auto;min-height:0!important;width:100%;overflow:visible;padding:8px 14px 10px!important;border-right:0!important;border-bottom:1px solid #d6e7f3!important;background:#fafdfff2!important;backdrop-filter:blur(22px);box-shadow:0 7px 24px #0e4a720e}.side h2{border:0!important;margin:0 0 7px!important;padding:0!important;justify-content:flex-start!important}.side-brand{width:auto!important;max-width:154px!important;max-height:57px!important;aspect-ratio:auto!important}.nav{display:flex!important;flex-direction:row!important;gap:5px!important;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior-x:contain;scroll-snap-type:x proximity;padding:1px 0 5px}.nav::-webkit-scrollbar{display:none}.nav button{width:auto!important;flex:0 0 auto;scroll-snap-align:start;min-height:38px;font-size:11px!important;line-height:1;padding:11px 13px!important;border-radius:12px!important;white-space:nowrap}.site main{padding:20px 17px 130px!important}.site main>p#hello{justify-content:flex-start;font-size:12px;margin-bottom:11px;min-height:25px}.mobile-dock{position:fixed;bottom:calc(12px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);width:min(480px,calc(100vw - 22px));height:73px;padding:6px;display:flex;gap:4px;justify-content:space-around;align-items:center;border:1px solid #d6e7f5;border-radius:25px;background:#fefefff2;backdrop-filter:blur(22px);box-shadow:0 14px 40px #0b406a30;z-index:120}.mobile-dock button{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;justify-content:center;min-width:0;height:57px;border:0;border-radius:18px;background:transparent;color:#668398;font-size:10px;font-weight:700}.mobile-dock button .dock-icon{font-size:21px;line-height:1.2}.mobile-dock button.active{color:#0b5e8e;background:#e3f2fd}.mobile-dock[hidden]{display:none!important}.facebook-float{bottom:calc(96px + env(safe-area-inset-bottom,0px));right:14px;width:49px;height:49px;border-radius:16px;box-shadow:0 10px 27px #155abd45}.facebook-float svg{width:23px;height:23px}.member{flex:0 1 calc((100% - 15px)/2);min-width:0!important;max-width:none!important}.words{grid-template-columns:repeat(2,minmax(0,1fr))}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hero{padding:27px!important;min-height:0}.hero-brand-watermark{width:48%!important}.page>h1{font-size:29px}#intro>h2{margin-top:35px!important}}\n@media(max-width:520px){.site main{padding:16px 12px 130px!important}.words{gap:10px}.grid{gap:11px}.word{padding:10px!important}.word h2{font-size:34px!important}.word p{font-size:12px}.member{padding:10px!important;flex:0 1 calc((100% - 10px)/2)}.member h3{font-size:13px}.member p{font-size:10px}.teams{gap:10px!important}.hero{padding:21px!important;border-radius:23px!important}.hero h1{font-size:clamp(25px,7vw,33px)}.hero p{font-size:12px}.site main>p#hello{max-width:100%;overflow:hidden;text-overflow:ellipsis}.searchbar input{font-size:13px!important}.searchbar .btn{padding:10px!important}.page>h1{font-size:26px}.page-loader-inner{padding:28px 18px}.page-loader-img{width:118px}.switch button{font-size:11px!important;padding:10px!important}}\n@media(max-width:360px){.member{flex:0 1 100%}.words{grid-template-columns:1fr}.site main{padding-inline:10px!important}}\n@media(prefers-reduced-motion:reduce){.page-loader-img,.page-loader-progress>span{animation:none!important}.box,.facebook-float,.choice,.btn{transition:none!important}}\n";
document.head.append(style);
const site=document.querySelector('#site');
const loader=document.createElement('div');
loader.className='page-loader';
loader.id='pageTabLoader';
loader.setAttribute('role','status');
loader.setAttribute('aria-live','polite');
loader.setAttribute('aria-hidden','true');
loader.innerHTML='<div class="page-loader-inner"><img class="page-loader-img" src="/logo-tthk.webp" alt="Logo TIẾNG TRUNG HEM KHÓ"><strong class="page-loader-title">TIẾNG TRUNG HEM KHÓ</strong><p class="page-loader-text">Đang mở góc học tập của bạn…</p><div class="page-loader-progress"><span></span></div></div>';
document.body.append(loader);
const logo=loader.querySelector('.page-loader-img');
const fb=document.createElement('a');
fb.className='facebook-float';fb.href='https://www.facebook.com/tiengtrunghemkho';fb.target='_blank';fb.rel='noopener noreferrer';fb.setAttribute('aria-label','Mở fanpage Facebook TIẾNG TRUNG HEM KHÓ');fb.title='Fanpage TIẾNG TRUNG HEM KHÓ';
fb.innerHTML='<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.56 9.88v-7h-2.54V12h2.54V9.8c0-2.5 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.88h-2.34v7A10 10 0 0 0 22 12Z"/></svg>';
fb.hidden=true;document.body.append(fb);
const oldMusic=document.getElementById('music');if(oldMusic){oldMusic.hidden=true;oldMusic.setAttribute('aria-hidden','true');oldMusic.tabIndex=-1;}
const dock=document.createElement('nav');
dock.className='mobile-dock';dock.hidden=true;dock.setAttribute('aria-label','Truy cập nhanh trên điện thoại');
const shortcuts=[['intro','⌂','Giới thiệu'],['vocab','文','Từ vựng'],['writing','✍','Luyện viết'],['exams','▤','Đề HSK']];
dock.innerHTML=shortcuts.map(([id,ic,name])=>'<button type="button" data-quick-page="'+id+'"><span class="dock-icon" aria-hidden="true">'+ic+'</span><span>'+name+'</span></button>').join('');
document.body.append(dock);
function activePage(){return document.querySelector('.page.on')?.id||'intro';}
function sync(){
 const loggedIn=site&&!site.hidden;
 fb.hidden=!loggedIn;dock.hidden=!loggedIn;
 const current=activePage();
 dock.querySelectorAll('[data-quick-page]').forEach(b=>{const isActive=b.dataset.quickPage===current;b.classList.toggle('active',isActive);if(isActive)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
}
dock.querySelectorAll('[data-quick-page]').forEach(b=>b.addEventListener('click',()=>D.page(b.dataset.quickPage)));
const observer=new MutationObserver(sync);if(site)observer.observe(site,{attributes:true,attributeFilter:['hidden']});
const originalPage=D.page;
D.page=function(target){
  const result=originalPage(target);
  sync();
  return result;
};

sync();
})();

// Floating timer + working signout controls
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
  // The auth-only five-second loader remains visible until its wrapper completes.
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
  try{new Notification('TIẾNG TRUNG HEM KHÓ',{body:title,icon:'/logo-tthk.webp',tag:'study-reminder'})}catch(e){console.warn('Native notification unavailable',e)}
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


// Auth-only branded loading + HSK image coverage dashboard

;(()=>{
 'use strict';
 const D=window.TTHK,$=s=>document.querySelector(s);
 if(!D)return;
 const loader=$('#pageTabLoader'),gate=$('#gate');
 let authBusy=false;
 function showAuthLoader(message){
   if(!loader||authBusy)return false;
   authBusy=true;
   const detail=loader.querySelector('.page-loader-text');
   if(detail)detail.textContent=message;
   const l=loader.querySelector('.page-loader-img');
   const current=document.querySelector('.side-brand')?.src;
   if(l&&current)l.src=current;
   loader.classList.add('active');
   loader.setAttribute('aria-hidden','false');
   return true;
 }
 function hideAuthLoader(){
   if(loader){loader.classList.remove('active');loader.setAttribute('aria-hidden','true')}
   authBusy=false;
 }
 async function executeWithAuthLoader(fn,message,...args){
   const started=showAuthLoader(message);
   const at=Date.now();
   try{return await fn(...args);}
   finally{
     if(started){
       const delay=Math.max(0,5000-(Date.now()-at));
       if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
       hideAuthLoader();
     }
   }
 }
 const login=$('#login'),logout=$('#logout'),logoutTop=$('#quickSignOut');
 // Five seconds on account transitions only; regular page/tab navigation has no spinner.
 loader?.classList.add('auth-five-second-loader');
 if(login&&typeof login.onclick==='function'){
   const original=login.onclick;
   login.onclick=function(...args){return executeWithAuthLoader(original.bind(this),'Đang đăng nhập…',...args)};
 }
 const out=typeof D.signOut==='function'?D.signOut:null;
 if(out){
   const wrapped=function(...args){return executeWithAuthLoader(out.bind(this),'Đang đăng xuất…',...args)};
   D.signOut=wrapped;
   if(logout)logout.onclick=wrapped;
   if(logoutTop)logoutTop.onclick=wrapped;
 }
 const section=$('#vocab'),wordGrid=$('#wordGrid');
 if(!section||!wordGrid)return;
 const audit=document.createElement('div');
 audit.id='vocabImageAudit';
 audit.className='box';
 audit.style.cssText='margin:15px 0 19px;padding:16px 19px;background:#f9fcff;border:1px solid #d9e9f5;box-shadow:0 8px 24px #08487009;';
 audit.innerHTML='<div style="display:flex;gap:12px;justify-content:space-between;align-items:center;flex-wrap:wrap"><div><strong style="color:#084870;font-size:15px">🖼️ Kiểm tra ảnh minh họa HSK</strong><p id="vocabImageSummary" style="margin:7px 0 0;color:#527b96;font-size:13px">Đang tải dữ liệu từ vựng…</p></div><button type="button" id="checkPhotoLinks" class="btn soft">Kiểm tra link ảnh</button></div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px"><label style="color:#315e79;font-size:13px"><input type="checkbox" id="onlyMissingPhotos"> Chỉ hiện từ chưa có ảnh</label><small id="photoCheckResults" style="color:#688aa0">Ảnh đã gắn chưa đồng nghĩa đã kiểm chứng nội dung.</small></div>';
 const row=section.querySelector('.row');
 if(row)row.insertAdjacentElement('afterend',audit);else section.insertBefore(audit,wordGrid);
 const missing=$('#onlyMissingPhotos'),summary=$('#vocabImageSummary'),results=$('#photoCheckResults');
 const oldVocab=D.vocab;
 function hasPhoto(w){return Boolean(D.photos[w.h]);}
 function counts(){
   const total=D.words.length,photo=D.words.filter(hasPhoto).length,missingCount=total-photo;
   summary.textContent=total?('Đã gắn đường dẫn ảnh: '+photo+'/'+total+' từ · Chưa có ảnh: '+missingCount+' từ.'): 'Kho từ vựng đang tải…';
   summary.style.color=missingCount?'#9b5b17':'#146548';
 }
 D.vocab=function(){
   if(!missing.checked){oldVocab();counts();return;}
   const lv=$('#level').value,topic=$('#topic').value,query=$('#vocabQuery').value.toLowerCase();
   const filtered=D.words.filter(w=>!hasPhoto(w)
    &&(lv==='all'||w.l==lv)&&(topic==='all'||w.topic===topic)
    &&[w.h,w.p,w.m,w.en].some(val=>String(val).toLowerCase().includes(query)));
   wordGrid.innerHTML=filtered.slice(0,D.shown).map(D.card).join('');
   D.bindCards(wordGrid);
   $('#loadMore').hidden=D.shown>=filtered.length;
   counts();
 };
 missing.onchange=()=>{
   if(missing.checked&&$('#onlyPhotos').checked)$('#onlyPhotos').checked=false;
   D.shown=32;D.vocab();
 };
 $('#onlyPhotos').addEventListener('change',()=>{if($('#onlyPhotos').checked)missing.checked=false;});
 const oldLoad=D.loadWords;
 D.loadWords=async function(...args){const out=await oldLoad(...args);counts();return out};
 counts();
 function preflightImage(url){
   return new Promise(resolve=>{
     const img=new Image();let settled=false;
     const timer=setTimeout(()=>finish(false),12500);
     function finish(ok){if(settled)return;settled=true;clearTimeout(timer);img.onload=null;img.onerror=null;resolve(ok)}
     img.onload=()=>finish(img.naturalWidth>0&&img.naturalHeight>0);
     img.onerror=()=>finish(false);
     img.src=url;
     if(img.complete)finish(img.naturalWidth>0);
   });
 }
 $('#checkPhotoLinks').onclick=async()=>{
   const btn=$('#checkPhotoLinks');btn.disabled=true;btn.textContent='Đang kiểm tra…';
   try{
     const map=new Map();
     for(const w of D.words){if(hasPhoto(w))map.set(D.photos[w.h],w.h);}
     const pairs=[...map.entries()];
     if(!pairs.length){results.textContent='Chưa tải kho từ vựng hoặc chưa có ảnh được gắn.';return;}
     let good=0,bad=[];
     // Batches avoid flooding the image server with 50 simultaneous requests.
     for(let i=0;i<pairs.length;i+=5){
       const group=pairs.slice(i,i+5);
       const tests=await Promise.all(group.map(async([url,word])=>({word,ok:await preflightImage(url)})));
       for(const test of tests){if(test.ok)good++;else bad.push(test.word);}
       results.textContent='Đang kiểm tra '+Math.min(i+5,pairs.length)+'/'+pairs.length+' liên kết ảnh…';
     }
     results.textContent='Link tải được: '+good+'/'+pairs.length+'. Link lỗi: '+bad.length+(bad.length?' ('+bad.slice(0,16).join('、')+(bad.length>16?'…':'')+')':'')+'. Chưa kiểm chứng ảnh có đúng nghĩa hay không.';
   }catch(e){results.textContent='Không kiểm tra được hình: '+String(e.message||e)}
   finally{btn.disabled=false;btn.textContent='Kiểm tra link ảnh';}
 };
})();


// Pixel Quest UI — visual-only stylesheet and hero decoration

;(()=>{
  'use strict';
  if(document.getElementById('pixelThemeCss'))return;
  const link=document.createElement('link');
  link.id='pixelThemeCss';
  link.rel='stylesheet';
  link.href='/pixel-ui.css?v=pixel-20261009-v2';
  document.head.append(link);
  function decorate(){
    const hero=document.querySelector('#intro .hero');
    if(hero&&!hero.querySelector('.pixel-hero-tag')){
      const tag=document.createElement('span');
      tag.className='pixel-hero-tag';
      tag.innerHTML='<span class="pixel-tag-pips" aria-hidden="true"></span><span>HỌC TIẾNG TRUNG · PIXEL QUEST</span>';
      const title=hero.querySelector('h1');
      if(title)hero.insertBefore(tag,title);else hero.prepend(tag);
    }
    const nav=document.querySelector('.nav');
    if(nav)nav.setAttribute('aria-label','Các mục học tập');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate,{once:true});
  else decorate();
})();


// Pixel Vietnamese typography and raster-free navigational icons / brand identity

;(()=>{
 'use strict';
 const patterns={"home":["...##...","..####..",".######.","########","##....##","##.##.##","##.##.##","########"],"vocab":["###..###","#.##.#.#","#.##.#.#","#.##.#.#","#.##.#.#","###..###","..####..","...##..."],"lookup":["..####..",".##..##.","##....##","##....##",".##..##.","..####..",".....##.","......##"],"writing":["......##",".....###","....##.#","...##...","..##....",".##.....","###.....","##......"],"exams":[".######.",".#....#.",".#.##.#.",".#....#.",".#.##.#.",".#....#.",".######.","........"],"flash":["...###..","..###...",".###....","#######.","...##...","..##....",".##.....","........"],"timer":["...##...","..####..","..####..",".######.",".##..##.",".##.###.",".######.","..####.."],"notes":[".#....#.","########","#......#","########","#.#..#.#","#......#","########","........"],"rank":["........",".##.....",".##.##..",".##.##.#",".##.##.#","########","########","........"],"profile":["...##...","..####..","..####..","...##...","..####..",".######.","########","........"],"logout":["##......","##..##..","##.####.","##.#####","##.####.","##..##..","##......","........"],"facebook":["...#####","..######","..##....","######..","######..","..##....","..##....","..##...."]};
 function pixelSvg(key){
  const lines=patterns[key]||patterns.home;
  let pixels='';
  lines.forEach((row,y)=>{for(let x=0;x<row.length;x++)if(row[x]==='#')pixels+='<rect x="'+(x*2)+'" y="'+(y*2)+'" width="2" height="2"/>';});
  return '<svg viewBox="0 0 16 16" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">'+pixels+'</svg>';
 }
 const brandSvg="<svg class=\"crisp-lotus\" viewBox=\"0 0 120 160\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\">\n<path d=\"M61 68C43 46 42 28 61 8c18 19 20 41 0 60Z\"/>\n<path d=\"M58 68C29 51 23 31 34 13c24 13 38 32 24 55Z\"/>\n<path d=\"M66 66C84 42 85 25 76 10C52 25 51 47 66 66Z\"/>\n<path d=\"M56 74C20 67 7 44 14 28c30 0 46 19 42 46Z\"/>\n<path d=\"M67 73c36-8 50-29 46-44-31-3-48 13-46 44Z\"/>\n<path d=\"M57 81c-24 0-43-9-50-27m60 29c24 1 38-11 47-27M61 82c10 25 12 50 9 69M67 121c-19-15-36-12-48-3 17 15 29 19 46 13M72 138c20-23 35-23 44-20-11 24-23 33-44 29\"/>\n</svg>";
 const hasUploadedLogo=src=>Boolean(src&&src.includes('supabase.co/storage/v1/object/public/team-portraits/'));
 function decorateLogo(){
  const loginImg=document.querySelector('.login-logo-frame img');
  const frame=loginImg?.closest('.login-logo-frame');
  if(frame&&!frame.querySelector('.crisp-logo-art')){
   const logo=document.createElement('div');
   logo.className='crisp-logo-art';logo.setAttribute('role','img');logo.setAttribute('aria-label','中文不难 — TIẾNG TRUNG HEM KHÓ');
   logo.innerHTML=brandSvg+'<div class="crisp-center"><div class="crisp-hanzi" lang="zh">中文不难</div><div class="crisp-viet">TIẾNG TRUNG HEM KHÓ</div></div>';
   frame.append(logo);
  }
  const sideImg=document.querySelector('.side-brand');
  const sideHeader=sideImg?.closest('.side h2')||sideImg?.parentElement;
  if(sideHeader&&!sideHeader.querySelector('.crisp-side-logo')){
   const logo=document.createElement('span');logo.className='crisp-side-logo';
   logo.innerHTML='<span class="side-crisp-hanzi" lang="zh">中文不难</span><span class="side-crisp-viet">TIẾNG TRUNG HEM KHÓ</span>';
   sideHeader.append(logo);
  }
  function apply(){
   if(loginImg&&frame)frame.classList.toggle('brand-has-uploaded-original',hasUploadedLogo(loginImg.getAttribute('src')||''));
   if(sideImg&&sideHeader)sideHeader.classList.toggle('brand-has-uploaded-original',hasUploadedLogo(sideImg.getAttribute('src')||''));
   const hero=document.querySelector('.hero-brand-watermark');
   if(hero)hero.classList.toggle('brand-has-uploaded-original',hasUploadedLogo(hero.getAttribute('src')||''));
   const loadingImage=document.querySelector('.page-loader-img');
   if(loadingImage){
    loadingImage.classList.toggle('brand-has-uploaded-original',hasUploadedLogo(loadingImage.getAttribute('src')||''));
    const container=loadingImage.parentElement;
    if(container&&!container.querySelector('.page-loader-crisp')){
     const text=document.createElement('span');text.className='page-loader-crisp';text.setAttribute('lang','zh');text.textContent='中文不难';
     loadingImage.insertAdjacentElement('afterend',text);
    }
   }
  }
  apply();
  const observer=new MutationObserver(apply);
  [loginImg,sideImg,document.querySelector('.hero-brand-watermark'),document.querySelector('.page-loader-img')].filter(Boolean).forEach(img=>observer.observe(img,{attributes:true,attributeFilter:['src']}));
 }
 function decoratePixelIcons(){
  document.querySelectorAll('.nav button[data-page],.nav button#logout').forEach(button=>{
   if(button.dataset.pixelIcon==='1')return;
   const k=button.id==='logout'?'logout':button.dataset.page;
   const label=button.textContent.trim().replace(/^[^\p{L}\p{N}]+/u,'').trim();
   const el=document.createElement('span');el.className='pixel-nav-icon';el.innerHTML=pixelSvg(k);
   const text=document.createElement('span');text.className='pixel-nav-label';text.textContent=label;
   button.replaceChildren(el,text);
   button.dataset.pixelIcon='1';
  });
  document.querySelectorAll('.mobile-dock button[data-quick-page]').forEach(b=>{
   const icon=b.querySelector('.dock-icon');if(icon)icon.innerHTML=pixelSvg(b.dataset.quickPage);
  });
  const facebook=document.querySelector('.facebook-float');
  if(facebook)facebook.innerHTML=pixelSvg('facebook');
 }
 function applyAll(){decorateLogo();decoratePixelIcons();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyAll,{once:true});
 else applyAll();
})();


// Compact Chinese lesson navigation + audio controls

;(()=>{
 'use strict';
 if(!document.querySelector('link[href*="/compact-ui.css"]')){
  const l=document.createElement('link');l.rel='stylesheet';l.href='/compact-ui.css?v=compact-20261009-v1';document.head.append(l);
 }
 if(!document.querySelector('script[src*="/compact-ui.js"]')){
  const script=document.createElement('script');script.src='/compact-ui.js?v=compact-20261009-v1';script.async=true;document.head.append(script);
 }
})();


// Background SoundCloud study music and custom sign-in wallpaper.
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
 if(want&&!playing){play();if(!ready)notify('Đang kết nối SoundCloud…');reflect();return;}
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


// Pastel sky-garden pixel art theme inspired by the user's illustration.

;(()=>{
 'use strict';
 if(document.getElementById('gardenUiSheet'))return;
 const style=document.createElement('link');
 style.id='gardenUiSheet';
 style.rel='stylesheet';
 style.href='/garden-ui.css?v=sky-garden-20261009-v1';
 document.head.append(style);
 function arrange(){
  const hero=document.querySelector('#intro .hero');
  if(hero&&!hero.querySelector('.garden-sign')){
    const plaque=document.createElement('span');
    plaque.className='garden-sign';
    plaque.setAttribute('aria-hidden','true');
    plaque.textContent='✦ 你好 · SKY GARDEN';
    hero.append(plaque);
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arrange,{once:true});
 else arrange();
})();


// Click-to-select/search HSK Hanzi writing practice

;(()=>{
 'use strict';
 const D=window.TTHK;
 const section=document.getElementById('writing');
 const select=document.getElementById('writeSelect');
 if(!D||!section||!select||document.getElementById('writingWordPicker'))return;
 const style=document.createElement('style');style.id='writingWordPickerStyle';style.textContent="\n#writingWordPicker{background:linear-gradient(125deg,#fffef7,#f2fcf7)!important;border:2px solid #a7cebd!important;box-shadow:5px 5px 0 #c8e3d5!important;border-radius:10px!important;padding:clamp(16px,2.2vw,23px)!important;margin:13px 0 21px!important;min-width:0}\n#writingWordPicker .picker-top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:13px}\n#writingWordPicker .picker-title{font-family:'VT323','Be Vietnam Pro',sans-serif!important;font-size:clamp(28px,3vw,39px)!important;font-weight:400!important;color:#276c65!important;line-height:1!important;margin:0!important}\n#writingWordPicker .picker-help{font-family:'Be Vietnam Pro',sans-serif!important;font-size:12px!important;color:#718d86!important;line-height:1.5!important;margin:0}\n#writingWordPicker .picker-search-line{display:flex;gap:9px;align-items:stretch;flex-wrap:wrap}\n#writingWordPicker .picker-search{flex:1 1 220px;min-width:0;background:white!important;border:2px solid #a5cdbe!important;border-radius:7px!important;padding:11px 13px!important;font:500 14px 'Be Vietnam Pro',sans-serif!important;box-shadow:inset 2px 2px 0 #ecf8f0!important}\n#writingWordPicker .picker-apply{font:750 12px 'Be Vietnam Pro',sans-serif!important;min-height:43px;flex:0 0 auto}\n#writingWordPicker .picker-tabs{display:flex;flex-wrap:wrap;gap:7px;margin:13px 0}\n#writingWordPicker .picker-tab{font:700 12px 'Be Vietnam Pro',sans-serif!important;color:#537773!important;border:2px solid #b3d6cb!important;border-radius:7px!important;background:#fffefa!important;padding:9px 13px!important;cursor:pointer;box-shadow:2px 2px 0 #d5e7dc}\n#writingWordPicker .picker-tab[aria-pressed=\"true\"]{background:#fce5a5!important;color:#79542a!important;border-color:#c6ab7d!important}\n#writingWordPicker .picker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(125px,1fr));gap:10px;max-height:325px;overflow:auto;padding:2px 5px 7px 2px;scrollbar-color:#94c8b7 #f4faf7}\n#writingWordPicker .picker-word{width:100%;min-width:0;padding:12px 9px!important;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;background:#fff!important;border:2px solid #c4e0d3!important;border-radius:7px!important;box-shadow:3px 3px 0 #d9e9de!important;transition:transform .12s,border-color .12s!important}\n#writingWordPicker .picker-word:hover{border-color:#5dad93!important;background:#f5fff8!important;transform:translate(-1px,-1px)!important}\n#writingWordPicker .picker-word.is-picked{background:#fff5d7!important;border-color:#e6bf79!important;box-shadow:3px 3px 0 #ebd1a2!important}\n#writingWordPicker .picker-hanzi{font:600 29px/1.12 'Noto Serif SC','Noto Sans SC','Microsoft YaHei',serif!important;color:#16655c!important;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}\n#writingWordPicker .picker-pinyin{font:600 11px/1.35 'Be Vietnam Pro',sans-serif!important;color:#3b8387!important;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n#writingWordPicker .picker-meaning{font:450 11px/1.4 'Be Vietnam Pro',sans-serif!important;color:#617b76!important;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;max-width:100%;min-height:14px}\n#writingWordPicker .picker-foot{display:flex;gap:11px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-top:12px;color:#5e8078;font:500 12px/1.5 'Be Vietnam Pro',sans-serif}\n#writingWordPicker .picker-foot .btn{font:700 12px 'Be Vietnam Pro',sans-serif!important;padding:9px 12px!important}\n#writingWordPicker .picker-empty{background:#f5fbf5;border:1px dashed #aacabb;border-radius:7px;padding:16px;font:500 12px 'Be Vietnam Pro',sans-serif;color:#648679;grid-column:1/-1}\n#writing label[for=\"writeSelect\"],#writing #writeSelect{display:none!important}\n#writingWordPicker .picker-selected{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;font:500 12px 'Be Vietnam Pro',sans-serif;color:#64877c}\n#writingWordPicker .picker-selected strong{color:#216e66;font-size:14px}\n@media(max-width:820px){#writingWordPicker .picker-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;max-height:300px}#writingWordPicker .picker-search-line{gap:8px}#writingWordPicker .picker-search{flex-basis:100%}#writingWordPicker .picker-apply{width:100%}#writingWordPicker .picker-hanzi{font-size:26px}}\n@media(max-width:400px){#writingWordPicker .picker-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#writingWordPicker .picker-tab{font-size:11px!important;padding:8px 11px!important}}\n";
 document.head.append(style);
 const panel=document.createElement('section');
 panel.id='writingWordPicker';panel.setAttribute('aria-label','Chọn chữ để luyện viết');
 panel.innerHTML="<div class=\"picker-top\"><h2 class=\"picker-title\">✦ Chọn chữ để luyện viết</h2><p class=\"picker-help\">Bấm một từ hoặc tìm chữ muốn tập</p></div>\n<div class=\"picker-search-line\"><input id=\"writingCharacterSearch\" class=\"picker-search\" type=\"search\" autocomplete=\"off\" spellcheck=\"false\" enterkeyhint=\"search\" placeholder=\"Nhập chữ Hán, Pinyin hoặc nghĩa tiếng Việt…\" aria-label=\"Tìm chữ Hán, Pinyin hoặc nghĩa tiếng Việt\"><button type=\"button\" class=\"btn picker-apply\" id=\"writeCustomWord\">✍ Tập viết chữ đã nhập</button></div>\n<div class=\"picker-tabs\" role=\"group\" aria-label=\"Lọc cấp độ HSK\"><button type=\"button\" class=\"picker-tab\" data-writing-level=\"all\" aria-pressed=\"true\">Tất cả</button><button type=\"button\" class=\"picker-tab\" data-writing-level=\"1\" aria-pressed=\"false\">HSK 1</button><button type=\"button\" class=\"picker-tab\" data-writing-level=\"2\" aria-pressed=\"false\">HSK 2</button></div>\n<div class=\"picker-grid\" id=\"writingCharacterGrid\" aria-label=\"Danh sách từ để chọn luyện viết\"></div><div class=\"picker-foot\"><span id=\"writingPickerCount\" role=\"status\" aria-live=\"polite\"></span><button class=\"btn soft\" type=\"button\" id=\"writingMoreWords\" hidden>Xem thêm chữ ↓</button></div><div class=\"picker-selected\">Đang luyện: <strong id=\"writingSelectedWord\">Chưa chọn chữ</strong></div>";
 const intro=Array.from(section.children).find(el=>el.matches?.('p.muted'))||section.querySelector('h1');
 if(intro)intro.insertAdjacentElement('afterend',panel);else section.prepend(panel);
 const search=panel.querySelector('#writingCharacterSearch');
 const grid=panel.querySelector('#writingCharacterGrid');
 const count=panel.querySelector('#writingPickerCount');
 const more=panel.querySelector('#writingMoreWords');
 const current=panel.querySelector('#writingSelectedWord');
 let level='all',limit=36;
 const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const CJK=/^[\p{Script=Han}]{1,4}$/u;
 const showCurrent=()=>{
  const word=D.words[D.writeIndex];
  current.textContent=word?word.h+' · '+(word.m||'Chữ Hán'):'Chưa chọn chữ';
 };
 function choose(index,scroll){
  if(!Number.isInteger(index)||!D.words[index])return;
  D.writeIndex=index;D.isHidden=false;D.charIndex=0;
  if(!select.querySelector('option[value="'+index+'"]')){
   const w=D.words[index];select.add(new Option(w.h+' — '+(w.m||'Chữ tự chọn'),String(index)));
  }
  select.value=String(index);
  select.dispatchEvent(new Event('change',{bubbles:true}));
  showCurrent();
  grid.querySelectorAll('[data-word-index]').forEach(el=>el.classList.toggle('is-picked',Number(el.dataset.wordIndex)===index));
  if(scroll)document.getElementById('writeCanvas')?.scrollIntoView({behavior:'smooth',block:'center'});
 }
 function render(){
  const q=normalize(search.value),all=Array.isArray(D.words)?D.words:[];
  if(!all.length){
   count.textContent='Đang tải danh sách HSK…';
   grid.innerHTML='<div class="picker-empty">Đang tải từ vựng, vui lòng đợi vài giây.</div>';
   more.hidden=true;showCurrent();return;
  }
  const matches=[];
  all.forEach((w,i)=>{
    if(w.l!==1&&w.l!==2&&w.topic!=='✍ Tự chọn')return;
    if(level!=='all'&&String(w.l)!==level)return;
    if(q&&![w.h,w.p,w.m,w.en].some(x=>normalize(x).includes(q)))return;
    matches.push(i);
  });
  grid.replaceChildren();
  const view=matches.slice(0,limit);
  for(const idx of view){
   const w=all[idx],b=document.createElement('button');
   b.type='button';b.className='picker-word';b.dataset.wordIndex=String(idx);
   b.setAttribute('aria-label','Luyện viết '+w.h+', '+(w.m||''));
   if(idx===D.writeIndex)b.classList.add('is-picked');
   for(const [name,text] of [['picker-hanzi',w.h],['picker-pinyin',w.p||' '],['picker-meaning',w.m||w.en||'']]){
    const span=document.createElement('span');span.className=name;span.textContent=text;b.append(span);
   }
   b.onclick=()=>choose(idx,true);
   grid.append(b);
  }
  if(!matches.length){
   const empty=document.createElement('div');empty.className='picker-empty';
   empty.textContent=q?'Không có từ phù hợp trong HSK. Nếu đã nhập chữ Hán, bấm “Tập viết chữ đã nhập”.':'Không có từ phù hợp.';
   grid.append(empty);
  }
  count.textContent=matches.length?'Đang xem '+view.length+' / '+matches.length+' từ':'Không tìm thấy từ phù hợp';
  more.hidden=matches.length<=limit;
  showCurrent();
 }
 panel.querySelectorAll('[data-writing-level]').forEach(b=>b.onclick=()=>{
  level=b.dataset.writingLevel;limit=36;
  panel.querySelectorAll('[data-writing-level]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  render();
 });
 more.onclick=()=>{limit+=36;render()};
 search.oninput=()=>{limit=36;render()};
 function submit(){
  const value=search.value.trim();
  if(!value){
   count.textContent='Hãy nhập từ muốn tìm hoặc bấm một chữ ở danh sách.';
   search.focus();return;
  }
  if(CJK.test(value)){
   let index=D.words.findIndex(w=>w.h===value);
   if(index<0){
    const custom={h:value,p:'',m:'Chữ tự chọn',en:'',l:3,topic:'✍ Tự chọn'};
    D.words.push(custom);index=D.words.length-1;
   }
   choose(index,true);return;
  }
  const q=normalize(value);
  const found=D.words.findIndex(w=>
   [w.h,w.p,w.m,w.en].some(x=>normalize(x).includes(q))&&
   (level==='all'||String(w.l)===level));
  if(found>=0)choose(found,true);
  else{count.textContent='Không tìm thấy. Bạn có thể nhập trực tiếp chữ Hán (tối đa 4 chữ).';search.focus();}
 }
 panel.querySelector('#writeCustomWord').onclick=submit;
 search.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();submit()}});
 select.addEventListener('change',()=>{showCurrent();render()});
 const originalLoad=D.loadWords;
 if(typeof originalLoad==='function'){
  D.loadWords=async function(...args){
   const result=await originalLoad.apply(this,args);
   render();
   if(section.classList.contains('on')&&D.words.length&&!document.querySelector('#writeCanvas svg')){
    select.value='0';select.dispatchEvent(new Event('change'));
   }
   return result;
  };
 }
 const originalPage=D.page;
 if(typeof originalPage==='function'){
  D.page=function(id){
   const result=originalPage.apply(this,arguments);
   if(id==='writing')render();
   return result;
  };
 }
 render();
})();

// Interactive individual vocabulary lesson, saved hearts and Hanzi writer

;(()=>{
 'use strict';
 if(document.getElementById('wordDetailBootstrap'))return;
 const deps=document.createElement('script');
 deps.id='wordDetailBootstrap';
 deps.src='/word-examples.js?v=hsksentence-20261009-v1';
 function loadDetail(){
  if(document.getElementById('wordDetailLoader'))return;
  const script=document.createElement('script');
  script.id='wordDetailLoader';
  script.src='/word-detail.js?v=learning-word-20261009-v1';
  document.head.append(script);
 }
 deps.onload=loadDetail;
 deps.onerror=loadDetail;
 document.head.append(deps);
})();


// HSK 1–2 complete grammar study flow with explanations and assessed exercises.

;(()=>{
 'use strict';
 if(document.getElementById('hskGrammarBootstrap'))return;
 const script=document.createElement('script');
 script.id='hskGrammarBootstrap';
 script.src='/grammar-lessons.js?v=hsk-grammar-20261009-v1';
 const load=()=>{
  if(document.getElementById('hskGrammarCourseLoader'))return;
  const ui=document.createElement('script');
  ui.id='hskGrammarCourseLoader';
  ui.src='/grammar-course.js?v=hsk-grammar-ui-20261009-v1';
  document.head.append(ui);
 };
 script.onload=load;
 script.onerror=()=>console.warn('Could not load HSK grammar bank');
 document.head.append(script);
})();


// Refresh homepage project brief and animate a two-frame pixel cat in the garden.

;(()=>{
 'use strict';
 if(document.getElementById('gardenHeroRefreshSheet'))return;
 const link=document.createElement('link');
 link.id='gardenHeroRefreshSheet';link.rel='stylesheet';
 link.href='/hero-garden-update.css?v=hero-cat-short-intro-20261009';
 document.head.append(link);
 function refreshHero(){
  const hero=document.querySelector('#intro .hero');
  if(!hero)return;
  let sign=hero.querySelector('.pixel-hero-tag');
  if(!sign){
   sign=document.createElement('span');
   sign.className='pixel-hero-tag';
   hero.insertBefore(sign,hero.firstChild);
  }
  // Only the project name is printed on the yellow sign.
  sign.textContent='TIẾNG TRUNG HEM KHÓ';
  hero.querySelector('.garden-sign')?.remove();
  let intro=hero.querySelector('p');
  if(!intro){
   intro=document.createElement('p');
   const title=hero.querySelector('h1');
   if(title)title.insertAdjacentElement('afterend',intro);
   else hero.append(intro);
  }
  intro.classList.add('garden-study-description');
  intro.textContent='Dự án môn Kỹ năng học thuật dành cho hai nhóm sinh viên FPT: sinh viên học tiếng Trung như ngoại ngữ thứ hai và sinh viên ngành Ngôn ngữ Trung ở trình độ sơ cấp. Cùng ôn từ vựng, luyện viết, nghe phát âm và làm bài tập tương tác.';
  let cat=hero.querySelector('.garden-running-cat');
  if(!cat){
   cat=document.createElement('div');
   cat.className='garden-running-cat';
   cat.setAttribute('aria-hidden','true');
   const art=document.createElement('span');
   art.className='garden-cat-sprite';
   cat.append(art);hero.append(cat);
  }
  const sizing=()=>hero.style.setProperty('--garden-cat-width',Math.max(300,hero.clientWidth)+'px');
  sizing();
  if(window.ResizeObserver){
   const observer=new ResizeObserver(sizing);
   observer.observe(hero);
  }else window.addEventListener('resize',sizing,{passive:true});
  const site=document.getElementById('site');
  if(site){
   const observer=new MutationObserver(()=>requestAnimationFrame(sizing));
   observer.observe(site,{attributes:true,attributeFilter:['hidden']});
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshHero,{once:true});
 else refreshHero();
})();


// Interactive pixel game hub, virtual cat, food and expensive equippable clothes

;(()=>{
 'use strict';
 if(document.getElementById('pixelArcadeBootstrap'))return;
 function loadArcade(){
  const script=document.createElement('script');
  script.id='pixelArcadeBootstrap';
  script.src='/pixel-arcade.js?v=cat-final-v6';
  script.onerror=()=>console.warn('Pixel Arcade could not load.');
  document.head.append(script);
 }
 const atlas=document.createElement('script');
 atlas.id='catPixelAtlas';
 atlas.src='/cat-atlas-data.js?v=cat-final-v6';
 atlas.onload=loadArcade;
 atlas.onerror=loadArcade;
 document.head.append(atlas);
})();
