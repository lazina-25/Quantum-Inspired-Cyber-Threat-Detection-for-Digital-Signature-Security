"""Deterministic Threshold Calibration & Evaluation Engine.

Provides calibrated mathematical threshold bounds loaded from settings and
evaluates statistical indicator violations without AI/ML.
"""

from typing import Dict, Any, List
from app.config.settings import settings


class ThresholdCalibration:
    """Configurable and calibrated physical thresholds for QDS cyber threat detection."""

    # 1. Quantum Bit Error Rate (QBER)
    # Physical Rationale: In fiber-based quantum channels, nominal background noise is < 3-5%.
    # Eavesdropping or message tampering elevates QBER to > 25-50%.
    QBER_MAX_THRESHOLD = settings.QBER_MAX_THRESHOLD

    # 2. Total Variation Distance (TVD)
    # Mathematical Rationale: In statistical hypothesis testing with N=1024 shots, shot sampling variance is ~ 1/sqrt(N) = 3.1%.
    # A TVD threshold of 12% represents a ~4-sigma anomaly bound.
    TVD_MAX_THRESHOLD = settings.TVD_MAX_THRESHOLD

    # 3. State Overlap Fidelity (F)
    # Quantum Rationale: Undisturbed teleportation achieves F = 1.0. Active noise / intercept-resend drops F to < 0.75.
    FIDELITY_MIN_THRESHOLD = settings.FIDELITY_MIN_THRESHOLD

    # 4. Session Nonce & Timestamp Validity Window
    # Cryptographic Rationale: Signatures replayed after 300 seconds (5 min) exceed the maximum validity lease.
    REPLAY_MAX_TIMESTAMP_DELTA = settings.REPLAY_MAX_TIMESTAMP_DELTA

    # 5. Composite Threat Alert Threshold
    THREAT_ALERT_THRESHOLD = settings.THREAT_ALERT_THRESHOLD

    # 6. EPR Parity Tolerance
    PARITY_TOLERANCE_THRESHOLD = settings.PARITY_TOLERANCE_THRESHOLD


def evaluate_threshold_violations(
    qber: float,
    tvd: float,
    fidelity: float,
    timestamp_delta: float,
    parity_delta: float,
) -> Dict[str, Any]:
    """Check all quantum and protocol invariants against deterministic thresholds."""
    violations: List[str] = []

    qber_violated = qber > ThresholdCalibration.QBER_MAX_THRESHOLD
    if qber_violated:
        violations.append(
            f"Quantum Bit Error Rate (QBER = {qber:.1%}) exceeds maximum permissible threshold ({ThresholdCalibration.QBER_MAX_THRESHOLD:.1%})."
        )

    tvd_violated = tvd > ThresholdCalibration.TVD_MAX_THRESHOLD
    if tvd_violated:
        violations.append(
            f"Total Variation Distance (D_TV = {tvd:.3f}) exceeds statistical 4-sigma boundary ({ThresholdCalibration.TVD_MAX_THRESHOLD:.3f})."
        )

    fidelity_violated = fidelity < ThresholdCalibration.FIDELITY_MIN_THRESHOLD
    if fidelity_violated:
        violations.append(
            f"Quantum state fidelity (F = {fidelity:.1%}) collapsed below minimum threshold ({ThresholdCalibration.FIDELITY_MIN_THRESHOLD:.1%})."
        )

    replay_violated = timestamp_delta > ThresholdCalibration.REPLAY_MAX_TIMESTAMP_DELTA
    if replay_violated:
        violations.append(
            f"Session timestamp delta ({timestamp_delta:.0f}s) exceeds maximum validity window ({ThresholdCalibration.REPLAY_MAX_TIMESTAMP_DELTA}s)."
        )

    parity_violated = parity_delta > ThresholdCalibration.PARITY_TOLERANCE_THRESHOLD
    if parity_violated:
        violations.append(
            f"EPR Bell-state parity deviation (Δ = {parity_delta:.3f}) exceeds tolerance threshold ({ThresholdCalibration.PARITY_TOLERANCE_THRESHOLD:.3f})."
        )

    return {
        "is_any_violated": len(violations) > 0,
        "violations": violations,
        "qber_violated": qber_violated,
        "tvd_violated": tvd_violated,
        "fidelity_violated": fidelity_violated,
        "replay_violated": replay_violated,
        "parity_violated": parity_violated,
    }
