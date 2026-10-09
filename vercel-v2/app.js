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

;(()=>{const css="\n:root{--brand-900:#084870;--brand-800:#125c85;--brand-700:#2c729b;--brand-200:#c8e0f0;--brand-100:#e9f4fb;--text-main:#163950}\nbody{background:radial-gradient(ellipse at 7% 4%,#d5ebfbb8,transparent 38%),linear-gradient(180deg,#fbfdff,#f0f8ff);color:var(--text-main)}\n.side{background:#ffffffed;backdrop-filter:blur(14px);border-right:1px solid #d5e6f3;padding-top:16px}\n.side h2{display:flex;align-items:center;justify-content:center;margin:0 0 23px;padding:0;font-size:16px;color:#084870}\n.side-brand{width:100%;max-width:210px;aspect-ratio:440/267;object-fit:contain;mix-blend-mode:multiply}\n.nav button{color:#557c95;transition:background .2s ease,color .2s ease,transform .2s ease}\n.nav button.on,.nav button:hover{background:linear-gradient(100deg,#dceefa,#ecf6fc);color:#084870;transform:translateX(2px)}\nh1,h2,h3{color:#084870}.muted,footer{color:#6c8b9d}\n.hero{background:linear-gradient(115deg,#ddecf9,#f9fcff 57%,#e3f1fa);border:1px solid #cde2f1;min-height:235px;box-shadow:0 20px 56px #08487012;position:relative;isolation:isolate;overflow:hidden}\n.hero h1,.hero p,.hero button{position:relative;z-index:2}.hero em{color:#1473a6}.hero:after{content:'';background:none!important}\n.hero-brand-watermark{position:absolute;right:-50px;top:-12%;width:min(46%,385px);opacity:.17;mix-blend-mode:multiply;pointer-events:none}\n.btn{background:linear-gradient(135deg,#1670a1,#084870);box-shadow:0 7px 18px #08487015;transition:transform .2s,box-shadow .2s}.btn:hover{transform:translateY(-2px);box-shadow:0 12px 27px #08487027}.btn.soft{background:#e6f2fb;color:#0b577f}\n.box{border-color:#d8e8f5;background:#fffffff2;box-shadow:0 12px 32px #0e52700e}.word h2,#hanzi{color:#0e6087!important}.word small{color:#397997}\n.searchbar{border-color:#b2d8ef;box-shadow:0 10px 30px #0848700b}input,select,textarea{border-color:#cfe3f1;color:#184159}\ninput:focus-visible,select:focus-visible,textarea:focus-visible,button:focus-visible{outline:3px solid #83c4ed;outline-offset:2px}.switch{background:#e6f1fa}.switch button.on{color:#0c5e8a}.popup{border-color:#aad7ee}\n#gate.authgate{grid-template-columns:minmax(0,1.12fr) minmax(320px,460px);gap:clamp(26px,5vw,76px);padding:clamp(20px,5vw,65px);background:radial-gradient(circle at 18% 50%,#ceeaff,transparent 46%),linear-gradient(122deg,#fafdff,#eaf5fd);overflow-y:auto;align-items:center;justify-items:center}\n.login-showcase{position:relative;z-index:1;width:min(100%,655px);padding:14px 12px 24px;animation:welcomeIn .8s both}\n.login-logo-frame{position:relative;border-radius:30px;background:#ffffffee;box-shadow:0 28px 72px #0b537018;border:1px solid #c4e3f3;padding:12px;margin-bottom:23px;overflow:hidden}\n.login-logo-frame:before{content:'';position:absolute;inset:15% 5%;background:#a9dffa5f;filter:blur(38px);border-radius:50%}\n.login-logo-frame img{position:relative;z-index:1;width:100%;height:auto;display:block;border-radius:18px;mix-blend-mode:multiply;animation:logoFloat 7s ease-in-out infinite}\n.login-showcase h1{font-size:clamp(28px,3.8vw,49px);letter-spacing:-1.8px;line-height:1.24;margin:12px 0;color:#073d61}\n.login-showcase h1 span{color:#1977a7}.login-showcase p{max-width:560px;color:#5b7f95;font-size:14px;line-height:1.9}\n.login-kicker{letter-spacing:2.4px;font-size:10px;font-weight:800;color:#297aa5}.login-chips{display:flex;flex-wrap:wrap;gap:9px;margin-top:18px}\n.login-chips span{padding:10px 12px;background:#ffffffdd;border:1px solid #d1e7f6;box-shadow:0 8px 24px #0848700b;border-radius:999px;font-size:11px;color:#1d6387;font-weight:700}\n#gate .authcard{position:relative;z-index:2;width:100%;max-width:465px;margin:0;border:1px solid #cee3f1;background:#ffffffee;backdrop-filter:blur(22px);box-shadow:0 30px 82px #08487025;border-radius:29px;padding:clamp(22px,3vw,36px);animation:cardIn .65s ease both}\n#gate .authcard:before{content:'✦';position:absolute;right:22px;top:18px;color:#a1d6f5;font-size:21px}#gate .authcard h2{font-size:29px;color:#084870;margin:12px 0 10px}\n#gate .authcard .authpane input{background:#f9fdff;border:1px solid #c6dfed;border-radius:14px;padding:14px 15px;margin:10px 0}\n#gate .authcard .authpane input:focus{border-color:#4c9dce;box-shadow:0 0 0 4px #c6e8fc85;outline:0}\n#gate .authcard .btn{padding:13px 18px;border-radius:13px}#gate .authcard .row{gap:10px}\n#gate .authcard #paneLogin #login{min-width:150px;flex:1}\n@keyframes welcomeIn{from{opacity:0;transform:translateY(21px)}to{opacity:1;transform:none}}\n@keyframes cardIn{from{opacity:0;transform:translateY(22px) scale(.985)}to{opacity:1;transform:none}}\n@keyframes logoFloat{50%{transform:translateY(-7px)}}\n@media(max-width:880px){#gate.authgate{grid-template-columns:1fr;gap:16px;padding:20px 16px;align-content:center}.login-showcase{max-width:470px;padding:4px}.login-logo-frame{max-width:410px;margin:0 auto 12px;padding:7px}.login-showcase h1{font-size:25px;text-align:center;margin:8px}.login-showcase p{display:none}.login-kicker{text-align:center;display:block}.login-chips{justify-content:center;margin-top:10px;gap:6px}.login-chips span{font-size:10px;padding:7px 9px}#gate .authcard{max-width:475px;padding:22px;border-radius:22px}}\n@media(max-width:480px){.login-showcase h1{font-size:21px}.login-logo-frame{max-width:265px;margin-bottom:8px}.login-chips span:nth-child(n+3){display:none}#gate .authcard .row{gap:7px}#gate .authcard .btn{font-size:12px;padding:11px}}\n@media(prefers-reduced-motion:reduce){.login-showcase,#gate .authcard,.login-logo-frame img{animation:none!important}}";const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);const logo="/logo-tthk.webp";const siteTitle=document.querySelector('.side h2');if(siteTitle){siteTitle.textContent='';const img=document.createElement('img');img.className='side-brand';img.alt='Tiếng Trung Hem Khó';img.src=logo;img.onerror=()=>{siteTitle.textContent='中文不难 · Tiếng Trung Hem Khó'};siteTitle.append(img)}const gate=document.querySelector('#gate');if(gate&&!gate.querySelector('.login-showcase')){const story=document.createElement('div');story.className='login-showcase';story.innerHTML="<div class=\"login-logo-frame\"><img src=\"/logo-tthk.webp\" alt=\"中文不难 — Tiếng Trung Hem Khó\"></div><div class=\"login-kicker\">KHÁM PHÁ NGÔN NGỮ · 发现中文</div><h1>Mở ra một thế giới mới<br><span>qua từng chữ Hán.</span></h1><p>Góc học tập nhỏ để cùng nhau luyện từ vựng, nghe phát âm, tập viết chữ Hán và chinh phục HSK mỗi ngày.</p><div class=\"login-chips\"><span>✦ HSK 1–2</span><span>◈ Từ vựng trực quan</span><span>✍ Luyện viết</span><span>♫ Phát âm</span></div>";gate.insertBefore(story,gate.firstChild)}const intro=document.querySelector('#intro .hero');if(intro&&!intro.querySelector('.hero-brand-watermark')){const img=document.createElement('img');img.className='hero-brand-watermark';img.alt='';img.setAttribute('aria-hidden','true');img.src=logo;intro.append(img)}const fav=document.createElement('link');fav.rel='icon';fav.type='image/webp';fav.href=logo;document.head.append(fav);})();

