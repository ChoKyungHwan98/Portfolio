const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();await p.setViewport({width:1280,height:600});
await p.goto('http://localhost:8766/#/media?ch=game',{waitUntil:'networkidle0'});await sl(2800);
console.log(await p.evaluate(()=>{const e=document.querySelector('.mw .mr-body');const r=e.getBoundingClientRect();return {sbw:e.offsetWidth-e.clientWidth,r:[r.x,r.y,r.width,r.height],sh:e.scrollHeight,ch:e.clientHeight,el:document.elementFromPoint(r.right-4,r.top+20)?.className}}));
await b.close();})();
