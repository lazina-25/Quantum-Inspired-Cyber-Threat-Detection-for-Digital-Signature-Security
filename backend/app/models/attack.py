"""SQLAlchemy ORM models for Cyber Attack Simulation records."""

from datetime import datetime, timezone
import json
from typing import Dict, Any, Optional
from sqlalchemy import String, Float, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base
from app.models.base import TimestampMixin


class AttackRecordModel(Base, TimestampMixin):
    """Database model storing simulated cyber attack scenarios."""

    __tablename__ = "attack_records"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    attack_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    target_signature_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    target_signer_id: Mapped[str] = mapped_column(String(64), nullable=False)
    attacker_id: Mapped[str] = mapped_column(String(64), nullable=False)
    
    # Serialized attack telemetry
    parameters_json: Mapped[str] = mapped_column(Text, nullable=False)
    original_data_json: Mapped[str] = mapped_column(Text, nullable=False)
    manipulated_data_json: Mapped[str] = mapped_column(Text, nullable=False)
    resulting_measurements_json: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Statistical indicators
    statistical_deviation: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    expected_outcome: Mapped[str] = mapped_column(String(64), nullable=False)

    def get_parameters(self) -> Dict[str, Any]:
        """Deserialize parameters."""
        return json.loads(self.parameters_json)

    def get_original_data(self) -> Dict[str, Any]:
        """Deserialize original state data."""
        return json.loads(self.original_data_json)

    def get_manipulated_data(self) -> Dict[str, Any]:
        """Deserialize manipulated attack data."""
        return json.loads(self.manipulated_data_json)

    def get_resulting_measurements(self) -> Dict[str, Any]:
        """Deserialize resulting measurement outcomes."""
        return json.loads(self.resulting_measurements_json)
