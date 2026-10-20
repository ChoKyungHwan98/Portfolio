// rAF 간격 기록: node raf43.js url W H '{"pre":[...],"act":{...},"post":ms}'
const puppeteer=require('puppeteer-core');
(async()=>{const [,,url,W,H,cfgS]=process.argv; const cfg=JSON.parse(cfgS);
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
const p=await b.newPage(); await p.setViewport({width:+W,height:+H});
await p.goto(url,{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,cfg.wait||1500));
const run=async s=>{ if(s.wait) await new Promise(r=>setTimeout(r,s.wait)); if(s.key) await p.keyboard.press(s.key); if(s.click){ const e=await p.$(s.click); const bb=await e.boundingBox(); await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2,{delay:80}); } };
for(const s of cfg.pre||[]) await run(s);
await p.evaluate(()=>{window.__f=[];let l=performance.now();const f=t=>{window.__f.push([+(t).toFixed(1),+(t-l).toFixed(1)]);l=t;requestAnimationFrame(f)};requestAnimationFrame(f);window.__t0=performance.now();});
await run(cfg.act); await new Promise(r=>setTimeout(r,cfg.post||2500));
const r=await p.evaluate(()=>{const t0=window.__t0;const f=window.__f.filter(x=>x[0]>t0);const long=f.filter(x=>x[1]>34).map(x=>((x[0]-t0)/1000).toFixed(2)+'s:'+x[1]);const d=f.map(x=>x[1]).sort((a,b)=>a-b);return {n:f.length,p50:d[d.length>>1],p95:d[Math.floor(d.length*.95)],max:d[d.length-1],long}});
console.log(JSON.stringify(r)); await b.close();})();
