"""Probability metrics and quantum distribution comparison.

Implements Total Variation Distance (TVD), Bhattacharyya Fidelity, and Chi-Square goodness-of-fit.
"""

import math
from typing import Dict, Set
from app.detection.models import DistributionComparisonResult


def compare_distributions(
    expected_dist: Dict[str, float],
    observed_dist: Dict[str, float],
    total_shots: int = 1024,
) -> DistributionComparisonResult:
    """Compute mathematically rigorous statistical distance metrics between expected and observed quantum states."""
    all_keys: Set[str] = set(expected_dist.keys()).union(set(observed_dist.keys()))

    tvd_sum = 0.0
    fidelity_sum = 0.0
    chi_square_sum = 0.0
    max_abs_err = 0.0

    for k in all_keys:
        p_exp = expected_dist.get(k, 0.0)
        p_obs = observed_dist.get(k, 0.0)

        diff = abs(p_obs - p_exp)
        tvd_sum += diff
        max_abs_err = max(max_abs_err, diff)

        # Classical Bhattacharyya state overlap fidelity: sum(sqrt(P(x) * Q(x)))
        fidelity_sum += math.sqrt(max(0.0, p_exp * p_obs))

        # Chi-Square component: (O - E)^2 / E
        if p_exp > 1e-9:
            exp_counts = p_exp * total_shots
            obs_counts = p_obs * total_shots
            chi_square_sum += ((obs_counts - exp_counts) ** 2) / exp_counts
        elif p_obs > 1e-9:
            chi_square_sum += (p_obs * total_shots)

    total_variation_distance = round(tvd_sum / 2.0, 6)
    bhattacharyya_fidelity = round(min(1.0, max(0.0, fidelity_sum)), 6)
    chi_square_statistic = round(chi_square_sum, 6)
    max_absolute_error = round(max_abs_err, 6)

    return DistributionComparisonResult(
        total_variation_distance=total_variation_distance,
        bhattacharyya_fidelity=bhattacharyya_fidelity,
        chi_square_statistic=chi_square_statistic,
        max_absolute_error=max_absolute_error,
    )
