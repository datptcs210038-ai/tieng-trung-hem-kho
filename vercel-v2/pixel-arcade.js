
;(()=>{
'use strict';
const D=window.TTHK,flash=document.getElementById('flash');
if(!D||!flash||document.getElementById('pixelArcade'))return;
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/pixel-arcade.css?v=matching-pixel-sets-v9';document.head.append(sheet);
flash.classList.add('pixel-arcade-page');
Array.from(flash.children).forEach(el=>el.classList.add('old-flash-content'));
const root=document.createElement('div');root.id='pixelArcade';
root.innerHTML='<h1 class="pa-title">🐾 Khu Game Pixel</h1><p class="pa-subtitle">Chơi game luyện HSK, mỗi câu đúng nhận 1 xu. Tích xu để nuôi và sắm đồ cho mèo!</p><nav class="pa-tabs" aria-label="Khu game"><button type="button" data-pa-tab="home" aria-selected="true">🎮 Chơi game</button><button type="button" data-pa-tab="cat" aria-selected="false">🐱 Mèo của tui</button><button type="button" data-pa-tab="shop" aria-selected="false">🛍️ Cửa hàng</button><button type="button" data-pa-tab="sets" aria-selected="false">🎀 Bộ phối sẵn</button><button type="button" data-pa-tab="inventory" aria-selected="false">🎒 Tủ đồ</button><span class="pa-wallet">🪙 <span id="paCoins">0</span> xu</span></nav><div id="paContent"></div><div id="paToast" class="pa-toast" hidden role="status" aria-live="polite"></div>';
flash.prepend(root);
const $=sel=>root.querySelector(sel),content=$('#paContent');
const ITEMS=[
 {id:'fish',name:'Cá nhỏ',cost:5,amount:20,category:'food',caption:'+20 no · món đơn giản'},
 {id:'milk',name:'Sữa',cost:8,amount:12,category:'food',caption:'+12 no · món dễ thương'},
 {id:'cookie',name:'Bánh cá',cost:12,amount:16,category:'food',caption:'+16 no · ăn giòn giòn'},
 {id:'salmon',name:'Cơm cá hồi',cost:18,amount:34,category:'food',caption:'+34 no · ăn rất ngon'},
 {id:'bow',name:'Nơ xanh',cost:50,category:'head',caption:'Nơ tóc · phụ kiện đầu'},
 {id:'glasses',name:'Kính tròn',cost:80,category:'head',caption:'Kính dễ thương · phụ kiện đầu'},
 {id:'beanie',name:'Mũ len',cost:110,category:'head',caption:'Mũ mùa lạnh · phụ kiện đầu'},
 {id:'crown',name:'Vương miện',cost:240,category:'head',caption:'Hàng hiếm · phụ kiện đầu'},
 {id:'scarf',name:'Khăn đỏ',cost:95,category:'neck',caption:'Giữ ấm · phụ kiện cổ'},
 {id:'bell',name:'Chuông vàng',cost:125,category:'neck',caption:'Leng keng · phụ kiện cổ'},
 {id:'student',name:'Áo sinh viên',cost:180,category:'body',caption:'Chăm học · trang phục'},
 {id:'aoba',name:'Áo bà ba',cost:260,category:'body',caption:'Nét đẹp miền Tây · trang phục'},
 {id:'royal',name:'Long bào',cost:400,category:'body',caption:'Bộ đồ cao cấp · trang phục'},
 {id:'pajamas',name:'Áo ngủ mây kem',cost:200,category:'body',caption:'Đồ ngủ màu kem và xanh lá nhạt'}
];
const OUTFIT_SETS=[
 {id:'cute',name:'Miu dễ thương',tag:'DỄ THƯƠNG',icon:'🩷',items:['bow','bell'],description:'Nơ xanh · Chuông nhỏ',price:175,scheme:'cute'},
 {id:'campus',name:'Miu đi học',tag:'ĐI HỌC',icon:'📚',items:['glasses','student'],description:'Kính tròn · Áo navy',price:260,scheme:'campus'},
 {id:'heritage',name:'Miu miền Tây',tag:'MIỀN TÂY',icon:'🌾',items:['scarf','aoba'],description:'Khăn đỏ · Áo bà ba tím dịu',price:355,scheme:'heritage'},
 {id:'royal',name:'Miu hoàng gia',tag:'CAO CẤP',icon:'👑',items:['crown','royal'],description:'Vương miện vàng · Long bào đỏ',price:640,scheme:'royal'},
 {id:'sleep',name:'Miu ngủ ngoan',tag:'ĐỒ NGỦ',icon:'🌙',items:['beanie','pajamas'],description:'Mũ len xanh · Áo ngủ mây kem',price:310,scheme:'sleep'}
];
const PATTERNS={
 fish:"................ /......AAAA...... /....AABBBBAA.... /..AABBBBBBBBA... /AABBBBCCCCBBBAAA /..AABBBBBBBBA... /....AABBBBAA.... /......AAAA......",
 milk:"......AAAA...... /.....ABBBBA..... /.....ABBBBA..... /....ABBBBBBA.... /....ABBBBBBA.... /....ABCCCBBA.... /....ABBBBBBA.... /....AAAAAAAA....",
 cookie:"......AAAA...... /....AABBBBAA.... /...ABBBCCBBBA... /..ABBBBBBBBBA.. /..ABBCBBBCCBA.. /...ABBBBBBBBA... /....AABBBBAA.... /......AAAA......",
 salmon:"...AAAAAA....... /..ABBBBBBA...... /..ABCCCCBBA..... /..ABCCCCBBBA.... /...ABBBBBAAA.... /....AAAAA....... /..DDDDDDDDDD.... /..DDDDDDDDDD....",
 bow:"..AABB....BBAA.. /.ABBBBA..ABBBBA. /ABBBCCBAABCCBBBA /ABBBBCCAAABBBBA /..AAAAABBAAAAA.. /......ABBA...... /..AAAAABBAAAAA.. /ABBBBCCAAABBBBA /ABBBCCBAABCCBBBA /.ABBBBA..ABBBBA. /..AABB....BBAA..",
 glasses:"AAABBBBBBBAAA... /A..A.....A..A... /A..A.....A..A... /AAABBBBBBBAAA... /A..A.....A..A... /A..A.....A..A... /AAABBBBBBBAAA...",
 beanie:"......BBBB...... /....BBAABBBA.... /...BAAAAAAAAB... /..BAACAAACAAB.. /..BAAAAAAAAAB.. /.BBBBBBBBBBBBBB. /..BBBBBBBBBBBB..",
 crown:"..B...B...B...B. /..BC..BC..BC..B. /..BCCCBCCCBC..B. /..BBBBBBBBBBBB.. /..BAAAAAAAAAAB.. /..BBBBBBBBBBBB..",
 scarf:"BBBBAAAAAABBBB.. /BAAAAAABAAAAABB. /BAAAAAABAAAAABB. /BBBBAAAAAABBBB.. /.....AAAB....... /.....AAAB....... /.....ABAB.......",
 bell:"......AAAA...... /.....ABBBBA..... /....ABBBBBBA.... /....ABCCCCBA.... /.....ABBBBA..... /......ABBA...... /.......BB.......",
 student:"....BBBBBBBB.... /..BBAAAAAAAABB.. /.BAABCCCCBAAAB.. /.BAABCCCCBAAAB.. /.BAABCCCCBAAAB.. /.BAABCCCCBAAAB.. /.BBBBBBBBBBBBB..",
 aoba:"...BBAA..AABB... /..BAAAAAAAAAAB.. /.BAAABBBBBBAAAB. /.BAAABBBBBBAAAB. /..BAABBBBBBAAB.. /..BAABBBBBBAAB.. /...BBBBBBBBBB...",
 royal:"..BAAAABBAAAAB.. /.BAABBBBBBBAAAB. /BAABCACCCACBAAB /BAABCCCCCCBAAAB /BAABCACCCACBAAB /BAABBBBBBBBBAAB /BBBBBBBBBBBBBBBB"
};
const PALETTE={A:'#203d60',B:'#eeb768',C:'#f47e9c',D:'#79ad7f'};
function pixelSvg(id){
 const pattern=(PATTERNS[id]||PATTERNS.bow).split('/').map(line=>line.trim());
 const w=Math.max(...pattern.map(line=>line.length)),h=pattern.length;
 let html='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" shape-rendering="crispEdges" aria-hidden="true">';
 for(let y=0;y<h;y++)for(let x=0;x<pattern[y].length;x++){
  const col=PALETTE[pattern[y][x]];
  if(col)html+='<rect x="'+x+'" y="'+y+'" width="1" height="1" fill="'+col+'"/>';
 }
 return html+'</svg>';
}
function pixelImg(id){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(pixelSvg(id))}
const GAMES=[
 {id:'pick',name:'Bắt chữ đúng',icon:'🀄',time:60,info:'Chọn đúng nghĩa tiếng Việt'},
 {id:'pinyin',name:'Ghép Pinyin',icon:'🔡',time:60,info:'Chọn đúng cách đọc'},
 {id:'listen',name:'Nghe rồi chọn',icon:'🔊',time:75,info:'Nghe và nhận diện Hán tự'},
 {id:'pairs',name:'Lật thẻ trí nhớ',icon:'🧠',time:90,info:'Ghép 6 cặp từ đúng'},
 {id:'order',name:'Xếp câu',icon:'🧩',time:105,info:'Sắp từ thành câu hoàn chỉnh'}
];
const SENTENCES=[
 {vi:'Tôi thích học tiếng Trung.',parts:['我','喜欢','学习','中文。']},
 {vi:'Ngày mai tôi đến trường.',parts:['明天','我','去','学校。']},
 {vi:'Hôm nay thời tiết rất đẹp.',parts:['今天','天气','很','好。']},
 {vi:'Mẹ tôi đang nấu cơm.',parts:['我妈妈','正在','做饭。']},
 {vi:'Tôi có ba người bạn.',parts:['我','有','三个','朋友。']},
 {vi:'Anh ấy biết nói tiếng Trung.',parts:['他','会','说','中文。']},
 {vi:'Bạn muốn uống trà không?',parts:['你','想','喝茶','吗？']},
 {vi:'Tôi đã ăn cơm rồi.',parts:['我','已经','吃饭','了。']},
 {vi:'Tôi cao hơn anh ấy.',parts:['我','比','他','高。']},
 {vi:'Tôi đang đọc sách ở nhà.',parts:['我','在家','看书。']},
 {vi:'Bạn học tiếng Trung ở đâu?',parts:['你','在哪儿','学习','中文？']},
 {vi:'Chiều mai chúng ta cùng đi chơi.',parts:['明天下午','我们','一起','出去玩。']}
];
const cachedDefault={coins:0,fullness:70,last_hunger_at:new Date().toISOString(),owned_items:[],food_stock:{},equipped:{}};
let catName='Miu Miu',petWalk=false;let pet={...cachedDefault},loadedFor=null,currentView='home',storeFilter='all',run=null,timer=null,finished=false,petAnimation='',animationTimeout=null;
const escapeHtml=t=>String(t??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
let toastTimer;
function toast(msg){const node=$('#paToast');node.textContent=msg;node.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.hidden=true,4500)}
function context(){return D.profileContext?.()||{}}
function statusAccount(){const {db,user}=context();return db&&user?{db,user}:null}
async function call(action,item=null,count=0,runid=null){
 const ctx=statusAccount();if(!ctx)throw Error('Hãy đăng nhập để tích xu và lưu trang phục.');
 const res=await ctx.db.rpc('pixel_pet_do',{p_action:action,p_item:item,p_count:count,p_run:runid});
 if(res.error)throw Error(res.error.message);
 pet=res.data;$('#paCoins').textContent=pet.coins.toLocaleString('vi-VN');return pet;
}
async function loadPet(){
 const ctx=statusAccount();if(!ctx){loadedFor=null;pet={...cachedDefault};catName='Miu Miu';petWalk=false;syncGardenVisibility();return}
 if(loadedFor===ctx.user.id)return;
 pet={...cachedDefault,owned_items:[],food_stock:{},equipped:{}};
 loadedFor=ctx.user.id;
 try{
   await call('status');
   const {data,error}=await ctx.db.from('pixel_pet_profiles').select('pet_name,is_walking').eq('user_id',ctx.user.id).maybeSingle();
   if(!error&&data){catName=data.pet_name||'Miu Miu';petWalk=!!data.is_walking}
   else{catName='Miu Miu';petWalk=false}
   syncGardenVisibility();
   if(currentView!=='play')render();
 }catch(e){loadedFor=null;toast('Không tải được mèo: '+e.message)}
}
function fullnessNow(){
 const hours=Math.max(0,Math.floor((Date.now()-new Date(pet.last_hunger_at).getTime())/3600000));
 return Math.max(0,Number(pet.fullness||0)-hours*15);
}
function mood(){
 if(petAnimation==='eating')return 'eating';
 if(petAnimation==='grooming')return 'grooming';
 const fullness=fullnessNow();
 if(fullness<=25)return 'hungry';
 if(fullness>=90)return 'sleeping';
 return 'happy';
}
function moodText(){const m=mood();return m==='eating'?'Nhăm nhăm! ♡':m==='grooming'?catName+' đang lau mặt! 🐾':m==='hungry'?'Meo… đói rồi!':m==='sleeping'?'No quá… Zzz':'Meo! Chơi cùng tui!'}
function petScene(){
 const catMood=mood();
 const over=Object.entries(pet.equipped||{}).map(([slot,id])=>
  ['head','neck','body'].includes(slot)&&ITEMS.some(x=>x.id===id)?
  '<span class="pa-gear '+slot+'" data-wearable="'+id+'" aria-hidden="true"></span>':'').join('');
 return '<div class="pa-scene"><span class="pa-cat-bubble">'+moodText()+'</span><div class="pa-pet-stage"><div class="pa-cat is-'+catMood+'"><span class="pa-cat-base"></span>'+over+'</div>'+
 (catMood==='sleeping'?'<span class="pa-zzz">Z z z</span>':'')+
 (catMood==='eating'?'<span class="pa-crumb">♥ + ♡</span>':'')+
 '</div></div>';
}
function petStatus(){
 const fullness=fullnessNow();
 const left=3600000-((Date.now()-new Date(pet.last_hunger_at).getTime())%3600000);
 const min=Number.isFinite(left)?Math.ceil(left/60000):60;
 return '<div class="pa-stat"><span>🍓 Độ no</span><span>'+fullness+' / 100</span></div><div class="pa-meter"><div class="pa-meter-fill" style="width:'+fullness+'%"></div></div>'+
 '<p class="pa-hint">Mỗi giờ giảm 15 độ no · Còn khoảng '+min+' phút tới bữa tiếp theo. No vẫn ăn được; trên 90 điểm mèo sẽ ngủ.</p>';
}
function gameButtons(){
 return '<div class="pa-home-cards">'+GAMES.map(g=>
  '<button class="pa-game-card" type="button" data-game="'+g.id+'"><span class="pa-game-icon">'+g.icon+'</span><strong>'+g.name+'</strong><small>'+g.info+'</small><span class="pa-price">⏱ '+g.time+' giây · đúng +1 xu</span></button>'
 ).join('')+'</div>';
}
function tab(which){
 if(run&&!run.done&&currentView==='play'&&which!=='play')finishGame();
 currentView=which;render();
}
function render(){
 $('#paCoins').textContent=Number(pet.coins||0).toLocaleString('vi-VN');
 root.querySelectorAll('[data-pa-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.paTab===currentView||(currentView==='play'&&b.dataset.paTab==='home'))));
 if(currentView==='home'){
  content.innerHTML='<div class="pa-home pa-home-refined"><section class="pa-panel pa-game-hub"><div class="pa-panel-top"><div><h2>🎮 Chọn trò chơi</h2><p>5 thử thách HSK 1–2 · mỗi đáp án đúng +1 xu</p></div><span class="pa-status-pill">🪙 Tích xu nuôi mèo</span></div>'+gameButtons()+'</section>'+
   '<aside class="pa-panel pa-pet-summary"><div class="pa-panel-top"><div><h2>🐱 '+escapeHtml(catName)+'</h2><p>Mèo đồng hành cùng bạn học</p></div><span class="pa-status-pill">'+(mood()==='sleeping'?'💤 Đang ngủ':mood()==='hungry'?'🍽 Đang đói':'💚 Khỏe mạnh')+'</span></div>'+petScene()+petStatus()+
   '<div class="pa-actions"><button class="pa-primary" data-pa-open="cat">🐾 Chăm sóc mèo</button><button class="pa-primary pa-secondary" data-pa-open="shop">🛍️ Mua đồ</button></div></aside></div>';
 }else if(currentView==='cat'){
  const food=ITEMS.filter(x=>x.category==='food');
  content.innerHTML='<div class="pa-home pa-cat-home"><section class="pa-panel pa-cat-room"><div class="pa-panel-top"><div><h2>🏠 Nhà của '+escapeHtml(catName)+'</h2><p>Không gian riêng của bé</p></div><button class="pa-small" data-pa-name>✎ Đổi tên</button></div>'+petScene()+petStatus()+
   '<div class="pa-actions"><button class="pa-primary" data-pa-groom>🐾 Lau mặt</button><button class="pa-primary" data-pa-walk>🌿 '+(petWalk?'Về nhà':'Cho đi dạo')+'</button><button class="pa-primary pa-secondary" data-pa-open="inventory">🎒 Thay đồ</button></div></section>'+
   '<section class="pa-panel pa-cat-care"><div class="pa-panel-top"><div><h2>🍽️ Bữa ăn của mèo</h2><p>Chọn món bạn đã mua để cho bé ăn</p></div><button class="pa-small" data-pa-open="shop">🛒 Cửa hàng →</button></div><div class="pa-shop-grid pa-food-grid">'+food.map(foodCard).join('')+
   '</div><p class="pa-hint">Độ no giảm 15 điểm mỗi giờ. Mèo no vẫn ăn được; từ 90 điểm trở lên sẽ ngủ.</p></section></div>';
 }else if(currentView==='shop'){
  content.innerHTML='<section class="pa-panel pa-shop-panel"><div class="pa-panel-top"><div><h2>🛍️ Cửa hàng Pixel</h2><p>Tích xu chơi game rồi sắm đồ cho '+escapeHtml(catName)+'</p></div><button class="pa-small" data-pa-open="sets">🎀 Xem 5 bộ phối sẵn →</button><span class="pa-status-pill">🪙 '+Number(pet.coins||0)+' xu</span></div>'+
   '<div class="pa-store-groups">'+[
    ['all','Tất cả'],['food','🍣 Đồ ăn'],['head','🎀 Đầu'],['neck','🧣 Cổ'],['body','👕 Trang phục']
   ].map(([id,name])=>'<button type="button" data-filter="'+id+'" aria-pressed="'+(storeFilter===id)+'">'+name+'</button>').join('')+'</div>'+
   '<div class="pa-shop-grid">'+ITEMS.filter(i=>storeFilter==='all'||i.category===storeFilter).map(shopCard).join('')+'</div>'+
   '<p class="pa-hint">Đồ ăn từ 5 xu; phụ kiện từ 50 xu; trang phục quý hiếm đến 400 xu. Đã mua là sở hữu vĩnh viễn.</p></section>';
 }else if(currentView==='sets'){
  content.innerHTML='<section class="pa-panel pa-sets-area"><div class="pa-panel-top"><div><h2>🎀 5 bộ phối cho '+escapeHtml(catName)+'</h2><p>Đồ pixel đồng bộ với mèo xám trắng · Mua một lần, mặc mãi mãi</p></div><span class="pa-status-pill">🪙 '+Number(pet.coins||0)+' xu</span></div>'+
  '<div class="pa-set-grid">'+OUTFIT_SETS.map(outfitSetCard).join('')+'</div><p class="pa-hint">Sở hữu món nào thì không cần mua lại. Mặc set chỉ cần một lần bấm.</p></section>';
 }else if(currentView==='inventory'){
  const owned=ITEMS.filter(i=>i.category!=='food'&&(pet.owned_items||[]).includes(i.id));
  const food=ITEMS.filter(i=>i.category==='food'&&Number((pet.food_stock||{})[i.id]||0)>0);
  content.innerHTML='<div class="pa-home pa-inventory"><section class="pa-panel"><div class="pa-panel-top"><div><h2>🎒 Tủ đồ của '+escapeHtml(catName)+'</h2><p>Phụ kiện mua một lần, mặc được nhiều lần</p></div><button class="pa-small" data-pa-open="shop">+ Mua thêm</button></div>'+petScene()+petStatus()+'</section>'+
   '<section class="pa-panel"><h2>✨ Phụ kiện đang sở hữu</h2>'+
   (owned.length?'<div class="pa-shop-grid">'+owned.map(shopCard).join('')+'</div>':'<div class="pa-empty">Chưa có phụ kiện nào. Chơi game tích xu rồi ghé cửa hàng nha! 🐱</div>')+
   '<h3 class="pa-inventory-label">🍣 Đồ ăn trong kho</h3>'+(food.length?'<div class="pa-shop-grid pa-food-grid">'+food.map(foodCard).join('')+'</div>':'<p class="pa-hint">Kho đồ ăn đang trống.</p>')+'</section></div>';
 }else if(currentView==='play'){renderGame();return}
 content.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>startGame(b.dataset.game));
 content.querySelectorAll('[data-pa-open]').forEach(b=>b.onclick=()=>tab(b.dataset.paOpen));
 content.querySelectorAll('[data-pa-groom]').forEach(b=>b.onclick=()=>groomCat());
 content.querySelectorAll('[data-pa-name]').forEach(b=>b.onclick=()=>renameCat());
 content.querySelectorAll('[data-pa-walk]').forEach(b=>b.onclick=()=>toggleCatWalk());
 content.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{storeFilter=b.dataset.filter;render()});
 content.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>doShopAction(b.dataset.action,b.dataset.item,b));
 content.querySelectorAll('[data-pa-set]').forEach(b=>b.onclick=()=>applyOutfitSet(b.dataset.paSet,b));
}
function foodCard(item){
 const count=Number((pet.food_stock||{})[item.id]||0);
 return '<div class="pa-shop-item"><div class="pa-shop-sprite">'+pixelSvg(item.id)+'</div><strong>'+item.name+'</strong><p>'+item.caption+'</p><span class="pa-price">Còn '+count+' món</span>'+
 '<button data-action="feed" data-item="'+item.id+'" '+(count?'':'disabled')+'>Cho mèo ăn ♥</button></div>';
}
function shopCard(item){
 const owned=(pet.owned_items||[]).includes(item.id),stock=Number((pet.food_stock||{})[item.id]||0);
 const equipped=(pet.equipped||{})[item.category]===item.id;
 const isFood=item.category==='food';
 const text=isFood?'Mua · '+item.cost+' xu':equipped?'✓ Đang mặc':owned?'Mặc lên mèo':'Mua · '+item.cost+' xu';
 const action=isFood?'buy':equipped?'unequip':owned?'equip':'buy';
 return '<div class="pa-shop-item"><div class="pa-shop-sprite">'+(isFood?pixelSvg(item.id):wardrobePreview(item.id))+'</div><strong>'+item.name+'</strong><p>'+item.caption+'</p>'+
 '<span class="pa-price">'+(isFood?'Trong kho: '+stock:owned?'Đã sở hữu ✓':item.cost+' xu')+'</span>'+
 '<button '+(equipped?'class="is-equipped" ':'')+'type="button" data-action="'+action+'" data-item="'+item.id+'">'+text+'</button></div>';
}
let shopping=false;
async function doShopAction(action,id,btn){
 if(shopping)return;
 shopping=true;btn.disabled=true;
 try{
  const payload=action==='unequip'?ITEMS.find(i=>i.id===id)?.category:id;
  await call(action,payload);
  if(action==='feed'){
   petAnimation='eating';clearTimeout(animationTimeout);
   render();
   animationTimeout=setTimeout(()=>{petAnimation='';if(currentView!=='play')render()},1800);
   toast('♥ Bé mèo đang ăn '+ITEMS.find(i=>i.id===id).name+'!');
  }else{
   toast(action==='buy'?'Đã mua '+ITEMS.find(i=>i.id===id).name+'!':action==='equip'?'Mèo đã mặc đồ mới rồi!':'Đã tháo phụ kiện.');
   render();
  }
 }catch(e){toast('Chưa thực hiện được: '+e.message);btn.disabled=false}
 finally{shopping=false}
}
root.querySelectorAll('[data-pa-tab]').forEach(b=>b.onclick=()=>{
 const target=b.dataset.paTab;
 if(run&&!run.done&&currentView==='play')toast('Đã kết thúc ván và ghi nhận những câu đúng.');
 tab(target);
});
function randomize(list){const out=[...list];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function vocab(){
 return (D.words||[]).filter(w=>[1,2].includes(Number(w.l))&&w.h&&w.p&&w.m);
}
async function startGame(id){
 if(!statusAccount()){toast('Vui lòng đăng nhập để tích xu.');return}
 let pool=vocab();
 if(pool.length<20){
  content.innerHTML='<div class="pa-panel">Đang tải từ vựng HSK…</div>';
  try{await D.loadWords();pool=vocab()}catch(e){}
 }
 if(pool.length<20){toast('Chưa tải được kho từ HSK. Hãy thử lại.');tab('home');return}
 const game=GAMES.find(g=>g.id===id);if(!game)return;
 if(timer)clearInterval(timer);
 const sample=id==='order'?randomize(SENTENCES).slice(0,12):randomize(pool).slice(0,id==='pairs'?6:12);
 const uuid=globalThis.crypto?.randomUUID?.()||'00000000-0000-4000-8000-'+Math.random().toString(16).slice(2).padEnd(12,'0').slice(0,12);
 run={id:uuid,game,words:sample,n:0,correct:0,deadline:Date.now()+game.time*1000,done:false,busy:false,rewarded:false,pairs:null,openPairs:[],pairsMatched:new Set()};
 if(id==='pairs')run.pairs=randomize(sample.flatMap((w,i)=>[{pair:i,content:w.h},{pair:i,content:w.m}]));
 if(id==='order')run.orderIndices=[];
 currentView='play';render();
 timer=setInterval(()=>{
  if(!run||run.done){clearInterval(timer);return}
  const sec=Math.max(0,Math.ceil((run.deadline-Date.now())/1000));
  const clock=$('#paClock');if(clock)clock.textContent=sec+'s';
  if(Date.now()>=run.deadline)finishGame();
 },180);
}
function renderGame(){
 if(!run){tab('home');return}
 if(run.done){renderResults();return}
 if(Date.now()>=run.deadline){finishGame();return}
 const game=run.game;
 content.innerHTML='<section class="pa-panel"><div class="pa-play-head"><strong class="pa-play-title">'+game.icon+' '+game.name+'</strong><span class="pa-timer" id="paClock">'+Math.ceil((run.deadline-Date.now())/1000)+'s</span></div>'+
 '<div class="pa-progress">Đúng '+run.correct+' 🪙 · '+(game.id==='pairs'?'Đã ghép '+run.pairsMatched.size+'/6 cặp':'Câu '+Math.min(run.n+1,12)+'/12')+'</div>'+
 '<div id="paGameBody"></div><div class="pa-feedback" id="paFeedback" aria-live="polite"></div><button type="button" data-pa-quit class="pa-primary" style="margin-top:15px">Dừng & nhận kết quả</button></section>';
 content.querySelector('[data-pa-quit]').onclick=finishGame;
 if(game.id==='pairs')renderPairs();
 else if(game.id==='order')renderOrder();
 else renderQuestion();
}
function choicesFor(w,key){
 const unique=[w],seen=new Set([String(w[key]).trim()]);
 for(const other of randomize(vocab())){
  const v=String(other[key]||'').trim();if(seen.has(v)||!v)continue;seen.add(v);unique.push(other);if(unique.length===4)break;
 }
 return randomize(unique);
}
function renderQuestion(){
 if(!run||run.done)return;
 if(run.n>=run.words.length){finishGame();return}
 const w=run.words[run.n],mode=run.game.id;
 const key=mode==='pinyin'?'p':mode==='listen'?'h':'m';
 const all=choicesFor(w,key);
 const panel=$('#paGameBody');if(!panel)return;
 const header=mode==='listen'?'🎧':w.h;
 panel.innerHTML='<div class="pa-question">'+(mode==='listen'?'🔊':escapeHtml(header))+'</div>'+
 '<p class="pa-question-sub">'+(mode==='pinyin'?'Chọn đúng Pinyin':mode==='listen'?'Nghe phát âm rồi chọn chữ Hán':'Chọn nghĩa tiếng Việt đúng')+'</p>'+
 (mode==='listen'?'<button class="pa-primary" id="paListen" style="display:block;margin:0 auto 20px">▶ Nghe lại</button>':'')+
 '<div class="pa-answers" id="paAnswers"></div>';
 if(mode==='listen'){
  $('#paListen').onclick=()=>D.speak(w.h);
  D.speak(w.h);
 }
 const answerBox=$('#paAnswers');
 all.forEach((candidate)=>{
  const b=document.createElement('button');b.type='button';b.textContent=candidate[key];
  b.onclick=()=>{
   if(!run||run.done||run.busy||Date.now()>=run.deadline){finishGame();return}
   run.busy=true;
   const correct=candidate.h===w.h;
   if(correct)run.correct++;
   b.classList.add(correct?'correct':'wrong');
   answerBox.querySelectorAll('button').forEach(btn=>btn.disabled=true);
   $('#paFeedback').textContent=correct?'✓ Chính xác! +1 xu 🪙':'Chưa đúng. Đáp án: '+(w[key]||w.h);
   setTimeout(()=>{
     if(!run||run.done||Date.now()>=run.deadline){if(run&&!run.done)finishGame();return}
     run.n++;run.busy=false;renderGame();
   },560);
  };
  answerBox.append(b);
 });
}
function renderOrder(){
 if(!run||run.done)return;
 if(run.n>=run.words.length){finishGame();return}
 const sentence=run.words[run.n];
 if(!Array.isArray(run.orderIndices))run.orderIndices=[];
 const chosen=run.orderIndices;
 const zone=$('#paGameBody');if(!zone)return;
 // Shuffle once per question and keep stable across every click.
 if(!run.orderTiles||run.orderTilesIndex!==run.n){
  run.orderTiles=randomize(sentence.parts.map((word,i)=>({word,index:i})));
  run.orderTilesIndex=run.n;chosen.length=0;
 }
 const arranged=chosen.map(index=>run.orderTiles[index]);
 zone.innerHTML='<div class="pa-question pa-sentence-question">'+escapeHtml(sentence.vi)+'</div>'+
  '<p class="pa-question-sub">Chạm các mảnh chữ Hán theo đúng thứ tự để xếp thành câu.</p>'+
  '<div class="pa-sentence-built" id="paBuilt" aria-label="Câu đang sắp xếp">'+
  (arranged.length?arranged.map((t,i)=>'<button class="pa-sentence-token is-selected" data-pa-remove="'+i+'">'+escapeHtml(t.word)+'</button>').join(''):'<span class="pa-sentence-placeholder">Chạm vào các từ ở phía dưới…</span>')+'</div>'+
  '<div class="pa-sentence-pieces" id="paPieces">'+run.orderTiles.map((part,index)=>
   '<button type="button" class="pa-sentence-token" data-pa-piece="'+index+'" '+(chosen.includes(index)?'disabled':'')+'>'+escapeHtml(part.word)+'</button>'
  ).join('')+'</div>'+
  '<div class="pa-sentence-actions"><button type="button" class="pa-primary pa-secondary" id="paClearSentence">↺ Làm lại</button><button type="button" class="pa-primary" id="paCheckSentence" '+(chosen.length===run.orderTiles.length?'':'disabled')+'>✓ Kiểm tra</button></div>';
 zone.querySelectorAll('[data-pa-piece]').forEach(b=>b.onclick=()=>{
  if(!run||run.done||run.busy||Date.now()>=run.deadline)return;
  run.orderIndices.push(Number(b.dataset.paPiece));renderOrder();
 });
 zone.querySelectorAll('[data-pa-remove]').forEach(b=>b.onclick=()=>{
  if(!run||run.done||run.busy)return;
  run.orderIndices.splice(Number(b.dataset.paRemove),1);renderOrder();
 });
 $('#paClearSentence').onclick=()=>{run.orderIndices=[];renderOrder()};
 $('#paCheckSentence').onclick=()=>{
  if(!run||run.done||run.busy||Date.now()>=run.deadline){finishGame();return}
  const guess=run.orderIndices.map(i=>run.orderTiles[i].index);
  if(guess.length!==sentence.parts.length)return;
  const good=guess.every((v,i)=>v===i);
  run.busy=true;if(good)run.correct++;
  $('#paFeedback').textContent=good?'✓ Chính xác! +1 xu 🪙':'Câu đúng: '+sentence.parts.join('');
  zone.querySelectorAll('button').forEach(x=>x.disabled=true);
  setTimeout(()=>{
   if(!run||run.done||Date.now()>=run.deadline){if(run&&!run.done)finishGame();return}
   run.n++;run.busy=false;run.orderIndices=[];run.orderTiles=null;renderGame();
  },900);
 };
}
function renderPairs(){
 if(!run||run.done)return;
 const zone=$('#paGameBody');if(!zone)return;
 zone.innerHTML='<p class="pa-question-sub">Lật và ghép chữ Hán với nghĩa tiếng Việt. Đúng mỗi cặp +1 xu.</p><div class="pa-pair-grid" id="paPairs"></div>';
 const parent=$('#paPairs');
 run.pairs.forEach((tile,index)=>{
  const matched=run.pairsMatched.has(tile.pair);
  const opened=run.openPairs.includes(index);
  const b=document.createElement('button');b.type='button';
  b.className=matched?'matched':opened?'open':'';
  b.textContent=matched||opened?tile.content:'?';
  b.disabled=matched;
  b.onclick=()=>{
   if(!run||run.done||run.busy||matched||Date.now()>=run.deadline){if(run&&!run.done&&Date.now()>=run.deadline)finishGame();return}
   if(run.openPairs.includes(index))return;
   run.openPairs.push(index);renderPairs();
   if(run.openPairs.length!==2)return;
   run.busy=true;
   const [a,z]=run.openPairs;
   if(run.pairs[a].pair===run.pairs[z].pair){
    run.pairsMatched.add(run.pairs[a].pair);
    run.correct++;$('#paFeedback').textContent='✓ Ghép đúng! +1 xu 🪙';
    setTimeout(()=>{
     if(!run||run.done)return;
     run.openPairs=[];run.busy=false;
     if(run.pairsMatched.size===6)finishGame();else renderGame();
    },380);
   }else{
    $('#paFeedback').textContent='Hai ô chưa khớp, thử lại nhé.';
    setTimeout(()=>{if(!run||run.done)return;run.openPairs=[];run.busy=false;renderPairs()},850);
   }
  };
  parent.append(b);
 });
}
async function finishGame(){
 const completed=run;
 if(!completed||completed.done)return;
 completed.done=true;clearInterval(timer);timer=null;
 if(currentView==='play')renderResults();
 if(completed.correct>0)await claimCoins(completed);
}
async function claimCoins(rewardRun=run){
 if(!rewardRun||!rewardRun.done||rewardRun.rewarded||rewardRun.claiming||rewardRun.correct<1)return;
 rewardRun.claiming=true;
 const currentNote=()=>run===rewardRun&&currentView==='play'?$('#paRewardStatus'):null;
 const note=currentNote();if(note)note.textContent='Đang lưu xu vào tài khoản…';
 try{
  await call('reward',rewardRun.game.id,rewardRun.correct,rewardRun.id);
  rewardRun.rewarded=true;
  const visible=currentNote();
  if(visible)visible.textContent='🪙 Đã nhận '+rewardRun.correct+' xu! Xu đã được lưu vào tài khoản.';
  toast('Tuyệt vời! +'+rewardRun.correct+' xu 🪙');
 }catch(e){
  const note=currentNote();
  if(note)note.textContent='Chưa nhận được xu: '+e.message+'. Bấm “Thử nhận xu” để thử lại.';
  if(run===rewardRun){const retry=$('#paRetryReward');if(retry)retry.hidden=false}
 }finally{rewardRun.claiming=false}
}
function renderResults(){
 if(!run)return;
 const score=run.correct,game=run.game;
 content.innerHTML='<section class="pa-panel pa-results"><strong>'+(Date.now()>=run.deadline?'⏰ Hết giờ!':'🌟 Hoàn thành!')+'</strong>'+
 '<p>'+game.name+' · đúng '+score+(game.id==='pairs'?'/6 cặp':'/12 câu')+' · thưởng '+score+' xu.</p>'+
 '<p id="paRewardStatus">'+(score?'Đang chuyển xu vào ví…':'Hãy luyện tiếp để tích xu nuôi mèo nhé!')+'</p>'+
 '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><button type="button" class="pa-primary" id="paRetryReward" hidden>🪙 Thử nhận xu</button><button type="button" class="pa-primary" id="paPlayAgain">↺ Chơi lại</button><button type="button" class="pa-primary" id="paBackHome">🐱 Về nhà mèo</button></div></section>';
 $('#paRetryReward').onclick=()=>claimCoins(run);
 $('#paPlayAgain').onclick=()=>startGame(game.id);
 $('#paBackHome').onclick=()=>{run=null;tab('home')};
}

/* Virtual wardrobe V7: redesigned pixel outfits fitted to each native 128×100 cat pose.
 * Existing owned_items/equipped IDs and shop prices stay unchanged. */

/* WARDROBE v8 · clothes are fitted to the *actual* 64×50 kitten, drawn on a matching 128×100 transparent artboard.
   No rectangular costumes, no detached jacket, no accessory covering the face. */
const WARDROBE_COLORS={
 ink:'#3f3c49',seam:'#46616f',white:'#fff7ee',blue:'#65aacc',blueDark:'#426d99',blueLight:'#a1dce6',
 sage:'#70a58e',sageDark:'#3d7b68',rose:'#f08aa9',roseLight:'#ffbfd4',
 gold:'#f3c763',amber:'#a97936',navy:'#405d83',purple:'#987db1',
 purpleLight:'#d1b6db',red:'#bf596e',redLight:'#efa1ad',soft:'#f5e1c7'
};
const CLOTHES={student:['navy','blue','blueLight'],aoba:['purple','purpleLight','roseLight'],royal:['red','redLight','gold'],pajamas:['sage','soft','roseLight']};
function wearableSvg(id,pose='idle'){
 const p=[],C=WARDROBE_COLORS;
 const r=(x,y,w,h,color)=>p.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+(C[color]||color)+'"/>');
 const poly=(pts,color,stroke='ink',sw=1.5)=>p.push('<polygon points="'+pts+'" fill="'+(C[color]||color)+'" stroke="'+(C[stroke]||stroke)+'" stroke-width="'+sw+'" stroke-linejoin="bevel"/>');
 const line=(path,color,width=2)=>p.push('<path d="'+path+'" fill="none" stroke="'+(C[color]||color)+'" stroke-width="'+width+'" stroke-linejoin="bevel"/>');
 const sleep=pose==='sleep',groom=pose.startsWith('groom'),eat=pose==='eat';
 const moving=pose.startsWith('walk');
 // All coordinates are in the same 128x100 space as the kitten: head x~58–118; torso x~25–75.
 const dx=pose==='walk2'?1:0,dy=pose==='walk2'?2:0;
 if(CLOTHES[id]){
  const [main,panel,trim]=CLOTHES[id];
  if(sleep){
   // A small soft fabric patch rests on the curled back. Not a box over the sleeping kitten.
   poly('49,66 54,58 67,54 78,56 85,64 82,71 72,74 59,73',main,'ink',1.3);
   line('M54 63 H74',panel,3);
   r(67,68,6,2,trim);
  }else if(groom){
   // Grooming swaps to a front-facing pose; only a small collar under the chin remains.
   poly('52,76 60,72 70,73 76,78 70,83 58,83',main,'ink',1.2);
   r(61,76,7,3,trim);
  }else if(eat){
   // The kitten bends toward the bowl. A thin tailored band on the back remains.
   poly('72,54 85,50 101,54 106,61 99,66 85,63 76,65',main,'ink',1.2);
   line('M82 55 L99 57',panel,2.4);
  }else{
   // Back-shaped pixel vest. Silhouette follows the sloping cat torso instead of a square jacket.
   const wrap='<g transform="translate('+dx+' '+dy+')">';
   p.push(wrap);
   poly('28,53 34,49 43,47 52,48 59,54 61,63 64,69 60,76 50,79 42,76 32,77 25,70 25,61',main,'ink',1.6);
   // Keep the shoulders rounded and give the tail a free area.
   poly('31,56 37,51 46,50 53,53 56,59 55,67 51,72 42,71 33,72 30,67',panel,'none',0);
   line('M34 55 L40 53 L47 54',trim,2.4);
   r(35,61,7,2,trim);
   r(36,66,4,2,trim);
   // Tailored neckline joins the back vest to the chest: visually a shirt, not a backpack.
   poly('59,60 66,66 72,72 70,83 65,83 63,72 57,66',main,'ink',1.3);
   line('M60 61 L68 67 L65 72',id==='royal'?'gold':'white',2.8);
   if(id==='student'){
    // Very small varsity-like trim and one gold stitch, not a floating blue rectangle.
    r(55,59,3,9,'white');r(45,62,4,3,'gold');
    r(34,70,5,2,'blueLight');
   }else if(id==='aoba'){
    r(51,55,2,17,'white');r(54,60,2,2,'gold');r(54,67,2,2,'gold');
   }else if(id==='pajamas'){
    r(54,58,3,8,'white');r(42,59,3,3,'roseLight');
    r(35,69,3,2,'white');r(48,67,3,2,'sageDark');r(34,75,16,2,'roseLight');
   }else{
    r(52,55,3,14,'gold');r(39,59,6,4,'gold');r(39,61,3,2,'red');
    r(31,72,20,2,'gold');
   }
   p.push('</g>');
  }
 }else if(id==='bow'){
  if(sleep){poly('75,35 84,33 85,41 79,44','blue');poly('86,36 93,33 96,40 87,42','blue');r(84,36,4,5,'navy')}
  else if(groom){
   poly('71,16 80,13 81,19 74,21','blue');poly('82,17 90,13 92,20 84,21','blue');r(80,16,4,5,'navy');
  }else{
   poly('78,17 87,13 88,20 82,23','blue');poly('89,17 97,13 99,21 91,22','blue');r(86,17,6,5,'navy');r(80,16,4,2,'blueLight');
  }
 }else if(id==='glasses'){
  if(!sleep&&!groom&&!eat){
   line('M66 40 H82 V54 H67 Z', 'navy',2.8);
   line('M88 40 H106 V54 H88 Z','navy',2.8);
   r(82,43,6,3,'navy');r(70,43,3,3,'blueLight');r(91,43,3,3,'blueLight');
  }
 }else if(id==='beanie'){
  if(sleep){
   // Small soft nightcap stays visible when the kitten curls up.
   poly('32,54 34,44 42,36 51,35 59,39 64,49 64,54','sage');
   r(32,53,33,5,'sageDark');r(59,35,6,6,'roseLight');
   r(38,44,8,3,'blueLight');
  }else if(!eat){
   const sx=groom?-13:0,sy=groom?1:0;
   p.push('<g transform="translate('+sx+' '+sy+')">');
   poly('71,27 72,18 79,12 85,9 98,10 105,15 107,26','sage');
   r(71,24,36,6,'sageDark');r(75,15,6,3,'blueLight');r(95,17,6,3,'blueLight');r(88,6,7,6,'rose');p.push('</g>');
  }
 }else if(id==='crown'){
  if(!sleep&&!eat&&!groom){
   poly('73,27 73,14 81,20 87,11 94,20 102,12 103,27','gold');
   r(74,24,28,5,'amber');r(79,21,4,4,'rose');r(93,21,4,4,'blue');
  }
 }else if(id==='scarf'){
  if(sleep){
   poly('60,70 72,71 76,76 63,78','rose');r(68,76,5,7,'redLight');
  }else if(groom){
   poly('50,72 62,70 76,73 72,78 56,79','rose');r(65,78,6,8,'redLight');
  }else{
   poly('54,61 64,58 71,63 66,69 56,70','rose');r(60,67,6,11,'red');r(61,70,3,5,'roseLight');
  }
 }else if(id==='bell'){
  if(sleep){r(70,75,11,2,'navy');r(73,77,5,5,'gold');r(75,81,2,2,'ink')}
  else if(groom){r(57,73,16,3,'navy');r(63,76,6,6,'gold');r(65,80,2,2,'ink')}
  else{
   line('M55 63 L67 64','navy',3);
   poly('59,67 66,67 68,73 63,78 58,73','gold');
   r(62,72,3,3,'amber');
  }
 }
 return '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="100" viewBox="0 0 128 100" shape-rendering="crispEdges" aria-hidden="true">'+p.join('')+'</svg>';
}
function wardrobeUrl(id,pose){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(wearableSvg(id,pose))}
function drawWornClothes(pose){
 const cat=$('.pa-cat');if(!cat)return;
 cat.querySelectorAll('.pa-gear[data-wearable]').forEach(el=>{
  const id=el.dataset.wearable||'';
  if(el.dataset.frame===pose)return;
  el.dataset.frame=pose;
  el.style.setProperty('background-image','url("'+wardrobeUrl(id,pose)+'")','important');
  el.style.setProperty('background-size','100% 100%','important');
  el.style.setProperty('background-position','center','important');
  el.style.setProperty('background-repeat','no-repeat','important');
 });
}

