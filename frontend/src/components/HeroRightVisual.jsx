import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, TrendingUp, ShieldCheck, Sparkles, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react';
import aishwaryaImg from '../assets/5.png';
import './HeroRightVisual.css';

const HeroRightVisual = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div 
      className="hero-visual-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Ambient Aura */}
      <div className="visual-ambient-orb orb-emerald"></div>
      <div className="visual-ambient-orb orb-sapphire"></div>
      <div className="visual-ambient-orb orb-violet"></div>

      {/* Main 3D Container with Parallax Tilt */}
      <motion.div 
        className="visual-core-container"
        animate={{
          rotateX: mousePos.y * -14,
          rotateY: mousePos.x * 14
        }}
        transition={{ type: "spring", damping: 20, stiffness: 120 }}
      >
        {/* Animated Holographic Orbital SVG Rings */}
        <div className="orbital-svg-box">
          <svg className="orbital-svg" viewBox="0 0 500 500">
            <defs>
              <linearGradient id="orbGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f59b" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="orbGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#00f59b" stopOpacity="0.2" />
              </linearGradient>
              <filter id="svgGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Ring 1 */}
            <motion.circle
              cx="250"
              cy="250"
              r="210"
              fill="none"
              stroke="url(#orbGrad1)"
              strokeWidth="2"
              strokeDasharray="60 25 120 25"
              filter="url(#svgGlow)"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
              style={{ transformOrigin: "250px 250px" }}
            />

            {/* Middle Ring 2 - Reverse */}
            <motion.circle
              cx="250"
              cy="250"
              r="165"
              fill="none"
              stroke="url(#orbGrad2)"
              strokeWidth="2.5"
              strokeDasharray="40 18 80 18"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
              style={{ transformOrigin: "250px 250px" }}
            />

            {/* Inner Ring 3 */}
            <motion.circle
              cx="250"
              cy="250"
              r="120"
              fill="none"
              stroke="rgba(0, 245, 155, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="15 15"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              style={{ transformOrigin: "250px 250px" }}
            />

            {/* Connecting Geometry Spokes */}
            <line x1="250" y1="40" x2="250" y2="460" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="40" y1="250" x2="460" y2="250" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="6 6" />
          </svg>

          {/* Central Holographic Emblem Core */}
          <div className="hologram-central-node">
            <motion.div 
              className="central-pulse-disc"
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Sparkles size={32} className="central-sparkle-icon" />
            </motion.div>
            <span className="core-label">ELVOORIQ OS</span>
          </div>
        </div>

        {/* Floating Interactive Card 1: Live Streaming Ingest */}
        <motion.div 
          className="float-card card-stream-ingest"
          animate={{
            y: [-8, 8, -8],
            x: [-4, 4, -4]
          }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          <div className="card-top-row">
            <div className="live-status-pill">
              <span className="live-dot-pulse"></span>
              <Radio size={13} className="live-icon" />
              <span>LIVE INGEST</span>
            </div>
            <span className="bitrate-tag">4K 60FPS</span>
          </div>

          <div className="soundwave-bars">
            {[45, 80, 60, 95, 40, 75, 90, 65, 85, 50, 70, 95, 60, 80].map((h, i) => (
              <motion.span 
                key={i}
                className="soundwave-bar"
                animate={{
                  scaleY: [0.4, 1.4, 0.6, 1.2, 0.4]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: i * 0.08,
                  ease: "easeInOut"
                }}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <div className="card-bottom-row">
            <span className="metric-muted">Simulcast RTMP</span>
            <span className="metric-highlight">0.18s Latency</span>
          </div>
        </motion.div>

        {/* Floating Interactive Card 2: Creator Growth & Multiplier */}
        <motion.div 
          className="float-card card-growth-stat"
          animate={{
            y: [8, -8, 8],
            x: [4, -4, 4]
          }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="growth-creator-row">
            <img src={aishwaryaImg} alt="Aishwarya" className="creator-thumb" />
            <div className="creator-meta">
              <div className="creator-title-row">
                <span className="creator-name">Aishwarya H.</span>
                <CheckCircle2 size={13} className="verified-check" />
              </div>
              <span className="creator-sub">Tech & Lifestyle</span>
            </div>
            <span className="multiplier-badge">+44x</span>
          </div>

          <div className="sparkline-container">
            <svg className="sparkline-svg" viewBox="0 0 160 40">
              <defs>
                <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00f59b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00f59b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d="M0,35 Q30,30 50,22 T100,16 T140,6 L160,2 L160,40 L0,40 Z" 
                fill="url(#sparkGrad)" 
              />
              <path 
                d="M0,35 Q30,30 50,22 T100,16 T140,6 L160,2" 
                fill="none" 
                stroke="#00f59b" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
              <circle cx="160" cy="2" r="4" fill="#00f59b" />
            </svg>
          </div>

          <div className="growth-footer-row">
            <span className="growth-label">Revenue Expansion</span>
            <span className="growth-value">₹18,500/mo <ArrowUpRight size={13} /></span>
          </div>
        </motion.div>

        {/* Floating Interactive Card 3: Brand Deal Escrow */}
        <motion.div 
          className="float-card card-brand-deal"
          animate={{
            y: [-6, 6, -6],
            x: [3, -3, 3]
          }}
          transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1 }}
        >
          <div className="deal-header-row">
            <div className="deal-icon-circle">
              <ShieldCheck size={16} className="deal-icon" />
            </div>
            <div className="deal-title-box">
              <span className="deal-title">Tier-1 Brand Partnership</span>
              <span className="deal-status">Escrow Confirmed • Guaranteed</span>
            </div>
          </div>
          <div className="deal-amount-box">
            <span className="deal-amount">$120,000</span>
            <span className="deal-period">/ ANNUAL RETAINER</span>
          </div>
        </motion.div>

        {/* Floating Interactive Card 4: Performance Metric */}
        <motion.div 
          className="float-card card-performance-chip"
          animate={{
            y: [6, -6, 6],
            x: [-4, 4, -4]
          }}
          transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 1.5 }}
        >
          <div className="chip-icon-box">
            <Zap size={14} className="chip-icon" />
          </div>
          <div className="chip-text-box">
            <span className="chip-number">99.98%</span>
            <span className="chip-label">Broadcast Uptime SLA</span>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default HeroRightVisual;
