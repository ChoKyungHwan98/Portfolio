import { useEffect, useRef, useState } from 'react';
import { flushSync, createPortal } from 'react-dom';
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from 'motion/react';
import Magnetic from '../components/Magnetic.jsx';
import usePressDepth from '../usePressDepth.js';
import { RESUME } from '../resume.js';
/* v3.7 뼈대: 내용은 Cho 가 나중에 채움. 각 자리에 무엇이 들어갈지만 적은 빈 칸
   v3.9 손맛 (survey_shortlist 에서 골라 Motion 으로 다시 짬, 스크롤 연동 없음):
   - 차례 등장: motion.dev staggered-grid 의 '앞에서부터 번지는' 순서 → 칸들이 위에서부터 툭툭 놓임
   - 제목: squash-text 아이디어(GSAP 원본) → 글자가 떨어져 찌그러지며 착지 + Codrops Block Reveal 의 노란 형광 띠
   - 목록 줄: press-depth(누른 쪽으로 기울며 가라앉음) + 하드 섀도 들림
   - 썸네일 칸: 포인터 쪽으로 살짝 기우는 tilt
   - 목록 → 상세: motion.dev Shared layout (layoutId) 로 프로젝트 이름이 그 자리에서 제목으로 커짐
   - 상세 이동 알약: React Bits Magnet */
/* v4.7 프로젝트 자료. tags = 카드의 주 신호(해시태그). meta = 제목 아래 한 줄(인원·역할·연도), badge = 실제 출시만.
   doc = 예전 사이트의 기획서 쪽 그림(WebP 로 줄여 /docs/<slug>/NN.webp). 영상은 아직 자리만(세로 9:16 Shorts)
   출처: 예전 사이트 src/data/projects.ts(인원·역할·출시·태그), GitHub 저장소 생성/작업 연도(Battle·Pico-Bang 2026). 추정은 보고서에 표시 */
export const PROJECTS = [
  /* v5.0 이름 'Battle' → '보스 AI 프로토타입'(Cho 요청, slug 는 battle 그대로). yt.v = 세로(9:16 Shorts) / 없으면 가로 16:9. doc.pv = 미리보기 쪽(0부터) */
  { slug: 'battle', title: '보스 AI 프로토타입', sub: '소울라이크 1:1 보스전', tag: '전투 기획', tier: 'feature', tags: ['HFSM', 'Utility AI', 'GOAP'],
    team: '1인 개발', year: 2026, cardImg: './cards/battle', /* v5.11 카드 = Cho 가 보낸 언리얼 보스전 화면(HFSM · Utility AI 디버그 HUD) */ gh: 'https://github.com/ChoKyungHwan98/Battle', yt: { id: 'XwLNKzSFJSQ', v: true, title: '전투 기획 포트폴리오 영상', fy: '38%' } },
  { slug: 'pico-bang', title: 'Pico-Bang!', tag: '시스템 기획', tier: 'feature', tags: ['몬스터 추격 시스템', '게임 규칙'],
    team: '1인 개발', year: 2026, cardImg: './cards/pico-bang', /* v5.11 카드 = Cho 가 보낸 유니티 추격 화면(미니맵 포함) */ gh: 'https://github.com/ChoKyungHwan98/Pico-Bang', yt: { id: 'WP-a5H4t384', v: true, title: '몬스터 추격 시스템 기획 포트폴리오 영상', fy: '42%' } },
  { slug: 'ai-review', title: 'AI 리뷰 데이터 분석', tag: 'AI 활용 · 데이터 분석', tier: 'feature', tags: ['Steam API'], team: '1인 개발', year: 2026, cardImg: './cards/ai-review', // v5.7 목록 카드 = 도구 개요 화면 캡처(16:9)
    // v5.6 영상 대신 실제 도구 화면(정적 전시본, public/airv): 저장된 분석(팰월드)만 보이고 실행 기능은 꺼 둠
    app: { src: './airv/index.html?app_id=1623730', title: 'AI 리뷰데이터 분석 도구 — 팰월드 분석 저장본(전시용)', name: 'AI 리뷰데이터 분석',
      note: '팰월드 한국어 리뷰 2,188건 · AI 분석 2,067건 · 2026.10.05 저장본' } },
  { slug: 'dorothia', title: '도로시아', tag: '전투 밸런스', tier: 'proof', tags: ['전투 밸런스', 'TTK 설계', '재화 순환', 'AI 시뮬레이터'],
    team: '11인 팀 · 팀장', year: 2026, badge: '구글 플레이 출시', listBadge: true, doc: { label: '밸런스 기획서', n: 33, ratio: 'a4', pv: 4, cv: [4, 0] },
    // v5.5 영상 파일은 16:9 이지만 실제 화면은 세로(가운데 ≈9:16, 양옆 검은 띠) → 페이지에선 세로 틀 + 잘라 둔 그림(_c), 재생 겹창은 16:9 그대로
    yt: { id: 'z2edJ8OYDyU', title: '도로시아 시연 영상', label: '시연 영상', card: '_c', crop: true },
    // v5.6 영상이 여럿이면 more[] — 큰 영상 옆 칸에 가로 타일로(눌러 재생). RJ2M_BEANXo 는 가로 16:9(데스크톱 화면 녹화)
    more: [{ id: 'RJ2M_BEANXo', title: '도로시아 밸런스 시뮬레이터', label: 'AI 시뮬레이터' }] },
  { slug: 'silent-mansion', title: '침묵의 저택', tag: '시스템 기획', tier: 'team', tags: ['점프 스케어', '공포 시야 축소', '상호작용'],
    team: '4인 팀 · 팀장', year: 2025, badge: '메이플월드 출시', doc: { label: '시스템 기획서', n: 22, ratio: 'wide', pv: 13, cv: [0, 13] },
    yt: { id: '5vjTeHe0Ozs', title: '침묵의 저택 시연 영상' } },
  { slug: 'digreed', title: 'Digreed', tag: '룰 기획', tier: 'team', tags: ['코어 루프', '무기 교체', '절차적 생성'],
    team: '10인 팀 · 팀장', year: 2025, doc: { label: 'MVP 기획서', n: 14, ratio: 'wide', pv: 4, cv: [4, 0] },
    yt: { id: 'DkuijnqOcU0', title: 'Digreed 시연 영상' } },
];
const FEAT = PROJECTS.filter(p => p.tier === 'feature'), PROOF = PROJECTS.filter(p => p.tier === 'proof'), TEAM = PROJECTS.filter(p => p.tier === 'team');
const SPRING = { type: 'spring', stiffness: 420, damping: 30 };
/* 카드 → 상세: 카드 자체가 상세 머리(hero)로 커짐(motion.dev shared layout, layoutId).
   스프링은 넘침 없이(감쇠비≈1) 0.4초 안팎 — 큰 판이 출렁이면 글이 흔들려 읽기 나쁨 */
