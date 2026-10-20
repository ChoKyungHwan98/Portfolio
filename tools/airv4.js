const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();const reqs=[];p.on('request',r=>reqs.push(r.method()+' '+r.url()));
await p.goto('http://localhost:8766/airv/index.html?app_id=1623730',{waitUntil:'networkidle0'});await sl(1200);reqs.length=0;
for(const q of ['a[href^="/api/reviews"]','a[href^="/api/analysis"]','[data-action="trend-refresh"]']){await p.evaluate(q=>{const e=document.querySelector(q);e.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))},q);await sl(600);console.log(q,await p.evaluate(()=>location.href),await p.evaluate(()=>!!document.querySelector('.ro-toast')))}
console.log(reqs);await b.close()})();
