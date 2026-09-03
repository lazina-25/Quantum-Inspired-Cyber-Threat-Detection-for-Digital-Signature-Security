"""Unit and integration tests for quantum circuit simulation and Bell state API."""

import pytest
from fastapi.testclient import TestClient
from app.quantum.circuits import (
    BellStateType,
    create_bell_circuit,
    get_circuit_representations,
)
from app.quantum.simulator import simulate_bell_circuit
from app.quantum.service import generate_and_simulate_bell_state


def test_bell_circuits_creation():
    """Verify circuit generation and gate properties for all 4 canonical Bell states."""
    for bell_type in BellStateType:
        circuit, qr, cr = create_bell_circuit(bell_state=bell_type, measure=True)
        assert circuit.num_qubits == 2
        assert circuit.num_clbits == 2
        assert len(qr) == 2
        assert len(cr) == 2

        reprs = get_circuit_representations(circuit)
        assert "text" in reprs
        assert "qasm" in reprs
        assert len(reprs["text"]) > 0


def test_bell_simulation_orthogonality():
    """Verify quantum measurement outcomes strictly adhere to entanglement physics."""
    shots = 2000

    # 1. Phi+ (|00> + |11>) -> only 00 and 11 allowed
    res_phi_p = generate_and_simulate_bell_state(BellStateType.PHI_PLUS, shots=shots)
    assert set(res_phi_p["counts"].keys()).issubset({"00", "11"})
    assert res_phi_p["theoretical_probabilities"]["00"] == pytest.approx(0.5, abs=1e-5)
    assert res_phi_p["theoretical_probabilities"]["11"] == pytest.approx(0.5, abs=1e-5)
    assert res_phi_p["theoretical_probabilities"]["01"] == 0.0
    assert res_phi_p["theoretical_probabilities"]["10"] == 0.0

    # 2. Phi- (|00> - |11>) -> only 00 and 11 allowed
    res_phi_m = generate_and_simulate_bell_state(BellStateType.PHI_MINUS, shots=shots)
    assert set(res_phi_m["counts"].keys()).issubset({"00", "11"})
    assert res_phi_m["theoretical_probabilities"]["00"] == pytest.approx(0.5, abs=1e-5)
    assert res_phi_m["theoretical_probabilities"]["11"] == pytest.approx(0.5, abs=1e-5)

    # 3. Psi+ (|01> + |10>) -> only 01 and 10 allowed
    res_psi_p = generate_and_simulate_bell_state(BellStateType.PSI_PLUS, shots=shots)
    assert set(res_psi_p["counts"].keys()).issubset({"01", "10"})
    assert res_psi_p["theoretical_probabilities"]["01"] == pytest.approx(0.5, abs=1e-5)
    assert res_psi_p["theoretical_probabilities"]["10"] == pytest.approx(0.5, abs=1e-5)
    assert res_psi_p["theoretical_probabilities"]["00"] == 0.0
    assert res_psi_p["theoretical_probabilities"]["11"] == 0.0

    # 4. Psi- (|01> - |10>) -> only 01 and 10 allowed
    res_psi_m = generate_and_simulate_bell_state(BellStateType.PSI_MINUS, shots=shots)
    assert set(res_psi_m["counts"].keys()).issubset({"01", "10"})
    assert res_psi_m["theoretical_probabilities"]["01"] == pytest.approx(0.5, abs=1e-5)
    assert res_psi_m["theoretical_probabilities"]["10"] == pytest.approx(0.5, abs=1e-5)


def test_api_post_bell_state_phi_plus(client: TestClient):
    """Test POST /api/quantum/bell-state endpoint for Phi+."""
    payload = {"bell_state": "phi_plus", "shots": 1500}
    response = client.post("/api/quantum/bell-state", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["bell_state"] == "phi_plus"
    assert data["symbol"] == "|Φ+⟩"
    assert data["shots"] == 1500
    assert "circuit_text" in data
    assert "counts" in data
    assert sum(data["counts"].values()) == 1500
    assert set(data["counts"].keys()).issubset({"00", "11"})
    assert len(data["statevector"]) == 4


def test_api_post_all_bell_states(client: TestClient):
    """Verify API correctly processes all 4 Bell states."""
    states = ["phi_plus", "phi_minus", "psi_plus", "psi_minus"]
    for s in states:
        response = client.post("/api/quantum/bell-state", json={"bell_state": s, "shots": 500})
        assert response.status_code == 200
        data = response.json()
        assert data["bell_state"] == s
        assert sum(data["counts"].values()) == 500


def test_api_invalid_bell_state(client: TestClient):
    """Test validation error on non-existent Bell state."""
    response = client.post("/api/quantum/bell-state", json={"bell_state": "non_existent_state", "shots": 1024})
    assert response.status_code == 422


def test_api_invalid_shots(client: TestClient):
    """Test validation errors on invalid shot values (0, negative, or excessive)."""
    # Shots = 0
    resp_zero = client.post("/api/quantum/bell-state", json={"bell_state": "phi_plus", "shots": 0})
    assert resp_zero.status_code == 422

    # Negative shots
    resp_neg = client.post("/api/quantum/bell-state", json={"bell_state": "phi_plus", "shots": -50})
    assert resp_neg.status_code == 422

    # Exceeding limit
    resp_too_large = client.post("/api/quantum/bell-state", json={"bell_state": "phi_plus", "shots": 200000})
    assert resp_too_large.status_code == 422


def test_api_get_bell_states_catalog(client: TestClient):
    """Test GET /api/quantum/bell-states metadata listing."""
    response = client.get("/api/quantum/bell-states")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 4
    ids = {item["id"] for item in data}
    assert ids == {"phi_plus", "phi_minus", "psi_plus", "psi_minus"}
