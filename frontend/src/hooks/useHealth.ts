import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../services/api';
import { HealthCheckResponse } from '../types/health';

interface UseHealthReturn {
  health: HealthCheckResponse | null;
  loading: boolean;
  error: string | null;
  latencyMs: number | null;
  lastChecked: Date | null;
  refetch: () => Promise<void>;
}

export const useHealth = (pollIntervalMs: number = 10000): UseHealthReturn => {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setError(null);
      const result = await checkHealth();
      setHealth(result.data);
      setLatencyMs(result.latencyMs);
      setLastChecked(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server');
      setHealth(null);
      setLatencyMs(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchHealth, pollIntervalMs]);

  return { health, loading, error, latencyMs, lastChecked, refetch: fetchHealth };
};
