import { useEffect, useState } from 'react';
const read = () => {
  const w = innerWidth, h = innerHeight, mobile = w <= 768;
  const u = Math.min(w / 1920, h / 1080);
  const s = mobile ? Math.min(w / 390, h / 844) : Math.min(u, 0.9); // styles.css --s 와 같은 값 (큰 화면에서 0.9 로 멈춤)
  return { w, h, u, s, mobile };
};
/** 화면 크기 단위: u = 1920×1080 무대 단위, s = 현재 레이아웃 단위(모바일은 390×844 기준) */
export default function useViewport() {
  const [v, setV] = useState(read);
  useEffect(() => {
    let id; const on = () => { cancelAnimationFrame(id); id = requestAnimationFrame(() => setV(read())); };
    addEventListener('resize', on); return () => removeEventListener('resize', on);
  }, []);
  return v;
}
