"""Unit and integration tests for quantum teleportation and Pauli corrections."""

import math
import pytest
from fastapi.testclient import TestClient
from app.quantum.teleportation import (
    InputStateType,
    VerificationBasis,
    simulate_teleportation,
    build_teleportation_circuit,
)


def test_teleportation_circuit_construction():
    """Verify 3-qubit circuit structure, registers, and gate composition."""
    qc = build_teleportation_circuit(InputStateType.PLUS, math.pi / 2, 0.0)
    assert qc.num_qubits == 3
    assert qc.num_clbits == 3
    # Check ASCII draw
    assert len(str(qc.draw(output="text"))) > 0


def test_teleport_zero_state():
    """Verify |0⟩ state teleportation with 100% fidelity and 100% 0 outcomes in Z basis."""
    res = simulate_teleportation(InputStateType.ZERO, shots=2000, verification_basis=VerificationBasis.Z_BASIS)
    assert res.fidelity == pytest.approx(1.0, abs=1e-5)
    assert res.is_successful is True
    assert res.receiver_counts["0"] == 2000
    assert res.receiver_counts["1"] == 0
    assert sum(res.pauli_corrections_applied.values()) == 2000


def test_teleport_one_state():
    """Verify |1⟩ state teleportation with 100% fidelity and 100% 1 outcomes in Z basis."""
    res = simulate_teleportation(InputStateType.ONE, shots=2000, verification_basis=VerificationBasis.Z_BASIS)
    assert res.fidelity == pytest.approx(1.0, abs=1e-5)
    assert res.is_successful is True
    assert res.receiver_counts["1"] == 2000
    assert res.receiver_counts["0"] == 0


def test_teleport_plus_state():
    """Verify |+⟩ state teleportation with 100% fidelity and 100% 0 outcomes in X basis."""
    res = simulate_teleportation(InputStateType.PLUS, shots=2000, verification_basis=VerificationBasis.X_BASIS)
    assert res.fidelity == pytest.approx(1.0, abs=1e-5)
    assert res.is_successful is True
    assert res.receiver_counts["0"] == 2000
    assert res.receiver_counts["1"] == 0


def test_teleport_minus_state():
    """Verify |-⟩ state teleportation with 100% fidelity and 100% 1 outcomes in X basis."""
    res = simulate_teleportation(InputStateType.MINUS, shots=2000, verification_basis=VerificationBasis.X_BASIS)
    assert res.fidelity == pytest.approx(1.0, abs=1e-5)
    assert res.is_successful is True
    assert res.receiver_counts["1"] == 2000
    assert res.receiver_counts["0"] == 0


def test_teleport_custom_bloch_state():
    """Verify arbitrary custom state teleportation on the Bloch sphere."""
    theta = math.pi / 3  # 60 deg
    phi = math.pi / 4    # 45 deg
    res = simulate_teleportation(
        InputStateType.CUSTOM,
        theta=theta,
        phi=phi,
        shots=1500,
        verification_basis=VerificationBasis.Z_BASIS,
    )
    assert res.fidelity == pytest.approx(1.0, abs=1e-5)
    assert res.is_successful is True
    assert sum(res.receiver_counts.values()) == 1500


def test_pauli_corrections_distribution():
    """Verify that all 4 BSM branches (00->I, 01->X, 10->Z, 11->XZ) trigger with proper sum."""
    res = simulate_teleportation(InputStateType.PLUS, shots=4000)
    pauli = res.pauli_corrections_applied
    assert set(pauli.keys()) == {"I", "X", "Z", "XZ"}
    assert sum(pauli.values()) == 4000
    # Each branch is approximately 25% (with binomial statistical tolerance)
    for op in ["I", "X", "Z", "XZ"]:
        assert 600 < pauli[op] < 1400


def test_api_post_teleport_endpoint(client: TestClient):
    """Test POST /api/quantum/teleport endpoint."""
    payload = {
        "input_state": "plus",
        "shots": 1000,
        "verification_basis": "auto",
    }
    response = client.post("/api/quantum/teleport", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["input_state"] == "plus"
    assert data["fidelity"] == 1.0
    assert data["is_successful"] is True
    assert "circuit_text" in data
    assert "bell_measurement_counts" in data
    assert "pauli_corrections_applied" in data
    assert sum(data["pauli_corrections_applied"].values()) == 1000


def test_api_post_teleport_custom(client: TestClient):
    """Test POST /api/quantum/teleport for custom Bloch parameters."""
    payload = {
        "input_state": "custom",
        "theta": 1.25,
        "phi": 0.5,
        "shots": 500,
    }
    response = client.post("/api/quantum/teleport", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["input_state"] == "custom"
    assert data["fidelity"] == 1.0


def test_api_post_teleport_invalid_inputs(client: TestClient):
    """Test parameter validation on teleportation API."""
    # Invalid shots
    r1 = client.post("/api/quantum/teleport", json={"input_state": "zero", "shots": 0})
    assert r1.status_code == 422

    # Invalid theta (> pi)
    r2 = client.post("/api/quantum/teleport", json={"input_state": "custom", "theta": 4.5, "shots": 100})
    assert r2.status_code == 422

    # Invalid state enum
    r3 = client.post("/api/quantum/teleport", json={"input_state": "unknown_state", "shots": 100})
    assert r3.status_code == 422
