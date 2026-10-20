import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
/* v4.2 오른쪽 '미리보기 무대': 위에서 줄 두 개로 매달린 큰 무대 화면(리듬천국 게임 선택 화면처럼).
   고른 메뉴의 미리보기가 '다음 박'에 위에서 쾅 떨어져 바뀐다(박 맞춤은 App 이 stageSel 로 넘김).
   메뉴를 목록으로 또 보여주지 않고, 그 칸에 무엇이 들어있는지 미리 보여 줌. 화면 아무 데나 누르면 그 칸이 열림 */
import { PROJECTS } from '../pages/Skeleton.jsx';
/* v4.3 포스터 = 포트폴리오 목록의 '대표 3' 과 같은 순서(전투·보스 기획(예정) · Pico-Bang! · AI 리뷰). 장르 대신 기획 분야 꼬리표 */
export const PREVIEW_PROJECTS = PROJECTS.filter(p => p.tier === 'feature');
const LABEL = ['대표 프로젝트 3', '이력서 미리보기', '자기소개서 미리보기'];
const NAME = ['포트폴리오', '이력서', '자기소개서'];
const SLAM = {
  enter: { y: '-42%', opacity: 0, rotate: -2.5, scaleY: 1.06 },
  in: { y: '0%', opacity: 1, rotate: 0, scaleY: 1, transition: { type: 'spring', stiffness: 900, damping: 30, opacity: { duration: 0.05 }, staggerChildren: 0.035 } },
  out: { y: '18%', opacity: 0, scaleY: 0.92, transition: { duration: 0.09, ease: [0.55, 0, 1, 0.45] } },
};
const KID = { enter: { y: -70, opacity: 0 }, in: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 1000, damping: 26 } } };

function Posters() {
  return (
    <div className="pv-posters">
      {PREVIEW_PROJECTS.map((p, i) => (
        <motion.div key={p.slug} variants={KID} className={'pst p' + i}>
          <div className="pst-art"><span className="pst-ph">{p.planned ? '준비 중' : '대표 이미지'}</span></div>
          <div className="pst-body">
            <b className="pst-title">{p.title}</b>
            <span className={'pst-genre' + (p.planned ? ' y' : '')}>{p.tag}</span>
            <span className="pst-num"><small>핵심 수치</small><em>—</em></span>
          </div>
        </motion.div>))}
    </div>);
}
function Profile() {
  /* v4.2.1 사진 칸 뺌(사진은 #/resume 안에만). 이름·역할을 크게, 정보 칸 셋을 가로로 채움 */
  return (
    <motion.div variants={KID} className="pv-card">
      <i className="pv-ribbon" aria-hidden="true" />
      <b className="pv-name">조경환</b>
      <span className="pv-role">전투 · 시스템 게임 기획자 지망생</span>
      <span className="pv-grid">
        {['학력', '경력', '자격'].map(k => <span key={k} className="pv-cell"><small>{k}</small><i /><i /></span>)}
      </span>
    </motion.div>);
}
function Letter() {
  return (
    <motion.div variants={KID} className="pv-letter">
      <i className="pv-ribbon" aria-hidden="true" />
      <span className="pv-ltitle">제목 자리</span>
      {[96, 100, 90, 98, 84, 62].map((w, i) => <i key={i} className="ln" style={{ width: w + '%' }} />)}
      <span className="pv-foot"><span className="pv-sign">조경환</span><span className="pv-stamp" aria-hidden="true">조경환</span></span>
    </motion.div>);
}

const MOB = [PREVIEW_PROJECTS.map(p => p.title.replace(' (예정)', '')), ['사진', '조경환', '학력 · 경력 · 자격'], ['제목 자리', '본문 자리', '조경환']];
const PreviewStage = forwardRef(function PreviewStage({ sel, pending, onOpen, mobile, href }, ref) {
  const body = sel === 0 ? <Posters /> : sel === 1 ? <Profile /> : <Letter />;
  if (mobile) return (
    <a ref={ref} href={href} className="scr-strip" onClick={e => onOpen(sel, e)} aria-label={NAME[sel] + ' 열기 (미리보기)'}>
      <span className="ss-tag">{LABEL[sel]}</span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span key={sel} className="ss-row" initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 900, damping: 30 } }} exit={{ y: 14, opacity: 0, transition: { duration: 0.08 } }}>
          {MOB[sel].map(t => <b key={t}>{t}</b>)}</motion.span>
      </AnimatePresence>
    </a>);
  return (
    <div className="scr" ref={ref}>
      <i className="scr-cable l" /><i className="scr-cable r" />
      <a href={href} className={'scr-frame' + (pending ? ' pending' : '')} onClick={e => onOpen(sel, e)} aria-label={NAME[sel] + ' 열기 (미리보기)'}>
        <span className="scr-head">
          <span className="scr-tag">{NAME[sel]}</span><span className="scr-label">{LABEL[sel]}</span>
          <span className="scr-beats" aria-hidden="true"><i /><i /><i /><i /></span>
        </span>
        <span className="scr-body">
          <AnimatePresence initial={false}>
            <motion.span key={sel} className="scr-slide" variants={SLAM} initial="enter" animate="in" exit="out">{body}</motion.span>
          </AnimatePresence>
        </span>
        <span className="scr-foot" aria-hidden="true">
          <span className="scr-keys"><kbd>↑</kbd><kbd>↓</kbd><span>선택</span><kbd>Enter</kbd><span>열기</span><kbd>Space</kbd><span>플레이</span></span>
          <span className="scr-go">열기<i /></span>
        </span>
      </a>
    </div>);
});
export default PreviewStage;
