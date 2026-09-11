import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Mail, 
  Phone, 
  Briefcase 
} from 'lucide-react';
import './OfferLetterBuilder.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default function OfferLetterBuilder({ onOfferCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    jobTitle: '',
    compensationBasis: 'SALARY',
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [activationUrl, setActivationUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateAndSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setGeneratedPdfUrl('');
    setActivationUrl('');

    try {
      const token = localStorage.getItem('elvooriq_token') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/hr/onboarding/generate-and-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setSuccessMsg(resData.message);
        setGeneratedPdfUrl(resData.pdfDownloadUrl);
        setCandidateId(resData.candidateId);
        setActivationUrl(resData.activationUrl || `${window.location.origin}/onboard/${resData.candidateId}`);
        if (onOfferCreated) onOfferCreated(resData);
      } else {
        setError(resData.message || 'Hiring transaction execution failed.');
      }
    } catch (err) {
      setError('Connection to operations server timed out or failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyActivationLink = () => {
    if (!activationUrl) return;
    navigator.clipboard.writeText(activationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="olb-container">
      <div className="olb-header">
        <div>
          <h3 className="olb-title">
            <Sparkles size={20} />
            Dynamic Offer Letter Generator (v7.0)
          </h3>
          <p className="olb-desc">
            Vector PDF compiler with automated compensation models, template branching, and candidate portal provisioning.
          </p>
        </div>
        <span className="olb-badge">
          Production Engine
        </span>
      </div>

      <div className="olb-grid">
        {/* Input Parameters Column */}
        <form onSubmit={handleCreateAndSend} className="olb-form">
          <div className="olb-field-row">
            <div className="olb-field-group">
              <label className="olb-label">
                <User size={13} style={{ color: '#D4AF37' }} /> Candidate Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Utsab Sinha"
                className="olb-input"
              />
            </div>
            <div className="olb-field-group">
              <label className="olb-label">
                <Mail size={13} style={{ color: '#D4AF37' }} /> Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="candidate@example.com"
                className="olb-input"
              />
            </div>
          </div>

          <div className="olb-field-row">
            <div className="olb-field-group">
              <label className="olb-label">
                <Phone size={13} style={{ color: '#D4AF37' }} /> WhatsApp / Phone Number
              </label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="olb-input"
              />
            </div>
            <div className="olb-field-group">
              <label className="olb-label">
                <Briefcase size={13} style={{ color: '#D4AF37' }} /> Target Position Designation *
              </label>
              <input
                type="text"
                name="jobTitle"
                required
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="Senior Platform Producer"
                className="olb-input"
              />
            </div>
          </div>

          {/* Compensation Tier Selection */}
          <div className="olb-field-group">
            <label className="olb-label">
              Compensation Agreement Tier *
            </label>
            <div className="olb-tiers-grid">
              {[
                { id: 'SALARY', label: 'Fixed Salary', desc: 'Monthly Base Payroll' },
                { id: 'STIPEND', label: 'Stipend', desc: 'Training / Internship' },
                { id: 'UNPAID', label: 'Unpaid', desc: 'Skills Advancement' }
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, compensationBasis: tier.id })}
                  className={`olb-tier-btn ${formData.compensationBasis === tier.id ? 'active' : ''}`}
                >
                  <div className="olb-tier-name">{tier.label}</div>
                  <div className="olb-tier-sub">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {formData.compensationBasis !== 'UNPAID' && (
            <div className="olb-field-group">
              <label className="olb-label">
                <DollarSign size={13} style={{ color: '#D4AF37' }} /> Compensation Amount (INR / Month) *
              </label>
              <input
                type="number"
                name="amount"
                required
                value={formData.amount}
                onChange={handleChange}
                placeholder="120000"
                min="0"
                className="olb-input"
              />
            </div>
          )}

          <div className="olb-field-row">
            <div className="olb-field-group">
              <label className="olb-label">
                <Calendar size={13} style={{ color: '#D4AF37' }} /> Effective Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="olb-input"
              />
            </div>
            <div className="olb-field-group">
              <label className="olb-label">
                <Calendar size={13} style={{ color: '#64748b' }} /> Contract End Date (Optional)
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="olb-input"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="olb-submit-btn"
          >
            {loading ? (
              <>
                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span>Compiling Vector PDF & Dispatching...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Generate and Dispatch Appointment Offer</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Staging & Download Column */}
        <div className="olb-logs-panel">
          <div>
            <div className="olb-logs-header">
              <h4>
                <FileText size={14} style={{ color: '#D4AF37' }} />
                Generated Contract Asset Logs
              </h4>
              <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>EVQ-OL-ENGINE</span>
            </div>

            <AnimatePresence mode="wait">
              {generatedPdfUrl ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="olb-success-box">
                    <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block' }}>{successMsg || 'Offer Letter compiled and staged!'}</strong>
                      <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>Candidate email and onboarding security link generated.</span>
                    </div>
                  </div>

                  <div className="olb-path-box">
                    <span className="path-label">STAGED ASSET PATH:</span>
                    <div className="path-val">{generatedPdfUrl}</div>
                  </div>

                  <a
                    href={`${API_URL}${generatedPdfUrl}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="olb-btn-download"
                  >
                    <Download size={14} />
                    <span>Download Generated Offer PDF</span>
                  </a>

                  {activationUrl && (
                    <div className="olb-path-box">
                      <span className="path-label">CANDIDATE PORTAL LINK:</span>
                      <div className="olb-link-copy-row">
                        <input
                          type="text"
                          readOnly
                          value={activationUrl}
                          className="olb-input"
                          style={{ fontSize: '0.72rem', padding: '6px 8px', fontFamily: 'monospace' }}
                        />
                        <button
                          type="button"
                          onClick={copyActivationLink}
                          className="olb-btn-copy"
                        >
                          {copiedLink ? <Check size={13} style={{ color: '#34d399' }} /> : <Copy size={13} />}
                          <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 16px', border: '1px dashed #1e293b', borderRadius: '10px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#090d0f', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#64748b' }}>
                    <FileText size={22} />
                  </div>
                  <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#cbd5e1', margin: '0 0 4px 0' }}>Awaiting Generation</h5>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Fill in the candidate parameters and click "Generate" to trigger the vector PDF compiler and stage the contract assets.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#f87171', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
