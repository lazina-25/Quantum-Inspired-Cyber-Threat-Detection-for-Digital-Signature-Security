"""API endpoints for Quantum Digital Signature (QDS) creation, verification, and audit logs."""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.signature import (
    CreateSignatureRequest,
    CreateSignatureResponse,
    VerifySignatureRequest,
    VerifySignatureResponse,
    SignatureListItem,
)
from app.services.qds_service import (
    create_signature_workflow,
    verify_signature_workflow,
    get_signature_by_id,
    list_all_signatures,
)

router = APIRouter()


@router.post(
    "/create",
    response_model=CreateSignatureResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create & Teleport Quantum Digital Signature",
    description="Signer generates a sequence of quantum signature states for the message hash and teleports them with Bell pairs.",
)
def create_signature(
    request: CreateSignatureRequest,
    db: Session = Depends(get_db),
) -> CreateSignatureResponse:
    """Sign a message using teleportation-based Quantum Digital Signature protocol."""
    result = create_signature_workflow(
        db=db,
        signer_id=request.signer_id,
        public_identity=request.public_identity or request.signer_id,
        message_content=request.message_content,
        session_nonce=request.session_nonce,
        shots=request.shots,
        token_count=request.token_count,
    )
    return CreateSignatureResponse(**result)


@router.post(
    "/verify",
    response_model=VerifySignatureResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Quantum Digital Signature",
    description="Verifier applies Pauli corrections, performs projective measurement, and computes deterministic QBER threshold verification.",
)
def verify_signature(
    request: VerifySignatureRequest,
    db: Session = Depends(get_db),
) -> VerifySignatureResponse:
    """Verify quantum digital signature against claimed message content."""
    try:
        result = verify_signature_workflow(
            db=db,
            signature_id=request.signature_id,
            test_message_content=request.message_content,
            verifier_id=request.verifier_id,
            attack_id=request.attack_id,
        )
        return VerifySignatureResponse(**result)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.get(
    "/{signature_id}",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Get Signature Details by ID",
    description="Fetch full signature metadata, teleported quantum tokens, and verification history.",
)
def get_signature_details(
    signature_id: str,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve full signature record."""
    result = get_signature_by_id(db=db, signature_id=signature_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Signature '{signature_id}' not found.",
        )
    return result


@router.get(
    "",
    response_model=List[SignatureListItem],
    status_code=status.HTTP_200_OK,
    summary="List All Quantum Digital Signatures",
    description="Returns registry of stored quantum signatures and their latest verification status.",
)
def list_signatures(
    db: Session = Depends(get_db),
) -> List[SignatureListItem]:
    """List all stored signatures."""
    results = list_all_signatures(db=db)
    return [SignatureListItem(**item) for item in results]
