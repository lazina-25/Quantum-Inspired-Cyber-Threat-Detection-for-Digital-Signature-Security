import React, { useState } from 'react';
import {
  Cpu,
  RefreshCw,
  LayoutDashboard,
  KeyRound,
  Skull,
  Activity,
  TrendingUp,
  History,
  HelpCircle,
  Menu,
  X,
} from 'lucide-react';
import { HelpDocsModal } from './HelpDocsModal';

export type NavTab =
  | 'dashboard'
  | 'signatures'
  | 'attacks'
  | 'detection'
  | 'analytics'
  | 'history'
  | 'quantum';

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
  const [docsOpen, setDocsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabSelect = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <HelpDocsModal isOpen={docsOpen} onClose={() => setDocsOpen(false)} />

      <header className="sticky top-0 z-40 bg-white border-b border-[#EAEAEA] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Product Tagline */}
          <div className="flex items-center space-x-6">
            <div
              className="flex items-center space-x-3 cursor-pointer select-none group"
              onClick={() => handleTabSelect('dashboard')}
            >
              <div className="p-2 rounded-xl bg-yellow-400 text-charcoal font-bold group-hover:bg-yellow-300 transition-colors shadow-xs">
                <Cpu className="w-5 h-5 text-charcoal" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base tracking-tight text-charcoal">Quantum QDS</span>
                </div>
                <p className="text-[11px] text-secondary font-medium leading-none mt-0.5">
                  Secure. Verifiable. Future-Ready.
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-1 pl-5 border-l border-[#EAEAEA] text-sm font-medium">
              {/* Dashboard */}
              <button
                onClick={() => handleTabSelect('dashboard')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all text-sm ${
                  activeTab === 'dashboard'
                    ? 'bg-yellow-400 text-charcoal font-semibold shadow-xs'
                    : 'text-charcoal-700 hover:text-charcoal hover:bg-yellow-50 font-medium'
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-charcoal' : 'text-secondary'}`} />
                <span>Dashboard</span>
              </button>

              {/* Primary Workflow: Digital Signatures */}
              <button
                onClick={() => handleTabSelect('signatures')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all text-sm ${
                  activeTab === 'signatures'
                    ? 'bg-yellow-400 text-charcoal font-semibold shadow-xs'
                    : 'text-charcoal-700 hover:text-charcoal hover:bg-yellow-50 font-medium'
                }`}
              >
                <KeyRound className={`w-4 h-4 ${activeTab === 'signatures' ? 'text-charcoal' : 'text-secondary'}`} />
                <span>Digital Signatures</span>
              </button>

              {/* Primary Workflow: Attack Simulator */}
              <button
                onClick={() => handleTabSelect('attacks')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all text-sm ${
                  activeTab === 'attacks'
                    ? 'bg-yellow-400 text-charcoal font-semibold shadow-xs'
                    : 'text-charcoal-700 hover:text-charcoal hover:bg-yellow-50 font-medium'
                }`}
              >
                <Skull className={`w-4 h-4 ${activeTab === 'attacks' ? 'text-charcoal' : 'text-secondary'}`} />
                <span>Attack Simulator</span>
              </button>

              {/* Primary Workflow: Threat Detection */}
              <button
                onClick={() => handleTabSelect('detection')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all text-sm ${
                  activeTab === 'detection'
                    ? 'bg-yellow-400 text-charcoal font-semibold shadow-xs'
                    : 'text-charcoal-700 hover:text-charcoal hover:bg-yellow-50 font-medium'
                }`}
              >
                <Activity className={`w-4 h-4 ${activeTab === 'detection' ? 'text-charcoal' : 'text-secondary'}`} />
                <span>Threat Detection</span>
              </button>

              {/* Analytics */}
              <button
                onClick={() => handleTabSelect('analytics')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all text-sm ${
                  activeTab === 'analytics'
                    ? 'bg-yellow-400 text-charcoal font-semibold shadow-xs'
                    : 'text-charcoal-700 hover:text-charcoal hover:bg-yellow-50 font-medium'
                }`}
              >
                <TrendingUp className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-charcoal' : 'text-secondary'}`} />
                <span>Analytics</span>
              </button>

              {/* Event History */}
              <button
                onClick={() => handleTabSelect('history')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all text-sm ${
                  activeTab === 'history'
                    ? 'bg-yellow-400 text-charcoal font-semibold shadow-xs'
                    : 'text-charcoal-700 hover:text-charcoal hover:bg-yellow-50 font-medium'
                }`}
              >
                <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-charcoal' : 'text-secondary'}`} />
                <span>Event History</span>
              </button>
            </nav>
          </div>

          {/* Right Action Items & Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Help / Documentation Trigger */}
            <button
              onClick={() => setDocsOpen(true)}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-[#EAEAEA] hover:border-yellow-400 bg-white hover:bg-yellow-50 text-charcoal text-sm font-medium transition-all"
              title="Documentation & Concept Guide"
            >
              <HelpCircle className="w-4 h-4 text-yellow-600" />
              <span>Help & Docs</span>
            </button>

            {/* Backend Connection Status Badge */}
            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-surface border border-[#EAEAEA] text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isHealthy ? 'bg-success' : 'bg-danger'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isHealthy ? 'bg-success' : 'bg-danger'
                  }`}
                />
              </span>
              <span className="text-charcoal text-[11px] font-sans font-medium hidden sm:inline">
                {isHealthy ? 'Backend Online' : 'Backend Offline'}
              </span>
              {latencyMs !== null && (
                <span className="text-secondary text-[10px] hidden md:inline">
                  {latencyMs.toFixed(0)}ms
                </span>
              )}
            </div>

            {/* Manual Status Ping Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-lg border border-[#EAEAEA] hover:border-yellow-400 text-secondary hover:text-charcoal hover:bg-yellow-50 transition-colors disabled:opacity-50"
              title="Ping Backend Status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-charcoal' : ''}`} />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg border border-[#EAEAEA] text-charcoal hover:bg-yellow-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Sub-header Navigation Bar for Mid-sized screens */}
        <div className="xl:hidden flex items-center space-x-1 px-4 py-2 border-t border-[#EAEAEA] overflow-x-auto text-sm bg-white">
          <button
            onClick={() => handleTabSelect('dashboard')}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors font-medium text-sm ${
              activeTab === 'dashboard' ? 'bg-yellow-400 text-charcoal font-semibold shadow-xs' : 'text-charcoal-700 hover:bg-yellow-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleTabSelect('signatures')}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors font-medium text-sm ${
              activeTab === 'signatures' ? 'bg-yellow-400 text-charcoal font-semibold shadow-xs' : 'text-charcoal-700 hover:bg-yellow-50'
            }`}
          >
            Signatures
          </button>
          <button
            onClick={() => handleTabSelect('attacks')}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors font-medium text-sm ${
              activeTab === 'attacks' ? 'bg-yellow-400 text-charcoal font-semibold shadow-xs' : 'text-charcoal-700 hover:bg-yellow-50'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => handleTabSelect('detection')}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors font-medium text-sm ${
              activeTab === 'detection' ? 'bg-yellow-400 text-charcoal font-semibold shadow-xs' : 'text-charcoal-700 hover:bg-yellow-50'
            }`}
          >
            Detection
          </button>
          <button
            onClick={() => handleTabSelect('analytics')}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors font-medium text-sm ${
              activeTab === 'analytics' ? 'bg-yellow-400 text-charcoal font-semibold shadow-xs' : 'text-charcoal-700 hover:bg-yellow-50'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => handleTabSelect('history')}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors font-medium text-sm ${
              activeTab === 'history' ? 'bg-yellow-400 text-charcoal font-semibold shadow-xs' : 'text-charcoal-700 hover:bg-yellow-50'
            }`}
          >
            History
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#EAEAEA] bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block px-3 pt-1">
              Modules
            </span>
            <button
              onClick={() => handleTabSelect('dashboard')}
              className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-left text-xs font-medium ${
                activeTab === 'dashboard' ? 'bg-yellow-400 text-charcoal font-bold' : 'text-charcoal hover:bg-yellow-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => handleTabSelect('signatures')}
              className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-left text-xs font-medium ${
                activeTab === 'signatures' ? 'bg-yellow-400 text-charcoal font-bold' : 'text-charcoal hover:bg-yellow-50'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Step 1: Digital Signatures</span>
            </button>
            <button
              onClick={() => handleTabSelect('attacks')}
              className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-left text-xs font-medium ${
                activeTab === 'attacks' ? 'bg-yellow-400 text-charcoal font-bold' : 'text-charcoal hover:bg-yellow-50'
              }`}
            >
              <Skull className="w-4 h-4" />
              <span>Step 2: Attack Simulator</span>
            </button>
            <button
              onClick={() => handleTabSelect('detection')}
              className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-left text-xs font-medium ${
                activeTab === 'detection' ? 'bg-yellow-400 text-charcoal font-bold' : 'text-charcoal hover:bg-yellow-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Step 3: Threat Detection</span>
            </button>

            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block px-3 pt-3">
              Analytics & Logs
            </span>
            <button
              onClick={() => handleTabSelect('analytics')}
              className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-left text-xs font-medium ${
                activeTab === 'analytics' ? 'bg-yellow-400 text-charcoal font-bold' : 'text-charcoal hover:bg-yellow-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => handleTabSelect('history')}
              className={`flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-left text-xs font-medium ${
                activeTab === 'history' ? 'bg-yellow-400 text-charcoal font-bold' : 'text-charcoal hover:bg-yellow-50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Event History</span>
            </button>

            <button
              onClick={() => {
                setDocsOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2.5 w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium text-charcoal-600 hover:bg-yellow-50 border-t border-[#EAEAEA] mt-2"
            >
              <HelpCircle className="w-4 h-4 text-yellow-600" />
              <span>Help & Documentation</span>
            </button>
          </div>
        )}
      </header>
    </>
  );
};
