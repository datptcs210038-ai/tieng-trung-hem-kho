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
 let state=null,tick=null,voiceCounter=0;
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
  const b=document.getElementById('hsk20Listen');if(b){b.textContent='🔊 Nghe tiếng Trung ('+state.listenCount[q.number]+'/2)';b.disabled=state.listenCount[q.number]>=2;}
 }
 function showMessage(v){const e=document.getElementById('hsk20Message');if(e)e.textContent=v}
 function setupBanner(){
  if(document.getElementById('hsk20Intro'))return;
  const n=document.createElement('div');n.id='hsk20Intro';n.className='hsk20-intro';
  n.innerHTML='<strong>📝 Thi thử HSK 2.0 · Hệ 6 cấp truyền thống</strong>'+
  '<p>Đề luyện tập tự biên soạn mô phỏng bố cục bài thi: 8 phần Nghe – Đọc, đồng hồ, phiếu trả lời, kết quả 200 điểm và xem lại câu sai. Không phải đề chính thức.</p>'+
  '<p><b>HSK 1:</b> 40 câu · khoảng 40 phút (35 phút làm bài) &nbsp; <b>HSK 2:</b> 60 câu · khoảng 55 phút (50 phút làm bài). Mỗi tổng thời gian có 5 phút điền thông tin.</p>'+
  '<small>Phần Nghe sử dụng giọng đọc tiếng Trung có sẵn trên thiết bị; hình minh họa bằng biểu tượng thay cho tranh in của đề thật.</small>';
  start.insertAdjacentElement('beforebegin',n);
  start.textContent='▶ Bắt đầu thi thử HSK 2.0';
 }
 function begin(){
  stopVoice();clearInterval(tick);
  const l=Number(level?.value)===2?2:1,series=Math.max(1,Number(paperId?.value)||1);
  const built=createPaper(l,series),conf=CONFIG[l];
  state={
   level:l,series,conf,items:built.items,blocks:built.blocks,answers:{},flags:{},
   listenCount:{},index:0,section:0,started:Date.now(),deadline:Date.now()+conf.listening*60000,
   completed:false,submitted:false,saveStatus:'',needsRender:true
  };
  render();tick=setInterval(tock,900);
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
  const remain=timerSecs(),node=document.getElementById('hsk20Clock');
  if(node){node.textContent=clock(remain);node.classList.toggle('hsk20-warning',remain<=60);}
  if(remain===0){if(state.section===0)changeSection();else submit();}
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
   '<div class="hsk20-head"><div><small>ĐỀ THI THỬ HSK '+state.level+' · 2.0</small><h2>'+(state.section===0?'听力 · Nghe hiểu':'阅读 · Đọc hiểu')+'</h2><span>'+state.conf.reported+' phút gồm 5 phút thủ tục · '+state.conf.total+' câu</span></div><div class="hsk20-time" id="hsk20Clock">'+clock(timerSecs())+'</div></div>'+
   '<div class="hsk20-main"><div class="hsk20-question">'+
    '<div class="hsk20-qhead"><span>Câu '+q.number+' / '+conf.total+'</span><strong>'+esc((state.section===0?'听力':'阅读')+' — Phần '+q.part)+'</strong></div>'+
    questionMarkup(q)+
    '<div class="hsk20-foot"><button type="button" class="hsk20-action secondary" id="hsk20Prev">← Câu trước</button><button type="button" class="hsk20-action secondary" id="hsk20Mark">'+(state.flags[q.number]?'★ Đang đánh dấu':'☆ Đánh dấu')+'</button><button type="button" class="hsk20-action" id="hsk20Next">Câu tiếp →</button></div>'+
    '<div class="hsk20-message" id="hsk20Message" aria-live="polite"></div>'+
   '</div><aside class="hsk20-aside"><h3>Phiếu trả lời</h3><p>'+answered+'/'+total+' câu trong phần này</p><div class="hsk20-progress"><span style="width:'+Math.round(100*answered/total)+'%"></span></div>'+
    '<div class="hsk20-blocks">'+state.blocks.filter(b=>b.section===state.section).map(b=>'<div class="hsk20-part"><b>Phần '+b.part+'</b><div class="hsk20-numbers">'+b.items.map(i=>{const num=state.items.find(x=>x.id===i.id&&x.block===b.kind)?.number;return '<button type="button" data-hsk-jump="'+(num-1)+'" class="'+(num===q.number?'current ':'')+(state.answers[num]!==undefined?'done ':'')+(state.flags[num]?'marked ':'')+'">'+num+'</button>'}).join('')+'</div></div>').join('')+'</div>'+
    '<button type="button" id="hsk20Finish" class="hsk20-action hsk20-submit">'+(state.section===0?'Chuyển sang Đọc →':'Nộp bài thi ✓')+'</button>'+
    '<small class="hsk20-note">Xanh: đã trả lời · Sao: cần xem lại · Phần Nghe khóa khi chuyển sang Đọc.</small>'+
   '</aside></div></div>';
  body.innerHTML=ui;
  body.querySelectorAll('[data-hsk-answer]').forEach(b=>b.onclick=()=>{state.answers[q.number]=Number(b.dataset.hskAnswer);render()});
  body.querySelectorAll('[data-hsk-jump]').forEach(b=>b.onclick=()=>jumpTo(Number(b.dataset.hskJump)));
  body.querySelector('#hsk20Prev').onclick=()=>advance(-1);
  body.querySelector('#hsk20Next').onclick=()=>advance(1);
  body.querySelector('#hsk20Mark').onclick=()=>{state.flags[q.number]=!state.flags[q.number];render()};
  body.querySelector('#hsk20Finish').onclick=()=>{
   const unfilled=sectionItems().filter(x=>state.answers[x.number]===undefined).length;
   if(unfilled&&!confirm('Còn '+unfilled+' câu chưa trả lời. '+(state.section===0?'Chuyển sang phần Đọc và không thể quay lại?':'Bạn chắc chắn muốn nộp bài?')))return;
   if(state.section===0)changeSection();else submit();
  };
  if(q.section===0){
   const b=body.querySelector('#hsk20Listen');b.disabled=(state.listenCount[q.number]||0)>=2;
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
 function submit(){
  if(!state||state.completed)return;
  state.completed=true;stopVoice();clearInterval(tick);
  const res=scored(),pass=res.score>=120;
  body.innerHTML='<div class="hsk20-app hsk20-results"><h2>📋 Kết quả thi thử HSK '+state.level+' (2.0)</h2>'+
   '<p class="hsk20-label">Điểm tham khảo, không phải kết quả hay chứng chỉ thi chính thức.</p>'+
   '<div class="hsk20-score '+(pass?'pass':'fail')+'">'+res.score+'<small>/200</small></div><h3>'+(pass?'✅ Đạt ngưỡng luyện tập 120/200':'📖 Chưa đạt ngưỡng luyện tập 120/200')+'</h3>'+
   '<div class="hsk20-scoredetail"><div>听力 · Nghe <b>'+res.groups[0].points+'/100</b><small>'+res.groups[0].correct+'/'+res.groups[0].total+' câu</small></div><div>阅读 · Đọc <b>'+res.groups[1].points+'/100</b><small>'+res.groups[1].correct+'/'+res.groups[1].total+' câu</small></div></div>'+
   '<p>Đúng '+res.correct+'/'+res.total+' câu · Điểm mỗi kỹ năng quy đổi tuyến tính về thang 100; điểm thi thật có thể áp dụng quy trình chấm khác.</p>'+
   '<p id="hsk20Saved" class="hsk20-label">Đang lưu kết quả…</p>'+
   '<div class="hsk20-result-actions"><button class="hsk20-action" id="hsk20Review">Xem đáp án và lời giải</button><button class="hsk20-action secondary" id="hsk20Try">Làm đề khác ↻</button></div><div id="hsk20Reviews"></div></div>';
  document.getElementById('hsk20Review').onclick=review;
  document.getElementById('hsk20Try').onclick=begin;
  save(res);
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
 start.onclick=begin;
 D.hsk20={start:begin,getStatus:()=>state?{level:state.level,section:state.section,completed:state.completed,question:state.index+1}:null};
})();