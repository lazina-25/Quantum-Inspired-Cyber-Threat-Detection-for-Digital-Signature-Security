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
    <div className="min-h-screen flex flex-col bg-surface text-charcoal font-sans">
      <Navbar
        status={health?.status || 'offline'}
        latencyMs={latencyMs}
        onRefresh={refetch}
        loading={loading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'quantum' && <QuantumLabPage />}
        {activeTab === 'signatures' && <QuantumSignaturePage />}
        {activeTab === 'attacks' && <AttackSimulatorPage />}
        {activeTab === 'detection' && <ThreatDetectionPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'history' && <EventHistoryPage />}
      </main>
      <footer className="border-t border-[#EAEAEA] bg-white py-6 text-center text-xs text-charcoal-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-charcoal-700">Quantum QDS &mdash; Quantum Digital Signature & Threat Detection Platform</p>
          <p className="text-charcoal-400">Physics-Based Verification &bull; Qiskit Quantum Simulation Engine</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
