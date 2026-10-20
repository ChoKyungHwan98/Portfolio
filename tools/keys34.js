const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8766/index.html',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1500));
await p.evaluate(()=>{window.__in=[];addEventListener('rhythm:input',e=>__in.push(e.detail))});
await p.keyboard.press('Space'); await new Promise(r=>setTimeout(r,1200));
const st=()=>p.evaluate(()=>({playing:!!document.querySelector('.world.playing'),focus:document.activeElement.className||document.activeElement.tagName,vol:document.querySelector('[role=slider]')?.getAttribute('aria-valuenow'),inputs:__in.length,hash:location.hash}));
console.log('after Space (home):',JSON.stringify(await st()));
for(let i=0;i<3;i++){await p.keyboard.press('Space');await p.keyboard.press('ArrowRight');await new Promise(r=>setTimeout(r,150));}

console.log('after 3x Space+Right :',JSON.stringify(await st()));
await p.goto('http://localhost:8766/index.html',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1500));
await p.evaluate(()=>{window.__in=[];addEventListener('rhythm:input',e=>__in.push(e.detail))});
await p.click('.play'); await new Promise(r=>setTimeout(r,1000));
await p.evaluate(()=>document.querySelector('.dial svg').focus()); for(let i=0;i<4;i++) await p.keyboard.press('ArrowRight'); await p.keyboard.press('Space'); await new Promise(r=>setTimeout(r,200));
console.log('dial focused, 4x Right + Space:',JSON.stringify(await st()));
await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowUp'); await new Promise(r=>setTimeout(r,200));
console.log('dial ArrowDown/Up still works:',JSON.stringify(await st()));
await p.keyboard.press('Escape'); await new Promise(r=>setTimeout(r,900));
console.log('after Esc:',JSON.stringify(await st()));
await p.keyboard.press('ArrowDown'); await new Promise(r=>setTimeout(r,300));
console.log('home ArrowDown:',await p.evaluate(()=>document.querySelector('.mi.on').textContent.slice(0,6)));
await b.close();})();
