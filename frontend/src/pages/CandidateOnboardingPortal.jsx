import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  FileSignature, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import CandidateDocumentChecklist from '../components/onboard/CandidateDocumentChecklist';
import logoImg from '../assets/logo.png';
import './CandidateOnboardingPortal.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default function CandidateOnboardingPortal() {
  const { userId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [offer, setOffer] = useState(null);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [isSigning, setIsSigning] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [agreedConsent, setAgreedConsent] = useState(false);
  const [signSuccessMsg, setSignSuccessMsg] = useState('');
  const [autoActivated, setAutoActivated] = useState(false);

  // Canvas ref for signature pad
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (userId) {
      loadInitialData();
    }
  }, [userId]);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Candidate Offer Details
      const offerRes = await fetch(`${API_URL}/api/candidate/${userId}/offer`);
      const offerData = await offerRes.json();
      if (offerRes.ok && offerData.success) {
        setOffer(offerData.offer);
        setCandidate(offerData.offer.candidate);
      }

      // 2. Fetch Candidate Document Verification Stats
      const docsRes = await fetch(`${API_URL}/api/candidate/${userId}/documents`);
      const docsData = await docsRes.json();
      if (docsRes.ok && docsData.success) {
        setVerifiedCount(docsData.verifiedCount || 0);
        if (docsData.user) {
          setCandidate((prev) => ({ ...prev, ...docsData.user }));
        }
      }
    } catch (err) {
      setError('Connection to onboarding server failed.');
    } finally {
      setLoading(false);
    }
  };

  // Canvas Drawing Handlers
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
    ctx.strokeStyle = '#199580';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    isDrawingRef.current = true;
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
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
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSignContract = async () => {
    if (!hasDrawn) {
      alert('Please draw your digital signature on the canvas pad before committing.');
      return;
    }
    if (!agreedConsent) {
      alert('Please check the terms and bylaws acceptance agreement.');
      return;
    }

    setIsSigning(true);
    try {
      const canvas = canvasRef.current;
      const signatureImage = canvas ? canvas.toDataURL('image/png') : '';

      const res = await fetch(`${API_URL}/api/candidate/${userId}/sign-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureImage })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOffer((prev) => ({
          ...prev,
          status: 'SIGNED',
          signedAt: data.signedAt,
          signatureHash: data.signatureHash
        }));
        setSignSuccessMsg('Appointment offer contract accepted and digitally committed!');
        if (data.autoActivated) {
          setAutoActivated(true);
          setCandidate((prev) => ({ ...prev, status: 'ACTIVE', isEnabled: true }));
        }
      } else {
        alert(data.message || 'Signing failed.');
      }
    } catch (err) {
      alert('Network request to sign contract failed.');
    } finally {
      setIsSigning(false);
    }
  };

  const isOfferSigned = offer?.status === 'SIGNED';
  const isCandidateActive = candidate?.status === 'ACTIVE' && candidate?.isEnabled;
  const isFullyCompliant = verifiedCount === 6 && isOfferSigned;

  if (loading) {
    return (
      <div className="onboard-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(25, 149, 128, 0.3)', borderTopColor: '#199580', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Connecting to Onboarding Compliance Portal...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="onboard-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel-card" style={{ maxWidth: '450px', textAlign: 'center' }}>
          <AlertCircle size={40} style={{ color: '#f87171', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px 0' }}>Portal Access Notice</h3>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 20px 0' }}>
            {error || 'No active onboarding record was located for this credential ID. Please check your invitation link.'}
          </p>
          <Link to="/login" className="btn-commit-sign" style={{ textDecoration: 'none' }}>
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="onboard-page-wrapper">
      <div className="onboard-main-container">
        {/* Top Branding Navigation Bar */}
        <div className="onboard-header-bar">
          <div className="onboard-brand-group">
            <div className="onboard-logo-badge" style={{ background: 'transparent', boxShadow: 'none' }}>
              <img src={logoImg} alt="ELVOORIQ" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <div className="onboard-title-group">
              <h1>
                <span>ELVOORIQ JOINEE PORTAL</span>
                {isCandidateActive || autoActivated ? (
                  <span className="badge-active">
                    <CheckCircle2 size={11} /> Access Unlocked (Active)
                  </span>
                ) : (
                  <span className="badge-pending">
                    <Clock size={11} /> Onboarding Pending
                  </span>
                )}
              </h1>
              <p>
                Welcome, <strong style={{ color: '#f1f5f9' }}>{candidate.fullName || candidate.name}</strong> ({candidate.email})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="onboard-meta-ref">
              <span className="ref-label">SYSTEM REFERENCE</span>
              <span className="ref-val">EVQ-OL-{userId.substring(0, 8).toUpperCase()}</span>
            </div>
            {isCandidateActive && (
              <Link to="/workspace-portal" className="btn-launch-workspace">
                <span>Enter Workspace</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>

        {/* Account Activation Celebration Banner */}
        <AnimatePresence>
          {(isFullyCompliant || isCandidateActive || autoActivated) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="onboard-celebration-banner"
            >
              <div className="celebration-content">
                <div className="celebration-icon-box">
                  <Sparkles size={24} />
                </div>
                <div className="celebration-text">
                  <h3>
                    🎉 Onboarding Complete! System Access Unlocked!
                  </h3>
                  <p>
                    Your appointment contract is digitally executed and all 6 compliance credentials have been approved by HR. You are now active on ELVOORIQ systems.
                  </p>
                </div>
              </div>

              <Link to="/workspace-portal" className="btn-launch-workspace" style={{ background: '#34d399', color: '#030506' }}>
                <span>Launch Employee Workspace</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Two-Column Layout */}
        <div className="onboard-split-layout">
          {/* Column A: Review Appointment Contract */}
          <div className="glass-panel-card">
            <div className="panel-header">
              <h3 className="panel-title">
                <FileText size={18} className="panel-title-icon" />
                Review Your Appointment Contract
              </h3>
              <span className={isOfferSigned ? 'badge-active' : 'badge-pending'}>
                {isOfferSigned ? 'Signed & Committed' : 'Awaiting Signature'}
              </span>
            </div>

            {/* Offer Terms Summary Box */}
            {offer && (
              <div className="terms-summary-box">
                <div className="terms-row">
                  <div className="term-item">
                    <span className="term-label">POSITION DESIGNATION:</span>
                    <span className="term-value">{offer.jobTitle}</span>
                  </div>
                  <div className="term-item">
                    <span className="term-label">AGREEMENT TIER:</span>
                    <span className="term-value highlight">{offer.compensationBasis}</span>
                  </div>
                </div>

                <div className="terms-row">
                  <div className="term-item">
                    <span className="term-label">COMPENSATION AMOUNT:</span>
                    <span className="term-value">
                      {offer.amount > 0 ? `₹${offer.amount.toLocaleString()} / month` : 'Unpaid Training Tier'}
                    </span>
                  </div>
                  <div className="term-item">
                    <span className="term-label">EFFECTIVE START DATE:</span>
                    <span className="term-value">
                      {new Date(offer.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                  <span className="term-label">SCHEDULED PERIOD:</span>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                    {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'Indefinite (Full-Time Permanent)'}
                  </span>
                </div>

                {offer.pdfUrl && (
                  <div style={{ paddingTop: '8px' }}>
                    <a
                      href={`${API_URL}${offer.pdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-download-offer"
                    >
                      <Download size={14} />
                      <span>Download Official Offer Letter (PDF)</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Digital Signature Canvas Section */}
            <div className="signature-section">
              <div className="signature-section-header">
                <label className="signature-label">
                  <FileSignature size={14} style={{ color: '#199580' }} />
                  <span>Draw Your Legal Sign-Off</span>
                </label>
                {!isOfferSigned && hasDrawn && (
                  <button type="button" onClick={clearSignature} className="btn-clear-sig">
                    <RotateCcw size={11} /> Clear
                  </button>
                )}
              </div>

              {isOfferSigned ? (
                <div className="signed-confirmation-card">
                  <div className="signed-status-head">
                    <CheckCircle2 size={16} />
                    <span>Contract Digitally Signed & Committed</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                    Executed On: {offer.signedAt ? new Date(offer.signedAt).toLocaleString() : 'Confirmed'}
                  </p>
                  {offer.signatureHash && (
                    <div className="hash-token-box">
                      CRYPTO HASH: {offer.signatureHash}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="canvas-frame">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="signature-canvas"
                    />
                    {!hasDrawn && (
                      <div className="canvas-placeholder-hint">
                        ✍️ Draw your legal signature on this pad using mouse or touchscreen
                      </div>
                    )}
                  </div>

                  <label className="consent-checkbox-row">
                    <input
                      type="checkbox"
                      checked={agreedConsent}
                      onChange={(e) => setAgreedConsent(e.target.checked)}
                    />
                    <span>
                      I hereby accept and execute the operational appointment terms, compensation tier clauses, and corporate bylaws set forth by ELVOORIQ Creative Agency.
                    </span>
                  </label>

                  <button
                    type="button"
                    disabled={isSigning || !hasDrawn || !agreedConsent}
                    onClick={handleSignContract}
                    className="btn-commit-sign"
                  >
                    {isSigning ? (
                      <>
                        <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <span>Cryptographically Committing Contract...</span>
                      </>
                    ) : (
                      <>
                        <FileSignature size={15} />
                        <span>Sign & Commit Offer Contract</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Column B: Corporate Compliance Vault */}
          <div>
            <CandidateDocumentChecklist 
              userId={userId} 
              onDocumentUpdated={(data) => {
                setVerifiedCount(data.verifiedCount || 0);
                if (data.user?.status === 'ACTIVE') {
                  setCandidate((prev) => ({ ...prev, ...data.user }));
                  setAutoActivated(true);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
