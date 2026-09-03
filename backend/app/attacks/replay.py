"""Attack Vector 3: Replay Attack Simulation.

Simulates re-transmission of a legacy valid signature or stale session nonce.
"""

import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.attacks.base import AttackType, AttackScenarioResult
from app.models.signature import SignatureModel, MessageModel
from app.models.attack import AttackRecordModel


def simulate_replay_attack(
    db: Session,
    target_signature_id: str,
    timestamp_delta_seconds: int = 7200,  # 2 hours stale
    replayed_nonce: Optional[str] = None,
    attacker_id: str = "eve_replay_node",
) -> AttackScenarioResult:
    """Execute replay attack simulation reusing legacy session credentials."""
    sig = db.get(SignatureModel, target_signature_id)
    if not sig:
        raise ValueError(f"Signature '{target_signature_id}' not found.")

    msg = db.get(MessageModel, sig.message_id)

    original_nonce = sig.session_nonce
    replayed_nonce_val = replayed_nonce or original_nonce
    original_created_at = sig.created_at

    # Stale timestamp simulation
    now = datetime.now(timezone.utc)
    stale_timestamp = now - timedelta(seconds=timestamp_delta_seconds)

    attack_id = f"att_rep_{uuid.uuid4().hex[:10]}"

    original_data = {
        "signature_id": sig.id,
        "original_session_nonce": original_nonce,
        "original_created_at": original_created_at.isoformat() if original_created_at else "",
        "message_id": sig.message_id,
    }

    manipulated_data = {
        "replayed_session_nonce": replayed_nonce_val,
        "nonce_is_duplicate": True,
        "simulated_arrival_timestamp": now.isoformat(),
        "claimed_stale_timestamp": stale_timestamp.isoformat(),
        "timestamp_drift_seconds": timestamp_delta_seconds,
    }

    resulting_measurements = {
        "nonce_collision_detected": True,
        "timestamp_window_expired": timestamp_delta_seconds > 300,
        "quantum_state_freshness": "EXPIRED",
        "replay_score": 1.0,
    }

    record = AttackRecordModel(
        id=attack_id,
        attack_type=AttackType.REPLAY.value,
        target_signature_id=sig.id,
        target_signer_id=sig.signer_id,
        attacker_id=attacker_id,
        parameters_json=json.dumps({"timestamp_delta_seconds": timestamp_delta_seconds, "replayed_nonce": replayed_nonce_val}),
        original_data_json=json.dumps(original_data),
        manipulated_data_json=json.dumps(manipulated_data),
        resulting_measurements_json=json.dumps(resulting_measurements),
        statistical_deviation=float(timestamp_delta_seconds),
        expected_outcome="REJECTED_REPLAY_DETECTED",
    )
    db.add(record)
    db.commit()

    return AttackScenarioResult(
        attack_id=attack_id,
        attack_type=AttackType.REPLAY,
        target_signature_id=sig.id,
        target_signer_id=sig.signer_id,
        attacker_id=attacker_id,
        parameters={"timestamp_delta_seconds": timestamp_delta_seconds, "replayed_nonce": replayed_nonce_val},
        original_data=original_data,
        manipulated_data=manipulated_data,
        resulting_measurements=resulting_measurements,
        statistical_deviation=float(timestamp_delta_seconds),
        expected_outcome="REJECTED_REPLAY_DETECTED",
        timestamp=record.created_at,
    )
