import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';
import './IntroLoader.css';

const TELEMETRY_STAGES = [
  {
    threshold: 22,
    badge: 'SYSTEM BOOT // STEP 01',
    status: 'INITIALIZING SECURE NEURAL CORE',
    detail: 'AES-256 ENCRYPTION // SHA-512 KEY EXCHANGE VERIFIED'
  },
  {
    threshold: 48,
    badge: 'INGEST PIPELINE // STEP 02',
    status: 'CONNECTING 4K ULTRA-INGEST MESH',
    detail: 'SIMULCAST RTMP & SRT // 0.18s LOW LATENCY CALIBRATED'
  },
  {
    threshold: 74,
    badge: 'CREATOR PROTOCOLS // STEP 03',
    status: 'SYNCING CERTIFIED CREATOR REVENUE ENGINE',
    detail: 'WRII INDEX: 96.4 // MULTI-CURRENCY SMART ESCROW ACTIVE'
  },
  {
    threshold: 94,
    badge: 'BROADCAST OS // STEP 04',
    status: 'CALIBRATING LUXURY BROADCAST INFRASTRUCTURE',
    detail: 'JAIPUR HQ CENTRAL NODE // GLOBAL EDGE CDN ACCELERATED'
  },
  {
    threshold: 100,
    badge: 'PORTAL READY // STEP 05',
    status: 'SYSTEM OPTIMAL • WELCOME TO ELVOORIQ',
    detail: 'LAUNCHING IMMERSIVE TALENT MANAGEMENT PLATFORM'
  }
];

const IntroLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Generate deterministic stars for cosmic space matching landing page stardust
  const stars = useMemo(() => {
    return Array.from({ length: 54 }).map((_, i) => ({
      id: i,
      x: (i * 37) % 100,
      y: (i * 61) % 100,
      size: (i % 3) + 1.2,
      opacity: 0.2 + ((i % 5) * 0.15),
      duration: 2 + (i % 4) * 1.2,
      delay: (i % 6) * 0.5,
      isGold: i % 2 === 0
    }));
  }, []);

  // Track mouse for subtle 3D parallax tilt
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        }, 350);
      }
    }, intervalTime);

    // Escape key listener to skip
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onComplete]);

  const handleSkip = () => {
    onComplete();
    document.body.style.overflow = 'auto';
  };

  const currentStage = useMemo(() => {
    return TELEMETRY_STAGES.find(s => progress <= s.threshold) || TELEMETRY_STAGES[TELEMETRY_STAGES.length - 1];
  }, [progress]);

  // Generate 28 audio waveform equalizer ring bars
  const equalizerBars = useMemo(() => {
    return Array.from({ length: 32 }).map((_, i) => {
      const angle = (i * 360) / 32;
      return { id: i, angle };
    });
  }, []);

  return (
    <motion.div 
      className="intro-loader"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.08, 
        filter: "blur(14px)", 
        transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } 
      }}
    >
      {/* Dynamic Cosmic Constellation Background */}
      <div className="intro-stars-canvas">
        {stars.map((star) => (
          <div
            key={star.id}
            className="intro-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              background: star.isGold ? '#FFE57F' : '#FFFFFF',
              boxShadow: star.isGold ? '0 0 8px rgba(255, 229, 127, 0.75)' : '0 0 6px rgba(255, 255, 255, 0.85)',
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* Cyber Grid & Perspective Horizon */}
      <div className="intro-cyber-grid" />

      {/* Dual Cosmic Ambient Nebula Glows - Landing Page Gold & Warm Amber */}
      <div className="intro-nebula-glow gold-nebula" />
      <div className="intro-nebula-glow amber-nebula" />

      {/* Main Center Hologram Stage with 3D Mouse Parallax */}
      <div 
        className="intro-center-stage"
        style={{
          transform: `perspective(1000px) rotateY(${mousePos.x * 0.4}deg) rotateX(${-mousePos.y * 0.4}deg)`
        }}
      >
        {/* Holographic Gyroscope Orbit Rings Container */}
        <div className="hologram-rings-box">
          {/* Ambient Cosmic Radial Pulse Core */}
          <div className="hologram-energy-pulse" />

          <svg className="hologram-svg-rings" viewBox="0 0 460 460">
            <defs>
              <linearGradient id="goldStreamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE57F" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#E5C158" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#B38728" stopOpacity="0.2" />
              </linearGradient>

              <linearGradient id="amberStreamGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F5C542" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#2A2520" stopOpacity="0.1" />
              </linearGradient>

              <linearGradient id="champagneArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFF2B2" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
              </linearGradient>

              <filter id="hologramGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ring 1: Outermost Golden Astrolabe Compass Ring (Radius 210) */}
            <g className="ring-astrolabe-outer">
              <circle
                cx="230"
                cy="230"
                r="210"
                fill="none"
                stroke="rgba(229, 193, 88, 0.25)"
                strokeWidth="1.5"
                strokeDasharray="6 14 3 14"
              />
              {/* 4 Cardinal Diamond Star Pointers */}
              <polygon points="230,16 233,20 230,24 227,20" fill="#FFE57F" filter="url(#hologramGlow)" />
              <polygon points="230,436 233,440 230,444 227,440" fill="#FFE57F" filter="url(#hologramGlow)" />
              <polygon points="16,230 20,233 24,230 20,227" fill="#FFE57F" filter="url(#hologramGlow)" />
              <polygon points="436,230 440,233 444,230 440,227" fill="#FFE57F" filter="url(#hologramGlow)" />
            </g>

            {/* Ring 2: Segmented Radiant Amber Laser Ring (Radius 175) */}
            <circle
              cx="230"
              cy="230"
              r="175"
              fill="none"
              stroke="url(#amberStreamGrad)"
              strokeWidth="2.5"
              strokeDasharray="45 20 85 20"
              filter="url(#hologramGlow)"
              className="ring-amber-counter"
            />

            {/* Ring 3: Fast Gold Comet Tracer Ring (Radius 145) */}
            <circle
              cx="230"
              cy="230"
              r="145"
              fill="none"
              stroke="url(#goldStreamGrad)"
              strokeWidth="3.5"
              strokeDasharray="110 50 40 50"
              filter="url(#hologramGlow)"
              className="ring-gold-clockwise"
            />

            {/* Ring 4: Inner Champagne High-Speed Gyro Ring (Radius 118) */}
            <circle
              cx="230"
              cy="230"
              r="118"
              fill="none"
              stroke="url(#champagneArcGrad)"
              strokeWidth="2"
              strokeDasharray="30 15 60 15"
              filter="url(#hologramGlow)"
              className="ring-champagne-orbit"
            />

            {/* Ring 5: Radiating Audio Waveform Ingest Ticks (Radius 96) */}
            <g className="ring-waveform-bars">
              {equalizerBars.map((bar) => (
                <line
                  key={bar.id}
                  x1="230"
                  y1="134"
                  x2="230"
                  y2={134 - ((bar.id % 4) + 1) * 3}
                  stroke={bar.id % 2 === 0 ? '#D4AF37' : '#F5C542'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  transform={`rotate(${bar.angle} 230 230)`}
                  opacity={0.7}
                  className={`wave-tick wave-tick-${bar.id % 4}`}
                />
              ))}
            </g>

            {/* Inner Core Pulsing Golden Halo */}
            <circle
              cx="230"
              cy="230"
              r="82"
              fill="rgba(212, 175, 55, 0.05)"
              stroke="rgba(229, 193, 88, 0.35)"
              strokeWidth="1.5"
              className="ring-core-pulse"
            />
          </svg>

          {/* Center Floating Emblem Showcase with High-Gloss Sheen */}
          <div className="emblem-showcase-wrapper">
            <div className="emblem-ambient-corona" />
            <div className="emblem-image-container">
              <img src={logoImg} alt="ELVOORIQ Luxury Emblem" className="intro-luxury-emblem" />
              {/* Prismatic Shimmer Sheen Beam */}
              <div className="emblem-laser-sheen" />
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry & Branding HUD */}
        <div className="intro-hud-terminal">
          {/* Status Badge Pill */}
          <motion.div 
            className="hud-stage-badge"
            key={currentStage.badge}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="beacon-dot" />
            <span>{currentStage.badge}</span>
          </motion.div>

          {/* Primary Status Line */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentStage.status}
              className="hud-status-headline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {currentStage.status}
            </motion.h2>
          </AnimatePresence>

          {/* Technical Telemetry Subtext */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStage.detail}
              className="hud-telemetry-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {currentStage.detail}
            </motion.p>
          </AnimatePresence>

          {/* Segmented Luxury Progress Gauge */}
          <div className="hud-progress-block">
            <div className="hud-progress-track">
              {/* Progress Fill with Incandescent Head */}
              <div 
                className="hud-progress-fill" 
                style={{ width: `${progress}%` }}
              >
                <div className="hud-fill-head-spark" />
              </div>
              {/* Segmented Calibration Markers */}
              <div className="track-segment-marker" style={{ left: '25%' }} />
              <div className="track-segment-marker" style={{ left: '50%' }} />
              <div className="track-segment-marker" style={{ left: '75%' }} />
            </div>

            {/* Numerical & System Stats Row */}
            <div className="hud-stats-row">
              <span className="hud-sys-stat">CORE: <strong style={{ color: '#4ADE80' }}>ONLINE</strong></span>
              <span className="hud-percentage-metric">
                [ {String(progress).padStart(3, '0')}% ]
              </span>
              <span className="hud-sys-stat">SLA: <strong style={{ color: '#F5C542' }}>99.98%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Skip Control */}
      <button 
        className="intro-skip-button" 
        onClick={handleSkip}
        title="Press ESC or Click to enter platform"
      >
        <span>SKIP SEQUENCE</span>
        <span className="skip-kbd">ESC</span>
      </button>
    </motion.div>
  );
};

export default IntroLoader;
