const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const D='../shots/';
 for (const rm of [false,true]) {
 const p=await b.newPage(); const errs=[];
 p.on('console',m=>{if(['error','warning'].includes(m.type())&&!m.text().includes('404'))errs.push(m.text())}); p.on('pageerror',e=>errs.push('pageerror '+e.message));
 if(rm) await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 await p.setViewport({width:1440,height:900});
 await p.goto('http://localhost:8765/index.html',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1200));
 const sleep=t=>new Promise(r=>setTimeout(r,t));
 if(!rm){
 await p.keyboard.press('Tab'); await p.keyboard.press('ArrowDown'); await sleep(450); await p.screenshot({path:D+'v3_keyboard_focus.png'});
 console.log('focused:', await p.evaluate(()=>document.activeElement.textContent));
 await p.click('#play'); await sleep(90); await p.screenshot({path:D+'v3_transition_early.png'}); await sleep(80); await p.screenshot({path:D+'v3_transition_mid.png'});
 await sleep(2500);
 console.log(await p.evaluate(()=>{const s=document.querySelector('#song');return {paused:s.paused,t:s.currentTime.toFixed(2),vol:s.volume,on:[...document.querySelectorAll('#beats span')].map(e=>e.className).join(','),focus:document.activeElement.id}}));
 await p.evaluate(()=>document.querySelector('#dialSvg').focus()); for(let i=0;i<10;i++) await p.keyboard.press('ArrowDown'); await sleep(60); await p.screenshot({path:D+'v3_dial_moving.png'}); await sleep(600);
 console.log('vol after keys', await p.evaluate(()=>document.querySelector('#song').volume));
 await p.keyboard.press('Escape'); await sleep(900);
 console.log(await p.evaluate(()=>({paused:document.querySelector('#song').paused,focus:document.activeElement.id})));
 } else { await p.click('#play'); await sleep(600); await p.screenshot({path:D+'v3_reduced_play.png'}); await p.keyboard.press('Escape'); await sleep(500); await p.screenshot({path:D+'v3_reduced_home.png'}); }
 console.log(rm?'reduced':'normal','errors:',errs.length?errs:'none');
 await p.close(); }
 await b.close();
})();
