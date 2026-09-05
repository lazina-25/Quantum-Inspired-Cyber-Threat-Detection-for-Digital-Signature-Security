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
  FileText,
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
      {/* Page Header */}
      <div className="rounded-2xl bg-white p-6 sm:p-8 border border-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-300 text-charcoal text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5 text-yellow-600" />
              <span>Statistical Threat Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
              Threat Detection
            </h1>
            <p className="mt-2 text-secondary text-sm leading-relaxed">
              Deterministic verification and threshold-based detection of quantum measurement invariants. Evaluates Total Variation Distance (D_TV), state fidelity, and error rates against calibrated thresholds.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAnalyze}
              disabled={loading || !targetSigId}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-charcoal font-bold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing...' : 'Run Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Visual Flow: Measurement -> Statistical Analysis -> Threshold Check -> Decision */}
        <div className="mt-8 pt-6 border-t border-border">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-3">
            Detection Flow
          </span>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-medium text-xs text-center">
            <div className="p-3.5 rounded-xl bg-surface border border-border flex flex-col items-center justify-center">
              <span className="text-charcoal font-bold">1. Measurement</span>
              <span className="text-[11px] text-secondary mt-0.5">Observed Token Counts</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface border border-border flex flex-col items-center justify-center">
              <span className="text-charcoal font-bold">2. Statistical Analysis</span>
              <span className="text-[11px] text-secondary mt-0.5">Empirical vs Expected Distribution</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface border border-border flex flex-col items-center justify-center">
              <span className="text-charcoal font-bold">3. Threshold Check</span>
              <span className="text-[11px] text-secondary mt-0.5">QBER &le; 15%, D_TV &le; 0.120</span>
            </div>
            <div className="p-3.5 rounded-xl bg-yellow-50 border border-yellow-300 text-charcoal flex flex-col items-center justify-center">
              <span className="font-bold">4. Decision</span>
              <span className="text-[11px] text-secondary mt-0.5">Deterministic Verdict</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Target Selection & Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Target Selection (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-charcoal flex items-center space-x-2 mb-3">
              <Database className="w-4 h-4 text-yellow-500" />
              <span>Target Selection</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-secondary font-medium block mb-1">Target Signature:</label>
                <select
                  value={targetSigId}
                  onChange={(e) => handleSelectSignature(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-charcoal font-mono text-xs focus:outline-none focus:border-yellow-400"
                >
                  {signatures.length === 0 ? (
                    <option value="">No signatures found (Create one in Digital Signatures)</option>
                  ) : (
                    signatures.map((s) => (
                      <option key={s.signature_id} value={s.signature_id}>
                        {s.signature_id} ({s.token_count} Qubits - {s.signer_id})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-secondary font-medium block mb-1">Optional Attack Context:</label>
                <select
                  value={selectedAttackId}
                  onChange={(e) => handleSelectAttackScenario(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-charcoal font-mono text-xs focus:outline-none focus:border-yellow-400"
                >
                  <option value="">None (Evaluate signature as submitted)</option>
                  {attackLogs.map((a) => (
                    <option key={a.attack_id} value={a.attack_id}>
                      {a.attack_id} - {a.attack_type.toUpperCase()} (Target: {a.target_signature_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-secondary font-medium block mb-1">Verifier Identity:</label>
                <input
                  type="text"
                  value={verifierId}
                  onChange={(e) => setVerifierId(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-charcoal text-xs font-mono focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-border text-xs text-secondary space-y-1">
            <span className="font-semibold text-charcoal block">Threshold Evaluation:</span>
            <span>Compares observed measurement behavior with the expected distribution to identify anomalies and verify session freshness.</span>
          </div>
        </div>

        {/* Right: Message Content Under Analysis (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-charcoal flex items-center space-x-2">
              <FileText className="w-4 h-4 text-yellow-500" />
              <span>Message Content Under Analysis</span>
            </h2>
            <button
              type="button"
              onClick={handleTamperMessage}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-medium transition-colors"
            >
              Simulate Forged Payload
            </button>
          </div>

          <div>
            <textarea
              rows={4}
              value={testedMessage}
              onChange={(e) => setTestedMessage(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl p-3 text-xs font-mono text-charcoal focus:outline-none focus:border-yellow-400"
              placeholder="Message content to evaluate..."
            />
          </div>

          {/* Threshold Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-secondary block text-[10px] font-sans">Max QBER</span>
              <strong className="text-charcoal font-bold">15.0%</strong>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-secondary block text-[10px] font-sans">Max TVD (D_TV)</span>
              <strong className="text-charcoal font-bold">0.120</strong>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-secondary block text-[10px] font-sans">Min Fidelity</span>
              <strong className="text-charcoal font-bold">85.0%</strong>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-border">
              <span className="text-secondary block text-[10px] font-sans">Replay Window</span>
              <strong className="text-charcoal font-bold">300s</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Detection Verdict Card */}
      {verdict && (
        <div
          className={`bg-white rounded-2xl p-6 border transition-all space-y-6 shadow-sm ${
            verdict.status === 'LEGITIMATE'
              ? 'border-emerald-300'
              : 'border-red-300'
          }`}
        >
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-xl border ${
                  verdict.status === 'LEGITIMATE'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}
              >
                {verdict.status === 'LEGITIMATE' ? (
                  <ShieldCheck className="w-7 h-7" />
                ) : (
                  <ShieldAlert className="w-7 h-7" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-charcoal">
                    {verdict.status === 'LEGITIMATE'
                      ? 'Signature Verified'
                      : `Threat Detected: ${verdict.attack_type.replace(/_/g, ' ')}`}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold font-mono ${
                      verdict.status === 'LEGITIMATE'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    Threat Score: {(verdict.threat_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-secondary mt-0.5 font-mono">
                  Analysis ID: <strong>{verdict.analysis_id}</strong> &bull; Target: {verdict.signature_id}
                </p>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-secondary">
              <div>Verdict: <strong className={verdict.status === 'LEGITIMATE' ? 'text-emerald-700' : 'text-red-700'}>{verdict.status}</strong></div>
              <div>Threat Type: <strong className="text-charcoal">{verdict.attack_type}</strong></div>
            </div>
          </div>

          {/* Observed vs Expected vs Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            {/* 1. TVD */}
            <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-secondary text-[10px] uppercase font-sans tracking-wider block">Observed Variation (D_TV)</span>
              <div className="flex items-baseline space-x-2">
                <span className={`text-xl font-extrabold ${verdict.deviation > 0.12 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {verdict.deviation.toFixed(3)}
                </span>
                <span className="text-[11px] text-secondary">/ max 0.120</span>
              </div>
              <div className="text-[10px] text-secondary font-sans">Threshold: &le; 0.120</div>
            </div>

            {/* 2. Fidelity */}
            <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-secondary text-[10px] uppercase font-sans tracking-wider block">Quantum State Fidelity</span>
              <div className="flex items-baseline space-x-2">
                <span className={`text-xl font-extrabold ${verdict.fidelity < 0.85 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {(verdict.fidelity * 100).toFixed(1)}%
                </span>
                <span className="text-[11px] text-secondary">/ min 85%</span>
              </div>
              <div className="text-[10px] text-secondary font-sans">Threshold: &ge; 85.0%</div>
            </div>

            {/* 3. QBER */}
            <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-secondary text-[10px] uppercase font-sans tracking-wider block">Observed Error Rate (QBER)</span>
              <div className="flex items-baseline space-x-2">
                <span className={`text-xl font-extrabold ${verdict.qber > 0.15 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {(verdict.qber * 100).toFixed(1)}%
                </span>
                <span className="text-[11px] text-secondary">/ max 15%</span>
              </div>
              <div className="text-[10px] text-secondary font-sans">Threshold: &le; 15.0%</div>
            </div>

            {/* 4. Forgery Probability */}
            <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-secondary text-[10px] uppercase font-sans tracking-wider block">Threat Probability</span>
              <div className="flex items-baseline space-x-2">
                <span className={`text-xl font-extrabold ${verdict.forgery_probability > 0.50 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {(verdict.forgery_probability * 100).toFixed(1)}%
                </span>
                <span className="text-[11px] text-secondary">
                  bound: {(verdict.telemetry?.theoretical_forgery_bound ? (verdict.telemetry.theoretical_forgery_bound * 100).toFixed(1) : '5.0')}%
                </span>
              </div>
              <div className="text-[10px] text-secondary font-sans">Deterministic bound</div>
            </div>
          </div>

          {/* Plain-Language Explanation: Why was this detected? */}
          <div className="p-5 rounded-xl bg-surface border border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center space-x-2">
              <Info className="w-4 h-4 text-yellow-600" />
              <span>Why was this detected?</span>
            </h4>
            <p className="text-xs text-secondary leading-relaxed">
              {verdict.status === 'LEGITIMATE'
                ? 'All physical invariants (QBER, quantum state fidelity, and distribution distance) remained within calibrated thresholds. No indication of state disturbance, token cloning, or replay was observed.'
                : 'The observed measurement distribution differs from the expected distribution and exceeds the configured detection threshold.'}
            </p>
            <div className="pt-2 border-t border-border">
              <span className="text-[11px] font-semibold text-charcoal block mb-2">Evidence Details:</span>
              <ol className="space-y-2 text-xs text-charcoal">
                {verdict.evidence.map((item, index) => (
                  <li key={index} className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-yellow-200 text-charcoal font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Threat Detection Audit Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-charcoal">Threat Detection Audit Log</h2>
            <p className="text-xs text-secondary">Historical records of evaluated quantum signatures</p>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-xl bg-white border border-border hover:border-yellow-400 text-xs text-secondary hover:text-charcoal flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-surface text-secondary flex items-center justify-center mx-auto mb-2">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-charcoal text-xs">No analyses performed yet</h3>
            <p className="text-xs text-secondary mt-1">
              Run an analysis to evaluate a signature or measurement result.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface text-secondary uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Analysis ID</th>
                    <th className="py-3 px-4">Signature ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Threat Score</th>
                    <th className="py-3 px-4">QBER</th>
                    <th className="py-3 px-4">Deviation (D_TV)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-[11px]">
                  {history.map((h) => (
                    <tr key={h.analysis_id} className="hover:bg-surface/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-charcoal">{h.analysis_id}</td>
                      <td className="py-3 px-4 text-secondary">{h.signature_id}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold font-sans ${
                            h.status === 'LEGITIMATE'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-red-50 border-red-200 text-red-700'
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-charcoal font-bold">{h.attack_type}</td>
                      <td className="py-3 px-4 text-secondary">{(h.threat_score * 100).toFixed(0)}%</td>
                      <td className="py-3 px-4 text-secondary">{(h.qber * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 text-secondary">{h.deviation.toFixed(3)}</td>
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
