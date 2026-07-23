import React from 'react';
import { Star, Globe, Medal, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import './ResultsSection.css';

const ResultsSection = () => {
  return (
    <section className="results-section" id="results">
      <div className="results-container container">
        
        {/* Header */}
        <motion.div 
          className="results-header-container"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="section-header-center">
            <span className="section-line-light"></span>
            <span className="section-subtitle-light">WHY ELVOORIQ</span>
            <span className="section-line-light"></span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="results-title">
            Results That Speak<br/>
            <span className="title-highlight-light">for Themselves</span>
          </motion.h2>
        </motion.div>

        {/* Statistics Banner */}
        <motion.div 
          className="stats-banner"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="stat-item">
            <h3 className="stat-number">5,000<span className="stat-plus">+</span></h3>
            <p className="stat-label">CREATORS MANAGED</p>
          </motion.div>
          <motion.div variants={fadeInUp} className="stat-divider"></motion.div>
          <motion.div variants={fadeInUp} className="stat-item">
            <h3 className="stat-number">98<span className="stat-plus">%</span></h3>
            <p className="stat-label">SATISFACTION RATE</p>
          </motion.div>
          <motion.div variants={fadeInUp} className="stat-divider"></motion.div>
          <motion.div variants={fadeInUp} className="stat-item">
            <h3 className="stat-number">200M<span className="stat-plus">+</span></h3>
            <p className="stat-label">VIEWS GENERATED</p>
          </motion.div>
          <motion.div variants={fadeInUp} className="stat-divider"></motion.div>
          <motion.div variants={fadeInUp} className="stat-item">
            <h3 className="stat-number">50<span className="stat-plus">+</span></h3>
            <p className="stat-label">BRAND PARTNERS</p>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="results-features-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          
          <motion.div variants={fadeInUp} className="result-feature-card">
            <div className="result-icon-wrapper">
              <Star size={20} strokeWidth={1.5} />
            </div>
            <h4 className="result-feature-title">Creator Success</h4>
            <p className="result-feature-desc">
              Our creators average a 3x revenue increase within the first 12 months of joining ELVOORIQ.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="result-feature-card">
            <div className="result-icon-wrapper">
              <Globe size={20} strokeWidth={1.5} />
            </div>
            <h4 className="result-feature-title">Global Reach</h4>
            <p className="result-feature-desc">
              Operating in 50+ countries with localized strategies that respect cultural nuance and audience expectations.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="result-feature-card">
            <div className="result-icon-wrapper">
              <Medal size={20} strokeWidth={1.5} />
            </div>
            <h4 className="result-feature-title">Expert Mentorship</h4>
            <p className="result-feature-desc">
              Every creator is paired with a dedicated mentor who has built a successful career in their specific niche.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="result-feature-card">
            <div className="result-icon-wrapper">
              <Shield size={20} strokeWidth={1.5} />
            </div>
            <h4 className="result-feature-title">Professional Team</h4>
            <p className="result-feature-desc">
              Industry veterans from YouTube, Twitch, LVMH, McKinsey, and global creative agencies at your service.
            </p>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
};

export default ResultsSection;
