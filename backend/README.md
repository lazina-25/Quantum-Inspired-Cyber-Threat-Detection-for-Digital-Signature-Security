# Quantum QDS Threat Detection - Backend Service

FastAPI-powered asynchronous backend providing simulation APIs, deterministic threat analysis, database persistence, and security verification.

---

## Directory Structure

- `app/`
  - `config/`: Application settings, environment variable parsing via Pydantic Settings.
  - `api/`: REST routing layer (v1 endpoints).
  - `database/`: SQLAlchemy engine, session management, and base models.
  - `models/`: Database entities (Signatures, Verification Sessions, Threat Events).
  - `schemas/`: Pydantic request and response contracts.
  - `services/`: Business workflows and protocol orchestrators.
  - `quantum/`: Qiskit quantum circuit generators, Bell-state entanglement, and teleportation simulators *(Part 2)*.
  - `detection/`: Deterministic threat detection engines (no AI/ML) *(Part 3)*.
  - `attacks/`: Adversary attack models & quantum channel noise simulation *(Part 4)*.
  - `utils/`: Mathematical and statistical utilities (Fidelity, QBER, Fisher Information).
  - `main.py`: FastAPI application entrypoint with middleware and lifecycle management.
- `tests/`: Automated unit & integration tests using `pytest`.

---

## Setup & Execution

### 1. Environment Setup
```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### 2. Running the Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. API Endpoints
- **Health Check**: `GET /api/health`
- **Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

### 4. Running Tests
```bash
pytest -v
```
