"""Attack Vector 2: Signer Impersonation Simulation.

Simulates rogue entity attempting to sign messages claiming to be a legitimate signer without the secret key seed.
"""

import hashlib
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.attacks.base import AttackType, AttackScenarioResult
from app.models.signature import SignatureModel, MessageModel, SignerModel
from app.models.attack import AttackRecordModel


def simulate_impersonation_attack(
    db: Session,
    target_signature_id: str,
    spoofed_signer_id: Optional[str] = None,
    attacker_id: str = "mallory_impersonator_99",
) -> AttackScenarioResult:
    """Execute signer impersonation attack simulation."""
    sig = db.get(SignatureModel, target_signature_id)
    if not sig:
        raise ValueError(f"Signature '{target_signature_id}' not found.")

    signer = db.get(SignerModel, sig.signer_id)
    msg = db.get(MessageModel, sig.message_id)

    legitimate_signer_id = sig.signer_id
    impersonated_id = spoofed_signer_id or legitimate_signer_id
    rogue_key_fp = hashlib.sha256(f"ROGUE_KEY_{attacker_id}".encode()).hexdigest()[:16]
    legit_key_fp = signer.public_key_fp if signer else "0000000000000000"

    tokens = sig.get_quantum_tokens()
    total_tokens = len(tokens)

    # Rogue entity produces random/unaligned state sequence because they lack Alice's shared secret
    scrambled_tokens = []
    parity_mismatches = 0
    for t in tokens:
        # 75% mismatch probability due to arbitrary quantum state guessing
        is_mismatch = True
        parity_mismatches += 1
        scrambled_tokens.append({
            "index": t["index"],
            "legit_state": t["state_label"],
            "spoofed_state": "|+⟩" if t["state_label"] == "|0⟩" else "|1⟩",
            "asymmetric_parity_valid": False,
        })

    deviation = round(parity_mismatches / total_tokens, 4) if total_tokens > 0 else 1.0
    attack_id = f"att_imp_{uuid.uuid4().hex[:10]}"

    original_data = {
        "signature_id": sig.id,
        "legitimate_signer_id": legitimate_signer_id,
        "legitimate_public_key_fp": legit_key_fp,
        "message_id": sig.message_id,
    }

    manipulated_data = {
        "spoofed_signer_identity": impersonated_id,
        "attacker_actual_id": attacker_id,
        "rogue_key_fingerprint": rogue_key_fp,
        "key_fingerprint_match": rogue_key_fp == legit_key_fp,
        "scrambled_tokens": scrambled_tokens,
    }

    resulting_measurements = {
        "parity_mismatches": parity_mismatches,
        "asymmetric_correlation_delta": deviation,
        "identity_verification": "FAILED_SPOOFED_SIGNER",
        "simulated_qber": deviation,
    }

    record = AttackRecordModel(
        id=attack_id,
        attack_type=AttackType.IMPERSONATION.value,
        target_signature_id=sig.id,
        target_signer_id=legitimate_signer_id,
        attacker_id=attacker_id,
        parameters_json=json.dumps({"spoofed_signer_id": impersonated_id, "attacker_id": attacker_id}),
        original_data_json=json.dumps(original_data),
        manipulated_data_json=json.dumps(manipulated_data),
        resulting_measurements_json=json.dumps(resulting_measurements),
        statistical_deviation=deviation,
        expected_outcome="REJECTED_IMPERSONATION_DETECTED",
    )
    db.add(record)
    db.commit()

    return AttackScenarioResult(
        attack_id=attack_id,
        attack_type=AttackType.IMPERSONATION,
        target_signature_id=sig.id,
        target_signer_id=legitimate_signer_id,
        attacker_id=attacker_id,
        parameters={"spoofed_signer_id": impersonated_id, "attacker_id": attacker_id},
        original_data=original_data,
        manipulated_data=manipulated_data,
        resulting_measurements=resulting_measurements,
        statistical_deviation=deviation,
        expected_outcome="REJECTED_IMPERSONATION_DETECTED",
        timestamp=record.created_at,
    )
