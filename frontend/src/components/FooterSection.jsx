import React from 'react';
import { Camera, Hash, Video, Briefcase, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeInUp, staggerContainer } from '../utils/animations';
import logoImg from '../assets/logo.png';
import './FooterSection.css';

const FooterSection = () => {
  return (
    <footer className="footer-section">
      <div className="container footer-container">
        
        {/* Top Content */}
        <motion.div 
          className="footer-top"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          
          {/* Brand Column */}
          <motion.div variants={fadeInUp} className="footer-brand-col">
            <div className="footer-logo">
              <Link to="/">
                <img src={logoImg} alt="ELVOORIQ Logo" style={{ height: '160px' }} />
              </Link>
            </div>
            <p className="footer-description">
              The premier talent management and live streaming platform built exclusively for women creators worldwide.
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram"><Camera size={18} /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter"><Hash size={18} /></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Youtube"><Video size={18} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn"><Briefcase size={18} /></a>
            </div>
          </motion.div>

          {/* Links Columns */}
          <div className="footer-links-wrapper">
            
            <motion.div variants={fadeInUp} className="footer-links-col">
              <h4 className="footer-col-title">PLATFORM</h4>
              <ul className="footer-links">
                <li><Link to="/login">Creator Dashboard</Link></li>
                <li><Link to="/platform/live-streaming">Live Streaming</Link></li>
                <li><Link to="/platform/analytics">Analytics</Link></li>
                <li><Link to="/platform/brand-marketplace">Brand Marketplace</Link></li>
                <li><Link to="/platform/mobile-app">Mobile App</Link></li>
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp} className="footer-links-col">
              <h4 className="footer-col-title">SERVICES</h4>
              <ul className="footer-links">
                <li><Link to="/services/creator-management">Creator Management</Link></li>
                <li><Link to="/services/brand-partnerships">Brand Partnerships</Link></li>
                <li><Link to="/services/growth-strategy">Growth Strategy</Link></li>
                <li><Link to="/services/training-mentorship">Training & Mentorship</Link></li>
                <li><Link to="/services/technical-support">Technical Support</Link></li>
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp} className="footer-links-col">
              <h4 className="footer-col-title">COMPANY</h4>
              <ul className="footer-links">
                <li><Link to="/company/about">About Us</Link></li>
                <li><Link to="/company/careers">Careers</Link></li>
                <li><Link to="/company/press-kit">Press Kit</Link></li>
                <li><Link to="/company/creator-stories">Creator Stories</Link></li>
                <li><Link to="/company/blog">Blog</Link></li>
                <li><Link to="/company/contact">Contact</Link></li>
              </ul>
            </motion.div>

          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="footer-bottom-left">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <span className="footer-location">
              <MapPin size={14} className="location-icon" /> Global HQ
            </span>
          </div>
          
          <div className="footer-bottom-right">
            &copy; 2026 ELVOORIQ. All rights reserved. Built for women who lead.
          </div>
        </motion.div>

      </div>
    </footer>
  );
};

export default FooterSection;
