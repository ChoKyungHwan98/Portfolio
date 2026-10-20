const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();
for(const [w,h,d] of [[1280,600,1],[1366,657,1],[1440,900,1],[1920,969,1],[1280,646,1.5]]){await p.setViewport({width:w,height:h,deviceScaleFactor:d});await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,1500));
const r=await p.evaluate(()=>{const s=document.querySelector('.sheet-scroll');const hs=[...document.querySelectorAll('.pf-card')].map(c=>Math.round(c.getBoundingClientRect().height));return {over:s.scrollHeight-s.clientHeight,cards:hs.join(',')}});
console.log(w+'x'+h+'@'+d,JSON.stringify(r));await p.screenshot({path:`/workspace/rhythm/shots/final44_list_${w}x${h}.png`});}
await b.close()})()
