"""High-level quantum services orchestrating Bell states and teleportation workflows."""

from typing import Dict, Any, List, Optional
from app.quantum.circuits import (
    BellStateType,
    BELL_STATE_METADATA,
    create_bell_circuit,
    get_circuit_representations,
)
from app.quantum.simulator import simulate_bell_circuit, SimulationResult
from app.quantum.teleportation import (
    InputStateType,
    VerificationBasis,
    simulate_teleportation,
    TeleportationResult,
)


def generate_and_simulate_bell_state(
    bell_state: BellStateType = BellStateType.PHI_PLUS,
    shots: int = 1024,
) -> Dict[str, Any]:
    """Generate a Bell state quantum circuit and execute quantum simulation."""
    measured_qc, _, _ = create_bell_circuit(bell_state=bell_state, measure=True)
    pure_qc, _, _ = create_bell_circuit(bell_state=bell_state, measure=False)

    sim_result: SimulationResult = simulate_bell_circuit(
        circuit=measured_qc,
        circuit_without_meas=pure_qc,
        shots=shots,
    )

    circuit_repr = get_circuit_representations(measured_qc)
    meta = BELL_STATE_METADATA.get(bell_state, {})

    return {
        "bell_state": bell_state.value,
        "name": meta.get("name", bell_state.value),
        "symbol": meta.get("symbol", "|Φ+⟩"),
        "formula": meta.get("formula", ""),
        "description": meta.get("description", ""),
        "preparation": meta.get("preparation", ""),
        "circuit_text": circuit_repr["text"],
        "circuit_qasm": circuit_repr["qasm"],
        "num_qubits": sim_result.num_qubits,
        "depth": sim_result.depth,
        "shots": sim_result.shots,
        "counts": sim_result.counts,
        "probabilities": sim_result.probabilities,
        "theoretical_probabilities": sim_result.theoretical_probabilities,
        "statevector": [amp.model_dump() for amp in sim_result.statevector],
        "gate_count": sim_result.gate_count,
    }


def list_available_bell_states() -> List[Dict[str, Any]]:
    """List metadata for all supported Bell states."""
    return [
        {
            "id": bell_type.value,
            **meta,
        }
        for bell_type, meta in BELL_STATE_METADATA.items()
    ]


def execute_teleportation_simulation(
    input_state: InputStateType = InputStateType.PLUS,
    theta: Optional[float] = None,
    phi: Optional[float] = None,
    shots: int = 1024,
    verification_basis: VerificationBasis = VerificationBasis.AUTO,
) -> TeleportationResult:
    """Orchestrate quantum teleportation simulation."""
    return simulate_teleportation(
        state_type=input_state,
        theta=theta,
        phi=phi,
        shots=shots,
        verification_basis=verification_basis,
    )
