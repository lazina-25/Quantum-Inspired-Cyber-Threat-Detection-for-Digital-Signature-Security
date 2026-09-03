export interface QuantumTokenItem {
  index: number;
  state_label: string;
  basis: string;
  expected_bit: number;
  bsm_outcome: string;
  pauli_correction: string;
  fidelity: number;
}

export interface CreateSignatureRequest {
  signer_id: string;
  public_identity?: string;
  message_content: string;
  session_nonce?: string;
  shots: number;
  token_count: number;
}

export interface CreateSignatureResponse {
  signature_id: string;
  message_id: string;
  signer_id: string;
  public_identity: string;
  message_content: string;
  message_hash: string;
  session_nonce: string;
  quantum_tokens: QuantumTokenItem[];
  teleportation_fidelity_avg: number;
  created_at: string;
}

export interface VerifySignatureRequest {
  signature_id: string;
  message_content: string;
  verifier_id: string;
}

export interface TokenVerificationDetail {
  index: number;
  expected_state: string;
  expected_basis: string;
  pauli_correction_applied: string;
  measured_bit: number;
  is_match: boolean;
}

export interface VerifySignatureResponse {
  signature_id: string;
  message_id: string;
  signer_id: string;
  verifier_id: string;
  original_message_hash: string;
  tested_message_hash: string;
  is_message_tampered: boolean;
  verification_status: 'ACCEPTED' | 'REJECTED' | string;
  verification_score: number;
  qber: number;
  fidelity_score: number;
  measurement_counts: {
    matches: number;
    mismatches: number;
  };
  expected_distribution: {
    expected_match_rate: number;
    max_allowed_qber: number;
  };
  observed_distribution: {
    match_rate: number;
    qber: number;
  };
  token_verifications: TokenVerificationDetail[];
  decision_reason: string;
  timestamp: string;
}

export interface SignatureListItem {
  signature_id: string;
  message_id: string;
  signer_id: string;
  message_preview: string;
  message_hash: string;
  session_nonce: string;
  token_count: number;
  created_at: string;
  last_verification_status: string;
  last_verified_at?: string;
}
