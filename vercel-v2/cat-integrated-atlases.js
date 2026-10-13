/* Native pixel wardrobe — each combination is a COMPLETE 4x2 cat sprite atlas.
   Built once on a transparent canvas from the existing cat image, so no HTML
   accessory overlays can drift from the face or legs during animations. */
(function (win) {
 'use strict';
 const BASE=win.TTHK_CAT_ATLAS;
 const poses=['idle','blink','walk1','walk2','groom1','groom2','eat','sleep'];
 const areas=[
 [[12,31],[14,26],[20,24],[31,24],[34,28],[37,32],[37,40],[31,41],[12,40]],
 [[12,31],[14,26],[20,24],[31,24],[34,28],[37,32],[37,40],[31,41],[12,40]],
 [[13,31],[14,27],[20,24],[31,24],[35,29],[37,33],[36,40],[13,40]],
 [[13,31],[15,27],[21,24],[32,24],[36,29],[38,33],[37,40],[13,40]],
 [[15,36],[19,31],[26,29],[39,31],[43,39],[39,44],[17,44]],
 [[16,36],[20,31],[27,29],[40,31],[43,40],[40,44],[18,44]],
 [[30,20],[36,18],[45,19],[51,24],[51,37],[45,38],[32,34]],
 [[32,19],[39,16],[49,16],[56,23],[60,30],[58,38],[37,39],[32,34]]
 ];
 const paints={
 student:['#425e83','#668ca9','#314765','#e6e9e8','#d9b967'],
 aoba:['#9a7da6','#c3a8c8','#745e87','#f0e3cf','#edb08b'],
 royal:['#b85d68','#d48a86','#8b404f','#edc87a','#f7df9e'],
 pajamas:['#70a18d','#a5c9b4','#487763','#fff3dc','#e8b6bd']
 };
 const necks=[[35,31],[35,31],[35,31],[36,31],[35,30],[34,31],[36,30],[34,33]];
 const eyeCenters=[[[40,53],21],[[40,53],21],[[41,53],21],[[41,53],21],[[33,46],24],[[32,43],23]];
 function inside(x,y,points){
  let hit=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
   const p=points[i],q=points[j];
   if((p[1]>y)!==(q[1]>y) && x<(q[0]-p[0])*(y-p[1])/(q[1]-p[1])+p[0])hit=!hit;
  }
  return hit;
 }
 function rgb(color){
  const n=parseInt(color.slice(1),16);
  return [(n>>16)&255,(n>>8)&255,n&255];
 }
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
   // Each of 8 drawings is a completely finished cat; nothing is layered on the DOM.
   poses.forEach((pose,f)=>{
    const ox=(f%4)*64,oy=Math.floor(f/4)*50;
    if(e.body){
     // Paint the existing fur on the ORIGINAL torso contour rather than a costume patch.
     const palette=paints[e.body].map(rgb);
     const data=ctx.getImageData(ox,oy,64,50),pixels=data.data;
     for(let y=0;y<50;y++)for(let x=0;x<64;x++){
      if(!inside(x+.5,y+.5,areas[f]))continue;
      const offset=4*(64*y+x),r=pixels[offset],g=pixels[offset+1],b=pixels[offset+2],a=pixels[offset+3];
      if(a<210)continue;
      let replacement=null;
      if(Math.abs(r-172)<=17&&Math.abs(g-169)<=17&&Math.abs(b-165)<=17)
       replacement=palette[(y<26||x<18||(x+y)%13<3)?1:0];
      else if(r>65&&r<135&&Math.abs(r-g)<28&&Math.abs(g-b)<30)
       replacement=palette[2];
      if(replacement){
       pixels[offset]=replacement[0];pixels[offset+1]=replacement[1];pixels[offset+2]=replacement[2];pixels[offset+3]=253;
      }
     }
     ctx.putImageData(data,ox,oy);
    }
    ctx.save();ctx.translate(ox,oy);
    const rect=(x,y,w,h,c)=>{
     ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
    };
    const dot=(x,y,c)=>rect(x,y,1,1,c);
    if(e.body){
     const colors=paints[e.body];
     if(f<4){
      rect(30,28,6,2,colors[3]);rect(32,30,2,3,colors[3]);rect(20,36,5,1,colors[1]);
      if(e.body==='student'){rect(21,31,3,2,colors[3]);dot(22,32,colors[4]);}
      else if(e.body==='aoba'){rect(27,30,1,7,colors[3]);dot(28,32,colors[4]);dot(28,35,colors[4]);}
      else if(e.body==='royal'){rect(17,36,13,1,colors[4]);rect(26,29,3,3,colors[4]);}
      else{rect(20,29,4,2,colors[3]);rect(27,36,3,2,colors[3]);dot(23,30,colors[4]);}
     }else if(f===4||f===5){
      rect(30,32,6,2,colors[3]);
      if(e.body==='aoba')dot(32,35,colors[4]);
     }else if(f===6){rect(34,25,2,5,colors[3]);}
     else{rect(38,23,6,1,colors[3]);}
    }
    if(e.head==='glasses'&&f<6){
     const [centers,ey]=eyeCenters[f];
     const ink='#364f69',highlight='#9ebfcb';
     for(const cx of centers){
      const x=cx-4,y=ey-4;
      rect(x+1,y,6,1,ink);rect(x,y+1,1,5,ink);
      rect(x+7,y+1,1,5,ink);rect(x+1,y+6,6,1,ink);
      dot(x+2,y+1,highlight);
     }
     const [left,right]=centers;
     rect(left+4,ey-2,Math.max(1,right-left-8),1,ink);
     rect(left-6,ey-2,3,1,ink);rect(right+3,ey-2,3,1,ink);
    }else if(e.head==='crown'&&f!==6&&f!==7){
     const x=[45,45,45,45,38,36][f],y=f<4?6:4;
     rect(x-7,y+3,15,3,'#edc168');rect(x-7,y+1,2,4,'#edc168');
     rect(x,y-2,2,6,'#edc168');rect(x+6,y+1,2,4,'#edc168');
     rect(x-7,y+5,15,1,'#9a6133');dot(x,y+4,'#ba566a');
    }else if(e.head==='beanie'&&f!==6){
     let x,y;
     if(f===7){x=27;y=9}
     else if(f>=4){x=29;y=6}
     else{x=37;y=6}
     const rows=[[x,y-1,3],[x-2,y,7],[x-4,y+1,11],[x-5,y+2,12],[x-6,y+3,14],[x-6,y+4,14]];
     for(const [xx,yy,w] of rows)rect(xx,yy,w,1,'#599077');
     rect(x-6,y+5,14,2,'#386756');rect(x+4,y-2,3,3,'#edb3bc');
    }
    const [nx,ny]=necks[f];
    if(e.neck==='scarf'){
     rect(nx-4,ny,7,2,'#b9536c');rect(nx-4,ny,7,1,'#ec9ba6');
     rect(nx-1,ny+2,2,3,'#b9536c');dot(nx-1,ny+3,'#ec9ba6');
    }else if(e.neck==='bell'){
     rect(nx-4,ny-1,7,1,'#43727b');
     rect(nx-2,ny,4,3,'#ebc061');dot(nx,ny+2,'#795a2e');
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