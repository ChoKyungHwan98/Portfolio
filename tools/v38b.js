const puppeteer=require('puppeteer-core');
const [,,W,H,tag]=process.argv; const base='http://localhost:8766/'; const S='/workspace/rhythm/shots/';
const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage(); const errs=[]; const res=[];
 p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.type()+': '+m.text())});
 p.on('pageerror',e=>errs.push('pageerror: '+e.message));
 p.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url())});
 const mob=+W<=768; await p.setViewport({width:+W,height:+H,isMobile:mob,hasTouch:mob});
 const st=()=>p.evaluate(()=>[location.hash,!!document.querySelector('.sheet'),document.querySelector('.sh-title')?.textContent||'',document.querySelector('.mi.on')?.textContent.slice(0,5)||'']);
 const chk=async(name,exp)=>{const s=await st(); const ok=s[0]===exp; res.push(`${ok?'OK  ':'FAIL'} ${name}: ${JSON.stringify(s)}`); };
 const tap=async sel=>{const e=await p.$(sel); const bb=await e.boundingBox(); if(mob) await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2); else await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);};
 await p.goto(base,{waitUntil:'networkidle0'}); await sl(1800);
 await p.screenshot({path:S+`final38_${tag}_home.png`});
 await tap('.menu .mi'); await sl(1100); await chk('click 포트폴리오','#/portfolio');
 await p.screenshot({path:S+`final38_${tag}_list.png`});
 await tap('.sk-row'); await sl(800); await chk('row → detail','#/portfolio/dorothia');
 await p.screenshot({path:S+`final38_${tag}_detail.png`});
 await p.goBack(); await sl(700); await chk('browser back → list','#/portfolio');
 await p.goForward(); await sl(700); await chk('browser forward → detail','#/portfolio/dorothia');
 const nx=await p.$$('.sk-top .pill'); await nx[2].click(); await sl(700); await chk('next project','#/portfolio/silent-mansion');
 await p.keyboard.press('Escape'); await sl(700); await chk('Esc detail → list','#/portfolio');
 await p.keyboard.press('Escape'); await sl(1000); await chk('Esc list → home','');
 await p.screenshot({path:S+`final38_${tag}_esc_home.png`});
 await p.goto(base+'#/portfolio/digreed',{waitUntil:'networkidle0'}); await sl(1200); await chk('deep link detail','#/portfolio/digreed');
 await p.screenshot({path:S+`final38_${tag}_deep.png`});
 await p.keyboard.press('Escape'); await sl(700); await chk('deep Esc → list (replace)','#/portfolio');
 const it=await p.$$('.menu .mi'); await it[1].click(); await sl(800); await chk('rail 이력서','#/resume');
 await p.screenshot({path:S+`final38_${tag}_resume.png`});
 await p.goBack(); await sl(700); await chk('back → list','#/portfolio');
 const it2=await p.$$('.menu .mi'); await it2[2].click(); await sl(800); await chk('rail 자기소개서','#/cover');
 await p.screenshot({path:S+`final38_${tag}_cover.png`});
 await tap('.rail-home'); await sl(1100); await chk('홈 link','');
 await p.goto(base+'#portfolio',{waitUntil:'networkidle0'}); await sl(900); await chk('legacy #portfolio','#/portfolio'); await p.goto(base+'#/portfolio/digreed/doc',{waitUntil:'networkidle0'}); await sl(900); await chk('old tab segment dropped','#/portfolio/digreed');
 await p.goto(base+'#/resume',{waitUntil:'networkidle0'}); await sl(900); await p.keyboard.press('Escape'); await sl(1000); await chk('deep resume Esc → home','');
 // play still works from home
 await p.keyboard.press('Space'); await sl(1200); const playing=await p.evaluate(()=>document.querySelector('.world').classList.contains('playing')); res.push((playing?'OK  ':'FAIL')+' Space → play');
 await p.keyboard.press('Escape'); await sl(900);
 // rail geometry
 if(!mob){ await p.goto(base+'#/portfolio',{waitUntil:'networkidle0'}); await sl(900);
   const g=await p.evaluate(()=>{const q=s=>document.querySelector(s).getBoundingClientRect(); const sc=q('.sheet-scroll'),m=q('.menu'),c=q('.contact'),h=q('.rail-home'); const mis=[...document.querySelectorAll('.menu .mi')].map(e=>Math.round(e.getBoundingClientRect().right)); return {sheetLeft:sc.left, menuRight:Math.max(...mis), homeTop:h.top, contactBottom:c.bottom, contactRight:c.right, vh:innerHeight, tiles:getComputedStyle(document.querySelector('.tiles')).opacity}});
   res.push('rail geom '+JSON.stringify(g)); }
 console.log(res.join('\n')); console.log(errs.length?errs.join('\n'):'no console errors'); await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
