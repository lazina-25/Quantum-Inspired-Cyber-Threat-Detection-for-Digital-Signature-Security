"""Master API router registering all versioned endpoints."""

from fastapi import APIRouter
from app.api.v1 import health, quantum, signatures, attacks, detection, analytics, demo

api_router = APIRouter()

# Mount health routes under v1
api_router.include_router(health.router, tags=["Health & Status"])

# Mount quantum simulation routes under v1
api_router.include_router(quantum.router, prefix="/quantum", tags=["Quantum Simulation"])

# Mount signatures routes under v1
api_router.include_router(signatures.router, prefix="/signatures", tags=["Quantum Digital Signatures"])

# Mount attacks simulation routes under v1
api_router.include_router(attacks.router, prefix="/attacks", tags=["Cyber Attack Simulation"])

# Mount threat detection engine under v1
api_router.include_router(detection.router, prefix="/detection", tags=["Threat Detection Engine"])

# Mount analytics and dashboard KPIs under v1
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Security KPIs"])

# Mount Judge Security Demo under v1
api_router.include_router(demo.router, prefix="/demo", tags=["Judge Security Demo"])
