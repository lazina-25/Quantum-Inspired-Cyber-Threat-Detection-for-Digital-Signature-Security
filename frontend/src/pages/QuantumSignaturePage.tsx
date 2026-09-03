import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  KeyRound,
  FileText,
  ShieldCheck,
  ShieldX,
  History,
  RefreshCw,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Database,
  Send,
  Info
} from 'lucide-react';
import {
  CreateSignatureRequest,
  CreateSignatureResponse,
  VerifySignatureRequest,
  VerifySignatureResponse,
  SignatureListItem,
} from '../types/signature';
import {
  createSignatureApi,
  verifySignatureApi,
  listSignaturesApi,
} from '../services/signatureApi';

type QdsSubTab = 'create' | 'verify' | 'registry';

export const QuantumSignaturePage: React.FC = () => {
  const [subTab, setSubTab] = useState<QdsSubTab>('create');

  // Create state
  const [signerId, setSignerId] = useState<string>('alice_signer_01');
  const [publicIdentity, setPublicIdentity] = useState<string>('Alice (Head of Quantum Finance)');
  const [messageContent, setMessageContent] = useState<string>(
    'CONFIDENTIAL_TX_2026: Authorize transfer of $250,000 USD to Quantum Research Node #4.'
  );
  const [tokenCount, setTokenCount] = useState<number>(4);
  const [nonce, setNonce] = useState<string>(`nonce_${Math.random().toString(36).substring(2, 10)}`);
  const [creating, setCreating] = useState<boolean>(false);
  const [createdSig, setCreatedSig] = useState<CreateSignatureResponse | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Verify state
  const [targetSigId, setTargetSigId] = useState<string>('');
  const [verifyMessage, setVerifyMessage] = useState<string>('');
  const [verifierId, setVerifierId] = useState<string>('bob_verifier_01');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<VerifySignatureResponse | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Registry state
  const [signaturesList, setSignaturesList] = useState<SignatureListItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);

  // UI helpers
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSignatures = async () => {
    setLoadingList(true);
    try {
      const list = await listSignaturesApi();
      setSignaturesList(list);
      if (list.length > 0 && !targetSigId) {
        setTargetSigId(list[0].signature_id);
        setVerifyMessage(list[0].message_preview);
      }
    } catch (err) {
      console.error('Failed to load signatures list', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  const handleCreateSignature = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const payload: CreateSignatureRequest = {
        signer_id: signerId,
        public_identity: publicIdentity,
        message_content: messageContent,
        session_nonce: nonce,
        shots: 1024,
        token_count: tokenCount,
      };
      const resp = await createSignatureApi(payload);
      setCreatedSig(resp.data);
      setTargetSigId(resp.data.signature_id);
      setVerifyMessage(resp.data.message_content);
      fetchSignatures();
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || err.message || 'Signature creation failed');
    } finally {
      setCreating(false);
    }
  };

  const handleVerifySignature = async () => {
    if (!targetSigId) {
      setVerifyError('Please specify a valid Signature ID');
      return;
    }
    setVerifying(true);
    setVerifyError(null);
    try {
      const payload: VerifySignatureRequest = {
        signature_id: targetSigId,
        message_content: verifyMessage,
        verifier_id: verifierId,
      };
      const resp = await verifySignatureApi(payload);
      setVerifyResult(resp.data);
      fetchSignatures();
    } catch (err: any) {
      setVerifyError(err.response?.data?.detail || err.message || 'Signature verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleTamperMessage = () => {
    setVerifyMessage(
      'TAMPERED_TX_2026: Authorize transfer of $9,999,999 USD to Attacker Eve Node.'
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectSignatureForVerification = (sig: SignatureListItem) => {
    setTargetSigId(sig.signature_id);
    setVerifyMessage(sig.message_preview);
    setSubTab('verify');
    setVerifyResult(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-cyan-500/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono mb-3">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Part 4: Teleportation-based QDS Protocol</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Quantum Digital Signature <span className="text-gradient-cyan">(QDS) Protocol</span>
            </h1>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              Generate message-correlated quantum signature state sequences, teleport them across EPR Bell channels, and execute deterministic quantum parity verification with zero AI/ML.
            </p>
          </div>

          {/* Sub-Navigation Pills */}
          <div className="flex rounded-xl bg-slate-900/90 border border-slate-800 p-1.5 text-xs font-mono">
            <button
              onClick={() => setSubTab('create')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
                subTab === 'create'
                  ? 'bg-cyan-950 border border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>1. Sign Message</span>
            </button>
            <button
              onClick={() => setSubTab('verify')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
                subTab === 'verify'
                  ? 'bg-cyan-950 border border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2. Verify Signature</span>
            </button>
            <button
              onClick={() => {
                setSubTab('registry');
                fetchSignatures();
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
                subTab === 'registry'
                  ? 'bg-cyan-950 border border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>3. Registry ({signaturesList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CREATE SIGNATURE (ALICE) */}
      {/* ========================================================================= */}
      {subTab === 'create' && (
        <div className="space-y-6">
          {createError && (
            <div className="rounded-xl bg-rose-950/40 border border-rose-800 p-4 text-rose-200 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form (7 Cols) */}
            <div className="lg:col-span-7 glass-panel rounded-xl p-6 border border-slate-800 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Signer Configuration & Message Payload</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Signer Entity ID:</label>
                  <input
                    type="text"
                    value={signerId}
                    onChange={(e) => setSignerId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Public Display Identity:</label>
                  <input
                    type="text"
                    value={publicIdentity}
                    onChange={(e) => setPublicIdentity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-mono">Message Content to Sign:</label>
                <textarea
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  placeholder="Enter message text..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-400">Session Nonce:</label>
                    <button
                      type="button"
                      onClick={() => setNonce(`nonce_${Math.random().toString(36).substring(2, 10)}`)}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Refresh</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={nonce}
                    onChange={(e) => setNonce(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Teleported Quantum Tokens:</label>
                  <select
                    value={tokenCount}
                    onChange={(e) => setTokenCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={4}>4 Quantum Tokens</option>
                    <option value={6}>6 Quantum Tokens</option>
                    <option value={8}>8 Quantum Tokens</option>
                  </select>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleCreateSignature}
                  disabled={creating || !messageContent.trim()}
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${creating ? 'animate-spin' : ''}`} />
                  <span>{creating ? 'Hashing, Encoding & Teleporting...' : 'Generate & Teleport QDS Signature'}</span>
                </button>
              </div>
            </div>

            {/* Protocol Summary Card (5 Cols) */}
            <div className="lg:col-span-5 glass-panel rounded-xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2 mb-3">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>QDS Signing Mechanics</span>
                </h3>
                <ol className="space-y-3 text-xs text-slate-400 font-mono">
                  <li className="flex items-start space-x-2">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">1</span>
                    <span>Compute SHA-256 digest of original message payload.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">2</span>
                    <span>Derive sequence of quantum signature states (|0⟩, |1⟩, |+⟩, |-⟩).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">3</span>
                    <span>Teleport each token using EPR Bell pairs |Φ+⟩.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">4</span>
                    <span>Transmit classical BSM bits (c0, c1) for Bob's Pauli frame correction.</span>
                  </li>
                </ol>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400">
                <span className="text-cyan-400 block mb-1">Persistence:</span>
                <span>Stored in SQLite (<code className="text-slate-200">quantum_qds.db</code>) via SQLAlchemy ORM.</span>
              </div>
            </div>
          </div>

          {/* Created Signature Details Display */}
          {createdSig && (
            <div className="glass-panel rounded-xl p-6 border border-emerald-800/60 bg-emerald-950/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-900/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Quantum Digital Signature Generated & Teleported</h3>
                    <p className="text-xs text-emerald-400 font-mono">
                      Signature ID: <strong className="text-white">{createdSig.signature_id}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy('sig_id', createdSig.signature_id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 hover:border-cyan-500 flex items-center space-x-1"
                  >
                    {copiedId === 'sig_id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy ID</span>
                  </button>
                  <button
                    onClick={() => {
                      setSubTab('verify');
                      setVerifyResult(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-mono text-white flex items-center space-x-1"
                  >
                    <span>Proceed to Verify</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quantum Tokens Telemetry Table */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3">
                  Teleported Quantum Signature Tokens ({createdSig.quantum_tokens.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                  {createdSig.quantum_tokens.map((token) => (
                    <div key={token.index} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px]">Token #{token.index + 1}</span>
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] font-bold">
                          {token.state_label}
                        </span>
                      </div>
                      <div className="text-slate-300 text-[11px]">
                        <span>Basis: <strong>{token.basis}</strong> (Bit: {token.expected_bit})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <span>Alice BSM: <code className="text-cyan-300">{token.bsm_outcome}</code></span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <span>Pauli Op: <code className="text-emerald-400">{token.pauli_correction}</code></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VERIFY SIGNATURE (BOB) */}
      {/* ========================================================================= */}
      {subTab === 'verify' && (
        <div className="space-y-6">
          {verifyError && (
            <div className="rounded-xl bg-rose-950/40 border border-rose-800 p-4 text-rose-200 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{verifyError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Verification Form (7 Cols) */}
            <div className="lg:col-span-7 glass-panel rounded-xl p-6 border border-slate-800 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Verifier (Bob) Quantum Signature Check</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Target Signature ID:</label>
                  <input
                    type="text"
                    value={targetSigId}
                    onChange={(e) => setTargetSigId(e.target.value)}
                    placeholder="sig_..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Verifier Identity:</label>
                  <input
                    type="text"
                    value={verifierId}
                    onChange={(e) => setVerifierId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-400 font-mono">Received Message Content to Verify:</label>
                  <button
                    type="button"
                    onClick={handleTamperMessage}
                    className="text-[11px] px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900 font-mono transition-all"
                  >
                    Simulate Message Tampering
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={verifyMessage}
                  onChange={(e) => setVerifyMessage(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  placeholder="Paste or edit message text to verify..."
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleVerifySignature}
                  disabled={verifying || !targetSigId.trim() || !verifyMessage.trim()}
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  <ShieldCheck className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
                  <span>{verifying ? 'Applying Pauli Corrections & Projective Verification...' : 'Verify Quantum Signature'}</span>
                </button>
              </div>
            </div>

            {/* Verification Rules Info (5 Cols) */}
            <div className="lg:col-span-5 glass-panel rounded-xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2 mb-3">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Deterministic Decision Rules</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-400 font-mono">
                  <li className="flex items-start space-x-2">
                    <span className="text-cyan-400">•</span>
                    <span>Bob applies conditional Pauli corrections according to Alice's classical bits (c0, c1).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-cyan-400">•</span>
                    <span>Bob measures reconstructed qubits in the expected state bases.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-cyan-400">•</span>
                    <span><strong>QBER Threshold:</strong> Score = 1.0 - QBER. If Score &ge; 0.85 &rarr; <span className="text-emerald-400 font-bold">ACCEPTED</span>.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-cyan-400">•</span>
                    <span>If message modified &rarr; Basis Mismatch &rarr; QBER &approx; 50% &rarr; <span className="text-rose-400 font-bold">REJECTED</span>.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="text-cyan-400 font-semibold block mb-1">Zero AI/ML Rule:</span>
                <span>Deterministic quantum state parity match and statistical QBER bound.</span>
              </div>
            </div>
          </div>

          {/* Verification Verdict Banner & Details */}
          {verifyResult && (
            <div
              className={`glass-panel rounded-xl p-6 border transition-all space-y-6 ${
                verifyResult.verification_status === 'ACCEPTED'
                  ? 'border-emerald-800/80 bg-emerald-950/15'
                  : 'border-rose-800/80 bg-rose-950/15'
              }`}
            >
              {/* Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-xl border ${
                      verifyResult.verification_status === 'ACCEPTED'
                        ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                        : 'bg-rose-950 border-rose-800 text-rose-400'
                    }`}
                  >
                    {verifyResult.verification_status === 'ACCEPTED' ? (
                      <ShieldCheck className="w-8 h-8" />
                    ) : (
                      <ShieldX className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-extrabold text-white">
                        SIGNATURE {verifyResult.verification_status}
                      </h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold ${
                          verifyResult.verification_status === 'ACCEPTED'
                            ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                            : 'bg-rose-950 border-rose-700 text-rose-300'
                        }`}
                      >
                        Score: {(verifyResult.verification_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{verifyResult.decision_reason}</p>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  <div>QBER: <strong className={verifyResult.qber === 0 ? 'text-emerald-400' : 'text-rose-400'}>{(verifyResult.qber * 100).toFixed(1)}%</strong></div>
                  <div>Fidelity: <strong className="text-white">{(verifyResult.fidelity_score * 100).toFixed(1)}%</strong></div>
                  <div>Tampered: <strong className={verifyResult.is_message_tampered ? 'text-rose-400' : 'text-emerald-400'}>{verifyResult.is_message_tampered ? 'YES' : 'NO'}</strong></div>
                </div>
              </div>

              {/* Token-by-Token Verification Breakdown */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3">
                  Token-by-Token Projective Measurement & Pauli Telemetry
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4">Token #</th>
                        <th className="py-2.5 px-4">Expected State</th>
                        <th className="py-2.5 px-4">Measurement Basis</th>
                        <th className="py-2.5 px-4">Pauli Correction</th>
                        <th className="py-2.5 px-4">Measured Bit</th>
                        <th className="py-2.5 px-4">Parity Check</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {verifyResult.token_verifications.map((t) => (
                        <tr key={t.index} className="bg-slate-900/30">
                          <td className="py-2.5 px-4 text-slate-400">Token {t.index + 1}</td>
                          <td className="py-2.5 px-4 font-bold text-cyan-300">{t.expected_state}</td>
                          <td className="py-2.5 px-4">{t.expected_basis}-Basis</td>
                          <td className="py-2.5 px-4 text-emerald-400 font-bold">Pauli {t.pauli_correction_applied}</td>
                          <td className="py-2.5 px-4 text-white font-bold">{t.measured_bit}</td>
                          <td className="py-2.5 px-4">
                            {t.is_match ? (
                              <span className="inline-flex items-center space-x-1 text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                                <span>Match</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-rose-400 font-bold">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Mismatch (Tampered)</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REGISTRY & AUDIT HISTORY */}
      {/* ========================================================================= */}
      {subTab === 'registry' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Persisted Signatures Registry (SQLite)</span>
            </h2>
            <button
              onClick={fetchSignatures}
              disabled={loadingList}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-400 flex items-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
              <span>Refresh Registry</span>
            </button>
          </div>

          {signaturesList.length === 0 ? (
            <div className="glass-panel rounded-xl p-8 text-center border border-slate-800 text-xs font-mono text-slate-400">
              <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>No quantum signatures created yet.</p>
              <button
                onClick={() => setSubTab('create')}
                className="mt-3 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 font-sans font-medium"
              >
                Create First Signature
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Signature ID</th>
                      <th className="py-3 px-4">Signer</th>
                      <th className="py-3 px-4">Message Preview</th>
                      <th className="py-3 px-4">Tokens</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {signaturesList.map((sig) => (
                      <tr key={sig.signature_id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-bold text-cyan-300">
                          {sig.signature_id}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{sig.signer_id}</td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{sig.message_preview}</td>
                        <td className="py-3 px-4 text-slate-300">{sig.token_count} Qubits</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                              sig.last_verification_status === 'ACCEPTED'
                                ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                                : sig.last_verification_status === 'REJECTED'
                                ? 'bg-rose-950 border-rose-800 text-rose-400'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {sig.last_verification_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleSelectSignatureForVerification(sig)}
                            className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-[11px]"
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Educational Callout on QDS Workflow */}
      <div className="glass-panel rounded-xl p-6 border border-cyan-800/30 bg-gradient-to-br from-cyan-950/20 to-transparent">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <h4 className="font-bold text-white text-sm">Understanding the QDS Prototype Workflow</h4>
            <p className="leading-relaxed">
              This simulation represents the full life-cycle of a teleportation-based Quantum Digital Signature protocol:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-2 font-mono text-[11px] text-center">
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-cyan-400 font-bold block">1. Signer Alice</span>
                <span>SHA-256 Digest</span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-cyan-400 font-bold block">2. Quantum Token</span>
                <span>|0⟩, |1⟩, |+⟩, |-⟩</span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-cyan-400 font-bold block">3. Teleportation</span>
                <span>EPR + Alice BSM</span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-cyan-400 font-bold block">4. Verifier Bob</span>
                <span>Pauli Correction</span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-emerald-400 font-bold block">5. Verdict</span>
                <span>QBER &le; 0.15 &rarr; ACCEPT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
