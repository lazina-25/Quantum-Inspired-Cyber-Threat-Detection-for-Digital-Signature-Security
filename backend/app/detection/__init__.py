"""Threat detection package (Strictly Zero AI/ML).

Provides modular, explainable quantum statistical analysis, Total Variation Distance,
Fidelity metrics, and deterministic threat classification.
"""

from app.detection.models import (
    ThreatStatus,
    ThreatClassification,
    QuantumMeasurementAnalysis,
    DistributionComparisonResult,
    ForgeryProbabilityAssessment,
    ThreatDetectionVerdict,
)
from app.detection.measurement_analyzer import analyze_measurement_counts
from app.detection.probability import compare_distributions
from app.detection.statistics import (
    calculate_qber,
    calculate_parity_deviation,
    calculate_binomial_z_score,
)
from app.detection.forgery_probability import calculate_forgery_probability
from app.detection.threshold_engine import (
    ThresholdCalibration,
    evaluate_threshold_violations,
)
from app.detection.threat_classifier import classify_threat_scenario

__all__ = [
    "ThreatStatus",
    "ThreatClassification",
    "QuantumMeasurementAnalysis",
    "DistributionComparisonResult",
    "ForgeryProbabilityAssessment",
    "ThreatDetectionVerdict",
    "analyze_measurement_counts",
    "compare_distributions",
    "calculate_qber",
    "calculate_parity_deviation",
    "calculate_binomial_z_score",
    "calculate_forgery_probability",
    "ThresholdCalibration",
    "evaluate_threshold_violations",
    "classify_threat_scenario",
]
