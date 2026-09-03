"""Pydantic schemas for Threat Detection API requests and responses."""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from app.detection.models import ThreatStatus, ThreatClassification


class ThreatAnalysisRequest(BaseModel):
    """Payload to trigger deterministic quantum cyber threat analysis."""

    signature_id: str = Field(..., description="Target signature record ID to analyze")
    verifier_id: str = Field(default="bob_verifier_01", description="Claimed verifier identity")
    tested_message: Optional[str] = Field(default=None, description="Custom message content to evaluate against signature")
    attack_context_id: Optional[str] = Field(default=None, description="Optional associated Attack Record ID for forensic analysis")


class ThreatAnalysisResponse(BaseModel):
    """Complete mathematical threat analysis response."""

    analysis_id: str
    signature_id: str
    verifier_id: str
    status: ThreatStatus
    attack_type: ThreatClassification
    threat_score: float
    deviation: float
    threshold: float
    qber: float
    fidelity: float
    forgery_probability: float
    evidence: List[str]
    telemetry: Dict[str, Any]
    timestamp: datetime


class ThreatHistoryItem(BaseModel):
    """Summary record of a past threat detection analysis."""

    analysis_id: str
    signature_id: str
    verifier_id: str
    status: str
    attack_type: str
    threat_score: float
    deviation: float
    qber: float
    created_at: datetime
