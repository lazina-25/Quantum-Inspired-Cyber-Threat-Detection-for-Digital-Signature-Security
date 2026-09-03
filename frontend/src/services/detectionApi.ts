import { apiClient } from './api';
import {
  ThreatAnalysisRequest,
  ThreatAnalysisResponse,
  ThreatHistoryItem,
} from '../types/detection';

export const analyzeThreatApi = async (
  payload: ThreatAnalysisRequest
): Promise<{ data: ThreatAnalysisResponse; latencyMs: number }> => {
  const startTime = performance.now();
  const res = await apiClient.post<ThreatAnalysisResponse>('/api/detection/analyze', payload);
  const latencyMs = Math.round(performance.now() - startTime);
  return { data: res.data, latencyMs };
};

export const getThreatAnalysisApi = async (
  analysisId: string
): Promise<ThreatAnalysisResponse> => {
  const res = await apiClient.get<ThreatAnalysisResponse>(`/api/detection/${analysisId}`);
  return res.data;
};

export const getThreatHistoryApi = async (): Promise<ThreatHistoryItem[]> => {
  const res = await apiClient.get<ThreatHistoryItem[]>('/api/detection/history');
  return res.data;
};
