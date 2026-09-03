"""Quantum Digital Signature (QDS) protocol service.

Simulates teleportation-based quantum digital signing and deterministic verification.
"""

import hashlib
import json
import math
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.models.signature import (
    SignerModel,
    MessageModel,
    SignatureModel,
    VerificationModel,
)
from app.quantum.teleportation import (
    InputStateType,
    VerificationBasis,
    simulate_teleportation,
)


def _derive_quantum_token_sequence(
    message_hash: str,
    signer_id: str,
    session_nonce: str,
    token_count: int,
) -> List[Dict[str, Any]]:
    """Deterministically derive quantum signature states from message hash and signer secret."""
    tokens = []
    # Seed material combining message hash, signer, and nonce
    seed_str = f"{message_hash}:{signer_id}:{session_nonce}"
    derived_hash = hashlib.sha512(seed_str.encode()).hexdigest()

    state_map = {
        0: {"type": InputStateType.ZERO, "label": "|0⟩", "basis": "Z", "expected_bit": 0},
        1: {"type": InputStateType.ONE, "label": "|1⟩", "basis": "Z", "expected_bit": 1},
        2: {"type": InputStateType.PLUS, "label": "|+⟩", "basis": "X", "expected_bit": 0},
        3: {"type": InputStateType.MINUS, "label": "|-⟩", "basis": "X", "expected_bit": 1},
    }

    for i in range(token_count):
        # Extract 2-bit state selector from derived hash byte
        byte_val = int(derived_hash[i * 2 : (i + 1) * 2], 16)
        selector = byte_val % 4
        state_info = state_map[selector]
        tokens.append({
            "index": i,
            "state_type": state_info["type"],
            "state_label": state_info["label"],
            "basis": state_info["basis"],
            "expected_bit": state_info["expected_bit"],
        })
    return tokens


def create_signature_workflow(
    db: Session,
    signer_id: str,
    public_identity: str,
    message_content: str,
    session_nonce: Optional[str] = None,
    shots: int = 1024,
    token_count: int = 4,
) -> Dict[str, Any]:
    """Execute complete Signer workflow: Message Hashing -> Quantum Token Prep -> Teleportation -> Persistence."""
    # 1. Signer Registration / Fetch
    signer = db.get(SignerModel, signer_id)
    if not signer:
        signer = SignerModel(
            id=signer_id,
            public_identity=public_identity or f"Signer {signer_id}",
            public_key_fp=hashlib.sha256(signer_id.encode()).hexdigest()[:16],
        )
        db.add(signer)
        db.flush()

    # 2. Message Entity & Hash
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    signature_id = f"sig_{uuid.uuid4().hex[:12]}"
    nonce = session_nonce or f"nonce_{uuid.uuid4().hex[:8]}"
    msg_hash = hashlib.sha256(message_content.encode("utf-8")).hexdigest()

    message_rec = MessageModel(
        id=message_id,
        signer_id=signer.id,
        content=message_content,
        content_hash=msg_hash,
        session_nonce=nonce,
    )
    db.add(message_rec)
    db.flush()

    # 3. Derive and Teleport Quantum Signature Tokens
    raw_tokens = _derive_quantum_token_sequence(msg_hash, signer.id, nonce, token_count)
    
    quantum_tokens_data = []
    teleportation_metadata = []
    fidelities = []

    for token in raw_tokens:
        # Simulate Alice teleporting quantum signature token to Bob
        basis_mode = VerificationBasis.X_BASIS if token["basis"] == "X" else VerificationBasis.Z_BASIS
        teleport_res = simulate_teleportation(
            state_type=token["state_type"],
            shots=shots,
            verification_basis=basis_mode,
        )

        # Most prevalent BSM branch from Alice
        dominant_bsm = max(teleport_res.bell_measurement_counts.items(), key=lambda x: x[1])[0]
        pauli_op = "I" if dominant_bsm == "00" else "X" if dominant_bsm == "01" else "Z" if dominant_bsm == "10" else "XZ"

        token_record = {
            "index": token["index"],
            "state_label": token["state_label"],
            "basis": token["basis"],
            "expected_bit": token["expected_bit"],
            "bsm_outcome": dominant_bsm,
            "pauli_correction": pauli_op,
            "fidelity": teleport_res.fidelity,
        }
        quantum_tokens_data.append(token_record)
        fidelities.append(teleport_res.fidelity)

        teleportation_metadata.append({
            "index": token["index"],
            "bell_measurement_counts": teleport_res.bell_measurement_counts,
            "pauli_corrections_applied": teleport_res.pauli_corrections_applied,
            "receiver_counts": teleport_res.receiver_counts,
        })

    # 4. Store Signature in Database
    signature_rec = SignatureModel(
        id=signature_id,
        message_id=message_rec.id,
        signer_id=signer.id,
        session_nonce=nonce,
        shots=shots,
        quantum_tokens_json=json.dumps(quantum_tokens_data),
        teleportation_metadata_json=json.dumps(teleportation_metadata),
    )
    db.add(signature_rec)
    db.commit()
    db.refresh(signature_rec)

    avg_fidelity = sum(fidelities) / len(fidelities) if fidelities else 1.0

    return {
        "signature_id": signature_rec.id,
        "message_id": message_rec.id,
        "signer_id": signer.id,
        "public_identity": signer.public_identity,
        "message_content": message_content,
        "message_hash": msg_hash,
        "session_nonce": nonce,
        "quantum_tokens": quantum_tokens_data,
        "teleportation_fidelity_avg": round(avg_fidelity, 4),
        "created_at": signature_rec.created_at,
    }


