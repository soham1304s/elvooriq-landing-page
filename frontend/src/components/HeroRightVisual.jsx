import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  ArrowUpRight,
  Megaphone,
  ArrowRight
} from 'lucide-react';
import aishwaryaImg from '../assets/5.png';
import './HeroRightVisual.css';

const HeroRightVisual = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mobileCardIndex, setMobileCardIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance mobile achievement showcase cards every 3.8s
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setMobileCardIndex((prev) => (prev + 1) % 5);
    }, 3800);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

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
      {/* Ambient Luxury Gold Orbs */}
      <div className="visual-ambient-orb orb-gold-radiance"></div>
      <div className="visual-ambient-orb orb-warm-glow"></div>

      {/* Main 3D Container with Parallax Tilt */}
      <motion.div 
        className="visual-core-container"
        animate={{
          rotateX: mousePos.y * -8,
          rotateY: mousePos.x * 8
        }}
        transition={{ type: "spring", damping: 26, stiffness: 150 }}
      >
        
        {/* Central Creator Stage */}
        <div className="creator-stage-center">
          {/* Radiant Golden Glow Aura Behind Creator */}
          <div className="creator-aura-glow"></div>
          <div className="creator-contour-ring ring-1"></div>
          <div className="creator-contour-ring ring-2"></div>
          <div className="creator-contour-ring ring-3"></div>

          {/* Authentic Creator Photo Frame */}
          <div className="creator-photo-frame">
            <img 
              src="/creators/hero_main_creator.jpg" 
              alt="Elite Digital Creator with Gold Laptop" 
              className="creator-hero-img"
            />
            <div className="creator-img-gradient-overlay"></div>
            
            {/* Luminous Glow Particles Rising from Laptop */}
            <div className="laptop-gold-aura"></div>
          </div>

          {/* Gold Cursive Script Beside Laptop */}
          <motion.div 
            className="script-annotation script-grow"
            animate={{ rotate: [-0.5, 0.5, -0.5] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            <span>Create</span>
            <span>Collaborate</span>
            <span className="script-grow-heart">Grow ♡</span>
          </motion.div>

          {/* Far-Right Vertical Gold Cursive Script */}
          <div className="script-vertical-column">
            <span>Real</span>
            <span>Creators.</span>
            <span>Real Brands.</span>
            <span>Bigger</span>
            <span>Tomorrows.</span>
          </div>

          {/* ======================================================== */}
          {/* MOBILE DEDICATED ANIMATED SHOWCASE (Phone View Only)      */}
          {/* ======================================================== */}
          <div className="mobile-animated-showcase">
            {/* Micro Live 4K Beacon Chip (Top-Left) */}
            <motion.div 
              className="mobile-live-beacon-chip"
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut" }}
            >
              <span className="mobile-live-dot"></span>
              <Radio size={11} className="live-icon" />
              <span>LIVE 4K • 60FPS</span>
            </motion.div>

            {/* Cycling Luxury Achievement Card Dock (Bottom) */}
            <div 
              className="mobile-showcase-dock"
              onTouchStart={() => setIsAutoPlaying(false)}
              onTouchEnd={() => setIsAutoPlaying(true)}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div className="mobile-card-slot">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mobileCardIndex}
                    className="mobile-card-frame float-card"
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Slide 0: Aishwarya H. Revenue Surge */}
                    {mobileCardIndex === 0 && (
                      <div className="m-card-inner">
                        <div className="growth-creator-row">
                          <img src={aishwaryaImg} alt="Aishwarya" className="creator-thumb" />
                          <div className="creator-meta">
                            <div className="creator-title-row">
                              <span className="creator-name">Aishwarya H.</span>
                              <CheckCircle2 size={13} className="verified-check" />
                            </div>
                            <span className="creator-sub">Tech & Lifestyle</span>
                          </div>
                          <span className="multiplier-badge-green">+44x</span>
                        </div>
                        <div className="sparkline-container">
                          <svg className="sparkline-svg" viewBox="0 0 180 45">
                            <defs>
                              <linearGradient id="goldSparkGradMob" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#F5C542" stopOpacity="0.45" />
                                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path d="M0,38 Q35,34 60,26 T115,18 T155,8 L180,3 L180,45 L0,45 Z" fill="url(#goldSparkGradMob)" />
                            <path d="M0,38 Q35,34 60,26 T115,18 T155,8 L180,3" fill="none" stroke="#F5C542" strokeWidth="2.8" strokeLinecap="round" />
                            <circle cx="180" cy="3" r="4.5" fill="#F5C542" />
                          </svg>
                        </div>
                        <div className="growth-footer-row">
                          <span className="growth-label">REVENUE EXPANSION</span>
                          <span className="growth-value">₹18,500/mo <ArrowUpRight size={13} /></span>
                        </div>
                      </div>
                    )}

                    {/* Slide 1: Tier-1 Brand Partnership */}
                    {mobileCardIndex === 1 && (
                      <div className="m-card-inner">
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
                      </div>
                    )}

                    {/* Slide 2: Content Growth */}
                    {mobileCardIndex === 2 && (
                      <div className="m-card-inner">
                        <div className="card-top-row">
                          <div className="growth-title-pill">
                            <TrendingUp size={13} className="growth-icon" />
                            <span>CONTENT GROWTH</span>
                          </div>
                          <span className="multiplier-badge-green">+74%</span>
                        </div>
                        <div className="growth-bars-row">
                          {[35, 48, 62, 75, 88, 100].map((h, i) => (
                            <div key={i} className="growth-bar-track">
                              <motion.div 
                                className="growth-bar-fill"
                                style={{ height: `${h}%` }}
                                animate={{ opacity: [0.75, 1, 0.75], scaleY: [0.92, 1.05, 0.92] }}
                                transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.18, ease: "easeInOut" }}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="growth-metrics-split">
                          <div className="growth-metric-col">
                            <span className="metric-big-num">2.4M</span>
                            <span className="metric-sub-label">Total Views</span>
                          </div>
                          <div className="growth-metric-col">
                            <span className="metric-big-num">184K</span>
                            <span className="metric-sub-label">New Followers</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Slide 3: Samsung Brand Campaign */}
                    {mobileCardIndex === 3 && (
                      <div className="m-card-inner">
                        <div className="card-top-row">
                          <div className="campaign-header-left">
                            <Megaphone size={14} className="campaign-icon" />
                            <span>BRAND CAMPAIGN</span>
                          </div>
                          <span className="featured-pill">Featured</span>
                        </div>
                        <div className="campaign-body-row">
                          <div className="campaign-thumb-box">
                            <img src="/campaigns/samsung_campaign.jpg" alt="Samsung Device" className="campaign-thumb-img" />
                          </div>
                          <div className="campaign-info-box">
                            <h4 className="campaign-title">Samsung Creator Campaign</h4>
                            <div className="campaign-tag-pills">
                              <span className="camp-tag">Tech</span>
                              <span className="camp-tag">Lifestyle</span>
                            </div>
                          </div>
                        </div>
                        <div className="campaign-footer-row">
                          <div className="camp-value-box">
                            <span className="camp-val-label">Campaign Value</span>
                            <span className="camp-val-amount">₹1,20,000</span>
                          </div>
                          <span className="camp-verified-badge">Verified Deal <ArrowRight size={11} /></span>
                        </div>
                      </div>
                    )}

                    {/* Slide 4: Broadcast Infrastructure SLA */}
                    {mobileCardIndex === 4 && (
                      <div className="m-card-inner">
                        <div className="card-top-row">
                          <div className="chip-header-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="chip-icon-box" style={{ width: '26px', height: '26px' }}>
                              <Zap size={14} className="chip-icon" />
                            </div>
                            <span className="chip-label" style={{ fontSize: '0.74rem', fontWeight: 800 }}>BROADCAST SLA</span>
                          </div>
                          <span className="bitrate-tag">4K 60FPS</span>
                        </div>
                        <div className="soundwave-bars" style={{ margin: '8px 0' }}>
                          {[40, 75, 55, 95, 45, 80, 100, 70, 90, 50, 65, 95, 60, 85].map((h, i) => (
                            <motion.span 
                              key={i}
                              className="soundwave-bar"
                              animate={{ scaleY: [0.35, 1.35, 0.5, 1.15, 0.35] }}
                              transition={{ repeat: Infinity, duration: 1.15, delay: i * 0.075, ease: "easeInOut" }}
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                        <div className="card-bottom-row">
                          <span className="chip-number" style={{ fontSize: '1.25rem', color: '#10B981', fontWeight: 800 }}>99.98%</span>
                          <span className="metric-highlight">0.18s RTMP Latency</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Interactive Golden Progress Navigation Dots */}
              <div className="mobile-showcase-nav-dots">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`mobile-dot-btn ${idx === mobileCardIndex ? 'active' : ''}`}
                    onClick={() => {
                      setMobileCardIndex(idx);
                      setIsAutoPlaying(false);
                      setTimeout(() => setIsAutoPlaying(true), 6000);
                    }}
                    title={`View achievement ${idx + 1}`}
                  >
                    {idx === mobileCardIndex && (
                      <motion.span 
                        className="mobile-dot-fill-progress"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.8, ease: "linear" }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP 6 FLOATING CARDS (Hidden on Mobile)              */}
        {/* ======================================================== */}
        <div className="desktop-float-cards">
          {/* Card 1: LIVE CONTENT (Top Left) */}
          <motion.div 
            className="float-card card-live-content"
            animate={{
              y: [-6, 6, -6],
              x: [-2, 2, -2]
            }}
            transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut" }}
          >
            <div className="card-top-row">
              <div className="live-status-pill">
                <span className="live-dot-pulse"></span>
                <Radio size={12} className="live-icon" />
                <span>LIVE CONTENT</span>
              </div>
              <span className="bitrate-tag">4K 60FPS</span>
            </div>

            <div className="soundwave-bars">
              {[40, 75, 55, 95, 45, 80, 100, 70, 90, 50, 65, 95, 60, 85].map((h, i) => (
                <motion.span 
                  key={i}
                  className="soundwave-bar"
                  animate={{
                    scaleY: [0.35, 1.35, 0.5, 1.15, 0.35]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.15,
                    delay: i * 0.075,
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

          {/* Card 2: CONTENT GROWTH (Mid Left) */}
          <motion.div 
            className="float-card card-content-growth"
            animate={{
              y: [5, -7, 5],
              x: [2, -3, 2]
            }}
            transition={{ repeat: Infinity, duration: 5.8, ease: "easeInOut", delay: 0.3 }}
          >
            <div className="card-top-row">
              <div className="growth-title-pill">
                <TrendingUp size={13} className="growth-icon" />
                <span>CONTENT GROWTH</span>
              </div>
              <span className="multiplier-badge-green">+74%</span>
            </div>

            <div className="growth-bars-row">
              {[35, 48, 62, 75, 88, 100].map((h, i) => (
                <div key={i} className="growth-bar-track">
                  <motion.div 
                    className="growth-bar-fill"
                    style={{ height: `${h}%` }}
                    animate={{
                      opacity: [0.75, 1, 0.75],
                      scaleY: [0.92, 1.05, 0.92]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.2,
                      delay: i * 0.18,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="growth-metrics-split">
              <div className="growth-metric-col">
                <span className="metric-big-num">2.4M</span>
                <span className="metric-sub-label">Total Views</span>
              </div>
              <div className="growth-metric-col">
                <span className="metric-big-num">184K</span>
                <span className="metric-sub-label">New Followers</span>
              </div>
            </div>

            <div className="card-social-strip">
              <div className="social-badge badge-yt" title="YouTube">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <div className="social-badge badge-ig" title="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </div>
              <div className="social-badge badge-tk" title="TikTok">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.46 6.27 6.27 0 0 0 1.84-4.46V8.75a8.28 8.28 0 0 0 4.93 1.62V6.92a4.83 4.83 0 0 1-1-.23z"/>
                </svg>
              </div>
              <div className="social-badge badge-sp" title="Spotify">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 17.3a.69.69 0 0 1-.95.23c-2.6-1.59-5.88-1.95-9.74-1.07a.69.69 0 1 1-.3-1.35c4.22-.97 7.84-.56 10.76 1.24.32.2.42.63.23.95zm1.47-3.27a.86.86 0 0 1-1.18.28c-2.98-1.83-7.52-2.36-11.04-1.29a.86.86 0 1 1-.5-1.65c4.02-1.22 9.03-.63 12.44 1.48.38.23.5.73.28 1.18zm.13-3.4c-3.57-2.12-9.47-2.32-12.89-1.28a1.03 1.03 0 1 1-.6-2c3.93-1.19 10.45-.96 14.57 1.49a1.03 1.03 0 1 1-1.08 1.79z"/>
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Aishwarya H. (Top Right) */}
          <motion.div 
            className="float-card card-revenue-expansion"
            animate={{
              y: [6, -6, 6],
              x: [-3, 3, -3]
            }}
            transition={{ repeat: Infinity, duration: 6.2, ease: "easeInOut", delay: 0.5 }}
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
              <span className="multiplier-badge-green">+44x</span>
            </div>

            <div className="sparkline-container">
              <svg className="sparkline-svg" viewBox="0 0 180 45">
                <defs>
                  <linearGradient id="goldSparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F5C542" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,38 Q35,34 60,26 T115,18 T155,8 L180,3 L180,45 L0,45 Z" 
                  fill="url(#goldSparkGrad)" 
                />
                <path 
                  d="M0,38 Q35,34 60,26 T115,18 T155,8 L180,3" 
                  fill="none" 
                  stroke="#F5C542" 
                  strokeWidth="2.8" 
                  strokeLinecap="round" 
                />
                <circle cx="180" cy="3" r="4.5" fill="#F5C542" />
              </svg>
            </div>

            <div className="growth-footer-row">
              <span className="growth-label">REVENUE EXPANSION</span>
              <span className="growth-value">₹18,500/mo <ArrowUpRight size={13} /></span>
            </div>
          </motion.div>

          {/* Card 4: Brand Campaign (Mid Right) */}
          <motion.div 
            className="float-card card-brand-campaign"
            animate={{
              y: [-6, 6, -6],
              x: [2, -2, 2]
            }}
            transition={{ repeat: Infinity, duration: 5.6, ease: "easeInOut", delay: 0.9 }}
          >
            <div className="card-top-row">
              <div className="campaign-header-left">
                <Megaphone size={14} className="campaign-icon" />
                <span>BRAND CAMPAIGN</span>
              </div>
              <span className="featured-pill">Featured</span>
            </div>

            <div className="campaign-body-row">
              <div className="campaign-thumb-box">
                <img 
                  src="/campaigns/samsung_campaign.jpg" 
                  alt="Samsung Device" 
                  className="campaign-thumb-img"
                />
              </div>
              <div className="campaign-info-box">
                <h4 className="campaign-title">Samsung Creator Campaign</h4>
                <div className="campaign-tag-pills">
                  <span className="camp-tag">Tech</span>
                  <span className="camp-tag">Lifestyle</span>
                </div>
              </div>
            </div>

            <div className="campaign-footer-row">
              <div className="camp-value-box">
                <span className="camp-val-label">Campaign Value</span>
                <span className="camp-val-amount">₹1,20,000</span>
              </div>
              <button type="button" className="camp-action-btn">
                View Opportunity <ArrowRight size={12} />
              </button>
            </div>
          </motion.div>

          {/* Floating Badge 5: 99.98% SLA (Bottom Left/Center) */}
          <motion.div 
            className="float-card card-performance-chip"
            animate={{
              y: [-5, 5, -5],
              x: [2, -2, 2]
            }}
            transition={{ repeat: Infinity, duration: 4.6, ease: "easeInOut", delay: 1.4 }}
          >
            <div className="chip-icon-box">
              <Zap size={14} className="chip-icon" />
            </div>
            <div className="chip-text-box">
              <span className="chip-number">99.98%</span>
              <span className="chip-label">Broadcast Uptime SLA</span>
            </div>
          </motion.div>

          {/* Floating Card 6: Tier-1 Brand Partnership (Bottom R) */}
          <motion.div 
            className="float-card card-brand-deal"
            animate={{
              y: [5, -5, 5],
              x: [-2, 2, -2]
            }}
            transition={{ repeat: Infinity, duration: 5.4, ease: "easeInOut", delay: 1.1 }}
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
        </div>

      </motion.div>
    </div>
  );
};

export default HeroRightVisual;
