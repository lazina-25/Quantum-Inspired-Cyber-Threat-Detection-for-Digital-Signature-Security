import { apiClient } from './api';
import { TeleportationRequest, TeleportationResponse } from '../types/teleportation';

export const simulateTeleportationApi = async (
  request: TeleportationRequest
): Promise<{ data: TeleportationResponse; latencyMs: number }> => {
  const startTime = performance.now();
  const response = await apiClient.post<TeleportationResponse>('/api/quantum/teleport', request);
  const latencyMs = Math.round(performance.now() - startTime);
  return { data: response.data, latencyMs };
};
