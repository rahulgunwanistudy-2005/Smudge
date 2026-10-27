#!/usr/bin/env python3
"""Compare synthetic originals and attacker variants with independent SourceAFIS.
Requires Java 11+, Maven dependencies in lab/matchers/sourceafis/lib.
No templates or human fingerprint images are committed.
"""
from pathlib import Path
import sys,json,subprocess,platform,hashlib
import cv2
import numpy as np
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'lab'))
from pipeline.core import Core
from pipeline.synthetic import specimen
from PIL import Image,ImageFilter
root=ROOT/'lab/data/generated';root.mkdir(parents=True,exist_ok=True)
core=Core();pairs=[];nbis=[];templates={}
model=ROOT/'lab/models/ESPCN_x4.pb';sr=cv2.dnn_superres.DnnSuperResImpl_create();sr.readModel(str(model));sr.setModel('espcn',4);cv2.setNumThreads(2)
for seed in range(1,13):
 original=specimen(seed);before=root/f'{seed}-before.png';Image.fromarray(original).save(before);templates[seed]=core.analyze(original)[0]
for seed in range(1,13):
 before=root/f'{seed}-before.png';image=specimen(seed);treated,_=core.smudge(image,1);after=Image.fromarray(treated)
 variants={'before':Image.fromarray(image),'after':after,'sharpened':after.filter(ImageFilter.UnsharpMask(radius=1.3,percent=200,threshold=0))}
 for scale in [2,4]:variants[f'lanczos-{scale}']=after.resize((after.width*scale,after.height*scale),Image.Resampling.LANCZOS)
 variants['espcn-4x']=Image.fromarray(cv2.cvtColor(sr.upsample(cv2.cvtColor(np.array(after),cv2.COLOR_GRAY2BGR)),cv2.COLOR_BGR2GRAY))
 for name,image in variants.items():
  path=root/f'{seed}-{name}.png';image.save(path);pairs.append(f'{seed}:{name}\t{path}\t{before}')
  mins,info=core.analyze(np.array(image));nbis.append({'pair':f'{seed}:{name}','score':core.match(mins,templates[seed]),'highQuality':info.n_hq})
 for q in [60,80,95]:
  path=root/f'{seed}-jpeg-{q}.jpg';after.save(path,quality=q);pairs.append(f'{seed}:jpeg-{q}\t{path}\t{before}');mins,info=core.analyze(np.array(Image.open(path)));nbis.append({'pair':f'{seed}:jpeg-{q}','score':core.match(mins,templates[seed]),'highQuality':info.n_hq})
 for other in range(seed+1,13):
  candidate=root/f'{other}-before.png';pairs.append(f'{seed}:impostor:{other}\t{before}\t{candidate}');nbis.append({'pair':f'{seed}:impostor:{other}','score':core.match(templates[seed],templates[other])})
manifest=root/'pairs.tsv';manifest.write_text('\n'.join(pairs)+'\n')
java=ROOT/'lab/matchers/sourceafis';sep=';' if platform.system()=='Windows' else ':'
subprocess.run(['javac','-cp',str(java/'lib/*'),str(java/'Compare.java')],check=True)
output=subprocess.check_output(['java','-cp',str(java/'lib/*')+sep+str(java),'Compare',str(manifest)],text=True)
af=[{'pair':line.split('\t')[0],'score':float(line.split('\t')[1])} for line in output.splitlines() if '\t' in line]
def summary(rows):
 base=[r for r in rows if r['pair'].endswith(':before')];after=[r for r in rows if ':impostor:' not in r['pair'] and not r['pair'].endswith(':before')];impostor=[r for r in rows if ':impostor:' in r['pair']]
 return {'baselineMatches':sum(r['score']>=40 for r in base),'baselinePairs':len(base),'attackerMatchesAfter':sum(r['score']>=40 for r in after),'attackerPairsAfter':len(after),'impostorMatches':sum(r['score']>=40 for r in impostor),'impostorPairs':len(impostor)}
result={'schema':'smudge-independent/1','dataset':'Procedural synthetic ridge textures, seeds 1–12','humanData':False,'thresholdCalibrated':False,'threshold':40,'method':'Strength 1; same-image baseline; distinct extractors. Lanczos retains a nominal 500 DPI in both matchers. Includes learned ESPCN4x upscaling.','learnedModel':{'name':'ESPCN4x','source':'https://github.com/fannymonori/TF-ESPCN','license':'Apache-2.0','sha256':hashlib.sha256(model.read_bytes()).hexdigest(),'bytes':model.stat().st_size,'opencv':cv2.__version__},'sourceafis':{'version':'3.18.1','summary':summary(af),'scores':af},'bozorth3':{'summary':summary(nbis),'scores':nbis},'limitations':['66 synthetic impostor pairs are far too few to calibrate FMR 0.1%.','Both matchers are tested; this remains synthetic evidence, not protection for humans.','This fixed-strength lab experiment differs from the browser closed loop and exact full-photo JPEG export.']}
(ROOT/'lab/results/independent.json').write_text(json.dumps(result,indent=2)+'\n');(ROOT/'app/static/independent.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:result[k]['summary'] for k in ['sourceafis','bozorth3']},indent=2))
