import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, stagger, useAnimate, usePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { createTV } from '../tvScreen.js';
import { sfx, sfxMuted, setSfxMuted, onSfxMute } from '../sfx.js';
import M from '../media.json';
/* v4.4 미디어 방: '게임 플레이 이력' 과 '애니메이션 시청 이력' 을 한 화면으로. 큰 모니터 하나에 입력이 둘(GAME = 게임기, TV = 비디오).
   어느 타일로 들어왔는지가 첫 입력만 정함. 입력 바꾸기는 그 자리에서: 지지직 + 사선 한 번.
   데이터·표지는 예전 사이트(src/data, public/images) 그대로 — 표지는 Cho 의 내용이라 씀(WebP 썸네일, 늦게 불러옴).
   움직임: 페르소나 메뉴의 '사선으로 베고 들어와 살짝 넘쳤다 멈춤' 을 검정·흰·노랑으로 옮김(코드·글자꼴 따라 하지 않음).
   들어가기 1.2초 이내, 누르면 바로 끝. 읽는 곳(목록)은 가만히 */
const PLAT = [['all', '전체'], ['pc', 'PC'], ['mo', '모바일'], ['co', '콘솔']];
const PLAT_L = { pc: 'PC', mo: '모바일', co: '콘솔' };
const CH = { game: { n: 1, name: 'GAME', unit: 'GAMES', items: M.games, groups: M.genres }, anime: { n: 2, name: 'TV', unit: 'TITLES', items: M.anime, groups: M.animeGenres } };
const EO = [0.16, 1, 0.3, 1], EI = [0.7, 0, 0.84, 0], SL = [0.45, 0, 0.35, 1];
const BASE = import.meta.env.BASE_URL || './';
const src = (k, id) => `${BASE}media/${k}/${id}.webp`;
const hours = f => (f && /시간/.test(f) ? f.match(/\d+/)?.[0] : null);

/* 숫자가 굴러 맞춰지는 계수기. 자리마다 0~9 띠를 위아래로 */
function Odo({ value, roll }) {
  const s = String(value).padStart(3, '0');
  return (
    <span className="mr-odo" aria-hidden="true">
      {s.split('').map((d, i) => (
        <span key={s.length - i} className={'od' + (i < s.length - String(value).length ? ' z' : '')}>
          <motion.span className="od-s" initial={false} animate={{ y: `-${+d * 10}%` }}
            transition={roll ? { type: 'spring', stiffness: 520, damping: 34, delay: i * 0.04 } : { duration: 0 }}>
            {'0123456789'.split('').map(n => <i key={n}>{n}</i>)}
          </motion.span>
        </span>))}
    </span>);
}

/* 카드: 게임 = 카트리지(라벨 자리에 표지), 애니 = 비디오테이프 케이스(옆 등에 방영 연도). 포인터가 없을 땐 주사선·망점이 얹혀 브라운관 같고,
   올리거나 고르면(focus) 걷혀서 원래 표지가 또렷하게 */
