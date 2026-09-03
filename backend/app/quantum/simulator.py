"""Quantum circuit simulator using Qiskit statevectors and samplers."""

import math
from typing import Dict, List, Any
from pydantic import BaseModel
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit.primitives import StatevectorSampler


class AmplitudeDetail(BaseModel):
    """Detailed quantum amplitude representation for a computational basis state."""

    basis_state: str
    real: float
    imag: float
    probability: float
    phase_rad: float
    formatted: str


class SimulationResult(BaseModel):
    """Encapsulates exact statevector math and empirical shot measurement outcomes."""

    shots: int
    counts: Dict[str, int]
    probabilities: Dict[str, float]
    theoretical_probabilities: Dict[str, float]
    statevector: List[AmplitudeDetail]
    num_qubits: int
    depth: int
    gate_count: Dict[str, int]


def simulate_bell_circuit(
    circuit: QuantumCircuit,
    circuit_without_meas: QuantumCircuit,
    shots: int = 1024,
) -> SimulationResult:
    """Execute rigorous quantum simulation for a Bell state circuit.

    Args:
        circuit: The circuit with measurement operations for shot sampling.
        circuit_without_meas: Pure unitary circuit for analytical statevector extraction.
        shots: Number of measurement repetitions.

    Returns:
        SimulationResult containing both theoretical and empirical distributions.
    """
    if shots <= 0:
        raise ValueError("Number of shots must be a positive integer.")

    # 1. Analytical Statevector Extraction (Ideal pure state)
    sv = Statevector.from_instruction(circuit_without_meas)
    raw_probs = sv.probabilities_dict()

    # Build canonical basis state keys (e.g. for 2 qubits: '00', '01', '10', '11')
    num_qubits = circuit.num_qubits
    basis_states = [format(i, f"0{num_qubits}b") for i in range(2**num_qubits)]

    theoretical_probabilities: Dict[str, float] = {
        state: float(raw_probs.get(state, 0.0)) for state in basis_states
    }

    statevector_details: List[AmplitudeDetail] = []
    for idx, state in enumerate(basis_states):
        amp = sv.data[idx]
        prob = float(abs(amp) ** 2)
        phase = math.atan2(amp.imag, amp.real) if abs(amp) > 1e-12 else 0.0
        
        sign = "+" if amp.imag >= 0 else "-"
        formatted = f"{amp.real:.4f} {sign} {abs(amp.imag):.4f}i" if abs(amp.imag) > 1e-12 else f"{amp.real:.4f}"
        
        statevector_details.append(
            AmplitudeDetail(
                basis_state=state,
                real=round(float(amp.real), 6),
                imag=round(float(amp.imag), 6),
                probability=round(prob, 6),
                phase_rad=round(phase, 4),
                formatted=formatted,
            )
        )

    # 2. Empirical Shot Sampling (Simulating physical quantum measurement)
    sampler = StatevectorSampler()
    pub = (circuit,)
    job = sampler.run([pub], shots=shots)
    pub_result = job.result()[0]
    
    # Extract bitstring counts from Qiskit DataBin
    counts_raw: Dict[str, int] = {}
    if hasattr(pub_result.data, "c"):
        counts_raw = pub_result.data.c.get_counts()
    elif hasattr(pub_result.data, "meas"):
        counts_raw = pub_result.data.meas.get_counts()
    else:
        # Fallback to first available classical register in DataBin
        for field in dir(pub_result.data):
            if not field.startswith("_"):
                val = getattr(pub_result.data, field)
                if hasattr(val, "get_counts"):
                    counts_raw = val.get_counts()
                    break

    # Normalize counts ensuring string keys
    counts: Dict[str, int] = {str(k): int(v) for k, v in counts_raw.items()}

    # Compute empirical probabilities
    empirical_probabilities: Dict[str, float] = {
        state: round(counts.get(state, 0) / shots, 6) for state in basis_states
    }

    # Gate count breakdown
    gate_dict: Dict[str, int] = {}
    for instruction in circuit.data:
        op_name = instruction.operation.name
        gate_dict[op_name] = gate_dict.get(op_name, 0) + 1

    return SimulationResult(
        shots=shots,
        counts=counts,
        probabilities=empirical_probabilities,
        theoretical_probabilities=theoretical_probabilities,
        statevector=statevector_details,
        num_qubits=num_qubits,
        depth=circuit.depth(),
        gate_count=gate_dict,
    )
