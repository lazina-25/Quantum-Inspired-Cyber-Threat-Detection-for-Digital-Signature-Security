import axios from 'axios';
import { HealthCheckResponse } from '../types/health';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

export const checkHealth = async (): Promise<{ data: HealthCheckResponse; latencyMs: number }> => {
  const startTime = performance.now();
  const response = await apiClient.get<HealthCheckResponse>('/api/health');
  const latencyMs = Math.round(performance.now() - startTime);
  return { data: response.data, latencyMs };
};
