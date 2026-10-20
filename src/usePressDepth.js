import { useSpring, useReducedMotion } from 'motion/react';
/* 누르면 가라앉으며 누른 쪽으로 기우는 손맛. 원리: 21st.dev press-depth (Motion 스프링 버튼).
   누른 지점이 중심에서 떨어진 만큼 rotateX/rotateY 로 기울고, 떼면 스프링으로 돌아온다.
   가라앉는 깊이(y·그림자)는 각 요소의 whileTap 과 :active CSS 가 맡는다. */
export default function usePressDepth(max = 7) {
  const reduce = useReducedMotion();
  const cfg = { stiffness: 520, damping: 28, mass: 0.5 };
  const rx = useSpring(0, cfg), ry = useSpring(0, cfg);
  const release = () => { rx.set(0); ry.set(0); };
  const onPointerDown = e => {
    if (reduce) return;
    const b = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (b.left + b.width / 2)) / (b.width / 2), dy = (e.clientY - (b.top + b.height / 2)) / (b.height / 2);
    ry.set(Math.max(-1, Math.min(1, dx)) * max * 0.6); rx.set(-Math.max(-1, Math.min(1, dy)) * max);
  };
  return { style: { rotateX: rx, rotateY: ry, transformPerspective: 700 }, handlers: { onPointerDown, onPointerUp: release, onPointerLeave: release, onPointerCancel: release } };
}
