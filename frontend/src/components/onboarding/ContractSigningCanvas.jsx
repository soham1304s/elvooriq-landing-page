import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  Lock,
  CheckCircle2,
  X,
  RotateCcw,
  Download,
  KeyRound,
  FileSignature
} from 'lucide-react';
import axios from 'axios';
import './ContractSigningCanvas.css';

export default function ContractSigningCanvas({ candidate, onClose, onSignedSuccess }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const [signerName, setSignerName] = useState(candidate?.fullName || '');
  const [taxIdNumber, setTaxIdNumber] = useState('PAN-ABCDE1234F');
  const [country, setCountry] = useState(candidate?.country || 'IN');
  const [jobTitle, setJobTitle] = useState('Senior Live Streaming Creator');
  const [baseSalary, setBaseSalary] = useState(50000);
  const [currency, setCurrency] = useState('INR');
  const [agreedConsent, setAgreedConsent] = useState(false);
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signedResult, setSignedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('elvooriq_token') || localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    generateDraft();
  }, [country, baseSalary]);

  const generateDraft = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/legal/generate',
        {
          employeeName: signerName || candidate?.fullName || 'Creator Talent',
          jobTitle,
          baseSalary,
          currency: country === 'US' ? 'USD' : (country === 'EU' ? 'EUR' : 'INR'),
          country,
          signeeEmail: candidate?.email || 'talent@elvooriq.com',
          signeeId: candidate?.id || null
        },
        { headers }
      );
      if (res.data.success) {
        setContractData(res.data.contract);
        setCurrency(res.data.contract.currency);
      }
    } catch (err) {
      console.error('Error generating contract draft:', err);
      setErrorMsg('Failed to initialize contract draft template');
    } finally {
      setLoading(false);
    }
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSignContract = async () => {
    if (!agreedConsent) {
      setErrorMsg('Please accept the statutory electronic signature consent checkbox.');
      return;
    }
    if (!contractData?.id) {
      setErrorMsg('No active contract draft available to sign.');
      return;
    }

    let signatureImage = '';
    if (hasDrawn && canvasRef.current) {
      signatureImage = canvasRef.current.toDataURL('image/png');
    } else {
      // Create a fallback stylized canvas signature from typed name
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.font = 'italic 32px "Brush Script MT", cursive, sans-serif';
      ctx.fillStyle = '#2dd4bf';
      ctx.fillText(signerName || 'Digital Signature', 30, 60);
      signatureImage = canvas.toDataURL('image/png');
    }

    setSigning(true);
    setErrorMsg('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/legal/sign',
        {
          contractId: contractData.id,
          signerName,
          signerId: candidate?.id || null,
          signatureImage,
          taxIdNumber
        },
        { headers }
      );

      if (res.data.success) {
        setSignedResult(res.data.data);
        if (onSignedSuccess) onSignedSuccess(res.data.data);
      }
    } catch (err) {
      console.error('Error signing contract:', err);
      setErrorMsg(err.response?.data?.message || 'Cryptographic signing failed');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="contract-modal-overlay">
      <div className="contract-modal-container">
        {/* Modal Top Bar */}
        <div className="contract-modal-header">
          <div className="modal-header-left">
            <div className="legal-icon-box">
              <FileSignature size={20} />
            </div>
            <div>
              <h3 className="modal-title">DYNAMIC LEGAL CONTRACT & E-SIGNING CANVAS</h3>
              <p className="modal-subtitle">
                Cryptographic SHA-256 Tamper-Evident Signatures with Zero-Trust Field Encryption
              </p>
            </div>
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {signedResult ? (
          /* Success Screen */
          <div className="contract-success-screen">
            <div className="success-badge-pulse">
              <ShieldCheck size={48} className="success-icon" />
            </div>
            <h3 className="success-title">AGREEMENT EXECUTED & ACCOUNT UNLOCKED</h3>
            <p className="success-desc">
              The talent agreement for <strong>{signerName}</strong> has been sealed with an immutable SHA-256 cryptographic checksum.
            </p>

            <div className="checksum-details-card">
              <div className="checksum-row">
                <span className="checksum-label">Contract Reference:</span>
                <span className="checksum-val font-mono">{signedResult.contract?.contractNumber}</span>
              </div>
              <div className="checksum-row">
                <span className="checksum-label">SHA-256 Digest:</span>
                <span className="checksum-val font-mono checksum-highlight">
                  {signedResult.signature?.sha256Checksum}
                </span>
              </div>
              <div className="checksum-row">
                <span className="checksum-label">Tax Form Withholding:</span>
                <span className="checksum-val">
                  {signedResult.contract?.taxForm} ({signedResult.contract?.taxWithholdingPct}%)
                </span>
              </div>
              <div className="checksum-row">
                <span className="checksum-label">Tax ID Encryption:</span>
                <span className="checksum-val badge-encrypted">AES-256-CBC Encrypted & Stored</span>
              </div>
            </div>

            <div className="success-actions">
              <button className="done-btn" onClick={onClose}>
                <CheckCircle2 size={16} />
                <span>Return to Workspace</span>
              </button>
            </div>
          </div>
        ) : (
          /* Dual Pane Signing Workspace */
          <div className="contract-dual-pane">
            {/* Left Pane: Monospace Legal Document */}
            <div className="pane-legal-preview">
              <div className="preview-top-toolbar">
                <span className="doc-id-pill">
                  {contractData?.contractNumber || 'GENERATING REF...'}
                </span>
                <div className="jurisdiction-selects">
                  <label className="input-label-inline">Tax Jurisdiction:</label>
                  <select
                    className="country-select-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="IN">India (Form-16 • 10% TDS)</option>
                    <option value="US">USA (W-9 • 30% IRS)</option>
                    <option value="EU">Europe (W-8BEN • 15% DTAA)</option>
                  </select>
                </div>
              </div>

              <div className="contract-text-scroll">
                {loading ? (
                  <div className="doc-loading">
                    <Lock size={24} className="spin-lock" />
                    <span>Compiling jurisdictional contract clauses...</span>
                  </div>
                ) : (
                  <pre className="contract-raw-text">
                    {contractData?.contractContent}
                  </pre>
                )}
              </div>
            </div>

            {/* Right Pane: Signee Details & Signature Canvas */}
            <div className="pane-signature-canvas">
              <h4 className="section-heading">Signee Identity & Tax Declaration</h4>

              <div className="input-group">
                <label className="field-label">Legal Signee Full Name</label>
                <input
                  type="text"
                  className="legal-text-input"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                />
              </div>

              <div className="input-group">
                <label className="field-label">
                  Taxpayer Identification Number (PAN / SSN)
                  <span className="sub-tag">AES-256 Zero-Trust Encrypted</span>
                </label>
                <input
                  type="text"
                  className="legal-text-input"
                  value={taxIdNumber}
                  onChange={(e) => setTaxIdNumber(e.target.value)}
                  placeholder="e.g. ABCDE1234F"
                />
              </div>

              <div className="canvas-wrapper">
                <div className="canvas-header">
                  <span className="canvas-title">Draw Digital Signature</span>
                  <button
                    className="clear-canvas-btn"
                    onClick={handleClearSignature}
                    type="button"
                  >
                    <RotateCcw size={13} /> Clear
                  </button>
                </div>

                <div className="sig-pad-box">
                  <canvas
                    ref={canvasRef}
                    width={360}
                    height={120}
                    className="sig-canvas-element"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <span className="signature-baseline-guide">SIGN ABOVE THE LINE</span>
                </div>
              </div>

              <label className="consent-checkbox-row">
                <input
                  type="checkbox"
                  checked={agreedConsent}
                  onChange={(e) => setAgreedConsent(e.target.checked)}
                  className="consent-box"
                />
                <span className="consent-text">
                  I agree that this electronic signature has the same legal validity as a handwritten signature under the ESIGN Act and IT Act 2000.
                </span>
              </label>

              {errorMsg && <div className="contract-error-banner">{errorMsg}</div>}

              <button
                className="execute-sign-btn"
                onClick={handleSignContract}
                disabled={signing || !agreedConsent}
              >
                <Lock size={16} />
                <span>{signing ? 'Cryptographically Sealing...' : 'Cryptographically Sign & Execute'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
