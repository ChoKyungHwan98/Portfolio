const puppeteer=require('puppeteer-core');
(async()=>{
 const [,,url,out,w,h,wait,script]=process.argv;
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required','--hide-scrollbars']});
 const p=await b.newPage(); const errs=[];
 p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.type()+': '+m.text())});
 p.on('pageerror',e=>errs.push('pageerror: '+e.message));
 await p.setViewport({width:+w,height:+h,deviceScaleFactor:1});
 await p.goto(url,{waitUntil:'networkidle0'});
 await new Promise(r=>setTimeout(r,+(wait||1500)));
 if(script){ const steps=JSON.parse(script); for(const s of steps){ if(s.eval) await p.evaluate(s.eval); if(s.key) await p.keyboard.press(s.key); if(s.click) await p.click(s.click); if(s.hover) await p.hover(s.hover); if(s.wait) await new Promise(r=>setTimeout(r,s.wait)); if(s.shot) await p.screenshot({path:s.shot}); } }
 else await p.screenshot({path:out});
 console.log(errs.length?errs.join('\n'):'no console errors');
 await b.close();
})();
