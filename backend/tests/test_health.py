"""Tests for system health endpoints."""

from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    """Test root endpoint returns 200 and valid project metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "project" in data
    assert data["health"] == "/api/health"


def test_api_health_endpoint(client: TestClient):
    """Test GET /api/health returns healthy status and connected DB."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "healthy"
    assert data["database_status"] == "connected"
    assert "version" in data
    assert "timestamp" in data
    assert "modules" in data

    modules = data["modules"]
    assert "quantum_teleportation" in modules
    assert "threat_detection_engine" in modules
    assert "attack_simulation" in modules
    assert "database_persistence" in modules
    assert modules["database_persistence"]["ready"] is True


def test_api_v1_health_endpoint(client: TestClient):
    """Test GET /api/v1/health returns 200 and matches response contract."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database_status"] == "connected"
