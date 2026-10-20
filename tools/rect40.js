const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [W,H] of [[1440,900],[1280,720],[390,844]]){const p=await b.newPage(); const mob=W<=768; await p.setViewport({width:W,height:H,isMobile:mob,hasTouch:mob});
await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1800));
console.log(W,JSON.stringify(await p.evaluate(()=>{const r=s=>{const b=document.querySelector(s).getBoundingClientRect(); return [b.left,b.top,b.width,b.height].map(Math.round)}; return {panel:r('.panel'),rim:r('.rim'),sheet:r('.sheet'),plane:r('.plane'),cs:getComputedStyle(document.querySelector('.panel')).height, padY:getComputedStyle(document.documentElement).getPropertyValue('--padY')}})));}
await b.close();})();
