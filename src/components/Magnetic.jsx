import { useEffect, useRef } from 'react';
import { motion, useSpring, useReducedMotion } from 'motion/react';
/* 자석 버튼. 원리: React Bits Magnet / Motion Primitives Magnetic / Aceternity Magnetic Button.
   포인터가 가까이 오면 살짝 끌려가고, 멀어지면 스프링으로 돌아온다. */
export default function Magnetic({ children, strength = 0.22, range = 70, className, style }) {
  const ref = useRef(null), reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.6 }), y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.6 });
  useEffect(() => {
    if (reduce || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const on = e => {
      const el = ref.current; if (!el) return;
      const b = el.getBoundingClientRect();
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2, dx = e.clientX - cx, dy = e.clientY - cy;
      const inside = Math.abs(dx) < b.width / 2 + range && Math.abs(dy) < b.height / 2 + range;
      x.set(inside ? dx * strength : 0); y.set(inside ? dy * strength : 0);
    };
    addEventListener('pointermove', on); return () => removeEventListener('pointermove', on);
  }, [reduce, strength, range, x, y]);
  return <motion.div ref={ref} className={className} style={{ ...style, x, y }}>{children}</motion.div>;
}
