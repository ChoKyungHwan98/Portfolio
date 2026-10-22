/* v10 튜토리얼 (Claude) — 그림은 그록의 밤 반죽 장면(BS)을 그대로 쓰고, 그 위에 암전 + 핀 조명만 덮는다.
   window.__bkTut(겹칠 곳, 끝났을 때) → 정리 함수.  window.__bkTutView() → BS 에 넘길 { t, view, night, ev, cue }
   조명: ART_WORKFLOW 6-2 레시피(배경 미세 노출, 넓은/가운데 빛줄기 두 겹, 가로 감쇠, 바닥 빛 웅덩이, 광원 글로우, 먼지, 비네트)
   켜지는 순서(10-2): 깜빡 60ms → 깜빡 80ms → 0.30초 켜짐("다당" 두 번째 딸깍) → 빛줄기가 위에서 차오름 → 바닥 빛이 퍼짐 → 먼지
   진행: 인사 → 식빵 → 바게트 → 단팥빵(엇박) → 섞어서 → 끝. 빵마다 두 번 성공, 섞기는 한 번 */
(function () {
  const BPM = 139.1, B = 60 / BPM, Q = B / 4, GOOD = 0.14, PERFECT = 0.07;
  const PAT = {
    식빵: { cue: 'A..AB.A.', me: 'X..XR.X.', off: 8, span: 16 },
    바게트: { cue: 'A.B.A.B.', me: 'X.R.X.R.', off: 8, span: 16 },
    단팥빵: { cue: 'A.......', me: '...X..R.', off: 0, span: 8 },
  };
  const SND = { L: 'proto/space.mp3', R: 'proto/tam.mp3', hi: 'proto/cowbell_hi.mp3', lo: 'proto/cowbell_lo.mp3',
    식빵A: 'proto/cands/0_00.mp3', 식빵B: 'proto/cands/0_11.mp3', 바게트A: 'proto/cands/2_00.mp3', 바게트B: 'proto/cands/2_01.mp3', 단팥빵A: 'proto/cands/1_00.mp3' };
  const GAIN = { L: 0.8, R: 0.6, hi: 0.26, lo: 0.18 };
  const STEPS = [
    { say: '빵이 부른 박자를 그대로 따라 쳐요.', sub: '빵 차례엔 듣고, 내 차례에 쳐요', dur: 3.0 },
    { kinds: ['식빵'], need: 2, chip: '1/4 · 식빵', line: '탁··탁 찰·탁' },
    { kinds: ['바게트'], need: 2, chip: '2/4 · 바게트', line: '탁·찰·탁·찰' },
    { kinds: ['단팥빵'], need: 2, chip: '3/4 · 단팥빵', line: '퐁 — 박 사이에 탁 · 찰' },
    { kinds: ['식빵', '단팥빵', '바게트'], need: 1, chip: '4/4 · 섞어서', line: '오는 빵마다 그 박자로' },
    { say: '좋아요. 이제 진짜 밤 반죽이에요.', sub: '여기부터는 박자 띠가 없어요', dur: 2.6, last: true },
  ];
  const HAND = 0.25, GAP = 0.2125, CX = 480; // 그록 장면: 손 앞 x = 화면 25% (1920 기준 480)

  /* ---------- 조명 덮개 (그록 장면과 같은 좌표: 1920×1080, slice) ---------- */
  function overlaySVG() {
    const dust = [...Array(18)].map((_, i) => { const x = CX + ((i * 73) % 420) - 210, y = 160 + ((i * 131) % 700), r = 1.2 + (i % 3) * 0.6;
      return `<circle class="d" data-i="${i}" cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${0.18 + (i % 4) * 0.08}"/>`; }).join('');
    return `
<defs>
 <linearGradient id="t10wide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity=".04"/></linearGradient>
 <linearGradient id="t10core" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient>
 <linearGradient id="t10side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <radialGradient id="t10pool"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
 <radialGradient id="t10bulb"><stop offset="0" stop-color="#FFF6C8" stop-opacity="1"/><stop offset=".35" stop-color="#FFD400" stop-opacity=".45"/><stop offset="1" stop-color="#FFD400" stop-opacity="0"/></radialGradient>
 <radialGradient id="t10vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>
 <filter id="t10b24" x="-40%" y="-20%" width="180%" height="140%"><feGaussianBlur stdDeviation="24"/></filter>
 <filter id="t10b8" x="-30%" y="-20%" width="160%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>
 <filter id="t10b12" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
 <!-- 어둠에 뚫을 구멍: 빛이 닿는 곳만 장면이 보인다 -->
 <mask id="t10hole" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
  <rect width="1920" height="1080" fill="#fff"/>
  <g id="t10holeG" filter="url(#t10b24)" fill="#000">
   <polygon points="${CX - 70},110 ${CX + 70},110 ${CX + 400},930 ${CX - 400},930"/>
   <ellipse cx="${CX}" cy="935" rx="470" ry="95"/>
  </g>
 </mask>
 <clipPath id="t10beamClip"><polygon points="${CX - 70},110 ${CX + 70},110 ${CX + 400},930 ${CX - 400},930"/></clipPath>
 <mask id="t10sideM" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><rect x="${CX - 420}" y="0" width="840" height="1080" fill="url(#t10side)"/></mask>
</defs>
<!-- 1 어둠 (완전한 검정이 아니라 장면이 아주 희미하게 비침) -->
<rect id="t10dark" width="1920" height="1080" fill="#050505" opacity=".95" mask="url(#t10hole)"/>
<!-- 2·3 빛줄기 두 겹 + 가로 감쇠 -->
<g id="t10beams" mask="url(#t10sideM)" style="mix-blend-mode:screen">
 <g id="t10beamFill" clip-path="url(#t10beamClip)">
  <polygon points="${CX - 70},110 ${CX + 70},110 ${CX + 400},930 ${CX - 400},930" fill="url(#t10wide)" filter="url(#t10b24)"/>
  <polygon points="${CX - 40},110 ${CX + 40},110 ${CX + 230},930 ${CX - 230},930" fill="url(#t10core)" filter="url(#t10b8)"/>
 </g>
</g>
<!-- 5 바닥(작업대 위) 빛 웅덩이 -->
<ellipse id="t10pool" cx="${CX}" cy="935" rx="430" ry="90" fill="url(#t10pool)" style="mix-blend-mode:screen"/>
<!-- 9 광원 -->
<g id="t10bulbG"><circle cx="${CX}" cy="118" r="90" fill="url(#t10bulb)" filter="url(#t10b12)" opacity=".8"/><ellipse cx="${CX}" cy="112" rx="40" ry="9" fill="#FFF6C8"/></g>
<!-- 10 먼지: 빛줄기 안에서만 -->
<g id="t10dust" clip-path="url(#t10beamClip)">${dust}</g>
<!-- 11 비네트 -->
<rect width="1920" height="1080" fill="url(#t10vig)"/>`;
  }

  window.__bkTut = function (host, onDone) {
    const AC = window.AudioContext || window.webkitAudioContext, ctx = new AC({ latencyHint: 'interactive' });
    const bufs = {}, last = {};
    const lat = () => (ctx.outputLatency || 0) + (ctx.baseLatency || 0);
    const now = () => ctx.currentTime - lat();
    const trim = raw => { const d = raw.getChannelData(0); let pk = 0; for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i])); let s = 0; for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > pk * 0.03) { s = i; break; }
      const len = Math.min(raw.length - s, Math.floor(raw.sampleRate * 1.2)), out = ctx.createBuffer(1, len, raw.sampleRate), y = out.getChannelData(0); for (let i = 0; i < len; i++) y[i] = d[s + i] * 0.9 / (pk || 1);
      const f = Math.min(len, Math.floor(raw.sampleRate * 0.008)); for (let i = 0; i < f; i++) y[len - 1 - i] *= i / f; return out; };
    Object.entries(SND).forEach(([k, u]) => fetch(u).then(r => r.arrayBuffer()).then(a => ctx.decodeAudioData(a)).then(b => { bufs[k] = trim(b); }).catch(() => {}));
    const play = (k, at, g = 1) => { const b = bufs[k]; if (!b) return; const t0 = Math.max(ctx.currentTime, at), L = last[k];
      if (L) { try { L.v.gain.setTargetAtTime(0, t0, 0.004); L.n.stop(t0 + 0.03); } catch (e) {} }
      const n = ctx.createBufferSource(), v = ctx.createGain(); n.buffer = b; v.gain.value = (GAIN[k] ?? 0.9) * g; n.connect(v).connect(ctx.destination); n.start(t0); last[k] = { n, v }; };

    /* 덮개 DOM */
    const root = document.createElement('div');
    root.className = 'tut10';
    root.style.cssText = 'position:absolute;inset:0;pointer-events:none;font-family:"Black Han Sans",sans-serif';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1920 1080'); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'; svg.innerHTML = overlaySVG(); root.appendChild(svg);
    // 안내: 장면보다 튀지 않게 어두운 판, 노랑은 지금 단계 표시에만
    const ui = document.createElement('div');
    ui.style.cssText = 'position:absolute;right:5vw;top:18vh;width:min(36vw,560px);color:#eee;opacity:0;transform:translateY(8px);transition:opacity .3s,transform .3s';
    ui.innerHTML = `
<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><span id="t10chip" style="background:#FFD400;color:#111;border:3px solid #111;border-radius:10px;padding:2px 12px;font-size:clamp(14px,1.4vw,22px)"></span>
 <span id="t10turn" style="font-size:clamp(14px,1.3vw,20px);color:#bbb"></span></div>
<div id="t10line" style="font-size:clamp(26px,3vw,48px);letter-spacing:-.02em;color:#fff;text-shadow:0 3px 0 #000"></div>
<div style="margin-top:22px;background:#141414;border:3px solid #333;border-radius:16px;padding:16px 18px 14px">
 <div id="t10cells" style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px;position:relative"></div>
 <div id="t10hint" style="margin-top:12px;font-size:clamp(12px,1.05vw,17px);color:#999"></div>
</div>
<div style="display:flex;align-items:center;gap:10px;margin-top:16px;font-size:clamp(12px,1.05vw,17px);color:#888">
 <span id="t10kL" style="border:2px solid #555;border-radius:8px;padding:2px 10px;color:#ddd">Space</span>탁
 <span id="t10kR" style="border:2px solid #555;border-radius:8px;padding:2px 10px;color:#ddd;margin-left:8px">→</span>찰
 <span id="t10pips" style="margin-left:auto;display:flex;gap:8px"></span></div>`;
    root.appendChild(ui);
    const say = document.createElement('div');
    say.style.cssText = 'position:absolute;right:6vw;top:40vh;width:min(38vw,600px);text-align:left;opacity:0;transform:translateY(8px);transition:opacity .35s,transform .35s';
    say.innerHTML = '<div id="t10say" style="font-size:clamp(26px,2.9vw,46px);color:#fff;letter-spacing:-.02em;text-shadow:0 3px 0 #000"></div><div id="t10sub" style="margin-top:10px;font-size:clamp(14px,1.4vw,22px);color:#999"></div>';
    root.appendChild(say);
    const fb = document.createElement('div');
    fb.style.cssText = 'position:absolute;left:25%;top:30%;transform:translate(-50%,0);font-size:clamp(30px,3.6vw,60px);color:#FFD400;-webkit-text-stroke:6px #111;paint-order:stroke fill;opacity:0;white-space:nowrap';
    root.appendChild(fb);
    const skip = document.createElement('button'); skip.type = 'button'; skip.textContent = '건너뛰기 ▶';
    skip.style.cssText = 'position:absolute;right:28px;bottom:26px;pointer-events:auto;font:inherit;font-size:18px;padding:10px 18px;border:3px solid #333;border-radius:12px;background:#141414;color:#ddd;cursor:pointer';
    root.appendChild(skip); host.appendChild(root);
    const E = id => root.querySelector('#' + id);

    /* ---------- 진행 ---------- */
    const S = { step: -1, ok: 0, att: null, sayUntil: 0, flash: { L: -9e9, R: -9e9 }, offs: [], fb: null, done: false, at0: performance.now(), breads: [], ev: [], cue: {}, cueI: 0, cues: [] };
    function startStep(i, at) {
      S.step = i; S.ok = 0; S.att = null; const st = STEPS[i];
      if (st.say) { S.sayUntil = performance.now() + st.dur * 1000; E('t10say').textContent = st.say; E('t10sub').textContent = st.sub || ''; return; }
      E('t10chip').textContent = st.chip; E('t10line').textContent = st.line;
      newAttempt(at ?? ctx.currentTime + 0.25);
    }
    function newAttempt(t0) {
      const st = STEPS[S.step]; t0 = Math.max(t0, ctx.currentTime + 0.12);
      const blocks = []; let t = t0 + 4 * B;
      for (const kind of st.kinds) { const P = PAT[kind], start = t, id = S.breads.length, cues = [], hits = [];
        [...P.cue].forEach((c, k) => { if (c !== '.') cues.push({ bread: id, t: start + k * Q, c, snd: kind + c }); });
        [...P.me].forEach((c, k) => { if (c !== '.') hits.push({ t: start + (P.off + k) * Q, l: c === 'X' ? 'L' : 'R', res: null }); });
        const b = { id, kind, start, end: start + P.span * Q, turn: start + (P.off || 1) * Q, cues, hits };
        b.lastHit = hits[hits.length - 1].t; S.breads.push(b); blocks.push(b); S.cues.push(...cues);
        t = b.end + (kind === '단팥빵' ? 2 * B : 0); }
      const end = t, beats = Math.round((end - t0) / B);
      for (let b = 0; b < beats; b++) play(b % 4 === 0 ? 'hi' : 'lo', t0 + b * B);
      blocks.forEach(bl => bl.cues.forEach(q => play(q.snd, q.t)));
      S.att = { t0, blocks, end, stray: false, judged: false, lastHit: Math.max(...blocks.map(b => b.lastHit)) };
    }
    function judgeAttempt() {
      const a = S.att; a.judged = true;
      const all = a.blocks.flatMap(b => b.hits), okAll = all.every(h => h.res === 'perfect' || h.res === 'good') && !a.stray;
      S.fb = { text: okAll ? (all.every(h => h.res === 'perfect') ? '딱 좋아!' : '좋아!') : '한 번 더!', at: performance.now(), good: okAll };
      if (okAll) S.ok++;
      if (S.ok >= STEPS[S.step].need) startStep(S.step + 1, a.end); else newAttempt(a.end);
    }
    function finish() {
      if (S.done) return; S.done = true;
      if (S.offs.length >= 4) { const s = [...S.offs].sort((x, y) => x - y), m = s[s.length >> 1]; try { localStorage.setItem('bk-cal', String(Math.max(-0.15, Math.min(0.15, m)))); } catch (e) {} }
      onDone && onDone();
    }
    skip.onclick = finish;
    const onInput = e => {
      const k = e.detail && e.detail.key, l = k === 'space' ? 'L' : k === 'right' ? 'R' : null; if (!l || S.done) return;
      if (ctx.state !== 'running') ctx.resume();
      play(l, 0); S.flash[l] = performance.now();
      const t = now(), a = S.att; let res = 'empty';
      if (a && !a.judged) { let best = null, bd = 9;
        for (const b of a.blocks) for (const h of b.hits) if (!h.res && h.l === l) { const d = Math.abs(t - h.t); if (d < bd) { bd = d; best = h; } }
        if (best && bd <= GOOD) { best.res = res = bd <= PERFECT ? 'perfect' : 'good'; S.offs.push(t - best.t); }
        else if (a.blocks.some(b => t > b.start - 0.1 && t < b.end + GOOD)) a.stray = true; }
      S.ev.push({ type: 'judge', key: l, res, t }); if (S.ev.length > 40) S.ev.shift();
    };
    addEventListener('rhythm:input', onInput);

    /* BS 에 넘길 값: 레일 위 빵 위치는 빵마다 자기 시작 시각에 손 앞(q 0) */
    const ease = u => { u = Math.max(0, Math.min(1, u)); return u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2; };
    function view(t) {
      const out = [];
      for (const b of S.breads) {
        let q;
        if (t < b.start) q = 4 * (1 - ease((t - (b.start - 1.3)) / 1.3));
        else if (t < b.end + 0.1) q = 0;
        else q = -ease((t - b.end - 0.1) / 0.45);
        if (q >= 4 || q <= -0.999) continue;
        const x = q >= 0 ? HAND + GAP * q : HAND + (HAND - 0.04) * q;
        const judged = b.hits.filter(h => h.res).length, step = b.hits.filter(h => h.res === 'perfect' || h.res === 'good').length;
        const state = t < b.start ? 'wait' : t < b.turn ? 'cue' : judged < b.hits.length ? 'mine' : step === b.hits.length ? 'done' : 'raw';
        out.push({ id: b.id, kind: b.kind, x, q, state, step, judged, total: b.hits.length });
      }
      return out;
    }
    window.__bkTutView = () => { const t = now(); return { t, view: view(t), night: { breads: S.breads }, ev: S.ev, cue: S.cue }; };

    /* ---------- 매 프레임: 진행 + 조명 + 안내 ---------- */
    let raf;
    const loop = () => {
      const pn = performance.now(), t = now(), el = (pn - S.at0) / 1000;
      if (ctx.state !== 'running') ctx.resume();
      // 조명 켜짐 (10-2): 깜빡 두 번 → 켜짐 → 빛줄기 차오름 → 웅덩이 → 먼지
      const flick = (el > 0 && el < 0.06) || (el > 0.12 && el < 0.2);
      const on = el >= 0.3, fill = ease((el - 0.32) / 0.25), pool = ease((el - 0.45) / 0.3), dust = ease((el - 0.8) / 0.8);
      const lit = on ? 1 : flick ? 0.55 : 0;
      E('t10dark').setAttribute('opacity', on ? 0.95 : flick ? 0.97 : 1);
      E('t10holeG').setAttribute('opacity', lit * (on ? 0.35 + 0.65 * fill : 1));
      E('t10beamFill').setAttribute('transform', `translate(0 110) scale(1 ${on ? 0.05 + 0.95 * fill : flick ? 1 : 0}) translate(0 -110)`);
      E('t10beams').setAttribute('opacity', lit);
      E('t10pool').setAttribute('opacity', on ? pool : 0); E('t10pool').setAttribute('rx', 430 * (0.6 + 0.4 * pool));
      E('t10bulbG').setAttribute('opacity', lit);
      root.querySelectorAll('#t10dust .d').forEach((d, i) => { const p = (pn / 1000 / (12 + i % 7) + i * 0.13) % 1;
        d.setAttribute('transform', `translate(${Math.sin(pn / 2600 + i) * 10} ${p * 120 - 60})`); d.style.opacity = dust; });
      if (S.step < 0 && el > 0.9) startStep(0);
      const st = STEPS[S.step] || {};
      const sayOn = !!st.say;
      say.style.opacity = sayOn ? 1 : 0; say.style.transform = sayOn ? 'none' : 'translateY(8px)';
      ui.style.opacity = sayOn || S.step < 0 ? 0 : 1; ui.style.transform = sayOn || S.step < 0 ? 'translateY(8px)' : 'none';
      if (st.say && pn > S.sayUntil) { if (st.last) finish(); else startStep(S.step + 1); }
      const a = S.att;
      if (a && !a.judged) { for (const b of a.blocks) for (const h of b.hits) if (!h.res && t > h.t + GOOD) h.res = 'miss';
        if (t > a.lastHit + GOOD + 0.02) judgeAttempt(); }
      while (S.cueI < S.cues.length && t >= S.cues[S.cueI].t) { const q = S.cues[S.cueI++]; S.cue[q.bread] = { t: q.t, c: q.c }; }
      // 안내: 지금 빵의 내 박자 8칸 + 지금 칸
      const blocks = S.att ? S.att.blocks : [], cur = blocks.find(b => t < b.end + 0.05) || blocks[blocks.length - 1];
      if (cur && !sayOn) {
        const P = PAT[cur.kind], cells = E('t10cells');
        if (cells.dataset.k !== cur.kind) { cells.dataset.k = cur.kind;
          cells.innerHTML = [...P.me].map((c, k) => { const pop = cur.kind === '단팥빵' && k === 0, beat = k % 4 === 0;
            const bg = pop ? '#DDA665' : c === 'X' ? '#fff' : c === 'R' ? '#FFD400' : '#222', col = pop || c !== '.' ? '#111' : '#555';
            return `<div data-c="${k}" style="position:relative;aspect-ratio:1;border-radius:8px;background:${bg};border:3px solid ${beat ? '#666' : '#2c2c2c'};display:grid;place-items:center;color:${col};font-size:clamp(12px,1.25vw,20px)">${pop ? '퐁' : c === 'X' ? '탁' : c === 'R' ? '찰' : beat ? '·' : ''}</div>`; }).join('');
          E('t10hint').textContent = cur.kind === '단팥빵' ? '테두리 진한 칸 = 박. 탁은 두 번째 박 바로 앞, 찰은 그 반 박 뒤' : cur.kind === '식빵' ? '빵이 낸 소리 그대로. 낮은 소리 = 탁, 높은 소리 = 찰' : '탁 · 찰을 번갈아 고르게'; }
        const ms = cur.start + P.off * Q, cell = Math.floor((t - ms) / Q), inMine = t >= ms - 0.02 && cell >= 0 && cell < 8;
        cells.querySelectorAll('[data-c]').forEach((d, k) => { d.style.outline = inMine && k === cell ? '4px solid #FFD400' : 'none'; d.style.outlineOffset = '2px'; });
        E('t10turn').textContent = t < cur.start ? '다음 빵이 와요' : t < cur.turn - 0.02 ? '빵 차례 · 들어 봐요' : t < cur.end + 0.1 ? '내 차례!' : '';
      }
      const need = st.need || 0, pips = E('t10pips');
      if (pips.dataset.v !== need + '/' + S.ok) { pips.dataset.v = need + '/' + S.ok;
        pips.innerHTML = [...Array(need)].map((_, i) => `<i style="width:16px;height:16px;border-radius:50%;border:3px solid #555;background:${i < S.ok ? '#FFD400' : 'transparent'}"></i>`).join(''); }
      E('t10kL').style.borderColor = pn - S.flash.L < 120 ? '#FFD400' : '#555'; E('t10kR').style.borderColor = pn - S.flash.R < 120 ? '#FFD400' : '#555';
      const fa = S.fb ? (pn - S.fb.at) / 1000 : 9;
      fb.textContent = S.fb ? S.fb.text : ''; fb.style.color = S.fb && S.fb.good ? '#FFD400' : '#fff';
      fb.style.opacity = fa < 1.1 ? 1 - Math.max(0, fa - 0.8) / 0.3 : 0; fb.style.transform = `translate(-50%, ${-Math.min(fa, 0.3) * 40}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.__bkTutState = S; S.now = now;
    return () => { cancelAnimationFrame(raf); removeEventListener('rhythm:input', onInput); window.__bkTutView = null; root.remove(); setTimeout(() => ctx.close().catch(() => {}), 150); };
  };
})();
