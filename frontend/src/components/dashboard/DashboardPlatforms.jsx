import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './DashboardPlatforms.css';
import placeholderImage from '../../assets/images/3d_social_icons.png';

const platforms = [
  {
    id: 'youtube',
    name: 'YouTube Live',
    volume: '38%',
    subtitle: '38% of our streaming volume',
    status: 'SUPPORTED',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.13 1 12 1 12s0 3.87.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.87 23 12 23 12s0-3.87-.46-5.58z"></path>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
      </svg>
    )
  },
  {
    id: 'other',
    name: 'Other Platforms',
    volume: '62%',
    subtitle: '62% of our streaming volume (Twitch, Kick, TikTok)',
    status: 'BETA',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    )
  }
];

const features = [
  'Multi-stream',
  'Analytics',
  'Auto-schedule',
  'Gifting',
  'Moderation',
  'Brand Overlay'
];

// Generates randomized heights for the fake audio waveform
const generateWaveform = (count) => {
  return Array.from({ length: count }).map(() => Math.floor(Math.random() * 80) + 20);
};

const DashboardPlatforms = () => {
  const [activePlatform, setActivePlatform] = useState(platforms[0]); // Default to YouTube
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  
  // Static waveform data so it doesn't re-render heights constantly
  const [waveformBars] = useState(generateWaveform(45));

  return (
    <section className="dp-section">
      <div className="dp-container">
        
        {/* Header Area */}
        <motion.div 
          className="dp-header-area"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="dp-label">
            <span className="dp-line"></span> SUPPORTED PLATFORMS
          </div>
          <h2 className="dp-title">
            Stream Everywhere.<br />
            Own Every <span className="dp-highlight">Platform.</span>
          </h2>
        </motion.div>

        {/* Master Card Layout */}
        <motion.div 
          className="dp-master-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
        >
          
          {/* Internal Card Header */}
          <div className="dp-card-header">
            <div className="dp-card-header-left">
              <div className="dp-card-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z"></path>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </div>
              <div className="dp-card-title-group">
                <h3>Live</h3>
                <p>{activePlatform.subtitle}</p>
              </div>
            </div>
            
            <div className={`dp-status ${activePlatform.status === 'SUPPORTED' ? 'supported' : 'beta'}`}>
              <span className="dp-dot"></span>
              {activePlatform.status}
            </div>
          </div>

          {/* Visual Asset */}
          <div className="dp-visual-container">
            <img src={placeholderImage} alt="Social Icons" className="dp-visual-img" />
            <div className="dp-visual-overlay"></div>
            
            <div className="dp-live-badge">
              <span className="dp-dot"></span> LIVE
            </div>
            
            <div className="dp-viewers-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
              </svg>
              42,891
            </div>

            {/* Audio Waveform */}
            <div className="dp-waveform">
              {waveformBars.map((height, i) => (
                <div 
                  key={i} 
                  className="dp-wave-bar" 
                  style={{ 
                    height: `${height}%`,
                    animationDuration: `${Math.random() * 0.5 + 0.3}s`,
                    animationDelay: `${Math.random() * 0.5}s`
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Platform Tabs */}
          <div className="dp-horizontal-tabs">
            {platforms.map((platform) => (
              <div 
                key={platform.id}
                className={`dp-horizontal-tab ${activePlatform.id === platform.id ? 'active' : ''}`}
                onClick={() => {
                  setActivePlatform(platform);
                  setIsComingSoonModalOpen(true);
                }}
              >
                <div className="dp-tab-left">
                  {platform.icon}
                  <span>{platform.name}</span>
                </div>
                <div className="dp-tab-arrow">›</div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="dp-features-grid">
            {features.map((feature, index) => (
              <div className="dp-feature-pill" key={index}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {feature}
              </div>
            ))}
          </div>

        </motion.div>
      </div>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {isComingSoonModalOpen && (
          <motion.div 
            className="cs-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target.classList.contains('cs-modal-overlay')) {
                setIsComingSoonModalOpen(false);
              }
            }}
          >
            <motion.div 
              className="cs-modal-content"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <button 
                className="cs-modal-close" 
                onClick={() => setIsComingSoonModalOpen(false)}
              >
                <X size={20} />
              </button>
              <h2 className="cs-modal-text">Coming soon....</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default DashboardPlatforms;
