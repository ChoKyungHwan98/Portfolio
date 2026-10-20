const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();
for(const [w,h] of (process.argv[2]?[process.argv[2].split('x').map(Number)]:[[1280,600],[1366,657],[1920,969]])){await p.setViewport({width:w,height:h});
for(const s of ['battle','pico-bang','ai-review','dorothia','silent-mansion','digreed']){await p.goto('http://localhost:8766/#/portfolio/'+s,{waitUntil:'networkidle0'});await sl(1100);
const r=await p.evaluate(()=>{const g=q=>{const e=document.querySelector(q);if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)].join(':')};const sc=document.querySelector('.sheet-scroll');return {over:sc.scrollHeight-sc.clientHeight,head:g('.wd-head'),gh:g('.wd-ghr'),video:g('.sv-face'),doc:g('.dp'),page:g('.dp-page'),bar:g('.wd-bar')}});
console.log(w+'x'+h,s,JSON.stringify(r));await p.screenshot({path:`/workspace/rhythm/shots/final50_d_${s}_${w}x${h}.png`});}}
await b.close()})()
