"""Start the exact production header server, run release checks, always stop it."""
from pathlib import Path
import subprocess,sys,time,urllib.request,os
ROOT=Path(__file__).resolve().parents[2]
server=subprocess.Popen(['node',str(ROOT/'AI Assisted/scripts/serve.mjs')],cwd=ROOT)
try:
 for _ in range(60):
  try:
   with urllib.request.urlopen('http://127.0.0.1:4318',timeout=1) as r:
    if r.status==200:break
  except Exception:time.sleep(.5)
 else:raise RuntimeError('Production server did not start')
 subprocess.run([sys.executable,str(ROOT/'AI Assisted/tests/e2e.py')],check=True,cwd=ROOT)
finally:server.terminate();server.wait(timeout=10)
