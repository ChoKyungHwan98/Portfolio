import { useEffect, useRef } from 'react';
/* v4.6 문서 판(포트폴리오·이력서·자기소개서) 공통 바탕 = '반응하는 망점 판'.
   가만히 있으면 가만히(그리기 자체를 멈춤). 움직임은 전부 '반응'에서만 나옴:
   - 포인터 근처 점이 커지고 진해짐(스프링처럼 늦게 따라옴)
   - 누른 자리에서 노란 점 물결(ClickSpark 와 같은 순간)
   - 카드·칸에 올리거나(키보드 포커스 포함) 하면 그 둘레 점이 진해짐(주 판은 노랑) — 고른 것을 바탕이 받쳐 줌
   - 포인터에 따라 바탕(점)이 카드와 반대로 조금 움직임(시차) → 카드가 바탕 위에 떠 있는 깊이
   (v4.7: 비교용 대안 ?bg=b '집중선' 은 Cho 가 A 를 골라 뺌)
   캔버스 하나, DPR 반영(최대 2), 숨겨지면 멈춤, 움직임 줄이기 = 바탕만 그리고 반응 없음 */
const G = 18, R0 = 1.5, CUR = 150, HALO = 60, RIP_V = 0.95, RIP_W = 46, RIP_LIFE = 760;
const BG = '#efefef', BASE = [205, 205, 205], DARK = [166, 166, 166], YEL = [255, 212, 0], HALO_C = [128, 128, 128];
const LV = 8; // 색 단계(한 단계 = 한 번의 fill)
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
const GRAY = Array.from({ length: LV + 1 }, (_, i) => mix(BASE, DARK, i / LV));
const HAL = Array.from({ length: LV + 1 }, (_, i) => mix(BASE, HALO_C, i / LV));
const YL = Array.from({ length: LV + 1 }, (_, i) => mix(BASE, YEL, i / LV));
const PAR = 0.012;

