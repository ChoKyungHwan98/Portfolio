# 기획서 페이지 이미지 압축: WebP q82 (원본 폭) + 1280 폭 반응형. 원본은 그대로 둠
import os, json
from PIL import Image
SRC='/workspace/rhythm/assets_src'; OUT='/workspace/rhythm/assets_web'
rep={}
for d in ['silence','dorothia','digreed','scenario']:
    os.makedirs(f'{OUT}/{d}',exist_ok=True)
    b=a_full=a_sm=0; n=0
    for f in sorted(os.listdir(f'{SRC}/{d}')):
        p=f'{SRC}/{d}/{f}'; im=Image.open(p); b+=os.path.getsize(p); n+=1
        im=im.convert('RGB') if im.mode not in('RGB','L') else im
        if im.mode=='L': im=im.convert('RGB')
        base=os.path.splitext(f)[0]
        W=im.width; full=im if W<=1920 else im.resize((1920,round(im.height*1920/W)),Image.LANCZOS)
        o1=f'{OUT}/{d}/{base}.webp'; full.save(o1,'WEBP',quality=82,method=6); a_full+=os.path.getsize(o1)
        sw=1280 if im.width>im.height else 900
        sm=im.resize((sw,round(im.height*sw/im.width)),Image.LANCZOS) if im.width>sw else im
        o2=f'{OUT}/{d}/{base}-{sw}.webp'; sm.save(o2,'WEBP',quality=80,method=6); a_sm+=os.path.getsize(o2)
    rep[d]=dict(pages=n,before=b,webp_full=a_full,webp_small=a_sm)
    print(d,rep[d],flush=True)
json.dump(rep,open(f'{OUT}/report.json','w'),indent=1)
