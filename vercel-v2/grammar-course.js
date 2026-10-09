
;(()=>{
'use strict';
const D=window.TTHK,$=s=>document.querySelector(s);
const root=$('#lookup'),result=$('#result'),query=$('#query');
if(!D||!root||!result||!query||root.dataset.grammarCourse==='1')return;
root.dataset.grammarCourse='1';
const lessons=Array.isArray(D.grammarLessons)?D.grammarLessons:[];
const css=document.createElement('link');css.rel='stylesheet';css.href='/grammar-course.css?v=hskschool-20261009-v1';document.head.append(css);
const originalLookup=D.lookup;
const lookupBtns=[...root.querySelectorAll('[data-lookup]')];
for(const button of lookupBtns){
 if(['examples','hanzi'].includes(button.dataset.lookup)){button.remove();continue}
 if(button.dataset.lookup==='words')button.textContent='Từ vựng & Hán tự';
 else if(button.dataset.lookup==='grammar')button.textContent='Ngữ pháp HSK 1–2';
 else button.textContent='Kết hợp từ';
}
const existingBtns=[...root.querySelectorAll('[data-lookup]')];
const tabs=root.querySelector('.switch')||existingBtns[0]?.parentElement;
if(tabs)tabs.setAttribute('aria-label','Chọn nội dung tra cứu');
D.lookupType=['words','grammar'].includes(D.lookupType)?D.lookupType:(existingBtns.some(b=>b.dataset.lookup===D.lookupType)?D.lookupType:'words');
const state={level:'all',group:'all',limit:12,active:null,answered:[],done:new Set(),ready:false};
const allGroups=[...new Set(lessons.map(item=>item.group))];
const key=()=>{const user=D.profileContext?.().user;return 'tthk-grammar-progress-v1-'+(user?.id||'guest')};
function loadProgress(){
 try{const saved=JSON.parse(localStorage.getItem(key())||'[]');state.done=new Set((Array.isArray(saved)?saved:[]).filter(n=>Number.isInteger(n)))}catch(e){state.done=new Set()}
 state.ready=true;
}
function saveProgress(){try{localStorage.setItem(key(),JSON.stringify([...state.done]))}catch(e){}}
function normalize(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function node(tag,className,text){
 const el=document.createElement(tag);
 if(className)el.className=className;
 if(text!==undefined)el.textContent=String(text);
 return el;
}
function button(text,clazz,fn){
 const el=node('button',clazz,text);el.type='button';el.onclick=fn;return el;
}
function selectedLesson(){return lessons.find(x=>x.id===state.active)||null}
function levelCounts(){return {h1:lessons.filter(x=>x.level==='HSK 1').length,h2:lessons.filter(x=>x.level==='HSK 2').length}}
function renderHeader(){
 const head=node('div','gr-header');
 const top=node('div','gr-header-top');
 top.append(node('h2','gr-heading','🌿 Ngữ pháp HSK 1–2'));
 const progress=node('span','gr-progress','✓ '+lessons.filter(x=>state.done.has(x.id)).length+' / '+lessons.length+' bài đã làm đúng');
 top.append(progress);head.append(top);
 head.append(node('p','gr-subtitle','Học theo chủ điểm: công thức → cách dùng → tình huống → ví dụ → bài tập có giải thích.'));
 const filters=node('div','gr-filters');
 const levelSelect=node('select');
 levelSelect.setAttribute('aria-label','Lọc cấp độ ngữ pháp');
 for(const [value,label] of [['all','Tất cả cấp độ'],['HSK 1','HSK 1 — Nền tảng'],['HSK 2','HSK 2 — Mở rộng']]){
  const op=new Option(label,value);levelSelect.add(op);
 }
 levelSelect.value=state.level;
 levelSelect.onchange=()=>{state.level=levelSelect.value;state.limit=12;state.active=null;renderGrammar()};
 const groupSelect=node('select');
 groupSelect.setAttribute('aria-label','Lọc nhóm ngữ pháp');
 groupSelect.add(new Option('Tất cả chủ điểm','all'));
 for(const item of allGroups)groupSelect.add(new Option(item,item));
 groupSelect.value=state.group;
 groupSelect.onchange=()=>{state.group=groupSelect.value;state.limit=12;state.active=null;renderGrammar()};
 filters.append(levelSelect,groupSelect,node('span','gr-hint','Chọn một bài để xem hướng dẫn và làm bài tập'));
 head.append(filters);
 return head;
}
function filteredLessons(){
 const q=normalize(query.value);
 return lessons.filter(x=>
  (state.level==='all'||x.level===state.level)&&
  (state.group==='all'||x.group===state.group)&&
  (!q||[x.title,x.pattern,x.explanation,x.group,x.example,x.pinyin,x.vi,x.realWorld,x.note].some(y=>normalize(y).includes(q)))
 );
}
function openLesson(id){
 state.active=id;
 renderGrammar();
 const main=root.getBoundingClientRect();
 if(main.top<-50)root.scrollIntoView({behavior:'smooth',block:'start'});
}
function renderList(){
 const home=node('div','grammar-home');
 home.append(renderHeader());
 const filtered=filteredLessons();
 if(!filtered.length){home.append(node('div','gr-empty','Không tìm thấy chủ điểm phù hợp. Thử đổi cấp độ hoặc từ khóa nhé.'));return home}
 const list=node('div','gr-list');
 for(const lesson of filtered.slice(0,state.limit)){
  const card=node('button','gr-card');card.type='button';
  card.dataset.done=String(state.done.has(lesson.id));
  card.setAttribute('aria-label','Mở bài '+lesson.title);
  const no=node('span','gr-number',state.done.has(lesson.id)?'✓':String(lesson.id).padStart(2,'0'));
  const body=node('span','gr-card-text');
  body.append(node('span','gr-card-meta',lesson.level+' · '+lesson.group));
  body.append(node('strong','gr-card-title',lesson.title));
  body.append(node('span','gr-card-desc',lesson.pattern));
  card.append(no,body,node('span','gr-card-next','›'));
  card.onclick=()=>openLesson(lesson.id);
  list.append(card);
 }
 home.append(list);
 if(filtered.length>state.limit){
  const more=button('Xem thêm '+Math.min(12,filtered.length-state.limit)+' bài ↓','gr-loadmore',()=>{state.limit+=12;renderGrammar()});
  home.append(more);
 }
 const visible=node('div','gr-subtitle','Đang hiển thị '+Math.min(state.limit,filtered.length)+' / '+filtered.length+' chủ điểm. Có thể chọn cấp độ, nhóm hoặc tìm theo chữ Hán, Pinyin và tiếng Việt.');
 home.append(visible);
 return home;
}
function sound(sentence){
 try{if(typeof D.speak==='function'){D.speak(sentence);return;}
  const u=new SpeechSynthesisUtterance(sentence);u.lang='zh-CN';u.rate=.83;
  speechSynthesis.cancel();speechSynthesis.speak(u);
 }catch(e){console.warn('Speech playback unavailable',e)}
}
function renderLesson(){
 const lesson=selectedLesson();
 if(!lesson){state.active=null;return renderList()}
 const page=node('div','grammar-lesson');
 const nav=node('div','gr-lesson-top');
 nav.append(button('← Danh sách ngữ pháp','gr-back',()=>{state.active=null;renderGrammar()}));
 const position=lessons.findIndex(x=>x.id===lesson.id);
 nav.append(node('span','gr-pager',lesson.level+' · Bài '+(position+1)+' / '+lessons.length));
 page.append(nav);
 const layout=node('div','gr-lesson-layout');
 const info=node('article','gr-paper');
 info.append(node('div','gr-level',lesson.level+' / '+lesson.group));
 info.append(node('h2','gr-title',lesson.title));
 const formula=node('div','gr-formula');formula.append(node('div','gr-level','CẤU TRÚC'));
 formula.append(node('code','',lesson.pattern));info.append(formula);
 info.append(node('h3','gr-subhead','Cách dùng'));
 info.append(node('p','gr-body',lesson.explanation));
 info.append(node('h3','gr-subhead','Tình huống thực tế'));
 info.append(node('p','gr-body',lesson.realWorld));
 const tip=node('div','gr-tip');
 tip.append(node('strong','', '💡 Lưu ý: '),document.createTextNode(lesson.note));
 info.append(tip);
 const sample=node('div','gr-example');
 sample.append(node('div','gr-level','VÍ DỤ MẪU'));
 sample.append(node('div','gr-example-cn',lesson.example));
 sample.append(node('div','gr-example-py',lesson.pinyin));
 sample.append(node('div','gr-example-vi',lesson.vi));
 sample.append(button('🔊 Nghe câu ví dụ','gr-speak',()=>sound(lesson.example)));
 info.append(sample);
 layout.append(info);
 const practice=node('article','gr-paper');
 practice.append(node('div','gr-level','LUYỆN TẬP · CHỌN ĐÁP ÁN'));
 practice.append(node('h2','gr-title','Thử áp dụng ngay'));
 practice.append(node('p','gr-body','Dựa vào cấu trúc và ví dụ vừa học, chọn một đáp án đúng để hoàn thành câu.'));
 practice.append(node('div','gr-question',lesson.exercise.prompt));
 const options=node('div','gr-options');
 const feedback=node('div','gr-feedback','Chọn câu trả lời để được hướng dẫn từng bước.');feedback.setAttribute('aria-live','polite');
 const allButtons=[];
 for(let i=0;i<lesson.exercise.choices.length;i++){
  const b=node('button','gr-option');b.type='button';
  b.append(node('span','gr-opt-index',String.fromCharCode(65+i)),node('span','',lesson.exercise.choices[i]));
  b.onclick=()=>{
   if(state.done.has(lesson.id)&&feedback.dataset.result==='correct')return;
   if(i===lesson.exercise.correct){
    feedback.dataset.result='correct';
    feedback.textContent='✓ Chính xác! '+lesson.exercise.why;
    state.done.add(lesson.id);saveProgress();for(const el of allButtons)el.disabled=true;b.dataset.status='correct';
   }else{
    b.disabled=true;b.dataset.status='wrong';feedback.dataset.result='wrong';
    feedback.textContent='Chưa đúng. '+lesson.exercise.why+' Hãy thử chọn đáp án khác.';
   }
  };
  allButtons.push(b);options.append(b);
 }
 practice.append(options,feedback);
 const tools=node('div','gr-lesson-bottom');
 tools.append(button('↺ Làm lại bài tập','gr-action secondary',()=>{state.done.delete(lesson.id);saveProgress();renderGrammar()}));
 const next=lessons[position+1];
 if(next)tools.append(button('Bài tiếp theo →','gr-action',()=>openLesson(next.id)));
 else tools.append(button('✓ Về danh sách','gr-action',()=>{state.active=null;renderGrammar()}));
 practice.append(tools);
 if(state.done.has(lesson.id)){
  const flag=node('p','gr-body','✓ Bạn đã chọn đúng bài này. Có thể làm lại để tự kiểm tra.');flag.style.marginTop='16px';practice.append(flag);
 }
 layout.append(practice);
 page.append(layout);
 return page;
}
function renderGrammar(){
 root.classList.add('lookup-grammar-active');
 result.replaceChildren();
 const content=state.active?renderLesson():renderList();
 result.append(content);
}
function updateType(){
 const ty=D.lookupType;
 root.classList.toggle('lookup-grammar-active',ty==='grammar');
 for(const btn of existingBtns){
  const on=btn.dataset.lookup===ty;
  btn.classList.toggle('on',on);
  btn.setAttribute('aria-pressed',String(on));
 }
 query.placeholder=ty==='grammar'?'Tìm ngữ pháp (是, 比, thời gian, câu hỏi...)':'Nhập chữ Hán, Pinyin, nghĩa Việt hoặc Anh';
}
D.lookup=function(){
 updateType();
 if(D.lookupType==='grammar'){renderGrammar();return}
 originalLookup.call(D);
 if(D.lookupType==='words'){
  // Hanzi stroke-order practice is already accessible from the word cards.
  D.bindCards?.(result);
 }
};
for(const btn of existingBtns){
 btn.onclick=()=>{
  const isChange=D.lookupType!==btn.dataset.lookup;
  D.lookupType=btn.dataset.lookup;
  if(isChange){query.value='';state.active=null;state.limit=12}
  D.lookup();
 };
}
query.oninput=()=>{
 if(D.lookupType==='grammar'){state.active=null;state.limit=12}
 D.lookup();
};
if(D.lookupType==='hanzi'||D.lookupType==='examples')D.lookupType='words';
loadProgress();
const userView=new MutationObserver(()=>{
 if($('#site')?.hidden)return;
 const user=D.profileContext?.().user;
 const ref=user?.id||'guest';
 if(userView.lastId!==ref){userView.lastId=ref;loadProgress();if(D.lookupType==='grammar')renderGrammar()}
});
const site=$('#site');if(site)userView.observe(site,{attributes:true,attributeFilter:['hidden']});
const originalPage=D.page;
if(typeof originalPage==='function'){
 D.page=function(name){
  const result=originalPage.apply(this,arguments);
  if(name==='lookup')D.lookup();
  return result;
 };
}
D.lookup();
})();