function outfitSetCard(set){
 const missing=set.items.filter(id=>!(pet.owned_items||[]).includes(id));
 const due=missing.reduce((n,id)=>n+(ITEMS.find(i=>i.id===id)?.cost||0),0);
 const wearing=set.items.every(id=>pet.equipped?.[ITEMS.find(x=>x.id===id)?.category]===id)&&Object.keys(pet.equipped||{}).length===set.items.length;
 const sorted=set.items.filter(id=>ITEMS.find(i=>i.id===id)?.category==='body').concat(set.items.filter(id=>ITEMS.find(i=>i.id===id)?.category==='neck'),set.items.filter(id=>ITEMS.find(i=>i.id===id)?.category==='head'));
 const preview='<span class="pa-shop-preview pa-set-preview" aria-hidden="true"><span class="pa-shop-cat"></span>'+sorted.map((id,i)=>'<span class="pa-shop-wear pa-set-layer pa-set-layer-'+i+'" style="background-image:url(&quot;'+wardrobeUrl(id,'idle')+'&quot;)"></span>').join('')+'</span>';
 return '<article class="pa-set-card pa-set-'+set.scheme+'"><div class="pa-set-top"><span>'+set.icon+' '+set.tag+'</span><span>🪙 '+set.price+' xu</span></div>'+
 preview+'<h3>'+set.name+'</h3><p>'+set.description+'</p><div class="pa-set-detail">'+(missing.length?'Cần mua: '+missing.map(id=>ITEMS.find(i=>i.id===id)?.name||id).join(' + '):'Đã sở hữu đầy đủ ✓')+'</div>'+
 '<button type="button" data-pa-set="'+set.id+'" '+(wearing?'disabled':'')+' '+(due>Number(pet.coins||0)?'disabled title="Chưa đủ xu"':'')+'>'+
 (wearing?'✓ Đang mặc':due?'Mua & mặc · '+due+' xu':'Mặc set miễn phí')+'</button></article>';
}
let outfitSetBusy=false;
async function applyOutfitSet(id,btn){
 const ctx=statusAccount(),set=OUTFIT_SETS.find(x=>x.id===id);
 if(!ctx||!set||outfitSetBusy){if(!ctx)toast('Đăng nhập để thay đồ cho mèo.');return}
 const missing=set.items.filter(x=>!(pet.owned_items||[]).includes(x));
 const due=missing.reduce((n,x)=>n+(ITEMS.find(i=>i.id===x)?.cost||0),0);
 if(due>Number(pet.coins||0)){toast('Mèo cần thêm '+(due-pet.coins)+' xu nữa nha!');return}
 outfitSetBusy=true;btn.disabled=true;
 try{
  const {data,error}=await ctx.db.rpc('pixel_pet_apply_set',{p_set:id,p_buy_missing:!!missing.length});
  if(error)throw Error(error.message);
  pet=data;$('#paCoins').textContent=Number(data.coins||0).toLocaleString('vi-VN');
  render();paintKitten(performance.now());
  toast('Đã phối bộ '+set.name+' cho mèo! '+(data.paid?'−'+data.paid+' xu':'Không tốn thêm xu')+' 🐾');
 }catch(e){toast('Chưa thay được set: '+e.message);btn.disabled=false}
 finally{outfitSetBusy=false}
}

