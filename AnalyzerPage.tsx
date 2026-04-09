import { useState, useCallback } from 'react';
import { Search, RefreshCw, Download } from 'lucide-react';
import ScanProgress from '../analyzer/ScanProgress';
import RiskReport from '../analyzer/RiskReport';
import { analyzeProfile, computeFinalScore, getRiskLevel } from '../../lib/osint-engine';
import { saveInvestigation } from '../../lib/supabase';
import type { AnalysisData, Platform, RiskLevel, Page } from '../../types';

type Stage = 'input' | 'scanning' | 'results';

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'reddit', label: 'Reddit' },
];

interface Props {
  onNavigate: (page: Page) => void;
  prefillUsername?: string;
}

export default function AnalyzerPage({ onNavigate, prefillUsername }: Props) {
  const [stage, setStage] = useState<Stage>('input');
  const [username, setUsername] = useState(prefillUsername || '');
  const [platform, setPlatform] = useState<Platform>('twitter');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.replace(/^@/, '').trim();
    if (!clean) { setError('Please enter a username'); return; }
    setError('');
    setUsername(clean);
    setStage('scanning');
  };

  const handleScanComplete = useCallback(() => {
    const data = analyzeProfile(username, platform);
    const score = computeFinalScore(data);
    const level = getRiskLevel(score);
    setAnalysisData(data);
    setRiskScore(score);
    setRiskLevel(level);
    setStage('results');
    saveInvestigation({
      username,
      platform,
      riskScore: score,
      riskLevel: level,
      analysisData: data as unknown as object,
      metadata: data.metadata as unknown as object,
    }).catch(() => {});
  }, [username, platform]);

  const handleReset = () => {
    setStage('input');
    setUsername('');
    setAnalysisData(null);
  };

  const handleExport = () => {
    if (!analysisData) return;
    const report = {
      username, platform, riskScore, riskLevel,
      analysisData, exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osint-report-${username}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Profile Analyzer</h2>
          <p className="text-sm text-slate-500 mt-0.5">Input → OSINT Analysis → Risk Assessment</p>
        </div>
        {stage === 'results' && (
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors">
              <Download size={14} /> Export
            </button>
            <button onClick={handleReset} className="flex items-center gap-1.5 text-sm bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors">
              <RefreshCw size={14} /> New Scan
            </button>
          </div>
        )}
      </div>

      {stage === 'input' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Start OSINT Investigation</h3>
              <p className="text-sm text-slate-400 mt-2">Enter a social media username to analyze for suspicious activity, fake patterns, and threat indicators.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    placeholder="username_to_investigate"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 rounded-lg pl-7 pr-4 py-3 text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Platform</label>
                <select
                  value={platform}
                  onChange={e => setPlatform(e.target.value as Platform)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-lg px-4 py-3 text-white outline-none appearance-none cursor-pointer"
                >
                  {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Search size={16} />
                Launch OSINT Analysis
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Try demo targets</div>
              <div className="flex flex-wrap gap-2">
                {['crypto_giveaway_real', 'investment_guru_profit', 'john_smith_2024', 'free_followers_boost'].map(demo => (
                  <button key={demo} onClick={() => setUsername(demo)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded border border-slate-700 transition-colors">
                    @{demo}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: '10+ OSINT Sources', desc: 'Cross-referenced databases' },
              { label: 'AI Heuristics', desc: 'Pattern recognition engine' },
              { label: 'Network Graph', desc: 'Visual connection mapping' },
            ].map(f => (
              <div key={f.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-sm font-semibold text-cyan-400">{f.label}</div>
                <div className="text-xs text-slate-500 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === 'scanning' && (
        <ScanProgress username={username} platform={platform} onComplete={handleScanComplete} />
      )}

      {stage === 'results' && analysisData && (
        <RiskReport
          username={username}
          platform={platform}
          riskScore={riskScore}
          riskLevel={riskLevel}
          data={analysisData}
          onViewNetwork={() => onNavigate('network')}
        />
      )}
    </div>
  );
}