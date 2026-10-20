const puppeteer=require('puppeteer-core'); const fs=require('fs');
const B='https://chokyunghwan98.github.io/Portfolio/';
const pages=[['home',''],['portfolio','?view=portfolio'],['resume','?view=resume'],['cover','?view=cover-letter'],['games','?view=game-history'],['anime','?view=anime-history'],...[1,6,2,3,4,5].map(i=>['project'+i,`?view=portfolio&project=${i}`])];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--hide-scrollbars']});
fs.mkdirSync('/workspace/rhythm/oldsite/shots',{recursive:true}); const txt={};
for(const [n,q] of pages){const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('requestfailed',r=>errs.push('FAIL '+r.url().slice(-60))); p.on('response',r=>{if(r.status()>=400) errs.push(r.status()+' '+r.url().slice(-70))});
 await p.setViewport({width:1440,height:900}); const t0=Date.now();
 try{await p.goto(B+q,{waitUntil:'networkidle2',timeout:45000});}catch(e){errs.push('goto '+e.message)}
 await new Promise(r=>setTimeout(r,3500));
 await p.screenshot({path:`/workspace/rhythm/oldsite/shots/${n}.png`});
 const info=await p.evaluate(()=>({h:document.documentElement.scrollHeight,text:document.body.innerText.slice(0,4000),buttons:[...document.querySelectorAll('button,a')].map(e=>(e.innerText||e.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,80)}));
 txt[n]={...info,errs,loadMs:Date.now()-t0};
 if(info.h>1000) await p.screenshot({path:`/workspace/rhythm/oldsite/shots/${n}_full.png`,fullPage:true});
 console.log(n,'height',info.h,'errs',errs.length,errs.slice(0,4).join(' | ')); await p.close();}
fs.writeFileSync('/workspace/rhythm/oldsite/pages.json',JSON.stringify(txt,null,1)); await b.close();})();
