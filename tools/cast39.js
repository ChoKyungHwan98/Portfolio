const puppeteer=require('puppeteer-core'); const fs=require('fs');
/* v3.9 전환 확인: CDP 스크린캐스트 프레임 + 매 프레임 '낱말·홈 요소가 흰 판 위에 그려졌나' 수치 검사 */
(async()=>{const [,,W,H,prefix]=process.argv; const targets=[...Array(17)].map((_,i)=>i*0.05);
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
const p=await b.newPage(); const errs=[]; p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())}); p.on('pageerror',e=>errs.push(e.message));
const mob=+W<=768; await p.setViewport({width:+W,height:+H,isMobile:mob,hasTouch:mob});
await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1800));
await p.evaluate(()=>{ window.__ov=[]; const mob=innerWidth<=768;
  const q=(a,c,b,u)=>(1-u)*(1-u)*a+2*u*(1-u)*c+u*u*b;
  const loop=()=>{ const sh=document.querySelector('.sheet'); const cp=sh?getComputedStyle(sh).clipPath:''; const n=[...cp.matchAll(/-?\d+(?:\.\d+)?/g)].map(m=>+m[0]);
    if(n.length>=12){ let worst=0, who=''; const W=innerWidth,H=innerHeight;
      const els=[...document.querySelectorAll('.menu .mi, .play-wrap, .tiles > div, .brand, .keys, .contact, .rail-home')];
      for(const e of els){ let o=1,x=e; while(x&&x!==document.body){o*=+getComputedStyle(x).opacity; x=x.parentElement;} if(o<0.04) continue;
        const r=e.getBoundingClientRect(); if(r.width<1) continue; let d=-1e9;
        for(const fy of [0,0.5,1]) for(const fx of [0,0.5,1]){ const px=r.left+fx*r.width, py=r.top+fy*r.height; let dd;
          if(!mob){ const u=Math.min(1,Math.max(0,py/H)); dd=Math.min(px-q(n[0],n[10],n[8],u), q(n[2],n[4],n[6],u)-px); }
          else { const u=Math.min(1,Math.max(0,px/W)); dd=Math.min(py-q(n[1],n[3],n[5],u), q(n[11],n[9],n[7],u)-py); }
          d=Math.max(d,dd); }
        if(d>worst){worst=d; who=e.className.split(' ').slice(0,2).join('.')+' op'+o.toFixed(2);} }
      window.__ov.push([performance.now(),Math.round(worst),who]); }
    if(window.__ovOn!==false) requestAnimationFrame(loop); };
  requestAnimationFrame(loop); });
const cdp=await p.target().createCDPSession(); let frames=[];
cdp.on('Page.screencastFrame',f=>{frames.push({t:f.metadata.timestamp,data:f.data}); cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{})});
await cdp.send('Page.startScreencast',{format:'png',everyNthFrame:1,maxWidth:+W,maxHeight:+H});
await new Promise(r=>setTimeout(r,300));
const pick=(t0,tag)=>{for(const tg of targets){let best=null; for(const f of frames){const d=Math.abs(f.t-t0-tg); if(!best||d<best.d) best={d,f};} fs.writeFileSync(`${prefix}_${tag}${String(Math.round(tg*1000)).padStart(3,'0')}.png`,Buffer.from(best.f.data,'base64'));} console.log(tag,'frames',frames.length);};
const report=async(tag,pt0)=>{const ov=await p.evaluate(t=>{const a=window.__ov.filter(x=>x[0]>=t&&x[0]<t+900); window.__ov=[]; const bad=a.filter(x=>x[1]>2); return {n:a.length,bad:bad.length,worst:bad.sort((x,y)=>y[1]-x[1]).slice(0,3).map(x=>[Math.round(x[0]-t),x[1],x[2]])};},pt0); console.log(tag,'overlap check',JSON.stringify(ov));};
const c=await p.evaluate(()=>{const b=document.querySelector('.menu .mi').getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]});
await p.evaluate(()=>window.__ov=[]); let pt0=await p.evaluate(()=>performance.now());
if(mob) await p.touchscreen.tap(c[0],c[1]); else await p.mouse.click(c[0],c[1]);
let t0=Date.now()/1000; await new Promise(r=>setTimeout(r,1100)); pick(t0,'open'); await report('open',pt0);
frames=[]; pt0=await p.evaluate(()=>performance.now()); await p.keyboard.press('Escape'); t0=Date.now()/1000; await new Promise(r=>setTimeout(r,1300)); pick(t0,'close'); await report('close',pt0);
await cdp.send('Page.stopScreencast');
console.log(errs.length?errs.join('\n'):'no console errors'); await b.close();})();
