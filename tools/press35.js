const puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
const ctx=b.defaultBrowserContext(); await ctx.overridePermissions('http://localhost:8766',['clipboard-read','clipboard-write','clipboard-sanitized-write']);
for(const [w,h] of [[1440,900],[1280,720],[390,844]]){
 const p=await b.newPage(); const errs=[]; p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())}); p.on('pageerror',e=>errs.push(e.message));
 await p.setViewport({width:w,height:h}); await p.goto('http://localhost:8766/index.html',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1800));
 await p.screenshot({path:`../shots/final35_home_${w}x${h}.png`});
 const clr=await p.evaluate(()=>{const pn=document.querySelector('.panel').getBoundingClientRect();const edge=y=>pn.left+pn.width*(0.6017+0.3983*(y-pn.top)/pn.height);
   const out={}; document.querySelectorAll('.mi').forEach((m,i)=>{const r=m.getBoundingClientRect(),g=m.querySelector('.mi-go').getBoundingClientRect();out['mi'+i]={box:Math.round(Math.min(edge(r.top),edge(r.bottom))-r.right),chevron:Math.round(edge(g.top)-g.right)}});
   const bd=document.querySelector('.band').getBoundingClientRect(); out.bandTopRight=Math.round(edge(bd.top)-bd.right); return out});
 console.log(w+'x'+h,'diag clearance',JSON.stringify(clr));
 if(w>800){
  const r=await p.evaluate(()=>{const b=document.querySelectorAll('.mi')[1].getBoundingClientRect();return [b.left+b.width*0.8,b.top+b.height*0.25]});
  await p.mouse.move(r[0],r[1]); await new Promise(x=>setTimeout(x,500)); await p.mouse.down(); await new Promise(x=>setTimeout(x,250));
  await p.screenshot({path:`../shots/final35_press_menu_${w}x${h}.png`}); 
  // release outside so it does not open the page
  await p.mouse.move(r[0]+900,r[1]+300); await p.mouse.up(); await new Promise(x=>setTimeout(x,400));
  const q=await p.evaluate(()=>{const b=document.querySelector('.play').getBoundingClientRect();return [b.left+b.width*0.2,b.top+b.height*0.8]});
  await p.mouse.move(q[0],q[1]); await new Promise(x=>setTimeout(x,400)); await p.mouse.down(); await new Promise(x=>setTimeout(x,250));
  await p.screenshot({path:`../shots/final35_press_play_${w}x${h}.png`});
  await p.mouse.move(q[0]+900,q[1]-400); await p.mouse.up(); await new Promise(x=>setTimeout(x,400));
 }
 await p.click('.chip'); await new Promise(x=>setTimeout(x,320)); await p.screenshot({path:`../shots/final35_copy_${w}x${h}.png`});
 const ok=await p.evaluate(()=>!!document.querySelector('.chip-ic svg path[d^="M4 12.5"]')); await new Promise(x=>setTimeout(x,1700));
 const back=await p.evaluate(()=>!!document.querySelector('.chip-ic rect')&&!document.querySelector('.chip-ic path[d^="M4 12.5"]'));
 console.log('  copy check shown',ok,'reverted',back,'url',p.url().slice(-20));
 // play + return
 await p.click('.play'); await new Promise(x=>setTimeout(x,6000)); await p.keyboard.press('Escape'); await new Promise(x=>setTimeout(x,1500));
 const home=await p.evaluate(()=>({playing:!!document.querySelector('.world.playing'),lightsOpacity:getComputedStyle(document.querySelector('.lights')||document.body).opacity,play:Math.round(document.querySelector('.play').getBoundingClientRect().width)}));
 await p.screenshot({path:`../shots/final35_returned_${w}x${h}.png`});
 console.log('  return',JSON.stringify(home),errs.length?errs.join(' | '):'no console errors'); await p.close();}
await b.close();})();
