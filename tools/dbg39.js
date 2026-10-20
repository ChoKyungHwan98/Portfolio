const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const p=await b.newPage(); await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:8766/#/resume',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1200));
await p.evaluate(()=>{window.__l=[]; const t0=performance.now(); const L=()=>{const ls=[...document.querySelectorAll('.menu .mi')]; const bd=document.querySelector('.menu .band'); window.__l.push([Math.round(performance.now()),ls.map(e=>getComputedStyle(e).color.replace('rgb','')+(e.classList.contains('on')?'*':'')).join(' '), bd?Math.round(bd.getBoundingClientRect().top):null, bd?getComputedStyle(bd).opacity:null]); requestAnimationFrame(L)}; L();});
const it=await p.$$('.menu .mi'); const bb=await it[2].boundingBox(); const t=await p.evaluate(()=>performance.now()); await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);
await new Promise(r=>setTimeout(r,500)); const l=await p.evaluate(t=>window.__l.filter(x=>x[0]>t-20&&x[0]<t+400),t); for(const x of l) console.log(Math.round(x[0]-t),x.slice(1).join(' | '));
await b.close();})();
