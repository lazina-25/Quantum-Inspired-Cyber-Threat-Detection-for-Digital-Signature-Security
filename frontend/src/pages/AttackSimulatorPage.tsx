import React, { useState, useEffect } from 'react';
import {
  Skull,
  ShieldAlert,
  Flame,
  UserX,
  History,
  Radio,
  Lock,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Database,
  Info
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
import { listSignaturesApi, createSignatureApi } from '../services/signatureApi';
import { SignatureListItem } from '../types/signature';

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
    name: '1. Signature Forgery',
    threatCode: 'THREAT-FORGERY-01',
    icon: Skull,
    badgeColor: 'border-rose-700 bg-rose-950/60 text-rose-300',
    description: 'Attacker creates altered message or modifies quantum state expectations to forge a valid signature.',
    targetMechanism: 'Message Hash Tampering & Quantum Token Substitution',
  },
  {
    id: 'impersonation',
    name: '2. Signer Impersonation',
    threatCode: 'THREAT-IMPERSONATION-02',
    icon: UserX,
    badgeColor: 'border-amber-700 bg-amber-950/60 text-amber-300',
    description: 'Rogue adversary signs messages masquerading as the legitimate signer without the secret key seed.',
    targetMechanism: 'Identity Spoofing & Asymmetric Parity Mismatch',
  },
  {
    id: 'replay',
    name: '3. Replay Attack',
    threatCode: 'THREAT-REPLAY-03',
    icon: History,
    badgeColor: 'border-orange-700 bg-orange-950/60 text-orange-300',
    description: 'Adversary re-transmits a previously valid signature or reuses a stale session nonce to duplicate transactions.',
    targetMechanism: 'Stale Timestamps & Nonce Collision',
  },
  {
    id: 'channel_manipulation',
    name: '4. Quantum Channel Noise',
    threatCode: 'THREAT-CHANNEL-04',
    icon: Radio,
    badgeColor: 'border-purple-700 bg-purple-950/60 text-purple-300',
    description: 'Injects depolarizing noise, intercept-resend eavesdropping, or bit/phase flips into the EPR quantum channel.',
    targetMechanism: 'EPR Depolarization & QBER Elevation (> 15%)',
  },
  {
    id: 'unauthorized_verification',
    name: '5. Unauthorized Verification',
    threatCode: 'THREAT-UNAUTH-05',
    icon: Lock,
    badgeColor: 'border-cyan-700 bg-cyan-950/60 text-cyan-300',
    description: 'Unregistered or rogue verifier attempts to access Alice’s signature without authorization.',
    targetMechanism: 'Rogue Verifier Probe & Unallocated Basis Access',
  },
];

