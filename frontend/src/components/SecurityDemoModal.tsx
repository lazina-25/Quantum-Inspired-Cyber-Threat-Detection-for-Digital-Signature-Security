import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  AlertTriangle,
  X,
  RefreshCw,
  Award
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl glass-panel border border-cyan-500/40 p-6 sm:p-8 space-y-6 shadow-2xl my-8 bg-[#090e1a]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white">SIH 2026 Judge Security Demo</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono">
                  Full 7-Step Orchestration
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Automated end-to-end verification and 5-vector threat neutralization pass (Zero AI/ML).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Trigger */}
        {!demoData && !running && (
          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
            <p className="text-xs text-slate-300 font-mono max-w-xl mx-auto leading-relaxed">
              Click below to execute the complete verification scenario: Alice signs $\to$ Bob accepts $\to$ 5 simultaneous cyber threats simulated and mathematically classified in real-time.
            </p>
            <button
              onClick={handleRunDemo}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Play className="w-4 h-4" />
              <span>Run Automated Security Demo</span>
            </button>
          </div>
        )}

        {running && (
          <div className="p-12 text-center space-y-3 font-mono">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
            <div className="text-sm text-cyan-300 font-bold">Executing 7-Step Quantum Security Orchestration...</div>
            <div className="text-xs text-slate-500">Teleporting quantum states & measuring projective invariants</div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Execution Steps Stream */}
        {demoData && (
          <div className="space-y-6">
            {/* Top Scorecard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block">Steps Executed</span>
                <span className="text-lg font-black text-white">{demoData.total_steps} / 7 Steps</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block">Total Duration</span>
                <span className="text-lg font-black text-cyan-400">{demoData.total_duration_ms.toFixed(1)} ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block">Threat Detection Rate</span>
                <span className="text-lg font-black text-emerald-400">
                  {(demoData.overall_detection_rate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block">Processed Shots</span>
                <span className="text-lg font-black text-indigo-400">{demoData.shots_processed_total.toLocaleString()}</span>
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
                        ? 'bg-emerald-950/20 border-emerald-800/80'
                        : 'bg-rose-950/20 border-rose-800/80'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${
                          isAccept
                            ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
                            : 'bg-rose-950 border-rose-700 text-rose-400'
                        }`}
                      >
                        {isAccept ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500 font-bold text-[10px]">STEP {step.step_number}:</span>
                          <span className="font-bold text-white text-sm">{step.step_name}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] font-sans mt-0.5">{step.description}</p>
                        {step.telemetry?.evidence && (
                          <p className="text-cyan-300 text-[10px] mt-1 italic font-mono">
                            Evidence: {step.telemetry.evidence}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                          isAccept
                            ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                            : 'bg-rose-950 border-rose-600 text-rose-300'
                        }`}
                      >
                        {step.verdict}
                      </span>
                      <span className="text-slate-500 text-[10px] block mt-1">{step.execution_time_ms} ms</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                onClick={handleRunDemo}
                disabled={running}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 text-xs font-mono flex items-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-run Security Demo</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-mono"
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
