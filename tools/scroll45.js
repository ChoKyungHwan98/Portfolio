const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();
for(const [w,h] of [[1280,600],[1920,969]]){await p.setViewport({width:w,height:h});await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,1500));
await p.evaluate(()=>{const s=document.querySelector('.sheet-scroll');s.scrollTop=s.scrollHeight});await new Promise(r=>setTimeout(r,300));
await p.screenshot({path:`/workspace/rhythm/shots/final45_list_${w}x${h}_scrolled.png`});
await p.goto('http://localhost:8766/#/portfolio/battle',{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,1500));await p.screenshot({path:`/workspace/rhythm/shots/final45_detail_${w}x${h}.png`});
await p.evaluate(()=>{const s=document.querySelector('.sheet-scroll');s.scrollTop=560});await new Promise(r=>setTimeout(r,300));await p.screenshot({path:`/workspace/rhythm/shots/final45_detail_${w}x${h}_scrolled.png`});}
await b.close()})()
