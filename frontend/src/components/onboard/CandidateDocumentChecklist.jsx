import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  ExternalLink,
  Check
} from 'lucide-react';
import '../../pages/CandidateOnboardingPortal.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const REQUIRED_DOCS = [
  { type: 'ID_PROOF', label: 'Government ID Card', desc: 'PAN Card, SSN, Passport or National ID copy' },
  { type: 'DEGREE_CERTIFICATE', label: 'Academic Degree Cert', desc: 'Highest educational certificate or graduation diploma' },
  { type: 'EXPERIENCE_LETTER', label: 'Experience Proof', desc: 'Relieving letter or latest salary pay slip' },
  { type: 'BANK_PROOF', label: 'Bank Payroll Proof', desc: 'Passbook or voided cheque copy for accounts setup' },
  { type: 'NDA', label: 'Signed NDA Form', desc: 'Completed Non-Disclosure & IP Assignment document' },
  { type: 'TAX_FORM', label: 'Withholding Tax Declaration', desc: 'Completed Form 12BB (India) or W-4 / W-8BEN Form' }
];

export default function CandidateDocumentChecklist({ userId, onDocumentUpdated }) {
  const [docStatuses, setDocStatuses] = useState({});
  const [uploadingType, setUploadingType] = useState('');
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    if (userId) {
      fetchDocumentStatuses();
    }
  }, [userId]);

  const fetchDocumentStatuses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/candidate/${userId}/documents`);
      if (response.ok) {
        const data = await response.json();
        const dict = {};
        (data.documents || []).forEach(d => {
          dict[d.documentType] = { 
            status: d.status, 
            rejectionReason: d.rejectionReason, 
            documentName: d.documentName, 
            fileUrl: d.fileUrl 
          };
        });
        setDocStatuses(dict);
        if (onDocumentUpdated) {
          onDocumentUpdated(data);
        }
      }
    } catch (err) {
      console.error('Failed to resolve document statuses.');
    }
  };

  const handleFileUpload = async (e, type) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Please upload a file smaller than 10MB.');
      return;
    }

    setUploadingType(type);
    setError('');
    setSuccessToast('');

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', type);

    try {
      const response = await fetch(`${API_URL}/api/candidate/${userId}/upload-document`, {
        method: 'POST',
        body: formData
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setSuccessToast(`Successfully uploaded ${type.replace(/_/g, ' ')}! Queued for HR validation.`);
        setTimeout(() => setSuccessToast(''), 4000);
        await fetchDocumentStatuses();
      } else {
        setError(resData.message || 'File transmission failed.');
      }
    } catch (err) {
      setError('Connection to compliance portal timed out.');
    } finally {
      setUploadingType('');
      e.target.value = '';
    }
  };

  const verifiedCount = Object.values(docStatuses).filter(d => d.status === 'VERIFIED').length;

  return (
    <div className="glass-panel-card">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">
            <ShieldCheck size={20} className="panel-title-icon" />
            Corporate Compliance Vault
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
            Upload digital copies (PDF or JPG, max 10MB) for all 6 foundational corporate compliance requirements.
          </p>
        </div>

        <div style={{ background: '#020405', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.72rem', fontFamily: 'monospace' }}>
          <span style={{ color: '#64748b' }}>Vault Status: </span>
          <span style={{ fontWeight: 800, color: verifiedCount === 6 ? '#34d399' : '#199580' }}>
            {verifiedCount}/6 Verified
          </span>
        </div>
      </div>

      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Check size={14} />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="checklist-container">
        {REQUIRED_DOCS.map((doc) => {
          const state = docStatuses[doc.type] || { status: 'PENDING_UPLOAD' };
          const isCurrentUploading = uploadingType === doc.type;

          let itemClass = 'doc-checklist-item';
          if (state.status === 'VERIFIED') itemClass += ' verified';
          if (state.status === 'REJECTED') itemClass += ' rejected';

          return (
            <div key={doc.type} className={itemClass}>
              <div className="doc-info-col">
                <div className="doc-title-row">
                  <h4>{doc.label}</h4>
                  {state.status === 'VERIFIED' && (
                    <CheckCircle2 size={15} style={{ color: '#34d399' }} />
                  )}
                </div>
                <p className="doc-desc">{doc.desc}</p>
                
                {state.documentName && (
                  <p className="doc-file-tag">
                    <FileText size={11} style={{ color: '#199580' }} />
                    <span>File: {state.documentName}</span>
                  </p>
                )}

                {state.status === 'REJECTED' && (
                  <div className="rejection-notice-box">
                    ⚠️ HR FLAGGED: {state.rejectionReason || 'Document does not fulfill institutional compliance standards.'}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                {state.status === 'VERIFIED' && (
                  <span className="badge-active">
                    <CheckCircle2 size={11} /> Verified
                  </span>
                )}
                {state.status === 'PENDING' && (
                  <span className="badge-pending">
                    <Clock size={11} /> Reviewing
                  </span>
                )}
                {(state.status === 'PENDING_UPLOAD' || state.status === 'REJECTED') && (
                  <div>
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileUpload(e, doc.type)}
                      style={{ display: 'none' }}
                      id={`file-input-${doc.type}`}
                      disabled={isCurrentUploading}
                    />
                    <label
                      htmlFor={`file-input-${doc.type}`}
                      className={`btn-upload-label ${state.status === 'REJECTED' ? 'reupload' : ''}`}
                    >
                      <UploadCloud size={13} />
                      <span>{isCurrentUploading ? 'Uploading...' : state.status === 'REJECTED' ? 'Re-upload' : 'Upload File'}</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#f87171', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
