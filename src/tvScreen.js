/* v4.3 레트로 방 TV 화면 그리기 (캔버스 192×144 → CSS image-rendering:pixelated 로 키움)
   - snow(지지직): 큰 소음 판을 한 번만 만들어 두고 매 프레임 임의 위치에서 잘라 붙임(StackOverflow 'canvas tv noise' 의 오프셋 기법).
     진짜 빈 채널처럼 12~15fps 로 '깜빡이게'(ysrtv 의 dead-air 원리). 흑백만
   - game: TV 속에서 혼자 도는 데모 화면(달리고 뛰고 동전) — '뿅뿅' 소리는 onEvent 로 밖에 알림
   - ch: 애니 쪽 채널 화면들(색 막대 · 밤하늘 · 바다 · 편성표 맛보기) + 화면 구석 채널 번호
   그림은 모두 사각형 몇 개로 직접 그림(외부 이미지 없음). 색: 검정·흰색·회색·노랑(#FFD400) */
const W = 192, H = 144, Y = '#FFD400';
const DIG = { 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001111' };
export function createTV(canvas, { onEvent } = {}) {
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext('2d', { alpha: false });
  c.imageSmoothingEnabled = false;
  const nz = document.createElement('canvas'); nz.width = W * 2; nz.height = H * 2;
  { const x = nz.getContext('2d'), id = x.createImageData(nz.width, nz.height), b = new Uint32Array(id.data.buffer);
    for (let i = 0; i < b.length; i++) { const v = Math.random() < 0.5 ? (Math.random() * 90) | 0 : 120 + ((Math.random() * 135) | 0); b[i] = 0xff000000 | (v << 16) | (v << 8) | v; }
    x.putImageData(id, 0, 0); }
  let mode = 'off', ch = 1, raf = 0, last = 0, acc = 0, t = 0, osdT = 0, still = false;
  const g = { py: 0, vy: 0, obs: [], coins: [], next: 0.6, score: 0, hill: 0 };
  const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x | 0, y | 0, w | 0, h | 0); };
  const digits = (n, x, y, s, col) => { String(n).split('').forEach((d, k) => { const m = DIG[d]; for (let i = 0; i < 15; i++) if (m[i] === '1') R(x + k * 4 * s + (i % 3) * s, y + ((i / 3) | 0) * s, s, s, col); }); };
  const text = (s, x, y, col, align = 'left') => { c.font = '11px RetroPx, monospace'; c.textAlign = align; c.textBaseline = 'top'; c.fillStyle = '#000'; c.fillText(s, x + 1, y + 1); c.fillStyle = col; c.fillText(s, x, y); };
  function snow() {
    c.drawImage(nz, (Math.random() * W) | 0, (Math.random() * H) | 0, W, H, 0, 0, W, H);
    const band = ((t * 40) % (H + 30)) - 30; c.globalAlpha = 0.18; R(0, band, W, 14, '#fff'); c.globalAlpha = 1;
  }
  const GROUND = 116;
  function game(dt) {
    // 갱신
    g.hill = (g.hill + dt * 12) % 64;
    g.next -= dt; if (g.next <= 0) { g.obs.push({ x: W + 4, h: Math.random() < 0.5 ? 10 : 14 }); if (Math.random() < 0.7) g.coins.push({ x: W + 4, y: GROUND - 40 }); g.next = 1.1 + Math.random() * 0.7; }
    g.obs.forEach(o => (o.x -= 72 * dt)); g.coins.forEach(o => (o.x -= 72 * dt));
    g.obs = g.obs.filter(o => o.x > -20); g.coins = g.coins.filter(o => o.x > -10 && !o.got);
    const onGround = g.py >= 0;
    const ahead = g.obs.find(o => o.x - 46 > 4 && o.x - 46 < 16);
    if (onGround && ahead) { g.vy = -168; onEvent?.('jump'); }
    g.vy += 560 * dt; g.py = Math.min(0, g.py + g.vy * dt); if (g.py >= 0) g.vy = 0;
    const pyAbs = GROUND - 12 + g.py;
    g.coins.forEach(o => { if (!o.got && Math.abs(o.x - 46) < 8 && Math.abs(o.y - pyAbs) < 12) { o.got = true; g.score += 10; onEvent?.('coin'); } });
    // 그림
    R(0, 0, W, H, '#0d0d0d');
    for (let x = -64; x < W + 64; x += 64) { const bx = x - g.hill; c.fillStyle = '#262626'; c.beginPath(); c.moveTo(bx, GROUND); c.lineTo(bx + 32, GROUND - 30); c.lineTo(bx + 64, GROUND); c.fill(); }
    R(0, GROUND, W, 2, '#fff'); for (let x = -((t * 72) % 12); x < W; x += 12) R(x, GROUND + 6, 6, 2, '#5a5a5a');
    g.obs.forEach(o => { R(o.x, GROUND - o.h, 10, o.h, '#fff'); R(o.x + 2, GROUND - o.h + 2, 6, o.h - 2, '#8a8a8a'); });
    g.coins.forEach(o => { const blink = ((t * 6) | 0) % 2; R(o.x - 2, o.y - 3, 5, 6, Y); if (blink) R(o.x - 1, o.y - 2, 1, 3, '#fff'); });
    const sq = onGround ? 0 : 1; // 공중에선 세로로 길쭉
    R(40, pyAbs - sq, 12, 12 + sq, '#fff'); R(47, pyAbs + 3 - sq, 2, 3, '#000'); R(40, pyAbs + 7, 12, 2, Y); // 몸 · 눈 · 노란 띠
    if (onGround) { const f = ((t * 10) | 0) % 2; R(41 + f * 3, GROUND - 1, 3, 1, '#fff'); }
    digits(String(g.score).padStart(4, '0'), W - 40, 8, 2, '#fff'); R(W - 50, 8, 6, 10, Y);
  }
  const progs = {
    1: () => { const cols = ['#ffffff', '#d4d4d4', Y, '#9a9a9a', '#6a6a6a', '#3a3a3a', '#111111']; cols.forEach((k, i) => R(i * (W / 7), 0, W / 7 + 1, H * 0.72, k)); for (let i = 0; i < 8; i++) R(i * 24, H * 0.72, 24, H * 0.28, i % 2 ? '#111' : '#e8e8e8'); },
    4: () => { R(0, 0, W, H, '#0b0b0b'); for (let i = 0; i < 40; i++) { const x = (i * 53) % W, y = (i * 37) % 90; if (((t * 3 + i) | 0) % 5) R(x, y, 1, 1, '#cfcfcf'); } c.fillStyle = '#f2f2f2'; c.beginPath(); c.arc(140, 40, 18, 0, 7); c.fill(); R(132, 34, 5, 4, '#bdbdbd'); R(146, 46, 4, 3, '#bdbdbd'); R(0, 108, W, 36, '#1d1d1d'); for (let x = 0; x < W; x += 16) R(x, 104 + ((x / 16) % 3) * 2, 10, 6, '#1d1d1d'); },
    7: () => { R(0, 0, W, H, '#151515'); c.fillStyle = Y; c.beginPath(); c.arc(96, 78, 30, Math.PI, 0); c.fill(); for (let i = 0; i < 9; i++) { const y = 80 + i * 7, off = ((t * 20 + i * 9) % 24); for (let x = -24 + off; x < W; x += 24) R(x, y, 14 - i, 2, i < 3 ? Y : '#6a6a6a'); } },
    9: () => { R(0, 0, W, H, '#0d0d0d'); R(0, 0, W, 20, Y); text('편성표', 8, 4, '#111'); const hi = ((t * 1.6) | 0) % 5; for (let i = 0; i < 5; i++) { const y = 28 + i * 22; if (i === hi) R(4, y - 3, W - 8, 18, '#2c2c2c'); R(10, y, 26, 11, i === hi ? Y : '#5a5a5a'); R(44, y + 2, [110, 86, 128, 72, 98][i], 7, i === hi ? '#fff' : '#9a9a9a'); } },
  };
  function frame(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; t += dt; acc += dt;
    if (mode === 'snow') { if (acc >= 1 / 14) { acc = 0; snow(); } }
    else if (mode === 'game') game(dt);
    else if (mode === 'ch') { (progs[ch] || progs[1])(); if (t - osdT < 1.6) text('CH ' + String(ch).padStart(2, '0'), W - 8, 6, '#fff', 'right'); }
    else R(0, 0, W, H, '#0a0a0a');
    if (!still) raf = requestAnimationFrame(frame);
  }
  return {
    set(m, o = {}) { mode = m; if (o.ch != null) { ch = o.ch; osdT = t; } if (m === 'game' && o.reset) Object.assign(g, { py: 0, vy: 0, obs: [], coins: [], next: 0.5, score: 0 }); if (still) frame(performance.now()); },
    start({ freeze = false } = {}) { still = freeze; cancelAnimationFrame(raf); last = 0; if (freeze) { t = 1.3; if (mode === 'game') { g.obs = [{ x: 120, h: 10 }]; g.coins = [{ x: 150, y: GROUND - 40 }]; g.score = 40; } frame(performance.now()); } else raf = requestAnimationFrame(frame); },
    stop() { cancelAnimationFrame(raf); },
  };
}
