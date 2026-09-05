import React, { useEffect, useState } from 'react';
import {
  KeyRound,
  Skull,
  ShieldCheck,
  Activity,
  ArrowRight,
  RefreshCw,
  Atom,
  TrendingUp,
  Play,
  CheckCircle2,
  Clock,
  Shield,
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
  const hasEvents = (summary?.recent_events?.length ?? 0) > 0;

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
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-200 text-charcoal text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5 text-yellow-700" />
            <span>Quantum QDS &bull; Secure. Verifiable. Future-Ready.</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
            Quantum-Inspired Cyber Threat Detection
          </h1>

          <p className="mt-3 text-charcoal-500 text-sm sm:text-base leading-relaxed">
            Secure and verify digital signatures using quantum principles and statistical analysis.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate && onNavigate('signatures')}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-charcoal font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-charcoal" />
            </button>

            <button
              onClick={() => onNavigate && onNavigate('quantum')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white border border-[#EAEAEA] hover:border-yellow-400 hover:bg-yellow-50 text-charcoal font-semibold text-xs sm:text-sm shadow-xs transition-all"
            >
              <span>Explore</span>
            </button>

            <button
              onClick={() => setDemoOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-yellow-50 text-charcoal font-medium text-xs sm:text-sm border border-[#EAEAEA] transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-yellow-600 fill-yellow-600" />
              <span>Run Demo</span>
            </button>

            <button
              onClick={handleRefreshAll}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white border border-[#EAEAEA] hover:border-yellow-400 hover:bg-yellow-50 text-charcoal-500 hover:text-charcoal transition-colors disabled:opacity-50"
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
        <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Total Signatures</span>
            <div className="p-2 rounded-xl bg-yellow-100 text-charcoal">
              <KeyRound className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-charcoal font-sans">
              {summary?.total_signatures ?? 0}
            </span>
            <p className="mt-1 text-xs text-charcoal-500">
              {hasSignatures
                ? `${summary?.valid_signatures ?? 0} valid, ${summary?.failed_signatures ?? 0} rejected`
                : 'No signatures created yet'}
            </p>
          </div>
        </div>

        {/* Metric 2: Attacks Simulated */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Attacks Simulated</span>
            <div className="p-2 rounded-xl bg-yellow-100 text-charcoal">
              <Skull className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-charcoal font-sans">
              {summary?.total_attacks ?? 0}
            </span>
            <p className="mt-1 text-xs text-charcoal-500">
              {hasAttacks ? 'Across controlled attack scenarios' : 'No simulations run yet'}
            </p>
          </div>
        </div>

        {/* Metric 3: Threats Detected */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Threats Detected</span>
            <div className="p-2 rounded-xl bg-yellow-100 text-charcoal">
              <ShieldCheck className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-charcoal font-sans">
              {hasAttacks ? (summary?.total_threat_analyses ?? 0) : 0}
            </span>
            <p className="mt-1 text-xs text-charcoal-500">
              {hasAttacks ? 'Deterministic threshold verification' : 'No threats detected yet'}
            </p>
          </div>
        </div>

        {/* Metric 4: Average Analysis Time */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Average Analysis Time</span>
            <div className="p-2 rounded-xl bg-yellow-100 text-charcoal">
              <Activity className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-charcoal font-sans">
              {hasThreatAnalyses ? `${summary?.average_detection_time_ms.toFixed(1)} ms` : '0 ms'}
            </span>
            <p className="mt-1 text-xs text-charcoal-500">
              {hasThreatAnalyses ? 'Real-time statistical measurement' : 'No analyses performed yet'}
            </p>
          </div>
        </div>
      </div>

      {/* How it Works - Simple 5-Step Workflow */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-bold text-charcoal">How It Works</h2>
          <p className="text-xs text-charcoal-500 mt-0.5">A complete quantum security workflow in 5 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-charcoal-400">
              <span>STEP 1</span>
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            </div>
            <div className="mt-2">
              <h3 className="text-xs font-bold text-charcoal">Create Signature</h3>
              <p className="text-[11px] text-charcoal-500 mt-0.5">Generate a secure quantum digital signature for your message.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-charcoal-400">
              <span>STEP 2</span>
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            </div>
            <div className="mt-2">
              <h3 className="text-xs font-bold text-charcoal">Verify Signature</h3>
              <p className="text-[11px] text-charcoal-500 mt-0.5">Perform quantum measurement to confirm authenticity.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-charcoal-400">
              <span>STEP 3</span>
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            </div>
            <div className="mt-2">
              <h3 className="text-xs font-bold text-charcoal">Simulate Attack</h3>
              <p className="text-[11px] text-charcoal-500 mt-0.5">Safely test forgery, replay, or channel eavesdropping.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-charcoal-400">
              <span>STEP 4</span>
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            </div>
            <div className="mt-2">
              <h3 className="text-xs font-bold text-charcoal">Detect Threats</h3>
              <p className="text-[11px] text-charcoal-500 mt-0.5">Check measurement deviations against threshold boundaries.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-charcoal-400">
              <span>STEP 5</span>
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            </div>
            <div className="mt-2">
              <h3 className="text-xs font-bold text-charcoal">View Analytics</h3>
              <p className="text-[11px] text-charcoal-500 mt-0.5">Review system performance and telemetry insights.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-charcoal">Quick Actions</h2>
          <p className="text-xs text-charcoal-500 mt-0.5">Explore protocols, simulate threats, and verify signatures</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: Quantum Lab */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-800 mb-3">
                <Atom className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-charcoal text-sm">Quantum Lab</h3>
              <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                Explore quantum circuits and teleportation.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('quantum')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-surface hover:bg-yellow-400 hover:text-charcoal text-charcoal text-xs font-bold border border-[#EAEAEA] hover:border-yellow-400 transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Open Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Digital Signatures */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-800 mb-3">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-charcoal text-sm">Digital Signatures</h3>
              <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                Create and verify signatures.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('signatures')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-surface hover:bg-yellow-400 hover:text-charcoal text-charcoal text-xs font-bold border border-[#EAEAEA] hover:border-yellow-400 transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Create Signature</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Attack Simulator */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-800 mb-3">
                <Skull className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-charcoal text-sm">Attack Simulator</h3>
              <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                Test controlled attack scenarios.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('attacks')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-surface hover:bg-yellow-400 hover:text-charcoal text-charcoal text-xs font-bold border border-[#EAEAEA] hover:border-yellow-400 transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Run Simulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Threat Detection */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-800 mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-charcoal text-sm">Threat Detection</h3>
              <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                Analyze signatures for threats.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('detection')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-surface hover:bg-yellow-400 hover:text-charcoal text-charcoal text-xs font-bold border border-[#EAEAEA] hover:border-yellow-400 transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Analyze</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 5: Analytics */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAEAEA] shadow-sm hover:border-yellow-400 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-800 mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-charcoal text-sm">Analytics</h3>
              <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                View security and performance results.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('analytics')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-surface hover:bg-yellow-400 hover:text-charcoal text-charcoal text-xs font-bold border border-[#EAEAEA] hover:border-yellow-400 transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Subsystem Readiness & Architecture */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-charcoal">Quantum Security Subsystems</h2>
            <p className="text-xs text-charcoal-500">Real-time status of verification and simulation pipelines</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-success font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ready</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {health?.modules ? (
            Object.entries(health.modules).map(([name, mod]: [string, any]) => (
              <div key={name} className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-charcoal capitalize">{name.replace('_', ' ')}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-charcoal-800 border border-yellow-200">
                    {mod.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-500 mt-2">{mod.details}</p>
              </div>
            ))
          ) : (
            <div className="col-span-4 p-4 text-center text-charcoal-400">Loading subsystem telemetry...</div>
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-charcoal">Recent Activity</h2>
            <p className="text-xs text-charcoal-500">Audit trail of quantum signatures and security verifications</p>
          </div>
          {hasEvents && onNavigate && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-charcoal hover:text-yellow-700 flex items-center space-x-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {hasEvents ? (
          <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface text-charcoal-500 uppercase tracking-wider font-semibold border-b border-[#EAEAEA]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Actor / Verifier</th>
                    <th className="py-3 px-4">Target / Session</th>
                    <th className="py-3 px-4">Threat Level</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {summary!.recent_events!.slice(0, 6).map((evt) => (
                    <tr key={evt.id} className="hover:bg-yellow-50/50 transition-colors">
                      <td className="py-3 px-4 text-charcoal-500 font-mono text-[11px]">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-charcoal">{evt.event_type}</td>
                      <td className="py-3 px-4 text-charcoal-600 font-mono">{evt.signer_or_actor}</td>
                      <td className="py-3 px-4 text-charcoal-500 font-mono truncate max-w-xs">{evt.session_or_target}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
                            evt.threat_level === 'CRITICAL' || evt.threat_level === 'HIGH'
                              ? 'bg-red-50 border-red-200 text-danger'
                              : evt.threat_level === 'MEDIUM'
                              ? 'bg-amber-50 border-amber-200 text-warning'
                              : 'bg-green-50 border-green-200 text-success'
                          }`}
                        >
                          {evt.threat_level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-charcoal font-medium">{evt.result_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#EAEAEA] p-10 text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-charcoal flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-yellow-800" />
            </div>
            <h3 className="font-bold text-charcoal text-sm">No recent activity</h3>
            <p className="text-xs text-charcoal-500 max-w-md mx-auto mt-1">
              Your signatures, simulations and security events will appear here.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setDemoOpen(true)}
                className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-charcoal font-bold text-xs transition-colors inline-flex items-center space-x-1.5 shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-charcoal" />
                <span>Run Your First Demo</span>
              </button>
              <button
                onClick={() => onNavigate && onNavigate('signatures')}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-yellow-50 text-charcoal font-semibold text-xs border border-[#EAEAEA] transition-colors"
              >
                Create Signature
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
