const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
 const p=await b.newPage(); await p.setViewport({width:1440,height:900});
 await p.goto('http://localhost:8766/'+(process.argv[2]||'#/portfolio'),{waitUntil:'networkidle0'}); await new Promise(r=>setTimeout(r,1500));
 console.log(await p.evaluate(()=>[...document.querySelectorAll('.contact,.rail-home,.menu')].map(e=>{const cs=getComputedStyle(e),r=e.getBoundingClientRect();return [e.className,cs.top,cs.bottom,cs.transform,cs.opacity,Math.round(r.top),Math.round(r.bottom),Math.round(r.left)].join(' | ')}).join('\n')));
 await b.close();
})();
