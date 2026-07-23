import React from 'react';
import { Heart, Sparkles, Shield, Globe2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, fadeInLeft, fadeInRight } from '../utils/animations';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section className="about-section" id="about">
      <div className="about-container container">
        
        {/* Left Column - Images */}
        <motion.div 
          className="about-images"
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="about-decorative-circle"></div>
          
          <img 
            src="/about/laptop.png" 
            alt="Person pointing at laptop screen" 
            className="about-img-main"
          />
          
          <div className="about-badge">
            <span className="badge-year">2018</span>
            <span className="badge-text">FOUNDED</span>
          </div>

          <img 
            src="/about/meeting.png" 
            alt="Team meeting" 
            className="about-img-secondary"
          />
        </motion.div>

        {/* Right Column - Content */}
        <motion.div 
          className="about-content"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          
          <motion.div variants={fadeInUp} className="section-header">
            <span className="section-line"></span>
            <span className="section-subtitle">ABOUT ELVOORIQ</span>
          </motion.div>
          
          <motion.h2 variants={fadeInUp} className="about-title">
            The Agency Built<br/>
            <span className="title-highlight">for Women Who Lead</span>
          </motion.h2>
          
          <motion.p variants={fadeInUp} className="about-paragraph">
            ELVOORIQ was founded in 2018 with a singular conviction: women creators deserve a partner as ambitious as they are. Not an agency that adapts — one that was built from scratch for them.
          </motion.p>
          
          <motion.p variants={fadeInUp} className="about-paragraph">
            Today we manage 5,000+ creators across 50+ countries, with a team of industry veterans from YouTube, LVMH, McKinsey, Twitch, and leading global creative agencies.
          </motion.p>
          
          {/* Mission & Vision Blocks */}
          <motion.div variants={fadeInUp} className="mission-vision-blocks">
            <div className="block-mission">
              <h4 className="block-title">OUR MISSION</h4>
              <p className="block-text">
                To make every woman creator unstoppable — with the strategy, infrastructure, and partnerships they deserve.
              </p>
            </div>
            <div className="block-vision">
              <h4 className="block-title">OUR VISION</h4>
              <p className="block-text">
                A world where women don't just participate in the digital economy — they lead it.
              </p>
            </div>
          </motion.div>
          
          {/* Features Grid */}
          <motion.div variants={staggerContainer} className="features-grid">
            
            <motion.div variants={fadeInUp} className="feature-card">
              <div className="feature-header">
                <Heart size={18} className="feature-icon" />
                <h5 className="feature-title">Authenticity</h5>
              </div>
              <p className="feature-desc">We champion creators who are unapologetically themselves.</p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="feature-card">
              <div className="feature-header">
                <Sparkles size={18} className="feature-icon" />
                <h5 className="feature-title">Innovation</h5>
              </div>
              <p className="feature-desc">Technology that solves real creator challenges, not hypothetical ones.</p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="feature-card">
              <div className="feature-header">
                <Shield size={18} className="feature-icon" />
                <h5 className="feature-title">Integrity</h5>
              </div>
              <p className="feature-desc">Fair contracts, honest feedback, transparent partnerships — always.</p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="feature-card">
              <div className="feature-header">
                <Globe2 size={18} className="feature-icon" />
                <h5 className="feature-title">Community</h5>
              </div>
              <p className="feature-desc">A global sisterhood that lifts every creator higher.</p>
            </motion.div>
            
          </motion.div>
          
        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;
