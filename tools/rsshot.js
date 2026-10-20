const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H,name]=[+process.argv[2],+process.argv[3],process.argv[4]||'rs'];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();await p.setViewport({width:W,height:H});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/#/resume',{waitUntil:'networkidle0'});await sl(1800);
const r=await p.evaluate(()=>{const sc=document.querySelector('.sheet-scroll');const fs=[...document.querySelectorAll('.rs *')].filter(e=>e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&e.offsetParent).map(e=>parseFloat(getComputedStyle(e).fontSize));const sh=document.querySelector('.rs-sheet')?.getBoundingClientRect();
 return {sh:sc&&sc.scrollHeight,ch:sc&&sc.clientHeight,minFont:Math.min(...fs),sheet:sh&&[sh.x,sh.y,sh.width,sh.height].map(Math.round),docScroll:document.scrollingElement.scrollHeight-innerHeight,imgs:[...document.querySelectorAll('.rs img')].every(i=>i.complete&&i.naturalWidth>0)}});
console.log(W+'x'+H,JSON.stringify(r),errs);await p.screenshot({path:`/workspace/rhythm/shots/${name}_${W}x${H}.png`});
await p.evaluate(()=>{const sc=document.querySelector('.sheet-scroll');sc.scrollTop=sc.scrollHeight});await sl(300);await p.screenshot({path:`/workspace/rhythm/shots/${name}_${W}x${H}_end.png`});await b.close()})();
