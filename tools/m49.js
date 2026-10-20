const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const F=w=>+(22*w/1191).toFixed(1), G=w=>+(43*w/1080).toFixed(1);
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars','--autoplay-policy=document-user-activation-required']});const p=await b.newPage();
for(const [w,h] of [[1280,600],[1366,657],[1920,969]]){await p.setViewport({width:w,height:h});const T=`${w}x${h}`;
 // before
 await p.goto('http://localhost:8768/#/portfolio/battle',{waitUntil:'networkidle0'});await sl(1100);
 const bv=await p.evaluate(()=>Math.round(document.querySelector('.sv-face').getBoundingClientRect().width));
 await p.goto('http://localhost:8768/#/portfolio/dorothia',{waitUntil:'networkidle0'});await sl(1100);
 const bd=await p.evaluate(()=>{const pn=document.querySelector('.dv-pane'),im=document.querySelector('.dv-page').getBoundingClientRect();return {pw:Math.round(im.width),win:[pn.clientWidth,pn.clientHeight],frac:+(pn.clientHeight/im.height).toFixed(2)}});
 // after
 await p.goto('http://localhost:8766/#/portfolio/battle',{waitUntil:'networkidle0'});await sl(1100);
 const av=await p.evaluate(()=>{const r=document.querySelector('.sv-face').getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]});
 await p.screenshot({path:`/workspace/rhythm/shots/final49_d_battle_${T}.png`});
 await p.click('.sv-face');await sl(4500);
 const th=await p.evaluate(()=>{const r=document.querySelector('.th-player').getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]});
 await p.screenshot({path:`/workspace/rhythm/shots/final49_theater_${T}.png`});await p.keyboard.press('Escape');await sl(400);
 await p.goto('http://localhost:8766/#/portfolio/dorothia',{waitUntil:'networkidle0'});await sl(1100);
 const ap=await p.evaluate(()=>{const ps=[...document.querySelectorAll('.dp-page')];return {n:ps.length,pw:Math.round(ps[0].getBoundingClientRect().width)}});
 await p.screenshot({path:`/workspace/rhythm/shots/final49_d_dorothia_${T}.png`});
 await p.click('.dp-read');await sl(900);await p.click('.rd-t[data-t="4"]');await sl(900);
 const rd=await p.evaluate(()=>{const pn=document.querySelector('.rd-pane'),pg=document.querySelector('.rd-pg[data-i="4"]').getBoundingClientRect();return {pw:Math.round(pg.width),win:[pn.clientWidth,pn.clientHeight],frac:+(pn.clientHeight/pg.height).toFixed(2),n:document.querySelector('.rd .dv-n').textContent}});
 await p.screenshot({path:`/workspace/rhythm/shots/final49_reader_${T}.png`});
 console.log(T,JSON.stringify({before:{video:bv,subGlyph:G(bv),doc:bd,bodyFont:F(bd.pw)},after:{inlineVideo:av,theater:th,subGlyph:G(th[0]),preview:ap,reader:rd,bodyFont:F(rd.pw)}}));
}
await b.close()})()
