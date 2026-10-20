import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useAnimate, useReducedMotion, useMotionValue, animate } from 'motion/react';
import useViewport from './useViewport.js';
import { beatAt, CUES, LEAD } from './beats.js';
import { createSongEngine } from './songEngine.js';
import SplitName from './components/SplitName.jsx';
import RollingText from './components/RollingText.jsx';
import Magnetic from './components/Magnetic.jsx';
import SpotlightTile from './components/SpotlightTile.jsx';
import ClickSpark from './components/ClickSpark.jsx';
import Field from './components/Field.jsx';
import CometDial from './components/CometDial.jsx';
import Character from './components/Character.jsx';
import Lights from './components/Lights.jsx';
import Tutorial from './components/Tutorial.jsx';
import PreviewStage from './components/PreviewStage.jsx';
import { parse, build, parentOf, isSheet, isScene } from './route.js';
import { PortfolioView, ResumePage, CoverPage } from './pages/Skeleton.jsx';
import MediaRoom from './components/MediaRoom.jsx';
import MEDIA from './media.json';
import { setSfxVolume } from './sfx.js';
import usePressDepth from './usePressDepth.js';

const MENU = [
  { id: 'portfolio', label: '포트폴리오', href: '#/portfolio' },
  { id: 'resume', label: '이력서', href: '#/resume' },
  { id: 'cover', label: '자기소개서', href: '#/cover' },
];
const EMAIL = 'ckh980624@gmail.com', PHONE = '010-4826-6256';
const q = new URLSearchParams(location.search);
const DEBUG_T = q.has('t') ? parseFloat(q.get('t')) : null;      // ?state=play&t=3.8 → 클릭 후 3.8초 장면으로 고정 (확인용)
const START_PLAY = q.get('state') === 'play';
const STILL = q.has('still') || START_PLAY; // 등장 연출 생략 (확인용)
const CHAR = { x: 1236, y: 985, k: 1.0, pose: 'idle' }; // v4.2 stage u 좌표(발 가운데), 크기 — 무대 화면 왼쪽 아래 앞에 섬 (pf.css --cx/--cy/--cs 와 같은 값)
const INTRO = !STILL && INIT_ROUTE_HOME() && !matchMedia('(prefers-reduced-motion: reduce)').matches; // 첫 진입만 무대 인트로
function INIT_ROUTE_HOME() { return !q.has('state') && (!location.hash || location.hash === '#/' || location.hash === '#'); }
const HALF = 30 / 139.5; // 인트로 카운트 간격 = 반 박(0.215초)
const phaseAt = t => // t = 노래 위치(초), 음악 전엔 음수
  t < CUES.stutter ? 'move' : t < CUES.blackout ? 'stutter' : t < CUES.spot ? 'dark' : t < CUES.tutorial ? 'spot' : 'tutorial';
const EASE_OUT = [0.23, 1, 0.32, 1], EASE_IN = [0.7, 0, 0.84, 0], EASE_IO = [0.76, 0, 0.24, 1];
/* v3.7 레일: 홈의 사선 면이 왼쪽 곧은 기둥(레일)으로 줄어든다. 폭은 styles 의 --rw 와 같은 식 */
const railW = w => Math.round(Math.min(280, Math.max(240, w * 0.195))); // v3.8: 1440→280, 1280→250
const BAR_H = 104, EDGE = 10; // 모바일 윗막대 높이, 레일 두께 면
const lerp = (a, b, k) => a + (b - a) * k;
const geomOf = vp => vp.mobile ? { mobile: true, W: vp.w, H: 648 * vp.s, T: BAR_H, w: vp.w, h: vp.h, side0: 6 * vp.s * (1 + 0.1 * 648 * vp.s / vp.w), side1: 5 }
  : (W => ({ W, H: vp.h, R: railW(vp.w), w: vp.w, h: vp.h, side0: 14 * vp.u - 10 * vp.u * (0.3983 * W / vp.h), side1: EDGE }))(1180 * vp.u + (vp.w - 1920 * vp.u) / 2);
/* v3.9 '물' 같은 가장자리: 면의 오른쪽(모바일은 아래) 가장자리를 곧은 선 대신 2차 곡선으로.
   가운데가 움직임 속도만큼 뒤처져 부풀고(bulge), 스프링이 멈추면 곧게 펴진다. 흰 판은 같은 곡선을 왼쪽 가장자리로 써서
   언제나 면 바깥에만 생긴다(낱말 밑에 깔리지 않음). 넘침(overshoot)은 낱말을 덮지 않게 레일 폭-18px 에서 막는다 */
const edgeOf = (g, k, bulge) => {
  if (g.mobile) {
    const m = g.T - 10, l = Math.max(lerp(g.H, g.T, k), m), r = Math.max(lerp(0.9 * g.H, g.T, k), m), mid = (l + r) / 2;
    return { l, r, c: mid + 2 * Math.max(bulge, -(mid - m)) };
  }
  const m = g.R - 18, t = Math.max(lerp(0.6017 * g.W, g.R, k), m), b = Math.max(lerp(g.W, g.R, k), m), mid = (t + b) / 2;
  return { t, b, c: mid + 2 * Math.max(bulge, -(mid - m)) };
};
const n1 = v => Math.round(v * 10) / 10;
const planeClip = (g, e) => g.mobile
  ? `path('M0 0 L${n1(g.W)} 0 L${n1(g.W)} ${n1(e.r)} Q${n1(g.W / 2)} ${n1(e.c)} 0 ${n1(e.l)} Z')`
  : `path('M0 0 L${n1(e.t)} 0 Q${n1(e.c)} ${n1(g.h / 2)} ${n1(e.b)} ${n1(g.h)} L0 ${n1(g.h)} Z')`;
const sheetClip = (g, e, f, fb) => {
  const lens = 2 * fb * Math.min(1, f * 8); // 앞머리 부풂(앞머리가 가장자리에 붙으면 0 → 넓이 0)
  if (g.mobile) {
    const fl = lerp(e.l, g.h, f), fr = lerp(e.r, g.h, f), fc = lerp(e.c, g.h, f) + lens;
    return `path('M0 ${n1(e.l)} Q${n1(g.w / 2)} ${n1(e.c)} ${n1(g.w)} ${n1(e.r)} L${n1(g.w)} ${n1(fr)} Q${n1(g.w / 2)} ${n1(fc)} 0 ${n1(fl)} Z')`;
  }
  const ft = lerp(e.t, g.w, f), fbt = lerp(e.b, g.w, f), fc = lerp(e.c, g.w, f) + lens;
  return `path('M${n1(e.t)} 0 L${n1(ft)} 0 Q${n1(fc)} ${n1(g.h / 2)} ${n1(fbt)} ${n1(g.h)} L${n1(e.b)} ${n1(g.h)} Q${n1(e.c)} ${n1(g.h / 2)} ${n1(e.t)} 0 Z')`;
};
/* v4.0 면의 옆면(회색 두께): 예전에는 면을 통째로 (14u,10u) 옮긴 별도 판(.panel-side) + 레일 끝에서 켜지는 띠(.sheet-edge) 두 개였다.
   흰 판이 면 바로 옆에서 펼쳐지며 옆면을 덮어 버려서, 줄어드는 동안 검은 면과 회색 옆면 사이에 흰 틈이 보였다가 끝에서 '딱' 돌아왔다.
   이제 옆면은 같은 가장자리 곡선(edgeOf, 같은 스프링 값)에서 바로 만든 띠 하나이고 흰 판보다 위에 그린다 → 매 프레임 붙어 있음 */
