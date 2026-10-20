const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:600});
await p.goto('http://localhost:8766/?time=day',{waitUntil:'networkidle0'});await sl(2600);await p.click('a.tile[href="#/media"]');
await p.waitForFunction(()=>document.querySelector('.room2')&&!document.querySelector('.room2.walk'),{polling:16});await sl(120);await p.screenshot({path:'/workspace/rhythm/shots/v54_room_sweep_1280x600_day.png'});
const o=await p.evaluate(()=>[...document.querySelectorAll('.ro-mk,.ro-plate')].map(e=>(+getComputedStyle(e).opacity).toFixed(2)).join(','));await sl(1200);
const o2=await p.evaluate(()=>[...document.querySelectorAll('.ro-mk,.ro-plate')].map(e=>(+getComputedStyle(e).opacity).toFixed(2)+'/'+e.style.cssText).join(' | '));console.log(o,'\n',o2);await b.close();})();