const MORPH = { type: 'spring', stiffness: 360, damping: 38, mass: 0.9 };
export const item = { hide: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: SPRING } };
const group = { hide: {}, show: { transition: { staggerChildren: 0.05 } } };
const I = ({ children, className, as = 'div', ...r }) => { const C = motion[as]; return <C variants={item} className={className} {...r}>{children}</C>; };
const Ph = ({ label, h, className = '' }) => <div data-bg={label.split(' (')[0]} className={'ph ' + className} style={h ? { height: h } : undefined}><span>{label}</span></div>;
const link = (go, r) => e => { e.preventDefault(); go(r); };

/* 제목: 글자마다 위에서 떨어져 납작해졌다 펴짐(들어올 때 한 번만). 읽는 이(스크린 리더)에게는 h1 의 aria-label 로 통째로 */
function DropTitle({ text }) {
  const reduce = useReducedMotion();
  const chars = [...text];
  return (
    <h1 className="sh-title" tabIndex={-1} aria-label={text}>
      <span className="sh-mark" aria-hidden="true">
        {chars.map((c, i) => (
          <motion.span key={i} className="ch" style={{ originY: 1 }}
            variants={reduce ? undefined : {
              hide: { y: -34, opacity: 0, scaleY: 1, scaleX: 1 },
              show: { y: [-34, 0, 0, 0], opacity: [0, 1, 1, 1], scaleY: [1.12, 0.74, 1.06, 1], scaleX: [0.92, 1.18, 0.97, 1],
                transition: { duration: 0.42, times: [0, 0.45, 0.72, 1], ease: 'easeOut', delay: i * 0.035 } },
            }}>{c === ' ' ? '\u00a0' : c}</motion.span>))}
        <motion.i className="hl" style={{ originX: 0 }} variants={reduce ? undefined : { hide: { scaleX: 0 }, show: { scaleX: 1, transition: { delay: 0.12 + chars.length * 0.035, duration: 0.26, ease: [0.22, 1, 0.36, 1] } } }} />
      </span>
    </h1>);
}
const Head = ({ title, children }) => <I as="header" className="sh-head"><DropTitle text={title} />{children}</I>;

const rest = { hide: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { ...SPRING, delay: 0.16 } } };

