import { motion } from 'motion/react';
/* 튜토리얼 자리 표시. 실제 내용은 이후 리듬천국 레퍼런스로 설계.
   제목 글자: Magic UI Comic Text 원리(굵은 외곽선 + 망점 그림자 + 기울기)를 흑백으로. */
export default function Tutorial({ reduce }) {
  return (
    <motion.section className="tut" aria-label="튜토리얼" initial="hide" animate="show" exit="hide"
      variants={{ show: { transition: { staggerChildren: 0.08 } }, hide: { transition: { staggerChildren: 0.03, staggerDirection: -1 } } }}>
      <motion.h2 className="tut-title" variants={reduce ? { hide: { opacity: 0 }, show: { opacity: 1 } } : {
        hide: { opacity: 0, scale: 0.4, rotate: -14 }, show: { opacity: 1, scale: 1, rotate: -3, transition: { type: 'spring', stiffness: 520, damping: 16 } } }}>
        <span className="tut-dots" aria-hidden="true" />튜토리얼
      </motion.h2>
      <motion.div className="tut-frame" variants={{ hide: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } } }}>
        <span className="tut-tag">PLACEHOLDER</span>
      </motion.div>
    </motion.section>
  );
}
