/* v10 아침 가게 (Claude) — 중간 만화 뒤: 가게 문 CLOSED → OPEN 팻말 → 문 열고 들어감 → 밝게 번쩍 → 카운터.
   손님이 줄지어 와서 쟁반 왼쪽(Space) · 오른쪽(→)에 빵을 탁탁 놓으면, 같은 박자로 내가 포장한다(티키타카).
   그록 v8 빌드의 가게 장면 자리에 붙는다: window.__bkShop(그릴 곳) → 정리 함수. 매 프레임 값은 window.__bkShopFrame = { t, chart, hit }
   손님 박자(차트)는 사용자가 짠다: localStorage 'morning-chart' (morning-editor.html 에서 저장) → 없으면 기본 차트
   좌표: 1920×1080, slice (그록 밤 장면과 같은 기준) */
(function () {
  /* ---------- 차트: 손님마다 { g: 시작 칸(16분, 14.07초 = 0), len: 손님 박자 길이(칸), resp: 내 차례 시작까지(칸), pat: 'L..R....' } ---------- */
  const O1 = [[[0, 'L'], [8, 'R']], [[0, 'L'], [4, 'R'], [8, 'L'], [12, 'R']], [[0, 'L'], [4, 'R'], [6, 'L'], [12, 'R']], [[0, 'L'], [4, 'R'], [6, 'L'], [10, 'L'], [12, 'R']]];
  const O2 = [[[0, 'L'], [4, 'R']], [[0, 'L'], [2, 'R'], [4, 'L']], [[0, 'L'], [4, 'R']], [[0, 'L'], [3, 'L'], [4, 'R'], [6, 'L']],
    [[0, 'L'], [2, 'R'], [4, 'L']], [[0, 'R'], [2, 'L'], [4, 'R'], [6, 'L']], [[0, 'L'], [3, 'L'], [4, 'R'], [6, 'L']], [[0, 'R'], [2, 'L'], [4, 'R'], [6, 'L']]];
  const toPat = (list, n) => { const a = [...'.'.repeat(n)]; list.forEach(([s, l]) => { a[s] = l; }); return a.join(''); };
  const DEFAULT = { v: 1, note: '기본(그록 v8과 같음)', orders: [
    ...O1.map((p, k) => ({ g: (25 + k * 2) * 16, len: 16, resp: 16, pat: toPat(p, 16) })),
    ...O2.map((p, k) => ({ g: (33 + k) * 16, len: 8, resp: 8, pat: toPat(p, 8) })),
  ] };
  window.__bkMorningDefault = DEFAULT;
  window.__bkMorningSpec = () => {
    let spec = DEFAULT;
    try { const s = JSON.parse(localStorage.getItem('morning-chart') || 'null'); if (s && Array.isArray(s.orders) && s.orders.length) spec = s; } catch (e) {}
    return spec.orders.slice().sort((a, b) => a.g - b.g).map(o => ({ g: o.g, len: o.len, resp: o.resp ?? o.len,
      call: [...o.pat].map((c, k) => [k, c]).filter(([, c]) => c === 'L' || c === 'R') }));
  };

  const W = 1920, H = 1080, INK = '#111';
  const BREAD = { 식빵: '#F7E9CC', 바게트: '#F0C873', 단팥빵: '#DDA665' };
  const KINDS = ['식빵', '단팥빵', '바게트'];
  const ease = u => { u = Math.max(0, Math.min(1, u)); return u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2; };
  const easeIn = u => { u = Math.max(0, Math.min(1, u)); return u * u * u; };
  const lerp = (a, b, u) => a + (b - a) * Math.max(0, Math.min(1, u));
  const ARR = 1300, CS = 1.8, FEET = 1012, SLOT = { L: 800, R: 1010 }, TRAY_Y = 742, BAG = { x: 420, y: 742 }, BAKER = 610;

  /* 작은 빵 (쟁반 위) */
  const breadShape = (kind, s = 1) => kind === '식빵'
    ? `<g transform="scale(${s})"><path d="M-40 0 v-58 h-6 q0-40 46-40 q46 0 46 40 h-6 v58z" fill="${BREAD.식빵}"/><path d="M-40 -14 h80" fill="none" stroke="#c9b28a" stroke-width="5"/></g>`
    : kind === '바게트'
      ? `<g transform="scale(${s})"><rect x="-74" y="-34" width="148" height="34" rx="17" fill="${BREAD.바게트}"/><path d="M-44 -28 l14 20 M-6 -28 l14 20 M32 -28 l12 18" fill="none" stroke="#b07a2c" stroke-width="5"/></g>`
      : `<g transform="scale(${s})"><path d="M-50 0 q0-44 50-44 q50 0 50 44z" fill="${BREAD.단팥빵}"/><circle cx="0" cy="-28" r="8" fill="#6b2f2a"/></g>`;

  /* 손님 (사이트 캐릭터 말투: 동그란 흰 얼굴 + 점 눈, 머리 모양으로 구별) */
  function custSVG(i) {
    const hair = ['bowl', 'bun', 'cap', 'bob'][i % 4], coat = ['#3a3a3a', '#8a8a8a', '#cfcfcf', '#555'][i % 4], scarf = i % 2 === 0;
    const hairSVG = hair === 'bowl' ? '<path d="M-78 -150 Q-76 -232 0 -234 Q76 -232 78 -150 Q58 -178 30 -172 Q8 -194 -16 -176 Q-46 -184 -78 -150 Z" fill="#111"/>'
      : hair === 'bun' ? '<circle cx="0" cy="-246" r="26" fill="#111"/><path d="M-76 -156 Q-70 -228 0 -230 Q70 -228 76 -156 Q40 -190 0 -186 Q-40 -190 -76 -156 Z" fill="#111"/>'
        : hair === 'cap' ? '<path d="M-74 -168 Q-62 -236 4 -236 Q68 -234 76 -168 Z" fill="#FFD400"/><path d="M-74 -168 L-118 -164" stroke-width="12"/>'
          : '<path d="M-82 -120 Q-86 -236 0 -238 Q86 -236 82 -120 L60 -120 Q58 -176 0 -180 Q-58 -176 -60 -120 Z" fill="#111"/>';
    return `<g class="cbody">
  <ellipse cx="0" cy="8" rx="96" ry="16" fill="#000" opacity=".18" stroke="none" filter="url(#s10sh)"/>
  <path d="M-22 -40 L-26 0 M22 -40 L26 0" fill="none" stroke-width="16"/>
  <path d="M-70 -40 v-70 q0-56 70-56 q70 0 70 56 v70z" fill="${coat}"/>
  <path d="M-70 -40 v-70 q0-56 70-56 q70 0 70 56 v70z" fill="url(#s10topLit)" stroke="none"/>
  ${scarf ? '<path d="M-36 -160 q36 22 72 0 l-10 24 q-26 14 -52 0z" fill="#FFD400"/>' : ''}
  <circle cx="0" cy="-168" r="76" fill="#fff"/>
  <circle cx="0" cy="-168" r="76" fill="url(#s10topLit)" stroke="none"/>
  ${hairSVG}
  <g class="face" stroke="none"><circle cx="-34" cy="-160" r="9" fill="#111"/><circle cx="12" cy="-160" r="9" fill="#111"/></g>
  <path class="mouth" d="M-24 -130 q14 12 28 0" fill="none" stroke-width="6"/>
  <path class="arm" fill="none" stroke-width="22"/><path class="armi" fill="none" stroke="${coat}" stroke-width="10"/>
  <circle class="hand" r="20" fill="#fff"/>
</g>`;
  }

  function scene() {
    return `
<defs>
 <pattern id="s10wall" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="#ededed"/><rect width="32" height="64" fill="#e4e4e4"/></pattern>
 <linearGradient id="s10wallShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
 <linearGradient id="s10sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf0"/><stop offset="1" stop-color="#f2f2f2"/></linearGradient>
 <linearGradient id="s10sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6C8" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6C8" stop-opacity="0"/></linearGradient>
 <linearGradient id="s10topLit" x1="0" y1="0" x2="0" y2="1"><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>
 <linearGradient id="s10counterTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e2e2"/></linearGradient>
 <linearGradient id="s10front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a3a"/><stop offset="1" stop-color="#1f1f1f"/></linearGradient>
 <linearGradient id="s10glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity=".04"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity=".02"/></linearGradient>
 <linearGradient id="s10floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bdbdbd"/><stop offset="1" stop-color="#d8d8d8"/></linearGradient>
 <radialGradient id="s10warm"><stop offset="0" stop-color="#FFD400" stop-opacity=".9"/><stop offset="1" stop-color="#FFD400" stop-opacity="0"/></radialGradient>
 <radialGradient id="s10vig" cx=".5" cy=".5" r=".8"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>
 <filter id="s10sh" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
 <filter id="s10b20" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="20"/></filter>
</defs>
<g id="s10in" stroke="${INK}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
 <!-- 벽 -->
 <rect width="${W}" height="${H}" fill="url(#s10wall)" stroke="none"/><rect width="${W}" height="${H}" fill="url(#s10wallShade)" stroke="none"/>
 <!-- 큰 창 + 아침 햇빛 -->
 <rect x="1290" y="110" width="500" height="320" rx="20" fill="url(#s10sky)"/>
 <circle cx="1700" cy="190" r="40" fill="#FFD400"/>
 <g fill="#fff" stroke="#ddd" stroke-width="4"><path d="M1340 330 q20-34 56-20 q24-28 58 0 q30 2 26 26 z"/><path d="M1540 250 q14-24 40-14 q18-20 42 0 q22 2 18 18 z"/></g>
 <path d="M1540 110v320M1290 270h500" fill="none"/>
 <g style="mix-blend-mode:screen" stroke="none" filter="url(#s10b20)" opacity=".9">
  <polygon points="1300,120 1780,120 1450,1000 760,1000" fill="url(#s10sun)"/>
 </g>
 <!-- 빵 진열 선반 (제빵사 뒤) -->
 <g>
  <rect x="150" y="250" width="640" height="18" fill="#2e2e2e"/><rect x="150" y="420" width="640" height="18" fill="#2e2e2e"/>
  <g stroke-width="6">${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${220 + i * 120} 250)">${breadShape(KINDS[i % 3], 0.7)}</g>`).join('')}
  ${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${220 + i * 120} 420)">${breadShape(KINDS[(i + 1) % 3], 0.7)}</g>`).join('')}</g>
  <rect x="150" y="250" width="640" height="188" fill="#000" opacity=".06" stroke="none"/>
 </g>
 <!-- 종 + 시계 -->
 <g transform="translate(1030 150)"><path d="M0 -60 V-30" stroke-width="6"/><path d="M-30 30 Q-30 -30 0 -30 Q30 -30 30 30 Z" fill="#FFD400"/><circle cx="0" cy="38" r="9" fill="#111"/></g>
 <!-- 바닥 (손님 쪽) -->
 <rect x="-20" y="880" width="1960" height="220" fill="url(#s10floor)"/>
 <!-- 제빵사 (카운터 뒤, 정면) -->
 <g id="s10baker" transform="translate(${BAKER} 0)">
  <path d="M-140 900 v-240 q0-90 140-90 q140 0 140 90 v240z" fill="#fff"/>
  <path d="M-140 900 v-240 q0-90 140-90 q140 0 140 90 v240z" fill="url(#s10topLit)" stroke="none"/>
  <path d="M-50 575 l50 45 l50 -45 z" fill="#FFD400"/><path d="M0 620 l-14 40 l14 18 l14-18z" fill="#FFD400"/>
  <circle cx="0" cy="460" r="115" fill="#fff"/><circle cx="0" cy="460" r="115" fill="url(#s10topLit)" stroke="none"/>
  <path d="M-115 470 q-10-120 115-125 q125 5 115 125 q-40-60 -115-60 q-75 0 -115 60z" fill="#111"/>
  <g id="s10bEyes" stroke="none"><circle cx="-35" cy="492" r="11" fill="#111"/><circle cx="35" cy="492" r="11" fill="#111"/></g>
  <path id="s10bMouth" d="M-25 525 q25 22 50 0" fill="none" stroke-width="7"/>
  <path d="M-90 310 q-60-90 40-105 q50-70 100-20 q90-20 70 75 q-5 25 -20 50 z" fill="#fff"/><rect x="-95" y="310" width="190" height="45" rx="14" fill="#fff"/>
 </g>
 <!-- 카운터 윗면 -->
 <path d="M-20 760 H1190 L1216 800 H-20 Z" fill="url(#s10counterTop)"/>
 <!-- 종이봉투 -->
 <g id="s10bag" transform="translate(${BAG.x} ${BAG.y})">
  <ellipse cx="0" cy="40" rx="80" ry="12" fill="#000" opacity=".2" stroke="none" filter="url(#s10sh)"/>
  <path d="M-64 40 L-54 -90 H54 L64 40 Z" fill="#e9dcc2"/><path d="M-54 -90 l14 -18 h80 l14 18" fill="#d8c8a8"/>
  <path d="M-30 -60 q30 24 60 0" fill="none" stroke-width="6"/>
  <text id="s10bagN" x="0" y="10" text-anchor="middle" font-size="40" fill="#111" stroke="none" font-family="Black Han Sans,sans-serif"></text>
 </g>
 <!-- 쟁반 -->
 <g transform="translate(0 ${TRAY_Y})">
  <ellipse cx="905" cy="18" rx="280" ry="22" fill="#000" opacity=".18" stroke="none" filter="url(#s10sh)"/>
  <rect x="645" y="-18" width="520" height="36" rx="18" fill="#2a2a2a"/>
  <path d="M905 -14 v28" stroke="#555" stroke-width="5"/>
  <ellipse id="s10slotL" cx="${SLOT.L}" cy="-18" rx="90" ry="13" fill="#3a3a3a" stroke-width="5"/>
  <ellipse id="s10slotR" cx="${SLOT.R}" cy="-18" rx="90" ry="13" fill="#3a3a3a" stroke-width="5"/>
 </g>
 <g id="s10items"></g>
 <g id="s10fly"></g>
 <!-- 제빵사 팔 (고무호스, 팔 하나 = 곡선 하나) -->
 <path id="s10armL" fill="none" stroke-width="34"/><path id="s10armLi" fill="none" stroke="#fff" stroke-width="20"/>
 <path id="s10armR" fill="none" stroke-width="34"/><path id="s10armRi" fill="none" stroke="#fff" stroke-width="20"/>
 <ellipse id="s10handL" rx="50" ry="40" fill="#fff"/><ellipse id="s10handR" rx="50" ry="40" fill="#fff"/>
 <!-- 카운터 앞판 (진열장): 제빵사 아랫몸을 가려 깊이를 만든다 -->
 <rect x="-20" y="798" width="1240" height="300" fill="url(#s10front)"/>
 <rect x="40" y="830" width="1120" height="170" rx="16" fill="#151515" stroke-width="6"/>
 <g stroke-width="5">${[0, 1, 2, 3, 4, 5, 6].map(i => `<g transform="translate(${120 + i * 150} 980)">${breadShape(KINDS[i % 3], 0.8)}</g>`).join('')}</g>
 <rect x="40" y="830" width="1120" height="170" rx="16" fill="url(#s10glass)" stroke="none"/>
 <path d="M40 916 h1120" stroke="#333" stroke-width="5"/>
 <!-- 손님들 (카운터 오른쪽 끝 앞, 줄을 서서 온다) -->
 <g id="s10custs"></g>
 <!-- 말풍선 -->
 <g id="s10sayG" opacity="0"><path d="M${BAKER + 170} 330 l-60 50 l10 -50z" fill="#fff"/><rect x="${BAKER + 150}" y="240" width="420" height="100" rx="30" fill="#fff"/>
  <text id="s10say" x="${BAKER + 360}" y="305" text-anchor="middle" font-size="40" fill="#111" stroke="none" font-family="Black Han Sans,sans-serif"></text></g>
 <rect width="${W}" height="${H}" fill="url(#s10vig)" stroke="none"/>
</g>
<!-- 가게 문 (중간 만화 뒤, 들어가기 전) -->
<g id="s10out" stroke="${INK}" stroke-width="8" stroke-linejoin="round">
 <rect width="${W}" height="${H}" fill="#cfd3d6" stroke="none"/>
 <rect width="${W}" height="560" fill="url(#s10sky)" stroke="none"/>
 <rect x="-20" y="900" width="1960" height="200" fill="url(#s10floor)"/><path d="M-20 900 h1960" stroke-width="10"/><path d="M-20 960 h1960" stroke="#999" stroke-width="5"/><ellipse cx="960" cy="914" rx="600" ry="18" fill="#000" opacity=".25" stroke="none" filter="url(#s10sh)"/>
 <g id="s10facade">
  <rect x="420" y="170" width="1080" height="740" fill="#2e2e2e"/>
  <rect x="440" y="190" width="1040" height="90" fill="#FFD400"/>
  <text x="960" y="256" text-anchor="middle" font-size="64" fill="#111" stroke="none" font-family="Black Han Sans,sans-serif">불 켜진 빵집</text>
  <rect x="420" y="170" width="1080" height="740" fill="url(#s10wallShade)" stroke="none"/>
  <rect x="500" y="380" width="330" height="400" rx="12" fill="#1a1a1a"/>
  <g id="s10winL" stroke="none"><rect x="518" y="398" width="294" height="364" rx="8" fill="#FFF3B0"/><ellipse cx="665" cy="560" rx="200" ry="230" fill="url(#s10warm)"/></g>
  <path d="M665 398v364M518 580h294" stroke-width="6"/>
  <rect x="1090" y="380" width="330" height="400" rx="12" fill="#1a1a1a"/>
  <g id="s10winR" stroke="none"><rect x="1108" y="398" width="294" height="364" rx="8" fill="#FFF3B0"/><ellipse cx="1255" cy="560" rx="200" ry="230" fill="url(#s10warm)"/></g>
  <path d="M1255 398v364M1108 580h294" stroke-width="6"/>
  <g stroke-width="5">${[0, 1, 2].map(i => `<g transform="translate(${580 + i * 85} 750)">${breadShape(KINDS[i], 0.7)}</g>`).join('')}${[0, 1, 2].map(i => `<g transform="translate(${1170 + i * 85} 750)">${breadShape(KINDS[(i + 1) % 3], 0.7)}</g>`).join('')}</g>
  <!-- 차양 -->
  <path d="M400 300 H1520 L1560 360 H360 Z" fill="#fff"/>
  ${[...Array(12)].map((_, i) => `<path d="M${360 + i * 100} 360 h50 l-4 -60 h-46 z" fill="#FFD400" stroke="none"/>`).join('')}
  <path d="M360 360 ${[...Array(12)].map((_, i) => `q50 36 100 0`).join(' ')}" fill="#fff"/>
  <ellipse cx="960" cy="396" rx="560" ry="22" fill="#000" opacity=".25" stroke="none" filter="url(#s10sh)"/>
  <!-- 문 -->
  <rect x="842" y="420" width="236" height="492" fill="#1a1a1a"/><rect x="860" y="436" width="200" height="476" fill="#fff8e0"/>
  <g id="s10door"><rect x="860" y="436" width="200" height="476" fill="#4a4a4a"/><rect x="886" y="462" width="148" height="190" rx="10" fill="#FFF3B0"/><rect x="886" y="462" width="148" height="190" rx="10" fill="url(#s10glass)" stroke="none"/><circle cx="1034" cy="700" r="12" fill="#FFD400"/></g>
  <!-- 팻말 -->
  <g id="s10signG" transform="translate(960 600)"><path d="M-46 -44 L0 -96 L46 -44" fill="none" stroke-width="5"/>
   <g id="s10sign"><rect x="-120" y="-44" width="240" height="96" rx="14" fill="#111"/><text id="s10signT" x="0" y="20" text-anchor="middle" font-size="52" fill="#fff" stroke="none" font-family="Black Han Sans,sans-serif">CLOSED</text></g></g>
 </g>
</g>
<rect id="s10flash" width="${W}" height="${H}" fill="#fff" opacity="0"/>`;
  }

  window.__bkShop = function (host) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'; svg.innerHTML = scene(); host.appendChild(svg);
    const lab = document.createElement('div');
    lab.style.cssText = 'position:absolute;right:28px;top:22px;font-family:"Black Han Sans",sans-serif;font-size:22px;background:#111;color:#fff;border-radius:12px;padding:6px 14px;opacity:0;transition:opacity .3s';
    host.appendChild(lab);
    const E = id => svg.querySelector('#' + id);
    let built = '', raf;
    const custEls = [];
    const loop = () => {
      const F = window.__bkShopFrame; if (!F || !F.chart) { raf = requestAnimationFrame(loop); return; }
      const t = F.t, ch = F.chart, orders = ch.orders, pn = performance.now(), hit = F.hit || { L: -9e9, R: -9e9 };
      const T = { bright: 55.51, rest: 84.78, last: 86.5, end: 87.6 };
      const openN = ch.me.filter(n => n.part === 'open').sort((a, b) => a.t - b.t);
      const flipAt = openN[0] ? openN[0].t : 55.9, doorAt = openN[1] ? openN[1].t : 56.4;
      /* --- 1) 가게 문 → 들어가기 --- */
      const zoomU = easeIn((t - doorAt) / 0.42), inside = t > doorAt + 0.42;
      const flash = t < doorAt + 0.3 ? 0 : t < doorAt + 0.42 ? (t - doorAt - 0.3) / 0.12 : Math.max(0, 1 - (t - doorAt - 0.42) / 0.45);
      E('s10out').style.display = inside ? 'none' : ''; E('s10in').style.display = inside ? '' : 'none';
      if (!inside) {
        const s = 1 + zoomU * 2.6;
        E('s10out').setAttribute('transform', `translate(960 645) scale(${s}) translate(-960 -645)`);
        const fu = (t - flipAt) / 0.2, open = fu >= 0.5;
        E('s10sign').setAttribute('transform', `scale(${fu > 0 && fu < 1 ? Math.abs(Math.cos(Math.PI * fu)) : 1} 1)`);
        E('s10signT').textContent = open ? 'OPEN' : 'CLOSED';
        E('s10sign').querySelector('rect').setAttribute('fill', open ? '#FFD400' : '#111'); E('s10signT').setAttribute('fill', open ? '#111' : '#fff');
        const sway = open ? Math.sin((t - flipAt) * 12) * Math.exp(-(t - flipAt) * 4) * 8 : 0;
        E('s10signG').setAttribute('transform', `translate(960 600) rotate(${sway})`);
        const du = ease((t - doorAt) / 0.22);
        E('s10door').setAttribute('transform', `translate(860 0) scale(${1 - 0.85 * du} 1) translate(-860 0)`);
        const glow = 0.4 + 0.25 * Math.min(1, Math.max(0, (t - T.bright) / 0.4)) + 0.2 * Math.sin(t * 3);
        E('s10winL').setAttribute('opacity', glow); E('s10winR').setAttribute('opacity', glow);
      }
      E('s10flash').setAttribute('opacity', flash);
      lab.style.opacity = inside ? 1 : 0;
      /* --- 2) 카운터 --- */
      if (inside) {
        // 손님 줄: 손님 i 는 자기 순서 시작(from)에 카운터 앞(ARR)에 서 있고, 끝(to) 0.22초 전부터 왼쪽으로 나간다
        const n = orders.length;
        let c;
        if (!n) c = 0;
        else if (t < orders[0].from) c = -1.6 * (1 - ease((t - (orders[0].from - 0.7)) / 0.7));
        else { c = n; for (let i = 0; i < n; i++) { const o = orders[i]; if (t < o.to) { c = t < o.to - 0.22 ? i : i + ease((t - (o.to - 0.22)) / 0.22); break; } } }
        const key = n + '|' + (orders[0] ? orders[0].from.toFixed(2) : '');
        if (key !== built) { built = key; E('s10custs').innerHTML = orders.map((o, i) => `<g data-i="${i}">${custSVG(i)}</g>`).reverse().join(''); custEls.length = 0; E('s10custs').querySelectorAll('[data-i]').forEach(g => { custEls[+g.dataset.i] = g; }); }
        const active = orders.findIndex(o => t >= o.from - 0.05 && t < o.to);
        custEls.forEach((g, i) => {
          const q = i - c;
          if (q > 2.6 || q < -1) { g.style.display = 'none'; return; } g.style.display = '';
          let x, s, op = 1;
          if (q >= 0) { x = ARR + q * 320; s = CS * (1 - q * 0.16); } else { x = ARR + q * 1500; s = CS; op = 1 + q * 0.7; }
          const walk = Math.abs(q - Math.round(q)) > 0.02 ? Math.abs(Math.sin(pn / 90)) * 10 : 0;
          g.setAttribute('transform', `translate(${x} ${FEET - (q > 0 ? q * 40 : 0) - walk}) scale(${s})`); g.style.opacity = op;
          g.style.filter = q > 0.5 ? `grayscale(1) brightness(${1 - Math.min(0.3, q * 0.12)})` : '';
          // 팔: 빵을 놓는 순간 쟁반 쪽으로 뻗음
          const o = orders[i]; let reach = 0, slot = 'L';
          if (o) for (const cl of o.call) { const d = t - cl.t; if (d > -0.12 && d < 0.16) { reach = d < 0 ? 1 + d / 0.12 : 1 - d / 0.16; slot = cl.l; } }
          const sx = -60, sy = -110, hx = lerp(-40, (SLOT[slot] - x) / s, reach), hy = lerp(-60, (TRAY_Y - 40 - FEET) / s, reach);
          const arm = `M${sx} ${sy} Q${(sx + hx) / 2} ${Math.min(sy, hy) - 40} ${hx} ${hy}`;
          g.querySelector('.arm').setAttribute('d', arm); g.querySelector('.armi').setAttribute('d', arm);
          g.querySelector('.hand').setAttribute('cx', hx); g.querySelector('.hand').setAttribute('cy', hy);
          g.querySelector('.face').setAttribute('transform', `translate(${q >= 0 ? 0 : 24} 0)`);
        });
        // 쟁반 위 빵: 지금 손님이 놓은 것. 내가 맞게 치면 봉투로 날아간다
        let items = '', fly = '';
        const ao = active >= 0 ? orders[active] : null;
        let packedTotal = 0;
        for (const o of orders) packedTotal += ch.me.filter(m => m.o === o.id && (m.res === 'perfect' || m.res === 'good')).length;
        if (ao) {
          const mine = ch.me.filter(m => m.o === ao.id).sort((a, b) => a.t - b.t), cnt = { L: 0, R: 0 };
          ao.call.forEach((cl, k) => {
            if (t < cl.t - 0.01) return;
            const kind = KINDS[(ao.id + k) % 3], off = cnt[cl.l]++ * 56 - 28 * (ao.call.filter(x => x.l === cl.l).length - 1);
            const m = mine[k], ok = m && (m.res === 'perfect' || m.res === 'good'), d = t - cl.t;
            const drop = d < 0.12 ? (1 - d / 0.12) * 40 : 0, sq = d < 0.12 ? 0.85 + d : 1;
            const bx = SLOT[cl.l] + off, by = TRAY_Y - 18;
            if (ok && m && t > m.t) { const u = Math.min(1, (t - m.t) / 0.26); if (u < 1) { const fx = lerp(bx, BAG.x, u), fy = lerp(by, BAG.y - 70, u) - Math.sin(Math.PI * u) * 160;
              fly += `<g transform="translate(${fx} ${fy}) rotate(${u * -200}) scale(${1 - 0.3 * u})">${breadShape(kind, 1.2)}</g>`; } return; }
            const miss = m && m.res === 'miss';
            items += `<g transform="translate(${bx} ${by - drop}) scale(${2 - sq} ${sq})" opacity="${miss ? 0.55 : 1}">${breadShape(kind, 1.25)}</g>`;
          });
        }
        E('s10items').innerHTML = items; E('s10fly').innerHTML = fly;
        E('s10bagN').textContent = '';
        const bagPulse = Math.max(0, 1 - (pn - Math.max(hit.L, hit.R)) / 160) * 0.08;
        E('s10bag').setAttribute('transform', `translate(${BAG.x} ${BAG.y}) scale(${1 + bagPulse} ${1 - bagPulse})`);
        // 제빵사 손: Space 왼손은 위에서 왼쪽 칸으로 내려찍기, → 오른손은 옆에서 오른쪽 칸으로 밀기
        const kick = d => d < 60 ? d / 60 : d < 180 ? 1 - (d - 60) / 120 : 0;
        const kL = kick(pn - hit.L), kR = kick(pn - hit.R);
        const myTurn = ao && t >= ao.turn - 0.08;
        const restL = myTurn ? [BAKER - 100, 690] : [BAKER - 150, 720], restR = myTurn ? [BAKER + 130, 690] : [BAKER + 150, 720];
        const hL = [lerp(restL[0], SLOT.L - 10, kL), lerp(restL[1], TRAY_Y - 40, kL) - Math.sin(Math.PI * kL) * 40], hR = [lerp(restR[0], SLOT.R - 60, kR), lerp(restR[1], TRAY_Y - 36, kR)];
        const arm = (sx, sy, hx, hy, side) => `M${sx} ${sy} Q${(sx + hx) / 2 + side * 30} ${Math.min(sy, hy) - 30} ${hx} ${hy}`;
        const aL = arm(BAKER - 120, 640, hL[0], hL[1], -1), aR = arm(BAKER + 120, 640, hR[0], hR[1], 1);
        E('s10armL').setAttribute('d', aL); E('s10armLi').setAttribute('d', aL); E('s10armR').setAttribute('d', aR); E('s10armRi').setAttribute('d', aR);
        E('s10handL').setAttribute('cx', hL[0]); E('s10handL').setAttribute('cy', hL[1]); E('s10handR').setAttribute('cx', hR[0]); E('s10handR').setAttribute('cy', hR[1]);
        E('s10bEyes').setAttribute('transform', `translate(${ao ? 10 : 0} ${myTurn ? 6 : 0})`);
        // 말풍선: 숨 고르기 · 마지막 손님
        const sayTxt = t >= T.last - 0.9 && t < T.end ? '마지막 손님!' : t >= T.rest && t < T.last - 0.9 ? '휴… 한숨 돌리고.' : t < (orders[0] ? orders[0].from : 57.2) ? '어서 오세요!' : '';
        E('s10sayG').setAttribute('opacity', sayTxt ? 1 : 0); if (sayTxt) E('s10say').textContent = sayTxt;
        const served = orders.filter(o => t >= o.to).length;
        lab.textContent = `손님 ${served}명`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); svg.remove(); lab.remove(); };
  };
})();
