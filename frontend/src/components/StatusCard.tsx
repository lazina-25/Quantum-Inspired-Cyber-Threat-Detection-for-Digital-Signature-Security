import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
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
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-yellow-100 border-yellow-300 text-charcoal',
    error: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">{title}</p>
          <h3 className="text-2xl font-extrabold text-charcoal mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-secondary mt-1">{subtitle}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-yellow-100 border border-yellow-200 text-charcoal">
          <Icon className="w-5 h-5 text-yellow-600" />
        </div>
      </div>
      {badgeText && (
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border font-mono ${badgeStyles[badgeType]}`}>
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
};
