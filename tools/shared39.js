const puppeteer=require('puppeteer-core'); const fs=require('fs');
/* 목록 → 상세(공유 레이아웃), 이력서 → 자기소개서(방향 교체) 프레임 */
(async()=>{const [,,W,H,prefix]=process.argv; const T=[...Array(13)].map((_,i)=>i*0.05);
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
const p=await b.newPage(); const errs=[]; p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())}); p.on('pageerror',e=>errs.push(e.message));
const mob=+W<=768; await p.setViewport({width:+W,height:+H,isMobile:mob,hasTouch:mob});
await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1500));
const cdp=await p.target().createCDPSession(); let frames=[];
cdp.on('Page.screencastFrame',f=>{frames.push({t:f.metadata.timestamp,data:f.data}); cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{})});
await cdp.send('Page.startScreencast',{format:'png',everyNthFrame:1,maxWidth:+W,maxHeight:+H}); await new Promise(r=>setTimeout(r,300));
const pick=(t0,tag)=>{for(const tg of T){let best=null; for(const f of frames){const d=Math.abs(f.t-t0-tg); if(!best||d<best.d) best={d,f};} fs.writeFileSync(`${prefix}_${tag}${String(Math.round(tg*1000)).padStart(3,'0')}.png`,Buffer.from(best.f.data,'base64'));}};
const tap=async sel=>{const e=(await p.$$(sel))[0]; const bb=await e.boundingBox(); if(mob) await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2); else await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);};
// 이름 위치 추적
await p.evaluate(()=>{window.__tr=[]; const L=()=>{const e=document.querySelector('.sk-name, .sh-title .sh-mark'); if(e){const r=e.getBoundingClientRect(); window.__tr.push([Math.round(performance.now()),Math.round(r.left),Math.round(r.top),Math.round(r.width)]);} requestAnimationFrame(L)}; L();});
frames=[]; await tap('.sk-row'); let t0=Date.now()/1000; await new Promise(r=>setTimeout(r,900)); pick(t0,'share');
const tr=await p.evaluate(()=>{const a=window.__tr.slice(-60); return a.filter((x,i)=>i%4==0)}); console.log('title track',JSON.stringify(tr));
await p.goto('http://localhost:8766/#/resume',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1200));
frames=[]; const it=await p.$$('.menu .mi'); const bb=await it[2].boundingBox(); if(mob) await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2); else await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2); t0=Date.now()/1000; await new Promise(r=>setTimeout(r,900)); pick(t0,'swap');
await cdp.send('Page.stopScreencast'); console.log(errs.length?errs.join('\n'):'no console errors'); await b.close();})();