const Tags = ({ p, big }) => <span className={'wk-tags' + (big ? ' big' : '')} aria-label="핵심 설계 요소">{p.tags.map(t => <i key={t}>#{t}</i>)}</span>;
/* v4.8 정보 한 줄: 모든 프로젝트 · 목록 카드 · 상세에서 같은 자리, 같은 순서 — 인원 · 연도 · (출시) · (GitHub) */
const GH_PATH = 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z';
const Meta = ({ p }) => (
  <span className="pm">
    <span className="pm-t">{p.team}</span>
    {p.year && <span className="pm-y">{p.year}</span>}
  </span>);
/* v5.0 GitHub 는 정보 줄에서 빼서 상세 머리 오른쪽 끝에 따로 */
/* v5.2 상세 머리 오른쪽 한 칸: GitHub(누르는 단추: 그림 + 글 + ↗, 올리면 검게) 또는 출시 표시(노란 딱지, 누르는 것 아님) 또는 비움 */
const Slot = ({ p }) => (
  <span className="dh-slot">
    {p.gh ? <a className="dh-gh" href={p.gh} target="_blank" rel="noopener noreferrer" aria-label={p.title + ' GitHub 저장소 열기 (새 창)'}>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d={GH_PATH} /></svg><b>GitHub</b><small>저장소</small><i aria-hidden="true">↗</i></a>
      : p.badge ? <span className="dh-badge"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" /></svg>{p.badge}</span> : null}
  </span>);
/* 썸네일: i.ytimg.com 의 Cho 영상 썸네일을 받아 WebP 로 줄여 둠. 세로(Shorts)는 1080×1920(_l)/540×960/270×480(_s), 가로는 1280×720/640×360(_s) */
const ytPoster = (y, small, large) => `./yt/${y.id}${large ? '_l' : small ? '_s' : ''}.webp`;
/* v5.0 카드 그림: 그림을 자르지 않음. 칸 = 어두운 바탕 + 같은 그림을 흑백·흐리게 깐 배경, 그 위에 원본 비율 그대로(contain).
   16:9 는 칸을 꽉 채우고, 세로(Shorts·도로시아 세로 화면)는 가운데 세로 화면 + 양옆 흐린 배경. 그림 없으면 '이미지 자리' */
const cardSrc = (p, kind) => (p.cardImg ? `${p.cardImg}${kind === 'hero' ? '' : '_s'}.webp` : p.yt.card ? `./yt/${p.yt.id}${p.yt.card}.webp` : ytPoster(p.yt, kind !== 'hero' && !p.yt.v, kind === 'hero' && p.yt.v));
const Art = ({ p, kind }) => (
  <motion.span layout className={'wk-art ' + kind + (p.yt || p.cardImg ? ' has-img' : '')} transition={MORPH} aria-hidden="true">
    {p.yt || p.cardImg ? <><img className="wk-bgi" src={cardSrc(p, kind)} alt="" loading="lazy" decoding="async" draggable={false} />
        <img className="wk-img" src={cardSrc(p, kind)} alt="" loading="lazy" decoding="async" draggable={false} /></>
      : <span className="wk-cap">이미지 자리</span>}
  </motion.span>);

/* ===== v4.7 목록: 주(Battle) > 부 둘 > 도로시아 띠 > 침묵의 저택 · Digreed(작은 카드, '그 밖' 취급 안 함).
   카드의 주 신호 = 해시태그. 판 전체가 눌림(제목 링크 ::after), 누르면 그 판이 상세 머리로 커짐(layoutId) ===== */
function Work({ p, go, kind, leaving, onLeave, v }) {
  const press = usePressDepth(kind === 'hero' ? 2.5 : 4);
  const open = e => { e.preventDefault(); flushSync(() => onLeave(p.slug)); go({ view: 'portfolio', slug: p.slug }); };
  return (
    <motion.li className={'wk-li ' + kind} variants={v}
      exit={{ opacity: 0, transition: { duration: leaving === p.slug ? 0 : 0.12 } }}>
      <motion.article layoutId={'card-' + p.slug} className={'wk-card ' + kind} tabIndex={-1} data-bg={p.title} data-bg-tone={kind === 'hero' ? 'y' : undefined}
        style={{ ...press.style, borderRadius: kind === 'hero' ? 24 : 18 }} {...press.handlers}
        whileTap={{ y: 3, scale: kind === 'hero' ? 0.992 : 0.985, transition: { duration: 0.07 } }} transition={MORPH}>
        <Art p={p} kind={kind} />
        <motion.span layout className="wk-body" transition={MORPH}>
          <motion.span layout="position" className="wk-meta" transition={MORPH}><span className="wk-tag">{p.tag}</span>{p.listBadge && <span className="pm-chip pm-badge">{p.badge}</span>}</motion.span>
          <motion.span layout="position" className="wk-tl" transition={MORPH}>
            <a className="pf-hit wk-title" data-slug={p.slug} href={'#/portfolio/' + p.slug} onClick={open}>{p.title}</a>
          </motion.span>
          {p.sub && kind === 'hero' && <span className="wk-sub">{p.sub}</span>}
          {kind === 'hero' && <span className="wk-cta" aria-hidden="true">프로젝트 보기<i /></span>}
        </motion.span>
      </motion.article>
    </motion.li>);
}

const POP = { type: 'spring', stiffness: 520, damping: 34, mass: 0.8 };
const enter = {
  head: { hide: { opacity: 0, y: -10 }, show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } } },
  hero: { hide: { opacity: 0, y: 34, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: POP } },
  sec: { hide: { opacity: 0, x: 36 }, show: { opacity: 1, x: 0, transition: POP } },
  low: { hide: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } } },
  grp: { hide: {}, show: { transition: { staggerChildren: 0.06 } } },
  wrap: { hide: {}, show: { transition: { delayChildren: 0.12, staggerChildren: 0.07 } } },
};
const HERO = PROJECTS.find(p => p.slug === 'battle'), SEC = FEAT.filter(p => p !== HERO);
function List({ go, leaving, onLeave }) {
  const reduce = useReducedMotion();
  const v = k => (reduce ? item : enter[k]);
  const c = { go, leaving, onLeave };
  return (
    <motion.div className="wk-list" variants={enter.wrap}>
      {/* 머리: 상자·옆 미리보기 없이 제목 + 오른쪽으로 뻗는 선 하나(카드 줄의 윗선 역할) */}
      <motion.header className="wk-head" variants={v('head')}>
        <h1 className="sh-title wk-h1" tabIndex={-1}><span className="sh-mark">포트폴리오<motion.i className="hl" style={{ originX: 0 }}
          variants={reduce ? undefined : { hide: { scaleX: 0 }, show: { scaleX: 1, transition: { delay: 0.1, duration: 0.26, ease: [0.22, 1, 0.36, 1] } } }} /></span></h1>
        <motion.i className="wk-rule" aria-hidden="true" style={{ originX: 0 }} variants={reduce ? undefined : { hide: { scaleX: 0 }, show: { scaleX: 1, transition: { delay: 0.14, duration: 0.34, ease: [0.22, 1, 0.36, 1] } } }} />
      </motion.header>
      {/* v5.1 목록(Cho 요청으로 다시 짬): 3칸 격자. 주(보스 AI)가 2×2, 나머지 다섯은 같은 꼴 카드(그림 16:9 위 · 분류 + 이름 아래).
          그림은 자르지 않음(세로 썸네일은 어두운 바탕 위 원래 비율로). 1280×600 첫 화면 = 주 판 + 오른쪽 두 장 */}
      <motion.ol className="wk-grid" variants={enter.grp} aria-label="프로젝트">
        <Work p={HERO} kind="hero" v={v('hero')} {...c} />
        {PROJECTS.filter(p => p !== HERO).map(p => <Work key={p.slug} p={p} kind="card" v={v('low')} {...c} />)}
      </motion.ol>
    </motion.div>);
}

const Pill = ({ go, r, children, ghost, onClick }) => (
  <Magnetic strength={0.18} range={36} className="mag-pill">
    <a className={'pill' + (ghost ? ' ghost' : '')} href={'#/' + r.view + (r.slug ? '/' + r.slug : '')} onClick={e => { onClick?.(); link(go, r)(e); }}>{children}</a>
  </Magnetic>);

/* ===== v4.9 '열쇠 구멍' 고침: 상세 페이지 안에서는 미리보기만, 실제로 보고 읽는 건 화면 전체를 쓰는 겹창(오버레이)에서.
   겹창 공통: 어두운 바탕, Esc · 바깥 누르기 · 닫기 단추로 닫힘, 열린 동안 뒤 화면은 inert(초점·스크린리더 막힘), 닫으면 연 단추로 초점 복귀 */
const docSrc = (slug, i, thumb) => `./docs/${slug}/${thumb ? 't/' : ''}${String(i + 1).padStart(2, '0')}.webp`;
function Overlay({ open, onClose, label, className, children }) {
  const reduce = useReducedMotion(), box = useRef(null), back = useRef(null), close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    back.current = document.activeElement;
    const root = document.getElementById('root'); if (root) root.inert = true;
    const key = e => { if (e.key === 'Escape' && !document.fullscreenElement) { e.preventDefault(); e.stopImmediatePropagation(); close.current(); } };
    addEventListener('keydown', key, true);
    const id = requestAnimationFrame(() => (box.current?.querySelector('[data-autofocus]') || box.current)?.focus({ preventScroll: true }));
    return () => { cancelAnimationFrame(id); removeEventListener('keydown', key, true); if (document.fullscreenElement) document.exitFullscreen?.(); if (root) root.inert = false; back.current?.focus?.({ preventScroll: true }); };
  }, [open]);
  return createPortal(
    <AnimatePresence>
      {open && <motion.div key="ov" ref={box} className={'ov ' + className} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.16 }}
        onMouseDown={e => { if (e.target === e.currentTarget || e.target.dataset.backdrop) onClose(); }}>{children}</motion.div>}
    </AnimatePresence>, document.body);
}
const CloseBtn = ({ onClose, auto }) => (
  <button type="button" className="ov-x" onClick={onClose} data-autofocus={auto ? '' : undefined} aria-label="닫기 (Esc)"><span aria-hidden="true">✕</span>닫기<kbd>Esc</kbd></button>);

