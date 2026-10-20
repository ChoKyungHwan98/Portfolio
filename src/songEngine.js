/* 노래 재생기.
   - 페이지가 뜨면 song.mp3 를 미리 받아 디코딩해 둔다 (Web Audio).
   - 플레이 클릭(사용자 제스처) 때 AudioContext 를 깨워 두고(prime), 재생은 '정해진 시각'에 예약한다.
   - 시계는 AudioContext 기준이라 화면 큐와 박이 실제 소리에 맞는다.
   - Web Audio 가 안 되면 <audio> 로 대체: 클릭 때 무음 재생→정지로 잠금 해제, 예약 시각에 play(). */
const SRC = './song.mp3';
const q = new URLSearchParams(location.search);
const LOG = q.has('audiolog');

export function createSongEngine() {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, gain = null, buf = null, loading = null, src = null, el = null;
  let startCtx = null, startPerf = null, timer = null, vol = 0.7, onEnded = null, mode = AC ? 'webaudio' : 'element';
  const log = (window.__rhythm = { mode, events: [] });
  const ev = (name, extra) => { log.events.push({ name, perf: +performance.now().toFixed(1), ...extra }); };

  function ensureCtx() {
    if (ctx || !AC) return ctx;
    try { ctx = new AC({ latencyHint: 'interactive' }); gain = ctx.createGain(); gain.gain.value = vol; gain.connect(ctx.destination); }
    catch { ctx = null; mode = 'element'; }
    return ctx;
  }
  function preload() {
    if (loading) return loading;
    if (!ensureCtx()) { mode = 'element'; return (loading = Promise.resolve()); }
    loading = fetch(SRC).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(ab => new Promise((res, rej) => ctx.decodeAudioData(ab, res, rej)))
      .then(b => { buf = b; ev('decoded', { dur: +b.duration.toFixed(2) }); })
      .catch(e => { ev('decode-failed', { err: String(e) }); mode = 'element'; });
    return loading;
  }
  const getEl = () => { if (!el) { el = new Audio(SRC); el.preload = 'auto'; el.volume = vol; el.onended = () => onEnded?.(); } return el; };

  /** 클릭 제스처 안에서 호출: 오디오 잠금 해제만, 소리는 아직 안 냄 */
  function prime() {
    ensureCtx();
    if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
    if (mode === 'element') { const a = getEl(); a.muted = true; const p = a.play(); p && p.then(() => { a.pause(); a.currentTime = 0; a.muted = false; }, () => { a.muted = false; }); }
    ev('primed', { ctxState: ctx?.state });
  }

  /** delaySec 뒤에 노래 0초부터 재생 예약 */
  function schedule(delaySec, ended) {
    stop(); onEnded = ended; startPerf = performance.now() + delaySec * 1000;
    log.clickPerf = +performance.now().toFixed(1); log.plannedStartPerf = +startPerf.toFixed(1);
    const go = () => {
      if (mode === 'webaudio' && buf && ctx) {
        // 디코딩이 늦어도 예정 시각을 지켜서, 이미 지났으면 그만큼 건너뛰지 않고 바로 시작 (화면은 그동안 대기)
        const wait = Math.max(0.02, (startPerf - performance.now()) / 1000);
        src = ctx.createBufferSource(); src.buffer = buf; src.connect(gain);
        startCtx = ctx.currentTime + wait; src.start(startCtx);
        const me = src; src.onended = () => { if (src === me) { src = null; onEnded?.(); } };
        ev('scheduled', { inSec: +wait.toFixed(3), ctxStart: +startCtx.toFixed(3) });
        if (LOG) watchSignal();
      } else {
        const a = getEl(); a.currentTime = 0; a.muted = false;
        const wait = Math.max(0, startPerf - performance.now());
        timer = setTimeout(() => { const p = a.play(); ev('element-play'); p && p.catch(e => ev('element-failed', { err: String(e) })); }, wait);
      }
    };
    if (mode === 'webaudio' && !buf) preload().then(() => { if (startPerf != null) go(); }); else go();
  }
  function stop() {
    clearTimeout(timer); timer = null;
    if (src) { const s = src; src = null; try { gain.gain.setTargetAtTime(0, ctx.currentTime, 0.015); s.stop(ctx.currentTime + 0.08); } catch {} setTimeout(() => gain && gain.gain.setValueAtTime(vol, ctx.currentTime), 120); }
    if (el) { el.pause(); el.currentTime = 0; }
    if (startPerf != null) ev('stopped');
    startCtx = null; startPerf = null;
  }
  /** 노래 위치(초). 아직 소리가 시작 안 됐으면 null */
  function songTime() {
    if (mode === 'webaudio' && ctx && startCtx != null) {
      const lat = (ctx.outputLatency || 0) + (ctx.baseLatency || 0);
      const t = ctx.currentTime - startCtx - lat;
      return t >= 0 ? t : null;
    }
    if (el && !el.paused && el.currentTime > 0) return el.currentTime;
    return null;
  }
  function setVolume(v) {
    vol = v; if (gain && ctx) gain.gain.setTargetAtTime(v, ctx.currentTime, 0.02); if (el) el.volume = v;
  }
  /* 확인용(?audiolog): 실제 출력 신호가 처음 0이 아니게 되는 순간을 기록 */
  function watchSignal() {
    const an = ctx.createAnalyser(); an.fftSize = 512; gain.connect(an);
    const d = new Float32Array(an.fftSize); const t0 = performance.now();
    const tick = () => {
      an.getFloatTimeDomainData(d); let m = 0; for (const x of d) m = Math.max(m, Math.abs(x));
      if (m > 0.01) { ev('first-signal', { peak: +m.toFixed(3), sinceClick: +((performance.now() - log.clickPerf) / 1000).toFixed(3) }); gain.disconnect(an); return; }
      if (performance.now() - t0 < 15000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  return { preload, prime, schedule, stop, songTime, setVolume, get mode() { return mode; } };
}
