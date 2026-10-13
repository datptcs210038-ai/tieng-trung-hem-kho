/* Secure public contact fields. Fanpage remains unlinked until an editor sets a genuine URL. */
;(()=>{
'use strict';
const D=window.TTHK;if(!D||window.TTHK_CONTACT_EDITOR)return;
const $=s=>document.querySelector(s),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defaults={
 phone:'0373247662',email:'tiengtrunghemkho@gmail.com',
 address:'Số 600, đường Nguyễn Văn Cừ (nối dài), Phường An Bình, Thành phố Cần Thơ',fanpage_url:''
};
let values={...defaults},loaded='',busy=false;
const icon=(path)=>'<svg aria-hidden="true" viewBox="0 0 16 16" width="18" height="18" fill="#5289AB" shape-rendering="crispEdges">'+path+'</svg>';
const pix={
 fb:icon('<rect x="4" y="1" width="9" height="3"/><rect x="3" y="4" width="4" height="11"/><rect x="3" y="7" width="9" height="3"/>'),
 home:icon('<rect x="7" y="0" width="2" height="2"/><rect x="5" y="2" width="6" height="2"/><rect x="3" y="4" width="10" height="2"/><rect x="2" y="6" width="12" height="2"/><rect x="4" y="8" width="8" height="8"/><rect x="7" y="11" width="2" height="5" fill="#EAF6FF"/>'),
 phone:icon('<rect x="2" y="1" width="4" height="5"/><rect x="3" y="6" width="5" height="4"/><rect x="6" y="9" width="4" height="3"/><rect x="9" y="10" width="5" height="5"/>'),
 mail:icon('<rect x="1" y="3" width="14" height="11"/><path d="M2 5l6 5 6-5" fill="none" stroke="#EAF6FF" stroke-width="2"/>')
};
function item(type,text,url){
 const content=pix[type]+'<span>'+esc(text)+'</span>';
 return url?'<a class="tthk-contact-item" href="'+esc(url)+'" '+(type==='fb'?'target="_blank" rel="noopener noreferrer"':'')+'>'+content+'</a>':
 '<div class="tthk-contact-item">'+content+'</div>';
}
function draw(){
 const foot=$('#tthkFooter .tthk-foot-contact');if(!foot)return;
 const fb=/^https:\/\/(www\.)?(facebook\.com|fb\.com|fb\.me)\//i.test(values.fanpage_url)?values.fanpage_url:'';
 const tel=(values.phone||defaults.phone).replace(/[^0-9+]/g,'');
 const mail=values.email||defaults.email;
 foot.innerHTML='<h3>Liên hệ</h3>'+
 item('fb',fb?'Fanpage Tiếng Trung Hem Khó':'Fanpage: chưa có liên kết được xác minh',fb||null)+
 item('home',values.address||defaults.address,null)+
 item('phone',values.phone||defaults.phone,tel?'tel:'+tel:null)+
 item('mail',mail,'mailto:'+encodeURIComponent(mail));
}
function form(editor){
 const profile=$('#profile');if(!profile)return;
 let n=$('#tthkContactEditor');
 if(!editor){n?.remove();return}
 if(!n){n=document.createElement('section');n.id='tthkContactEditor';n.className='tthk-editor-card';
   n.style.cssText='padding:17px;background:#fff;border:1px solid #D6E8F5;border-radius:15px;margin:18px 0';
   profile.append(n);
 }
 n.innerHTML='<h3>Quản trị · Thông tin liên hệ</h3><p>Chỉ quản trị viên được sửa. Fanpage cần URL chính thức đã được xác minh.</p>'+
 '<form id="tthkContactForm">'+
 '<label>Fanpage Facebook (liên kết HTTPS)<input type="url" name="fanpage_url" placeholder="https://www.facebook.com/..." value="'+esc(values.fanpage_url)+'"></label>'+
 '<label>Địa chỉ<input name="address" maxlength="300" value="'+esc(values.address)+'" required></label>'+
 '<label>Điện thoại<input name="phone" maxlength="20" value="'+esc(values.phone)+'" required></label>'+
 '<label>Email<input type="email" name="email" maxlength="150" value="'+esc(values.email)+'" required></label>'+
 '<button type="submit" class="btn">Lưu liên hệ</button><p id="tthkContactStatus" role="status"></p></form>';
 const fields=n.querySelectorAll('input');
 fields.forEach(i=>{i.style.cssText='display:block;width:100%;min-height:42px;padding:9px;border:1px solid #BBD6E8;border-radius:9px;margin:7px 0;font-size:16px'});
 n.querySelector('form').onsubmit=save;
}
async function save(e){
 e.preventDefault();const {db,user}=D.profileContext?.()||{};if(!db||!user)return;
 const f=e.currentTarget,update={};
 for(const k of Object.keys(defaults))update[k]=f.elements[k].value.trim();
 const message=f.querySelector('#tthkContactStatus');
 if(update.fanpage_url&&!/^https:\/\/(www\.)?(facebook\.com|fb\.com|fb\.me)\//i.test(update.fanpage_url)){message.textContent='Fanpage phải dùng URL Facebook HTTPS thật.';return}
 if(!/^[+0-9 ()-]{8,20}$/.test(update.phone)||!/.+@.+\..+/.test(update.email)){message.textContent='Số điện thoại hoặc email chưa hợp lệ.';return}
 const btn=f.querySelector('button');btn.disabled=true;message.textContent='Đang lưu…';
 try{
  const rows=Object.entries(update).map(([key,value])=>({key,value,updated_at:new Date().toISOString()}));
  const res=await db.from('site_settings').upsert(rows,{onConflict:'key'});
  if(res.error)throw res.error;
  values=update;draw();message.textContent='Đã cập nhật thông tin liên hệ cho website.';
 }catch(err){message.textContent='Không lưu được: '+(err.message||err)}
 finally{btn.disabled=false}
}
async function sync(){
 const {db,user}=D.profileContext?.()||{};
 if(!db||!user||$('#site')?.hidden){loaded='';return}
 if(busy||loaded===user.id)return;busy=true;
 try{
  const [content,editor]=await Promise.all([
   db.from('site_settings').select('key,value'),db.from('site_editors').select('user_id').eq('user_id',user.id).maybeSingle()
  ]);
  if(!content.error)values={...defaults,...Object.fromEntries((content.data||[]).map(v=>[v.key,v.value]))};
  loaded=user.id;draw();form(!!editor.data&&!editor.error);
 }catch(e){console.warn('Contact details not loaded',e)}
 finally{busy=false}
}
function start(){
 const el=$('#site');if(!el)return;
 const observer=new MutationObserver(()=>{if(el.hidden){loaded='';form(false)}else sync()});
 observer.observe(el,{attributes:true,attributeFilter:['hidden']});
 if(!el.hidden)sync();
 window.TTHK_CONTACT_EDITOR={refresh:sync};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();