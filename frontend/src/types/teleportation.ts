export type InputStateId = 'zero' | 'one' | 'plus' | 'minus' | 'custom';
export type VerificationBasisId = 'auto' | 'z_basis' | 'x_basis';

export interface AmplitudeItem {
  basis: string;
  real: number;
  imag: number;
  probability: number;
  formatted: string;
}

export interface TeleportationRequest {
  input_state: InputStateId;
  theta?: number;
  phi?: number;
  shots: number;
  verification_basis: VerificationBasisId;
}

export interface TeleportationResponse {
  input_state: InputStateId;
  symbol: string;
  formula: string;
  theta: number;
  phi: number;
  input_amplitudes: AmplitudeItem[];
  reconstructed_amplitudes: AmplitudeItem[];
  fidelity: number;
  is_successful: boolean;
  circuit_text: string;
  circuit_qasm: string;
  shots: number;
  verification_basis: string;
  bell_measurement_counts: Record<string, number>;
  pauli_corrections_applied: Record<string, number>;
  receiver_counts: Record<string, number>;
  receiver_probabilities: Record<string, number>;
  expected_probabilities: Record<string, number>;
}
