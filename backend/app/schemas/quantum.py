"""Pydantic schemas for quantum circuits and Bell state simulation."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.quantum.circuits import BellStateType


class BellStateRequest(BaseModel):
    """Request payload for generating and simulating a Bell state."""

    bell_state: BellStateType = Field(
        default=BellStateType.PHI_PLUS,
        description="Canonical Bell state to prepare: 'phi_plus', 'phi_minus', 'psi_plus', 'psi_minus'",
        json_schema_extra={"example": "phi_plus"},
    )
    shots: int = Field(
        default=1024,
        ge=1,
        le=100000,
        description="Number of measurement shots (1 to 100,000)",
        json_schema_extra={"example": 1024},
    )


class AmplitudeSchema(BaseModel):
    """Details for a single computational basis amplitude."""

    basis_state: str = Field(..., description="Computational basis string e.g. '00', '11'")
    real: float = Field(..., description="Real part of amplitude")
    imag: float = Field(..., description="Imaginary part of amplitude")
    probability: float = Field(..., description="Theoretical probability |amplitude|^2")
    phase_rad: float = Field(..., description="Phase angle in radians")
    formatted: str = Field(..., description="Formatted complex number string")


class BellStateResponse(BaseModel):
    """Response payload for Bell state generation and simulation."""

    bell_state: str = Field(..., description="Bell state identifier")
    name: str = Field(..., description="Display name e.g. 'Phi+'")
    symbol: str = Field(..., description="Dirac notation symbol e.g. '|Φ+⟩'")
    formula: str = Field(..., description="Mathematical superposition formula")
    description: str = Field(..., description="Physical description of entanglement")
    preparation: str = Field(..., description="Gate sequence description")
    circuit_text: str = Field(..., description="ASCII text circuit diagram")
    circuit_qasm: str = Field(..., description="OpenQASM 3 circuit definition")
    num_qubits: int = Field(..., description="Number of qubits in circuit")
    depth: int = Field(..., description="Circuit depth")
    shots: int = Field(..., description="Executed measurement shot count")
    counts: Dict[str, int] = Field(..., description="Empirical measurement outcomes")
    probabilities: Dict[str, float] = Field(..., description="Empirical probability distribution")
    theoretical_probabilities: Dict[str, float] = Field(
        ..., description="Exact theoretical probability distribution"
    )
    statevector: List[AmplitudeSchema] = Field(..., description="Statevector basis decomposition")
    gate_count: Dict[str, int] = Field(default_factory=dict, description="Gate breakdown counts")


class BellStateMetaItem(BaseModel):
    """Metadata item describing a supported Bell state."""

    id: str
    name: str
    symbol: str
    formula: str
    description: str
    preparation: str
