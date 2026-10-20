const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();await p.setViewport({width:1280,height:600});
for(const u of ['portfolio/dorothia','portfolio']){await p.goto('http://localhost:8766/#/'+u,{waitUntil:'networkidle0'});await sl(1100);
const r=await p.evaluate(()=>{const sc=document.querySelector('.sheet-scroll');sc.scrollTop=9999;const si=document.querySelector('.sheet-in');const cs=getComputedStyle(si);const c=document.querySelector('.fld').getBoundingClientRect();return {pb:cs.paddingBottom,fld:[c.top|0,c.bottom|0],st:sc.scrollTop}});await sl(400);
console.log(u,JSON.stringify(r));await p.screenshot({path:'/workspace/rhythm/shots/scr47_'+u.replace('/','_')+'.png'});}
await b.close()})()
