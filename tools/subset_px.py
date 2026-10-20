# 레트로 방 글자(Galmuri11 Bold, OFL)를 실제로 쓰는 글자만 남겨 작게 만듦 → app/src/assets/px.woff2
import subprocess, string, os
A='/workspace/rhythm/app'
txt=''.join(open(f'{A}/src/{f}',encoding='utf-8').read() for f in ['components/MediaRoom.jsx','tvScreen.js'])
import json
M=json.load(open(f'{A}/src/media.json',encoding='utf-8'))
txt+=''.join(M['genres']+M['animeGenres'])+'PC모바일콘솔'
chars=set(txt)|set(string.printable)|set('▶◀▲▼←→↑↓·…♪★☆■□●○※')
chars={c for c in chars if not c.isspace() or c==' '}
open('/tmp/px_chars.txt','w',encoding='utf-8').write(''.join(sorted(chars)))
subprocess.run(['pyftsubset',f'{A}/node_modules/galmuri/dist/Galmuri11-Bold.ttf','--text-file=/tmp/px_chars.txt','--flavor=woff2',f'--output-file={A}/src/assets/px.woff2','--layout-features=*','--no-hinting'],check=True)
print(len(chars),'glyphs ->',os.path.getsize(f'{A}/src/assets/px.woff2'),'bytes')