/* 영상: 페이지 안 = 썸네일 + 재생 단추(iframe 없음). 누르면 극장 겹창에서 youtube-nocookie 자동 재생.
   세로(Shorts 9:16): 겹창 = 화면 높이(vh−48)의 9:16. 가로(16:9): 겹창 = 화면에 들어가는 가장 큰 16:9.
   왜 겹창인가(v4.9 재 봄): Shorts 자막 글자 높이 1080 폭 기준 43px → 1366×657 페이지 안 ~280px 폭이면 11px, 겹창 342px 폭이면 13.6px.
   영상이 정말 없는 프로젝트(AI 리뷰)는 빈 영상 상자를 두지 않음 */
function Video({ p, y = p.yt, tile = false }) {
  const [on, setOn] = useState(false), reduce = useReducedMotion();
  // v5.4 영상이 없으면 같은 자리 · 같은 크기의 빈 화면(점선) — 판 배치가 6쪽 모두 같게
  if (!y) return null; // v5.5 영상 없는 프로젝트는 빈 상자를 두지 않고 '준비 중' 줄 하나로(DocEntry 쪽)
  const k = y.v ? 'v' : 'h', fk = y.v || y.crop ? 'v' : 'h'; // k = 재생 겹창 비율(파일 그대로), fk = 페이지 틀 비율(실제 화면)
  const lab = (p.more?.length && y.label) ? <span className="sv-lab">{y.label}</span> : null; // 영상이 둘 이상일 때만 이름표
  return (
    <div className={'sv ' + fk + (tile ? ' tile' : '')} data-bg="영상">{lab}
      <button type="button" className={'sv-screen sv-face ' + fk} onClick={() => setOn(true)} aria-label={y.title + ' 재생 (크게 열림)'} aria-haspopup="dialog">
        <img src={y.crop ? `./yt/${y.id}${y.card}.webp` : tile ? `./yt/${y.id}_s.webp` : ytPoster(y, false, y.v)} alt="" decoding="async" draggable={false} /><i className="sv-btn" aria-hidden="true" />
      </button>
      <Overlay open={on} onClose={() => setOn(false)} label={y.title} className={'ov-theater ' + k}>
        <motion.iframe className={'th-player ' + k} src={`https://www.youtube-nocookie.com/embed/${y.id}?autoplay=1&playsinline=1&rel=0`} title={y.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
          initial={reduce ? false : { scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
        <CloseBtn onClose={() => setOn(false)} auto />
      </Overlay>
    </div>);
}

/* v5.2 기획서 입구: 작은 미리보기 창(열쇠구멍)을 없애고 '기획서 읽기' 단추 하나로 → 기존 전체 화면 읽기 창.
   보조로 '핵심 쪽부터'(doc.pv, 내용이 시작되는 쪽). 기획서가 없으면 작은 '준비 중' 표시만(빈 종이 크게 X) */
/* v5.6 영상 대신 '실제 도구 화면': 정적 전시본을 iframe 으로. 도구는 데스크톱 폭에 맞춰 만든 화면이라
   논리 폭 ≈1240px 로 그려 놓고 틀에 맞게 축소(0.6~0.9배, 글자가 너무 작아지지 않게 논리 높이를 늘려 안에서 스크롤).
   '크게 보기' = 같은 화면을 거의 전체 화면 겹창으로 */
function AppShow({ p }) {
  const a = p.app, box = useRef(null), [s, setS] = useState(null), [big, setBig] = useState(false);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => { const { width: w, height: h } = e.contentRect; if (!w || !h) return;
      const k = Math.max(0.6, Math.min(0.9, w / 1240)); setS({ k, w: Math.round(w / k), h: Math.round(h / k) }); });
    ro.observe(el); return () => ro.disconnect();
  }, []);
  // v5.7 안쪽 도구가 포커스/scrollIntoView 로 바깥의 '굴리지 않는 칸'(overflow hidden)을 밀면 바로 0 으로 되돌림(홈 단추 잘림 방지)
  useEffect(() => {
    const fix = e => { const t = e.target; if (!(t instanceof Element) || !(t.scrollTop || t.scrollLeft)) return;
      const cs = getComputedStyle(t); if (/hidden|clip/.test(cs.overflowY + cs.overflowX)) { t.scrollTop = 0; t.scrollLeft = 0; } };
    document.addEventListener('scroll', fix, true); return () => document.removeEventListener('scroll', fix, true);
  }, []);
  return (
    <div className="as" data-bg="도구 화면">
      <div className="as-frame">
        <div className="as-bar" aria-hidden="true"><i /><i /><i /><em>전시용 · 실행 기능 꺼짐</em></div>
        <div className="as-view" ref={box}>
          {s && <iframe className="as-if" src={a.src} title={a.title} loading="lazy" referrerPolicy="no-referrer"
            style={{ width: s.w, height: s.h, transform: `scale(${s.k})` }} />}
        </div>
      </div>
      <div className="as-cap">
        <p><b>실제 도구 화면</b>{a.note}</p>
        <button type="button" className="as-big" onClick={() => setBig(true)} aria-haspopup="dialog">크게 보기<i aria-hidden="true">↗</i></button>
      </div>
      <Overlay open={big} onClose={() => setBig(false)} label={a.title} className="ov-theater ov-app">
        <iframe className="as-full" src={a.src} title={a.title + ' (크게)'} referrerPolicy="no-referrer" />
        <CloseBtn onClose={() => setBig(false)} auto />
      </Overlay>
    </div>);
}

