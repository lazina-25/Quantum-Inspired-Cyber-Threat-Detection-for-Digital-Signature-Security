import React, { useEffect, useState } from 'react';
import {
  KeyRound,
  Skull,
  ShieldCheck,
  Activity,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Play,
  Shield,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { getAnalyticsSummaryApi } from '../services/analyticsApi';
import { AnalyticsSummaryResponse } from '../types/analytics';
import { useHealth } from '../hooks/useHealth';
import { SecurityDemoModal } from '../components/SecurityDemoModal';
import { NavTab } from '../components/Navbar';

interface DashboardProps {
  onNavigate?: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { health, refetch: refetchHealth } = useHealth();
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [demoOpen, setDemoOpen] = useState<boolean>(false);

  const fetchSummary = async () => {
    try {
      const res = await getAnalyticsSummaryApi();
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleRefreshAll = () => {
    setRefreshing(true);
    refetchHealth();
    fetchSummary();
  };

  const hasSignatures = (summary?.total_signatures ?? 0) > 0;
  const hasAttacks = (summary?.total_attacks ?? 0) > 0;
  const hasThreatAnalyses = (summary?.total_threat_analyses ?? 0) > 0;

  return (
    <div className="space-y-8 pb-12">
      <SecurityDemoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        onFinished={fetchSummary}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-10 border border-[#EAEAEA] shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100/90 border border-yellow-300 text-charcoal text-xs font-semibold tracking-tight shadow-xs mb-3.5">
            <Shield className="w-3.5 h-3.5 text-yellow-700" />
            <span>Quantum QDS &bull; Secure. Verifiable. Future-Ready.</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-[-0.035em] leading-[1.15]">
            Quantum-Inspired Cyber Threat Detection
          </h1>

          <p className="mt-2.5 text-secondary text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            Secure and verify digital signatures using quantum principles and statistical analysis.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate && onNavigate('signatures')}
              className="btn-primary"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-charcoal" />
            </button>

            <button
              onClick={() => onNavigate && onNavigate('quantum')}
              className="btn-secondary"
            >
              <span>Explore Lab</span>
            </button>

            <button
              onClick={() => setDemoOpen(true)}
              className="btn-secondary"
            >
              <Play className="w-3.5 h-3.5 text-yellow-600 fill-yellow-600" />
              <span>Run Automated Demo</span>
            </button>

            <button
              onClick={handleRefreshAll}
              disabled={refreshing}
              className="h-10 w-10 rounded-xl bg-white border border-[#EAEAEA] hover:border-yellow-400 hover:bg-yellow-50 text-secondary hover:text-charcoal transition-colors disabled:opacity-50 inline-flex items-center justify-center shadow-xs"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-charcoal' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Signatures */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-300 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-secondary">Total Signatures</span>
            <div className="p-2 rounded-xl bg-yellow-100 text-charcoal">
              <KeyRound className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight tabular-nums">
              {summary?.total_signatures ?? 0}
            </div>
            <p className="mt-1 text-xs text-secondary leading-normal">
              {hasSignatures
                ? `${summary?.valid_signatures ?? 0} valid, ${summary?.failed_signatures ?? 0} rejected`
                : 'No signatures created yet'}
            </p>
          </div>
        </div>

        {/* Metric 2: Attacks Simulated */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-300 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-secondary">Attacks Simulated</span>
            <div className="p-2 rounded-xl bg-yellow-100 text-charcoal">
              <Skull className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight tabular-nums">
              {summary?.total_attacks ?? 0}
            </div>
            <p className="mt-1 text-xs text-secondary leading-normal">
              {hasAttacks ? 'Across controlled attack scenarios' : 'No simulations run yet'}
            </p>
          </div>
        </div>

        {/* Metric 3: Threats Detected */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-300 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-secondary">Threats Detected</span>
            <div className="p-2 rounded-xl bg-yellow-100 text-charcoal">
              <ShieldCheck className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight tabular-nums">
              {hasAttacks ? (summary?.total_threat_analyses ?? 0) : 0}
            </div>
            <p className="mt-1 text-xs text-secondary leading-normal">
              {hasAttacks ? 'Deterministic threshold verification' : 'No threats detected yet'}
            </p>
          </div>
        </div>

        {/* Metric 4: Average Analysis Time */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-300 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-secondary">Average Analysis Time</span>
            <div className="p-2 rounded-xl bg-yellow-100 text-charcoal">
              <Activity className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight tabular-nums">
              {hasThreatAnalyses ? `${summary?.average_detection_time_ms.toFixed(1)} ms` : '0 ms'}
            </div>
            <p className="mt-1 text-xs text-secondary leading-normal">
              {hasThreatAnalyses ? 'Real-time statistical measurement' : 'No analyses performed yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Security Workflow Section */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
              <span>Core Security Pipeline</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight mt-1">Security Workflow</h2>
            <p className="text-xs sm:text-sm text-secondary mt-1 leading-normal">
              Follow this step-by-step pipeline to create signatures, test adversarial scenarios, and inspect deterministic threat verdicts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1: Digital Signature */}
          <div className="p-5 rounded-2xl bg-surface border border-[#EAEAEA] hover:border-yellow-400 transition-all flex flex-col justify-between group h-full">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-yellow-400 text-charcoal font-bold text-xs flex items-center justify-center shadow-xs">
                  1
                </span>
                <span className="text-xs font-semibold text-secondary">Step 1 of 4</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-yellow-800" />
                <span>Digital Signature</span>
              </h3>
              <p className="text-sm text-secondary mt-2 leading-relaxed min-h-[40px]">
                Create and verify quantum digital signatures with teleported token states.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('signatures')}
              className="btn-primary w-full mt-5"
            >
              <span>Start</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Step 2: Attack Simulator */}
          <div className="p-5 rounded-2xl bg-surface border border-[#EAEAEA] hover:border-yellow-400 transition-all flex flex-col justify-between group h-full">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-yellow-400 text-charcoal font-bold text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
                <span className="text-xs font-semibold text-secondary">Step 2 of 4</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                <Skull className="w-4 h-4 text-yellow-800" />
                <span>Attack Simulator</span>
              </h3>
              <p className="text-sm text-secondary mt-2 leading-relaxed min-h-[40px]">
                Test controlled threat vectors: forgery, impersonation, replay, or channel noise.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('attacks')}
              className="btn-primary w-full mt-5"
            >
              <span>Simulate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Step 3: Threat Detection */}
          <div className="p-5 rounded-2xl bg-surface border border-[#EAEAEA] hover:border-yellow-400 transition-all flex flex-col justify-between group h-full">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-yellow-400 text-charcoal font-bold text-xs flex items-center justify-center shadow-xs">
                  3
                </span>
                <span className="text-xs font-semibold text-secondary">Step 3 of 4</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-yellow-800" />
                <span>Threat Detection</span>
              </h3>
              <p className="text-sm text-secondary mt-2 leading-relaxed min-h-[40px]">
                Analyze resulting quantum measurement distributions and evaluate threshold limits.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('detection')}
              className="btn-primary w-full mt-5"
            >
              <span>Detect</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Step 4: Analysis & Telemetry */}
          <div className="p-5 rounded-2xl bg-surface border border-[#EAEAEA] hover:border-yellow-400 transition-all flex flex-col justify-between group h-full">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-yellow-400 text-charcoal font-bold text-xs flex items-center justify-center shadow-xs">
                  4
                </span>
                <span className="text-xs font-semibold text-secondary">Step 4 of 4</span>
              </div>
              <h3 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-800" />
                <span>Analysis</span>
              </h3>
              <p className="text-sm text-secondary mt-2 leading-relaxed min-h-[40px]">
                View detailed statistics, distribution visualizations, and verification outcomes.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('analytics')}
              className="btn-primary w-full mt-5"
            >
              <span>View Results</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Subsystem Telemetry Status */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-charcoal">System Health & Verification Engines</h2>
            <p className="text-xs sm:text-sm text-secondary mt-0.5">Live status of physics verification modules</p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Engines Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {health?.modules ? (
            Object.entries(health.modules).map(([name, mod]: [string, any]) => (
              <div key={name} className="p-4 rounded-xl bg-surface border border-[#EAEAEA] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-charcoal text-sm capitalize">{name.replace(/_/g, ' ')}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-charcoal border border-yellow-200">
                    {mod.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-secondary mt-2 leading-normal">{mod.description || mod.details}</p>
              </div>
            ))
          ) : (
            <div className="col-span-4 p-4 text-center text-secondary text-sm">Loading subsystem telemetry...</div>
          )}
        </div>
      </div>
    </div>
  );
};
