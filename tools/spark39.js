const puppeteer=require('puppeteer-core'); const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'}); await sl(1200);
await p.mouse.move(700,300); await p.mouse.down(); await p.mouse.move(150,450); await sl(5); await p.mouse.up();
await p.mouse.move(150,450); await p.mouse.down(); await sl(60); await p.screenshot({path:'/workspace/rhythm/shots/final39_spark_sheet_rail.png',clip:{x:0,y:200,width:900,height:400}}); await p.mouse.up();
// 감소 모션
const q=await b.newPage(); await q.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]); await q.setViewport({width:1440,height:900});
const errs=[]; q.on('pageerror',e=>errs.push(e.message));
await q.goto('http://localhost:8766/',{waitUntil:'networkidle0'}); await sl(1200);
await q.evaluate(()=>document.querySelector('.menu .mi').click()); await sl(80);
const r=await q.evaluate(()=>[location.hash, getComputedStyle(document.querySelector('.sheet')).clipPath.slice(0,60)]);
await q.mouse.click(700,400); await sl(40); const lit=await q.evaluate(()=>{const c=document.querySelector('.spark-layer'); const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for(let i=3;i<d.length;i+=4) if(d[i]) n++; return n;});
console.log('reduced: after 80ms', JSON.stringify(r), 'spark pixels', lit, errs.join(';')||'no errors'); await b.close();})();
