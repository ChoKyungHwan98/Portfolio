import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import SlidingNumber from './SlidingNumber.jsx';
/* 음량 다이얼. 원리: React Bits CometDial (호를 따라 끌면 값이 스프링으로 따라오고, 빠르게 돌리면 꼬리가 생김).
   코드는 새로 작성: 흑백 원판 + 굵은 외곽선 + 리듬천국식 단단한 그림자. */
const R = 64, SWEEP = 300, START = 90 + (360 - SWEEP) / 2, K = 8;
const pt = d => { const a = d * Math.PI / 180; return [100 + Math.cos(a) * R, 100 + Math.sin(a) * R]; };
const arc = (a0, a1) => { const [x0, y0] = pt(a0), [x1, y1] = pt(a1); return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };

export default function CometDial({ value, onChange }) {
  const reduce = useReducedMotion();
  const svg = useRef(null), lit = useRef(null), head = useRef(null), tail = useRef([]);
  const st = useRef({ shown: value, prev: value, vel: 0, anim: null, drag: false });
  const [drag, setDrag] = useState(false);
  const paint = (dt = 1 / 60) => {
    const S = st.current, v = dt > 0 ? (S.shown - S.prev) / dt : 0; S.prev = S.shown; S.vel += (v - S.vel) * 0.35;
    const a = START + (S.shown / 100) * SWEEP;
    lit.current?.setAttribute('d', S.shown > 0.3 ? arc(START, a) : '');
    const [hx, hy] = pt(a); head.current?.setAttribute('cx', hx); head.current?.setAttribute('cy', hy);
    const sp = Math.min(1, Math.abs(S.vel) / 260), dir = Math.sign(S.vel) || 1, seg = (90 * sp) / K;
    tail.current.forEach((p, j) => {
      if (!p) return;
      let a0 = dir > 0 ? a - (j + 1) * seg : a + j * seg, a1 = dir > 0 ? a - j * seg : a + (j + 1) * seg;
      a0 = Math.max(START, a0); a1 = Math.min(START + SWEEP, a1);
      if (seg < 0.05 || a1 - a0 < 0.05) { p.style.opacity = 0; return; }
      const w = 1 - j / K; p.setAttribute('d', arc(a0, a1)); p.setAttribute('stroke-width', (13 + 12 * w * sp).toFixed(1)); p.style.opacity = (w * sp * 0.55).toFixed(3);
    });
  };
  useEffect(() => { paint(); }, []); // eslint-disable-line
  const set = (to) => {
    const v = Math.max(0, Math.min(100, Math.round(to))); onChange(v);
    const S = st.current; S.anim?.stop();
    if (reduce) { S.shown = S.prev = v; S.vel = 0; paint(); return; }
    let last = performance.now();
    S.anim = animate(S.shown, v, { type: 'spring', stiffness: 420, damping: 26,
      onUpdate: x => { const n = performance.now(); S.shown = x; paint(Math.max(1e-3, (n - last) / 1000)); last = n; },
      onComplete: () => { S.vel = 0; paint(); } });
  };
  const valAt = (cx, cy) => {
    const b = svg.current.getBoundingClientRect(), x = (cx - b.left) / b.width * 200 - 100, y = (cy - b.top) / b.height * 200 - 100;
    let rel = ((Math.atan2(y, x) * 180 / Math.PI - START) % 360 + 720) % 360;
    if (rel > SWEEP) rel = rel < SWEEP + (360 - SWEEP) / 2 ? SWEEP : 0; return rel / SWEEP * 100;
  };
  useEffect(() => {
    const el = svg.current; const wheel = e => { e.preventDefault(); set(value + (e.deltaY < 0 ? 5 : -5)); };
    el.addEventListener('wheel', wheel, { passive: false }); return () => el.removeEventListener('wheel', wheel);
  });
  return (
    <div className="dial" data-drag={drag || undefined}>
      <div className="dial-disc" />
      <svg ref={svg} viewBox="0 0 200 200" role="slider" tabIndex={0} aria-label="음량" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-valuetext={value + '%'}
        onPointerDown={e => { st.current.drag = true; setDrag(true); svg.current.setPointerCapture(e.pointerId); set(valAt(e.clientX, e.clientY)); }}
        onPointerMove={e => { if (st.current.drag) set(valAt(e.clientX, e.clientY)); }}
        onPointerUp={() => { st.current.drag = false; setDrag(false); }} onPointerCancel={() => { st.current.drag = false; setDrag(false); }}
        onKeyDown={e => {
          const big = e.shiftKey ? 10 : 2; let to = null;
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') to = value + big;
          if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') to = value - big;
          if (e.key === 'Home') to = 0; if (e.key === 'End') to = 100;
          if (to != null) { e.preventDefault(); e.stopPropagation(); set(to); }
        }}>
        <path className="trk" d={arc(START, START + SWEEP)} strokeWidth="13" />
        <g>{Array.from({ length: K }, (_, j) => <path key={j} className="tail" ref={el => (tail.current[j] = el)} style={{ opacity: 0 }} />)}</g>
        <path className="lit" ref={lit} strokeWidth="13" />
        <circle className="head" ref={head} r="15" strokeWidth="7" />
      </svg>
      <div className="dial-read" aria-hidden="true"><SlidingNumber value={value} className="dial-num" /><span className="dial-cap">음량</span></div>
    </div>
  );
}
