const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [w,h] of [[1440,900],[1920,1080],[2560,1440]]){
const p=await b.newPage(); await p.setViewport({width:w,height:h}); await p.goto('http://localhost:8766/index.html?still',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1200));
const r=await p.evaluate(()=>{const q=s=>document.querySelector(s),R=e=>{const b=e.getBoundingClientRect();return `${Math.round(b.width)}×${Math.round(b.height)} @(${Math.round(b.left)},${Math.round(b.top)})`},fs=e=>getComputedStyle(e).fontSize;
return {menuFont:fs(q('.mi')),band:R(q('.band')),brandName:fs(q('.brand-name')),brandRole:fs(q('.brand-role')),brand:R(q('.brand')),chip:R(q('.chip'))+' '+fs(q('.chip')),tile:R(q('.tile'))+' '+fs(q('.tile')),play:R(q('.play'))+' '+fs(q('.play')),bigidx:fs(q('.bigidx-num')),keys:R(q('.keys')),charHead:R(q('.c-head'))}});
console.log(w+'x'+h, JSON.stringify(r,null,1)); await p.close();}
await b.close();})();
