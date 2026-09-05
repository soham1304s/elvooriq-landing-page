import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Award,
  Sparkles,
  Search
} from 'lucide-react';
import './ComplianceAuditor.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const REQUIRED_DOCS_SCHEMA = [
  { type: 'ID_PROOF', label: 'Government ID Card', desc: 'PAN Card, SSN, Passport or National ID' },
  { type: 'DEGREE_CERTIFICATE', label: 'Academic Degree Cert', desc: 'Highest educational certificate or transcript' },
  { type: 'EXPERIENCE_LETTER', label: 'Experience Proof', desc: 'Relieving letter or latest salary pay slip' },
  { type: 'BANK_PROOF', label: 'Bank Payroll Proof', desc: 'Passbook or voided cheque for payroll sync' },
  { type: 'NDA', label: 'Signed NDA Form', desc: 'Executed Non-Disclosure & IP Assignment' },
  { type: 'TAX_FORM', label: 'Withholding Tax Declaration', desc: 'Form 12BB (India) or W-4 / W-8BEN' }
];

export default function ComplianceAuditor({ refreshSignal }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCandidateId, setExpandedCandidateId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModalData, setRejectModalData] = useState(null);
  const [autoActivatedUser, setAutoActivatedUser] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, [refreshSignal]);

  const fetchCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('elvooriq_token') || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/hr/onboarding/candidates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCandidates(data.candidates || []);
      } else {
        setError(data.message || 'Failed to load candidates for compliance auditing.');
      }
    } catch (err) {
      setError('Connection to compliance services timed out.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, documentType, status, rejectionReason = '') => {
    setActionLoading(`${userId}-${documentType}`);
    try {
      const token = localStorage.getItem('elvooriq_token') || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/hr/onboarding/${userId}/verify-document`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ documentType, status, rejectionReason })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.autoActivated) {
          const candidateObj = candidates.find(c => c.id === userId);
          setAutoActivatedUser(candidateObj?.fullName || candidateObj?.name || 'Candidate');
        }
        await fetchCandidates();
      } else {
        alert(data.message || 'Verification update failed.');
      }
    } catch (err) {
      alert('Network request to update verification status failed.');
    } finally {
      setActionLoading(null);
      setRejectModalData(null);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    const name = (c.fullName || c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const job = (c.offerLetter?.jobTitle || '').toLowerCase();
    return name.includes(q) || email.includes(q) || job.includes(q);
  });

  return (
    <div className="ca-container">
      {/* Header */}
      <div className="ca-header">
        <div>
          <h3 className="ca-title">
            <ShieldCheck size={22} className="ca-title-icon" />
            Administrative Auditing Zone: Compliance Vault
          </h3>
          <p className="ca-desc">
            Review new hire onboarding documents, approve or reject background credentials, and monitor auto-activation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name / role..."
              className="ca-search-input"
            />
          </div>
          <button
            onClick={fetchCandidates}
            disabled={loading}
            style={{ padding: '8px 12px', background: '#030506', border: '1px solid #1e293b', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Auto-Activation Alert Banner */}
      <AnimatePresence>
        {autoActivatedUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ marginBottom: '20px', padding: '16px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(25, 149, 128, 0.2), rgba(16, 185, 129, 0.15))', border: '1px solid rgba(25, 149, 128, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(25, 149, 128, 0.25)', border: '1px solid #199580', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5eead4' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                  🎉 Candidate Automatically Activated!
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: '#99f6e4' }}>
                  <strong>{autoActivatedUser}</strong> has completed all 6 compliance validations and digitally signed the offer letter. Account is now <strong>ACTIVE</strong> with login access enabled.
                </p>
              </div>
            </div>
            <button
              onClick={() => setAutoActivatedUser(null)}
              style={{ padding: '6px 14px', background: '#090d0f', border: '1px solid #1e293b', color: '#94a3b8', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div style={{ padding: '12px 16px', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '8px', color: '#f87171', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Candidates List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#64748b' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid rgba(25, 149, 128, 0.3)', borderTopColor: '#199580', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.78rem' }}>Loading compliance audit rosters...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 16px', border: '1px dashed #1e293b', borderRadius: '12px' }}>
          <FileText size={32} style={{ margin: '0 auto 8px', color: '#475569' }} />
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#cbd5e1', margin: '0 0 4px 0' }}>No Onboarding Candidates Found</h4>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Use the Offer Letter Generator above to issue dynamic appointment offers.</p>
        </div>
      ) : (
        <div className="ca-candidates-list">
          {filteredCandidates.map((candidate) => {
            const isExpanded = expandedCandidateId === candidate.id;
            const docMap = {};
            (candidate.complianceDocs || []).forEach(d => {
              docMap[d.documentType] = d;
            });

            const verifiedCount = candidate.verifiedCount || 0;
            const isOfferSigned = candidate.offerLetter?.status === 'SIGNED';
            const isAccountActive = candidate.status === 'ACTIVE' && candidate.isEnabled;

            return (
              <div
                key={candidate.id}
                className={`ca-candidate-card ${isExpanded ? 'expanded' : ''}`}
              >
                {/* Candidate Summary Header */}
                <div
                  onClick={() => setExpandedCandidateId(isExpanded ? null : candidate.id)}
                  className="ca-card-summary"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="ca-avatar-badge">
                      {(candidate.fullName || candidate.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="ca-cand-meta">
                      <h4>
                        <span>{candidate.fullName || candidate.name}</span>
                        {isAccountActive ? (
                          <span className="ca-status-pill active">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        ) : (
                          <span className="ca-status-pill pending">
                            <Clock size={10} /> Onboarding Pending
                          </span>
                        )}
                      </h4>
                      <p>
                        <span>{candidate.email}</span>
                        {candidate.offerLetter?.jobTitle && (
                          <span style={{ color: '#199580', fontWeight: 600 }}> • {candidate.offerLetter.jobTitle}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Verification Status Metrics */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Vault:</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, fontFamily: 'monospace', padding: '2px 8px', borderRadius: '4px', background: verifiedCount === 6 ? 'rgba(16, 185, 129, 0.15)' : '#1e293b', color: verifiedCount === 6 ? '#34d399' : '#cbd5e1' }}>
                          {verifiedCount}/6 Verified
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Offer:</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isOfferSigned ? '#34d399' : '#fbbf24' }}>
                          {isOfferSigned ? '✓ Digitally Signed' : 'Awaiting Sign'}
                        </span>
                      </div>
                    </div>

                    <div style={{ color: '#94a3b8', padding: '6px', borderRadius: '6px', background: '#090d0f', border: '1px solid #1e293b' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Document Audit Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ca-expanded-content"
                    >
                      {/* Offer Letter Overview */}
                      {candidate.offerLetter && (
                        <div style={{ padding: '14px 18px', background: '#030506', border: '1px solid #1e293b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={15} style={{ color: '#199580' }} />
                              <strong style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Appointment Offer Letter</strong>
                              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, background: isOfferSigned ? 'rgba(16, 185, 129, 0.2)' : '#1e293b', color: isOfferSigned ? '#34d399' : '#94a3b8' }}>
                                {candidate.offerLetter.status}
                              </span>
                            </div>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                              Tier: <strong style={{ color: '#f1f5f9' }}>{candidate.offerLetter.compensationBasis}</strong> • 
                              Amount: <strong style={{ color: '#f1f5f9' }}>₹{candidate.offerLetter.amount?.toLocaleString()}</strong> • 
                              Start: <strong style={{ color: '#f1f5f9' }}>{new Date(candidate.offerLetter.startDate).toLocaleDateString()}</strong>
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {candidate.offerLetter.pdfUrl && (
                              <a
                                href={`${API_URL}${candidate.offerLetter.pdfUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#1e293b', color: '#f1f5f9', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none' }}
                              >
                                <ExternalLink size={12} /> View Offer PDF
                              </a>
                            )}
                            <a
                              href={`/onboard/${candidate.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(25, 149, 128, 0.15)', border: '1px solid rgba(25, 149, 128, 0.4)', color: '#199580', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none' }}
                            >
                              Open Portal Link
                            </a>
                          </div>
                        </div>
                      )}

                      {/* 6 Required Compliance Documents Checklist */}
                      <div>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={14} style={{ color: '#199580' }} />
                          6-Point Compliance Document Audit & Verification
                        </h5>

                        <div className="ca-docs-grid">
                          {REQUIRED_DOCS_SCHEMA.map((docSchema) => {
                            const doc = docMap[docSchema.type];
                            const status = doc?.status || 'PENDING_UPLOAD';
                            const loadingKey = `${candidate.id}-${docSchema.type}`;
                            const isThisLoading = actionLoading === loadingKey;

                            return (
                              <div key={docSchema.type} className="ca-doc-card">
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                    <div>
                                      <h6 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>{docSchema.label}</h6>
                                      <p style={{ margin: '2px 0 0 0', fontSize: '0.68rem', color: '#64748b' }}>{docSchema.desc}</p>
                                    </div>
                                    <span
                                      style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        padding: '2px 8px',
                                        borderRadius: '9999px',
                                        background: status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.2)' : status === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' : status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : '#0d1113',
                                        color: status === 'VERIFIED' ? '#34d399' : status === 'PENDING' ? '#fbbf24' : status === 'REJECTED' ? '#f87171' : '#64748b',
                                        border: `1px solid ${status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.4)' : status === 'PENDING' ? 'rgba(245, 158, 11, 0.4)' : status === 'REJECTED' ? 'rgba(239, 68, 68, 0.4)' : '#1e293b'}`
                                      }}
                                    >
                                      {status === 'PENDING_UPLOAD' ? 'Awaiting Upload' : status}
                                    </span>
                                  </div>

                                  {doc?.documentName && (
                                    <div style={{ marginTop: '8px', padding: '6px 10px', background: '#090d0f', border: '1px solid #1e293b', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                      <span style={{ fontFamily: 'monospace', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{doc.documentName}</span>
                                      <a
                                        href={`${API_URL}${doc.fileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#199580', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                      >
                                        <ExternalLink size={11} /> Open File
                                      </a>
                                    </div>
                                  )}

                                  {status === 'REJECTED' && doc?.rejectionReason && (
                                    <p style={{ margin: '8px 0 0 0', padding: '6px 10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: '0.7rem' }}>
                                      Flagged: {doc.rejectionReason}
                                    </p>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                {doc && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                                    <button
                                      disabled={isThisLoading || status === 'VERIFIED'}
                                      onClick={() => handleVerify(candidate.id, docSchema.type, 'VERIFIED')}
                                      className="ca-btn-approve"
                                    >
                                      <CheckCircle2 size={12} />
                                      <span>{status === 'VERIFIED' ? 'Approved' : 'Approve'}</span>
                                    </button>

                                    <button
                                      disabled={isThisLoading || status === 'REJECTED'}
                                      onClick={() => setRejectModalData({ userId: candidate.id, docType: docSchema.type, docLabel: docSchema.label, reason: '' })}
                                      className="ca-btn-reject"
                                    >
                                      <XCircle size={12} />
                                      <span>Flag / Reject</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {rejectModalData && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#0d1113', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px', padding: '24px', maxWidth: '440px', width: '100%', color: '#f1f5f9', boxShadow: '0 0 30px rgba(239,68,68,0.2)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', marginBottom: '8px' }}>
                <AlertTriangle size={18} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Reject Document: {rejectModalData.docLabel}</h4>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Please document why this compliance credential is flagged. The candidate will see this in their onboarding checklist to upload an updated version.
              </p>

              <textarea
                rows={3}
                value={rejectModalData.reason}
                onChange={(e) => setRejectModalData({ ...rejectModalData, reason: e.target.value })}
                placeholder="e.g. Document image is expired or cropped. Please re-upload a clear copy."
                style={{ width: '100%', background: '#030506', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px 12px', fontSize: '0.78rem', color: '#f8fafc', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRejectModalData(null)}
                  style={{ padding: '8px 16px', background: '#1e293b', border: 'none', color: '#cbd5e1', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleVerify(rejectModalData.userId, rejectModalData.docType, 'REJECTED', rejectModalData.reason)}
                  style={{ padding: '8px 16px', background: '#dc2626', border: 'none', color: '#ffffff', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
