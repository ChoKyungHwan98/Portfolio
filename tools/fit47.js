const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();
for(const [w,h,d] of [[1280,600,1],[1366,657,1],[1440,900,1],[1920,969,1],[1280,646,1.5]]){await p.setViewport({width:w,height:h,deviceScaleFactor:d});await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,1500));
const r=await p.evaluate(()=>{const s=document.querySelector('.sheet-scroll');const g=sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.top),Math.round(b.bottom),Math.round(b.width)]};
const over=[...document.querySelectorAll('.wk-card *')].filter(e=>e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=='visible').length;
return {vh:innerHeight,over:s.scrollHeight-s.clientHeight,hero:g('.wk-card.hero'),sec:[...document.querySelectorAll('.wk-card.sec')].map(e=>Math.round(e.getBoundingClientRect().height)),ter:g('.wk-card.ter'),sm:g('.wk-card.sm'),clipped:over}});
console.log(w+'x'+h+'@'+d,JSON.stringify(r));await p.screenshot({path:`/workspace/rhythm/shots/final47_list_${w}x${h}${d>1?'_150':''}.png`});}
await b.close()})()
