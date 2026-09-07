import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  RefreshCw,
  FileCheck2,
} from 'lucide-react';
import { getAnalyticsSummaryApi } from '../services/analyticsApi';
import { SecurityEventItem } from '../types/analytics';

export const EventHistoryPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SecurityEventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsSummaryApi();
      setEvents(res.data.recent_events || []);
    } catch (err) {
      console.error('Failed to load event history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let list = [...events];

    if (selectedSeverity !== 'ALL') {
      list = list.filter((e) => e.threat_level === selectedSeverity);
    }

    if (selectedType !== 'ALL') {
      list = list.filter((e) => e.event_type === selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.signer_or_actor.toLowerCase().includes(q) ||
          e.session_or_target.toLowerCase().includes(q) ||
          e.event_type.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q) ||
          (e.attack_type && e.attack_type.toLowerCase().includes(q))
      );
    }

    setFilteredEvents(list);
  }, [events, selectedSeverity, selectedType, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="page-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="page-header-badge">
              <History className="w-3.5 h-3.5 text-yellow-800" />
              <span>Security Audit Trail</span>
            </div>
            <h1 className="page-title">Event History</h1>
            <p className="page-description">
              Real-time audit log of signatures, projective measurements, attack scenarios, and verification verdicts.
            </p>
          </div>

          <button
            onClick={fetchEvents}
            disabled={loading}
            className="btn-secondary shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-yellow-600' : ''}`} />
            <span>Refresh Events</span>
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        /* Initial Empty State */
        <div className="app-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center justify-center mx-auto mb-2">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-charcoal">No events yet</h3>
          <p className="text-xs text-secondary max-w-md mx-auto leading-relaxed">
            Your signature verifications and security simulations will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Filters & Search Toolbar */}
          <div className="app-card p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            {/* Search */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-secondary absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by actor, target ID, details..."
                className="app-input pl-9 text-xs"
              />
            </div>

            {/* Severity Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="app-select text-xs"
              >
                <option value="ALL">Severity: All</option>
                <option value="LOW">Severity: Low</option>
                <option value="MEDIUM">Severity: Medium</option>
                <option value="HIGH">Severity: High</option>
                <option value="CRITICAL">Severity: Critical</option>
              </select>
            </div>

            {/* Event Type Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="app-select text-xs"
              >
                <option value="ALL">Type: All Events</option>
                <option value="SIGNATURE_CREATED">Signature Created</option>
                <option value="SIGNATURE_VERIFIED">Signature Verified</option>
                <option value="ATTACK_SIMULATED">Attack Simulated</option>
                <option value="THREAT_ANALYZED">Threat Analyzed</option>
              </select>
            </div>
          </div>

          {/* Events Table */}
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-border text-xs text-secondary shadow-sm">
              <FileCheck2 className="w-8 h-8 text-secondary mx-auto mb-2 opacity-50" />
              <p>No matching security events found for the selected filter.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans">
                  <thead className="bg-surface text-secondary text-xs font-semibold uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Threat Level</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs sm:text-sm">
                    {filteredEvents.map((evt) => (
                      <tr key={evt.id} className="hover:bg-surface/60 transition-colors">
                        <td className="py-3.5 px-4 text-secondary font-mono text-xs whitespace-nowrap">
                          {new Date(evt.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-charcoal whitespace-nowrap">
                          {evt.signer_or_actor} &rarr; {evt.session_or_target}
                        </td>
                        <td className="py-3.5 px-4 text-charcoal font-medium whitespace-nowrap">
                          {evt.event_type}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-charcoal whitespace-nowrap">
                          {evt.result_status}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${
                              evt.threat_level === 'CRITICAL' || evt.threat_level === 'HIGH'
                                ? 'bg-red-50 border-red-200 text-red-700'
                                : evt.threat_level === 'MEDIUM'
                                ? 'bg-amber-50 border-amber-200 text-amber-700'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            }`}
                          >
                            {evt.threat_level}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-secondary max-w-sm text-xs sm:text-sm leading-relaxed">{evt.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
