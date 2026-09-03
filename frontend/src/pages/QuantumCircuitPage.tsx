import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Copy,
  Check,
  Code2,
  BarChart3,
  Layers,
  Sparkles,
  Info,
  Sliders,
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
import { BellStateId, BellStateResponse } from '../types/quantum';
import { simulateBellState } from '../services/quantumApi';

const PRESET_BELL_STATES: {
  id: BellStateId;
  name: string;
  symbol: string;
  formula: string;
  prep: string;
  description: string;
}[] = [
  {
    id: 'phi_plus',
    name: 'Phi Plus',
    symbol: '|Φ+⟩',
    formula: '(|00⟩ + |11⟩) / √2',
    prep: 'H(q0) → CX(q0, q1)',
    description: 'Even parity, correlated Bell state with zero relative phase.',
  },
  {
    id: 'phi_minus',
    name: 'Phi Minus',
    symbol: '|Φ-⟩',
    formula: '(|00⟩ - |11⟩) / √2',
    prep: 'X(q0) → H(q0) → CX(q0, q1)',
    description: 'Even parity, correlated Bell state with π relative phase.',
  },
  {
    id: 'psi_plus',
    name: 'Psi Plus',
    symbol: '|Ψ+⟩',
    formula: '(|01⟩ + |10⟩) / √2',
    prep: 'X(q1) → H(q0) → CX(q0, q1)',
    description: 'Odd parity, anti-correlated Bell state with zero relative phase.',
  },
  {
    id: 'psi_minus',
    name: 'Psi Minus',
    symbol: '|Ψ-⟩',
    formula: '(|01⟩ - |10⟩) / √2',
    prep: 'X(q0) → X(q1) → H(q0) → CX(q0, q1)',
    description: 'Odd parity, anti-correlated singlet state with π relative phase.',
  },
];

const SHOT_PRESETS = [256, 512, 1024, 2048, 4096, 8192];

