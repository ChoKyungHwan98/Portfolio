const puppeteer=require('puppeteer-core'); const fs=require('fs');
(async()=>{
 const [,,W,H,dur,prefix]=process.argv;
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage(); await p.setViewport({width:+W,height:+H}); const errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errs.push(m.text())});
 await p.goto('http://localhost:8766/index.html',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1500));
 const c=await p.target().createCDPSession(); const frames=[];
 c.on('Page.screencastFrame',f=>{frames.push({t:Date.now(),d:f.data}); c.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
 await c.send('Page.startScreencast',{format:'jpeg',quality:80,everyNthFrame:1});
 await new Promise(r=>setTimeout(r,150)); const tc=Date.now(); await p.click('.play');
 const at=[]; for(let i=0;i<+dur*4;i++){ await new Promise(r=>setTimeout(r,250)); at.push([Date.now()-tc, await p.evaluate(()=>document.querySelector('audio').currentTime)]); }
 await c.send('Page.keyboard'===0?0:'Page.stopScreencast'); 
 fs.mkdirSync('/tmp/'+prefix,{recursive:true});
 frames.filter(f=>f.t>=tc).forEach(f=>fs.writeFileSync(`/tmp/${prefix}/f_${String(f.t-tc).padStart(5,'0')}.jpg`,Buffer.from(f.d,'base64')));
 console.log('audio vs wall (ms, s):', at.filter((_,i)=>i%4==3).map(a=>a[0]+':'+a[1].toFixed(2)).join(' '));
 await p.keyboard.press('Escape'); await new Promise(r=>setTimeout(r,250)); await p.screenshot({path:`../shots/${prefix}_return_mid.png`}); await new Promise(r=>setTimeout(r,900)); await p.screenshot({path:`../shots/${prefix}_returned.png`});
 console.log('paused after esc', await p.evaluate(()=>document.querySelector('audio').paused), 'errors', errs);
 await b.close();
})();
