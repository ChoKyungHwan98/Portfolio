const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:600});
await p.goto('http://localhost:8766/#/media',{waitUntil:'networkidle0'});await sl(2600);
await p.evaluate(()=>{window.__log=[];const t0=performance.now();document.querySelector('.ro.game').click();const f=()=>{const q=s=>document.querySelector(s);const g=s=>q(s)&&getComputedStyle(q(s));
 __log.push([Math.round(performance.now()-t0),g('.mw').opacity,g('.mw').transform.slice(0,40),g('.mw .mr-pic').transform,g('.mw .mr-snow').opacity,g('.mw .mr-flash').opacity,g('.mw .mr-scr').backgroundColor]);if(performance.now()-t0<700)requestAnimationFrame(f)};f();});
await sl(900);const l=await p.evaluate(()=>__log);console.log(l.filter((_,i)=>i%4==0).map(x=>JSON.stringify(x)).join('\n'));await b.close();})();
