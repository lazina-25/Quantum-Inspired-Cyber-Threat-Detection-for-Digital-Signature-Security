import { apiClient } from './api';
import {
  CreateSignatureRequest,
  CreateSignatureResponse,
  VerifySignatureRequest,
  VerifySignatureResponse,
  SignatureListItem,
} from '../types/signature';

export const createSignatureApi = async (
  request: CreateSignatureRequest
): Promise<{ data: CreateSignatureResponse; latencyMs: number }> => {
  const startTime = performance.now();
  const response = await apiClient.post<CreateSignatureResponse>('/api/signatures/create', request);
  const latencyMs = Math.round(performance.now() - startTime);
  return { data: response.data, latencyMs };
};

export const verifySignatureApi = async (
  request: VerifySignatureRequest
): Promise<{ data: VerifySignatureResponse; latencyMs: number }> => {
  const startTime = performance.now();
  const response = await apiClient.post<VerifySignatureResponse>('/api/signatures/verify', request);
  const latencyMs = Math.round(performance.now() - startTime);
  return { data: response.data, latencyMs };
};

export const listSignaturesApi = async (): Promise<SignatureListItem[]> => {
  const response = await apiClient.get<SignatureListItem[]>('/api/signatures');
  return response.data;
};

export const getSignatureDetailsApi = async (signatureId: string): Promise<any> => {
  const response = await apiClient.get(`/api/signatures/${signatureId}`);
  return response.data;
};
