export type ThreatStatus = 'LEGITIMATE' | 'ATTACK' | 'SUSPICIOUS';

export type ThreatClassification =
  | 'LEGITIMATE'
  | 'FORGERY'
  | 'IMPERSONATION'
  | 'REPLAY'
  | 'CHANNEL_MANIPULATION'
  | 'UNAUTHORIZED_VERIFICATION'
  | 'SUSPICIOUS_ANOMALY';

export interface ThreatAnalysisRequest {
  signature_id: string;
  verifier_id?: string;
  tested_message?: string;
  attack_context_id?: string;
}

export interface ThreatAnalysisResponse {
  analysis_id: string;
  signature_id: string;
  verifier_id: string;
  status: ThreatStatus;
  attack_type: ThreatClassification;
  threat_score: number;
  deviation: number;
  threshold: number;
  qber: number;
  fidelity: number;
  forgery_probability: number;
  evidence: string[];
  telemetry: {
    qber: number;
    total_variation_distance: number;
    fidelity: number;
    chi_square: number;
    max_error: number;
    forgery_confidence: number;
    theoretical_forgery_bound: number;
    timestamp_delta_seconds: number;
    parity_delta: number;
    thresholds: {
      qber_max: number;
      tvd_max: number;
      fidelity_min: number;
      replay_delta_max: number;
    };
  };
  timestamp: string;
}

export interface ThreatHistoryItem {
  analysis_id: string;
  signature_id: string;
  verifier_id: string;
  status: string;
  attack_type: string;
  threat_score: number;
  deviation: number;
  qber: number;
  created_at: string;
}
