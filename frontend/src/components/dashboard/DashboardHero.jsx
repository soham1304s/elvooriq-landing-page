import React from 'react';
import { motion } from 'framer-motion';
import './DashboardHero.css';

const DashboardHero = () => {
  return (
    <section className="dashboard-hero-section">
      {/* Background Elements */}
      <div className="dh-bg-overlay"></div>
      <div className="dh-media-backdrop"></div>
      <div className="dh-signal-field" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="dh-light-beams"></div>
      <div className="dh-radial-glow"></div>

      {/* Top Logo / Navigation Area */}
      <nav className="dh-navbar">
        <div className="dh-logo">
          ELV<span>OORI</span>Q
        </div>
      </nav>

      {/* Main Hero Content */}
      <div className="dh-content-container">
        
        {/* Left Side: Text and Buttons */}
        <motion.div 
          className="dh-left-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="dh-badge">
            <span className="live-dot"></span>
            LIVE STREAMING SOLUTIONS
          </div>

          <h1 className="dh-heading">
            <span className="dh-white-text">Go Live.</span><br />
            <span className="dh-green-text">Grow Faster.</span>
          </h1>

          <p className="dh-description">
            We help creators build successful live streaming careers through expert management, audience growth, monetization and brand opportunities.
          </p>

          <div className="dh-button-group">
            <button className="dh-btn dh-btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              Start Streaming
              <span className="arrow">→</span>
            </button>
            <button className="dh-btn dh-btn-outline">
              See How It Works
            </button>
          </div>
        </motion.div>

        {/* Right Side: Floating Cards */}
        <div className="dh-right-content">
          <motion.div 
            className="dh-floating-card dh-live-card"
            initial={{ opacity: 0, y: 50, x: -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
          >
            <div className="card-top">
              <div className="live-badge">
                <span className="live-dot"></span> LIVE
              </div>
              <span className="time">02:14:38</span>
            </div>
            <div className="card-user">
              <div className="avatar"></div>
              <div className="user-info">
                <h4>@amaralive</h4>
                <p>YouTube Live</p>
              </div>
            </div>
            <div className="card-viewers">
              <div className="viewers-top">
                <span>Viewers</span>
                <span className="viewers-graph">
                  <svg width="40" height="15" viewBox="0 0 40 15">
                    <path d="M0,10 Q5,5 10,12 T20,8 T30,12 T40,2" fill="none" stroke="#10b981" strokeWidth="2"/>
                  </svg>
                </span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill"></div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="dh-floating-card dh-revenue-card"
            initial={{ opacity: 0, y: 50, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 1, delay: 0.4, type: "spring" }}
          >
            <p className="subtitle">THIS MONTH</p>
            <h3 className="amount">$24,180</h3>
            <p className="growth">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              +340% vs last year
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Statistics Bar */}
      <motion.div 
        className="dh-stats-bar"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="dh-stat-item">
          <h2>5,000+</h2>
          <p>ACTIVE STREAMERS</p>
        </div>
        <div className="dh-stat-divider"></div>
        <div className="dh-stat-item">
          <h2>$12M+</h2>
          <p>CREATOR REVENUE</p>
        </div>
        <div className="dh-stat-divider"></div>
        <div className="dh-stat-item">
          <h2>200M+</h2>
          <p>LIVE VIEWS/MO</p>
        </div>
        <div className="dh-stat-divider"></div>
        <div className="dh-stat-item">
          <h2>98%</h2>
          <p>RETENTION RATE</p>
        </div>
      </motion.div>
    </section>
  );
};

export default DashboardHero;