const GameCard = memo(function GameCard({ g, feat, eager }) {
  const h = hours(g.f), special = g.f && !h && !/년/.test(g.f) ? g.f : null, years = g.f && /년/.test(g.f) ? g.f : null;
  return (
    <li className={'mr-it gc' + (g.fav ? ' fav' : '') + (feat ? ' feat' : '')} tabIndex={-1} data-k="it"
      aria-label={`${g.t}, ${PLAT_L[g.p]}, ${g.g}${g.f ? ', ' + g.f : ''}${g.pc ? ', 완벽 클리어' : g.cl ? ', 클리어' : ''}${g.fav ? ', 최애' : ''}`}>
      <span className="gc-grip" aria-hidden="true"><i /><i /><i /></span>
      <span className={'cov' + (g.ar && g.ar < 1.3 ? ' icon' : '')}>
        {g.ar ? <img src={src('g', g.id)} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" draggable="false" /> : <b className="cov-none">{g.t}</b>}
        <span className="bd">
          {h && <em className="b-h">{h}시간</em>}
          {years && <em className="b-h">{years}</em>}
          {g.pc ? <em className="b-p">100%</em> : g.cl ? <em className="b-c">CLEAR</em> : null}
        </span>
        {g.fav && <em className="b-fav">최애</em>}
      </span>
      <b className="tt">{g.t}</b>
      <span className="mt">{PLAT_L[g.p]} · {g.g}</span>
      {special && <span className="sp" title={special}>★ {special}</span>}
    </li>);
});
const QL = q => (q > 0 ? q + 'Q' : q === -1 ? '극장' : q === -2 ? '웹' : ''), QA = q => (q > 0 ? q + '분기' : q === -1 ? '극장판' : q === -2 ? '웹' : '');
const AnimeCard = memo(function AnimeCard({ a, eager }) {
  return (
    <li className={'mr-it vc' + (a.r ? ' fav' : '')} tabIndex={-1} data-k="it"
      aria-label={`${a.t}, ${a.y || ''} ${QA(a.q)}, ${a.g.join(' ')}${a.r ? ', 최애 ' + a.r + '위' : ''}`}>
      <span className="vc-case">
        <span className="vc-spine" aria-hidden="true"><b>{a.y || '—'}</b>{QL(a.q) ? <i>{QL(a.q)}</i> : null}</span>
        <span className="cov">
          {a.ar ? <img src={src('a', a.id)} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" draggable="false" /> : <b className="cov-none">{a.t}</b>}
          {a.r && <em className="b-rank">#{a.r}</em>}
        </span>
      </span>
      <b className="tt">{a.t}</b>
      <span className="mt">{a.g.slice(0, 3).join(' · ')}</span>
    </li>);
});

/* v5.2 정렬 규칙(데이터에 있는 것만): 게임 = 기종 · 플레이 기록(시간/기간/업적 글) · 100%/클리어 · 이름. 애니 = 방영 연도·분기 · 이름.
   (시청/플레이한 날짜는 데이터에 없어서 '최근 플레이순' 은 못 만듦 → 애니는 '방영' 기준이라고 밝힘) */
const coll = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });
const byName = (a, b) => coll.compare(a.t, b.t);
const yrs = g => (g.f && /년/.test(g.f) ? +(g.f.match(/\d+/)?.[0] || 0) : 0);
const hrs = g => +(hours(g.f) || 0);
const ach = g => (g.f && !hrs(g) && !yrs(g) ? 1 : 0);
const rec = (a, b) => (yrs(b) - yrs(a)) || (hrs(b) - hrs(a)) || (ach(b) - ach(a)) || ((b.pc | 0) - (a.pc | 0)) || ((b.cl | 0) - (a.cl | 0)) || byName(a, b);
const qNew = a => (a.q > 0 ? a.q : a.q === -1 ? 0 : -1), qOld = a => (a.q > 0 ? a.q : a.q === -1 ? 5 : 6);
export const SORTS = {
  game: [
    { k: 'plat', l: '기종별', rule: '기종마다 묶음(PC → 모바일 → 콘솔). 묶음 안은 플레이 기록이 많은 순 — 기간 → 시간 → 업적 → 100% → 클리어 → 가나다' },
    { k: 'time', l: '플레이 시간순', rule: '플레이 시간·기간 기록이 있는 게임을 긴 순서로, 기록이 없는 게임은 그 뒤에 가나다순' },
    { k: 'clear', l: '클리어순', rule: '100% 완료 → 클리어 → 기록 없음. 묶음 안은 가나다순' },
    { k: 'name', l: '이름순', rule: '숫자 → 가나다 → ABC' },
  ],
  anime: [
    { k: 'new', l: '방영 최근순', rule: '방영 연도마다 묶음(최근 연도부터). 연도 안은 늦은 분기 → 극장판 → 웹 → 가나다 · 시청한 날짜는 기록에 없어서 방영 시기 기준' },
    { k: 'old', l: '방영 오래된순', rule: '방영 연도마다 묶음(오래된 연도부터). 연도 안은 1분기 → 4분기 → 극장판 → 웹 → 가나다' },
    { k: 'name', l: '이름순', rule: '숫자 → 가나다 → ABC' },
  ],
};
export function sections(ch, list, sort) {
  const L = [...list];
  if (ch === 'game') {
    if (sort === 'time') { const has = L.filter(g => hrs(g) || yrs(g)).sort(rec), no = L.filter(g => !hrs(g) && !yrs(g)).sort(byName); return [['플레이 기록 있음', has], ['시간 기록 없음', no]].filter(x => x[1].length); }
    if (sort === 'clear') return [['100% 완료', L.filter(g => g.pc)], ['클리어', L.filter(g => !g.pc && g.cl)], ['기록 없음', L.filter(g => !g.pc && !g.cl)]].map(([n, a]) => [n, a.sort(byName)]).filter(x => x[1].length);
    if (sort === 'name') return [['이름순', L.sort(byName)]];
    return [['pc', 'PC'], ['mo', '모바일'], ['co', '콘솔']].map(([k, n]) => [n, L.filter(g => g.p === k).sort(rec)]).filter(x => x[1].length);
  }
  if (sort === 'name') return [['이름순', L.sort(byName)]];
  const old = sort === 'old', ys = [...new Set(L.map(a => a.y))].sort((a, b) => (old ? a - b : b - a));
  return ys.map(y => [String(y), L.filter(a => a.y === y).sort((a, b) => (old ? qOld(a) - qOld(b) : qNew(b) - qNew(a)) || byName(a, b))]);
}

/* 화면 안 내용(입력마다 하나) */
function Screen({ ch, f, setF, roll, bodyRef }) {
  const C = CH[ch], game = ch === 'game';
  /* 수백 장을 한 번에 만들면 첫 장면이 0.3초 넘게 멈춤(재어 봄) → 처음엔 앞의 몇 장만, 창이 뜬 뒤 나머지 */
  const [lim, setLim] = useState(24);
  useEffect(() => { if (!roll) return; const id = setTimeout(() => setLim(1e4), 300); return () => clearTimeout(id); }, [roll]);
  const byPlat = useMemo(() => (game && f.plat !== 'all' ? C.items.filter(x => x.p === f.plat) : C.items), [ch, f.plat]); // eslint-disable-line
  const list = useMemo(() => (f.genre ? byPlat.filter(x => (game ? x.gr : x.g).includes(f.genre)) : byPlat), [byPlat, f.genre]); // eslint-disable-line
  const counts = useMemo(() => Object.fromEntries(C.groups.map(k => [k, byPlat.filter(x => (game ? x.gr : x.g).includes(k)).length])), [byPlat]); // eslint-disable-line
  const favs = useMemo(() => (game ? C.items.filter(x => x.fav).sort((a, b) => a.fav - b.fav) : C.items.filter(x => x.r).sort((a, b) => a.r - b.r)), [ch]); // eslint-disable-line
  const sort = f.sort || SORTS[ch][0].k, S = SORTS[ch].find(x => x.k === sort);
  const secs = useMemo(() => sections(ch, list, sort), [list, sort]); // eslint-disable-line
  const filtered = f.plat !== 'all' || f.genre;
  const pick = (k, v) => { sfx.blip(k === 'plat' ? 820 : k === 'sort' ? 700 : 960); setF({ ...f, [k]: v }); if (bodyRef.current) bodyRef.current.scrollTop = 0; };
  const it = (x, eager) => (game ? <GameCard key={x.id} g={x} eager={eager} /> : <AnimeCard key={x.id} a={x} eager={eager} />);
  /* 카드 수백 장을 Tab 으로 하나씩 지나가지 않게: 목록은 Tab 한 번, 안에서는 화살표로 움직임(roving focus).
     v5.2 버그 고침: 예전엔 목록 칸이 포커스를 받으면(스크롤바를 누를 때도!) 첫 카드로 포커스를 넘겨 → 맨 위로 튀었음.
     이제 포커스로는 아무것도 안 함. 칸에 포커스가 있을 때 화살표를 누르면 '지금 보이는' 첫 카드부터 */
  const nav = e => {
    const keys = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 'u', ArrowDown: 'd', Home: 'h', End: 'e' };
    if (!(e.key in keys)) return;
    const all = [...e.currentTarget.querySelectorAll('[data-k="it"]')], i = all.indexOf(document.activeElement);
    if (i < 0) {
      if (e.target !== e.currentTarget) return;
      const top = e.currentTarget.getBoundingClientRect().top;
      const first = all.find(el => el.getBoundingClientRect().bottom > top + 8);
      if (first) { e.preventDefault(); first.focus({ preventScroll: true }); first.scrollIntoView({ block: 'nearest' }); }
      return;
    }
    e.preventDefault();
    let j = i; const k = keys[e.key];
    if (typeof k === 'number') j = i + k;
    else if (k === 'h') j = 0; else if (k === 'e') j = all.length - 1;
    else {
      const r = all[i].getBoundingClientRect(), dir = k === 'd' ? 1 : -1;
      let best = -1, bd = 1e9;
      all.forEach((el, n) => { const q = el.getBoundingClientRect(); if (dir * (q.top - r.top) <= 4) return; const d = Math.abs(q.top - r.top) * 4 + Math.abs(q.left - r.left); if (d < bd) { bd = d; best = n; } });
      if (best >= 0) j = best;
    }
    j = Math.max(0, Math.min(all.length - 1, j));
    if (j !== i) { all[j].focus({ preventScroll: false }); sfx.blip(760); }
  };
  let left = lim;
  return (
    <div className={'mr-view ' + ch}>
      <header className="mr-head">
        <div className="mr-plate"><small>{game ? '게임 기록' : '애니 기록'}</small><b>{C.name}</b></div>
        <div className="mr-count" aria-live="polite">
          <Odo value={list.length} roll={roll} />
          <span className="mr-unit"><b>{C.unit}</b>{filtered ? <i>/ {C.items.length}</i> : <i>{game ? '플레이한 게임' : '본 작품'}</i>}</span>
          <span className="sr">{list.length}{game ? '개 게임' : '편'}</span>
        </div>
        {game && (
          <div className="mr-seg" role="radiogroup" aria-label="기종">
            {PLAT.map(([k, l]) => (
              <button key={k} type="button" role="radio" aria-checked={f.plat === k} className={f.plat === k ? 'on' : ''} onClick={() => pick('plat', k)}>
                <span>{l}<small>{k === 'all' ? C.items.length : C.items.filter(x => x.p === k).length}</small></span></button>))}
          </div>)}
        <div className="mr-seg mr-sort" role="radiogroup" aria-label="정렬">
          <em aria-hidden="true">정렬</em>
          {SORTS[ch].map(o => (
            <button key={o.k} type="button" role="radio" aria-checked={sort === o.k} className={sort === o.k ? 'on' : ''} onClick={() => pick('sort', o.k)}><span>{o.l}</span></button>))}
        </div>
        <div className="mr-chips" role="radiogroup" aria-label="장르">
          <button type="button" role="radio" aria-checked={!f.genre} className={!f.genre ? 'on' : ''} onClick={() => pick('genre', null)}><span>전체<small>{byPlat.length}</small></span></button>
          {C.groups.map(k => (
            <button key={k} type="button" role="radio" aria-checked={f.genre === k} className={(f.genre === k ? 'on' : '') + (counts[k] ? '' : ' none')} disabled={!counts[k]} onClick={() => pick('genre', f.genre === k ? null : k)}>
              <span>{k}<small>{counts[k]}</small></span></button>))}
        </div>
      </header>
      <div className="mr-body" ref={bodyRef} tabIndex={0} onKeyDown={nav} aria-label={(game ? '게임' : '애니메이션') + ' 목록. 화살표로 이동'}>
        <p className="mr-rule"><b>정렬 규칙</b>{!filtered && <> 최애 {favs.length} 먼저 →</>} {S.rule}</p>
        {!filtered && (
          <section className="mr-sec mr-strip">
            <div className="mr-sh"><h2 className="mr-tag"><b>최애</b><small>{favs.length}</small></h2><span className="mr-shn">{game ? 'Cho 가 고른 순서' : '최애 순위'}</span></div>
            <ol className={'mr-grid ' + ch + ' feat'}>{favs.map(x => it(x, true))}</ol>
          </section>)}
        {list.length ? secs.map(([name, arr]) => {
          const show = arr.slice(0, Math.max(0, left)); left -= arr.length;
          return (
            <section className="mr-sec" key={name} data-sec={name}>
              <div className="mr-sh"><h2 className="mr-tag w"><b>{name}</b><small>{arr.length}</small></h2></div>
              {show.length ? <ol className={'mr-grid ' + ch}>{show.map(x => it(x))}</ol> : null}
            </section>);
        }) : <p className="mr-empty">이 조건에 맞는 항목이 없음</p>}
        <p className="mr-src">예전 포트폴리오 사이트의 기록 그대로 · 표지는 썸네일로 줄임{game ? ' · 장르는 예전 사이트의 8갈래 묶음' : ''}</p>
      </div>
    </div>);
}

