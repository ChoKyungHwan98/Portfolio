const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>errs.push(m.type()+' '+m.text()));
await p.setViewport({width:1280,height:595,deviceScaleFactor:1.5});
const info=async tag=>{const r=await p.evaluate(()=>{const hs=[...document.querySelectorAll('.wd-hero')].map(h=>{const r=h.getBoundingClientRect();return [h.querySelector('h1')?.textContent,r.x|0,r.y|0,r.width|0,r.height|0,getComputedStyle(h).opacity,getComputedStyle(h).transform]});return {hash:location.hash,hs}});console.log(tag,JSON.stringify(r));};
for(const sel of ['.wk-top li:nth-child(2) .wk-card','.wk-top li:nth-child(3) .wk-card','.wk-top li:nth-child(1) .wk-card']){
await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'});await sl(1500);await (await p.$('.menu .mi')).click();await sl(1400);
const bb=await (await p.$(sel)).boundingBox();await p.mouse.move(bb.x+20,bb.y+20,{steps:10});await sl(300);await p.mouse.move(bb.x+bb.width*0.6,bb.y+bb.height*0.3,{steps:10});await sl(200);
await p.mouse.down();await sl(160);await p.mouse.up();
for(const t of [50,150,300,600,1200]){await sl(t);await info(sel.slice(16,30)+' +'+t);} await p.screenshot({path:`/workspace/rhythm/shots/bug47d_${sel.slice(-20,-9).replace(/\W/g,'')}.png`});}
console.log(errs.join('\n')||'no errs');await b.close()})()
