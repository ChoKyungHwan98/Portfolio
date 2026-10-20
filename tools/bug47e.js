const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();
await p.setViewport({width:1280,height:600});
const info=async tag=>{const r=await p.evaluate(()=>{const sc=document.querySelector('.sheet-scroll');const hs=[...document.querySelectorAll('.wd-hero')].map(h=>{const r=h.getBoundingClientRect();return [h.querySelector('h1')?.textContent,r.y|0,r.height|0]});return {hash:location.hash,scroll:sc.scrollTop,sh:sc.scrollHeight,ch:sc.clientHeight,hs}});console.log(tag,JSON.stringify(r));};
for(const st of [120,252]){
await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'});await sl(1300);
await p.mouse.move(700,400);await p.mouse.wheel({deltaY:st});await sl(600);await info('scrolled');
const bb=await (await p.$('.wk-top li:nth-child(2) .wk-card')).boundingBox();console.log('card',JSON.stringify(bb));
const y=Math.max(bb.y+10,10);await p.mouse.click(bb.x+bb.width/2,Math.min(bb.y+bb.height-10,y+40));
await sl(1500);await info('after click');await p.screenshot({path:`/workspace/rhythm/shots/bug47e_${st}.png`});}
await b.close()})()
