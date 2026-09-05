import React, { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  Copy,
  Check,
  Code2,
  BarChart3,
  Sliders,
  CheckCircle2,
  GitBranch,
  Layers,
  Sparkles,
  ShieldAlert
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
  InputStateId,
  VerificationBasisId,
  TeleportationResponse,
  TeleportationRequest,
} from '../types/teleportation';
import { simulateTeleportationApi } from '../services/teleportationApi';

const PRESET_STATES: {
  id: InputStateId;
  name: string;
  symbol: string;
  formula: string;
  description: string;
  theta: number;
  phi: number;
}[] = [
  {
    id: 'plus',
    name: 'Plus State',
    symbol: '|+⟩',
    formula: '(|0⟩ + |1⟩) / √2',
    description: 'Equal superposition on X-axis (θ = π/2, φ = 0)',
    theta: Math.PI / 2,
    phi: 0,
  },
  {
    id: 'zero',
    name: 'Ground State',
    symbol: '|0⟩',
    formula: '|0⟩',
    description: 'Computational North pole (θ = 0, φ = 0)',
    theta: 0,
    phi: 0,
  },
  {
    id: 'one',
    name: 'Excited State',
    symbol: '|1⟩',
    formula: '|1⟩',
    description: 'Computational South pole (θ = π, φ = 0)',
    theta: Math.PI,
    phi: 0,
  },
  {
    id: 'minus',
    name: 'Minus State',
    symbol: '|-⟩',
    formula: '(|0⟩ - |1⟩) / √2',
    description: 'Equal superposition with phase π (θ = π/2, φ = π)',
    theta: Math.PI / 2,
    phi: Math.PI,
  },
  {
    id: 'custom',
    name: 'Custom Bloch State',
    symbol: '|ψ(θ,φ)⟩',
    formula: 'cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩',
    description: 'Arbitrary single-qubit quantum state on the Bloch sphere',
    theta: Math.PI / 3,
    phi: Math.PI / 4,
  },
];

const SHOT_PRESETS = [256, 512, 1024, 2048, 4096];

