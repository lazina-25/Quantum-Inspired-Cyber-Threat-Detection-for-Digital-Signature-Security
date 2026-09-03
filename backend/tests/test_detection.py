"""Unit and integration tests for Deterministic Threat Detection Engine (Zero AI/ML)."""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def target_signature(client: TestClient) -> str:
    """Create a legitimate signature record."""
    resp = client.post("/api/signatures/create", json={
        "signer_id": "alice_signer_01",
        "public_identity": "Alice Quantum Signer Node",
        "message_content": "VALID_DOCUMENT_FOR_DETECTION_ANALYSIS",
        "session_nonce": "nonce_det_test_001",
        "token_count": 4,
    })
    assert resp.status_code == 201
    return resp.json()["signature_id"]


def test_detection_legitimate_signature(client: TestClient, target_signature: str):
    """Verify that an untampered signature evaluates to LEGITIMATE with a low threat score."""
    resp = client.post("/api/detection/analyze", json={
        "signature_id": target_signature,
        "verifier_id": "bob_verifier_01",
        "tested_message": "VALID_DOCUMENT_FOR_DETECTION_ANALYSIS",
    })
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "LEGITIMATE"
    assert data["attack_type"] == "LEGITIMATE"
    assert data["threat_score"] <= 0.20
    assert data["qber"] == 0.0
    assert data["fidelity"] >= 0.99
    assert len(data["evidence"]) >= 1


def test_detection_forgery_attack(client: TestClient, target_signature: str):
    """Verify detection of digital signature forgery when message is altered."""
    resp = client.post("/api/detection/analyze", json={
        "signature_id": target_signature,
        "verifier_id": "bob_verifier_01",
        "tested_message": "ALTERED_FORGED_DOCUMENT_TEXT_002",
    })
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "ATTACK"
    assert data["attack_type"] == "FORGERY"
    assert data["threat_score"] >= 0.85
    assert data["qber"] > 0.15
    assert data["forgery_probability"] > 0.50
    assert any("discrepancy" in e.lower() or "mismatch" in e.lower() for e in data["evidence"])


def test_detection_impersonation_attack(client: TestClient, target_signature: str):
    """Verify detection of signer impersonation via attack context and parity delta."""
    # 1. Run Impersonation Attack
    imp_resp = client.post("/api/attacks/impersonate", json={
        "target_signature_id": target_signature,
        "spoofed_signer_id": "alice_signer_01",
        "attacker_id": "mallory_impersonator_99",
    })
    assert imp_resp.status_code == 200
    att_id = imp_resp.json()["attack_id"]

    # 2. Analyze
    det_resp = client.post("/api/detection/analyze", json={
        "signature_id": target_signature,
        "attack_context_id": att_id,
    })
    assert det_resp.status_code == 200
    data = det_resp.json()

    assert data["status"] == "ATTACK"
    assert data["attack_type"] == "IMPERSONATION"
    assert data["threat_score"] >= 0.90
    assert any("parity" in e.lower() or "impersonat" in e.lower() for e in data["evidence"])


def test_detection_replay_attack(client: TestClient, target_signature: str):
    """Verify detection of replay attacks via stale timestamp drift and nonce collisions."""
    # 1. Run Replay Attack
    rep_resp = client.post("/api/attacks/replay", json={
        "target_signature_id": target_signature,
        "timestamp_delta_seconds": 7200,
        "attacker_id": "eve_replay_node",
    })
    assert rep_resp.status_code == 200
    att_id = rep_resp.json()["attack_id"]

    # 2. Analyze
    det_resp = client.post("/api/detection/analyze", json={
        "signature_id": target_signature,
        "attack_context_id": att_id,
    })
    assert det_resp.status_code == 200
    data = det_resp.json()

    assert data["status"] == "ATTACK"
    assert data["attack_type"] == "REPLAY"
    assert data["threat_score"] == 1.00
    assert any("replayed" in e.lower() or "window" in e.lower() for e in data["evidence"])


def test_detection_channel_manipulation_attack(client: TestClient, target_signature: str):
    """Verify detection of quantum channel depolarization and elevated QBER."""
    # 1. Run Channel Attack
    chan_resp = client.post("/api/attacks/channel-manipulation", json={
        "target_signature_id": target_signature,
        "noise_type": "depolarizing",
        "noise_intensity": 0.70,
    })
    assert chan_resp.status_code == 200
    att_id = chan_resp.json()["attack_id"]

    # 2. Analyze
    det_resp = client.post("/api/detection/analyze", json={
        "signature_id": target_signature,
        "attack_context_id": att_id,
    })
    assert det_resp.status_code == 200
    data = det_resp.json()

    assert data["status"] == "ATTACK"
    assert data["attack_type"] == "CHANNEL_MANIPULATION"
    assert data["threat_score"] >= 0.80
    assert any("channel" in e.lower() or "qber" in e.lower() for e in data["evidence"])


def test_detection_unauthorized_verification(client: TestClient, target_signature: str):
    """Verify detection and rejection of unauthorized verifier entities."""
    det_resp = client.post("/api/detection/analyze", json={
        "signature_id": target_signature,
        "verifier_id": "rogue_spy_verifier_99",
    })
    assert det_resp.status_code == 200
    data = det_resp.json()

    assert data["status"] == "ATTACK"
    assert data["attack_type"] == "UNAUTHORIZED_VERIFICATION"
    assert data["threat_score"] == 1.00
    assert any("authorization" in e.lower() or "whitelist" in e.lower() for e in data["evidence"])


def test_detection_get_analysis_by_id_and_history(client: TestClient, target_signature: str):
    """Verify retrieving specific analysis by ID and listing history from SQLite."""
    # Analyze
    ana_resp = client.post("/api/detection/analyze", json={"signature_id": target_signature})
    assert ana_resp.status_code == 200
    ana_id = ana_resp.json()["analysis_id"]

    # Get by ID
    get_resp = client.get(f"/api/detection/{ana_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["analysis_id"] == ana_id

    # List history
    hist_resp = client.get("/api/detection/history")
    assert hist_resp.status_code == 200
    hist = hist_resp.json()
    assert isinstance(hist, list)
    assert len(hist) >= 1
