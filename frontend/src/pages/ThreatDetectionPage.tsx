import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  RefreshCw,
  Database,
  Zap,
  Info,
  FileText
} from 'lucide-react';
import {
  ThreatAnalysisRequest,
  ThreatAnalysisResponse,
  ThreatHistoryItem,
} from '../types/detection';
import {
  analyzeThreatApi,
  getThreatHistoryApi,
} from '../services/detectionApi';
import { listSignaturesApi } from '../services/signatureApi';
import { getAttackHistoryApi } from '../services/attackApi';
import { SignatureListItem } from '../types/signature';
import { AttackHistoryItem } from '../types/attack';

export const ThreatDetectionPage: React.FC = () => {
  const [signatures, setSignatures] = useState<SignatureListItem[]>([]);
  const [attackLogs, setAttackLogs] = useState<AttackHistoryItem[]>([]);
  const [targetSigId, setTargetSigId] = useState<string>('');
  const [verifierId, setVerifierId] = useState<string>('bob_verifier_01');
  const [testedMessage, setTestedMessage] = useState<string>('');
  const [selectedAttackId, setSelectedAttackId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<ThreatAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ThreatHistoryItem[]>([]);

  const loadData = async () => {
    try {
      const sigs = await listSignaturesApi();
      setSignatures(sigs);
      if (sigs.length > 0 && !targetSigId) {
        setTargetSigId(sigs[0].signature_id);
        setTestedMessage(sigs[0].message_preview);
      }
      const attacks = await getAttackHistoryApi();
      setAttackLogs(attacks);

      const hist = await getThreatHistoryApi();
      setHistory(hist);
    } catch (err) {
      console.error('Failed to load detection dependencies', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectSignature = (sigId: string) => {
    setTargetSigId(sigId);
    const found = signatures.find((s) => s.signature_id === sigId);
    if (found) {
      setTestedMessage(found.message_preview);
    }
  };

  const handleSelectAttackScenario = (attId: string) => {
    setSelectedAttackId(attId);
    const found = attackLogs.find((a) => a.attack_id === attId);
    if (found) {
      setTargetSigId(found.target_signature_id);
    }
  };

  const handleAnalyze = async () => {
    if (!targetSigId) {
      setError('Please select a target signature first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: ThreatAnalysisRequest = {
        signature_id: targetSigId,
        verifier_id: verifierId,
        tested_message: testedMessage.trim() ? testedMessage : undefined,
        attack_context_id: selectedAttackId.trim() ? selectedAttackId : undefined,
      };
      const res = await analyzeThreatApi(payload);
      setVerdict(res.data);
      const hist = await getThreatHistoryApi();
      setHistory(hist);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Threat analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTamperMessage = () => {
    setTestedMessage(
      'TAMPERED_FORGED_PAYLOAD: Divert $1,000,000 to Attacker Node #99.'
    );
    setSelectedAttackId('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-cyan-500/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono mb-3">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Part 6: Deterministic Threat Detection Engine (Zero AI/ML)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Quantum-Inspired <span className="text-gradient-cyan">Cyber Threat Detection Engine</span>
            </h1>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              Real-time mathematical analysis of teleported quantum states, Total Variation Distance (D_TV), state fidelity (F), QBER violations, and binomial forgery bounds. Strictly zero AI/ML.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAnalyze}
              disabled={loading || !targetSigId}
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Evaluating Quantum Invariants...' : 'Run Quantum Threat Analysis'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-950/40 border border-rose-800 p-4 text-rose-200 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Target Selection & Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Target Selection (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2 mb-3">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>1. Target Selection</span>
            </h2>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Signature:</label>
                <select
                  value={targetSigId}
                  onChange={(e) => handleSelectSignature(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {signatures.map((s) => (
                    <option key={s.signature_id} value={s.signature_id}>
                      {s.signature_id} ({s.signer_id} - {s.token_count} Qubits)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400">Forensic Attack Scenario (Optional):</label>
                  {selectedAttackId && (
                    <button
                      type="button"
                      onClick={() => setSelectedAttackId('')}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <select
                  value={selectedAttackId}
                  onChange={(e) => handleSelectAttackScenario(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- None (Analyze Direct Message/Signature) --</option>
                  {attackLogs.map((a) => (
                    <option key={a.attack_id} value={a.attack_id}>
                      {a.attack_id} ({a.attack_type.toUpperCase()} - {a.attacker_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Verifier Identity:</label>
                <input
                  type="text"
                  value={verifierId}
                  onChange={(e) => setVerifierId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold block mb-1">AI/ML Prohibition Guarantee:</span>
            <span>All threat classifications are computed deterministically via quantum physics rules and probability metrics.</span>
          </div>
        </div>

        {/* Right: Message Inspector & Custom Payloads (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>2. Message Content Under Analysis</span>
            </h2>
            <button
              type="button"
              onClick={handleTamperMessage}
              className="text-[11px] px-2.5 py-1 rounded bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900 font-mono transition-all"
            >
              Simulate Forged Payload
            </button>
          </div>

          <div>
            <textarea
              rows={4}
              value={testedMessage}
              onChange={(e) => setTestedMessage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="Message content to evaluate..."
            />
          </div>

          {/* Threshold Specs Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Max QBER:</span>
              <strong className="text-cyan-400">15.0%</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Max TVD (D_TV):</span>
              <strong className="text-cyan-400">0.120</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Min Fidelity (F):</span>
              <strong className="text-cyan-400">85.0%</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Replay Window:</span>
              <strong className="text-cyan-400">300s</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Detection Verdict Banner & Mathematical Indicators */}
      {verdict && (
        <div
          className={`glass-panel rounded-xl p-6 border transition-all space-y-6 ${
            verdict.status === 'LEGITIMATE'
              ? 'border-emerald-800/80 bg-emerald-950/15'
              : 'border-rose-800/80 bg-rose-950/15'
          }`}
        >
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-xl border ${
                  verdict.status === 'LEGITIMATE'
                    ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                    : 'bg-rose-950 border-rose-800 text-rose-400'
                }`}
              >
                {verdict.status === 'LEGITIMATE' ? (
                  <ShieldCheck className="w-8 h-8" />
                ) : (
                  <ShieldAlert className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-extrabold text-white">
                    {verdict.status === 'LEGITIMATE'
                      ? 'SIGNATURE VERIFIED LEGITIMATE (ACCEPTED)'
                      : `THREAT DETECTED: ${verdict.attack_type}`}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold ${
                      verdict.status === 'LEGITIMATE'
                        ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                        : 'bg-rose-950 border-rose-700 text-rose-300'
                    }`}
                  >
                    Threat Score: {(verdict.threat_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-mono">
                  Analysis ID: <strong>{verdict.analysis_id}</strong> &bull; Target: <code className="text-white">{verdict.signature_id}</code>
                </p>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-300">
              <div>Verdict: <strong className={verdict.status === 'LEGITIMATE' ? 'text-emerald-400' : 'text-rose-400'}>{verdict.status}</strong></div>
              <div>Classification: <strong className="text-cyan-300">{verdict.attack_type}</strong></div>
            </div>
          </div>

          {/* 4 Quantitative Physical Metric Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            {/* 1. TVD */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Total Variation Distance (D_TV)</span>
              <div className="flex items-baseline space-x-2">
                <span className={`text-xl font-extrabold ${verdict.deviation > 0.12 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {verdict.deviation.toFixed(3)}
                </span>
                <span className="text-[11px] text-slate-500">/ max 0.120</span>
              </div>
              <div className="text-[10px] text-slate-400">Statistical 4-Sigma Overlap</div>
            </div>

            {/* 2. Fidelity */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Quantum State Fidelity (F)</span>
              <div className="flex items-baseline space-x-2">
                <span className={`text-xl font-extrabold ${verdict.fidelity < 0.85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(verdict.fidelity * 100).toFixed(1)}%
                </span>
                <span className="text-[11px] text-slate-500">/ min 85%</span>
              </div>
              <div className="text-[10px] text-slate-400">Bhattacharyya Metric</div>
            </div>

            {/* 3. QBER */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Quantum Bit Error Rate (QBER)</span>
              <div className="flex items-baseline space-x-2">
                <span className={`text-xl font-extrabold ${verdict.qber > 0.15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(verdict.qber * 100).toFixed(1)}%
                </span>
                <span className="text-[11px] text-slate-500">/ max 15%</span>
              </div>
              <div className="text-[10px] text-slate-400">Projective Measurement Error</div>
            </div>

            {/* 4. Forgery Probability */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Forgery Confidence (P_forge)</span>
              <div className="flex items-baseline space-x-2">
                <span className={`text-xl font-extrabold ${verdict.forgery_probability > 0.50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(verdict.forgery_probability * 100).toFixed(1)}%
                </span>
                <span className="text-[11px] text-slate-500">
                  bound: {(verdict.telemetry.theoretical_forgery_bound * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Binomial No-Cloning Bound</div>
            </div>
          </div>

          {/* Explainable Evidence Reasoning List */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center space-x-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Transparent Audit Evidence & Reasoning (Deterministic Physics Invariants)</span>
            </h4>
            <ol className="space-y-2 text-xs font-mono text-slate-300">
              {verdict.evidence.map((item, index) => (
                <li key={index} className="flex items-start space-x-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 text-[10px] font-bold">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Threat Detection History Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Threat Detection Audit Log ({history.length} Evaluations Stored)</span>
          </h2>
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-400 flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {history.length === 0 ? (
          <div className="glass-panel rounded-xl p-6 text-center border border-slate-800 text-xs font-mono text-slate-400">
            No threat detection analyses executed yet.
          </div>
        ) : (
          <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Analysis ID</th>
                    <th className="py-3 px-4">Signature ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Threat Classification</th>
                    <th className="py-3 px-4">Threat Score</th>
                    <th className="py-3 px-4">QBER</th>
                    <th className="py-3 px-4">Deviation (D_TV)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((h) => (
                    <tr key={h.analysis_id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 text-cyan-300 font-bold">{h.analysis_id}</td>
                      <td className="py-3 px-4 text-slate-400">{h.signature_id}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                            h.status === 'LEGITIMATE'
                              ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                              : 'bg-rose-950 border-rose-800 text-rose-400'
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-bold">{h.attack_type}</td>
                      <td className="py-3 px-4 text-slate-300">{(h.threat_score * 100).toFixed(0)}%</td>
                      <td className="py-3 px-4 text-slate-300">{(h.qber * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 text-slate-300">{h.deviation.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
