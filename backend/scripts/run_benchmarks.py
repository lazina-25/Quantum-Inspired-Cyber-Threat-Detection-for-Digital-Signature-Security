"""Automated Performance Benchmarking & Statistical Evaluation Script.

Runs multiple empirical trials across legitimate and cyber attack workflows to calculate:
- Signature generation latency
- Quantum state teleportation time
- Verification latency
- Threat detection analysis latency
- Attack detection rate
- False positive rate (FPR)
- False negative rate (FNR)
- Scenario-by-scenario detection performance
"""

import os
import sys
import time
import numpy as np

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.services.qds_service import create_signature_workflow, verify_signature_workflow
from app.attacks.forgery import simulate_forgery_attack
from app.attacks.impersonation import simulate_impersonation_attack
from app.attacks.replay import simulate_replay_attack
from app.attacks.channel_manipulation import simulate_channel_manipulation_attack
from app.attacks.unauthorized_verification import simulate_unauthorized_verification_attack
from app.detection.threat_classifier import classify_threat_scenario


def run_benchmark_trials(num_trials: int = 50):
    """Execute empirical benchmarking trials and compute real statistical metrics."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print(f"================================================================")
    print(f"      SIH 2026 QUANTUM QDS CYBERSECURITY BENCHMARK ENGINE       ")
    print(f"  Executing {num_trials} Empirical Trials per Workflow Scenario  ")
    print(f"================================================================\n")

    sig_times = []
    ver_times = []
    det_legit_times = []
    det_attack_times = []

    # Confusion matrix counters
    true_positives = 0   # Attack correctly detected as ATTACK
    false_positives = 0  # Legitimate incorrectly flagged as ATTACK
    true_negatives = 0   # Legitimate correctly accepted as LEGITIMATE
    false_negatives = 0  # Attack missed and marked as LEGITIMATE

    # Scenario breakdown counters
    scenario_success = {
        "forgery": 0,
        "impersonation": 0,
        "replay": 0,
        "channel_manipulation": 0,
        "unauthorized_verification": 0,
    }

    shots_per_token = 1024
    tokens_per_sig = 4
    total_shots_processed = 0

    for i in range(num_trials):
        # 1. LEGITIMATE TRIAL
        t0 = time.perf_counter()
        sig = create_signature_workflow(
            db=db,
            signer_id=f"alice_bench_{i}",
            public_identity="Alice Quantum Benchmark Node",
            message_content=f"BENCHMARK_PAYLOAD_DOCUMENT_TRIAL_{i:04d}",
            session_nonce=f"nonce_bench_{i:04d}",
            shots=shots_per_token,
            token_count=tokens_per_sig,
        )
        sig_duration = (time.perf_counter() - t0) * 1000
        sig_times.append(sig_duration)
        total_shots_processed += shots_per_token * tokens_per_sig

        t0 = time.perf_counter()
        ver = verify_signature_workflow(
            db=db,
            signature_id=sig["signature_id"],
            test_message_content=f"BENCHMARK_PAYLOAD_DOCUMENT_TRIAL_{i:04d}",
        )
        ver_duration = (time.perf_counter() - t0) * 1000
        ver_times.append(ver_duration)

        t0 = time.perf_counter()
        det_legit = classify_threat_scenario(
            db=db,
            signature_id=sig["signature_id"],
            tested_message=f"BENCHMARK_PAYLOAD_DOCUMENT_TRIAL_{i:04d}",
        )
        det_legit_duration = (time.perf_counter() - t0) * 1000
        det_legit_times.append(det_legit_duration)

        if det_legit.status.value == "LEGITIMATE":
            true_negatives += 1
        else:
            false_positives += 1

        # 2. ATTACK 1: FORGERY
        forg_att = simulate_forgery_attack(
            db=db,
            target_signature_id=sig["signature_id"],
            forged_message=f"FORGED_PAYLOAD_TRIAL_{i:04d}",
        )
        t0 = time.perf_counter()
        det_forg = classify_threat_scenario(
            db=db,
            signature_id=sig["signature_id"],
            tested_message=f"FORGED_PAYLOAD_TRIAL_{i:04d}",
            attack_context_id=forg_att.attack_id,
        )
        det_attack_times.append((time.perf_counter() - t0) * 1000)
        if det_forg.status.value == "ATTACK" and det_forg.attack_type.value == "FORGERY":
            true_positives += 1
            scenario_success["forgery"] += 1
        else:
            false_negatives += 1

        # 3. ATTACK 2: IMPERSONATION
        imp_att = simulate_impersonation_attack(
            db=db,
            target_signature_id=sig["signature_id"],
        )
        det_imp = classify_threat_scenario(
            db=db,
            signature_id=sig["signature_id"],
            attack_context_id=imp_att.attack_id,
        )
        if det_imp.status.value == "ATTACK" and det_imp.attack_type.value == "IMPERSONATION":
            true_positives += 1
            scenario_success["impersonation"] += 1
        else:
            false_negatives += 1

        # 4. ATTACK 3: REPLAY
        rep_att = simulate_replay_attack(
            db=db,
            target_signature_id=sig["signature_id"],
            timestamp_delta_seconds=3600,
        )
        det_rep = classify_threat_scenario(
            db=db,
            signature_id=sig["signature_id"],
            attack_context_id=rep_att.attack_id,
        )
        if det_rep.status.value == "ATTACK" and det_rep.attack_type.value == "REPLAY":
            true_positives += 1
            scenario_success["replay"] += 1
        else:
            false_negatives += 1

        # 5. ATTACK 4: CHANNEL MANIPULATION
        chan_att = simulate_channel_manipulation_attack(
            db=db,
            target_signature_id=sig["signature_id"],
            noise_intensity=0.60,
        )
        det_chan = classify_threat_scenario(
            db=db,
            signature_id=sig["signature_id"],
            attack_context_id=chan_att.attack_id,
        )
        if det_chan.status.value == "ATTACK" and det_chan.attack_type.value == "CHANNEL_MANIPULATION":
            true_positives += 1
            scenario_success["channel_manipulation"] += 1
        else:
            false_negatives += 1

        # 6. ATTACK 5: UNAUTHORIZED VERIFICATION
        unauth_att = simulate_unauthorized_verification_attack(
            db=db,
            target_signature_id=sig["signature_id"],
            unauthorized_verifier_id="rogue_unauth_007",
        )
        det_unauth = classify_threat_scenario(
            db=db,
            signature_id=sig["signature_id"],
            verifier_id="rogue_unauth_007",
            attack_context_id=unauth_att.attack_id,
        )
        if det_unauth.status.value == "ATTACK" and det_unauth.attack_type.value == "UNAUTHORIZED_VERIFICATION":
            true_positives += 1
            scenario_success["unauthorized_verification"] += 1
        else:
            false_negatives += 1

    total_attacks_tested = num_trials * 5
    total_legitimate_tested = num_trials

    detection_rate = (true_positives / total_attacks_tested) * 100.0
    false_positive_rate = (false_positives / total_legitimate_tested) * 100.0
    false_negative_rate = (false_negatives / total_attacks_tested) * 100.0
    overall_accuracy = ((true_positives + true_negatives) / (total_attacks_tested + total_legitimate_tested)) * 100.0

    print("--- EMPIRICAL LATENCY BENCHMARKS (Milliseconds) ---")
    print(f"Signature Generation (EPR + Teleportation):  Mean = {np.mean(sig_times):.2f} ms | Std = {np.std(sig_times):.2f} ms | P95 = {np.percentile(sig_times, 95):.2f} ms")
    print(f"Signature Verification (Pauli + Projective): Mean = {np.mean(ver_times):.2f} ms | Std = {np.std(ver_times):.2f} ms | P95 = {np.percentile(ver_times, 95):.2f} ms")
    print(f"Legitimate Threat Invariant Evaluation:      Mean = {np.mean(det_legit_times):.2f} ms | Std = {np.std(det_legit_times):.2f} ms | P95 = {np.percentile(det_legit_times, 95):.2f} ms")
    print(f"Cyber Attack Classification Latency:         Mean = {np.mean(det_attack_times):.2f} ms | Std = {np.std(det_attack_times):.2f} ms | P95 = {np.percentile(det_attack_times, 95):.2f} ms\n")

    print("--- DETECTION ACCURACY & RELIABILITY METRICS ---")
    print(f"Total Test Cases Evaluated:         {total_attacks_tested + total_legitimate_tested}")
    print(f"Legitimate Verifications:          {total_legitimate_tested}")
    print(f"Simulated Cyber Attacks:            {total_attacks_tested}")
    print(f"Overall Classification Accuracy:    {overall_accuracy:.2f}%")
    print(f"Threat Detection Rate:              {detection_rate:.2f}%")
    print(f"False Positive Rate (FPR):          {false_positive_rate:.2f}%")
    print(f"False Negative Rate (FNR):          {false_negative_rate:.2f}%\n")

    print("--- SCENARIO-BY-SCENARIO DETECTION RATES ---")
    for scen, count in scenario_success.items():
        rate = (count / num_trials) * 100.0
        print(f"  • {scen.upper():<28} Detection Rate: {rate:.1f}% ({count}/{num_trials})")

    print(f"\nTotal Quantum Measurement Shots Processed: {total_shots_processed:,} shots")
    print(f"================================================================\n")


if __name__ == "__main__":
    run_benchmark_trials(num_trials=30)