/* 모니터 아래 기기(작은 그림). 게임기에 카트리지, 비디오에 테이프 — 들어갈 때 하나가 꽂힘 */
const ConsoleIc = ({ on }) => (
  <svg viewBox="-4 -14 128 60" aria-hidden="true">
    <rect className="cart" x="34" y="-12" width="52" height="22" rx="3" fill="#3a3a3a" stroke="#111" strokeWidth="4" />
    <rect className="cart" x="42" y="-8" width="36" height="9" rx="2" fill="#FFD400" />
    <rect x="0" y="4" width="120" height="38" rx="9" fill="#ececec" stroke="#111" strokeWidth="5" />
    <rect x="30" y="2" width="60" height="8" rx="2" fill="#111" />
    <circle cx="16" cy="28" r="5" fill={on ? '#FFD400' : '#777'} stroke="#111" strokeWidth="3" />
    <rect x="70" y="22" width="18" height="9" rx="3" fill="#fff" stroke="#111" strokeWidth="3" /><rect x="94" y="22" width="18" height="9" rx="3" fill="#fff" stroke="#111" strokeWidth="3" />
  </svg>);
const VcrIc = ({ on }) => (
  <svg viewBox="-4 -4 148 46" aria-hidden="true">
    <rect x="0" y="0" width="140" height="38" rx="7" fill="#ececec" stroke="#111" strokeWidth="5" />
    <rect x="30" y="9" width="74" height="11" rx="2" fill="#111" />
    <rect className="tape" x="34" y="10" width="66" height="9" rx="1" fill="#2a2a2a" />
    <rect className="tape" x="52" y="12" width="28" height="4" fill="#FFD400" />
    <rect x="112" y="9" width="20" height="12" rx="2" fill="#111" /><rect x="116" y="13" width="5" height="4" fill={on ? '#FFD400' : '#444'} /><rect x="124" y="13" width="5" height="4" fill={on ? '#FFD400' : '#444'} />
    <rect x="30" y="26" width="74" height="4" rx="2" fill="#cfcfcf" />
  </svg>);
const Speaker = ({ off }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" />{off ? <path d="M17 9l5 6M22 9l-5 6" /> : <><path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a8.5 8.5 0 0 1 0 12" /></>}</svg>);

/* ===== v5.2 방 = 장면 이동. 홈에서 들어오면 복도 문턱에서 방 안으로 걸어 들어감(카메라가 앞으로: 판 여러 장의 깊이 차이 = 가짜 3D).
   도착하면 방이 보임(벽 · 창 · 선반 · 낮은 TV 장 · 그 위 CRT TV 와 게임기 · 앞쪽 화분 · 스탠드). 고르는 건 물건 두 개:
   게임기 → 게임 기록, TV → 애니 기록. 누르면 그 물건 자리에서 목록 창이 '확' 튀어나옴. 창 안에서 바꾸기 / 방으로(Esc).
   쉬는 동안 아무것도 안 움직임. 올리면(hover/focus) 물건이 노란 판 위로 들리고, TV 화면이 켜짐(게임기에 올리면 게임 화면, TV 에 올리면 방송).
   걸어 들어오기가 끝나면 3D 를 풀어 평면으로(글자 또렷). 움직임 줄이기 = 걸어 들어오기·시차·튀어나옴 없이 바로 */
