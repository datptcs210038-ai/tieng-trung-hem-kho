window.TTHK={photos:{'苹果':'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600&auto=format&q=85','茶':'https://images.unsplash.com/photo-1673537280205-04d2df5aef8a?w=600&auto=format&q=85','狗':'https://images.unsplash.com/photo-1693615774176-a5560f55ac49?w=600&auto=format&q=85','猫':'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&q=85','水':'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&q=85','书':'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&auto=format&q=85','学校':'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&q=85','电脑':'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&q=85','飞机':'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&q=85','朋友':'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&q=85','牛奶':'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&q=85','香蕉':'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&q=85','手机':'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&q=85','花':'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&auto=format&q=85','火车':'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&auto=format&q=85'},
vi:{'苹果':'Quả táo','茶':'Trà','狗':'Con chó','猫':'Con mèo','水':'Nước','书':'Sách','学校':'Trường học','电脑':'Máy tính','飞机':'Máy bay','朋友':'Bạn bè','牛奶':'Sữa bò','香蕉':'Chuối','手机':'Điện thoại','花':'Hoa','火车':'Tàu hỏa','老师':'Giáo viên','学生':'Học sinh','妈妈':'Mẹ','爸爸':'Bố','你好':'Xin chào','谢谢':'Cảm ơn','再见':'Tạm biệt','学习':'Học tập','喜欢':'Thích','我':'Tôi','你':'Bạn','今天':'Hôm nay','明天':'Ngày mai','中国':'Trung Quốc','吃':'Ăn','喝':'Uống','写':'Viết','看':'Xem'},
base:[['苹果','píng guǒ'],['茶','chá'],['狗','gǒu'],['猫','māo'],['水','shuǐ'],['书','shū'],['学校','xué xiào'],['电脑','diàn nǎo'],['飞机','fēi jī'],['朋友','péng you'],['牛奶','niú nǎi'],['香蕉','xiāng jiāo'],['你好','nǐ hǎo'],['谢谢','xiè xie'],['再见','zài jiàn']],
team:[['Thành Đạt','Leader · Website · Social Media'],['Hồng Diệp','Testing, Evaluation & Communication'],['Yến Vi','Project Coordinator · Support'],['Ngọc Giàu','Content Development'],['Phương Nghi','Presentation & Communication']]};
const D=window.TTHK;D.topic=function(w){let e=(w.en||'').toLowerCase();if(['苹果','茶','水','牛奶','香蕉'].includes(w.h)||/food|rice|eat|drink|fruit|tea|water/.test(e))return'🍎 Ăn uống';if(['狗','猫'].includes(w.h)||/animal|dog|cat/.test(e))return'🐾 Động vật';if(['学校','书','老师','学生'].includes(w.h)||/school|teacher|student|study|book/.test(e))return'🎓 Trường học';if(['朋友','爸爸','妈妈'].includes(w.h)||/family|friend|mother|father/.test(e))return'👥 Gia đình';if(['飞机','火车'].includes(w.h)||/train|plane|car|taxi/.test(e))return'🚉 Đi lại';return'🌿 Sinh hoạt'};
D.speak=function(s){if(!window.speechSynthesis)return;speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(s);u.lang='zh-CN';u.rate=.8;speechSynthesis.speak(u)};
D.shuffle=function(a,seed){let b=[...a],n=seed>>>0;for(let i=b.length-1;i>0;i--){n=(n*1664525+1013904223)>>>0;let j=n%(i+1);[b[i],b[j]]=[b[j],b[i]]}return b};
D.card=function(w){const picture=D.photos[w.h]?'<img src="'+D.photos[w.h]+'" alt="'+w.m+'" loading="lazy" onerror="this.outerHTML=\'<div class=placeholder>🈶</div>\'">':'<div class="placeholder" aria-label="Ảnh đang bổ sung">📷<small>Ảnh đang bổ sung</small></div>';return'<div class="word box">'+picture+'<h2>'+w.h+'</h2><small>'+w.p+'</small><p>'+w.m+'</p><p class="muted">'+w.topic+' · HSK'+w.l+'</p><div class="row" style="justify-content:center"><button class="btn soft" data-say="'+w.h+'">🔊</button><button class="btn soft" data-write="'+w.h+'">✍</button></div></div>'};
D.bindCards=function(root){root.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>D.speak(b.dataset.say));root.querySelectorAll('[data-write]').forEach(b=>b.onclick=()=>{D.writeIndex=D.words.findIndex(w=>w.h===b.dataset.write);D.charIndex=0;D.isHidden=false;D.page('writing')})};
D.words=[];D.shown=32;D.writeIndex=0;D.charIndex=0;D.isHidden=false;
D.loadWords=async function(){let $=s=>document.querySelector(s);try{let r=await fetch('https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json');if(!r.ok)throw Error();let arr=await r.json();D.words=arr.filter(w=>w.level?.some(z=>z==='old-1'||z==='old-2')).map(w=>({h:w.simplified,p:w.forms?.[0]?.transcriptions?.pinyin||'',en:w.forms?.[0]?.meanings?.[0]||'',l:w.level.includes('old-1')?1:2})).filter(w=>w.h&&w.en).map(w=>({...w,m:D.vi[w.h]||w.en,topic:D.topic(w)}))}catch(e){D.words=D.base.map(x=>({h:x[0],p:x[1],en:x[0],m:D.vi[x[0]],l:1,topic:D.topic({h:x[0],en:x[0]})}));$('#wordStatus').textContent='Nguồn HSK chưa tải được, đang hiện danh sách dự phòng.'}D.words.sort((a,b)=>Number(!!D.photos[b.h])-Number(!!D.photos[a.h]));$('#writeSelect').innerHTML=D.words.map((w,i)=>'<option value="'+i+'">'+w.h+' — '+w.m+'</option>').join('');$('#topic').innerHTML='<option value="all">Tất cả chủ đề</option>'+[...new Set(D.words.map(w=>w.topic))].map(x=>'<option>'+x+'</option>').join('');if(!$('#wordStatus').textContent.includes('dự phòng'))$('#wordStatus').textContent=D.words.length+' từ vựng · '+D.words.filter(w=>D.photos[w.h]).length+' từ có ảnh thực tế được gắn riêng. Không tìm ảnh ngẫu nhiên.';D.vocab();D.lookup()};
D.vocab=function(){let $=s=>document.querySelector(s),lv=$('#level').value,t=$('#topic').value,q=$('#vocabQuery').value.toLowerCase();let arr=D.words.filter(w=>(lv==='all'||w.l==lv)&&(t==='all'||w.topic===t)&&(!$('#onlyPhotos').checked||!!D.photos[w.h])&&[w.h,w.p,w.m,w.en].some(x=>x.toLowerCase().includes(q)));$('#wordGrid').innerHTML=arr.slice(0,D.shown).map(D.card).join('');D.bindCards($('#wordGrid'));$('#loadMore').hidden=D.shown>=arr.length};
D.lookupType='words';D.lookup=function(){let $=s=>document.querySelector(s),q=$('#query').value.toLowerCase(),a=D.words.filter(w=>!q||[w.h,w.p,w.m,w.en].some(x=>x.toLowerCase().includes(q))).slice(0,12),r=$('#result');if(D.lookupType==='words')r.innerHTML=a.map(D.card).join('');else if(D.lookupType==='hanzi')r.innerHTML=a.map(w=>'<div class="box"><h2>'+w.h+'</h2><p>'+w.p+' — '+w.m+'</p><button class="btn soft" data-write="'+w.h+'">✍ Viết</button></div>').join('');else if(D.lookupType==='examples')r.innerHTML=[['你好','你好！'],['苹果','我喜欢苹果。'],['茶','我喝茶。'],['学习','我学习中文。'],['学校','我去学校。']].filter(x=>!q||x.join('').includes(q)).map(x=>'<div class="box"><h2>'+x[1]+'</h2><p>'+x[0]+'</p></div>').join('');else if(D.lookupType==='grammar')r.innerHTML=['是 — 我是学生。','有 — 我有书。','不 — 我不喝茶。'].map(x=>'<div class="box">'+x+'</div>').join('');else r.innerHTML=['喝水 — uống nước','吃饭 — ăn cơm','看书 — đọc sách','学习中文 — học tiếng Trung'].filter(x=>!q||x.includes(q)).map(x=>'<div class="box">'+x+'</div>').join('');D.bindCards(r);if(!r.innerHTML)r.textContent='Chưa có dữ liệu phù hợp.'};


