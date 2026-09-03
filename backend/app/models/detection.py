"""SQLAlchemy ORM models for Threat Detection analysis records."""

import json
from typing import Dict, Any, List
from sqlalchemy import String, Float, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base
from app.models.base import TimestampMixin


class ThreatAnalysisModel(Base, TimestampMixin):
    """Stores deterministic quantum threat analysis reports."""

    __tablename__ = "threat_analyses"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    signature_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    verifier_id: Mapped[str] = mapped_column(String(64), default="bob_verifier_01", nullable=False)
    
    # Classification Verdict
    status: Mapped[str] = mapped_column(String(32), nullable=False)        # "LEGITIMATE", "ATTACK", "SUSPICIOUS"
    attack_type: Mapped[str] = mapped_column(String(64), nullable=False)   # "LEGITIMATE", "FORGERY", "IMPERSONATION", "REPLAY", "CHANNEL_MANIPULATION", "UNAUTHORIZED_VERIFICATION"
    
    # Quantitative Indicators
    threat_score: Mapped[float] = mapped_column(Float, nullable=False)
    deviation: Mapped[float] = mapped_column(Float, nullable=False)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    qber: Mapped[float] = mapped_column(Float, nullable=False)
    fidelity: Mapped[float] = mapped_column(Float, nullable=False)
    forgery_probability: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Explainable Evidence Logs
    evidence_json: Mapped[str] = mapped_column(Text, nullable=False)
    telemetry_json: Mapped[str] = mapped_column(Text, nullable=False)

    def get_evidence(self) -> List[str]:
        """Deserialize evidence reasoning list."""
        return json.loads(self.evidence_json)

    def get_telemetry(self) -> Dict[str, Any]:
        """Deserialize telemetry dictionary."""
        return json.loads(self.telemetry_json)
