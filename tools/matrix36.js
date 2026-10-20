const puppeteer=require('puppeteer-core');
const base=[[1366,768],[1280,720],[1536,864],[1440,900]], zooms=[1,1.25,1.5];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
const shoot=process.argv[2]; const all=[];
for(const [W,H] of base) for(const z of zooms){
 const w=Math.round(W/z),h=Math.round(H/z);
 const p=await b.newPage(); await p.setViewport({width:w,height:h,deviceScaleFactor:z});
 await p.goto('http://localhost:8766/index.html?still',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,900));
 await p.hover('.mi:nth-of-type(3)'); await new Promise(r=>setTimeout(r,600));
 const r=await p.evaluate(()=>{const R=e=>e.getBoundingClientRect();const pn=R(document.querySelector('.panel'));
  const edge=y=>pn.left+pn.width*(0.6017+0.3983*(y-pn.top)/pn.height); const issues=[]; const vw=innerWidth,vh=innerHeight;
  const els=[...document.querySelectorAll('.brand,.keys,.mi,.tile,.play,.chip')];
  for(const e of els){const b=R(e); if(b.left<0||b.top<0||b.right>vw||b.bottom>vh) issues.push('CLIP '+e.className+' '+[b.left,b.top,b.right,b.bottom].map(Math.round))}
  for(const t of document.querySelectorAll('.tile')){const l=t.querySelector('.tile-label').getBoundingClientRect(),b=R(t); if(l.width>b.width-12) issues.push(`TILE-LABEL ${Math.round(l.width)}>${Math.round(b.width)}-12`)}
  const pl=R(document.querySelector('.play')); for(const s of ['.play-main','.play-sub']){const x=R(document.querySelector(s)); if(x.width>pl.width-30) issues.push('PLAY-TEXT '+s)}
  const band=R(document.querySelector('.band')); const tileTop=Math.min(...[...document.querySelectorAll('.tile,.play')].map(e=>R(e).top));
  const gap=tileTop-(band.bottom+12*Math.min(innerWidth/1920,innerHeight/1080));
  if(gap<24) issues.push('MENU-ROW gap '+Math.round(gap)+'px');
  for(const e of document.querySelectorAll('.tile,.play,.chip,.mi')){const b=R(e); const m=Math.min(edge(b.top),edge(b.bottom))-b.right; if(m<16) issues.push(`DIAG ${e.className} margin ${Math.round(m)}`)}
  const k=R(document.querySelector('.keys')),br=R(document.querySelector('.brand')); if(k.left<br.right+20) issues.push('KEYS-BRAND overlap');
  const ct=Math.min(...[...document.querySelectorAll('.chip')].map(e=>R(e).top)); const tb=Math.max(...[...document.querySelectorAll('.tile,.play')].map(e=>R(e).bottom));
  return {gap:Math.round(gap),rowContact:Math.round(ct-tb),bottom:Math.round(vh-Math.max(...[...document.querySelectorAll('.chip')].map(e=>R(e).bottom))),issues}});
 const name=`${W}x${H}@${z*100}% (css ${w}x${h})`; console.log(name,JSON.stringify(r));
 if(shoot){const f=`../shots/final36_zoom_${W}x${H}_${z*100}.png`; await p.screenshot({path:f}); all.push([name,f]);}
 await p.close();}
await b.close(); if(shoot) require('fs').writeFileSync('/tmp/zoomlist36.json',JSON.stringify(all));})();