export const QuantumTeleportationPage: React.FC = () => {
  const [selectedState, setSelectedState] = useState<InputStateId>('plus');
  const [theta, setTheta] = useState<number>(Math.PI / 3);
  const [phi, setPhi] = useState<number>(Math.PI / 4);
  const [shots, setShots] = useState<number>(1024);
  const [basis, setBasis] = useState<VerificationBasisId>('auto');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TeleportationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'qasm'>('text');
  const [copied, setCopied] = useState<boolean>(false);

  const runTeleportation = async (
    stateId: InputStateId = selectedState,
    t: number = theta,
    p: number = phi,
    s: number = shots,
    b: VerificationBasisId = basis
  ) => {
    setLoading(true);
    setError(null);
    try {
      const payload: TeleportationRequest = {
        input_state: stateId,
        theta: stateId === 'custom' ? t : undefined,
        phi: stateId === 'custom' ? p : undefined,
        shots: s,
        verification_basis: b,
      };
      const resp = await simulateTeleportationApi(payload);
      setResult(resp.data);
      setLatencyMs(resp.latencyMs);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Teleportation simulation failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTeleportation('plus', Math.PI / 2, 0, 1024, 'auto');
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prepare Bob measurement data for Recharts
  const chartData = result
    ? Object.keys(result.receiver_counts).map((bit) => {
        const count = result.receiver_counts[bit] || 0;
        const empirical = result.receiver_probabilities[bit] ? result.receiver_probabilities[bit] * 100 : 0;
        const theoretical = result.expected_probabilities[bit]
          ? result.expected_probabilities[bit] * 100
          : 0;
        return {
          bit: `Outcome |${bit}⟩`,
          empirical,
          theoretical,
          count,
        };
      })
    : [];

  return (
    <div className="space-y-6">
      {/* What It Does & Why It Matters Explainer */}
      <div className="bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-charcoal font-bold text-xs uppercase tracking-wider">
            <Radio className="w-4 h-4 text-yellow-600" />
            <span>What It Does</span>
          </div>
          <h2 className="text-base font-bold text-charcoal">Quantum State Teleportation Protocol</h2>
          <p className="text-xs text-charcoal-500 leading-relaxed">
            Transfers an unknown quantum state using quantum entanglement and classical communication. Alice measures her qubit together with one half of a Bell pair, transmits 2 classical bits to Bob, and Bob applies conditional quantum corrections to reconstruct the exact state.
          </p>
        </div>

        <div className="space-y-2 md:border-l md:border-[#EAEAEA] md:pl-6">
          <div className="flex items-center space-x-2 text-charcoal font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-yellow-600" />
            <span>Why It Matters</span>
          </div>
          <h2 className="text-base font-bold text-charcoal">QDS Message Verification</h2>
          <p className="text-xs text-charcoal-500 leading-relaxed">
            In Quantum Digital Signatures, signature tokens are teleported without transmitting the physical state over an open fiber channel. Verifiers reconstruct tokens using quantum corrections, guaranteeing message integrity without vulnerability to forgery.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-danger flex items-start space-x-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Teleportation Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Controls: Input State Selection & Telemetry Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input State Selection (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-charcoal flex items-center space-x-2">
              <Layers className="w-4 h-4 text-yellow-600" />
              <span>1. Choose Quantum State to Teleport (Alice's Qubit q0)</span>
            </h3>
            <span className="text-xs text-charcoal-500">Inputs & Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_STATES.map((state) => {
              const isSelected = selectedState === state.id;
              return (
                <button
                  key={state.id}
                  onClick={() => {
                    setSelectedState(state.id);
                    if (state.id !== 'custom') {
                      runTeleportation(state.id, state.theta, state.phi, shots, basis);
                    }
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-yellow-50 border-yellow-400 shadow-xs'
                      : 'bg-white border-[#EAEAEA] hover:border-yellow-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-charcoal font-mono">{state.symbol}</span>
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-surface text-charcoal font-bold font-mono border border-[#EAEAEA]">
                      {state.name}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-charcoal-700 mt-1 font-semibold">{state.formula}</p>
                  <p className="text-xs text-charcoal-500 mt-2 line-clamp-2">{state.description}</p>
                </button>
              );
            })}
          </div>

          {/* Custom Bloch Sphere Sliders */}
          {selectedState === 'custom' && (
            <div className="p-5 rounded-2xl bg-white border border-[#EAEAEA] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                  Bloch Sphere Coordinates
                </span>
                <span className="text-xs font-mono text-charcoal-500">
                  θ = {(theta / Math.PI).toFixed(2)}π rad, φ = {(phi / Math.PI).toFixed(2)}π rad
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-charcoal-600 mb-1">
                    <span>Polar Angle (θ):</span>
                    <span className="text-charcoal font-bold">{theta.toFixed(3)} rad</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.PI}
                    step="0.05"
                    value={theta}
                    onChange={(e) => setTheta(Number(e.target.value))}
                    className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <div className="flex justify-between text-[10px] text-charcoal-400 mt-1">
                    <span>0 (|0⟩)</span>
                    <span>π/2 (Equator)</span>
                    <span>π (|1⟩)</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-charcoal-600 mb-1">
                    <span>Azimuthal Angle (φ):</span>
                    <span className="text-charcoal font-bold">{phi.toFixed(3)} rad</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.PI * 2}
                    step="0.05"
                    value={phi}
                    onChange={(e) => setPhi(Number(e.target.value))}
                    className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <div className="flex justify-between text-[10px] text-charcoal-400 mt-1">
                    <span>0 (X-axis)</span>
                    <span>π/2 (Y-axis)</span>
                    <span>2π</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Shots & Basis Settings (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-charcoal flex items-center space-x-2 mb-4">
              <Sliders className="w-4 h-4 text-yellow-600" />
              <span>2. Simulation Settings</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-charcoal-600 block mb-2 font-medium">
                  Measurement Shots: <span className="text-charcoal font-bold font-mono">{shots.toLocaleString()}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SHOT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setShots(preset);
                        runTeleportation(selectedState, theta, phi, preset, basis);
                      }}
                      className={`py-1.5 px-2 text-xs font-mono rounded-xl border transition-all ${
                        shots === preset
                          ? 'bg-yellow-400 text-charcoal font-bold border-yellow-400 shadow-xs'
                          : 'bg-surface border-[#EAEAEA] text-charcoal-600 hover:bg-yellow-50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-charcoal-600 block mb-2 font-medium">
                  Verification Basis:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <button
                    onClick={() => {
                      setBasis('auto');
                      runTeleportation(selectedState, theta, phi, shots, 'auto');
                    }}
                    className={`py-1.5 px-2 rounded-xl border transition-all ${
                      basis === 'auto'
                        ? 'bg-yellow-400 text-charcoal font-bold border-yellow-400 shadow-xs'
                        : 'bg-surface border-[#EAEAEA] text-charcoal-600 hover:bg-yellow-50'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => {
                      setBasis('z_basis');
                      runTeleportation(selectedState, theta, phi, shots, 'z_basis');
                    }}
                    className={`py-1.5 px-2 rounded-xl border transition-all ${
                      basis === 'z_basis'
                        ? 'bg-yellow-400 text-charcoal font-bold border-yellow-400 shadow-xs'
                        : 'bg-surface border-[#EAEAEA] text-charcoal-600 hover:bg-yellow-50'
                    }`}
                  >
                    Z-Basis
                  </button>
                  <button
                    onClick={() => {
                      setBasis('x_basis');
                      runTeleportation(selectedState, theta, phi, shots, 'x_basis');
                    }}
                    className={`py-1.5 px-2 rounded-xl border transition-all ${
                      basis === 'x_basis'
                        ? 'bg-yellow-400 text-charcoal font-bold border-yellow-400 shadow-xs'
                        : 'bg-surface border-[#EAEAEA] text-charcoal-600 hover:bg-yellow-50'
                    }`}
                  >
                    X-Basis
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAEAEA] mt-6">
            <button
              onClick={() => runTeleportation(selectedState, theta, phi, shots, basis)}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-charcoal font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-charcoal ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Executing Teleportation...' : 'Run Simulation'}</span>
            </button>

            {latencyMs !== null && (
              <div className="flex items-center justify-between mt-3 text-[11px] text-charcoal-400 font-mono">
                <span>Latency:</span>
                <span className="text-success font-semibold">{latencyMs} ms</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Telemetry Pipeline Stages */}
      {result && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-charcoal flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-yellow-600" />
            <span>Teleportation Execution Pipeline & Quantum Corrections</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            {/* Stage 1 */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAEAEA] shadow-sm">
              <span className="text-[10px] text-charcoal font-bold uppercase tracking-wider block mb-1">Stage 1: Signer (Alice)</span>
              <h4 className="text-sm font-bold text-charcoal">State Preparation</h4>
              <p className="text-xs text-charcoal-700 mt-1">{result.symbol} = {result.formula}</p>
              <div className="mt-3 pt-2 border-t border-[#EAEAEA] text-[11px] text-charcoal-500">
                <span>Target: Qubit q0</span>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAEAEA] shadow-sm">
              <span className="text-[10px] text-charcoal font-bold uppercase tracking-wider block mb-1">Stage 2: Quantum Channel</span>
              <h4 className="text-sm font-bold text-charcoal">EPR Bell Pair</h4>
              <p className="text-xs text-charcoal-600 mt-1">|Φ+⟩ = (|00⟩ + |11⟩)/√2</p>
              <div className="mt-3 pt-2 border-t border-[#EAEAEA] text-[11px] text-charcoal-500">
                <span>Entanglement: q1 &harr; q2</span>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAEAEA] shadow-sm">
              <span className="text-[10px] text-charcoal font-bold uppercase tracking-wider block mb-1">Stage 3: Measurement</span>
              <h4 className="text-sm font-bold text-charcoal">Bell Measurement</h4>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-charcoal-600 mt-1">
                <span>00: {result.bell_measurement_counts['00'] || 0}</span>
                <span>01: {result.bell_measurement_counts['01'] || 0}</span>
                <span>10: {result.bell_measurement_counts['10'] || 0}</span>
                <span>11: {result.bell_measurement_counts['11'] || 0}</span>
              </div>
              <div className="mt-3 pt-2 border-t border-[#EAEAEA] text-[11px] text-charcoal-500">
                <span>Classical bits: (c0, c1)</span>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="bg-white rounded-2xl p-4 border border-green-200 shadow-sm">
              <span className="text-[10px] text-success font-bold uppercase tracking-wider block mb-1">Stage 4: Verifier (Bob)</span>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-charcoal">Reconstruction</h4>
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <p className="text-xs text-success mt-1 font-bold">Fidelity: {(result.fidelity * 100).toFixed(1)}%</p>
              <div className="mt-3 pt-2 border-t border-[#EAEAEA] text-[11px] text-charcoal-500">
                <span>Target: Qubit q2 Reconstructed</span>
              </div>
            </div>
          </div>

          {/* Results: Circuit & Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Circuit Box (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] mb-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-charcoal">
                    <Code2 className="w-4 h-4 text-yellow-600" />
                    <span>3-Qubit Teleportation Circuit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex rounded-lg bg-surface p-0.5 text-xs font-mono border border-[#EAEAEA]">
                      <button
                        onClick={() => setViewMode('text')}
                        className={`px-2 py-0.5 rounded ${viewMode === 'text' ? 'bg-yellow-400 text-charcoal font-bold shadow-xs' : 'text-charcoal-500'}`}
                      >
                        ASCII
                      </button>
                      <button
                        onClick={() => setViewMode('qasm')}
                        className={`px-2 py-0.5 rounded ${viewMode === 'qasm' ? 'bg-yellow-400 text-charcoal font-bold shadow-xs' : 'text-charcoal-500'}`}
                      >
                        QASM3
                      </button>
                    </div>
                    <button
                      onClick={() => handleCopy(viewMode === 'text' ? result.circuit_text : result.circuit_qasm)}
                      className="p-1.5 rounded-lg border border-[#EAEAEA] hover:bg-yellow-50 text-charcoal transition-colors"
                      title="Copy circuit to clipboard"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-charcoal p-4 rounded-xl font-mono text-xs text-yellow-300 border border-charcoal-800 overflow-x-auto min-h-[160px] flex items-center">
                  <pre className="leading-tight">
                    {viewMode === 'text' ? result.circuit_text : result.circuit_qasm}
                  </pre>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#EAEAEA] grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded-xl bg-surface border border-[#EAEAEA]">
                  <span className="text-charcoal-400 block text-[10px] font-sans">Qubits</span>
                  <span className="text-charcoal font-bold">3 Qubits (q0, q1, q2)</span>
                </div>
                <div className="p-2 rounded-xl bg-surface border border-[#EAEAEA]">
                  <span className="text-charcoal-400 block text-[10px] font-sans">Protocol</span>
                  <span className="text-charcoal font-bold">Bennett Teleportation</span>
                </div>
              </div>
            </div>

            {/* Reconstructed Qubit Histogram (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] mb-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-charcoal">
                  <BarChart3 className="w-4 h-4 text-yellow-600" />
                  <span>Bob's Reconstructed Qubit (q2) Probability Distribution</span>
                </div>
                <span className="text-xs text-charcoal-500 font-mono">
                  Total Shots: <strong className="text-charcoal">{result.shots.toLocaleString()}</strong>
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                    <XAxis dataKey="bit" stroke="#6B6B6B" tick={{ fill: '#6B6B6B', fontSize: 12, fontFamily: 'monospace' }} />
                    <YAxis stroke="#6B6B6B" domain={[0, 100]} unit="%" tick={{ fill: '#6B6B6B', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#EAEAEA',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        color: '#171717',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                      }}
                      formatter={(val: number) => [`${val.toFixed(2)}%`]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Bar dataKey="empirical" name="Empirical Outcome (%)" fill="#F5C400" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="theoretical" name="Ideal Theoretical Expectation (%)" fill="#171717" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
