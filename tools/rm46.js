const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
await p.setViewport({width:1280,height:600});await p.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'});await sl(1500);const a=await p.evaluate(()=>window.__field.frames);
for(let k=0;k<30;k++){await p.mouse.move(400+k*20,300);await sl(16)} await p.mouse.down();await p.mouse.up();await sl(500);const c=await p.evaluate(()=>window.__field.frames);
await p.goto('http://localhost:8766/?bg=x#/portfolio');await sl(200);
// hidden tab: frames stop
const p2=await b.newPage();await p2.setViewport({width:1280,height:600});await p2.goto('http://localhost:8766/#/portfolio',{waitUntil:'networkidle0'});await sl(1200);
console.log(JSON.stringify({reducedMotionFramesOnInput:c-a}));await b.close()})()
