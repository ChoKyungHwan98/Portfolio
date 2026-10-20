const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H,RM]=[+process.argv[2],+process.argv[3],process.argv[4]==='rm'];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();await p.setViewport({width:W,height:H});if(RM)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});let pass=0,fail=[];const ok=(c,n)=>{c?pass++:fail.push(n)};
await p.goto('http://localhost:8766/#/resume',{waitUntil:'networkidle0'});await sl(1500);
const r=await p.evaluate(async()=>{const sc=document.querySelector('.sheet-scroll');sc.scrollTop=sc.scrollHeight;await new Promise(r=>setTimeout(r,600));
 const fs=[...document.querySelectorAll('.r7-sheet *')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&e.offsetParent).map(e=>[parseFloat(getComputedStyle(e).fontSize),e.className||e.tagName]).sort((a,b)=>a[0]-b[0]);
 const t=[...document.querySelectorAll('.r7-tg li img')];
 return {sh:sc.scrollHeight,ch:sc.clientHeight,min:fs[0],links:[...document.querySelectorAll('a.r7-x')].map(a=>a.getAttribute('href')),tools:t.map(i=>i.naturalWidth>0&&getComputedStyle(i).filter==='none').filter(Boolean).length,ntool:t.length,
  groups:[...document.querySelectorAll('.r7-tg h3')].map(h=>h.textContent),contact:[...document.querySelectorAll('.r7-ci dt')].map(d=>d.textContent),thumbs:[...document.querySelectorAll('.r7-th img')].filter(i=>i.complete&&i.naturalWidth>0).length,
  heavy:[...document.querySelectorAll('.r7-sheet *')].filter(e=>parseFloat(getComputedStyle(e).borderTopWidth)>=2).length,doc:document.scrollingElement.scrollHeight-innerHeight,
  over:[...document.querySelectorAll('.r7-sheet *')].filter(e=>e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=='visible'&&!e.matches('img')).map(e=>e.className).slice(0,5)}});
ok(r.min[0]>=12.5,'min font '+JSON.stringify(r.min));ok(r.links.length===6,'6 project links');ok(r.ntool===12&&r.tools===12,'12 color tool icons '+r.tools);ok(r.groups.join()==='문서 · 데이터,AI 활용,제작 · 엔진','groups');
ok(r.contact.join()==='이메일,전화번호,생년월일,주소,병역','contact grid');ok(r.thumbs===6,'thumbs '+r.thumbs);ok(r.heavy===0,'no heavy inner borders '+r.heavy);ok(r.doc<=0,'doc no scroll');ok(r.over.length===0,'no clipped text '+r.over);
if(W>=1900)ok(r.sh<=r.ch,'one screen at 1920 '+r.sh+'/'+r.ch);
await p.evaluate(()=>{document.querySelector('.sheet-scroll').scrollTop=0});await p.click('a.r7-x[href="#/portfolio/ai-review"]');await sl(1500);ok(await p.evaluate(()=>location.hash==='#/portfolio/ai-review'&&!!document.querySelector('.as-frame')),'row link → ai-review detail');
console.log(W+'x'+H+(RM?'_rm':''),'scroll',r.sh-r.ch,'PASS',pass,'FAIL',fail.length,JSON.stringify(fail),JSON.stringify(errs));await b.close()})();
