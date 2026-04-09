import { LayoutDashboard, Search, Network, FolderOpen, Rss, Flag, Shield } from 'lucide-react';
import type { Page } from '../../types';

interface Props {
  current: Page;
  onChange: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'analyzer', label: 'Profile Analyzer', icon: <Search size={18} />, badge: 'NEW' },
  { id: 'network', label: 'Network Map', icon: <Network size={18} /> },
  { id: 'investigations', label: 'Investigations', icon: <FolderOpen size={18} /> },
  { id: 'threat-intel', label: 'Threat Intel', icon: <Rss size={18} /> },
  { id: 'reports', label: 'Community Reports', icon: <Flag size={18} /> },
];

export default function Sidebar({ current, onChange }: Props) {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col min-h-screen">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Shield size={18} className="text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">PHANTOM</div>
            <div className="text-xs text-slate-500">OSINT Intelligence</div>
          </div>
        </div>
      </div>

      <div className="px-3 py-4 flex-1">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">Navigation</div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                current === item.id
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className={current === item.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}>
                {item.icon}
              </span>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              {item.badge && (
                <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded font-bold tracking-wide">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">System Online</span>
          </div>
          <div className="text-xs text-slate-600">OSINT Engine v2.4.1</div>
          <div className="text-xs text-slate-600">Threat DB: Active</div>
        </div>
      </div>
    </aside>
  );
}