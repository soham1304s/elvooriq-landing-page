import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeInUp, staggerContainer } from '../utils/animations';
import HeroCanvasBackground from './canvas/HeroCanvasBackground';
import HeroLottieBackground from './HeroLottieBackground';
import HeroRightVisual from './HeroRightVisual';
import './Hero.css';

const Hero = ({ animateHero }) => {
  return (
    <section className="hero">

      {/* GPU-Accelerated Interactive Canvas Background */}
      <HeroCanvasBackground />

      {/* Dynamic Background Waves */}
      <HeroLottieBackground />

      {/* Background Graphic Effect */}
      <div className="hero-bg-graphic"></div>

      <div className="hero-container container">

        {/* 2-Column Split: Content Left + Interactive Lottie Visual Right */}
        <div className="hero-grid-split">
          
          {/* Main Content (Left) */}
          <motion.div
            className="hero-content"
            variants={staggerContainer}
            initial="hidden"
            animate={animateHero ? "visible" : "hidden"}
          >

            <motion.div variants={fadeInUp} className="hero-badge">
              <Sparkles size={16} className="badge-icon" />
              <span>PREMIER CREATOR MANAGEMENT AGENCY</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="hero-title">
              Building the<br />
              Next Generation<br />
              of <span className="title-accent">Digital Talent</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="hero-subtitle">
              We help creators grow through talent management, live<br />
              streaming, strategic partnerships and brand collaborations.
            </motion.p>

            <motion.div variants={fadeInUp} className="hero-buttons">
              <Link to="/login" className="btn-primary btn-large">
                Become a Creator
                <ArrowRight size={18} className="btn-icon" />
              </Link>
            </motion.div>

          </motion.div>

          {/* Dynamic Lottie Animation & Holographic Node (Right) */}
          <motion.div
            className="hero-visual-column"
            initial={{ opacity: 0, scale: 0.92, x: 30 }}
            animate={animateHero ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroRightVisual />
          </motion.div>

        </div>

        {/* Stats Section with Big Stylish Numbers & Dividers */}
        <motion.div
          className="hero-stats"
          variants={staggerContainer}
          initial="hidden"
          animate={animateHero ? "visible" : "hidden"}
        >
          <motion.div variants={fadeInUp} className="stat-item">
            <h3 className="stat-value">1,500<span className="stat-plus">+</span></h3>
            <p className="stat-label">CREATORS MANAGED</p>
          </motion.div>

          <div className="stat-vertical-divider"></div>

          <motion.div variants={fadeInUp} className="stat-item">
            <h3 className="stat-value">65M<span className="stat-plus">+</span></h3>
            <p className="stat-label">VIEWS GENERATED</p>
          </motion.div>

          <div className="stat-vertical-divider"></div>

          <motion.div variants={fadeInUp} className="stat-item">
            <h3 className="stat-value">32<span className="stat-plus">+</span></h3>
            <p className="stat-label">BRAND PARTNERS</p>
          </motion.div>

          <div className="stat-vertical-divider"></div>

          <motion.div variants={fadeInUp} className="stat-item">
            <h3 className="stat-value">96<span className="stat-plus">%</span></h3>
            <p className="stat-label">SATISFACTION RATE</p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
