const puppeteer=require('puppeteer-core');const sl=ms=>new Promise(r=>setTimeout(r,ms));
const [W,H,D,RM]=[+process.argv[2],+process.argv[3],+(process.argv[4]||1),process.argv[5]==='rm'];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'],ignoreDefaultArgs:['--hide-scrollbars']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.setViewport({width:W,height:H,deviceScaleFactor:D});if(RM)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
const tag=`${W}x${H}${D>1?'_150':''}${RM?'_rm':''}`,S='/workspace/rhythm/shots/v52_';let pass=0,fail=[];const ok=(c,n)=>{c?pass++:fail.push(n)};
const st=()=>p.evaluate(()=>{const m=document.querySelector('.mr');const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [b.x,b.y,b.width,b.height].map(Math.round)};
 return {hash:location.hash,cls:m&&m.className,win:!!document.querySelector('.mw:not([hidden])'),mwOp:document.querySelector('.mw')&&+getComputedStyle(document.querySelector('.mw')).opacity,act:document.activeElement?.className,actCh:document.activeElement?.dataset?.ch,
 game:r('.ro.game'),tv:r('.ro.anime'),tagG:r('.ro.game .ro-tag'),tagT:r('.ro.anime .ro-tag'),hint:r('.rm-hint'),home:r('.mr-homebtn'),items:document.querySelectorAll('.mw .mr-it').length,strip:document.querySelectorAll('.mw .mr-strip .mr-it').length,
 favs:[...document.querySelectorAll('.mw .mr-strip .tt')].map(e=>e.textContent).join('|'),secs:[...document.querySelectorAll('.mw .mr-sec[data-sec]')].map(e=>e.dataset.sec+':'+e.querySelector('small').textContent).join(','),rule:document.querySelector('.mr-rule')?.textContent,
 bad:/무라마사|muramasa/i.test(document.body.textContent),bar:!!document.querySelector('.mr-inputs,.mr-hint'),body:r('.mw .mr-body'),scr:r('.mw .mr-scr')}});
await p.goto('http://localhost:8766/',{waitUntil:'networkidle0'});await sl(2600);
await p.click('a.tile[href="#/media"]');
if(!RM){for(const t of [200,600,1000]){await sl(t===200?200:400);await p.screenshot({path:S+`walk${t}_${tag}.png`});}}
await sl(1300);let r=await st();console.log(tag,'arrive',JSON.stringify(r));
ok(r.hash==='#/media'&&!r.win&&r.cls.includes('room')&&!r.cls.includes('walk'),'arrive room');ok(r.actCh==='game','focus on game object');ok(!r.bar,'old bottom bar gone');ok(!r.bad,'no muramasa');
await p.mouse.move(5,5);await sl(300);await p.screenshot({path:S+`room_arrive_${tag}.png`});
const g=r.game;await p.mouse.move(g[0]+g[2]/2,g[1]+g[3]/2);await sl(500);await p.screenshot({path:S+`room_hover_game_${tag}.png`});
const t=r.tv;await p.mouse.move(t[0]+t[2]/2,t[1]+t[3]/2);await sl(500);await p.screenshot({path:S+`room_hover_tv_${tag}.png`});
await p.mouse.click(g[0]+g[2]/2,g[1]+g[3]/2);await sl(250);if(!RM)await p.screenshot({path:S+`win_pop_${tag}.png`});await sl(900);r=await st();console.log(tag,'win game',JSON.stringify({...r,game:0,tv:0}));
ok(r.win&&r.mwOp>0.99&&r.hash==='#/media?ch=game','window game opens');ok(r.items===361&&r.strip===8,'games 353+8 '+r.items);ok(r.favs==='osu!|역전재판 3|무기미도|DARK SOULS™ III|엘든 링|OMORI|메이플스토리|Danganronpa V3: Killing Harmony','fav order');
ok(r.secs==='PC:67,모바일:115,콘솔:171','plat sections '+r.secs);
await p.screenshot({path:S+`win_game_${tag}.png`});
// sort options
for(const [l,exp] of [['플레이 시간순','플레이 기록 있음:35,시간 기록 없음:318'],['클리어순','100% 완료:7,클리어:133,기록 없음:213'],['이름순','이름순:353']]){const bs=await p.$$('.mr-sort button');for(const x of bs){if((await x.evaluate(e=>e.textContent))===l){await x.click();}}await sl(500);r=await st();ok(r.secs===exp,'sort '+l+' '+r.secs);}
await p.screenshot({path:S+`win_game_sort_time_${tag}.png`});
await p.keyboard.press('2');await sl(900);r=await st();ok(r.hash==='#/media?ch=anime'&&r.items===406&&r.secs.startsWith('2026:3,2025:7'),'switch key 2 '+r.items+' '+r.secs.slice(0,40));await p.screenshot({path:S+`win_anime_${tag}.png`});
await p.keyboard.press('Escape');await sl(700);r=await st();ok(!r.win&&r.hash==='#/media'&&r.actCh==='anime','Esc closes window to room, focus TV '+r.actCh);
await p.keyboard.press('Enter');await sl(1100);r=await st();ok(r.win&&r.hash==='#/media?ch=anime','Enter on TV opens anime '+r.act+' '+r.hash+' '+r.mwOp);if(!r.win){console.log('FAILS',JSON.stringify(fail));await b.close();return;}
await p.click('.mw-x');await sl(700);r=await st();ok(!r.win,'방으로 button');
await p.keyboard.press('1');await sl(1100);r=await st();ok(r.win&&r.hash==='#/media?ch=game','key 1 opens game');
await p.mouse.click(8,H/2);await sl(700);r=await st();ok(!r.win,'click dim closes');
await p.keyboard.press('Escape');await sl(1100);r=await st();ok(r.hash===''&&!r.cls,'Esc room → home');const f=await p.evaluate(()=>document.activeElement?.textContent);ok(/게임/.test(f||''),'focus back to tile '+f);
// deep link
await p.goto('http://localhost:8766/#/media?ch=anime',{waitUntil:'networkidle0'});await sl(2600);r=await st();ok(r.win&&r.items===406,'deep link anime opens after arrival');
await p.goto('http://localhost:8766/#/games',{waitUntil:'networkidle0'});await sl(2600);r=await st();ok(r.win&&r.hash==='#/media?ch=game','legacy #/games');
console.log(tag,'PASS',pass,'FAIL',fail.length,JSON.stringify(fail),'errs',JSON.stringify(errs));await b.close();})();
