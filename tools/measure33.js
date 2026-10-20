const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [w,h] of [[1440,900],[1920,1080],[1280,720],[390,844]]){
const p=await b.newPage(); await p.setViewport({width:w,height:h}); await p.goto('http://localhost:8766/index.html?still',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1200));
const r=await p.evaluate(()=>{const R=e=>{const b=e.getBoundingClientRect();return {l:Math.round(b.left),t:Math.round(b.top),r:Math.round(b.right),b:Math.round(b.bottom)}};
const pn=document.querySelector('.panel').getBoundingClientRect(); const mob=innerWidth<=768;
const edge=y=> mob? null : Math.round(pn.left+pn.width*(0.6017+0.3983*(y-pn.top)/pn.height));
const edgeY=x=> mob? Math.round(pn.top+pn.height*(1-0.1*(x-pn.left)/pn.width)):null;
const out={};
document.querySelectorAll('.mi').forEach((e,i)=>out['mi'+i]=R(e));
out.band=R(document.querySelector('.band'));
document.querySelectorAll('.tile').forEach((e,i)=>out['tile'+i]=R(e));
out.play=R(document.querySelector('.play')); out.contact=R(document.querySelector('.contact')); out.brand=R(document.querySelector('.brand'));
for(const k of Object.keys(out)){const o=out[k]; if(!mob) o.edgeAtBottom=edge(o.b), o.edgeAtTop=edge(o.t); else o.panelBottomAtRight=edgeY(o.r);}
out.vh=innerHeight; return out});
console.log(w+'x'+h); for(const [k,v] of Object.entries(r)) console.log(' ',k,JSON.stringify(v)); await p.close();}
await b.close();})();
