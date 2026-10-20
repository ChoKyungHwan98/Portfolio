const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H,D,RM]=[+process.argv[2],+process.argv[3],+(process.argv[4]||1),process.argv[5]==='rm'];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();await p.setViewport({width:W,height:H,deviceScaleFactor:D});if(RM)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});let pass=0,fail=[];const ok=(c,n)=>{c?pass++:fail.push(n)};const tag=W+'x'+H+(D>1?'@'+D*100:'')+(RM?'_rm':'');
await p.goto('http://localhost:8766/#/resume',{waitUntil:'networkidle0'});await sl(1500);
const r=await p.evaluate(async()=>{const sc=document.querySelector('.sheet-scroll'),P=document.querySelector('.r9-paper');
 const fs=[...P.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&e.offsetParent).map(e=>parseFloat(getComputedStyle(e).fontSize)).sort((a,b)=>a-b);
 const t=[...P.querySelectorAll('.r9-tg img')];await Promise.all(t.map(i=>i.decode().catch(()=>0)));
 return {head:!!document.querySelector('.rs .sh-head'),name:P.querySelector('.r9-name').textContent,role:P.querySelector('.r9-role').textContent,contact:[...P.querySelectorAll('.r9-contact li')].map(l=>l.textContent),
  hl:[...P.querySelectorAll('.r9-sum *')].some(e=>/gradient/.test(getComputedStyle(e).backgroundImage)),xp:[...P.querySelectorAll('a.r9-x .r9-x1 b')].map(b=>b.textContent),arrows:/→/.test(P.textContent),thumbs:P.querySelectorAll('.r9-x img').length,
  x3:parseFloat(getComputedStyle(P.querySelector('.r9-x3')).fontSize),min:fs[0],labs:[...P.querySelectorAll('.r9-lab')].map(l=>l.textContent),txt:P.textContent,icons:t.filter(i=>i.naturalWidth>0&&getComputedStyle(i).filter==='none').length,
  sh:sc.scrollHeight,ch:sc.clientHeight,doc:document.scrollingElement.scrollHeight-innerHeight,red:[...P.querySelectorAll('*')].some(e=>{const c=getComputedStyle(e).color;const m=c.match(/\d+/g).map(Number);return m[0]>150&&m[1]<90&&m[2]<90})}});
ok(!r.head,'no 이력서 band');ok(r.name==='조경환'&&r.role==='전투 · 시스템 게임 기획자 지망생','name/role');ok(r.contact.length===5&&/병역/.test(r.contact[4])&&/법무실 근무/.test(r.contact[4]),'contacts '+r.contact.join('|'));
ok(!r.hl,'no highlighter');ok(r.xp.join()==='보스 AI 프로토타입,Pico-Bang!,AI 리뷰 데이터 분석,도로시아,Digreed,침묵의 저택','project order '+r.xp);ok(!r.arrows,'no arrows');ok(r.thumbs===0,'no thumbs');
ok(r.x3>=15,'body ≥15px '+r.x3);ok(r.min>=12.5,'min font '+r.min);ok(r.labs.join()==='프로젝트 경험,학력 · 교육,자격 사항,활용 도구','label order');ok(/TOEFL102점2016/.test(r.txt.replace(/\s/g,''))&&/HSK5급1832015/.test(r.txt.replace(/\s/g,''))&&/TOEIC800점대2023/.test(r.txt.replace(/\s/g,'')),'cert facts');
ok(/숭실대학교 법학과/.test(r.txt)&&/Shanghai Singapore International School/.test(r.txt)&&/생성형 AI를 활용한 게임 기획자 과정/.test(r.txt),'education facts');ok(r.icons===12,'12 color icons');ok(r.doc<=0,'document no scroll');ok(r.sh>r.ch,'resume scrolls inside');ok(!r.red,'no red text');
if(!RM&&D===1){await p.screenshot({path:`/workspace/rhythm/shots/v59_resume_${tag}_top.png`});}
// wheel scroll + scrollbar drag
const box=await p.evaluate(()=>{const e=document.querySelector('.sheet-scroll');const b=e.getBoundingClientRect();return {x:b.right-5,y:b.top+20,cx:b.left+b.width/2,cy:b.top+b.height/2,bot:b.bottom}});
await p.mouse.move(box.cx,box.cy);await p.mouse.wheel({deltaY:300});await sl(400);const w1=await p.evaluate(()=>document.querySelector('.sheet-scroll').scrollTop);ok(w1>100,'wheel scrolls '+w1);
await p.evaluate(()=>document.querySelector('.sheet-scroll').scrollTop=0);await sl(200);
await p.mouse.move(box.x,box.y);await p.mouse.down();for(let k=1;k<=5;k++){await p.mouse.move(box.x,box.y+k*20);await sl(60)}await p.mouse.up();await sl(200);
const d1=await p.evaluate(()=>document.querySelector('.sheet-scroll').scrollTop);await p.mouse.move(box.cx,box.cy);await sl(200);const d2=await p.evaluate(()=>document.querySelector('.sheet-scroll').scrollTop);
ok(d1>40&&Math.abs(d2-d1)<2,'scrollbar drag moves & stays '+d1+'/'+d2);
await p.evaluate(()=>{const e=document.querySelector('.sheet-scroll');e.scrollTop=e.scrollHeight});await sl(400);if(!RM&&D===1)await p.screenshot({path:`/workspace/rhythm/shots/v59_resume_${tag}_bottom.png`});
await p.evaluate(()=>document.querySelector('.sheet-scroll').scrollTop=0);await sl(200);
await p.evaluate(()=>[...document.querySelectorAll('a.r9-x')].find(a=>a.textContent.includes('Digreed')).click());await sl(1500);ok(await p.evaluate(()=>location.hash==='#/portfolio/digreed'),'row → detail');
await p.goto('http://localhost:8766/#/cover',{waitUntil:'networkidle0'});await sl(1200);const cv=await p.evaluate(()=>({t:document.querySelector('.sheet-in').textContent,doc:document.scrollingElement.scrollHeight-innerHeight,sc:document.querySelector('.sheet-scroll').scrollHeight-document.querySelector('.sheet-scroll').clientHeight,ph:document.querySelectorAll('.sheet-in .sk-ph,.sheet-in [class*=ph]').length}));
ok(cv.t.replace(/\s/g,'')==='자기소개서아직올린내용이없습니다.','cover empty "'+cv.t+'"');ok(cv.doc<=0&&cv.sc<=0,'cover no scroll');if(!RM&&D===1)await p.screenshot({path:`/workspace/rhythm/shots/v59_cover_${tag}.png`});
await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'});await sl(2500);ok(await p.evaluate(()=>document.scrollingElement.scrollHeight<=innerHeight&&!document.querySelector('.sheet-scroll')?.scrollTop),'home no scroll');
console.log(tag,'PASS',pass,'FAIL',fail.length,JSON.stringify(fail),JSON.stringify(errs));await b.close()})();
