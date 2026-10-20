import { useEffect, useRef, useState } from 'react';
import { motion, useAnimate, useSpring } from 'motion/react';
/* 단순 도형 캐릭터 (머리·몸·손). 눈은 포인터를 따라본다 (Rive 인터랙티브 히어로의 '반응하는 캐릭터' 아이디어만 차용).
   박에 맞춘 들썩임은 audio.currentTime 기반 getBeat()로 매 프레임 계산한다. */
export default function Character({ mode, dx, scale, getBeat, excited, reduce, pose = 'idle', cue = 0, lookAt }) {
  const [scope, animate] = useAnimate();
  const bob = useRef(null), shadow = useRef(null);
  const ex = useSpring(0, { stiffness: 300, damping: 20 }), ey = useSpring(0, { stiffness: 300, damping: 20 });
  const first = useRef(true);
  /* v4.2 고개: 포인터(마우스) 또는 방금 고른 메뉴 쪽으로 돌림. hl = 얼굴 이동(px, 음수 = 왼쪽) */
  const hl = useSpring(-8, { stiffness: 220, damping: 18 });
  const headRef = useRef(null), faceRef = useRef(null);
  useEffect(() => hl.on('change', v => {
    if (headRef.current) headRef.current.style.transform = `rotate(${v * 0.35}deg)`;
    if (faceRef.current) faceRef.current.style.transform = `translateX(${v}px)`;
  }), [hl]);
  const aimAt = (x, y) => {
    const head = scope.current?.querySelector('.c-head'); if (!head) return;
    const b = head.getBoundingClientRect(), dxp = x - (b.left + b.width / 2), dyp = y - (b.top + b.height / 2);
    const d = Math.hypot(dxp, dyp) || 1, k = Math.min(1, d / 400) * 9 * scale;
    ex.set(dxp / d * k); ey.set(dyp / d * k); hl.set(Math.max(-14, Math.min(14, dxp / 28)));
  };
  /* v4.2 메뉴가 바뀔 때마다(박에 맞춰 App 이 cue 를 올림): 깡충 + 두 박 동안 무대 화면을 가리킴 */
  const [react, setReact] = useState(false);
  const firstCue = useRef(true);
  useEffect(() => {
    if (firstCue.current) { firstCue.current = false; return; }
    if (mode !== 'home') return;
    const p = lookAt?.(); if (p) aimAt(p.x, p.y);
    if (reduce) return;
    setReact(true);
    animate('.char-hop', { y: [0, -44 * scale, 0] }, { duration: 0.3, ease: ['easeOut', 'easeIn'] });
    animate('.char-squash', { scaleY: [1, 1.08, 0.86, 1], scaleX: [1, 0.95, 1.1, 1] }, { duration: 0.42, times: [0, 0.35, 0.72, 1] });
    const id = setTimeout(() => setReact(false), 860);
    return () => clearTimeout(id);
  }, [cue]); // eslint-disable-line

  // 이동 + 깡충
  useEffect(() => {
    const instant = first.current; first.current = false;
    const to = mode === 'play' ? dx : 0;
    if (instant || reduce) { animate(scope.current, { x: to }, { duration: 0 }); return; }
    const going = mode === 'play';
    animate(scope.current, { x: to }, { duration: going ? 0.58 : 0.46, delay: going ? 0.2 : 0, ease: [0.45, 0, 0.25, 1] });
    animate('.char-hop', { y: [0, -(going ? 190 : 120) * scale, 0] }, { duration: going ? 0.58 : 0.46, delay: going ? 0.2 : 0, ease: ['easeOut', 'easeIn'] });
    animate('.char-shadow', { scale: [1, 0.55, 1], opacity: [1, 0.5, 1] }, { duration: going ? 0.58 : 0.46, delay: going ? 0.2 : 0 });
    if (going) animate('.char-squash', { scaleY: [1, 0.78, 1.08, 1], scaleX: [1, 1.16, 0.95, 1] }, { duration: 0.36, delay: 0.78, ease: 'easeOut' });
  }, [mode, dx]); // eslint-disable-line

  // 플레이 버튼에 마우스를 올리면 살짝 들썩 (기대감)
  useEffect(() => {
    if (!excited || reduce || mode !== 'home') return;
    animate('.char-hop', { y: [0, -36 * scale, 0] }, { duration: 0.32, ease: ['easeOut', 'easeIn'] });
  }, [excited]); // eslint-disable-line

  // 눈: 포인터 방향
  useEffect(() => {
    const on = e => { if (modeRef.current === 'home') aimAt(e.clientX, e.clientY); };
    addEventListener('pointermove', on); return () => removeEventListener('pointermove', on);
  }, [scale, ex, ey, scope]);
  const modeRef = useRef(mode); modeRef.current = mode;
  useEffect(() => { if (mode === 'play') { ex.set(10 * scale); ey.set(-2 * scale); hl.set(0); } }, [mode, scale, ex, ey]); // eslint-disable-line

  // 박 들썩임
  useEffect(() => {
    if (reduce) return;
    let raf;
    const loop = now => {
      const { beat, playing } = getBeat(now);
      const f = ((beat % 1) + 1) % 1, k = Math.exp(-f * 9), c = playing ? 1 : 0.45;
      const lift = Math.sin(Math.PI * f) * (playing ? 18 : 4) * scale; // v4.0 홈은 139.5 BPM 이라 예전(반 박) 보다 낮게
      if (bob.current) bob.current.style.transform = `translateY(${-lift}px) scale(${1 + 0.05 * c * k},${1 - 0.07 * c * k})`;
      if (shadow.current) shadow.current.style.transform = `scaleX(${1 - 0.1 * Math.sin(Math.PI * f) * c})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, [getBeat, scale, reduce]);

  /* v4.1 자리표시 캐릭터 (최종 그림 아님): 리듬천국식 — 굵고 고른 검은 외곽선, 흰 몸(검은 면 위에서도 보임),
     큰 둥근 머리 + 바가지 머리, 세로 타원 눈(하이라이트), 웃는 입, 국수 팔다리, 노란 스카프 하나만 강조색.
     좌표: viewBox 240×400, 발 가운데 = (120, 392). pose 로 팔 각도만 바꿈(CSS transition) */
  const P = POSES[mode === 'play' ? 'ready' : react ? 'present' : pose] || POSES.idle;
  return (
    <div className="char" ref={scope} aria-hidden="true">
      <div className="char-shadow-wrap"><div className="char-shadow" ref={shadow} /></div>
      <div className="char-hop"><div className="char-squash"><div className="char-bob" ref={bob}>
        <svg className="c-svg" viewBox="0 0 240 400" overflow="visible">
          <g className="c-ink" stroke="#111" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
            {/* 다리 + 신발 */}
            <path d="M104 304 L100 376 M136 304 L140 376" fill="none" strokeWidth="17" />
            <ellipse cx="94" cy="384" rx="24" ry="12" fill="#111" strokeWidth="6" /><ellipse cx="146" cy="384" rx="24" ry="12" fill="#111" strokeWidth="6" />
            {/* 윗몸: 기대는 자세면 허리 기준으로 왼쪽(면 쪽)으로 기울임 */}
            <g className="c-headg" style={{ transform: `rotate(${P.t || 0}deg)`, transformOrigin: '120px 310px' }}>
            {/* 뒤쪽 팔(화면 오른쪽) */}
            <g className="c-arm" style={{ transform: `rotate(${P.r}deg)`, transformOrigin: '160px 226px' }}>
              <path d="M160 226 L160 300" fill="none" strokeWidth="16" /><circle cx="160" cy="306" r="15" fill="#fff" strokeWidth="7" />
            </g>
            {/* 몸통 */}
            <rect x="70" y="200" width="100" height="114" rx="44" fill="#fff" />
            {/* 노란 스카프 (유일한 강조색) */}
            <path d="M92 206 Q120 222 148 206 L140 226 Q120 236 100 226 Z" fill="#FFD400" strokeWidth="6" />
            <path d="M126 226 L138 252 L120 246 Z" fill="#FFD400" strokeWidth="6" />
            {/* 앞쪽 팔(화면 왼쪽) */}
            <g className="c-arm" style={{ transform: `rotate(${P.l}deg)`, transformOrigin: '80px 226px' }}>
              <path d="M80 226 L80 300" fill="none" strokeWidth="16" /><circle cx="80" cy="306" r="15" fill="#fff" strokeWidth="7" />
            </g>
            {/* 머리 */}
            <g ref={headRef} style={{ transformOrigin: '120px 196px', transform: 'rotate(-2.8deg)' }}>
              <circle className="c-head" cx="120" cy="124" r="78" fill="#fff" />
              <path d="M44 118 Q46 46 120 44 Q194 46 196 118 Q176 92 150 96 Q128 76 104 92 Q76 86 44 118 Z" fill="#111" strokeWidth="6" />
              <motion.g style={{ x: ex, y: ey }}>
                <g ref={faceRef} style={{ transform: 'translateX(-8px)' }}>
                  <ellipse cx="98" cy="134" rx="9" ry="17" fill="#111" stroke="none" /><ellipse cx="142" cy="134" rx="9" ry="17" fill="#111" stroke="none" />
                  <circle cx="101" cy="127" r="3.6" fill="#fff" stroke="none" /><circle cx="145" cy="127" r="3.6" fill="#fff" stroke="none" />
                  <path d="M106 160 Q120 176 134 160 Q120 166 106 160 Z" fill="#111" strokeWidth="5" />
                </g>
              </motion.g>
            </g>
            </g>
          </g>
        </svg>
      </div></div></div>
    </div>
  );
}
/* 팔 각도: 0 = 아래로 늘어뜨림, +90 = 화면 왼쪽으로 뻗음, 음수 = 오른쪽. look = 얼굴 방향(px, 음수 왼쪽) */
const POSES = {
  idle: { l: 12, r: -12, look: -6 },
  lean: { l: 80, r: -30, look: -12, t: -7 },   // (v4.1) 왼팔을 검은 면 가장자리에 짚음
  present: { l: 22, r: -148, t: 4 },             // v4.2 메뉴가 바뀔 때: 뒤쪽 팔을 번쩍 들어 위 무대 화면을 가리킴
  point: { l: 128, r: -14, look: -10 }, // 왼팔을 비스듬히 들어 메뉴를 가리킴
  ready: { l: 18, r: -18, look: 0 },     // 플레이: 정면, 팔 내림
};
