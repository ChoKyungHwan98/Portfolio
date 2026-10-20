/* v4.3 레트로 방 효과음: 파일 없이 Web Audio 로 그때그때 합성(짧고 조용하게).
   원리 참고: ysrtv(아날로그 TV 효과음을 오실레이터 + 재사용 백색소음 1초로 합성) — 코드는 직접 씀.
   - 크기: 홈 플레이 음량 다이얼 값(vol, 0~100)을 그대로 따르고, 그 위에 낮은 기본 크기(BASE)를 곱함
   - 음소거: localStorage 'rh-sfx' = 'off' 면 끔. 움직임 줄이기 사용자는 처음엔 꺼진 상태로 시작
   - AudioContext 는 사용자 클릭 안에서만 깨어남(브라우저 정책). 주소로 바로 들어오면 첫 클릭 전까지 소리 없음 */
const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
const BASE = 0.22;
let ctx = null, master = null, noiseBuf = null, vol = 0.7;
const KEY = 'rh-sfx';
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
let muted = (() => { try { const v = localStorage.getItem(KEY); return v ? v === 'off' : reduced(); } catch { return reduced(); } })();
const subs = new Set();

function ensure() {
  if (!AC || muted) return null;
  if (!ctx) {
    try { ctx = new AC({ latencyHint: 'interactive' }); } catch { return null; }
    master = ctx.createGain(); master.gain.value = BASE * vol; master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx.state === 'running' || ctx.state === 'suspended' ? ctx : null;
}
const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
function tone({ f = 880, f2, type = 'square', d = 0.06, g = 0.2, at = 0 }) {
  const c = ensure(); if (!c) return;
  const t = c.currentTime + at, o = c.createOscillator(), e = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  env(e, t, 0.004, g, d); o.connect(e).connect(master); o.start(t); o.stop(t + d + 0.05);
}
function noise({ d = 0.25, g = 0.14, f = 2400, f2, q = 0.7, at = 0, type = 'bandpass' }) {
  const c = ensure(); if (!c) return;
  const t = c.currentTime + at, s = c.createBufferSource(), fl = c.createBiquadFilter(), e = c.createGain();
  s.buffer = noiseBuf; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); fl.Q.value = q;
  env(e, t, 0.01, g, d); s.connect(fl).connect(e).connect(master); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05);
}
export const sfx = {
  blip: (f = 880) => tone({ f, d: 0.05, g: 0.12 }),                        // 커서 이동
  jump: () => tone({ f: 520, f2: 1040, d: 0.09, g: 0.09 }),                 // TV 속 게임 '뿅'
  coin: () => { tone({ f: 988, d: 0.05, g: 0.08 }); tone({ f: 1319, d: 0.09, g: 0.08, at: 0.05 }); },
  ok: () => { tone({ f: 660, d: 0.05, g: 0.12 }); tone({ f: 990, d: 0.08, g: 0.12, at: 0.06 }); },
  thump: () => { tone({ f: 140, f2: 46, type: 'sine', d: 0.16, g: 0.5 }); noise({ d: 0.05, g: 0.08, f: 500 }); }, // TV 가 내려앉음
  clack: () => { noise({ d: 0.03, g: 0.22, f: 3200, q: 2 }); tone({ f: 220, f2: 90, type: 'triangle', d: 0.05, g: 0.2, at: 0.02 }); }, // 카트리지·테이프 끼움
  hiss: (d = 0.32) => noise({ d, g: 0.07, f: 5200, q: 0.4, type: 'highpass' }), // '치직' (쉬익은 길게 안 끔)
  chan: () => { noise({ d: 0.02, g: 0.2, f: 4000, q: 3 }); noise({ d: 0.18, g: 0.06, f: 5200, q: 0.4, type: 'highpass', at: 0.02 }); },
  on: () => { tone({ f: 70, f2: 50, type: 'sine', d: 0.12, g: 0.35 }); tone({ f: 300, f2: 1500, type: 'sine', d: 0.18, g: 0.05, at: 0.03 }); },
  off: () => tone({ f: 1200, f2: 60, type: 'sine', d: 0.22, g: 0.07 }),
  /* v4.4 사선 전환(슉): 대역 소음이 낮은 데서 높은 데로 훑음 · 판이 박힘(퍽): 낮은 사인 + 짧은 딸깍 */
  slash: () => noise({ d: 0.13, g: 0.12, f: 700, f2: 6000, q: 1.6 }),
  punch: () => { tone({ f: 180, f2: 60, type: 'sine', d: 0.09, g: 0.32 }); noise({ d: 0.025, g: 0.12, f: 2600, q: 2 }); },
};
export const sfxMuted = () => muted;
export function setSfxMuted(m) {
  muted = m; try { localStorage.setItem(KEY, m ? 'off' : 'on'); } catch {}
  if (m && ctx) ctx.suspend().catch(() => {});
  if (!m) ensure();
  subs.forEach(f => f(m));
}
export function setSfxVolume(v) { vol = Math.max(0, Math.min(1, v)); if (master && ctx) master.gain.setTargetAtTime(BASE * vol, ctx.currentTime, 0.02); }
export const onSfxMute = f => { subs.add(f); return () => subs.delete(f); };
