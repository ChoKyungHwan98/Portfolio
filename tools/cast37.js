const puppeteer=require('puppeteer-core'); const fs=require('fs');
/* 전환 프레임: 포트폴리오 클릭(열기) 과 Esc(닫기) 를 CDP 스크린캐스트로 시각 정확히 */
(async()=>{const [,,W,H,prefix,targetsArg]=process.argv; const targets=JSON.parse(targetsArg);
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
const p=await b.newPage(); const errs=[]; p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())}); p.on('pageerror',e=>errs.push(e.message));
const mob=+W<=768; await p.setViewport({width:+W,height:+H,isMobile:mob,hasTouch:mob});
await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1800));
const cdp=await p.target().createCDPSession(); let frames=[];
cdp.on('Page.screencastFrame',f=>{frames.push({t:f.metadata.timestamp,data:f.data}); cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{})});
await cdp.send('Page.startScreencast',{format:'png',everyNthFrame:1,maxWidth:+W,maxHeight:+H});
await new Promise(r=>setTimeout(r,300));
const pick=(t0,tag)=>{const out=[];for(const tg of targets){let best=null; for(const f of frames){const d=Math.abs(f.t-t0-tg); if(!best||d<best.d) best={d,f};} fs.writeFileSync(`${prefix}_${tag}${String(Math.round(tg*1000)).padStart(3,'0')}.png`,Buffer.from(best.f.data,'base64')); out.push(`${tg}->${(best.f.t-t0).toFixed(3)}`);} console.log(tag,'frames',frames.length,out.join(' '));};
const c=await p.evaluate(()=>{const b=document.querySelector('.menu .mi').getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2]});
if(mob){ await p.touchscreen.tap(c[0],c[1]); } else await p.mouse.click(c[0],c[1]);
let t0=Date.now()/1000; await new Promise(r=>setTimeout(r,(Math.max(...targets)+0.5)*1000)); pick(t0,'open');
frames=[]; await p.keyboard.press('Escape'); t0=Date.now()/1000; await new Promise(r=>setTimeout(r,(Math.max(...targets)+0.6)*1000)); pick(t0,'close');
await cdp.send('Page.stopScreencast');
console.log(errs.length?errs.join('\n'):'no console errors'); await b.close();})();
