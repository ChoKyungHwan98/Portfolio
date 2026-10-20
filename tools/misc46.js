const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();const S='/workspace/rhythm/shots/';
for(const [w,h] of [[1280,600],[1920,969]]){await p.setViewport({width:w,height:h});
 await p.goto('http://localhost:8766/#/resume',{waitUntil:'networkidle0'});await sl(1500);
 const e=await (await p.$$('.sheet .ph'))[2].boundingBox(); await p.mouse.move(e.x+e.width/2,e.y+e.height/2,{steps:5}); await sl(600); await p.screenshot({path:S+`final46_resume_hover_${w}x${h}.png`});
 await p.goto('http://localhost:8766/#/portfolio/battle',{waitUntil:'networkidle0'});await sl(1500); await p.mouse.move(w-40,h/2); await sl(400); await p.screenshot({path:S+`final46_detail_${w}x${h}.png`});
 await p.evaluate(()=>{const s=document.querySelector('.sheet-scroll');s.scrollTop=s.scrollHeight});await sl(300);await p.screenshot({path:S+`final46_detail_${w}x${h}_bottom.png`});
 await p.goto('http://localhost:8766/#/portfolio/dorothia',{waitUntil:'networkidle0'});await sl(1500);await p.evaluate(()=>{const s=document.querySelector('.sheet-scroll');s.scrollTop=s.scrollHeight});await sl(300);await p.screenshot({path:S+`final46_detail_dorothia_${w}x${h}_bottom.png`});
}
// contrast: text sitting directly on field
const cr=await p.evaluate(()=>{const L=c=>{const v=c.match(/\d+/g).slice(0,3).map(x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]};const ratio=(a,b)=>{const x=L(a),y=L(b);return ((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(2)};
 return {bg_vs_label:ratio('rgb(239,239,239)','rgb(79,79,79)'),darkestDot_vs_label:ratio('rgb(166,166,166)','rgb(79,79,79)'),bg_vs_ink:ratio('rgb(239,239,239)','rgb(17,17,17)'),darkDot_vs_ink:ratio('rgb(166,166,166)','rgb(17,17,17)'),peek:'stroke only'}});
console.log(JSON.stringify(cr)); await b.close()})()
