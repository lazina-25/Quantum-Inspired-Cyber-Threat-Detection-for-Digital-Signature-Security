import React from 'react';
import {
  KeyRound,
  ShieldCheck,
  Skull,
  ShieldAlert,
  SearchCheck,
  TrendingUp,
  Check,
  Lock,
} from 'lucide-react';
import { NavTab } from './Navbar';

export interface WorkflowState {
  signatureId?: string;
  signerId?: string;
  message?: string;
  initialVerificationDone?: boolean;
  initialVerificationStatus?: string; // 'ACCEPTED' | 'LEGITIMATE'
  attackExecuted?: boolean;
  attackId?: string;
  attackType?: string;
  postAttackVerificationDone?: boolean;
  postAttackVerificationStatus?: string; // 'REJECTED' | 'ACCEPTED'
  threatDetectionDone?: boolean;
  threatVerdictStatus?: string; // 'LEGITIMATE' | 'ATTACK'
}

interface SecurityWorkflowStepperProps {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  onNavigate: (tab: NavTab) => void;
  workflow: WorkflowState;
}

export const SecurityWorkflowStepper: React.FC<SecurityWorkflowStepperProps> = ({
  currentStep,
  onNavigate,
  workflow,
}) => {
  const {
    signatureId,
    initialVerificationDone,
    attackExecuted,
    attackType,
    postAttackVerificationDone,
    postAttackVerificationStatus,
    threatDetectionDone,
    threatVerdictStatus,
  } = workflow;

  // Prerequisites logic
  const stepPrereqs: Record<number, boolean> = {
    1: true, // Signature Generation always accessible
    2: Boolean(signatureId), // Initial Verification requires signature
    3: Boolean(signatureId && initialVerificationDone), // Attack Simulator requires initial verification
    4: Boolean(signatureId && initialVerificationDone), // Post-attack verification available after initial verif (either after attack or to verify clean)
    5: Boolean(signatureId && initialVerificationDone && (postAttackVerificationDone || !attackExecuted)), // Threat detection
    6: Boolean(signatureId && initialVerificationDone), // Analysis
  };

  const steps = [
    {
      step: 1,
      tab: 'signatures' as NavTab,
      label: 'Digital Signature',
      subtitle: 'Generation',
      icon: KeyRound,
      isCompleted: Boolean(signatureId),
      badgeText: signatureId ? `${signatureId.substring(0, 10)}...` : undefined,
    },
    {
      step: 2,
      tab: 'signatures' as NavTab,
      label: 'Initial Verification',
      subtitle: 'Pre-Attack Clean State',
      icon: ShieldCheck,
      isCompleted: Boolean(initialVerificationDone),
      badgeText: initialVerificationDone ? '✓ LEGITIMATE' : undefined,
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      step: 3,
      tab: 'attacks' as NavTab,
      label: 'Attack Simulation',
      subtitle: attackExecuted ? `${attackType?.toUpperCase().replace('_', ' ')}` : 'Adversarial Test',
      icon: Skull,
      isCompleted: Boolean(attackExecuted),
      badgeText: attackExecuted ? (attackType ? attackType.toUpperCase().replace('_', ' ') : 'EXECUTED') : 'NONE',
      badgeColor: attackExecuted ? 'text-amber-800 bg-amber-50 border-amber-300' : 'text-secondary bg-surface border-[#EAEAEA]',
    },
    {
      step: 4,
      tab: 'attacks' as NavTab,
      label: 'Post-Attack Verification',
      subtitle: 'Second Verification',
      icon: SearchCheck,
      isCompleted: Boolean(postAttackVerificationDone),
      badgeText: postAttackVerificationDone
        ? postAttackVerificationStatus === 'REJECTED'
          ? '⚠ CHANGED (REJECTED)'
          : '✓ LEGITIMATE'
        : undefined,
      badgeColor:
        postAttackVerificationStatus === 'REJECTED'
          ? 'text-red-700 bg-red-50 border-red-200'
          : 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      step: 5,
      tab: 'detection' as NavTab,
      label: 'Threat Detection',
      subtitle: 'Deterministic Invariants',
      icon: ShieldAlert,
      isCompleted: Boolean(threatDetectionDone),
      badgeText: threatDetectionDone
        ? threatVerdictStatus === 'ATTACK'
          ? '⚠ THREAT DETECTED'
          : '✓ NO THREAT'
        : undefined,
      badgeColor:
        threatVerdictStatus === 'ATTACK'
          ? 'text-red-700 bg-red-50 border-red-200'
          : 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      step: 6,
      tab: 'analytics' as NavTab,
      label: 'Analysis & Telemetry',
      subtitle: 'Physics Visuals',
      icon: TrendingUp,
      isCompleted: false,
      badgeText: undefined,
      badgeColor: undefined,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAEAEA] shadow-sm mb-6">
      {/* Header & Active Session Context Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#EAEAEA]">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-secondary uppercase block">
            End-to-End Quantum Security Protocol
          </span>
          <h2 className="text-sm font-extrabold text-charcoal flex items-center gap-2 mt-0.5">
            <span>Security Workflow Pipeline</span>
            <span className="text-xs font-semibold text-charcoal bg-yellow-400 px-2 py-0.5 rounded-full">
              STEP {currentStep} OF 6
            </span>
          </h2>
        </div>

        {/* Dynamic Context Status Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface border border-[#EAEAEA]">
            <span className="text-secondary font-medium">TARGET SESSION:</span>
            <span className="font-mono font-bold text-charcoal">
              {signatureId ? signatureId.substring(0, 14) : 'None (Step 1)'}
            </span>
          </div>

          {initialVerificationDone && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              <span>Initial:</span>
              <span>✓ LEGITIMATE</span>
            </div>
          )}

          {signatureId && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-semibold ${
                attackExecuted
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-surface border-[#EAEAEA] text-secondary'
              }`}
            >
              <span>Attack:</span>
              <span>{attackExecuted ? (attackType ? attackType.toUpperCase().replace('_', ' ') : 'EXECUTED') : 'NONE'}</span>
            </div>
          )}

          {postAttackVerificationDone && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-semibold ${
                postAttackVerificationStatus === 'REJECTED'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <span>Post-Attack:</span>
              <span>{postAttackVerificationStatus === 'REJECTED' ? '⚠ Changed' : '✓ Legitimate'}</span>
            </div>
          )}
        </div>
      </div>

      {/* 6-Step Visual Workflow Indicator */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {steps.map((s) => {
          const isCurrent = currentStep === s.step;
          const isCompleted = s.isCompleted;
          const isAllowed = stepPrereqs[s.step];
          const Icon = s.icon;

          return (
            <button
              key={s.step}
              onClick={() => {
                if (isAllowed) {
                  onNavigate(s.tab);
                }
              }}
              disabled={!isAllowed}
              title={!isAllowed ? 'Complete prerequisite steps first' : `Go to Step ${s.step}: ${s.label}`}
              className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between relative group ${
                isCurrent
                  ? 'bg-yellow-50 border-yellow-400 shadow-sm ring-2 ring-yellow-400'
                  : isCompleted
                  ? 'bg-surface/80 border-[#EAEAEA] hover:border-yellow-400 cursor-pointer'
                  : isAllowed
                  ? 'bg-white border-[#EAEAEA] hover:border-border cursor-pointer'
                  : 'bg-surface/40 border-border/40 opacity-50 cursor-not-allowed'
              }`}
            >
              <div>
                {/* Step number badge & icon */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 transition-colors ${
                      isCurrent
                        ? 'bg-yellow-400 text-charcoal'
                        : isCompleted
                        ? 'bg-yellow-400 text-charcoal'
                        : isAllowed
                        ? 'bg-surface border border-[#EAEAEA] text-secondary'
                        : 'bg-surface/60 border border-border/30 text-secondary/60'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 text-charcoal stroke-[3]" /> : s.step}
                  </div>

                  {!isAllowed ? (
                    <Lock className="w-3.5 h-3.5 text-secondary/50" />
                  ) : (
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isCurrent ? 'text-charcoal' : isCompleted ? 'text-yellow-600' : 'text-secondary'
                      }`}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-secondary uppercase block tracking-wider">
                    STEP {s.step}
                  </span>
                  <h4 className="text-xs font-bold text-charcoal truncate mt-0.5">{s.label}</h4>
                  <p className="text-[10px] text-secondary mt-0.5 truncate">{s.subtitle}</p>
                </div>
              </div>

              {s.badgeText && (
                <div className="mt-2 pt-1.5 border-t border-border/50">
                  <span
                    className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border inline-block truncate max-w-full ${
                      s.badgeColor || 'bg-white border-[#EAEAEA] text-charcoal'
                    }`}
                  >
                    {s.badgeText}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
