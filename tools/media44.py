import re, json, os
from PIL import Image
D='/workspace/rhythm/oldsite/src/data'; S='/workspace/rhythm/oldsite/img_src'; O='/workspace/rhythm/app/public/media'
GENRE_MAP={'RPG':['RPG'],'어드벤처':['어드벤처','노벨','공포','로그라이크','메트로배니아','비주얼 노벨'],'퍼즐':['퍼즐','퀴즈','캐주얼'],
 '액션':['액션','난투','대전','배틀로얄','격투','런앤건','플랫폼','런게임','생존'],'전략':['전략','AOS','RTS','CCG','TCG','디펜스'],
 '시뮬레이션':['시뮬레이션','스포츠','레이싱','경영','AR','수면','보드게임','소셜'],'슈팅':['슈팅','FPS','TPS','히어로슈터'],'리듬':['리듬']}
def score(g):
  s=0; f=g.get('flag') or ''
  if g.get('isFavorite'): s+=1e9
  if g.get('yearsPlayed'): s+=g['yearsPlayed']*1e6
  if f and '시간' not in f and '년' not in f: s+=1e7
  if g.get('isPerfectCleared'): s+=1e6
  m=re.search(r'\d+',f) if '시간' in f else None
  if m: s+=int(m.group())*10
  if g.get('isCleared'): s+=1
  return s
before=after=0; missing=[]
def thumb(src,dst,w):
  global before,after
  p=os.path.join(S,src)
  if not os.path.exists(p): missing.append(src); return None
  before+=os.path.getsize(p)
  im=Image.open(p); im=im.convert('RGBA') if im.mode in ('P','LA','RGBA') else im.convert('RGB')
  if im.mode=='RGBA':
    bg=Image.new('RGB',im.size,(20,20,20)); bg.paste(im,mask=im.split()[3]); im=bg
  ar=im.width/im.height
  if im.width>w: im=im.resize((w,round(w/ar)),Image.LANCZOS)
  im.save(dst,'WEBP',quality=74,method=6); after+=os.path.getsize(dst)
  return round(ar,2)
games=[]
for f,cat in [('pc','PC'),('mobile','Mobile'),('console','Console')]:
  t=open(f'{D}/games/{f}.ts',encoding='utf-8').read()
  for line in t.splitlines():
    line=line.strip().rstrip(',')
    if line.startswith('{"id"'): games.append(json.loads(line))
for g in games:
  g['groups']=[k for k,v in GENRE_MAP.items() if any(kw.lower() in (g.get('genre') or '').lower() for kw in v)]
games.sort(key=lambda g:-score(g))  # stable: same order as old site
# v4.5 Cho 지정 게임 최애 8 (순서대로): osu!, 역전재판 3, 무기미도, DARK SOULS III, 엘든 링, OMORI, 메이플스토리, Danganronpa V3
FAV=['pc-6','console-131','mobile-1','console-30','console-1','console-51','pc-15','console-34']
BLOCK=['무라마사','muramasa']  # 사이트 어디에도 넣지 않음
games=[g for g in games if not any(b in g['title'].lower() for b in BLOCK)]
G=[]
seen={}
for g in games:
  if g['id'] in seen: seen[g['id']]+=1; g['id']=g['id']+'-'+str(seen[g['id']])  # 예전 데이터에 같은 id 가 둘(console-177) → 표지 파일도 덮어써지므로 따로
  else: seen[g['id']]=0
  src=(g.get('image') or '').split('/')[-1]
  ar=thumb('games/'+src,f"{O}/g/{g['id']}.webp",320) if src else None
  o={'id':g['id'],'t':g['title'],'p':{'PC':'pc','Pc':'pc','Mobile':'mo','Console':'co'}[g['category']],'g':g.get('genre',''),'gr':g['groups']}
  if g.get('flag'): o['f']=g['flag']
  if g['id'] in FAV: o['fav']=FAV.index(g['id'])+1  # v4.5 Cho 지정 8개, 이 순서
  if g.get('isPerfectCleared'): o['pc']=1
  elif g.get('isCleared'): o['cl']=1
  if ar: o['ar']=ar
  G.append(o)
t=open(f'{D}/anime.ts',encoding='utf-8').read()
arr=t[t.index('ANIME_ITEMS: AnimeItem[] = ')+len('ANIME_ITEMS: AnimeItem[] = '):]
arr=arr[:arr.index('\n];')+3]
items=json.loads(arr.rstrip(';'))
A=[]
for a in items:
  if any(b in a['title'].lower() for b in BLOCK): continue
  src=a['image'].split('/')[-1]
  ar=thumb('anime/'+src,f"{O}/a/{a['id']}.webp",200)
  o={'id':a['id'],'t':a['title'],'y':a['year'],'q':a['quarter'],'g':a['genres']}
  if a.get('favorite') and a.get('favoriteRank') is not None: o['r']=a['favoriteRank']+1
  if ar: o['ar']=ar
  A.append(o)
json.dump({'games':G,'anime':A,'genres':list(GENRE_MAP),'animeGenres':re.findall(r'"([^"]+)"',t[t.index('ANIME_GENRES'):t.index('] as const')])},open('/workspace/rhythm/app/src/media.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('games',len(G),'anime',len(A),'favG',sum(1 for g in G if g.get('fav')),'favA',sum(1 for a in A if a.get('r')))
print('img before %.1fMB after %.1fMB'%(before/1e6,after/1e6),'missing',len(missing),missing[:10])
from collections import Counter
print(Counter(g['p'] for g in G)); print({k:sum(1 for g in G if k in g['gr']) for k in GENRE_MAP}); print('nogroup',sum(1 for g in G if not g['gr']))
