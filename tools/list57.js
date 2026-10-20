const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H]=[+process.argv[2],+process.argv[3]];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();await p.setViewport({width:W,height:H});
await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'});await sl(1800);
const r=await p.evaluate(()=>{const c=[...document.querySelectorAll('.wk-card')].find(x=>x.textContent.includes('AI 리뷰'));const im=c&&c.querySelector('.wk-img');const b=c.querySelector('.wk-art').getBoundingClientRect();return {img:im&&im.complete&&im.naturalWidth,src:im&&im.getAttribute('src'),cap:!!c.querySelector('.wk-cap'),art:[b.width,b.height].map(Math.round)}});
console.log(W+'x'+H,JSON.stringify(r));await p.screenshot({path:`/workspace/rhythm/shots/v57_list_${W}x${H}.png`});
const c=await p.$$('.wk-card');for(const x of c){if((await x.evaluate(e=>e.textContent)).includes('AI 리뷰')){await x.evaluate(e=>e.querySelector('a').click());break}}await sl(1500);console.log('opened',await p.evaluate(()=>location.hash));await b.close()})();