const Z = { wall: -420, mid: -120, front: 150, door: 620 }, P = 1000;
const zs = z => `translateZ(${z}px) scale(${(P - z) / P})`;
const WALK = 1.25;
/* v5.3 낮/밤: 보는 사람의 시계로. 06:00–17:59 = 낮(해 · 밝은 벽 · 스탠드 꺼짐), 그 밖 = 밤(달 · 어두운 창 · 스탠드 불빛).
   QA 용 덮어쓰기: 주소 앞쪽 ?time=day|night (예: /?time=day#/media) — 화면 찍기용 */
export const timeOfDay = (d = new Date()) => {
  const o = new URLSearchParams(location.search).get('time');
  if (o === 'day' || o === 'night') return o;
  const h = d.getHours(); return h >= 6 && h < 18 ? 'day' : 'night';
};
const RoomWall = ({ day }) => (
  <div className="rw" aria-hidden="true">
    <i className="rw-floor" />
    {day ? (
      <svg className="rw-win" viewBox="0 0 300 380"><rect x="7" y="7" width="286" height="366" rx="6" fill="#fdfdfd" stroke="#111" strokeWidth="14" />
        <circle cx="205" cy="92" r="40" fill="#FFD400" stroke="#111" strokeWidth="6" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <rect key={i} x="201" y="30" width="8" height="14" fill="#111" transform={`rotate(${i * 45} 205 92) translate(0 -14)`} />)}
        <path d="M40 150a22 22 0 0 1 40-8a18 18 0 0 1 30 14H40z" fill="#fff" stroke="#111" strokeWidth="5" />
        <path d="M7 373V300h40v-40h50v60h40v-90h60v70h40v-30h56v103z" fill="#d9d9d9" stroke="#111" strokeWidth="5" />
        {[[52, 280], [100, 300], [150, 250], [170, 290], [214, 320], [262, 330]].map(([x, y], i) => <rect key={i} x={x} y={y} width="8" height="10" fill="#9a9a9a" />)}
        <rect x="146" y="7" width="8" height="366" fill="#111" /><rect x="7" y="186" width="286" height="8" fill="#111" /></svg>
    ) : (
      <svg className="rw-win" viewBox="0 0 300 380"><rect x="7" y="7" width="286" height="366" rx="6" fill="#151515" stroke="#111" strokeWidth="14" />
      <circle cx="205" cy="92" r="36" fill="#FFD400" /><circle cx="221" cy="80" r="32" fill="#151515" />
      {[[40, 60], [90, 150], [150, 40], [60, 220], [250, 200], [120, 110]].map(([x, y], i) => <rect key={i} x={x} y={y} width="5" height="5" fill="#fff" />)}
      <path d="M7 373V300h40v-40h50v60h40v-90h60v70h40v-30h56v103z" fill="#2c2c2c" />
      {[[52, 280], [100, 300], [150, 250], [170, 290], [214, 320], [262, 330]].map(([x, y], i) => <rect key={i} x={x} y={y} width="8" height="10" fill={i % 3 ? '#555' : '#FFD400'} />)}
      <rect x="146" y="7" width="8" height="366" fill="#111" /><rect x="7" y="186" width="286" height="8" fill="#111" /></svg>
    )}
    <svg className="rw-poster" viewBox="0 0 200 260"><rect x="5" y="5" width="190" height="250" fill="#fff" stroke="#111" strokeWidth="10" />
      <rect x="22" y="22" width="156" height="150" fill="#111" /><path d="M100 50l18 38 42 4-31 28 9 41-38-21-38 21 9-41-31-28 42-4z" fill="#FFD400" />
      <rect x="22" y="188" width="110" height="16" fill="#111" /><rect x="22" y="214" width="76" height="10" fill="#bdbdbd" /></svg>
    <svg className="rw-shelf" viewBox="0 0 320 210"><rect y="150" width="320" height="14" fill="#111" /><rect x="20" y="164" width="10" height="40" fill="#111" /><rect x="290" y="164" width="10" height="40" fill="#111" />
      {[[10, 34, 140, '#111'], [46, 26, 120, '#fff'], [74, 30, 132, '#bdbdbd'], [106, 22, 110, '#FFD400'], [130, 34, 146, '#2a2a2a'], [168, 26, 124, '#fff']].map(([x, w, h, f], i) =>
        <rect key={i} x={x} y={150 - h} width={w} height={h} fill={f} stroke="#111" strokeWidth="4" />)}
      <g transform="translate(212 100) rotate(-8)"><rect width="88" height="52" rx="5" fill="#2a2a2a" stroke="#111" strokeWidth="4" /><rect x="12" y="10" width="64" height="16" fill="#FFD400" /><circle cx="28" cy="38" r="6" fill="#e8e8e8" /><circle cx="60" cy="38" r="6" fill="#e8e8e8" /></g></svg>
    <svg className="rw-clock" viewBox="-50 -50 100 100"><circle r="44" fill="#fff" stroke="#111" strokeWidth="9" /><path d="M0 0V-26M0 0L18 10" stroke="#111" strokeWidth="7" strokeLinecap="round" /></svg>
    {!day && <i className="rw-glow" />}
  </div>);
const Plant = () => (<svg className="rf-plant" viewBox="0 0 160 260" aria-hidden="true"><path d="M80 170C60 120 20 110 6 70c40 6 64 40 74 100zM80 170c4-60 30-110 70-130-6 50-36 90-70 130zM80 170c-10-50 0-110 22-150 14 50 6 100-22 150z" fill="#2b2b2b" stroke="#111" strokeWidth="5" />
  <path d="M40 170h80l-10 86H50z" fill="#fff" stroke="#111" strokeWidth="6" /><rect x="36" y="162" width="88" height="16" rx="3" fill="#FFD400" stroke="#111" strokeWidth="5" /></svg>);
const FloorLamp = ({ day }) => (<svg className="rf-lamp" viewBox="0 0 200 480" aria-hidden="true">{!day && <path d="M120 70l70 400H20z" fill="#FFD400" opacity=".16" />}
  <path d="M100 470V60" stroke="#111" strokeWidth="10" /><path d="M60 20h80l22 58H38z" fill="#111" /><ellipse cx="100" cy="472" rx="56" ry="9" fill="#111" /></svg>);
const Pad = () => (<svg className="rf-pad" viewBox="0 0 150 80" aria-hidden="true"><path d="M30 10h90c18 0 28 14 28 32 0 22-14 34-26 34-10 0-16-8-22-16H50c-6 8-12 16-22 16C16 76 2 64 2 42 2 24 12 10 30 10z" fill="#ececec" stroke="#111" strokeWidth="5" />
  <path d="M30 30v20M20 40h20" stroke="#111" strokeWidth="6" strokeLinecap="round" /><circle cx="112" cy="32" r="6" fill="#FFD400" stroke="#111" strokeWidth="3" /><circle cx="126" cy="46" r="6" fill="#fff" stroke="#111" strokeWidth="3" /></svg>);
