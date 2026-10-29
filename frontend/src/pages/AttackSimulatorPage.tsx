import React, { useState, useEffect } from 'react';
import {
  Skull,
  ShieldAlert,
  UserX,
  History,
  Radio,
  Lock,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Database,
  Play,
  ArrowRight,
} from 'lucide-react';
import {
  AttackTypeId,
  AttackResponse,
  AttackHistoryItem,
} from '../types/attack';
import {
  launchForgeryAttackApi,
  launchImpersonationAttackApi,
  launchReplayAttackApi,
  launchChannelManipulationAttackApi,
  launchUnauthorizedVerificationAttackApi,
  getAttackHistoryApi,
} from '../services/attackApi';
import { listSignaturesApi, createSignatureApi, verifySignatureApi } from '../services/signatureApi';
import { SignatureListItem, VerifySignatureResponse } from '../types/signature';
import { NavTab } from '../components/Navbar';
import { useToast } from '../components/Toast';
import { SecurityWorkflowStepper, WorkflowState } from '../components/SecurityWorkflowStepper';
import { SecurityWorkflowContextState } from '../App';

const ATTACK_VECTORS: {
  id: AttackTypeId;
  name: string;
  threatCode: string;
  icon: any;
  badgeColor: string;
  description: string;
  targetMechanism: string;
}[] = [
  {
    id: 'forgery',
    name: 'Signature Forgery',
    threatCode: 'THREAT-FORGERY-01',
    icon: Skull,
    badgeColor: 'border-yellow-200 bg-yellow-50 text-charcoal',
    description: 'Attempts to alter message content or substitute quantum tokens.',
    targetMechanism: 'Message Hash Tampering & Quantum Token Substitution',
  },
  {
    id: 'impersonation',
    name: 'Impersonation',
    threatCode: 'THREAT-IMPERSONATION-02',
    icon: UserX,
    badgeColor: 'border-yellow-200 bg-yellow-50 text-charcoal',
    description: 'Attempts to sign a message masquerading as an authorized signer.',
    targetMechanism: 'Identity Spoofing & Asymmetric Parity Mismatch',
  },
  {
    id: 'replay',
    name: 'Replay Attack',
    threatCode: 'THREAT-REPLAY-03',
    icon: History,
    badgeColor: 'border-yellow-200 bg-yellow-50 text-charcoal',
    description: 'Attempts to reuse a previously valid signature or session.',
    targetMechanism: 'Stale Timestamps & Nonce Collision',
  },
  {
    id: 'channel_manipulation',
    name: 'Channel Manipulation',
    threatCode: 'THREAT-CHANNEL-04',
    icon: Radio,
    badgeColor: 'border-yellow-200 bg-yellow-50 text-charcoal',
    description: 'Injects noise or eavesdropping disturbance into the quantum channel.',
    targetMechanism: 'Channel Depolarization & Quantum State Disturbance',
  },
  {
    id: 'unauthorized_verification',
    name: 'Unauthorized Verification',
    threatCode: 'THREAT-UNAUTH-05',
    icon: Lock,
    badgeColor: 'border-yellow-200 bg-yellow-50 text-charcoal',
    description: 'Attempts to verify a signature without authorization.',
    targetMechanism: 'Unregistered Verifier Probe & Unallocated Basis Access',
  },
];

interface AttackSimulatorPageProps {
  workflow?: SecurityWorkflowContextState;
  onAttackExecuted?: (attackResp: AttackResponse, postVerifResp: VerifySignatureResponse) => void;
  onSkipAttack?: () => void;
  onNavigate?: (tab: NavTab) => void;
  initialSignatureId?: string;
  onContinueToDetection?: (context: { signatureId: string; attackId: string; attackType: string }) => void;
}

