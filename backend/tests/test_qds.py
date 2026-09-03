"""Unit and integration tests for Quantum Digital Signature (QDS) protocol and SQLite persistence."""

import pytest
from fastapi.testclient import TestClient


def test_qds_create_signature(client: TestClient):
    """Verify quantum digital signature generation and SQLite database storage."""
    payload = {
        "signer_id": "alice_signer_01",
        "public_identity": "Alice Financial Division",
        "message_content": "AUTHORIZE_TRANSFER_AMOUNT_USD_50000",
        "session_nonce": "nonce_session_8819",
        "shots": 512,
        "token_count": 4,
    }
    response = client.post("/api/signatures/create", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["signer_id"] == "alice_signer_01"
    assert "signature_id" in data
    assert "message_id" in data
    assert "message_hash" in data
    assert len(data["quantum_tokens"]) == 4
    assert data["teleportation_fidelity_avg"] >= 0.99


def test_qds_verify_valid_signature_accepted(client: TestClient):
    """Verify that an untampered message and legitimate signature evaluates to ACCEPTED."""
    # 1. Create Signature
    create_payload = {
        "signer_id": "alice_signer_01",
        "message_content": "VALID_TRANSACTION_PAYLOAD_HASH_001",
        "token_count": 4,
    }
    create_resp = client.post("/api/signatures/create", json=create_payload)
    assert create_resp.status_code == 201
    sig_data = create_resp.json()
    signature_id = sig_data["signature_id"]

    # 2. Verify with matching message
    verify_payload = {
        "signature_id": signature_id,
        "message_content": "VALID_TRANSACTION_PAYLOAD_HASH_001",
        "verifier_id": "bob_verifier_01",
    }
    verify_resp = client.post("/api/signatures/verify", json=verify_payload)
    assert verify_resp.status_code == 200
    ver_data = verify_resp.json()

    assert ver_data["verification_status"] == "ACCEPTED"
    assert ver_data["verification_score"] == 1.0
    assert ver_data["qber"] == 0.0
    assert ver_data["is_message_tampered"] is False
    assert "token_verifications" in ver_data
    assert len(ver_data["token_verifications"]) == 4
    assert all(token["is_match"] for token in ver_data["token_verifications"])


def test_qds_verify_tampered_message_rejected(client: TestClient):
    """Verify that any message modification triggers deterministic QBER detection and REJECTS the signature."""
    # 1. Create Signature for original text
    create_payload = {
        "signer_id": "alice_signer_01",
        "message_content": "PAY_MERCHANT_ALICE_AMOUNT_100",
        "token_count": 6,
    }
    create_resp = client.post("/api/signatures/create", json=create_payload)
    assert create_resp.status_code == 201
    sig_data = create_resp.json()
    signature_id = sig_data["signature_id"]

    # 2. Attacker modifies message content to pay rogue actor
    tampered_payload = {
        "signature_id": signature_id,
        "message_content": "PAY_ATTACKER_EVE_AMOUNT_999999",
        "verifier_id": "bob_verifier_01",
    }
    verify_resp = client.post("/api/signatures/verify", json=tampered_payload)
    assert verify_resp.status_code == 200
    ver_data = verify_resp.json()

    assert ver_data["verification_status"] == "REJECTED"
    assert ver_data["is_message_tampered"] is True
    assert ver_data["qber"] > 0.0
    assert ver_data["verification_score"] < 0.85


def test_qds_get_signature_details(client: TestClient):
    """Verify retrieving full signature record and audit history."""
    # Create signature
    create_resp = client.post("/api/signatures/create", json={
        "signer_id": "alice_signer_01",
        "message_content": "CONFIDENTIAL_DOC_ID_992",
    })
    sig_id = create_resp.json()["signature_id"]

    # Verify once
    client.post("/api/signatures/verify", json={
        "signature_id": sig_id,
        "message_content": "CONFIDENTIAL_DOC_ID_992",
    })

    # Fetch details
    get_resp = client.get(f"/api/signatures/{sig_id}")
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["signature_id"] == sig_id
    assert data["message_content"] == "CONFIDENTIAL_DOC_ID_992"
    assert data["last_verification_status"] == "ACCEPTED"
    assert data["verifications_count"] == 1


def test_qds_invalid_signature_not_found(client: TestClient):
    """Verify 404 response for non-existent signature lookups."""
    resp = client.get("/api/signatures/sig_nonexistent_999")
    assert resp.status_code == 404

    resp_verify = client.post("/api/signatures/verify", json={
        "signature_id": "sig_nonexistent_999",
        "message_content": "SOME_CONTENT",
    })
    assert resp_verify.status_code == 404


def test_qds_list_signatures(client: TestClient):
    """Verify listing all stored signatures."""
    # Create a signature first in the isolated test session
    client.post("/api/signatures/create", json={
        "signer_id": "alice_signer_01",
        "message_content": "DOCUMENT_FOR_LISTING_TEST",
    })

    resp = client.get("/api/signatures")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
