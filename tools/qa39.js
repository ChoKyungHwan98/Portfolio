const puppeteer=require('puppeteer-core');
const sl=ms=>new Promise(r=>setTimeout(r,ms)); const S='/workspace/rhythm/shots/';
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
const p=await b.newPage(); const errs=[]; p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())}); p.on('pageerror',e=>errs.push(e.message));
await p.setViewport({width:1440,height:900});
const inv=()=>p.evaluate(()=>{const sh=document.querySelector('.sheet'); const cp=getComputedStyle(sh).clipPath; const n=[...cp.matchAll(/-?\d+(?:\.\d+)?/g)].map(m=>+m[0]);
  const pc=getComputedStyle(document.querySelector('.panel')).clipPath; const pn=[...pc.matchAll(/-?\d+(?:\.\d+)?/g)].map(m=>+m[0]);
  const op=s=>{const e=document.querySelector(s); return e?(+getComputedStyle(e).opacity).toFixed(2):'-'};
  const rail=!sh.getAttribute('aria-hidden'); const mob=innerWidth<=768;
  const area = mob ? (n[7]-n[5]) : (n[2]-n[0]); // front - edge
  return {hash:location.hash, rail, title:document.querySelector('.sh-title')?.getAttribute('aria-label')||document.querySelector('.sh-title')?.textContent||'', sheetFront:Math.round(area), panelEdge:Math.round(mob?pn[5]:pn[2]), play:op('.play-wrap'), menuRail:document.querySelector('.menu').classList.contains('rail'), on:document.querySelector('.mi.on')?.querySelector('.sr')?.textContent, n:document.querySelectorAll('.sheet-in').length};});
const out=[]; const log=(k,v)=>{out.push(k+' '+JSON.stringify(v));};
const clickMi=i=>p.evaluate(i=>document.querySelectorAll('.menu .mi')[i].click(),i);
await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'}); await sl(1800);
// 1 스팸 열고 닫기
for(let k=0;k<6;k++){ await clickMi(0); await sl(90+k*20); await p.keyboard.press('Escape'); await sl(80); }
await sl(1200); log('spam open/close → home', await inv()); await p.screenshot({path:S+'final39_qa_spam_end.png'});
for(let k=0;k<5;k++){ await clickMi(0); await sl(70); await p.keyboard.press('Escape'); await sl(60);} await clickMi(0); await sl(1200); log('spam ending open', await inv());
// 2 열리는 중에 다른 메뉴
await p.keyboard.press('Escape'); await sl(1100); await clickMi(0); await sl(150); await clickMi(1); await sl(120); await clickMi(2); await sl(1100); log('menu switch mid-open', await inv());
await p.screenshot({path:S+'final39_qa_midswitch.png'});
// 3 목록↔상세 빠르게
await clickMi(0); await sl(400); for(let k=0;k<4;k++){ await p.evaluate(k=>document.querySelectorAll('.sk-row')[k%2]?.click(),k); await sl(60); await p.keyboard.press('Escape'); await sl(60);} await sl(900); log('spam list/detail', await inv());
// 4 뒤로/앞으로 연타
await p.evaluate(()=>document.querySelectorAll('.sk-row')[0].click()); await sl(500); await p.evaluate(()=>document.querySelectorAll('.sk-top .pill')[2].click()); await sl(500);
await p.evaluate(()=>{history.back();history.back();}); await sl(40); await p.evaluate(()=>history.back()); await sl(1300); log('back x3 fast', await inv());
await p.evaluate(()=>{history.forward()}); await sl(30); await p.evaluate(()=>{history.forward()}); await sl(1200); log('forward x2 fast', await inv());
// 5 전환 중 크기 바꾸기
await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'}); await sl(1500);
await clickMi(0); await sl(150); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true}); await sl(1300); log('resize mid-open → mobile', await inv());
await p.screenshot({path:S+'final39_qa_resize_mobile.png'});
await p.keyboard.press('Escape'); await sl(200); await p.setViewport({width:1280,height:720}); await sl(1300); log('resize mid-close → 1280', await inv());
await p.screenshot({path:S+'final39_qa_resize_1280.png'});
// 6 열리는 중 Esc / 닫히는 중 클릭
await clickMi(0); await sl(120); await p.keyboard.press('Escape'); await sl(1300); log('Esc during open', await inv());
await clickMi(1); await sl(1000); await p.keyboard.press('Escape'); await sl(150); await clickMi(2); await sl(1300); log('click during close', await inv());
// 7 키보드 순서
await p.setViewport({width:1440,height:900}); await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'}); await sl(1200);
const order=[]; for(let k=0;k<14;k++){ await p.keyboard.press('Tab'); order.push(await p.evaluate(()=>{const e=document.activeElement; return (e.className||e.tagName).toString().split(' ')[0]+':'+(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,10)}));}
log('tab order #/portfolio', order);
await p.keyboard.down('Shift'); await p.keyboard.press('Tab'); await p.keyboard.up('Shift');
await p.evaluate(()=>document.querySelector('.sk-row').focus()); await p.keyboard.press('Enter'); await sl(900); log('Enter on row', [await inv(), await p.evaluate(()=>document.activeElement.className)]);
await p.keyboard.press('Escape'); await sl(900); log('Esc focus after', await p.evaluate(()=>[location.hash, document.activeElement.className, document.activeElement.textContent.slice(0,10)]));
await p.keyboard.press('Escape'); await sl(1000); log('Esc→home focus', await p.evaluate(()=>[location.hash, document.activeElement.className, document.activeElement.textContent.slice(0,10)]));
console.log(out.join('\n')); console.log(errs.length?errs.join('\n'):'no console errors'); await b.close();})();
