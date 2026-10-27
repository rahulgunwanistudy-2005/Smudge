const d=[[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
const p=[[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
export function verhoeff(value:string):boolean { if(!/^\d+$/.test(value))return false;let c=0;[...value].reverse().forEach((v,i)=>c=d[c][p[i%8][Number(v)]]);return c===0; }
export function isAadhaar(value:string):boolean { return /^[2-9]\d{11}$/.test(value)&&verhoeff(value); }
export function findIdentifiers(text:string):{raw:string;masked:string;index:number}[] {
 return [...text.matchAll(/(?<!\d)[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}(?!\d)/g)].filter(m=>isAadhaar(m[0].replace(/\D/g,''))).map(m=>({raw:m[0],masked:'XXXX XXXX '+m[0].replace(/\D/g,'').slice(-4),index:m.index!}));
}