const coverSrc = (slug, i) => `./docs/${slug}/c/${String(i + 1).padStart(2, '0')}.webp`;
/* v5.5 기획서 입구 = 초대장: 진짜 표지(또는 첫 핵심 쪽)를 종이 더미처럼 크게 + 이름 · 쪽수 · 노란 '기획서 읽기'.
   더미를 눌러도 읽기 창이 열림(읽으라고 둔 게 아니라 '열어 보세요' 표시). 없으면 짧고 정직한 '준비 중' 띠 하나 */
function DocEntry({ p, onOpen }) {
  const d = p.doc;
  if (!d) return (
    <aside className="de2 none" aria-label={p.yt || p.app ? '기획서 준비 중' : '영상 · 기획서 준비 중'}>
      <span className="de2-ic" aria-hidden="true"><i /><i /></span>
      <span className="de2-tx"><b>{p.yt || p.app ? '기획서 준비 중' : '영상 · 기획서 준비 중'}</b><span className="de-s">아직 올리지 않았습니다</span></span>
    </aside>);
  const [f, bk] = d.cv || [0, 1], unit = d.ratio === 'a4' ? '쪽' : '장'; // v5.6 '기획서' 머리말 없앰 → 이름 + 쪽수만
  return (
    <aside className={'de2 ' + d.ratio} data-bg={d.label} aria-label={d.label}>
      <button type="button" className="de2-stack" tabIndex={-1} onClick={() => onOpen(0)} aria-label={d.label + ' 열기'} aria-haspopup="dialog">
        <img className="bk" src={coverSrc(p.slug, bk)} alt="" decoding="async" draggable={false} />
        <img className="fr" src={coverSrc(p.slug, f)} alt="" decoding="async" draggable={false} />
      </button>
      <span className="de2-info">
        <b className="de-t">{d.label}</b>
        <span className="de-s">{d.n}{unit}</span>
        <button type="button" className="de-read" onClick={() => onOpen(0)} aria-haspopup="dialog">기획서 읽기<i aria-hidden="true">→</i></button>
      </span>
    </aside>);
}

/* 읽기 겹창: 왼쪽 쪽 그림 띠(누르면 이동) · 가운데 이어 내리기(폭 맞춤 최대 1000px, 슬라이드는 폭 전체) · 위 막대(쪽수, 이전/다음, 쪽 맞춤, 전체 화면, 닫기).
   ←/→ = 한 쪽씩, Home/End. 쪽은 lazy 로 받고 지금 쪽의 다음 두 쪽은 미리 받음. 지금 쪽 = 창 가운데 줄에 걸친 쪽(IntersectionObserver) */
function Reader({ p, open, start, onClose }) {
  const d = p.doc, [cur, setCur] = useState(start), [fit, setFit] = useState('page'); // v5.3 처음 열면 쪽 맞춤(한 쪽이 통째로)
  const pane = useRef(null), pg = useRef([]), strip = useRef(null), box = useRef(null);
  const to = i => { const j = Math.max(0, Math.min(d.n - 1, i)); pg.current[j]?.scrollIntoView({ block: 'start' }); setCur(j); };
  const curR = useRef(start); curR.current = cur;
  useEffect(() => { if (!open) return; setCur(start); const id = requestAnimationFrame(() => pg.current[start]?.scrollIntoView({ block: 'start' })); return () => cancelAnimationFrame(id); }, [open, start]);
  useEffect(() => { if (open) pg.current[curR.current]?.scrollIntoView({ block: 'start' }); }, [fit]); // eslint-disable-line
  useEffect(() => {
    if (!open || !pane.current) return;
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) setCur(+e.target.dataset.i); }); }, { root: pane.current, rootMargin: '-45% 0px -54% 0px' });
    pg.current.forEach(el => el && io.observe(el)); return () => io.disconnect();
  }, [open, fit]);
  useEffect(() => { if (!open) return; [1, 2].forEach(k => { if (cur + k < d.n) { const im = new Image(); im.src = docSrc(p.slug, cur + k); } });
    strip.current?.querySelector(`[data-t="${cur}"]`)?.scrollIntoView({ block: 'nearest' }); }, [cur, open]); // eslint-disable-line
  const key = e => {
    const m = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (m) { e.preventDefault(); to(cur + m); } else if (e.key === 'Home') { e.preventDefault(); to(0); } else if (e.key === 'End') { e.preventDefault(); to(d.n - 1); }
  };
  const full = () => { if (document.fullscreenElement) document.exitFullscreen(); else box.current?.closest('.ov')?.requestFullscreen?.(); };
  return (
    <Overlay open={open} onClose={onClose} label={`${p.title} ${d.label}`} className="ov-reader">
      <div className="rd" ref={box} onKeyDown={key}>
        <header className="rd-bar">
          <b className="dv-name">{d.label}</b><span className="rd-of">{p.title}</span>
          <span className="dv-nav">
            <button type="button" className="dv-btn" onClick={() => to(cur - 1)} disabled={cur === 0} aria-label="이전 쪽"><i className="l" /></button>
            <span className="dv-n" aria-live="polite"><b>{cur + 1}</b> / {d.n}</span>
            <button type="button" className="dv-btn" onClick={() => to(cur + 1)} disabled={cur === d.n - 1} aria-label="다음 쪽"><i /></button>
          </span>
          <span className="sp" />
          {<button type="button" className="dv-fit" onClick={() => setFit(f => (f === 'page' ? 'width' : 'page'))} aria-pressed={fit === 'page'}>{fit === 'page' ? '폭 맞춤' : '쪽 맞춤'}</button>}
          <button type="button" className="dv-fit" onClick={full}>전체 화면</button>
          <CloseBtn onClose={onClose} />
        </header>
        <nav className="rd-strip" ref={strip} aria-label="쪽 목록">
          {Array.from({ length: d.n }, (_, i) => (
            <button type="button" key={i} data-t={i} className={'rd-t ' + d.ratio} aria-current={i === cur ? 'page' : undefined} onClick={() => to(i)} aria-label={`${i + 1}쪽`}>
              <img src={docSrc(p.slug, i, true)} alt="" loading="lazy" decoding="async" draggable={false} /><span>{i + 1}</span>
            </button>))}
        </nav>
        <div className={'rd-pane ' + fit + ' ' + d.ratio} ref={pane} tabIndex={0} data-autofocus="" aria-label={`${d.label} · 위아래로 스크롤, 좌우 화살표로 한 쪽씩`}>
          {Array.from({ length: d.n }, (_, i) => (
            <div key={i} className="rd-pg" data-i={i} ref={el => (pg.current[i] = el)}>
              <img src={docSrc(p.slug, i)} alt={`${d.label} ${i + 1}쪽`} loading={Math.abs(i - start) < 2 ? 'eager' : 'lazy'} decoding="async"
                width={d.ratio === 'a4' ? 1191 : 1280} height={d.ratio === 'a4' ? 1684 : 720} draggable={false} />
            </div>))}
        </div>
      </div>
    </Overlay>);
}

