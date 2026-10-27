import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
let detector:HandLandmarker|undefined;
self.onmessage=async({data}:{data:{bitmap:ImageBitmap}})=>{
 try{
  detector??=await HandLandmarker.createFromOptions(await FilesetResolver.forVisionTasks('/models/vision'),{baseOptions:{modelAssetPath:'/models/hand_landmarker.task',delegate:'CPU'},runningMode:'IMAGE',numHands:4});
  const result=detector.detect(data.bitmap);
  self.postMessage({landmarks:result.landmarks,worldLandmarks:result.worldLandmarks,handedness:result.handedness});
 }catch(e){self.postMessage({error:e instanceof Error?e.message:String(e)});}finally{data.bitmap.close();}
};
