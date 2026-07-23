import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';
import { socket } from '../socket/socketManager';
import './SplitLogin.css';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

const SplitLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Start auth session when component mounts for tracking
    const initSession = async () => {
      try {
        const response = await axios.post(`${API_URL}/api/auth/start`, {
          flowType: 'login',
          initialStep: 'credentials'
        });
        if (response.data.success) {
          setSessionId(response.data.sessionId);
          socket.emit('auth:start', {
            sessionId: response.data.sessionId,
            step: 'credentials'
          });
        }
      } catch (err) {
        console.error('Failed to start session', err);
      }
    };
    initSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('elvooriq_token', response.data.token);
        
        // Emit success event
        if (sessionId) {
          socket.emit('auth:success', {
            sessionId,
            flowType: 'login'
          });
        }
        
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to authenticate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="split-login-container">
      {/* LEFT PANEL */}
      <div className="split-login-left">
        <div className="sl-left-content">
          <div className="sl-logo"><img src={logoImg} alt="ELVOORIQ Logo" style={{ height: '96px' }} /></div>
          
          <div className="sl-badge">
            <span className="live-dot"></span> WELCOME BACK
          </div>

          <h1 className="sl-heading">
            Your Creator<br />
            <span>Dashboard Awaits</span>
          </h1>

          <p className="sl-desc">
            Log in to manage your streams, track analytics, connect with brands, and grow your career with ELVOORIQ.
          </p>

          <div className="sl-stats-row">
            <div className="sl-stat-card">
              <svg className="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <h3>5,000+</h3>
              <p>Active Creators</p>
            </div>
            <div className="sl-stat-card">
              <svg className="stat-icon green" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
              <h3>$12M+</h3>
              <p>Revenue Generated</p>
            </div>
            <div className="sl-stat-card">
              <svg className="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <h3>98%</h3>
              <p>Satisfaction Rate</p>
            </div>
          </div>

          <div className="sl-testimonial">
            <div className="sl-stars">
              {"★★★★★".split('').map((star, i) => <span key={i}>{star}</span>)}
            </div>
            <p>"I went full-time within 8 months. Best decision ever."</p>
            <div className="sl-author">
              <div className="sl-avatar"></div>
              <div className="sl-author-info">
                <h4>Maya Lin</h4>
                <span>@mayastreams · 1.4M</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (FORM) */}
      <div className="split-login-right">
        <div className="sl-form-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="sl-form-title">Welcome back</h2>
            <p className="sl-form-subtitle">Sign in to your creator account</p>

            <button className="sl-social-btn">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="sl-divider">
              <span>or sign in with email</span>
            </div>

            <form onSubmit={handleLogin} className="sl-form">
              <div className="sl-input-group">
                <label>EMAIL ADDRESS</label>
                <div className="sl-input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="sl-input-group">
                <div className="sl-label-row">
                  <label>PASSWORD</label>
                  <a href="#" className="sl-forgot">Forgot password?</a>
                </div>
                <div className="sl-input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input 
                    type="password" 
                    placeholder="Your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <svg className="sl-eye" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
              </div>

              <div className="sl-checkbox-group">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me for 30 days</label>
              </div>

              {error && <div className="sl-error">{error}</div>}

              <button type="submit" className="sl-submit-btn" disabled={isLoading}>
                {isLoading ? 'Signing in...' : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Sign In →
                  </>
                )}
              </button>

              <div className="sl-register-link">
                New to ELVOORIQ? <Link to="/register">Create an account</Link>
              </div>
            </form>

            <div className="sl-form-footer">
              <span>✓ SSL Secured</span>
              <span>✓ No spam</span>
              <span>✓ Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SplitLogin;