/* ===== v4.9 상세: 머리 한 줄(← 목록 | 이름 · 분류 · 정보 줄 · 해시태그) → 본문 = 세로 영상 미리보기 | 기획서 미리보기(높이를 거의 다 씀) → 다음 한 줄 ===== */
function Detail({ slug, go, onLeave }) {
  const i = PROJECTS.findIndex(p => p.slug === slug);
  const [rd, setRd] = useState(null); // 읽기 겹창: 시작 쪽(null = 닫힘)
  if (i < 0) return (<motion.div initial="hide" animate="show"><Head title="없는 프로젝트" />
    <I><Pill go={go} r={{ view: 'portfolio' }}>← 목록</Pill></I></motion.div>);
  const p = PROJECTS[i], next = PROJECTS[(i + 1) % PROJECTS.length], prev = PROJECTS[(i + PROJECTS.length - 1) % PROJECTS.length];
  const to = s => e => { e.preventDefault(); go({ view: 'portfolio', slug: s }); };
  return (
    <>
      <div className="wd-top">
        {/* v5.4 돌아가기는 여기 하나: 머리 판과 같은 높이 · 같은 테두리의 네모 단추(아래 줄의 '← 목록'은 없앰) */}
        <motion.a className="wd-up" href="#/portfolio" aria-label="프로젝트 목록으로" onClick={e => { e.preventDefault(); onLeave(null); go({ view: 'portfolio' }); }}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { ...SPRING, delay: 0.12 } }}>
          <i aria-hidden="true">←</i><b>목록</b></motion.a>
        <motion.article layoutId={'card-' + p.slug} className="wk-card wd-head" data-bg={p.title} style={{ borderRadius: 18 }} transition={MORPH}>
          <span className="dh-l">
            <motion.span layout="position" className="wd-h" transition={MORPH}>
              <span className="wk-tag">{p.tag}</span><h1 className="wk-title sh-title" tabIndex={-1}>{p.title}</h1>{p.sub && <span className="wd-sub">{p.sub}</span>}
            </motion.span>
            <motion.span className="wd-line" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.18, duration: 0.2 } }}>
              <Meta p={p} /><Tags p={p} />
            </motion.span>
          </span>
          <motion.span className="dh-r" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.18, duration: 0.2 } }}><Slot p={p} /></motion.span>
        </motion.article>
      </div>
      {/* v5.0 배치: 세로(Shorts) = 영상 | 기획서 미리보기 / 가로 16:9 = 영상이 주인공(가장 크게) + 오른쪽 좁은 기획서 칸 / 영상 없음 = 기획서만 */}
      {/* v5.2 본문: 영상(가장 크게) → 옆에 기획서 입구. 영상이 없으면 입구만 작게 가운데 */}
      {/* v5.5 본문: 영상의 실제 비율로 틀을 고름. 세로 = 키 큰 영상(높이 전부) + 오른쪽 넓은 기획서 판 / 가로 = 큰 16:9 + 옆(넓은 화면) 또는 아래 띠(키 큰 화면) / 영상 없음 = 준비 중 띠 */}
      <motion.div className={'wd-main dm2 ' + (p.app ? 'app' : !p.yt ? 'nov' : p.yt.v || p.yt.crop ? 'por' : 'lan') + (p.doc ? '' : ' nodoc') + (p.more?.length ? ' more' : '')} initial="hide" animate="show" variants={rest}>
        <div className="dm2-in">{p.app ? <AppShow p={p} /> : <Video p={p} />}
          {p.more?.length ? <div className="dm2-side">{p.more.map(y => <Video key={y.id} p={p} y={y} tile />)}<DocEntry p={p} onOpen={setRd} /></div> : p.app && !p.doc ? null : <DocEntry p={p} onOpen={setRd} />}</div>
      </motion.div>
      {p.doc && <Reader p={p} open={rd !== null} start={rd ?? 0} onClose={() => setRd(null)} />}
      <motion.nav className="wd-bar" aria-label="프로젝트 이동" initial="hide" animate="show" variants={rest}>
        {/* v5.4 아래 줄 = 이전 | 다음 (좌우 같은 꼴) */}
        <a className="wd-nx prev" href={'#/portfolio/' + prev.slug} onClick={to(prev.slug)} aria-label={'이전 프로젝트: ' + prev.title}><i aria-hidden="true">←</i><small>이전</small><b>{prev.title}</b></a>
        <span className="sp" />
        <a className="wd-nx next" href={'#/portfolio/' + next.slug} onClick={to(next.slug)} aria-label={'다음 프로젝트: ' + next.title}><small>다음</small><b>{next.title}</b><i aria-hidden="true">→</i></a>
      </motion.nav>
    </>
  );
}

/* 목록 ↔ 상세를 같은 판 안에서 바꿈. popLayout: 나가는 쪽이 자리를 비켜 주며 겹쳐서 이어짐.
   v4.7 버그 고침(빈 상세): 나가는 중(opacity→0)인 같은 key 가 곧바로 다시 들어오면 AnimatePresence 는 그 요소를 되살려 쓰는데,
   감싸는 div 에 animate 의 opacity 가 없어서 0 에 그대로 멈춰 있었음(목록 → 상세 → 목록 → 같은 상세를 0.1초 안에, 또는 뒤로/앞으로 빠르게).
   → 들어올 때 갈 곳(opacity 1)을 animate 에 적어 둠. 목록 쪽도 같은 이유로 */
