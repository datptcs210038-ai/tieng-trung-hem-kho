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
.memberpic{background-image:url('/team.webp')!important;background-repeat:no-repeat!important;background-size:500% 100%!important;width:100%;aspect-ratio:3/4!important;display:block;filter:none}
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
     <p class="subtext">JPG, PNG hoặc WebP · tối đa 2 MB. Ảnh đại diện có thể được xem công khai.</p>
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
  status('nameStatus','✅ Đã cập nhật tên hiển thị và tên trên bảng xếp hạng.');
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
 if(f.size>2*1024*1024)return status('photoStatus','Ảnh lớn hơn 2 MB. Hãy chọn ảnh nhỏ hơn.');
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
  status('photoStatus','✅ Ảnh đại diện đã được cập nhật.');
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
