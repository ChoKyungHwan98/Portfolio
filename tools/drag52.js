/* 진짜 스크롤바 끌기 시험: 스크롤바 숨김 끔(--hide-scrollbars 빼고 띄움). 목록을 정확히 가운데까지 내려 두면 스크롤바 손잡이 가운데 = 칸 높이의 가운데(위아래 대칭) → 거기를 잡고 끌어 내림 */
const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const port=process.argv[2]||'8766',W=+(process.argv[3]||1280),H=+(process.argv[4]||600),ch=process.argv[5]||'game';
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();await p.setViewport({width:W,height:H});
await p.goto(`http://localhost:${port}/#/media?ch=${ch}`,{waitUntil:'networkidle0'});await sl(3200);
const sel=port==='8769'?'.mr-body':'.mw .mr-body';const get=()=>p.evaluate(s=>Math.round(document.querySelector(s).scrollTop),sel);
for(let k=0;k<6;k++){await p.evaluate(s=>{const e=document.querySelector(s);e.scrollTop=(e.scrollHeight-e.clientHeight)/2},sel);await sl(250);} // 안 그린 카드가 그려지며 높이가 바뀌므로 가운데로 몇 번 다시 맞춤
const g=await p.evaluate(s=>{const e=document.querySelector(s);e.scrollTop=(e.scrollHeight-e.clientHeight)/2;const r=e.getBoundingClientRect();return {x:r.right-4,y:r.top+e.clientHeight/2,mid:Math.round(e.scrollTop),bot:r.bottom,sbw:e.offsetWidth-e.clientWidth}},sel);await sl(150);
await p.mouse.move(g.x,g.y);await p.mouse.down();await sl(80);
const tops=[await get()];for(let k=1;k<=5;k++){await p.mouse.move(g.x,g.y+k*12);await sl(70);tops.push(await get());}
await p.mouse.up();await sl(120);const after=await get();
await p.mouse.click(g.x,g.bot-8);await sl(350);const tc=await get();
const okDrag=Math.abs(tops[0]-g.mid)<=g.mid*0.03&&tops.every((v,i)=>!i||v>=tops[i-1])&&tops[5]>tops[0]+500&&after>=tops[5];
console.log(port,W+'x'+H,ch,'scrollbar',g.sbw+'px','| hold at',g.mid,'→ press',tops[0],'→ drag',tops.slice(1).join(' → '),'| release',after,'| track click below →',tc,'|',okDrag&&tc>after?'PASS':'FAIL');await b.close();})();
