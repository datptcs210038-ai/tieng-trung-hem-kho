
;(()=>{
'use strict';
const D=window.TTHK,flash=document.getElementById('flash');
if(!D||!flash||document.getElementById('pixelArcade'))return;
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/pixel-arcade.css?v=cat-outfits-v7';document.head.append(sheet);
flash.classList.add('pixel-arcade-page');
Array.from(flash.children).forEach(el=>el.classList.add('old-flash-content'));
const root=document.createElement('div');root.id='pixelArcade';
root.innerHTML='<h1 class="pa-title">🐾 Khu Game Pixel</h1><p class="pa-subtitle">Chơi game luyện HSK, mỗi câu đúng nhận 1 xu. Tích xu để nuôi và sắm đồ cho mèo!</p><nav class="pa-tabs" aria-label="Khu game"><button type="button" data-pa-tab="home" aria-selected="true">🎮 Chơi game</button><button type="button" data-pa-tab="cat" aria-selected="false">🐱 Mèo của tui</button><button type="button" data-pa-tab="shop" aria-selected="false">🛍️ Cửa hàng</button><button type="button" data-pa-tab="inventory" aria-selected="false">🎒 Tủ đồ</button><span class="pa-wallet">🪙 <span id="paCoins">0</span> xu</span></nav><div id="paContent"></div><div id="paToast" class="pa-toast" hidden role="status" aria-live="polite"></div>';
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
 {id:'royal',name:'Long bào',cost:400,category:'body',caption:'Bộ đồ cao cấp · trang phục'}
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
  content.innerHTML='<section class="pa-panel pa-shop-panel"><div class="pa-panel-top"><div><h2>🛍️ Cửa hàng Pixel</h2><p>Tích xu chơi game rồi sắm đồ cho '+escapeHtml(catName)+'</p></div><span class="pa-status-pill">🪙 '+Number(pet.coins||0)+' xu</span></div>'+
   '<div class="pa-store-groups">'+[
    ['all','Tất cả'],['food','🍣 Đồ ăn'],['head','🎀 Đầu'],['neck','🧣 Cổ'],['body','👕 Trang phục']
   ].map(([id,name])=>'<button type="button" data-filter="'+id+'" aria-pressed="'+(storeFilter===id)+'">'+name+'</button>').join('')+'</div>'+
   '<div class="pa-shop-grid">'+ITEMS.filter(i=>storeFilter==='all'||i.category===storeFilter).map(shopCard).join('')+'</div>'+
   '<p class="pa-hint">Đồ ăn từ 5 xu; phụ kiện từ 50 xu; trang phục quý hiếm đến 400 xu. Đã mua là sở hữu vĩnh viễn.</p></section>';
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
const WARDROBE_COLORS={
 outline:'#323347',white:'#fdf6e9',blue:'#6bbbd5',blueLight:'#bce5e8',
 sage:'#70aa8e',sageDark:'#438876',rose:'#e98a9b',roseLight:'#ffd6cd',
 amber:'#ffc976',amberDark:'#ad7b3d',navy:'#476387',purple:'#8c77a9',
 purpleLight:'#d1b8db',red:'#b95468',redLight:'#f38fa1',gold:'#f5c45e'
};
const WARDROBE_POSES={
 idle:{hx:90,hy:13,nx:75,ny:61,bx:46,by:52,sx:1,sy:1},
 blink:{hx:90,hy:13,nx:75,ny:61,bx:46,by:52,sx:1,sy:1},
 walk1:{hx:91,hy:13,nx:77,ny:62,bx:46,by:52,sx:1,sy:1},
 walk2:{hx:91,hy:13,nx:78,ny:61,bx:48,by:53,sx:1,sy:1},
 groom1:{hx:76,hy:14,nx:77,ny:74,bx:58,by:72,sx:.75,sy:.65},
 groom2:{hx:78,hy:15,nx:79,ny:76,bx:58,by:76,sx:.75,sy:.58},
 eat:{hx:66,hy:26,nx:80,ny:64,bx:102,by:55,sx:.67,sy:.72},
 sleep:{hx:46,hy:52,nx:64,ny:78,bx:90,by:60,sx:.7,sy:.66}
};
function wearableSvg(id,pose='idle'){
 const z=WARDROBE_POSES[pose]||WARDROBE_POSES.idle;
 const C=WARDROBE_COLORS,parts=[];
 const R=(x,y,w,h,fill)=>parts.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+(C[fill]||fill)+'"/>');
 const P=(d,fill,stroke='outline',sw=1.8)=>parts.push('<path d="'+d+'" fill="'+(C[fill]||fill)+'" stroke="'+(C[stroke]||stroke)+'" stroke-width="'+sw+'" stroke-linejoin="miter"/>');
 const H=(s)=>parts.push('<g transform="translate('+z.hx+' '+z.hy+')">'+s+'</g>');
 const N=(s)=>parts.push('<g transform="translate('+z.nx+' '+z.ny+')">'+s+'</g>');
 const B=(s)=>parts.push('<g transform="translate('+z.bx+' '+z.by+') scale('+z.sx+' '+z.sy+')">'+s+'</g>');
 const group=(fn)=>{const n=parts.length;fn();return parts.splice(n).join('')};
 const sleep=pose==='sleep',eat=pose==='eat',groom=pose.startsWith('groom');
 // Head accessories are attached to the actual skull, not to a fixed CSS rectangle.
 if(id==='bow'){
   const shape=group(()=>{
    P('M -17 -5 H -12 L -5 -2 L -5 -8 L -12 -10 L -17 -8 Z','blue');
    P('M -1 -8 L 4 -10 L 12 -8 V -3 L 4 -2 L -1 -5 Z','blue');
    R(-6,-9,6,9,'navy');R(-14,-8,3,3,'blueLight');R(7,-8,3,3,'blueLight');
   });
   parts.push('<g transform="translate('+(z.hx+(sleep?-5:0))+' '+(z.hy+(sleep?5:0))+') scale('+(sleep?0.65:.98)+')">'+shape+'</g>');
 }else if(id==='glasses'){
   if(!eat&&!sleep&&!groom)H(group(()=>{
    P('M -21 20 H -6 V 33 H -21 Z','none','navy',2.5);
    P('M 4 20 H 20 V 33 H 4 Z','none','navy',2.5);
    R(-6,22,10,2,'navy');R(-23,22,3,3,'navy');R(20,22,3,3,'navy');
    R(-18,23,3,2,'blueLight');R(7,23,3,2,'blueLight');
   }));
 }else if(id==='beanie'){
   if(!sleep&&!eat)H(group(()=>{
    P('M -24 9 V 2 H -20 V -5 H -14 V -11 H 6 V -8 H 13 V -3 H 17 V 9 Z','sage');
    R(-21,2,35,5,'sageDark');R(-19,-3,10,3,'blueLight');R(1,-6,9,3,'blueLight');
    R(-5,-15,8,5,'rose');R(-3,-16,3,3,'roseLight');
   }));
 }else if(id==='crown'){
   if(!sleep&&!eat)H(group(()=>{
    P('M -21 10 V -6 L -13 0 L -6 -10 L 2 0 L 11 -7 V 10 Z','gold');
    R(-20,5,31,6,'amberDark');R(-17,7,25,3,'gold');
    R(-9,0,5,5,'rose');R(3,2,4,4,'blue');
   }));
 }else if(id==='scarf'){
   if(!sleep)N(group(()=>{
    P('M -13 -4 H 11 V 3 H 4 V 15 H -3 V 5 H -13 Z','rose');
    R(-10,-2,17,3,'roseLight');R(-1,6,5,8,'red');R(-12,4,8,2,'redLight');
   }));
 }else if(id==='bell'){
   N(group(()=>{
    R(-12,-7,19,3,'navy');R(-7,-5,4,7,'sage');
    P('M -5 1 H 1 V 4 H 4 V 10 H -8 V 4 H -5 Z','gold');
    R(-6,5,8,3,'amber');R(-3,9,3,3,'outline');
   }));
 }else if(id==='student'){
   B(group(()=>{
    P('M -26 3 H -10 L -5 -1 H 13 L 22 5 V 26 H -26 Z','navy');
    R(-21,9,14,17,'blue');R(7,9,12,17,'blue');
    P('M -8 0 L 1 12 L 8 0 L 3 -1 H -3 Z','white');
    R(0,10,3,16,'amber');R(12,12,4,4,'gold');
    R(-22,23,10,4,'blueLight');R(11,23,8,4,'blueLight');
   }));
 }else if(id==='aoba'){
   B(group(()=>{
    P('M -25 3 H -6 L 0 -1 H 8 L 20 5 V 27 H -26 Z','purple');
    R(-23,8,10,17,'purpleLight');R(9,9,8,17,'purpleLight');
    P('M -7 0 L 4 10 V 27 H -2 V 11 Z','white');
    R(6,9,3,3,'amber');R(6,16,3,3,'amber');R(6,23,3,3,'amber');
    R(-23,25,39,4,'navy');
   }));
 }else if(id==='royal'){
   B(group(()=>{
    P('M -27 3 H -9 L 1 -1 H 12 L 23 6 V 29 H -28 Z','red');
    R(-24,8,9,18,'redLight');R(14,9,6,18,'redLight');
    P('M -7 0 L 3 11 L 13 0 L 8 -2 L 3 4 L -2 -2 Z','gold');
    R(0,13,5,10,'gold');R(-6,18,6,4,'amber');R(8,18,5,4,'amber');
    R(-26,26,46,5,'amberDark');R(-22,27,41,2,'gold');
   }));
 }
 return '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="100" viewBox="0 0 128 100" shape-rendering="crispEdges" aria-hidden="true">'+parts.join('')+'</svg>';
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
