const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H,RM]=[+process.argv[2],+process.argv[3],process.argv[4]==='rm'];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.setViewport({width:W,height:H});if(RM)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);let pass=0,fail=[];const ok=(c,n)=>{c?pass++:fail.push(n)};const tag=W+'x'+H+(RM?'_rm':'');
await p.goto('http://localhost:8766/#/resume',{waitUntil:'networkidle0'});await sl(1800);
const r=await p.evaluate(()=>{const sc=document.querySelector('.sheet-scroll'),img=document.querySelector('.rs-photo');const t=document.querySelector('.rs').textContent;
 const over=[...document.querySelectorAll('.rs *')].filter(e=>{const b=e.getBoundingClientRect();return b.right>document.querySelector('.rs').getBoundingClientRect().right+1}).length;
 return {img:img&&img.complete&&img.naturalWidth,ph:document.querySelectorAll('.rs .ph').length,secs:[...document.querySelectorAll('.rs-h')].map(e=>e.textContent).join('|'),tools:document.querySelectorAll('.rs-tools li').length,exp:document.querySelectorAll('.rs-go').length,
 sh:sc.scrollHeight,ch:sc.clientHeight,over,mura:/무라마사/.test(document.body.textContent),photos:document.querySelectorAll('img[src*="profile"]').length,fs:getComputedStyle(document.querySelector('.rs-sum p')).fontSize,t:t.slice(0,80),op:getComputedStyle(document.querySelector('.rs-card')).opacity}});
console.log(tag,JSON.stringify(r));
ok(r.img>0&&r.photos===1,'photo');ok(r.ph===0,'no placeholders');ok(r.secs==='프로젝트 경험|학력 · 교육|자격 사항|병역|활용 도구','sections');ok(r.tools===12&&r.exp===3,'tools/exp');ok(r.over===0,'no horizontal overflow');ok(!r.mura,'no muramasa');ok(r.op==='1','cards visible');
await p.screenshot({path:`/workspace/rhythm/shots/v53_resume_${tag}.png`});
await p.evaluate(()=>{const s=document.querySelector('.sheet-scroll');s.scrollTop=s.scrollHeight});await sl(400);await p.screenshot({path:`/workspace/rhythm/shots/v53_resume_end_${tag}.png`});
await p.evaluate(()=>{const s=document.querySelector('.sheet-scroll');s.scrollTop=0});await sl(300);
await p.click('.rs-go');await sl(1500);const h=await p.evaluate(()=>({h:location.hash,sel:document.querySelector('[aria-current="page"],.rail .on')?.textContent}));ok(h.h==='#/portfolio/dorothia','project link '+JSON.stringify(h));
await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'});await sl(1200);ok(await p.evaluate(()=>document.querySelectorAll('img[src*="profile"]').length===0),'photo only on resume');
console.log(tag,'PASS',pass,'FAIL',fail.length,JSON.stringify(fail),JSON.stringify(errs));await b.close();})();
