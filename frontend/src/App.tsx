import React, { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { QuantumLabPage } from './pages/QuantumLabPage';
import { QuantumSignaturePage } from './pages/QuantumSignaturePage';
import { AttackSimulatorPage } from './pages/AttackSimulatorPage';
import { ThreatDetectionPage } from './pages/ThreatDetectionPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { EventHistoryPage } from './pages/EventHistoryPage';
import { useHealth } from './hooks/useHealth';

export const App: React.FC = () => {
  const { health, latencyMs, refetch, loading } = useHealth(10000);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-[#060a12] text-slate-100">
      <Navbar
        status={health?.status || 'offline'}
        latencyMs={latencyMs}
        onRefresh={refetch}
        loading={loading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'quantum' && <QuantumLabPage />}
        {activeTab === 'signatures' && <QuantumSignaturePage />}
        {activeTab === 'attacks' && <AttackSimulatorPage />}
        {activeTab === 'detection' && <ThreatDetectionPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'history' && <EventHistoryPage />}
      </main>
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Quantum-Inspired Cyber Threat Detection for Digital Signature Security (SIH 2026)</p>
          <p className="text-cyan-500/80">Qiskit 2.5 &bull; Teleportation Protocol &bull; Zero AI/ML Engine</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
