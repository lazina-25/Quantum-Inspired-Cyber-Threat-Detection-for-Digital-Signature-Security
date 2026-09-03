"""API endpoints for cyber attack simulation across the 5 threat vectors."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.database.session import get_db
from app.models.attack import AttackRecordModel
from app.attacks.forgery import simulate_forgery_attack
from app.attacks.impersonation import simulate_impersonation_attack
from app.attacks.replay import simulate_replay_attack
from app.attacks.channel_manipulation import simulate_channel_manipulation_attack
from app.attacks.unauthorized_verification import simulate_unauthorized_verification_attack
from app.schemas.attack import (
    ForgeryAttackRequest,
    ImpersonationAttackRequest,
    ReplayAttackRequest,
    ChannelManipulationRequest,
    UnauthorizedVerificationRequest,
    AttackResponse,
    AttackHistoryItem,
)

router = APIRouter()


@router.post(
    "/forge",
    response_model=AttackResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate Digital Signature Forgery Attack",
    description="Simulates adversary creating an altered message or modifying quantum state expectations.",
)
def attack_forge(
    request: ForgeryAttackRequest,
    db: Session = Depends(get_db),
) -> AttackResponse:
    """Execute signature forgery attack."""
    try:
        res = simulate_forgery_attack(
            db=db,
            target_signature_id=request.target_signature_id,
            forged_message=request.forged_message,
            tamper_token_ratio=request.tamper_token_ratio,
            attacker_id=request.attacker_id,
        )
        return AttackResponse(**res.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post(
    "/impersonate",
    response_model=AttackResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate Signer Impersonation Attack",
    description="Simulates an unauthorized entity attempting to act as the legitimate signer without the secret key.",
)
def attack_impersonate(
    request: ImpersonationAttackRequest,
    db: Session = Depends(get_db),
) -> AttackResponse:
    """Execute signer impersonation attack."""
    try:
        res = simulate_impersonation_attack(
            db=db,
            target_signature_id=request.target_signature_id,
            spoofed_signer_id=request.spoofed_signer_id,
            attacker_id=request.attacker_id,
        )
        return AttackResponse(**res.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post(
    "/replay",
    response_model=AttackResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate Replay Attack",
    description="Simulates reuse of a previously valid signature or expired session nonce.",
)
def attack_replay(
    request: ReplayAttackRequest,
    db: Session = Depends(get_db),
) -> AttackResponse:
    """Execute replay attack."""
    try:
        res = simulate_replay_attack(
            db=db,
            target_signature_id=request.target_signature_id,
            timestamp_delta_seconds=request.timestamp_delta_seconds,
            replayed_nonce=request.replayed_nonce,
            attacker_id=request.attacker_id,
        )
        return AttackResponse(**res.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post(
    "/channel-manipulation",
    response_model=AttackResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate Quantum Channel Manipulation Attack",
    description="Simulates depolarizing noise, intercept-resend eavesdropping, or phase-flip perturbations on the EPR channel.",
)
def attack_channel_manipulation(
    request: ChannelManipulationRequest,
    db: Session = Depends(get_db),
) -> AttackResponse:
    """Execute quantum channel manipulation attack."""
    try:
        res = simulate_channel_manipulation_attack(
            db=db,
            target_signature_id=request.target_signature_id,
            noise_type=request.noise_type,
            noise_intensity=request.noise_intensity,
            attacker_id=request.attacker_id,
        )
        return AttackResponse(**res.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post(
    "/unauthorized-verification",
    response_model=AttackResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate Unauthorized Verification Attempt",
    description="Simulates verification attempts by an unauthorized verifier or tampering with basis access tokens.",
)
def attack_unauthorized_verification(
    request: UnauthorizedVerificationRequest,
    db: Session = Depends(get_db),
) -> AttackResponse:
    """Execute unauthorized verification attempt."""
    try:
        res = simulate_unauthorized_verification_attack(
            db=db,
            target_signature_id=request.target_signature_id,
            unauthorized_verifier_id=request.unauthorized_verifier_id,
            tampered_basis_token=request.tampered_basis_token,
            attacker_id=request.attacker_id,
        )
        return AttackResponse(**res.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get(
    "/history",
    response_model=List[AttackHistoryItem],
    status_code=status.HTTP_200_OK,
    summary="Get Attack Simulation History",
    description="Returns audit log of all simulated cyber attacks stored in SQLite.",
)
def get_attack_history(
    db: Session = Depends(get_db),
) -> List[AttackHistoryItem]:
    """Retrieve simulated attack records."""
    records = db.scalars(select(AttackRecordModel).order_by(desc(AttackRecordModel.created_at))).all()
    return [
        AttackHistoryItem(
            attack_id=rec.id,
            attack_type=rec.attack_type,
            target_signature_id=rec.target_signature_id,
            target_signer_id=rec.target_signer_id,
            attacker_id=rec.attacker_id,
            statistical_deviation=rec.statistical_deviation,
            expected_outcome=rec.expected_outcome,
            created_at=rec.created_at,
        )
        for rec in records
    ]
