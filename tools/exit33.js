const puppeteer=require('puppeteer-core');
(async()=>{const [,,W,H,prefix]=process.argv;
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
const p=await b.newPage(); await p.setViewport({width:+W,height:+H});
await p.goto('http://localhost:8766/index.html',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,2000));
await p.click('.play'); const t0=Date.now();
for(const m of [90,220]){const w=m-(Date.now()-t0); if(w>0) await new Promise(r=>setTimeout(r,w)); await p.screenshot({path:`${prefix}_exit_${m}ms.png`}); console.log('shot',m,'at',Date.now()-t0);}
await new Promise(r=>setTimeout(r,2500));
await p.keyboard.press('Escape'); await new Promise(r=>setTimeout(r,1500));
const r=await p.evaluate(()=>[...document.querySelectorAll('.tile,.play,.contact')].map(e=>{const b=e.getBoundingClientRect();return [e.className,Math.round(b.left),Math.round(b.top),Math.round(b.width),getComputedStyle(e.closest('[style]')||e).opacity]}));
console.log(JSON.stringify(r)); await p.screenshot({path:`${prefix}_returned_${W}.png`}); await b.close();})();
