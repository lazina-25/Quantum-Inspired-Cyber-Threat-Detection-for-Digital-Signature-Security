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
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-yellow-100 border border-yellow-200 text-charcoal">
              <Icon className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-bold text-charcoal text-sm">{name}</h4>
              <span className="text-[11px] text-secondary font-medium">{phase}</span>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-medium flex items-center space-x-1 ${
              ready
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            {ready ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Operational</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>{status}</span>
              </>
            )}
          </span>
        </div>
        <p className="text-xs text-secondary leading-relaxed">{description}</p>
      </div>

      {metric && (
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
          <span className="text-secondary">Target Metric:</span>
          <span className="font-mono text-charcoal bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-200 font-semibold">
            {metric}
          </span>
        </div>
      )}
    </div>
  );
};
