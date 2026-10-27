/** Transparent heuristic, NOT a probability of cloning or calibrated biometric quality. */
export const PROVISIONAL_THRESHOLD = 40;
export function exposureScore(highQuality: number, coherence: number, qualityGrade: number): number {
  return Math.round(100 * (.55 * Math.min(1, Math.max(0, highQuality) / 40) + .3 * Math.min(1, Math.max(0, coherence)) + .15 * Math.max(0, Math.min(1, (5 - qualityGrade) / 4))));
}
export function exposureTier(score: number): string { return score >= 75 ? 'Critical' : score >= 45 ? 'High' : score >= 20 ? 'Low' : 'Minimal'; }
export function featherMask(w: number, h: number): Uint8Array {
 const mask = new Uint8Array(w*h);
 const fade=Math.max(4,Math.min(w,h)*.12);
 for(let y=0;y<h;y++) for(let x=0;x<w;x++) { const d=Math.min(x,y,w-1-x,h-1-y); const t=Math.min(1,d/fade); mask[y*w+x]=Math.round(255*t*t*(3-2*t)); }
 return mask;
}
export function validateRegions(regions: import('./types').Region[], width:number, height:number) {
 if(regions.length>20) throw new Error('Select at most 20 regions per image.');
 for(const r of regions) if(![r.x,r.y,r.w,r.h].every(Number.isFinite)||r.x<0||r.y<0||r.w<32||r.h<32||r.w>1024||r.h>1024||r.x+r.w>width||r.y+r.h>height) throw new Error('Each print region must be 32–1024 pixels and inside the image. Select a smaller area around a fingertip.');
}
