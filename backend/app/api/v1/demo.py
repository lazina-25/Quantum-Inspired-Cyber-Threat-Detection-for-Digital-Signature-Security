"""API endpoints for automated Judge Security Demo execution."""

from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.demo_service import run_full_security_demo

router = APIRouter()


@router.post(
    "/run",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Run Full Security Demo Workflow",
    description="Executes the full 7-step Judge Security Demo (Signing -> Verification -> Forgery -> Impersonation -> Replay -> Channel Noise -> Unauthorized Verifier) in real-time.",
)
def run_demo_endpoint(
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Execute complete 7-step security demonstration scenario."""
    return run_full_security_demo(db=db)
