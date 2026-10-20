const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:600});
await p.goto('http://localhost:8766/#/resume',{waitUntil:'networkidle0'});await sl(1500);await p.evaluate(()=>document.getElementById('rs-x').closest('section').scrollIntoView({block:'start'}));await sl(400);
await p.screenshot({path:'/workspace/rhythm/shots/v54_resume_projects_1280x600.png'});await b.close();})();
