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
for(const old of [older1,older2]){if(old){old.hidden=true;const b=old.previousElementSibling;if(b?.tagName==='BUTTON'&&/Quản lý|Đóng/.test(b.textContent))b.hidden=true;}}
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