const RIM_IN = 3; // 옆면 띠를 면 안쪽으로 3px 더 그려서, 두 가장자리의 안티에일리어싱이 겹치는 1~2px 에서 배경이 비치지 않게
const rimClip = (g, e, wd) => g.mobile
  ? `path('M0 ${n1(e.l - RIM_IN)} Q${n1(g.w / 2)} ${n1(e.c - RIM_IN)} ${n1(g.w)} ${n1(e.r - RIM_IN)} L${n1(g.w)} ${n1(e.r + wd)} Q${n1(g.w / 2)} ${n1(e.c + wd)} 0 ${n1(e.l + wd)} Z')`
  : `path('M${n1(e.t - RIM_IN)} 0 Q${n1(e.c - RIM_IN)} ${n1(g.h / 2)} ${n1(e.b - RIM_IN)} ${n1(g.h)} L${n1(e.b + wd)} ${n1(g.h)} Q${n1(e.c + wd)} ${n1(g.h / 2)} ${n1(e.t + wd)} 0 Z')`;
const SPR = {
  open: { morph: { type: 'spring', stiffness: 170, damping: 19, delay: 0.02 }, front: { type: 'spring', stiffness: 150, damping: 20, delay: 0.05 } },
  close: { front: { type: 'spring', stiffness: 420, damping: 36 }, morph: { type: 'spring', stiffness: 270, damping: 25, delay: 0.08 } },
};
/* 낱말: 스프링 + 순서차. 모바일은 세로 줄 → 가로 줄이라 위 낱말부터 차례로 떠나 서로 가로지르지 않게 하고, 면은 0.13초 늦게 올려 마지막 낱말이 가장자리에 덮이지 않게 */
const wordT = (railOn, i, mobile) => railOn
  ? (mobile ? { type: 'spring', stiffness: 460, damping: 34, delay: i * 0.05 } : { type: 'spring', stiffness: 380, damping: 30, delay: i * 0.035 })
  : { type: 'spring', stiffness: 320, damping: 28, delay: 0.1 + (2 - i) * (mobile ? 0.06 : 0.03) };
/* 내용 판 교체. dir: +1 = 메뉴 아래쪽으로, -1 = 위쪽으로, 0 = 같은 메뉴 안(목록↔상세: 이름이 layoutId 로 이어지므로 제자리 페이드) */
const SHEET_V = {
  enter: d => ({ opacity: 0, y: d * 28 }),
  in: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 420, damping: 34, opacity: { duration: 0.16 } } },
  out: d => ({ opacity: 0, y: d * -20, transition: { duration: 0.1, ease: [0.55, 0, 1, 0.45] } }),
};
const IDLE_BPM = 139.5;
const INIT_ROUTE = START_PLAY ? { view: 'home' } : parse(location.hash);

