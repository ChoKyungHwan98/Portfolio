const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [u,ver] of [['http://localhost:8766/#/portfolio','v4.2 list'],['http://localhost:8767/#/portfolio','v4.1 list'],['http://localhost:8766/','v4.2 home'],['http://localhost:8767/','v4.1 home']]){
const p=await b.newPage(); await p.setViewport({width:1440,height:900}); await p.goto(u,{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1500));
const m=await p.metrics(); const r=await p.evaluate(()=>new Promise(res=>{const d=[];let l=performance.now();const f=t=>{d.push(t-l);l=t; if(d.length<180) requestAnimationFrame(f); else res(d)};requestAnimationFrame(f)}));
const m2=await p.metrics(); r.sort((a,b)=>a-b);
console.log(ver,'frame p50',r[90].toFixed(1),'p95',r[171].toFixed(1),'max',r[179].toFixed(1),'ms; style+layout ms /3s', ((m2.RecalcStyleDuration-m.RecalcStyleDuration+m2.LayoutDuration-m.LayoutDuration)*1000).toFixed(0), 'script ms', ((m2.ScriptDuration-m.ScriptDuration)*1000).toFixed(0)); await p.close();}
await b.close();})();
