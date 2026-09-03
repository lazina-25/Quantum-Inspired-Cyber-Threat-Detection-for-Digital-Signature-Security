"""Attack Vector 4: Quantum Channel Manipulation Simulation.

Simulates depolarizing noise, intercept-resend eavesdropping, and bit/phase flip perturbations
in the quantum communication channel.
"""

import json
import uuid
import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.attacks.base import AttackType, AttackScenarioResult
from app.models.signature import SignatureModel
from app.models.attack import AttackRecordModel


def simulate_channel_manipulation_attack(
    db: Session,
    target_signature_id: str,
    noise_type: str = "depolarizing",  # "depolarizing", "intercept_resend", "bit_flip", "phase_flip"
    noise_intensity: float = 0.40,      # 0.0 to 1.0
    attacker_id: str = "eve_quantum_tapper_04",
) -> AttackScenarioResult:
    """Execute quantum channel manipulation attack simulation."""
    sig = db.get(SignatureModel, target_signature_id)
    if not sig:
        raise ValueError(f"Signature '{target_signature_id}' not found.")

    intensity = max(0.05, min(1.0, noise_intensity))
    tokens = sig.get_quantum_tokens()
    total_tokens = len(tokens)

    manipulated_tokens = []
    error_count = 0

    rng = np.random.default_rng()

    for t in tokens:
        # Probability of state corruption under chosen channel noise model
        if noise_type == "intercept_resend":
            has_error = rng.random() < 0.50
        elif noise_type == "depolarizing":
            has_error = rng.random() < max(0.35, intensity * 0.75)
        elif noise_type == "bit_flip":
            has_error = rng.random() < max(0.35, intensity)
        elif noise_type == "phase_flip":
            has_error = (rng.random() < max(0.35, intensity)) if t["basis"] == "X" else (rng.random() < 0.35)
        else:
            has_error = rng.random() < max(0.35, intensity)

        if has_error:
            error_count += 1
            observed_fidelity = round(max(0.1, 1.0 - (intensity * 0.8)), 4)
            corrupted_bit = 1 - t["expected_bit"]
        else:
            observed_fidelity = 1.0
            corrupted_bit = t["expected_bit"]

        manipulated_tokens.append({
            "index": t["index"],
            "original_state": t["state_label"],
            "noise_model": noise_type,
            "channel_noise_injected": has_error,
            "corrupted_bit_outcome": corrupted_bit,
            "observed_fidelity": observed_fidelity,
        })

    # If noise was specified and by statistical variance error_count == 0, inject on first token
    if error_count == 0 and intensity >= 0.15 and len(manipulated_tokens) > 0:
        error_count = 1
        manipulated_tokens[0]["channel_noise_injected"] = True
        manipulated_tokens[0]["corrupted_bit_outcome"] = 1 - tokens[0]["expected_bit"]
        manipulated_tokens[0]["observed_fidelity"] = round(max(0.1, 1.0 - (intensity * 0.8)), 4)

    observed_qber = round(error_count / total_tokens, 4) if total_tokens > 0 else intensity
    avg_fidelity = round(float(np.mean([m["observed_fidelity"] for m in manipulated_tokens])), 4)

    attack_id = f"att_chan_{uuid.uuid4().hex[:10]}"

    original_data = {
        "signature_id": sig.id,
        "channel_type": "Ideal EPR Entangled Fiber Channel",
        "nominal_qber": 0.0,
        "nominal_fidelity": 1.0,
        "token_count": total_tokens,
    }

    manipulated_data = {
        "noise_model": noise_type,
        "noise_intensity": intensity,
        "attacker_intervention": "Active Intercept-Resend / Quantum Depolarizer",
        "manipulated_tokens": manipulated_tokens,
    }

    resulting_measurements = {
        "channel_error_count": error_count,
        "observed_qber": observed_qber,
        "channel_fidelity_drop": round(1.0 - avg_fidelity, 4),
        "post_attack_fidelity": avg_fidelity,
        "threshold_violated": observed_qber > 0.15,
    }

    record = AttackRecordModel(
        id=attack_id,
        attack_type=AttackType.CHANNEL_MANIPULATION.value,
        target_signature_id=sig.id,
        target_signer_id=sig.signer_id,
        attacker_id=attacker_id,
        parameters_json=json.dumps({"noise_type": noise_type, "noise_intensity": intensity}),
        original_data_json=json.dumps(original_data),
        manipulated_data_json=json.dumps(manipulated_data),
        resulting_measurements_json=json.dumps(resulting_measurements),
        statistical_deviation=observed_qber,
        expected_outcome="REJECTED_CHANNEL_TAMPERED",
    )
    db.add(record)
    db.commit()

    return AttackScenarioResult(
        attack_id=attack_id,
        attack_type=AttackType.CHANNEL_MANIPULATION,
        target_signature_id=sig.id,
        target_signer_id=sig.signer_id,
        attacker_id=attacker_id,
        parameters={"noise_type": noise_type, "noise_intensity": intensity},
        original_data=original_data,
        manipulated_data=manipulated_data,
        resulting_measurements=resulting_measurements,
        statistical_deviation=observed_qber,
        expected_outcome="REJECTED_CHANNEL_TAMPERED",
        timestamp=record.created_at,
    )
