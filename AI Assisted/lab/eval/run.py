#!/usr/bin/env python3
"""Deterministic synthetic smoke evaluation, not population calibration."""
import sys,json,time,platform,subprocess,base64
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'lab'))
import numpy as np
from pipeline.core import Core
from pipeline.synthetic import specimen,write_samples
core=Core();rows=[];parity=[];start=time.perf_counter()
for seed in range(1,13):
 image=specimen(seed);t=time.perf_counter();before,info=core.analyze(image);own=core.match(before,before)
 strengths=[]
 for s in [.4,.7,1]:
  after,mask=core.smudge(image,s);mins,ai=core.analyze(after);score=core.match(mins,before)
  assert np.array_equal(image[mask==0],after[mask==0]),'Unmasked pixels changed'
  strengths.append({'strength':s,'score':score,'highQuality':ai.n_hq,'ssim':core.ssim(image,after)})
  if score<40 and ai.n_hq<6:break
 rows.append({'seed':seed,'beforeScore':own,'minutiaeBefore':info.n_minutiae,'highQualityBefore':info.n_hq,'coherence':info.coherent_frac,'passes':strengths,'elapsedMs':(time.perf_counter()-t)*1000})
 parity.append({'seed':seed,'width':image.shape[1],'height':image.shape[0],'pixelsBase64':base64.b64encode(image.tobytes()).decode(),'xytq':before.tolist(),'selfScore':own})
for seed in range(13,51):
 image=specimen(seed);mins,info=core.analyze(image);parity.append({'seed':seed,'width':image.shape[1],'height':image.shape[0],'pixelsBase64':base64.b64encode(image.tobytes()).decode(),'xytq':mins.tolist(),'selfScore':core.match(mins,mins)})
print('Evaluated',len(rows),'synthetic samples in',round(time.perf_counter()-start,2),'s')
result={'schema':'smudge-evaluation/1','dataset':'Procedural synthetic ridge textures','humanData':False,'seedRange':[1,12],'threshold':40,'thresholdCalibrated':False,'independentMatcher':False,'learnedSuperResolution':False,'platform':platform.platform(),'compiler':'native -O3','samples':rows,'summary':{'sampleCount':len(rows),'baselineMatches':sum(r['beforeScore']>=40 for r in rows),'afterMatches':sum(r['passes'][-1]['score']>=40 for r in rows),'meanRoiSSIM':float(np.mean([r['passes'][-1]['ssim'] for r in rows])),'meanElapsedMs':float(np.mean([r['elapsedMs'] for r in rows]))},'limitations':['Synthetic smoke test only; no human efficacy or FMR claims.','Same-image baseline, not independent enrolment.','Results cover native plain enhancement; browser reports include the additional attacker variants.','ROI SSIM differs from full-image SSIM.','Distance, LPIPS, SourceAFIS, real-device budgets and blind testing are unmeasured.']}
(ROOT/'lab/results/synthetic.json').write_text(json.dumps(result,indent=2)+'\n');(ROOT/'app/static/benchmarks.json').write_text(json.dumps(result,indent=2)+'\n')
(ROOT/'lab/results/parity-fixtures.json').write_text(json.dumps(parity,separators=(',',':'))+'\n')
(ROOT/'app/static/samples').mkdir(exist_ok=True)
(ROOT/'app/static/samples/index.json').write_text(json.dumps(write_samples(ROOT/'app/static/samples'),indent=2)+'\n')
print(json.dumps(result['summary'],indent=2))
