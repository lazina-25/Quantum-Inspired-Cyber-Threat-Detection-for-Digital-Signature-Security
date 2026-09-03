"""Base classes and data models for Cyber Attack Simulation."""

from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class AttackType(str, Enum):
    """Core threat vectors targeted in teleportation-based QDS protocols."""

    FORGERY = "forgery"
    IMPERSONATION = "impersonation"
    REPLAY = "replay"
    CHANNEL_MANIPULATION = "channel_manipulation"
    UNAUTHORIZED_VERIFICATION = "unauthorized_verification"


class AttackScenarioResult(BaseModel):
    """Encapsulates the output of a simulated attack execution."""

    attack_id: str = Field(..., description="Unique attack simulation ID")
    attack_type: AttackType = Field(..., description="Classification of threat vector")
    target_signature_id: str = Field(..., description="Targeted signature ID")
    target_signer_id: str = Field(..., description="Legitimate signer ID")
    attacker_id: str = Field(..., description="Simulated adversary ID")
    parameters: Dict[str, Any] = Field(..., description="Parameters supplied to the attack simulator")
    original_data: Dict[str, Any] = Field(..., description="Original unmanipulated signature/session state")
    manipulated_data: Dict[str, Any] = Field(..., description="Adversary-modified state and classical parameters")
    resulting_measurements: Dict[str, Any] = Field(..., description="Measurement telemetry and state consequences")
    statistical_deviation: float = Field(..., description="Measurable anomaly indicator (e.g. QBER or fidelity drop)")
    expected_outcome: str = Field(..., description="Expected threat detection decision")
    timestamp: datetime = Field(..., description="Simulation timestamp")
