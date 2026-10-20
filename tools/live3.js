const puppeteer=require('puppeteer-core');
(async()=>{
 const [,,W,H,prefix]=process.argv;
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage(); const errs=[];
 p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())}); p.on('pageerror',e=>errs.push(e.message));
 await p.setViewport({width:+W,height:+H});
 await p.goto('http://localhost:8766/index.html?audiolog',{waitUntil:'networkidle0'});
 await p.waitForFunction(()=>window.__rhythm&&window.__rhythm.events.some(e=>e.name==='decoded'),{timeout:15000});
 await new Promise(r=>setTimeout(r,1200));
 await p.click('.play');
 const t0=Date.now(); const marks=[1.2,1.6,2.4,3.8,5.8]; const shots=[];
 for(const m of marks){ const w=m*1000-(Date.now()-t0); if(w>0) await new Promise(r=>setTimeout(r,w)); const at=(Date.now()-t0)/1000; await p.screenshot({path:`${prefix}_live_${m}.png`}); shots.push(at.toFixed(2)); }
 await new Promise(r=>setTimeout(r,800));
 const log=await p.evaluate(()=>window.__rhythm);
 // 돌아가기 + 플레이 버튼 크기 추적
 await p.keyboard.press('Escape'); const tr=[]; const e0=Date.now();
 while(Date.now()-e0<1300){ tr.push(await p.evaluate(()=>{const pl=document.querySelector('.play'),w=document.querySelector('.play-wrap');return [Math.round(pl.getBoundingClientRect().width),getComputedStyle(w).transform,getComputedStyle(pl).transform,getComputedStyle(w).opacity]})); if(tr.length===4) await p.screenshot({path:`${prefix}_return_mid.png`}); await new Promise(r=>setTimeout(r,40)); }
 await p.screenshot({path:`${prefix}_returned.png`});
 const c=log.clickPerf; console.log('mode',log.mode,'shots at',shots.join(','));
 for(const e of log.events) console.log(((e.perf-c)/1000).toFixed(3).padStart(8),e.name,JSON.stringify({...e,name:undefined,perf:undefined}));
 console.log('planned start (s after click):',((log.plannedStartPerf-c)/1000).toFixed(3));
 const u=[...new Set(tr.map(x=>x.join(' | ')))]; console.log('return trace:\n'+u.join('\n'));
 console.log(errs.length?errs.join('\n'):'no console errors'); await b.close();
})();
