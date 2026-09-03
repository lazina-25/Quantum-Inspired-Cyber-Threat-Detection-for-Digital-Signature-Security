"""API endpoints for quantum circuit simulation, Bell state generation, and quantum teleportation."""

from typing import List
from fastapi import APIRouter, status
from app.quantum.service import (
    generate_and_simulate_bell_state,
    list_available_bell_states,
    execute_teleportation_simulation,
)
from app.schemas.quantum import (
    BellStateRequest,
    BellStateResponse,
    BellStateMetaItem,
)
from app.schemas.teleportation import (
    TeleportationRequest,
    TeleportationResponse,
)

router = APIRouter()


@router.post(
    "/bell-state",
    response_model=BellStateResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate & Simulate Bell State",
    description="Constructs the Qiskit quantum circuit for the chosen Bell state, executes shot simulation, and computes statevector decomposition.",
)
def create_and_simulate_bell_state(request: BellStateRequest) -> BellStateResponse:
    """Execute quantum simulation for the requested Bell state and shot count."""
    result = generate_and_simulate_bell_state(
        bell_state=request.bell_state,
        shots=request.shots,
    )
    return BellStateResponse(**result)


@router.get(
    "/bell-states",
    response_model=List[BellStateMetaItem],
    status_code=status.HTTP_200_OK,
    summary="List Supported Bell States",
    description="Retrieves metadata, Dirac formulas, and preparation gate sequences for all 4 canonical Bell states.",
)
def get_bell_states_metadata() -> List[BellStateMetaItem]:
    """Return catalog of supported Bell states."""
    states = list_available_bell_states()
    return [BellStateMetaItem(**item) for item in states]


@router.post(
    "/teleport",
    response_model=TeleportationResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate Quantum Teleportation & Pauli Corrections",
    description="Simulates Alice teleporting an arbitrary single-qubit state to Bob using an entangled EPR pair, Bell-basis measurement (BSM), and Bob's conditional Pauli unitary corrections (I, X, Z, XZ).",
)
def run_teleportation(request: TeleportationRequest) -> TeleportationResponse:
    """Execute quantum teleportation protocol simulation."""
    result = execute_teleportation_simulation(
        input_state=request.input_state,
        theta=request.theta,
        phi=request.phi,
        shots=request.shots,
        verification_basis=request.verification_basis,
    )
    return TeleportationResponse(**result.model_dump())
