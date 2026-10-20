const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H,RM]=[+process.argv[2],+process.argv[3],process.argv[4]==='rm'];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setViewport({width:W,height:H});if(RM)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);let pass=0,fail=[];const ok=(c,n)=>{c?pass++:fail.push(n)};const tag=W+'x'+H+(RM?'_rm':'');
const exp={battle:'por nodoc',['pico-bang']:'por nodoc','ai-review':'nov nodoc',dorothia:'por','silent-mansion':'lan',digreed:'lan'};
for(const s of Object.keys(exp)){await p.goto('http://localhost:8766/#/portfolio/'+s,{waitUntil:'networkidle0'});await sl(1500);
 const r=await p.evaluate(()=>{const R=q=>{const e=document.querySelector(q);if(!e)return null;const b=e.getBoundingClientRect();return [b.x,b.y,b.width,b.height].map(Math.round)};const sc=document.querySelector('.sheet-scroll');
  return {cls:document.querySelector('.dm2').className,sh:sc.scrollHeight,ch:sc.clientHeight,head:R('.wd-top'),vid:R('.sv-face'),de:R('.de2'),bar:R('.wd-bar'),pv:/핵심 쪽부터/.test(document.body.textContent),hfsm:/#HFSM/.test(document.querySelector('.wd-head').textContent),imgs:[...document.querySelectorAll('.dm2 img')].every(i=>i.complete&&i.naturalWidth>0)}});
 ok(r.cls.endsWith(exp[s]),s+' layout '+r.cls);ok(r.sh<=r.ch,s+' no scroll '+r.sh+'/'+r.ch);ok(!r.pv,s+' no 핵심 link');ok(r.imgs,s+' imgs');
 if(s==='pico-bang')ok(!r.hfsm,'pico no HFSM');
 const gapTop=(r.vid||r.de)[1]-(r.head[1]+r.head[3]);ok(gapTop<=60,s+' header tight '+gapTop);
 const bot=Math.max(...[r.vid,r.de].filter(Boolean).map(x=>x[1]+x[3]));ok(r.bar[1]-bot>=4,s+' body above bar');
 if(r.vid&&r.de&&!exp[s].includes('nodoc')){}
 if(s==='dorothia')ok(Math.abs(r.vid[2]/r.vid[3]-9/16)<.02,'dorothia portrait frame');
 if(['silent-mansion','digreed'].includes(s))ok(Math.abs(r.vid[2]/r.vid[3]-16/9)<.03,s+' 16:9 frame');
 if(exp[s]==='por'||exp[s]==='lan'){await p.click('.de2-stack');await sl(900);const o=await p.evaluate(()=>!!document.querySelector('.ov .rd'));ok(o,s+' cover opens reader');await p.keyboard.press('Escape');await sl(600);}
 console.log(tag,s,JSON.stringify({...r,pv:undefined}));if(!RM)await p.screenshot({path:`/workspace/rhythm/shots/v55_detail_${s}_${tag}.png`});}
console.log(tag,'PASS',pass,'FAIL',fail.length,JSON.stringify(fail),JSON.stringify(errs));await b.close();})();
