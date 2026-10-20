import { motion } from 'motion/react';
/* 자리마다 세로로 굴러가는 숫자. 원리: Motion Primitives SlidingNumber / React Bits Counter / Osmo Number Odometer. */
export default function SlidingNumber({ value, className }) {
  const digits = String(Math.round(value)).split('');
  return (
    <span className={'slide-num ' + (className || '')} aria-hidden="true">
      {digits.map((d, i) => (
        <span key={digits.length - i} className="sn-col">
          <motion.span className="sn-strip" initial={false} animate={{ y: `${-Number(d) * 10}%` }} transition={{ type: 'spring', stiffness: 380, damping: 32 }}>
            {'0123456789'.split('').map(n => <span key={n}>{n}</span>)}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
