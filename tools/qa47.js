const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H,D,RM]=[+process.argv[2],+process.argv[3],+(process.argv[4]||1),process.argv[5]==='rm'];
const S=['battle','pico-bang','ai-review','dorothia','silent-mansion','digreed'];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.setViewport({width:W,height:H,deviceScaleFactor:D});if(RM)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
let pass=0,fail=[];const ok=(c,n)=>{c?pass++:fail.push(n)};
const st=()=>p.evaluate(()=>{const h=document.querySelector('.wd-head');const d=[...document.querySelectorAll('.pf-detail')].map(x=>+getComputedStyle(x).opacity);const m=document.querySelector('.wd-main')?.getBoundingClientRect();const bar=document.querySelector('.wd-bar')?.getBoundingClientRect();const img=document.querySelector('.dv-page');const sv=document.querySelector('.sv-screen')?.getBoundingClientRect();
 return {hash:location.hash,title:h?.querySelector('h1')?.textContent,op:d,list:!!document.querySelector('.wk-list'),listOp:[...document.querySelectorAll('.wk-list')].map(x=>+getComputedStyle(x.parentElement).opacity),mainBot:m&&Math.round(m.bottom),barBot:bar&&Math.round(bar.bottom),img:img?.tagName==='IMG'?img.complete&&img.naturalWidth>0:'none',n:document.querySelector('.dv-n')?.textContent,sv:sv&&[Math.round(sv.width),Math.round(sv.height)],meta:document.querySelector('.wd-meta')?.textContent,tags:document.querySelector('.wd-head .wk-tags')?.textContent}});
const tag=`${W}x${H}${D>1?'_150':''}${RM?'_rm':''}`;
// deep links
for(const s of S){await p.goto('http://localhost:8766/#/portfolio/'+s,{waitUntil:'networkidle0'});await sl(1200);const r=await st();
 ok(r.title&&r.op.every(o=>o>0.99),'deep '+s+JSON.stringify(r));ok(r.mainBot<=H,'firstview '+s+' '+r.mainBot);ok(r.img!==false,'img '+s);
 console.log(tag,'deep',s,JSON.stringify(r));await p.screenshot({path:`/workspace/rhythm/shots/final47_d_${s}_${tag}.png`});}
// click from list + back pill
await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'});await sl(1300);
for(const s of S){const el=await p.$(`.pf-hit[data-slug="${s}"]`);await el.evaluate(e=>e.scrollIntoView({block:'center'}));await sl(150);const bb=await (await el.evaluateHandle(e=>e.closest('.wk-card'))).boundingBox();await p.mouse.click(bb.x+bb.width*0.7,bb.y+bb.height*0.6);await sl(1200);
 const r=await st();ok(r.hash==='#/portfolio/'+s&&r.op.every(o=>o>0.99),'click '+s+JSON.stringify(r));
 await (await p.$('.sk-top .pill')).click();await sl(1100);const l=await st();ok(l.list&&l.listOp.every(o=>o>0.99)&&l.hash==='#/portfolio','back '+s+JSON.stringify(l));}
// browser back from detail
await (await p.$('.pf-hit[data-slug="pico-bang"]')).click();await sl(1100);await p.goBack();await sl(1100);let r=await st();ok(r.list&&r.listOp.every(o=>o>.99),'history back');
// rapid re-entry (the bug)
for(const gap of [40,90,150,250]){await (await p.$('.pf-hit[data-slug="pico-bang"]')).click();await sl(1100);await (await p.$('.sk-top .pill')).click();await sl(gap);
 const el=await p.$('.pf-hit[data-slug="pico-bang"]');if(el){await el.click();}else{await p.evaluate(()=>{location.hash='#/portfolio/pico-bang'})}await sl(1300);r=await st();ok(r.title==='Pico-Bang!'&&r.op.every(o=>o>.99),'rapid '+gap+JSON.stringify(r));
 await p.goBack();await sl(60);await p.goForward();await sl(1300);r=await st();ok(r.title==='Pico-Bang!'&&r.op.every(o=>o>.99),'backfwd '+gap+JSON.stringify(r));
 await p.goBack();await sl(1100);}
// doc viewer: keys, buttons, bar
await p.goto('http://localhost:8766/#/portfolio/dorothia',{waitUntil:'networkidle0'});await sl(1200);
await p.focus('.dv-pane');await p.keyboard.press('ArrowRight');await p.keyboard.press('ArrowRight');await sl(500);r=await st();ok(r.n.startsWith('3')&&r.hash.endsWith('dorothia')&&r.img===true,'keys '+r.n);
await (await p.$('.dv-btn')).click();await sl(300);r=await st();ok(r.n.startsWith('2'),'prev btn '+r.n);
await p.screenshot({path:`/workspace/rhythm/shots/final47_dv_${tag}.png`});
await (await p.$('.wd-next')).click();await sl(1200);r=await st();ok(r.hash.endsWith('silent-mansion')&&r.op.every(o=>o>.99),'next bar '+r.hash);
await (await p.$('.wd-back')).click();await sl(1100);r=await st();ok(r.list,'bar back');
// field stats
const f=await p.evaluate(()=>window.__field);console.log('field',JSON.stringify(f));
console.log(tag,'PASS',pass,'FAIL',fail.length,fail.join('\n'));console.log(errs.join('\n')||'no errs');await b.close()})()
