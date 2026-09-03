"""Quantum circuit construction for Bell states and fundamental gates."""

from enum import Enum
from typing import Dict, Tuple
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
import qiskit.qasm3 as qasm3


class BellStateType(str, Enum):
    """Canonical Bell state enumeration."""

    PHI_PLUS = "phi_plus"    # |Φ+⟩ = (|00⟩ + |11⟩) / √2
    PHI_MINUS = "phi_minus"  # |Φ-⟩ = (|00⟩ - |11⟩) / √2
    PSI_PLUS = "psi_plus"    # |Ψ+⟩ = (|01⟩ + |10⟩) / √2
    PSI_MINUS = "psi_minus"  # |Ψ-⟩ = (|01⟩ - |10⟩) / √2


BELL_STATE_METADATA: Dict[BellStateType, Dict[str, str]] = {
    BellStateType.PHI_PLUS: {
        "name": "Phi+",
        "symbol": "|Φ+⟩",
        "formula": "(|00⟩ + |11⟩) / √2",
        "description": "Correlated Bell state with positive relative phase",
        "preparation": "H(q0) -> CX(q0, q1)",
    },
    BellStateType.PHI_MINUS: {
        "name": "Phi-",
        "symbol": "|Φ-⟩",
        "formula": "(|00⟩ - |11⟩) / √2",
        "description": "Correlated Bell state with negative relative phase",
        "preparation": "X(q0) -> H(q0) -> CX(q0, q1)",
    },
    BellStateType.PSI_PLUS: {
        "name": "Psi+",
        "symbol": "|Ψ+⟩",
        "formula": "(|01⟩ + |10⟩) / √2",
        "description": "Anti-correlated Bell state with positive relative phase",
        "preparation": "X(q1) -> H(q0) -> CX(q0, q1)",
    },
    BellStateType.PSI_MINUS: {
        "name": "Psi-",
        "symbol": "|Ψ-⟩",
        "formula": "(|01⟩ - |10⟩) / √2",
        "description": "Anti-correlated singlet Bell state with negative relative phase",
        "preparation": "X(q0) -> X(q1) -> H(q0) -> CX(q0, q1)",
    },
}


def create_bell_circuit(
    bell_state: BellStateType = BellStateType.PHI_PLUS,
    measure: bool = True,
) -> Tuple[QuantumCircuit, QuantumRegister, ClassicalRegister]:
    """Create a 2-qubit quantum circuit preparing the specified Bell state.

    Args:
        bell_state: Which of the four canonical Bell states to prepare.
        measure: Whether to append classical measurement operations.

    Returns:
        Tuple of (QuantumCircuit, QuantumRegister, ClassicalRegister)
    """
    qr = QuantumRegister(2, name="q")
    cr = ClassicalRegister(2, name="c")
    qc = QuantumCircuit(qr, cr, name=f"bell_{bell_state.value}")

    # Initial state preparation
    if bell_state == BellStateType.PHI_PLUS:
        # |00> -> H(q0) -> CX(q0, q1) -> (|00> + |11>)/sqrt(2)
        qc.h(qr[0])
        qc.cx(qr[0], qr[1])
    elif bell_state == BellStateType.PHI_MINUS:
        # |10> -> H(q0) -> CX(q0, q1) -> (|00> - |11>)/sqrt(2)
        qc.x(qr[0])
        qc.h(qr[0])
        qc.cx(qr[0], qr[1])
    elif bell_state == BellStateType.PSI_PLUS:
        # |01> -> H(q0) -> CX(q0, q1) -> (|01> + |10>)/sqrt(2)
        qc.x(qr[1])
        qc.h(qr[0])
        qc.cx(qr[0], qr[1])
    elif bell_state == BellStateType.PSI_MINUS:
        # |11> -> H(q0) -> CX(q0, q1) -> (|01> - |10>)/sqrt(2)
        qc.x(qr[0])
        qc.x(qr[1])
        qc.h(qr[0])
        qc.cx(qr[0], qr[1])
    else:
        raise ValueError(f"Unsupported Bell state: {bell_state}")

    if measure:
        qc.barrier()
        qc.measure(qr, cr)

    return qc, qr, cr


def get_circuit_representations(circuit: QuantumCircuit) -> Dict[str, str]:
    """Extract human-readable and standard representations of a quantum circuit."""
    # Text ASCII diagram
    try:
        text_diagram = circuit.draw(output="text").single_string()
    except Exception:
        text_diagram = str(circuit.draw(output="text"))

    # OpenQASM 3 representation
    try:
        qasm_str = qasm3.dumps(circuit)
    except Exception:
        qasm_str = "// OpenQASM export unavailable for current circuit"

    return {
        "text": text_diagram,
        "qasm": qasm_str,
    }
