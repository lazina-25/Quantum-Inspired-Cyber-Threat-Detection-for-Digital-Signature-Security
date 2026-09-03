"""Pydantic schemas for Quantum Digital Signature (QDS) creation and verification."""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class CreateSignatureRequest(BaseModel):
    """Payload to generate and teleport a quantum digital signature."""

    signer_id: str = Field(default="alice_signer_01", description="Signer identifier")
    public_identity: Optional[str] = Field(default="Alice - Signer Entity", description="Public display identity")
    message_content: str = Field(..., min_length=1, description="Message text payload to be digitally signed")
    session_nonce: Optional[str] = Field(default=None, description="Cryptographic session nonce / counter")
    shots: int = Field(default=1024, ge=128, le=100000, description="Measurement shots per quantum token")
    token_count: int = Field(default=4, ge=2, le=16, description="Number of teleported quantum signature tokens")


class QuantumTokenItem(BaseModel):
    """Single teleported quantum signature token."""

    index: int = Field(..., description="Token sequence index")
    state_label: str = Field(..., description="Quantum state Dirac notation (e.g. '|0⟩', '|+⟩')")
    basis: str = Field(..., description="Measurement basis ('Z' or 'X')")
    expected_bit: int = Field(..., description="Expected bit outcome in matched basis")
    bsm_outcome: str = Field(..., description="Alice's classical BSM bits ('00', '01', '10', '11')")
    pauli_correction: str = Field(..., description="Required Pauli operator ('I', 'X', 'Z', 'XZ')")
    fidelity: float = Field(..., description="Teleportation fidelity")


class CreateSignatureResponse(BaseModel):
    """Response returned upon successful quantum signature creation and teleportation."""

    signature_id: str = Field(..., description="Unique signature record ID")
    message_id: str = Field(..., description="Associated message entity ID")
    signer_id: str = Field(..., description="Signer ID")
    public_identity: str = Field(..., description="Signer public identity")
    message_content: str = Field(..., description="Original message content")
    message_hash: str = Field(..., description="SHA-256 digest of original message")
    session_nonce: str = Field(..., description="Session nonce")
    quantum_tokens: List[QuantumTokenItem] = Field(..., description="Sequence of teleported quantum states")
    teleportation_fidelity_avg: float = Field(..., description="Average fidelity across signature tokens")
    created_at: datetime = Field(..., description="Timestamp of signature creation")


class VerifySignatureRequest(BaseModel):
    """Payload submitted by Verifier (Bob) to verify signature authenticity."""

    signature_id: str = Field(..., description="Target signature record ID to verify")
    message_content: str = Field(..., min_length=1, description="Claimed message content (tested against signature)")
    verifier_id: str = Field(default="bob_verifier_01", description="Verifier identity")


class TokenVerificationDetail(BaseModel):
    """Individual quantum token verification check."""

    index: int
    expected_state: str
    expected_basis: str
    pauli_correction_applied: str
    measured_bit: int
    is_match: bool


class VerifySignatureResponse(BaseModel):
    """Result of deterministic quantum digital signature verification."""

    signature_id: str
    message_id: str
    signer_id: str
    verifier_id: str
    original_message_hash: str
    tested_message_hash: str
    is_message_tampered: bool
    verification_status: str = Field(..., description="'ACCEPTED' or 'REJECTED'")
    verification_score: float = Field(..., description="Score in [0, 1] based on (1.0 - QBER)")
    qber: float = Field(..., description="Quantum Bit Error Rate across signature tokens")
    fidelity_score: float = Field(..., description="Average state fidelity")
    measurement_counts: Dict[str, int] = Field(..., description="Aggregated match vs mismatch counts")
    expected_distribution: Dict[str, float] = Field(..., description="Theoretical state match expectations")
    observed_distribution: Dict[str, float] = Field(..., description="Empirical measurement outcomes")
    token_verifications: List[TokenVerificationDetail] = Field(..., description="Token-by-token verification details")
    decision_reason: str = Field(..., description="Explanation of acceptance or rejection")
    timestamp: datetime = Field(..., description="Verification timestamp")


class SignatureListItem(BaseModel):
    """Summary of a stored signature."""

    signature_id: str
    message_id: str
    signer_id: str
    message_preview: str
    message_hash: str
    session_nonce: str
    token_count: int
    created_at: datetime
    last_verification_status: Optional[str] = None
    last_verified_at: Optional[datetime] = None
