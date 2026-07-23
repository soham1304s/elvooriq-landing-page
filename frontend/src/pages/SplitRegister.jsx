import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';
import { socket } from '../socket/socketManager';
import './SplitRegister.css';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

const SplitRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    reg_password: '',
    confirm_password: '',
    age: '',
    country: '',
    whatsapp: '',
    platform: '',
    experience: '',
    bio: ''
  });
  
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Start auth session when component mounts
    const initSession = async () => {
      try {
        const response = await axios.post(`${API_URL}/api/auth/start`, {
          flowType: 'register',
          initialStep: 'step_1'
        });
        if (response.data.success) {
          setSessionId(response.data.sessionId);
          socket.emit('auth:start', {
            sessionId: response.data.sessionId,
            step: 'step_1'
          });
        }
      } catch (err) {
        console.error('Failed to start session', err);
      }
    };
    initSession();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.reg_password) {
        setError('Please fill in all required fields.');
        return;
      }
      if (formData.reg_password !== formData.confirm_password) {
        setError('Passwords do not match.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.age || !formData.country) {
        setError('Please fill in all required fields.');
        return;
      }
    }
    
    const nextStepNum = currentStep + 1;
    setCurrentStep(nextStepNum);
    
    // Save progress and emit socket event
    if (sessionId) {
      const progress = Math.round(((nextStepNum - 1) / 3) * 100);
      axios.post(`${API_URL}/api/auth/save-progress`, {
        sessionId,
        step: `step_${nextStepNum}`,
        answers: formData,
        progress
      }).catch(err => console.error(err));

      socket.emit('auth:progress', {
        sessionId,
        step: `step_${nextStepNum}`,
        progress
      });
    }
  };

  const handleBack = () => {
    setError('');
    const prevStepNum = currentStep - 1;
    setCurrentStep(prevStepNum);
    
    // Update progress on back navigation
    if (sessionId) {
      const progress = Math.round(((prevStepNum - 1) / 3) * 100);
      socket.emit('auth:progress', {
        sessionId,
        step: `step_${prevStepNum}`,
        progress
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== 3) {
      handleNext();
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, formData);
      if (response.data.success) {
        localStorage.setItem('elvooriq_token', response.data.token);
        
        // Emit success event
        if (sessionId) {
          socket.emit('auth:success', {
            sessionId,
            flowType: 'register'
          });
        }
        
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="split-reg-container">
      {/* LEFT PANEL */}
      <div className="split-reg-left">
        <div className="sr-left-content">
          <div className="sr-logo"><img src={logoImg} alt="ELVOORIQ Logo" style={{ height: '96px' }} /></div>
          
          <div className="sr-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
            JOIN 5,000+ CREATORS
          </div>

          <h1 className="sr-heading">
            Build Your<br />
            <span>Streaming Empire</span>
          </h1>

          <p className="sr-desc">
            Join the premier live streaming management platform built exclusively for women creators. Your career starts here.
          </p>

          <div className="sr-features">
            <div className="sr-feature-item">
              <div className="sr-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
              </div>
              <p>3x average revenue growth in year one</p>
            </div>
            <div className="sr-feature-item">
              <div className="sr-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <p>Access to 500+ brand partnership deals</p>
            </div>
            <div className="sr-feature-item">
              <div className="sr-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                  <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                  <line x1="12" y1="20" x2="12.01" y2="20"></line>
                </svg>
              </div>
              <p>Multi-platform live streaming support</p>
            </div>
            <div className="sr-feature-item">
              <div className="sr-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <p>Dedicated manager from day one</p>
            </div>
          </div>

          <div className="sr-trust">
            <div className="sr-avatar-stack">
              <div className="avatar" style={{background: '#ef4444'}}></div>
              <div className="avatar" style={{background: '#3b82f6'}}></div>
              <div className="avatar" style={{background: '#f59e0b'}}></div>
              <div className="avatar" style={{background: '#8b5cf6'}}></div>
            </div>
            <div className="sr-trust-text">
              <div className="stars">★★★★★</div>
              <p>Trusted by 5,000+ creators</p>
            </div>
          </div>

          <div className="sr-steps-indicator">
            <h4>APPLICATION STEPS</h4>
            <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-num">1</div>
              <span>Account</span>
              <span className="arrow">›</span>
            </div>
            <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-num">2</div>
              <span>Profile</span>
              <span className="arrow">›</span>
            </div>
            <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-num">3</div>
              <span>Platform</span>
              <span className="arrow">›</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (FORM) */}
      <div className="split-reg-right">
        <div className="sr-form-container">
          <h2 className="sr-form-title">Create your account</h2>
          <p className="sr-form-subtitle">Start your creator journey with ELVOORIQ</p>

          <div className="sr-top-stepper">
            <div className={`ts-item ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="ts-num">1</div> Account
            </div>
            <div className="ts-line"></div>
            <div className={`ts-item ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="ts-num">2</div> Profile
            </div>
            <div className="ts-line"></div>
            <div className={`ts-item ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="ts-num">3</div> Platform
            </div>
          </div>

          <form onSubmit={handleSubmit} className="sr-form">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <button type="button" className="sr-social-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  <div className="sr-divider">
                    <span>or sign up with email</span>
                  </div>

                  <div className="sr-input-group">
                    <label>FULL NAME *</label>
                    <div className="sr-input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <input 
                        type="text" 
                        name="fullName"
                        placeholder="Your full name" 
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sr-input-group">
                    <label>EMAIL ADDRESS *</label>
                    <div className="sr-input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <input 
                        type="email" 
                        name="email"
                        placeholder="you@example.com" 
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sr-input-group">
                    <label>PASSWORD *</label>
                    <div className="sr-input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <input 
                        type="password" 
                        name="reg_password"
                        placeholder="Create a strong password" 
                        value={formData.reg_password}
                        onChange={handleChange}
                      />
                      <svg className="sr-eye" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </div>
                  </div>

                  <div className="sr-input-group">
                    <label>CONFIRM PASSWORD *</label>
                    <div className="sr-input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <input 
                        type="password" 
                        name="confirm_password"
                        placeholder="Re-enter your password" 
                        value={formData.confirm_password}
                        onChange={handleChange}
                      />
                      <svg className="sr-eye" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="sr-input-group">
                    <label>AGE *</label>
                    <div className="sr-input-wrapper">
                      <input 
                        type="number" 
                        name="age"
                        placeholder="e.g. 24" 
                        value={formData.age}
                        onChange={handleChange}
                        className="no-icon"
                      />
                    </div>
                  </div>

                  <div className="sr-input-group">
                    <label>COUNTRY *</label>
                    <div className="sr-input-wrapper">
                      <input 
                        type="text" 
                        name="country"
                        placeholder="Where are you located?" 
                        value={formData.country}
                        onChange={handleChange}
                        className="no-icon"
                      />
                    </div>
                  </div>

                  <div className="sr-input-group">
                    <label>WHATSAPP NUMBER (Optional)</label>
                    <div className="sr-input-wrapper">
                      <input 
                        type="tel" 
                        name="whatsapp"
                        placeholder="Include country code" 
                        value={formData.whatsapp}
                        onChange={handleChange}
                        className="no-icon"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="sr-input-group">
                    <label>PRIMARY PLATFORM</label>
                    <select 
                      name="platform" 
                      value={formData.platform} 
                      onChange={handleChange}
                      className="sr-select"
                    >
                      <option value="">Select Platform</option>
                      <option value="twitch">Twitch</option>
                      <option value="youtube">YouTube Live</option>
                      <option value="tiktok">TikTok Live</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="sr-input-group">
                    <label>EXPERIENCE LEVEL</label>
                    <select 
                      name="experience" 
                      value={formData.experience} 
                      onChange={handleChange}
                      className="sr-select"
                    >
                      <option value="">Select Experience</option>
                      <option value="beginner">Just starting out</option>
                      <option value="intermediate">Part-time creator</option>
                      <option value="pro">Full-time professional</option>
                    </select>
                  </div>

                  <div className="sr-input-group">
                    <label>SHORT BIO</label>
                    <div className="sr-input-wrapper">
                      <textarea 
                        name="bio"
                        placeholder="Tell us a little about your content..." 
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <div className="sr-error">{error}</div>}

            <div className="sr-actions">
              {currentStep > 1 && (
                <button type="button" onClick={handleBack} className="sr-btn-back" disabled={isLoading}>
                  Back
                </button>
              )}
              
              <button type="submit" className="sr-btn-next" disabled={isLoading}>
                {isLoading ? 'Processing...' : currentStep === 3 ? 'Complete Registration' : 'Continue →'}
              </button>
            </div>

            {currentStep === 1 && (
              <div className="sr-login-link">
                Already have an account? <Link to="/login">Sign in</Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SplitRegister;
