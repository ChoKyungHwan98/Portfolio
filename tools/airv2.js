const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:+process.argv[2]||1280,height:+process.argv[3]||800});
const reqs=[];p.on('request',r=>{if(!r.url().startsWith('http://localhost:8766/airv/static'))reqs.push(r.method()+' '+r.url())});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CERR',m.text())});
await p.goto('http://localhost:8766/airv/index.html?app_id=1623730',{waitUntil:'networkidle0',timeout:60000});await sl(2000);
await p.screenshot({path:'/workspace/rhythm/shots/airv_static_overview.png'});
for(const pg of ['topics','character','deep','reviews','sample']){await p.click(`.nav-item[data-page="${pg}"]`);await sl(1200);await p.screenshot({path:`/workspace/rhythm/shots/airv_static_${pg}.png`});}
await p.click('.nav-item[data-page="topics"]');await sl(600);
const ev=await p.$('[data-action="evidence"]');if(ev){await ev.click();await sl(1200);console.log('dialog',await p.evaluate(()=>document.getElementById('rdEvidenceBody')?.textContent.slice(0,120)));await p.screenshot({path:'/workspace/rhythm/shots/airv_static_evidence.png'});}
console.log(reqs.join('\n'));await b.close();})();
