import React from 'react';
import { Send, MessageCircle, Mail, Camera, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, fadeInLeft, fadeInRight } from '../utils/animations';
import './ContactSection.css';

const ContactSection = () => {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-container container">
        
        {/* Header */}
        <motion.div 
          className="contact-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="section-header-center">
            <span className="section-line"></span>
            <span className="section-subtitle">CONTACT US</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="contact-title">
            Let's Start a<br/>
            <span className="title-highlight">Conversation</span>
          </motion.h2>
        </motion.div>

        {/* Content Grid */}
        <div className="contact-content">
          
          {/* Left Column: Form */}
          <motion.div 
            className="contact-form-card"
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <form className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>FULL NAME *</label>
                  <input type="text" placeholder="Your name" required />
                </div>
                <div className="form-group">
                  <label>EMAIL *</label>
                  <input type="email" placeholder="you@example.com" required />
                </div>
              </div>
              
              <div className="form-group">
                <label>SUBJECT</label>
                <input type="text" placeholder="How can we help?" />
              </div>
              
              <div className="form-group">
                <label>MESSAGE *</label>
                <textarea placeholder="Tell us how we can help..." rows="5" required></textarea>
              </div>
              
              <button type="submit" className="submit-btn">
                Send Message <Send size={16} className="btn-icon" />
              </button>
            </form>
          </motion.div>

          {/* Right Column: Contact Info & Map */}
          <motion.div 
            className="contact-info-column"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            
            <motion.a 
              variants={fadeInRight} 
              href="https://wa.me/917665761616?text=Hi%20ELVOORIQ%2C%20I%20would%20like%20to%20get%20in%20touch!" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="info-card"
            >
              <div className="info-icon-wrapper whatsapp">
                <MessageCircle size={20} />
              </div>
              <div className="info-text">
                <span className="info-label">WHATSAPP</span>
                <span className="info-value">+91 7665761616</span>
                <span className="info-subtext">Typically replies instantly</span>
              </div>
              <ArrowRight size={16} className="info-arrow" />
            </motion.a>
            
            <motion.a variants={fadeInRight} href="#" className="info-card">
              <div className="info-icon-wrapper email">
                <Mail size={20} />
              </div>
              <div className="info-text">
                <span className="info-label">EMAIL</span>
                <span className="info-value">hello@elvooriq.com</span>
                <span className="info-subtext">Within one business day</span>
              </div>
              <ArrowRight size={16} className="info-arrow" />
            </motion.a>
            
            <motion.a variants={fadeInRight} href="#" className="info-card">
              <div className="info-icon-wrapper instagram">
                <Camera size={20} />
              </div>
              <div className="info-text">
                <span className="info-label">INSTAGRAM</span>
                <span className="info-value">@elvooriq</span>
                <span className="info-subtext">DM us anytime</span>
              </div>
              <ArrowRight size={16} className="info-arrow" />
            </motion.a>

            {/* Map Widget */}
            <motion.div variants={fadeInUp} className="map-widget">
              <div className="map-grid-bg"></div>
              
              <div className="map-pin-container">
                <div className="map-pin-pulse"></div>
                <div className="map-pin">
                  <MapPin size={18} fill="#E5C158" color="#E5C158" />
                </div>
              </div>
              
              <div className="map-tooltip">
                <div className="map-tooltip-content">
                  <div className="map-tooltip-icon">
                    <MapPin size={22} className="hq-pin-icon" />
                  </div>
                  <div className="map-tooltip-text">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span className="tooltip-title">JAIPUR HEADQUARTERS</span>
                      <span style={{ fontSize: '0.7rem', color: '#E5C158', fontFamily: 'monospace', background: 'rgba(229,193,88,0.15)', padding: '2px 6px', borderRadius: '4px' }}>26.8242° N, 75.6425° E</span>
                    </div>
                    <span className="tooltip-sub">
                      21, Mahapura, 200ft SEZ Road, Mahapura Rd, near Mahindra SEZ, Jaipur, Rajasthan 302026, India
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
