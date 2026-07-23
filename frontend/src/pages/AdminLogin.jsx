import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin1234@gmail.com' && password === '123456') {
      localStorage.setItem('elvooriq_admin_auth', 'true');
      navigate('/admin');
    } else {
      setError('Invalid admin credentials. Please try again.');
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
          <h2><img src={logoImg} alt="ELVOORIQ Logo" style={{ height: '96px' }} /></h2>
          <p>Security Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          {error && <div className="admin-error-message">{error}</div>}

          <div className="admin-input-group">
            <label>Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@elvooriq.com"
              required 
            />
          </div>

          <div className="admin-input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="admin-login-btn">
            Access Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
