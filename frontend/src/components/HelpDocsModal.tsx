import React from 'react';
import { X, BookOpen, Atom, KeyRound, Activity } from 'lucide-react';

interface HelpDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpDocsModal: React.FC<HelpDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-dropdown border border-border max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-yellow-100 text-charcoal">
              <BookOpen className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal">Quantum QDS Documentation & Guide</h2>
              <p className="text-xs text-secondary">Key concepts, protocols, and verification methodologies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-secondary hover:text-charcoal hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-secondary">
          {/* Section 1: Overview */}
          <div>
            <h3 className="text-sm font-bold text-charcoal flex items-center space-x-2">
              <Atom className="w-4 h-4 text-yellow-600" />
              <span>What is Quantum Digital Signature (QDS)?</span>
            </h3>
            <p className="mt-1.5 text-xs text-secondary leading-relaxed">
              Quantum Digital Signatures utilize the laws of quantum mechanics (specifically entanglement, no-cloning theorem, and projective measurements) to guarantee message authentication, integrity, and non-repudiation. Physical quantum states cannot be forged without disturbing observable quantum invariants.
            </p>
          </div>

          {/* Section 2: Core Concepts Glossary */}
          <div>
            <h3 className="text-sm font-bold text-charcoal flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-yellow-600" />
              <span>Core Terminology & Concepts</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="font-bold text-charcoal block mb-0.5">Bell State Measurement</span>
                <span className="text-secondary text-[11px] font-sans">
                  A joint two-qubit measurement that determines which of the 4 maximally entangled Bell states the system is in.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="font-bold text-charcoal block mb-0.5">Quantum Correction</span>
                <span className="text-secondary text-[11px] font-sans">
                  Conditional quantum operations applied to reconstruct the transmitted quantum state based on measurement outcomes.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="font-bold text-charcoal block mb-0.5">Total Variation Distance (D_TV)</span>
                <span className="text-secondary text-[11px] font-sans">
                  Statistical distance measuring divergence between expected and observed state distributions (Threshold: &le; 0.12).
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border">
                <span className="font-bold text-charcoal block mb-0.5">Quantum Bit Error Rate (QBER)</span>
                <span className="text-secondary text-[11px] font-sans">
                  Fraction of error qubits across the transmission channel. Levels above 15% indicate channel noise or eavesdropping.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Detection Methodology */}
          <div>
            <h3 className="text-sm font-bold text-charcoal flex items-center space-x-2">
              <Activity className="w-4 h-4 text-yellow-600" />
              <span>Statistical & Physics-Based Threat Analysis</span>
            </h3>
            <p className="mt-1.5 text-xs text-secondary leading-relaxed">
              Detection is governed by deterministic rules and mathematical bounds:
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-secondary list-disc list-inside">
              <li><strong className="text-charcoal">QBER Threshold:</strong> Must remain &le; 15% for legitimate transmissions.</li>
              <li><strong className="text-charcoal">State Fidelity:</strong> Geometric overlap must satisfy &ge; 85.0%.</li>
              <li><strong className="text-charcoal">Total Variation Distance:</strong> Must stay &le; 0.12 under 1024 shot simulation.</li>
              <li><strong className="text-charcoal">Temporal Validity:</strong> Session nonces expire after 300 seconds to prevent replay attacks.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between">
          <span className="text-xs text-secondary font-mono">Qiskit Simulation Engine &bull; QDS Protocol</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-charcoal font-bold text-xs transition-colors shadow-sm"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