def verify_signature_workflow(
    db: Session,
    signature_id: str,
    test_message_content: str,
    verifier_id: str = "bob_verifier_01",
) -> Dict[str, Any]:
    """Execute complete Verifier workflow: Message check -> Pauli correction -> Projective measurement -> Threshold rule."""
    signature = db.get(SignatureModel, signature_id)
    if not signature:
        raise ValueError(f"Signature '{signature_id}' not found in database.")

    message = db.get(MessageModel, signature.message_id)
    signer = db.get(SignerModel, signature.signer_id)

    tested_hash = hashlib.sha256(test_message_content.encode("utf-8")).hexdigest()
    is_tampered = tested_hash != message.content_hash

    # Retrieve Alice's teleported quantum tokens and BSM classical corrections
    stored_tokens = signature.get_quantum_tokens()

    # Reconstruct expected tokens from the TESTED message content
    expected_tokens = _derive_quantum_token_sequence(
        tested_hash,
        signature.signer_id,
        signature.session_nonce,
        len(stored_tokens),
    )

    token_verifications = []
    total_matches = 0
    total_tokens = len(stored_tokens)

    for i in range(total_tokens):
        orig_token = stored_tokens[i]
        exp_token = expected_tokens[i]

        # In quantum mechanics, if message is unaltered: Bob's expected basis matches Alice's teleported state
        # If message was altered: Bob tests state in mismatched/scrambled basis
        if not is_tampered:
            measured_bit = orig_token["expected_bit"]
            is_match = True
            total_matches += 1
        else:
            # Hash discrepancy causes basis mismatch or opposite bit outcome
            # Quantum measurement under scrambled basis yields random bit with 50% error probability
            is_state_same = (orig_token["state_label"] == exp_token["state_label"])
            if is_state_same:
                measured_bit = orig_token["expected_bit"]
                is_match = True
                total_matches += 1
            else:
                # Mismatch due to quantum state orthogonality / basis tampering
                measured_bit = 1 - exp_token["expected_bit"]
                is_match = False

        token_verifications.append({
            "index": i,
            "expected_state": exp_token["state_label"],
            "expected_basis": exp_token["basis"],
            "pauli_correction_applied": orig_token["pauli_correction"],
            "measured_bit": measured_bit,
            "is_match": is_match,
        })

    # Quantum Bit Error Rate (QBER)
    qber = (total_tokens - total_matches) / total_tokens if total_tokens > 0 else 0.0
    verification_score = round(max(0.0, 1.0 - qber), 4)

    # Deterministic Decision Rule: Threshold >= 0.85 and Nonce valid
    THRESHOLD = 0.85
    is_accepted = verification_score >= THRESHOLD and not is_tampered
    verdict = "ACCEPTED" if is_accepted else "REJECTED"

    if is_accepted:
        details = (
            f"Quantum signature verified successfully. Deterministic parity and basis match "
            f"confirmed across all {total_tokens} teleported quantum tokens (QBER = {qber:.1%}, Score = {verification_score:.2f})."
        )
    else:
        details = (
            f"Signature verification FAILED (REJECTED). Tampering or basis discrepancy detected. "
            f"Observed QBER of {qber:.1%} exceeds threshold (Score = {verification_score:.2f} < {THRESHOLD})."
        )

    # Persist Verification Log
    verification_rec = VerificationModel(
        id=f"ver_{uuid.uuid4().hex[:12]}",
        signature_id=signature.id,
        verifier_id=verifier_id,
        tested_message_content=test_message_content,
        tested_message_hash=tested_hash,
        is_message_tampered=is_tampered,
        verification_status=verdict,
        verification_score=verification_score,
        qber=round(qber, 4),
        fidelity_score=1.0 if not is_tampered else 0.5,
        measurement_counts_json=json.dumps({"matches": total_matches, "mismatches": total_tokens - total_matches}),
        expected_distribution_json=json.dumps({"expected_match_rate": 1.0, "error_threshold": 1.0 - THRESHOLD}),
        observed_distribution_json=json.dumps({"observed_match_rate": round(total_matches / total_tokens, 4), "qber": round(qber, 4)}),
        details=details,
    )
    db.add(verification_rec)
    db.commit()

    return {
        "signature_id": signature.id,
        "message_id": message.id,
        "signer_id": signer.id,
        "verifier_id": verifier_id,
        "original_message_hash": message.content_hash,
        "tested_message_hash": tested_hash,
        "is_message_tampered": is_tampered,
        "verification_status": verdict,
        "verification_score": verification_score,
        "qber": round(qber, 4),
        "fidelity_score": 1.0 if not is_tampered else 0.5,
        "measurement_counts": {"matches": total_matches, "mismatches": total_tokens - total_matches},
        "expected_distribution": {"expected_match_rate": 1.0, "max_allowed_qber": 0.15},
        "observed_distribution": {"match_rate": round(total_matches / total_tokens, 4), "qber": round(qber, 4)},
        "token_verifications": token_verifications,
        "decision_reason": details,
        "timestamp": verification_rec.created_at,
    }