// Administrator-only original-resolution team photo manager
(()=> {
  'use strict';
  const D=window.TTHK; if (!D) return;
  const $=s=>document.querySelector(s);
  const MEMBERS=[
    ['thanh-dat','Thành Đạt'],
    ['hong-diep','Hồng Diệp'],
    ['yen-vi','Yến Vi'],
    ['ngoc-giau','Ngọc Giàu'],
    ['phuong-nghi','Phương Nghi']
  ];
  const team=$('#team');
  if (!team) return;
  const panel=document.createElement('section');
  panel.className='box';
  panel.id='teamUploadManager';
  panel.hidden=true;
  panel.style.cssText='max-width:880px;margin:28px auto;background:#fafffb;border:1px solid #bce0ca;';
  panel.innerHTML='<h3 style="margin-top:0">📷 Thay ảnh thành viên (quản trị)</h3>'
    +'<p class="muted">Chọn từng <b>ảnh gốc</b> để thay ảnh mờ. Website lưu ảnh riêng từng thành viên và giữ đúng khung 3:4, không kéo giãn. Nên chọn ảnh dọc từ 900 × 1200 px trở lên.</p>'
    +MEMBERS.map(([slug,name])=>
      '<div class="row" style="padding:12px 0;border-bottom:1px solid #e1efe5">'
      +'<b style="min-width:125px">'+name+'</b>'
      +'<input type="file" accept="image/jpeg,image/png,image/webp" data-member-photo="'+slug+'" aria-label="Chọn ảnh '+name+'">'
      +'<button type="button" class="btn soft" data-member-submit="'+slug+'">Tải ảnh lên</button>'
      +'</div>').join('')
    +'<p id="teamUploadStatus" role="status" class="muted" style="font-size:13px"></p>';
  const toggle=document.createElement('button');toggle.type='button';toggle.className='btn soft';toggle.textContent='🖼 Quản lý ảnh thành viên';toggle.hidden=true;toggle.style.cssText='display:block;margin:16px auto 0';team.insertAdjacentElement('afterend',toggle);toggle.insertAdjacentElement('afterend',panel);let isOpen=false;toggle.onclick=()=>{isOpen=!isOpen;panel.hidden=!isOpen;toggle.textContent=isOpen?'✕ Đóng quản lý ảnh':'🖼 Quản lý ảnh thành viên';};
  const getContext=()=>D.profileContext?.()||{};
  let loaded=false;
  function status(message){const el=$('#teamUploadStatus');if(el)el.textContent=message;}
  function portraitCard(i){return team.querySelectorAll('.memberpic')[i]||null;}
  function setPortrait(slug,path,version){
    const i=MEMBERS.findIndex(m=>m[0]===slug);
    const node=portraitCard(i);if(!node||!path)return;
    const {db}=getContext();if(!db)return;
    const obj=db.storage.from('team-portraits').getPublicUrl(path);
    const url=obj.data?.publicUrl;if(!url)return;
    const safe=url+'?v='+encodeURIComponent(String(version||'1'));
    node.style.setProperty('background-image','url("'+safe+'")','important');
    node.style.setProperty('background-size','contain','important');
    node.style.backgroundRepeat='no-repeat';
    node.style.backgroundPosition='center';
    node.style.aspectRatio='3 / 4';
    node.setAttribute('role','img');
    node.setAttribute('aria-label','Ảnh rõ nét của '+MEMBERS[i][1]);
    node.dataset.hires='true';
  }
  async function refreshTeam() {
    const {db,user}=getContext();if(!db||!user)return;
    const [assetResult,editorResult]=await Promise.all([
      db.from('site_assets').select('slug,image_path,updated_at'),
      db.from('site_editors').select('user_id').eq('user_id',user.id).maybeSingle()
    ]);
    if(!assetResult.error) {
      for(const asset of (assetResult.data||[])) setPortrait(asset.slug,asset.image_path,asset.updated_at);
    }
    const isEditor=!!editorResult.data&&!editorResult.error;
    toggle.hidden=!isEditor;
    panel.hidden=!isEditor||!isOpen;
    loaded=true;
  }
  async function toWebp(file) {
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))
      throw new Error('Ảnh phải là JPG, PNG hoặc WebP.');
    const img=await new Promise((resolve,reject)=>{
      const el=new Image();const u=URL.createObjectURL(file);
      el.onload=()=>{URL.revokeObjectURL(u);resolve(el)};
      el.onerror=()=>{URL.revokeObjectURL(u);reject(new Error('Không mở được file ảnh.'))};
      el.src=u;
    });
    const w=img.naturalWidth,h=img.naturalHeight;
    if(w<750||h<1000) throw new Error('Ảnh này nhỏ ('+w+' × '+h+' px), dễ bị bể. Hãy chọn ảnh gốc tối thiểu 750 × 1000 px.');
    const scale=Math.min(1,1440/w,1920/h);
    const canvas=document.createElement('canvas');canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.91));
    if(!blob||blob.type!=='image/webp')throw new Error('Trình duyệt không xuất được ảnh WebP, hãy dùng Chrome hoặc Edge.');
    if(blob.size>4194304)throw new Error('Ảnh sau xử lý vượt 4 MB.');
    return blob;
  }
  panel.querySelectorAll('[data-member-submit]').forEach(btn=>{
    btn.onclick=async()=>{
      const slug=btn.dataset.memberSubmit;
      const {db,user}=getContext();
      if(!db||!user) return status('Bạn cần đăng nhập để cập nhật.');
      const input=panel.querySelector('[data-member-photo="'+slug+'"]');
      const file=input?.files?.[0];
      if(!file)return status('Hãy chọn ảnh cho '+MEMBERS.find(m=>m[0]===slug)?.[1]+'.');
      btn.disabled=true;status('Đang xử lý ảnh gốc, vui lòng chờ...');
      try {
        const blob=await toWebp(file);
        const name='team/'+slug+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.webp';
        const r=await db.storage.from('team-portraits').upload(name,blob,{contentType:'image/webp',cacheControl:'86400',upsert:false});
        if(r.error)throw r.error;
        const when=new Date().toISOString();
        const save=await db.from('site_assets').upsert({slug,image_path:name,updated_at:when},{onConflict:'slug'});
        if(save.error)throw save.error;
        setPortrait(slug,name,when);
        status('✅ Đã cập nhật ảnh '+MEMBERS.find(m=>m[0]===slug)[1]+' ở độ phân giải rõ nét. Mọi người sẽ thấy ảnh mới khi tải lại trang.');
        input.value='';
      }catch(e){status('Chưa tải được ảnh: '+(e?.message||String(e)));}
      finally{btn.disabled=false;}
    };
  });
  const oldPage=D.page;
  D.page=id=>{oldPage(id);if(id==='intro')refreshTeam();};
  window.addEventListener('load',()=>{
    const {db}=getContext();
    if(db) {
      db.auth.onAuthStateChange(event=>{
        if(event==='SIGNED_IN'||event==='INITIAL_SESSION')setTimeout(refreshTeam,100);
      });
      setTimeout(refreshTeam,200);
    }
  });
})();


