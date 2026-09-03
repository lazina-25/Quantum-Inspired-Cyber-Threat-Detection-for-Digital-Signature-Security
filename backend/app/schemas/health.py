"""Pydantic schemas for system health and status reporting."""

from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel, Field


class SystemModuleStatus(BaseModel):
    """Status details for individual sub-modules."""

    status: str = Field(..., description="Operational status: 'operational', 'standby', 'degraded'")
    description: str = Field(..., description="Short module summary")
    ready: bool = Field(..., description="Whether module is initialized and ready")


class HealthCheckResponse(BaseModel):
    """Response model for /api/health endpoint."""

    status: str = Field(..., json_schema_extra={"example": "healthy"}, description="Overall system health status")
    project: str = Field(..., description="Project name")
    version: str = Field(..., description="API Version")
    environment: str = Field(..., description="Deployment environment")
    database_status: str = Field(..., description="Database connection status ('connected' or 'disconnected')")
    timestamp: datetime = Field(..., description="Current server UTC timestamp")
    modules: Dict[str, SystemModuleStatus] = Field(
        default_factory=dict,
        description="Readiness status of quantum and threat detection modules",
    )
    details: Optional[str] = Field(None, description="Additional debug or status message")
