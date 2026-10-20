const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setViewport({width:1280,height:600});
const info=async tag=>{const r=await p.evaluate(()=>{const hs=[...document.querySelectorAll('.wd-hero')].map(h=>{const r=h.getBoundingClientRect();return [h.querySelector('h1')?.textContent,r.y|0,r.height|0,getComputedStyle(h).opacity,getComputedStyle(h.closest('.pf-detail')).opacity]});const sc=document.querySelector('.sheet-scroll');return {hash:location.hash,hs,scroll:sc.scrollTop,sh:sc.scrollHeight}});console.log(tag,JSON.stringify(r));};
await p.goto('http://localhost:8766/#/portfolio/battle',{waitUntil:'networkidle0'});await sl(1200);
const nx=await p.$$('.sk-top .pill');await nx[2].click();await sl(1200);await info('battle→next pill');await p.screenshot({path:'/workspace/rhythm/shots/bug47_pill.png'});
await p.goto('http://localhost:8766/#/portfolio/battle',{waitUntil:'networkidle0'});await sl(1200);
await p.evaluate(()=>{const s=document.querySelector('.sheet-scroll');s.scrollTop=s.scrollHeight});await sl(300);
await (await p.$('.wd-next')).click();await sl(300);await info('battle bottom next 300');await sl(900);await info('battle bottom next 1200');await p.screenshot({path:'/workspace/rhythm/shots/bug47_next.png'});
// list scrolled down then click pico
await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'});await sl(1200);await p.evaluate(()=>{document.querySelector('.sheet-scroll').scrollTop=200});await sl(200);
const e=await p.$('.wk-top li:nth-child(2) .wk-card');const bb=await e.boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await sl(1200);await info('list scrolled → pico');await p.screenshot({path:'/workspace/rhythm/shots/bug47_scrolled.png'});
console.log(errs.join('\n')||'no errs');await b.close()})()
