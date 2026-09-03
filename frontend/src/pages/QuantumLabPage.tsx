import React, { useState } from 'react';
import { Radio, Zap, Atom } from 'lucide-react';
import { QuantumCircuitPage } from './QuantumCircuitPage';
import { QuantumTeleportationPage } from './QuantumTeleportationPage';

export const QuantumLabPage: React.FC = () => {
  const [labTab, setLabTab] = useState<'bell' | 'teleport'>('bell');

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 sm:p-6 rounded-2xl border border-cyan-500/20">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono mb-2">
            <Atom className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quantum Simulation Workbench (Qiskit 2.5)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Quantum Physics & Teleportation Lab</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 font-mono text-xs">
          <button
            onClick={() => setLabTab('bell')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              labTab === 'bell'
                ? 'bg-cyan-950 border border-cyan-500/60 text-cyan-300 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1. Bell Entanglement</span>
          </button>
          <button
            onClick={() => setLabTab('teleport')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              labTab === 'teleport'
                ? 'bg-cyan-950 border border-cyan-500/60 text-cyan-300 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>2. Quantum Teleportation</span>
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {labTab === 'bell' ? <QuantumCircuitPage /> : <QuantumTeleportationPage />}
    </div>
  );
};
