"""Attack Vector 1: Digital Signature Forgery Simulation.

Simulates adversary modifying message content or tampering with quantum signature expectations.
"""

import hashlib
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.attacks.base import AttackType, AttackScenarioResult
from app.models.signature import SignatureModel, MessageModel, SignerModel
from app.models.attack import AttackRecordModel
import json


def simulate_forgery_attack(
    db: Session,
    target_signature_id: str,
    forged_message: Optional[str] = None,
    tamper_token_ratio: float = 1.0,
    attacker_id: str = "eve_forger_01",
) -> AttackScenarioResult:
    """Execute digital signature forgery attack simulation."""
    sig = db.get(SignatureModel, target_signature_id)
    if not sig:
        raise ValueError(f"Signature '{target_signature_id}' not found.")

    msg = db.get(MessageModel, sig.message_id)
    signer = db.get(SignerModel, sig.signer_id)

    original_content = msg.content if msg else "Original message"
    forged_content = forged_message or f"FORGED_PAYLOAD: Altered transaction payload at {datetime.now(timezone.utc).isoformat()}"

    original_hash = msg.content_hash if msg else hashlib.sha256(original_content.encode()).hexdigest()
    forged_hash = hashlib.sha256(forged_content.encode("utf-8")).hexdigest()

    tokens = sig.get_quantum_tokens()
    total_tokens = len(tokens)
    tokens_to_tamper = max(1, int(math_ceil := int(total_tokens * max(0.1, min(1.0, tamper_token_ratio)))))

    manipulated_tokens = []
    mismatch_count = 0

    for i, token in enumerate(tokens):
        if i < tokens_to_tamper:
            # Substitute with forged orthogonal basis or inverted bit expectation
            opp_basis = "X" if token["basis"] == "Z" else "Z"
            manipulated_tokens.append({
                "index": token["index"],
                "original_state": token["state_label"],
                "forged_state": "|1⟩" if token["state_label"] == "|0⟩" else "|0⟩" if token["state_label"] == "|1⟩" else "|-⟩",
                "original_basis": token["basis"],
                "forged_basis": opp_basis,
                "expected_bit": 1 - token["expected_bit"],
            })
            mismatch_count += 1
        else:
            manipulated_tokens.append({
                "index": token["index"],
                "original_state": token["state_label"],
                "forged_state": token["state_label"],
                "original_basis": token["basis"],
                "forged_basis": token["basis"],
                "expected_bit": token["expected_bit"],
            })

    simulated_qber = round(mismatch_count / total_tokens, 4) if total_tokens > 0 else 1.0
    attack_id = f"att_forg_{uuid.uuid4().hex[:10]}"

    original_data = {
        "signature_id": sig.id,
        "signer_id": sig.signer_id,
        "message_content": original_content,
        "message_hash": original_hash,
        "token_count": total_tokens,
    }

    manipulated_data = {
        "forged_message_content": forged_content,
        "forged_message_hash": forged_hash,
        "tampered_tokens_count": tokens_to_tamper,
        "manipulated_tokens": manipulated_tokens,
    }

    resulting_measurements = {
        "basis_mismatches": mismatch_count,
        "simulated_qber": simulated_qber,
        "expected_fidelity_collapse": round(max(0.0, 1.0 - simulated_qber), 4),
        "parity_check": "FAILED",
    }

    # Persist in SQLite
    record = AttackRecordModel(
        id=attack_id,
        attack_type=AttackType.FORGERY.value,
        target_signature_id=sig.id,
        target_signer_id=sig.signer_id,
        attacker_id=attacker_id,
        parameters_json=json.dumps({"forged_message": forged_content, "tamper_token_ratio": tamper_token_ratio}),
        original_data_json=json.dumps(original_data),
        manipulated_data_json=json.dumps(manipulated_data),
        resulting_measurements_json=json.dumps(resulting_measurements),
        statistical_deviation=simulated_qber,
        expected_outcome="REJECTED_FORGERY_DETECTED",
    )
    db.add(record)
    db.commit()

    return AttackScenarioResult(
        attack_id=attack_id,
        attack_type=AttackType.FORGERY,
        target_signature_id=sig.id,
        target_signer_id=sig.signer_id,
        attacker_id=attacker_id,
        parameters={"forged_message": forged_content, "tamper_token_ratio": tamper_token_ratio},
        original_data=original_data,
        manipulated_data=manipulated_data,
        resulting_measurements=resulting_measurements,
        statistical_deviation=simulated_qber,
        expected_outcome="REJECTED_FORGERY_DETECTED",
        timestamp=record.created_at,
    )
