import React, { useState } from 'react';
import { Radio, Zap, Atom } from 'lucide-react';
import { QuantumCircuitPage } from './QuantumCircuitPage';
import { QuantumTeleportationPage } from './QuantumTeleportationPage';

export const QuantumLabPage: React.FC = () => {
  const [labTab, setLabTab] = useState<'bell' | 'teleport'>('bell');

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EAEAEA] shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-200 text-charcoal text-xs font-semibold mb-2">
            <Atom className="w-3.5 h-3.5 text-yellow-800" />
            <span>Quantum Simulation Lab</span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal">Quantum Physics & Teleportation Lab</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Simulate 2-qubit Bell entanglement states and 3-qubit Bennett teleportation protocols.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-surface p-1 text-xs font-medium shrink-0 border border-[#EAEAEA]">
          <button
            onClick={() => setLabTab('bell')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              labTab === 'bell'
                ? 'bg-yellow-400 text-charcoal font-bold shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Bell State Simulation</span>
          </button>
          <button
            onClick={() => setLabTab('teleport')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              labTab === 'teleport'
                ? 'bg-yellow-400 text-charcoal font-bold shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Quantum Teleportation</span>
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {labTab === 'bell' ? <QuantumCircuitPage /> : <QuantumTeleportationPage />}
    </div>
  );
};
