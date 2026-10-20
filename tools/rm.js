const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8766/index.html',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1200));
await p.keyboard.press('Space'); await new Promise(r=>setTimeout(r,4200)); await p.screenshot({path:'../shots/v10_reduced_spot.png'});
await p.keyboard.press('Escape'); await new Promise(r=>setTimeout(r,700)); await p.screenshot({path:'../shots/v10_reduced_home.png'});
console.log('errors',errs); await b.close();})();
