/* Tiếng Trung Hem Khó 2026 — progressive redesign, existing site + data retained. */
;(()=>{
'use strict';
const D=window.TTHK;if(!D||window.TTHK_V2)return;
const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slugIds=['thanh-dat','hong-diep','yen-vi','ngoc-giau','phuong-nghi'];
const icons={
 home:['00111100','01100110','11000011','11111111','10011001','10011001','10011001','11111111'],
 study:['11111111','10011001','10111101','10100101','10111101','10100101','10111101','11111111'],
 game:['00111100','01000010','10100101','10000001','10011001','10100101','01000010','00111100'],
 timer:['00111100','01100110','11011011','11011111','11000011','01100110','00111100','00011000'],
 people:['11000011','11100111','01111110','00111100','01111110','11111111','10011001','10011001'],
 user:['00111100','01111110','01111110','00111100','00011000','01111110','11000011','11111111'],
 search:['01111100','11000110','10000010','10000010','11000110','01111100','00011000','00001100'],
 pen:['00001110','00011111','00111010','01110000','11100000','11000000','11111111','01111110'],
 headphones:['00111100','01100110','11000011','11000011','11000011','11100111','00100100','00100100'],
 exam:['01111110','01000010','01111010','01000010','01111010','01000010','01111110','00111100'],
 trophy:['00100100','01111110','11111111','01111110','00111100','00011000','00111100','00111100'],
 logout:['00011100','00110000','01100000','11111111','01100000','00110000','00011100','00000000'],
 facebook:['00111100','01111110','01111000','11111000','11111110','01111000','01111000','01111000'],
 phone:['01111110','11000011','10111101','10100101','10100101','10111101','11000011','01111110'],
 mail:['11111111','11000011','10100101','10011001','10000001','10000001','11111111','11111111'],
 music:['00011100','00011110','00011111','00011100','00011100','01111100','11110000','01100000']
};
function pixel(kind,size=20){
 const data=icons[kind]||icons.study;
 return '<svg aria-hidden="true" width="'+size+'" height="'+size+'" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'+
 data.map((row,y)=>[...row].map((a,x)=>a==='1'?'<rect x="'+(x*2)+'" y="'+(y*2)+'" width="2" height="2"/>':'').join('')).join('')+'</svg>';
}
let assets={},members={},isEditor=false,lastUserId='',loadedFor='',navInstalled=false,memberSlug=slugIds[0];
const $main=()=>$('#site>main')||$('#site main');
function context(){return D.profileContext?.()||{}}
function photoURL(asset){
 if(!asset?.image_path)return'';
 const {db}=context();if(!db)return'';
 return db.storage.from('team-portraits').getPublicUrl(asset.image_path).data?.publicUrl||'';
}
function brand(){
 const src=photoURL(assets.logo);
 if(!src)return;
 for(const id of ['tthkBrandImage','tthkFooterBrandImage']){
  const img=$('#'+id);if(!img)continue;img.hidden=false;img.src=src+(src.includes('?')?'&':'?')+'v='+encodeURIComponent(assets.logo.updated_at||'1');
 }
}
function header(){
 const site=$('#site'),main=$main();if(!site||!main||$('#tthkNavHeader'))return;
 const head=document.createElement('header');head.id='tthkNavHeader';
 const pages=[['intro','Tổng quan','home'],['vocab','Học tập','study'],['flash','Học với Hành','game'],['timer','Pomodoro Timer','timer'],['teamPage','Thành viên','people'],['profile','Cá nhân','user']];
 head.innerHTML='<div class="tthk-brand"><img id="tthkBrandImage" alt="Logo thương hiệu hiện tại" hidden><div class="tthk-brand-title">TIẾNG TRUNG HEM KHÓ<small>中文不难 · Học mỗi ngày</small></div></div>'+
 '<nav class="tthk-primary-nav" aria-label="Điều hướng chính">'+pages.map(([id,label,icon])=>
 '<button type="button" data-tthk-page="'+id+'" aria-current="'+(id==='intro'?'page':'false')+'">'+pixel(icon)+'<span>'+label+'</span></button>').join('')+'</nav>';
 site.insertBefore(head,site.firstChild);
 head.querySelectorAll('[data-tthk-page]').forEach(b=>b.onclick=()=>go(b.dataset.tthkPage));
 brand();
}
const studyTabs=[['vocab','Từ vựng','study'],['lookup','Tra cứu','search'],['writing','Luyện viết','pen'],['exams','Đề HSK','exam'],['rank','Xếp hạng','trophy']];
function subnav(){
 const tabHTML='<nav class="tthk-study-tabs" aria-label="Công cụ học tập">'+studyTabs.map(([id,text,ico])=>
 '<button type="button" data-tthk-study="'+id+'">'+pixel(ico,16)+'<span>'+text+'</span></button>').join('')+'</nav>';
 for(const [id] of studyTabs){
  const page=$('#'+id);if(!page||page.querySelector('.tthk-study-tabs'))continue;
  page.insertAdjacentHTML('afterbegin',tabHTML);
  page.querySelectorAll('[data-tthk-study]').forEach(b=>b.onclick=()=>go(b.dataset.tthkStudy));
 }
}
function go(target){
 const targetPage=$('#'+target);
 if(!targetPage)return;
 D.page(target);
 updateNav(target);
 if(target==='teamPage')renderTeam();
 if(target==='memberDetailPage')renderMember();
 if(target==='profile')refreshProfileLimit();
}
function updateNav(id){
 const kind=studyTabs.some(row=>row[0]===id)?'vocab':id==='memberDetailPage'?'teamPage':id;
 $$('#tthkNavHeader [data-tthk-page]').forEach(b=>b.setAttribute('aria-current',b.dataset.tthkPage===kind?'page':'false'));
 $$('.tthk-study-tabs [data-tthk-study]').forEach(b=>b.setAttribute('aria-current',b.dataset.tthkStudy===id?'page':'false'));
}
function installNavigation(){
 header();subnav();
 if(navInstalled)return;navInstalled=true;
 const prev=D.page;
 D.page=function(id){const ret=prev.apply(this,arguments);updateNav(id);if(id==='profile')refreshProfileLimit();return ret};
 const flash=$('#flash h1');if(flash)flash.textContent='Học với Hành';
 const timer=$('#timer h1');if(timer)timer.textContent='Pomodoro Timer';
 // Preserve the old nav's handlers in the DOM; only its visual placement is hidden.
 const site=$('#site');
 if(site){
  let lastVisible=!site.hidden;
  const obs=new MutationObserver(()=>{
   const shown=!site.hidden;
   if(shown&&!lastVisible){
    go('intro');loadContent();
   }
   if(!shown)loadedFor='';
   lastVisible=shown;
  });
  obs.observe(site,{attributes:true,attributeFilter:['hidden']});
  if(lastVisible){go('intro');loadContent();}
 }
}
function makePages(){
 const main=$main();if(!main)return;
 if(!$('#teamPage')){
  const page=document.createElement('section');
  page.id='teamPage';page.className='page';
  page.innerHTML='<div class="tthk-section-head"><h1>Thành viên dự án</h1><p>Gặp gỡ những người đang xây dựng và phát triển Tiếng Trung Hem Khó.</p></div><div id="tthkTeamGrid" class="tthk-team-grid"></div>';
  main.append(page);
 }
 if(!$('#memberDetailPage')){
  const page=document.createElement('section');page.id='memberDetailPage';page.className='page';
  page.innerHTML='<button class="tthk-back" id="tthkTeamBack" type="button">← Danh sách thành viên</button><div id="tthkMemberDetail"></div>';
  main.append(page);$('#tthkTeamBack').onclick=()=>go('teamPage');
 }
 renderTeam();
}
function memberImg(slug){
 const row=members[slug]||{};
 if(row.portrait_url&&/^https:\/\//.test(row.portrait_url))return row.portrait_url;
 return photoURL(assets[slug]);
}
function renderTeam(){
 const target=$('#tthkTeamGrid');if(!target)return;
 target.innerHTML=slugIds.map((slug,i)=>{
  const m=members[slug]||{},fallback=D.team?.[i]||['Thành viên','Đang cập nhật'];
  const name=m.full_name||fallback[0],role=m.position||fallback[1],picture=memberImg(slug);
  return '<button type="button" class="tthk-team-card" data-member-slug="'+slug+'">'+
   '<span class="tthk-portrait">'+(picture?'<img src="'+safe(picture)+'" alt="Ảnh '+safe(name)+'" loading="lazy">':pixel('people',72))+'</span>'+
   '<strong>'+safe(name)+'</strong><span>'+safe(role)+'</span><em>Xem hồ sơ →</em></button>';
 }).join('');
 target.querySelectorAll('[data-member-slug]').forEach(b=>b.onclick=()=>{memberSlug=b.dataset.memberSlug;go('memberDetailPage')});
}
function renderMember(){
 const idx=slugIds.indexOf(memberSlug),row=members[memberSlug]||{},fallback=D.team?.[idx]||['Thành viên',''];
 const name=row.full_name||fallback[0],role=row.position||fallback[1],bio=row.biography||'Thông tin tiểu sử đang được thành viên cập nhật.';
 const img=memberImg(memberSlug),{user}=context(),canEdit=isEditor||Boolean(row.member_user_id&&row.member_user_id===user?.id);
 const slot=$('#tthkMemberDetail');if(!slot)return;
 slot.innerHTML='<div class="tthk-member-layout"><div class="tthk-member-cover">'+(img?'<img src="'+safe(img)+'" alt="Ảnh '+safe(name)+'">':pixel('people',100))+'</div>'+
 '<div><h1>'+safe(name)+'</h1><h3>'+safe(role)+'</h3><p>'+safe(bio)+'</p></div></div>'+
 (canEdit?'<form id="tthkMemberEditForm" class="tthk-editor-card"><h3>Chỉnh sửa hồ sơ</h3>'+
 '<label>Họ và tên<input name="name" maxlength="80" value="'+safe(name)+'" required></label>'+
 '<label>Vai trò<input name="role" maxlength="180" value="'+safe(role)+'"></label>'+
 '<label>Tiểu sử<textarea name="bio" maxlength="1500" rows="4">'+safe(row.biography||'')+'</textarea></label>'+
 '<label>Liên kết ảnh HTTPS<input name="url" type="url" value="'+safe(row.portrait_url||'')+'" placeholder="https://..."></label>'+
 '<label>Hoặc tải ảnh mới<input name="picture" type="file" accept="image/png,image/jpeg,image/webp"></label>'+
 '<button type="submit">Lưu thông tin</button><p id="tthkMemberStatus" role="status"></p></form>':'');
 if(canEdit)$('#tthkMemberEditForm').onsubmit=saveMember;
}
async function saveMember(event){
 event.preventDefault();
 const {db,user}=context(),form=event.currentTarget;if(!db||!user)return;
 const msg=form.querySelector('#tthkMemberStatus'),btn=form.querySelector('[type=submit]');
 btn.disabled=true;msg.textContent='Đang lưu…';
 try{
  let picture=form.elements.url.value.trim(),path='';
  const file=form.elements.picture.files[0];
  if(file){
   if(!isEditor)throw Error('Tải ảnh thành viên mới cần quyền quản trị.');
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4*1024*1024)throw Error('Ảnh phải là JPG/PNG/WebP, tối đa 4 MB.');
   path='team/'+memberSlug+'-'+Date.now()+'.'+(file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg');
   const up=await db.storage.from('team-portraits').upload(path,file,{contentType:file.type,upsert:false});
   if(up.error)throw up.error;
   picture=db.storage.from('team-portraits').getPublicUrl(path).data.publicUrl;
  }
  if(picture&&!/^https:\/\//.test(picture))throw Error('Liên kết ảnh phải bắt đầu bằng https://');
  const patch={full_name:form.elements.name.value.trim(),position:form.elements.role.value.trim(),biography:form.elements.bio.value.trim(),portrait_url:picture||null,updated_at:new Date().toISOString()};
  const res=await db.from('team_members').update(patch).eq('slug',memberSlug).select().single();
  if(res.error)throw res.error;
  members[memberSlug]=res.data;
  if(path&&isEditor){
   const r=await db.from('site_assets').upsert({slug:memberSlug,image_path:path,updated_at:new Date().toISOString()},{onConflict:'slug'});
   if(!r.error)assets[memberSlug]={slug:memberSlug,image_path:path,updated_at:new Date().toISOString()};
  }
  msg.textContent='Đã lưu thông tin thành viên.';renderMember();renderTeam();
 }catch(e){msg.textContent='Không lưu được: '+(e.message||e)}
 finally{btn.disabled=false}
}
async function loadContent(){
 const {db,user}=context();if(!db||!user||loadedFor===user.id)return;
 loadedFor=user.id;
 try{
  const [as,te,ed,word]=await Promise.all([
   db.from('site_assets').select('slug,image_path,updated_at'),
   db.from('team_members').select('slug,full_name,position,biography,portrait_url,member_user_id'),
   db.from('site_editors').select('user_id').eq('user_id',user.id).maybeSingle(),
   db.from('word_content').select('hanzi,image_url,example_zh,example_pinyin,example_vi')
  ]);
  if(!as.error)assets=Object.fromEntries((as.data||[]).map(a=>[a.slug,a]));
  if(!te.error)members=Object.fromEntries((te.data||[]).map(a=>[a.slug,a]));
  isEditor=Boolean(ed.data&&!ed.error);
  brand();renderTeam();renderMember();
  if(!word.error){
   D.exampleSentences=D.exampleSentences||{};
   D.photos=D.photos||{};
   for(const w of word.data||[]){
    if(w.image_url&&/^https:\/\//.test(w.image_url)&&!D.ORIGINAL_PHOTOS?.[w.hanzi])D.photos[w.hanzi]=w.image_url;
    if(w.example_zh&&w.example_pinyin&&w.example_vi)D.exampleSentences[w.hanzi]={zh:w.example_zh,py:w.example_pinyin,vi:w.example_vi};
   }
   if(D.words?.length)D.vocab();
  }
 }catch(e){loadedFor='';console.warn('TTHK content sync:',e)}
}
function footer(){
 const root=$main();if(!root||$('#tthkFooter'))return;
 const el=document.createElement('footer');el.id='tthkFooter';
 el.innerHTML='<div class="tthk-foot-brand"><img id="tthkFooterBrandImage" alt="Logo thương hiệu hiện tại" hidden><div><strong>TIẾNG TRUNG HEM KHÓ</strong><p>中文不难 · Học cùng nhau mỗi ngày</p></div></div>'+
 '<div class="tthk-foot-contact"><h3>Liên hệ</h3>'+
 '<div class="tthk-contact-item">'+pixel('facebook',18)+'<span>Fanpage: đang xác minh liên kết chính thức</span></div>'+
 '<div class="tthk-contact-item">'+pixel('home',18)+'<span>Số 600, đường Nguyễn Văn Cừ (nối dài), Phường An Bình, Thành phố Cần Thơ</span></div>'+
 '<a href="tel:0373247662">'+pixel('phone',18)+'<span>0373247662</span></a>'+
 '<a href="mailto:tiengtrunghemkho@gmail.com">'+pixel('mail',18)+'<span>tiengtrunghemkho@gmail.com</span></a></div>';
 root.append(el);brand();
}
function replaceDropdowns(){
 const selects=$$('#site main select');
 for(const el of selects){
  if(el.dataset.tthkConverted||el.closest('#hsk20ExamOverlay')||el.hidden||!el.options?.length)continue;
  const choices=[...el.options];el.dataset.tthkConverted='true';
  const container=document.createElement('div');container.className='tthk-select-panel';
  const needsSearch=choices.length>18;
  const rail=document.createElement('div');rail.className='tthk-choice-rail';
  const search=needsSearch?document.createElement('input'):null;
  if(search){
   search.type='search';search.className='tthk-choice-search';
   search.placeholder='Tìm chữ Hán hoặc nghĩa tiếng Việt';
   search.setAttribute('aria-label','Tìm trong danh sách từ');
   container.append(search);
  }
  container.append(rail);el.insertAdjacentElement('afterend',container);
  const norm=v=>String(v||'').toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
  const render=()=>{
   const q=norm(search?.value.trim()||'');
   const options=[...el.options].filter(o=>!o.disabled&&(!q||norm(o.textContent).includes(q)));
   rail.replaceChildren();
   for(const op of options.slice(0,needsSearch?14:45)){
    const b=document.createElement('button');
    b.type='button';b.className='tthk-choice-pill';b.textContent=op.textContent||op.value;
    b.setAttribute('aria-pressed',String(el.value===op.value));
    b.onclick=()=>{
     el.value=op.value;
     el.dispatchEvent(new Event('input',{bubbles:true}));
     el.dispatchEvent(new Event('change',{bubbles:true}));
     render();
    };
    rail.append(b);
   }
   if(needsSearch&&options.length>14){
    const note=document.createElement('span');note.className='tthk-more-options';
    note.textContent='Gõ để tìm trong '+options.length+' lựa chọn';rail.append(note);
   }
  };
  el.classList.add('tthk-native-select');
  el.addEventListener('change',render);
  new MutationObserver(render).observe(el,{childList:true,subtree:true});
  if(search)search.oninput=render;
  render();
 }
}
function cleanLegacy(){
 const signout=$('#quickSignOut');if(signout)signout.remove();
 const out=$('#logout');
 const profile=$('#profile');
 if(out&&profile&&!$('#tthkAccountLogout')){
  const b=document.createElement('button');b.type='button';b.id='tthkAccountLogout';
  b.className='tthk-logout';b.innerHTML=pixel('logout',18)+'<span>Đăng xuất</span>';
  profile.append(b);b.onclick=()=>out.click();
 }
 for(const b of $$('[data-lookup]')){
  if(/kết hợp từ/i.test(b.textContent||''))b.hidden=true;
 }
 const fast=$('#flash h1');if(fast)fast.textContent='Học với Hành';
}
function pixelUI(){
 // Render the existing controls with a consistent SVG pixel icon without touching question choices.
 const nodes=$$('#site main button, #tthkNavHeader button');
 for(const b of nodes){
  if(b.dataset.pixelDone||b.closest('#hsk20ExamOverlay,#pixelArcade,.hsk20-choices,.pa-arcade'))continue;
  if(b.querySelector('svg'))continue;
  const t=b.textContent||'',m=t.match(/^[\p{Extended_Pictographic}\u2600-\u27BF\uFE0F\u200D\s]+/u);
  if(!m||!m[0].trim())continue;
  if(b.children.length>0)continue;
  const text=t.slice(m[0].length).trim();
  const type=/nghe|phát âm|nhạc/i.test(text)?'headphones':/viết|sửa/i.test(text)?'pen':/thi|đề/i.test(text)?'exam':/đăng xuất/i.test(text)?'logout':'study';
  b.textContent=text;
  b.insertAdjacentHTML('afterbegin',pixel(type,16));
  b.dataset.pixelDone='1';
 }
}
let cropping={image:null,x:0,y:0,scale:1,drag:null};
function profileUI(){
 const page=$('#profile'),field=$('#profilePhoto'),upload=$('#uploadPhoto');
 if(!page||!field||!upload||$('#tthkCropCanvas'))return;
 const el=document.createElement('section');el.id='tthkCropControls';el.className='tthk-editor-card';
 el.innerHTML='<h3>Cắt ảnh đại diện trước khi lưu</h3><canvas id="tthkCropCanvas" width="256" height="256" aria-label="Xem trước ảnh vuông"></canvas>'+
 '<label>Phóng to, thu nhỏ <input type="range" id="tthkCropZoom" min="100" max="300" value="100"></label>'+
 '<p>Kéo ảnh trong ô xem trước để điều chỉnh vùng cắt.</p><p id="tthkProfileLimit" role="status"></p>';
 upload.insertAdjacentElement('beforebegin',el);
 const canvas=$('#tthkCropCanvas'),ctx=canvas.getContext('2d');
 const draw=()=>{
  ctx.clearRect(0,0,256,256);ctx.fillStyle='#eaf6ff';ctx.fillRect(0,0,256,256);
  if(!cropping.image)return;
  const i=cropping.image,f=Math.max(256/i.width,256/i.height)*cropping.scale,w=i.width*f,h=i.height*f;
  cropping.x=Math.max(256-w,Math.min(0,cropping.x));cropping.y=Math.max(256-h,Math.min(0,cropping.y));
  ctx.drawImage(i,cropping.x,cropping.y,w,h);
 };
 field.onchange=()=>{
  const f=field.files?.[0];if(!f)return;
  if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>10*1024*1024){$('#photoStatus').textContent='Ảnh phải là JPG/PNG/WebP, tối đa 10 MB.';return}
  const reader=new FileReader();
  reader.onload=()=>{const img=new Image();img.onload=()=>{cropping.image=img;cropping.scale=1;$('#tthkCropZoom').value=100;const base=Math.max(256/img.width,256/img.height);cropping.x=(256-img.width*base)/2;cropping.y=(256-img.height*base)/2;draw()};img.src=reader.result};
  reader.readAsDataURL(f);
 };
 $('#tthkCropZoom').oninput=e=>{
  const scale=Number(e.target.value)/100,ratio=scale/cropping.scale;
  cropping.x=128-(128-cropping.x)*ratio;cropping.y=128-(128-cropping.y)*ratio;cropping.scale=scale;draw();
 };
 canvas.addEventListener('pointerdown',e=>{if(!cropping.image)return;cropping.drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{
  if(!cropping.drag)return;
  const r=canvas.getBoundingClientRect();
  cropping.x+=(e.clientX-cropping.drag.x)*256/r.width;cropping.y+=(e.clientY-cropping.drag.y)*256/r.height;
  cropping.drag={x:e.clientX,y:e.clientY};draw();
 });
 for(const name of ['pointerup','pointercancel'])canvas.addEventListener(name,()=>cropping.drag=null);
 upload.addEventListener('click',async e=>{
  e.preventDefault();e.stopImmediatePropagation();
  const {db,user}=context(),message=$('#photoStatus');if(!db||!user)return;
  if(!cropping.image){message.textContent='Hãy chọn ảnh và cắt ảnh trước khi lưu.';return}
  upload.disabled=true;message.textContent='Đang lưu ảnh đã cắt...';
  try{
   const blob=await new Promise(done=>canvas.toBlob(done,'image/webp',0.88));
   if(!blob)throw Error('Không thể cắt ảnh này');
   const path=user.id+'/'+Date.now()+'-'+crypto.randomUUID().slice(0,8)+'.webp';
   const up=await db.storage.from('student-avatars').upload(path,blob,{contentType:'image/webp',upsert:false});
   if(up.error)throw up.error;
   const saved=await db.from('student_profiles').update({avatar_path:path}).eq('user_id',user.id);
   if(saved.error)throw saved.error;
   await db.auth.updateUser({data:{...user.user_metadata,avatar_path:path}});
   const img=$('#profileAvatar');
   const url=db.storage.from('student-avatars').getPublicUrl(path).data?.publicUrl;
   if(img&&url){img.innerHTML='<img src="'+safe(url)+'" alt="Ảnh đại diện">'}
   message.textContent='Đã lưu ảnh. Lần đổi tiếp theo sau 7 ngày.';D.syncUserHeader?.();refreshProfileLimit();
  }catch(err){message.textContent='Chưa lưu được: '+(err.message||err)}
  finally{upload.disabled=false}
 },true);
 const saveName=$('#saveName');
 if(saveName)saveName.addEventListener('click',()=>setTimeout(refreshProfileLimit,500),false);
}
async function refreshProfileLimit(){
 const {db,user}=context();if(!db||!user||!$('#tthkProfileLimit'))return;
 try{
  const r=await db.from('student_profiles').select('name_changed_at,avatar_changed_at').eq('user_id',user.id).maybeSingle();
  if(r.error||!r.data)return;
  const rows=[['name_changed_at','Tên'],['avatar_changed_at','Ảnh']];
  const notes=rows.map(([key,label])=>{
   const at=Date.parse(r.data[key]||'');if(!Number.isFinite(at))return label+': có thể thay đổi';
   const next=at+7*24*3600*1000;
   return next>Date.now()?label+': đổi tiếp '+new Date(next).toLocaleDateString('vi-VN'):label+': có thể thay đổi';
  });
  $('#tthkProfileLimit').textContent=notes.join(' · ');
  const n=Date.parse(r.data.name_changed_at||'');
  const save=$('#saveName');if(save)save.disabled=Number.isFinite(n)&&n+7*86400000>Date.now();
  const t=Date.parse(r.data.avatar_changed_at||'');
  if(Number.isFinite(t)&&t+7*86400000>Date.now())$('#uploadPhoto').disabled=true;
  else $('#uploadPhoto').disabled=false;
 }catch(e){console.warn('Profile limit',e)}
}
function start(){
 if(!$('#site')||!$main())return;
 header();makePages();subnav();footer();cleanLegacy();profileUI();installNavigation();
 replaceDropdowns();pixelUI();
 let painting=false;
 const observer=new MutationObserver(()=>{
  if(painting)return;painting=true;
  requestAnimationFrame(()=>{painting=false;replaceDropdowns();pixelUI()});
 });
 observer.observe($main(),{childList:true,subtree:true});
 window.TTHK_V2={go,loadContent,renderTeam,refreshProfileLimit,icons:pixel};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();