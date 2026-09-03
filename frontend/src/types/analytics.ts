export interface SecurityEventItem {
  id: string;
  timestamp: string;
  event_type: 'SIGNATURE_CREATED' | 'SIGNATURE_VERIFIED' | 'ATTACK_SIMULATED' | 'THREAT_ANALYSIS' | string;
  signer_or_actor: string;
  session_or_target: string;
  result_status: string;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  attack_type?: string | null;
  details: string;
}

export interface AnalyticsSummaryResponse {
  total_signatures: number;
  valid_signatures: number;
  failed_signatures: number;
  total_attacks: number;
  forgery_attempts: number;
  impersonation_attempts: number;
  replay_attacks: number;
  channel_manipulation_attacks: number;
  unauthorized_verification_attempts: number;
  total_threat_analyses: number;
  attacks_detected: number;
  legitimate_verified: number;
  detection_rate: number;
  false_positive_rate: number;
  false_negative_rate: number;
  average_detection_time_ms: number;
  recent_events: SecurityEventItem[];
}
