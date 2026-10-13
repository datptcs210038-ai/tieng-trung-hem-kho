/* Native pixel wardrobe — each combination is a COMPLETE 4x2 cat sprite atlas.
   Built once on a transparent canvas from the existing cat image, so no HTML
   accessory overlays can drift from the face or legs during animations. */
(function (win) {
 'use strict';
 const BASE=win.TTHK_CAT_ATLAS;
 const poses=['idle','blink','walk1','walk2','groom1','groom2','eat','sleep'];
 const P={
  idle:  {eye: [37,52,20], neck:[35,29], coat:[29,30,31,31]},
  blink: {eye: [37,52,20], neck:[35,29], coat:[29,30,31,31]},
  walk1: {eye: [38,53,19], neck:[35,29], coat:[28,30,32,31]},
  walk2: {eye: [39,54,20], neck:[36,30], coat:[29,31,32,31]},
  groom1:{eye: [34,49,19], neck:[33,31], coat:[27,31,30,31]},
  groom2:{eye: [33,48,20], neck:[33,31], coat:[28,31,29,31]},
  eat:   {eye: [40,54,22], neck:[39,30], coat:[28,32,32,30]},
  sleep: {eye: [33,47,25], neck:[36,33], coat:[30,32,31,30]}
 };
 const paints={
  student:{cloth:'#45698a',highlight:'#81adbd',dark:'#2e506e',trim:'#f4ecdc'},
  aoba:{cloth:'#8e739a',highlight:'#b7a0bb',dark:'#6c537b',trim:'#f2e1c9'},
  royal:{cloth:'#b25d68',highlight:'#d88787',dark:'#864753',trim:'#f0ca78'},
  pajamas:{cloth:'#83aa9b',highlight:'#b5ccc0',dark:'#598575',trim:'#f5e8cf'}
 };
 const loaded=new Map(),pending=new Set(),subscribers=new Set();
 let image=null,loadPromise=null,version=0;
 function normalize(eq){
  eq=eq||{};
  return {body:paints[eq.body]?eq.body:'',head:['glasses','beanie','crown'].includes(eq.head)?eq.head:'',neck:['scarf','bell'].includes(eq.neck)?eq.neck:''};
 }
 function key(eq){const e=normalize(eq);return e.body+'/'+e.head+'/'+e.neck}
 function getImage(){
  if(loadPromise)return loadPromise;
  loadPromise=new Promise((resolve,reject)=>{
   const el=new Image();el.onload=()=>{image=el;resolve(el)};
   el.onerror=()=>reject(new Error('Original pixel cat could not load'));
   el.src=BASE;
  });
  return loadPromise;
 }
 function make(eq){
  const e=normalize(eq),k=key(e);
  if(loaded.has(k)||pending.has(k))return;
  pending.add(k);
  getImage().then(img=>{
   const canvas=document.createElement('canvas');canvas.width=256;canvas.height=100;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});
   if(!ctx)throw Error('Canvas 2D unavailable');
   ctx.imageSmoothingEnabled=false;
   // Preserve the existing gray tabby verbatim before drawing any clothing.
   ctx.drawImage(img,0,0,256,100);
   poses.forEach((pose,i)=>{
    const ox=(i%4)*64,oy=Math.floor(i/4)*50,poseData=P[pose];
    ctx.save();ctx.translate(ox,oy);
    // The color mask is sampled BEFORE adding glasses, collar or stitched fabric.
    const original=ctx.getImageData(ox,oy,64,50).data;
    const dot=(x,y,c,w=1,h=1)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
    const safe=(x,y)=>{
     if(x<0||x>=64||y<0||y>=50)return false;
     const t=(y*64+x)*4,red=original[t],green=original[t+1],blue=original[t+2];
     // Only repaint opaque fur, never transparent room, black outlines, eyes or pink ears.
     if(original[t+3]<150)return false;
     if(Math.max(red,green,blue)<76)return false;
     if(red>green*1.2&&red>blue*1.12&&red>115)return false;
     return true;
    };
    if(e.body){
     const colors=paints[e.body];
     const [cx,cy,w,h]=poseData.coat;
     const widths=[8,12,16,19,21,22,22,21,19,17,13];
     const center=cx+9;
     const top=cy-7;
     // Garment follows the organic torso, not a rectangle or a separate CSS overlay.
     for(let yy=0;yy<11;yy++){
      const half=Math.round(widths[yy]/2),left=center-half;
      for(let x=left;x<left+widths[yy];x++){
       const y=top+yy;
       if(!safe(x,y))continue;
       let shade=colors.cloth;
       if(x<left+3||yy<2)shade=colors.highlight;
       else if(x>left+widths[yy]-4||yy>8)shade=colors.dark;
       dot(x,y,shade);
      }
     }
     // Subtle embroidery is clipped to the cat's torso and scaled in original pixels.
     for(let yy=3;yy<10;yy++){
      const y=top+yy,x=center+1;
      if(safe(x,y))dot(x,y,colors.trim);
     }
     if(e.body==='student'){
      for(let x=center-6;x<center-1;x++)if(safe(x,top+4))dot(x,top+4,'#e8efdf');
      if(safe(center-4,top+5))dot(center-4,top+5,'#edc177');
     }else if(e.body==='aoba'){
      for(const y of [top+4,top+7,top+9])if(safe(center+3,y))dot(center+3,y,'#e9c48a');
      for(let x=center-5;x<center-2;x++)if(safe(x,top+5))dot(x,top+5,'#e0c3d3');
     }else if(e.body==='royal'){
      for(let x=center-6;x<center+6;x++)if(safe(x,top+8))dot(x,top+8,'#edc475');
      for(let j=0;j<5;j++){const x=center-3+j,y=top+3+Math.abs(2-j);
       if(safe(x,y))dot(x,y,'#f3d68c')}
     }else{
      for(let x=center-5;x<center-1;x++)if(safe(x,top+4))dot(x,top+4,'#f1e9d4');
      if(safe(center-3,top+5))dot(center-3,top+5,'#efbfc9');
     }
    }
    // All add-ons are baked INTO the same image, at the same 64x50 pixel coordinates.
    const eyes=poseData.eye,[nx,ny]=poseData.neck;
    const wearingGlasses=e.head==='glasses';
    function glasses(){
     const [left,right,cy]=eyes;
     const color='#48667a',shine='#bce2de';
     // Light 7x6 frames line up with BOTH eye pupils, no chunky lens panel.
     for(const c of [left,right]){
      const xx=c-4,yy=cy-3;
      for(let x=xx+1;x<xx+7;x++)dot(x,yy,color);
      for(let x=xx+1;x<xx+7;x++)dot(x,yy+6,color);
      for(let y=yy+1;y<yy+6;y++){dot(xx,y,color);dot(xx+7,y,color)}
      dot(xx+2,yy+1,shine);dot(xx+3,yy+1,shine);
     }
     for(let x=left+4;x<right-4;x++)dot(x,cy-1,color);
     dot(left-5,cy-1,color,2,1);dot(right+4,cy-1,color,2,1);
    }
    if(wearingGlasses)glasses();
    if(e.neck==='scarf'){
     for(let x=nx-4;x<nx+5;x++)dot(x,ny-2,'#b95f77');
     for(let x=nx-3;x<nx+4;x++)dot(x,ny-1,'#ec9baf');
     for(let y=ny;y<ny+4;y++)dot(nx+1,y,'#b95f77',3,1);
     dot(nx+1,ny+2,'#ffd4d2',3,1);
    }else if(e.neck==='bell'){
     for(let x=nx-4;x<nx+5;x++)dot(x,ny-2,'#547e85');
     dot(nx-2,ny-1,'#f0ce75',5,2);
     dot(nx-1,ny+1,'#c79548',3,1);dot(nx,ny,'#fff1ab');
    }
    if(e.head==='beanie'){
     const [left,,ey]=eyes;const x=left+3,y=ey-12;
     for(let j=0;j<5;j++)dot(x-j,y+j,11+j*2,j<2?'#8bb6a9':'#6b9c90');
     dot(x-5,y+5,'#477f72',24,2);dot(x+3,y-2,'#eeb6c5',4,3);
    }else if(e.head==='crown'){
     const [left,,ey]=eyes,x=left+3,y=ey-12;
     dot(x-8,y+4,'#c69a4e',22,3);dot(x-8,y+3,'#ecc66d',22,1);
     dot(x-8,y,'#efcc78',3,4);dot(x,y-2,'#efcc78',3,6);dot(x+11,y,'#efcc78',3,4);
     dot(x+1,y+4,'#c65d7e',2,2);dot(x-5,y+4,'#a6ced1',2,1);
    }
    ctx.restore();
   });
   loaded.set(k,canvas.toDataURL('image/png'));pending.delete(k);
   version++;
   for(const fn of subscribers){try{fn(k)}catch(err){console.warn(err)}}
  }).catch(err=>{pending.delete(k);console.warn('Could not draw pixel look',err)});
 }
 function url(eq){const k=key(eq);if(!loaded.has(k))make(eq);return loaded.get(k)||BASE}
 function subscribe(fn){subscribers.add(fn);return ()=>subscribers.delete(fn)}
 // Pre-render the four bundled outfits; other owned combinations compile on demand.
 [
  {body:'student',head:'glasses'}, {body:'aoba',neck:'scarf'},
  {body:'royal',head:'crown'},{body:'pajamas',head:'beanie'}
 ].forEach(make);
 win.TTHK_CAT_LOOKS={url,key,normalize,subscribe,get version(){return version},poses:poses.slice(),original:BASE};
})(window);