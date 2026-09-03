"""Quantum simulation package.

Provides modular quantum circuit building, Bell state entanglement,
quantum teleportation, and Pauli corrections using Qiskit.
"""

from app.quantum.circuits import (
    BellStateType,
    BELL_STATE_METADATA,
    create_bell_circuit,
    get_circuit_representations,
)
from app.quantum.simulator import (
    simulate_bell_circuit,
    SimulationResult,
    AmplitudeDetail,
)
from app.quantum.teleportation import (
    InputStateType,
    VerificationBasis,
    TeleportationResult,
    build_teleportation_circuit,
    simulate_teleportation,
)
from app.quantum.service import (
    generate_and_simulate_bell_state,
    list_available_bell_states,
    execute_teleportation_simulation,
)

__all__ = [
    "BellStateType",
    "BELL_STATE_METADATA",
    "create_bell_circuit",
    "get_circuit_representations",
    "simulate_bell_circuit",
    "SimulationResult",
    "AmplitudeDetail",
    "InputStateType",
    "VerificationBasis",
    "TeleportationResult",
    "build_teleportation_circuit",
    "simulate_teleportation",
    "generate_and_simulate_bell_state",
    "list_available_bell_states",
    "execute_teleportation_simulation",
]
