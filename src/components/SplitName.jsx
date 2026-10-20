import { motion } from 'motion/react';
/* 글자 단위 등장. 원리: React Bits SplitText / Motion Primitives TextEffect (글자를 나눠 순차 등장).
   여기서는 아래에서 튀어 오르며 제자리에 '쿵' 내려앉는 스프링으로 각색. */
export default function SplitName({ text, delay = 0, className, as: Tag = 'h1' }) {
  const M = motion[Tag] || motion.h1;
  return (
    <M className={className} aria-label={text} initial="hide" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: delay } } }}>
      {[...text].map((ch, i) => (
        <motion.span key={i} aria-hidden="true" className="ch"
          variants={{ hide: { opacity: 0, y: '55%', rotate: -8, scale: 0.8 }, show: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { type: 'spring', stiffness: 620, damping: 22 } } }}>
          {ch}
        </motion.span>
      ))}
    </M>
  );
}
