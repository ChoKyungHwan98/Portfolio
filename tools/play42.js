const puppeteer=require('puppeteer-core');
(async()=>{const [,,W,H,out,act]=process.argv;
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars','--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.setViewport({width:+W,height:+H});
await p.goto('http://localhost:8766/index.html?still',{waitUntil:'load'}); await new Promise(r=>setTimeout(r,1200));
const c=await p.target().createCDPSession(); const frames=[];
c.on('Page.screencastFrame',async f=>{frames.push({t:f.metadata.timestamp,d:f.data}); await c.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
await c.send('Page.startScreencast',{format:'png'}); await new Promise(r=>setTimeout(r,150));
const t0=Date.now()/1000;
if(act==='play') await p.click('.play'); else if(act==='screen') await p.click('.scr-frame'); else if(act==='keys'){ await p.mouse.move(5,5); await p.keyboard.press('ArrowDown'); }
await new Promise(r=>setTimeout(r,1400)); await c.send('Page.stopScreencast');
const fs=require('fs'); fs.mkdirSync(out,{recursive:true});
const want=(process.env.W||"0,0.1,0.2,0.3,0.45,0.6,0.8,1.2").split(",").map(Number);
want.forEach((w,i)=>{let best=frames[0];for(const f of frames) if(Math.abs(f.t-t0-w)<Math.abs(best.t-t0-w)) best=f; fs.writeFileSync(`${out}/f${i}_${(best.t-t0).toFixed(2)}.png`,Buffer.from(best.d,'base64'));});
console.log(frames.length,'frames',await p.evaluate(()=>location.hash), errs.length?errs:'no errors'); await b.close();})();
