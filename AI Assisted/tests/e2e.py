"""Release checks against an already running production preview. No personal images."""
from playwright.sync_api import sync_playwright,expect
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,os,sys,time
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parent;BASE=os.environ.get('SMUDGE_URL','http://127.0.0.1:4318');OUT=Path(os.environ.get('SMUDGE_EVIDENCE_DIR',str(ROOT/'docs/screenshots')));OUT.mkdir(parents=True,exist_ok=True)

def scan_and_smudge(page):
 page.get_by_role('button',name='Analyse 1 print',exact=False).click();page.get_by_role('button',name='Smudge selected prints').wait_for(timeout=90000)
 page.get_by_role('button',name='Inspect Synthetic print 1',exact=True).first.click();page.get_by_role('dialog').wait_for();page.screenshot(path=str(OUT/'loupe.png'));page.keyboard.press('Escape')
 page.screenshot(path=str(OUT/'scan.png'),full_page=True)
 page.get_by_role('button',name='Smudge selected prints').click();page.get_by_role('button',name='Download photo',exact=True).wait_for(timeout=180000)
 expect(page.get_by_text('Exact exported JPEG',exact=True)).to_be_visible()

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True);ctx=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True);page=ctx.new_page();errors=[];external=[];methods=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 ctx.on('request',lambda r:external.append(r.url) if r.url.startswith('http') and not r.url.startswith(BASE+'/') else None)
 ctx.on('request',lambda r:methods.append(r.method))
 response=page.goto(BASE);assert response.header_value('connection-allowlist')=='(response-origin)','Missing connection policy header';assert response.header_value('content-security-policy'),'Missing CSP header';page.wait_for_load_state('networkidle');expect(page.get_by_role('heading',name='Some things are yours to keep.')).to_be_visible();page.screenshot(path=str(OUT/'dashboard.png'),full_page=True)
 page.get_by_role('button',name='Ridge study',exact=False).click();scan_and_smudge(page);page.screenshot(path=str(OUT/'result.png'),full_page=True)
 with page.expect_download() as got:page.get_by_role('button',name='Report',exact=True).click()
 data=json.loads(Path(got.value.path()).read_text());assert data['schema']=='smudge-report/1' and data['thresholdCalibrated'] is False and data['synthetic'] is True
 assert 'minutiae' not in json.dumps(data), 'Report exported biometric coordinates';assert data['prints'][0]['after']['score']<40
 with page.expect_download() as got:page.get_by_role('button',name='Download photo',exact=True).click()
 exported=Image.open(got.value.path());assert exported.size==(1000,720);assert not exported.getexif(),'Original EXIF must not survive'
 (ROOT/'lab/results/browser-report.json').write_text(json.dumps(data,indent=2)+'\n')
 page.get_by_role('button',name='Privacy proof',exact=True).click();page.get_by_text('Ready for offline use',exact=True).wait_for(timeout=120000);page.screenshot(path=str(OUT/'privacy-proof.png'),full_page=True)
 assert page.locator('.proof-counter>strong').inner_text()=='0'
 ctx.set_offline(True);page.reload();page.wait_for_load_state('networkidle');page.get_by_role('button',name='Ridge study',exact=False).click();scan_and_smudge(page);print('PASS: offline full scan and exported-JPEG verification',flush=True)
 ctx.set_offline(False);page.get_by_role('button',name='The lab',exact=True).click();page.screenshot(path=str(OUT/'benchmarks.png'),full_page=True)
 # Upload, no-reference fallback, and automatic hand model on a synthetic non-hand.
 page.get_by_role('button',name='Fingerprint scan',exact=True).click();page.get_by_role('button',name='New scan',exact=True).click();page.locator('.consent input').check();page.locator('input[type=file][aria-label="Choose image file"]').set_input_files(str(ROOT/'app/static/samples/specimen-7.png'))
 page.get_by_role('button',name='Find fingertips',exact=True).click();page.get_by_text('No hands found.',exact=False).wait_for(timeout=90000)
 assert not page.get_by_role('alert').count(), 'Self-hosted detector failed'
 page.get_by_role('button',name='Add region',exact=True).click();page.get_by_role('button',name='Analyse 1 print',exact=False).click();page.get_by_text('No reference. No match score.',exact=True).wait_for(timeout=90000);print('PASS: local detector and honest no-reference analysis',flush=True)
 # Local PDF.js render and per-page handling.
 pdf=ROOT/'lab/data/generated/two-pages.pdf';pdf.parent.mkdir(parents=True,exist_ok=True);im=Image.open(ROOT/'app/static/samples/specimen-31.png').convert('RGB');im.save(pdf,'PDF',save_all=True,append_images=[im])
 page.get_by_role('button',name='New scan',exact=True).click();page.locator('input[type=file][aria-label="Choose image file"]').set_input_files(str(pdf));page.get_by_label('PDF page',exact=True).wait_for(timeout=60000);page.get_by_label('PDF page',exact=True).select_option('2');page.get_by_text('Export covers this page only.',exact=False).wait_for(timeout=60000);print('PASS: local multipage PDF rendering',flush=True)
 # A fabricated checksum-valid identifier, no real identity document.
 sys.path.insert(0,str(ROOT/'lab'));from PIL import ImageFont
 ocr=Image.new('RGB',(1200,360),'white');draw=ImageDraw.Draw(ocr);fontpath='/System/Library/Fonts/Supplemental/Arial.ttf';font=ImageFont.truetype(fontpath,48) if Path(fontpath).exists() else ImageFont.load_default(size=48)
 draw.text((40,40),'SPECIMEN - NOT A REAL ID',fill='black',font=font);draw.text((40,140),'2345 6789 0124',fill='black',font=font);ocrpath=ROOT/'lab/data/generated/ocr-specimen.png';ocr.save(ocrpath)
 page.get_by_role('button',name='New scan',exact=True).click();page.locator('input[type=file][aria-label="Choose image file"]').set_input_files(str(ocrpath));page.get_by_role('button',name='Check identifiers',exact=True).click();page.locator('.status-message').filter(has_text='1 checksum-valid identifier found.').wait_for(timeout=90000);assert not page.get_by_role('alert').count(),'Local OCR failed';print('PASS: local document OCR',flush=True)
 assert not external,f'External requests: {external}';assert not errors,f'Browser errors: {errors}'
 assert all(m in ('GET','HEAD') for m in methods),'Unexpected upload request during image workflow'
 # Accessibility audit, then mobile layout and theme.
 page.get_by_role('button',name='New scan',exact=True).click();page.get_by_role('button',name='Fingerprint scan',exact=True).click();page.evaluate((REPO/'node_modules/axe-core/axe.min.js').read_text());audit=page.evaluate("async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})");violations=[{'id':v['id'],'impact':v['impact'],'nodes':len(v['nodes'])} for v in audit['violations']]
 print('ACCESSIBILITY',json.dumps(violations),flush=True);assert not violations,f'Accessibility violations: {violations}'
 (ROOT/'lab/results/accessibility.json').write_text(json.dumps({'automatedOnly':True,'violations':violations},indent=2)+'\n')
 mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,device_scale_factor=1);mp=mobile.new_page();mp.goto(BASE);mp.wait_for_load_state('networkidle');assert mp.evaluate('document.documentElement.scrollWidth<=innerWidth');mp.screenshot(path=str(OUT/'mobile.png'),full_page=True);mp.get_by_role('button',name='Switch to dark theme').click();mp.screenshot(path=str(OUT/'mobile-dark.png'),full_page=True)
 result={'status':'passed','externalRequests':len(external),'browserErrors':errors,'browser':browser.version,'origin':BASE,'tested':['synthetic closed loop','exact exported JPEG','report without minutiae','metadata-free download','offline reload and full flow','local MediaPipe startup','no-reference fallback','multipage PDF','local OCR','390px layout','dark theme'],'accessibilityViolations':violations}
 (ROOT/'lab/results/e2e.json').write_text(json.dumps(result,indent=2)+'\n');browser.close();print(json.dumps(result,indent=2),flush=True)
