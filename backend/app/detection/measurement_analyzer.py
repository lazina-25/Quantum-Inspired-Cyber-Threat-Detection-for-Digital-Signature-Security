"""Measurement Analyzer for quantum state outcomes.

Normalizes raw projective measurement counts, computes binomial standard errors,
and formats basis-resolved distributions.
"""

import math
from typing import Dict, Any
from app.detection.models import QuantumMeasurementAnalysis


def analyze_measurement_counts(
    counts: Dict[str, int],
    total_shots: int = 1024,
) -> QuantumMeasurementAnalysis:
    """Transform raw shot measurement counts into normalized empirical probability distributions."""
    shots = sum(counts.values()) if counts else total_shots
    if shots <= 0:
        shots = total_shots if total_shots > 0 else 1024

    probabilities: Dict[str, float] = {}
    standard_errors: Dict[str, float] = {}

    for state, count in counts.items():
        p = count / shots
        probabilities[state] = round(p, 6)
        # Binomial standard error for shot sampling: sqrt(p * (1-p) / N)
        se = math.sqrt(max(0.0, p * (1.0 - p)) / shots)
        standard_errors[state] = round(se, 6)

    # Determine dominant basis
    keys = list(counts.keys())
    if any("+" in k or "-" in k for k in keys):
        dominant_basis = "X_BASIS (Hadamard)"
    elif any(len(k) == 2 for k in keys):
        dominant_basis = "BELL_BASIS"
    else:
        dominant_basis = "Z_BASIS (Computational)"

    return QuantumMeasurementAnalysis(
        total_shots=shots,
        observed_probabilities=probabilities,
        standard_errors=standard_errors,
        dominant_basis=dominant_basis,
    )
