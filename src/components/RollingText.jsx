import { motion } from 'motion/react';
/* 롤링 글자. 원리: motion.dev 'Rolling text button' / Motion Primitives TextRoll.
   같은 글자를 위아래로 겹쳐 두고, 활성화되면 글자마다 조금씩 늦게 위로 굴러 올라간다. */
export default function RollingText({ text, active }) {
  const chars = [...text];
  return (
    <span className="roll" aria-hidden="true">
      {[0, 1].map(row => (
        <span key={row} className={'roll-row r' + row}>
          {chars.map((c, i) => (
            <motion.span key={i} className="roll-ch" initial={false}
              animate={{ y: active ? '-100%' : '0%' }}
              transition={{ type: 'spring', stiffness: 700, damping: 34, delay: i * 0.022 }}>{c}</motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}
