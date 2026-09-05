import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  AlertTriangle,
  X,
  RefreshCw,
  Award,
} from 'lucide-react';
import { apiClient } from '../services/api';

interface StepResult {
  step_number: number;
  step_name: string;
  description: string;
  status: string;
  verdict: string;
  threat_classification?: string;
  threat_score?: number;
  execution_time_ms: number;
  telemetry: any;
}

interface DemoResponse {
  status: string;
  total_steps: number;
  total_duration_ms: number;
  overall_detection_rate: number;
  false_positive_rate: number;
  false_negative_rate: number;
  shots_processed_total: number;
  steps: StepResult[];
}

interface SecurityDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinished?: () => void;
}

export const SecurityDemoModal: React.FC<SecurityDemoModalProps> = ({
  isOpen,
  onClose,
  onFinished,
}) => {
  const [running, setRunning] = useState<boolean>(false);
  const [demoData, setDemoData] = useState<DemoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunDemo = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await apiClient.post<DemoResponse>('/api/demo/run');
      setDemoData(res.data);
      if (onFinished) onFinished();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Demo execution failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-border p-6 sm:p-8 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-yellow-100 border border-yellow-300 text-charcoal">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-charcoal">Security Workflow Demo</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-50 border border-yellow-200 text-charcoal font-mono font-semibold">
                  7-Step End-to-End Orchestration
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Automated scenario demonstrating signature creation, acceptance, and 5-vector threat neutralization.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-secondary hover:text-charcoal hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Trigger */}
        {!demoData && !running && (
          <div className="p-8 rounded-xl bg-surface border border-border text-center space-y-4">
            <p className="text-xs text-secondary max-w-xl mx-auto leading-relaxed">
              Click below to execute the complete verification scenario: Alice signs &rarr; Bob accepts &rarr; 5 cyber attack scenarios simulated and mathematically classified in real-time.
            </p>
            <button
              onClick={handleRunDemo}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-charcoal font-bold text-sm shadow-sm transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Automated Security Demo</span>
            </button>
          </div>
        )}

        {running && (
          <div className="p-12 text-center space-y-3 font-mono">
            <RefreshCw className="w-8 h-8 animate-spin text-yellow-500 mx-auto" />
            <div className="text-sm text-charcoal font-bold">Executing 7-Step Quantum Security Orchestration...</div>
            <div className="text-xs text-secondary">Teleporting quantum states & measuring projective invariants</div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Execution Steps Stream */}
        {demoData && (
          <div className="space-y-6">
            {/* Top Scorecard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-surface border border-border">
                <span className="text-secondary text-[10px] uppercase block font-sans">Steps Executed</span>
                <span className="text-lg font-bold text-charcoal">{demoData.total_steps} / 7 Steps</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface border border-border">
                <span className="text-secondary text-[10px] uppercase block font-sans">Total Duration</span>
                <span className="text-lg font-bold text-charcoal">{demoData.total_duration_ms.toFixed(1)} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface border border-border">
                <span className="text-secondary text-[10px] uppercase block font-sans">Threats Neutralized</span>
                <span className="text-lg font-bold text-emerald-600">
                  {(demoData.overall_detection_rate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface border border-border">
                <span className="text-secondary text-[10px] uppercase block font-sans">Processed Shots</span>
                <span className="text-lg font-bold text-charcoal">{demoData.shots_processed_total.toLocaleString()}</span>
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {demoData.steps.map((step) => {
                const isAccept = step.verdict === 'ACCEPTED' || step.verdict === 'GENERATED';
                return (
                  <div
                    key={step.step_number}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs ${
                      isAccept
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-red-50/40 border-red-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${
                          isAccept
                            ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                            : 'bg-red-100 border-red-200 text-red-700'
                        }`}
                      >
                        {isAccept ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-secondary font-bold text-[10px]">STEP {step.step_number}:</span>
                          <span className="font-bold text-charcoal text-sm">{step.step_name}</span>
                        </div>
                        <p className="text-secondary text-[11px] font-sans mt-0.5">{step.description}</p>
                        {step.telemetry?.evidence && (
                          <p className="text-secondary text-[10px] mt-1 font-mono bg-white p-1.5 rounded-lg border border-border">
                            Evidence: {step.telemetry.evidence}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                          isAccept
                            ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                            : 'bg-red-100 border-red-200 text-red-700'
                        }`}
                      >
                        {step.verdict}
                      </span>
                      <span className="text-secondary text-[10px] block mt-1">{step.execution_time_ms} ms</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <button
                onClick={handleRunDemo}
                disabled={running}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-yellow-50 border border-border text-charcoal text-xs font-semibold flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-run Security Demo</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-charcoal font-bold text-xs transition-colors shadow-sm"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
