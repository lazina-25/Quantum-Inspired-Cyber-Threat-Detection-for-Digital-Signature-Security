import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { getAnalyticsSummaryApi } from '../services/analyticsApi';
import { AnalyticsSummaryResponse } from '../types/analytics';

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsSummaryApi();
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const hasData =
    (summary?.total_signatures ?? 0) > 0 ||
    (summary?.total_attacks ?? 0) > 0 ||
    (summary?.total_threat_analyses ?? 0) > 0;

  // Real data for charts
  const trafficRatioData = [
    {
      name: 'Valid Signatures',
      value: summary?.valid_signatures ?? 0,
      color: '#22A06B',
    },
    {
      name: 'Simulated Attacks',
      value: summary?.total_attacks ?? 0,
      color: '#DC2626',
    },
  ];

  const attackVectorData = [
    {
      name: 'Forgery',
      attempts: summary?.forgery_attempts ?? 0,
    },
    {
      name: 'Impersonation',
      attempts: summary?.impersonation_attempts ?? 0,
    },
    {
      name: 'Replay',
      attempts: summary?.replay_attacks ?? 0,
    },
    {
      name: 'Channel Noise',
      attempts: summary?.channel_manipulation_attacks ?? 0,
    },
    {
      name: 'Unauthorized',
      attempts: summary?.unauthorized_verification_attempts ?? 0,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="page-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="page-header-badge">
              <TrendingUp className="w-3.5 h-3.5 text-yellow-800" />
              <span>System Telemetry & Performance</span>
            </div>
            <h1 className="page-title">
              Security Analytics
            </h1>
            <p className="page-description">
              Empirical statistical evaluations, detection metrics, and attack distributions dynamically queried from backend database records.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="btn-secondary shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-yellow-600' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="app-card p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center justify-center mx-auto">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-charcoal">No analytics data yet</h3>
            <p className="text-xs text-secondary max-w-md mx-auto mt-1 leading-relaxed">
              Run simulations and signature verification to generate security insights.
            </p>
          </div>
        </div>
      ) : (
        /* Real Analytics Data View */
        <div className="space-y-8">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="app-card p-5">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider block">Total Signatures</span>
              <div className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight tabular-nums mt-1.5">{summary?.total_signatures ?? 0}</div>
              <div className="text-xs sm:text-sm text-secondary mt-1">{summary?.valid_signatures ?? 0} valid accepted</div>
            </div>

            <div className="app-card p-5">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider block">Attacks Simulated</span>
              <div className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight tabular-nums mt-1.5">{summary?.total_attacks ?? 0}</div>
              <div className="text-xs sm:text-sm text-secondary mt-1">Across 5 monitored vectors</div>
            </div>

            <div className="app-card p-5">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider block">Threats Detected</span>
              <div className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight tabular-nums mt-1.5">{summary?.total_threat_analyses ?? 0}</div>
              <div className="text-xs sm:text-sm text-secondary mt-1">
                {(summary?.total_attacks ?? 0) > 0 ? `${((summary?.detection_rate ?? 0) * 100).toFixed(0)}% detection rate` : 'No attacks yet'}
              </div>
            </div>

            <div className="app-card p-5">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider block">Average Analysis Time</span>
              <div className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight tabular-nums mt-1.5">
                {(summary?.total_threat_analyses ?? 0) > 0 ? `${summary?.average_detection_time_ms.toFixed(1)} ms` : '0 ms'}
              </div>
              <div className="text-xs sm:text-sm text-secondary mt-1">Real-time evaluation latency</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Attacks by Type */}
            <div className="lg:col-span-7 app-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="section-title">Attacks by Type</h2>
                  <p className="section-subtitle">Distribution of simulated adversarial scenarios</p>
                </div>
                <span className="text-xs font-mono font-semibold text-secondary">Total: {summary?.total_attacks ?? 0}</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attackVectorData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                    <XAxis dataKey="name" stroke="#6B6B6B" tick={{ fontSize: 11, fill: '#6B6B6B' }} />
                    <YAxis stroke="#6B6B6B" tick={{ fontSize: 11, fill: '#6B6B6B' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#EAEAEA', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', color: '#171717', fontSize: '12px' }}
                    />
                    <Bar dataKey="attempts" name="Simulated Attempts" fill="#F5C400" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Request Integrity Ratio */}
            <div className="lg:col-span-5 app-card p-5 sm:p-6 space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="section-title">Verification Outcomes</h2>
                <p className="section-subtitle">Ratio of valid legitimate signatures vs simulated attacks</p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                {trafficRatioData.every((d) => d.value === 0) ? (
                  <div className="text-xs text-secondary text-center">
                    No signature or attack events recorded yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficRatioData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {trafficRatioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#EAEAEA', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', color: '#171717', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
