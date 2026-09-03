import React from 'react';
import {
  Cpu,
  RefreshCw,
  LayoutDashboard,
  Atom,
  KeyRound,
  Skull,
  Activity,
  TrendingUp,
  History
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'quantum'
  | 'signatures'
  | 'attacks'
  | 'detection'
  | 'analytics'
  | 'history';

interface NavbarProps {
  status: string;
  latencyMs: number | null;
  onRefresh: () => void;
  loading: boolean;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  latencyMs,
  onRefresh,
  loading,
  activeTab,
  onTabChange,
}) => {
  const isHealthy = status === 'healthy';

  const navLinks: { id: NavTab; label: string; icon: any; highlight?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quantum', label: 'Quantum Lab', icon: Atom },
    { id: 'signatures', label: 'Signatures', icon: KeyRound },
    { id: 'attacks', label: 'Attack Simulator', icon: Skull },
    { id: 'detection', label: 'Threat Engine', icon: Activity, highlight: true },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'history', label: 'Event History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-900/40 bg-[#070b14]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onTabChange('dashboard')}
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">Quantum QDS</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
                  SIH 2026
                </span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 border-l border-slate-800 pl-4 font-mono text-xs">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onTabChange(link.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? link.highlight
                        ? 'bg-cyan-950 border border-cyan-500/80 text-cyan-300 shadow-md shadow-cyan-500/20 font-bold'
                        : 'bg-slate-900 border border-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Status Badges & Action */}
        <div className="flex items-center space-x-3">
          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isHealthy ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>
            <span className="text-slate-300 hidden sm:inline">
              {isHealthy ? 'Backend Online' : 'Backend Offline'}
            </span>
            {latencyMs !== null && (
              <span className="text-slate-500 border-l border-slate-700 pl-2">
                {latencyMs}ms
              </span>
            )}
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-all disabled:opacity-50"
            title="Refresh System Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Subnav */}
      <div className="lg:hidden border-t border-slate-800 px-4 py-2 flex overflow-x-auto space-x-2 font-mono text-xs">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg shrink-0 ${
                isActive
                  ? 'bg-cyan-950 border border-cyan-500/80 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
