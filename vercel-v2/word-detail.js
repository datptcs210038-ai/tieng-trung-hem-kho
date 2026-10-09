
;(()=>{
'use strict';
const D=window.TTHK;
const $=s=>document.querySelector(s);
if(!D||!$('#site')||!$('#wordGrid')||$('#wordDetail'))return;
const link=document.createElement('link');link.rel='stylesheet';link.href='/word-detail.css?v=learn-20261009-v1';document.head.append(link);
const main=$('#site main');
if(!main)return;
const detail=document.createElement('section');
detail.id='wordDetail';detail.className='page';
detail.setAttribute('aria-label','Chi tiết và luyện viết từ vựng');
detail.innerHTML=[
 '<div class="wd-topbar"><button type="button" class="wd-back" id="wdBack">← Trở về từ vựng</button><button type="button" class="wd-fav" id="wdDetailFav" aria-pressed="false"><span class="wd-heart">♡</span><span id="wdFavText">Lưu yêu thích</span></button></div>',
 '<div class="wd-shell"><article class="wd-panel"><div class="wd-label" id="wdLevel">TỪ VỰNG HSK</div><div class="wd-hanzi" id="wdWord"></div><p class="wd-pinyin" id="wdPinyin"></p><p class="wd-vn" id="wdMeaning"></p>',
 '<div class="wd-controls"><button type="button" class="wd-button primary" id="wdSpeakWord">🔊 Nghe từ</button><button type="button" class="wd-button" id="wdSpeakSlow">🐢 Nghe chậm</button></div>',
 '<div class="wd-picture" id="wdPicture"></div>',
 '<div class="wd-example"><span class="wd-label">CÂU VÍ DỤ</span><div class="zh" id="wdSentence"></div><div class="py" id="wdSentencePinyin"></div><div class="vi" id="wdSentenceVietnamese"></div><div class="en" id="wdExtraHint" hidden></div><button type="button" class="wd-button" id="wdSpeakSentence">🔊 Nghe cả câu</button></div>',
 '</article><section class="wd-panel"><h2 class="wd-stroke-title">✍ Hướng dẫn & tập viết</h2><p class="wd-description">Bấm một chữ để xem thứ tự nét. Sau đó chọn “Tập viết” để tự viết và được kiểm tra nét.</p><div class="wd-characters" id="wdCharacters"></div>',
 '<div class="wd-canvas-wrap"><div id="wordDetailCanvas" aria-label="Ô tập viết chữ Hán"></div></div>',
 '<div class="wd-controls"><button type="button" class="wd-button" id="wdAnimate">▶ Xem thứ tự nét</button><button type="button" class="wd-button primary" id="wdStartPractice">✍ Tập viết</button><button type="button" class="wd-button" id="wdResetPractice">↺ Viết lại</button></div>',
 '<p class="wd-msg" id="wdStatus" aria-live="polite">Chọn một chữ để bắt đầu.</p><button type="button" class="wd-button wd-next" id="wdNextCharacter" hidden>Chữ tiếp theo →</button>',
 '<p class="wd-credit">Công cụ nét chữ: Hanzi Writer. Bạn có thể luyện bằng chuột hoặc chạm tay trên điện thoại.</p></section></div>'
].join('');
const footer=main.querySelector('footer');
if(footer)footer.before(detail);else main.append(detail);
const favoritesBar=document.createElement('div');
favoritesBar.id='wordFavoritesBar';
favoritesBar.innerHTML='<button id="wdAllFilter" type="button" aria-pressed="true">☷ Tất cả từ</button><button id="wdSavedFilter" type="button" aria-pressed="false">♡ Từ yêu thích</button><span id="wdSavedCount" class="wd-count">Chưa lưu từ nào</span>';
const toolbar=$('#vocab .study-filter-toolbar')||$('#level')?.closest('.row');
if(toolbar)toolbar.insertAdjacentElement('afterend',favoritesBar);
else $('#vocab')?.insertBefore(favoritesBar,$('#wordGrid'));
let activeIndex=-1,selectedChar=0,writer=null,writerToken=0,origin='vocab';
let favorites=new Set(),favoritesUser=null,favoritesLoaded=false,loadingFavorites=null,onlySaved=false;
const detailFav=$('#wdDetailFav'),heartText=$('#wdFavText');
const escapeText=text=>String(text??'').trim();
function activeWord(){return D.words?.[activeIndex]||null}
function showSavedCount(){
 $('#wdSavedCount').textContent=favorites.size+' từ đã lưu';
 $('#wdAllFilter').setAttribute('aria-pressed',String(!onlySaved));
 $('#wdSavedFilter').setAttribute('aria-pressed',String(onlySaved));
}
function refreshHeartDisplay(){
 document.querySelectorAll('.word .wd-card-heart').forEach(btn=>{
  const chosen=favorites.has(btn.dataset.hanzi);
  btn.setAttribute('aria-pressed',String(chosen));
  btn.textContent=chosen?'♥':'♡';
  btn.title=chosen?'Bỏ lưu '+btn.dataset.hanzi:'Lưu '+btn.dataset.hanzi;
 });
 const w=activeWord();
 if(w){
  const saved=favorites.has(w.h);detailFav.dataset.saved=String(saved);
  detailFav.setAttribute('aria-pressed',String(saved));
  detailFav.querySelector('.wd-heart').textContent=saved?'♥':'♡';
  heartText.textContent=saved?'Đã lưu từ này':'Lưu yêu thích';
 }
 showSavedCount();
}
async function loadFavorites(force=false){
 const {db,user}=D.profileContext?.()||{};
 if(!db||!user){favoritesUser=null;favorites.clear();favoritesLoaded=false;refreshHeartDisplay();return;}
 if(favoritesUser===user.id&&favoritesLoaded&&!force)return;
 if(loadingFavorites)return loadingFavorites;
 const id=user.id;favoritesUser=id;
 loadingFavorites=(async()=>{
  const {data,error}=await db.from('saved_hsk_words').select('hanzi').eq('user_id',id);
  if(error){console.warn('Could not load saved words',error);return;}
  if((D.profileContext?.().user?.id)!==id)return;
  favorites=new Set((data||[]).map(row=>row.hanzi));favoritesLoaded=true;refreshHeartDisplay();
  if(onlySaved)renderSavedWords();
 })();
 try{await loadingFavorites}finally{loadingFavorites=null}
}
async function toggleFavorite(hanzi){
 const {db,user}=D.profileContext?.()||{};
 if(!db||!user){window.alert('Hãy đăng nhập để lưu từ yêu thích.');return;}
 const previously=favorites.has(hanzi);
 if(previously)favorites.delete(hanzi);else favorites.add(hanzi);
 refreshHeartDisplay();
 if(onlySaved)renderSavedWords();
 const result=previously
  ?await db.from('saved_hsk_words').delete().eq('user_id',user.id).eq('hanzi',hanzi)
  :await db.from('saved_hsk_words').insert({user_id:user.id,hanzi});
 if(result.error){
  if(previously)favorites.add(hanzi);else favorites.delete(hanzi);
  refreshHeartDisplay();if(onlySaved)renderSavedWords();
  $('#wdStatus').textContent='Không lưu được yêu thích: '+result.error.message;
 }else if(activeWord()?.h===hanzi){
  $('#wdStatus').textContent=previously?'Đã bỏ từ khỏi danh sách yêu thích.':'♥ Đã lưu từ vào danh sách yêu thích của bạn.';
 }
}
function escapeAttribute(str){return String(str||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
const originalBind=D.bindCards;
D.bindCards=function(root){
 if(typeof originalBind==='function')originalBind(root);
 root?.querySelectorAll('.word').forEach(card=>{
  if(card.dataset.wdBound)return;
  const hanzi=card.querySelector('h2')?.textContent?.trim();
  if(!hanzi)return;
  card.dataset.wdBound='1';
  card.classList.add('wd-clickable');card.tabIndex=0;
  card.setAttribute('aria-label','Xem chi tiết từ '+hanzi);
  card.title='Bấm để học từ '+hanzi;
  const heart=document.createElement('button');heart.type='button';heart.className='wd-card-heart';
  heart.dataset.hanzi=hanzi;
  heart.setAttribute('aria-label','Lưu hoặc bỏ lưu từ '+hanzi);
  heart.onclick=e=>{e.preventDefault();e.stopPropagation();toggleFavorite(hanzi)};
  card.append(heart);
  card.addEventListener('click',event=>{
   if(event.target.closest('button,a,input,select,textarea,[role="button"]'))return;
   openWord(hanzi);
  });
  card.addEventListener('keydown',event=>{
   if((event.key==='Enter'||event.key===' ')&&event.target===card){event.preventDefault();openWord(hanzi)}
  });
 });
 refreshHeartDisplay();
};
const originalVocab=D.vocab;
D.vocab=function(){
 if(onlySaved)return renderSavedWords();
 return originalVocab.apply(this,arguments);
};
function renderSavedWords(){
 const grid=$('#wordGrid');if(!grid)return;
 const lv=$('#level')?.value||'all',topic=$('#topic')?.value||'all',query=String($('#vocabQuery')?.value||'').toLowerCase();
 const arr=(D.words||[]).filter(w=>favorites.has(w.h)&&(lv==='all'||String(w.l)===lv)&&(topic==='all'||w.topic===topic)&&[w.h,w.p,w.m,w.en].some(x=>String(x||'').toLowerCase().includes(query)));
 const view=arr.slice(0,D.shown||32);
 if(view.length){grid.innerHTML=view.map(D.card).join('');D.bindCards(grid)}
 else{grid.innerHTML='<div class="box" style="padding:25px;grid-column:1/-1;text-align:center"><h3>♡ Chưa có từ yêu thích phù hợp</h3><p class="muted">Bấm hình trái tim trên một từ để lưu lại và ôn tập sau nhé.</p></div>';}
 $('#loadMore').hidden=view.length>=arr.length;
 showSavedCount();
}
$('#wdAllFilter').onclick=()=>{onlySaved=false;D.shown=32;D.vocab();showSavedCount()};
$('#wdSavedFilter').onclick=()=>{onlySaved=true;D.shown=32;renderSavedWords();loadFavorites()};
$('#loadMore')?.addEventListener('click',event=>{if(!onlySaved)return;event.stopImmediatePropagation();event.preventDefault();D.shown+=32;renderSavedWords()},true);
const originalLoad=D.loadWords;
if(typeof originalLoad==='function'){
 D.loadWords=async function(...args){
  const response=await originalLoad.apply(this,args);
  if(onlySaved)renderSavedWords();
  else D.bindCards($('#wordGrid'));
  return response;
 };
}
const siteObserver=new MutationObserver(()=>{
 const {user}=D.profileContext?.()||{};
 if(!user){favoritesUser=null;favoritesLoaded=false;favorites.clear();refreshHeartDisplay();return;}
 if(favoritesUser!==user.id)loadFavorites();
});
siteObserver.observe($('#site'),{attributes:true,attributeFilter:['hidden']});
loadFavorites();
function currentExample(w){
 const custom=D.exampleSentences?.[w.h];
 if(custom)return {...custom,kind:'curated'};
 return {zh:'今天我学习“'+w.h+'”这个词。',py:'Jīntiān wǒ xuéxí “'+(w.p||w.h)+'” zhège cí.',vi:'Hôm nay tôi học từ “'+w.h+'”.',kind:'practice'};
}
function drawPicture(w){
 const slot=$('#wdPicture');slot.replaceChildren();
 if(D.photos?.[w.h]){
  const img=document.createElement('img');
  img.src=D.photos[w.h];img.alt='Ảnh minh họa: '+(w.m||w.h);
  img.onerror=()=>{slot.replaceChildren();const item=document.createElement('span');item.className='wd-picture-symbol';item.textContent=w.h;slot.append(item)};
  slot.append(img);
 }else{
  const item=document.createElement('span');item.className='wd-picture-symbol';item.textContent=w.h;slot.append(item);
 }
}
function openWord(hanzi){
 const idx=(D.words||[]).findIndex(x=>x.h===hanzi);
 if(idx<0)return;
 const previous=document.querySelector('.page.on')?.id;
 origin=previous&&previous!=='wordDetail'?previous:'vocab';
 activeIndex=idx;selectedChar=0;
 D.page('wordDetail');
 renderDetail();
 loadFavorites();
}
function renderDetail(){
 const w=activeWord();if(!w)return;
 $('#wdLevel').textContent='HSK '+(w.l||'')+' · '+(w.topic||'Từ vựng');
 $('#wdWord').textContent=w.h;$('#wdPinyin').textContent=w.p||'';
 $('#wdMeaning').textContent=w.m||w.en||'';
 drawPicture(w);
 const example=currentExample(w);
 $('#wdSentence').textContent=example.zh;
 $('#wdSentencePinyin').textContent=example.py;
 $('#wdSentenceVietnamese').textContent=example.vi;
 const hint=$('#wdExtraHint');
 hint.hidden=example.kind!=='practice';
 hint.textContent=example.kind==='practice'?'Câu luyện đọc khi từ này chưa có ví dụ ngữ cảnh riêng.':'';
 const chars=[...w.h];
 const row=$('#wdCharacters');row.replaceChildren();
 for(let i=0;i<chars.length;i++){
  const b=document.createElement('button');b.type='button';b.className='wd-char';b.textContent=chars[i];b.setAttribute('aria-label','Xem cách viết chữ '+chars[i]);b.setAttribute('aria-pressed',String(i===selectedChar));
  b.onclick=()=>{selectedChar=i;makeWriter(false)};
  row.append(b);
 }
 makeWriter(false);
 refreshHeartDisplay();
}
function updateCharacterHighlight(){
 $('#wdCharacters').querySelectorAll('.wd-char').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selectedChar)));
}
function makeWriter(practice){
 const w=activeWord();if(!w)return;
 const char=[...w.h][selectedChar];if(!char)return;
 const token=++writerToken;
 try{writer?.cancelQuiz?.()}catch(e){}
 writer=null;$('#wdNextCharacter').hidden=true;updateCharacterHighlight();
 const canvas=$('#wordDetailCanvas');canvas.replaceChildren();
 const status=$('#wdStatus');
 if(!window.HanziWriter){status.textContent='Chưa tải được Hanzi Writer. Kiểm tra kết nối rồi thử lại.';return}
 status.textContent=practice?'Viết từng nét vào ô trống; hệ thống sẽ kiểm tra hướng và thứ tự nét.':'Bấm “Xem thứ tự nét” để quan sát rồi chọn “Tập viết”.';
 try{
  writer=window.HanziWriter.create('wordDetailCanvas',char,{
   width:270,height:270,padding:18,
   strokeColor:'#288c77',outlineColor:'#cbe8d7',drawingColor:'#168d78',
   showOutline:!practice,showCharacter:!practice,showHintAfterMisses:true,
   highlightOnComplete:true,
   onLoadCharDataError:()=>{
    if(token===writerToken)status.textContent='Chưa có dữ liệu nét của chữ này. Hãy chọn chữ khác hoặc kiểm tra mạng.';
   }
  });
  if(practice){
   writer.quiz({showHintAfterMisses:true,leniency:1,acceptBackwardsStrokes:false,
     onComplete:summary=>{
      if(token!==writerToken)return;
      status.textContent='✓ Viết xong chữ '+char+'! Số lần cần thử lại: '+(summary.totalMistakes||0)+'.';
      const total=[...w.h].length;
      if(selectedChar+1<total){const next=$('#wdNextCharacter');next.hidden=false;next.textContent='Tiếp tục chữ '+(selectedChar+2)+' / '+total+' →'}
      else status.textContent+=' Bạn đã hoàn thành từ này. Nhấn “Viết lại” để luyện tiếp.';
     }
   });
  }
 }catch(err){status.textContent='Không mở được nét chữ: '+(err?.message||String(err))}
}
$('#wdAnimate').onclick=()=>{makeWriter(false);try{writer?.animateCharacter?.()}catch(e){$('#wdStatus').textContent='Chưa tải được dữ liệu hướng dẫn nét.'}};
$('#wdStartPractice').onclick=()=>makeWriter(true);
$('#wdResetPractice').onclick=()=>makeWriter(true);
$('#wdNextCharacter').onclick=()=>{
 const w=activeWord();if(!w)return;
 if(selectedChar+1<[...w.h].length){selectedChar++;makeWriter(true)}
};
$('#wdSpeakWord').onclick=()=>{const w=activeWord();if(w)D.speak(w.h)};
$('#wdSpeakSlow').onclick=()=>{
 const w=activeWord();if(!w||!window.speechSynthesis)return;
 // Honor selected voice and browser speech settings where supported.
 const utter=new SpeechSynthesisUtterance(w.h);
 utter.lang='zh-CN';utter.rate=.63;
 const voices=speechSynthesis.getVoices().filter(x=>(x.lang||'').toLowerCase().replace('_','-').startsWith('zh'));
 if(voices.length)utter.voice=voices[0];
 speechSynthesis.cancel();speechSynthesis.speak(utter);
};
$('#wdSpeakSentence').onclick=()=>{const w=activeWord();if(w)D.speak(currentExample(w).zh)};
detailFav.onclick=()=>{const w=activeWord();if(w)toggleFavorite(w.h)};
$('#wdBack').onclick=()=>D.page(origin==='wordDetail'?'vocab':origin);
D.openWordDetail=openWord;
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&detail.classList.contains('on'))D.page(origin==='wordDetail'?'vocab':origin)});
})();
