// frontend/src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, AlertTriangle } from 'lucide-react';
import logoImg from '../assets/logo.png';
import './AdminLogin.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pendingNotice, setPendingNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setPendingNotice('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (res.status === 403 && data.code === 'ACCOUNT_PENDING_APPROVAL') {
        setPendingNotice(data.message || 'Account Pending Activation. A system administrator must review and manually enable your account before you can log in.');
        return;
      }

      if (res.status === 403) {
        setError(data.message || 'Account access restricted. Please contact your operations team.');
        return;
      }

      if (res.ok && data.success && data.token) {
        if (data.user.role !== 'ADMIN') {
          setError('Access restricted. This terminal requires authorized Administrator credentials.');
          return;
        }

        // Store cryptographic session tokens
        localStorage.setItem('elvooriq_token', data.token);
        localStorage.setItem('elvooriq_user', JSON.stringify(data.user));
        navigate('/admin-panel');
      } else {
        setError(data.message || 'Invalid administrator credentials. Please check email and password.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Connection failure: Unable to reach authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {/* Background Glow */}
      <div className="admin-bg-glow"></div>

      <motion.div 
        className="admin-login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="admin-login-header">
          <h2><img src={logoImg} alt="ELVOORIQ Logo" style={{ height: '72px' }} /></h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
            <ShieldCheck size={16} color="#199580" />
            <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#199580', fontWeight: 'bold' }}>
              Enterprise Admin Gate
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
            Cryptographically Verified Access Only
          </p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          {error && (
            <div className="admin-error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {pendingNotice && (
            <div style={{
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              color: '#facc15',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '16px',
              lineHeight: '1.4'
            }}>
              ⚠️ {pendingNotice}
            </div>
          )}

          <div className="admin-input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={13} />
              <span>Admin Email</span>
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="root.admin@elvooriq.com"
              required 
            />
          </div>

          <div className="admin-input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={13} />
              <span>Password</span>
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required 
            />
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Verifying Credentials...' : 'Sign In To System Securely'}
          </button>

          {/* Wireframe A: Security Status & Network Telemetry */}
          <div className="security-telemetry-badge-card" style={{
            marginTop: '20px',
            background: 'rgba(3, 5, 6, 0.75)',
            border: '1px solid rgba(25, 149, 128, 0.25)',
            borderRadius: '10px',
            padding: '12px 16px',
            fontSize: '11px',
            color: '#94a3b8',
            fontFamily: 'monospace',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#2dd4bf', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> SECURITY STATUS: ACTIVE
              </span>
              <span style={{ color: '#38bdf8', fontSize: '10px', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                Geo-IP: Lock
              </span>
            </div>
            <div style={{ color: '#cbd5e1' }}>
              Current Client Geolocation: <strong style={{ color: '#34d399' }}>Verified Session Location</strong>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#64748b', lineHeight: '1.3' }}>
              Security Notice: Credentials are log-verified. Session drift across locations will trigger immediate cryptographic locks.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
