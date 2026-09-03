export type AttackTypeId =
  | 'forgery'
  | 'impersonation'
  | 'replay'
  | 'channel_manipulation'
  | 'unauthorized_verification';

export interface ForgeryAttackPayload {
  target_signature_id: string;
  forged_message?: string;
  tamper_token_ratio: number;
  attacker_id: string;
}

export interface ImpersonationAttackPayload {
  target_signature_id: string;
  spoofed_signer_id?: string;
  attacker_id: string;
}

export interface ReplayAttackPayload {
  target_signature_id: string;
  timestamp_delta_seconds: number;
  replayed_nonce?: string;
  attacker_id: string;
}

export interface ChannelManipulationPayload {
  target_signature_id: string;
  noise_type: 'depolarizing' | 'intercept_resend' | 'bit_flip' | 'phase_flip';
  noise_intensity: number;
  attacker_id: string;
}

export interface UnauthorizedVerificationPayload {
  target_signature_id: string;
  unauthorized_verifier_id: string;
  tampered_basis_token?: string;
  attacker_id: string;
}

export interface AttackResponse {
  attack_id: string;
  attack_type: AttackTypeId;
  target_signature_id: string;
  target_signer_id: string;
  attacker_id: string;
  parameters: Record<string, any>;
  original_data: Record<string, any>;
  manipulated_data: Record<string, any>;
  resulting_measurements: Record<string, any>;
  statistical_deviation: number;
  expected_outcome: string;
  timestamp: string;
}

export interface AttackHistoryItem {
  attack_id: string;
  attack_type: AttackTypeId;
  target_signature_id: string;
  target_signer_id: string;
  attacker_id: string;
  statistical_deviation: number;
  expected_outcome: string;
  created_at: string;
}
