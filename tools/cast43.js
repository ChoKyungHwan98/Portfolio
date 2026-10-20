// usage: node cast43.js url W H outPrefix '{"pre":[steps],"act":step,"times":[...],"post":ms}'
// step: {click:sel}|{key:k}|{wait:ms}|{hover:sel}|{eval:js}  — frames are timed from the moment 'act' fires
const puppeteer=require('puppeteer-core'); const fs=require('fs');
(async()=>{const [,,url,W,H,out,cfgS]=process.argv; const cfg=JSON.parse(cfgS);
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.setViewport({width:+W,height:+H,deviceScaleFactor:cfg.dpr||1});
await p.goto(url,{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,cfg.wait||1500));
const run=async s=>{ if(s.wait) await new Promise(r=>setTimeout(r,s.wait)); if(s.hover) await p.hover(s.hover); if(s.key) await p.keyboard.press(s.key); if(s.eval) await p.evaluate(s.eval);
  if(s.click){ const e=await p.$(s.click); const bb=await e.boundingBox(); await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2); await p.mouse.down(); await new Promise(r=>setTimeout(r,s.hold||90)); await p.mouse.up(); } };
for(const s of cfg.pre||[]) await run(s);
const c=await p.target().createCDPSession(); const frames=[];
c.on('Page.screencastFrame',async f=>{frames.push({t:f.metadata.timestamp,d:f.data}); await c.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
await c.send('Page.startScreencast',{format:'png',everyNthFrame:1}); await new Promise(r=>setTimeout(r,300));
const t0=Date.now()/1000; await run(cfg.act); await new Promise(r=>setTimeout(r,cfg.post||2500)); await c.send('Page.stopScreencast');
const names=[]; cfg.times.forEach((w,i)=>{let best=null;for(const f of frames){ if(f.t<t0+w-0.0001+0.0) {best=f;} } best=best||frames[0]; const n=`${out}_${String(i).padStart(2,'0')}_${(best.t-t0).toFixed(2)}s.png`; fs.writeFileSync(n,Buffer.from(best.d,'base64')); names.push(n);});
// jank: largest gap between frames during action window
let gap=0; const fr=frames.filter(f=>f.t>=t0); const big=[]; for(let i=1;i<fr.length;i++){ const d=fr[i].t-fr[i-1].t; gap=Math.max(gap,d); if(d>0.05) big.push((fr[i-1].t-t0).toFixed(2)+"+"+Math.round(d*1000)); }
console.log(JSON.stringify({frames:fr.length,maxGapMs:Math.round(gap*1000),big,errs})); await b.close();})();