function wardrobePreview(id){
 const url=wardrobeUrl(id,'idle');
 return '<span class="pa-shop-preview"><span class="pa-shop-cat" aria-hidden="true"></span><span class="pa-shop-wear" aria-hidden="true" style="background-image:url(&quot;'+url+'&quot;)"></span></span>';
}

const originalPage=D.page;
if(typeof originalPage==='function'){
 D.page=function(id){
  const out=originalPage.apply(this,arguments);
  if(id==='flash')loadPet().then(()=>{if(currentView!=='play')render()});
  return out;
 };
}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden)return;
 if(run&&!run.done&&Date.now()>=run.deadline)finishGame();
 if(!run||run.done){if(currentView==='home'||currentView==='cat')render()}
});
window.addEventListener('focus',()=>{if(run&&!run.done&&Date.now()>=run.deadline)finishGame()});
setInterval(()=>{if(!root.isConnected)return;if(currentView==='home'||currentView==='cat')renderPetOnly()},30000);
function renderPetOnly(){
 const sc=$('.pa-scene'),stat=$('.pa-meter-fill');
 if(!sc||!stat)return;
 // Avoid disrupting eating animation; hunger changes only at hourly boundaries.
 const status=$('.pa-stat');
 if(!status)return;
 const num=fullnessNow();
 stat.style.width=num+'%';
 const label=status.querySelector('span:last-child');if(label)label.textContent=num+' / 100';
 if(mood()!==petAnimation&&sc.querySelector('.pa-cat')){
  const m=mood(),cat=sc.querySelector('.pa-cat');
  cat.classList.remove('is-hungry','is-sleeping','is-happy','is-eating');cat.classList.add('is-'+m);
  const bubble=sc.querySelector('.pa-cat-bubble');if(bubble)bubble.textContent=moodText();
 }
}


