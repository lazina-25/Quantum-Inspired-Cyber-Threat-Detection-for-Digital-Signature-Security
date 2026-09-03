"""Attack Vector 5: Unauthorized Verification Attempt Simulation.

Simulates rogue or unregistered verifiers attempting to verify signatures or probe measurement bases.
"""

import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.attacks.base import AttackType, AttackScenarioResult
from app.models.signature import SignatureModel
from app.models.attack import AttackRecordModel


def simulate_unauthorized_verification_attack(
    db: Session,
    target_signature_id: str,
    unauthorized_verifier_id: str = "rogue_spy_verifier_99",
    tampered_basis_token: Optional[str] = "corrupted_basis_key_0xDEADBEEF",
    attacker_id: str = "unauthorized_probe_node",
) -> AttackScenarioResult:
    """Execute unauthorized verification attempt simulation."""
    sig = db.get(SignatureModel, target_signature_id)
    if not sig:
        raise ValueError(f"Signature '{target_signature_id}' not found.")

    attack_id = f"att_unauth_{uuid.uuid4().hex[:10]}"

    original_data = {
        "signature_id": sig.id,
        "authorized_verifier_whitelist": ["bob_verifier_01", "carol_verifier_02"],
        "target_signer_id": sig.signer_id,
        "message_id": sig.message_id,
    }

    manipulated_data = {
        "unauthorized_verifier_id": unauthorized_verifier_id,
        "is_registered_verifier": False,
        "tampered_basis_token": tampered_basis_token,
        "access_permission_status": "DENIED",
    }

    resulting_measurements = {
        "authorization_check": "FAILED_UNAUTHORIZED_ENTITY",
        "basis_access_allowed": False,
        "unauthorized_probe_count": 1,
        "security_violation_level": "CRITICAL",
    }

    record = AttackRecordModel(
        id=attack_id,
        attack_type=AttackType.UNAUTHORIZED_VERIFICATION.value,
        target_signature_id=sig.id,
        target_signer_id=sig.signer_id,
        attacker_id=attacker_id,
        parameters_json=json.dumps({"unauthorized_verifier_id": unauthorized_verifier_id, "tampered_basis_token": tampered_basis_token}),
        original_data_json=json.dumps(original_data),
        manipulated_data_json=json.dumps(manipulated_data),
        resulting_measurements_json=json.dumps(resulting_measurements),
        statistical_deviation=1.0,
        expected_outcome="REJECTED_UNAUTHORIZED_ACCESS",
    )
    db.add(record)
    db.commit()

    return AttackScenarioResult(
        attack_id=attack_id,
        attack_type=AttackType.UNAUTHORIZED_VERIFICATION,
        target_signature_id=sig.id,
        target_signer_id=sig.signer_id,
        attacker_id=attacker_id,
        parameters={"unauthorized_verifier_id": unauthorized_verifier_id, "tampered_basis_token": tampered_basis_token},
        original_data=original_data,
        manipulated_data=manipulated_data,
        resulting_measurements=resulting_measurements,
        statistical_deviation=1.0,
        expected_outcome="REJECTED_UNAUTHORIZED_ACCESS",
        timestamp=record.created_at,
    )
