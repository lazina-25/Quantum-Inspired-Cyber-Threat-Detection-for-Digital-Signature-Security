import React, { createContext, useContext, useState, useCallback } from 'react';
import { ShieldAlert, X, ShieldCheck, Zap } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  statusBadge?: string;
  statusType?: 'success' | 'warning' | 'danger' | 'info';
  details?: { label: string; value: string }[];
  durationMs?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  notifySignatureGenerated: (sigId: string) => void;
  notifyInitialVerification: (sigId: string, status: string, qber: number) => void;
  notifyAttackSimulation: (attackType: string, targetSession: string, status: string) => void;
  notifyPostAttackVerification: (verificationResult: string, measurementStatus: string) => void;
  notifyThreatAnalysis: (threatStatus: string, attackType: string, detectionResult: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [recentKeys, setRecentKeys] = useState<Set<string>>(new Set());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    // Prevent duplicate toast spam if identical title shown in last 1.5s
    const dedupeKey = `${toast.title}-${toast.statusBadge || ''}`;
    if (recentKeys.has(dedupeKey)) {
      return;
    }

    setRecentKeys((prev) => {
      const next = new Set(prev);
      next.add(dedupeKey);
      return next;
    });

    setTimeout(() => {
      setRecentKeys((prev) => {
        const next = new Set(prev);
        next.delete(dedupeKey);
        return next;
      });
    }, 1500);

    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newToast: ToastItem = { ...toast, id };

    setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts visible

    const timeout = toast.durationMs ?? 4500;
    setTimeout(() => {
      removeToast(id);
    }, timeout);
  }, [recentKeys, removeToast]);

  const notifySignatureGenerated = useCallback((sigId: string) => {
    showToast({
      title: 'Signature Generated',
      message: 'Quantum digital signature created successfully.',
      statusBadge: '✓ Completed',
      statusType: 'success',
      details: [
        { label: 'Session ID', value: sigId.length > 18 ? `${sigId.slice(0, 16)}...` : sigId },
      ],
      durationMs: 4000,
    });
  }, [showToast]);

  const notifyInitialVerification = useCallback((_sigId: string, status: string, qber: number) => {
    showToast({
      title: 'Initial Verification Complete',
      message: 'Signature verified successfully before attack simulation.',
      statusBadge: `✓ ${status}`,
      statusType: 'success',
      details: [
        { label: 'Integrity', value: '100% Match' },
        { label: 'Quantum Error (QBER)', value: `${(qber * 100).toFixed(1)}%` },
      ],
      durationMs: 4500,
    });
  }, [showToast]);

  const notifyAttackSimulation = useCallback((attackType: string, targetSession: string, status: string) => {
    showToast({
      title: 'Attack Simulation Complete',
      message: 'Selected attack scenario has been executed.',
      statusBadge: status,
      statusType: 'warning',
      details: [
        { label: 'Attack Type', value: attackType.toUpperCase().replace('_', ' ') },
        { label: 'Simulation Status', value: status },
        { label: 'Target Session', value: targetSession.length > 16 ? `${targetSession.slice(0, 14)}...` : targetSession },
      ],
      durationMs: 5000,
    });
  }, [showToast]);

  const notifyPostAttackVerification = useCallback((verificationResult: string, measurementStatus: string) => {
    const isRejected = verificationResult.toUpperCase().includes('REJECTED');
    showToast({
      title: 'Post-Attack Verification Complete',
      message: 'Signature verified again following simulated adversarial interference.',
      statusBadge: verificationResult,
      statusType: isRejected ? 'danger' : 'success',
      details: [
        { label: 'Verification Result', value: verificationResult },
        { label: 'Measurement Status', value: measurementStatus },
      ],
      durationMs: 5000,
    });
  }, [showToast]);

  const notifyThreatAnalysis = useCallback((threatStatus: string, attackType: string, detectionResult: string) => {
    const isThreat = threatStatus.toUpperCase().includes('ATTACK') || threatStatus.toUpperCase().includes('THREAT');
    showToast({
      title: 'Threat Analysis Complete',
      message: 'Forensic evaluation completed against deterministic quantum thresholds.',
      statusBadge: threatStatus,
      statusType: isThreat ? 'danger' : 'success',
      details: [
        { label: 'Threat Status', value: threatStatus },
        ...(isThreat ? [{ label: 'Attack Type', value: attackType.toUpperCase().replace('_', ' ') }] : []),
        { label: 'Detection Result', value: detectionResult },
      ],
      durationMs: 5500,
    });
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        notifySignatureGenerated,
        notifyInitialVerification,
        notifyAttackSimulation,
        notifyPostAttackVerification,
        notifyThreatAnalysis,
      }}
    >
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isWarning = toast.statusType === 'warning';
          const isDanger = toast.statusType === 'danger';

          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-white border border-border rounded-2xl shadow-xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
              style={{
                borderLeftWidth: '5px',
                borderLeftColor: isDanger
                  ? '#EF4444'
                  : isWarning
                  ? '#F5C400'
                  : '#10B981',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDanger
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : isWarning
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}
                  >
                    {isDanger ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : isWarning ? (
                      <Zap className="w-4 h-4 text-amber-500" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal">{toast.title}</h4>
                    {toast.message && (
                      <p className="text-xs text-secondary mt-0.5 leading-relaxed">{toast.message}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-secondary hover:text-charcoal p-1 rounded-lg hover:bg-surface transition-colors flex-shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {toast.statusBadge && (
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isDanger
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : isWarning
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {toast.statusBadge}
                  </span>
                </div>
              )}

              {toast.details && toast.details.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-border/60 grid grid-cols-2 gap-2 text-xs">
                  {toast.details.map((d, idx) => (
                    <div key={idx} className="bg-surface/70 px-2 py-1.5 rounded-lg border border-border/40">
                      <span className="block text-[10px] uppercase font-bold text-secondary tracking-wider">
                        {d.label}
                      </span>
                      <span className="font-semibold text-charcoal truncate block font-mono text-[11px]">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
