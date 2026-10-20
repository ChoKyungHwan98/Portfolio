const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();
for(const [w,h,d] of [[1280,600,1],[1366,657,1],[1440,900,1],[1920,969,1],[1280,646,1.5]]){await p.setViewport({width:w,height:h,deviceScaleFactor:d});
for(const s of ['dorothia','pico-bang']){await p.goto('http://localhost:8766/#/portfolio/'+s,{waitUntil:'networkidle0'});await sl(1100);
const r=await p.evaluate(()=>{const sc=document.querySelector('.sheet-scroll');const g=q=>{const e=document.querySelector(q);const b=e.getBoundingClientRect();return [Math.round(b.top),Math.round(b.bottom),Math.round(b.width)]};return {over:sc.scrollHeight-sc.clientHeight,head:g('.wd-head'),main:g('.wd-main'),sv:g('.sv-screen'),dv:g('.dv'),bar:g('.wd-bar')}});
console.log(w+'x'+h+'@'+d,s,JSON.stringify(r));}}
await b.close()})()
