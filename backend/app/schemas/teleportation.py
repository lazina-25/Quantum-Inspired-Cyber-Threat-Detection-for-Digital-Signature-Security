"""Pydantic schemas for quantum teleportation simulation API."""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from app.quantum.teleportation import InputStateType, VerificationBasis


class TeleportationRequest(BaseModel):
    """Request payload for quantum teleportation simulation."""

    input_state: InputStateType = Field(
        default=InputStateType.PLUS,
        description="Input quantum state to teleport: 'zero', 'one', 'plus', 'minus', 'custom'",
        json_schema_extra={"example": "plus"},
    )
    theta: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=3.141592653589793,
        description="Bloch sphere polar angle theta in radians (0 to pi). Used for custom state.",
        json_schema_extra={"example": 1.0472},
    )
    phi: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=6.283185307179586,
        description="Bloch sphere azimuthal angle phi in radians (0 to 2pi). Used for custom state.",
        json_schema_extra={"example": 0.7854},
    )
    shots: int = Field(
        default=1024,
        ge=1,
        le=100000,
        description="Number of measurement repetitions (1 to 100,000)",
        json_schema_extra={"example": 1024},
    )
    verification_basis: VerificationBasis = Field(
        default=VerificationBasis.AUTO,
        description="Measurement basis for Bob's verification: 'auto', 'z_basis', 'x_basis'",
        json_schema_extra={"example": "auto"},
    )


class AmplitudeItem(BaseModel):
    """Single amplitude description."""

    basis: str
    real: float
    imag: float
    probability: float
    formatted: str


class TeleportationResponse(BaseModel):
    """Response payload containing teleportation telemetry and fidelity analysis."""

    input_state: str = Field(..., description="Input state identifier")
    symbol: str = Field(..., description="Dirac notation symbol")
    formula: str = Field(..., description="State superposition equation")
    theta: float = Field(..., description="Bloch polar coordinate (theta)")
    phi: float = Field(..., description="Bloch azimuthal coordinate (phi)")
    input_amplitudes: List[AmplitudeItem] = Field(..., description="Original state amplitudes")
    reconstructed_amplitudes: List[AmplitudeItem] = Field(..., description="Bob's reconstructed amplitudes")
    fidelity: float = Field(..., description="Quantum state fidelity (F in [0, 1])")
    is_successful: bool = Field(..., description="True if fidelity >= 0.999")
    circuit_text: str = Field(..., description="ASCII teleportation circuit diagram")
    circuit_qasm: str = Field(..., description="OpenQASM 3 representation")
    shots: int = Field(..., description="Simulated shot count")
    verification_basis: str = Field(..., description="Verification basis used")
    bell_measurement_counts: Dict[str, int] = Field(
        ..., description="Alice's BSM classical bit outcomes (c0, c1)"
    )
    pauli_corrections_applied: Dict[str, int] = Field(
        ..., description="Distribution of Pauli corrections applied (I, X, Z, XZ)"
    )
    receiver_counts: Dict[str, int] = Field(
        ..., description="Bob's projective measurement counts ('0', '1')"
    )
    receiver_probabilities: Dict[str, float] = Field(
        ..., description="Empirical probabilities observed by Bob"
    )
    expected_probabilities: Dict[str, float] = Field(
        ..., description="Theoretical probabilities for the input state"
    )
