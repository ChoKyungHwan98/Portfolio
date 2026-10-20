import sys,glob,os
from PIL import Image,ImageDraw
# usage: sheet.py out.png cols scale files...
out,cols,sc=sys.argv[1],int(sys.argv[2]),float(sys.argv[3]); fs=sys.argv[4:]
ims=[Image.open(f).convert('RGB') for f in fs]; w,h=int(ims[0].width*sc),int(ims[0].height*sc)
rows=(len(ims)+cols-1)//cols; S=Image.new('RGB',(cols*(w+6)+6,rows*(h+22)+6),(40,40,40)); d=ImageDraw.Draw(S)
for i,(im,f) in enumerate(zip(ims,fs)):
  x=6+(i%cols)*(w+6); y=6+(i//cols)*(h+22); S.paste(im.resize((w,h)),(x,y+16)); d.text((x,y+2),os.path.basename(f)[:-4],fill=(255,212,0))
S.save(out)
