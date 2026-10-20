const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [w,h] of [[1093,614],[911,512],[1024,576],[853,480],[960,600],[1280,720]]){const p=await b.newPage();await p.setViewport({width:w,height:h});
await p.goto('http://localhost:8766/index.html?still',{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,800));
console.log(w+'x'+h,JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('.tile')].map(t=>{const l=t.querySelector('.tile-label'),rg=document.createRange();rg.selectNodeContents(l);const rs=[...rg.getClientRects()],tb=t.getBoundingClientRect(),sv=t.querySelector('svg').getBoundingClientRect();
const L=Math.min(...rs.map(r=>r.left)),R=Math.max(...rs.map(r=>r.right)),B=Math.max(...rs.map(r=>r.bottom));
return {lines:new Set(rs.map(r=>Math.round(r.top))).size,textL:Math.round(L-tb.left),textR:Math.round(tb.right-R),bottomPad:Math.round(tb.bottom-B),iconTop:Math.round(sv.top-tb.top),font:getComputedStyle(l).fontSize}}))));await p.close();}
await b.close();})();
