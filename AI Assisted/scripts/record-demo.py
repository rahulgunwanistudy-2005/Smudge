"""Record actual offline processing, then add timed captions and local narration.
Requires Playwright, ffmpeg and macOS system voice. No simulated measurements.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import time,json,subprocess
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/demo';OUT.mkdir(exist_ok=True);DEST=ROOT/'app/static/demo';DEST.mkdir(parents=True,exist_ok=True);TMP=Path('/tmp/smudge-demo-final');TMP.mkdir(exist_ok=True)
scenes=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True);ctx=browser.new_context(viewport={'width':1920,'height':1080},record_video_dir=str(TMP),record_video_size={'width':1920,'height':1080});page=ctx.new_page();start=time.monotonic()
 now=lambda:time.monotonic()-start
 def hold(seconds):page.wait_for_timeout(seconds*1000)
 def scene(a,text):scenes.append({'start':a,'end':now(),'text':text})
 a=now();page.goto('http://127.0.0.1:4318');page.wait_for_load_state('networkidle');hold(9)
 scene(a,'Your fingerprint. Yours to keep. Smudge explores sharing photos with less biometric detail. This demonstration uses a synthetic specimen, not a person’s fingerprint.')
 a=now();page.get_by_role('button',name='Privacy proof',exact=True).click();page.get_by_text('Ready for offline use',exact=True).wait_for(timeout=120000);ctx.set_offline(True);page.reload();page.wait_for_load_state('networkidle');page.get_by_role('button',name='Ridge study',exact=False).click();page.get_by_role('button',name='Analyse 1 print',exact=False).click();page.get_by_role('button',name='Smudge selected prints').wait_for(timeout=90000);page.get_by_role('button',name='Inspect Synthetic print 1',exact=True).first.click();hold(8);page.keyboard.press('Escape');hold(6)
 scene(a,'The browser network is now disabled. Actual NIST extraction finds these ridge points. This synthetic example compares an image with itself. A real identity comparison needs a separate close up of the same finger.')
 a=now();page.get_by_role('button',name='Smudge selected prints').click();page.get_by_role('button',name='Download photo',exact=True).wait_for(timeout=120000);page.get_by_label('Before and after comparison').fill('20');hold(3);page.get_by_label('Before and after comparison').fill('80');hold(3);page.get_by_text('Exact exported JPEG',exact=True).scroll_into_view_if_needed();hold(7)
 scene(a,'Smudge suppresses ridge detail and re-tests enhancement, sharpening, upscaling, and JPEG variants at increasing strengths. Strong treatment changes close ups visibly. Finally it reopens the exact downloaded JPEG, runs the matcher again, and measures that file. These are real computations with the network disabled.')
 a=now();ctx.set_offline(False);page.reload();page.wait_for_load_state('networkidle');page.get_by_role('button',name='Privacy proof',exact=True).click();hold(16)
 scene(a,'The privacy drawer shows actual response policies and observed external resources. Your photo is never uploaded. This counter is an audit aid, not a claim about every browser or operating system connection. The full scan and export just ran offline.')
 a=now();ctx.set_offline(False);page.get_by_role('button',name='The lab',exact=True).click();hold(7);page.get_by_text('A second matcher, the same synthetic test',exact=True).scroll_into_view_if_needed();hold(13)
 scene(a,'The lab publishes reproducible synthetic measurements for two independent matchers, including a learned four times upscaler. Fifty native and browser fixtures agree. These are synthetic diagnostics, not calibrated protection for human fingerprints.')
 a=now();page.get_by_role('button',name='Documents',exact=True).click();
 if page.get_by_role('button',name='New scan',exact=True).count():page.get_by_role('button',name='New scan',exact=True).click()
 page.get_by_role('button',name='Document specimen',exact=False).click();hold(14)
 scene(a,'Document mode opens scans and PDF pages, with optional local identifier checks. Review every suggested mask. Human validation, capture distance studies, and real phone measurements remain open.')
 a=now();page.get_by_role('button',name='Why Smudge',exact=True).click();hold(9)
 scene(a,'A fingerprint is not a password. Smudge is a working defensive prototype, with inspectable evidence and clear limits. You can choose to share less of your identity.')
 duration=now();video=page.video;ctx.close();raw=TMP/'capture.webm';video.save_as(str(raw));browser.close()
# Each narration segment starts with its observed scene. Never replace real scores.
for i,s in enumerate(scenes):
 subprocess.run(['say','-v','Samantha','-r','165','-o',str(TMP/f'{i}.aiff'),s['text']],check=True)
 s['speechDuration']=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(TMP/f'{i}.aiff')],text=True))
# Small cues, rather than a whole paragraph covering the UI.
subs=[]
for s in scenes:
 words=s['text'].split();speech=min(s['speechDuration'],s['end']-s['start'])
 for pos in range(0,len(words),11):
  chunk=words[pos:pos+11];a=s['start']+speech*pos/len(words);z=s['start']+speech*(pos+len(chunk))/len(words);subs.append((a,z,' '.join(chunk)))
def stamp(t):
 ms=round(t*1000);h=ms//3600000;m=ms//60000%60;sec=ms//1000%60;return f'{h:02}:{m:02}:{sec:02},{ms%1000:03}'
srt='\n\n'.join(f'{i+1}\n{stamp(a)} --> {stamp(z)}\n{text}' for i,(a,z,text) in enumerate(subs))+'\n';(OUT/'captions.srt').write_text(srt);(DEST/'captions.srt').write_text(srt);(OUT/'timing.json').write_text(json.dumps({'duration':duration,'scenes':scenes,'synthetic':True,'narration':'Local macOS system voice'},indent=2)+'\n')
inputs=['-i',str(raw)];filters=[]
for i,s in enumerate(scenes):inputs+=['-i',str(TMP/f'{i}.aiff')];filters.append(f'[{i+1}:a]atempo={max(1,s["speechDuration"]/(s["end"]-s["start"]-.1))},atrim=0:{s["end"]-s["start"]},adelay={round(s["start"]*1000)}|{round(s["start"]*1000)}[a{i}]')
filters.append(''.join(f'[a{i}]' for i in range(len(scenes)))+f'amix=inputs={len(scenes)}:normalize=0,apad,atrim=0:{duration}[audio]')
font='/System/Library/Fonts/Supplemental/Arial.ttf'
vfilter=f"subtitles='{OUT/'captions.srt'}':force_style='FontSize=8,PrimaryColour=&H00FFFFFF,OutlineColour=&H00102010,BorderStyle=3,Outline=1,MarginV=14',drawtext=fontfile='{font}':text='Synthetic specimen | Real local processing | Prototype':fontcolor=white:fontsize=20:box=1:boxcolor=0x102c23@0.9:boxborderw=10:x=240:y=92"
subprocess.run(['ffmpeg','-y',*inputs,'-filter_complex',';'.join(filters),'-vf',vfilter,'-map','0:v','-map','[audio]','-t',str(duration),'-c:v','libx264','-crf','25','-preset','fast','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',str(DEST/'smudge-demo.mp4')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
print(f'Recorded actual workflow: {duration:.1f}s, 1920×1080.',flush=True)
