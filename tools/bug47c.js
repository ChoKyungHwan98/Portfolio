const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setViewport({width:1280,height:600});
const info=async tag=>{const r=await p.evaluate(()=>{const hs=[...document.querySelectorAll('.wd-hero')].map(h=>{const r=h.getBoundingClientRect();return [h.querySelector('h1')?.textContent,r.x|0,r.y|0,r.width|0,r.height|0,getComputedStyle(h).opacity,getComputedStyle(h.closest('.pf-detail')).opacity]});const si=document.querySelector('.sheet-in');return {hash:location.hash,hs,sheetIn:si&&getComputedStyle(si).opacity,txt:(si?.innerText||'').slice(0,40).replace(/\n/g,'|')}});console.log(tag,JSON.stringify(r));};
let n=0;const shot=t=>p.screenshot({path:`/workspace/rhythm/shots/bug47c_${n++}_${t}.png`});
await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'});await sl(1800);
await p.evaluate(()=>{location.hash='#/portfolio/pico-bang'});await sl(1500);await info('home→hash pico');await shot('home-hash');
await (await p.$$('.menu .mi'))[1].click();await sl(1300);await info('rail resume');
await p.goBack();await sl(1500);await info('back to pico');await shot('back');
await p.keyboard.press('Escape');await sl(900);await p.keyboard.press('Escape');await sl(1200);await info('home');
await p.goForward();await sl(1500);await info('fwd1');await p.goForward();await sl(1500);await info('fwd2');await shot('fwd');
// home → click 포트폴리오 → quickly click pico before sheet lands
await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'});await sl(1800);
await (await p.$('.menu .mi')).click();await sl(350);const e=await p.$('.wk-top li:nth-child(2) .wk-card');const bb=await e.boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await sl(1500);await info('fast click during entrance');await shot('fast');
console.log(errs.join('\n')||'no errs');await b.close()})()
