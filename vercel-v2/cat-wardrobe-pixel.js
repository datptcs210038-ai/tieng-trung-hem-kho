/* Pixel Cat Wardrobe v11 — each accessory is hand-drawn on the native 64x50 pose grid.
   All shapes are integer-sized rectangles; no blurry polygon scaling or floating image stickers. */
(function (win) {
 'use strict';
 const COLOR = {
  line:'#393847', ivory:'#fff6e8', shadow:'#344758', navy:'#405e85',
  denim:'#6898ba', sky:'#a9d5d8', lilac:'#91769e', lilacLight:'#c6accc',
  blush:'#efafba', rose:'#cc697e', roseDark:'#9e4c65', cream:'#f1e2c1',
  sage:'#75a390', forest:'#497c70', gold:'#edc36d', goldDark:'#b58242',
  ruby:'#bb5767', pink:'#ef9fbe', sparkle:'#fff5cf'
 };
 const bodyFrames = {
  // Narrow, tapered tailoring — fabric stays on the shoulder/back, leaves feet and tail free.
  idle:[[25,19,25],[26,17,27],[27,16,28],[28,15,29],[29,15,29],[30,15,29],[31,16,28],[32,17,27],[33,19,25]],
  blink:[[25,19,25],[26,17,27],[27,16,28],[28,15,29],[29,15,29],[30,15,29],[31,16,28],[32,17,27],[33,19,25]],
  walk1:[[25,20,26],[26,18,28],[27,17,29],[28,16,30],[29,16,30],[30,16,30],[31,17,29],[32,18,28],[33,20,26]],
  walk2:[[26,20,26],[27,18,28],[28,17,29],[29,16,30],[30,16,30],[31,17,29],[32,18,28],[33,20,27]],
  // Forepaws rise over the coat in grooming; only a slim lower vest is exposed.
  groom1:[[30,22,27],[31,20,29],[32,19,29],[33,20,28],[34,22,27]],
  groom2:[[30,22,27],[31,20,29],[32,19,29],[33,20,28],[34,22,27]],
  // Eating and sleeping use separate silhouettes, away from bowl and sleeping head.
  eat:[[28,20,25],[29,18,27],[30,17,28],[31,17,28],[32,18,27],[33,20,26]],
  sleep:[[29,26,32],[30,24,35],[31,23,36],[32,23,37],[33,24,37],[34,25,36],[35,27,34]]
 };
 const frames = {
  idle:{hx:44,hy:15,nx:33,ny:31},
  blink:{hx:44,hy:15,nx:33,ny:31},
  walk1:{hx:45,hy:14,nx:34,ny:30},
  walk2:{hx:46,hy:15,nx:35,ny:32},
  groom1:{hx:40,hy:13,nx:31,ny:30},
  groom2:{hx:39,hy:14,nx:31,ny:31},
  eat:{hx:46,hy:18,nx:40,ny:29},
  sleep:{hx:36,hy:22,nx:31,ny:34}
 };
 const FABRIC = {
  student:['navy','denim','sky'],aoba:['lilac','lilacLight','ivory'],
  royal:['ruby','roseDark','gold'],pajamas:['sage','forest','cream']
 };
 const cache=new Map();
 function renderSvg(id,pose) {
  pose=frames[pose]?pose:'idle';
  const f=frames[pose],boxes=[];
  function rect(x,y,w,h,c){
   x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
   if(w<1||h<1)return;
   if(x<0||y<0||x+w>64||y+h>50)return;
   boxes.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+(COLOR[c]||c)+'"/>');
  }
  function row(x,y,w,c){rect(x,y,w,1,c)}
  function frameRect(x,y,w,h,c){
   rect(x,y,w,1,c);rect(x,y+h-1,w,1,c);rect(x,y+1,1,h-2,c);rect(x+w-1,y+1,1,h-2,c);
  }
  if(FABRIC[id]){
   const [main,shade,accent]=FABRIC[id];
   const rows=bodyFrames[pose];
   rows.forEach(([y,l,r],idx)=>{
    row(l,y,r-l+1,'line');
    if(idx>0&&idx<rows.length-1)row(l+1,y,Math.max(1,r-l-1),main);
    if(idx>1&&idx<rows.length-3&&r-l>6)row(l+2,y,3,shade);
   });
   // Pixel stitches are placed inside the small garment; no bulky rectangles.
   const mid=rows[Math.floor(rows.length/2)];
   if(rows.length>=7){
    const [y,l,r]=mid;
    rect(l+2,y,2,1,shade);
    rect(Math.min(r-3,l+5),y+1,2,1,accent);
    if(id==='student'){rect(l+3,y-2,3,1,'ivory');rect(l+4,y-1,1,1,'gold')}
    else if(id==='aoba'){rect(l+5,y-2,1,4,'ivory');rect(l+6,y,1,1,'gold')}
    else if(id==='royal'){rect(l+3,y-1,5,1,'gold');rect(l+5,y,1,2,'goldDark')}
    else if(id==='pajamas'){rect(l+3,y-2,3,1,'cream');rect(l+4,y-1,2,1,'pink')}
   }
   // Pixel neck seam, repositioned for grooming, eating and lying down.
   if(pose==='sleep'){
    row(f.nx-2,f.ny,7,shade);rect(f.nx+1,f.ny,2,1,accent);
   }else{
    row(f.nx-3,f.ny-2,5,accent);
   }
  } else if(id==='bow'){
   const x=f.hx+1,y=f.hy-7;
   row(x-8,y+1,4,'line');row(x+3,y+1,4,'line');
   row(x-9,y+2,6,'denim');row(x+3,y+2,6,'denim');
   row(x-10,y+3,7,'sky');row(x+3,y+3,7,'sky');
   row(x-8,y+4,6,'denim');row(x+2,y+4,6,'denim');
   rect(x-2,y+2,5,3,'navy');rect(x-1,y+2,2,1,'ivory');
   rect(x-6,y+2,2,1,'ivory');rect(x+5,y+2,2,1,'ivory');
  } else if(id==='glasses'){
   // Four-pixel correction towards the real pupil centres of the 64x50 cat.
   // Two narrower 7x7 lenses: pupils stay inside the glass in both walk frames.
   const centers={idle:49,blink:49,walk1:49,walk2:50,groom1:45,groom2:44,eat:50,sleep:40};
   const x=centers[pose],gy=f.hy+(pose==='sleep'?0:4);
   frameRect(x-10,gy,8,7,'navy');frameRect(x+4,gy,8,7,'navy');
   row(x-2,gy+2,6,'navy');row(x-11,gy+2,2,'denim');row(x+11,gy+2,2,'denim');
   rect(x-8,gy+1,2,1,'sky');rect(x+6,gy+1,2,1,'sky');
  } else if(id==='beanie'){
   const x=f.hx-1,y=f.hy-8;
   row(x-8,y+1,8,'forest');row(x-10,y+2,13,'sage');
   row(x-11,y+3,16,'sage');row(x-12,y+4,18,'sage');
   row(x-12,y+5,20,'sage');row(x-12,y+6,21,'sage');
   rect(x-12,y+7,21,3,'forest');row(x-8,y+8,5,'sky');
   rect(x+6,y-2,4,4,'pink');rect(x+7,y-3,2,1,'ivory');
  } else if(id==='crown'){
   const x=f.hx-1,y=f.hy-9;
   row(x-10,y,3,'gold');row(x-2,y-2,3,'gold');row(x+6,y,3,'gold');
   row(x-10,y+1,5,'gold');row(x-4,y+1,8,'gold');row(x+5,y+1,5,'gold');
   row(x-10,y+2,20,'gold');rect(x-10,y+3,20,3,'goldDark');
   row(x-8,y+4,16,'gold');rect(x-1,y+3,3,2,'ruby');rect(x-7,y+3,2,1,'sky');
  } else if(id==='scarf'){
   const x=f.nx+1,y=f.ny-1;
   // Slim 2-pixel collar with a 3-pixel fabric tail; never hides front paws.
   row(x-4,y-2,8,'roseDark');row(x-5,y-1,10,'rose');
   row(x-4,y,8,'blush');rect(x+1,y+1,3,4,'roseDark');
   row(x+1,y+3,3,'blush');
   if(pose==='walk1'||pose==='walk2')row(x+3,y+2,3,'rose');
   if(pose==='sleep')rect(x+1,y+1,3,2,'rose');
  } else if(id==='bell'){
   const x=f.nx,y=f.ny;
   row(x-6,y-3,11,'navy');row(x-5,y-2,10,'denim');
   row(x-3,y-1,6,'goldDark');row(x-4,y,8,'gold');
   row(x-3,y+1,6,'gold');row(x-2,y+2,4,'goldDark');
   rect(x-1,y,2,1,'sparkle');rect(x,y+3,1,1,'line');
   if(pose==='walk2')rect(x+1,y+3,1,1,'gold');
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="50" viewBox="0 0 64 50" shape-rendering="crispEdges" aria-hidden="true">'+boxes.join('')+'</svg>';
 }
 function svg(id,pose){
  const key=id+':'+(pose||'idle');if(!cache.has(key))cache.set(key,renderSvg(id,pose));return cache.get(key);
 }
 function url(id,pose){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(id,pose))}
 win.TTHK_CAT_WARDROBE={svg:svg,url:url,poses:Object.keys(frames),items:Object.keys(FABRIC).concat(['bow','glasses','beanie','crown','scarf','bell']),resolution:[64,50]};
})(window);
