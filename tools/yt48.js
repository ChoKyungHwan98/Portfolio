const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H]=[+process.argv[2]||1366,+process.argv[3]||657];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars','--autoplay-policy=document-user-activation-required']});const p=await b.newPage();await p.setViewport({width:W,height:H});
const reqs=[];p.on('request',r=>{const u=r.url();if(/youtube|ytimg|googlevideo/.test(u))reqs.push(u)});let pass=0,fail=[];const ok=(c,n)=>{c?pass++:fail.push(n)};
for(const s of ['battle','pico-bang']){reqs.length=0;await p.goto('http://localhost:8766/#/portfolio/'+s,{waitUntil:'networkidle0'});await sl(1200);
 const pre=await p.evaluate(()=>{const i=document.querySelector('.sv-face img');const f=document.querySelector('.sv-face').getBoundingClientRect();return {iframes:document.querySelectorAll('iframe').length,poster:i.complete&&i.naturalWidth,ratio:+(f.width/f.height).toFixed(3),fit:document.querySelector('.dv-pane').className}});
 ok(pre.iframes===0&&reqs.length===0,'no iframe/yt req before click '+s+' '+reqs.length);ok(pre.poster>0,'poster '+s);ok(Math.abs(pre.ratio-0.5625)<0.01,'9:16 '+pre.ratio);
 await p.screenshot({path:`/workspace/rhythm/shots/final48_yt_${s}_before_${W}x${H}.png`});
 await p.click('.sv-face');await sl(6000);
 const post=await p.evaluate(()=>{const f=document.querySelector('iframe.sv-frame');const r=f.getBoundingClientRect();return {src:f.src,ratio:+(r.width/r.height).toFixed(3),act:document.activeElement?.tagName}});
 const fr=p.frames().find(f=>f.url().includes('youtube-nocookie.com/embed'));let inner=null;if(fr){try{inner=await fr.evaluate(()=>({err:!!document.querySelector('.ytp-error'),errTxt:document.querySelector('.ytp-error-content-wrap-reason')?.textContent||'',title:document.querySelector('.ytp-title-link')?.textContent||document.title,state:document.querySelector('#movie_player')?.className.match(/(playing|paused|unstarted|buffering|ended)-mode/)?.[1],dur:document.querySelector('video')?.duration}))}catch(e){inner='x '+e.message}}
 console.log(s,JSON.stringify(pre),JSON.stringify(post),JSON.stringify(inner),'ytreqs',reqs.length);
 ok(post.src.startsWith('https://www.youtube-nocookie.com/embed/')&&post.src.includes('autoplay=1'),'iframe src '+s);ok(inner&&!inner.err,'yt loads '+s+' '+JSON.stringify(inner));
 await p.screenshot({path:`/workspace/rhythm/shots/final48_yt_${s}_after_${W}x${H}.png`});}
// dorothia width-fit
await p.goto('http://localhost:8766/#/portfolio/dorothia',{waitUntil:'networkidle0'});await sl(1200);
const d=await p.evaluate(()=>{const pn=document.querySelector('.dv-pane');const im=document.querySelector('.dv-page');return {cls:pn.className,imgW:Math.round(im.getBoundingClientRect().width),paneW:pn.clientWidth,scroll:pn.scrollHeight-pn.clientHeight}});ok(d.cls.includes('width')&&d.scroll>0,'width fit '+JSON.stringify(d));console.log('doro',JSON.stringify(d));
await p.evaluate(()=>document.querySelector('.dv-pane').scrollTop=330);await sl(300);await p.screenshot({path:`/workspace/rhythm/shots/final48_doro_width_${W}x${H}.png`});
await p.evaluate(()=>{document.querySelector('.dv-pane').scrollTop=0});await p.click('.dv-btn:not([disabled])');await sl(400);await p.screenshot({path:`/workspace/rhythm/shots/final48_doro_p2_${W}x${H}.png`});
await p.click('.dv-fit');await sl(300);const d2=await p.evaluate(()=>document.querySelector('.dv-pane').className);ok(d2.includes('page'),'toggle page');await p.screenshot({path:`/workspace/rhythm/shots/final48_doro_page_${W}x${H}.png`});
console.log('PASS',pass,'FAIL',fail.length,fail.join('\n'));await b.close()})()
