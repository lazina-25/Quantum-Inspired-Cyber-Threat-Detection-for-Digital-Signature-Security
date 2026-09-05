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
  ChevronDown,
  ChevronUp,
  HelpCircle
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

  // Expandable sections for technical details
  const [showQuantumDetails, setShowQuantumDetails] = useState<boolean>(false);
  const [showMeasurementResults, setShowMeasurementResults] = useState<boolean>(false);
  const [showVerificationAnalysis, setShowVerificationAnalysis] = useState<boolean>(false);

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
      setVerifyError('Please select or enter a valid Signature ID');
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
      'TAMPERED_TX_PAYLOAD: Divert transfer to Attacker Eve Node #99.'
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
      {/* Page Header */}
      <div className="rounded-2xl bg-white p-6 sm:p-8 border border-[#EAEAEA] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-200 text-charcoal text-xs font-semibold mb-3">
              <KeyRound className="w-3.5 h-3.5 text-yellow-800" />
              <span>Quantum Digital Signature Protocol</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
              Create & Verify Digital Signatures
            </h1>
            <p className="mt-2 text-charcoal-500 text-sm leading-relaxed">
              Generate message-correlated quantum signature states, teleport them across EPR channels, and verify signature authenticity using quantum state verification and corrections.
            </p>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex rounded-xl bg-surface p-1 text-xs font-medium border border-[#EAEAEA]">
            <button
              onClick={() => setSubTab('create')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                subTab === 'create'
                  ? 'bg-yellow-400 text-charcoal font-bold shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>1. Create Signature</span>
            </button>
            <button
              onClick={() => setSubTab('verify')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                subTab === 'verify'
                  ? 'bg-yellow-400 text-charcoal font-bold shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal'
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
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                subTab === 'registry'
                  ? 'bg-yellow-400 text-charcoal font-bold shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>3. Registry ({signaturesList.length})</span>
            </button>
          </div>
        </div>

        {/* 4-Step Workflow Visual Progress Bar */}
        <div className="mt-8 pt-6 border-t border-[#EAEAEA] grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className={`p-3 rounded-xl border flex items-center space-x-2.5 ${subTab === 'create' && !createdSig ? 'bg-yellow-100 border-yellow-300 text-charcoal font-bold' : 'bg-surface border-[#EAEAEA] text-charcoal-500'}`}>
            <span className="w-6 h-6 rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center font-bold text-[11px] text-charcoal">1</span>
            <span>Create Message</span>
          </div>
          <div className={`p-3 rounded-xl border flex items-center space-x-2.5 ${createdSig ? 'bg-green-50 border-green-200 text-success font-bold' : 'bg-surface border-[#EAEAEA] text-charcoal-500'}`}>
            <span className="w-6 h-6 rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center font-bold text-[11px] text-success">2</span>
            <span>Generate Signature</span>
          </div>
          <div className={`p-3 rounded-xl border flex items-center space-x-2.5 ${subTab === 'verify' && !verifyResult ? 'bg-yellow-100 border-yellow-300 text-charcoal font-bold' : 'bg-surface border-[#EAEAEA] text-charcoal-500'}`}>
            <span className="w-6 h-6 rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center font-bold text-[11px] text-charcoal">3</span>
            <span>Verify Signature</span>
          </div>
          <div className={`p-3 rounded-xl border flex items-center space-x-2.5 ${verifyResult ? (verifyResult.verification_status === 'ACCEPTED' ? 'bg-green-50 border-green-200 text-success font-bold' : 'bg-red-50 border-red-200 text-danger font-bold') : 'bg-surface border-[#EAEAEA] text-charcoal-500'}`}>
            <span className="w-6 h-6 rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center font-bold text-[11px] text-charcoal">4</span>
            <span>View Result</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CREATE SIGNATURE (STEPS 1 & 2) */}
      {/* ========================================================================= */}
      {subTab === 'create' && (
        <div className="space-y-6">
          {createError && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-danger text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAEAEA]">
                <h2 className="text-sm font-bold text-charcoal flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-yellow-600" />
                  <span>Create Digital Signature</span>
                </h2>
                <span className="text-[11px] text-charcoal-400">Step 1</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-charcoal font-medium block mb-1">Signer:</label>
                  <input
                    type="text"
                    value={signerId}
                    onChange={(e) => setSignerId(e.target.value)}
                    className="w-full bg-surface border border-[#EAEAEA] rounded-xl px-3 py-2 text-charcoal font-mono text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="text-charcoal font-medium block mb-1">Signer Display Name:</label>
                  <input
                    type="text"
                    value={publicIdentity}
                    onChange={(e) => setPublicIdentity(e.target.value)}
                    className="w-full bg-surface border border-[#EAEAEA] rounded-xl px-3 py-2 text-charcoal text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-charcoal font-medium block mb-1">Message:</label>
                <textarea
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full bg-surface border border-[#EAEAEA] rounded-xl p-3 text-xs text-charcoal font-mono focus:outline-none focus:border-yellow-400"
                  placeholder="Enter message text to be signed..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-charcoal font-medium flex items-center space-x-1">
                      <span>Session Nonce:</span>
                      <span title="Cryptographic freshness nonce to prevent replay attacks" className="text-charcoal-400 cursor-help">
                        <HelpCircle className="w-3 h-3" />
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setNonce(`nonce_${Math.random().toString(36).substring(2, 10)}`)}
                      className="text-[11px] text-charcoal hover:underline flex items-center space-x-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={nonce}
                    onChange={(e) => setNonce(e.target.value)}
                    className="w-full bg-surface border border-[#EAEAEA] rounded-xl px-3 py-2 text-charcoal font-mono text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="text-charcoal font-medium block mb-1 flex items-center space-x-1">
                    <span>Quantum Tokens (Qubits):</span>
                    <span title="Number of entangled EPR pairs teleported for this signature" className="text-charcoal-400 cursor-help">
                      <HelpCircle className="w-3 h-3" />
                    </span>
                  </label>
                  <select
                    value={tokenCount}
                    onChange={(e) => setTokenCount(Number(e.target.value))}
                    className="w-full bg-surface border border-[#EAEAEA] rounded-xl px-3 py-2 text-charcoal text-xs focus:outline-none focus:border-yellow-400"
                  >
                    <option value={4}>4 Quantum Tokens (High Speed)</option>
                    <option value={6}>6 Quantum Tokens (Balanced)</option>
                    <option value={8}>8 Quantum Tokens (Maximum Security)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCreateSignature}
                  disabled={creating || !messageContent.trim()}
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-charcoal font-bold text-sm shadow-xs transition-all disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 text-charcoal ${creating ? 'animate-spin' : ''}`} />
                  <span>{creating ? 'Creating Signature...' : 'Create Signature'}</span>
                </button>
              </div>
            </div>

            {/* Protocol Explanation (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-charcoal flex items-center space-x-2 mb-3">
                  <Lock className="w-4 h-4 text-yellow-600" />
                  <span>How Signature Generation Works</span>
                </h3>
                <ol className="space-y-2.5 text-xs text-charcoal-600 list-decimal list-inside leading-relaxed">
                  <li>
                    <strong className="text-charcoal">Digest Generation:</strong> SHA-256 hash of the message is computed and partitioned into cryptographic bit sequences.
                  </li>
                  <li>
                    <strong className="text-charcoal">Quantum Token Preparation:</strong> Each bit is mapped to conjugate bases (Z-basis &#123;|0⟩, |1⟩&#125; or X-basis &#123;|+⟩, |-⟩&#125;).
                  </li>
                  <li>
                    <strong className="text-charcoal">Bell State Teleportation:</strong> Entangled EPR Bell pairs |Φ⁺⟩ are distributed between Alice and Bob.
                  </li>
                  <li>
                    <strong className="text-charcoal">Bell Measurement:</strong> Alice measures her qubits and broadcasts classical bits for reconstruction.
                  </li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] text-xs text-charcoal-600 space-y-1">
                <span className="font-bold text-charcoal block">Deterministic Verification:</span>
                <span>Unlike classical RSA/ECDSA, quantum digital signatures guarantee security through physics invariants that cannot be cloned without detection.</span>
              </div>
            </div>
          </div>

          {/* Generated Signature Result Card */}
          {createdSig && (
            <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-green-50 border border-green-200 text-success">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-charcoal">Signature Created &#10003;</h3>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-green-50 border border-green-200 text-success font-semibold font-mono">
                        {createdSig.quantum_tokens.length} Qubits Teleported
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Signature ID: <code className="text-charcoal font-bold font-mono">{createdSig.signature_id}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy('sig-id', createdSig.signature_id)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-[#EAEAEA] hover:bg-yellow-50 text-charcoal text-xs font-medium transition-colors"
                  >
                    {copiedId === 'sig-id' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'sig-id' ? 'Copied' : 'Copy ID'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setTargetSigId(createdSig.signature_id);
                      setVerifyMessage(createdSig.message_content);
                      setSubTab('verify');
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-charcoal font-bold text-xs transition-colors shadow-xs"
                  >
                    <span>Proceed to Verify</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Technical Details Toggle */}
              <div>
                <button
                  onClick={() => setShowQuantumDetails(!showQuantumDetails)}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-charcoal hover:text-yellow-700"
                >
                  <span>{showQuantumDetails ? 'Hide Quantum Details' : 'View Quantum Details (Qubit Tokens & Quantum Corrections)'}</span>
                  {showQuantumDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showQuantumDetails && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                    {createdSig.quantum_tokens.map((token) => (
                      <div key={token.index} className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] space-y-1">
                        <div className="flex justify-between items-center text-charcoal-500 text-[11px]">
                          <span className="font-bold text-charcoal">Token #{token.index + 1}</span>
                          <span className="text-yellow-800 font-bold">{token.state_label}</span>
                        </div>
                        <div className="text-[11px] text-charcoal font-sans">
                          Basis: <strong>{token.basis}</strong> (Bit: {token.expected_bit})
                        </div>
                        <div className="text-[11px] text-charcoal-500">
                          Measurement: <code className="text-charcoal font-bold">{token.bsm_outcome}</code>
                        </div>
                        <div className="text-[11px] text-charcoal-500">
                          Correction: <code className="text-success font-bold">{token.pauli_correction}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VERIFY SIGNATURE (STEPS 3 & 4) */}
      {/* ========================================================================= */}
      {subTab === 'verify' && (
        <div className="space-y-6">
          {verifyError && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-danger text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
              <span>{verifyError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Verification Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAEAEA]">
                <h2 className="text-sm font-bold text-charcoal flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-yellow-600" />
                  <span>Verify Signature</span>
                </h2>
                <span className="text-[11px] text-charcoal-400">Step 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-charcoal font-medium block mb-1">Target Signature ID:</label>
                  <input
                    type="text"
                    value={targetSigId}
                    onChange={(e) => setTargetSigId(e.target.value)}
                    placeholder="Enter or select Signature ID..."
                    className="w-full bg-surface border border-[#EAEAEA] rounded-xl px-3 py-2 text-charcoal font-mono text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="text-charcoal font-medium block mb-1">Verifier Identity:</label>
                  <input
                    type="text"
                    value={verifierId}
                    onChange={(e) => setVerifierId(e.target.value)}
                    className="w-full bg-surface border border-[#EAEAEA] rounded-xl px-3 py-2 text-charcoal text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-charcoal font-medium">Received Message Content to Verify:</label>
                  <button
                    type="button"
                    onClick={handleTamperMessage}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-danger hover:bg-red-100 font-medium transition-colors"
                  >
                    Simulate Tampering Test
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={verifyMessage}
                  onChange={(e) => setVerifyMessage(e.target.value)}
                  className="w-full bg-surface border border-[#EAEAEA] rounded-xl p-3 text-xs text-charcoal font-mono focus:outline-none focus:border-yellow-400"
                  placeholder="Paste or edit message text to verify..."
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleVerifySignature}
                  disabled={verifying || !targetSigId.trim() || !verifyMessage.trim()}
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-charcoal font-bold text-sm shadow-xs transition-all disabled:opacity-50"
                >
                  <ShieldCheck className={`w-4 h-4 text-charcoal ${verifying ? 'animate-spin' : ''}`} />
                  <span>{verifying ? 'Verifying Signature...' : 'Verify'}</span>
                </button>
              </div>
            </div>

            {/* Verification Rules (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-charcoal flex items-center space-x-2 mb-3">
                  <Lock className="w-4 h-4 text-yellow-600" />
                  <span>Deterministic Verification Rules</span>
                </h3>
                <ul className="space-y-2 text-xs text-charcoal-600 leading-relaxed">
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-600 font-bold">&bull;</span>
                    <span>Bob applies conditional quantum corrections (X, Z, XZ, or Identity) matching Alice's measurement.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-600 font-bold">&bull;</span>
                    <span>Bob verifies the received quantum states against expected message-derived basis states.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-600 font-bold">&bull;</span>
                    <span><strong>Error Threshold:</strong> If Score &ge; 85% &rarr; <span className="text-success font-bold">Signature Valid</span>.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-600 font-bold">&bull;</span>
                    <span>If payload was altered &rarr; Basis Mismatch &rarr; Error Rate &approx; 50%&ndash;100% &rarr; <span className="text-danger font-bold">Signature Verification Failed</span>.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-[#EAEAEA] text-xs text-charcoal-600">
                <span className="font-bold text-charcoal block mb-0.5">Tamper Proof:</span>
                <span>By the quantum no-cloning theorem, any eavesdropping or state substitution introduces observable disturbance.</span>
              </div>
            </div>
          </div>

          {/* Verification Verdict Card (Step 4: View Result) */}
          {verifyResult && (
            <div
              className={`rounded-2xl p-6 border transition-all space-y-6 shadow-sm ${
                verifyResult.verification_status === 'ACCEPTED'
                  ? 'border-green-200 bg-white'
                  : 'border-red-200 bg-white'
              }`}
            >
              {/* Status Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-2xl border ${
                      verifyResult.verification_status === 'ACCEPTED'
                        ? 'bg-green-50 border-green-200 text-success'
                        : 'bg-red-50 border-red-200 text-danger'
                    }`}
                  >
                    {verifyResult.verification_status === 'ACCEPTED' ? (
                      <ShieldCheck className="w-7 h-7" />
                    ) : (
                      <ShieldX className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-charcoal">
                        {verifyResult.verification_status === 'ACCEPTED'
                          ? 'Signature Valid ✓'
                          : 'Signature Verification Failed'}
                      </h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold font-mono ${
                          verifyResult.verification_status === 'ACCEPTED'
                            ? 'bg-green-50 border-green-200 text-success'
                            : 'bg-red-50 border-red-200 text-danger'
                        }`}
                      >
                        Score: {(verifyResult.verification_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 mt-0.5">{verifyResult.decision_reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-charcoal-600">
                  <div className="p-2 rounded-xl bg-surface border border-[#EAEAEA] text-center min-w-[90px]">
                    <span className="text-[10px] text-charcoal-400 block uppercase font-sans">Error Rate</span>
                    <strong className={verifyResult.qber === 0 ? 'text-success' : 'text-danger'}>
                      {(verifyResult.qber * 100).toFixed(1)}%
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-surface border border-[#EAEAEA] text-center min-w-[90px]">
                    <span className="text-[10px] text-charcoal-400 block uppercase font-sans">Fidelity</span>
                    <strong className="text-charcoal">{(verifyResult.fidelity_score * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-surface border border-[#EAEAEA] text-center min-w-[90px]">
                    <span className="text-[10px] text-charcoal-400 block uppercase font-sans">Tampered</span>
                    <strong className={verifyResult.is_message_tampered ? 'text-danger' : 'text-success'}>
                      {verifyResult.is_message_tampered ? 'YES' : 'NO'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Expandable Technical Sections */}
              <div className="space-y-3">
                <div className="border border-[#EAEAEA] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowMeasurementResults(!showMeasurementResults)}
                    className="w-full px-4 py-3 bg-surface hover:bg-yellow-50 flex items-center justify-between text-xs font-bold text-charcoal transition-colors"
                  >
                    <span>View Measurement Results</span>
                    {showMeasurementResults ? <ChevronUp className="w-4 h-4 text-charcoal-500" /> : <ChevronDown className="w-4 h-4 text-charcoal-500" />}
                  </button>

                  {showMeasurementResults && (
                    <div className="p-4 overflow-x-auto bg-white">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-surface text-charcoal-500 uppercase tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3">Token #</th>
                            <th className="py-2.5 px-3">Expected State</th>
                            <th className="py-2.5 px-3">Measurement Basis</th>
                            <th className="py-2.5 px-3">Quantum Correction</th>
                            <th className="py-2.5 px-3">Measured Bit</th>
                            <th className="py-2.5 px-3">Parity Check</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAEAEA]">
                          {verifyResult.token_verifications.map((t) => (
                            <tr key={t.index}>
                              <td className="py-2.5 px-3 text-charcoal-500">Token {t.index + 1}</td>
                              <td className="py-2.5 px-3 font-bold text-charcoal">{t.expected_state}</td>
                              <td className="py-2.5 px-3 text-charcoal-700">{t.expected_basis}-Basis</td>
                              <td className="py-2.5 px-3 text-success font-medium">Correction {t.pauli_correction_applied}</td>
                              <td className="py-2.5 px-3 text-charcoal font-bold">{t.measured_bit}</td>
                              <td className="py-2.5 px-3">
                                {t.is_match ? (
                                  <span className="inline-flex items-center space-x-1 text-success font-medium">
                                    <Check className="w-3.5 h-3.5 text-success" />
                                    <span>Match</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 text-danger font-bold">
                                    <XCircle className="w-3.5 h-3.5 text-danger" />
                                    <span>Mismatch (Tampered)</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="border border-[#EAEAEA] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowVerificationAnalysis(!showVerificationAnalysis)}
                    className="w-full px-4 py-3 bg-surface hover:bg-yellow-50 flex items-center justify-between text-xs font-bold text-charcoal transition-colors"
                  >
                    <span>View Verification Analysis</span>
                    {showVerificationAnalysis ? <ChevronUp className="w-4 h-4 text-charcoal-500" /> : <ChevronDown className="w-4 h-4 text-charcoal-500" />}
                  </button>

                  {showVerificationAnalysis && (
                    <div className="p-4 text-xs text-charcoal-600 space-y-2 bg-white">
                      <p>
                        <strong className="text-charcoal">Physical Verification Verdict:</strong> {verifyResult.decision_reason}
                      </p>
                      <p>
                        <strong className="text-charcoal">Quantum State Fidelity:</strong> State overlap fidelity is {(verifyResult.fidelity_score * 100).toFixed(1)}%, compared against the minimum threshold of 85.0%.
                      </p>
                      <p>
                        <strong className="text-charcoal">Error Rate:</strong> Measured at {(verifyResult.qber * 100).toFixed(1)}%. Error rate values above 15% indicate tampering, channel disturbance, or basis mismatch.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REGISTRY */}
      {/* ========================================================================= */}
      {subTab === 'registry' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-charcoal flex items-center space-x-2">
                <Database className="w-4 h-4 text-yellow-600" />
                <span>Persisted Signatures Registry</span>
              </h2>
              <p className="text-xs text-charcoal-500">All registered quantum digital signatures stored in backend database</p>
            </div>
            <button
              onClick={fetchSignatures}
              disabled={loadingList}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#EAEAEA] hover:border-yellow-400 hover:bg-yellow-50 text-xs text-charcoal flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin text-charcoal' : ''}`} />
              <span>Refresh Registry</span>
            </button>
          </div>

          {signaturesList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EAEAEA] p-10 text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-charcoal flex items-center justify-center mx-auto mb-3">
                <FileCheck2 className="w-6 h-6 text-yellow-800" />
              </div>
              <h3 className="font-bold text-charcoal text-sm">No signatures created yet</h3>
              <p className="text-xs text-charcoal-500 max-w-md mx-auto mt-1">
                Create your first quantum digital signature to get started.
              </p>
              <button
                onClick={() => setSubTab('create')}
                className="mt-4 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-charcoal font-bold text-xs transition-colors shadow-xs"
              >
                Create First Signature
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-surface text-charcoal-500 uppercase tracking-wider font-semibold border-b border-[#EAEAEA]">
                    <tr>
                      <th className="py-3 px-4">Signature ID</th>
                      <th className="py-3 px-4">Signer</th>
                      <th className="py-3 px-4">Message Preview</th>
                      <th className="py-3 px-4">Tokens</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA]">
                    {signaturesList.map((sig) => (
                      <tr key={sig.signature_id} className="hover:bg-yellow-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-charcoal">
                          {sig.signature_id}
                        </td>
                        <td className="py-3 px-4 text-charcoal-700 font-mono">{sig.signer_id}</td>
                        <td className="py-3 px-4 text-charcoal-600 max-w-xs truncate font-mono text-[11px]">{sig.message_preview}</td>
                        <td className="py-3 px-4 text-charcoal-700">{sig.token_count} Qubits</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${
                              sig.last_verification_status === 'ACCEPTED'
                                ? 'bg-green-50 border-green-200 text-success'
                                : sig.last_verification_status === 'REJECTED'
                                ? 'bg-red-50 border-red-200 text-danger'
                                : 'bg-surface border-[#EAEAEA] text-charcoal-500'
                            }`}
                          >
                            {sig.last_verification_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleSelectSignatureForVerification(sig)}
                            className="px-3 py-1 rounded-lg bg-surface hover:bg-yellow-400 border border-[#EAEAEA] hover:border-yellow-400 text-charcoal font-bold text-xs transition-colors"
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
    </div>
  );
};