def get_signature_by_id(db: Session, signature_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve signature details and its verification history."""
    sig = db.get(SignatureModel, signature_id)
    if not sig:
        return None
    message = db.get(MessageModel, sig.message_id)
    signer = db.get(SignerModel, sig.signer_id)

    verifications = db.scalars(
        select(VerificationModel)
        .where(VerificationModel.signature_id == signature_id)
        .order_by(desc(VerificationModel.created_at))
    ).all()

    last_ver = verifications[0] if verifications else None

    return {
        "signature_id": sig.id,
        "message_id": message.id if message else "",
        "signer_id": signer.id if signer else "",
        "public_identity": signer.public_identity if signer else "",
        "message_content": message.content if message else "",
        "message_hash": message.content_hash if message else "",
        "session_nonce": sig.session_nonce,
        "shots": sig.shots,
        "quantum_tokens": sig.get_quantum_tokens(),
        "teleportation_metadata": sig.get_teleportation_metadata(),
        "created_at": sig.created_at,
        "last_verification_status": last_ver.verification_status if last_ver else None,
        "verifications_count": len(verifications),
    }


def list_all_signatures(db: Session) -> List[Dict[str, Any]]:
    """List all stored signatures with summary metadata."""
    signatures = db.scalars(select(SignatureModel).order_by(desc(SignatureModel.created_at))).all()
    results = []
    for sig in signatures:
        message = db.get(MessageModel, sig.message_id)
        last_ver = db.scalars(
            select(VerificationModel)
            .where(VerificationModel.signature_id == sig.id)
            .order_by(desc(VerificationModel.created_at))
        ).first()

        tokens = sig.get_quantum_tokens()
        results.append({
            "signature_id": sig.id,
            "message_id": sig.message_id,
            "signer_id": sig.signer_id,
            "message_preview": (message.content[:60] + "...") if message and len(message.content) > 60 else (message.content if message else ""),
            "message_hash": message.content_hash if message else "",
            "session_nonce": sig.session_nonce,
            "token_count": len(tokens),
            "created_at": sig.created_at,
            "last_verification_status": last_ver.verification_status if last_ver else "UNVERIFIED",
            "last_verified_at": last_ver.created_at if last_ver else None,
        })
    return results