const SHOW = { opacity: 1, transition: { duration: 0.12 } };
export function PortfolioView({ slug, go }) {
  const [leaving, setLeaving] = useState(null);
  const from = useRef(null);
  const back = !slug && !!from.current;
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const sc = document.querySelector('.sheet-scroll');
      if (slug) sc?.querySelector('.wd-head .sh-title')?.focus({ preventScroll: true });
      else if (from.current) sc?.querySelector(`.pf-hit[data-slug="${from.current}"]`)?.focus({ preventScroll: true });
      from.current = slug;
    });
    return () => cancelAnimationFrame(id);
  }, [slug]);
  return (
    <LayoutGroup id="pf">
      <AnimatePresence mode="popLayout">
        {slug ? <motion.div key={'d-' + slug} className="pf-detail" initial={false} animate={SHOW} exit={{ opacity: 0, transition: { duration: 0.1 } }}><Detail slug={slug} go={go} onLeave={setLeaving} /></motion.div>
          : <motion.div key="list" initial={back ? false : 'hide'} animate={['show', 'vis']} variants={{ vis: SHOW }} exit={{ opacity: 0, transition: { duration: 0.12 } }}><List go={go} leaving={leaving} onLeave={setLeaving} /></motion.div>}
      </AnimatePresence>
    </LayoutGroup>);
}

/* v5.3 이력서: 예전 사이트 내용 그대로(resume.js). 차분한 v5 꼴 — 흰 판 + 검은 테두리, 움직임은 들어올 때 한 번(차례 등장)뿐.
   길면 시트 안에서 스크롤. 사진은 이 쪽에만 */
const B = t => t.split(/(\*\*[^*]+\*\*)/g).map((x, i) => (x.startsWith('**') ? <b key={i}>{x.slice(2, -2)}</b> : x));
const Paras = ({ t }) => t.split(/\n\n+/).map((x, i) => <p key={i}>{B(x)}</p>);
/* v5.5 이력서: 한눈에(예전 이력서처럼 훑어 읽기). 한 장의 종이 판 안에 두 단 — 왼쪽 = 사진 · 이름 · 요약 · 연락처 · 자격 · 병역 · 도구(이름 + 아이콘만, 설명은 올리면 보임),
   오른쪽 = 프로젝트 경험(같은 높이 줄) · 학력 · 교육(시간 줄). 굵은 테두리 대신 얇은 구분선, 글 크기 3단계(이름 · 칸 제목 · 본문) */
const RI = { // 작은 줄 아이콘(직접 그림)
  mail: <path d="M3 6h18v12H3zM3 7l9 6 9-6" />, phone: <path d="M6.5 3h3l1.5 4.5-2 1.5a11 11 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A17 17 0 0 1 4.5 5a2 2 0 0 1 2-2z" />,
  cal: <path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5" />, pin: <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  proj: <path d="M3 7h18v13H3zM8 7V4h8v3" />, edu: <path d="M2 9l10-5 10 5-10 5zM6 11v5c3 2.5 9 2.5 12 0v-5" />, cert: <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z" />,
  mil: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />, tool: <path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2zM4 20l3-3" />,
};
/* v5.10b 이력서 전용 아이콘: 옛 사이트와 같은 Lucide 줄 아이콘(ISC 라이선스, lucide-static 1.59.0 경로 그대로) */
const LU = {
  star: <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />,
  proj: <><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect width="20" height="14" x="2" y="6" rx="2" /></>,
  edu: <><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></>,
  cert: <><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /><circle cx="12" cy="8" r="6" /></>,
  tool: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />,
  mail: <><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></>,
  phone: <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />,
  cal: <><path d="M8 2v3" /><path d="M16 2v3" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></>,
  pin: <><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></>,
  mil: <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />,
};
const Lu = ({ k, c = 'lu' }) => <svg className={c} viewBox="0 0 24 24" aria-hidden="true">{LU[k]}</svg>;
const Ic = ({ k }) => <svg className="rs-ic" viewBox="0 0 24 24" aria-hidden="true">{RI[k]}</svg>;
const RH = ({ k, id, children, n }) => <h2 id={id} className="rs-h"><Ic k={k} />{children}{n != null && <small>{n}</small>}</h2>;
const TOOL_GROUPS = [['문서 · 데이터', ['Excel', 'PowerPoint', 'Word', 'Notion']], ['AI 활용', ['ChatGPT', 'Claude', 'Gemini', 'Hermes', 'Codex', 'Antigravity']], ['제작 · 엔진', ['Figma', 'Unity', 'Unreal Engine']]];
/* v5.9 이력서 = 종이 이력서처럼 위에서 아래로 한 줄기(한 화면에 억지로 넣지 않음 — 이력서 쪽만 세로 스크롤 허용).
   머리: 이름(크게) · 지망 직무 · 연락처 한 줄(병역 포함) · 짧은 소개 / 오른쪽 작은 사진.
   본문: 왼쪽 고정 칸 = 칸 이름, 오른쪽 = 내용. 순서 프로젝트 → 학력 · 교육 → 자격 → 도구
   (기획 지망생에게 제일 중요한 증거가 프로젝트라 맨 앞. 학력 · 자격은 확인용이라 그 뒤).
   글은 진한 검정, 회색은 날짜 · 보조 정보만. 프로젝트 줄 전체가 그 상세로 가는 링크(화살표 없음). 그림 미리보기는 뺌(색조가 제각각이라 읽기를 방해) */
const TOOL_EXT = { Codex: 'webp', Hermes: 'webp' }, TOOL_FILE = { 'Unreal Engine': 'unreal' }; // Unreal Engine: Epic 공식 UE5 로고(위키미디어 공용 원본)에서 원형 마크만 잘라 씀; // 공식 아이콘(Codex: OpenAI 앱 번들 그대로, Hermes Agent: 공식 사이트 아이콘). 나머지는 예전 사이트 SVG
const splitTitle = t => { const m = t.match(/^(.*?)\s*\((.+)\)$/); return m ? [m[1], m[2]] : [t, null]; };
const splitDesc = d => { const i = d.indexOf('|'); return i < 0 ? [null, d.trim()] : [d.slice(0, i).trim(), d.slice(i + 1).trim()]; };
/* v5.10 후보: 화면 크기에 맞춰 같이 커지는 이력서(홈처럼). 글 크기 = 판 폭의 비율(1280 창 ≈16px, 1920 창 ≈21px, 상한 24px).
   칸마다 표: 열을 고정해서 눈이 세로로 훑을 수 있게(기간 | 프로젝트 | 역할 | 핵심). 대표(1인) 묶음 → 팀 묶음 */
