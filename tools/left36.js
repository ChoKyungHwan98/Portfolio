const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
for(const [w,h] of [[1440,900],[1920,1080],[1280,720],[390,844]]){
 const p=await b.newPage(); await p.setViewport({width:w,height:h}); await p.goto('http://localhost:8766/index.html?still',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,900));
 const base=await p.evaluate(()=>{const L=s=>Math.round(document.querySelector(s).getBoundingClientRect().left);
  const pn=document.querySelector('.panel').getBoundingClientRect(),mob=innerWidth<=768,edge=y=>pn.left+pn.width*(0.6017+0.3983*(y-pn.top)/pn.height);
  const body=document.querySelector('.c-body').getBoundingClientRect(),head=document.querySelector('.c-head').getBoundingClientRect(),sh=document.querySelector('.char-shadow').getBoundingClientRect();
  const play=document.querySelector('.play').getBoundingClientRect();
  return {brand:L('.brand-name'),menu:L('.mi'),tile:L('.tile'),chip:L('.chip'),
   charGap:mob?null:Math.round(Math.min(head.left-edge(head.top), body.left-edge(body.bottom), sh.left-edge(sh.top))),
   charCenterToEdge:mob?null:Math.round((head.left+head.right)/2-edge(head.bottom)), playToEdge:mob?null:Math.round(edge(play.top)-play.right)}});
 let minBand=1e9;
 for(let i=1;i<=3;i++){ await p.hover(`.mi:nth-of-type(${i})`); await new Promise(r=>setTimeout(r,500));
   minBand=Math.min(minBand,await p.evaluate(()=>Math.min(document.querySelector('.band').getBoundingClientRect().left, document.querySelector('.mi.on').getBoundingClientRect().left)));
   const r=await p.evaluate(i=>{const b=document.querySelectorAll('.mi')[i-1].getBoundingClientRect();return [b.left+6,b.top+6]},i);
   await p.mouse.move(r[0],r[1]); await p.mouse.down(); await new Promise(r=>setTimeout(r,250));
   minBand=Math.min(minBand,await p.evaluate(()=>Math.min(document.querySelector('.band').getBoundingClientRect().left, document.querySelector('.mi.on').getBoundingClientRect().left)));
   if(i===1) await p.screenshot({path:`../shots/final36_press_corner_${w}x${h}.png`});
   await p.mouse.move(w-5,h/2); await p.mouse.up(); await new Promise(r=>setTimeout(r,300)); }
 await p.hover('.mi:nth-of-type(1)'); await new Promise(r=>setTimeout(r,500));
 await p.screenshot({path:`../shots/final36_home_${w}x${h}.png`});
 console.log(w+'x'+h,JSON.stringify(base),'minBandLeft(selected+press, incl. tilt)',Math.round(minBand)); await p.close();}
await b.close();})();