/* 물건 그림: 게임기(카트리지 꽂힌 상자) · CRT TV(화면은 캔버스 — 올리면 켜짐) */
/* v5.4 게임기: 한눈에 '옛날 게임기'로 읽히는 꼴(누구 것도 베끼지 않은 내 그림, 글자 · 상표 없음)
   납작한 상자(위 회색 · 아래 검은 띠) + 위에 꽂힌 카트리지 + 전원/리셋 단추 둘 + 앞쪽 단자에서 줄로 이어진 직사각형 패드(십자키 · 단추 둘) */
/* v5.5 바닥에 붙임: 게임기 밑면 · 패드 밑면 · 줄이 모두 같은 선(y=146 = 장 윗면)에 닿고, 그 아래 얇은 접촉 그림자 */
const ConsoleArt = () => (
  <svg className="ro-svg" viewBox="0 0 280 152" aria-hidden="true">
    <rect x="4" y="145" width="178" height="7" rx="3.5" fill="#111" opacity=".28" /><rect x="194" y="145" width="84" height="7" rx="3.5" fill="#111" opacity=".28" />
    <g className="ro-cart"><rect x="46" y="22" width="92" height="52" rx="4" fill="#3a3a3a" stroke="#111" strokeWidth="6" /><rect x="58" y="30" width="68" height="24" rx="2" fill="#FFD400" />
      <rect x="58" y="58" width="68" height="4" fill="#555" /></g>
    <rect x="6" y="60" width="172" height="85" rx="7" fill="#e2e2e2" stroke="#111" strokeWidth="7" />
    <rect x="34" y="56" width="116" height="16" rx="3" fill="#111" />
    <rect x="9.5" y="111" width="165" height="30.5" rx="3" fill="#2b2b2b" />
    <rect x="20" y="82" width="24" height="11" rx="3" fill="#fff" stroke="#111" strokeWidth="4" /><rect x="52" y="82" width="24" height="11" rx="3" fill="#fff" stroke="#111" strokeWidth="4" />
    <circle className="ro-led" cx="160" cy="88" r="6" stroke="#111" strokeWidth="4" />
    <rect x="128" y="119" width="16" height="12" rx="2" fill="#777" stroke="#111" strokeWidth="3" /><rect x="150" y="119" width="16" height="12" rx="2" fill="#777" stroke="#111" strokeWidth="3" />
    <path className="ro-cord" d="M158 131c4 9 10 12 18 12h24" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
    <g className="ro-padc"><rect x="196" y="116" width="80" height="29" rx="6" fill="#e2e2e2" stroke="#111" strokeWidth="5" /><rect x="200" y="124" width="72" height="13" rx="2" fill="#2b2b2b" />
      <path d="M212 130.5h14M219 124.5v12" stroke="#e2e2e2" strokeWidth="4.5" /><circle cx="248" cy="130.5" r="4.2" fill="#FFD400" /><circle cx="262" cy="130.5" r="4.2" fill="#FFD400" /></g>
  </svg>);

/* v5.3 비디오테이프(VHS) 두 개: 세워 둔 케이스 + 그 앞에 눕힌 테이프. TV 와 같은 '애니 기록' 입구 */
const TapeArt = () => (
  <svg className="ro-svg" viewBox="0 0 120 150" aria-hidden="true">
    <g className="ro-tp1"><rect x="14" y="4" width="54" height="104" rx="5" fill="#111" stroke="#111" strokeWidth="5" /><rect x="22" y="14" width="38" height="58" rx="2" fill="#fff" />
      <rect x="22" y="44" width="38" height="10" fill="#FFD400" /><text x="41" y="34" textAnchor="middle" fontFamily="RetroPx, monospace" fontSize="14" fill="#111">VHS</text>
      <rect x="22" y="84" width="38" height="5" fill="#555" /></g>
    <g><rect x="4" y="106" width="112" height="40" rx="5" fill="#2a2a2a" stroke="#111" strokeWidth="5" /><rect x="22" y="114" width="76" height="14" rx="2" fill="#ececec" />
      <rect x="40" y="117" width="40" height="8" fill="#FFD400" /><circle cx="30" cy="137" r="4" fill="#ececec" /><circle cx="90" cy="137" r="4" fill="#ececec" /></g>
  </svg>);

