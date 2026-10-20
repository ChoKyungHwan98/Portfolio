const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const port=process.argv[2]||'8769';
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();await p.setViewport({width:1280,height:600});
await p.goto(`http://localhost:${port}/#/media?ch=game`,{waitUntil:'networkidle0'});await sl(3000);
const sel=port==='8769'?'.mr-body':'.mw .mr-body';
const bb=await p.evaluate(s=>{const e=document.querySelector(s);e.scrollTop=0;const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]},sel);
await p.evaluate(s=>{document.querySelector(s).scrollTop=600},sel);await sl(100);
const th=await p.evaluate(s=>{const e=document.querySelector(s);return e.clientHeight*e.scrollTop/e.scrollHeight},sel);
const sx=bb[0]+bb[2]-5,sy=bb[1]+th+6;await p.mouse.move(sx,sy);await p.mouse.down();await sl(60);
const tops=[await p.evaluate(s=>Math.round(document.querySelector(s).scrollTop),sel)];for(let k=1;k<=5;k++){await p.mouse.move(sx,sy+k*20);await sl(60);tops.push(await p.evaluate(s=>Math.round(document.querySelector(s).scrollTop),sel));}
await p.mouse.up();console.log(port,'drag from 600:',tops.join(' → '));await b.close();})();
