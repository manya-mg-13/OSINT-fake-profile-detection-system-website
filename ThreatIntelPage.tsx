import { useEffect, useState } from 'react';
import { Rss, Shield, AlertTriangle, Target, TrendingUp, ExternalLink } from 'lucide-react';
import RiskBadge from '../shared/RiskBadge';
import { getThreatActors } from '../../lib/supabase';
import type { ThreatActor, ThreatCategory, RiskLevel, Platform } from '../../types';

const categoryColors: Record<ThreatCategory, string> = {
  scam: 'bg-red-500/15 text-red-400 border-red-500/30',
  financial_fraud: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  phishing: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  romance_scam: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  impersonation: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  harassment: 'bg-red-600/15 text-red-500 border-red-600/30',
  spam: 'bg-slate-600/30 text-slate-400 border-slate-600/30',
  bot_network: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  job_scam: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  unknown: 'bg-slate-700/30 text-slate-500 border-slate-700',
};

const trendingThreats = [
  { name: 'Crypto Impersonation Campaign', count: 147, trend: '+23%', level: 'critical' as RiskLevel },
  { name: 'Romance Scam Networks', count: 89, trend: '+15%', level: 'critical' as RiskLevel },
  { name: 'Fake Recruiter Bots', count: 64, trend: '+8%', level: 'high' as RiskLevel },
  { name: 'Investment Fraud Clusters', count: 52, trend: '+31%', level: 'high' as RiskLevel },
  { name: 'Phishing Support Accounts', count: 41, trend: '+5%', level: 'high' as RiskLevel },
];

const recentTTPs = [
  { technique: 'Coordinated Inauthentic Behavior', platform: 'Twitter', detections: 34, severity: 'high' as RiskLevel },
  { technique: 'Profile Picture Cloning', platform: 'Instagram', detections: 28, severity: 'medium' as RiskLevel },
  { technique: 'Bulk Account Registration', platform: 'Facebook', detections: 19, severity: 'high' as RiskLevel },
  { technique: 'DM Phishing via Cloned Accounts', platform: 'LinkedIn', detections: 15, severity: 'critical' as RiskLevel },
  { technique: 'Fake Verification Badge Scams', platform: 'Twitter', detections: 12, severity: 'high' as RiskLevel },
];

export default function ThreatIntelPage() {
  const [actors, setActors] = useState<ThreatActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<ThreatCategory | 'all'>('all');

  useEffect(() => {
    getThreatActors().then(data => {
      if (data) {
        setActors(data.map(d => ({
          id: d.id,
          username: d.username,
          platform: d.platform as Platform,
          riskScore: d.risk_score,
          riskLevel: d.risk_level as RiskLevel,
          threatCategory: d.threat_category as ThreatCategory,
          tags: d.tags || [],
          description: d.description || '',
          reportedCount: d.reported_count || 0,
          confirmed: d.confirmed || false,
          createdAt: d.created_at,
        })));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filterCat === 'all' ? actors : actors.filter(a => a.threatCategory === filterCat);
  const categories = [...new Set(actors.map(a => a.threatCategory))];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Threat Intelligence</h2>
        <p className="text-sm text-slate-500 mt-0.5">Known threat actors, attack patterns, and active campaigns</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Known Actors', val: actors.length, icon: <Target size={16} />, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Confirmed Threats', val: actors.filter(a => a.confirmed).length, icon: <Shield size={16} />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Active Campaigns', val: 14, icon: <AlertTriangle size={16} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'New This Week', val: 7, icon: <TrendingUp size={16} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg} ${s.color}`}>{s.icon}</div>
            <div>
              <div className="text-xl font-bold text-white">{s.val}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
            <TrendingUp size={15} className="text-red-400" />
            <span className="text-sm font-semibold text-white">Trending Threat Types</span>
            <span className="ml-auto text-xs text-slate-500">Last 30 days</span>
          </div>
          <div className="divide-y divide-slate-800">
            {trendingThreats.map((t, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-sm font-bold text-slate-500 w-5">{i + 1}</span>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.count} detections</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-medium">{t.trend}</span>
                  <RiskBadge level={t.level} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
            <Rss size={15} className="text-amber-400" />
            <span className="text-sm font-semibold text-white">Tactics, Techniques & Procedures</span>
          </div>
          <div className="divide-y divide-slate-800">
            {recentTTPs.map((t, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{t.technique}</div>
                  <div className="text-xs text-slate-500">{t.platform} · {t.detections} cases</div>
                </div>
                <RiskBadge level={t.severity} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 flex-wrap">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white">Known Threat Actors</span>
          </div>
          <div className="ml-auto flex gap-2 flex-wrap">
            <button onClick={() => setFilterCat('all')}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${filterCat === 'all' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-slate-400 border-slate-700 hover:border-slate-600'}`}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors capitalize ${filterCat === cat ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-slate-400 border-slate-700 hover:border-slate-600'}`}>
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-800">
          {loading ? (
            <div className="px-5 py-10 text-center text-slate-500 text-sm">Loading threat actors...</div>
          ) : filtered.map(actor => (
            <div key={actor.id} className="px-5 py-4 hover:bg-slate-800/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 flex-shrink-0">
                  {actor.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-white">@{actor.username}</span>
                    <span className="text-xs text-slate-500 capitalize">{actor.platform}</span>
                    {actor.confirmed && (
                      <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-semibold">CONFIRMED</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded border capitalize font-medium ${categoryColors[actor.threatCategory]}`}>
                      {actor.threatCategory.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{actor.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex gap-1">
                      {actor.tags.map(tag => (
                        <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                    <span className="text-xs text-slate-600">{actor.reportedCount} reports</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <RiskBadge level={actor.riskLevel} score={actor.riskScore} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}