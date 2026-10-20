const puppeteer=require('puppeteer-core');
/* 캐릭터 구도 목업: 도형 블록아웃(머리 원·몸통·팔다리). 실제 앱 1440x900 홈 배치(면 꼭짓점 532/885, 메뉴 위치)를 그대로 따름 */
const Y='#FFD400', K='#111';
function fig({x,y,H,face='left',pose='idle',ghost=false}){ // x,y = 두 발 가운데 바닥점
  const hr=H*0.13, headCy=y-H+hr, torsoTop=headCy+hr*1.05, torsoH=H*0.34, torsoW=H*0.24, hip=torsoTop+torsoH, legH=y-hip;
  const d=face==='left'?-1:face==='right'?1:0; const lw=H*0.075, aw=H*0.065;
  const st=ghost?`fill="none" stroke="${K}" stroke-width="3" stroke-dasharray="8 6"`:`fill="${K}"`;
  let s='';
  // 다리
  const legX=[x-torsoW*0.22,x+torsoW*0.22];
  if(pose==='lean'){ s+=`<rect x="${legX[0]-lw/2}" y="${hip}" width="${lw}" height="${legH}" rx="${lw/2}" ${st}/>`; s+=`<rect x="${legX[1]-lw/2}" y="${hip}" width="${lw}" height="${legH}" rx="${lw/2}" ${st} transform="rotate(-22 ${legX[1]} ${hip})"/>`; }
  else legX.forEach(lx=>s+=`<rect x="${lx-lw/2}" y="${hip}" width="${lw}" height="${legH}" rx="${lw/2}" ${st}/>`);
  // 신발
  legX.forEach((lx,i)=>{ if(pose==='lean'&&i===1) return; s+=`<ellipse cx="${lx+d*lw*0.4}" cy="${y-lw*0.25}" rx="${lw*0.85}" ry="${lw*0.45}" ${st}/>`; });
  // 몸통
  s+=`<rect x="${x-torsoW/2}" y="${torsoTop}" width="${torsoW}" height="${torsoH}" rx="${torsoW*0.32}" ${st}/>`;
  // 팔
  const sh=[x-torsoW/2+aw*0.3,x+torsoW/2-aw*0.3], armL=H*0.33;
  const arm=(sx,ang)=>`<rect x="${sx-aw/2}" y="${torsoTop+aw*0.3}" width="${aw}" height="${armL}" rx="${aw/2}" ${st} transform="rotate(${ang} ${sx} ${torsoTop+aw*0.6})"/>`;
  const front = d<0 ? 0 : 1; // 보는 쪽 팔
  if(pose==='point'){ s+=arm(sh[1-front],d<0?-8:8); s+=arm(sh[front],d<0?118:-118); }
  else if(pose==='wave'){ s+=arm(sh[0],12); s+=arm(sh[1],-155); }
  else if(pose==='clap'){ s+=arm(sh[0],-38); s+=arm(sh[1],38); }
  else if(pose==='lean'){ s+=arm(sh[0],30); s+=arm(sh[1],-10); }
  else { s+=arm(sh[0],10); s+=arm(sh[1],-10); }
  // 머리 + 얼굴
  s+=`<circle cx="${x}" cy="${headCy}" r="${hr}" fill="#fff" stroke="${K}" stroke-width="${Math.max(3,H*0.012)}" ${ghost?'stroke-dasharray="8 6"':''}/>`;
  const ex=x+d*hr*0.38, ey=headCy-hr*0.05, eg=hr*0.32;
  [ -1, 1 ].forEach(k=>s+=`<rect x="${ex+k*eg-hr*0.06}" y="${ey-hr*0.2}" width="${hr*0.12}" height="${hr*0.4}" rx="${hr*0.06}" fill="${K}"/>`);
  return s;
}
const eyeLine=(y,x1,x2,label)=>`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${Y}" stroke-width="3" stroke-dasharray="10 8"/><text x="${x2-16}" y="${y-10}" text-anchor="end" font-size="20" font-weight="800" fill="#111" stroke="#fff" stroke-width="5" paint-order="stroke">${label}</text>`;
const floorLine=(y)=>`<line x1="560" y1="${y}" x2="1440" y2="${y}" stroke="#111" stroke-width="2" stroke-dasharray="4 6"/><text x="1430" y="${y+24}" text-anchor="end" font-size="18" font-weight="800" fill="#555">바닥선 y=${y}</text>`;
function home(o){
  return `<svg viewBox="0 0 1440 900" width="864" height="540" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="ck" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#f7f7f7"/><rect width="40" height="40" fill="#ececec"/><rect x="40" y="40" width="40" height="40" fill="#ececec"/></pattern></defs>
  <rect width="1440" height="900" fill="url(#ck)"/>
  <polygon points="0,0 532,0 885,900 0,900" fill="#2c2c2c" transform="translate(10,0)"/>
  <polygon points="0,0 532,0 885,900 0,900" fill="#151515"/>
  <text x="40" y="52" font-size="26" font-weight="900" fill="#fff">조경환</text>
  <g transform="rotate(-3 250 210)"><rect x="40" y="140" width="430" height="140" rx="28" fill="#fff" stroke="#111" stroke-width="6"/><text x="80" y="236" font-size="70" font-weight="900" fill="#111">포트폴리오</text></g>
  <text x="85" y="390" font-size="70" font-weight="900" fill="#fff">이력서</text>
  <text x="85" y="535" font-size="70" font-weight="900" fill="#fff">자기소개서</text>
  <rect x="42" y="690" width="160" height="100" rx="14" fill="#222"/><rect x="216" y="690" width="160" height="100" rx="14" fill="#222"/>
  <g transform="rotate(-2 520 740)"><rect x="395" y="690" width="255" height="100" rx="18" fill="#fff"/></g>
  ${o.extra||''}
  ${o.ring?`<ellipse cx="${o.x}" cy="${o.y}" rx="${o.H*0.42}" ry="${o.H*0.09}" fill="none" stroke="#111" stroke-width="6"/><ellipse cx="${o.x}" cy="${o.y}" rx="${o.H*0.42-8}" ry="${o.H*0.09-6}" fill="none" stroke="${Y}" stroke-width="8"/>`:''}
  <ellipse cx="${o.x}" cy="${o.y}" rx="${o.H*0.3}" ry="${o.H*0.05}" fill="#d9d9d9"/>
  ${o.clip?`<clipPath id="cl"><rect width="1440" height="900"/></clipPath>`:''}
  <g transform="rotate(${o.tilt||0} ${o.x} ${o.y})">${fig(o)}</g>
  ${o.ghostCur?fig({x:1110,y:727,H:270,face:'front',ghost:true})+`<text x="1110" y="770" text-anchor="middle" font-size="16" font-weight="800" fill="#777">지금 캐릭터 크기</text>`:''}
  ${eyeLine(o.eye,560,1440,'눈높이')}
  ${floorLine(o.y)}
  </svg>`;
}
function play(o){
  const p=o.play;
  return `<svg viewBox="0 0 1440 900" width="864" height="540" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="sp" cx="50%" cy="100%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient></defs>
  <rect width="1440" height="900" fill="#0b0b0b"/>
  <polygon points="${p.x-60},0 ${p.x+60},0 ${p.x+p.H*0.75},${p.y} ${p.x-p.H*0.75},${p.y}" fill="url(#cone)"/>
  <ellipse cx="${p.x}" cy="${p.y}" rx="${p.H*0.75}" ry="${p.H*0.14}" fill="#e9e9e9"/>
  <ellipse cx="${p.x}" cy="${p.y}" rx="${p.H*0.3}" ry="${p.H*0.05}" fill="#bdbdbd"/>
  ${fig({...p,face:p.face||'front'})}
  <rect x="${p.cardX||820}" y="200" width="${p.cardW||520}" height="420" rx="24" fill="none" stroke="#555" stroke-width="3" stroke-dasharray="12 10"/>
  <text x="${(p.cardX||820)+(p.cardW||520)/2}" y="590" text-anchor="middle" font-size="22" font-weight="800" fill="#777">튜토리얼 / 판정 UI 자리</text>
  ${eyeLine(p.y-p.H+p.H*0.13, 0, 1440, '눈높이')}
  </svg>`;
}
const OPTS=[
 {id:'A',title:'A · 메뉴를 바라보는 3/4 (추천)',x:1120,y:770,H:400,face:'left',pose:'point',ring:true,eye:418,ghostCur:false,
  play:{x:300,y:760,H:400,face:'right',pose:'clap',cardX:760,cardW:600},
  notes:['키 400px@900 (화면 높이의 44%, 지금 캐릭터 270px 의 1.5배). 머리 지름 ≈ 메뉴 띠 높이의 0.75',
   '발 = 바닥선 y≈770 (플레이 버튼 아래 끝보다 조금 아래) · 면 아래 꼭짓점과 280px 떨어져 서서 면과 안 겹침',
   '왼쪽(메뉴)을 보고 한 손으로 가리킴 → 눈높이(y≈418)가 \'포트폴리오\'와 \'이력서\' 사이 → 채용 담당자 시선이 메뉴로 감',
   '플레이: 같은 크기로 왼쪽 조명 밑으로 걸어가 정면→오른쪽(판정 UI 쪽)으로 돌아섬. 지금 연출(dx 이동)과 그대로 맞음']},
 {id:'B',title:'B · 크게 잘린 앞모습 (히어로 컷)',x:1180,y:1010,H:900,face:'front',pose:'wave',ring:false,eye:229,
  play:{x:720,y:780,H:330,face:'front',pose:'clap',cardX:1000,cardW:380},
  notes:['키 900px(허벅지에서 잘림). 오른쪽 1/3 을 꽉 채움 → 첫인상 강함, \'캐릭터가 주인공\'인 사이트',
   '정면 응시 + 손 흔들기. 눈높이가 이름/메뉴 첫 줄보다 위(y≈229) → 시선이 캐릭터에 머묾, 메뉴로 덜 감',
   '단점: 그림 실력이 그대로 드러남(최종 그림 부담 큼), 1280/모바일에서 메뉴와 부딪힘',
   '플레이: 줌 아웃해 무대 가운데 작은 전신 → 크기 변화가 커서 전환 연출이 따로 필요']},
 {id:'C',title:'C · 작은 무대 위 전신 (게임 무대)',x:1140,y:700,H:280,face:'front',pose:'idle',ring:true,eye:470,
  extra:'<ellipse cx="1140" cy="712" rx="230" ry="46" fill="#111"/><ellipse cx="1140" cy="700" rx="230" ry="46" fill="#fff" stroke="#111" stroke-width="6"/>',
  play:{x:300,y:760,H:280,face:'front',pose:'clap',cardX:700,cardW:660},
  notes:['키 280px (지금과 비슷). 둥근 단상 위에 서서 \'미니게임 대기 화면\'처럼 보임 · 여백이 많아 장식(햇살·도형)이 살아남',
   '정면, 박에 맞춰 까딱. 눈높이 y≈470 은 \'자기소개서\' 줄 → 메뉴와 느슨하게만 연결',
   '장점: 그림 부담 작음, 모든 화면 크기에서 안전. 단점: 화면 오른쪽이 비어 보일 수 있고 캐릭터 존재감 약함',
   '플레이: 같은 크기·같은 자세로 조명 밑으로 → 가장 자연스러움']},
 {id:'D',title:'D · 면 가장자리에 기대기',x:830,y:800,H:520,tilt:-10,face:'right',pose:'lean',ring:false,eye:345,
  play:{x:300,y:760,H:420,face:'right',pose:'idle',cardX:760,cardW:600},
  notes:['키 520px. 등을 검은 면의 사선 가장자리에 기대고 오른쪽(바깥)을 봄 → 면과 캐릭터가 한 장면으로 묶임',
   '눈높이 y≈345 (\'이력서\' 위) · 하지만 메뉴를 등지고 있어 시선이 메뉴 반대로 감',
   '단점: 포트폴리오 전환 때 면이 줄어들면 기댈 곳이 사라짐 → 넘어지거나 비켜서는 연출이 따로 필요. 1280 에서 면 모양이 달라 위치 조정 필요',
   '검은 몸이 검은 면 위에 겹쳐 묻힘 → 흰 외곽선이나 밝은 옷이 꼭 필요',
   '플레이: 면이 밀려나며 몸을 일으켜 조명 밑으로 걸어감 (재미있지만 구현 비용 큼)']},
];
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const p=await b.newPage(); await p.setViewport({width:1780,height:860});
for(const o of OPTS){
 const html=`<html><body style="margin:0;background:#e9e9e9;font-family:'Gothic A1';color:#111">
 <div style="padding:22px 26px"><div style="font-size:30px;font-weight:900;margin-bottom:12px">${o.title}<span style="font-size:15px;font-weight:700;color:#666;margin-left:14px">도형 블록아웃 · 1440×900 홈 기준 · 최종 그림 아님</span></div>
 <div style="display:flex;gap:20px"><div><div style="font-weight:800;margin-bottom:6px">홈</div><div style="border:4px solid #111;box-shadow:8px 8px 0 #111;line-height:0">${home(o)}</div></div>
 <div><div style="font-weight:800;margin-bottom:6px">플레이 / 스포트라이트</div><div style="border:4px solid #111;box-shadow:8px 8px 0 #111;line-height:0">${play(o)}</div></div></div>
 <ul style="margin:18px 0 0;padding-left:22px;font-size:17px;font-weight:700;line-height:1.6">${o.notes.map(n=>`<li>${n}</li>`).join('')}</ul></div></body></html>`;
 require('fs').writeFileSync(`/workspace/rhythm/charcomp/${o.id}.html`,html);
 await p.setContent(html,{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready);
 const h=await p.evaluate(()=>document.body.scrollHeight); await p.setViewport({width:1780,height:h});
 await p.screenshot({path:`/workspace/rhythm/shots/char_comp_${o.id}.png`});
}
await b.close(); console.log('ok');})();
