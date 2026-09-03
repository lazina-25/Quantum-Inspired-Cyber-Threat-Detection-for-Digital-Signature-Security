"""Pydantic schemas for cyber attack simulation requests and responses."""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from app.attacks.base import AttackType


class ForgeryAttackRequest(BaseModel):
    """Payload for signature forgery attack simulation."""

    target_signature_id: str = Field(..., description="Legitimate signature ID to forge")
    forged_message: Optional[str] = Field(None, description="Custom forged message text")
    tamper_token_ratio: float = Field(default=1.0, ge=0.1, le=1.0, description="Ratio of quantum tokens to corrupt")
    attacker_id: str = Field(default="eve_forger_01", description="Attacker node identifier")


class ImpersonationAttackRequest(BaseModel):
    """Payload for signer impersonation attack simulation."""

    target_signature_id: str = Field(..., description="Target signature ID to spoof")
    spoofed_signer_id: Optional[str] = Field(None, description="Signer ID being impersonated")
    attacker_id: str = Field(default="mallory_impersonator_99", description="Attacker node identifier")


class ReplayAttackRequest(BaseModel):
    """Payload for replay attack simulation."""

    target_signature_id: str = Field(..., description="Target signature ID to replay")
    timestamp_delta_seconds: int = Field(default=7200, ge=60, description="Timestamp staleness delta in seconds")
    replayed_nonce: Optional[str] = Field(None, description="Replayed nonce value")
    attacker_id: str = Field(default="eve_replay_node", description="Attacker node identifier")


class ChannelManipulationRequest(BaseModel):
    """Payload for quantum channel manipulation simulation."""

    target_signature_id: str = Field(..., description="Target signature ID")
    noise_type: str = Field(default="depolarizing", description="Noise model: 'depolarizing', 'intercept_resend', 'bit_flip', 'phase_flip'")
    noise_intensity: float = Field(default=0.40, ge=0.05, le=1.0, description="Noise corruption intensity (0.05 to 1.0)")
    attacker_id: str = Field(default="eve_quantum_tapper_04", description="Attacker node identifier")


class UnauthorizedVerificationRequest(BaseModel):
    """Payload for unauthorized verification simulation."""

    target_signature_id: str = Field(..., description="Target signature ID")
    unauthorized_verifier_id: str = Field(default="rogue_spy_verifier_99", description="Unauthorized verifier ID")
    tampered_basis_token: Optional[str] = Field(default="corrupted_basis_key_0xDEADBEEF", description="Tampered basis token")
    attacker_id: str = Field(default="unauthorized_probe_node", description="Attacker node identifier")


class AttackResponse(BaseModel):
    """Response payload containing attack execution details."""

    attack_id: str
    attack_type: AttackType
    target_signature_id: str
    target_signer_id: str
    attacker_id: str
    parameters: Dict[str, Any]
    original_data: Dict[str, Any]
    manipulated_data: Dict[str, Any]
    resulting_measurements: Dict[str, Any]
    statistical_deviation: float
    expected_outcome: str
    timestamp: datetime


class AttackHistoryItem(BaseModel):
    """Summary item for attack simulation history."""

    attack_id: str
    attack_type: str
    target_signature_id: str
    target_signer_id: str
    attacker_id: str
    statistical_deviation: float
    expected_outcome: str
    created_at: datetime
