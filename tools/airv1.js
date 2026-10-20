const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1440,height:900});
const reqs=[];p.on('request',r=>reqs.push(r.method()+' '+r.url()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://127.0.0.1:8811/dashboard?app_id=1623730',{waitUntil:'networkidle0',timeout:60000});await sl(2500);
await p.screenshot({path:'/workspace/rhythm/shots/airv_dash.png'});
console.log(reqs.filter(u=>!/fonts|\.css|\.js$/.test(u)).join('\n'));
console.log(await p.evaluate(()=>[...document.querySelectorAll('nav a, [role=tab], button')].slice(0,40).map(e=>e.textContent.trim().slice(0,30)).join(' | ')));
await p.goto('http://127.0.0.1:8811/',{waitUntil:'networkidle0'});await sl(1500);await p.screenshot({path:'/workspace/rhythm/shots/airv_index.png'});
await b.close();})();
