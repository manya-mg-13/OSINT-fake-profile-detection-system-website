import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './components/pages/DashboardPage';
import AnalyzerPage from './components/pages/AnalyzerPage';
import NetworkPage from './components/pages/NetworkPage';
import InvestigationsPage from './components/pages/InvestigationsPage';
import ThreatIntelPage from './components/pages/ThreatIntelPage';
import ReportsPage from './components/pages/ReportsPage';
import type { Page } from './types';

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'PHANTOM Intelligence', subtitle: 'OSINT-powered fake profile detection platform' },
  analyzer: { title: 'Profile Analyzer', subtitle: 'Input → OSINT Analysis → Risk Assessment' },
  network: { title: 'Network Map', subtitle: 'Visualize connections between suspicious accounts' },
  investigations: { title: 'Investigations', subtitle: 'History of all analyzed profiles' },
  'threat-intel': { title: 'Threat Intelligence', subtitle: 'Known threat actors, TTPs, and active campaigns' },
  reports: { title: 'Community Reports', subtitle: 'Crowdsourced suspicious profile reports' },
};

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const meta = pageTitles[page];

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar current={page} onChange={setPage} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-auto">
          {page === 'dashboard' && <DashboardPage onNavigate={setPage} />}
          {page === 'analyzer' && <AnalyzerPage onNavigate={setPage} />}
          {page === 'network' && <NetworkPage />}
          {page === 'investigations' && <InvestigationsPage onNavigate={setPage} />}
          {page === 'threat-intel' && <ThreatIntelPage />}
          {page === 'reports' && <ReportsPage />}
        </main>
      </div>
    </div>
  );
}