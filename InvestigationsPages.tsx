import { useEffect, useState } from 'react';
import { FolderOpen, Search, Filter, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import RiskBadge from '../shared/RiskBadge';
import { getInvestigations } from '../../lib/supabase';
import type { RiskLevel, Platform, Page } from '../../types';

interface Investigation {
  id: string;
  username: string;
  platform: Platform;
  riskScore: number;
  riskLevel: RiskLevel;
  status: string;
  createdAt: string;
}

interface Props {
  onNavigate: (page: Page) => void;
}

export default function InvestigationsPage({ onNavigate }: Props) {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>('all');
  const [sortField, setSortField] = useState<'createdAt' | 'riskScore'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    getInvestigations(100).then(data => {
      if (data) {
        setInvestigations(data.map(d => ({
          id: d.id,
          username: d.username,
          platform: d.platform as Platform,
          riskScore: d.risk_score,
          riskLevel: d.risk_level as RiskLevel,
          status: d.status,
          createdAt: d.created_at,
        })));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = investigations
    .filter(inv => {
      const matchSearch = inv.username.toLowerCase().includes(search.toLowerCase()) ||
        inv.platform.toLowerCase().includes(search.toLowerCase());
      const matchLevel = filterLevel === 'all' || inv.riskLevel === filterLevel;
      return matchSearch && matchLevel;
    })
    .sort((a, b) => {
      const valA = sortField === 'riskScore' ? a.riskScore : new Date(a.createdAt).getTime();
      const valB = sortField === 'riskScore' ? b.riskScore : new Date(b.createdAt).getTime();
      return sortDir === 'desc' ? valB - valA : valA - valB;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field
      ? sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />
      : <ChevronDown size={12} className="opacity-30" />;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Investigation History</h2>
          <p className="text-sm text-slate-500 mt-0.5">{investigations.length} total investigations</p>
        </div>
        <button onClick={() => onNavigate('analyzer')}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <Search size={14} /> New Investigation
        </button>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search username or platform..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value as RiskLevel | 'all')}
            className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-sm text-white outline-none appearance-none cursor-pointer"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Username</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Platform</th>
              <th
                className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-slate-300 select-none"
                onClick={() => toggleSort('riskScore')}
              >
                <span className="flex items-center gap-1">Risk Score <SortIcon field="riskScore" /></span>
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th
                className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-slate-300 select-none"
                onClick={() => toggleSort('createdAt')}
              >
                <span className="flex items-center gap-1">Date <SortIcon field="createdAt" /></span>
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-sm">Loading investigations...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center">
                <FolderOpen size={32} className="text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No investigations found.</p>
                <button onClick={() => onNavigate('analyzer')} className="text-cyan-400 text-sm hover:underline mt-1">Run your first analysis</button>
              </td></tr>
            ) : (
              filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        {inv.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white">@{inv.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 capitalize">{inv.platform}</td>
                  <td className="px-4 py-3">
                    <RiskBadge level={inv.riskLevel} score={inv.riskScore} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      inv.status === 'flagged' ? 'bg-red-500/20 text-red-400' :
                      inv.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onNavigate('analyzer')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 rounded transition-colors"
                      >
                        <Eye size={11} /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="mt-3 text-xs text-slate-600 text-right">
          Showing {filtered.length} of {investigations.length} investigations
        </div>
      )}
    </div>
  );
}