const IconPad = () => (<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="6" x2="10" y1="11" y2="11" /><line x1="8" x2="8" y1="9" y2="13" /><line x1="15" x2="15.01" y1="12" y2="12" /><line x1="18" x2="18.01" y1="10" y2="10" /><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" /></svg>);
const IconTv = () => (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m17 2-5 5-5-5" /><rect width="20" height="15" x="2" y="7" rx="2" /></svg>);

/* 메뉴 버튼 하나: 띠(공유 레이아웃) + 굴림 글자 + 화살표 + 누름 깊이 */
function MenuItem({ m, i, on, s, item, initial, homeState, refFn, onSelect, onOpen, moveT, current }) {
  // moveT: 이 낱말의 레일 이동 전환 (moving 이면 띠도 같은 스프링으로 따라감)
  const press = usePressDepth(7);
  return (
    <motion.a href={m.href} ref={refFn} className={'mi' + (on ? ' on' : '')} aria-current={current ? 'page' : undefined}
      custom={2 + i} variants={item} initial={initial} animate={homeState}
      layout transition={{ layout: moveT }}
      style={press.style} {...press.handlers}
      onPointerEnter={onSelect} onFocus={onSelect} onClick={onOpen}
      whileTap={{ scaleY: 0.93, scaleX: 1.015, y: 6 * s }}>
      {on && <motion.span layoutId="band" className="band" style={{ rotate: -3 }} transition={moveT.moving ? moveT : { type: 'spring', stiffness: 520, damping: 36 }} />}
      <span className="mi-label"><RollingText text={m.label} active={on} /><span className="sr">{m.label}</span></span>
      <span className="mi-go" aria-hidden="true" />
    </motion.a>
  );
}

export default function App() {
  const vp = useViewport();
  const reduce = useReducedMotion();
  const [mode, setMode] = useState(START_PLAY ? 'play' : 'home');
  const [phase, setPhase] = useState(START_PLAY ? phaseAt(DEBUG_T ?? 99) : 'home');
  const [beatIdx, setBeatIdx] = useState(null);
  const [sel, setSel] = useState(0);
  /* v4.2 무대 화면·캐릭터 반응은 '다음 박'에 맞춰 바뀐다: sel(고른 것) → stageSel(박에 떨어진 것). cue 는 바뀐 횟수 */
  const [stageSel, setStageSel] = useState(0), [cue, setCue] = useState(0);
  const [intro, setIntro] = useState(INTRO ? 0 : 9); // 0 어둠, 1~4 카운트, 5 불 켜짐(화면·캐릭터), 6 플레이 버튼, 9 끝
  const [vol, setVol] = useState(70);
  const [excited, setExcited] = useState(false);
  const [route, setRoute] = useState(INIT_ROUTE);
  const routeRef = useRef(route); routeRef.current = route;
  const panIn = useRef(false); // v5.8 홈에서 방으로 왔나(= 고개 돌리기 전체). 주소로 바로 왔으면 짧은 판
  const lastTile = useRef(null); // v4.4 미디어 방에 들어온 타일(0 게임 · 1 애니)
  const railOn = isSheet(route.view);              // v4.3 레일+흰 판은 세 문서 쪽만. 게임·애니는 따로 방(RetroRoom)
  const scene = isScene(route.view) ? route.view : null;
  const tiles = useRef([]);
  const deep = useRef(railOn);            // 주소로 바로 들어온 경우: 전환 연출 없이 레일 상태로 시작
  const [moving, setMoving] = useState(false);
  const scroller = useRef(null), fromRail = useRef(false), timers = useRef({});
  const later = (name, fn, ms) => { clearTimeout(timers.current[name]); timers.current[name] = setTimeout(fn, ms); };
  const [box, setBox] = useState(null);
  const [copied, setCopied] = useState(false);
  const engine = useRef(null), t0 = useRef(0), pills = useRef([]), playBtn = useRef(null), backBtn = useRef(null), charRef = useRef(null);
  const modeRef = useRef(mode); modeRef.current = mode;
  const shown = useRef(false);
  const [world, animateWorld] = useAnimate();
  const playPress = usePressDepth(6);

  /* ---- 시계: 노래 위치(초). 음악 전엔 클릭 후 경과 시간으로 음수 구간을 센다 ---- */
  if (!engine.current) engine.current = createSongEngine();
  useEffect(() => { const id = setTimeout(() => engine.current.preload(), 400); return () => clearTimeout(id); }, []);
  /* v5.1 미디어 방 미리 받기(로딩 화면 없이): 홈이 뜬 뒤 브라우저가 한가할 때 조용히 — 방 글자꼴 + 최애 표지 + 두 입력의 첫 화면 표지 24장씩 */
  useEffect(() => {
    let id = 0, ic = 0; const imgs = [];
    const run = () => {
      document.fonts?.load('12px RetroPx').catch(() => {});
      const B = import.meta.env.BASE_URL || './';
      const pick = (arr, k, fav) => [...arr.filter(fav).sort((a, b) => (a.fav || a.r) - (b.fav || b.r)), ...arr.slice(0, 24)].filter(x => x.ar).map(x => `${B}media/${k}/${x.id}.webp`);
      [...new Set([...pick(MEDIA.games, 'g', x => x.fav), ...pick(MEDIA.anime, 'a', x => x.r)])].forEach(u => { const im = new Image(); im.fetchPriority = 'low'; im.decoding = 'async'; im.src = u; imgs.push(im); });
    };
    id = setTimeout(() => { ic = window.requestIdleCallback ? requestIdleCallback(run, { timeout: 3000 }) : (run(), 0); }, 1800);
    return () => { clearTimeout(id); ic && window.cancelIdleCallback?.(ic); };
  }, []);
  const clock = useCallback((now = performance.now()) => {
    if (DEBUG_T != null) return DEBUG_T - LEAD;
    const st = engine.current.songTime();
    if (st != null) return st;
    const w = (now - t0.current) / 1000 - LEAD;
    // 예정 시각이 됐는데 소리가 아직이면 핀 조명 직전(암전)에서 잠깐 기다림. 0.6초 넘게 안 나오면 소리 없이 진행
    return w < 0 ? w : w < 0.6 ? 0 : w - 0.6;
  }, []);
  const musicOn = () => DEBUG_T != null ? DEBUG_T > LEAD : engine.current.songTime() != null;
  const getBeat = useCallback(now => {
    if (modeRef.current !== 'play') return { beat: now / 1000 * IDLE_BPM / 60, playing: false }; // v4.0 홈: 곡 템포 그대로(139.5 BPM)
    const b = beatAt(clock(now));
    return musicOn() ? { beat: b, playing: DEBUG_T == null } : { beat: b / 2, playing: false }; // 음악 전: 반박자로 축 처진 들썩임
  }, [clock]); // eslint-disable-line

  /* ---- 플레이 타임라인: 박 데이터의 마디 첫 박에 맞춰 단계 전환 ---- */
  useEffect(() => {
    if (mode !== 'play') return;
    let raf, lastB = null;
    const loop = now => {
      const t = clock(now), p = phaseAt(t);
      setPhase(prev => (prev === p ? prev : p));
      const b = Math.floor(beatAt(t)); if (b !== lastB) { lastB = b; setBeatIdx(b); }
      if (DEBUG_T == null) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, [mode, clock]);

  useEffect(() => { const l = window.__rhythm; if (l && mode === 'play') l.events.push({ name: 'phase:' + phase, perf: +performance.now().toFixed(1) }); }, [phase, mode]);

  /* ---- 조명이 '탁' 꺼질 때 무대가 살짝 덜컹 ---- */
  useEffect(() => {
    if (reduce || DEBUG_T != null || !world.current) return;
    if (phase === 'stutter' || phase === 'dark') animateWorld(world.current, { x: [0, -8, 6, -2, 0] }, { duration: 0.16 });
    if (phase === 'spot') animateWorld(world.current, { y: [0, 5, -2, 0] }, { duration: 0.14 });
  }, [phase]); // eslint-disable-line

  /* ---- 캐릭터 위치(조명 계산용) ---- */
  const charScale = vp.mobile ? 0.42 * vp.s : CHAR.k * vp.s; // styles.css .char --c 와 같은 값
  const dx = vp.mobile ? 58 * vp.s - (vp.w - 84 * vp.s) : (200 - CHAR.x) * vp.u;
  useEffect(() => {
    if (mode !== 'play') return;
    const id = setTimeout(() => {
      const r = charRef.current?.querySelector('.char')?.getBoundingClientRect(); if (!r) return;
      setBox({ cx: r.left, bottom: r.top, top: r.top - 392 * charScale, w: 240 * charScale });
    }, DEBUG_T != null ? 60 : 900);
    return () => clearTimeout(id);
  }, [mode, vp, charScale]);

  const play = useCallback(() => {
    if (modeRef.current !== 'home') return;
    const e = engine.current;
    e.setVolume(vol / 100); e.prime();          // 클릭(사용자 제스처) 안에서 오디오 잠금만 풀고
    e.schedule(LEAD, () => goHomeRef.current()); // 소리는 LEAD 초 뒤(핀 조명 박)에 시작
    t0.current = performance.now(); setPhase('move'); setMode('play'); setExcited(false);
    setTimeout(() => backBtn.current?.focus({ preventScroll: true }), 700);
  }, [vol]);
  const goHome = useCallback(() => {
    if (modeRef.current !== 'play') return;
    engine.current.stop();
    setMode('home'); setPhase('home'); setBeatIdx(null);
    setTimeout(() => playBtn.current?.focus({ preventScroll: true }), 450);
  }, []);
  const goHomeRef = useRef(goHome); goHomeRef.current = goHome;
  useEffect(() => { engine.current.setVolume(vol / 100); }, [vol]);
  /* v4.0 '퉁퉁퉁퉁' 박 맥박: 매 프레임 --bp(박마다 1 → 빠르게 0), --bb(마디 첫 박만) 를 쓴다.
     홈·레일은 139.5 BPM 고정 박, 플레이 중에는 실제 박 배열(getBeat). 장식·보조 요소만 이 값을 쓴다(본문 글자는 안 씀).
     값이 거의 0 이면 쓰지 않아서 박 사이 절반 이상은 아무 일도 안 함. 움직임 줄이기면 끔 */
  useEffect(() => {
    const el = world.current; if (!el) return;
    if (reduce) return; // CSS 기본값 var(--bp,0) = 0
    /* 값은 .world 전체가 아니라 맥박을 쓰는 작은 묶음에만 씀 → 스타일 재계산이 그 아래로만 (처음엔 .world 에 써서 3초에 ~240ms 재계산) */
    const SEL = '.menu,.rail-home,.tiles,.play-wrap,.deco,.char-ring,.scr,.scr-strip';
    let raf, lp = -1, lb = -1, lastBeat = null, targets = [];
    const set = (n, v) => { for (const t of targets) t.style.setProperty(n, v); };
    let calm = false;
    const loop = now => {
      /* v4.3 문서·방 화면에서는 박 맥박을 멈춤(0 으로 한 번 쓰고 쉼) → 읽는 동안 화면 안에서 아무것도 혼자 들썩이지 않음. 홈으로 오면 다시 */
      if (routeRef.current.view !== 'home' && modeRef.current !== 'play') {
        if (!calm) { calm = true; targets = [...el.querySelectorAll(SEL)]; set('--bp', 0); set('--bb', 0); lp = lb = 0; lastBeat = null; }
        raf = requestAnimationFrame(loop); return;
      }
      calm = false;
      const { beat } = getBeat(now);
      const bi = Math.floor(beat);
      if (bi !== lastBeat) { // 박마다 대상 다시 찾기(화면이 바뀌어도 따라감). v4.2 data-b = 마디 안 몇 번째 박(0~3): 무대 화면 박 칸·포스터 차례 들썩임
        lastBeat = bi; targets = [...el.querySelectorAll(SEL)]; lp = lb = -1;
        const b4 = String(((bi % 4) + 4) % 4); for (const t of targets) t.dataset.b = b4;
      }
      const f = beat - bi, k = Math.exp(-f * 7), bar = ((bi % 4) + 4) % 4 === 0;
      const bp = k < 0.04 ? 0 : Math.round(k * 12) / 12, bb = bar ? bp : 0; // 12단계로 끊어 박당 갱신 ~8번
      if (bp !== lp) { set('--bp', bp); lp = bp; }
      if (bb !== lb) { set('--bb', bb); lb = bb; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, [getBeat, reduce]);
  /* v3.9.1 빠른 연타(더블·트리플 클릭)로 글자가 까맣게 잡히던 것: 누르는 것(링크·버튼·줄·칩)과 홈/레일 전체에서는
     detail>1 인 mousedown 의 기본 동작(단어/줄 선택)을 막는다. 흰 판 안의 '읽는 글'(제목·나중에 채울 본문)은 그대로 선택 가능 */
  useEffect(() => {
    const TAP = 'a,button,[role="button"],.sk-row,.mi,.chip,.tile,.play,.pill';
    const down = e => {
      if (e.detail < 2 || !(e.target instanceof Element)) return;
      if (e.target.closest('input,textarea,[contenteditable="true"]')) return;
      if (e.target.closest(TAP) || !e.target.closest('.sheet-in')) e.preventDefault();
    };
    addEventListener('mousedown', down, true); return () => removeEventListener('mousedown', down, true);
  }, []);

  /* ---- 주소(해시) 이동: 한 단계마다 history 한 칸. Esc 는 한 단계 위로 ---- */
  const apply = useCallback(r => {
    const cur = routeRef.current;
    if (isScene(cur.view) && r.view === 'home') { // 방에서 홈으로: 들어왔던 타일에 포커스(주소로 바로 왔으면 지금 입력 쪽 타일)
      const ti = lastTile.current ?? (cur.ch === 'anime' ? 1 : 0); lastTile.current = null;
      later('focus', () => { if (routeRef.current.view === 'home') tiles.current[ti]?.focus({ preventScroll: true }); }, 520);
    }
    if (cur.view === 'portfolio' && cur.slug && scroller.current) scroller.current.scrollTop = 0; // 상세 → 목록: 머리가 카드 자리로 줄어드는 동안 화면이 튀지 않게 먼저 맨 위로
    if (isSheet(cur.view) && r.view === 'home') {
      const i = MENU.findIndex(m => m.id === cur.view);
      fromRail.current = true; later('fromRail', () => (fromRail.current = false), 1000);
      setSel(i < 0 ? 0 : i);
      later('focus', () => { if (routeRef.current.view === 'home') pills.current[i]?.focus({ preventScroll: true }); }, 480);
    }
    if (cur.view === 'home' && r.view !== 'home') { fromRail.current = false; clearTimeout(timers.current.focus); }
    if (isScene(r.view) && !isScene(cur.view)) panIn.current = cur.view === 'home';
    if (isSheet(cur.view) !== isSheet(r.view)) { deep.current = false; setMoving(true); later('moving', () => setMoving(false), 900); }
    setRoute(r);
  }, []);
  const go = useCallback((r, { replace = false } = {}) => {
    const cur = routeRef.current, url = build(r);
    if (!replace && url === build(cur)) return;
    const st = replace ? (history.state || {}) : { prev: build(cur) };
    history[replace ? 'replaceState' : 'pushState'](st, '', url || location.pathname + location.search);
    apply(r);
  }, [apply]);
  const goUp = useCallback(() => {
    const par = parentOf(routeRef.current);
    if (history.state && history.state.prev === build(par)) history.back(); else go(par, { replace: true });
  }, [go]);
  useEffect(() => {
    const on = () => { const r = parse(location.hash); if (r.view !== 'home' && location.hash !== build(r)) history.replaceState(history.state, '', build(r)); apply(r); };
    addEventListener('popstate', on); return () => removeEventListener('popstate', on);
  }, [apply]);
  useEffect(() => { // 예전 주소(#portfolio 등)는 새 주소로 바꿔 둠
    if (location.hash && location.hash !== build(route) && route.view !== 'home') history.replaceState(history.state, '', build(route));
  }, []); // eslint-disable-line
  const openPage = (i, e) => {
    e.preventDefault();
    if (modeRef.current !== 'home') return;
    const cur = routeRef.current;
    if (cur.view === MENU[i].id && !cur.slug) return;
    if (isScene(cur.view)) return;
    setSel(i); go({ view: MENU[i].id });
  };

  /* v4.3 이력 타일 → 레트로 방. 방은 그 타일 가운데에서 동그랗게 열림(RetroRoom 이 타일 위치를 직접 잼) */
  /* v4.4 두 타일 → 같은 한 방(미디어 방). 들어온 타일이 첫 입력만 정함 */
  const hintRef = useRef(null);
  const openScene = (ch, e) => {
    e.preventDefault();
    if (modeRef.current !== 'home' || routeRef.current.view !== 'home') return;
    lastTile.current = ch === 'anime' ? 1 : 0; hintRef.current = ch;
    go({ view: 'media', ch: null }); // v5.2 타일 → 방(창은 방에서 물건을 골라야 뜸). 들어온 타일 쪽 물건에 포커스
  };
  /* 방 안에서 입력을 바꾸면 주소만 바꿔 둠(새로고침·공유 때 그 입력으로). 기록은 늘리지 않음 → 뒤로/Esc 는 바로 홈 */
  const onCh = useCallback(ch => { const r = { view: 'media', ch }; history.replaceState(history.state, '', build(r)); routeRef.current = r; setRoute(r); }, []);
  useEffect(() => { setSfxVolume(vol / 100); }, [vol]);

  /* ---- 키보드 ---- */
  useEffect(() => {
    const key = e => {
      if (e.key === 'Escape') { if (modeRef.current === 'play') { e.preventDefault(); goHome(); } else if (routeRef.current.view !== 'home') { e.preventDefault(); goUp(); } return; }
      if (modeRef.current !== 'home' || routeRef.current.view !== 'home') return;
      const ae = document.activeElement;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (ae && ae.getAttribute('role') === 'slider') return;
        e.preventDefault();
        const n = (sel + (e.key === 'ArrowDown' ? 1 : MENU.length - 1)) % MENU.length;
        setSel(n); pills.current[n]?.focus({ preventScroll: true });
      }
      if (e.code === 'Space' && !(ae && ae.tagName === 'BUTTON')) { e.preventDefault(); play(); }
    };
    addEventListener('keydown', key); return () => removeEventListener('keydown', key);
  }, [sel, play, goHome, goUp]);

  /* ---- 플레이 중 게임 입력(Space · →)은 홈 동작에 새지 않게 가장 먼저 가로챈다 ----
     포커스가 '돌아가기'·음량 다이얼에 있어도 Space 가 버튼을 누르거나 → 가 음량을 올리지 않음. Esc 는 그대로 돌아가기.
     게임 쪽은 window 의 'rhythm:input' 이벤트(detail.key, detail.t = 노래 위치)를 받아 쓰면 된다. */
  useEffect(() => {
    if (mode !== 'play') return;
    const guard = e => {
      if (e.code !== 'Space' && e.key !== 'ArrowRight') return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.type === 'keydown' && !e.repeat)
        dispatchEvent(new CustomEvent('rhythm:input', { detail: { key: e.code === 'Space' ? 'space' : 'right', t: clock(e.timeStamp) } }));
    };
    addEventListener('keydown', guard, true); addEventListener('keyup', guard, true);
    return () => { removeEventListener('keydown', guard, true); removeEventListener('keyup', guard, true); };
  }, [mode, clock]);

  /* ---- v4.2 박 맞춤 미리보기 교체 ---- */
  const stageRef = useRef(0); stageRef.current = stageSel;
  useEffect(() => {
    if (sel === stageRef.current) return;
    const { beat } = getBeat(performance.now());
    const wait = reduce || DEBUG_T != null ? 0 : (Math.ceil(beat) - beat) * 60000 / IDLE_BPM;
    const id = setTimeout(() => { setStageSel(sel); setCue(c => c + 1); }, wait);
    return () => clearTimeout(id);
  }, [sel]); // eslint-disable-line
  const lookAt = useCallback(() => { const b = pills.current[sel]?.getBoundingClientRect(); return b && { x: b.left + b.width * 0.8, y: b.top + b.height / 2 }; }, [sel]);
  /* ---- v4.2 첫 진입 인트로(약 1.2초): 오른쪽 무대가 어둡고 → 반 박마다 카운트 4번 → 불이 켜지며 화면이 떨어지고 캐릭터가 튀어나옴 → 플레이 버튼 → 끝 ---- */
  useEffect(() => {
    if (intro >= 9) return;
    const at = [0.02, 0.02 + HALF, 0.02 + 2 * HALF, 0.02 + 3 * HALF, 0.1 + 3 * HALF, 0.1 + 3.5 * HALF, 0.1 + 5 * HALF]; // 넷째 칸(노랑)과 거의 함께 불이 켜짐
    const steps = [1, 2, 3, 4, 5, 6, 9];
    const ids = steps.map((st, i) => setTimeout(() => setIntro(st), at[i] * 1000));
    return () => ids.forEach(clearTimeout);
  }, []); // eslint-disable-line
  /* ---- v4.2 포인터 시차: 마우스일 때만, 무대 층마다 조금씩 다르게(바닥 < 캐릭터 < 화면) ---- */
  const PX = { stiffness: 120, damping: 20, mass: 0.6 };
  const px = useMotionValue(0), py = useMotionValue(0);
  const fx = useMotionValue(0), cxm = useMotionValue(0), sx = useMotionValue(0), sy = useMotionValue(0), bxm = useMotionValue(0);
  useEffect(() => {
    if (reduce || vp.mobile) return;
    const anims = [];
    const on = e => {
      if (e.pointerType !== 'mouse' || modeRef.current !== 'home') return;
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5, u = vp.u;
      anims.forEach(a => a.stop()); anims.length = 0;
      [[fx, -10 * nx * u], [cxm, -7 * nx * u], [sx, -18 * nx * u], [sy, -8 * ny * u], [bxm, -12 * nx * u]].forEach(([m, v]) => anims.push(animate(m, v, { type: 'spring', ...PX })));
    };
    addEventListener('pointermove', on); return () => { removeEventListener('pointermove', on); anims.forEach(a => a.stop()); };
  }, [reduce, vp]); // eslint-disable-line
  useEffect(() => { if (mode !== 'home') [fx, cxm, sx, sy, bxm].forEach(m => animate(m, 0, { duration: 0.3 })); }, [mode]); // eslint-disable-line

  const copyEmail = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(done, () => (location.href = 'mailto:' + EMAIL));
    else location.href = 'mailto:' + EMAIL;
  };

  /* ---- 홈 요소 공통 변형: 첫 등장 / 플레이로 빠지기 / 돌아오기 ---- */
  const s = vp.s;
  const item = {
    hide: { opacity: 0, y: 16 * s },
    show: i => ({ opacity: 1, x: 0, y: 0, transition: shown.current
      ? { duration: 0.26, delay: (fromRail.current ? 0.3 : 0.24) + i * 0.022, ease: EASE_OUT }
      : { duration: 0.3, delay: 0.14 + i * 0.045, ease: EASE_OUT } }),
    // 빠질 때 scale·y 를 명시: 빠뜨리면 Motion 이 초기값(hide: scale .5)으로 되돌려, 돌아올 때 플레이 버튼이 작아졌다 커지는 버그가 있었음
    out: i => ({ opacity: 0, x: -120 * s, y: 0, scale: 1, transition: { duration: 0.16, delay: 0.03 + i * 0.014, ease: EASE_IN } }),
    // v3.8: 레일로 갈 때는 낱말이 움직이기 전에 플레이·타일·머리줄이 0.1초 안에 빠진다
    railOut: i => ({ opacity: 0, x: -40 * s, y: 0, scale: 1, transition: { duration: 0.08, ease: EASE_IN } }),
  };
  useEffect(() => { const id = setTimeout(() => (shown.current = true), 1000); return () => clearTimeout(id); }, []);
  const homeState = mode !== 'home' ? 'out' : railOn ? 'railOut' : 'show';
  const menuState = mode === 'home' ? 'show' : 'out';
  const contactState = mode !== 'home' ? 'out' : railOn && vp.mobile ? 'railOut' : 'show';
  const initial = STILL ? false : INIT_ROUTE.view !== 'home' ? 'out' : 'hide';
  const initialKeep = STILL || INIT_ROUTE.view !== 'home' ? false : 'hide';
  const moveTi = i => reduce ? { duration: 0 } : { ...wordT(railOn, i, vp.mobile), moving };
  const activeIdx = MENU.findIndex(m => m.id === route.view);

  /* ---- 면 → 레일: 사선 면의 위·아래 꼭짓점을 레일 폭까지 끌어와 곧은 기둥으로 ---- */
  const g = geomOf(vp);
  const morph = useMotionValue(railOn ? 1 : 0);
  const front = useMotionValue(railOn ? 1 : 0);
  const e0 = edgeOf(g, morph.get(), 0);
  const clip = useMotionValue(planeClip(g, e0));
  const sclip = useMotionValue(sheetClip(g, e0, front.get(), 0));
  const rimW = k => lerp(g.side0, g.side1, Math.max(0, Math.min(1, k)));
  const rclip = useMotionValue(rimClip(g, e0, rimW(morph.get())));
  useEffect(() => {
    const D = g.mobile ? (1.9 * g.H) / 2 - g.T : (1.6017 * g.W) / 2 - g.R, maxB = 0.06 * (g.mobile ? g.w : g.h);
    const clampB = v => Math.max(-maxB, Math.min(maxB, v));
    const upd = still => {
      const k = morph.get(), f = front.get();
      const calm = still === true || reduce; // 끝났거나 움직임 줄이기면 부풂 0 (순간 이동의 속도값이 남아 휜 채로 멈추던 것)
      const vk = calm ? 0 : morph.getVelocity(), vf = calm ? 0 : front.getVelocity();
      const bulge = Math.abs(vk) < 0.05 ? 0 : clampB(vk * D * 0.022);
      const fb = Math.abs(vf) < 0.05 ? 0 : clampB(-vf * (g.mobile ? g.h - g.T : g.w - g.R) * 0.012);
      const e = edgeOf(g, k, bulge);
      clip.set(planeClip(g, e)); sclip.set(sheetClip(g, e, f, fb)); rclip.set(rimClip(g, e, rimW(k)));
    };
    upd(true); const a = morph.on('change', upd), b = front.on('change', upd);
    const done = () => setTimeout(() => { if (!morph.isAnimating() && !front.isAnimating()) upd(true); }, 0);
    const c = morph.on('animationComplete', done), d = front.on('animationComplete', done);
    return () => { a(); b(); c(); d(); };
  }, [vp, reduce]); // eslint-disable-line
  const firstRail = useRef(true);
  useEffect(() => {
    if (firstRail.current) { firstRail.current = false; return; }
    const T = railOn ? SPR.open : SPR.close, q = reduce ? { duration: 0 } : null;
    const a = animate(morph, railOn ? 1 : 0, q || (railOn && vp.mobile ? { ...T.morph, delay: 0.13 } : T.morph)), b = animate(front, railOn ? 1 : 0, q || T.front);
    return () => { a.stop(); b.stop(); };
  }, [railOn]); // eslint-disable-line
  const focusTitle = () => { if (routeRef.current.view !== 'home') scroller.current?.querySelector('.sh-title')?.focus({ preventScroll: true }); };
  const wasRail = useRef(false);
  useEffect(() => { // 내용이 바뀌면 맨 위로, 제목에 포커스
    const was = wasRail.current; wasRail.current = railOn;
    if (!railOn) return;
    if (scroller.current) scroller.current.scrollTop = 0;
    if (was) return; // v3.9 레일 안에서 바뀔 때는 옛 내용이 사라진 뒤(onExitComplete) 새 제목에 포커스(sheet-in onAnimationStart) — 전에는 사라질 옛 제목에 포커스가 가서 body 로 빠졌음
    const id = setTimeout(focusTitle, deep.current ? 50 : 420);
    return () => clearTimeout(id);
  }, [route.view, route.slug, railOn]); // eslint-disable-line
  const contentKey = route.view; // v4.3 목록↔상세는 같은 판 안에서 이어짐(PortfolioView). 판 교체는 메뉴가 바뀔 때만
  const lastKey = useRef([contentKey, route.view]), dirRef = useRef(0);
  if (lastKey.current[0] !== contentKey) { // 렌더 중 계산: AnimatePresence 의 custom 이 이번 교체에 바로 쓰이도록. 내용이 바뀔 때만 갱신
    const a = MENU.findIndex(m => m.id === lastKey.current[1]), b = MENU.findIndex(m => m.id === route.view);
    dirRef.current = a < 0 || b < 0 ? 0 : Math.sign(b - a); lastKey.current = [contentKey, route.view];
  }

  const dark = mode === 'play' && phase !== 'move';
  const planeOut = vp.mobile ? { x: 0, y: '-110%' } : { x: '-110%', y: 0 };
  const planeMotion = {
    initial: STILL ? false : (vp.mobile ? { y: '-100%' } : { x: '-100%' }),
    animate: mode === 'home' ? { x: 0, y: 0 } : planeOut,
    transition: mode === 'home' ? { duration: 0.42, delay: shown.current ? 0.06 : 0, ease: EASE_OUT } : { duration: 0.4, delay: 0.12, ease: [0.55, 0, 0.75, 0.2] },
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={'world' + (mode === 'play' ? ' playing' : '')} ref={world} inert={scene ? '' : undefined}>
        <motion.div className="floor-wrap" aria-hidden="true" style={{ x: fx }}><div className="floor" /></motion.div>
        {/* v4.2 인트로: 오른쪽 무대가 꺼진 채 반 박마다 네 칸이 켜지고(카운트), 넷째 박에 불이 들어옴 */}
        <AnimatePresence>{intro < 5 && (
          <motion.div key="shade" className="intro-shade" aria-hidden="true" exit={{ opacity: 0, transition: { duration: 0.06 } }}>
            <span className="intro-count">{[1, 2, 3, 4].map(k => <i key={k} className={intro >= k ? 'on' : ''} />)}</span>
          </motion.div>)}</AnimatePresence>
        <main className="stage">
          <motion.div className="plane" aria-hidden="true" {...planeMotion}>
            {/* 원리: Codrops Sidebar Transitions — 면이 통째로 밀려나며 무대가 드러남 */}
            <motion.div className="panel-cast" style={{ clipPath: clip }} /><motion.div className="panel" style={{ clipPath: clip }}><div className="tone" /></motion.div>
          </motion.div>

          {/* 무대 장식: 무대 앞 턱(검은 띠) 하나만. v4.2 발 조명 반원·단상·햇살 뺌 */}
          <motion.div className="deco" aria-hidden="true" initial={false} animate={{ opacity: railOn || mode === 'play' ? 0 : 1 }} transition={{ duration: railOn ? 0.15 : 0.3, delay: railOn ? 0 : 0.25 }}>
            <i className="dc-lip" />
          </motion.div>
          {/* v4.2 미리보기 무대 화면(데스크톱): 위에서 매달려 내려옴. 플레이·레일에서는 위로 걷힘 */}
          {!vp.mobile && (
            <motion.div className="scr-wrap" style={{ x: sx, y: sy }}>
              <motion.div className="scr-drop" initial={STILL || INIT_ROUTE.view !== 'home' ? false : { y: '-125%' }}
                animate={mode === 'play' ? { y: '-125%', transition: { duration: 0.3, ease: EASE_IN } }
                  : railOn ? { y: '-125%', transition: { duration: 0.2, ease: EASE_IN } }
                  : intro < 5 ? { y: '-125%' }
                  : { y: '0%', transition: { type: 'spring', stiffness: 380, damping: 17, delay: intro < 9 ? 0 : fromRail.current ? 0.3 : 0.22 } }}>
                <PreviewStage sel={stageSel} pending={sel !== stageSel} href={MENU[stageSel].href} onOpen={(i, e) => openPage(i, e)} />
              </motion.div>
            </motion.div>)}
          <motion.div className="char-wrap" initial={false} animate={railOn ? { x: 260 * s, opacity: 0 } : { x: 0, opacity: 1 }}
            transition={railOn ? { duration: 0.26, ease: EASE_IN } : { duration: 0.3, delay: 0.24, ease: EASE_OUT }}>
            <motion.div className="char-par" style={{ x: cxm }}>
              <motion.div className="char-in" initial={false} animate={intro < 5 ? { y: 220 * vp.u, opacity: 0 } : { y: 0, opacity: 1 }}
                transition={intro < 9 ? { type: 'spring', stiffness: 700, damping: 18 } : { duration: 0 }}>
                <div ref={charRef}><Character pose={vp.mobile ? 'point' : CHAR.pose} mode={mode} dx={dx} scale={charScale} getBeat={getBeat} excited={excited} reduce={reduce} cue={cue} lookAt={lookAt} /></div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.section className="sheet fielded" aria-label="내용" aria-hidden={railOn ? undefined : 'true'}
            style={{ clipPath: sclip, '--rw': (g.R || 0) + 'px', '--bh': BAR_H + 'px', '--edge': EDGE + 'px' }}>
            <Field active={railOn} reduce={reduce} scroller={scroller} />
            <motion.div className="sheet-scroll" ref={scroller} layoutScroll>
              {/* 내용 교체: 레일 메뉴 순서로 위/아래 방향을 정해 들어오고 나감(motion.dev usePresenceData 아이디어, custom 으로 전달) */}
              <AnimatePresence mode="wait" initial={false} custom={dirRef.current}>
                {railOn && (
                  <motion.div key={contentKey} className="sheet-in" custom={dirRef.current} variants={SHEET_V}
                    initial="enter" animate="in" exit="out" onAnimationStart={d => d === 'in' && focusTitle()}>
                    <motion.div initial="hide" animate="show"
                      variants={{ hide: {}, show: { transition: { delayChildren: moving && !deep.current ? (vp.mobile ? 0.36 : 0.3) : 0.03, staggerChildren: 0.05 } } }}>
                      {route.view === 'portfolio' && <PortfolioView slug={route.slug} go={go} />}
                      {route.view === 'resume' && <ResumePage go={r => { setSel(MENU.findIndex(m => m.id === 'portfolio')); go(r); }} />}
                      {route.view === 'cover' && <CoverPage />}
                    </motion.div>
                  </motion.div>)}
              </AnimatePresence>
            </motion.div>
          </motion.section>

          {/* 면의 옆면: 흰 판 위, 홈 글자 아래. 면과 같은 움직임(플레이 때 함께 밀려남) */}
          <motion.div className="rim-wrap" aria-hidden="true" {...planeMotion}><motion.div className="rim" style={{ clipPath: rclip }} /></motion.div>

          <div className={'home' + (railOn ? ' in-rail' : '')}>
            {/* 머리줄 왼쪽: 사이트 로고처럼 작은 정체성 블록 */}
            <AnimatePresence>
              {railOn && mode === 'home' && (
                <motion.a key="rail-home" className="abs rail-home" href="#/" onClick={e => { e.preventDefault(); go({ view: 'home' }); }}
                  initial={deep.current ? false : { opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.3, duration: 0.22, ease: EASE_OUT } }}
                  exit={{ opacity: 0, x: -14, transition: { duration: 0.12 } }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9v11h13V9" /><path d="M10 20v-6h4v6" /></svg><span>홈</span></motion.a>)}
            </AnimatePresence>
            <motion.header className="abs brand" custom={0} variants={item} initial={initial} animate={homeState} inert={homeState !== 'show' ? '' : undefined}>
              {STILL ? <h1 className="brand-name" aria-label="조경환">{[...'조경환'].map((c, i) => <span key={i} className="ch" aria-hidden="true">{c}</span>)}</h1>
                : <SplitName text="조경환" className="brand-name" delay={0.16} />}
              <span className="brand-rule" aria-hidden="true" />
              <motion.p className="brand-role" initial={STILL ? false : { opacity: 0, filter: 'blur(6px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.35, delay: 0.3 }}>
                전투 · 시스템 게임 기획자 지망생
              </motion.p>
            </motion.header>

            <nav className={'abs menu' + (railOn ? ' rail' : '')} aria-label="주 메뉴" inert={mode !== 'home' ? '' : undefined}>
              {MENU.map((m, i) => (
                <MenuItem key={m.id} m={m} i={i} on={railOn ? activeIdx === i : sel === i} current={railOn && activeIdx === i} s={s} item={item} initial={initialKeep} homeState={menuState}
                  moveT={moveTi(i)} refFn={el => (pills.current[i] = el)} onSelect={() => !railOn && setSel(i)} onOpen={e => openPage(i, e)} />
              ))}
            </nav>

            <div className="abs tiles" inert={homeState !== 'show' ? '' : undefined}>
              <motion.div custom={5} variants={item} initial={initial} animate={homeState}><SpotlightTile ref={el => (tiles.current[0] = el)} href="#/media" icon={<IconPad />} label="게임 플레이 이력" onClick={e => openScene('game', e)} /></motion.div>
              <motion.div custom={6} variants={item} initial={initial} animate={homeState}><SpotlightTile ref={el => (tiles.current[1] = el)} href="#/media" icon={<IconTv />} label="애니메이션 시청 이력" onClick={e => openScene('anime', e)} /></motion.div>
            </div>

            {vp.mobile && (
              <motion.div className="abs strip-wrap" custom={7} variants={item} initial={initial} animate={homeState} inert={homeState !== 'show' ? '' : undefined}>
                <PreviewStage mobile sel={stageSel} href={MENU[stageSel].href} onOpen={(i, e) => openPage(i, e)} />
              </motion.div>)}

            {/* v4.2 플레이: 왼쪽 타일 줄에서 빼서 오른쪽 무대 바닥으로 — '쇼 시작' 버튼 */}
            <motion.div className="abs play-wrap" custom={7} variants={{ ...item,
              hide: { opacity: 0, scale: 0.5 },
              out: { opacity: 0, x: 0, y: 90 * s, scale: 0.9, transition: { duration: 0.18, delay: 0.02, ease: EASE_IN } },
              railOut: { opacity: 0, x: 0, y: 30 * s, scale: 1, transition: { duration: 0.08, ease: EASE_IN } },
              show: i => ({ opacity: 1, scale: 1, x: 0, transition: shown.current ? { duration: 0.26, delay: fromRail.current ? 0.34 : 0.3 } : { type: 'spring', stiffness: 600, damping: 16, delay: INTRO ? 0.1 + 3.5 * HALF : 0.5 } }) }}
              initial={initial} animate={homeState} inert={homeState !== 'show' ? '' : undefined}>
              <motion.div className="play-par" style={{ x: bxm }}>
              <Magnetic className="mag">
                <motion.button ref={playBtn} className="play" type="button" onClick={play}
                  style={playPress.style} {...playPress.handlers}
                  onPointerEnter={() => setExcited(true)} onPointerLeave={e => { setExcited(false); playPress.handlers.onPointerLeave(e); }}
                  whileTap={{ scale: 0.93, y: 5 * s }} transition={{ type: 'spring', stiffness: 700, damping: 20 }}>
                  <span className="play-main"><i aria-hidden="true" />플레이</span>
                  <span className="play-sub">게임 시작</span>
                </motion.button>
              </Magnetic>
              </motion.div>
            </motion.div>

            <AnimatePresence mode="wait" initial={false}>
            {/* v3.8: 연락처는 모양(가로↔세로)이 바뀌어 크기 보간하면 글자가 찌그러짐 → 빠르게 빠졌다가 자리 잡은 뒤 다시 나타남 */}
            <motion.div key={railOn ? 'rail' : 'home'} className={'abs contact' + (railOn ? ' rail' : '')} initial={initialKeep}
              variants={{ hide: { opacity: 0, y: 16 * s }, out: item.out(8), railOut: { opacity: 0, transition: { duration: 0.08 } },
                show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.24, ease: EASE_OUT, delay: railOn ? 0.4 : fromRail.current ? 0.32 : shown.current ? 0.42 : 0.5 } } }}
              animate={contactState} exit={{ opacity: 0, transition: { duration: 0.07 } }} inert={contactState !== 'show' ? '' : undefined}>
              <button type="button" className="chip" onClick={copyEmail} aria-describedby="copy-tip">
                <span className="chip-ic" aria-hidden="true">
                  {/* 원리: motion.dev Copy Button — 복사하면 봉투가 체크로 바뀌었다가 돌아옴 */}
                  <AnimatePresence initial={false} mode="popLayout">
                    {copied
                      ? <motion.svg key="ok" viewBox="0 0 24 24" initial={{ scale: 0.4, opacity: 0, rotate: -25 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: 'spring', stiffness: 700, damping: 26 }}>
                          <motion.path d="M4 12.5l5 5L20 6.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.22, ease: EASE_OUT, delay: 0.04 }} style={{ strokeWidth: 3 }} /></motion.svg>
                      : <motion.svg key="mail" viewBox="0 0 24 24" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.4, opacity: 0, rotate: 25 }} transition={{ type: 'spring', stiffness: 700, damping: 26 }}>
                          <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></motion.svg>}
                  </AnimatePresence>
                </span>{EMAIL}
                <AnimatePresence>{copied && (
                  /* 원리: React Bits WarmTooltip / motion.dev Copy Button — 누른 자리에서 짧게 튀어나오는 확인 말풍선 */
                  <motion.span key="tip" className="tip" role="status" initial={{ opacity: 0, y: 6, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }} transition={{ type: 'spring', stiffness: 600, damping: 24 }}>복사됨</motion.span>)}
                </AnimatePresence>
                <span id="copy-tip" className="sr">누르면 메일 주소가 복사됩니다</span>
              </button>
              <a className="chip" href={'tel:' + PHONE.replace(/-/g, '')}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>{PHONE}
              </a>
            </motion.div>
            </AnimatePresence>

          </div>
        </main>
      </div>

      <Lights phase={mode === 'play' ? phase : 'home'} box={box} reduce={reduce} />

      <div className="stage stage-top">
        <AnimatePresence>{mode === 'play' && phase === 'tutorial' && <Tutorial key="tut" reduce={reduce} />}</AnimatePresence>
      </div>

      <div className={'hud' + (dark ? ' dark' : '')} inert={mode !== 'play' ? '' : undefined}>
        <AnimatePresence>
          {mode === 'play' && (
            <motion.div key="hud" className="hud-in" initial="h" animate="s" exit="h"
              variants={{ s: { transition: { staggerChildren: 0.05, delayChildren: STILL ? 0 : 0.6 } }, h: { transition: { duration: 0.12 } } }}>
              <motion.div className="hud-back" variants={{ h: { opacity: 0, scale: 0.6 }, s: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 600, damping: 20 } } }}>
                <Magnetic strength={0.15} range={40}><button ref={backBtn} className="back" type="button" onClick={goHome}><i />돌아가기</button></Magnetic>
              </motion.div>
              <motion.div className="beats" aria-hidden="true" variants={{ h: { opacity: 0, y: -10 }, s: { opacity: 1, y: 0 } }}>
                {[0, 1, 2, 3].map(k => <span key={k} className={beatIdx != null && phase !== 'move' && phase !== 'stutter' && ((beatIdx % 4) + 4) % 4 === k ? 'on' : ''} />)}
              </motion.div>
              <motion.div className="hud-dial" variants={{ h: { opacity: 0, scale: 0.6 }, s: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 600, damping: 20 } } }}>
                <CometDial value={vol} onChange={setVol} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {scene && <MediaRoom key="media" ch0={route.ch} hint={hintRef.current} onCh={onCh} onHome={goUp} reduce={reduce} pan={panIn.current} worldRef={world} />}
      </AnimatePresence>

      <ClickSpark enabled={mode !== 'play' && !scene} />
    </MotionConfig>
  );
}
