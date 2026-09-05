"""Application settings management using Pydantic Settings."""

from functools import lru_cache
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings."""

    # Project metadata
    PROJECT_NAME: str = "Quantum QDS Platform"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = (
        "Quantum-Inspired Cyber Threat Detection Framework for Teleportation-Based "
        "Quantum Digital Signature (QDS) Protocols"
    )
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Cross-Origin Resource Sharing (CORS)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v  # Handled by pydantic json parsing if string starts with '['
        raise ValueError(v)

    # Database connection
    DATABASE_URL: str = "sqlite:///./quantum_qds.db"

    # Deterministic Threat Detection Thresholds (Configurable via ENV)
    QBER_MAX_THRESHOLD: float = 0.15          # Max permissible Quantum Bit Error Rate (15%)
    TVD_MAX_THRESHOLD: float = 0.12           # Max Total Variation Distance between expected & observed states
    FIDELITY_MIN_THRESHOLD: float = 0.85      # Minimum required quantum state overlap fidelity
    REPLAY_MAX_TIMESTAMP_DELTA: int = 300     # Max valid timestamp delta window in seconds (5 min)
    THREAT_ALERT_THRESHOLD: float = 0.60      # Minimum composite threat score to trigger ATTACK alert
    PARITY_TOLERANCE_THRESHOLD: float = 0.10  # Max acceptable EPR parity violation delta

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


settings = get_settings()
