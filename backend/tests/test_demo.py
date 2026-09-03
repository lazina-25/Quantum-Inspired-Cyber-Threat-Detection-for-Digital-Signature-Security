"""Automated unit and integration tests for Judge Security Demo."""

import pytest
from fastapi.testclient import TestClient


def test_judge_security_demo_endpoint(client: TestClient):
    """Verify that POST /api/demo/run executes all 7 steps with 100% detection rate."""
    resp = client.post("/api/demo/run")
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "SUCCESS"
    assert data["total_steps"] == 7
    assert data["overall_detection_rate"] == 1.0
    assert data["false_positive_rate"] == 0.0
    assert data["false_negative_rate"] == 0.0
    assert data["total_duration_ms"] > 0

    steps = data["steps"]
    assert len(steps) == 7

    # Step 1: Signature generation
    assert steps[0]["verdict"] == "GENERATED"
    # Step 2: Verification
    assert steps[1]["verdict"] == "ACCEPTED"
    # Step 3: Forgery
    assert steps[2]["verdict"] == "FORGERY DETECTED"
    # Step 4: Impersonation
    assert steps[3]["verdict"] == "IMPERSONATION DETECTED"
    # Step 5: Replay
    assert steps[4]["verdict"] == "REPLAY DETECTED"
    # Step 6: Channel manipulation
    assert steps[5]["verdict"] == "CHANNEL MANIPULATION DETECTED"
    # Step 7: Unauthorized verification
    assert steps[6]["verdict"] == "UNAUTHORIZED VERIFICATION DETECTED"
