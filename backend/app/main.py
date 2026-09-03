"""Main FastAPI application entrypoint."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.api.v1.health import router as health_router
from app.config.settings import settings
from app.database.base import Base
from app.database.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager for startup and shutdown tasks."""
    # Initialize database tables on startup
    Base.metadata.create_all(bind=engine)
    yield
    # Teardown / cleanup if needed on shutdown


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # Configure CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount health check directly at /api/health
    app.include_router(health_router, prefix="/api", tags=["Health & Status"])

    # Mount quantum routes directly at /api/quantum
    from app.api.v1.quantum import router as quantum_router
    app.include_router(quantum_router, prefix="/api/quantum", tags=["Quantum Simulation"])

    # Mount signatures routes directly at /api/signatures
    from app.api.v1.signatures import router as signatures_router
    app.include_router(signatures_router, prefix="/api/signatures", tags=["Quantum Digital Signatures"])

    # Mount attacks routes directly at /api/attacks
    from app.api.v1.attacks import router as attacks_router
    app.include_router(attacks_router, prefix="/api/attacks", tags=["Cyber Attack Simulation"])

    # Mount detection routes directly at /api/detection
    from app.api.v1.detection import router as detection_router
    app.include_router(detection_router, prefix="/api/detection", tags=["Threat Detection Engine"])

    # Mount analytics routes directly at /api/analytics
    from app.api.v1.analytics import router as analytics_router
    app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics & Security KPIs"])

    # Mount demo routes directly at /api/demo
    from app.api.v1.demo import router as demo_router
    app.include_router(demo_router, prefix="/api/demo", tags=["Judge Security Demo"])

    # Mount versioned API routes under /api/v1
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/", tags=["Root"])
    def root_info():
        """Root API metadata."""
        return {
            "project": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "online",
            "docs": "/docs",
            "health": "/api/health",
        }

    return app


app = create_application()