;(()=> {
'use strict';
const $=s=>document.querySelector(s);
const D=window.TTHK;
if(!D||!window.supabase)return;
const sup=window.supabase.createClient('https://wcgzdbjmwhyroszvyetv.supabase.co','sb_publishable_rS5k1n1aKhqPaq_4En2pKw_hXYe3WcJ');
const bucket=sup.storage.from('team-portraits');
function applyLogo(path, stamp){
 if(!path)return;
 const {data}=bucket.getPublicUrl(path);if(!data?.publicUrl)return;
 const url=data.publicUrl+'?v='+encodeURIComponent(stamp||'1');
 const selectors=['.login-logo-frame img','.side-brand','.hero-brand-watermark'];
 for(const selector of selectors){
  const element=$(selector);
  if(element&&element.tagName==='IMG'){element.src=url;element.style.objectFit='contain';}
 }
 const fav=document.querySelector('link[rel="icon"]');
 if(fav){fav.href=url;fav.type='image/png';}
}
async function loadLogo(){
 const {data,error}=await sup.from('site_assets').select('image_path,updated_at').eq('slug','logo').maybeSingle();
 if(!error&&data?.image_path)applyLogo(data.image_path,data.updated_at);
}
const style=document.createElement('style');
style.textContent='.brand-uploader{max-width:650px;margin:22px auto;border:1px solid #c8e0f0;border-radius:20px;background:#f7fbff;padding:22px;box-shadow:0 10px 30px #0848700b}.brand-uploader input{display:block;max-width:100%;width:100%;margin:12px 0;border:1px solid #c8e0f0}.brand-uploader-preview{width:160px;height:160px;object-fit:contain;display:block;border-radius:18px;background:white;border:1px solid #c8e0f0}.brand-uploader p{line-height:1.7}';
document.head.append(style);
function initAdmin(){
 const team=$('#team');
 if(!team||$('#brandLogoUploader'))return;
 const box=document.createElement('section');
 box.id='brandLogoUploader';box.className='brand-uploader';box.hidden=true;
 box.innerHTML='<h3>🎨 Cập nhật logo gốc</h3><p style="color:#557b93">Tải trực tiếp ảnh PNG/WebP/JPG gốc lên website. <b>Không thu nhỏ, không chuyển đổi, không nén lại.</b> Ảnh được dùng ở màn hình đăng nhập, menu và favicon.</p><img id="brandPreview" class="brand-uploader-preview" src="/logo-tthk.webp" alt="Xem trước logo"><input type="file" id="brandFile" accept="image/png,image/jpeg,image/webp"><button type="button" class="btn" id="brandUpload">⬆️ Tải logo gốc lên</button><p id="brandMessage" role="status" style="color:#084870"></p>';
 const button=document.createElement('button');
 button.type='button';button.className='btn soft';button.style.cssText='display:block;margin:24px auto';button.hidden=true;button.textContent='🎨 Quản lý logo';
 const teamManager=$('#teamUploadManager')||team;
 teamManager.insertAdjacentElement('afterend',button);
 button.insertAdjacentElement('afterend',box);
 button.onclick=()=>{box.hidden=!box.hidden;button.textContent=box.hidden?'🎨 Quản lý logo':'✕ Đóng quản lý logo'};
 $('#brandFile').onchange=()=>{
  const file=$('#brandFile').files?.[0];if(!file)return;
  const img=$('#brandPreview');const url=URL.createObjectURL(file);
  img.onload=()=>URL.revokeObjectURL(url);
  img.src=url;
 };
 $('#brandUpload').onclick=async()=>{
  const file=$('#brandFile').files?.[0];
  const message=$('#brandMessage');
  if(!file){message.textContent='Hãy chọn file logo gốc.';return}
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)){message.textContent='Chỉ hỗ trợ PNG, JPG hoặc WebP.';return}
  if(file.size>4194304){message.textContent='Dung lượng vượt 4 MB; file hiện tại không được tự ý nén, hãy chọn file khác hoặc báo tui.';return}
  const btn=$('#brandUpload');btn.disabled=true;message.textContent='Đang tải ảnh gốc lên, không thay đổi kích thước…';
  try{
   const {data:session,error:authError}=await sup.auth.getUser();if(authError||!session.user)throw new Error('Bạn cần đăng nhập bằng tài khoản quản trị.');
   const uid=session.user.id;
   const {data:editor,error:permissionError}=await sup.from('site_editors').select('user_id').eq('user_id',uid).maybeSingle();
   if(permissionError||!editor)throw new Error('Tài khoản này chưa có quyền quản lý logo.');
   const img=await createImageBitmap(file);
   if(img.width<1024||img.height<1024)throw new Error('Ảnh nhỏ hơn 1024 px, có nguy cơ bể nét. Hãy chọn bản gốc.');
   const dimensions=img.width+' × '+img.height;img.close?.();
   const suffix=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
   const path='team/logo-original-'+Date.now()+'-'+Math.random().toString(36).slice(2,9)+'.'+suffix;
   const up=await sup.storage.from('team-portraits').upload(path,file,{contentType:file.type,upsert:false,cacheControl:'31536000'});
   if(up.error)throw up.error;
   const time=new Date().toISOString();
   const saved=await sup.from('site_assets').upsert({slug:'logo',image_path:path,updated_at:time},{onConflict:'slug'});
   if(saved.error)throw saved.error;
   applyLogo(path,time);message.textContent='✅ Đã thay logo bản gốc '+dimensions+' ('+(file.size/1048576).toFixed(2)+' MB), không nén lại. Tải lại trang để xem.';$('#brandFile').value='';
  }catch(e){message.textContent='❌ Chưa thay logo: '+(e?.message||String(e))}
  finally{btn.disabled=false}
 };
 async function toggleAdmin(){
  try{
   const {data:auth}=await sup.auth.getUser();
   if(!auth.user){button.hidden=true;box.hidden=true;return}
   const {data:editor}=await sup.from('site_editors').select('user_id').eq('user_id',auth.user.id).maybeSingle();
   button.hidden=!editor;if(!editor)box.hidden=true;
  }catch{button.hidden=true;box.hidden=true}
 }
 sup.auth.onAuthStateChange(e=>{if(e==='SIGNED_IN'||e==='SIGNED_OUT'||e==='INITIAL_SESSION')setTimeout(toggleAdmin,100)});
 toggleAdmin();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{loadLogo();initAdmin()},{once:true});
