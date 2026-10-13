/* Tiếng Trung Hem Khó — bilingual word image + example library.
   Isolated overlay, no global layout changes. RLS enforces editor-only changes. */
;(()=>{
 'use strict';
 const D=window.TTHK;
 if(!D||window.TTHK_WORD_IMAGE_LIBRARY)return;
 const DEST='#anh-tu-vung',Q=s=>document.querySelector(s),safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let db=null,user=null,canEdit=false,words=[],contents={},selected='',loading=false,overlay=null;
 const currentImage=w=>contents[w.hanzi]?.image_url||D.photos?.[w.hanzi]||'';
 function editorContext(){
  const c=D.profileContext?.()||{};
  db=c.db;user=c.user;
  return Boolean(db&&user&&!Q('#site')?.hidden);
 }
 function attachButton(){
  const host=Q('#vocabImageAudit')||Q('#vocab');
  if(!host||Q('#wordImageLibraryButton'))return;
  const btn=document.createElement('button');btn.id='wordImageLibraryButton';
  btn.className='btn soft';btn.type='button';btn.textContent='Quản lý ảnh & ví dụ (300 từ)';
  btn.style.margin='10px 5px';
  (Q('#vocabImageAudit')||host).append(btn);
  btn.onclick=()=>{if(location.hash===DEST)open();else location.hash=DEST;};
 }
 function close(){
  overlay?.remove();overlay=null;
  document.body.classList.remove('tthk-word-image-open');
  if(location.hash===DEST)history.replaceState(null,'',location.pathname+location.search);
 }
 function makeView(){
  overlay=document.createElement('div');
  overlay.id='tthkWordImageLibrary';overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Quản lý ảnh minh họa và ví dụ HSK');
  overlay.innerHTML='<div class="twil-shell">'+
  '<header class="twil-top"><div><small>TIẾNG TRUNG HEM KHÓ · THƯ VIỆN NỘI DUNG</small>'+
  '<h1>Ảnh & ví dụ · 300 từ</h1><p>Chọn một từ để xem hoặc bổ sung liên kết ảnh và câu ví dụ Trung – Việt.</p></div>'+
  '<button type="button" class="twil-close" id="twilClose" aria-label="Đóng">✕ Đóng</button></header>'+
  '<div class="twil-main"><aside class="twil-sidebar">'+
  '<label for="twilSearch">Tìm chữ Hán hoặc nghĩa tiếng Việt</label>'+
  '<input type="search" id="twilSearch" placeholder="Ví dụ: 苹果 hoặc quả táo" autocomplete="off">'+
  '<div id="twilCount" class="twil-count">Đang tải danh sách...</div>'+
  '<div id="twilWordList" class="twil-word-list"></div></aside>'+
  '<section class="twil-detail"><div id="twilEditor">Chọn một từ trong danh sách.</div>'+
  '<div id="twilMessage" role="status" aria-live="polite"></div></section></div></div>';
  document.body.append(overlay);
  document.body.classList.add('tthk-word-image-open');
  Q('#twilClose').onclick=close;
  Q('#twilSearch').addEventListener('input',drawList);
 }
 function notify(msg,isError=false){
  const el=Q('#twilMessage');if(el){el.textContent=msg;el.classList.toggle('error',isError)}
 }
 function drawList(){
  if(!overlay)return;
  const query=Q('#twilSearch')?.value.trim().toLocaleLowerCase('vi')||'';
  const filtered=words.filter(x=>(x.hanzi+' '+x.meaning).toLocaleLowerCase('vi').includes(query));
  Q('#twilCount').textContent=filtered.length+' / '+words.length+' từ · '+Object.values(contents).filter(x=>x.image_url).length+' ảnh đã có liên kết chỉnh riêng';
  const list=Q('#twilWordList');
  list.innerHTML=filtered.map(x=>'<button class="twil-word '+(selected===x.hanzi?'on':'')+'" type="button" data-hanzi="'+safe(x.hanzi)+'">'+
   '<span class="twil-hanzi">'+safe(x.hanzi)+'</span>'+
   '<span class="twil-meaning">'+safe(x.meaning)+'</span>'+
   '<small>HSK '+x.hsk_level+'</small></button>').join('')||'<p>Không tìm thấy từ phù hợp.</p>';
  list.querySelectorAll('[data-hanzi]').forEach(b=>b.onclick=()=>{selected=b.dataset.hanzi;drawList();drawEditor()});
 }
 function buildPreview(url,w){
  if(!url)return '<div class="twil-no-image"><strong>'+safe(w.hanzi)+'</strong><span>Chưa có ảnh riêng cho từ này.</span></div>';
  return '<img id="twilImage" src="'+safe(url)+'" alt="Ảnh minh họa từ '+safe(w.hanzi)+'" referrerpolicy="no-referrer" loading="lazy">';
 }
 function drawEditor(){
  const w=words.find(x=>x.hanzi===selected),box=Q('#twilEditor');
  if(!box||!w){if(box)box.innerHTML='<p>Chọn một từ ở danh sách bên trái.</p>';return}
  const saved=contents[w.hanzi]||{},image=saved.image_url||'',fallback=D.photos?.[w.hanzi]||'',display=image||fallback;
  const examples=D.exampleSentences?.[w.hanzi]||D.extraExamples?.[w.hanzi]||{};
  box.innerHTML='<div class="twil-word-heading"><strong>'+safe(w.hanzi)+'</strong><div><span>'+safe(w.meaning)+'</span><small>HSK '+w.hsk_level+'</small></div></div>'+
   '<div class="twil-preview">'+buildPreview(display,w)+'</div>'+
   '<p class="twil-hint">'+(image?'Đang sử dụng liên kết ảnh được quản trị chỉnh sửa.':fallback?'Đang sử dụng ảnh mặc định hiện có.':'Chưa có ảnh được gắn, bạn có thể bổ sung link ảnh HTTPS.')+'</p>'+
   (display?'<div class="twil-linkline"><input id="twilCurrentImageLink" readonly value="'+safe(display)+'" aria-label="Đường dẫn ảnh đang sử dụng"><button type="button" id="twilCopyLink">Sao chép link</button></div>':'')+
   '<form id="twilForm">'+
   '<label>Link ảnh mới (HTTPS)<input name="image" type="url" inputmode="url" autocomplete="off" placeholder="https://example.com/hinh-anh.jpg" value="'+safe(image)+'" '+(!canEdit?'readonly':'')+'></label>'+
   '<label>Ví dụ tiếng Trung<textarea name="zh" maxlength="300" rows="2" placeholder="我喜欢喝茶。" '+(!canEdit?'readonly':'')+'>'+safe(saved.example_zh||examples.zh||'')+'</textarea></label>'+
   '<label>Pinyin<textarea name="pinyin" maxlength="500" rows="2" placeholder="Wǒ xǐhuan hē chá." '+(!canEdit?'readonly':'')+'>'+safe(saved.example_pinyin||examples.py||'')+'</textarea></label>'+
   '<label>Nghĩa ví dụ tiếng Việt<textarea name="vi" maxlength="500" rows="2" placeholder="Tôi thích uống trà." '+(!canEdit?'readonly':'')+'>'+safe(saved.example_vi||examples.vi||'')+'</textarea></label>'+
   (canEdit?'<button class="twil-save" type="submit">Lưu ảnh và câu ví dụ</button>':'<p class="twil-no-access">Tài khoản hiện tại có quyền xem. Chỉ tài khoản quản trị nội dung mới được lưu thay đổi.</p>')+
   '</form>';
  const pic=Q('#twilImage');
  if(pic)pic.onerror=()=>{const el=pic.parentNode;el.innerHTML='<div class="twil-no-image"><strong>'+safe(w.hanzi)+'</strong><span>Link ảnh hiện tại không tải được. Hãy thay link hợp lệ.</span></div>'};
  const cp=Q('#twilCopyLink');
  if(cp)cp.onclick=async()=>{try{await navigator.clipboard.writeText(display);notify('Đã sao chép đường dẫn ảnh của '+w.hanzi)}catch{Q('#twilCurrentImageLink')?.select();notify('Hãy sao chép đường dẫn trong ô bên trên.')}};
  const form=Q('#twilForm');
  form.onsubmit=async event=>{
   event.preventDefault();
   if(!canEdit)return;
   const button=form.querySelector('.twil-save');button.disabled=true;
   try{
    const image=form.elements.image.value.trim();
    const zh=form.elements.zh.value.trim(),py=form.elements.pinyin.value.trim(),vi=form.elements.vi.value.trim();
    if(image&&!/^https:\/\/[^ ]+$/i.test(image))throw Error('Link ảnh phải bắt đầu bằng https://');
    if(image.length>1000)throw Error('Link ảnh quá dài');
    if([zh,py,vi].some(Boolean)&&![zh,py,vi].every(Boolean))throw Error('Nếu chỉnh ví dụ, hãy nhập đủ Hán tự, Pinyin và nghĩa tiếng Việt.');
    const {data,error}=await db.from('word_content').upsert({
      hanzi:w.hanzi,image_url:image||null,example_zh:zh||null,example_pinyin:py||null,
      example_vi:vi||null,updated_at:new Date().toISOString()
    },{onConflict:'hanzi'}).select().single();
    if(error)throw error;
    contents[w.hanzi]=data;
    if(image){D.photos=D.photos||{};D.photos[w.hanzi]=image}
    if(zh){D.exampleSentences=D.exampleSentences||{};D.exampleSentences[w.hanzi]={zh,py,vi}}
    if(typeof D.vocab==='function')D.vocab();
    drawList();drawEditor();notify('Đã lưu ảnh và câu ví dụ cho '+w.hanzi);
   }catch(e){notify('Không lưu được: '+(e?.message||e),true)}
   finally{if(button.isConnected)button.disabled=false}
  };
 }
 async function open(){
  if(overlay)return;
  if(!editorContext()){return}
  makeView();
  if(loading)return;
  loading=true;
  try{
   const [w,c,ed]=await Promise.all([
    db.from('quiz_vocab').select('hanzi,meaning,hsk_level').order('hsk_level').order('hanzi'),
    db.from('word_content').select('hanzi,image_url,example_zh,example_pinyin,example_vi'),
    db.from('site_editors').select('user_id').eq('user_id',user.id).maybeSingle()
   ]);
   if(w.error)throw w.error;
   words=w.data||[];
   if(c.error)throw c.error;
   contents=Object.fromEntries((c.data||[]).map(x=>[x.hanzi,x]));
   canEdit=Boolean(ed.data&&!ed.error);
   selected=words.find(x=>x.hanzi===selected)?.hanzi||words[0]?.hanzi||'';
   drawList();drawEditor();
   notify(words.length+' từ được tải. '+(canEdit?'Bạn có quyền sửa ảnh và ví dụ.':'Bạn đang xem ở chế độ chỉ đọc.'));
  }catch(e){
   notify('Không tải được thư viện từ vựng: '+(e?.message||e),true);
  }finally{loading=false}
 }
 function onRoute(){
  if(location.hash!==DEST){if(overlay)close();return}
  if(editorContext())open();
 }
 function boot(){
  attachButton();
  window.addEventListener('hashchange',onRoute);
  const site=Q('#site');
  if(site){
   new MutationObserver(()=>{attachButton();if(site.hidden){overlay?.remove();overlay=null;document.body.classList.remove('tthk-word-image-open')}else onRoute()})
    .observe(site,{attributes:true,attributeFilter:['hidden']});
  }
  if(location.hash===DEST)setTimeout(onRoute,350);
  window.TTHK_WORD_IMAGE_LIBRARY={open:()=>{location.hash=DEST;if(overlay)return;open()},close};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();