const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();await p.setViewport({width:1280,height:600});
await p.goto(`http://localhost:8766/#/media?ch=game`,{waitUntil:'networkidle0'});await sl(3000);
const bb=await p.evaluate(()=>{const e=document.querySelector('.mw .mr-body');e.scrollTop=600;const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]});await sl(200);
await p.screenshot({path:'/workspace/rhythm/shots/sbcol.png',clip:{x:bb[0]+bb[2]-60,y:bb[1],width:70,height:bb[3]}});console.log(bb);await b.close();})();
