/* Tiếng Trung Hem Khó — refreshed bilingual study UX, pixel imagery, authenticated editor tools. */
;(()=>{
'use strict';
const D=window.TTHK;if(!D)return;
const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MEMBER_KEYS=['thanh-dat','hong-diep','yen-vi','ngoc-giau','phuong-nghi'];
let contentRows={},teamRows={},editor=false,refreshing=false,pixelLoading=false,selectedMember=MEMBER_KEYS[0],editingWord='';
const palettes=[['#94c7b7','#2f7969'],['#a6cbd6','#396b8b'],['#b3cfac','#628555'],['#d7c7ab','#8a7658'],['#c9c3df','#786b9b']];
const pixelPaths={
home:['00111100','01100110','11000011','11111111','10011001','10011001','10011001','11111111'],
vocab:['11111111','10011001','10111101','10100101','10111101','10011001','10111101','11111111'],
lookup:['01111100','11000110','10000010','10000010','11000110','01111100','00011000','00001100'],
writing:['00001110','00011111','00111010','01110000','11100000','11000000','11111111','01111110'],
flash:['00111100','01100110','11000011','10011001','10111101','10011001','01100110','00111100'],
exams:['01111110','01000010','01111010','01000010','01111010','01000010','01111110','00111100'],
profile:['00111100','01111110','01111110','00111100','00011000','01111110','11000011','11111111'],
team:['11000011','11100111','01111110','00111100','01111110','11111111','10011001','10011001'],
clock:['00111100','01100110','11011011','11011111','11000011','01100110','00111100','00011000'],
sound:['00001000','00111000','11111000','11111011','11111011','00111000','00001000','00000000'],
logout:['00011100','00110000','01100000','11111111','01100000','00110000','00011100','00000000'],
facebook:['00111100','01111110','01111000','11111000','11111110','01111000','01111000','01111000'],
info:['00111100','01100110','01100110','00011100','00011000','00011000','00011000','00011000'],
study:['01111110','01000010','01011010','01011010','01000010','01011010','01000010','01111110']
};
function pixelIcon(k,size=18){
 const arr=pixelPaths[k]||pixelPaths.study;
 const rects=arr.map((row,y)=>[...row].map((v,x)=>v==='1'?'<rect x="'+x*2+'" y="'+y*2+'" width="2" height="2"/>':'').join('')).join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 16 16" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">'+rects+'</svg>';
}
// Every vocabulary item receives a stable unique pixel-card image URL.
// Existing real photos take precedence, and editors can provide a replacement HTTPS URL.
function pixelWordImage(w){
 const text=String(w.h||w).slice(0,5),label=String(w.m||D.vi?.[text]||'Tiếng Trung').slice(0,28);
 const sum=[...text].reduce((n,c)=>n+c.codePointAt(0),0),p=palettes[sum%palettes.length];
 const blocks=Array.from({length:9},(_,i)=>{
  const v=(sum*17+i*31)%23,xx=14+(i%3)*26,yy=18+Math.floor(i/3)*18;
  return '<rect x="'+xx+'" y="'+yy+'" width="'+(4+v%7)+'" height="'+(5+v%9)+'" fill="'+p[1]+'" opacity=".14"/>';
 }).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 160 120">'+
  '<rect width="160" height="120" rx="12" fill="#edf8f1"/><rect x="5" y="5" width="150" height="110" fill="#fdfef9" stroke="'+p[1]+'" stroke-width="2"/>'+
  blocks+'<rect x="12" y="13" width="34" height="4" fill="'+p[0]+'"/><rect x="12" y="20" width="20" height="4" fill="'+p[0]+'"/>'+
  '<text x="80" y="77" text-anchor="middle" font-family="Noto Sans SC,sans-serif" font-weight="800" font-size="'+(text.length>3?26:text.length>2?32:40)+'" fill="'+p[1]+'">'+escape(text)+'</text>'+
  '<rect x="18" y="89" width="124" height="2" fill="'+p[0]+'"/>'+
  '<text x="80" y="105" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#476b61">'+escape(label)+'</text></svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
D.pixelWordImage=pixelWordImage;
D.extraExamples=Object.assign(D.extraExamples||{}, {'宾馆':{zh:'这家宾馆离学校很近。',py:'Zhè jiā bīnguǎn lí xuéxiào hěn jìn.',vi:'Khách sạn này rất gần trường.'},'等':{zh:'请等我五分钟。',py:'Qǐng děng wǒ wǔ fēnzhōng.',vi:'Hãy đợi tôi năm phút.'},'过':{zh:'我去过北京。',py:'Wǒ qù guo Běijīng.',vi:'Tôi đã từng đến Bắc Kinh.'}});
D.wordUsage=Object.assign(D.wordUsage||{}, {'宾馆':{pattern:'住宾馆 / 一家宾馆',note:'宾馆 là khách sạn, thường dùng với 住 (ở).'},'等':{pattern:'等 + 人 / 时间',note:'Chờ ai đó hoặc chờ một khoảng thời gian.'},'过':{pattern:'动词 + 过',note:'Trợ từ chỉ trải nghiệm đã từng làm gì, như 去过。'}});
function applyImages(){
 if(!Array.isArray(D.words)||!D.words.length)return;
 for(const w of D.words){
  const custom=contentRows[w.h]?.image_url;
  if(custom&&/^https:\/\//i.test(custom)){D.photos[w.h]=custom;continue}
  if(!D.photos[w.h])D.photos[w.h]=pixelWordImage(w);
  const example=contentRows[w.h];
  if(example?.example_zh&&example?.example_pinyin&&example?.example_vi){
   D.exampleSentences=D.exampleSentences||{};
   D.exampleSentences[w.h]={zh:example.example_zh,py:example.example_pinyin,vi:example.example_vi};
  }
 }
 const status=$('#wordStatus');
 if(status)status.textContent=D.words.length+' từ Trung – Việt · mỗi từ có ảnh thẻ pixel hoặc ảnh minh họa đã chọn.';
}
const loadOriginal=D.loadWords;
D.loadWords=async(...args)=>{
 const r=await loadOriginal.apply(D,args);
 applyImages();
 refreshWordEditor();
 return r;
};
function fetchContext(){return D.profileContext?.()||{}}
async function loadServer(){
 const {db,user}=fetchContext();if(!db||!user)return;
 try{
  const [wc,tm,permission]=await Promise.all([
   db.from('word_content').select('hanzi,image_url,example_zh,example_pinyin,example_vi'),
   db.from('team_members').select('slug,full_name,position,biography,portrait_url,member_user_id'),
   db.from('site_editors').select('user_id').eq('user_id',user.id).maybeSingle()
  ]);
  if(!wc.error){contentRows=Object.fromEntries((wc.data||[]).map(x=>[x.hanzi,x]));}
  if(!tm.error){teamRows=Object.fromEntries((tm.data||[]).map(x=>[x.slug,x]));}
  editor=!!permission.data&&!permission.error;
  applyImages();if($('#wordGrid')&&D.words?.length)D.vocab();
  renderMembers();
  refreshMemberEditor();
  refreshWordEditor();
 }catch(e){console.warn('Vocabulary/editor content could not load',e)}
}
function escapedSearch(q,w){const v=q.trim().toLocaleLowerCase('vi');return !v||[w.h,w.m].some(x=>String(x||'').toLocaleLowerCase('vi').includes(v))}
function bilingualFilters(){
 const originalVocab=D.vocab;
 D.vocab=function(){
  // Neutralize romanized/English searches; retain the existing layout/levels/favorites.
  const input=$('#vocabQuery'),search=input?.value||'';
  if(input&&search){const matching=D.words.filter(w=>escapedSearch(search,w));const orig=D.words;D.words=matching;
   try{input.value='';return originalVocab.call(D)}finally{input.value=search;D.words=orig;}
  }
  return originalVocab.call(D);
 };
 const originalLookup=D.lookup;
 D.lookup=function(){
  const input=$('#query'),search=input?.value||'';
  if(input&&search){const words=D.words;D.words=words.filter(w=>escapedSearch(search,w));
   try{input.value='';return originalLookup.call(D)}finally{input.value=search;D.words=words;}
  }
  return originalLookup.call(D);
 };
}
function navigation(){
 const nav=$('.nav');
 const combined=nav?.querySelector('[data-page="vocab"]');
 if(combined){
  combined.dataset.navLabel='Học tiếng Trung';
  const caption=combined.querySelector('.pixel-nav-label');if(caption)caption.textContent='Học tiếng Trung';else combined.textContent='Học tiếng Trung';
 }
 const fast=nav?.querySelector('[data-page="flash"]');
 if(fast){const c=fast.querySelector('.pixel-nav-label');if(c)c.textContent='Học với Hành';else fast.textContent='Học với Hành';}
 for(const id of ['lookup','writing']){const b=nav?.querySelector('[data-page="'+id+'"]');if(b)b.hidden=true}
 for(const id of ['vocab','lookup','writing']){
  const page=document.getElementById(id);
  if(!page||page.querySelector('.tthk-study-tabs'))continue;
  const strip=document.createElement('nav');strip.className='tthk-study-tabs';strip.setAttribute('aria-label','Học tiếng Trung');
  strip.innerHTML=[['vocab','Từ vựng'],['lookup','Tra cứu'],['writing','Luyện viết']].map(([target,label])=>
   '<button type="button" data-study="'+target+'" '+(target===id?'aria-current="page"':'')+'>'+pixelIcon(target,16)+'<span>'+label+'</span></button>').join('');
  page.prepend(strip);
  strip.querySelectorAll('[data-study]').forEach(btn=>btn.onclick=()=>D.page(btn.dataset.study));
 }
 const flashHeading=$('#flash')?.querySelector('h1');if(flashHeading)flashHeading.textContent='Học với Hành';
 const quick=document.querySelector('.mobile-dock [data-quick-page="vocab"] .dock-icon');if(quick)quick.innerHTML=pixelIcon('vocab',20);
 const quickText=document.querySelector('.mobile-dock [data-quick-page="vocab"] span:last-child');if(quickText)quickText.textContent='Học tiếng Trung';
 const pageBefore=D.page;
 D.page=function(id){
  const result=pageBefore.call(D,id);
  if(['vocab','lookup','writing'].includes(id)){
   const b=nav?.querySelector('[data-page="vocab"]');
   nav?.querySelectorAll('button[data-page]').forEach(x=>{if(x===b)x.classList.add('on');else x.classList.remove('on')});
   $$('.mobile-dock [data-quick-page="vocab"]').forEach(x=>x.classList.add('active'));
  }
  return result;
 };
 // Always start a new session on the overview. Don't route there during password recovery.
 const site=$('#site');
 if(site){let wasHidden=!site.hidden;const mo=new MutationObserver(()=>{
  const visible=!site.hidden;
  if(visible&&!wasHidden&&!window.location.hash.includes('recovery'))D.page('intro');
  wasHidden=visible;
 });mo.observe(site,{attributes:true,attributeFilter:['hidden']});}
 // Floating focus timer is a Pomodoro Timer, separate from authentication actions.
 const quickSignout=$('#quickSignOut');if(quickSignout)quickSignout.remove();
 document.querySelectorAll('.timer-mini-head strong').forEach(x=>x.textContent='Pomodoro Timer');
 const floating=$('#timerFloatingChip');if(floating)floating.title='Mở Pomodoro Timer';
}
function convertSelects(){
 for(const el of $$('select')){
  if(el.dataset.tthkTabs||el.hidden||!el.options?.length||el.options.length>50)continue;
  if(el.closest('.hsk20-dialog-layer,#hsk20ExamOverlay'))continue;
  el.dataset.tthkTabs='1';
  const wrap=document.createElement('div');wrap.className='tthk-choice-strip';wrap.setAttribute('aria-label',el.getAttribute('aria-label')||'Chọn tùy chọn');
  const render=()=>{
   wrap.replaceChildren();
   [...el.options].forEach((o,i)=>{
    if(o.disabled)return;
    const b=document.createElement('button');b.type='button';b.textContent=o.textContent;
    b.className='tthk-choice-option';b.setAttribute('aria-pressed',String(el.selectedIndex===i));
    b.onclick=()=>{el.selectedIndex=i;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));render();};
    wrap.append(b);
   });
  };
  el.insertAdjacentElement('afterend',wrap);el.classList.add('tthk-original-select');render();
  el.addEventListener('change',render);
  const observer=new MutationObserver(render);observer.observe(el,{childList:true,subtree:true});
 }
}
function renderMembers(){
 const cards=$$('#team .member');
 if(!cards.length)return;
 MEMBER_KEYS.forEach((slug,i)=>{
  const card=cards[i],m=teamRows[slug];if(!card)return;
  if(m){const title=card.querySelector('h3'),text=card.querySelector('p');if(title)title.textContent=m.full_name;if(text)text.textContent=m.position;}
  let btn=card.querySelector('[data-member-detail]');
  if(!btn){btn=document.createElement('button');btn.type='button';btn.className='tthk-profile-link';btn.textContent='Xem hồ sơ thành viên →';btn.dataset.memberDetail=slug;card.append(btn)}
  btn.onclick=()=>showMember(slug);
 });
}
function memberSection(){
 if($('#teamDetail'))return;
 const section=document.createElement('section');section.id='teamDetail';section.className='page';
 section.innerHTML='<div class="tthk-member-panel"><button type="button" id="tthkMemberBack" class="btn soft">← Về trang chủ</button><div id="tthkMemberContent"></div></div>';
 ($('#profile')||$('#intro')).insertAdjacentElement('afterend',section);
 $('#tthkMemberBack').onclick=()=>D.page('intro');
}
function showMember(slug){
 memberSection();selectedMember=MEMBER_KEYS.includes(slug)?slug:MEMBER_KEYS[0];
 D.page('teamDetail');refreshMemberEditor();
}
function refreshMemberEditor(){
 const panel=$('#tthkMemberContent');if(!panel)return;
 const idx=MEMBER_KEYS.indexOf(selectedMember),fallback=D.team?.[idx]||['Thành viên','Dự án'];
 const m=teamRows[selectedMember]||{full_name:fallback[0],position:fallback[1],biography:'Tham gia xây dựng website học tiếng Trung cho người mới bắt đầu.',portrait_url:''};
 const src=m.portrait_url||$('#team .member:nth-child('+(idx+1)+') img')?.src||'';
 const {user}=fetchContext();const canEdit=editor||(m.member_user_id&&user?.id===m.member_user_id);
 panel.innerHTML='<h1>Hồ sơ thành viên</h1><div class="tthk-member-card"><div class="tthk-member-photo">'+(src?'<img src="'+escape(src)+'" alt="Ảnh '+escape(m.full_name)+'">':pixelIcon('profile',90))+'</div>'+
  '<div><h2>'+escape(m.full_name)+'</h2><p class="tthk-member-position">'+escape(m.position)+'</p><p>'+escape(m.biography)+'</p></div></div>'+
  (canEdit?'<form class="tthk-member-form" id="tthkMemberForm">'+
  '<h3>Chỉnh sửa hồ sơ thành viên</h3><label>Họ tên<input name="name" value="'+escape(m.full_name)+'" maxlength="80" required></label>'+
  '<label>Vai trò trong dự án<input name="position" value="'+escape(m.position)+'" maxlength="160"></label>'+
  '<label>Giới thiệu<textarea name="bio" rows="4" maxlength="1400">'+escape(m.biography)+'</textarea></label>'+
  '<label>Liên kết ảnh (HTTPS)<input name="picture" type="url" placeholder="https://..." value="'+escape(m.portrait_url||'')+'"></label>'+
  '<label>Hoặc chọn ảnh mới<input name="file" type="file" accept="image/jpeg,image/png,image/webp"></label>'+
  '<button type="submit" class="btn">Lưu thông tin</button><p id="tthkMemberFeedback" role="status"></p></form>':
  '<p class="muted">Thông tin do thành viên được liên kết tài khoản hoặc quản trị viên cập nhật.</p>');
 if(canEdit)$('#tthkMemberForm').onsubmit=saveMember;
}
async function saveMember(event){
 event.preventDefault();
 const form=event.currentTarget,status=form.querySelector('#tthkMemberFeedback'),{db,user}=fetchContext();
 if(!db||!user)return;
 const button=form.querySelector('button[type=submit]');button.disabled=true;status.textContent='Đang lưu…';
 try{
  let link=form.elements.picture.value.trim();
  const file=form.elements.file.files[0];
  if(file){
   if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>6e6)throw Error('Ảnh tối đa 6 MB, dạng JPG/PNG/WebP.');
   if(!editor)throw Error('Chỉ quản trị viên được tải ảnh thành viên lên kho chung.');
   const path='team/'+selectedMember+'-'+Date.now()+'.'+(file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg');
   const sent=await db.storage.from('team-portraits').upload(path,file,{contentType:file.type,upsert:false});
   if(sent.error)throw sent.error;
   link=db.storage.from('team-portraits').getPublicUrl(path).data.publicUrl;
  }
  if(link&&!/^https:\/\//i.test(link))throw Error('Ảnh phải có liên kết HTTPS.');
  const patch={full_name:form.elements.name.value.trim(),position:form.elements.position.value.trim(),biography:form.elements.bio.value.trim(),portrait_url:link||null,updated_at:new Date().toISOString()};
  const res=await db.from('team_members').update(patch).eq('slug',selectedMember).select().single();
  if(res.error)throw res.error;teamRows[selectedMember]=res.data;status.textContent='Đã lưu hồ sơ.';
  renderMembers();setTimeout(refreshMemberEditor,250);
 }catch(e){status.textContent='Chưa lưu được: '+(e.message||e)}
 finally{button.disabled=false}
}
function wordEditorPanel(){
 if($('#tthkWordEditor'))return;
 const panel=document.createElement('aside');panel.id='tthkWordEditor';panel.className='tthk-word-editor';
 panel.innerHTML='<h3>Thư viện ảnh & ví dụ · 300 từ</h3><p>Mỗi từ có ảnh thẻ pixel riêng. Quản trị viên có thể thay bằng liên kết ảnh minh họa và chỉnh ví dụ Trung – Việt.</p>'+
  '<div class="tthk-word-editor-bar"><input id="tthkEditorSearch" placeholder="Tìm từ tiếng Trung hoặc nghĩa Việt" aria-label="Tìm từ"></div>'+
  '<div id="tthkWordEditorSelect"></div><div id="tthkWordEditorForm"></div>';
 $('#vocab')?.append(panel);
 $('#tthkEditorSearch').oninput=refreshWordEditor;
}
function refreshWordEditor(){
 const root=$('#tthkWordEditor');if(!root)return;
 const filter=$('#tthkEditorSearch')?.value?.trim()||'',words=(D.words||[]).filter(w=>escapedSearch(filter,w));
 const list=$('#tthkWordEditorSelect'),form=$('#tthkWordEditorForm');
 list.innerHTML='<div class="tthk-editor-picks">'+words.slice(0,filter?30:12).map(w=>'<button type="button" data-edit-word="'+escape(w.h)+'">'+escape(w.h)+'<small>'+escape(w.m)+'</small></button>').join('')+'</div>'+
  '<p class="muted">Đang hiển thị '+Math.min(words.length,filter?30:12)+' / '+words.length+' từ phù hợp.</p>';
 list.querySelectorAll('[data-edit-word]').forEach(btn=>btn.onclick=()=>{editingWord=btn.dataset.editWord;refreshWordEditor()});
 const w=D.words?.find(x=>x.h===editingWord);
 if(!w){form.innerHTML='';return}
 const item=contentRows[w.h]||{},example=item.example_zh?{zh:item.example_zh,py:item.example_pinyin,vi:item.example_vi}:(D.exampleSentences?.[w.h]||D.extraExamples?.[w.h]||{});
 const image=item.image_url||D.photos[w.h]||pixelWordImage(w);
 const external=/^https:\/\//i.test(item.image_url||'')?item.image_url:'';
 const canEdit=editor;
 form.innerHTML='<div class="tthk-editor-preview"><img src="'+escape(image)+'" alt="Ảnh minh họa '+escape(w.h)+'"><div><strong>'+escape(w.h)+' · '+escape(w.m)+'</strong><p>'+escape(w.p)+'</p>'+
  '<button type="button" class="btn soft" id="tthkCopyImage">Sao chép liên kết ảnh</button></div></div>'+
  (canEdit?'<form id="tthkWordForm"><label>Liên kết ảnh (HTTPS)<input name="image" type="url" placeholder="https://..." value="'+escape(external)+'"></label>'+
   '<label>Ví dụ tiếng Trung<textarea name="zh" rows="2">'+escape(example.zh||'')+'</textarea></label>'+
   '<label>Pinyin<textarea name="py" rows="2">'+escape(example.py||'')+'</textarea></label>'+
   '<label>Nghĩa ví dụ tiếng Việt<textarea name="vi" rows="2">'+escape(example.vi||'')+'</textarea></label>'+
   '<button type="submit" class="btn">Lưu ảnh và ví dụ</button><p id="tthkWordStatus" role="status"></p></form>':
   '<p class="muted">Chế độ xem. Người quản trị nội dung được phép cập nhật ảnh và câu ví dụ.</p>');
 $('#tthkCopyImage').onclick=()=>{
  const link=external||image;
  navigator.clipboard?.writeText(link).then(()=>{const btn=$('#tthkCopyImage');if(btn)btn.textContent='Đã sao chép ✓'}).catch(()=>alert('Không thể sao chép tự động trên thiết bị này.'));
 };
 if(canEdit)$('#tthkWordForm').onsubmit=saveWord;
}
async function saveWord(event){
 event.preventDefault();
 const {db}=fetchContext(),form=event.currentTarget;
 if(!db||!editingWord)return;
 const f=form.elements,photo=f.image.value.trim(),zh=f.zh.value.trim(),py=f.py.value.trim(),vi=f.vi.value.trim();
 const status=form.querySelector('#tthkWordStatus');
 if(photo&&!/^https:\/\//i.test(photo)){status.textContent='Vui lòng dùng liên kết ảnh HTTPS.';return}
 if([zh,py,vi].some(Boolean)&&![zh,py,vi].every(Boolean)){status.textContent='Nhập đủ Hán tự, Pinyin và nghĩa Việt cho ví dụ.';return}
 const payload={hanzi:editingWord,image_url:photo||null,example_zh:zh||null,example_pinyin:py||null,example_vi:vi||null,updated_at:new Date().toISOString()};
 const save=await db.from('word_content').upsert(payload,{onConflict:'hanzi'}).select().single();
 if(save.error){status.textContent='Không lưu được: '+save.error.message;return}
 contentRows[editingWord]=save.data;const w=D.words.find(x=>x.h===editingWord);
 D.photos[editingWord]=photo||pixelWordImage(w);
 if(zh){D.exampleSentences=D.exampleSentences||{};D.exampleSentences[editingWord]={zh,py,vi};}
 status.textContent='Đã cập nhật ảnh và ví dụ.';D.vocab();
}
function hideCollocations(){
 for(const el of $$('button,a,span,h2,h3,h4')){
  if(el.children.length||!el.textContent)continue;
  if(/^\s*(Kết hợp từ|Cụm từ kết hợp)\s*$/i.test(el.textContent)){el.hidden=true}
 }
}
function footer(){
 const site=$('#site');if(!site||$('#tthkContactFooter'))return;
 const foot=document.createElement('footer');foot.id='tthkContactFooter';
 foot.innerHTML='<div class="tthk-footer-brand"><img src="/logo-tthk.webp" alt="Logo Tiếng Trung Hem Khó" loading="lazy"><div><strong>TIẾNG TRUNG HEM KHÓ</strong><span>中文不难 · Học tiếng Trung dễ hiểu, dễ nhớ</span></div></div>'+
  '<div class="tthk-footer-details"><h3>Liên hệ</h3>'+
  '<a href="https://www.facebook.com/tiengtrunghemkho" target="_blank" rel="noopener noreferrer">'+pixelIcon('facebook',18)+'<span>Fanpage Tiếng Trung Hem Khó</span></a>'+
  '<p>'+pixelIcon('home',18)+'<span>Số 600, đường Nguyễn Văn Cừ (nối dài), Phường An Bình, Thành phố Cần Thơ</span></p>'+
  '<a href="tel:0373247662">'+pixelIcon('info',18)+'<span>0373247662</span></a>'+
  '<a href="mailto:tiengtrunghemkho@gmail.com">'+pixelIcon('study',18)+'<span>tiengtrunghemkho@gmail.com</span></a></div>';
 const main=site.querySelector('main');(main||site).append(foot);
}
function bio(){
 const intro=$('#intro');if(!intro)return;
 const desc=intro.querySelector('#garden-study-description');
 if(desc)desc.textContent='Tiếng Trung Hem Khó là dự án học tập do nhóm sinh viên Đại học FPT Cần Thơ xây dựng. Trang web đồng hành cùng người học tiếng Trung sơ cấp thông qua từ vựng Trung – Việt, luyện viết chữ Hán, bài tập tương tác và đề HSK 2.0 mô phỏng. Nội dung hướng đến cách học gần gũi, dễ luyện mỗi ngày.';
}
function replaceIcons(){
 const emoji=/^[\p{Extended_Pictographic}\u2600-\u27BF\uFE0F\u200D\s]+/u;
 for(const button of $$('button')){
  if(button.closest('#hsk20ExamOverlay,.hsk20-choices,.hsk20-dialog-layer,.garden-running-cat,.pa-cat,#pixelArcade'))continue;
  if(button.querySelector('svg,.pixel-nav-icon'))continue;
  const value=button.textContent||'',m=value.match(emoji);
  if(!m||!m[0].trim())continue;
  if(button.childElementCount>0)continue;
  const id=button.dataset.page||button.dataset.quickPage||(/đồng hồ|thời gian/i.test(value)?'clock':/nghe|nhạc/i.test(value)?'sound':/thi|đề/i.test(value)?'exams':'study');
  button.textContent=value.slice(m[0].length).trim();
  const container=document.createElement('span');container.className='tthk-pixel-icon';container.innerHTML=pixelIcon(id,17);
  button.prepend(container);
 }
}
async function cropProfile(){
 const root=$('#profile');if(!root||$('#tthkCropCanvas'))return;
 const choose=$('#profilePhoto'),upload=$('#uploadPhoto');if(!choose||!upload)return;
 const area=document.createElement('div');area.className='tthk-crop';
 area.innerHTML='<h3>Cắt ảnh đại diện</h3><canvas id="tthkCropCanvas" width="256" height="256" aria-label="Xem trước ảnh cắt vuông"></canvas>'+
 '<label>Phóng to ảnh <input id="tthkCropZoom" type="range" min="100" max="260" value="100"></label>'+
 '<p class="muted">Kéo ảnh để chọn vùng cắt. Giữ khuôn mặt ở giữa trước khi lưu.</p><p id="tthkProfileLimit" role="status"></p>';
 upload.insertAdjacentElement('beforebegin',area);
 const canvas=$('#tthkCropCanvas'),ctx=canvas.getContext('2d');let img=null,zoom=1,dx=0,dy=0,drag=null;
 function paint(){
  ctx.clearRect(0,0,256,256);ctx.fillStyle='#e9f5ed';ctx.fillRect(0,0,256,256);
  if(!img)return;
  const scale=Math.max(256/img.width,256/img.height)*zoom;
  const w=img.width*scale,h=img.height*scale;
  dx=Math.min(0,Math.max(256-w,dx));dy=Math.min(0,Math.max(256-h,dy));
  ctx.drawImage(img,dx,dy,w,h);
 }
 choose.addEventListener('change',()=>{
  const file=choose.files?.[0];if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){$('#tthkProfileLimit').textContent='Chọn ảnh JPG/PNG/WebP tối đa 10 MB.';return}
  const reader=new FileReader();reader.onload=()=>{
   const pic=new Image();pic.onload=()=>{img=pic;zoom=1;$('#tthkCropZoom').value=100;dx=(256-pic.width*Math.max(256/pic.width,256/pic.height))/2;dy=(256-pic.height*Math.max(256/pic.width,256/pic.height))/2;paint()};pic.src=reader.result;
  };reader.readAsDataURL(file);
 });
 $('#tthkCropZoom').oninput=e=>{const newZoom=Number(e.target.value)/100,centerX=128,centerY=128;const r=newZoom/zoom;dx=centerX-(centerX-dx)*r;dy=centerY-(centerY-dy)*r;zoom=newZoom;paint()};
 canvas.onpointerdown=e=>{if(!img)return;drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)};
 canvas.onpointermove=e=>{if(!drag)return;const rect=canvas.getBoundingClientRect();dx+=(e.clientX-drag.x)*256/rect.width;dy+=(e.clientY-drag.y)*256/rect.height;drag={x:e.clientX,y:e.clientY};paint()};
 canvas.onpointerup=()=>drag=null;canvas.onpointercancel=()=>drag=null;
 async function limits(){
  const {db,user}=fetchContext();if(!db||!user)return;
  const res=await db.from('student_profiles').select('name_changed_at,avatar_changed_at').eq('user_id',user.id).maybeSingle();
  if(res.error||!res.data)return;
  const now=Date.now(),day=7*86400000;
  const desc=[];
  const photoDate=Date.parse(res.data.avatar_changed_at||'');
  const nameDate=Date.parse(res.data.name_changed_at||'');
  if(Number.isFinite(photoDate)&&now<photoDate+day){upload.disabled=true;desc.push('Ảnh: đổi tiếp từ '+new Date(photoDate+day).toLocaleDateString('vi-VN'))}else upload.disabled=false;
  if(Number.isFinite(nameDate)&&now<nameDate+day){const b=$('#saveName');if(b)b.disabled=true;desc.push('Tên: đổi tiếp từ '+new Date(nameDate+day).toLocaleDateString('vi-VN'))}
  $('#tthkProfileLimit').textContent=desc.length?desc.join(' · '):'Bạn có thể đổi tên và ảnh đại diện, mỗi mục tối đa 1 lần trong 7 ngày.';
 }
 $('#profile').addEventListener('click',()=>{setTimeout(limits,200)},{capture:true,passive:true});
 upload.addEventListener('click',async event=>{
  event.preventDefault();event.stopImmediatePropagation();
  if(upload.disabled)return;
  if(!img){$('#photoStatus').textContent='Hãy chọn ảnh và căn vùng cắt trước khi lưu.';return;}
  const {db,user}=fetchContext();if(!db||!user)return;
  upload.disabled=true;$('#photoStatus').textContent='Đang lưu ảnh đã cắt...';
  try{
   const blob=await new Promise(ok=>canvas.toBlob(ok,'image/webp',.86));if(!blob)throw Error('Không xử lý được ảnh');
   const path=user.id+'/'+Date.now()+'-'+crypto.randomUUID().slice(0,8)+'.webp';
   const send=await db.storage.from('student-avatars').upload(path,blob,{contentType:'image/webp',upsert:false});
   if(send.error)throw send.error;
   const up=await db.from('student_profiles').update({avatar_path:path}).eq('user_id',user.id);
   if(up.error)throw up.error;
   await db.auth.updateUser({data:{...(user.user_metadata||{}),avatar_path:path}});
   const src=db.storage.from('student-avatars').getPublicUrl(path).data?.publicUrl;
   if(src){const av=$('#profileAvatar');av.replaceChildren();const pic=document.createElement('img');pic.src=src;pic.alt='Ảnh đại diện đã cắt';av.append(pic)}
   D.syncUserHeader?.();$('#photoStatus').textContent='Đã cập nhật ảnh cắt vuông. Lần đổi tiếp theo sau 7 ngày.';
  }catch(e){$('#photoStatus').textContent='Không lưu được ảnh: '+(e.message||e)}
  finally{await limits()}
 },true);
 const oldPage=D.page;
 D.page=function(id){const result=oldPage(id);if(id==='profile')limits();return result;};
 limits();
}
function start(){
 if(refreshing)return;refreshing=true;
 navigation();bilingualFilters();bio();footer();memberSection();wordEditorPanel();renderMembers();cropProfile();
 convertSelects();replaceIcons();hideCollocations();applyImages();
 const observer=new MutationObserver(()=>{if(pixelLoading)return;pixelLoading=true;requestAnimationFrame(()=>{pixelLoading=false;convertSelects();replaceIcons();hideCollocations()})});
 observer.observe(document.body,{childList:true,subtree:true});
 const site=$('#site');if(site){const watcher=new MutationObserver(()=>{if(!site.hidden)loadServer()});watcher.observe(site,{attributes:true,attributeFilter:['hidden']});}
 if(fetchContext().user)loadServer();
 window.TTHK_REFRESH={openMember:showMember,openEditorWord:w=>{editingWord=w;D.page('vocab');refreshWordEditor()},reloadContent:loadServer};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();