export const AttackSimulatorPage: React.FC<AttackSimulatorPageProps> = ({
  workflow,
  onAttackExecuted,
  onSkipAttack,
  onNavigate,
  initialSignatureId,
  onContinueToDetection,
}) => {
  const { notifyAttackSimulation, notifyPostAttackVerification } = useToast();
  const [selectedAttack, setSelectedAttack] = useState<AttackTypeId>('forgery');
  const [signatures, setSignatures] = useState<SignatureListItem[]>([]);
  const [targetSigId, setTargetSigId] = useState<string>(
    workflow?.signatureId || initialSignatureId || ''
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [attackResult, setAttackResult] = useState<AttackResponse | null>(
    workflow?.attackResult || null
  );
  const [postAttackVerif, setPostAttackVerif] = useState<VerifySignatureResponse | null>(
    workflow?.postAttackVerification || null
  );
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AttackHistoryItem[]>([]);

  // Attack-specific parameter states
  const [forgedMessage, setForgedMessage] = useState<string>(
    'FORGED_PAYLOAD: Divert $500,000 to Attacker Swiss Account #991.'
  );
  const [tamperRatio, setTamperRatio] = useState<number>(1.0);
  const [spoofedSignerId, setSpoofedSignerId] = useState<string>('alice_signer_01');
  const [attackerId, setAttackerId] = useState<string>('mallory_impersonator_99');
  const [stalenessSeconds, setStalenessSeconds] = useState<number>(7200);
  const [noiseType, setNoiseType] = useState<'depolarizing' | 'intercept_resend' | 'bit_flip' | 'phase_flip'>('depolarizing');
  const [noiseIntensity, setNoiseIntensity] = useState<number>(0.50);
  const [unauthVerifierId, setUnauthVerifierId] = useState<string>('rogue_spy_verifier_99');

  const loadData = async () => {
    try {
      const sigs = await listSignaturesApi();
      setSignatures(sigs);
      if (sigs.length > 0 && !targetSigId) {
        setTargetSigId(sigs[0].signature_id);
      }
      const hist = await getAttackHistoryApi();
      setHistory(hist);
    } catch (err) {
      console.error('Failed to load attack simulator dependencies', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (workflow?.signatureId) {
      setTargetSigId(workflow.signatureId);
    }
    if (workflow?.attackResult) {
      setAttackResult(workflow.attackResult);
    }
    if (workflow?.postAttackVerification) {
      setPostAttackVerif(workflow.postAttackVerification);
    }
  }, [workflow]);

  const handleCreateDemoSignature = async () => {
    try {
      const res = await createSignatureApi({
        signer_id: 'alice_signer_01',
        public_identity: 'Alice (Financial Division)',
        message_content: 'SECURE_TRANSFER_AUTH_#88910: Transfer $100,000 to Authorized Node 2.',
        token_count: 4,
        shots: 1024,
      });
      setTargetSigId(res.data.signature_id);
      loadData();
    } catch (err) {
      console.error('Failed to create demo signature', err);
    }
  };

  // Explicit Attack Execution + Automatic Post-Attack Verification (Steps 3 & 4)
  const handleLaunchAttack = async () => {
    if (!targetSigId) {
      setError('Please select or create a target signature first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let resp: { data: AttackResponse; latencyMs: number };

      if (selectedAttack === 'forgery') {
        resp = await launchForgeryAttackApi({
          target_signature_id: targetSigId,
          forged_message: forgedMessage,
          tamper_token_ratio: tamperRatio,
          attacker_id: attackerId,
        });
      } else if (selectedAttack === 'impersonation') {
        resp = await launchImpersonationAttackApi({
          target_signature_id: targetSigId,
          spoofed_signer_id: spoofedSignerId,
          attacker_id: attackerId,
        });
      } else if (selectedAttack === 'replay') {
        resp = await launchReplayAttackApi({
          target_signature_id: targetSigId,
          timestamp_delta_seconds: stalenessSeconds,
          attacker_id: attackerId,
        });
      } else if (selectedAttack === 'channel_manipulation') {
        resp = await launchChannelManipulationAttackApi({
          target_signature_id: targetSigId,
          noise_type: noiseType,
          noise_intensity: noiseIntensity,
          attacker_id: 'eve_quantum_tapper_04',
        });
      } else {
        resp = await launchUnauthorizedVerificationAttackApi({
          target_signature_id: targetSigId,
          unauthorized_verifier_id: unauthVerifierId,
          attacker_id: 'unauthorized_probe_node',
        });
      }

      setAttackResult(resp.data);

      // Trigger Toast C: Attack Simulation Complete
      notifyAttackSimulation(
        activeVector.name,
        targetSigId,
        'EXECUTED'
      );

      // STEP 4: AUTOMATIC POST-ATTACK VERIFICATION
      const postVerifResp = await verifySignatureApi({
        signature_id: targetSigId,
        message_content: selectedSig?.message_preview || workflow?.message || '',
        verifier_id: selectedAttack === 'unauthorized_verification' ? unauthVerifierId : 'bob_verifier_01',
        attack_id: resp.data.attack_id,
      });

      setPostAttackVerif(postVerifResp.data);

      // Trigger Toast D: Post-Attack Verification Complete
      notifyPostAttackVerification(
        postVerifResp.data.verification_status,
        `${postVerifResp.data.measurement_counts.matches} Matches, ${postVerifResp.data.measurement_counts.mismatches} Mismatches`
      );

      // Update central workflow state
      if (onAttackExecuted) {
        onAttackExecuted(resp.data, postVerifResp.data);
      }

      const hist = await getAttackHistoryApi();
      setHistory(hist);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Attack simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const activeVector = ATTACK_VECTORS.find((v) => v.id === selectedAttack) || ATTACK_VECTORS[0];
  const selectedSig = signatures.find((s) => s.signature_id === targetSigId);

  const currentStep = postAttackVerif ? 4 : 3;

  const stepperWorkflow: WorkflowState = {
    signatureId: targetSigId,
    signerId: workflow?.signerId || selectedSig?.signer_id,
    message: workflow?.message || selectedSig?.message_preview,
    initialVerificationDone: Boolean(workflow?.initialVerification),
    initialVerificationStatus: 'LEGITIMATE',
    attackExecuted: Boolean(attackResult || workflow?.attackExecuted),
    attackId: attackResult?.attack_id || workflow?.attackId,
    attackType: attackResult?.attack_type || workflow?.attackType,
    postAttackVerificationDone: Boolean(postAttackVerif || workflow?.postAttackVerification),
    postAttackVerificationStatus: (postAttackVerif || workflow?.postAttackVerification)?.verification_status,
    threatDetectionDone: Boolean(workflow?.threatVerdict),
    threatVerdictStatus: workflow?.threatVerdict?.status,
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 6-Step Workflow Stepper */}
      <SecurityWorkflowStepper
        currentStep={currentStep}
        onNavigate={onNavigate || (() => {})}
        workflow={stepperWorkflow}
      />

      {/* Target Signature Context Banner */}
      {selectedSig && (
        <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-yellow-100 text-charcoal">
              <Database className="w-5 h-5 text-yellow-800" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">Target Session:</span>
                <span className="text-xs font-mono font-bold text-charcoal bg-surface px-2 py-0.5 rounded border border-[#EAEAEA]">
                  {selectedSig.signature_id}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono">
                  Initial: ✓ LEGITIMATE
                </span>
              </div>
              <p className="text-xs text-secondary mt-1">
                Signer: <strong className="text-charcoal">{selectedSig.signer_id}</strong> &bull; Tokens: <strong className="text-charcoal">{selectedSig.token_count} Qubits</strong> &bull; Message: <span className="italic font-mono text-[11px]">"{selectedSig.message_preview}"</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onSkipAttack) {
                  onSkipAttack();
                } else if (onNavigate) {
                  onNavigate('detection');
                }
              }}
              className="btn-secondary !h-9 text-xs"
              title="Test threat detection without running an attack"
            >
              <span>Skip Attack (Clean Flow) &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="page-header-badge">
              <Skull className="w-3.5 h-3.5 text-yellow-800" />
              <span>Step 3 &amp; Step 4</span>
            </div>
            <h1 className="page-title">Attack Simulator &amp; Post-Attack Verification</h1>
            <p className="page-description">
              Explicitly select and execute an adversarial threat scenario. No attack exists until you click "Run Simulation". Following attack execution, the signature is automatically verified a second time.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleLaunchAttack}
              disabled={loading || !targetSigId}
              className="btn-primary"
            >
              <Play className={`w-4 h-4 fill-charcoal ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Simulating & Verifying...' : 'Run Simulation'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-danger text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Attack Options Grid (5 Vectors) */}
      <div className="space-y-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight">1. Select Attack Scenario</h2>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Click an attack card to configure parameters. Selecting a card does not launch an attack until you click "Run Simulation".
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ATTACK_VECTORS.map((vec) => {
            const isSelected = selectedAttack === vec.id;
            const Icon = vec.icon;
            return (
              <button
                key={vec.id}
                onClick={() => setSelectedAttack(vec.id)}
                className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between h-full min-h-[140px] cursor-pointer ${
                  isSelected
                    ? 'bg-yellow-50 border-yellow-400 shadow-xs ring-2 ring-yellow-400'
                    : 'bg-white border-[#EAEAEA] hover:border-yellow-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-xl border transition-colors ${
                        isSelected
                          ? 'bg-yellow-400 text-charcoal border-yellow-400'
                          : 'bg-surface border-[#EAEAEA] text-charcoal'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-md border font-medium ${
                        isSelected
                          ? 'bg-yellow-200 border-yellow-300 text-charcoal'
                          : 'bg-surface border-[#EAEAEA] text-secondary'
                      }`}
                    >
                      {vec.threatCode.split('-')[1]}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-charcoal leading-snug">{vec.name}</h3>
                  <p className="text-xs text-secondary mt-1.5 leading-relaxed">{vec.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#EAEAEA] text-xs font-mono text-secondary font-medium">
                  {vec.targetMechanism.split('&')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Attack Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Target Session & Attack Info (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-charcoal flex items-center space-x-2">
                <Database className="w-4 h-4 text-yellow-800" />
                <span>2. Target Signature Session</span>
              </h3>
              <button
                onClick={handleCreateDemoSignature}
                className="text-xs text-charcoal hover:underline font-bold"
              >
                + Create Demo Signature
              </button>
            </div>

            {signatures.length === 0 ? (
              <div className="p-5 rounded-2xl bg-surface border border-[#EAEAEA] text-xs text-secondary text-center space-y-2">
                <p>No signatures in database yet.</p>
                <button
                  onClick={handleCreateDemoSignature}
                  className="btn-primary !h-9 text-xs"
                >
                  Generate Target Signature
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="app-label">Select Target Signature:</label>
                  <select
                    value={targetSigId}
                    onChange={(e) => setTargetSigId(e.target.value)}
                    className="app-select font-mono"
                  >
                    {signatures.map((s) => (
                      <option key={s.signature_id} value={s.signature_id}>
                        {s.signature_id} ({s.signer_id} - {s.token_count} Qubits)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] text-xs text-charcoal space-y-1 font-mono">
                  <div>Target ID: <strong className="text-charcoal">{targetSigId}</strong></div>
                  <div>Attacker Node: <code className="text-danger font-semibold">{attackerId}</code></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] text-xs text-secondary space-y-1">
            <span className="font-bold text-charcoal block">{activeVector.name}:</span>
            <p>{activeVector.description}</p>
          </div>
        </div>

        {/* Right: Simulation Parameters for Selected Vector (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-sm space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-charcoal flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-yellow-800" />
            <span>3. Simulation Parameters</span>
          </h3>

          {/* 1. Forgery Params */}
          {selectedAttack === 'forgery' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="app-label">Forged / Modified Message Text:</label>
                <textarea
                  rows={3}
                  value={forgedMessage}
                  onChange={(e) => setForgedMessage(e.target.value)}
                  className="app-textarea"
                />
              </div>

              <div>
                <div className="flex justify-between text-charcoal-600 mb-1">
                  <span>Token Tamper Ratio:</span>
                  <span className="text-charcoal font-bold font-mono">{(tamperRatio * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="1.0"
                  step="0.25"
                  value={tamperRatio}
                  onChange={(e) => setTamperRatio(Number(e.target.value))}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between text-[10px] text-charcoal-400 mt-1">
                  <span>25% Tampered</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100% (Full Substitution)</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Impersonation Params */}
          {selectedAttack === 'impersonation' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="app-label">Spoofed Signer Identity (Alice):</label>
                <input
                  type="text"
                  value={spoofedSignerId}
                  onChange={(e) => setSpoofedSignerId(e.target.value)}
                  className="app-input font-mono"
                />
              </div>
              <div>
                <label className="app-label">Adversary Identifier:</label>
                <input
                  type="text"
                  value={attackerId}
                  onChange={(e) => setAttackerId(e.target.value)}
                  className="app-input font-mono"
                />
              </div>
            </div>
          )}

          {/* 3. Replay Params */}
          {selectedAttack === 'replay' && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-charcoal-600 mb-1">
                  <span>Simulated Timestamp Staleness:</span>
                  <span className="text-charcoal font-bold font-mono">{stalenessSeconds} seconds ({Math.round(stalenessSeconds / 60)} min)</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="86400"
                  step="600"
                  value={stalenessSeconds}
                  onChange={(e) => setStalenessSeconds(Number(e.target.value))}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between text-[10px] text-charcoal-400 mt-1">
                  <span>10 min</span>
                  <span>1 hour</span>
                  <span>12 hours</span>
                  <span>24 hours (Stale)</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Channel Manipulation Params */}
          {selectedAttack === 'channel_manipulation' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="app-label">Quantum Noise Model:</label>
                <select
                  value={noiseType}
                  onChange={(e: any) => setNoiseType(e.target.value)}
                  className="app-select"
                >
                  <option value="depolarizing">Depolarizing Channel (Standard Environmental Noise)</option>
                  <option value="intercept_resend">Intercept-Resend Eavesdropping (Eve Probe)</option>
                  <option value="bit_flip">Pauli-X Bit Flip Noise</option>
                  <option value="phase_flip">Pauli-Z Phase Flip Noise</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-charcoal-600 mb-1">
                  <span>Noise / Disturbance Intensity:</span>
                  <span className="text-charcoal font-bold font-mono">{(noiseIntensity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.0"
                  step="0.05"
                  value={noiseIntensity}
                  onChange={(e) => setNoiseIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
            </div>
          )}

          {/* 5. Unauthorized Verification Params */}
          {selectedAttack === 'unauthorized_verification' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="app-label">Unauthorized Verifier Identity:</label>
                <input
                  type="text"
                  value={unauthVerifierId}
                  onChange={(e) => setUnauthVerifierId(e.target.value)}
                  className="app-input font-mono"
                />
              </div>
              <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] text-xs text-secondary">
                <span>Rogue entity will attempt to probe measurement bases without authorized cryptographic credentials.</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleLaunchAttack}
              disabled={loading || !targetSigId}
              className="btn-primary w-full"
            >
              <Play className={`w-4 h-4 fill-charcoal ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Executing Attack & Verifying State...' : `Run ${activeVector.name} Simulation`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 4: POST-ATTACK VERIFICATION & ATTACK RESULTS SECTION */}
      {attackResult && postAttackVerif && (
        <div className="bg-white rounded-2xl p-6 border border-amber-300 shadow-sm space-y-6 animate-in fade-in">
          {/* Header Verdict: Post-Attack Verification */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-700">
                <ShieldAlert className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-charcoal">
                    Post-Attack Signature Verification
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold ${
                      postAttackVerif.verification_status === 'REJECTED'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                  >
                    STATUS: {postAttackVerif.verification_status} (SECOND VERIFICATION)
                  </span>
                </div>
                <p className="text-xs text-secondary mt-1 font-mono">
                  Attack ID: <strong className="text-charcoal">{attackResult.attack_id}</strong> &bull; Vector: {attackResult.attack_type.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Post-Attack Invariants Strip */}
            <div className="flex items-center gap-3 text-xs font-mono text-charcoal">
              <div className="p-2.5 rounded-xl bg-surface border border-[#EAEAEA] text-center min-w-[95px]">
                <span className="text-[10px] font-semibold text-secondary uppercase block font-sans">Error (QBER)</span>
                <strong className={`text-base font-bold tracking-tight tabular-nums block mt-0.5 ${postAttackVerif.qber > 0.15 ? 'text-danger' : 'text-success'}`}>
                  {(postAttackVerif.qber * 100).toFixed(1)}%
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-surface border border-[#EAEAEA] text-center min-w-[95px]">
                <span className="text-[10px] font-semibold text-secondary uppercase block font-sans">Verification</span>
                <strong className="text-base font-bold text-danger block mt-0.5">
                  {postAttackVerif.verification_status}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-surface border border-[#EAEAEA] text-center min-w-[95px]">
                <span className="text-[10px] font-semibold text-secondary uppercase block font-sans">Tokens</span>
                <strong className="text-base font-bold text-charcoal block mt-0.5">
                  {postAttackVerif.measurement_counts.matches}/{postAttackVerif.token_verifications.length} OK
                </strong>
              </div>
            </div>
          </div>

          {/* Comparison Note Banner */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Deterministic Physics Invariant Triggered:</span>
            <p>
              The clean signature state (initially verified as <strong>LEGITIMATE</strong> with 0.0% QBER) was physically disturbed by the simulated {attackResult.attack_type.replace('_', ' ')}. The second verification evaluated to <strong>{postAttackVerif.verification_status}</strong> (QBER = {(postAttackVerif.qber * 100).toFixed(1)}%).
            </p>
          </div>

          {/* Side-by-Side: Original State vs Manipulated State */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-surface border border-[#EAEAEA] space-y-2">
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block font-sans">
                Original Legitimate State (Initial Verification)
              </span>
              <pre className="bg-white p-3 rounded-xl border border-[#EAEAEA] text-charcoal overflow-x-auto text-[11px]">
                {JSON.stringify(attackResult.original_data, null, 2)}
              </pre>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-[#EAEAEA] space-y-2">
              <span className="text-[10px] text-danger font-bold uppercase tracking-wider block font-sans">
                Evidence: Manipulated State After Attack
              </span>
              <pre className="bg-white p-3 rounded-xl border border-[#EAEAEA] text-charcoal overflow-x-auto text-[11px]">
                {JSON.stringify(attackResult.manipulated_data, null, 2)}
              </pre>
            </div>
          </div>

          {/* Workflow Progression Button to Step 5 */}
          <div className="pt-4 border-t border-[#EAEAEA] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-charcoal block">Attack Executed &amp; Post-Attack Verification Complete</span>
              <span className="text-[11px] text-secondary">
                Proceed to Step 5 to evaluate physical thresholds (TVD, Fidelity, QBER) and classify the threat.
              </span>
            </div>

            <button
              onClick={() => {
                if (onContinueToDetection) {
                  onContinueToDetection({
                    signatureId: attackResult.target_signature_id,
                    attackId: attackResult.attack_id,
                    attackType: attackResult.attack_type,
                  });
                } else if (onNavigate) {
                  onNavigate('detection');
                }
              }}
              className="btn-primary shrink-0"
            >
              <span>Proceed to Step 5: Threat Detection</span>
              <ArrowRight className="w-4 h-4 text-charcoal" />
            </button>
          </div>
        </div>
      )}

      {/* Attack Simulation History Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-charcoal">Simulation Audit Log</h2>
            <p className="text-xs sm:text-sm text-secondary">Historical records of simulated attack executions</p>
          </div>
          <button
            onClick={loadData}
            className="btn-secondary !h-8 text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-surface text-charcoal-500 uppercase tracking-wider font-semibold border-b border-[#EAEAEA]">
                <tr>
                  <th className="py-3 px-4">Attack ID</th>
                  <th className="py-3 px-4">Vector</th>
                  <th className="py-3 px-4">Target Sig</th>
                  <th className="py-3 px-4">Attacker</th>
                  <th className="py-3 px-4">Deviation</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-secondary">
                      No attack simulations executed yet.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.attack_id} className="hover:bg-yellow-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-charcoal">{h.attack_id}</td>
                      <td className="py-3 px-4 font-semibold text-charcoal">{h.attack_type.toUpperCase().replace('_', ' ')}</td>
                      <td className="py-3 px-4 font-mono text-secondary text-[11px]">{h.target_signature_id}</td>
                      <td className="py-3 px-4 font-mono text-secondary">{h.attacker_id}</td>
                      <td className="py-3 px-4 font-mono font-bold text-charcoal">{(h.statistical_deviation * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 text-secondary text-[11px] font-mono">
                        {new Date(h.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
