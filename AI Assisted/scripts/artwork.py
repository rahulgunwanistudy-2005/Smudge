"""Generate original ornamental ridge art and lightweight specimen thumbnails."""
from pathlib import Path
import math,json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];dest=ROOT/'app/static'
def line(n):
 r=10+n*3.25;parts=[]
 for i in range(101):
  t=-.3+i/100*(math.pi*2-.1);warp=1+.025*math.sin(t*5+n*.42);x=150+math.sin(t)*r*warp;y=177-math.cos(t)*r*1.32+7*math.sin(t*2+n*.12)
  parts.append(f'{"L" if i else "M"}{x:.2f},{y:.2f}')
 return ' '.join(parts)
paths=''.join(f'<path d="{line(n)}" opacity="{.96-n*.009:.3f}"/>' for n in range(30))
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 370" fill="none"><defs><linearGradient id="ridge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e0ffd2"/><stop offset=".4" stop-color="#9be881"/><stop offset="1" stop-color="#4e9e6d"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="2.7"/></filter></defs><g stroke="#92e774" stroke-width="4" opacity=".16" filter="url(#glow)">{paths}</g><g stroke="url(#ridge)" stroke-width="1.65" stroke-linecap="round">{paths}</g><g fill="#d8ffb7"><circle cx="100" cy="117" r="3"/><circle cx="188" cy="156" r="3"/><circle cx="122" cy="241" r="3"/><circle cx="206" cy="218" r="3"/></g><g stroke="#c8f5b3" opacity=".5"><path d="M100 117 64 97H28 M188 156l34-30h44 M122 241l-46 29H34 M206 218l24 30h35"/><circle cx="100" cy="117" r="8"/><circle cx="188" cy="156" r="8"/></g></svg>'''
(dest/'fingerprint-art.svg').write_text(svg)
index=dest/'samples/index.json';samples=json.loads(index.read_text())
for sample in samples:
 image=Image.open(dest/sample['url'].lstrip('/'));image.thumbnail((240,173));name=Path(sample['url']).stem+'-thumb.webp';image.save(dest/'samples'/name,'WEBP',quality=76);sample['thumbnail']='/samples/'+name
index.write_text(json.dumps(samples,indent=2)+'\n')
