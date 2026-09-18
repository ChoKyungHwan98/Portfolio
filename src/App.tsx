import React, { useEffect, useState } from 'react';
import { AnimeHistoryView } from './components/AnimeHistoryView';
import { DashboardGameHistoryView } from './components/DashboardGameHistoryView';
import { DashboardHome } from './components/DashboardHome';
import { DashboardShell } from './components/DashboardShell';
import type { DashboardView } from './components/DashboardShell';
import { Portfolio } from './components/Portfolio';
import { Resume } from './components/Resume';
import { MobileApp } from './components/mobile/MobileApp';
import { useEditableContent } from './hooks/useEditableContent';
import { useIsMobile } from './hooks/useIsMobile';
import { PROJECTS, RESUME_DATA } from './data';

const normalizeView = (value: string | null): DashboardView => {
  if (value === 'cover-letter') return 'cover-letter';
  if (value === 'resume') return 'resume';
  if (value === 'portfolio') return 'portfolio';
  if (value === 'game-history' || value === 'play') return 'game-history';
  if (value === 'anime-history' || value === 'anime') return 'anime-history';
  return 'home';
};

const getProjectIdParam = (params: URLSearchParams) => {
  const rawProjectId = params.get('project');
  if (!rawProjectId) return null;
  const parsedProjectId = Number(rawProjectId);
  return Number.isFinite(parsedProjectId) ? parsedProjectId : null;
};

function App() {
  const [view, setView] = useState<DashboardView>(() => {
    if (typeof window === 'undefined') return 'home';
    const params = new URLSearchParams(window.location.search);
    return normalizeView(params.get('view'));
  });
  const [initialProjectId, setInitialProjectId] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return normalizeView(params.get('view')) === 'portfolio' ? getProjectIdParam(params) : null;
  });
  const [portfolioProjectTitle, setPortfolioProjectTitle] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [resumeData, setResumeData, resumeLoaded] = useEditableContent(RESUME_DATA, 'webzen_resume_data');
  const [projectsData, setProjectsData, projectsLoaded] = useEditableContent(PROJECTS, 'webzen_portfolio_projects_v2');

  const isMobile = useIsMobile();
  const isDataLoaded = resumeLoaded && projectsLoaded;
  const breadcrumbDetail = view === 'portfolio'
    ? portfolioProjectTitle || projectsData.find(project => project.id === initialProjectId)?.title || null
    : null;

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const nextView = normalizeView(params.get('view'));
      const nextProjectId = nextView === 'portfolio' ? getProjectIdParam(params) : null;
      setView(nextView);
      setInitialProjectId(nextProjectId);
      setPortfolioProjectTitle(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeView = (nextView: DashboardView) => {
    setView(nextView);
    setInitialProjectId(null);
    setPortfolioProjectTitle(null);
    const url = nextView === 'home' ? window.location.pathname : `?view=${nextView}`;
    window.history.pushState({ view: nextView }, '', url);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const openPortfolioProject = (projectId: number) => {
    const projectTitle = projectsData.find(project => project.id === projectId)?.title || null;
    setView('portfolio');
    setInitialProjectId(projectId);
    setPortfolioProjectTitle(projectTitle);
    window.history.pushState({ view: 'portfolio', projectId }, '', `?view=portfolio&project=${projectId}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const triggerPdfDownload = () => {
    setIsGeneratingPdf(true);
    window.dispatchEvent(new Event('triggerPdfDownload'));
    window.setTimeout(() => setIsGeneratingPdf(false), 500);
  };

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#15171b]">
        <div className="dashboard-loading">
          <div />
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (isMobile) return <MobileApp />;

  return (
    <DashboardShell
      currentView={view}
      onViewChange={changeView}
      onPdfDownload={triggerPdfDownload}
      breadcrumbDetail={breadcrumbDetail}
    >
      <>
        {view === 'home' && <DashboardHome key="home" onViewChange={changeView} />}

        {(view === 'resume' || view === 'cover-letter') && (
          <Resume
            key={view}
            setView={changeView}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            data={resumeData}
            setData={setResumeData}
            projects={projectsData}
            onOpenProject={openPortfolioProject}
            onBack={() => changeView('home')}
            activeTab={view === 'cover-letter' ? 'cover-letter' : 'resume'}
            setActiveTab={(tab) => changeView(tab as DashboardView)}
            isGeneratingPdf={isGeneratingPdf}
            setIsGeneratingPdf={setIsGeneratingPdf}
          />
        )}

        {view === 'portfolio' && (
          <Portfolio
            key="portfolio"
            onProjectClick={() => undefined}
            isEditing={isEditing}
            projects={projectsData}
            setProjects={setProjectsData}
            initialProjectId={initialProjectId}
            onSelectedProjectChange={setPortfolioProjectTitle}
            setView={changeView}
            onBack={() => changeView('home')}
          />
        )}

        {view === 'game-history' && (
          <div
            key="game-history"
            className="dashboard-page-motion dashboard-view-game-history"
          >
            <DashboardGameHistoryView />
          </div>
        )}

        {view === 'anime-history' && (
          <div
            key="anime-history"
            className="dashboard-page-motion dashboard-view-anime-history"
          >
            <AnimeHistoryView />
          </div>
        )}
      </>
    </DashboardShell>
  );
}

export default App;
