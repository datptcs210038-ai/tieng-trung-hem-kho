/* Navigation + focused HSK vocabulary layout, keeping all original controls */
(()=>{
'use strict';
const $=s=>document.querySelector(s);
function whenReady(){
 const nav=$('.nav');
 if(nav&&!nav.classList.contains('nav-organized')){
  const groups=[
    {key:'learn',name:'HỌC TẬP',ids:['intro','vocab','lookup']},
    {key:'practice',name:'LUYỆN TẬP',ids:['writing','flash','exams','rank']},
    {key:'tools',name:'CÔNG CỤ',ids:['timer','notes','profile']}
  ];
  const titles={
    intro:'Tổng quan',vocab:'Từ vựng',lookup:'Tra cứu',
    writing:'Luyện viết',flash:'Flashcard',exams:'Đề HSK',rank:'Xếp hạng',
    timer:'Đồng hồ',notes:'Lịch học',profile:'Cá nhân'
  };
  const map=new Map([...nav.querySelectorAll('button[data-page]')].map(btn=>[btn.dataset.page,btn]));
  const addGroup=(name,key,ids)=>{
   const wrap=document.createElement('div');wrap.className='nav-group';wrap.dataset.group=key;
   const heading=document.createElement('span');heading.className='nav-group-label';heading.textContent=name;
   wrap.append(heading);
   for(const id of ids){
     const button=map.get(id);if(!button)continue;
     const text=button.querySelector('.pixel-nav-label');
     if(text)text.textContent=titles[id]||text.textContent;
     else button.textContent=titles[id]||button.textContent;
     wrap.append(button);map.delete(id);
   }
   if(wrap.querySelector('button'))nav.append(wrap);
  };
  nav.classList.add('nav-organized');
  for(const g of groups)addGroup(g.name,g.key,g.ids);
  if(map.size)addGroup('KHÁC','other',[...map.keys()]);
  const log=nav.querySelector('#logout');
  if(log){
   const wrap=document.createElement('div');wrap.className='nav-group';wrap.dataset.group='account';
   wrap.append(log);nav.append(wrap);
  }
 }
 const descriptions={
  vocab:'Chọn cấp độ, chủ đề và bắt đầu học.',
  lookup:'Tìm chữ Hán, Pinyin hoặc nghĩa tiếng Việt.',
  writing:'Chọn chữ rồi luyện từng nét.',
  flash:'Ôn nhanh và kiểm tra trí nhớ.',
  exams:'Luyện đề theo cấp độ HSK.',
  rank:'Xem kết quả luyện tập.',
  timer:'Tập trung học, nghỉ đúng giờ.',
  notes:'Lên kế hoạch cho buổi học.',
  profile:'Quản lý thông tin cá nhân.'
 };
 for(const [id,content] of Object.entries(descriptions)){
  const sect=document.getElementById(id);
  if(!sect)continue;
  const description=Array.from(sect.children).find(el=>el.matches?.('p.muted'));
  if(description)description.textContent=content;
 }
 const vocab=$('#vocab');
 const grid=$('#wordGrid');
 if(vocab&&grid){
  const filters=$('#level')?.closest('.row');
  if(filters){
   filters.classList.add('study-filter-toolbar');
   filters.setAttribute('aria-label','Lọc từ vựng theo cấp độ và chủ đề');
  }
  const status=$('#wordStatus');
  if(status)status.classList.add('word-status-chip');
  const speech=$('#speechPanel'),audit=$('#vocabImageAudit');
  let settings=$('#studySettings');
  if(!settings){
   settings=document.createElement('div');
   settings.id='studySettings';settings.className='study-settings';
   vocab.insertBefore(settings,grid);
  }
  if(speech)settings.append(speech);
  if(audit&&!$('#studyAuditDetails')){
   const advanced=document.createElement('details');
   advanced.className='study-audit-details compact-collapsible';
   advanced.id='studyAuditDetails';
   advanced.innerHTML='<summary class="compact-detail-summary"><span class="detail-icon" aria-hidden="true">▦</span><span>Ảnh minh họa</span><small>Kiểm tra khi cần</small><span class="detail-caret" aria-hidden="true">⌄</span></summary>';
   advanced.append(audit);
   settings.append(advanced);
  }
  const controls=vocab.querySelectorAll('select');
  controls.forEach(x=>x.setAttribute('aria-label',x.getAttribute('aria-label')||({level:'Lọc cấp độ HSK',topic:'Chọn chủ đề'}[x.id]||x.id)));
 }
}
if(document.readyState==='complete')whenReady();
else window.addEventListener('load',whenReady,{once:true});
})();