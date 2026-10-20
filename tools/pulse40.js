const puppeteer=require('puppeteer-core'); const fs=require('fs'); const sl=ms=>new Promise(r=>setTimeout(r,ms));
/* 박 맥박: 수동 시계로 박 직후(bp≈1, 마디 첫 박)와 박 사이(bp=0)를 찍어 비교 */
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
const out=[];
for(const [url,tag,W,H] of [['/','home',1440,900],['/#/portfolio','list',1440,900],['/#/portfolio','list390',390,844]]){
 const p=await b.newPage(); const mob=W<=768; await p.setViewport({width:W,height:H,isMobile:mob,hasTouch:mob});
 await p.evaluateOnNewDocument(()=>{ const rn=performance.now.bind(performance), rr=requestAnimationFrame.bind(window), rc=cancelAnimationFrame.bind(window); let man=false,vt=0,q=new Map(),id=1e6;
  performance.now=()=>man?vt:rn(); window.requestAnimationFrame=cb=>{if(!man)return rr(cb); const i=++id; q.set(i,cb); return i}; window.cancelAnimationFrame=i=>{if(q.has(i))q.delete(i); else rc(i)};
  window.__manual=()=>{vt=rn();man=true}; window.__to=t=>{vt=t; const c=[...q.values()]; q.clear(); c.forEach(f=>f(vt))}; });
 await p.goto('http://localhost:8766'+url,{waitUntil:'networkidle0'}); await sl(1800); await p.evaluate(()=>window.__manual());
 const spb=60000/139.5;
 const shotAt=async(beat,name,needBar)=>{ for(let k=0;k<12;k++){ await p.evaluate(t=>{window.__to(t)},(beat+k*0.25)*spb); const v=await p.evaluate(()=>+getComputedStyle(document.querySelector('.menu')).getPropertyValue('--bb')); if(!needBar||v>0.6){beat=beat+k*0.25;break;} } await p.evaluate(t=>{window.__to(t);window.__to(t+0.01)},beat*spb); await sl(60); const v=await p.evaluate(()=>[getComputedStyle(document.querySelector('.menu')).getPropertyValue('--bp'),getComputedStyle(document.querySelector('.menu')).getPropertyValue('--bb')]); fs.writeFileSync(name,await p.screenshot()); out.push(tag+' '+name.split('/').pop()+' bp,bb='+v); };
 const base=Math.ceil(await p.evaluate(s=>performance.now()/s,spb)/4)*4+8;
 await shotAt(base+0.03,`/tmp/c40_${tag}_bar.png`,true); await shotAt(base+1.03,`/tmp/c40_${tag}_beat.png`); await shotAt(base+1.5,`/tmp/c40_${tag}_rest.png`);
 await p.close(); }
console.log(out.join('\n')); await b.close();})();
