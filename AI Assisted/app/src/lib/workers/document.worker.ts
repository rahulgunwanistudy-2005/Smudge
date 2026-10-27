import { documentRegions } from '../../../../engine/src/regions';
self.onmessage=(event:MessageEvent<{pixels:Uint8ClampedArray;width:number;height:number}>)=>{
 try{self.postMessage({regions:documentRegions(event.data.pixels,event.data.width,event.data.height)});}catch{self.postMessage({error:'Document detection failed. Select the impression manually.'});}
};
