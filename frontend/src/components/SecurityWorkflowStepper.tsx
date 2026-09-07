import React from 'react';
import { KeyRound, Skull, ShieldAlert, TrendingUp, Check, ArrowRight } from 'lucide-react';
import { NavTab } from './Navbar';

interface SecurityWorkflowStepperProps {
  currentStep: 1 | 2 | 3 | 4;
  onNavigate: (tab: NavTab) => void;
  signatureId?: string;
  attackId?: string;
  attackType?: string;
}

export const SecurityWorkflowStepper: React.FC<SecurityWorkflowStepperProps> = ({
  currentStep,
  onNavigate,
  signatureId,
  attackId,
  attackType,
}) => {
  const steps = [
    {
      step: 1,
      tab: 'signatures' as NavTab,
      label: 'Digital Signature',
      description: 'Create & Verify',
      icon: KeyRound,
      badge: signatureId ? `ID: ${signatureId.substring(0, 12)}...` : undefined,
    },
    {
      step: 2,
      tab: 'attacks' as NavTab,
      label: 'Attack Simulator',
      description: 'Test Threat Vectors',
      icon: Skull,
      badge: attackType ? attackType.toUpperCase().replace('_', ' ') : undefined,
    },
    {
      step: 3,
      tab: 'detection' as NavTab,
      label: 'Threat Detection',
      description: 'Statistical & Physics Analysis',
      icon: ShieldAlert,
      badge: attackId ? `Att: ${attackId.substring(0, 12)}...` : undefined,
    },
    {
      step: 4,
      tab: 'analytics' as NavTab,
      label: 'Analysis & Telemetry',
      description: 'System-Wide Insights',
      icon: TrendingUp,
      badge: undefined,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAEAEA] shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#EAEAEA]">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-secondary uppercase block">
            End-to-End Security Pipeline
          </span>
          <h2 className="text-sm font-extrabold text-charcoal flex items-center gap-2 mt-0.5">
            <span>Security Workflow</span>
            <span className="text-xs font-normal text-secondary font-mono">
              Step {currentStep} of 4
            </span>
          </h2>
        </div>

        {(signatureId || attackId) && (
          <div className="flex items-center gap-2 text-[11px] font-mono bg-surface px-3 py-1.5 rounded-xl border border-[#EAEAEA]">
            <span className="text-secondary">Context:</span>
            {signatureId && (
              <span className="font-semibold text-charcoal bg-yellow-100 px-2 py-0.5 rounded border border-yellow-200">
                Sig: {signatureId.substring(0, 10)}
              </span>
            )}
            {attackType && (
              <span className="font-semibold text-charcoal bg-yellow-100 px-2 py-0.5 rounded border border-yellow-200">
                {attackType.toUpperCase().replace('_', ' ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Responsive Stepper: Horizontal on Desktop, Grid on Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((s, idx) => {
          const isCurrent = currentStep === s.step;
          const isCompleted = currentStep > s.step;
          const Icon = s.icon;

          return (
            <button
              key={s.step}
              onClick={() => onNavigate(s.tab)}
              className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 relative group ${
                isCurrent
                  ? 'bg-yellow-50 border-yellow-400 shadow-xs ring-1 ring-yellow-400'
                  : isCompleted
                  ? 'bg-surface border-[#EAEAEA] hover:border-yellow-300'
                  : 'bg-white border-[#EAEAEA] hover:border-[#D0D0D0]'
              }`}
            >
              {/* Step indicator number/check */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  isCurrent
                    ? 'bg-yellow-400 text-charcoal'
                    : isCompleted
                    ? 'bg-yellow-400 text-charcoal'
                    : 'bg-surface border border-[#EAEAEA] text-secondary'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 text-charcoal stroke-[3]" /> : s.step}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-charcoal' : 'text-secondary'}`} />
                    <span
                      className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-charcoal' : 'text-charcoal'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-secondary hidden lg:block shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <p className="text-[11px] text-secondary mt-0.5 truncate">{s.description}</p>
                {s.badge && (
                  <span className="inline-block mt-1.5 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white border border-[#EAEAEA] text-charcoal">
                    {s.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
