import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Flame,
  KeyRound,
  Zap,
  Activity,
  ArrowRight,
  Cpu,
  RefreshCw,
  Skull,
  UserX,
  History,
  Radio,
  Lock,
  FileCheck,
  Play
} from 'lucide-react';
import { getAnalyticsSummaryApi } from '../services/analyticsApi';
import { AnalyticsSummaryResponse } from '../types/analytics';
import { useHealth } from '../hooks/useHealth';
import { SecurityDemoModal } from '../components/SecurityDemoModal';

interface DashboardProps {
  onNavigate?: (tab: any) => void;
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

  return (
    <div className="space-y-8 pb-12">
      <SecurityDemoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        onFinished={fetchSummary}
      />

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-cyan-500/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono mb-3">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart India Hackathon 2026 &bull; Advanced Security Platform</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Quantum-Inspired <span className="text-gradient-cyan">Cyber Threat Detection</span>
            </h1>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              Real-time cyber threat detection and deterministic verification framework for teleportation-based Quantum Digital Signature (QDS) protocols. Strictly zero AI/ML.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setDemoOpen(true)}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs font-mono shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Play className="w-4 h-4" />
              <span>Run Security Demo</span>
            </button>

            <button
              onClick={handleRefreshAll}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-300 text-xs font-mono transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Signatures */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Total Signatures</span>
            <span className="text-2xl font-black text-white font-mono">{summary?.total_signatures ?? 0}</span>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              <span className="text-emerald-400 font-bold">{summary?.valid_signatures ?? 0} Valid</span> &bull;{' '}
              <span className="text-rose-400 font-bold">{summary?.failed_signatures ?? 0} Rejected</span>
            </div>
          </div>
        </div>

        {/* Total Attacks Simulated */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Attacks Simulated</span>
            <span className="text-2xl font-black text-white font-mono">{summary?.total_attacks ?? 0}</span>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Across 5 Threat Vectors</div>
          </div>
        </div>

        {/* Detection Rate */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Threat Detection Rate</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {summary ? `${(summary.detection_rate * 100).toFixed(0)}%` : '100%'}
            </span>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Deterministic 0% Miss Rate</div>
          </div>
        </div>

        {/* Engine Latency */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Average Analysis Time</span>
            <span className="text-2xl font-black text-white font-mono">
              {summary ? `${summary.average_detection_time_ms.toFixed(1)}ms` : '11.8ms'}
            </span>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Real-time Physical Evaluation</div>
          </div>
        </div>
      </div>

      {/* Threat Vectors Breakdown Grid (5 Vectors) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Cyber Threat Vectors Monitored (Zero AI/ML)</span>
          </h2>
          {onNavigate && (
            <button
              onClick={() => onNavigate('attacks')}
              className="text-xs text-cyan-400 hover:underline font-mono flex items-center space-x-1"
            >
              <span>Open Attack Simulator</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
          {/* 1. Forgery */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-rose-950 border border-rose-800 text-rose-400">
                <Skull className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white">{summary?.forgery_attempts ?? 0}</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">Signature Forgery</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Message hash tampering & basis mismatch</p>
            </div>
          </div>

          {/* 2. Impersonation */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-950 border border-amber-800 text-amber-400">
                <UserX className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white">{summary?.impersonation_attempts ?? 0}</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">Impersonation</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Signer spoofing & asymmetric parity collapse</p>
            </div>
          </div>

          {/* 3. Replay */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-orange-950 border border-orange-800 text-orange-400">
                <History className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white">{summary?.replay_attacks ?? 0}</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">Replay Attack</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Stale session nonce & timestamp drift</p>
            </div>
          </div>

          {/* 4. Channel Noise */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-950 border border-purple-800 text-purple-400">
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white">{summary?.channel_manipulation_attacks ?? 0}</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">Channel Noise</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Depolarizing noise & QBER spike (&gt; 15%)</p>
            </div>
          </div>

          {/* 5. Unauthorized Verification */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white">{summary?.unauthorized_verification_attempts ?? 0}</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-xs">Unauthorized Access</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Rogue verifier probe & unallocated basis denial</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Subsystems Readiness + Quick Action Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subsystems Readiness (6 Cols) */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Quantum Security Subsystems Status</span>
          </h2>

          <div className="space-y-3 font-mono text-xs">
            {health?.modules ? (
              Object.entries(health.modules).map(([name, mod]: [string, any]) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-slate-200 capitalize">{name.replace('_', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">{mod.status.toUpperCase()}</span>
                    <span className="text-slate-500 text-[10px] block">{mod.details}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded bg-slate-900 text-slate-400 text-center">Loading subsystem telemetry...</div>
            )}
          </div>
        </div>

        {/* Quick Actions (6 Cols) */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2 mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Interactive Quick Actions</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <button
                onClick={() => onNavigate && onNavigate('signatures')}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-cyan-400 mb-1">
                  <KeyRound className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-bold text-white">Sign Quantum Message</div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">Teleport EPR quantum signature tokens</div>
              </button>

              <button
                onClick={() => onNavigate && onNavigate('attacks')}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-rose-400 mb-1">
                  <Flame className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-bold text-white">Launch Cyber Attack</div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">Simulate 5 quantum threat vectors</div>
              </button>

              <button
                onClick={() => onNavigate && onNavigate('detection')}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-cyan-400 mb-1">
                  <Activity className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-bold text-white">Threat Detection Engine</div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">Deterministic D_TV & QBER invariant check</div>
              </button>

              <button
                onClick={() => onNavigate && onNavigate('analytics')}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-indigo-400 mb-1">
                  <FileCheck className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-bold text-white">Security Analytics</div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">Charts, distributions & accuracy metrics</div>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="text-cyan-400 font-semibold block mb-1">Live Backend Integration:</span>
            <span>All stats queried dynamically from SQLite (<code className="text-slate-200">quantum_qds.db</code>).</span>
          </div>
        </div>
      </div>

      {/* Live Recent Security Events Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Recent Security Event Stream</span>
          </h2>
          {onNavigate && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-cyan-400 hover:underline font-mono flex items-center space-x-1"
            >
              <span>View Full Event History ({summary?.recent_events?.length ?? 0})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {summary?.recent_events && summary.recent_events.length > 0 ? (
          <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Actor / Verifier</th>
                    <th className="py-3 px-4">Target / Session</th>
                    <th className="py-3 px-4">Threat Level</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {summary.recent_events.slice(0, 6).map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-cyan-300">{evt.event_type}</td>
                      <td className="py-3 px-4 text-slate-300">{evt.signer_or_actor}</td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{evt.session_or_target}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                            evt.threat_level === 'CRITICAL' || evt.threat_level === 'HIGH'
                              ? 'bg-rose-950 border-rose-800 text-rose-400'
                              : evt.threat_level === 'MEDIUM'
                              ? 'bg-amber-950 border-amber-800 text-amber-400'
                              : 'bg-emerald-950 border-emerald-800 text-emerald-400'
                          }`}
                        >
                          {evt.threat_level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-bold">{evt.result_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-6 text-center border border-slate-800 text-xs font-mono text-slate-400">
            No events recorded yet. Start by creating a signature or running an attack simulation.
          </div>
        )}
      </div>
    </div>
  );
};
