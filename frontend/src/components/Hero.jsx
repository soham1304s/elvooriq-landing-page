import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeInUp, staggerContainer } from '../utils/animations';
import './Hero.css';

const Hero = ({ animateHero }) => {
  return (
    <section className="hero">
      
      {/* Background Graphic Effect */}
      <div className="hero-bg-graphic"></div>

      <div className="hero-container container">
        
        {/* Main Content */}
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
            Building the<br/>
            Next Generation<br/>
            of <span className="title-accent">Digital Talent</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="hero-subtitle">
            We help creators grow through talent management, live<br/>
            streaming, strategic partnerships and brand collaborations.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="hero-buttons">
            <Link to="/login" className="btn-primary btn-large">
              Become a Creator
              <ArrowRight size={18} className="btn-icon" />
            </Link>
            <a href="#partner" className="btn-outline btn-large">
              Partner With Us
            </a>
          </motion.div>
          
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="hero-stats"
          variants={staggerContainer}
          initial="hidden"
          animate={animateHero ? "visible" : "hidden"}
        >
          <motion.div variants={fadeInUp} className="stat-item">
            <h3 className="stat-value">5,000<span className="stat-plus">+</span></h3>
            <p className="stat-label">Creators</p>
          </motion.div>
          <motion.div variants={fadeInUp} className="stat-item">
            <h3 className="stat-value">200M<span className="stat-plus">+</span></h3>
            <p className="stat-label">Views</p>
          </motion.div>
          <motion.div variants={fadeInUp} className="stat-item">
            <h3 className="stat-value">50<span className="stat-plus">+</span></h3>
            <p className="stat-label">Brand Partners</p>
          </motion.div>
          <motion.div variants={fadeInUp} className="stat-item">
            <h3 className="stat-value">98<span className="stat-plus">%</span></h3>
            <p className="stat-label">Satisfaction</p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
