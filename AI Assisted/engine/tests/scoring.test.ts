import {describe,it,expect} from 'vitest';
import {exposureScore,exposureTier,featherMask,validateRegions} from '../src/scoring';
import {verhoeff,isAadhaar,findIdentifiers} from '../src/verhoeff';
import {landmarkRegions,documentRegions} from '../src/regions';
describe('honest exposure scoring',()=>{
 it('is bounded and monotone in reliable minutiae',()=>{let previous=-1;for(let n=0;n<200;n++){const v=exposureScore(n,.6,3);expect(v).toBeGreaterThanOrEqual(previous);expect(v).toBeLessThanOrEqual(100);previous=v;}});
 it('does not invent a safe tier from a low score',()=>{expect(exposureTier(0)).toBe('Minimal');expect(exposureTier(45)).toBe('High');expect(exposureTier(75)).toBe('Critical');});
 it('preserves a zero boundary and a full interior in the feather mask',()=>{const m=featherMask(100,120);expect(m[0]).toBe(0);expect(m[99]).toBe(0);expect(m[60*100+50]).toBe(255);expect(m[100+1]).toBeLessThan(255);});
 it('rejects regions that could cause an out-of-bounds native read',()=>{const r={id:'1',x:90,y:0,w:64,h:64,label:'test',source:'manual' as const};expect(()=>validateRegions([r],100,100)).toThrow();expect(()=>validateRegions([{...r,x:NaN}],200,200)).toThrow();expect(()=>validateRegions([{...r,x:0,w:-3}],200,200)).toThrow();});
});
describe('identifier masking',()=>{
 it('validates known Verhoeff checks and rejects one-digit changes',()=>{expect(verhoeff('2363')).toBe(true);expect(verhoeff('2364')).toBe(false);expect(verhoeff('')).toBe(false);});
 it('requires 12 digits and a legal Aadhaar prefix',()=>{expect(isAadhaar('123456789012')).toBe(false);expect(isAadhaar('2363')).toBe(false);});
 it('only surfaces checksum-valid candidates and preserves last four digits',()=>{let value='';for(let n=0;n<10;n++)if(isAadhaar('23456789012'+n))value='23456789012'+n;expect(value.length).toBe(12);const formatted=value.slice(0,4)+' '+value.slice(4,8)+' '+value.slice(8);const hits=findIdentifiers('Specimen '+formatted+' end');expect(hits).toHaveLength(1);expect(hits[0].masked).toBe('XXXX XXXX '+value.slice(-4));expect(findIdentifiers('2345 6789 0120')).toHaveLength(0);});
});
describe('detection boundaries',()=>{
 it('returns no print candidates on a blank page',()=>expect(documentRegions(new Uint8ClampedArray(128*128*4).fill(255),128,128)).toEqual([]));
 it('returns no fingertips when the model found no hands',()=>expect(landmarkRegions([],[],1920,1080)).toEqual({regions:[],uncertain:0}));
});
