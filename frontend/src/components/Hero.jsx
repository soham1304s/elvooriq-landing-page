import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  TrendingUp, 
  Users, 
  Rocket, 
  ShieldCheck, 
  Eye, 
  Heart, 
  Globe, 
  X,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeInUp, staggerContainer } from '../utils/animations';
import HeroLuxuryBackground from './canvas/HeroLuxuryBackground';
import HeroRightVisual from './HeroRightVisual';
import './Hero.css';

const Hero = ({ animateHero }) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section className="hero">
      {/* Dynamic Luxury Golden Animated Background */}
      <HeroLuxuryBackground />

      {/* Background Graphic Effect for Ambient Depth */}
      <div className="hero-bg-graphic"></div>

      <div className="hero-container container">
        {/* 2-Column Split: Content Left + Interactive Visual Right */}
        <div className="hero-grid-split">
          
          {/* Main Content (Left) */}
          <motion.div
            className="hero-content"
            variants={staggerContainer}
            initial="hidden"
            animate={animateHero ? "visible" : "hidden"}
          >
            {/* Top Pill Badge */}
            <motion.div variants={fadeInUp} className="hero-badge">
              <Sparkles size={15} className="badge-icon" />
              <span>PREMIER CREATOR MANAGEMENT AGENCY</span>
            </motion.div>

            {/* Main Hero Title */}
            <motion.h1 variants={fadeInUp} className="hero-title">
              Building the<br />
              Next Generation<br />
              of <span className="title-accent">Digital Talent</span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p variants={fadeInUp} className="hero-subtitle">
              We help creators grow through talent management, live<br className="desktop-br" />
              streaming, strategic partnerships and brand collaborations.
            </motion.p>

            {/* CTA Buttons: Become a Creator + Watch Video */}
            <motion.div variants={fadeInUp} className="hero-buttons">
              <Link to="/login" className="btn-primary btn-large">
                <span>Become a Creator</span>
                <ArrowRight size={18} className="btn-icon" />
              </Link>

              <button 
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="btn-watch-video btn-large"
                aria-label="Watch Introduction Video"
              >
                <span className="play-icon-circle">
                  <Play size={14} fill="currentColor" />
                </span>
                <span>Watch Video</span>
              </button>
            </motion.div>

            {/* 4 Feature Badges Row (Grow, Partner, Maximize, Support) */}
            <motion.div variants={fadeInUp} className="hero-feature-pills">
              <div className="feature-pill-card">
                <div className="pill-icon-wrap">
                  <TrendingUp size={16} />
                </div>
                <div className="pill-text-wrap">
                  <span className="pill-title">Grow</span>
                  <span className="pill-desc">Your Audience</span>
                </div>
              </div>

              <div className="feature-pill-card">
                <div className="pill-icon-wrap">
                  <Users size={16} />
                </div>
                <div className="pill-text-wrap">
                  <span className="pill-title">Partner</span>
                  <span className="pill-desc">with Brands</span>
                </div>
              </div>

              <div className="feature-pill-card">
                <div className="pill-icon-wrap">
                  <Rocket size={16} />
                </div>
                <div className="pill-text-wrap">
                  <span className="pill-title">Maximize</span>
                  <span className="pill-desc">Your Revenue</span>
                </div>
              </div>

              <div className="feature-pill-card">
                <div className="pill-icon-wrap">
                  <ShieldCheck size={16} />
                </div>
                <div className="pill-text-wrap">
                  <span className="pill-title">Full-Stack</span>
                  <span className="pill-desc">Creator Support</span>
                </div>
              </div>
            </motion.div>

            {/* Creator Social Proof Stack */}
            <motion.div variants={fadeInUp} className="hero-social-proof">
              <div className="avatar-stack">
                <img src="/creators/creator_1.webp" alt="Creator" className="stack-avatar" />
                <img src="/creators/somya_gupta.webp" alt="Creator" className="stack-avatar" />
                <img src="/creators/creator_2.webp" alt="Creator" className="stack-avatar" />
                <img src="/creators/kritika_khurana.webp" alt="Creator" className="stack-avatar" />
              </div>
              <p className="social-proof-text">
                Join thousands of creators shaping the future with <strong className="brand-emphasis">Elvooriq</strong>
              </p>
            </motion.div>

          </motion.div>

          {/* Dynamic Interactive Hero Visual (Right) */}
          <motion.div
            className="hero-visual-column"
            initial={{ opacity: 0, scale: 0.94, x: 25 }}
            animate={animateHero ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroRightVisual />
          </motion.div>

        </div>

        {/* 5-Column Stats Banner */}
        <motion.div
          className="hero-stats"
          variants={staggerContainer}
          initial="hidden"
          animate={animateHero ? "visible" : "hidden"}
        >
          {/* Stat 1 */}
          <motion.div variants={fadeInUp} className="stat-item">
            <div className="stat-icon-circle">
              <Bell size={18} className="stat-col-icon" />
            </div>
            <div className="stat-content-box">
              <h3 className="stat-value">1,500<span className="stat-plus">+</span></h3>
              <p className="stat-label">CREATORS MANAGED</p>
            </div>
          </motion.div>

          <div className="stat-vertical-divider"></div>

          {/* Stat 2 */}
          <motion.div variants={fadeInUp} className="stat-item">
            <div className="stat-icon-circle">
              <Eye size={18} className="stat-col-icon" />
            </div>
            <div className="stat-content-box">
              <h3 className="stat-value">65M<span className="stat-plus">+</span></h3>
              <p className="stat-label">VIEWS GENERATED</p>
            </div>
          </motion.div>

          <div className="stat-vertical-divider"></div>

          {/* Stat 3 */}
          <motion.div variants={fadeInUp} className="stat-item">
            <div className="stat-icon-circle">
              <Users size={18} className="stat-col-icon" />
            </div>
            <div className="stat-content-box">
              <h3 className="stat-value">32<span className="stat-plus">+</span></h3>
              <p className="stat-label">BRAND PARTNERS</p>
            </div>
          </motion.div>

          <div className="stat-vertical-divider"></div>

          {/* Stat 4 */}
          <motion.div variants={fadeInUp} className="stat-item">
            <div className="stat-icon-circle">
              <Heart size={18} className="stat-col-icon" />
            </div>
            <div className="stat-content-box">
              <h3 className="stat-value">96<span className="stat-plus">%</span></h3>
              <p className="stat-label">SATISFACTION RATE</p>
            </div>
          </motion.div>

          <div className="stat-vertical-divider"></div>

          {/* Stat 5: Value Highlights Bullet List */}
          <motion.div variants={fadeInUp} className="stat-item stat-item-highlights">
            <div className="stat-icon-circle">
              <Globe size={20} className="stat-col-icon" />
            </div>
            <ul className="stat-highlights-list">
              <li>
                <span className="bullet-dot"></span>
                <span>Global Reach</span>
              </li>
              <li>
                <span className="bullet-dot"></span>
                <span>Creator-First Technology</span>
              </li>
              <li>
                <span className="bullet-dot"></span>
                <span>Trusted by Top Brands</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

      </div>

      {/* Video Modal Preview */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div 
            className="hero-video-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div 
              className="hero-video-modal-content"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="video-modal-close-btn"
                onClick={() => setIsVideoModalOpen(false)}
                aria-label="Close Video"
              >
                <X size={20} />
              </button>
              
              <div className="video-player-wrapper">
                <iframe 
                  src="https://www.youtube.com/embed/HBYkbqACOBg?autoplay=1" 
                  title="Elvooriq Creator Journey"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="video-modal-iframe"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Hero;
