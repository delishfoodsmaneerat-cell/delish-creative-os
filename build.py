#!/usr/bin/env python3
"""Build public/index.html for the standalone site from the shared app sources in ../creative-os."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.environ.get("APP_SRC", os.path.join(HERE, "app-src"))
ORDER = ['03-core.js','04-work.js','05-launch.js','06-data.js','08-listen.js','10-lsreport.js','09-gsc.js','11-hub.js','12-hosted.js','07-ai-boot.js']
r = lambda p: open(os.path.join(SRC, p), encoding="utf-8").read()
js = ''.join(r(f) for f in ORDER)
js = js.replace('VIEWS.studio=()=>{if($("#v-studio").dataset.built)return;$("#v-studio").dataset.built="1";','VIEWS.studio=()=>{const bk=S.products.length+"|"+!!sample;if($("#v-studio").dataset.built===bk)return;$("#v-studio").dataset.built=bk;')
js = js.replace('if(ready&&!l.t?.ready)dbUpd(','if(ready&&!l.t?.ready&&!markedReady.has(l.id)&&markedReady.add(l.id))dbUpd(')
js = js.replace('const taskIdFor=','const markedReady=new Set();\nconst taskIdFor=')
assert 'markedReady.has' in js and 'dataset.built===bk' in js
head = r('01-head.html').replace('<meta name="claude:viewport-fit-sides" content="cover">\n','')
FB = "https://www.gstatic.com/firebasejs/10.14.1/"
libs = ''.join(f'<script src="{FB}firebase-{m}-compat.js"></script>\n' for m in ['app','auth','firestore','functions','storage'])
shim_css = open(os.path.join(HERE,'src','shim.css'),encoding='utf-8').read()
shim_js = open(os.path.join(HERE,'src','shim.js'),encoding='utf-8').read()
html = ('<!doctype html>\n<html lang="th">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  '<meta name="robots" content="noindex,nofollow">\n' + head + '<style>' + shim_css + '</style>\n'
  '<script src="config.js"></script>\n' + libs + '<script>\n' + shim_js + '\n</script>\n</head>\n<body>\n' + r('02-body.html') +
  '<script>\n' + js + '\n</script>\n</body>\n</html>\n')
out = os.path.join(HERE, 'public', 'index.html')
open(out, 'w', encoding='utf-8').write(html)
print("built", out, len(html), "bytes")
