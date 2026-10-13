/* HSK 2.0 (classic) full-length simulation; independently authored, not an official past paper. */
;(()=>{
 'use strict';
 const D=window.TTHK,bank=window.TTHK_HSK20_BANK;
 const start=document.getElementById('startExam'),level=document.getElementById('examLevel'),paperId=document.getElementById('examNum'),body=document.getElementById('examBody');
 if(!D||!bank||!start||!body)return;
 const CONFIG={
  1:{total:40,reported:40,working:35,listening:18,reading:17,sizes:[5,5,5,5,5,5,5,5]},
  2:{total:60,reported:55,working:50,listening:28,reading:22,sizes:[10,10,10,5,5,5,5,10]}
 };
 const kinds=['L1','L2','L3','L4','R1','R2','R3','R4'];
 const help={
 L1:'Nghe câu nói rồi so với hình minh họa. Chọn đúng hoặc sai.',
 L2:'Nghe và chọn hình phù hợp nhất.',
 L3:'Nghe hội thoại ngắn, chọn hình tương ứng.',
 L4:'Nghe hội thoại và câu hỏi, chọn câu trả lời đúng.',
 R1:'Quan sát hình và đọc câu. Chọn đúng hoặc sai.',
 R2:'Đọc từ tiếng Trung và chọn hình tương ứng.',
 R3:'Đọc câu hỏi và chọn câu trả lời phù hợp nhất.',
 R4:'Đọc câu và chọn từ thích hợp điền vào chỗ trống.'
 };
 let state=null,tick=null,voiceCounter=0,examOverlay=null,dialog=null,papersPanel=null,selectedLevel=1;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function shuffle(src,seed){
  const arr=[...src];let n=seed>>>0;
  for(let i=arr.length-1;i>0;i--){n=(Math.imul(1664525,n)+1013904223)>>>0;const j=n%(i+1);[arr[i],arr[j]]=[arr[j],arr[i]]}
  return arr;
 }
 function createPaper(l,series){
  const conf=CONFIG[l],seed=l*10393+series*1337;
  const blocks=kinds.map((kind,i)=>({
   kind,section:i<4?0:1,part:(i%4)+1,label:(i<4?'听力 · Nghe':'阅读 · Đọc')+' — Phần '+((i%4)+1),
   items:shuffle((l===1&&window.TTHK_HSK20_BANK1?.[kind])||bank[kind],seed+73*i).slice(0,conf.sizes[i]).map((v,j)=>({...v,id:kind+'-'+j}))
  }));
  const items=blocks.flatMap(x=>x.items.map(v=>({...v,section:x.section,part:x.part,block:x.kind,number:0})));
  items.forEach((x,i)=>x.number=i+1);
  if(items.length!==conf.total)throw Error('Số câu không đúng cấu trúc HSK 2.0');
  return {blocks,items};
 }
 function clock(n){n=Math.max(0,Math.ceil(n));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
 function timerSecs(){return state?Math.max(0,Math.ceil((state.deadline-Date.now())/1000)):0}
 function stopVoice(){
  voiceCounter++;
  try{window.speechSynthesis?.cancel()}catch(e){}
 }
 function speak(audio){
  if(!state||!('speechSynthesis' in window))return;
  const q=state.items[state.index];
  const count=state.listenCount[q.number]||0;
  if(count>=2)return;
  state.listenCount[q.number]=count+1;
  const token=++voiceCounter;
  try{
   window.speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance(audio.replaceAll('男：','。').replaceAll('女：','。').replaceAll('问：','。'));
   u.lang='zh-CN';u.rate=0.82;u.pitch=1;
   const voices=window.speechSynthesis.getVoices().filter(x=>(x.lang||'').toLowerCase().replace('_','-').startsWith('zh'));
   if(voices.length)u.voice=voices.find(x=>x.lang.toLowerCase().includes('cn'))||voices[0];
   u.onerror=()=>{if(token===voiceCounter)showMessage('Thiết bị không phát được giọng đọc tiếng Trung. Hãy kiểm tra cài đặt giọng đọc.');};
   window.speechSynthesis.speak(u);
  }catch(e){showMessage('Không phát được âm thanh trên thiết bị này.')}
  const b=(examOverlay||body).querySelector('#hsk20Listen');if(b){b.textContent='🔊 Nghe tiếng Trung ('+state.listenCount[q.number]+'/2)';b.disabled=state.listenCount[q.number]>=2;}
 }
 function showMessage(v){const e=(examOverlay||body).querySelector('#hsk20Message');if(e)e.textContent=v}

 const PAPER_COUNT=6;
 function paperTitle(l,n){return 'HSK '+l+' · Đề '+String(n).padStart(2,'0')}
 function closeDialog(){if(dialog){dialog.remove();dialog=null}}
 function openDialog(title,description,confirmLabel,action,danger){
  closeDialog();
  dialog=document.createElement('div');dialog.className='hsk20-dialog-layer';
  dialog.innerHTML='<section class="hsk20-dialog" role="dialog" aria-modal="true" aria-labelledby="hsk20DialogTitle">'+
   '<span class="hsk20-dialog-icon" aria-hidden="true">▧</span><h2 id="hsk20DialogTitle">'+esc(title)+'</h2>'+
   '<p>'+esc(description)+'</p><div class="hsk20-dialog-actions">'+
   '<button type="button" class="hsk20-action secondary" data-hsk-cancel>Quay lại</button>'+
   '<button type="button" class="hsk20-action '+(danger?'danger':'')+'" data-hsk-yes>'+esc(confirmLabel)+'</button></div></section>';
  (examOverlay||document.body).appendChild(dialog);
  dialog.querySelector('[data-hsk-cancel]').onclick=closeDialog;
  dialog.querySelector('[data-hsk-yes]').onclick=()=>{closeDialog();action()};
  dialog.querySelector('[data-hsk-cancel]').focus();
 }
 function paperCard(l,n){
  const conf=CONFIG[l];
  return '<button type="button" class="hsk20-paper-card" data-hsk-paper="'+n+'" aria-label="Chọn '+paperTitle(l,n)+'">'+
   '<span class="hsk20-paper-art" aria-hidden="true"><span class="hsk20-paper-fold"></span>'+
   '<span class="hsk20-paper-rule r1"></span><span class="hsk20-paper-rule r2"></span><span class="hsk20-paper-rule r3"></span>'+
   '<span class="hsk20-paper-check c1">✓</span><span class="hsk20-paper-check c2">✓</span><span class="hsk20-paper-check c3">✓</span>'+
   '<span class="hsk20-paper-number">'+String(n).padStart(2,'0')+'</span></span>'+
   '<span class="hsk20-paper-title">HSK '+l+'</span><strong>Đề số '+String(n).padStart(2,'0')+'</strong>'+
   '<small>'+conf.total+' câu · '+conf.reported+' phút</small><span class="hsk20-paper-select">Chọn đề →</span></button>';
 }
 function renderPaperShelf(l){
  selectedLevel=Number(l)===2?2:1;
  if(level)level.value=String(selectedLevel);
  if(!papersPanel)return;
  papersPanel.innerHTML='<div class="hsk20-library-head"><div><small>▦ BỘ ĐỀ PIXEL</small>'+
   '<h3>Chọn tờ giấy kiểm tra</h3><p>Chọn một đề để luyện thi HSK 2.0 theo từng phần Nghe – Đọc.</p></div>'+
   '<div class="hsk20-library-tabs"><button type="button" data-hsk-level="1" aria-pressed="'+(selectedLevel===1)+'">HSK 1</button>'+
   '<button type="button" data-hsk-level="2" aria-pressed="'+(selectedLevel===2)+'">HSK 2</button></div></div>'+
   '<div class="hsk20-paper-grid">'+Array.from({length:PAPER_COUNT},(_,i)=>paperCard(selectedLevel,i+1)).join('')+'</div>'+
   '<p class="hsk20-library-note">Các số đề là phiên bản luyện tập được trộn từ ngân hàng câu hỏi chung; không phải 6 đề thi chính thức độc lập.</p>';
  papersPanel.querySelectorAll('[data-hsk-level]').forEach(x=>x.onclick=()=>renderPaperShelf(Number(x.dataset.hskLevel)));
  papersPanel.querySelectorAll('[data-hsk-paper]').forEach(x=>x.onclick=()=>confirmPaper(selectedLevel,Number(x.dataset.hskPaper)));
 }
 function setupBanner(){
  if(document.getElementById('hsk20Intro'))return;
  const intro=document.createElement('div');intro.id='hsk20Intro';intro.className='hsk20-intro';
  intro.innerHTML='<strong>📝 Thi thử HSK 2.0 · Hệ 6 cấp truyền thống</strong>'+
   '<p>Chọn đề pixel, xác nhận bắt đầu, làm bài trên màn hình tràn viền. Nhấn Dừng thi bất cứ lúc nào để được chấm theo số câu đúng.</p>'+
   '<p><b>HSK 1:</b> 40 câu · 40 phút. <b>HSK 2:</b> 60 câu · 55 phút (bao gồm 5 phút thủ tục). Đây là đề luyện tập tự biên soạn.</p>';
  start.insertAdjacentElement('beforebegin',intro);
  papersPanel=document.createElement('section');papersPanel.id='hsk20PaperShelf';
  start.insertAdjacentElement('afterend',papersPanel);
  start.hidden=true;start.style.display='none';
  for(const control of [level,paperId]){
   if(!control)continue;
   const label=control.closest('label');if(label)label.hidden=true;
   control.hidden=true;control.style.display='none';
  }
  renderPaperShelf(Number(level?.value)||1);
 }
 function confirmPaper(l,series){
  if(!CONFIG[l]||series<1||series>PAPER_COUNT)return;
  const conf=CONFIG[l];
  openDialog('Bắt đầu '+paperTitle(l,series)+'?',
   conf.total+' câu · '+conf.reported+' phút. Chế độ thi sẽ phủ toàn bộ vùng hiển thị, có nút Dừng thi để quay lại và xem ngay số câu đúng.',
   'Bắt đầu thi',()=>begin(l,series),false);
 }
 function enterExamMode(){
  examOverlay=document.createElement('main');examOverlay.id='hsk20ExamOverlay';
  examOverlay.setAttribute('aria-label','Phòng thi HSK 2.0');examOverlay.tabIndex=-1;
  document.body.appendChild(examOverlay);document.body.classList.add('hsk20-exam-running');
  try{examOverlay.focus({preventScroll:true})}catch(e){}
  // Unsupported native fullscreen on iPhone still gets a fixed, edge-to-edge exam view.
  try{const p=examOverlay.requestFullscreen?.();if(p?.catch)p.catch(()=>{})}catch(e){}
 }
 function exitExamMode(){
  closeDialog();
  if(document.fullscreenElement&&document.exitFullscreen)try{const p=document.exitFullscreen();if(p?.catch)p.catch(()=>{})}catch(e){}
  if(examOverlay){examOverlay.remove();examOverlay=null}
  document.body.classList.remove('hsk20-exam-running');
 }
 function begin(l,series){
  if(state&&!state.completed)return;
  stopVoice();clearInterval(tick);
  l=Number(l)===2?2:1;series=Math.min(PAPER_COUNT,Math.max(1,Number(series)||1));
  selectedLevel=l;
  if(level)level.value=String(l);
  if(paperId)paperId.value=String(series);
  const built=createPaper(l,series),conf=CONFIG[l];
  state={level:l,series,conf,items:built.items,blocks:built.blocks,answers:{},flags:{},
   listenCount:{},index:0,section:0,started:Date.now(),deadline:Date.now()+conf.listening*60000,completed:false};
  enterExamMode();render();tick=setInterval(tock,900);
 }
 function confirmStop(){
  if(!state||state.completed)return;
  const done=state.items.filter(q=>state.answers[q.number]!==undefined);
  const correct=done.filter(q=>state.answers[q.number]===q.answer).length;
  openDialog('Dừng thi '+paperTitle(state.level,state.series)+'?',
   'Bạn đã trả lời '+done.length+'/'+state.items.length+' câu; đúng '+correct+' câu. Nếu dừng, kết quả hiện số câu đúng ngay và quay về màn hình chọn đề.',
   'Dừng thi và xem điểm',()=>finishExam('stopped'),true);
 }
 function changeSection(){
  if(!state||state.completed||state.section!==0)return;
  stopVoice();
  state.section=1;state.index=state.conf.sizes.slice(0,4).reduce((a,b)=>a+b,0);
  state.deadline=Date.now()+state.conf.reading*60000;
  showMessage('Đã chuyển sang phần Đọc. Không thể quay lại phần Nghe.');
  render();
 }
 function tock(){
  if(!state||state.completed){clearInterval(tick);return}
  const remain=timerSecs(),node=(examOverlay||body).querySelector('#hsk20Clock');
  if(node){node.textContent=clock(remain);node.classList.toggle('hsk20-warning',remain<=60);}
  if(remain===0){if(state.section===0)changeSection();else finishExam('time');}
 }
 function choiceText(q,i){return q.options[i]}
 function sectionItems(){return state.items.filter(q=>q.section===state.section)}
 function jumpTo(n){const q=state.items[n];if(!q||q.section!==state.section)return;stopVoice();state.index=n;render()}
 function advance(step){
  const next=state.index+step,first=state.items.findIndex(x=>x.section===state.section),last=first+sectionItems().length-1;
  if(next<first||next>last){if(step>0&&state.section===0)showMessage('Đã hết phần Nghe. Hãy chọn “Chuyển sang Đọc” khi sẵn sàng.');return;}
  jumpTo(next);
 }
 function questionMarkup(q){
  let heading='',display='',instruction=help[q.block];
  if(q.block==='L1'||q.block==='R1'){
   heading='Đối chiếu câu với hình';
   display='<div class="hsk20-picture" aria-label="Hình minh họa">'+esc(q.picture)+'</div>';
   if(q.section===1)display+='<div class="hsk20-hanzi">'+esc(q.zh)+'</div>';
  }else if(q.block==='L2'||q.block==='L3'||q.block==='L4'){
   heading='Nghe rồi chọn đáp án';
  }else if(q.block==='R2'){heading='Chọn hình đúng';display='<div class="hsk20-hanzi">'+esc(q.zh)+'</div>';}
  else if(q.block==='R3'){heading='Chọn câu trả lời';display='<div class="hsk20-hanzi">'+esc(q.zh)+'</div>';}
  else{heading='Chọn từ điền vào chỗ trống';display='<div class="hsk20-hanzi">'+esc(q.zh).replace('___','<span class="hsk20-blank">______</span>')+'</div>';}
  if(q.section===0)display+='<div class="hsk20-speak"><button type="button" id="hsk20Listen" class="hsk20-action">🔊 Nghe tiếng Trung ('+(state.listenCount[q.number]||0)+'/2)</button><small>Nhấn để phát câu/hội thoại. Tối đa 2 lượt phát, không hiện lời thoại trước khi nộp.</small></div>';
  const isPicture=['L2','L3','R2'].includes(q.block);
  return '<h3>'+esc(heading)+'</h3><p class="hsk20-help">'+esc(instruction)+'</p>'+display+
   '<div class="hsk20-choices '+(isPicture?'has-pictures':'')+'">'+q.options.map((op,i)=>'<button type="button" class="hsk20-choice '+(state.answers[q.number]===i?'selected':'')+'" data-hsk-answer="'+i+'" aria-pressed="'+(state.answers[q.number]===i)+'"><span class="hsk20-letter">'+String.fromCharCode(65+i)+'</span><span>'+(isPicture?'<span class="hsk20-icon">'+esc(op)+'</span>':esc(op))+'</span></button>').join('')+'</div>';
 }
 function render(){
  if(!state||state.completed)return;
  const q=state.items[state.index],conf=state.conf,answered=Object.keys(state.answers).filter(n=>state.items[+n-1]?.section===state.section).length;
  const total=sectionItems().length;
  const ui='<div class="hsk20-app">'+
   '<div class="hsk20-head"><div><small>ĐỀ THI THỬ HSK '+state.level+' · SỐ '+String(state.series).padStart(2,'0')+' · 2.0</small><h2>'+(state.section===0?'听力 · Nghe hiểu':'阅读 · Đọc hiểu')+'</h2><span>'+state.conf.reported+' phút gồm 5 phút thủ tục · '+state.conf.total+' câu</span></div><div class="hsk20-time" id="hsk20Clock">'+clock(timerSecs())+'</div></div>'+
   '<div class="hsk20-stop-bar"><span>📝 '+paperTitle(state.level,state.series)+' · Câu '+q.number+'/'+conf.total+'</span><button type="button" class="hsk20-action danger" id="hsk20Stop">⏹ Dừng thi</button></div>'+ 
   '<div class="hsk20-main"><div class="hsk20-question">'+
    '<div class="hsk20-qhead"><span>Câu '+q.number+' / '+conf.total+'</span><strong>'+esc((state.section===0?'听力':'阅读')+' — Phần '+q.part)+'</strong></div>'+
    questionMarkup(q)+
    '<div class="hsk20-foot"><button type="button" class="hsk20-action secondary" id="hsk20Prev">← Câu trước</button><button type="button" class="hsk20-action secondary" id="hsk20Mark">'+(state.flags[q.number]?'★ Đang đánh dấu':'☆ Đánh dấu')+'</button><button type="button" class="hsk20-action" id="hsk20Next">Câu tiếp →</button></div>'+
    '<div class="hsk20-message" id="hsk20Message" aria-live="polite"></div>'+
   '</div><aside class="hsk20-aside"><h3>Phiếu trả lời</h3><p>'+answered+'/'+total+' câu trong phần này</p><div class="hsk20-progress"><span style="width:'+Math.round(100*answered/total)+'%"></span></div>'+
    '<div class="hsk20-blocks">'+state.blocks.filter(b=>b.section===state.section).map(b=>'<div class="hsk20-part"><b>Phần '+b.part+'</b><div class="hsk20-numbers">'+b.items.map(i=>{const num=state.items.find(x=>x.id===i.id&&x.block===b.kind)?.number;return '<button type="button" data-hsk-jump="'+(num-1)+'" class="'+(num===q.number?'current ':'')+(state.answers[num]!==undefined?'done ':'')+(state.flags[num]?'marked ':'')+'">'+num+'</button>'}).join('')+'</div></div>').join('')+'</div>'+
    '<button type="button" id="hsk20Finish" class="hsk20-action hsk20-submit">'+(state.section===0?'Chuyển sang Đọc →':'⏹ Dừng thi và chấm điểm')+'</button>'+
    '<small class="hsk20-note">Xanh: đã trả lời · Sao: cần xem lại · Phần Nghe khóa khi chuyển sang Đọc.</small>'+
   '</aside></div></div>';
  const root=examOverlay||body;root.innerHTML=ui;
  root.querySelectorAll('[data-hsk-answer]').forEach(b=>b.onclick=()=>{state.answers[q.number]=Number(b.dataset.hskAnswer);render()});
  root.querySelectorAll('[data-hsk-jump]').forEach(b=>b.onclick=()=>jumpTo(Number(b.dataset.hskJump)));
  root.querySelector('#hsk20Prev').onclick=()=>advance(-1);
  root.querySelector('#hsk20Next').onclick=()=>advance(1);
  root.querySelector('#hsk20Mark').onclick=()=>{state.flags[q.number]=!state.flags[q.number];render()};
  root.querySelector('#hsk20Finish').onclick=()=>{
   const unfilled=sectionItems().filter(x=>state.answers[x.number]===undefined).length;
   if(unfilled&&!confirm('Còn '+unfilled+' câu chưa trả lời. '+(state.section===0?'Chuyển sang phần Đọc và không thể quay lại?':'Bạn chắc chắn muốn nộp bài?')))return;
   if(state.section===0)changeSection();else confirmStop();
  };
  root.querySelector('#hsk20Stop').onclick=confirmStop;
  if(q.section===0){
   const b=root.querySelector('#hsk20Listen');b.disabled=(state.listenCount[q.number]||0)>=2;
   b.onclick=()=>speak(q.audio||q.zh);
  }
 }
 function scored(){
  const groups=[0,1].map(sec=>{
   const items=state.items.filter(x=>x.section===sec);
   const correct=items.filter(x=>state.answers[x.number]===x.answer).length;
   return {correct,total:items.length,points:Math.round(correct/items.length*100)};
  });
  return {groups,score:groups[0].points+groups[1].points,correct:groups[0].correct+groups[1].correct,total:state.items.length};
 }
 async function save(result){
  const profile=D.profileContext?.()||{},db=profile.db,user=profile.user;
  if(!db||!user){updateSave('Đăng nhập để lưu điểm vào bảng xếp hạng.');return}
  try{
   const nick=String(user.user_metadata?.full_name||user.email?.split('@')[0]||'Học viên').slice(0,40);
   const res=await db.from('hsk_scores').insert({user_id:user.id,nickname:nick,level:state.level,score:Math.round(result.correct/state.items.length*100),correct:result.correct,total:state.items.length});
   updateSave(res.error?'Không thể lưu xếp hạng: '+res.error.message:'Đã lưu điểm bài thi lên bảng xếp hạng HSK.');
  }catch(e){updateSave('Lỗi khi lưu điểm: '+String(e.message||e))}
 }
 function updateSave(msg){const el=document.getElementById('hsk20Saved');if(el)el.textContent=msg}

 function finishExam(reason){
  if(!state||state.completed)return;
  state.completed=true;state.reason=reason;stopVoice();clearInterval(tick);tick=null;
  const result=scored(),answered=state.items.filter(q=>state.answers[q.number]!==undefined).length;
  const accuracy=answered?Math.round(result.correct/answered*1000)/10:0;
  const finished=reason==='stopped'?'Đã dừng thi':reason==='time'?'Hết giờ làm bài':'Hoàn thành bài thi';
  exitExamMode();
  renderPaperShelf(state.level);
  body.innerHTML='<div class="hsk20-app hsk20-results"><h2>📋 '+finished+' · '+paperTitle(state.level,state.series)+'</h2>'+
   '<p class="hsk20-label">Điểm chính được tính theo số câu trả lời đúng khi dừng, không phải điểm chứng chỉ HSK chính thức.</p>'+
   '<div class="hsk20-correct-count"><strong>'+result.correct+'</strong><span>câu đúng / '+result.total+' câu</span></div>'+
   '<div class="hsk20-stop-stats"><div><strong>'+answered+'/'+result.total+'</strong><span>Số câu đã làm</span></div>'+
   '<div><strong>'+result.correct+'</strong><span>Số câu đúng</span></div>'+
   '<div><strong>'+accuracy+'%</strong><span>Tỷ lệ đúng trên câu đã làm</span></div></div>'+
   '<div class="hsk20-scoredetail"><div>听力 · Nghe<b>'+result.groups[0].correct+'/'+result.groups[0].total+' câu</b><small>'+result.groups[0].points+'/100 quy đổi</small></div>'+
   '<div>阅读 · Đọc<b>'+result.groups[1].correct+'/'+result.groups[1].total+' câu</b><small>'+result.groups[1].points+'/100 quy đổi</small></div></div>'+
   '<p class="hsk20-label">Điểm HSK quy đổi tham khảo: '+result.score+'/200, tính cả những câu chưa làm là chưa đúng.</p>'+
   '<p id="hsk20Saved" class="hsk20-label">Đang lưu kết quả...</p>'+
   '<div class="hsk20-result-actions"><button type="button" class="hsk20-action" id="hsk20Review">Xem đáp án và lời giải</button>'+
   '<button type="button" class="hsk20-action secondary" id="hsk20Try">← Chọn tờ đề khác</button></div>'+
   '<div id="hsk20Reviews"></div></div>';
  body.querySelector('#hsk20Review').onclick=review;
  body.querySelector('#hsk20Try').onclick=()=>{state=null;body.innerHTML='';renderPaperShelf(selectedLevel);papersPanel?.scrollIntoView?.({block:'nearest',behavior:'smooth'})};
  save(result);
 }
 function review(){
  if(!state||!state.completed)return;
  const slot=document.getElementById('hsk20Reviews');
  slot.innerHTML='<h3>Đáp án chi tiết theo từng phần</h3>'+state.items.map(q=>{
   const got=state.answers[q.number],correct=got===q.answer,unanswered=got===undefined;
   return '<details class="hsk20-review '+(correct?'right':'wrong')+'"><summary>Câu '+q.number+' · '+(q.section===0?'Nghe':'Đọc')+' phần '+q.part+' — '+(correct?'✓ Đúng':unanswered?'⚪ Chưa chọn':'✗ Sai')+'</summary>'+
    '<div class="hsk20-review-body">'+(q.audio?'<p><b>🔊 Lời thoại:</b> '+esc(q.audio)+'</p>':'')+(q.zh?'<p><b>Câu:</b> '+esc(q.zh)+'</p>':'')+
    '<p><b>Đáp án:</b> '+esc(choiceText(q,q.answer))+'</p>'+
    '<p><b>Bạn chọn:</b> '+(unanswered?'Chưa trả lời':esc(choiceText(q,got)))+'</p>'+
    '<p><b>Giải thích:</b> '+esc(q.note)+'</p></div></details>';
  }).join('');
 }
 setupBanner();
 start.onclick=()=>confirmPaper(Number(level?.value)||selectedLevel,Number(paperId?.value)||1);
 window.addEventListener('keydown',event=>{if(event.key==='Escape'&&state&&!state.completed){event.preventDefault();if(dialog)closeDialog();else confirmStop()}});
 window.addEventListener('beforeunload',event=>{if(state&&!state.completed){event.preventDefault();event.returnValue=''}});
 D.hsk20={start:()=>confirmPaper(selectedLevel,1),getStatus:()=>state?{level:state.level,series:state.series,section:state.section,completed:state.completed,question:state.index+1}:null};
})();