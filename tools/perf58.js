const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H,RM]=[+process.argv[2],+process.argv[3],process.argv[4]==='rm'];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.setViewport({width:W,height:H});if(RM)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);const tag=W+'x'+H+(RM?'_rm':'');let pass=0,fail=[];const ok=(c,n)=>{c?pass++:fail.push(n)};
await p.goto('http://localhost:8766/?time=night',{waitUntil:'networkidle0'});await sl(4200);
const watch=()=>p.evaluate(()=>{window.__f=[];const t0=performance.now();const loop=()=>{const m=document.querySelector('.mr'),w=document.querySelector('.world');window.__f.push({t:performance.now()-t0,mr:m?getComputedStyle(m).transform:null,w:getComputedStyle(w).transform,sbx:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight});if(performance.now()-t0<1600)requestAnimationFrame(loop)};requestAnimationFrame(loop);return 1});
const shots=async(dir)=>{const t0=Date.now(),out=[];for(let i=0;i<14;i++){const t=Date.now()-t0;await p.screenshot({path:`/workspace/rhythm/shots/v58_${dir}_${tag}_${String(i).padStart(2,'0')}.png`});out.push(t)}return out};
// enter
await watch();await p.click('a.tile[href="#/media"]');const te=[];await sl(1500);
let f=await p.evaluate(()=>window.__f);const iv=f.slice(1).map((x,i)=>x.t-f[i].t);
let r=await p.evaluate(()=>({cls:document.querySelector('.mr').className,mr:getComputedStyle(document.querySelector('.mr')).transform,cam:getComputedStyle(document.querySelector('.rm-cam')).transform,w:getComputedStyle(document.querySelector('.world')).transform,pan:document.documentElement.classList.contains('panning'),act:document.activeElement?.dataset?.ch,door:document.querySelectorAll('.rm-door').length,mk:getComputedStyle(document.querySelector('.ro-mk')).opacity}));
console.log('FR',f.map((x,i)=>Math.round(x.t)+(x.mr&&x.mr!=='none'?'*':'')).join(' '));console.log(tag,'enter',JSON.stringify(r),'maxFrame',Math.max(...iv).toFixed(0),'frames',f.length,'scrollbars',f.some(x=>x.sbx),'shotT',te.join(','));
ok(r.cls.includes('room')&&!r.cls.includes('walk'),'arrived');ok(r.mr==='none'&&r.cam==='none'&&r.w==='none','flattened');ok(!r.pan,'panning cleared');ok(r.door===0,'no door');ok(r.act==='game','focus game');ok(!f.some(x=>x.sbx),'no scrollbars');
if(!RM){const mid=f.filter(x=>x.mr&&x.mr!=='none');ok(mid.length>20,'pan frames '+mid.length);ok(f.some(x=>x.w!=='none'),'home moved');}
await p.screenshot({path:`/workspace/rhythm/shots/v58_room_${tag}.png`});
// exit
await watch();await p.keyboard.press('Escape');const tx=[];await sl(1500);
f=await p.evaluate(()=>window.__f);const iv2=f.slice(1).map((x,i)=>x.t-f[i].t);
r=await p.evaluate(()=>({mr:!!document.querySelector('.mr'),w:getComputedStyle(document.querySelector('.world')).transform,h:getComputedStyle(document.querySelector('.world .home')).transform,pan:document.documentElement.classList.contains('panning'),hash:location.hash,act:document.activeElement?.className}));
console.log(tag,'exit',JSON.stringify(r),'maxFrame',Math.max(...iv2).toFixed(0),'scrollbars',f.some(x=>x.sbx),'shotT',tx.join(','));
ok(!r.mr&&r.w==='none'&&r.h==='none'&&!r.pan&&r.hash==='','home restored');ok(/tile/.test(r.act||''),'focus tile');ok(!f.some(x=>x.sbx),'no scrollbars exit');
// tile→room→home→room again
await p.click('a.tile[href="#/media"]');await sl(1800);ok(await p.evaluate(()=>getComputedStyle(document.querySelector('.mr')).transform==='none'&&document.querySelector('.mr').className.includes('room')),'second entry ok');
// skip mid-pan by click
await p.keyboard.press('Escape');await sl(1600);await p.click('a.tile[href="#/media"]');await sl(300);await p.mouse.click(W/2,H/2);await sl(500);
r=await p.evaluate(()=>({cls:document.querySelector('.mr').className,mr:getComputedStyle(document.querySelector('.mr')).transform,w:getComputedStyle(document.querySelector('.world')).transform,win:!!document.querySelector('.mw:not([hidden])')}));ok(RM||r.cls.includes('room')&&!r.cls.includes('walk')&&r.mr==='none'&&r.w==='none'&&!r.win,'skip mid-pan '+JSON.stringify(r));
// Esc mid-pan
await p.keyboard.press('Escape');await sl(1600);await p.click('a.tile[href="#/media"]');await sl(400);await p.keyboard.press('Escape');await sl(1600);
r=await p.evaluate(()=>({mr:!!document.querySelector('.mr'),w:getComputedStyle(document.querySelector('.world')).transform,h:getComputedStyle(document.querySelector('.world .home')).transform,pan:document.documentElement.classList.contains('panning')}));ok(!r.mr&&r.w==='none'&&r.h==='none'&&!r.pan,'esc mid-pan → home clean '+JSON.stringify(r));
// deep link
await p.goto('about:blank');await p.goto('http://localhost:8766/?time=day#/media',{waitUntil:'domcontentloaded'});
if(!RM){for(let i=0;i<5;i++){await sl(90);await p.screenshot({path:`/workspace/rhythm/shots/v58_deep_${tag}_${i}.png`})}}await sl(1800);
r=await p.evaluate(()=>({cls:document.querySelector('.mr')?.className,mr:getComputedStyle(document.querySelector('.mr')).transform,w:getComputedStyle(document.querySelector('.world')).transform,op:getComputedStyle(document.querySelector('.mr')).opacity}));
ok(r.cls&&r.cls.includes('room')&&r.mr==='none'&&r.op==='1'&&r.w==='none','deep link arrives flat '+JSON.stringify(r));
// deep → home exit
await p.keyboard.press('Escape');await sl(1600);r=await p.evaluate(()=>({mr:!!document.querySelector('.mr'),w:getComputedStyle(document.querySelector('.world')).transform}));ok(!r.mr&&r.w==='none','deep → home');
console.log(tag,'PASS',pass,'FAIL',fail.length,JSON.stringify(fail),JSON.stringify(errs));await b.close()})();
