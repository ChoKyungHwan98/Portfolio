const puppeteer=require('puppeteer-core'); const fs=require('fs');
/* v4.0 면 가장자리 틈 검사: 페이지 시계(performance.now·requestAnimationFrame)를 손으로 16ms씩 넘기며 매 단계 스크린샷.
   글자·캐릭터·불꽃·장식은 숨기고 면/옆면/판/바닥만 남김 */
(async()=>{const [,,W,H,out]=process.argv; fs.mkdirSync(out,{recursive:true});
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
const p=await b.newPage(); const mob=+W<=768; await p.setViewport({width:+W,height:+H,isMobile:mob,hasTouch:mob});
await p.evaluateOnNewDocument(()=>{ const rn=performance.now.bind(performance), rr=window.requestAnimationFrame.bind(window), rc=window.cancelAnimationFrame.bind(window);
  let man=false, vt=0, q=new Map(), id=1e6;
  performance.now=()=>man?vt:rn();
  window.requestAnimationFrame=cb=>{ if(!man) return rr(cb); const i=++id; q.set(i,cb); return i; };
  window.cancelAnimationFrame=i=>{ if(q.has(i)) q.delete(i); else rc(i); };
  window.__manual=()=>{ vt=rn(); man=true; };
  window.__step=ms=>{ vt+=ms; const cbs=[...q.values()]; q.clear(); for(const cb of cbs) try{cb(vt)}catch(e){console.error(e)} };
});
await p.goto('http://localhost:8767/',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1800));
await p.addStyleTag({content:'.home,.char-wrap,.spark-layer,.sheet-scroll,.hud,.stage-top,.deco,.sheet-deco{visibility:hidden!important}'});
await p.evaluate(()=>window.__manual());
const shot=async name=>{ await p.evaluate(()=>new Promise(r=>setTimeout(r,0))); fs.writeFileSync(name, await p.screenshot()); };
for(const phase of ['open','close']){
  await p.evaluate(ph=>{ if(ph==='open') document.querySelector('.menu .mi').click(); else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); }, phase);
  for(let i=0;i<=62;i++){ await p.evaluate(()=>window.__step(16)); await shot(`${out}/${phase}_${String(i*16).padStart(4,'0')}.png`); }
  for(let i=0;i<40;i++) await p.evaluate(()=>window.__step(16));
}
await b.close(); console.log('ok');})();
