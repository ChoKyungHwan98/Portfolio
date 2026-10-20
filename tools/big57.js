const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H]=[+process.argv[2]||1280,+process.argv[3]||600];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();await p.setViewport({width:W,height:H});
const st=()=>p.evaluate(()=>{const o={doc:document.scrollingElement.scrollTop,docX:document.scrollingElement.scrollLeft};document.querySelectorAll('*').forEach(e=>{if((e.scrollTop||e.scrollLeft)&&!e.closest('.ov'))o[(e.className&&e.className.baseVal===undefined?String(e.className).slice(0,30):e.tagName)]=[e.scrollTop,e.scrollLeft]});const h=document.querySelector('.home,.rail-home,[class*=home]');o.home=h?Math.round(h.getBoundingClientRect().top):null;o.vv=Math.round(visualViewport.offsetTop);return JSON.stringify(o)});
await p.goto('http://localhost:8766/#/portfolio/ai-review',{waitUntil:'networkidle0'});await sl(2500);console.log('start',await st());
for(const how of ['btn','esc','backdrop']){
 await p.click('.as-big');await sl(1500);
 await p.mouse.move(W/2,H/2);for(let i=0;i<5;i++){await p.mouse.wheel({deltaY:400});await sl(100)}await sl(400);console.log(how,'open',await st());
 if(how==='btn')await p.click('.ov .ov-x, .ov [aria-label*="닫"]');else if(how==='esc'){await p.keyboard.press('Escape')}else{await p.mouse.click(4,4)}
 await sl(900);console.log(how,'closed',await st(),'ov',await p.evaluate(()=>!!document.querySelector('.ov')));
 await p.mouse.move(W/2,H/2);for(let i=0;i<5;i++){await p.mouse.wheel({deltaY:400});await sl(100)}await sl(400);console.log(how,'after wheel',await st());
 await p.mouse.move(80,200);for(let i=0;i<3;i++){await p.mouse.wheel({deltaY:400});await sl(100)}await sl(300);console.log(how,'rail wheel',await st());}
await p.screenshot({path:'/workspace/rhythm/shots/v57_big_after.png'});await b.close()})();
