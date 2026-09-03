import { apiClient } from './api';
import { AnalyticsSummaryResponse } from '../types/analytics';

export const getAnalyticsSummaryApi = async (): Promise<{ data: AnalyticsSummaryResponse; latencyMs: number }> => {
  const startTime = performance.now();
  const res = await apiClient.get<AnalyticsSummaryResponse>('/api/analytics/summary');
  const latencyMs = Math.round(performance.now() - startTime);
  return { data: res.data, latencyMs };
};
