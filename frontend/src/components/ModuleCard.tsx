import React from 'react';
import { LucideIcon, CheckCircle2, Clock } from 'lucide-react';

interface ModuleCardProps {
  name: string;
  description: string;
  status: string;
  ready: boolean;
  icon: LucideIcon;
  phase: string;
  metric?: string;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  name,
  description,
  status,
  ready,
  icon: Icon,
  phase,
  metric,
}) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">{name}</h4>
              <span className="text-[11px] text-cyan-400 font-mono">{phase}</span>
            </div>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-mono flex items-center space-x-1 ${
              ready
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400'
                : 'bg-amber-950/60 border-amber-800/80 text-amber-400'
            }`}
          >
            {ready ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Operational</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                <span>{status}</span>
              </>
            )}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>

      {metric && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">Target Metric:</span>
          <span className="font-mono text-cyan-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            {metric}
          </span>
        </div>
      )}
    </div>
  );
};
