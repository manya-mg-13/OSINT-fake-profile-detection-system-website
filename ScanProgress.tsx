import { useEffect, useState } from 'react';
import { Check, Loader2, Search } from 'lucide-react';

const STEPS = [
  { label: 'Resolving username across platforms', duration: 600 },
  { label: 'Fetching account metadata', duration: 700 },
  { label: 'Running heuristic pattern analysis', duration: 800 },
  { label: 'Cross-referencing OSINT databases', duration: 900 },
  { label: 'Checking dark web data breaches', duration: 700 },
  { label: 'Mapping network connections', duration: 1000 },
  { label: 'Analyzing behavioral patterns', duration: 800 },
  { label: 'Running linguistic analysis', duration: 700 },
  { label: 'Computing risk score', duration: 500 },
  { label: 'Generating intelligence report', duration: 400 },
];

interface Props {
  username: string;
  platform: string;
  onComplete: () => void;
}

export default function ScanProgress({ username, platform, onComplete }: Props) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let step = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const runStep = () => {
      if (step >= STEPS.length) {
        onComplete();
        return;
      }
      setCurrentStep(step);
      timeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, step]);
        step++;
        runStep();
      }, STEPS[step].duration);
    };

    runStep();
    return () => clearTimeout(timeout);
  }, [onComplete]);

  const progress = Math.round((completedSteps.length / STEPS.length) * 100);

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
            <div
              className="absolute inset-0 rounded-full border-2 border-cyan-400 transition-all duration-300"
              style={{
                background: `conic-gradient(#22d3ee ${progress * 3.6}deg, transparent 0deg)`,
                WebkitMask: 'radial-gradient(closest-side, transparent 65%, white 65%)',
                mask: 'radial-gradient(closest-side, transparent 65%, white 65%)',
              }}
            />
            <Search size={24} className="text-cyan-400 animate-pulse" />
          </div>
          <div className="text-4xl font-bold text-cyan-400 tabular-nums">{progress}%</div>
          <div className="text-sm text-slate-400 mt-1">
            Scanning <span className="text-white font-medium">@{username}</span> on{' '}
            <span className="text-white font-medium capitalize">{platform}</span>
          </div>
        </div>

        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-2.5">
          {STEPS.map((step, i) => {
            const done = completedSteps.includes(i);
            const active = currentStep === i && !done;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                  done ? 'text-slate-400' : active ? 'text-white' : 'text-slate-700'
                }`}
              >
                <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                  {done ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : active ? (
                    <Loader2 size={14} className="text-cyan-400 animate-spin" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 block" />
                  )}
                </div>
                {step.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}