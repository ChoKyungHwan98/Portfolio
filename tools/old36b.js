const puppeteer=require('puppeteer-core');
const B='https://chokyunghwan98.github.io/Portfolio/';
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
for(const id of [1,2,3,4]){const p=await b.newPage(); await p.setViewport({width:1440,height:900});
 await p.goto(B+`?view=portfolio&project=${id}`,{waitUntil:'networkidle2',timeout:45000}); await new Promise(r=>setTimeout(r,2500));
 const tabs=await p.$$eval('.project-detail-tab',t=>t.map(x=>x.innerText.trim()));
 console.log(id,'tabs',JSON.stringify(tabs));
 for(let k=1;k<tabs.length;k++){ const el=(await p.$$('.project-detail-tab'))[k]; await el.click(); await new Promise(r=>setTimeout(r,2500));
   await p.screenshot({path:`/workspace/rhythm/oldsite/shots/project${id}_tab${k}.png`});
   const d=await p.evaluate(()=>{const c=document.querySelector('.project-detail-content');return (c?c.innerText:'').slice(0,300).replace(/\n+/g,' / ')}); console.log('   tab',k,tabs[k],'|',d);}
 await p.close();}
const p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
await p.goto(B,{waitUntil:'networkidle2'}); await new Promise(r=>setTimeout(r,4000)); await p.screenshot({path:'/workspace/rhythm/oldsite/shots/mobile_home.png'});
console.log('mobile', (await p.evaluate(()=>document.body.innerText.slice(0,600))).replace(/\n+/g,' / '));
await b.close();})();
