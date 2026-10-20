import { useEffect, useRef } from 'react';
/* v3.9 화면 어디를 눌러도 튀는 노란 불꽃. 원리: React Bits ClickSpark (캔버스에 바깥으로 뻗는 짧은 선) 를 다시 짬.
   - 노랑 #FFD400 + 검은 테두리(밑에 굵은 검은 선을 먼저 그림) → 검은 면·흰 판 어디서나 읽힘
   - pointerdown 순간 바로 그려 손 지연 없음. 캔버스는 pointer-events:none 이라 클릭을 막지 않음
   - 키보드로 누른 버튼(click.detail===0)은 그 버튼 가운데서 터짐
   - 움직임 줄이기 설정이면 끔. enabled=false(플레이 중)면 끔 */
const Y = '#FFD400', INK = '#111', LIFE = 300, RAYS = 9;
export default function ClickSpark({ enabled = true }) {
  const ref = useRef(null), on = useRef(enabled);
  on.current = enabled;
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const cv = ref.current, ctx = cv.getContext('2d'); let sparks = [], raf = 0;
    const size = () => { const d = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener('resize', size);
    const draw = now => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      sparks = sparks.filter(s => now - s.t0 < LIFE);
      ctx.lineCap = 'round';
      for (const s of sparks) {
        const p = Math.max(0, (now - s.t0) / LIFE), e = 1 - Math.pow(1 - p, 4); // 처음에 확 튀고 끝에서 멈춤
        if (p < 0.22) { // 누른 자리의 짧은 섬광
          const r = 7 + 9 * (p / 0.22);
          ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.globalAlpha = 1 - p / 0.22; ctx.fill();
          ctx.beginPath(); ctx.arc(s.x, s.y, r - 2.5, 0, Math.PI * 2); ctx.fillStyle = Y; ctx.fill(); ctx.globalAlpha = 1;
        }
        for (let k = 0; k < RAYS; k++) {
          const a = s.a0 + (k / RAYS) * Math.PI * 2, L = s.len[k];
          const r0 = 10 + 30 * e * L, r1 = r0 + 18 * (1 - p) * L;
          if (r1 - r0 < 0.5) continue;
          const x0 = s.x + Math.cos(a) * r0, y0 = s.y + Math.sin(a) * r0, x1 = s.x + Math.cos(a) * r1, y1 = s.y + Math.sin(a) * r1;
          const w = 5.5 * (1 - p) + 1.5;
          ctx.strokeStyle = INK; ctx.lineWidth = w + 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
          ctx.strokeStyle = Y; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
      }
      raf = sparks.length ? requestAnimationFrame(draw) : 0;
    };
    const burst = (x, y) => {
      if (!on.current || mq.matches) return;
      if (sparks.length > 24) sparks.shift();
      sparks.push({ x, y, t0: performance.now(), a0: Math.random() * Math.PI, len: Array.from({ length: RAYS }, (_, k) => (k % 2 ? 0.7 : 1) * (0.85 + Math.random() * 0.3)) });
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const down = e => { if (e.button === 0 || e.pointerType !== 'mouse') burst(e.clientX, e.clientY); };
    const click = e => { if (e.detail !== 0 || !(e.target instanceof Element)) return; const r = e.target.getBoundingClientRect(); if (r.width) burst(r.left + r.width / 2, r.top + r.height / 2); };
    addEventListener('pointerdown', down, { capture: true, passive: true });
    addEventListener('click', click, { capture: true, passive: true });
    return () => { removeEventListener('pointerdown', down, true); removeEventListener('click', click, true); removeEventListener('resize', size); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} className="spark-layer" aria-hidden="true" />;
}
