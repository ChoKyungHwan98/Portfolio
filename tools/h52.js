const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();
for(const [W,H] of [[1280,600],[1920,969]])for(const ch of ['game','anime']){await p.setViewport({width:W,height:H});await p.goto(`http://localhost:8766/#/media?ch=${ch}`,{waitUntil:'networkidle0'});await sl(3000);
console.log(W,ch,await p.evaluate(()=>[...document.querySelectorAll('.mw .mr-grid:not(.feat) .mr-it')].slice(0,6).map(e=>Math.round(e.getBoundingClientRect().height)).join(',')));}
await b.close();})();
