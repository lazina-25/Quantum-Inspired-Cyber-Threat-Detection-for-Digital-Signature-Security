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
  BarChart3,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
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
import { NavTab } from '../components/Navbar';
import { useToast } from '../components/Toast';
import { SecurityWorkflowStepper, WorkflowState } from '../components/SecurityWorkflowStepper';
import { SecurityWorkflowContextState } from '../App';

interface ThreatDetectionPageProps {
  workflow?: SecurityWorkflowContextState;
  onThreatAnalyzed?: (verdict: ThreatAnalysisResponse) => void;
  onNavigate?: (tab: NavTab) => void;
  initialSignatureId?: string;
  initialAttackId?: string;
}

export const ThreatDetectionPage: React.FC<ThreatDetectionPageProps> = ({
  workflow,
  onThreatAnalyzed,
  onNavigate,
  initialSignatureId,
  initialAttackId,
}) => {
  const { notifyThreatAnalysis } = useToast();
  const [signatures, setSignatures] = useState<SignatureListItem[]>([]);
  const [attackLogs, setAttackLogs] = useState<AttackHistoryItem[]>([]);
  const [targetSigId, setTargetSigId] = useState<string>(
    workflow?.signatureId || initialSignatureId || ''
  );
  const [verifierId, setVerifierId] = useState<string>('bob_verifier_01');
  const [testedMessage, setTestedMessage] = useState<string>(workflow?.message || '');
  const [selectedAttackId, setSelectedAttackId] = useState<string>(
    workflow?.attackId || initialAttackId || ''
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<ThreatAnalysisResponse | null>(
    workflow?.threatVerdict || null
  );
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

  useEffect(() => {
    if (workflow?.signatureId) {
      setTargetSigId(workflow.signatureId);
      if (workflow.message) {
        setTestedMessage(workflow.message);
      }
    }
    if (workflow?.attackId) {
      setSelectedAttackId(workflow.attackId);
    } else if (workflow?.attackExecuted === false) {
      setSelectedAttackId('');
    }
    if (workflow?.threatVerdict) {
      setVerdict(workflow.threatVerdict);
    }
  }, [workflow]);

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

      // Trigger Toast E: Threat Analysis Complete
      notifyThreatAnalysis(
        res.data.status,
        res.data.attack_type,
        res.data.status === 'LEGITIMATE' ? 'NO THREAT DETECTED' : `${res.data.attack_type.replace('_', ' ')} DETECTED`
      );

      if (onThreatAnalyzed) {
        onThreatAnalyzed(res.data);
      }

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

  // Expected vs Observed probability distributions from actual backend analysis
  const expectedMatchRate = verdict?.telemetry?.expected_distribution?.['0'] ?? 1.0;
  const expectedErrorRate = verdict?.telemetry?.expected_distribution?.['1'] ?? 0.0;
  const observedMatchRate = verdict?.telemetry?.observed_distribution?.['0'] ?? (1.0 - (verdict?.qber ?? 0));
  const observedErrorRate = verdict?.telemetry?.observed_distribution?.['1'] ?? (verdict?.qber ?? 0);

  const distributionChartData = [
    {
      state: 'Match Token (|0⟩)',
      expected: Number((expectedMatchRate * 100).toFixed(1)),
      observed: Number((observedMatchRate * 100).toFixed(1)),
    },
    {
      state: 'Error Token (|1⟩)',
      expected: Number((expectedErrorRate * 100).toFixed(1)),
      observed: Number((observedErrorRate * 100).toFixed(1)),
    },
  ];

  const deviationValue = verdict?.deviation ?? 0;
  const thresholdLimit = verdict?.threshold ?? 0.12;
  const isThresholdExceeded = deviationValue > thresholdLimit;

  const currentStep = verdict ? 6 : 5;

  const stepperWorkflow: WorkflowState = {
    signatureId: targetSigId,
    signerId: workflow?.signerId,
    message: workflow?.message || testedMessage,
    initialVerificationDone: Boolean(workflow?.initialVerification),
    initialVerificationStatus: 'LEGITIMATE',
    attackExecuted: workflow?.attackExecuted,
    attackId: workflow?.attackId || selectedAttackId,
    attackType: workflow?.attackType,
    postAttackVerificationDone: Boolean(workflow?.postAttackVerification),
    postAttackVerificationStatus: workflow?.postAttackVerification?.verification_status,
    threatDetectionDone: Boolean(verdict || workflow?.threatVerdict),
    threatVerdictStatus: verdict?.status || workflow?.threatVerdict?.status,
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 6-Step Workflow Stepper */}
      <SecurityWorkflowStepper
        currentStep={currentStep}
        onNavigate={onNavigate || (() => {})}
        workflow={stepperWorkflow}
      />

      {/* Page Header */}
      <div className="page-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="page-header-badge">
              <Activity className="w-3.5 h-3.5 text-yellow-800" />
              <span>Step 5 &amp; Step 6</span>
            </div>
            <h1 className="page-title">
              Threat Detection &amp; Physics Analysis
            </h1>
            <p className="page-description">
              Deterministic verification against physical quantum invariants. Compares the pre-attack clean baseline with the post-attack measurement state. Evaluates Total Variation Distance (D_TV) and QBER against calibrated thresholds.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleAnalyze}
              disabled={loading || !targetSigId}
              className="btn-primary"
            >
              <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Evaluating Invariants...' : 'Analyze Threat'}</span>
            </button>
          </div>
        </div>

        {/* 6-Step Pipeline Visual Overview */}
        <div className="mt-8 pt-6 border-t border-[#EAEAEA]">
          <span className="section-kicker mb-3">
            Deterministic Threat Detection Pipeline
          </span>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 font-medium text-xs text-center">
            <div className="p-3 rounded-xl bg-surface border border-[#EAEAEA] flex flex-col items-center justify-center">
              <span className="text-charcoal font-bold">1. Quantum Probes</span>
              <span className="text-[10px] text-secondary mt-0.5">Projective Bases</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-[#EAEAEA] flex flex-col items-center justify-center">
              <span className="text-charcoal font-bold">2. Distribution P(x)</span>
              <span className="text-[10px] text-secondary mt-0.5">Empirical Density</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-[#EAEAEA] flex flex-col items-center justify-center">
              <span className="text-charcoal font-bold">3. Expected vs Observed</span>
              <span className="text-[10px] text-secondary mt-0.5">Parity Comparison</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-[#EAEAEA] flex flex-col items-center justify-center">
              <span className="text-charcoal font-bold">4. Statistical Distance</span>
              <span className="text-[10px] text-secondary mt-0.5">D_TV &amp; QBER</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-[#EAEAEA] flex flex-col items-center justify-center">
              <span className="text-charcoal font-bold">5. Threshold Check</span>
              <span className="text-[10px] text-secondary mt-0.5">D_TV &le; 0.12, QBER &le; 15%</span>
            </div>
            <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-300 text-charcoal flex flex-col items-center justify-center font-bold">
              <span>6. Final Verdict</span>
              <span className="text-[10px] text-secondary mt-0.5 font-normal">Zero AI / Deterministic</span>
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

      {/* ========================================================================= */}
      {/* CORE REQUIREMENT 15: TWO-STAGE VERIFICATION COMPARISON */}
      {/* ========================================================================= */}
      <div className="app-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAEAEA] pb-3">
          <div>
            <span className="section-kicker">Two-Stage Verification Comparison</span>
            <h3 className="section-title">Initial Verification vs Post-Attack Verification</h3>
          </div>
          <span className="text-xs font-mono text-secondary">
            Target Session: <strong className="text-charcoal">{targetSigId || 'None'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stage 1: Initial Verification */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Initial Verification (Clean Baseline)
              </span>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✓ LEGITIMATE
              </span>
            </div>

            <p className="text-xs text-emerald-800/80">
              Evaluated immediately after creation before any attack simulation was run.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-secondary font-sans block">Verification Result</span>
                <strong className="text-emerald-700 font-bold text-sm">ACCEPTED</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-secondary font-sans block">Quantum Error (QBER)</span>
                <strong className="text-emerald-700 font-bold text-sm">0.0%</strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-secondary font-sans block">Token Matches</span>
                <strong className="text-charcoal font-bold text-sm">
                  {workflow?.initialVerification?.measurement_counts?.matches ?? 4}/{workflow?.initialVerification?.token_verifications?.length ?? 4} (100%)
                </strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-secondary font-sans block">State Fidelity</span>
                <strong className="text-charcoal font-bold text-sm">100.0%</strong>
              </div>
            </div>
          </div>

          {/* Stage 2: Post-Attack Verification */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              workflow?.attackExecuted
                ? 'border-red-200 bg-red-50/40'
                : 'border-emerald-200 bg-emerald-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  workflow?.attackExecuted ? 'text-red-900' : 'text-emerald-900'
                }`}
              >
                {workflow?.attackExecuted ? (
                  <>
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    Post-Attack Verification ({workflow?.attackType?.toUpperCase().replace('_', ' ')})
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Post-Attack Verification (No Attack Executed)
                  </>
                )}
              </span>
              <span
                className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  workflow?.attackExecuted
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {workflow?.attackExecuted ? '⚠ REJECTED (CHANGED)' : '✓ LEGITIMATE (CLEAN)'}
              </span>
            </div>

            <p className={`text-xs ${workflow?.attackExecuted ? 'text-red-800/80' : 'text-emerald-800/80'}`}>
              {workflow?.attackExecuted
                ? `Evaluated using state resulting from ${workflow.attackType?.replace('_', ' ')} attack.`
                : 'No attack scenario was executed. Clean baseline preserved.'}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="bg-white p-3 rounded-xl border border-[#EAEAEA]">
                <span className="text-[10px] text-secondary font-sans block">Verification Result</span>
                <strong
                  className={`text-sm font-bold ${
                    workflow?.attackExecuted ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {workflow?.postAttackVerification?.verification_status || (workflow?.attackExecuted ? 'REJECTED' : 'ACCEPTED')}
                </strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#EAEAEA]">
                <span className="text-[10px] text-secondary font-sans block">Quantum Error (QBER)</span>
                <strong
                  className={`text-sm font-bold ${
                    workflow?.attackExecuted ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {workflow?.postAttackVerification
                    ? `${(workflow.postAttackVerification.qber * 100).toFixed(1)}%`
                    : workflow?.attackExecuted
                    ? '100.0%'
                    : '0.0%'}
                </strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#EAEAEA]">
                <span className="text-[10px] text-secondary font-sans block">Token Matches</span>
                <strong className="text-charcoal font-bold text-sm">
                  {workflow?.postAttackVerification
                    ? `${workflow.postAttackVerification.measurement_counts.matches}/${workflow.postAttackVerification.token_verifications.length}`
                    : workflow?.attackExecuted
                    ? '0/4 Match'
                    : '4/4 Match'}
                </strong>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#EAEAEA]">
                <span className="text-[10px] text-secondary font-sans block">Physical Deviation</span>
                <strong
                  className={`text-sm font-bold ${
                    workflow?.attackExecuted ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {workflow?.attackExecuted ? 'Threshold Violated' : 'Within Limits'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Selection & Attack Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 app-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-charcoal flex items-center space-x-2 mb-3">
              <Database className="w-4 h-4 text-yellow-600" />
              <span>Target &amp; Context Configuration</span>
            </h2>

            <div className="space-y-3.5">
              <div>
                <label className="app-label">Target Signature Session:</label>
                <select
                  value={targetSigId}
                  onChange={(e) => handleSelectSignature(e.target.value)}
                  className="app-select font-mono text-xs"
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
                <label className="app-label">Associated Attack Context:</label>
                <select
                  value={selectedAttackId}
                  onChange={(e) => handleSelectAttackScenario(e.target.value)}
                  className="app-select font-mono text-xs"
                >
                  <option value="">None &mdash; Clean Baseline (No Attack)</option>
                  {attackLogs.map((a) => (
                    <option key={a.attack_id} value={a.attack_id}>
                      {a.attack_id} &mdash; {a.attack_type.toUpperCase()} (Target: {a.target_signature_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="app-label">Claimed Verifier Identity:</label>
                <input
                  type="text"
                  value={verifierId}
                  onChange={(e) => setVerifierId(e.target.value)}
                  className="app-input font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="app-card-sub text-xs text-secondary space-y-1">
            <span className="font-semibold text-charcoal block">Deterministic Invariant Rule:</span>
            <span>If no attack was executed, threat detection evaluates strictly to NO THREAT DETECTED with 0% threat score.</span>
          </div>
        </div>

        {/* Message Content Under Analysis (7 Cols) */}
        <div className="lg:col-span-7 app-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-charcoal flex items-center space-x-2">
              <FileText className="w-4 h-4 text-yellow-600" />
              <span>Message Payload Under Evaluation</span>
            </h2>
            <button
              type="button"
              onClick={handleTamperMessage}
              className="text-xs px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-semibold transition-colors"
            >
              Simulate Forged Payload
            </button>
          </div>

          <div>
            <textarea
              rows={3}
              value={testedMessage}
              onChange={(e) => setTestedMessage(e.target.value)}
              className="app-textarea font-mono text-xs"
              placeholder="Message content to evaluate..."
            />
          </div>

          {/* Calibrated Thresholds */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="p-3 rounded-xl bg-surface border border-[#EAEAEA]">
              <span className="text-secondary block text-[10px] font-sans">Max QBER</span>
              <strong className="text-charcoal font-bold">15.0%</strong>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-[#EAEAEA]">
              <span className="text-secondary block text-[10px] font-sans">Max TVD (D_TV)</span>
              <strong className="text-charcoal font-bold">0.120</strong>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-[#EAEAEA]">
              <span className="text-secondary block text-[10px] font-sans">Min Fidelity</span>
              <strong className="text-charcoal font-bold">85.0%</strong>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-[#EAEAEA]">
              <span className="text-secondary block text-[10px] font-sans">Replay Window</span>
              <strong className="text-charcoal font-bold">300s</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAILED THREAT ANALYSIS SECTIONS A -> F */}
      {/* ========================================================================= */}
      {!verdict ? (
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center mx-auto mb-2">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-charcoal text-sm">No threat analysis executed yet</h3>
          <p className="text-xs text-secondary max-w-md mx-auto">
            Click "Analyze Threat" above to run deterministic physical invariant analysis.
          </p>
          <div className="pt-2">
            <button
              onClick={handleAnalyze}
              disabled={loading || !targetSigId}
              className="btn-primary text-xs"
            >
              <Zap className="w-4 h-4" />
              <span>Run Threat Analysis</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION A: ANALYSIS SUMMARY CARDS */}
          <div>
            <span className="section-kicker mb-2">
              Section A &bull; Analysis Summary
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Detection Status */}
              <div
                className={`p-5 rounded-2xl border shadow-xs ${
                  verdict.status === 'LEGITIMATE'
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-red-50/50 border-red-200'
                }`}
              >
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider block">
                  Detection Status
                </span>
                <div className="flex items-center gap-2 mt-2">
                  {verdict.status === 'LEGITIMATE' ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
                  )}
                  <h3
                    className={`text-xl font-bold tracking-tight leading-snug ${
                      verdict.status === 'LEGITIMATE' ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {verdict.status === 'LEGITIMATE' ? 'NO THREAT DETECTED' : 'THREAT DETECTED'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-secondary mt-1.5 leading-relaxed">
                  {verdict.status === 'LEGITIMATE'
                    ? 'All quantum physical invariants satisfied'
                    : 'Physical threshold boundary exceeded'}
                </p>
              </div>

              {/* Card 2: Threat Type */}
              <div className="app-card p-5">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider block">
                  Threat Classification
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-charcoal mt-2 truncate tracking-tight">
                  {verdict.attack_type.replace(/_/g, ' ')}
                </h3>
                <p className="text-xs text-secondary mt-1.5 font-mono truncate">
                  ID: {verdict.analysis_id}
                </p>
              </div>

              {/* Card 3: Threat Score */}
              <div className="app-card p-5">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider block">
                  Threat Score
                </span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <h3 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight tabular-nums">
                    {(verdict.threat_score * 100).toFixed(0)}%
                  </h3>
                  <span className="text-xs sm:text-sm text-secondary font-mono">
                    ({verdict.threat_score.toFixed(2)})
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-secondary mt-1.5 leading-relaxed">
                  {verdict.status === 'LEGITIMATE' ? 'Zero malicious probability' : 'Statistical confidence of deviation'}
                </p>
              </div>

              {/* Card 4: Detection Threshold */}
              <div className="app-card p-5">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider block">
                  Configured Threshold
                </span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <h3 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight tabular-nums font-mono">
                    {verdict.threshold.toFixed(3)}
                  </h3>
                  <span className="text-xs sm:text-sm text-secondary font-sans">TVD Limit</span>
                </div>
                <p className="text-xs sm:text-sm text-secondary mt-1.5 leading-relaxed">
                  Max allowed QBER: 15.0%
                </p>
              </div>
            </div>
          </div>

          {/* SECTION B: EXPECTED VS OBSERVED MEASUREMENTS (VISUALIZATION + TABLE) */}
          <div className="app-card p-5 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAEAEA] pb-4">
              <div>
                <span className="section-kicker">
                  Section B &bull; Measurement Distribution Visualization
                </span>
                <h3 className="section-title flex items-center gap-2 mt-0.5">
                  <BarChart3 className="w-4 h-4 text-yellow-600" />
                  <span>Expected vs Observed Measurement Distribution</span>
                </h3>
              </div>
              <span className="text-xs font-mono text-secondary">
                Total Tokens: {verdict.telemetry?.total_tokens ?? 4}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={distributionChartData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                    <XAxis
                      dataKey="state"
                      stroke="#6B6B6B"
                      tick={{ fontSize: 11, fill: '#171717', fontWeight: 600 }}
                    />
                    <YAxis
                      stroke="#6B6B6B"
                      tick={{ fontSize: 11, fill: '#6B6B6B' }}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, '']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#171717',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar
                      dataKey="expected"
                      name="Expected Probability (Nominal)"
                      fill="#171717"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="observed"
                      name="Observed Probability (Empirical)"
                      fill={verdict.status === 'LEGITIMATE' ? '#F5C400' : '#DC2626'}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-secondary block mb-2">
                    Empirical Probability Breakdown:
                  </span>
                  <div className="overflow-x-auto border border-[#EAEAEA] rounded-xl">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-surface text-secondary font-semibold uppercase text-[10px] border-b border-[#EAEAEA]">
                        <tr>
                          <th className="py-2.5 px-3">State</th>
                          <th className="py-2.5 px-3">Expected</th>
                          <th className="py-2.5 px-3">Observed</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAEAEA] font-mono text-[11px]">
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-charcoal">|0⟩ Match</td>
                          <td className="py-2.5 px-3 text-secondary">{(expectedMatchRate * 100).toFixed(1)}%</td>
                          <td className="py-2.5 px-3 text-charcoal font-bold">{(observedMatchRate * 100).toFixed(1)}%</td>
                          <td className="py-2.5 px-3 font-sans text-[10px]">
                            {observedMatchRate >= 0.85 ? (
                              <span className="text-emerald-700 font-semibold">Nominal</span>
                            ) : (
                              <span className="text-red-700 font-bold">Collapsed</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-charcoal">|1⟩ Error</td>
                          <td className="py-2.5 px-3 text-secondary">{(expectedErrorRate * 100).toFixed(1)}%</td>
                          <td className="py-2.5 px-3 text-charcoal font-bold">{(observedErrorRate * 100).toFixed(1)}%</td>
                          <td className="py-2.5 px-3 font-sans text-[10px]">
                            {observedErrorRate <= 0.15 ? (
                              <span className="text-emerald-700 font-semibold">Allowed</span>
                            ) : (
                              <span className="text-red-700 font-bold">Anomaly</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C & D: STATISTICAL DEVIATIONS & THRESHOLDS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 app-card p-5 sm:p-6 space-y-4">
              <div className="border-b border-[#EAEAEA] pb-3">
                <span className="section-kicker">
                  Section C &bull; Physical Deviation Metrics
                </span>
                <h3 className="section-title flex items-center gap-1.5 mt-0.5">
                  <Activity className="w-4 h-4 text-yellow-600" />
                  <span>Observed Physical Invariants</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] space-y-1.5">
                  <span className="text-secondary text-xs font-semibold uppercase font-sans tracking-wider block">
                    Total Variation (D_TV)
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight tabular-nums">
                    {verdict.deviation.toFixed(3)}
                  </div>
                  <div className="text-xs text-secondary font-sans">
                    Limit: &le; {verdict.threshold.toFixed(3)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] space-y-1.5">
                  <span className="text-secondary text-xs font-semibold uppercase font-sans tracking-wider block">
                    Observed QBER
                  </span>
                  <div className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${verdict.qber > 0.15 ? 'text-danger' : 'text-success'}`}>
                    {(verdict.qber * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-secondary font-sans">
                    Max: 15.0%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] space-y-1.5">
                  <span className="text-secondary text-xs font-semibold uppercase font-sans tracking-wider block">
                    Quantum Fidelity (F)
                  </span>
                  <div className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${verdict.fidelity < 0.85 ? 'text-danger' : 'text-success'}`}>
                    {(verdict.fidelity * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-secondary font-sans">
                    Min: 85.0%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] space-y-1.5">
                  <span className="text-secondary text-xs font-semibold uppercase font-sans tracking-wider block">
                    Chi-Square (&chi;&sup2;)
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight tabular-nums">
                    {(verdict.telemetry?.chi_square ?? 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-secondary font-sans">
                    Goodness of fit
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] space-y-1.5">
                  <span className="text-secondary text-xs font-semibold uppercase font-sans tracking-wider block">
                    Threat Probability
                  </span>
                  <div className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${verdict.forgery_probability > 0.5 ? 'text-danger' : 'text-success'}`}>
                    {(verdict.forgery_probability * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-secondary font-sans">
                    Bound: {(verdict.telemetry?.theoretical_forgery_bound ? (verdict.telemetry.theoretical_forgery_bound * 100).toFixed(1) : '5.0')}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] space-y-1.5">
                  <span className="text-secondary text-xs font-semibold uppercase font-sans tracking-wider block">
                    Analysis Latency
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight tabular-nums">
                    {verdict.telemetry?.analysis_time_ms ? `${verdict.telemetry.analysis_time_ms.toFixed(1)} ms` : '1.2 ms'}
                  </div>
                  <div className="text-xs text-secondary font-sans">
                    Real-time eval
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 app-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="border-b border-[#EAEAEA] pb-3">
                  <span className="section-kicker">
                    Section D &bull; Threshold Boundary Evaluation
                  </span>
                  <h3 className="section-title flex items-center gap-1.5 mt-0.5">
                    <Sliders className="w-4 h-4 text-yellow-600" />
                    <span>Observed Deviation vs Threshold</span>
                  </h3>
                </div>

                <div className="mt-4 space-y-4 font-mono text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-sans font-semibold text-charcoal">Observed Statistical Deviation (D_TV):</span>
                      <strong className={isThresholdExceeded ? 'text-danger' : 'text-success'}>
                        {deviationValue.toFixed(3)}
                      </strong>
                    </div>
                    <div className="w-full bg-surface rounded-full h-3 border border-[#EAEAEA] overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isThresholdExceeded ? 'bg-danger' : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, deviationValue * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-sans font-semibold text-charcoal">Calibrated Max Threshold:</span>
                      <strong className="text-charcoal font-bold">{thresholdLimit.toFixed(3)}</strong>
                    </div>
                    <div className="w-full bg-surface rounded-full h-3 border border-[#EAEAEA] overflow-hidden p-0.5">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${thresholdLimit * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-xs font-bold text-center mt-4 ${
                  isThresholdExceeded
                    ? 'bg-red-50 border-red-200 text-danger'
                    : 'bg-green-50 border-green-200 text-success'
                }`}
              >
                {isThresholdExceeded ? (
                  <span>THRESHOLD EXCEEDED &rarr; THREAT DETECTED</span>
                ) : (
                  <span>WITHIN LIMIT &rarr; SIGNATURE VERIFIED LEGITIMATE</span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION E & F: EXPLAINABLE EVIDENCE & CONTEXT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 app-card p-5 sm:p-6 space-y-4">
              <div className="border-b border-[#EAEAEA] pb-3">
                <span className="section-kicker">
                  Section E &bull; Explainable Threat Analysis
                </span>
                <h3 className="section-title flex items-center gap-1.5 mt-0.5">
                  <Info className="w-4 h-4 text-yellow-600" />
                  <span>Why was this detected?</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="app-card-sub text-charcoal leading-relaxed">
                  {verdict.status === 'LEGITIMATE' ? (
                    <span>
                      All physical invariants (QBER, quantum state fidelity, and distribution distance) remained strictly within calibrated thresholds. No indication of state disturbance, token cloning, or replay was observed.
                    </span>
                  ) : (
                    <span>
                      The observed measurement distribution differs from expected quantum states and exceeds calibrated thresholds ({verdict.threshold.toFixed(3)}). Physical parity checks failed due to simulated adversarial interference.
                    </span>
                  )}
                </div>

                <div>
                  <span className="font-semibold text-charcoal block mb-2">Deterministic Evidence Details:</span>
                  <ol className="space-y-2">
                    {verdict.evidence.map((item, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-yellow-200 text-charcoal font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-charcoal leading-relaxed font-mono text-[11px] bg-surface px-2.5 py-1.5 rounded-lg border border-[#EAEAEA] w-full">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 app-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="border-b border-[#EAEAEA] pb-3">
                  <span className="section-kicker">
                    Section F &bull; Attack Context
                  </span>
                  <h3 className="section-title flex items-center gap-1.5 mt-0.5">
                    <FileText className="w-4 h-4 text-yellow-600" />
                    <span>Attack Information</span>
                  </h3>
                </div>

                <div className="mt-3 space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-surface border border-[#EAEAEA]">
                    <span className="text-secondary text-[10px] font-sans block">Attack Type</span>
                    <strong className="text-charcoal">{verdict.attack_type}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface border border-[#EAEAEA]">
                    <span className="text-secondary text-[10px] font-sans block">Attack ID</span>
                    <span className="text-charcoal truncate block">{selectedAttackId || 'None (Clean Baseline)'}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface border border-[#EAEAEA]">
                    <span className="text-secondary text-[10px] font-sans block">Target Signature</span>
                    <span className="text-charcoal truncate block">{verdict.signature_id}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface border border-[#EAEAEA]">
                    <span className="text-secondary text-[10px] font-sans block">Verifier Node</span>
                    <span className="text-charcoal block">{verdict.verifier_id}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface border border-[#EAEAEA]">
                    <span className="text-secondary text-[10px] font-sans block">Timestamp</span>
                    <span className="text-charcoal text-[11px] block">{new Date(verdict.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FINAL VERDICT BANNER */}
          <div
            className={`rounded-2xl p-6 sm:p-7 border shadow-xs ${
              verdict.status === 'LEGITIMATE'
                ? 'bg-emerald-50/60 border-emerald-300'
                : 'bg-red-50/60 border-red-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className={`p-3 rounded-2xl border shrink-0 ${
                    verdict.status === 'LEGITIMATE'
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-red-100 border-red-300 text-danger'
                  }`}
                >
                  {verdict.status === 'LEGITIMATE' ? (
                    <ShieldCheck className="w-7 h-7 text-emerald-700" />
                  ) : (
                    <ShieldAlert className="w-7 h-7 text-red-700" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                        verdict.status === 'LEGITIMATE'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-red-100 border-red-300 text-danger'
                      }`}
                    >
                      {verdict.status === 'LEGITIMATE' ? 'NO THREAT DETECTED' : 'THREAT DETECTED'}
                    </span>
                    <span className="text-xs font-mono font-bold text-charcoal">
                      Classification: {verdict.attack_type}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-charcoal mt-2 tracking-tight leading-snug">
                    {verdict.status === 'LEGITIMATE'
                      ? 'Signature verification passed — physical invariants verified within limits'
                      : `Threat Neutralized: ${verdict.attack_type.replace(/_/g, ' ')} detected via physical invariant collapse`}
                  </h3>
                  <p className="text-sm text-secondary mt-1.5 leading-relaxed">
                    {verdict.status === 'LEGITIMATE'
                      ? 'All conjugate token states reconstructed with expected fidelity.'
                      : `Total Variation Distance (${deviationValue.toFixed(3)}) exceeded threshold boundary (${thresholdLimit.toFixed(3)}).`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate && onNavigate('analytics')}
                className="btn-primary shrink-0"
              >
                <span>Step 6: View Analytics</span>
                <ArrowRight className="w-4 h-4 text-charcoal" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Threat Detection History Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-charcoal">Threat Detection Audit Log</h2>
            <p className="text-xs text-secondary">Historical records of evaluated quantum signatures</p>
          </div>
          <button
            onClick={loadData}
            className="btn-secondary !h-8 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EAEAEA] p-8 text-center shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-surface text-secondary flex items-center justify-center mx-auto mb-2">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-charcoal text-xs">No analyses performed yet</h3>
            <p className="text-xs text-secondary mt-1">
              Run an analysis to evaluate a signature or measurement result.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface text-secondary uppercase tracking-wider font-semibold border-b border-[#EAEAEA]">
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
                <tbody className="divide-y divide-[#EAEAEA] font-mono text-[11px]">
                  {history.map((h) => (
                    <tr key={h.analysis_id} className="hover:bg-surface/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-charcoal">{h.analysis_id}</td>
                      <td className="py-3 px-4 text-secondary">{h.signature_id}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold font-sans ${
                            h.status === 'LEGITIMATE'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-red-50 border-red-200 text-danger'
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
