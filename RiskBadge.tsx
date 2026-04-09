import type { RiskLevel } from '../../types';

interface Props {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

const configs: Record<RiskLevel, { label: string; classes: string }> = {
  low: { label: 'LOW RISK', classes: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
  medium: { label: 'MEDIUM RISK', classes: 'bg-amber-500/20 text-amber-400 border border-amber-500/40' },
  high: { label: 'HIGH RISK', classes: 'bg-orange-500/20 text-orange-400 border border-orange-500/40' },
  critical: { label: 'CRITICAL', classes: 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' },
};

const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-xs px-2.5 py-1', lg: 'text-sm px-3 py-1.5' };

export default function RiskBadge({ level, score, size = 'md' }: Props) {
  const { label, classes } = configs[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded font-bold tracking-wider ${classes} ${sizes[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        level === 'critical' ? 'bg-red-400' :
        level === 'high' ? 'bg-orange-400' :
        level === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
      }`} />
      {label}
      {score !== undefined && <span className="opacity-70">({score})</span>}
    </span>
  );
}