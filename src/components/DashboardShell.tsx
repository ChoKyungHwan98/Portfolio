import React from 'react';
import { BriefcaseBusiness, Download, FileUser, Gamepad2, Home, Mail, Menu, ScrollText, Tv } from 'lucide-react';

export type DashboardView = 'home' | 'resume' | 'cover-letter' | 'portfolio' | 'game-history' | 'anime-history';

interface DashboardShellProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onPdfDownload: () => void;
  breadcrumbDetail?: string | null;
  children: React.ReactNode;
}

const NAV_ITEMS: {
  id: DashboardView;
  label: string;
  title: string;
  icon: React.ReactNode;
}[] = [
  { id: 'home', label: '홈', title: '홈 화면', icon: <Home className="w-5 h-5" /> },
  { id: 'resume', label: '이력서', title: '이력서', icon: <FileUser className="w-5 h-5" /> },
  { id: 'cover-letter', label: '자기소개서', title: '자기소개서', icon: <ScrollText className="w-5 h-5" /> },
  { id: 'portfolio', label: '포트폴리오', title: '포트폴리오', icon: <BriefcaseBusiness className="w-5 h-5" /> },
  { id: 'game-history', label: '게임 플레이 이력', title: '게임 플레이 이력', icon: <Gamepad2 className="w-5 h-5" /> },
  { id: 'anime-history', label: '애니메이션 시청 이력', title: '애니메이션 시청 이력', icon: <Tv className="w-5 h-5" /> },
];

export const DashboardShell = ({
  currentView,
  onViewChange,
  onPdfDownload,
  breadcrumbDetail,
  children,
}: DashboardShellProps) => {
  const currentTitle = NAV_ITEMS.find((item) => item.id === currentView)?.title ?? '홈 화면';
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const previousSidebarExpandedRef = React.useRef(isSidebarExpanded);

  React.useLayoutEffect(() => {
    const wasExpanded = previousSidebarExpandedRef.current;
    previousSidebarExpandedRef.current = isSidebarExpanded;

    if (wasExpanded === isSidebarExpanded || !bodyRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const offset = isSidebarExpanded ? -168 : 168;
    const animation = bodyRef.current.animate(
      [
        { transform: `translateX(${offset}px)` },
        { transform: 'translateX(0)' },
      ],
      {
        duration: 140,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    );

    return () => animation.cancel();
  }, [isSidebarExpanded]);

  const handleNavClick = (view: DashboardView) => {
    onViewChange(view);
  };

  return (
    <div className={`dashboard-shell${isSidebarExpanded ? ' sidebar-expanded' : ' sidebar-collapsed'}`}>
      <aside className="dashboard-sidebar">
        <button
          type="button"
          className="dashboard-menu-toggle"
          onClick={() => setIsSidebarExpanded((prev) => !prev)}
          aria-label={isSidebarExpanded ? '메뉴 접기' : '메뉴 펼치기'}
        >
          <Menu className="w-6 h-6" />
          <span>지원자 조경환</span>
        </button>

        <nav className="dashboard-nav" aria-label="주요 화면">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dashboard-nav-btn${currentView === item.id ? ' active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              aria-label={item.label}
              title={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="dashboard-contact" aria-label="ckh980624@gmail.com" title="ckh980624@gmail.com">
          <Mail className="w-5 h-5" />
          <span>ckh980624@gmail.com</span>
        </div>
      </aside>

      <div ref={bodyRef} className="dashboard-body">
        <header className="dashboard-header">
          <div className="dashboard-breadcrumb" aria-live="polite">
            <>
              <span>포트폴리오</span>
              <span>/</span>
              {breadcrumbDetail ? <span>{currentTitle}</span> : <strong>{currentTitle}</strong>}
            </>
            {breadcrumbDetail && (
              <>
                <span>/</span>
                <strong>{breadcrumbDetail}</strong>
              </>
            )}
          </div>

          <div className="dashboard-header-actions">
            {(currentView === 'resume' || currentView === 'cover-letter') && (
              <button type="button" className="dashboard-action-btn" onClick={onPdfDownload}>
                <Download className="w-4 h-4" />
                PDF 다운로드
              </button>
            )}
          </div>
        </header>

        <main className={`dashboard-content dashboard-view-${currentView} ${currentView === 'cover-letter' || currentView === 'resume' ? 'dashboard-view-resume' : ''}`}>{children}</main>
      </div>
    </div>
  );
};