export default function MediaRoom({ ch0, hint, onCh, onHome, reduce, pan, worldRef }) {
  const [scope, animate] = useAnimate();
  const [isPresent, safeToRemove] = usePresence();
  const [phase, setPhase] = useState(reduce ? 'room' : 'walk');
  const [tod] = useState(timeOfDay), day = tod === 'day';
  const [ch, setCh] = useState(null); // 열린 창(null = 방)
  const [fs, setFs] = useState({ game: { plat: 'all', genre: null }, anime: { plat: 'all', genre: null } });
  const [roll, setRoll] = useState(false), [mute, setMute] = useState(sfxMuted());
  const cv = useRef(null), tv = useRef(null), tvo = useRef(null), tvc = useRef(null), seq = useRef(null), timers = useRef([]), busy = useRef(false), body = useRef(null);
  const chR = useRef(null); chR.current = ch;
  const ch0R = useRef(ch0); ch0R.current = ch0;
  const swallow = useRef(false); // 걷는 중 누른 것(건너뛰기)이 바로 아래 물건까지 눌러 버리지 않게
  const ret = useRef(null); // 창을 닫으면 그 물건으로 포커스(방의 inert 가 풀린 뒤 = 렌더가 끝난 뒤)
  useEffect(() => { if (!ch && ret.current) { q(`.ro[data-ch="${ret.current}"]:not(.tape)`)?.focus({ preventScroll: true }); ret.current = null; } }, [ch]); // eslint-disable-line
  const at = (ms, fn) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => onSfxMute(setMute), []);
  const q = sel => scope.current?.querySelector(sel);
  /* 시차: 방에 있을 때만(창이 떠 있으면 멈춤). 판마다 다른 거리 */
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 22 }), sy = useSpring(my, { stiffness: 120, damping: 22 });
  const wx = useTransform(sx, v => v * -14), wy = useTransform(sy, v => v * -7), mvx = useTransform(sx, v => v * -4), mvy = useTransform(sy, v => v * -2), fx = useTransform(sx, v => v * 14), fy = useTransform(sy, v => v * 6);
  const move = e => { if (reduce || phase !== 'room' || ch) return; mx.set((e.clientX / innerWidth) * 2 - 1); my.set((e.clientY / innerHeight) * 2 - 1); };

  /* 방 TV 화면: 쉬는 동안 꺼짐(검은 유리). 게임기에 올리면 게임 화면, TV 에 올리면 방송 — 내리면 다시 꺼짐 */
  useLayoutEffect(() => { tvo.current = createTV(tvc.current); tvo.current.set('off'); tvo.current.start({ freeze: true }); tv.current = createTV(cv.current); return () => { tvo.current?.stop(); tv.current?.stop(); }; }, []);
  const peek = k => { if (reduce || chR.current) return; if (!k) { tvo.current.set('off'); tvo.current.start({ freeze: true }); return; } tvo.current.set(k === 'game' ? 'game' : 'ch', k === 'game' ? { reset: true } : { ch: 2 }); tvo.current.start(); sfx.blip(k === 'game' ? 880 : 660); };

  /* v5.8 들어오기 = 고개 돌리기: 방은 처음부터 홈 '왼쪽'에 있던 공간. 카메라가 왼쪽으로 돌면(≈1.15초)
     홈 판은 오른쪽으로 밀려나며 비스듬히(오목한 모서리: 두 판이 만나는 세로선 = 방의 오른쪽 끝 = 홈의 왼쪽 끝),
     방 판은 왼쪽에서 들어와 똑바로 섬. 방 안 판들(벽 · 가구 · 앞 화분)은 깊이가 달라 서로 다른 속도로 지나감(시차),
     홈도 글자 층(.home)이 무대보다 조금 더 빨리 빠짐. 끝나면 3D 를 모두 풀어 평면(글자 또렷).
     주소로 바로 들어온 경우(홈을 거치지 않음) = 짧은 판(왼쪽에서 살짝 돌아 들어오며 나타남, 0.6초) */
  const W = () => innerWidth, PSP = () => Math.round(innerWidth * 1.3), YAW = 30;
  const PE = [0.62, 0.02, 0.22, 1]; // 처음엔 천천히 → 가운데서 빠르게 → 끝에서 부드럽게 멈춤
  const homeEls = () => { const w = worldRef?.current; return w ? [w, w.querySelector('.home')] : [null, null]; };
  const clearHome = () => { const [w, h] = homeEls(); if (w) { w.style.transform = ''; w.style.transformOrigin = ''; } if (h) h.style.transform = ''; };
  useLayoutEffect(() => {
    const root = scope.current;
    if (reduce) { animate(root, { opacity: [0, 1] }, { duration: 0.18 }); arrive(); return; }
    const w = W(), [wd, hm] = homeEls(), D = pan ? 1.15 : 0.6;
    root.style.transformOrigin = '100% 50%';
    const steps = pan ? [
      [root, { x: [-w, 0], rotateY: [YAW, 0], transformPerspective: PSP() }, { duration: D, ease: PE, at: 0 }],
      ['.rm-cam', { x: [-0.16 * w, 0] }, { duration: D, ease: PE, at: 0 }],
      ['.rm-shade', { opacity: [0.42, 0] }, { duration: D, ease: PE, at: 0 }],
      ...(wd ? [[wd, { x: [0, w], rotateY: [0, -YAW], transformPerspective: PSP() }, { duration: D, ease: PE, at: 0 }]] : []),
      ...(hm ? [[hm, { x: [0, 0.07 * w] }, { duration: D, ease: PE, at: 0 }]] : []),
      ['.rm-ui', { opacity: [0, 1] }, { duration: 0.2, at: D - 0.05 }],
    ] : [
      [root, { x: [-0.22 * w, 0], rotateY: [10, 0], opacity: [0, 1], transformPerspective: PSP() }, { duration: D, ease: [0.2, 0.8, 0.25, 1], at: 0 }],
      ['.rm-cam', { x: [-0.06 * w, 0] }, { duration: D, ease: [0.2, 0.8, 0.25, 1], at: 0 }],
      ['.rm-ui', { opacity: [0, 1] }, { duration: 0.2, at: D - 0.1 }],
    ];
    if (wd && pan) wd.style.transformOrigin = '0% 50%';
    document.documentElement.classList.add('panning');
    let r1 = 0, r2 = 0;
    r1 = requestAnimationFrame(() => (r2 = requestAnimationFrame(() => {
      seq.current = animate(steps);
      seq.current.then?.(arrive);
      if (pan) { at(0, sfx.slash); at(D * 1000 - 80, sfx.thump); }
    })));
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); timers.current.forEach(clearTimeout); };
  }, []); // eslint-disable-line
  const arrived = useRef(false);
  function arrive() {
    if (arrived.current) return; arrived.current = true;
    // 평면으로(글자 또렷): 움직임이 마지막 값을 쓴 다음 프레임에 3D 를 모두 지움(바로 지우면 마지막 값이 다시 덮어씀)
    const flat = () => { const c = q('.rm-cam'); if (c) c.style.transform = 'none';
      const root = scope.current; if (root) { root.style.transform = 'none'; root.style.transformOrigin = ''; }
      clearHome(); document.documentElement.classList.remove('panning'); };
    flat(); requestAnimationFrame(() => { flat(); requestAnimationFrame(flat); });
    setPhase('room');
    /* v5.4 도착 때 한 번만: 누를 수 있는 물건 둘레에 노란 테두리가 바깥에서 조여 들어왔다 빠짐(TV · 테이프 → 게임기 차례). 그 뒤엔 가만히 있는 모서리 표시만 */
    if (!reduce && !ch0R.current) requestAnimationFrame(() => animate([
      ['.ro.anime .ro-mk', { scale: [1.35, 1], opacity: [0, 1] }, { duration: 0.42, ease: [0.2, 0.9, 0.3, 1], at: 0.05 }],
      ['.ro.anime .ro-fl', { opacity: [0, 0.9, 0] }, { duration: 0.6, ease: 'easeOut', at: 0.05 }],
      ['.ro.game .ro-mk', { scale: [1.35, 1], opacity: [0, 1] }, { duration: 0.42, ease: [0.2, 0.9, 0.3, 1], at: 0.3 }],
      ['.ro.game .ro-fl', { opacity: [0, 0.9, 0] }, { duration: 0.6, ease: 'easeOut', at: 0.3 }],
    ]));
    requestAnimationFrame(() => {
      if (ch0R.current) openWin(ch0R.current, true);
      else q(`.ro[data-ch="${hint === 'anime' ? 'anime' : 'game'}"]:not(.tape)`)?.focus({ preventScroll: true });
    });
  }
  /* 주소가 밖에서 바뀌면(뒤로/앞으로, 옛 주소 #/anime 등) 창도 따라감 */
  useEffect(() => {
    if (phase !== 'room') return;
    if (ch0 && ch0 !== chR.current) { chR.current ? switchTo(ch0) : openWin(ch0); }
    else if (!ch0 && chR.current) closeWin();
  }, [ch0]); // eslint-disable-line
  /* v5.8 돌아가는 동안엔 방이 화면 일부만 덮으므로 어디를 눌러도(홈 쪽 포함) 건너뛰기 */
  useEffect(() => {
    if (phase !== 'walk' || !isPresent) return;
    const d = e => { if (scope.current?.contains(e.target)) return; swallow.current = true; skip(); };
    document.addEventListener('pointerdown', d, true); return () => document.removeEventListener('pointerdown', d, true);
  }); // eslint-disable-line
  const skip = () => { if (phase !== 'walk') return; seq.current?.complete(); timers.current.forEach(clearTimeout); timers.current = []; arrive(); };

  /* 창 띄우기: 고른 물건 자리에서 작게 → 확 커지며 튀어나옴(살짝 넘쳤다 멈춤) + 화면이 가로선으로 켜지고 지지직 → 목록 */
  const from = k => { const o = q(`.ro[data-ch="${k}"]:not(.tape)`)?.getBoundingClientRect(); return o ? { x: o.left + o.width / 2 - innerWidth / 2, y: o.top + o.height / 2 - innerHeight / 2 } : { x: 0, y: 0 }; };
  function openWin(k, auto) {
    if (busy.current || chR.current) return;
    onCh?.(k); peek(null);
    if (reduce) { setCh(k); setRoll(true); requestAnimationFrame(() => body.current?.focus({ preventScroll: true })); return; }
    busy.current = true; setRoll(false); setCh(k); mx.set(0); my.set(0);
    k === 'game' ? sfx.clack() : sfx.on();
    requestAnimationFrame(() => {
      const o = from(k);
      tv.current.set('snow'); tv.current.start();
      const tl = animate([
        [`.ro[data-ch="${k}"]:not(.tape)`, { scale: [1, 1.06, 1] }, { duration: 0.2, ease: EO, at: 0 }],
        ['.rm-dim', { opacity: [0, 1] }, { duration: 0.2, ease: 'linear', at: 0.04 }],
        ['.mw', { x: [o.x, 0], y: [o.y, 0], scale: [0.14, 1.025, 1], opacity: [0, 1, 1] }, { duration: 0.34, times: [0, 0.72, 1], ease: EO, at: 0.06 }],
        ['.mw .mr-pic', { scaleY: [0.008, 0.008, 1], scaleX: [0, 1, 1] }, { duration: 0.16, times: [0, 0.45, 1], ease: EO, at: 0.3 }],
        ['.mw .mr-flash', { opacity: [0, 0.5, 0.5, 0] }, { duration: 0.15, times: [0, 0.05, 0.4, 1], ease: 'linear', at: 0.3 }],
        ['.mw .mr-snow', { opacity: [1, 1, 0] }, { duration: 0.22, times: [0, 0.5, 1], ease: 'linear', at: 0.3 }],
        ['.mw .mr-plate', { x: [-60, 5, 0], rotate: [-8, 1, 0], scale: [1.25, 0.97, 1], opacity: [0, 1, 1] }, { duration: 0.22, times: [0, 0.7, 1], ease: EO, at: 0.42 }],
        ['.mw .mr-count', { x: [44, -3, 0], skewX: [-14, 2, 0], opacity: [0, 1, 1] }, { duration: 0.2, times: [0, 0.7, 1], ease: EO, at: 0.46 }],
      ]);
      at(300, () => { sfx.hiss(0.18); }); at(440, sfx.punch);
      tl.then(() => { tv.current?.stop(); busy.current = false; setRoll(true); body.current?.focus({ preventScroll: true }); });
    });
  }
  function closeWin() {
    const k = chR.current; if (!k || busy.current) return;
    onCh?.(null);
    const done = () => { ret.current = k; setCh(null); setRoll(false); busy.current = false; };
    if (reduce) { done(); return; }
    busy.current = true; sfx.off();
    const o = from(k);
    animate([
      ['.mw .mr-pic', { scaleY: [1, 0.008, 0.008], scaleX: [1, 1, 0] }, { duration: 0.14, times: [0, 0.55, 1], ease: EI, at: 0 }],
      ['.mw', { x: [0, o.x], y: [0, o.y], scale: [1, 0.14], opacity: [1, 0] }, { duration: 0.2, ease: EI, at: 0.1 }],
      ['.rm-dim', { opacity: [1, 0] }, { duration: 0.18, ease: 'linear', at: 0.1 }],
    ]).then(done);
  }
  /* 창 안에서 바꾸기: 지지직 한 번 + 노란 사선이 화면을 가름 → 그 밑에서 내용이 바뀜 (≈0.35초) */
  const switchTo = n => {
    if (n === ch || busy.current || !ch) return;
    onCh?.(n);
    if (reduce) { setCh(n); return; }
    busy.current = true; sfx.chan();
    tv.current.set('snow'); tv.current.start();
    q('.mw .mr-snow').style.opacity = 1;
    animate('.mw .mr-wipe', { x: ['-110%', '300%'] }, { duration: 0.3, ease: EO });
    setTimeout(() => {
      setCh(n); body.current && (body.current.scrollTop = 0);
      animate('.mw .mr-snow', { opacity: [1, 0] }, { duration: 0.1, ease: 'linear' }).then(() => { tv.current?.stop(); busy.current = false; });
      requestAnimationFrame(() => {
        animate('.mw .mr-plate', { x: [-50, 5, 0], rotate: [-8, 1, 0], scale: [1.22, 0.98, 1] }, { duration: 0.22, times: [0, 0.7, 1], ease: EO });
        animate('.mw .mr-count', { x: [36, -2, 0], skewX: [-14, 2, 0] }, { duration: 0.2, times: [0, 0.7, 1], ease: EO });
        sfx.punch();
      });
    }, 110);
  };
  /* 키: 걷는 중 Enter/Space = 건너뛰기. 1/2 = (방) 그 물건 열기 · (창) 바꾸기. Esc = 창이 떠 있으면 방으로(홈으로 가는 App 의 Esc 보다 먼저 받음) */
  useEffect(() => {
    const key = e => {
      if (e.key === 'Escape' && chR.current) { e.preventDefault(); e.stopImmediatePropagation(); closeWin(); return; }
      if (phase === 'walk' && (e.key === 'Enter' || e.code === 'Space')) { e.preventDefault(); skip(); return; }
      if (e.target.closest?.('input,textarea')) return;
      const n = e.key === '1' ? 'game' : e.key === '2' ? 'anime' : null;
      if (!n || phase !== 'room') return;
      if (chR.current) switchTo(n); else openWin(n);
    };
    document.addEventListener('keydown', key, true); return () => document.removeEventListener('keydown', key, true);
  });

  /* 나가기(홈으로): 창이 떠 있으면 접히고 → 카메라가 뒤로 물러나며 방이 어두워짐 (≈0.4초) */
  useEffect(() => {
    if (isPresent) return;
    timers.current.forEach(clearTimeout);
    const root = scope.current; if (!root) { safeToRemove(); return; }
    if (reduce) { animate(root, { opacity: 0 }, { duration: 0.16 }).then(safeToRemove); return; }
    seq.current?.complete(); sfx.off();
    /* v5.8 나가기 = 반대로 고개 돌리기(≈1.0초): 방은 왼쪽으로 빠지며 비스듬히, 홈은 오른쪽에서 돌아와 똑바로 섬 */
    (async () => {
      if (chR.current) await animate('.mw', { scale: [1, 0.9], opacity: [1, 0] }, { duration: 0.16, ease: EI });
      root.classList.add('leaving'); setPhase('walk');
      const w = W(), [wd, hm] = homeEls(), D = 1.0;
      root.style.transformOrigin = '100% 50%'; if (wd) wd.style.transformOrigin = '0% 50%';
      document.documentElement.classList.add('panning');
      const cam = q('.rm-cam'); if (cam) cam.style.transform = '';
      await animate([
        [root, { x: [0, -w], rotateY: [0, YAW], transformPerspective: PSP() }, { duration: D, ease: PE, at: 0 }],
        ['.rm-cam', { x: [0, -0.16 * w] }, { duration: D, ease: PE, at: 0 }],
        ['.rm-shade', { opacity: [0, 0.42] }, { duration: D, ease: PE, at: 0 }],
        ['.rm-ui', { opacity: [1, 0] }, { duration: 0.12, at: 0 }],
        ...(wd ? [[wd, { x: [w, 0], rotateY: [-YAW, 0], transformPerspective: PSP() }, { duration: D, ease: PE, at: 0 }]] : []),
        ...(hm ? [[hm, { x: [0.07 * w, 0] }, { duration: D, ease: PE, at: 0 }]] : []),
      ]);
      clearHome(); document.documentElement.classList.remove('panning');
      safeToRemove();
    })();
  }, [isPresent]); // eslint-disable-line

  const C = ch ? CH[ch] : null, other = ch === 'game' ? 'anime' : 'game';
  /* 물건: 평소엔 그림만(글·번호 없음). 올리거나(포커스) 하면 노란 판 + 들림 + TV 화면 켜짐 + 작은 이름표(게임 기록 / 애니 기록). 1/2 키는 그대로(말없이) */
  const obj = (k, kind) => {
    const g = k === 'game';
    return (
      <button type="button" className={'ro ' + k + ' ' + kind} data-ch={k} data-kind={kind} onClick={() => openWin(k)} onPointerEnter={() => peek(k)} onPointerLeave={() => peek(null)} onFocus={e => e.currentTarget.matches(':focus-visible') && peek(k)} onBlur={() => peek(null)}
        aria-label={g ? `게임기 — 게임 기록 ${CH.game.items.length}개 보기` : kind === 'tape' ? `비디오테이프 — 애니메이션 기록 ${CH.anime.items.length}편 보기` : `TV — 애니메이션 기록 ${CH.anime.items.length}편 보기`} tabIndex={kind === 'tape' ? -1 : 0}>
        <span className="ro-plate" aria-hidden="true" /><span className="ro-plate ro-fl" aria-hidden="true" />
        <span className="ro-mk" aria-hidden="true"><i /><i /><i /><i /></span>
        {g ? <ConsoleArt /> : kind === 'tape' ? <TapeArt /> : (
          <span className="ro-tv" aria-hidden="true"><span className="ro-scr"><canvas ref={tvc} /><i /></span><span className="ro-tvb"><i /><i /></span></span>)}
        {kind !== 'tape' && <span className="ro-tip" aria-hidden="true">{g ? '게임 기록' : '애니 기록'}</span>}
      </button>);
  };
  return (
    <div ref={scope} className={'mr room2 ' + tod + ' ' + phase + (reduce ? ' reduce' : '') + (ch ? ' win ' + ch : '')} role="region" aria-label="게임 · 애니메이션 기록 방" onPointerDown={phase === 'walk' ? () => { swallow.current = true; skip(); } : undefined} onClickCapture={e => { if (swallow.current) { swallow.current = false; e.stopPropagation(); e.preventDefault(); } }} onPointerMove={move}>
      <div className="rm-cam" inert={ch ? '' : undefined}>
        <div className="rm-layer" style={{ transform: zs(Z.wall) }}><motion.div className="rm-pl" style={{ x: wx, y: wy }}><RoomWall day={day} /></motion.div></div>
        <div className="rm-layer" style={{ transform: zs(Z.mid) }}>
          <motion.div className="rm-pl rm-stage" style={{ x: mvx, y: mvy }}>
            <i className="rc" aria-hidden="true"><i /><i /></i>
            {obj('anime', 'tape')}{obj('anime', 'tv')}{obj('game', 'console')}
          </motion.div>
        </div>
        <div className="rm-layer" style={{ transform: zs(Z.front) }}><motion.div className="rm-pl rm-stage" style={{ x: fx, y: fy }}><Plant /><FloorLamp day={day} /></motion.div></div>
      </div>
      <i className="rm-shade" aria-hidden="true" />
      <div className="rm-ui">
        <button type="button" className="mr-btn mr-homebtn" onClick={onHome}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9v11h13V9" /></svg>홈<kbd>Esc</kbd></button>
        <button type="button" className={'mr-btn mute' + (mute ? ' off' : '')} aria-pressed={!mute} aria-label={mute ? '효과음 꺼짐' : '효과음 켜짐'} onClick={() => { setSfxMuted(!mute); if (mute) setTimeout(() => sfx.ok(), 30); }}><Speaker off={mute} /></button>
      </div>
      <i className="rm-dim" aria-hidden="true" onClick={closeWin} />
      <div className="mw mr-mon" role="dialog" aria-modal="true" aria-label={C ? (ch === 'game' ? '게임 기록' : '애니메이션 기록') : undefined} hidden={!ch}>
        <div className="mw-bar">
          <span className="mw-t">{ch === 'game' ? <ConsoleIc on /> : <VcrIc on />}<b>{ch === 'game' ? '게임 기록' : '애니 기록'}</b></span>
          <span className="sp" />
          <button type="button" className="mr-btn mw-x" onClick={closeWin}>← 방으로<kbd>Esc</kbd></button>
        </div>
        <div className="mr-scr">
          <div className="mr-pic">
            {ch && <Screen key={ch} ch={ch} f={fs[ch]} setF={v => setFs(s => ({ ...s, [ch]: v }))} roll={roll} bodyRef={body} />}
            <canvas ref={cv} className="mr-snow" aria-hidden="true" />
          </div>
          <i className="mr-wipe" aria-hidden="true" />
          <i className="mr-flash" aria-hidden="true" />
          <i className="mr-glass" aria-hidden="true" />
        </div>
      </div>
      <span className="sr" aria-live="polite">{phase === 'room' ? (ch ? (ch === 'game' ? '게임 기록 창' : '애니 기록 창') : '방. 게임기 또는 TV 를 고르세요') : ''}</span>
    </div>);
}
