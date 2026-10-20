/* 해시 주소: #/portfolio · #/portfolio/<slug> · #/resume · #/cover · #/media?ch=game|anime
   (예전 #portfolio · #resume · #cover-letter, v4.3 #/games · #/anime, 더 예전 #play-history · #anime-history 도 받아서 새 주소로 바꿈) */
export const parse = h => {
  const raw = String(h || '').replace(/^#\/?/, ''), [path, qs = ''] = raw.split('?');
  const [a, b] = path.split('/').map(x => { try { return decodeURIComponent(x); } catch { return x; } });
  if (a === 'portfolio') return { view: 'portfolio', slug: b || null };
  if (a === 'resume') return { view: 'resume' };
  if (a === 'cover' || a === 'cover-letter') return { view: 'cover' };
  if (a === 'media') { const c = new URLSearchParams(qs).get('ch'); return { view: 'media', ch: c === 'anime' ? 'anime' : c === 'game' ? 'game' : null }; } // v5.2 ch 없음 = 방(창 안 뜸)
  if (a === 'games' || a === 'play-history') return { view: 'media', ch: 'game' };
  if (a === 'anime' || a === 'anime-history') return { view: 'media', ch: 'anime' };
  return { view: 'home' };
};
export const build = r => r.view === 'home' ? '' : r.view === 'media' ? '#/media' + (r.ch ? '?ch=' + r.ch : '') : '#/' + r.view + (r.view === 'portfolio' && r.slug ? '/' + r.slug : '');
export const parentOf = r => r.view === 'portfolio' && r.slug ? { view: 'portfolio' } : { view: 'home' };
export const SHEET_VIEWS = ['portfolio', 'resume', 'cover'];
export const isSheet = v => SHEET_VIEWS.includes(v);
export const isScene = v => v === 'media';
