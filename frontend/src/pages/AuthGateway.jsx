import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Video, 
  ArrowRight, 
  Lock, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Layers,
  Clock,
  UserCheck,
  KeyRound,
  ChevronRight,
  Info
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import './AuthGateway.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const AuthGateway = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('EMPLOYEE');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regPlatform, setRegPlatform] = useState('YouTube');

  // UI Flow State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingApprovalNotice, setPendingApprovalNotice] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCredentialsHelper, setShowCredentialsHelper] = useState(false);

  // Handle successful login and role-based routing
  const handleAuthSuccess = (token, user, data = {}) => {
    localStorage.setItem('elvooriq_token', token);
    if (data.sessionId) localStorage.setItem('elvooriq_session_id', data.sessionId);
    if (data.loginTime) localStorage.setItem('elvooriq_login_time', data.loginTime);
    localStorage.setItem('elvooriq_user', JSON.stringify(user));
    localStorage.setItem('elvooriq_admin_auth', user.role === 'ADMIN' ? 'true' : 'false');

    if (user.role === 'ADMIN') {
      navigate('/admin-panel');
    } else if (user.role === 'EMPLOYEE') {
      navigate('/workspace-portal');
    } else {
      navigate('/dashboard');
    }
  };

  // Direct email/password submission with dual-status gatekeeper handling
  const handleDirectLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setPendingApprovalNotice('');
    setSuccessMessage('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        localStorage.removeItem('elvooriq_token');
        localStorage.removeItem('elvooriq_user');
        localStorage.removeItem('elvooriq_admin_auth');
      }

      if (res.status === 403 && data.code === 'ACCOUNT_PENDING_APPROVAL') {
        // Section 1.2: Dual-Status Administrative Gatekeeper Warning
        setPendingApprovalNotice(data.message || 'Your account is pending administrator activation. Please contact administration (support@elvooriq.com) for clearance.');
        return;
      }

      if (res.status === 403 && data.code === 'ACCOUNT_SUSPENDED') {
        setErrorMessage(data.message || 'This account has been suspended by system administration.');
        return;
      }

      if (res.ok && data.success && data.token) {
        handleAuthSuccess(data.token, data.user, data);
      } else {
        setErrorMessage(data.message || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Network error: Unable to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  // Self-Registration with Default Status PENDING
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regPassword) {
      setErrorMessage('Please provide your full name, work email, and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setPendingApprovalNotice('');
    setSuccessMessage('');

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName.trim(),
          email: regEmail.trim(),
          reg_password: regPassword,
          role: regRole,
          whatsapp: regWhatsapp.trim() || undefined,
          platform: regPlatform
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.requiresApproval) {
          // Non-creator accounts require root admin clearance
          setPendingApprovalNotice(data.message);
          setActiveTab('login');
          setLoginEmail(regEmail);
        } else if (data.token) {
          handleAuthSuccess(data.token, data.user);
        } else {
          setSuccessMessage(data.message || 'Account created successfully! Please sign in.');
          setActiveTab('login');
          setLoginEmail(regEmail);
        }
      } else {
        setErrorMessage(data.message || 'Registration failed. Please check your inputs.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage('Network error during registration. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-gateway-container">
      {/* Background Ambient Glows */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div className="auth-gateway-content">
        {/* Brand Header */}
        <motion.div 
          className="gateway-brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="brand-logo-link">
            <img 
              src={logoImg} 
              alt="ELVOORIQ Logo" 
              style={{ height: '96px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(229, 193, 88, 0.45)) drop-shadow(0 0 10px rgba(0, 245, 155, 0.25))' }} 
            />
          </Link>
          <div className="enterprise-badge">
            <span className="pulse-dot" />
            <span>ENTERPRISE COLLABORATIVE ERP • V2.0 HARDENED</span>
          </div>
        </motion.div>

        {/* Tab Switcher: Sign In / Register Account */}
        <div className="gateway-tabs">
          <button 
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
          >
            <Lock size={16} />
            <span>Enterprise Sign In</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
          >
            <UserCheck size={16} />
            <span>Register Account</span>
          </button>
        </div>

        {/* Pending Approval Warning Banner (Section 1.2) */}
        {pendingApprovalNotice && (
          <motion.div 
            className="pending-approval-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="banner-icon-col">
              <Clock size={24} className="banner-clock-icon" />
            </div>
            <div className="banner-text-col">
              <h4>Administrative Clearance Required (Status: PENDING)</h4>
              <p>{pendingApprovalNotice}</p>
              <div className="banner-action-line">
                <span>Contact Operations Support:</span>
                <code>support@elvooriq.com</code>
              </div>
            </div>
          </motion.div>
        )}

        {/* General Error Notice */}
        {errorMessage && (
          <motion.div 
            className="error-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Success Notice */}
        {successMessage && (
          <motion.div 
            className="success-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {/* Auth Forms */}
        <div className="auth-layout-grid">
          {/* Form Container */}
          <div className="auth-form-card">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div 
                  key="login-view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="form-card-header">
                    <h2>Verified Workspace Access</h2>
                    <p>Enter your cryptographic credentials to proceed into your assigned workspace.</p>
                  </div>

                  <form onSubmit={handleDirectLogin} className="login-form">
                    <div className="form-group">
                      <label>Work Email Address</label>
                      <div className="input-wrapper">
                        <Mail size={18} className="input-icon" />
                        <input 
                          type="email" 
                          placeholder="you@example.com" 
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input 
                          type="password" 
                          placeholder="••••••••••••" 
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="submit-login-btn"
                      disabled={loading}
                    >
                      {loading ? 'Authenticating & Verifying...' : 'Sign In with Cryptographic Clearance'}
                    </button>
                  </form>

                  <div className="security-notice-box">
                    <ShieldCheck size={16} className="notice-icon" />
                    <span>Enforced Zero-Bypass Protocol: All accounts require authenticated tokens and verified role enablement.</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="register-view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="form-card-header">
                    <h2>New Account Registration</h2>
                    <p>Register as Staff, Administrator, or Creator. Non-creator roles require Root Admin clearance.</p>
                  </div>

                  <form onSubmit={handleRegister} className="login-form">
                    <div className="form-group">
                      <label>Full Legal Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Alexander Mercer"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className="std-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Corporate or Contact Email</label>
                      <input 
                        type="email" 
                        placeholder="e.g. alex.mercer@elvooriq.com" 
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="std-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Secure Password</label>
                      <input 
                        type="password" 
                        placeholder="Min 8 characters" 
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="std-input"
                        required
                      />
                    </div>

                    <div className="form-row-2col">
                      <div className="form-group">
                        <label>Assigned Role</label>
                        <select 
                          value={regRole} 
                          onChange={(e) => setRegRole(e.target.value)}
                          className="std-select"
                        >
                          <option value="EMPLOYEE">Talent Agent (EMPLOYEE)</option>
                          <option value="ADMIN">HR Operations (ADMIN)</option>
                          <option value="CREATOR">Content Creator (CREATOR)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Phone / WhatsApp</label>
                        <input 
                          type="text" 
                          placeholder="+14155550199" 
                          value={regWhatsapp}
                          onChange={(e) => setRegWhatsapp(e.target.value)}
                          className="std-input"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="submit-login-btn"
                      disabled={loading}
                    >
                      {loading ? 'Registering Account...' : 'Submit Profile for Verification'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Enterprise Architecture & Clearance Reference */}
          <div className="auth-side-panel">
            <div className="panel-card-box">
              <div className="panel-box-header">
                <KeyRound size={20} className="panel-icon" />
                <h3>Enterprise RBAC Infrastructure</h3>
              </div>
              <p className="panel-box-desc">
                Elvooriq v2.0 implements strict role-based access control with dual-tier account verification.
              </p>

              <div className="portal-specs-list">
                <div className="portal-spec-item">
                  <div className="spec-badge admin">HR ADMIN</div>
                  <div>
                    <strong>Executive HR Portal</strong>
                    <p>Personnel roster, salary & PDF offer letters, task orchestration, monthly EPS reports.</p>
                  </div>
                </div>

                <div className="portal-spec-item">
                  <div className="spec-badge agent">AGENT</div>
                  <div>
                    <strong>Collaborative Workspace</strong>
                    <p>Multi-column Kanban boards, 0–100% routine progress check-in sliders, lead hub.</p>
                  </div>
                </div>

                <div className="portal-spec-item">
                  <div className="spec-badge creator">CREATOR</div>
                  <div>
                    <strong>Creator Live Hub</strong>
                    <p>Stream analytics, partner applications, live broadcast telemetry.</p>
                  </div>
                </div>
              </div>

              {/* Zero-Bypass Production Cryptographic Security Notice */}
              <div className="root-admin-notice" style={{ borderColor: 'rgba(212, 175, 55, 0.3)' }}>
                <div className="notice-head" style={{ cursor: 'default' }}>
                  <ShieldCheck size={16} color="#D4AF37" />
                  <span style={{ color: '#F5C542', fontWeight: 600 }}>Zero-Mock Production Security Gate</span>
                </div>
                <div style={{ padding: '10px 14px', fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                  Sandbox demo bypasses and mock state arrays have been permanently decommissioned. All sessions authenticate against verified database records.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthGateway;
