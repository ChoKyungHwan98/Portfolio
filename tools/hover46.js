// usage: node hover46.js W H tag [query]
const puppeteer=require('puppeteer-core');const [,,W,H,tag,q='']=process.argv;const S='/workspace/rhythm/shots/f46/';
const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.setViewport({width:+W,height:+H});await p.goto('http://localhost:8766/'+q+'#/portfolio',{waitUntil:'networkidle0'});await sl(1600);
const box=async s=>(await p.$(s)).boundingBox(); let i=0; const shot=async n=>p.screenshot({path:S+`${tag}_${String(i++).padStart(2,'0')}_${n}.png`});
await shot('idle');
const st0=await p.evaluate(()=>({...window.__field}));
await sl(500); const st1=await p.evaluate(()=>({...window.__field})); // idle: frames must not grow
const hb=await box('.wk-top li:nth-child(1) .wk-card');
await p.mouse.move(hb.x-60,hb.y+hb.height*0.5); await sl(250); await shot('near-hero-edge');
await p.mouse.move(hb.x+hb.width*0.4,hb.y+hb.height*0.4,{steps:6}); await sl(120); await shot('hover-hero-120ms'); await sl(400); await shot('hover-hero-520ms');
const sb=await box('.wk-top li:nth-child(3) .wk-card'); await p.mouse.move(sb.x+sb.width/2,sb.y+sb.height/2,{steps:8}); await sl(140); await shot('hover-ai-140ms'); await sl(450); await shot('hover-ai-590ms');
await p.mouse.move(sb.x+sb.width+30,sb.y-14,{steps:4}); await sl(80); await p.mouse.down(); await p.mouse.up(); await sl(140); await shot('click-ripple-140ms'); await sl(220); await shot('click-ripple-360ms');
await sl(900); await shot('settled');
// keyboard focus
await p.mouse.move(5,5); await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await sl(500); await shot('focus-tab');
// perf: sweep
await p.evaluate(()=>{const f=window.__field;f.frames=0;f.ms=0;f.max=0});
const sc=await box('.sheet-scroll'); const t0=Date.now();
for(let k=0;k<90;k++){ await p.mouse.move(sc.x+40+(sc.width-80)*(k/90), sc.y+sc.height*(0.3+0.4*Math.sin(k/9))); if(k%30===10){await p.mouse.down();await p.mouse.up();} await sl(16);} await sl(900);
const perf=await p.evaluate(()=>({...window.__field}));
const idleA=await p.evaluate(()=>window.__field.frames); await sl(600); const idleB=await p.evaluate(()=>window.__field.frames);
console.log(JSON.stringify({tag,variant:perf.variant,idleFramesWhileStill:[st1.frames-st0.frames, idleB-idleA],sweepFrames:perf.frames,avgMs:+(perf.ms/perf.frames).toFixed(3),maxMs:+perf.max.toFixed(2),errs}));
await b.close();})()
