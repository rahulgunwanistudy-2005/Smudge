import type { Region } from './types';
type Point={x:number;y:number;z:number};
export function landmarkRegions(landmarks:Point[][],hands:{categoryName:string}[][],width:number,height:number):{regions:Region[];uncertain:number}{
 const regions:Region[]=[];let uncertain=0;
 landmarks.forEach((lm,i)=>{
  const a={x:lm[5].x-lm[0].x,y:lm[5].y-lm[0].y},b={x:lm[17].x-lm[0].x,y:lm[17].y-lm[0].y};
  // Handedness assumes an unmirrored input image. This is only a routing hint,
  // never a reason to declare an unprocessed fingertip safe.
  const normal=a.x*b.y-a.y*b.x,expected=hands[i]?.[0]?.categoryName==='Left'?-1:1;
  if(normal*expected<0)uncertain++;
  for(const [j,name] of ['Thumb','Index','Middle','Ring','Little'].entries()){
   const tip=lm[j*4+4],dip=lm[j*4+3],len=Math.hypot((tip.x-dip.x)*width,(tip.y-dip.y)*height);
   const rw=Math.min(1024,Math.max(32,Math.round(len*1.35))),rh=Math.min(1024,Math.max(32,Math.round(len*1.65)));
   const cx=(tip.x*.65+dip.x*.35)*width,cy=(tip.y*.65+dip.y*.35)*height;
   const x=Math.max(0,Math.round(cx-rw/2)),y=Math.max(0,Math.round(cy-rh/2));const w=Math.min(rw,width-x),h=Math.min(rh,height-y);
   if(w>=32&&h>=32)regions.push({id:`hand-${i}-${j}`,x,y,w,h,label:`${name} · hand ${i+1}`,source:'landmarks'});
  }
 });return{regions,uncertain};
}
/** Conservative document candidate finder: gradient structure and local variance.
 * Candidates require human confirmation; it is not an OCR or fingerprint classifier. */
export function documentRegions(pixels:Uint8ClampedArray,w:number,h:number):Region[]{
 const bs=24,bw=Math.ceil(w/bs),bh=Math.ceil(h/bs),active=new Uint8Array(bw*bh),seen=new Uint8Array(bw*bh);
 const y=(x:number,z:number)=>.299*pixels[(z*w+x)*4]+.587*pixels[(z*w+x)*4+1]+.114*pixels[(z*w+x)*4+2];
 for(let by=0;by<bh;by++)for(let bx=0;bx<bw;bx++){
  let xx=0,yy=0,xy=0,mean=0,sq=0,n=0;
  for(let j=by*bs+1;j<Math.min((by+1)*bs,h-1);j+=2)for(let i=bx*bs+1;i<Math.min((bx+1)*bs,w-1);i+=2){const v=y(i,j),gx=y(i+1,j)-y(i-1,j),gy=y(i,j+1)-y(i,j-1);xx+=gx*gx;yy+=gy*gy;xy+=gx*gy;mean+=v;sq+=v*v;n++;}
  const coh=Math.hypot(xx-yy,2*xy)/(xx+yy+1);active[by*bw+bx]=Number(n>0&&sq/n-(mean/n)**2>110&&coh>.15&&coh<.98);
 }
 const out:Region[]=[];
 for(let k=0;k<active.length;k++)if(active[k]&&!seen[k]){
  const stack=[k];seen[k]=1;const cells:number[]=[];
  while(stack.length){const n=stack.pop()!;cells.push(n);for(const d of [-bw,bw,-1,1]){const z=n+d;if(z<0||z>=active.length||seen[z]||!active[z]||(Math.abs(d)===1&&Math.floor(n/bw)!==Math.floor(z/bw)))continue;seen[z]=1;stack.push(z);}}
  if(cells.length<4)continue;const xs=cells.map(c=>c%bw),ys=cells.map(c=>Math.floor(c/bw)),x=Math.max(0,Math.min(...xs)*bs-12),z=Math.max(0,Math.min(...ys)*bs-12),rw=Math.min(1024,w-x,(Math.max(...xs)-Math.min(...xs)+1)*bs+24),rh=Math.min(1024,h-z,(Math.max(...ys)-Math.min(...ys)+1)*bs+24);
  if(rw>=48&&rh>=48&&rw/rh>.3&&rw/rh<3)out.push({id:`texture-${out.length}`,x,y:z,w:rw,h:rh,label:`Texture candidate ${out.length+1}`,source:'texture'});
 }return out.slice(0,20);
}
