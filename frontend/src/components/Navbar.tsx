import React, { useState } from 'react';
import {
  Cpu,
  RefreshCw,
  LayoutDashboard,
  Atom,
  KeyRound,
  Skull,
  Activity,
  TrendingUp,
  History,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { HelpDocsModal } from './HelpDocsModal';

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
  const [docsOpen, setDocsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: NavTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quantum', label: 'Quantum Lab', icon: Atom },
    { id: 'signatures', label: 'Digital Signatures', icon: KeyRound },
    { id: 'attacks', label: 'Attack Simulator', icon: Skull },
    { id: 'detection', label: 'Threat Detection', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'history', label: 'Event History', icon: History },
  ];

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
                <p className="text-[11px] text-charcoal-500 font-medium leading-none mt-0.5">
                  Secure. Verifiable. Future-Ready.
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden xl:flex items-center space-x-1.5 pl-5 border-l border-[#EAEAEA] text-xs font-medium">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleTabSelect(link.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-yellow-400 text-charcoal font-bold shadow-xs'
                        : 'text-charcoal-600 hover:text-charcoal hover:bg-yellow-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-charcoal' : 'text-charcoal-400'}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Items & Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Help / Documentation Trigger */}
            <button
              onClick={() => setDocsOpen(true)}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#EAEAEA] hover:border-yellow-400 bg-white hover:bg-yellow-50 text-charcoal text-xs font-medium transition-all"
              title="Documentation & Concept Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-yellow-600" />
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
              <span className="text-charcoal-700 text-[11px] font-sans font-medium hidden sm:inline">
                {isHealthy ? 'Backend Online' : 'Backend Offline'}
              </span>
              {latencyMs !== null && (
                <span className="text-charcoal-400 text-[10px] border-l border-[#EAEAEA] pl-1.5">
                  {latencyMs}ms
                </span>
              )}
            </div>

            {/* Refresh Action */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-lg border border-[#EAEAEA] hover:border-yellow-400 hover:bg-yellow-50 text-charcoal-600 hover:text-charcoal transition-colors disabled:opacity-50"
              title="Refresh System Health"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-charcoal' : ''}`} />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg border border-[#EAEAEA] text-charcoal-700 hover:bg-yellow-50"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-charcoal" /> : <Menu className="w-5 h-5 text-charcoal" />}
            </button>
          </div>
        </div>

        {/* Medium Screen Horizontal Subnav */}
        <div className="hidden lg:flex xl:hidden border-t border-[#EAEAEA] px-4 py-1.5 overflow-x-auto space-x-1 text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleTabSelect(link.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg shrink-0 transition-colors ${
                  isActive
                    ? 'bg-yellow-400 text-charcoal font-bold shadow-xs'
                    : 'text-charcoal-600 hover:bg-yellow-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EAEAEA] bg-white px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleTabSelect(link.id)}
                  className={`flex items-center space-x-2.5 w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-yellow-400 text-charcoal font-bold shadow-xs'
                      : 'text-charcoal-600 hover:bg-yellow-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-charcoal' : 'text-charcoal-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
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