export const ResumePage = ({ go }) => {
  const reduce = useReducedMotion();
  const R = RESUME, tool = n => R.tools.find(t => t.name === n), M = R.military;
  const plain = t => t.replace(/\*\*/g, '');
  const contact = [['mail', '이메일', <a href={'mailto:' + R.email}>{R.email}</a>], ['phone', '전화', R.phone], ['cal', '생년월일', R.birthDate],
    ['pin', '주소', R.address], ['mil', '병역', <>{M.branch.replace(/\s*법무실$/, '')} {M.role} · {M.rank} {M.status}</>]];
  const rows = R.experience.map(e => { const [t, genre] = splitTitle(e.title), [kind, what] = splitDesc(e.description);
    return { e, t, genre, role: e.rep ? '1인 개발 · ' + kind : [kind, e.teamSize && e.teamSize + ' 팀'].filter(Boolean).join(' · '), what }; });
  const Row = ({ x }) => { const inner = (<>
      <span className="t-per">{x.e.period}</span>
      <span className="t-name"><b>{x.t}</b>{x.genre && <small>{x.genre}</small>}</span>
      <span className="t-role">{x.role}</span>
      {!x.e.rep && <span className="t-what">{x.what}</span>}</>);
    return go ? <a className="t-row" role="row" href={'#/portfolio/' + x.e.slug} aria-label={x.t + ' — 프로젝트 상세 보기'} onClick={ev => { ev.preventDefault(); go({ view: 'portfolio', slug: x.e.slug }); }}>{inner}</a>
      : <div className="t-row" role="row">{inner}</div>; };
  const H2 = ({ id, k, children }) => <h2 id={id} className="r10-h"><Lu k={k} c="lu r10-hi" />{children}</h2>;
  return (
    <div className="rs rs10">
      <motion.article className="r10-paper" variants={group} aria-label="이력서">
        <I as="header" className="r10-head">
          <div className="r10-id">
            <h1 className="r10-name sh-title" tabIndex={-1}>{R.name}</h1>
            <p className="r10-role">{R.role}</p>
            <dl className="r10-contact">{contact.map(([k, c, v]) => <div key={k} className={'c-' + k}><dt><Lu k={k} /><span>{c}</span></dt><dd>{v}</dd></div>)}</dl>
          </div>
          <img className="r10-photo" src="./resume/profile.webp" alt={R.name + ' 사진'} width="400" height="600" decoding="async" />
        </I>
        <I as="section" className="r10-sec" aria-labelledby="r10-p"><H2 id="r10-p" k="star">대표 포트폴리오</H2>
          <div className="r10-cards" role="list" aria-label="대표 포트폴리오">{rows.filter(x => x.e.rep).map(x => (
            <motion.a key={x.t} role="listitem" className="r10-card" href={'#/portfolio/' + x.e.slug} aria-label={x.t + ' — 프로젝트 상세 보기'}
              whileHover={reduce ? undefined : { y: -3 }} whileTap={reduce ? undefined : { y: 0 }} transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              onClick={ev => { if (!go) return; ev.preventDefault(); go({ view: 'portfolio', slug: x.e.slug }); }}>
              <span className="k-bar" aria-hidden="true" />
              <b className="k-name">{x.t}</b>
              <span className="k-role">{x.role}</span>
              <span className="k-year">{x.e.period}</span>
            </motion.a>))}</div>
        </I>
        <I as="section" className="r10-sec" aria-labelledby="r10-x"><H2 id="r10-x" k="proj">프로젝트 경험</H2>
          <div className="r10-tab t-proj" role="table" aria-label="프로젝트 경험">
            <div className="t-row t-hd" role="row"><span>기간</span><span>프로젝트</span><span>역할</span><span>담당</span></div>
            {rows.filter(x => !x.e.rep).map(x => <Row key={x.t} x={x} />)}
          </div>
        </I>
        <I as="section" className="r10-sec" aria-labelledby="r10-e"><H2 id="r10-e" k="edu">학력 · 교육</H2>
          <div className="r10-tab t-edu" role="table" aria-label="학력 · 교육">{R.education.map(e => (
            <div key={e.title} className="t-row" role="row"><span className="t-per"><i className="t-dot" aria-hidden="true" />{e.period}</span><span className="t-name"><b>{e.title}</b></span>
              <span className="t-what">{e.details.map(plain).join(' · ') || ''}</span></div>))}</div>
        </I>
        <I as="section" className="r10-sec" aria-labelledby="r10-c"><H2 id="r10-c" k="cert">자격 사항</H2>
          <div className="r10-tab t-cert" role="table" aria-label="자격 사항">{R.certificates.map(c => (
            <div key={c.name} className="t-row" role="row"><span className="t-per"><i className="t-dot" aria-hidden="true" />{c.date}</span><span className="t-name"><b>{c.name}</b></span><span className="t-what">{c.score}</span></div>))}</div>
        </I>
        <I as="section" className="r10-sec" aria-labelledby="r10-t"><H2 id="r10-t" k="tool">활용 도구</H2>
          <div className="r10-tab t-tool">{TOOL_GROUPS.map(([g, ns]) => (
            <div key={g} className="t-row"><span className="t-per">{g}</span>
              <ul>{ns.map(tool).filter(Boolean).map(t => (
                <li key={t.name} title={t.description || undefined}><img src={`./resume/tools/${TOOL_FILE[t.name] || t.name.toLowerCase()}.${TOOL_EXT[t.name] || 'svg'}`} alt="" width="32" height="32" decoding="async" /><span>{t.name}</span></li>))}</ul>
            </div>))}</div>
        </I>
      </motion.article>
    </div>);
};

/* v5.9 자기소개서: 내용은 비워 둠(Cho 가 나중에 채움). 지어낸 글 · 문구 없이 제목과 짧은 빈 상태만 */
export const CoverPage = () => (
  <div className="cv-empty-wrap"><Head title="자기소개서" />
    <I className="cv-empty"><span className="cv-ic" aria-hidden="true"><i /><i /></span><p>아직 올린 내용이 없습니다.</p></I></div>);