/* PIXEL CAT v6 · single pixel atlas, frame-accurate grooming and RAF-based walking on a fixed ground line */
const POSES={idle:[0,0],blink:[1,0],walk1:[2,0],walk2:[3,0],groom1:[0,1],groom2:[1,1],eat:[2,1],sleep:[3,1]};
const animationOrigin=performance.now();
const reducedMotion=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
let prevRoomFraction=.53,prevRoomDirection=1,prevHeroDirection=1,hasTrack=false,lastRenderMood='';
function catTravel(timeMs,walkMs=8000,restMs=1900){
 const cycle=2*(walkMs+restMs),t=((timeMs%cycle)+cycle)%cycle;
 if(t<walkMs)return {fraction:t/walkMs,direction:1,moving:true};
 if(t<walkMs+restMs)return {fraction:1,direction:1,moving:false};
 if(t<2*walkMs+restMs)return {fraction:1-(t-walkMs-restMs)/walkMs,direction:-1,moving:true};
 return {fraction:0,direction:-1,moving:false};
}
function setCatSprite(node,state){
 if(!node)return;
 const [col,row]=POSES[state]||POSES.idle;
 if(node.dataset.catPose===state&&node.dataset.catAtlas==='v6')return;
 node.dataset.catPose=state;node.dataset.catAtlas='v6';
 if(window.TTHK_CAT_ATLAS){
  node.style.setProperty('background-image','url("'+window.TTHK_CAT_ATLAS+'")','important');
  node.style.setProperty('background-size','400% 200%','important');
  node.style.setProperty('background-position',(col*100/3)+'% '+(row*100)+'%','important');
 }else{
  const fallback=state==='groom1'?'groom1':state==='groom2'?'groom2':state;
  node.style.setProperty('background-image','url("/kitten-v2-'+fallback+'.svg")','important');
  node.style.setProperty('background-size','contain','important');
  node.style.setProperty('background-position','center','important');
 }
 node.style.setProperty('background-repeat','no-repeat','important');
 node.style.setProperty('image-rendering','pixelated','important');
 node.style.setProperty('animation','none','important');
}
function ensureHomeTrack(){
 const hero=document.querySelector('#intro .hero');
 if(!hero)return null;
 let track=hero.querySelector('.garden-cat-lane-overlay');
 if(!track){
  track=document.createElement('div');
  track.className='garden-cat-lane-overlay';
  track.setAttribute('aria-hidden','true');
  hero.append(track);
 }
 return hero;
}
function syncGardenVisibility(){
 const hero=document.querySelector('#intro .garden-running-cat');
 if(!hero)return;
 const show=!!petWalk && mood()!=='sleeping' && mood()!=='eating' && mood()!=='grooming';
 hero.style.setProperty('display',show?'block':'none','important');
 const name=hero.querySelector('.garden-cat-name');
 if(name)name.textContent=catName;
}
async function changePreference(name,walk){
 const ctx=statusAccount();
 if(!ctx){toast('Hãy đăng nhập để đặt tên hoặc cho mèo đi dạo.');return}
 const {data,error}=await ctx.db.rpc('pixel_pet_preferences',{p_name:name===undefined?null:name,p_walk:walk===undefined?null:walk});
 if(error){toast('Không lưu được: '+error.message);return}
 catName=data.pet_name||'Miu Miu';petWalk=!!data.is_walking;
 render();syncGardenVisibility();paintKitten(performance.now());
}
function renameCat(){
 const value=window.prompt('Bạn muốn đặt tên bé mèo là gì? (1–24 ký tự)',catName);
 if(value===null)return;
 const name=value.trim();
 if(!name||[...name].length>24){toast('Tên cần từ 1 đến 24 ký tự.');return}
 changePreference(name,undefined);
}
function toggleCatWalk(){
 if(petAnimation){toast('Đợi mèo làm xong hoạt động này nha!');return}
 if(mood()==='sleeping'){toast(catName+' đang ngủ. Đợi bé thức dậy rồi đi dạo nha!');return}
 changePreference(undefined,!petWalk);
}
function groomCat(){
 if(petAnimation==='eating'||petAnimation==='grooming'){toast('Bé đang bận một chút nhé!');return}
 petAnimation='grooming';clearTimeout(animationTimeout);
 if(currentView!=='play')render();
 syncGardenVisibility();
 paintKitten(performance.now());
 animationTimeout=setTimeout(()=>{
  petAnimation='';
  if(currentView!=='play')render();
  syncGardenVisibility();
  paintKitten(performance.now());
 },3200);
}
function tickFace(time,moving){
 if(moving)return Math.floor(time/155)%2?'walk1':'walk2';
 // Tiny idle blink every 5 seconds; spontaneous, gentle face wash.
 const loop=time%24500;
 if(loop>16800&&loop<17700)return Math.floor(time/230)%2?'groom1':'groom2';
 if(loop>4600&&loop<4930)return 'blink';
 return 'idle';
}
function paintKitten(now=performance.now()){
 const elapsed=now-animationOrigin;
 const moodNow=mood();
 const roomTrip=catTravel(elapsed,7000,2300);
 const canMove=moodNow==='happy'&&!reducedMotion;
 const roomMoving=canMove&&roomTrip.moving;
 let pose;
 if(moodNow==='sleeping')pose='sleep';
 else if(moodNow==='eating')pose='eat';
 else if(moodNow==='grooming')pose=Math.floor(elapsed/230)%2?'groom1':'groom2';
 else if(moodNow==='hungry')pose=Math.floor(elapsed/5500)%2?'blink':'idle';
 else pose=tickFace(elapsed,roomMoving);
 const base=$('.pa-cat-base'),scene=$('.pa-scene'),stage=$('.pa-pet-stage'),body=$('.pa-cat');
 setCatSprite(base,pose);
 drawWornClothes(pose);
 if(scene&&stage){
  if(canMove){prevRoomFraction=roomTrip.fraction;prevRoomDirection=roomTrip.direction}
  const travel=Math.max(0,scene.clientWidth-stage.offsetWidth-20);
  const frac=moodNow==='sleeping'?.72:prevRoomFraction;
  const x=10+Math.max(0,Math.min(1,frac))*travel;
  stage.style.setProperty('transform','translate3d('+x.toFixed(2)+'px,0,0)','important');
 }
 if(body){
  body.style.setProperty('transform','scaleX('+prevRoomDirection+')','important');
  const updated=moodNow!==lastRenderMood;
  if(updated){body.dataset.mood=moodNow;lastRenderMood=moodNow}
  body.classList.toggle('is-walking',roomMoving);
  body.classList.toggle('is-grooming',moodNow==='grooming');
 }
 const heroCat=document.querySelector('#intro .garden-running-cat');
 if(heroCat){
  const visible=!!petWalk && moodNow!=='sleeping' && moodNow!=='eating' && moodNow!=='grooming';
  heroCat.style.setProperty('display',visible?'block':'none','important');
  if(visible){
   const hero=ensureHomeTrack();
   const trip=catTravel(elapsed,9000,2400);
   const sprite=heroCat.querySelector('.garden-cat-sprite');
   const hpose=trip.moving?tickFace(elapsed,true):tickFace(elapsed,false);
   setCatSprite(sprite,hpose);
   const laneWidth=Math.max(0,(hero?.clientWidth||800)-heroCat.offsetWidth-20);
   const x=10+Math.max(0,Math.min(1,trip.fraction))*laneWidth;
   heroCat.style.setProperty('animation','none','important');
   heroCat.style.setProperty('transform','translate3d('+x.toFixed(2)+'px,0,0)','important');
   sprite?.style.setProperty('transform','scaleX('+trip.direction+')','important');
   if(prevHeroDirection!==trip.direction)prevHeroDirection=trip.direction;
   let name=heroCat.querySelector('.garden-cat-name');
   if(!name){name=document.createElement('span');name.className='garden-cat-name';heroCat.append(name)}
   name.textContent=catName;
  }
 }
}
function animateKitten(t){
 if(!document.hidden)paintKitten(t);
 window.requestAnimationFrame(animateKitten);
}
window.requestAnimationFrame(animateKitten);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)paintKitten(performance.now())});
if(window.TTHK_CAT_ATLAS)root.style.setProperty('--cat-atlas-preview','url("'+window.TTHK_CAT_ATLAS+'")');
loadPet().then(()=>{render();paintKitten(performance.now());syncGardenVisibility()});
})();
