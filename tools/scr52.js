const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const sizes=(process.argv[2]||'1280x600').split(',');const S=['battle','pico-bang','ai-review','dorothia','silent-mansion','digreed'];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();
for(const sz of sizes){const [W,H,D]=sz.split(/[x@]/).map(Number);await p.setViewport({width:W,height:H,deviceScaleFactor:D||1});
for(const s of S){await p.goto('http://localhost:8766/#/portfolio/'+s,{waitUntil:'networkidle0'});await sl(900);
 const r=await p.evaluate(()=>{const d=document.documentElement,sc=document.querySelector('.sheet-scroll');const q=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [b.x,b.y,b.width,b.height].map(Math.round)};
  return {doc:[d.scrollHeight,d.clientHeight],sc:sc&&[sc.scrollHeight,sc.clientHeight],head:q('.wd-head'),slot:q('.dh-slot'),main:q('.wd-main'),bar:q('.wd-bar'),vid:q('.sv-face'),entry:q('.de')}});
 console.log(sz,s,JSON.stringify(r));if(process.argv[3])await p.screenshot({path:`/workspace/rhythm/shots/${process.argv[3]}_d_${s}_${sz.replace('@','_')}.png`});}}
await b.close();})();
