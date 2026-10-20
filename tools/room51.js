const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H,RM]=[+process.argv[2],+process.argv[3],process.argv[4]==='rm'];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars','--autoplay-policy=no-user-gesture-required']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.setViewport({width:W,height:H});if(RM)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
const tag=`${W}x${H}${RM?'_rm':''}`,S='/workspace/rhythm/shots/final51_';
await p.goto('http://localhost:8766/#/media?ch=game',{waitUntil:'networkidle0'});
if(!RM){await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'});await sl(2500);await p.evaluate(()=>{location.hash='#/media?ch=game'});
 for(const t of [150,330,560]){await sl(t===150?150:t===330?180:230);await p.screenshot({path:S+`push${t}_${tag}.png`});}}
await sl(1500);
const g=()=>p.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [b.x,b.y,b.width,b.height].map(Math.round)};const cam=document.querySelector('.rm-cam');
 return {ready:document.querySelector('.mr')?.classList.contains('ready'),cam:cam&&getComputedStyle(cam).transform,scr:r('.mr-scr'),ins:[...document.querySelectorAll('.mr-in')].map(e=>{const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height),e.getAttribute('aria-checked')]}),home:r('.mr-homebtn'),mute:r('.mr-btn.mute'),items:document.querySelectorAll('.mr-grid .mr-it').length,strip:document.querySelectorAll('.mr-strip .mr-it').length,favs:[...document.querySelectorAll('.mr-strip .tt')].map(e=>e.textContent),act:document.activeElement?.className,hint:r('.mr-hint'),imgs:[...document.querySelectorAll('.mr img')].filter(i=>i.loading==='lazy').length,
 bad:/무라마사|muramasa/i.test(document.querySelector('.mr').textContent)}});
let m=await g();console.log(tag,'game',JSON.stringify(m));await p.screenshot({path:S+`room_game_${tag}.png`});
await p.mouse.move(W*0.95,H*0.1);await sl(900);await p.screenshot({path:S+`room_parallax_${tag}.png`});
await p.keyboard.press('2');await sl(900);m=await g();console.log(tag,'anime',JSON.stringify({items:m.items,strip:m.strip,ins:m.ins.map(x=>x[4]),hash:await p.evaluate(()=>location.hash)}));await p.screenshot({path:S+`room_anime_${tag}.png`});
await p.click('.mr-in[data-ch="game"]');await sl(900);m=await g();console.log(tag,'click game',m.items,await p.evaluate(()=>location.hash));
await p.keyboard.press('Escape');await sl(1200);console.log(tag,'esc',await p.evaluate(()=>[location.hash,!!document.querySelector('.mr'),document.activeElement?.getAttribute('href')]));
console.log(tag,'errs',JSON.stringify(errs));await b.close();})();
