const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const [W,H]=[+process.argv[2],+process.argv[3]];const pre=process.argv[4]||'v54_';const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();await p.setViewport({width:W,height:H});
for(const s of process.argv.slice(5)){await p.goto('http://localhost:8766/#/'+s,{waitUntil:'networkidle0'});await sl(1500);
const r=await p.evaluate(()=>{const sc=document.querySelector('.sheet-scroll');const R=q=>[...document.querySelectorAll(q)].map(e=>{const b=e.getBoundingClientRect();return q+':'+[b.x,b.y,b.width,b.height].map(Math.round).join(',')});return {sh:sc?.scrollHeight,ch:sc?.clientHeight,els:[...R('.sh-head'),...R('.wd-back,.dt-back,[class*=back]'),...R('.sv'),...R('.de'),...R('.wd-next,.dn,[class*=next]')].slice(0,14)}});
console.log(s,JSON.stringify(r));await p.screenshot({path:'/workspace/rhythm/shots/'+pre+s.replace(/\//g,'_')+`_${W}x${H}.png`});}
await b.close();})();
