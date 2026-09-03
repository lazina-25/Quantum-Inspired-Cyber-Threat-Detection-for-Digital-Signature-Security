"""SQLAlchemy ORM models for Quantum Digital Signature (QDS) protocol."""

from datetime import datetime, timezone
import json
from typing import Dict, List, Any, Optional
from sqlalchemy import String, Integer, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
from app.models.base import TimestampMixin


class SignerModel(Base, TimestampMixin):
    """Registered Signer entity in the QDS network."""

    __tablename__ = "signers"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    public_identity: Mapped[str] = mapped_column(String(128), nullable=False)
    public_key_fp: Mapped[str] = mapped_column(String(64), nullable=False)

    # Relationships
    messages: Mapped[List["MessageModel"]] = relationship("MessageModel", back_populates="signer", cascade="all, delete-orphan")
    signatures: Mapped[List["SignatureModel"]] = relationship("SignatureModel", back_populates="signer", cascade="all, delete-orphan")


class MessageModel(Base, TimestampMixin):
    """Document or transaction message to be signed."""

    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    signer_id: Mapped[str] = mapped_column(String(64), ForeignKey("signers.id"), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    session_nonce: Mapped[str] = mapped_column(String(64), nullable=False)

    # Relationships
    signer: Mapped["SignerModel"] = relationship("SignerModel", back_populates="messages")
    signature: Mapped[Optional["SignatureModel"]] = relationship("SignatureModel", back_populates="message", uselist=False, cascade="all, delete-orphan")


class SignatureModel(Base, TimestampMixin):
    """Quantum Digital Signature package containing teleported quantum token records."""

    __tablename__ = "signatures"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    message_id: Mapped[str] = mapped_column(String(64), ForeignKey("messages.id"), nullable=False, index=True)
    signer_id: Mapped[str] = mapped_column(String(64), ForeignKey("signers.id"), nullable=False, index=True)
    session_nonce: Mapped[str] = mapped_column(String(64), nullable=False)
    shots: Mapped[int] = mapped_column(Integer, default=1024, nullable=False)
    
    # Serialized quantum state tokens & Alice BSM classical measurement bits
    quantum_tokens_json: Mapped[str] = mapped_column(Text, nullable=False)
    teleportation_metadata_json: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    signer: Mapped["SignerModel"] = relationship("SignerModel", back_populates="signatures")
    message: Mapped["MessageModel"] = relationship("MessageModel", back_populates="signature")
    verifications: Mapped[List["VerificationModel"]] = relationship("VerificationModel", back_populates="signature", cascade="all, delete-orphan")

    def get_quantum_tokens(self) -> List[Dict[str, Any]]:
        """Deserialize quantum token list."""
        return json.loads(self.quantum_tokens_json)

    def get_teleportation_metadata(self) -> Dict[str, Any]:
        """Deserialize teleportation metadata."""
        return json.loads(self.teleportation_metadata_json)


class VerificationModel(Base, TimestampMixin):
    """Audit log of a signature verification attempt by a verifier."""

    __tablename__ = "verifications"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    signature_id: Mapped[str] = mapped_column(String(64), ForeignKey("signatures.id"), nullable=False, index=True)
    verifier_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    tested_message_content: Mapped[str] = mapped_column(Text, nullable=False)
    tested_message_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    is_message_tampered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Verdict metrics
    verification_status: Mapped[str] = mapped_column(String(32), nullable=False)  # "ACCEPTED" or "REJECTED"
    verification_score: Mapped[float] = mapped_column(Float, nullable=False)      # 0.0 to 1.0
    qber: Mapped[float] = mapped_column(Float, nullable=False)                    # Quantum Bit Error Rate
    fidelity_score: Mapped[float] = mapped_column(Float, nullable=False)
    
    # JSON telemetry
    measurement_counts_json: Mapped[str] = mapped_column(Text, nullable=False)
    expected_distribution_json: Mapped[str] = mapped_column(Text, nullable=False)
    observed_distribution_json: Mapped[str] = mapped_column(Text, nullable=False)
    details: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    signature: Mapped["SignatureModel"] = relationship("SignatureModel", back_populates="verifications")
