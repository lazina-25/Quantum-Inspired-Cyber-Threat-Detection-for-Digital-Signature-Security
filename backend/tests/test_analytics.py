"""Unit and integration tests for Dashboard Analytics & KPIs."""

import pytest
from fastapi.testclient import TestClient


def test_analytics_summary_endpoint(client: TestClient):
    """Verify that GET /api/analytics/summary returns calculated KPI aggregates and event streams."""
    # 1. Create a signature
    sig_resp = client.post("/api/signatures/create", json={
        "signer_id": "alice_signer_01",
        "message_content": "DOCUMENT_FOR_ANALYTICS_TESTING",
    })
    assert sig_resp.status_code == 201
    sig_id = sig_resp.json()["signature_id"]

    # 2. Verify signature
    client.post("/api/signatures/verify", json={
        "signature_id": sig_id,
        "message_content": "DOCUMENT_FOR_ANALYTICS_TESTING",
    })

    # 3. Simulate attack
    client.post("/api/attacks/forge", json={
        "target_signature_id": sig_id,
    })

    # 4. Analyze threat
    client.post("/api/detection/analyze", json={
        "signature_id": sig_id,
    })

    # 5. Fetch Analytics Summary
    resp = client.get("/api/analytics/summary")
    assert resp.status_code == 200
    data = resp.json()

    assert data["total_signatures"] >= 1
    assert data["valid_signatures"] >= 1
    assert data["total_attacks"] >= 1
    assert data["forgery_attempts"] >= 1
    assert data["total_threat_analyses"] >= 1
    assert data["detection_rate"] == 1.0
    assert data["false_positive_rate"] == 0.0
    assert isinstance(data["recent_events"], list)
    assert len(data["recent_events"]) >= 4
