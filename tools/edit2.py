import json
p='index.html'; s=open(p).read()
t=json.load(open('/tmp/beats_inline.json'))['t']
def rep(a,b):
    global s
    assert a in s, a[:70]
    s=s.replace(a,b,1)
rep("""/* ===== 박자 조정값 (song.mp3 = 2번.mp3 분석 결과) ===== */
const BPM = 139.7;          // librosa 박자 추적, 박 간격 중앙값 약 0.430초
const FIRST_BEAT = 0.052;   // 첫 박 위치(초). 어긋나 보이면 이 값만 고친다
/* ===================================================== */""",
"""/* ===== 박자 데이터 (song.mp3 = 2번.mp3, song2_analysis.json의 beats) =====
   약 139.5 BPM, 4/4, 첫 다운비트 0.19초. 템포가 138.6→139.7로 미세하게 빨라져서 고정 BPM 대신 박 시각 배열을 그대로 쓴다.
   BEATS[i]는 i번째 박의 시각(초), i % 4 === 0 이 마디 첫 박. */
const BEATS = __BEATS__;
const BEAT_OFFSET = 0.012;  // 실제 어택은 박 기준 +10~15ms. 눈으로 보고 어긋나면 이 값만 고친다(초)
/* ===================================================================== */""".replace('__BEATS__',json.dumps(t,separators=(',',':'))))
rep("""  const SPB = 60 / BPM;
  let lastBeat = -1;""","""  const SPB = (BEATS[BEATS.length - 1] - BEATS[0]) / (BEATS.length - 1);
  // 현재 시각 → 실수 박 번호 (i + 박 안에서의 진행도). 이분 탐색
  function beatAt(t) {
    t -= BEAT_OFFSET;
    if (t < BEATS[0]) return (t - BEATS[0]) / SPB;
    let lo = 0, hi = BEATS.length - 1;
    if (t >= BEATS[hi]) return hi + (t - BEATS[hi]) / SPB;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (BEATS[m] <= t) lo = m; else hi = m; }
    return lo + (t - BEATS[lo]) / (BEATS[lo + 1] - BEATS[lo]);
  }
  let lastBeat = -1;""")
rep("beat = (song.currentTime - FIRST_BEAT) / SPB;","beat = beatAt(song.currentTime);")
rep("""const idx = ((b % 4) + 4) % 4; beatsEl.forEach((el, i) => el.classList.toggle('on', i === idx && !song.paused));""",
"""const idx = ((b % 4) + 4) % 4; beatsEl.forEach((el, i) => el.classList.toggle('on', i === idx && !song.paused && b >= 0));""")
rep("if (M && !reduce && !song.paused) animate(beatsEl[idx]","if (M && !reduce && !song.paused && b >= 0) animate(beatsEl[idx]")
rep("""    animate(outEls(), { x: -140 * s, opacity: 0 }, { duration: .2, delay: stagger(.022), ease: easeIn });
    animate(plane, mob ? { y: '-110%' } : { x: '-110%' }, { duration: .42, delay: .12, ease: [.6, 0, .4, 1] });""",
"""    animate(playBtn, { scale: [1, .9, 1.04] }, { duration: .14, ease: easeOut });
    animate(outEls(), { x: -120 * s, opacity: 0 }, { duration: .16, delay: stagger(.014, { startDelay: .04 }), ease: easeIn });
    animate(plane, mob ? { y: '-110%' } : { x: '-110%' }, { duration: .42, delay: .14, ease: [.6, 0, .4, 1] });""")
rep("animate(outEls(), { x: 0, opacity: 1 }, { duration: .26,","animate(playBtn, { scale: 1 }, { duration: 0 });\n    animate(outEls(), { x: 0, opacity: 1 }, { duration: .26,")
rep("return mobileQ.matches ? { x: (195 - 286) * s, y: -(innerHeight - 70 * s - innerHeight * .62) } : { x: -760 * U(), y: 0 };",
    "return mobileQ.matches ? { x: (195 - 286) * s, y: 0 } : { x: -760 * U(), y: 0 };")
rep("const pad = Math.round(ih * .32);","const pad = Math.round(ih * .36);")
rep("const R = 72, SWEEP","const R = 64, SWEEP")
rep("window.__app = { toPlay, toHome, pick, setVol };","window.__app = { toPlay, toHome, pick, setVol, entrance };")
rep("""    --bx:28; --role-y:44; --role-f:14; --name-y:66; --name-f:58;
    --menu-y:160; --item-h:56; --item-gap:8; --item-f:40;
    --row-y:368; --tile-w:110; --tile-h:92; --tile-gap:10; --play-x:258; --play-w:110;
    --contact-y:484; --contact-f:13}""","""    --bx:44; --role-y:44; --role-f:14; --name-y:68; --name-f:58;
    --menu-y:168; --item-h:54; --item-gap:8; --item-f:38;
    --row-y:362; --tile-w:146; --tile-h:84; --tile-gap:12; --play-x:44; --play-w:304;
    --contact-y:568; --contact-f:13}
  .play-wrap{top:calc(462*var(--s));height:calc(72*var(--s))}""")
rep("""  .play{border-radius:calc(26*var(--s));font-size:calc(30*var(--s));flex-direction:column;gap:calc(8*var(--s));padding-top:calc(6*var(--s))}
  .play::before{inset:calc(7*var(--s));border-width:calc(4*var(--s));border-radius:calc(19*var(--s))}
  .play i{border-left-width:calc(22*var(--s));border-top-width:calc(14*var(--s));border-bottom-width:calc(14*var(--s));margin:0 0 0 calc(6*var(--s))}
  .contact{flex-direction:column;gap:calc(8*var(--s))} .contact i{display:none}""","""  .play{border-radius:calc(24*var(--s));font-size:calc(34*var(--s));gap:calc(14*var(--s));--tilt:-2deg}
  .play::before{inset:calc(7*var(--s));border-width:calc(4*var(--s));border-radius:calc(17*var(--s))}
  .play i{border-left-width:calc(20*var(--s));border-top-width:calc(13*var(--s));border-bottom-width:calc(13*var(--s));margin-top:calc(-3*var(--s))}
  .band-face{--tilt:-2deg}
  .contact{gap:calc(12*var(--s))}
  .beats{top:calc(104*var(--h))}""")
rep(".panel,.panel-side,.panel-cast{left:0;top:0;width:100%;height:calc(560*var(--s));clip-path:polygon(0 0,100% 0,100% 88%,0 100%)}",
    ".panel,.panel-side,.panel-cast{left:0;top:0;width:100%;height:calc(640*var(--s));clip-path:polygon(0 0,100% 0,100% 87%,0 100%)}")
open(p,'w').write(s)
print('ok')