export const QuantumCircuitPage: React.FC = () => {
  const [selectedState, setSelectedState] = useState<BellStateId>('phi_plus');
  const [shots, setShots] = useState<number>(1024);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<BellStateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'qasm'>('text');
  const [copied, setCopied] = useState<boolean>(false);

  const runSimulation = async (stateId: BellStateId = selectedState, numShots: number = shots) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await simulateBellState(stateId, numShots);
      setResult(resp.data);
      setLatencyMs(resp.latencyMs);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to simulate quantum circuit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation('phi_plus', 1024);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prepare chart data combining empirical vs theoretical probabilities
  const chartData = result
    ? ['00', '01', '10', '11'].map((basis) => ({
        basis: `|${basis}⟩`,
        empirical: (result.probabilities[basis] || 0) * 100,
        theoretical: (result.theoretical_probabilities[basis] || 0) * 100,
        counts: result.counts[basis] || 0,
      }))
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-cyan-500/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono mb-3">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Part 2: Qiskit 2.5 Quantum Simulation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bell-State Entanglement & <span className="text-gradient-cyan">Quantum Circuits</span>
            </h1>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              Generate maximally entangled two-qubit Einstein-Podolsky-Rosen (EPR) pairs. Simulate projective measurements, exact statevectors, and quantum circuit compilation.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => runSimulation()}
              disabled={loading}
              className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${loading ? 'animate-spin' : 'fill-current'}`} />
              <span>{loading ? 'Simulating...' : 'Run Simulation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-xl bg-rose-950/40 border border-rose-800/80 p-4 text-rose-200 flex items-start space-x-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-300">Simulation Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Controls: Bell State Selector & Shots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bell State Selection Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>1. Select Canonical Bell State</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_BELL_STATES.map((state) => {
              const isSelected = selectedState === state.id;
              return (
                <button
                  key={state.id}
                  onClick={() => {
                    setSelectedState(state.id);
                    runSimulation(state.id, shots);
                  }}
                  className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10'
                      : 'glass-panel border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white font-mono">{state.symbol}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono">
                      {state.name}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-cyan-400 mt-1 font-semibold">{state.formula}</p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{state.description}</p>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Circuit:</span>
                    <span className="text-slate-300">{state.prep}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Simulation Configuration (Shots) */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2 mb-4">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>2. Measurement Shots</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-2 font-mono">
                  Shot Count: <span className="text-cyan-400 font-bold">{shots.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="128"
                  max="8192"
                  step="128"
                  value={shots}
                  onChange={(e) => setShots(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Preset buttons */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-2">Preset Shot Depths:</span>
                <div className="grid grid-cols-3 gap-2">
                  {SHOT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setShots(preset);
                        runSimulation(selectedState, preset);
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
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
            <div className="flex items-center justify-between">
              <span>Simulation Engine:</span>
              <span className="text-cyan-300">Qiskit StatevectorSampler</span>
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

      {/* Main Results Grid: Circuit & Chart */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Circuit Visualizer (5 Cols) */}
          <div className="lg:col-span-5 glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300">
                  <Code2 className="w-4 h-4" />
                  <span>Qiskit Quantum Circuit</span>
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
              <div className="bg-[#050811] p-4 rounded-xl font-mono text-xs text-cyan-300 border border-slate-900 overflow-x-auto min-h-[160px] flex items-center">
                <pre className="leading-tight">
                  {viewMode === 'text' ? result.circuit_text : result.circuit_qasm}
                </pre>
              </div>
            </div>

            {/* Circuit Metadata Metrics */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Qubits</span>
                <span className="text-white font-bold">{result.num_qubits} Qubits</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Circuit Depth</span>
                <span className="text-white font-bold">{result.depth}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Gates</span>
                <span className="text-white font-bold">
                  {Object.values(result.gate_count).reduce((a, b) => a + b, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Measurement Histogram (7 Cols) */}
          <div className="lg:col-span-7 glass-panel rounded-xl p-5 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300">
                <BarChart3 className="w-4 h-4" />
                <span>Measurement Probability Distribution</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Total Shots: <strong className="text-white">{result.shots.toLocaleString()}</strong>
              </span>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="basis" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }} />
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
                  <Bar dataKey="empirical" name="Empirical Shots (%)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="theoretical" name="Theoretical Prob (%)" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Statevector & Analytical Decomposition Table */}
      {result && (
        <div className="glass-panel rounded-xl p-6 border border-slate-800">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Exact Statevector & Amplitude Decomposition</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Basis State |ψ⟩</th>
                  <th className="py-3 px-4">Complex Amplitude (α)</th>
                  <th className="py-3 px-4">Theoretical Prob |α|²</th>
                  <th className="py-3 px-4">Empirical Counts</th>
                  <th className="py-3 px-4">Phase Angle (θ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {result.statevector.map((amp) => {
                  const empiricalCount = result.counts[amp.basis_state] || 0;
                  const isSuperposition = amp.probability > 0;
                  return (
                    <tr
                      key={amp.basis_state}
                      className={isSuperposition ? 'bg-cyan-950/20 text-white font-medium' : 'text-slate-500'}
                    >
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                          |{amp.basis_state}⟩
                        </span>
                      </td>
                      <td className="py-3 px-4">{amp.formatted}</td>
                      <td className="py-3 px-4">
                        {(amp.probability * 100).toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-cyan-300">
                        {empiricalCount} shots ({((empiricalCount / result.shots) * 100).toFixed(2)}%)
                      </td>
                      <td className="py-3 px-4">
                        {amp.phase_rad !== 0 ? `${(amp.phase_rad / Math.PI).toFixed(2)}π rad` : '0 rad'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Connection to Teleportation & QDS in Part 3 */}
      <div className="glass-panel rounded-xl p-6 border border-cyan-800/30 bg-gradient-to-br from-cyan-950/20 to-transparent">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <h4 className="font-bold text-white text-sm">Role of Bell States in Teleportation-based QDS</h4>
            <p className="leading-relaxed">
              In teleportation-based Quantum Digital Signature (QDS) schemes, the Bell states ($|\Phi^+\rangle, |\Phi^-\rangle, |\Psi^+\rangle, |\Psi^-\rangle$) serve as the shared quantum entanglement resource (EPR channel) between the Signer (Alice) and the Verifier (Bob). When Alice executes a Bell-state measurement (BSM) on an unknown message state and her half of the EPR pair, Bob uses classical bits to apply corresponding Pauli unitary corrections ($I, X, Z, XZ$).
            </p>
            <p className="text-slate-400 pt-1">
              Part 3 will build directly on this modular circuit layer to simulate complete quantum teleportation and Pauli correction telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