export default function Field({ active, reduce, scroller }) {
  const reset = useRef(null);
  const cv = useRef(null), on = useRef(active);
  on.current = active;
  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d'), host = c.parentElement;
    let W = 0, H = 0, L = 0, dpr = 1, raf = 0, last = 0, base = null;
    const S = { mx: -999, my: -999, x: -999, y: -999, px: 0, py: 0, tpx: 0, tpy: 0, in: 0, tin: 0, fa: 0, tfa: 0, rect: null, tone: '', el: null, rip: [], };
    const stats = (window.__field = { frames: 0, ms: 0, max: 0, dots: 0 });

    const drawBase = () => { // 쉬는 판(한 번만 그려 두고 매 프레임 그대로 찍음). 시차 여유 16px
      base = document.createElement('canvas'); base.width = (W + 32) * dpr; base.height = (H + 32) * dpr;
      const b = base.getContext('2d'); b.setTransform(dpr, 0, 0, dpr, 0, 0); b.fillStyle = BG; b.fillRect(0, 0, W + 32, H + 32);
      b.fillStyle = mix(BASE, BASE, 0); b.beginPath();
      for (let y = 0; y < H + 32; y += G) for (let x = (Math.floor(y / G) % 2 ? G / 2 : 0); x < W + 32; x += G) { b.moveTo(x + R0, y); b.arc(x, y, R0, 0, Math.PI * 2); }
      b.fill();
    };
    const size = () => {
      const r = host.getBoundingClientRect(), sr = scroller.current?.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1); W = Math.ceil(r.width); H = Math.ceil(r.height); L = sr ? Math.max(0, Math.floor(sr.left - r.left)) : 0;
      c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px'; drawBase(); kick(true);
    };
    const near = (a, b) => Math.abs(a - b) < 0.25;
    const frame = now => {
      raf = 0; const t0 = performance.now(); const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016); last = now;
      const k = 1 - Math.exp(-dt * 11), kp = 1 - Math.exp(-dt * 6), kf = 1 - Math.exp(-dt * (S.tfa > S.fa ? 9 : 6));
      if (S.x < -900) { S.x = S.mx; S.y = S.my; }
      S.x += (S.mx - S.x) * k; S.y += (S.my - S.y) * k; S.px += (S.tpx - S.px) * kp; S.py += (S.tpy - S.py) * kp;
      S.in += (S.tin - S.in) * k; S.fa += (S.tfa - S.fa) * kf;
      S.rip = S.rip.filter(r => now - r.t < RIP_LIFE);
      const ox = -16 + S.px, oy = -16 + S.py; // 쉬는 판을 시차만큼 옮겨 찍음
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.drawImage(base, 0, 0, base.width, base.height, ox, oy, W + 32, H + 32);
      const rc = S.rect; let n = 0;
      n = drawA(now, rc, ox, oy);
      const ms = performance.now() - t0; stats.frames++; stats.ms += ms; stats.max = Math.max(stats.max, ms); stats.dots = n;
      const settled = near(S.x, S.mx) && near(S.y, S.my) && near(S.px, S.tpx) && near(S.py, S.tpy) && Math.abs(S.in - S.tin) < 0.01 && Math.abs(S.fa - S.tfa) < 0.01 && !S.rip.length;
      if (!settled) raf = requestAnimationFrame(frame); else last = 0;
    };
    const drawA = (now, rc, ox, oy) => {
      const buckets = new Map(); const add = (key, x, y, r) => { let a = buckets.get(key); if (!a) buckets.set(key, (a = [])); a.push(x, y, r); };
      const ex = rc ? HALO * S.fa : 0; let n = 0;
      const x0 = L - G, sx = ((ox % G) + G) % G, sy = ((oy % G) + G) % G;
      for (let y = sy - G; y < H + G; y += G) {
        const row = Math.round((y - oy) / G), off = (((row % 2) + 2) % 2) ? G / 2 : 0;
        for (let x = ((sx + off) % G) - G; x < W + G; x += G) {
          if (x < x0) continue;
          let fc = 0, fh = 0, fy = 0;
          if (S.in > 0.01) { const dx = x - S.x, dy = y - S.y, d2 = dx * dx + dy * dy; if (d2 < CUR * CUR) { const f = 1 - Math.sqrt(d2) / CUR; fc = f * f * S.in; } }
          if (rc && S.fa > 0.01) { const dx = Math.max(rc.l - x, 0, x - rc.r), dy = Math.max(rc.t - y, 0, y - rc.b), d = Math.hypot(dx, dy); if (d < ex + 1 && (dx > 0 || dy > 0)) fh = (1 - d / (HALO + 1)) * S.fa; }
          for (const r of S.rip) { const rad = (now - r.t) * RIP_V, d = Math.hypot(x - r.x, y - r.y), q = 1 - Math.abs(d - rad) / RIP_W; if (q > 0) fy = Math.max(fy, q * (1 - (now - r.t) / RIP_LIFE)); }
          if (fc < 0.03 && fh < 0.03 && fy < 0.03) continue;
          n++;
          if (fy >= Math.max(fc, fh)) add('y' + Math.round(fy * LV), x, y, R0 + fy * 3.2);
          else if (fh > fc) add((S.tone === 'y' ? 'y' : 'h') + Math.round(fh * LV), x, y, R0 + fh * 1.9);
          else add('g' + Math.round(fc * LV), x, y, R0 + fc * 2.6);
        }
      }
      for (const [key, a] of buckets) { const lv = +key.slice(1); ctx.fillStyle = (key[0] === 'y' ? YL : key[0] === 'h' ? HAL : GRAY)[lv]; ctx.beginPath();
        for (let i = 0; i < a.length; i += 3) { ctx.moveTo(a[i] + a[i + 2], a[i + 1]); ctx.arc(a[i], a[i + 1], a[i + 2], 0, Math.PI * 2); } ctx.fill(); }
      return n;
    };
    const kick = force => { if (document.hidden) return; if ((reduce || !on.current) && !force) return; if (!raf) raf = requestAnimationFrame(frame); };
    const local = e => { const r = host.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const measure = () => { if (!S.el || !S.el.isConnected) { S.rect = S.rect; return; } const r = host.getBoundingClientRect(), b = S.el.getBoundingClientRect();
      S.rect = { l: b.left - r.left, t: b.top - r.top, r: b.right - r.left, b: b.bottom - r.top }; };
    const setTarget = el => {
      if (el === S.el) return; S.el = el;
      if (el) { measure(); S.tfa = 1; S.tone = el.dataset.bgTone || ''; }
      else S.tfa = 0;
      kick();
    };
    const findT = n => n?.closest?.('[data-bg]') || null;
    const onMove = e => { if (!on.current || reduce || e.pointerType === 'touch') return; const [x, y] = local(e); S.mx = x; S.my = y; S.tin = x > L ? 1 : 0;
      S.tpx = -(x - (L + W) / 2) * PAR; S.tpy = -(y - H / 2) * PAR; kick(); };
    const onOver = e => { if (!on.current || reduce) return; setTarget(findT(e.target)); };
    const onLeaveWin = () => { S.tin = 0; setTarget(null); kick(); };
    const onDown = e => { if (!on.current || reduce || !host.contains(e.target)) return; const [x, y] = local(e); if (x < L) return;
      S.rip.push({ x, y, t: performance.now() }); kick(); };
    const onFocus = e => { if (!on.current || reduce) return; const t = findT(e.target); if (t && e.target.matches(':focus-visible')) setTarget(t); };
    const onBlur = e => { if (S.el && !S.el.contains(e.relatedTarget)) { if (!S.el.matches(':hover')) setTarget(null); } };
    const onScroll = () => { if (S.el) { measure(); kick(); } };
    const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; last = 0; } else kick(true); };
    reset.current = () => { S.tin = 0; S.mx = S.x; S.my = S.y; S.rip = []; S.el = null; S.tfa = 0; S.fa = 0; kick(true); };
    const ro = new ResizeObserver(size); ro.observe(host);
    host.addEventListener('pointermove', onMove); host.addEventListener('pointerover', onOver); host.addEventListener('pointerleave', onLeaveWin);
    addEventListener('pointerdown', onDown, true); host.addEventListener('focusin', onFocus); host.addEventListener('focusout', onBlur);
    const sc = scroller.current; sc?.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    size();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerover', onOver); host.removeEventListener('pointerleave', onLeaveWin);
      removeEventListener('pointerdown', onDown, true); host.removeEventListener('focusin', onFocus); host.removeEventListener('focusout', onBlur); sc?.removeEventListener('scroll', onScroll); document.removeEventListener('visibilitychange', onVis); };
  }, [reduce]); // eslint-disable-line
  // 메뉴(문서 쪽)를 떠나면 반응 정리: 다음에 들어올 때 이전 카드의 둘레가 남지 않게
  useEffect(() => { if (!active) reset.current?.(); }, [active]);
  return <canvas ref={cv} className="fld" aria-hidden="true" />;
}
