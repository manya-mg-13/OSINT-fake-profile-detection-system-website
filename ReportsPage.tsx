import { useEffect, useState } from 'react';
import { Flag, Plus, ThumbsUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import RiskBadge from '../shared/RiskBadge';
import { getCommunityReports, submitCommunityReport, upvoteReport } from '../../lib/supabase';
import type { Platform, ThreatCategory, RiskLevel } from '../../types';

interface Report {
  id: string;
  username: string;
  platform: Platform;
  category: ThreatCategory;
  description: string;
  status: 'pending' | 'verified' | 'dismissed';
  upvotes: number;
  createdAt: string;
}

const categoryOptions: { value: ThreatCategory; label: string }[] = [
  { value: 'scam', label: 'Scam' },
  { value: 'financial_fraud', label: 'Financial Fraud' },
  { value: 'phishing', label: 'Phishing' },
  { value: 'romance_scam', label: 'Romance Scam' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam / Bot' },
  { value: 'job_scam', label: 'Job Scam' },
];

const PLATFORMS: Platform[] = ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'reddit'];

const statusConfig = {
  pending: { icon: <Clock size={12} />, class: 'bg-amber-500/15 text-amber-400', label: 'Pending' },
  verified: { icon: <CheckCircle size={12} />, class: 'bg-emerald-500/15 text-emerald-400', label: 'Verified' },
  dismissed: { icon: <XCircle size={12} />, class: 'bg-slate-700 text-slate-400', label: 'Dismissed' },
};

const mockRiskForCategory = (cat: ThreatCategory): RiskLevel => {
  if (cat === 'financial_fraud' || cat === 'romance_scam') return 'critical';
  if (cat === 'phishing' || cat === 'scam') return 'high';
  if (cat === 'impersonation') return 'high';
  return 'medium';
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ username: '', platform: 'twitter' as Platform, category: 'scam' as ThreatCategory, description: '' });
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());

  useEffect(() => {
    getCommunityReports().then(data => {
      if (data) {
        setReports(data.map(d => ({
          id: d.id,
          username: d.username,
          platform: d.platform as Platform,
          category: d.category as ThreatCategory,
          description: d.description || '',
          status: (d.status || 'pending') as 'pending' | 'verified' | 'dismissed',
          upvotes: d.upvotes || 0,
          createdAt: d.created_at,
        })));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = form.username.replace(/^@/, '').trim();
    if (!clean) { setFormError('Username is required'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      await submitCommunityReport({ ...form, username: clean });
      setSuccess(true);
      setShowForm(false);
      setForm({ username: '', platform: 'twitter', category: 'scam', description: '' });
      const data = await getCommunityReports();
      if (data) setReports(data.map(d => ({
        id: d.id, username: d.username, platform: d.platform as Platform,
        category: d.category as ThreatCategory, description: d.description || '',
        status: (d.status || 'pending') as 'pending' | 'verified' | 'dismissed',
        upvotes: d.upvotes || 0, createdAt: d.created_at,
      })));
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setFormError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (report: Report) => {
    if (upvoted.has(report.id)) return;
    setUpvoted(prev => new Set([...prev, report.id]));
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, upvotes: r.upvotes + 1 } : r));
    await upvoteReport(report.id, report.upvotes).catch(() => {});
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Community Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">Crowdsourced intelligence on suspicious profiles</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Submit Report
        </button>
      </div>

      {success && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle size={15} /> Report submitted successfully. Our team will review it shortly.
        </div>
      )}

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Flag size={15} className="text-red-400" />
            <span className="text-sm font-semibold text-white">Submit a New Report</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                  <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    placeholder="suspicious_account"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-lg pl-7 pr-4 py-2.5 text-sm text-white outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Platform</label>
                <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2.5 text-sm text-white outline-none appearance-none">
                  {PLATFORMS.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map(opt => (
                  <button type="button" key={opt.value} onClick={() => setForm(f => ({ ...f, category: opt.value }))}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                      form.category === opt.value ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the suspicious behavior you observed..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none resize-none" />
            </div>
            {formError && <p className="text-xs text-red-400">{formError}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white text-sm px-4 py-2 border border-slate-700 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading community reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <Flag size={32} className="text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No reports yet. Be the first to report a suspicious profile.</p>
          </div>
        ) : reports.map(report => {
          const status = statusConfig[report.status];
          return (
            <div key={report.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 flex-shrink-0">
                  {report.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-white">@{report.username}</span>
                    <span className="text-xs text-slate-500 capitalize">{report.platform}</span>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${status.class}`}>
                      {status.icon}{status.label}
                    </span>
                    <RiskBadge level={mockRiskForCategory(report.category)} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 capitalize">
                      {report.category.replace('_', ' ')}
                    </span>
                  </div>
                  {report.description && (
                    <p className="text-xs text-slate-400 leading-relaxed">{report.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleUpvote(report)}
                    disabled={upvoted.has(report.id)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      upvoted.has(report.id)
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                        : 'text-slate-400 border-slate-700 hover:border-cyan-500/30 hover:text-cyan-400'
                    }`}
                  >
                    <ThumbsUp size={11} /> {report.upvotes}
                  </button>
                  <span className="text-xs text-slate-600">
                    {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}