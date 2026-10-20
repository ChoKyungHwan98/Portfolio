const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const c=b.defaultBrowserContext(); await c.overridePermissions('http://localhost:8766',['clipboard-read','clipboard-write','clipboard-sanitized-write']);
const p=await b.newPage(); await p.setViewport({width:1440,height:900}); await p.goto('http://localhost:8766/index.html?still',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1000));
await p.click('.chip'); await new Promise(r=>setTimeout(r,350)); await p.screenshot({path:'../shots/v32c_copy_tip.png',clip:{x:0,y:740,width:520,height:160}}); console.log(await p.evaluate(()=>document.querySelector('.tip')?.textContent)); await b.close();})();
