#!/usr/bin/env python3
"""Build the same C sources for native evaluation or browser WASM."""
import argparse, os, platform, shutil, subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--wasm',action='store_true');args=p.parse_args()
sources=sorted((root/'engine/nbis/mindtct').glob('*.c'))+sorted((root/'engine/nbis/bozorth3').glob('*.c'))+sorted((root/'engine/native').glob('*.c'))
base=['-O3','-fno-strict-aliasing','-Wno-implicit-function-declaration','-Wno-incompatible-pointer-types','-I'+str(root/'engine/nbis/shim'),'-I'+str(root/'engine/nbis/include'),'-I'+str(root/'engine/native')]
if args.wasm:
 emcc=os.environ.get('EMCC') or shutil.which('emcc')
 if not emcc: raise SystemExit('Install Emscripten 4.0.23 and set EMCC or source emsdk_env.sh.')
 out=root/'app/static/core/smudge-core.js';out.parent.mkdir(parents=True,exist_ok=True)
 exports=['malloc','free','sm_mindtct','sm_bozorth','sm_orientation','sm_ridge_period','sm_clahe','sm_gabor','sm_resize','sm_unsharp','sm_ssim','sm_analyze','sm_smudge','sm_sizeof_minutia','sm_sizeof_info','sm_version']
 import json
 cmd=[emcc,*base,*map(str,sources),'-lm','-msimd128','-sMODULARIZE=1','-sEXPORT_ES6=1','-sEXPORT_NAME=createSmudgeCore','-sENVIRONMENT=web,worker,node','-sALLOW_MEMORY_GROWTH=1','-sINITIAL_MEMORY=67108864','-sMAXIMUM_MEMORY=536870912','-sFILESYSTEM=0','-sEXPORTED_FUNCTIONS='+json.dumps(['_'+x for x in exports]),'-sEXPORTED_RUNTIME_METHODS='+json.dumps(['HEAPU8','HEAP32','HEAPF32']),'-o',str(out)]
else:
 out=root/'engine/wasm'/('libsmudge.dylib' if platform.system()=='Darwin' else 'libsmudge.so');out.parent.mkdir(exist_ok=True)
 cmd=[os.environ.get('CC','cc'),*base,'-shared','-fPIC',*map(str,sources),'-lm','-o',str(out)]
subprocess.run(cmd,check=True,cwd=root)
print(f'Built {out.relative_to(root)} ({out.stat().st_size:,} bytes)')
