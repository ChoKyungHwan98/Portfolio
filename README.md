# 조경환 포트폴리오 사이트 (rhythm-home) — 소스

전투 · 시스템 게임 기획자 지망생 조경환의 포트폴리오 홈입니다.
첫 화면은 리듬 게임 느낌의 작은 미니게임 · 방(게임/애니 기록)이고, 포트폴리오 · 이력서 · 자기소개서 판이 있습니다.
React 18 + Vite 5 + motion(motion.dev) 으로 만들었고, 그림은 CSS/SVG 로 직접 그렸습니다(WebGL 없음).
버전: v5.11 (2026-10-20) — 이력서: 소개 문장 뺌, 강조색을 사이트 노랑으로 되돌림(Lucide 줄 아이콘 유지), 도구에 Unreal Engine 추가 · 보스 AI 프로토타입 / Pico-Bang! 카드 그림을 실제 게임 화면으로 교체

## 실행 방법
- Node.js 18 이상(만든 환경: Node 20.19), npm 10 안팎
- 이 폴더에서:
  ```
  npm install        # 처음 한 번 (node_modules 생성)
  npm run dev        # 개발 서버 → 터미널에 나오는 주소(기본 http://localhost:5173)
  npm run build      # 배포용 빌드 → dist\ 폴더
  npm run preview    # dist\ 를 미리 보기
  ```
- `vite.config.js` 의 `base: './'` 덕분에 dist\ 를 어느 폴더/서버에 올려도 됩니다.

## 배포본 위치
- 지금 PC에서 띄우는 배포본: `C:\Users\Admin\Documents\rhythm-home\` (localhost:5173 으로 서비스 중)
- 갱신 = `npm run build` 후 dist\ 안의 내용을 그 폴더에 덮어쓰기(기존 index.html 은 index_vXX.html 로 백업해 둠)

## 주소(해시 라우트)
| 주소 | 화면 |
|---|---|
| `#/` (또는 빈 주소) | 홈(미니게임) |
| `#/portfolio` | 포트폴리오 목록 |
| `#/portfolio/battle` | 보스 AI 프로토타입 |
| `#/portfolio/pico-bang` | Pico-Bang! |
| `#/portfolio/ai-review` | AI 리뷰 데이터 분석 (실제 도구 화면 전시본) |
| `#/portfolio/dorothia` | 도로시아 |
| `#/portfolio/silent-mansion` | 침묵의 저택 |
| `#/portfolio/digreed` | Digreed |
| `#/resume` | 이력서 |
| `#/cover` | 자기소개서 (아직 자리만 있음) |
| `#/media` | 방(게임 · 애니 기록) — `?ch=game` / `?ch=anime` 로 창 바로 열기 |
| `?time=day` / `?time=night` | (QA용) 방의 낮/밤 강제 |
예전 주소(`#portfolio`, `#resume`, `#cover-letter`, `#/games`, `#/anime` 등)도 새 주소로 바뀝니다.

## 폴더 구성
- `src/` — 화면 코드(`pages/Skeleton.jsx` = 포트폴리오 · 이력서 · 자기소개서, `pages/MediaRoom.jsx` 등), 스타일(`*.css`), 이력서 내용 `resume.js`, 방 목록 `media.json`
- `public/` — 그림 · 소리 자료
  - `docs/<프로젝트>/` 기획서 쪽 그림(`c/` 표지, `t/` 작은 그림), `yt/` 영상 썸네일, `cards/` 목록 카드 그림
  - `resume/` 사진 · 도구 아이콘, `media/` 방 썸네일, `song.mp3`
  - `airv/` AI 리뷰 도구의 **정적 전시본**(저장된 팰월드 분석만, 실행 기능 · API 호출 없음, API 키 없음)
- `tools/` — 박스에서 쓰던 화면 검사 스크립트(Puppeteer). 경로가 리눅스 박스 기준(/workspace/...)이라 그대로는 안 돌아갑니다. 참고용.
