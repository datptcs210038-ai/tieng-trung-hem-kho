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
  team.insertAdjacentElement('afterend',panel);
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
    node.style.backgroundImage='url("'+safe+'")';
    node.style.backgroundSize='contain';
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
    panel.hidden=!isEditor;
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