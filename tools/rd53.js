const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H]=[+process.argv[2],+process.argv[3]];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setViewport({width:W,height:H});let pass=0,fail=[];const ok=(c,n)=>{c?pass++:fail.push(n)};
for(const s of ['dorothia','silent-mansion','digreed']){await p.goto('http://localhost:8766/#/portfolio/'+s,{waitUntil:'networkidle0'});await sl(1200);
 await p.click('.de-read');await sl(1500);
 const r=await p.evaluate(()=>{const pg=document.querySelector('.rd-pg'),pn=document.querySelector('.rd-pane');const a=pg.getBoundingClientRect(),c=pn.getBoundingClientRect();
  return {cls:pn.className,fit:document.querySelector('.dv-fit')?.textContent,pressed:document.querySelector('.dv-fit')?.getAttribute('aria-pressed'),pg:[a.x,a.y,a.width,a.height].map(Math.round),pane:[c.x,c.y,c.width,c.height].map(Math.round),vh:innerHeight,vw:innerWidth}});
 console.log(s,JSON.stringify(r));
 ok(r.cls.includes('page')&&r.pressed==='true','default page fit '+s);ok(r.pg[1]+r.pg[3]<=r.vh+1&&r.pg[0]>=0&&r.pg[0]+r.pg[2]<=r.vw,'page fully visible '+s);
 await p.screenshot({path:`/workspace/rhythm/shots/v53_reader_${s}_${W}x${H}.png`});
 await p.click('.dv-fit');await sl(400);const c2=await p.evaluate(()=>document.querySelector('.rd-pane').className);ok(!c2.includes('page'),'switch to width '+s);
 await p.keyboard.press('Escape');await sl(600);}
console.log(W+'x'+H,'PASS',pass,'FAIL',fail.length,JSON.stringify(fail),JSON.stringify(errs));await b.close();})();
