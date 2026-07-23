import React from 'react';
import { Users, Radio, GraduationCap, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import './PillarsSection.css';

const pillars = [
  {
    id: '01',
    title: 'Talent Management',
    image: '/pillars/management.png',
    icon: <Users size={20} />
  },
  {
    id: '02',
    title: 'Live Streaming',
    image: '/pillars/streaming.png',
    icon: <Radio size={20} />
  },
  {
    id: '03',
    title: 'Creator Education',
    image: '/pillars/education.png',
    icon: <GraduationCap size={20} />
  },
  {
    id: '04',
    title: 'Brand Partnerships',
    image: '/pillars/brands.png',
    icon: <Handshake size={20} />
  }
];

const PillarsSection = () => {
  return (
    <section className="pillars-section" id="services">
      <div className="pillars-container container">
        
        {/* Header */}
        <motion.div 
          className="pillars-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="pillars-header-left">
            <div className="section-header">
              <span className="section-line"></span>
              <span className="section-subtitle">OUR TALENT ECOSYSTEM</span>
            </div>
            <h2 className="pillars-title">
              Four Pillars of<br/>
              <span className="title-highlight">Creator Excellence</span>
            </h2>
          </motion.div>
          <motion.div variants={fadeInUp} className="pillars-header-right">
            <p className="pillars-description">
              Every service we offer falls under one of four ecosystems, each designed to accelerate a different dimension of your career.
            </p>
          </motion.div>
        </motion.div>

        {/* Grid */}
        <motion.div 
          className="pillars-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {pillars.map((pillar) => (
            <motion.div variants={fadeInUp} className="pillar-card" key={pillar.id}>
              
              <img src={pillar.image} alt={pillar.title} className="pillar-bg-img" />
              <div className="pillar-overlay"></div>
              
              <div className="pillar-content">
                <span className="pillar-number">{pillar.id}</span>
                
                <div className="pillar-icon-wrapper">
                  {pillar.icon}
                </div>
                
                <h3 className="pillar-card-title">{pillar.title}</h3>
              </div>
              
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default PillarsSection;
