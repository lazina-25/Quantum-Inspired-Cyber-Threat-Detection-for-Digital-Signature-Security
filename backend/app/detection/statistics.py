"""Statistical analysis utilities for quantum states and error rates."""

import math
from typing import Dict, Any, List


def calculate_qber(
    total_tokens: int,
    mismatch_count: int,
) -> float:
    """Calculate Quantum Bit Error Rate (QBER)."""
    if total_tokens <= 0:
        return 0.0
    return round(mismatch_count / total_tokens, 6)


def calculate_parity_deviation(
    observed_distribution: Dict[str, float],
    expected_parity: float = 1.0,  # +1 for even (|00>, |11>), -1 for odd (|01>, |10>)
) -> float:
    """Compute EPR Bell-state parity discrepancy."""
    even_prob = observed_distribution.get("00", 0.0) + observed_distribution.get("11", 0.0)
    odd_prob = observed_distribution.get("01", 0.0) + observed_distribution.get("10", 0.0)
    
    observed_parity = even_prob - odd_prob
    return round(abs(observed_parity - expected_parity), 6)


def calculate_binomial_z_score(
    observed_errors: int,
    total_shots: int,
    expected_error_rate: float = 0.0,
) -> float:
    """Compute standard Z-score for deviation from expected quantum error rate."""
    if total_shots <= 0:
        return 0.0
    p0 = max(1e-6, min(1.0 - 1e-6, expected_error_rate))
    mean = total_shots * p0
    variance = total_shots * p0 * (1.0 - p0)
    std_dev = math.sqrt(variance) if variance > 0 else 1.0
    
    z = (observed_errors - mean) / std_dev
    return round(z, 4)
