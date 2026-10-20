const puppeteer=require('puppeteer-core'); const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [W,H] of [[1440,900],[390,844]]){const p=await b.newPage(); const mob=W<=768; await p.setViewport({width:W,height:H,isMobile:mob,hasTouch:mob});
await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'}); await sl(1500);
await p.evaluate(()=>document.querySelector('.menu .mi').click()); await sl(1600);
const a=await p.evaluate(()=>[getComputedStyle(document.querySelector('.panel')).clipPath, getComputedStyle(document.querySelector('.sheet')).clipPath, getComputedStyle(document.querySelector('.sheet-edge')).opacity]);
await p.keyboard.press('Escape'); await sl(1500);
const c=await p.evaluate(()=>[getComputedStyle(document.querySelector('.panel')).clipPath, getComputedStyle(document.querySelector('.sheet')).clipPath]);
console.log(W,'open',JSON.stringify(a)); console.log(W,'closed',JSON.stringify(c));}
await b.close();})();
