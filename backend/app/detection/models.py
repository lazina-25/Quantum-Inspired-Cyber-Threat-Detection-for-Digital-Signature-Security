"""Data models and enums for the deterministic Threat Detection Engine."""

from enum import Enum
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ThreatStatus(str, Enum):
    """Overall status of threat evaluation."""

    LEGITIMATE = "LEGITIMATE"
    ATTACK = "ATTACK"
    SUSPICIOUS = "SUSPICIOUS"


class ThreatClassification(str, Enum):
    """Categorization of detected threat vector (Zero AI/ML)."""

    LEGITIMATE = "LEGITIMATE"
    FORGERY = "FORGERY"
    IMPERSONATION = "IMPERSONATION"
    REPLAY = "REPLAY"
    CHANNEL_MANIPULATION = "CHANNEL_MANIPULATION"
    UNAUTHORIZED_VERIFICATION = "UNAUTHORIZED_VERIFICATION"
    SUSPICIOUS_ANOMALY = "SUSPICIOUS_ANOMALY"


class QuantumMeasurementAnalysis(BaseModel):
    """Output of raw measurement count normalization and error estimation."""

    total_shots: int
    observed_probabilities: Dict[str, float]
    standard_errors: Dict[str, float]
    dominant_basis: str


class DistributionComparisonResult(BaseModel):
    """Mathematical metrics comparing expected vs observed quantum distributions."""

    total_variation_distance: float = Field(..., description="Total Variation Distance D_TV(P, Q)")
    bhattacharyya_fidelity: float = Field(..., description="State overlap fidelity F(P, Q)")
    chi_square_statistic: float = Field(..., description="Chi-Square goodness of fit statistic")
    max_absolute_error: float = Field(..., description="Maximum single-basis probability delta")


class ForgeryProbabilityAssessment(BaseModel):
    """Mathematical estimation of forgery probability based on quantum state orthogonality."""

    token_count: int
    theoretical_forgery_bound: float = Field(..., description="Upper bound on forgery without key: (3/4)^L")
    forgery_confidence: float = Field(..., description="Empirical confidence of signature forgery (1.0 - p_consistency)")
    p_value: float = Field(..., description="Binomial p-value under null hypothesis H0: Legitimate")


class ThreatDetectionVerdict(BaseModel):
    """Complete explainable threat detection result."""

    analysis_id: str
    signature_id: str
    verifier_id: str
    status: ThreatStatus
    attack_type: ThreatClassification
    threat_score: float = Field(..., ge=0.0, le=1.0, description="Composite threat severity score in [0.0, 1.0]")
    deviation: float = Field(..., description="Measured quantum statistical deviation (e.g. Total Variation Distance)")
    threshold: float = Field(..., description="Configured deterministic alert threshold")
    qber: float = Field(..., description="Observed Quantum Bit Error Rate")
    fidelity: float = Field(..., description="Observed state fidelity")
    forgery_probability: float = Field(..., description="Estimated probability that signature is forged")
    evidence: List[str] = Field(..., description="Human-explainable deterministic reasoning items")
    telemetry: Dict[str, Any] = Field(..., description="Underlying quantum and session metrics")
    timestamp: datetime
