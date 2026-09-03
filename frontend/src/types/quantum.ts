export type BellStateId = 'phi_plus' | 'phi_minus' | 'psi_plus' | 'psi_minus';

export interface AmplitudeDetail {
  basis_state: string;
  real: number;
  imag: number;
  probability: number;
  phase_rad: number;
  formatted: string;
}

export interface BellStateMetaItem {
  id: BellStateId;
  name: string;
  symbol: string;
  formula: string;
  description: string;
  preparation: string;
}

export interface BellStateResponse {
  bell_state: BellStateId;
  name: string;
  symbol: string;
  formula: string;
  description: string;
  preparation: string;
  circuit_text: string;
  circuit_qasm: string;
  num_qubits: number;
  depth: number;
  shots: number;
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  theoretical_probabilities: Record<string, number>;
  statevector: AmplitudeDetail[];
  gate_count: Record<string, number>;
}

export interface BellStateRequest {
  bell_state: BellStateId;
  shots: number;
}
