const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1280,height:600});
const got=[];p.on('requestfinished',r=>{if(/\/media\//.test(r.url()))got.push([Date.now(),r.url().split('/').slice(-2).join('/')])});const t0=Date.now();
await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'});await sl(5000);console.log('preloaded after home:',got.length,'first at',got[0]&&got[0][0]-t0,'ms');
const n=got.length;await p.evaluate(()=>{location.hash='#/media?ch=game'});await sl(2500);console.log('new requests on entering room:',got.length-n);await b.close();})();
