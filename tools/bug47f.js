const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setViewport({width:1280,height:600});
const info=async tag=>{const r=await p.evaluate(()=>{const hs=[...document.querySelectorAll('.wd-hero')].map(h=>{const r=h.getBoundingClientRect();return [h.querySelector('h1')?.textContent,r.y|0,r.height|0,getComputedStyle(h).opacity,getComputedStyle(h).visibility]});const d=[...document.querySelectorAll('.pf-detail')].map(x=>getComputedStyle(x).opacity);return {hash:location.hash,hs,d,act:document.activeElement?.textContent?.slice(0,20)}});console.log(tag,JSON.stringify(r));};
await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'});await sl(1300);
await p.evaluate(()=>document.querySelector('.pf-hit[data-slug="pico-bang"]').focus());await p.keyboard.press('Enter');await sl(1300);await info('enter');
await p.keyboard.press('Escape');await sl(1000);await info('esc');
await p.evaluate(()=>document.querySelector('.pf-hit[data-slug="pico-bang"]').focus());await p.keyboard.press('Enter');await sl(1300);await info('enter2');await p.screenshot({path:'/workspace/rhythm/shots/bug47f.png'});
// list->pico->back->pico rapid
await p.goBack();await sl(200);await p.goForward();await sl(1300);await info('rapid back/fwd');
// pico -> list via 목록 pill -> pico
await (await p.$('.sk-top .pill')).click();await sl(250);const bb=await (await p.$('.wk-top li:nth-child(2) .wk-card')).boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await sl(1400);await info('pill list then quick pico');await p.screenshot({path:'/workspace/rhythm/shots/bug47f2.png'});
console.log(errs.join('\n')||'no errs');await b.close()})()
