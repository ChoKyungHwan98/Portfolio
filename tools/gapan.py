import sys,glob,os
from PIL import Image
d=sys.argv[1]; mob='m' in os.path.basename(d.rstrip('/'))[:1]
res={}; worst=[]
for f in sorted(glob.glob(d+'/*.png')):
  im=Image.open(f).convert('L'); W,H=im.size; px=im.load(); gaps=0; norim=0; lines=0
  if not mob:
    for y in range(10,H-10,15):
      x=W-1
      while x>0 and px[x,y]>=75: x-=1
      if x<=0: continue
      lines+=1
      if not (30<=px[x,y]<=62 or 30<=px[x-1,y]<=62): norim+=1
      for k in range(1,90):
        if x-k<0: break
        if px[x-k,y]>120: gaps+=1; worst.append((os.path.basename(f),y,x-k)); break
  else:
    for x in range(6,W-6,8):
      y=H-1
      while y>0 and px[x,y]>=75: y-=1
      if y<=0: continue
      lines+=1
      if not (30<=px[x,y]<=62 or 30<=px[x,y-1]<=62): norim+=1
      for k in range(1,60):
        if y-k<0: break
        if px[x,y-k]>120: gaps+=1; worst.append((os.path.basename(f),x,y-k)); break
  res[os.path.basename(f)]=(lines,gaps,norim)
fr=len(res); g=sum(1 for v in res.values() if v[1]); n=sum(1 for v in res.values() if v[2])
print(f'{d}: frames {fr}, scanlines/frame ~{sum(v[0] for v in res.values())//max(1,fr)}, frames with white gap {g}, frames with rim missing on some line {n}')
for w in worst[:6]: print('  gap at',w)
if n: print('  norim frames', [k for k,v in res.items() if v[2]][:10])
