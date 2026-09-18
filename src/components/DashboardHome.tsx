import React from 'react';
import type { DashboardView } from './DashboardShell';
import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Check, Copy, FileUser, Gamepad2, ScrollText, Tv } from 'lucide-react';

interface DashboardHomeProps {
  onViewChange: (view: DashboardView) => void;
}

const QUICK_LINKS: {
  id: DashboardView;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'resume',
    label: '이력서',
    desc: '학력 · 경력 · 자격증 · 툴 활용',
    icon: <FileUser className="w-5 h-5" />,
  },
  {
    id: 'cover-letter',
    label: '자기소개서',
    desc: '지원 동기 및 기획 철학',
    icon: <ScrollText className="w-5 h-5" />,
  },
  {
    id: 'portfolio',
    label: '포트폴리오',
    desc: '기획 산출물과 개발 프로젝트',
    icon: <BriefcaseBusiness className="w-5 h-5" />,
  },
  {
    id: 'game-history',
    label: '게임 플레이 이력',
    desc: '게임 플레이 인사이트',
    icon: <Gamepad2 className="w-5 h-5" />,
  },
  {
    id: 'anime-history',
    label: '애니메이션 시청 이력',
    desc: '서브컬처 인사이트',
    icon: <Tv className="w-5 h-5" />,
  },
];

export const DashboardHome = ({ onViewChange }: DashboardHomeProps) => {
  const [copiedKey, setCopiedKey] = React.useState<'email' | 'phone' | null>(null);

  const handleCopy = (text: string, key: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 1800);
  };

  return (
    <section className="dashboard-home relative overflow-hidden !justify-start lg:!justify-center w-full min-h-[calc(100vh-116px)]">
      <div className="w-full max-w-[1240px] grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-20 items-center relative z-10">

        {/* Left Side: Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-start w-full"
        >
          <span className="mb-8 inline-flex items-center gap-2.5 text-[#a1a1aa] text-[14px] font-bold tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e07070]" />
            게임 기획자 지원자 · 조경환
          </span>

          <h1 className="text-left m-0 mb-9 font-black tracking-tighter leading-[1.15] text-white">
            <div className="flex flex-col gap-5">
              <div className="flex items-baseline gap-3.5">
                <span className="text-[#e07070] font-black text-8xl drop-shadow-[0_0_24px_rgba(224,112,112,0.35)]">−</span>
                <span className="text-[#a1a1aa] font-extrabold text-7xl pr-4">를</span>
                <span className="text-gray-400 font-black text-8xl drop-shadow-[0_0_20px_rgba(156,163,175,0.3)]">0</span>
                <span className="text-[#a1a1aa] font-extrabold text-7xl">으로,</span>
              </div>
              <div className="flex items-baseline gap-3.5">
                <span className="text-gray-400 font-black text-8xl drop-shadow-[0_0_20px_rgba(156,163,175,0.3)]">0</span>
                <span className="text-[#a1a1aa] font-extrabold text-7xl pr-4">을</span>
                <span className="text-blue-500 font-black text-8xl drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">+</span>
                <span className="text-[#a1a1aa] font-extrabold text-7xl">로.</span>
              </div>
            </div>
          </h1>

          <p className="text-[#f4f3ee] text-2xl font-bold max-w-[760px] leading-[1.7] mb-11 tracking-tight opacity-90 drop-shadow-md">
            플레이어에게 주고 싶은 경험을 먼저 생각하고,<br className="block" />
            그 경험이 실제 플레이로 이어지도록 시스템으로 구현하는<br className="block" />
            게임 기획자가 되고 싶습니다.
          </p>

          <div className="flex flex-row items-center gap-4 w-auto">
            <button
              type="button"
              className="group relative px-9 py-4.5 bg-[#f4f3ee] text-[#15171b] font-black text-lg rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(244,243,238,0.15)] transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(244,243,238,0.25)]"
              onClick={() => onViewChange('resume')}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                이력서 보기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>

            <button
              type="button"
              className="px-9 py-4.5 border-[1.5px] border-[rgba(244,243,238,0.2)] text-[#d4d4d8] font-bold text-lg rounded-2xl hover:bg-[rgba(244,243,238,0.06)] hover:text-[#f4f3ee] hover:border-[rgba(244,243,238,0.3)] transition-all flex justify-center items-center"
              onClick={() => onViewChange('portfolio')}
            >
              포트폴리오
            </button>
          </div>
        </motion.div>

        {/* Right Side: Site Index */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="hidden lg:flex flex-col w-full"
        >
          <div className="flex items-center gap-3 mb-5 pl-1">
            <span className="text-[12px] font-black tracking-[0.06em] text-[#71717a]">목차</span>
            <span className="flex-1 h-px bg-[rgba(244,243,238,0.1)]" />
          </div>

          <div className="flex flex-col gap-3">
            {QUICK_LINKS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className="group flex items-center gap-4 w-full text-left px-5 py-4 rounded-2xl border border-[rgba(244,243,238,0.1)] bg-[rgba(244,243,238,0.03)] hover:bg-[rgba(244,243,238,0.07)] hover:border-[rgba(244,243,238,0.22)] transition-all"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-[rgba(244,243,238,0.06)] border border-[rgba(244,243,238,0.08)] text-[#d4d4d8] group-hover:text-[#f4f3ee] transition-colors">
                  {item.icon}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[#f4f3ee] font-extrabold text-base tracking-tight">{item.label}</span>
                  <span className="text-[#8b8b93] text-[13px] font-semibold tracking-tight truncate">{item.desc}</span>
                </span>
                <ArrowUpRight className="ml-auto w-5 h-5 text-[#5a5a63] group-hover:text-[#f4f3ee] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          <div className="mt-6 px-5 py-4 rounded-2xl border border-dashed border-[rgba(244,243,238,0.12)] text-[#8b8b93] text-[13px] font-semibold tracking-tight leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>문의 · 연락</span>
            <button
              type="button"
              onClick={() => handleCopy('ckh980624@gmail.com', 'email')}
              className="inline-flex items-center gap-1.5 text-[#d4d4d8] font-bold hover:text-white transition-colors cursor-pointer"
              title="클릭하여 이메일 복사"
            >
              <span>{copiedKey === 'email' ? '복사됨!' : 'ckh980624@gmail.com'}</span>
              {copiedKey === 'email' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-[#71717a] hover:text-[#d4d4d8] transition-colors" />
              )}
            </button>
            <span className="text-[#525d6a]">·</span>
            <button
              type="button"
              onClick={() => handleCopy('010-4826-6256', 'phone')}
              className="inline-flex items-center gap-1.5 text-[#d4d4d8] font-bold hover:text-white transition-colors cursor-pointer"
              title="클릭하여 전화번호 복사"
            >
              <span>{copiedKey === 'phone' ? '복사됨!' : '010-4826-6256'}</span>
              {copiedKey === 'phone' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-[#71717a] hover:text-[#d4d4d8] transition-colors" />
              )}
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
