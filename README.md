# Quantum-Inspired Cyber Threat Detection for Digital Signature Security (SIH 2026)

[![Python 3.13](https://img.shields.io/badge/python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.133.0-009688.svg)](https://fastapi.tiangolo.com/)
[![Qiskit](https://img.shields.io/badge/Qiskit-2.5.0-6929C4.svg)](https://qiskit.org/)
[![React 18](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Smart India Hackathon 2026 Prototype**  
> A deterministic, quantum-inspired cyber threat detection and verification platform for teleportation-based Quantum Digital Signature (QDS) protocols. **Strictly zero AI/ML.**

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [System Architecture](#3-system-architecture)
4. [Key Features](#4-key-features)
5. [Technology Stack](#5-technology-stack)
6. [Installation & Prerequisites](#6-installation--prerequisites)
7. [Backend Setup](#7-backend-setup)
8. [Frontend Setup](#8-frontend-setup)
9. [Running the Project](#9-running-the-project)
10. [Complete REST API Documentation](#10-complete-rest-api-documentation)
11. [Quantum Physics Architecture](#11-quantum-physics-architecture)
12. [QDS Workflow & Pauli Frame Corrections](#12-qds-workflow--pauli-frame-corrections)
13. [Cyber Attack Simulation Suite (5 Vectors)](#13-cyber-attack-simulation-suite-5-vectors)
14. [Threat Detection Methodology (Zero AI/ML)](#14-threat-detection-methodology-zero-aiml)
15. [Mathematical & Statistical Formulations](#15-mathematical--statistical-formulations)
16. [Physical Threshold Calibration](#16-physical-threshold-calibration)
17. [Formal Security Analysis & Threat Model](#17-formal-security-analysis--threat-model)
18. [Empirical Performance & Benchmark Evaluation](#18-empirical-performance--benchmark-evaluation)
19. [Limitations & Assumptions](#19-limitations--assumptions)
20. [Future Scope & Production Roadmap](#20-future-scope--production-roadmap)

---

## 1. Project Overview
This project presents an end-to-end software simulation and security monitoring framework for **Quantum Digital Signatures (QDS)** founded on 3-qubit quantum teleportation, Bell-state entanglement, conditional Pauli corrections ($I, X, Z, XZ$), and projective measurements. 

Unlike conventional heuristics that rely on opaque machine learning classifiers or neural networks, our **Threat Detection Engine is 100% deterministic and physics-driven**. It directly evaluates quantum invariant violations, Total Variation Distance ($D_{\text{TV}}$), Bhattacharyya state fidelity ($F$), Quantum Bit Error Rate ($\text{QBER}$), and binomial quantum no-cloning bounds to detect and neutralize cyber threats with **100.0% accuracy** and **0.0% false alarms**.

---

## 2. Problem Statement
**Title**: *"Quantum-Inspired Cyber Threat Detection for Digital Signature Security"* (SIH 2026)

**Mandate**:
- Simulate Bell-state entanglement and 3-qubit quantum state teleportation.
- Apply conditional Pauli frame corrections at the receiver.
- Execute projective measurements for signature verification.
- Detect 5 core cyber attack vectors:
  1. Digital Signature Forgery (Message & token tampering)
  2. Signer Impersonation (Key spoofing & seed fabrication)
  3. Replay Attacks (Session nonce reuse & timestamp drift)
  4. Quantum Channel Manipulation (Depolarizing noise & intercept-resend)
  5. Unauthorized Verification (Rogue verifiers & basis snooping)
- **Prohibit AI/ML classifiers** in favor of deterministic mathematical rules and statistical distance bounds.
- Deliver an executive, responsive cybersecurity dashboard with real-time telemetry.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             REACT FRONTEND (Vite + TS)                      │
│   Dashboard │ Quantum Lab │ Signatures │ Attack Sim │ Detection │ Analytics │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / JSON
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            FASTAPI BACKEND ENGINE                           │
│  ┌────────────────────────┐ ┌────────────────────────┐ ┌──────────────────┐ │
│  │   Quantum Simulation   │ │     QDS Protocol       │ │  Attack Suite    │ │
│  │  (Bell States + BSM)   │ │  (Teleport + Pauli)    │ │   (5 Vectors)    │ │
│  └───────────┬────────────┘ └───────────┬────────────┘ └────────┬─────────┘ │
│              │                          │                       │           │
│              └──────────────────────────┼───────────────────────┘           │
│                                         ▼                                   │
│                        ┌─────────────────────────────────┐                  │
│                        │ Threat Detection Engine         │                  │
│                        │ • Total Variation Distance (D_TV)│                 │
│                        │ • Bhattacharyya Fidelity (F)    │                  │
│                        │ • Parity Delta & QBER           │                  │
│                        │ • No-Cloning Binomial Bound     │                  │
│                        └────────────────┬────────────────┘                  │
│                                         ▼                                   │
│                               SQLite Storage Layer                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Features
- **Quantum Entanglement Generator**: Full analytical preparation and circuit synthesis of all four standard Bell states ($|\Phi^+\rangle, |\Phi^-\rangle, |\Psi^+\rangle, |\Psi^-\rangle$).
- **3-Qubit Quantum Teleportation**: Alice-Bob Bell-state distribution, Bell-State Measurement (BSM), and dynamic Pauli corrections ($I, X, Z, XZ$).
- **Deterministic QDS Protocol**: Cryptographic message digest binding to sequences of quantum signature tokens ($|\psi_k\rangle$).
- **Cyber Attack Simulation Suite**: Configurable adversaries capable of payload tampering, key spoofing, non-monotonic replay, channel depolarizing noise, and unauthorized basis snooping.
- **Explainable Physics Detection Engine**: Transparent, numbered audit reasoning detailing the exact quantum invariants violated.
- **Judge Demo Mode**: Single-click automated 7-step orchestrated demonstration walking evaluators through the complete lifecycle in $<50\text{ ms}$.

---

## 5. Technology Stack
- **Quantum Simulation**: Qiskit 2.5.0 (`qiskit.circuit`, `qiskit.quantum_info.Statevector`, `qiskit_aer`)
- **Backend API**: Python 3.13, FastAPI 0.133.0, Uvicorn, Pydantic v2
- **Database**: SQLite 3 with SQLAlchemy 2.0 ORM
- **Scientific Computing**: NumPy 2.4.2, SciPy 1.17.1
- **Testing**: Pytest 9.1.1 (42/42 automated tests)
- **Frontend UI**: React 18.3.1, TypeScript 5.6.2, Vite 6.4.3, Tailwind CSS, Lucide React, Recharts 2.15.4

---

## 6. Installation & Prerequisites
Ensure you have the following installed on your system:
- **Python 3.11+** (Python 3.13 recommended)
- **Node.js 18+** and **npm**
- **Git**

```bash
git clone https://github.com/your-org/quantum-qds-threat-detection.git
cd quantum-qds-threat-detection
```

---

## 7. Backend Setup

```bash
cd backend

# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run automated test suite (42 tests)
pytest -v
```

---

## 8. Frontend Setup

```bash
cd ../frontend

# 1. Install Node packages
npm install

# 2. Build production bundle to verify types
npm run build
```

---

## 9. Running the Project

### Option A: Running Development Servers

**Terminal 1 (Backend API):**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Swagger Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

**Terminal 2 (Frontend UI):**
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 10. Complete REST API Documentation

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/health` | System health, database connection, and Qiskit probes |
| **Quantum** | `POST` | `/api/quantum/bell-state` | Synthesizes Bell states ($|\Phi^{\pm}\rangle, |\Psi^{\pm}\rangle$), OpenQASM 3, and statevectors |
| **Quantum** | `POST` | `/api/quantum/teleport` | Executes 3-qubit teleportation circuit with conditional Pauli frame corrections |
| **Signatures** | `POST` | `/api/signatures/create` | Signs message digest, prepares tokens, and teleports quantum signature |
| **Signatures** | `POST` | `/api/signatures/verify` | Bob applies Pauli corrections and projective verification measurements |
| **Signatures** | `GET` | `/api/signatures/{id}` | Retrieves signature metadata, teleportation telemetry, and tokens |
| **Attacks** | `POST` | `/api/attacks/forge` | Simulates message digest and quantum token tampering |
| **Attacks** | `POST` | `/api/attacks/impersonate` | Simulates key spoofing and unauthorized basis preparation |
| **Attacks** | `POST` | `/api/attacks/replay` | Simulates stale session nonce reuse and timestamp drift |
| **Attacks** | `POST` | `/api/attacks/channel-manipulation` | Injects depolarizing noise, bit flips, and phase damping |
| **Attacks** | `POST` | `/api/attacks/unauthorized-verification` | Tests access control against unregistered verifiers |
| **Detection** | `POST` | `/api/detection/analyze` | Evaluates $D_{\text{TV}}$, Fidelity, $\text{QBER}$, and determines deterministic threat classification |
| **Detection** | `GET` | `/api/detection/history` | Retrieves stored threat analysis audit reports |
| **Analytics** | `GET` | `/api/analytics/summary` | Computes real-time KPI aggregates, vector distributions, and event stream |
| **Demo** | `POST` | `/api/demo/run` | Executes single-click 7-step Judge Security Demo workflow |

---

## 11. Quantum Physics Architecture

### A. Bell-State Entanglement
The four maximally entangled 2-qubit Bell states are generated via Hadamard ($H$) and Controlled-NOT ($\text{CNOT}$) gates:
- $|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}} = \text{CNOT}(H \otimes I)|00\rangle$
- $|\Phi^-\rangle = \frac{|00\rangle - |11\rangle}{\sqrt{2}} = \text{CNOT}(H \otimes I)|10\rangle$
- $|\Psi^+\rangle = \frac{|01\rangle + |10\rangle}{\sqrt{2}} = \text{CNOT}(H \otimes I)|01\rangle$
- $|\Psi^-\rangle = \frac{|01\rangle - |10\rangle}{\sqrt{2}} = \text{CNOT}(H \otimes I)|11\rangle$

### B. 3-Qubit Quantum Teleportation
1. **Entangled Pair Distribution**: Resource pair qubits $q_1, q_2$ initialized in $|\Phi^+\rangle$. Alice holds $q_1$, Bob holds $q_2$.
2. **State Preparation**: Alice prepares arbitrary state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ on qubit $q_0$.
3. **Bell-State Measurement (BSM)**: Alice applies $\text{CNOT}(q_0 \to q_1)$ followed by $H(q_0)$, measuring $q_0, q_1$ into classical bits $c_0, c_1$.
4. **Pauli Frame Correction**: Bob applies unitary operator $U(c_0, c_1) = X^{c_1} Z^{c_0}$ to $q_2$, recovering state $|\psi\rangle$ with exact theoretical fidelity $F = 1.000$.

---

## 12. QDS Workflow & Pauli Frame Corrections

```
Alice (Signer)                                                Bob (Verifier)
──────────────                                                ──────────────
1. Compute SHA-256(M) ──┐
2. Seed material k      ├─► Prepare tokens |ψ_k⟩
3. Entangle Bell pairs ─── (EPR Channel: q1, q2) ────────────► Receives q2
4. Alice BSM(q0, q1) ────► Transmit classical bits (c0, c1) ─► Bob applies X^c1 Z^c0
                                                               Bob measures in basis B_k
                                                               Compares parity & outcomes
                                                               Verification Score ≥ 0.85 ──► ACCEPTED
```

---

## 13. Cyber Attack Simulation Suite (5 Vectors)

1. **Digital Signature Forgery**: Alteration of message text $M \to M'$. Because the quantum token sequence $|\psi_k\rangle$ is tied to SHA-256($M$), testing against $M'$ projects qubits into incompatible measurement bases, forcing $\text{QBER} \to 100\%$ and $D_{\text{TV}} \to 1.000$.
2. **Signer Impersonation**: Attacker Mallory attempts to generate signatures for Alice without her secret key seed. The absence of synchronized bases results in asymmetric EPR parity collapse ($\Delta_{\text{parity}} > 0.100$).
3. **Replay Attacks**: Attacker captures legitimate $(M, \text{Sig})$ and replays it in a subsequent session. Flagged immediately by non-monotonic session nonce collision and timestamp drift ($\Delta t > 300\text{ s}$).
4. **Quantum Channel Manipulation**: Eavesdropper Eve applies depolarizing noise or intercept-resend measurements along the EPR link. State overlap fidelity collapses ($F < 0.850$) and $\text{QBER}$ spikes beyond physical channel noise limits ($> 15\%$).
5. **Unauthorized Verification**: Rogue verifier attempts to query and measure quantum tokens without cryptographic authorization. Access to measurement bases is denied by access control invariant policies.

---

## 14. Threat Detection Methodology (Zero AI/ML)

The threat detection engine uses **strictly deterministic quantum physics rules and probability metrics**:

```
                              Projective Measurement Counts
                                            ↓
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
    Statistical Metrics Engine                                Physical Invariant Rules
    • Total Variation Distance (D_TV)                         • Authorized Verifier Whitelist
    • Bhattacharyya State Fidelity (F)                        • Temporal Session Window (300s)
    • Binomial QBER & Parity Delta                            • Message Hash Digest Match
    • Binomial No-Cloning Bound P_forge                       • Channel Noise Ceiling (15%)
               └────────────────────────────┬────────────────────────────┘
                                            ▼
                        Deterministic Threat Classification
           ┌────────────────────────────────┬────────────────────────────────┐
           ▼                                ▼                                ▼
    [LEGITIMATE]                       [ATTACK]                        [SUSPICIOUS]
     Score ≤ 0.20                    Score ≥ 0.85                     0.60 ≤ Score < 0.85
     ACCEPTED                  CLASSIFIED & NEUTRALIZED                AUDIT FLAGGED
```

---

## 15. Mathematical & Statistical Formulations

### A. Total Variation Distance ($D_{\text{TV}}$)
Measures the maximum difference in probability that observed outcome distribution $P$ deviates from expected distribution $Q$:
$$D_{\text{TV}}(P, Q) = \frac{1}{2} \sum_{x \in \Omega} |P(x) - Q(x)|$$
- Legitimate: $D_{\text{TV}} \approx 0.000$ (Statistical sampling noise $\le 0.120$)
- Tampered / Forged: $D_{\text{TV}} \to 1.000$

### B. Bhattacharyya Quantum State Fidelity ($F$)
Quantifies the statistical overlap between reconstructed and theoretical quantum states:
$$F(P, Q) = \sum_{x \in \Omega} \sqrt{P(x) \cdot Q(x)}$$
- Unperturbed Teleportation: $F = 1.000$ (Threshold $F_{\min} = 0.850$)
- Eavesdropped Channel: $F \le 0.707$

### C. Quantum Bit Error Rate ($\text{QBER}$)
$$\text{QBER} = \frac{\text{Number of Measurement Basis Mismatches}}{\text{Total Teleported Tokens}}$$

### D. Binomial Quantum No-Cloning Forgery Bound
By the Wootters-Zurek Quantum No-Cloning Theorem, an adversary without the secret basis sequence cannot clone unknown quantum tokens. The theoretical upper bound for successfully guessing $L$ single-qubit states is:
$$P_{\text{forge}} \le \left(\frac{3}{4}\right)^L$$
For $L=4$, $P_{\text{forge}} \le 31.64\%$; for $L=32$, $P_{\text{forge}} \le 1.00 \times 10^{-4}$.

---

## 16. Physical Threshold Calibration

| Threshold Parameter | Calibrated Value | Rationale |
| :--- | :--- | :--- |
| `QBER_MAX_THRESHOLD` | `0.15` ($15\%$) | Standard optical quantum channel noise floor ($< 11\%$). Eavesdropping forces $\text{QBER} \ge 25\%$. |
| `TVD_MAX_THRESHOLD` | `0.12` | $4\sigma$ statistical confidence interval under $N=1024$ measurement shots. |
| `FIDELITY_MIN_THRESHOLD` | `0.85` ($85\%$) | Required state fidelity to guarantee quantum state preservation. |
| `REPLAY_MAX_TIMESTAMP_DELTA` | `300s` ($5\text{ min}$) | Cryptographic nonce validity lease time. |
| `PARITY_TOLERANCE_THRESHOLD` | `0.10` | Maximum allowable asymmetry in EPR joint parity. |

---

## 17. Formal Security Analysis & Threat Model

### Threat Model & Assumptions
- **Adversary Model**: Computationally unbounded adversary (Eve) with quantum eavesdropping capabilities, intercept-resend hardware, and arbitrary classical message alteration capabilities.
- **Physical Assumptions**: Authenticated classical channel for BSM bit exchange; standard fiber / free-space quantum channels for EPR distribution.
- **Why Attacks are Physically Detectable**:
  - **No-Cloning**: Eve cannot measure and re-transmit non-orthogonal quantum states without introducing a minimum theoretical disturbance ($\text{QBER} \ge 25\%$).
  - **Entanglement Monogamy**: Eve cannot entangle herself with the EPR pair without diminishing Alice-Bob correlation fidelity ($F < 0.850$).
  - **Digest State Invariant**: Any change in $M$ alters the deterministic state seed $k = H(M)$, causing Bob's projective measurement to evaluate in the wrong Pauli basis.

---

## 18. Empirical Performance & Benchmark Evaluation

Results collected from automated benchmark trials ($N=180$ test cases, $122,880$ quantum measurement shots):

```
================================================================
--- EMPIRICAL LATENCY BENCHMARKS (Milliseconds) ---
Signature Generation (EPR + Teleportation):  Mean = 7.92 ms | P95 = 8.53 ms
Signature Verification (Pauli + Projective): Mean = 1.62 ms | P95 = 1.85 ms
Threat Detection Analysis Latency:           Mean = 1.15 ms | P95 = 1.49 ms
Total End-to-End Evaluation Time:            < 12.0 ms

--- DETECTION ACCURACY & RELIABILITY METRICS ---
Total Test Cases Evaluated:         180
Legitimate Verifications:          30
Simulated Cyber Attacks:            150
Overall Classification Accuracy:    100.00%
Threat Detection Rate:              100.00%
False Positive Rate (FPR):          0.00%
False Negative Rate (FNR):          0.00%

--- SCENARIO-BY-SCENARIO DETECTION RATES ---
  • FORGERY                      Detection Rate: 100.0% (30/30)
  • IMPERSONATION                Detection Rate: 100.0% (30/30)
  • REPLAY                       Detection Rate: 100.0% (30/30)
  • CHANNEL_MANIPULATION         Detection Rate: 100.0% (30/30)
  • UNAUTHORIZED_VERIFICATION    Detection Rate: 100.0% (30/30)
================================================================
```

---

## 19. Limitations & Assumptions
- **Quantum Hardware Simulation**: Quantum circuits are simulated using Qiskit Statevector and Aer backends on classical CPU architecture.
- **Token Length Scaling**: Prototype defaults to $L=4$ tokens per signature for responsive real-time UI execution. Production QDS deployments scale to $L=256$ tokens.
- **Physical Channel Impairments**: Channel noise simulation models depolarizing and dephasing channels; physical hardware deployment requires active phase and polarization stabilization.

---

## 20. Future Scope & Production Roadmap
1. **Physical QPU Deployment**: Direct integration with IBM Quantum cloud backends via `qiskit-ibm-runtime`.
2. **Post-Quantum Cryptographic Hybrids**: Combining QDS token teleportation with NIST-standardized Post-Quantum algorithms (ML-KEM / Dilithium).
3. **Decoy-State QDS Integration**: Implementing decoy-state protocols to counter photon-number-splitting (PNS) attacks over long-distance optical fiber lines.
4. **Hardware Security Module (HSM) Integration**: Hardware-rooted key generation and Pauli frame correction modules.

---

## License
MIT License. Developed for Smart India Hackathon (SIH) 2026.
