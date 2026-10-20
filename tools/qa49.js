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
 console.log(tag,'deep',s,JSON.stringify(r));await p.screenshot({path:`/workspace/rhythm/shots/final49_d_${s}_${tag}.png`});}
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
// reader overlay
const inOv=()=>p.evaluate(()=>{const o=document.querySelector('.ov');return {ov:!!o,inert:document.getElementById('root').inert,act:document.activeElement?.className||document.activeElement?.tagName,inside:!!(o&&o.contains(document.activeElement)),n:document.querySelector('.rd .dv-n')?.textContent,hash:location.hash,frames:document.querySelectorAll('iframe').length}});
await p.goto('http://localhost:8766/#/portfolio/dorothia',{waitUntil:'networkidle0'});await sl(1200);
await p.focus('.dp-read');await p.keyboard.press('Enter');await sl(700);r=await inOv();ok(r.ov&&r.inert&&r.inside&&r.n.startsWith('1 /'),'reader open '+JSON.stringify(r));
await p.keyboard.press('ArrowRight');await sl(150);await p.keyboard.press('ArrowRight');await sl(500);r=await inOv();ok(r.n.startsWith('3 /')&&r.hash.endsWith('dorothia'),'reader keys '+r.n);
await p.keyboard.press('End');await sl(600);r=await inOv();ok(r.n.startsWith('33 /'),'reader End '+r.n);
await p.keyboard.press('Home');await sl(600);r=await inOv();ok(r.n.startsWith('1 /'),'reader Home '+r.n);
await p.click('.rd-t[data-t="9"]');await sl(600);r=await inOv();ok(r.n.startsWith('10 /'),'thumb jump '+r.n);
const lazy=await p.evaluate(()=>[...document.querySelectorAll('.rd-pg img')].filter(i=>i.complete&&i.naturalWidth).length);ok(lazy<33,'lazy pages loaded '+lazy);
for(let k=0;k<12;k++)await p.keyboard.press('Tab');r=await inOv();ok(r.inside,'tab trapped '+r.act);
await p.keyboard.press('Escape');await sl(500);r=await inOv();ok(!r.ov&&!r.inert&&r.act.includes('dp-read')&&r.hash.endsWith('dorothia'),'reader esc+focus '+JSON.stringify(r));
await p.click('.dp-page');await sl(600);await p.click('.ov-x');await sl(500);r=await inOv();ok(!r.ov,'reader close btn');
await p.click('.dp-read');await sl(600);await p.goBack();await sl(1200);r=await inOv();ok(!r.ov&&!r.inert,'reader + browser back '+JSON.stringify(r));
await p.screenshot({path:`/workspace/rhythm/shots/final49_dv_${tag}.png`});
// theater
await p.goto('http://localhost:8766/#/portfolio/battle',{waitUntil:'networkidle0'});await sl(1200);
r=await inOv();ok(r.frames===0,'no iframe before play');
await p.focus('.sv-face');await p.keyboard.press('Enter');await sl(1500);r=await inOv();const th=await p.evaluate(()=>{const e=document.querySelector('.th-player');const b=e.getBoundingClientRect();return [Math.round(b.width),Math.round(b.height),e.src]});
ok(r.ov&&r.inert&&r.frames===1&&th[1]===H-48&&th[2].includes('youtube-nocookie.com/embed/XwLNKzSFJSQ?autoplay=1'),'theater open '+JSON.stringify([r,th]));
await p.keyboard.press('Escape');await sl(500);r=await inOv();ok(!r.ov&&!r.inert&&r.frames===0&&r.act.includes('sv-face')&&r.hash.endsWith('battle'),'theater esc '+JSON.stringify(r));
await p.click('.sv-face');await sl(900);await p.mouse.click(30,H/2);await sl(500);r=await inOv();ok(!r.ov,'theater click outside');
await (await p.$('.wd-next')).click();await sl(1200);r=await st();ok(r.hash.endsWith('pico-bang')&&r.op.every(o=>o>.99),'next bar '+r.hash);
await (await p.$('.wd-back')).click();await sl(1100);r=await st();ok(r.list,'bar back');
// field stats
const f=await p.evaluate(()=>window.__field);console.log('field',JSON.stringify(f));
console.log(tag,'PASS',pass,'FAIL',fail.length,fail.join('\n'));console.log(errs.join('\n')||'no errs');await b.close()})()
