"""Unit and integration tests for Cyber Attack Simulation framework."""

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def target_signature(client: TestClient) -> str:
    """Fixture creating a fresh signature for attack simulation tests."""
    resp = client.post("/api/signatures/create", json={
        "signer_id": "alice_signer_01",
        "message_content": "VALID_DOCUMENT_FOR_ATTACK_TARGETING",
        "token_count": 4,
    })
    assert resp.status_code == 201
    return resp.json()["signature_id"]


def test_attack_forgery_simulation(client: TestClient, target_signature: str):
    """Verify digital signature forgery attack simulation."""
    payload = {
        "target_signature_id": target_signature,
        "forged_message": "ALTERED_FORGED_DOCUMENT_CONTENT",
        "tamper_token_ratio": 1.0,
        "attacker_id": "eve_forger_01",
    }
    resp = client.post("/api/attacks/forge", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["attack_type"] == "forgery"
    assert data["target_signature_id"] == target_signature
    assert data["expected_outcome"] == "REJECTED_FORGERY_DETECTED"
    assert data["statistical_deviation"] > 0.0
    assert "manipulated_tokens" in data["manipulated_data"]


def test_attack_impersonation_simulation(client: TestClient, target_signature: str):
    """Verify signer impersonation attack simulation."""
    payload = {
        "target_signature_id": target_signature,
        "spoofed_signer_id": "alice_signer_01",
        "attacker_id": "mallory_impersonator_99",
    }
    resp = client.post("/api/attacks/impersonate", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["attack_type"] == "impersonation"
    assert data["expected_outcome"] == "REJECTED_IMPERSONATION_DETECTED"
    assert data["manipulated_data"]["key_fingerprint_match"] is False
    assert data["statistical_deviation"] > 0.0


def test_attack_replay_simulation(client: TestClient, target_signature: str):
    """Verify replay attack simulation."""
    payload = {
        "target_signature_id": target_signature,
        "timestamp_delta_seconds": 3600,
        "attacker_id": "eve_replay_node",
    }
    resp = client.post("/api/attacks/replay", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["attack_type"] == "replay"
    assert data["expected_outcome"] == "REJECTED_REPLAY_DETECTED"
    assert data["manipulated_data"]["nonce_is_duplicate"] is True
    assert data["resulting_measurements"]["nonce_collision_detected"] is True


def test_attack_channel_manipulation_simulation(client: TestClient, target_signature: str):
    """Verify quantum channel noise and intercept-resend attack simulation."""
    payload = {
        "target_signature_id": target_signature,
        "noise_type": "depolarizing",
        "noise_intensity": 0.60,
        "attacker_id": "eve_quantum_tapper_04",
    }
    resp = client.post("/api/attacks/channel-manipulation", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["attack_type"] == "channel_manipulation"
    assert data["expected_outcome"] == "REJECTED_CHANNEL_TAMPERED"
    assert "channel_error_count" in data["resulting_measurements"]
    assert data["resulting_measurements"]["threshold_violated"] is True


def test_attack_unauthorized_verification_simulation(client: TestClient, target_signature: str):
    """Verify unauthorized verification attempt simulation."""
    payload = {
        "target_signature_id": target_signature,
        "unauthorized_verifier_id": "rogue_spy_verifier_99",
        "attacker_id": "unauthorized_probe_node",
    }
    resp = client.post("/api/attacks/unauthorized-verification", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["attack_type"] == "unauthorized_verification"
    assert data["expected_outcome"] == "REJECTED_UNAUTHORIZED_ACCESS"
    assert data["resulting_measurements"]["basis_access_allowed"] is False


def test_attack_history_retrieval(client: TestClient, target_signature: str):
    """Verify querying attack history logs from SQLite."""
    # Run an attack first
    client.post("/api/attacks/forge", json={"target_signature_id": target_signature})

    resp = client.get("/api/attacks/history")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "attack_id" in data[0]


def test_attack_nonexistent_signature_error(client: TestClient):
    """Verify 404 error on invalid target signature ID."""
    resp = client.post("/api/attacks/forge", json={"target_signature_id": "sig_nonexistent_000"})
    assert resp.status_code == 404
