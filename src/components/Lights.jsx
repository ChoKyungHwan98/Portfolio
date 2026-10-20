import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
/* 무대 조명: 암전 → 핀 조명.
   원리: Aceternity Spotlight / Lamp Section Header, React Bits LightRays · LightPillar(위에서 떨어지는 빛기둥),
   motion.dev Curtains: Iris(구멍이 열리며 드러남), React Bits Particles · Aceternity Sparkles(빛 속 먼지).
   구현은 새로: 전체를 덮는 검정 면에 SVG 마스크로 원뿔·바닥 웅덩이만 뚫는다. */
const LEVEL = { home: 0, move: 0, stutter: 0.74, dark: 0.965, spot: 0.965, tutorial: 0.965 };
/* v3.5: 암전을 두 장으로. 1장(타) 불투명도 A, 2장(당) B 를 겹치면 1-(1-A)(1-B) = 0.965 → 예전 한 장짜리와 같은 어둠.
   핀 조명 박에 두 장을 같은 어둠의 '구멍 뚫린 면'(마스크)으로 바꿔 끼우므로 바꿔치기가 보이지 않는다. */
const A = 0.74, B = 1 - (1 - 0.965) / (1 - A);
const SNAP = [0.2, 0.9, 0.1, 1];
const canClip = typeof window !== 'undefined' && !!window.SVGClipPathElement;

function Dust({ cone }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d'), d = devicePixelRatio || 1;
    cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    const { cx, topW, botW, bottom } = cone;
    const P = Array.from({ length: 34 }, () => ({ y: Math.random() * bottom, u: Math.random() * 2 - 1, r: 0.6 + Math.random() * 1.8, v: 6 + Math.random() * 14, ph: Math.random() * 6.28 }));
    let raf, last = performance.now();
    const loop = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of P) {
        p.y += p.v * dt; if (p.y > bottom) p.y = 0;
        const half = topW + (botW - topW) * (p.y / bottom), x = cx + p.u * half * 0.85 + Math.sin(now / 1400 + p.ph) * 6;
        ctx.globalAlpha = 0.25 + 0.35 * Math.sin(now / 900 + p.ph) ** 2; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, [cone]);
  return <canvas ref={ref} className="dust" aria-hidden="true" />;
}

export default function Lights({ phase: live, box, reduce }) {
  // 돌아가기: 무대 어둠이 0.35초 동안 통째로 옅어지는 사이, 그림은 마지막 장면 그대로 둔다(면이 먼저 사라지지 않게)
  const last = useRef('move'); if (live !== 'home') last.current = live;
  const phase = live === 'home' ? last.current : live;
  const level = LEVEL[phase] ?? 0;
  const lit = phase === 'spot' || phase === 'tutorial';
  const cut = phase === 'stutter' || phase === 'dark';
  if (!box) return null;
  const W = innerWidth, H = innerHeight;
  const cx = box.cx, bottom = box.bottom, topW = box.w * 0.16, botW = box.w * 0.92;
  const cone = { cx, topW, botW, bottom };
  const R = Math.hypot(botW * 1.4, bottom + botW * 0.4 + 10) * 1.05;
  const snap = canClip && !reduce;
  const conePts = `${cx - topW},-10 ${cx + topW},-10 ${cx + botW},${bottom} ${cx - botW},${bottom}`;
  return (
    <motion.div className="lights" aria-hidden="true" initial={false} animate={{ opacity: live !== 'home' && level > 0 ? 1 : 0 }}
      transition={{ duration: live !== 'home' && level > 0 ? 0 : (reduce ? 0.2 : 0.35) }}>
      {!lit && (<>
        {/* 원리: Codrops Multi-Layer Page Reveal — 면 여러 장이 시차를 두고 덮는다. 여기선 박 두 개(타·당)에 한 장씩 */}
        <motion.div className="cut cut-a" initial={false}
          animate={level > 0 ? { x: '0%', opacity: A } : { x: reduce ? '0%' : '-105%', opacity: reduce ? 0 : A }}
          transition={{ duration: level > 0 && !reduce ? 0.09 : 0, ease: SNAP }} />
        <motion.div className="cut cut-b" initial={false}
          animate={phase === 'dark' ? { y: '0%', opacity: B } : { y: reduce ? '0%' : '-105%', opacity: reduce ? 0 : B }}
          transition={{ duration: phase === 'dark' && !reduce ? 0.08 : 0, ease: SNAP }} />
      </>)}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d6d6d6" /><stop offset="1" stopColor="#a8a8a8" />
          </linearGradient>
          <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".34" /><stop offset=".75" stopColor="#fff" stopOpacity=".12" /><stop offset="1" stopColor="#fff" stopOpacity=".2" />
          </linearGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
          <filter id="pool" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
          {/* 원리: motion.dev AnimateView clip-path — 원 하나가 조명 구멍(천장 위)에서 순식간에 커지며 빛기둥을 '툭' 켠다 */}
          <clipPath id="spotClip" clipPathUnits="userSpaceOnUse">
            <motion.circle cx={cx} cy={-10} initial={false} animate={{ r: lit ? R : 0 }} transition={{ duration: lit ? 0.13 : 0, ease: SNAP }} />
          </clipPath>
          <mask id="lightsMask" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <rect width={W} height={H} fill="#fff" />
            <AnimatePresence>
              {lit && (
                <g key="cone" clipPath={snap ? 'url(#spotClip)' : undefined}>
                  <polygon points={conePts} fill="url(#beam)" filter="url(#soft)" />
                  <ellipse cx={cx} cy={bottom} rx={botW * 1.08} ry={botW * 0.24} fill="#000" filter="url(#pool)" />
                  <ellipse cx={cx} cy={(box.top + bottom) / 2} rx={box.w * 0.55} ry={(bottom - box.top) * 0.56} fill="#000" filter="url(#pool)" />
                </g>
              )}
            </AnimatePresence>
          </mask>
        </defs>
        {lit && <rect width={W} height={H} fill="#050505" mask="url(#lightsMask)" opacity={level} />}
        <AnimatePresence>
          {lit && (
            <motion.polygon key="haze" points={conePts} fill="url(#haze)" filter="url(#soft)" clipPath={snap ? 'url(#spotClip)' : undefined}
              initial={reduce ? { opacity: 0 } : false} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: reduce ? 0.15 : 0 }} />
          )}
        </AnimatePresence>
      </svg>
      {lit && !reduce && <Dust cone={cone} />}
    </motion.div>
  );
}
