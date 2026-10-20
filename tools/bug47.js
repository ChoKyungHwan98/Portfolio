const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});
const [W,H,D]=(process.argv[2]||'1280x600x1').split('x').map(Number);await p.setViewport({width:W,height:H,deviceScaleFactor:D||1});
const info=()=>p.evaluate(()=>{const h=document.querySelector('.wd-hero');const r=h?.getBoundingClientRect();const cs=h&&getComputedStyle(h);return {hash:location.hash,hero:!!h,rect:r&&[r.x|0,r.y|0,r.width|0,r.height|0],op:cs?.opacity,tf:cs?.transform,detailOp:document.querySelector('.pf-detail')&&getComputedStyle(document.querySelector('.pf-detail')).opacity,text:document.querySelector('.sheet-in')?.innerText.slice(0,80).replace(/\n/g,' | ')}});
await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'});await sl(1500);
const e=await p.$('.wk-top li:nth-child(2) .wk-card');const bb=await e.boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);
for(const t of [100,400,1200]){await sl(t);console.log('click',t,JSON.stringify(await info()));}
await p.screenshot({path:'/workspace/rhythm/shots/bug47_click_'+W+'.png'});
await p.goto('http://localhost:8766/#/portfolio/pico-bang',{waitUntil:'networkidle0'});await sl(1500);console.log('deep',JSON.stringify(await info()));
await p.screenshot({path:'/workspace/rhythm/shots/bug47_deep_'+W+'.png'});
console.log(errs.join('\n')||'no errs');await b.close()})()
