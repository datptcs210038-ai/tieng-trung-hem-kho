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
  const up=await db.auth.updateUser({data:{...user.user_metadata,full_name:value}});
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
  const meta=await db.auth.updateUser({data:{...user.user_metadata,avatar_path:path}});
  if(meta.error)throw meta.error;
  renderAvatar(path);
  status('photoStatus','✅ Ảnh đại diện đã được cập nhật.');
 }catch(e){status('photoStatus','Tải ảnh thất bại: '+e.message);}
 finally{btn.disabled=false;}
};
}());