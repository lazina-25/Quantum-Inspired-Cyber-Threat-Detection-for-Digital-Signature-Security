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
import { ToastProvider } from './components/Toast';
import { CreateSignatureResponse, VerifySignatureResponse } from './types/signature';
import { AttackResponse } from './types/attack';
import { ThreatAnalysisResponse } from './types/detection';

export interface SecurityWorkflowContextState {
  signatureId?: string;
  signerId?: string;
  message?: string;
  initialVerification?: VerifySignatureResponse;
  attackExecuted?: boolean;
  attackId?: string;
  attackType?: string;
  attackResult?: any;
  postAttackVerification?: VerifySignatureResponse;
  threatVerdict?: ThreatAnalysisResponse;
}

const AppContent: React.FC = () => {
  const { health, latencyMs, refetch, loading } = useHealth(10000);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [workflow, setWorkflow] = useState<SecurityWorkflowContextState>({});

  // 1. New signature generated and initial verification completed
  const handleSignatureCreated = (
    sig: CreateSignatureResponse,
    initVerif: VerifySignatureResponse
  ) => {
    setWorkflow({
      signatureId: sig.signature_id,
      signerId: sig.signer_id,
      message: sig.message_content,
      initialVerification: initVerif,
      attackExecuted: false,
      attackId: undefined,
      attackType: undefined,
      attackResult: undefined,
      postAttackVerification: undefined,
      threatVerdict: undefined,
    });
  };

  // 2. Attack explicitly executed and post-attack verification completed
  const handleAttackExecuted = (
    attackResp: AttackResponse,
    postVerifResp: VerifySignatureResponse
  ) => {
    setWorkflow((prev) => ({
      ...prev,
      attackExecuted: true,
      attackId: attackResp.attack_id,
      attackType: attackResp.attack_type,
      attackResult: attackResp,
      postAttackVerification: postVerifResp,
    }));
  };

  // 3. User chooses to skip attack to test the clean/no-attack flow
  const handleSkipAttack = () => {
    setWorkflow((prev) => ({
      ...prev,
      attackExecuted: false,
      attackId: undefined,
      attackType: undefined,
      attackResult: undefined,
      postAttackVerification: prev.initialVerification, // clean verification state
    }));
    setActiveTab('detection');
  };

  // 4. Threat analysis completed
  const handleThreatAnalyzed = (verdict: ThreatAnalysisResponse) => {
    setWorkflow((prev) => ({
      ...prev,
      threatVerdict: verdict,
    }));
  };

  // 5. Complete session reset
  const handleResetWorkflow = () => {
    setWorkflow({});
  };

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
        {activeTab === 'signatures' && (
          <QuantumSignaturePage
            workflow={workflow}
            onSignatureCreated={handleSignatureCreated}
            onResetWorkflow={handleResetWorkflow}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'attacks' && (
          <AttackSimulatorPage
            workflow={workflow}
            onAttackExecuted={handleAttackExecuted}
            onSkipAttack={handleSkipAttack}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'detection' && (
          <ThreatDetectionPage
            workflow={workflow}
            onThreatAnalyzed={handleThreatAnalyzed}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'quantum' && <QuantumLabPage />}
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

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
