import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { Mail, Phone, MapPin, Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { socket } from '../../socket/socketManager';
import '../PageStyles.css';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

const ContactPage = () => {
  const location = useLocation();

  // Initialize states directly from localStorage to prevent form flash on refresh
  const [submitted, setSubmitted] = useState(() => {
    const savedId = localStorage.getItem('elvooriq_partner_request_id');
    return savedId && savedId !== 'undefined' && savedId !== 'null' ? true : false;
  });

  const [requestId, setRequestId] = useState(() => {
    const savedId = localStorage.getItem('elvooriq_partner_request_id');
    return savedId && savedId !== 'undefined' && savedId !== 'null' ? savedId : null;
  });

  const [status, setStatus] = useState(() => {
    const savedStatus = localStorage.getItem('elvooriq_partner_request_status');
    const savedId = localStorage.getItem('elvooriq_partner_request_id');
    if (savedId && savedId !== 'undefined' && savedId !== 'null') {
      return savedStatus || 'pending';
    }
    return 'idle';
  });

  const [formData, setFormData] = useState(() => {
    return {
      name: localStorage.getItem('elvooriq_partner_request_name') || '',
      email: localStorage.getItem('elvooriq_partner_request_email') || '',
      subject: localStorage.getItem('elvooriq_partner_request_subject') || 'Creator Application',
      message: localStorage.getItem('elvooriq_partner_request_message') || ''
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill subject if query param exists
  useEffect(() => {
    if (submitted) return;
    const queryParams = new URLSearchParams(location.search);
    const subjectParam = queryParams.get('subject');
    if (subjectParam) {
      setFormData(prev => ({ ...prev, subject: subjectParam }));
    }
  }, [location, submitted]);

  // Sync and verify request status with database via GET request on mount
  useEffect(() => {
    const savedRequestId = localStorage.getItem('elvooriq_partner_request_id');
    if (savedRequestId && savedRequestId !== 'undefined' && savedRequestId !== 'null') {
      setIsLoadingSaved(true);
      axios.get(`${API_URL}/api/admin/partner-requests/${savedRequestId}`)
        .then(response => {
          if (response.data.success && response.data.partnerRequest) {
            const req = response.data.partnerRequest;
            setRequestId(req.id);
            setStatus(req.status);
            
            const restoredData = {
              name: req.name,
              email: req.email,
              subject: req.subject,
              message: req.message
            };
            setFormData(restoredData);
            setSubmitted(true);

            // Persist the verified values locally
            localStorage.setItem('elvooriq_partner_request_status', req.status);
            localStorage.setItem('elvooriq_partner_request_name', req.name);
            localStorage.setItem('elvooriq_partner_request_email', req.email);
            localStorage.setItem('elvooriq_partner_request_subject', req.subject);
            localStorage.setItem('elvooriq_partner_request_message', req.message);
          }
        })
        .catch(err => {
          console.warn('Backend request verification status check failed:', err);
          // If the database responds with 404 (manually cleared or wiped), reset the local form
          if (err.response?.status === 404) {
            handleResetForm();
          }
        })
        .finally(() => {
          setIsLoadingSaved(false);
        });
    }
  }, []);

  // Connect to rooms and listen for live admin choices (Accept / Decline)
  useEffect(() => {
    if (!requestId || status !== 'pending') return;

    socket.emit('partner_request:join', { requestId });

    const handleStatusUpdate = (data) => {
      if (data && data.status) {
        setStatus(data.status);
        localStorage.setItem('elvooriq_partner_request_status', data.status);
      }
    };

    socket.on('partner_request:status_update', handleStatusUpdate);

    return () => {
      socket.off('partner_request:status_update', handleStatusUpdate);
    };
  }, [requestId, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all layout fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/admin/partner-requests`, formData);
      if (response.data.success) {
        const newId = response.data.requestId;
        setRequestId(newId);
        setStatus('pending');
        setSubmitted(true);

        // Store request metadata locally
        localStorage.setItem('elvooriq_partner_request_id', newId);
        localStorage.setItem('elvooriq_partner_request_status', 'pending');
        localStorage.setItem('elvooriq_partner_request_name', formData.name);
        localStorage.setItem('elvooriq_partner_request_email', formData.email);
        localStorage.setItem('elvooriq_partner_request_subject', formData.subject);
        localStorage.setItem('elvooriq_partner_request_message', formData.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    localStorage.removeItem('elvooriq_partner_request_id');
    localStorage.removeItem('elvooriq_partner_request_status');
    localStorage.removeItem('elvooriq_partner_request_name');
    localStorage.removeItem('elvooriq_partner_request_email');
    localStorage.removeItem('elvooriq_partner_request_subject');
    localStorage.removeItem('elvooriq_partner_request_message');

    setSubmitted(false);
    setStatus('idle');
    setRequestId(null);
    setFormData({
      name: '',
      email: '',
      subject: 'Creator Application',
      message: ''
    });
  };

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">GET IN TOUCH</div>
        <h1 className="page-hero-title">Contact <span className="title-accent">ELVOORIQ Team</span></h1>
        <p className="page-hero-subtitle">
          Have questions about creator representation, brand partnerships, or technical support? We’re here to help.
        </p>
      </div>

      <div className="container page-content-section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px' }}>

          {/* Info Card */}
          <div className="glass-card" style={{ height: 'fit-content' }}>
            <h3 className="card-title" style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Global Headquarters</h3>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div className="card-icon" style={{ width: '44px', height: '44px', marginBottom: 0 }}><MapPin size={20} /></div>
              <div>
                <h4 style={{ color: '#FFF', fontWeight: 600 }}>Location</h4>
                <p style={{ color: '#A0A0B0', fontSize: '0.9rem' }}>Global HQ • Digital Creator Center</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div className="card-icon" style={{ width: '44px', height: '44px', marginBottom: 0 }}><Mail size={20} /></div>
              <div>
                <h4 style={{ color: '#FFF', fontWeight: 600 }}>Email Support</h4>
                <p style={{ color: '#A0A0B0', fontSize: '0.9rem' }}>support@elvooriq.com</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="card-icon" style={{ width: '44px', height: '44px', marginBottom: 0 }}><Phone size={20} /></div>
              <div>
                <h4 style={{ color: '#FFF', fontWeight: 600 }}>Agency Line</h4>
                <p style={{ color: '#A0A0B0', fontSize: '0.9rem' }}>+1 (800) 555-ELVOORIQ</p>
              </div>
            </div>
          </div>

          {/* Dynamic Real-time Status Card */}
          <div className="glass-card">
            <AnimatePresence mode="wait">
              {submitted ? (
                <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>

                  {/* Status: PENDING WAIT LAYER */}
                  {status === 'pending' && (
                    <motion.div
                      key="pending"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      style={{ width: '100%' }}
                    >
                      <Loader2 size={54} className="animate-spin" style={{ color: '#10b981', margin: '0 auto 20px' }} />
                      <h3 className="card-title" style={{ fontSize: '1.5rem', color: '#10b981' }}>Live Review In Progress</h3>
                      <p className="card-desc" style={{ maxWidth: '400px', margin: '12px auto' }}>
                        Your request is pending review by the ELVOORIQ administrative team. Updates will sync automatically.
                      </p>

                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginTop: '24px', textAlign: 'left' }}>
                        <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block', marginBottom: '4px', letterSpacing: '1px' }}>TICKET ID</span>
                        <code style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>{requestId}</code>

                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px', marginTop: '12px', fontSize: '0.85rem' }}>
                          <span style={{ color: '#8C9BA5' }}>Partner:</span>
                          <span style={{ color: '#FFF', fontWeight: 500 }}>{formData.name}</span>
                          <span style={{ color: '#8C9BA5' }}>Subject:</span>
                          <span style={{ color: '#FFF' }}>{formData.subject}</span>
                          <span style={{ color: '#8C9BA5' }}>Status:</span>
                          <span style={{ color: '#eab308', fontWeight: 'bold' }}>PENDING</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Status: APPROVED SUCCESS LAYER -> COMING SOON PORTAL */}
                  {status === 'approved' && (
                    <motion.div
                      key="approved"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                      style={{ width: '100%' }}
                    >
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <CheckCircle2 size={36} color="#10b981" />
                      </div>
                      <h4 style={{ textTransform: 'uppercase', color: '#10b981', letterSpacing: '2px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>PARTNERSHIP ACCEPTED</h4>
                      <h1 style={{ fontSize: '2.4rem', fontWeight: 800, background: 'linear-gradient(135deg, #FFF 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '14px', letterSpacing: '-0.5px' }}>Coming Soon</h1>
                      <p className="card-desc" style={{ maxWidth: '400px', margin: '0 auto 20px', color: '#A0A0B0', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        Welcome to the ELVOORIQ ecosystem! Your request has been approved. We are finalizing your brand dashboard and creator engagement workspace.
                      </p>

                      {/* Interactive Progress List */}
                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', textAlign: 'left', margin: '0 auto 20px', maxWidth: '380px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <CheckCircle2 size={16} color="#10b981" />
                          <span style={{ fontSize: '0.8rem', color: '#FFF', fontWeight: 500 }}>Step 1: Partner Request Approved</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <Loader2 size={16} className="animate-spin" style={{ color: '#10b981' }} />
                          <span style={{ fontSize: '0.8rem', color: '#FFF', fontWeight: 500 }}>Step 2: Workspace Provisioning</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.3 }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                          <span style={{ fontSize: '0.8rem', color: '#FFF' }}>Step 3: Onboarding Briefing & Access</span>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '10px', padding: '12px', fontSize: '0.8rem', color: '#A0B0A5', textAlign: 'left', lineHeight: '1.5' }}>
                        Our agency relations group will email you at <span style={{ color: '#fff', textDecoration: 'underline' }}>{formData.email}</span> shortly with setup links.
                      </div>

                      <button
                        onClick={handleResetForm}
                        style={{ marginTop: '20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Submit another form
                      </button>
                    </motion.div>
                  )}

                  {/* Status: REJECTED FAILURE LAYER */}
                  {status === 'rejected' && (
                    <motion.div
                      key="rejected"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                      style={{ width: '100%' }}
                    >
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <XCircle size={44} color="#ef4444" />
                      </div>
                      <h3 className="card-title" style={{ fontSize: '1.8rem', color: '#ef4444' }}>Request Declined</h3>
                      <p className="card-desc" style={{ maxWidth: '420px', margin: '12px auto 20px' }}>
                        Your partnership request has been reviewed and declined by our administrative panel.
                      </p>
                      <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '12px', padding: '16px', fontSize: '0.9rem', color: '#B5A0A0', textAlign: 'left', lineHeight: '1.6' }}>
                        ELVOORIQ currently maintains a selective onboarding process. For feedback regarding this request, or to follow up manually, please write directly to our communications division at <span style={{ color: '#fff' }}>support@elvooriq.com</span>.
                      </div>
                      <button
                        onClick={handleResetForm}
                        style={{ marginTop: '24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        Submit another form
                      </button>
                    </motion.div>
                  )}

                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 className="card-title" style={{ fontSize: '1.6rem', marginBottom: '20px' }}>Send Us a Message</h3>

                  {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: '0.85rem' }}>{error}</div>}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', color: '#AAA', fontSize: '0.85rem', marginBottom: '6px' }}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }}
                      placeholder="Your Name"
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', color: '#AAA', fontSize: '0.85rem', marginBottom: '6px' }}>Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', color: '#AAA', fontSize: '0.85rem', marginBottom: '6px' }}>Subject</label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }}
                    >
                      <option value="Creator Application" style={{ background: '#111' }}>Creator Application</option>
                      <option value="Brand Partnership Inquiry" style={{ background: '#111' }}>Brand Partnership Inquiry</option>
                      <option value="Technical Support" style={{ background: '#111' }}>Technical Support</option>
                      <option value="Press & Media" style={{ background: '#111' }}>Press & Media</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', color: '#AAA', fontSize: '0.85rem', marginBottom: '6px' }}>Message</label>
                    <textarea
                      rows="4"
                      required
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }}
                      placeholder="How can we assist you?"
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-cta" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
                    {isSubmitting ? (
                      <>Processing Submission... <Loader2 size={16} className="animate-spin" /></>
                    ) : (
                      <>Send Message <Send size={16} /></>
                    )}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </PageLayout>
  );
};

export default ContactPage;
