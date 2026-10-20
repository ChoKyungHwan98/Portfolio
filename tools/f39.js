const puppeteer=require('puppeteer-core'); const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'}); await sl(1200);
await p.evaluate(()=>document.querySelector('.sk-row').focus()); await p.keyboard.press('Enter');
for(const t of [100,300,500,800,1500]){ await sl(t===100?100:200); console.log(t, await p.evaluate(()=>{const e=document.activeElement; return e.tagName+'.'+e.className+' '+e.textContent.slice(0,8)}));}
await b.close();})();