else{loadLogo();initAdmin()}
})();


// Main visual media management with adjustable crop.
(()=>{
'use strict';
const D=window.TTHK, $=s=>document.querySelector(s);
if(!D)return;
const targets=[['logo','Logo Tiếng Trung Hem Khó',1],['thanh-dat','Thành Đạt',.75],['hong-diep','Hồng Diệp',.75],['yen-vi','Yến Vi',.75],['ngoc-giau','Ngọc Giàu',.75],['phuong-nghi','Phương Nghi',.75]];
const state={target:targets[0],file:null,img:null,zoom:100,ox:0,oy:0,mode:'contain',records:{},drag:null,editor:false};
const style=document.createElement('style');
style.textContent=".im-layout{display:grid;grid-template-columns:minmax(250px,.84fr) minmax(0,1.16fr);gap:20px}.im-panel{background:#fff;border:1px solid #cfe4f3;border-radius:21px;padding:23px;box-shadow:0 12px 32px #06446e0e}.im-panel h3{margin:0 0 12px;color:#084870}.im-panel p{font-size:13px;line-height:1.7;color:#617f95}.im-panel label{display:block;font-weight:700;margin:17px 0 8px;font-size:13px;color:#255d7a}.im-panel input[type=file],.im-panel select{width:100%;max-width:100%;border-radius:12px}.im-modes{display:flex;gap:10px;flex-wrap:wrap}.im-modes label{margin:0;border:1px solid #d0e4f1;padding:9px 12px;border-radius:13px;cursor:pointer;background:#f5fbff}.im-note{background:#eaf6ff;border-radius:12px;padding:12px;color:#245f82}.im-preview-frame{display:flex;align-items:center;justify-content:center;background:repeating-conic-gradient(#f0f6fb 0% 25%,#fff 0% 50%) 50%/22px 22px;border:2px dashed #add0e5;border-radius:18px;padding:14px;overflow:hidden}.im-preview-frame canvas{max-width:min(100%,440px);height:auto;touch-action:none;cursor:grab;box-shadow:0 8px 30px #0b4b711b;border-radius:10px}.im-current{display:flex;align-items:center;gap:12px;min-height:100px;border:1px solid #e0eef6;padding:10px;border-radius:13px;background:#f9fcff}.im-current img{width:100px;max-height:145px;object-fit:contain;border-radius:9px;background:white}.im-current small{color:#688599}.im-zoom{width:100%;accent-color:#1577a6}.im-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:13px}#imSave{width:100%;margin:17px 0 0;padding:15px}#imStatus{font-size:13px;font-weight:650;white-space:pre-wrap;line-height:1.7;min-height:25px;color:#135475}.im-hint{font-size:12px;color:#607f95}@media(max-width:790px){.im-layout{grid-template-columns:1fr}.im-panel{padding:17px}}";
document.head.append(style);
const nav=$('.nav'),main=$('.site main');
if(!nav||!main)return;
const nb=document.createElement('button');nb.type='button';nb.dataset.page='imageManager';nb.textContent='🖼️ Quản lý hình ảnh';nb.title='Thay logo và căn chỉnh ảnh thành viên';
nav.insertBefore(nb,$('#logout'));
const root=document.createElement('section');root.id='imageManager';root.className='page';
root.innerHTML=[
"<h1>🖼️ Quản lý hình ảnh</h1>",
"<p class='muted'>Thay logo hoặc ảnh thành viên, <b>kéo để căn vị trí, chỉnh độ phóng to và xem trước trước khi lưu</b>. Quyền tải ảnh được kiểm tra qua tài khoản quản trị.</p>",
"<div class='im-layout'><div class='im-panel'><h3>1. Chọn ảnh để thay</h3>",
"<label for='imTarget'>Vị trí ảnh trên website</label><select id='imTarget'>",
targets.map(t=>"<option value='"+t[0]+"'>"+t[1]+"</option>").join(''),
"</select><label>Ảnh hiện đang sử dụng</label><div class='im-current'><img id='imCurrent' hidden alt='Ảnh đang dùng'><div><b id='imCurrentLabel'>Chưa có ảnh riêng</b><br><small id='imCurrentNote'>Chưa tải ảnh từ hệ thống</small></div></div>",
"<label for='imFile'>Chọn file ảnh gốc trên máy</label><input type='file' id='imFile' accept='image/png,image/jpeg,image/webp'>",
"<p class='im-hint' id='imFileInfo'>PNG / JPG / WebP · ảnh khi lưu tối đa 4 MB.</p>",
"<div class='im-note'>💡 Với ảnh thành viên nên chọn hình dọc 3:4, từ 750 × 1000 px. Logo nên từ 1024 × 1024 px. <b>Giữ trọn ảnh</b> giúp không cắt mất người hoặc chi tiết trang trí.</div></div>",
"<div class='im-panel'><h3>2. Căn chỉnh và xem trước</h3><div class='im-preview-frame'><canvas id='imCanvas' width='400' height='400' aria-label='Ảnh xem trước, kéo ảnh để chỉnh vị trí'></canvas></div>",
"<p class='im-hint'>Kéo trực tiếp trong khung để đổi vị trí. Dùng thanh bên dưới để chỉnh độ phóng to.</p>",
"<label>Kiểu hiển thị</label><div class='im-modes'><label><input type='radio' name='imFit' value='contain' checked> Giữ trọn ảnh</label><label><input type='radio' name='imFit' value='cover'> Lấp đầy khung (có thể cắt)</label></div>",
"<label for='imZoom'>Phóng to: <strong id='imZoomText'>100%</strong></label><input type='range' class='im-zoom' id='imZoom' min='100' max='220' step='1' value='100'>",
"<div class='im-actions'><button type='button' class='btn soft' id='imReset'>↺ Căn giữa lại</button><button type='button' class='btn soft' id='imReload'>↻ Làm mới ảnh đã lưu</button></div>",
"<button type='button' class='btn' id='imSave'>💾 Lưu ảnh lên website</button><p id='imStatus' role='status' aria-live='polite'></p></div></div>"
].join('');
const footer=main.querySelector('footer');if(footer)footer.before(root);else main.append(root);
const older1=$('#teamUploadManager'),older2=$('#brandLogoUploader');
for(const old of [older1,older2]){if(old){const b=old.previousElementSibling;if(b?.tagName==='BUTTON'&&/Quản lý|Đóng/.test(b.textContent))b.remove();old.remove();}}
const canvas=$('#imCanvas'),dims={w:400,h:400};
function notify(text){$('#imStatus').textContent=text;}
function context(){return D.profileContext?.()||{};}
function renderTo(c,w,h){
 const cx=c.getContext('2d');cx.clearRect(0,0,w,h);cx.fillStyle='#fff';cx.fillRect(0,0,w,h);
 if(!state.img){cx.fillStyle='#6589a0';cx.textAlign='center';cx.font='bold '+Math.round(w/24)+'px sans-serif';cx.fillText('Chọn ảnh để xem trước',w/2,h/2);return;}
 const iw=state.img.width,ih=state.img.height;
 const base=state.mode==='contain'?Math.min(w/iw,h/ih):Math.max(w/iw,h/ih),scale=base*state.zoom/100;
 const dw=iw*scale,dh=ih*scale;
 cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
 cx.drawImage(state.img,(w-dw)/2+state.ox*w/dims.w,(h-dh)/2+state.oy*h/dims.h,dw,dh);
}
function redraw(){
 const w=400,h=state.target[2]===1?400:Math.round(400/state.target[2]);
 if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
 dims.w=w;dims.h=h;
 canvas.style.aspectRatio=w+'/'+h;renderTo(canvas,w,h);
 $('#imZoomText').textContent=state.zoom+'%';$('#imZoom').value=state.zoom;
}
function urlFor(record){
 const {db}=context();if(!db||!record?.image_path)return null;
 const u=db.storage.from('team-portraits').getPublicUrl(record.image_path).data?.publicUrl;
 return u?u+'?v='+encodeURIComponent(record.updated_at||'1'):null;
}
function updateCurrent(){
 const rec=state.records[state.target[0]],img=$('#imCurrent'),u=urlFor(rec);
 img.hidden=!u;if(u)img.src=u;
 $('#imCurrentLabel').textContent=rec?'Ảnh đã lưu trên website':'Chưa có ảnh riêng';
 $('#imCurrentNote').textContent=rec?'Ảnh mới đang được sử dụng':'Đang dùng ảnh mẫu cũ';
}
function reset(){state.file=null;if(state.img?.close)state.img.close();state.img=null;state.zoom=100;state.ox=0;state.oy=0;state.mode='contain';$('#imFile').value='';document.querySelector('[name=imFit][value=contain]').checked=true;$('#imFileInfo').textContent='PNG / JPG / WebP · ảnh khi lưu tối đa 4 MB.';redraw();}
$('#imTarget').onchange=()=>{state.target=targets.find(t=>t[0]===$('#imTarget').value)||targets[0];reset();updateCurrent();notify('')};
$('#imFile').onchange=async e=>{
 const f=e.target.files?.[0];if(!f)return;
 if(!['image/png','image/jpeg','image/webp'].includes(f.type)){notify('❌ Chỉ hỗ trợ PNG, JPG hoặc WebP.');return;}
 try{
  const img=await createImageBitmap(f);
  if(img.width<700||img.height<700){notify('⚠️ Ảnh chỉ '+img.width+' × '+img.height+' px, dễ bị bể. Hãy chọn ảnh gốc lớn hơn.');img.close?.();return;}
  if(state.img?.close)state.img.close();
  state.file=f;state.img=img;state.zoom=100;state.ox=0;state.oy=0;state.mode='contain';
  document.querySelector('[name=imFit][value=contain]').checked=true;
  $('#imFileInfo').textContent='Ảnh gốc '+img.width+' × '+img.height+' px · '+(f.size/1048576).toFixed(2)+' MB';
  notify('✅ Đã mở ảnh gốc. Bạn có thể kéo/căn chỉnh và lưu.');redraw();
 }catch(err){notify('❌ Không đọc được file: '+err.message);}
};
document.querySelectorAll('[name=imFit]').forEach(e=>e.onchange=()=>{state.mode=e.value;redraw()});
$('#imZoom').oninput=e=>{state.zoom=Number(e.target.value);redraw()};
$('#imReset').onclick=()=>{state.zoom=100;state.ox=0;state.oy=0;redraw()};
canvas.addEventListener('pointerdown',e=>{if(!state.img)return;canvas.setPointerCapture(e.pointerId);state.drag={x:e.clientX,y:e.clientY,ox:state.ox,oy:state.oy}});
canvas.addEventListener('pointermove',e=>{if(!state.drag)return;const box=canvas.getBoundingClientRect();state.ox=state.drag.ox+(e.clientX-state.drag.x)*dims.w/box.width;state.oy=state.drag.oy+(e.clientY-state.drag.y)*dims.h/box.height;redraw()});
canvas.addEventListener('pointerup',()=>state.drag=null);canvas.addEventListener('pointercancel',()=>state.drag=null);
async function load(){
 const {db,user}=context();
 if(!db||!user){notify('Chưa lấy được phiên đăng nhập. Vui lòng tải lại trang và thử lại.');return;}
 notify('Đang kiểm tra quyền quản trị…');
 const editor=await db.from('site_editors').select('user_id').eq('user_id',user.id).maybeSingle();
 if(editor.error){notify('Không kiểm tra được quyền: '+editor.error.message);state.editor=false;return;}
 state.editor=!!editor.data;
 if(!state.editor){notify('Tài khoản này chưa có quyền tải ảnh lên.');return;}
 const result=await db.from('site_assets').select('slug,image_path,updated_at');
 if(result.error){notify('Không đọc được ảnh đã lưu: '+result.error.message);return;}
 state.records=Object.fromEntries((result.data||[]).map(a=>[a.slug,a]));updateCurrent();
 notify('✅ Quản trị đã sẵn sàng. Chọn file ảnh để căn chỉnh và lưu.');
}
nb.onclick=()=>{D.page('imageManager');load()};
$('#imReload').onclick=load;
function updateOnSite(record){
 const u=urlFor(record);if(!u)return;
 if(record.slug==='logo'){
  document.querySelectorAll('.side-brand,.login-logo-frame img,.hero-brand-watermark').forEach(img=>{if(img.tagName==='IMG'){img.src=u;img.style.objectFit='contain';}});
  const fav=document.querySelector('link[rel=icon]');if(fav)fav.href=u;
 }else{
  const idx=targets.findIndex(t=>t[0]===record.slug)-1;
  const el=document.querySelectorAll('.memberpic')[idx];
  if(el){el.style.setProperty('background-image','url("'+u+'")','important');el.style.setProperty('background-size','contain','important');el.style.setProperty('background-position','center','important');}
 }
}
$('#imSave').onclick=async()=>{
 const {db,user}=context();
 if(!db||!user){notify('❌ Vui lòng đăng nhập lại.');return;}
 if(!state.editor){await load();if(!state.editor)return;}
 if(!state.file||!state.img){notify('❌ Vui lòng chọn file ảnh mới trước khi lưu.');return;}
 const btn=$('#imSave'),target=state.target;
 btn.disabled=true;btn.textContent='Đang xử lý và tải lên…';
 try{
  const ratio=state.img.width/state.img.height;
  const raw=state.zoom===100&&Math.abs(state.ox)<.5&&Math.abs(state.oy)<.5&&state.mode==='contain'&&Math.abs(ratio-target[2])<.015;
  let body=state.file,description='Giữ nguyên ảnh gốc, không nén lại';
  if(!raw){
   const width=Math.min(target[0]==='logo'?2048:1440,state.img.width),height=Math.round(width/target[2]);
   const out=document.createElement('canvas');out.width=width;out.height=height;renderTo(out,width,height);
   const mime=target[0]==='logo'?'image/png':'image/webp';
   body=await new Promise(resolve=>out.toBlob(resolve,mime,.95));
   if(!body)throw Error('Không xuất được ảnh đã căn chỉnh.');
   description='Đã căn chỉnh và xuất ảnh '+width+' × '+height+' px'+(mime==='image/png'?' PNG không mất nét':' WebP 95%');
  }
  if(body.size>4194304)throw Error('Ảnh '+(body.size/1048576).toFixed(2)+' MB vượt giới hạn 4 MB. Hãy chọn file nhỏ hơn.');
  const extension=body.type==='image/png'?'png':body.type==='image/webp'?'webp':'jpg';
  const path='team/'+target[0]+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,9)+'.'+extension;
  const upload=await db.storage.from('team-portraits').upload(path,body,{contentType:body.type,cacheControl:'31536000',upsert:false});
  if(upload.error)throw upload.error;
  const record={slug:target[0],image_path:path,updated_at:new Date().toISOString()};
  const saved=await db.from('site_assets').upsert(record,{onConflict:'slug'});
  if(saved.error)throw saved.error;
  state.records[target[0]]=record;updateCurrent();updateOnSite(record);
  notify('✅ Đã lưu '+target[1]+' lên website.\n'+description+'. Mọi người sẽ thấy ảnh mới khi tải lại trang.');
 }catch(err){notify('❌ Chưa lưu được: '+(err.message||String(err)));}
 finally{btn.disabled=false;btn.textContent='💾 Lưu ảnh lên website';}
};
redraw();
})();