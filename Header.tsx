import { Bell, Activity, Menu } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, subtitle, onMenuToggle }: Props) {
  const now = new Date().toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm flex items-center px-6 gap-4">
      {onMenuToggle && (
        <button onClick={onMenuToggle} className="text-slate-400 hover:text-slate-200 lg:hidden">
          <Menu size={20} />
        </button>
      )}
      <div className="flex-1">
        <h1 className="text-sm font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
          <Activity size={13} className="text-cyan-500" />
          <span>Live OSINT Feed</span>
        </div>
        <div className="text-xs text-slate-600 hidden md:block">{now}</div>
        <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">3</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
          <span className="text-cyan-400 text-xs font-bold">A</span>
        </div>
      </div>
    </header>
  );
}