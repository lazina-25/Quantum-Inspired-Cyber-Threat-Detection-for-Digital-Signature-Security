import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'error';
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = 'info',
}) => {
  const badgeStyles = {
    success: 'bg-emerald-950/70 border-emerald-800 text-emerald-400',
    warning: 'bg-amber-950/70 border-amber-800 text-amber-400',
    info: 'bg-cyan-950/70 border-cyan-800 text-cyan-400',
    error: 'bg-rose-950/70 border-rose-800 text-rose-400',
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-xl font-bold text-white mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-cyan-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badgeText && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span className={`text-[11px] px-2.5 py-0.5 rounded-md border font-mono ${badgeStyles[badgeType]}`}>
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
};
