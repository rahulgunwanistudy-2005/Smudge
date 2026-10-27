from playwright.sync_api import sync_playwright
import json
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);ctx=b.new_context(viewport={'width':1440,'height':1000});page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:print('BROWSER',m.type,m.text) if m.type=='error' else None)
 page.goto('http://127.0.0.1:4318');page.wait_for_load_state('networkidle');page.screenshot(path='/tmp/smudge-home.png',full_page=True);print(page.locator('h1').inner_text());print('buttons',page.get_by_role('button').all_text_contents());print('errors',errors)
 page.get_by_role('button',name='Ridge study',exact=False).click();page.get_by_role('button',name='Analyse 1 print',exact=False).click();page.get_by_role('button',name='Smudge selected prints').wait_for(timeout=60000);page.screenshot(path='/tmp/smudge-scan.png',full_page=True);print('SCAN',page.locator('.analysis-card').inner_text());page.get_by_role('button',name='Smudge selected prints').click();page.get_by_role('button',name='Download photo',exact=True).wait_for(timeout=120000);page.screenshot(path='/tmp/smudge-result.png',full_page=True);print('RESULT',page.locator('.verification-card').inner_text());print('errors',errors)
 b.close()
