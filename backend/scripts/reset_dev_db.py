"""Script to safely reset the development database records while preserving the schema.
Clears signatures, messages, verifications, attack_records, threat_analyses, signers.
"""

import sys
import os
from sqlalchemy import text

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.session import engine, SessionLocal
from app.database.base import Base
# Import all models so metadata is populated
from app.models import (
    SignerModel,
    MessageModel,
    SignatureModel,
    VerificationModel,
    AttackRecordModel,
    ThreatAnalysisModel,
)


def reset_development_database():
    print("Resetting development database records...")
    db = SessionLocal()
    try:
        # Delete records in reverse dependency order
        deleted_verifications = db.query(VerificationModel).delete()
        deleted_signatures = db.query(SignatureModel).delete()
        deleted_threats = db.query(ThreatAnalysisModel).delete()
        deleted_attacks = db.query(AttackRecordModel).delete()
        deleted_messages = db.query(MessageModel).delete()
        deleted_signers = db.query(SignerModel).delete()
        db.commit()

        print(f"Deleted records:")
        print(f"  - Verifications: {deleted_verifications}")
        print(f"  - Signatures: {deleted_signatures}")
        print(f"  - Threat Analyses: {deleted_threats}")
        print(f"  - Attack Records: {deleted_attacks}")
        print(f"  - Messages: {deleted_messages}")
        print(f"  - Signers: {deleted_signers}")
        print("Database successfully reset to clean state (all counts 0).")
    except Exception as e:
        db.rollback()
        print(f"Error resetting database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset_development_database()
