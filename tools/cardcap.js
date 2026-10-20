const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:760,deviceScaleFactor:2});
await p.goto('http://localhost:8766/airv/index.html?app_id=1623730',{waitUntil:'networkidle0'});await sl(2500);
const r=await p.evaluate(()=>{const m=document.querySelector('main')||document.querySelector('.main');const b=m.getBoundingClientRect();return [b.x,b.y,b.width,b.height]});console.log(r);
await p.screenshot({path:'/tmp/airv_full.png'});await b.close()})();
