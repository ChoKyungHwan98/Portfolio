/* v5.3 이력서 내용: 예전 사이트 src/data/resume.ts 에서 그대로 옮김(글자 하나 안 바꿈). 자기소개 문항은 자기소개서 쪽 몫이라 여기엔 안 넣음.
   slug = 이 사이트 포트폴리오 상세로 가는 연결(예전 사이트의 '프로젝트 보기' 단추와 같은 역할) */
export const RESUME = {
  name: '조경환', role: '전투 · 시스템 게임 기획자 지망생', email: 'ckh980624@gmail.com', phone: '010-4826-6256', address: '경기도 고양시 덕양구', birthDate: '1998.06.24',
  summary: '**기획 의도**를 알고, 그것을 관통하는 **목차를 작성할 줄 아는** 게임 기획자 지망생입니다.\n\n**법학**에서 단련한 **논리적** 구조 설계 능력을 게임 기획에 그대로 적용합니다.',
  /* v5.4 대표 1인 프로젝트 3개를 먼저(이 사이트 포트폴리오 자료 그대로: 연도 2026, 달은 자료에 없어서 안 씀. 설명 = 사이트의 분류 · 부제/해시태그) */
  experience: [
    { title: '보스 AI 프로토타입', period: '2026', description: '전투 기획 | 소울라이크 1:1 보스전 · HFSM, Utility AI, GOAP', teamSize: '1인 개발', slug: 'battle', rep: true },
    { title: 'Pico-Bang!', period: '2026', description: '시스템 기획 | 몬스터 추격 시스템, 게임 규칙', teamSize: '1인 개발', slug: 'pico-bang', rep: true },
    { title: 'AI 리뷰 데이터 분석', period: '2026', description: 'AI 활용 · 데이터 분석 | Steam API', teamSize: '1인 개발', slug: 'ai-review', rep: true },
    { title: '도로시아 (방치형 핵앤슬래시 RPG)', period: '2026.02 - 2026.04', description: '팀장 | 전투 및 경제 밸런스 기획, 방치 시스템 설계', teamSize: '11명', slug: 'dorothia' },
    { title: 'Digreed (로그라이트 RPG)', period: '2025.12 - 2026.01', description: '팀장 | 게임 전체 룰 및 시스템 기획', teamSize: '10명', slug: 'digreed' },
    { title: '침묵의 저택 (횡스크롤 공포)', period: '2025.11', description: '팀장 | 게임 전체 룰 및 시스템 기획', teamSize: '4명', slug: 'silent-mansion' },
  ],
  education: [
    { title: '생성형 AI를 활용한 게임 기획자 과정', period: '2025.09 - 2026.04', details: ['팀 프로젝트 3회 진행 (전 프로젝트 팀장)'] },
    { title: '숭실대학교 법학과', period: '2017.02 - 2025.08', details: ["'의무이행소송의 성립여부 및 실익 검토' 논문 95점"] },
    { title: 'Shanghai Singapore International School', period: '2010.09 - 2014.01', details: [] },
  ],
  certificates: [{ name: 'TOEIC', score: '800점대', date: '2023' }, { name: 'TOEFL', score: '102점', date: '2016' }, { name: '新HSK 5급', score: '183', date: '2015' }],
  military: { branch: '육군 3사관학교 법무실', role: '법무실 근무', rank: '병장', status: '전역' },
  tools: [
    { name: 'Excel', description: 'VLOOKUP, INDEX/MATCH, 사칙연산, 조건부 서식 활용 및 데이터 테이블 제작' },
    { name: 'PowerPoint', description: '슬라이드 마스터 기반의 커스텀 템플릿 제작, 기획 의도 시각화 및 논리학 기반 목차 구성에 강점' },
    { name: 'Word', description: '체계적이고 가독성 높은 기획 문서 및 사양서 작성' },
    { name: 'Figma', description: 'UI 와이어프레임 작성 및 프로토타입 제작' },
    { name: 'Notion', description: '일반적인 문서 작성 및 간트차트를 활용한 일정 관리' },
    { name: 'Unity', description: '바이브코딩으로 게임 아이디어를 빠르게 프로토타입으로 구현' },
    { name: 'Unreal Engine', description: '' },
    { name: 'ChatGPT', description: '방대한 데이터 크롤링 및 분석을 통한 기획 소스 확보' },
    { name: 'Gemini', description: '고도화된 프롬프트 엔지니어링을 활용해 기획에 필요한 핵심 로직 및 아이디어 즉각 생성' },
    { name: 'Claude', description: '바이브코딩을 사용하여 복잡한 시스템 기획 사양의 코드 구현 및 검증' },
    { name: 'Hermes', description: 'LLM 기반 아이디어 검토와 문서 초안 정리에 활용' },
    { name: 'Codex', description: '코드 기반 프로토타입 제작 및 기능 검증 보조에 활용' },
    { name: 'Antigravity', description: 'AI 에이전트를 통해 신속한 게임 프로토타입 제작 및 고도화' },
  ],
};
