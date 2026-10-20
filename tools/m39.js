const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [W,H] of [[1440,900],[1280,720],[390,844]]){const p=await b.newPage(); const mob=W<=768; await p.setViewport({width:W,height:H,isMobile:mob,hasTouch:mob});
await p.goto('http://localhost:8766/#/resume',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1200));
console.log(W, JSON.stringify(await p.evaluate(()=>{const R=s=>[...document.querySelectorAll(s)].map(e=>Math.round(e.getBoundingClientRect().left*10)/10);
 return {home:R('.rail-home'),homeIcon:R('.rail-home svg'),band:R('.menu .band'),labels:R('.menu .mi-label'),mi:R('.menu .mi'),contact:R('.contact .chip, .contact a, .contact button')}})));}
await b.close();})();
