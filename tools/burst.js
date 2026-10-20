const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage(); await p.setViewport({width:1440,height:900});
 await p.goto('http://localhost:8765/index.html',{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1300));
 const c=await p.target().createCDPSession(); const frames=[]; const t0=Date.now();
 c.on('Page.screencastFrame',async f=>{frames.push({t:Date.now()-t0,d:f.data}); c.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
 await c.send('Page.startScreencast',{format:'png',everyNthFrame:1,maxWidth:1440,maxHeight:900});
 await new Promise(r=>setTimeout(r,200)); const tc=Date.now()-t0; await p.click('#play');
 await new Promise(r=>setTimeout(r,1200)); await c.send('Page.stopScreencast');
 const fs=require('fs'); const pick=frames.filter(f=>f.t>tc);
 pick.forEach((f,i)=>fs.writeFileSync(`/tmp/burst_${String(i).padStart(2,'0')}_${f.t-tc}.png`,Buffer.from(f.d,'base64')));
 console.log(pick.map(f=>f.t-tc).join(' ')); await b.close();
})();
