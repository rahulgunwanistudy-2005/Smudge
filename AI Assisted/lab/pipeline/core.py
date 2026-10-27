"""ctypes binding to exactly the C core shipped in the browser."""
import ctypes as c, platform
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
class Minutia(c.Structure):
 _fields_=[('x',c.c_float),('y',c.c_float),('nx',c.c_int),('ny',c.c_int),('nt',c.c_int),('reliability',c.c_float),('type',c.c_int),('angle',c.c_float)]
class Info(c.Structure):
 _fields_=[('n_minutiae',c.c_int),('n_hq',c.c_int),('polarity',c.c_int),('work_w',c.c_int),('work_h',c.c_int),('scale',c.c_float),('coherent_frac',c.c_float),('mean_coherence',c.c_float),('ridge_period',c.c_float),('nfiq_style',c.c_int),('features',c.c_float*11)]
class Core:
 def __init__(self):
  self.lib=c.CDLL(str(ROOT/'engine/wasm'/('libsmudge.dylib' if platform.system()=='Darwin' else 'libsmudge.so')))
  self.lib.sm_analyze.argtypes=[c.c_void_p,c.c_int,c.c_int,c.c_float,c.POINTER(Minutia),c.c_int,c.POINTER(Info)]
  self.lib.sm_bozorth.argtypes=[c.c_void_p,c.c_int,c.c_void_p,c.c_int]
  self.lib.sm_smudge.argtypes=[c.c_void_p,c.c_int,c.c_int,c.c_void_p,c.c_float,c.c_float,c.c_float,c.c_float,c.c_uint32,c.c_void_p]
  self.lib.sm_ssim.argtypes=[c.c_void_p,c.c_void_p,c.c_int,c.c_int];self.lib.sm_ssim.restype=c.c_double
 def analyze(self,image):
  image=np.ascontiguousarray(image,dtype=np.uint8);h,w=image.shape;out=(Minutia*400)();info=Info()
  n=self.lib.sm_analyze(image.ctypes.data,w,h,500,out,400,c.byref(info))
  if n<0:raise RuntimeError(f'NBIS error {n}')
  return np.array([[out[i].nx,out[i].ny,out[i].nt,round(out[i].reliability*100)] for i in range(n)],dtype=np.int32).reshape((-1,4)),info
 def match(self,a,b):
  a=np.ascontiguousarray(a,dtype=np.int32);b=np.ascontiguousarray(b,dtype=np.int32)
  return self.lib.sm_bozorth(a.ctypes.data,len(a),b.ctypes.data,len(b))
 def smudge(self,image,strength=1):
  image=np.ascontiguousarray(image,dtype=np.uint8);h,w=image.shape
  yy,xx=np.mgrid[:h,:w];t=np.minimum.reduce([xx,yy,w-1-xx,h-1-yy])/max(4,min(w,h)*.12);t=np.clip(t,0,1)
  mask=np.ascontiguousarray(np.round(255*t*t*(3-2*t)),dtype=np.uint8);out=np.empty_like(image)
  self.lib.sm_smudge(image.ctypes.data,w,h,mask.ctypes.data,strength,3,16,.5,137,out.ctypes.data)
  return out,mask
 def ssim(self,a,b):
  a=np.ascontiguousarray(a,dtype=np.uint8);b=np.ascontiguousarray(b,dtype=np.uint8);h,w=a.shape
  return self.lib.sm_ssim(a.ctypes.data,b.ctypes.data,w,h)
