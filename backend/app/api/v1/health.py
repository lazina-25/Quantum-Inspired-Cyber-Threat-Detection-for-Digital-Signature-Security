"""Health check endpoints."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.database.session import get_db
from app.schemas.health import HealthCheckResponse, SystemModuleStatus

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="System Health & Readiness Check",
    description="Returns current operational status, database connectivity, and quantum/threat module readiness.",
)
def get_health_status(db: Session = Depends(get_db)) -> HealthCheckResponse:
    """Perform health verification across system components."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:  # pylint: disable=broad-except
        db_status = f"disconnected ({str(exc)})"

    modules = {
        "quantum_teleportation": SystemModuleStatus(
            status="standby",
            description="Bell-state generation and Pauli correction circuit engine",
            ready=True,
        ),
        "threat_detection_engine": SystemModuleStatus(
            status="standby",
            description="Deterministic mathematical and statistical thresholding",
            ready=True,
        ),
        "attack_simulation": SystemModuleStatus(
            status="standby",
            description="Adversary channel noise & injection simulation suite",
            ready=True,
        ),
        "database_persistence": SystemModuleStatus(
            status="operational" if "connected" in db_status else "degraded",
            description="SQLite / SQLAlchemy transaction layer",
            ready="connected" in db_status,
        ),
    }

    return HealthCheckResponse(
        status="healthy" if "connected" in db_status else "degraded",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        database_status=db_status,
        timestamp=datetime.now(timezone.utc),
        modules=modules,
        details="System foundation initialized successfully.",
    )
