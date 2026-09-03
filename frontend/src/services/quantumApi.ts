import { apiClient } from './api';
import {
  BellStateId,
  BellStateRequest,
  BellStateResponse,
  BellStateMetaItem,
} from '../types/quantum';

export const simulateBellState = async (
  bell_state: BellStateId = 'phi_plus',
  shots: number = 1024
): Promise<{ data: BellStateResponse; latencyMs: number }> => {
  const startTime = performance.now();
  const response = await apiClient.post<BellStateResponse>('/api/quantum/bell-state', {
    bell_state,
    shots,
  } as BellStateRequest);
  const latencyMs = Math.round(performance.now() - startTime);
  return { data: response.data, latencyMs };
};

export const fetchBellStatesCatalog = async (): Promise<BellStateMetaItem[]> => {
  const response = await apiClient.get<BellStateMetaItem[]>('/api/quantum/bell-states');
  return response.data;
};
