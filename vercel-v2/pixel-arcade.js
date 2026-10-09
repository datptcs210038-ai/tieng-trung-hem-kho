
;(()=>{
'use strict';
const D=window.TTHK,flash=document.getElementById('flash');
if(!D||!flash||document.getElementById('pixelArcade'))return;
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/pixel-arcade.css?v=cat-rebuild-room-v4';document.head.append(sheet);
flash.classList.add('pixel-arcade-page');
Array.from(flash.children).forEach(el=>el.classList.add('old-flash-content'));
const root=document.createElement('div');root.id='pixelArcade';
root.innerHTML='<h1 class="pa-title">🐾 Khu Game Pixel</h1><p class="pa-subtitle">Chơi game luyện HSK, mỗi câu đúng nhận 1 xu. Tích xu để nuôi và sắm đồ cho mèo!</p><nav class="pa-tabs" aria-label="Khu game"><button type="button" data-pa-tab="home" aria-selected="true">🎮 Chơi game</button><button type="button" data-pa-tab="cat" aria-selected="false">🐱 Mèo của tui</button><button type="button" data-pa-tab="shop" aria-selected="false">🛍️ Cửa hàng</button><span class="pa-wallet">🪙 <span id="paCoins">0</span> xu</span></nav><div id="paContent"></div><div id="paToast" class="pa-toast" hidden role="status" aria-live="polite"></div>';
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
 {id:'pairs',name:'Lật thẻ trí nhớ',icon:'🧠',time:90,info:'Ghép 6 cặp từ đúng'}
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
  '<img class="pa-gear '+slot+'" alt="" src="'+pixelImg(id)+'">':'').join('');
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
  content.innerHTML='<div class="pa-home"><div class="pa-panel"><h2 style="font:400 35px VT323;color:#31776a;margin:0 0 10px">🐱 '+escapeHtml(catName)+'</h2>'+petScene()+petStatus()+
   '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:16px"><button class="pa-primary" data-pa-open="cat">Cho mèo ăn ♡</button><button class="pa-primary" data-pa-open="shop">🛍️ Mua trang phục</button><button class="pa-primary" data-pa-groom>🐾 Lau mặt</button><button class="pa-primary" data-pa-name>✎ Đặt tên</button><button class="pa-primary" data-pa-walk>🌿 '+(petWalk?'Về nhà':'Cho đi dạo')+'</button></div></div>'+
   '<section class="pa-panel"><h2 style="font:400 35px VT323;color:#31776a;margin:0 0 11px">★ Chọn trò chơi</h2>'+gameButtons()+'</section></div>';
 }else if(currentView==='cat'){
  const food=ITEMS.filter(x=>x.category==='food');
  content.innerHTML='<div class="pa-home"><section class="pa-panel"><h2 style="font:400 35px VT323;color:#31776a;margin:0 0 10px">🏠 Nhà của '+escapeHtml(catName)+'</h2>'+petScene()+petStatus()+
   '<div class="pa-cat-tools"><button class="pa-primary" data-pa-groom>🐾 Lau mặt</button><button class="pa-primary" data-pa-name>✎ Đặt tên</button><button class="pa-primary" data-pa-walk>🌿 '+(petWalk?'Về nhà':'Cho đi dạo')+'</button></div><p class="pa-hint" style="margin-top:13px">Bạn có thể cho mèo ăn ngay cả khi no. Mèo no sẽ nằm ngủ và hiện Zzz.</p></section>'+
   '<section class="pa-panel"><h2 style="font:400 35px VT323;color:#31776a;margin:0 0 10px">🍽️ Cho mèo ăn</h2><p class="pa-hint">Mua món tại cửa hàng trước, sau đó bấm Cho ăn.</p><div class="pa-shop-grid">'+food.map(i=>foodCard(i)).join('')+
   '</div><button class="pa-primary" data-pa-open="shop" style="margin-top:15px">🛒 Đến cửa hàng</button></section></div>';
 }else if(currentView==='shop'){
  content.innerHTML='<section class="pa-panel"><h2 style="font:400 37px VT323;color:#31776a;margin:0 0 8px">🛍️ Cửa hàng Pixel</h2>'+
   '<p class="pa-hint">Đồ ăn chỉ 5–18 xu. Phụ kiện từ 50 xu, trang phục cao cấp đến 400 xu. Mua một lần, mặc được mãi!</p>'+
   '<div class="pa-store-groups">'+[
     ['all','Tất cả'],['food','🍣 Đồ ăn'],['head','🎀 Mũ & kính'],['neck','🧣 Phụ kiện cổ'],['body','👕 Trang phục']
   ].map(([id,name])=>'<button type="button" data-filter="'+id+'" aria-pressed="'+(storeFilter===id)+'">'+name+'</button>').join('')+'</div>'+
   '<div class="pa-shop-grid">'+ITEMS.filter(i=>storeFilter==='all'||i.category===storeFilter).map(i=>shopCard(i)).join('')+'</div></section>';
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
 return '<div class="pa-shop-item"><div class="pa-shop-sprite">'+pixelSvg(item.id)+'</div><strong>'+item.name+'</strong><p>'+item.caption+'</p>'+
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
function randomize(list){return [...list].sort(()=>Math.random()-.5)}
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
 const sample=randomize(pool).slice(0,id==='pairs'?6:12);
 const uuid=globalThis.crypto?.randomUUID?.()||'00000000-0000-4000-8000-'+Math.random().toString(16).slice(2).padEnd(12,'0').slice(0,12);
 run={id:uuid,game,words:sample,n:0,correct:0,deadline:Date.now()+game.time*1000,done:false,busy:false,rewarded:false,pairs:null,openPairs:[],pairsMatched:new Set()};
 if(id==='pairs')run.pairs=randomize(sample.flatMap((w,i)=>[{pair:i,content:w.h},{pair:i,content:w.m}]));
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
 if(!run||run.done)return;
 run.done=true;clearInterval(timer);timer=null;
 // Only show the result when still in the play area; never pull users away from the shop or their cat.
 if(currentView==='play')renderResults();
 if(!run.correct)return;
 await claimCoins();
}
let claiming=false;
async function claimCoins(){
 if(!run||!run.done||run.rewarded||claiming||run.correct<1)return;
 claiming=true;
 const note=$('#paRewardStatus');if(note)note.textContent='Đang lưu xu vào tài khoản…';
 try{
  await call('reward',run.game.id,run.correct,run.id);
  run.rewarded=true;
  if(note)note.textContent='🪙 Đã nhận '+run.correct+' xu! Xu được lưu vào tài khoản.';
  toast('Tuyệt vời! +'+run.correct+' xu 🪙');
 }catch(e){
  const msg='Chưa nhận được xu: '+e.message+'. Bạn có thể bấm “Thử nhận xu”.';
  if(note)note.textContent=msg;
  const retry=$('#paRetryReward');if(retry)retry.hidden=false;
 }finally{claiming=false}
}
function renderResults(){
 if(!run)return;
 const score=run.correct,game=run.game;
 content.innerHTML='<section class="pa-panel pa-results"><strong>'+(Date.now()>=run.deadline?'⏰ Hết giờ!':'🌟 Hoàn thành!')+'</strong>'+
 '<p>'+game.name+' · đúng '+score+(game.id==='pairs'?'/6 cặp':'/12 câu')+' · thưởng '+score+' xu.</p>'+
 '<p id="paRewardStatus">'+(score?'Đang chuyển xu vào ví…':'Hãy luyện tiếp để tích xu nuôi mèo nhé!')+'</p>'+
 '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><button type="button" class="pa-primary" id="paRetryReward" hidden>🪙 Thử nhận xu</button><button type="button" class="pa-primary" id="paPlayAgain">↺ Chơi lại</button><button type="button" class="pa-primary" id="paBackHome">🐱 Về nhà mèo</button></div></section>';
 $('#paRetryReward').onclick=claimCoins;
 $('#paPlayAgain').onclick=()=>startGame(game.id);
 $('#paBackHome').onclick=()=>{run=null;tab('home')};
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


/* PIXEL CAT v4 — one consistent 8-pose character; home appearance is opt-in. */
let petFrameIndex=0;
const catWalkStart=performance.now();
let lastPetPosition=.5,lastPetDirection=1;
const reducedMotion=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
const frameUrl=state=>'/kitten-v2-'+state+'.svg?v=catroom-20261009-v4';
function syncGardenVisibility(){
 const hero=document.querySelector('#intro .garden-running-cat');
 if(hero)hero.style.setProperty('display',(petWalk&&mood()!=='sleeping')?'block':'none','important');
 const tag=hero?.querySelector('.garden-cat-name');
 if(tag)tag.textContent=catName;
}
async function changePreference(name,walk){
 const ctx=statusAccount();
 if(!ctx){toast('Hãy đăng nhập để đặt tên hoặc cho mèo đi dạo.');return}
 const args={p_name:name===undefined?null:name,p_walk:walk===undefined?null:walk};
 const {data,error}=await ctx.db.rpc('pixel_pet_preferences',args);
 if(error){toast('Không lưu được: '+error.message);return}
 catName=data.pet_name||'Miu Miu';petWalk=!!data.is_walking;
 syncGardenVisibility();render();paintKitten();
}
function renameCat(){
 const proposed=window.prompt('Đặt tên cho bé mèo (1–24 ký tự):',catName);
 if(proposed===null)return;
 const name=proposed.trim();
 if(!name||[...name].length>24){toast('Tên mèo cần từ 1 đến 24 ký tự.');return}
 changePreference(name,undefined);
}
function toggleCatWalk(){
 if(mood()==='sleeping'){toast(catName+' đang ngủ. Đợi mèo bớt no rồi cho đi dạo nhé.');return}
 changePreference(undefined,!petWalk);
}
function groomCat(){
 if(petAnimation==='eating')return;
 petAnimation='grooming';clearTimeout(animationTimeout);
 if(currentView!=='play')render();
 paintKitten();syncGardenVisibility();
 animationTimeout=setTimeout(()=>{
  petAnimation='';
  if(currentView!=='play')render();
  paintKitten();syncGardenVisibility();
 },2600);
}
function catTravel(ms,period,walkMs,restMs){
 const t=((ms%period)+period)%period;
 if(t<walkMs)return {fraction:t/walkMs,facing:1,moving:true};
 if(t<walkMs+restMs)return {fraction:1,facing:1,moving:false};
 if(t<2*walkMs+restMs)return {fraction:1-(t-walkMs-restMs)/walkMs,facing:-1,moving:true};
 return {fraction:0,facing:-1,moving:false};
}
function setCatSprite(node,name){
 if(!node)return;
 node.style.setProperty('background-image','url("'+frameUrl(name)+'")','important');
 node.style.setProperty('background-position','center','important');
 node.style.setProperty('background-size','contain','important');
 node.style.setProperty('background-repeat','no-repeat','important');
 node.style.setProperty('animation','none','important');
}
function paintKitten(){
 const now=performance.now()-catWalkStart;
 const m=mood(),phase=petFrameIndex++;
 const walk=catTravel(now,18600,7400,1900);
 const canMove=(m==='happy'&&!reducedMotion);
 const moving=canMove&&walk.moving;
 let pose=m==='sleeping'?'sleep':
   m==='eating'?'eat':
   m==='grooming'?(phase%2?'groom1':'groom2'):
   m==='hungry'?(phase%9?'idle':'blink'):
   moving?(phase%2?'walk1':'walk2'):
   (phase%15===0?'blink':'idle');
 setCatSprite($('.pa-cat-base'),pose);
 const scene=$('.pa-scene'),stage=$('.pa-pet-stage'),body=$('.pa-cat');
 if(stage&&scene){
  const max=Math.max(0,scene.clientWidth-stage.offsetWidth-20);
  if(canMove){lastPetPosition=walk.fraction;lastPetDirection=walk.facing}
  const x=10+lastPetPosition*max;
  // In the room, stationary actions NEVER travel.
  stage.style.setProperty('transform','translate3d('+x.toFixed(1)+'px,0,0) scaleX('+lastPetDirection+')','important');
 }
 if(body){
  body.classList.toggle('is-walking',moving);
  body.classList.toggle('is-grooming',m==='grooming');
 }
 const hero=document.querySelector('#intro .garden-running-cat');
 if(hero){
  const enabled=petWalk&&m!=='sleeping';
  hero.style.setProperty('display',enabled?'block':'none','important');
  if(enabled){
   const trip=catTravel(now,22000,9200,1800);
   const hpose=trip.moving?(phase%2?'walk1':'walk2'):(phase%16===0?'blink':'idle');
   setCatSprite(hero.querySelector('.garden-cat-sprite'),hpose);
   const max=Math.max(0,(hero.parentElement?.clientWidth||800)-hero.offsetWidth-15);
   hero.style.setProperty('animation','none','important');
   hero.style.setProperty('transform','translate3d('+(8+trip.fraction*max).toFixed(1)+'px,0,0) scaleX('+trip.facing+')','important');
   let tag=hero.querySelector('.garden-cat-name');
   if(!tag){tag=document.createElement('span');tag.className='garden-cat-name';hero.append(tag)}
   tag.textContent=catName;
  }
 }
}
const animateKitten=()=>{if(!document.hidden)paintKitten()};
window.setInterval(animateKitten,400);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)paintKitten()});
loadPet().then(()=>{render();paintKitten();syncGardenVisibility()});
})();
