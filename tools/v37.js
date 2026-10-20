const puppeteer=require('puppeteer-core');
const [,,W,H,tag]=process.argv; const base='http://localhost:8766/'; const S='/workspace/rhythm/shots/';
const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage(); const errs=[];
 p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.type()+': '+m.text()+' @'+(m.location()?.url||''))});
 p.on('pageerror',e=>errs.push('pageerror: '+e.message));
 p.on('requestfailed',r=>errs.push('reqfail: '+r.url()));
 p.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});
 const mob=+W<=768;
 await p.setViewport({width:+W,height:+H,deviceScaleFactor:1,isMobile:mob,hasTouch:mob});
 await p.goto(base,{waitUntil:'networkidle0'}); await sl(1600);
 const log=s=>p.evaluate(()=>[location.hash,history.length,!!document.querySelector('.sheet')]).then(h=>console.log(s,JSON.stringify(h)));
 await p.screenshot({path:S+`final37_${tag}_0home.png`});
 // transition frames
 const pill=await p.$('.menu .mi'); const bb=await pill.boundingBox();
 await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2); await sl(300);
 await p.mouse.down(); await sl(90); await p.mouse.up();
 const t0=Date.now();
 for(const ms of [60,150,240,330,450,700]){ const d=ms-(Date.now()-t0); if(d>0) await sl(d); await p.screenshot({path:S+`final37_${tag}_t${String(ms).padStart(3,'0')}.png`}); }
 await sl(400); await log('after click'); await p.screenshot({path:S+`final37_${tag}_1list.png`});
 // open first row
 await p.click('.pf-row .pf-main'); await sl(900); await log('detail');
 await p.screenshot({path:S+`final37_${tag}_2detail.png`});
 await p.keyboard.press('ArrowRight'); await sl(500);
 const cnt=await p.$eval('.dv-count',e=>e.textContent); console.log('after → count',cnt);
 await p.evaluate(()=>document.querySelector('.pd-docs').scrollIntoView({block:'start'})); await sl(300);
 await p.screenshot({path:S+`final37_${tag}_3viewer.png`});
 const big=await p.$$('.dv-bar .pill'); for(const x of big){ if((await x.evaluate(e=>e.textContent)).includes('크게')) { await x.click(); break; } }
 await sl(500); await p.screenshot({path:S+`final37_${tag}_4big.png`});
 await p.keyboard.press('Escape'); await sl(300); console.log('big closed?', !(await p.$('.dv-big')));
 await p.keyboard.press('Escape'); await sl(800); await log('esc1');
 await p.keyboard.press('Escape'); await sl(900); await log('esc2');
 await p.screenshot({path:S+`final37_${tag}_5backhome.png`});
 // browser back/forward
 await p.goBack(); await sl(900); await log('back'); 
 await p.goForward(); await sl(900); await log('fwd');
 // resume via rail? go to list first via url
 await p.goto(base+'#/portfolio/silent-mansion',{waitUntil:'networkidle0'}); await sl(1200); await log('deep silent');
 await p.screenshot({path:S+`final37_${tag}_6deep.png`});
 await p.keyboard.press('Escape'); await sl(700); await log('deep esc');
 const items=await p.$$('.menu .mi'); await items[1].click(); await sl(900); await log('resume');
 await p.screenshot({path:S+`final37_${tag}_7resume.png`});
 await p.goBack(); await sl(800); await log('back from resume');
 const items2=await p.$$('.menu .mi'); await items2[2].click(); await sl(900); await log('cover');
 await p.screenshot({path:S+`final37_${tag}_8cover.png`});
 await p.click('.rail-home'); await sl(1000); await log('home link');
 await p.screenshot({path:S+`final37_${tag}_9home.png`});
 console.log(errs.length?errs.join('\n'):'no console errors');
 await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
