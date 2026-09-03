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

  const fetchEvents = async () => {
    try {
      const res = await getAnalyticsSummaryApi();
      setEvents(res.data.recent_events || []);
    } catch (err) {
      console.error('Failed to load event history', err);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono mb-2">
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Unified Security Audit Stream</span>
          </div>
          <h1 className="text-2xl font-black text-white">Event History & Forensic Audit Log</h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time audit log of signatures, projective measurements, attack scenarios, and deterministic threat decisions.
          </p>
        </div>

        <button
          onClick={fetchEvents}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-200 hover:text-cyan-300 text-xs font-mono transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Events</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs font-mono">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by actor, target ID, details..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Severity Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Severity: ALL</option>
            <option value="LOW">Severity: LOW</option>
            <option value="MEDIUM">Severity: MEDIUM</option>
            <option value="HIGH">Severity: HIGH</option>
            <option value="CRITICAL">Severity: CRITICAL</option>
          </select>
        </div>

        {/* Event Type Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Type: ALL EVENTS</option>
            <option value="SIGNATURE_CREATED">SIGNATURE_CREATED</option>
            <option value="SIGNATURE_VERIFIED">SIGNATURE_VERIFIED</option>
            <option value="ATTACK_SIMULATED">ATTACK_SIMULATED</option>
            <option value="THREAT_ANALYZED">THREAT_ANALYZED</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      {filteredEvents.length === 0 ? (
        <div className="glass-panel rounded-xl p-12 text-center border border-slate-800 text-xs font-mono text-slate-400 space-y-2">
          <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto" />
          <p>No matching security events found.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Actor / Verifier</th>
                  <th className="py-3 px-4">Target / Session</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Threat Level</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-cyan-300 whitespace-nowrap">
                      {evt.event_type}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{evt.signer_or_actor}</td>
                    <td className="py-3 px-4 text-slate-400">{evt.session_or_target}</td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {evt.result_status}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
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
                    <td className="py-3 px-4 text-slate-400 max-w-sm">{evt.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
