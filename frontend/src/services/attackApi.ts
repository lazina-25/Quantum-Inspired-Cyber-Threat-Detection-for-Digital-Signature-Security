import { apiClient } from './api';
import {
  AttackResponse,
  AttackHistoryItem,
  ForgeryAttackPayload,
  ImpersonationAttackPayload,
  ReplayAttackPayload,
  ChannelManipulationPayload,
  UnauthorizedVerificationPayload,
} from '../types/attack';

export const launchForgeryAttackApi = async (
  payload: ForgeryAttackPayload
): Promise<{ data: AttackResponse; latencyMs: number }> => {
  const startTime = performance.now();
  const res = await apiClient.post<AttackResponse>('/api/attacks/forge', payload);
  const latencyMs = Math.round(performance.now() - startTime);
  return { data: res.data, latencyMs };
};

export const launchImpersonationAttackApi = async (
  payload: ImpersonationAttackPayload
): Promise<{ data: AttackResponse; latencyMs: number }> => {
  const startTime = performance.now();
  const res = await apiClient.post<AttackResponse>('/api/attacks/impersonate', payload);
  const latencyMs = Math.round(performance.now() - startTime);
  return { data: res.data, latencyMs };
};

export const launchReplayAttackApi = async (
  payload: ReplayAttackPayload
): Promise<{ data: AttackResponse; latencyMs: number }> => {
  const startTime = performance.now();
  const res = await apiClient.post<AttackResponse>('/api/attacks/replay', payload);
  const latencyMs = Math.round(performance.now() - startTime);
  return { data: res.data, latencyMs };
};

export const launchChannelManipulationAttackApi = async (
  payload: ChannelManipulationPayload
): Promise<{ data: AttackResponse; latencyMs: number }> => {
  const startTime = performance.now();
  const res = await apiClient.post<AttackResponse>('/api/attacks/channel-manipulation', payload);
  const latencyMs = Math.round(performance.now() - startTime);
  return { data: res.data, latencyMs };
};

export const launchUnauthorizedVerificationAttackApi = async (
  payload: UnauthorizedVerificationPayload
): Promise<{ data: AttackResponse; latencyMs: number }> => {
  const startTime = performance.now();
  const res = await apiClient.post<AttackResponse>('/api/attacks/unauthorized-verification', payload);
  const latencyMs = Math.round(performance.now() - startTime);
  return { data: res.data, latencyMs };
};

export const getAttackHistoryApi = async (): Promise<AttackHistoryItem[]> => {
  const res = await apiClient.get<AttackHistoryItem[]>('/api/attacks/history');
  return res.data;
};
