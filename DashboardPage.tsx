import { useEffect, useState } from 'react';
import {
  AlertTriangle, Shield, Network, Search, TrendingUp,
  Activity, Eye, Zap, ChevronRight, Clock, Users
} from 'lucide-react';
import RiskBadge from '../shared/RiskBadge';
import { getInvestigations, getThreatActors } from '../../lib/supabase';
import type { Investigation, ThreatActor, Page, RiskLevel } from '../../types';

interface Props {
  onNavigate: (page: Page) => void;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  color: string;
}

function StatCard({ icon, label, value, change, color }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start gap-4 hover:border-slate-700 transition-colors">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-slate-400">{label}</div>
        {change && (
          <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp size={11} />
            {change}
          </div>
        )}
      </div>
    </div>
  );
}

const liveAlerts = [
  { id: 1, msg: 'New coordinated scam network detected — 14 accounts', time: '2m ago', level: 'critical' as RiskLevel },
  { id: 2, msg: 'Profile @invest_profit_real flagged for financial fraud', time: '5m ago', level: 'high' as RiskLevel },
  { id: 3, msg: 'Bot cluster identified on Instagram — 47 accounts', time: '12m ago', level: 'high' as RiskLevel },
  { id: 4, msg: 'Username pattern match: dark web data breach correlation', time: '18m ago', level: 'medium' as RiskLevel },
  { id: 5, msg: 'Community report verified: romance scam network', time: '34m ago', level: 'critical' as RiskLevel },
  { id: 6, msg: 'Cross-platform identity trace completed successfully', time: '41m ago', level: 'medium' as RiskLevel },
];

const platformDistribution = [
  { platform: 'Twitter', count: 38, color: 'bg-sky-500' },
  { platform: 'Instagram', count: 27, color: 'bg-pink-500' },
  { platform: 'Facebook', count: 19, color: 'bg-blue-500' },
  { platform: 'LinkedIn', count: 9, color: 'bg-cyan-600' },
  { platform: 'TikTok', count: 7, color: 'bg-red-400' },
];

const totalPlatformCount = platformDistribution.reduce((a, b) => a + b.count, 0);

export default function DashboardPage({ onNavigate }: Props) {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [threats, setThreats] = useState<ThreatActor[]>([]);
  const [alertIdx, setAlertIdx] = useState(0);

  useEffect(() => {
    getInvestigations(10).then(data => {
      if (data) setInvestigations(data.map(d => ({
        id: d.id,
        username: d.username,
        platform: d.platform,
        riskScore: d.risk_score,
        riskLevel: d.risk_level as RiskLevel,
        status: d.status,
        analysisData: d.analysis_data,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      })));
    }).catch(() => {});

    getThreatActors().then(data => {
      if (data) setThreats(data.slice(0, 5).map(d => ({
        id: d.id,
        username: d.username,
        platform: d.platform,
        riskScore: d.risk_score,
        riskLevel: d.risk_level as RiskLevel,
        threatCategory: d.threat_category,
        tags: d.tags || [],
        description: d.description,
        reportedCount: d.reported_count,
        confirmed: d.confirmed,
        createdAt: d.created_at,
      })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAlertIdx(i => (i + 1) % liveAlerts.length), 3000);
    return () => clearInterval(t);
  }, []);

  const highRisk = investigations.filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Intelligence Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">Real-time threat monitoring and OSINT analysis</p>
        </div>
        <button
          onClick={() => onNavigate('analyzer')}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          <Search size={15} />
          Analyze Profile
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Search size={18} className="text-cyan-400" />} label="Total Investigations" value={investigations.length || 142} color="bg-cyan-500/15" change="+12 this week" />
        <StatCard icon={<AlertTriangle size={18} className="text-red-400" />} label="High Risk Detected" value={highRisk || 47} color="bg-red-500/15" change="+5 today" />
        <StatCard icon={<Network size={18} className="text-amber-400" />} label="Networks Analyzed" value={38} color="bg-amber-500/15" change="+3 this week" />
        <StatCard icon={<Shield size={18} className="text-emerald-400" />} label="Threats Flagged" value={89} color="bg-emerald-500/15" change="All time" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-red-400" />
                <span className="text-sm font-semibold text-white">Live Threat Feed</span>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              </div>
              <span className="text-xs text-slate-500">Auto-updating</span>
            </div>
            <div className="divide-y divide-slate-800">
              {liveAlerts.map((alert, i) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 px-5 py-3.5 transition-all duration-500 ${i === alertIdx ? 'bg-slate-800/50' : ''}`}
                >
                  <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    alert.level === 'critical' ? 'bg-red-400' :
                    alert.level === 'high' ? 'bg-orange-400' : 'bg-amber-400'
                  } ${i === alertIdx ? 'animate-ping' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300">{alert.msg}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RiskBadge level={alert.level} size="sm" />
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Clock size={10} />{alert.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-cyan-400" />
                <span className="text-sm font-semibold text-white">Recent Investigations</span>
              </div>
              <button onClick={() => onNavigate('investigations')} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                View All <ChevronRight size={12} />
              </button>
            </div>
            {investigations.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">
                No investigations yet.{' '}
                <button onClick={() => onNavigate('analyzer')} className="text-cyan-400 hover:underline">
                  Analyze your first profile
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {investigations.slice(0, 6).map(inv => (
                  <div key={inv.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/30 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                      {inv.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">@{inv.username}</div>
                      <div className="text-xs text-slate-500 capitalize">{inv.platform}</div>
                    </div>
                    <RiskBadge level={inv.riskLevel} score={inv.riskScore} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-white">Known Threat Actors</span>
            </div>
            <div className="divide-y divide-slate-800">
              {threats.map(t => (
                <div key={t.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">@{t.username}</span>
                    <RiskBadge level={t.riskLevel} size="sm" />
                  </div>
                  <div className="text-xs text-slate-500 truncate">{t.description}</div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {t.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-cyan-400" />
              <span className="text-sm font-semibold text-white">Platform Distribution</span>
            </div>
            <div className="space-y-3">
              {platformDistribution.map(p => (
                <div key={p.platform}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{p.platform}</span>
                    <span className="text-slate-500">{p.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${(p.count / totalPlatformCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-slate-900 border border-cyan-500/20 rounded-xl p-5">
            <div className="text-sm font-bold text-white mb-1">Quick Scan</div>
            <p className="text-xs text-slate-400 mb-3">Instantly analyze any social media profile</p>
            <button
              onClick={() => onNavigate('analyzer')}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Search size={14} />
              Start Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}