export const AttackSimulatorPage: React.FC = () => {
  const [selectedAttack, setSelectedAttack] = useState<AttackTypeId>('forgery');
  const [signatures, setSignatures] = useState<SignatureListItem[]>([]);
  const [targetSigId, setTargetSigId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [attackResult, setAttackResult] = useState<AttackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AttackHistoryItem[]>([]);

  // Attack-specific parameter states
  // 1. Forgery
  const [forgedMessage, setForgedMessage] = useState<string>(
    'FORGED_PAYLOAD: Divert $500,000 to Attacker Swiss Account #991.'
  );
  const [tamperRatio, setTamperRatio] = useState<number>(1.0);

  // 2. Impersonation
  const [spoofedSignerId, setSpoofedSignerId] = useState<string>('alice_signer_01');
  const [attackerId, setAttackerId] = useState<string>('mallory_impersonator_99');

  // 3. Replay
  const [stalenessSeconds, setStalenessSeconds] = useState<number>(7200);

  // 4. Channel Manipulation
  const [noiseType, setNoiseType] = useState<'depolarizing' | 'intercept_resend' | 'bit_flip' | 'phase_flip'>('depolarizing');
  const [noiseIntensity, setNoiseIntensity] = useState<number>(0.50);

  // 5. Unauthorized Verification
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

  const handleCreateDemoSignature = async () => {
    try {
      const res = await createSignatureApi({
        signer_id: 'alice_signer_01',
        public_identity: 'Alice Quantum Signer Node',
        message_content: 'LEGITIMATE_TRANSACTION: Transfer $100,000 to Authorized Node.',
        shots: 1024,
        token_count: 4,
      });
      setTargetSigId(res.data.signature_id);
      loadData();
    } catch (err) {
      console.error('Failed to create demo signature', err);
    }
  };

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
      const hist = await getAttackHistoryApi();
      setHistory(hist);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Attack simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-rose-500/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-mono mb-3">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Part 5: Cyber Threat Simulation Framework</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Quantum Cyber Threat <span className="text-gradient-cyan">& Attack Simulator</span>
            </h1>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              Execute controlled simulations of the 5 core threat vectors against teleportation-based QDS protocols. Generates realistic quantum state anomalies, QBER spikes, and basis mismatches for deterministic threat detection.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLaunchAttack}
              disabled={loading || !targetSigId}
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-sm shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
            >
              <Skull className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Simulating Threat Vector...' : 'Execute Attack Simulation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="rounded-xl bg-rose-950/40 border border-rose-800 p-4 text-rose-200 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Attack Vector Selection Cards (5 Vectors) */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>1. Select Threat Vector to Simulate</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {ATTACK_VECTORS.map((vec) => {
            const isSelected = selectedAttack === vec.id;
            const Icon = vec.icon;
            return (
              <button
                key={vec.id}
                onClick={() => setSelectedAttack(vec.id)}
                className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-rose-950/30 border-rose-500 shadow-lg shadow-rose-500/10'
                    : 'glass-panel border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-rose-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {vec.threatCode.split('-')[1]}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-xs">{vec.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-3 leading-relaxed">{vec.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-cyan-300">
                  {vec.targetMechanism.split('&')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Signature & Attack Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Target Signature (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>2. Target Signature / Session</span>
              </h3>
              <button
                onClick={handleCreateDemoSignature}
                className="text-[11px] text-cyan-400 hover:underline font-mono"
              >
                + Demo Signature
              </button>
            </div>

            {signatures.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 text-center space-y-2">
                <p>No signatures in SQLite yet.</p>
                <button
                  onClick={handleCreateDemoSignature}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 font-sans"
                >
                  Generate Target Signature
                </button>
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Target Signature Record:</label>
                  <select
                    value={targetSigId}
                    onChange={(e) => setTargetSigId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    {signatures.map((s) => (
                      <option key={s.signature_id} value={s.signature_id}>
                        {s.signature_id} ({s.signer_id} - {s.token_count} Qubits)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div>Target ID: <strong className="text-white">{targetSigId}</strong></div>
                  <div>Attacker Node: <code className="text-rose-400">eve_adversary_node_01</code></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="text-amber-400 font-semibold block mb-1">Simulation Guardrail:</span>
            <span>Controlled adversary model producing measurable quantum & statistical anomalies. Zero AI/ML.</span>
          </div>
        </div>

        {/* Right: Dynamic Parameters for Selected Vector (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-rose-400" />
            <span>3. Configure Attack Scenario Parameters</span>
          </h3>

          {/* 1. Forgery Params */}
          {selectedAttack === 'forgery' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Forged / Modified Message Text:</label>
                <textarea
                  rows={3}
                  value={forgedMessage}
                  onChange={(e) => setForgedMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-rose-200 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Quantum Token Tampering Ratio:</span>
                  <span className="text-rose-400 font-bold">{(tamperRatio * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="1.0"
                  step="0.25"
                  value={tamperRatio}
                  onChange={(e) => setTamperRatio(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>
          )}

          {/* 2. Impersonation Params */}
          {selectedAttack === 'impersonation' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Spoofed Signer Identity:</label>
                <input
                  type="text"
                  value={spoofedSignerId}
                  onChange={(e) => setSpoofedSignerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Adversary Actual Node ID:</label>
                <input
                  type="text"
                  value={attackerId}
                  onChange={(e) => setAttackerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-rose-300 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          {/* 3. Replay Params */}
          {selectedAttack === 'replay' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Timestamp Staleness Delta:</span>
                  <span className="text-orange-400 font-bold">{stalenessSeconds} seconds ({stalenessSeconds / 3600} hours)</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="14400"
                  step="300"
                  value={stalenessSeconds}
                  onChange={(e) => setStalenessSeconds(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
              <div className="p-3 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                <span>Simulation will resubmit duplicate session nonce outside legitimate validity window.</span>
              </div>
            </div>
          )}

          {/* 4. Channel Manipulation Params */}
          {selectedAttack === 'channel_manipulation' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Quantum Channel Noise Model:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['depolarizing', 'intercept_resend', 'bit_flip', 'phase_flip'] as const).map((model) => (
                    <button
                      key={model}
                      onClick={() => setNoiseType(model)}
                      className={`py-2 px-2 text-[11px] rounded-lg border transition-all ${
                        noiseType === model
                          ? 'bg-purple-950 border-purple-500 text-purple-300'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400'
                      }`}
                    >
                      {model.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Noise Corruption Intensity (λ):</span>
                  <span className="text-purple-400 font-bold">{(noiseIntensity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.0"
                  step="0.05"
                  value={noiseIntensity}
                  onChange={(e) => setNoiseIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          )}

          {/* 5. Unauthorized Verification Params */}
          {selectedAttack === 'unauthorized_verification' && (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Unauthorized Verifier Identity:</label>
                <input
                  type="text"
                  value={unauthVerifierId}
                  onChange={(e) => setUnauthVerifierId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="p-3 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                <span>Rogue entity will attempt to probe measurement bases without authorized asymmetric keys.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attack Results Dashboard */}
      {attackResult && (
        <div className="glass-panel rounded-xl p-6 border border-rose-800/80 bg-rose-950/15 space-y-6">
          {/* Header Verdict */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-900/60">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-rose-950 border border-rose-700 text-rose-400">
                <Skull className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-extrabold text-white">
                    ATTACK SIMULATION COMPLETED
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-700 text-rose-300 font-mono font-bold">
                    {attackResult.attack_type.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-rose-200 mt-1 font-mono">
                  Attack ID: <strong>{attackResult.attack_id}</strong> &bull; Target: <code className="text-white">{attackResult.target_signature_id}</code>
                </p>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-300">
              <div>Statistical Deviation: <strong className="text-rose-400">{(attackResult.statistical_deviation * 100).toFixed(1)}%</strong></div>
              <div>Expected Outcome: <strong className="text-amber-300">{attackResult.expected_outcome}</strong></div>
            </div>
          </div>

          {/* Side-by-Side: Original State vs Manipulated State */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
            {/* Original State */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                Original Legitimate State
              </span>
              <pre className="bg-[#050811] p-3 rounded-lg text-emerald-300 overflow-x-auto text-[11px]">
                {JSON.stringify(attackResult.original_data, null, 2)}
              </pre>
            </div>

            {/* Manipulated State */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-900/80 space-y-2">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
                Adversary Manipulated State & Quantum Anomaly
              </span>
              <pre className="bg-[#050811] p-3 rounded-lg text-rose-300 overflow-x-auto text-[11px]">
                {JSON.stringify(attackResult.manipulated_data, null, 2)}
              </pre>
            </div>
          </div>

          {/* Telemetry Indicator Metrics */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2">
              Resulting Anomaly Metrics (For Part 6 Threat Detection Engine)
            </h4>
            <pre className="bg-[#050811] p-3 rounded-lg text-cyan-300 font-mono text-xs overflow-x-auto">
              {JSON.stringify(attackResult.resulting_measurements, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Attack Simulation History Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Attack Simulation Audit Log ({history.length} Scenarios Recorded)</span>
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
            No cyber attack scenarios executed yet.
          </div>
        ) : (
          <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Attack ID</th>
                    <th className="py-3 px-4">Threat Type</th>
                    <th className="py-3 px-4">Target Signature</th>
                    <th className="py-3 px-4">Attacker Node</th>
                    <th className="py-3 px-4">Anomaly Score</th>
                    <th className="py-3 px-4">Expected Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((h) => (
                    <tr key={h.attack_id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 text-rose-300 font-bold">{h.attack_id}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px]">
                          {h.attack_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{h.target_signature_id}</td>
                      <td className="py-3 px-4 text-rose-400">{h.attacker_id}</td>
                      <td className="py-3 px-4 font-bold text-white">{(h.statistical_deviation * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 text-amber-400 text-[11px]">{h.expected_outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Educational Callout on Threat Vectors */}
      <div className="glass-panel rounded-xl p-6 border border-rose-900/40 bg-gradient-to-br from-rose-950/20 to-transparent">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <h4 className="font-bold text-white text-sm">How Attack Simulation Feeds into Deterministic Threat Detection</h4>
            <p className="leading-relaxed">
              In Part 6, the <strong>Threat Detection Engine</strong> will ingest the measurement anomalies produced by this attack suite. By continuously evaluating state fidelity F(&rho;, &sigma;), basis parity &Delta;parity, non-monotonic session counters, and Quantum Bit Error Rate (QBER &gt; QBER_threshold), the system will flag and neutralize all 5 threat vectors deterministically without AI or Machine Learning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
