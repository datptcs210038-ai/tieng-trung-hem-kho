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
  idle:[[25,17,25],[26,15,27],[27,14,29],[28,13,30],[29,13,31],[30,12,31],[31,12,32],[32,12,32],[33,13,32],[34,13,31],[35,14,31],[36,15,30],[37,17,29]],
  blink:[[25,17,25],[26,15,27],[27,14,29],[28,13,30],[29,13,31],[30,12,31],[31,12,32],[32,12,32],[33,13,32],[34,13,31],[35,14,31],[36,15,30],[37,17,29]],
  walk1:[[24,17,26],[25,15,28],[26,14,30],[27,13,31],[28,13,32],[29,12,32],[30,12,32],[31,13,33],[32,13,33],[33,13,32],[34,14,32],[35,15,31],[36,17,29]],
  walk2:[[26,18,26],[27,16,29],[28,15,31],[29,14,32],[30,14,33],[31,13,33],[32,13,34],[33,13,34],[34,14,34],[35,14,33],[36,15,32],[37,16,31],[38,18,30]],
  groom1:[[25,18,28],[26,16,29],[27,15,30],[28,14,31],[29,14,31],[30,13,31],[31,13,32],[32,13,32],[33,14,32],[34,15,31],[35,15,30],[36,17,29],[37,19,27]],
  groom2:[[26,17,27],[27,15,29],[28,14,30],[29,13,31],[30,13,31],[31,12,32],[32,12,32],[33,13,32],[34,14,32],[35,14,31],[36,15,30],[37,17,29],[38,19,27]],
  eat:[[25,33,42],[26,32,46],[27,31,48],[28,31,49],[29,30,50],[30,30,50],[31,30,49],[32,31,49],[33,32,48],[34,33,47],[35,35,45]],
  sleep:[[27,24,34],[28,21,38],[29,19,40],[30,18,41],[31,18,42],[32,17,43],[33,17,43],[34,18,43],[35,19,42],[36,21,40],[37,24,38]]
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
   // All stitch and collar details move with their corresponding native animation frame.
   const mid=Math.floor(rows.length/2),middle=rows[mid],seamX=middle[2]-3;
   for(let i=3;i<rows.length-2;i+=3){
    const [y,l,r]=rows[i];
    rect(Math.min(r-3,l+4),y,3,1,accent);
   }
   // Button placket follows the slope of the shirt and never covers the face.
   for(let i=3;i<rows.length-2;i+=4){
    const [y,l,r]=rows[i]; rect(Math.min(r-3,seamX),y,1,1,id==='royal'?'gold':id==='aoba'?'ivory':id==='pajamas'?'cream':'sky');
   }
   if(id==='student'){
    const y=rows[3][0],x=rows[3][1]+3;
    rect(x,y+2,4,2,'ivory');rect(x+1,y+3,2,1,'navy');
    rect(rows[rows.length-4][1]+1,rows[rows.length-4][0],5,1,'sky');
   }else if(id==='aoba'){
    const [y,l,r]=rows[5];
    rect(Math.min(r-4,l+8),y,2,4,'lilacLight');
    rect(Math.min(r-4,l+9),y+1,1,1,'ivory');
    rect(rows[rows.length-4][1]+2,rows[rows.length-4][0],6,1,'blush');
   }else if(id==='royal'){
    const [y,l,r]=rows[5],x=Math.floor((l+r)/2);
    rect(x-2,y,5,1,'gold');rect(x-1,y+1,3,1,'goldDark');rect(x,y+2,1,2,'gold');
    rect(rows[rows.length-3][1]+1,rows[rows.length-3][0],Math.max(3,rows[rows.length-3][2]-rows[rows.length-3][1]-1),1,'gold');
   }else if(id==='pajamas'){
    const [y,l,r]=rows[4];
    rect(l+4,y,4,1,'cream');rect(l+3,y+1,2,1,'cream');rect(l+5,y+2,5,1,'cream');
    rect(rows[rows.length-3][1]+2,rows[rows.length-3][0],4,1,'pink');
   }
   // Pixel neck seam, repositioned for grooming, eating and lying down.
   if(pose==='sleep'){
    row(f.nx-2,f.ny,7,shade);rect(f.nx+1,f.ny,2,1,accent);
   }else{
    row(f.nx-4,f.ny-2,7,'line');row(f.nx-3,f.ny-2,5,accent);
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
   // In sleep the glasses rest higher on the forehead; the cat may still close its eyes.
   const gy=f.hy+(pose==='sleep'?1:5),x=f.hx;
   frameRect(x-11,gy,9,8,'navy');frameRect(x+1,gy,9,8,'navy');
   row(x-2,gy+2,3,'navy');row(x-12,gy+2,2,'denim');row(x+9,gy+2,2,'denim');
   rect(x-9,gy+1,2,1,'sky');rect(x+3,gy+1,2,1,'sky');
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
   const x=f.nx,y=f.ny;
   row(x-6,y-3,11,'roseDark');row(x-7,y-2,13,'rose');
   row(x-5,y-1,10,'blush');row(x-3,y,8,'rose');
   rect(x+1,y+1,4,6,'roseDark');
   rect(x+2,y+5,3,1,'blush');
   if(pose==='walk1'||pose==='walk2')row(x+4,y+4,4,'rose');
   if(pose==='sleep')rect(x+1,y+1,5,2,'rose');
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
