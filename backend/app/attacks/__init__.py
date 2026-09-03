"""Attack simulation package.

Provides modular simulation modules for 5 core quantum & cyber threat vectors:
1. Forgery (Message tampering & state substitution)
2. Impersonation (Rogue signer spoofing)
3. Replay Attacks (Session nonce reuse)
4. Quantum Channel Manipulation (Depolarizing noise & intercept-resend)
5. Unauthorized Verification (Unregistered verifier access)
"""

from app.attacks.base import AttackType, AttackScenarioResult
from app.attacks.forgery import simulate_forgery_attack
from app.attacks.impersonation import simulate_impersonation_attack
from app.attacks.replay import simulate_replay_attack
from app.attacks.channel_manipulation import simulate_channel_manipulation_attack
from app.attacks.unauthorized_verification import simulate_unauthorized_verification_attack

__all__ = [
    "AttackType",
    "AttackScenarioResult",
    "simulate_forgery_attack",
    "simulate_impersonation_attack",
    "simulate_replay_attack",
    "simulate_channel_manipulation_attack",
    "simulate_unauthorized_verification_attack",
]
