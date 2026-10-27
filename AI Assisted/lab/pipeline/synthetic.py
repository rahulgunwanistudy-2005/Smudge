"""Procedural ridge-like textures, no person's biometric. Not a human dataset."""
import numpy as np
from PIL import Image,ImageDraw
from pathlib import Path

def specimen(seed=1,w=192,h=240):
 rng=np.random.default_rng(seed);yy,xx=np.mgrid[:h,:w];x=xx-w/2;y=yy-h*.55
 phase=np.sqrt((x*.8)**2+(y*.65+65)**2)/7.5+.2*np.sin(x/32)+.15*np.sin(y/28)
 # Phase dislocations create synthetic ridge endings and bifurcations.
 for i in range(20):
  px=rng.uniform(-w*.36,w*.36);py=rng.uniform(-h*.33,h*.3)
  phase+=rng.choice([-1,1])*np.arctan2(y-py,x-px)/(2*np.pi)
 ridge=np.cos(phase*2*np.pi);inside=np.clip((1-(x/(w*.47))**2-(y/(h*.46))**2)*12,0,1)
 image=232- inside*(65+60*ridge)+rng.normal(0,.65,(h,w))
 return np.clip(image,0,255).astype(np.uint8)

def write_samples(root):
 root=Path(root);root.mkdir(parents=True,exist_ok=True);meta=[]
 for seed,name in [(7,'Ridge study'),(19,'Two print study'),(31,'Document specimen')]:
  doc=seed==31;canvas=Image.new('RGB',(1000,720),(225,233,222) if not doc else (245,243,231));draw=ImageDraw.Draw(canvas)
  draw.text((44,35),'SMUDGE / SYNTHETIC SPECIMEN',fill=(66,89,72));regions=[]
  positions=[(190,220),(555,200)] if seed==19 else [(385,225)]
  if doc:
   draw.text((75,115),'SPECIMEN - NOT AN IDENTITY DOCUMENT',fill=(105,93,70))
   for k in range(5):draw.line((75,165+k*34,610,165+k*34),fill=(197,193,174),width=2)
  for i,(x,y) in enumerate(positions):
   im=specimen(seed+i);rgb=np.stack([im,im,im],axis=2);canvas.paste(Image.fromarray(rgb),(x,y));regions.append({'id':f'synthetic-{i}','x':x,'y':y,'w':192,'h':240,'label':f'Synthetic print {i+1}','source':'synthetic'})
  draw.text((44,665),'Procedural texture. No human biometrics. Results are not clinical evidence.',fill=(66,89,72))
  filename=f'specimen-{seed}.png';canvas.save(root/filename);thumb=canvas.copy();thumb.thumbnail((240,173));thumbname=f'specimen-{seed}-thumb.webp';thumb.save(root/thumbname,'WEBP',quality=76);meta.append({'name':name,'url':'/samples/'+filename,'thumbnail':'/samples/'+thumbname,'regions':regions,'document':doc})
 return meta
