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
  Sliders,
  ShieldAlert,
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

  // Transform counts to Recharts format
  const chartData = result
    ? ['00', '01', '10', '11'].map((basis) => ({
        basis: `|${basis}⟩`,
        empirical: ((result.probabilities[basis] || 0) * 100),
        theoretical: ((result.theoretical_probabilities[basis] || 0) * 100),
        counts: result.counts[basis] || 0,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* What It Does & Why It Matters Explainer */}
      <div className="bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-charcoal font-bold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span>What It Does</span>
          </div>
          <h2 className="text-base font-bold text-charcoal">Bell State Entanglement Simulation</h2>
          <p className="text-xs text-charcoal-500 leading-relaxed">
            Prepares two qubits in maximally entangled quantum states (|Φ⁺⟩, |Φ⁻⟩, |Ψ⁺⟩, |Ψ⁻⟩) using quantum gates, then performs measurements across configurable shot counts.
          </p>
        </div>

        <div className="space-y-2 md:border-l md:border-[#EAEAEA] md:pl-6">
          <div className="flex items-center space-x-2 text-charcoal font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-yellow-600" />
            <span>Why It Matters</span>
          </div>
          <h2 className="text-base font-bold text-charcoal">Foundational QDS Channel Security</h2>
          <p className="text-xs text-charcoal-500 leading-relaxed">
            Bell state entanglement provides the underlying quantum correlation for teleportation protocols. In QDS, any eavesdropper or channel noise breaks the strict entanglement parity, causing observable error spikes.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-danger flex items-start space-x-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Simulation Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Controls: Bell State Selector & Shots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bell State Selection Cards (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-charcoal flex items-center space-x-2">
              <Layers className="w-4 h-4 text-yellow-600" />
              <span>1. Select Canonical Bell State</span>
            </h3>
            <span className="text-xs text-charcoal-500">Inputs & Parameters</span>
          </div>

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
                  <div className="mt-3 pt-2 border-t border-[#EAEAEA] flex items-center justify-between text-[11px] text-charcoal-400 font-mono">
                    <span>Circuit:</span>
                    <span className="text-charcoal-700 font-semibold">{state.prep}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Shots & Execution (1 Col) */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-charcoal flex items-center space-x-2 mb-4">
              <Sliders className="w-4 h-4 text-yellow-600" />
              <span>2. Measurement Shots</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-charcoal-600 block mb-2 font-medium">
                  Shot Count: <span className="text-charcoal font-bold font-mono">{shots.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="128"
                  max="8192"
                  step="128"
                  value={shots}
                  onChange={(e) => setShots(Number(e.target.value))}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>

              <div>
                <span className="text-[11px] text-charcoal-500 block mb-2 font-medium">Preset Shot Depths:</span>
                <div className="grid grid-cols-3 gap-2">
                  {SHOT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setShots(preset);
                        runSimulation(selectedState, preset);
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
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAEAEA] mt-6">
            <button
              onClick={() => runSimulation(selectedState, shots)}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-charcoal font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-charcoal ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Simulating Circuit...' : 'Run Simulation'}</span>
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

      {/* Main Results Grid: Circuit & Chart */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Circuit Visualizer (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] mb-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-charcoal">
                  <Code2 className="w-4 h-4 text-yellow-600" />
                  <span>Quantum Circuit</span>
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
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Monospace Circuit Box */}
              <div className="bg-charcoal p-4 rounded-xl font-mono text-xs text-yellow-300 border border-charcoal-800 overflow-x-auto min-h-[160px] flex items-center">
                <pre className="leading-tight">
                  {viewMode === 'text' ? result.circuit_text : result.circuit_qasm}
                </pre>
              </div>
            </div>

            {/* Circuit Metadata Metrics */}
            <div className="mt-4 pt-4 border-t border-[#EAEAEA] grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-xl bg-surface border border-[#EAEAEA]">
                <span className="text-charcoal-400 block text-[10px] font-sans">Qubits</span>
                <span className="text-charcoal font-bold">{result.num_qubits} Qubits</span>
              </div>
              <div className="p-2 rounded-xl bg-surface border border-[#EAEAEA]">
                <span className="text-charcoal-400 block text-[10px] font-sans">Circuit Depth</span>
                <span className="text-charcoal font-bold">{result.depth}</span>
              </div>
              <div className="p-2 rounded-xl bg-surface border border-[#EAEAEA]">
                <span className="text-charcoal-400 block text-[10px] font-sans">Total Gates</span>
                <span className="text-charcoal font-bold">
                  {Object.values(result.gate_count).reduce((a, b) => a + b, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Measurement Histogram (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#EAEAEA] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] mb-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-charcoal">
                <BarChart3 className="w-4 h-4 text-yellow-600" />
                <span>Measurement Probability Distribution</span>
              </div>
              <span className="text-xs text-charcoal-500 font-mono">
                Total Shots: <strong className="text-charcoal">{result.shots.toLocaleString()}</strong>
              </span>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                  <XAxis dataKey="basis" stroke="#6B6B6B" tick={{ fill: '#6B6B6B', fontSize: 12, fontFamily: 'monospace' }} />
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
                  <Bar dataKey="empirical" name="Empirical Shots (%)" fill="#F5C400" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="theoretical" name="Theoretical Expectation (%)" fill="#171717" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
