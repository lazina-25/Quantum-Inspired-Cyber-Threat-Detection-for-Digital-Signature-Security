"""API endpoints for deterministic Quantum Cyber Threat Detection."""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
import json

from app.database.session import get_db
from app.models.detection import ThreatAnalysisModel
from app.detection.threat_classifier import classify_threat_scenario
from app.schemas.detection import (
    ThreatAnalysisRequest,
    ThreatAnalysisResponse,
    ThreatHistoryItem,
)

router = APIRouter()


@router.post(
    "/analyze",
    response_model=ThreatAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Quantum Signature for Cyber Threats",
    description="Evaluates Total Variation Distance, Fidelity, QBER, and Forgery Probabilities against deterministic thresholds (Zero AI/ML).",
)
def analyze_threat(
    request: ThreatAnalysisRequest,
    db: Session = Depends(get_db),
) -> ThreatAnalysisResponse:
    """Execute deterministic threat detection on target signature session."""
    try:
        verdict = classify_threat_scenario(
            db=db,
            signature_id=request.signature_id,
            verifier_id=request.verifier_id,
            tested_message=request.tested_message,
            attack_context_id=request.attack_context_id,
        )
        return ThreatAnalysisResponse(**verdict.model_dump())
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.get(
    "/history",
    response_model=List[ThreatHistoryItem],
    status_code=status.HTTP_200_OK,
    summary="Get Threat Detection History",
    description="Returns audit log of all threat detection analyses performed by the engine.",
)
def get_detection_history(
    db: Session = Depends(get_db),
) -> List[ThreatHistoryItem]:
    """List historical threat analysis records."""
    records = db.scalars(select(ThreatAnalysisModel).order_by(desc(ThreatAnalysisModel.created_at))).all()
    return [
        ThreatHistoryItem(
            analysis_id=rec.id,
            signature_id=rec.signature_id,
            verifier_id=rec.verifier_id,
            status=rec.status,
            attack_type=rec.attack_type,
            threat_score=rec.threat_score,
            deviation=rec.deviation,
            qber=rec.qber,
            created_at=rec.created_at,
        )
        for rec in records
    ]


@router.get(
    "/{analysis_id}",
    response_model=ThreatAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Threat Analysis Details by ID",
    description="Retrieve full explainable threat detection verdict, evidence reasoning, and quantum telemetry.",
)
def get_threat_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
) -> ThreatAnalysisResponse:
    """Fetch specific threat analysis record."""
    rec = db.get(ThreatAnalysisModel, analysis_id)
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Threat analysis '{analysis_id}' not found.",
        )
    return ThreatAnalysisResponse(
        analysis_id=rec.id,
        signature_id=rec.signature_id,
        verifier_id=rec.verifier_id,
        status=rec.status,
        attack_type=rec.attack_type,
        threat_score=rec.threat_score,
        deviation=rec.deviation,
        threshold=rec.threshold,
        qber=rec.qber,
        fidelity=rec.fidelity,
        forgery_probability=rec.forgery_probability,
        evidence=rec.get_evidence(),
        telemetry=rec.get_telemetry(),
        timestamp=rec.created_at,
    )
