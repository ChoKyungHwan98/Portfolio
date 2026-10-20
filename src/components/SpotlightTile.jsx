import { forwardRef, useRef } from 'react';
/* 포인터를 따라다니는 빛 웅덩이. 원리: React Bits SpotlightCard / Magic UI MagicCard.
   검정 타일 위에서 흰빛이 아주 약하게 따라온다 (무대 조명 주제와 같은 언어). */
const SpotlightTile = forwardRef(function SpotlightTile({ href, icon, label, onClick }, fwd) {
  const ref = useRef(null);
  const move = e => {
    const el = ref.current, b = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - b.left}px`); el.style.setProperty('--my', `${e.clientY - b.top}px`);
  };
  const setRef = el => { ref.current = el; if (typeof fwd === 'function') fwd(el); else if (fwd) fwd.current = el; };
  return (
    <a ref={setRef} className="tile" href={href} onPointerMove={move} onClick={onClick}>
      <span className="tile-light" aria-hidden="true" />
      {icon}
      <span className="tile-label">{label}</span>
    </a>
  );
});
export default SpotlightTile;
