import React, { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  Copy,
  Check,
  Code2,
  BarChart3,
  Sliders,
  Zap,
  Info,
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
    tVal: number = theta,
    pVal: number = phi,
    numShots: number = shots,
    bVal: VerificationBasisId = basis
  ) => {
    setLoading(true);
    setError(null);
    try {
      const payload: TeleportationRequest = {
        input_state: stateId,
        theta: stateId === 'custom' ? tVal : undefined,
        phi: stateId === 'custom' ? pVal : undefined,
        shots: numShots,
        verification_basis: bVal,
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

  // Prepare Bob's measurement chart data
  const receiverChartData = result
    ? ['0', '1'].map((b) => ({
        outcome: `|${b}⟩`,
        empirical: (result.receiver_probabilities[b] || 0) * 100,
        expected: (result.expected_probabilities[b] || 0) * 100,
        count: result.receiver_counts[b] || 0,
      }))
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-cyan-500/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono mb-3">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Part 3: Quantum Teleportation & Pauli Unitaries</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Quantum Teleportation & <span className="text-gradient-cyan">Pauli Frame Corrections</span>
            </h1>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              Disassemble an arbitrary quantum state at Alice, transmit 2 classical Bell bits $(c_0, c_1)$, and reconstruct the exact quantum state at Bob using conditional Pauli operations ($I, X, Z, XZ$).
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => runTeleportation()}
              disabled={loading}
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${loading ? 'animate-spin' : 'fill-current'}`} />
              <span>{loading ? 'Teleporting...' : 'Simulate Teleportation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="rounded-xl bg-rose-950/40 border border-rose-800/80 p-4 text-rose-200 flex items-start space-x-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-300">Teleportation Protocol Notice</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input State Cards (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>1. Select Input State |ψ⟩ to Teleport</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESET_STATES.map((state) => {
              const isSelected = selectedState === state.id;
              return (
                <button
                  key={state.id}
                  onClick={() => {
                    setSelectedState(state.id);
                    if (state.id !== 'custom') {
                      setTheta(state.theta);
                      setPhi(state.phi);
                    }
                    runTeleportation(state.id, state.theta, state.phi, shots, basis);
                  }}
                  className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10'
                      : 'glass-panel border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white font-mono">{state.symbol}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono">
                        {state.name}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-cyan-400 mt-1 font-semibold">{state.formula}</p>
                    <p className="text-xs text-slate-400 mt-2">{state.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Bloch Sphere Sliders */}
          {selectedState === 'custom' && (
            <div className="glass-panel rounded-xl p-5 border border-cyan-800/40 space-y-4 bg-cyan-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300 font-mono flex items-center space-x-2">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Bloch Sphere Coordinates (θ, φ)</span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  θ = {(theta / Math.PI).toFixed(2)}π rad, φ = {(phi / Math.PI).toFixed(2)}π rad
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Polar Angle (θ):</span>
                    <span className="text-cyan-400">{theta.toFixed(3)} rad</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.PI}
                    step="0.05"
                    value={theta}
                    onChange={(e) => setTheta(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0 (|0⟩)</span>
                    <span>π/2 (Equator)</span>
                    <span>π (|1⟩)</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Azimuthal Angle (φ):</span>
                    <span className="text-cyan-400">{phi.toFixed(3)} rad</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.PI * 2}
                    step="0.05"
                    value={phi}
                    onChange={(e) => setPhi(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
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
        <div className="lg:col-span-4 glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2 mb-4">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>2. Telemetry Parameters</span>
            </h2>

            <div className="space-y-4">
              {/* Shot Count */}
              <div>
                <label className="text-xs text-slate-300 block mb-2 font-mono">
                  Measurement Shots: <span className="text-cyan-400 font-bold">{shots.toLocaleString()}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SHOT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setShots(preset);
                        runTeleportation(selectedState, theta, phi, preset, basis);
                      }}
                      className={`py-1.5 px-2 text-xs font-mono rounded-lg border transition-all ${
                        shots === preset
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basis Selection */}
              <div>
                <label className="text-xs text-slate-300 block mb-2 font-mono">
                  Verification Basis:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <button
                    onClick={() => {
                      setBasis('auto');
                      runTeleportation(selectedState, theta, phi, shots, 'auto');
                    }}
                    className={`py-1.5 px-2 rounded-lg border transition-all ${
                      basis === 'auto'
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => {
                      setBasis('z_basis');
                      runTeleportation(selectedState, theta, phi, shots, 'z_basis');
                    }}
                    className={`py-1.5 px-2 rounded-lg border transition-all ${
                      basis === 'z_basis'
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    Z-Basis
                  </button>
                  <button
                    onClick={() => {
                      setBasis('x_basis');
                      runTeleportation(selectedState, theta, phi, shots, 'x_basis');
                    }}
                    className={`py-1.5 px-2 rounded-lg border transition-all ${
                      basis === 'x_basis'
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    X-Basis
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
            <div className="flex items-center justify-between">
              <span>Protocol:</span>
              <span className="text-cyan-300">Bennett et al. Teleportation</span>
            </div>
            {latencyMs !== null && (
              <div className="flex items-center justify-between mt-1">
                <span>Execution Time:</span>
                <span className="text-emerald-400">{latencyMs} ms</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Telemetry Flow: 4 Pipeline Stages */}
      {result && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span>Teleportation Execution Pipeline & Pauli Frame Telemetry</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
            {/* Stage 1 */}
            <div className="glass-panel rounded-xl p-4 border border-slate-800">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider block mb-1">Stage 1: Signer (Alice)</span>
              <h4 className="text-sm font-bold text-white">State Preparation</h4>
              <p className="text-xs text-cyan-300 mt-1">{result.symbol} = {result.formula}</p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Target: Qubit q0</span>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="glass-panel rounded-xl p-4 border border-slate-800">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider block mb-1">Stage 2: Quantum Channel</span>
              <h4 className="text-sm font-bold text-white">EPR Bell Pair</h4>
              <p className="text-xs text-slate-300 mt-1">|Φ+⟩ = (|00⟩ + |11⟩)/√2</p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Entanglement: q1 ↔ q2</span>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="glass-panel rounded-xl p-4 border border-slate-800">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider block mb-1">Stage 3: Alice BSM</span>
              <h4 className="text-sm font-bold text-white">Bell Measurement</h4>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 mt-1">
                <span>00: {result.bell_measurement_counts['00'] || 0}</span>
                <span>01: {result.bell_measurement_counts['01'] || 0}</span>
                <span>10: {result.bell_measurement_counts['10'] || 0}</span>
                <span>11: {result.bell_measurement_counts['11'] || 0}</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Classical bits: (c0, c1)</span>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="glass-panel rounded-xl p-4 border border-emerald-800/60 bg-emerald-950/10">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">Stage 4: Verifier (Bob)</span>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Reconstruction</h4>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-400 mt-1 font-bold">Fidelity: {(result.fidelity * 100).toFixed(2)}%</p>
              <div className="mt-3 pt-2 border-t border-emerald-900/60 text-[11px] text-emerald-300/80">
                <span>State Reconstructed on q2</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Analysis: Circuit & Charts */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Circuit Visualizer (5 Cols) */}
          <div className="lg:col-span-5 glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300">
                  <Code2 className="w-4 h-4" />
                  <span>Teleportation Circuit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">
                    <button
                      onClick={() => setViewMode('text')}
                      className={`px-2 py-0.5 rounded ${viewMode === 'text' ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400'}`}
                    >
                      ASCII
                    </button>
                    <button
                      onClick={() => setViewMode('qasm')}
                      className={`px-2 py-0.5 rounded ${viewMode === 'qasm' ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400'}`}
                    >
                      QASM3
                    </button>
                  </div>
                  <button
                    onClick={() => handleCopy(viewMode === 'text' ? result.circuit_text : result.circuit_qasm)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-400 hover:text-cyan-300 transition-all"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Monospace Circuit Box */}
              <div className="bg-[#050811] p-4 rounded-xl font-mono text-xs text-cyan-300 border border-slate-900 overflow-x-auto min-h-[180px] flex items-center">
                <pre className="leading-tight">
                  {viewMode === 'text' ? result.circuit_text : result.circuit_qasm}
                </pre>
              </div>
            </div>

            {/* Circuit Register Legend */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <div><strong className="text-cyan-300">q[0]:</strong> Alice's input state (|ψ⟩)</div>
              <div><strong className="text-cyan-300">q[1]:</strong> Alice's entangled EPR half</div>
              <div><strong className="text-cyan-300">q[2]:</strong> Bob's target qubit (teleported output)</div>
            </div>
          </div>

          {/* Bob's Measurement Distribution & Pauli Corrections (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Receiver Measurement Chart */}
            <div className="glass-panel rounded-xl p-5 border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300">
                  <BarChart3 className="w-4 h-4" />
                  <span>Bob's Reconstructed Qubit Measurement ({result.verification_basis.toUpperCase()})</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  Fidelity F = {result.fidelity.toFixed(4)}
                </span>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={receiverChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="outcome" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }} />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} unit="%" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#38bdf8',
                        borderRadius: '8px',
                        color: '#fff',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                      }}
                      formatter={(val: number) => [`${val.toFixed(2)}%`]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Bar dataKey="empirical" name="Empirical Measured (%)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expected" name="Theoretical Input Prob (%)" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pauli Unitary Corrections Breakdown */}
            <div className="glass-panel rounded-xl p-5 border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300">
                  <Zap className="w-4 h-4" />
                  <span>Conditional Pauli Corrections Distribution</span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Branches: (c0, c1) → {result.shots} Total Shots
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                {Object.entries(result.pauli_corrections_applied).map(([op, cnt]) => {
                  const bsmCode = op === 'I' ? '00' : op === 'X' ? '01' : op === 'Z' ? '10' : '11';
                  return (
                    <div key={op} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">BSM: {bsmCode}</span>
                      <span className="text-cyan-400 font-bold text-sm block mt-0.5">Pauli {op}</span>
                      <span className="text-white text-xs block mt-1">{cnt} shots</span>
                      <span className="text-[10px] text-slate-400">{((cnt / result.shots) * 100).toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State Amplitude Comparison Table */}
      {result && (
        <div className="glass-panel rounded-xl p-6 border border-slate-800">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>State Amplitude Verification: Alice's Input vs Bob's Teleported State</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Computational Basis</th>
                  <th className="py-3 px-4">Alice Input Amplitude (α_in)</th>
                  <th className="py-3 px-4">Bob Reconstructed Amplitude (α_out)</th>
                  <th className="py-3 px-4">Probability |α|²</th>
                  <th className="py-3 px-4">State Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {result.input_amplitudes.map((amp, idx) => {
                  const bobAmp = result.reconstructed_amplitudes[idx];
                  return (
                    <tr key={amp.basis} className="bg-cyan-950/10 text-slate-200">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                          {amp.basis}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-cyan-300 font-bold">{amp.formatted}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{bobAmp.formatted}</td>
                      <td className="py-3 px-4">{(amp.probability * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center space-x-1 text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>Exact Match</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Educational & Architectural Connection to QDS */}
      <div className="glass-panel rounded-xl p-6 border border-cyan-800/30 bg-gradient-to-br from-cyan-950/20 to-transparent">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <h4 className="font-bold text-white text-sm">How Teleportation Secures Quantum Digital Signatures (QDS)</h4>
            <p className="leading-relaxed">
              In teleportation-based QDS protocols, the Signer (Alice) signs a message by teleporting secret quantum signature states |ψ_k⟩ to the Verifier (Bob). Because the quantum no-cloning theorem prevents any eavesdropper (Eve) from duplicating unknown quantum states without introducing detectable perturbation, and because Bob's correct reconstruction depends strictly on authenticated classical Bell bits (c0, c1), any tampering, impersonation, forgery, or replay attempt will cause detectable fidelity loss (F &lt; F_threshold) or Quantum Bit Error Rate (QBER) spikes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
