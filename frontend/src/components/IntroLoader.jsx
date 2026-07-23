import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';
import './IntroLoader.css';

const IntroLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Lock body scroll during intro
    document.body.style.overflow = 'hidden';

    const duration = 2800; // 2.8s total loading sequence
    const intervalTime = 30; // update every 30ms
    const totalSteps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      const currentProgress = Math.min(Math.round((currentStep / totalSteps) * 100), 100);
      setProgress(currentProgress);

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
          document.body.style.overflow = 'auto';
        }, 200);
      }
    }, intervalTime);

    return () => {
      clearInterval(timer);
      document.body.style.overflow = 'auto';
    };
  }, [onComplete]);

  const handleSkip = () => {
    onComplete();
    document.body.style.overflow = 'auto';
  };

  return (
    <motion.div 
      className="intro-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="intro-ambient-glow"></div>

      <div className="intro-content-wrapper">
        <div className="lottie-container-box">
          {/* Animated SVG Signal Orbit Rings */}
          <svg className="lottie-animation" viewBox="0 0 400 400" width="100%" height="100%">
            <defs>
              <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00C988" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9D4EDD" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#00C988" stopOpacity="0.3" />
              </linearGradient>
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Rotating Emerald Ring */}
            <motion.circle
              cx="200"
              cy="200"
              r="150"
              fill="none"
              stroke="url(#emeraldGrad)"
              strokeWidth="3"
              strokeDasharray="40 15 80 15"
              filter="url(#glowFilter)"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              style={{ transformOrigin: '200px 200px' }}
            />

            {/* Middle Reverse Rotating Purple Ring */}
            <motion.circle
              cx="200"
              cy="200"
              r="115"
              fill="none"
              stroke="url(#purpleGrad)"
              strokeWidth="4"
              strokeDasharray="60 20 40 20"
              filter="url(#glowFilter)"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
              style={{ transformOrigin: '200px 200px' }}
            />

            {/* Inner Pulsing Signal Core */}
            <motion.circle
              cx="200"
              cy="200"
              r="75"
              fill="rgba(0, 201, 136, 0.08)"
              stroke="#00C988"
              strokeWidth="2"
              animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              style={{ transformOrigin: '200px 200px' }}
            />
          </svg>

          {/* Centered ELVOORIQ Logo */}
          <img src={logoImg} alt="ELVOORIQ Logo" className="intro-logo-img" />
        </div>

        <motion.h1 
          className="intro-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ELVOORIQ
        </motion.h1>

        <motion.p 
          className="intro-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Built for Women Who Lead
        </motion.p>

        <div className="intro-progress-container">
          <div className="intro-progress-track">
            <div className="intro-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="intro-progress-text">{progress}%</span>
        </div>
      </div>

      <button className="intro-skip-btn" onClick={handleSkip}>
        SKIP INTRO →
      </button>
    </motion.div>
  );
};

export default IntroLoader;