// Curated concrete-object photo references. Words without a checked illustration keep an explicit placeholder.
Object.assign(D.photos,{
'面包':'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&q=85',
'鸡蛋':'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&q=85',
'水果':'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&q=85',
'橙子':'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&q=85',
'草莓':'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&q=85',
'西瓜':'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=600&auto=format&q=85',
'饭店':'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&q=85',
'医院':'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&auto=format&q=85',
'医生':'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&q=85',
'衣服':'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&q=85',
'鞋':'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&q=85',
'手表':'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&q=85',
'钱':'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&q=85',
'太阳':'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&auto=format&q=85',
'雨':'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=600&auto=format&q=85',
'树':'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&auto=format&q=85',
'家':'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&q=85',
'房子':'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&q=85',
'椅子':'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&auto=format&q=85',
'桌子':'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&auto=format&q=85',
'自行车':'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&q=85',
'汽车':'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&q=85',
'车':'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&q=85',
'电视':'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&q=85',
'书包':'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&q=85',
'蛋糕':'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&q=85',
'足球':'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&q=85',
'篮球':'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&q=85',
'游泳':'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&auto=format&q=85',
'音乐':'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&q=85',
'北京':'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&auto=format&q=85',
'上海':'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=600&auto=format&q=85',
'中国':'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&auto=format&q=85',
'鸟':'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&auto=format&q=85',
'海':'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&q=85',
'山':'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&q=85',
'公园':'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&q=85'
});
Object.assign(D.vi,{
'面包':'Bánh mì','鸡蛋':'Trứng gà','水果':'Trái cây','橙子':'Quả cam','草莓':'Dâu tây','西瓜':'Dưa hấu',
'饭店':'Nhà hàng','医院':'Bệnh viện','医生':'Bác sĩ','衣服':'Quần áo','鞋':'Giày','手表':'Đồng hồ đeo tay',
'钱':'Tiền','太阳':'Mặt trời','雨':'Mưa','树':'Cây','家':'Nhà','房子':'Ngôi nhà','椅子':'Ghế','桌子':'Bàn',
'自行车':'Xe đạp','汽车':'Ô tô','车':'Xe','电视':'Tivi','书包':'Cặp sách','蛋糕':'Bánh kem','足球':'Bóng đá',
'篮球':'Bóng rổ','游泳':'Bơi','音乐':'Âm nhạc','北京':'Bắc Kinh','上海':'Thượng Hải','鸟':'Chim',
'海':'Biển','山':'Núi','公园':'Công viên'});
