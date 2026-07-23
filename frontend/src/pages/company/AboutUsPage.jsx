import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Heart, Globe, Sparkles, Shield, Trophy, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const AboutUsPage = () => {
  const values = [
    { icon: <Heart size={28} />, title: "Empowering Female Voice", desc: "Building an inclusive ecosystem where female digital creators have full control over their agency, safety, and earnings." },
    { icon: <Globe size={28} />, title: "Global Talent Reach", desc: "Representing creators across North America, Europe, Asia, and Latin America in gaming, tech, beauty, and digital art." },
    { icon: <Shield size={28} />, title: "Creator Safety First", desc: "Pioneering AI moderation tools, legal defense, and mental health support systems for online talent." },
    { icon: <Trophy size={28} />, title: "Excellence & Growth", desc: "Delivering multi-platform audience growth, record-breaking brand partnerships, and long-term wealth creation." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">ABOUT ELVOORIQ</div>
        <h1 className="page-hero-title">Championing the <span className="title-accent">Future of Creators</span></h1>
        <p className="page-hero-subtitle">
          ELVOORIQ is the premier global talent management agency and live streaming infrastructure platform built exclusively for women creators.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {values.map((item, idx) => (
            <motion.div 
              key={idx} 
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="card-icon">{item.icon}</div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-desc">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="cta-banner">
          <h2 className="cta-title">Join the ELVOORIQ Movement</h2>
          <p className="cta-desc">Whether you are a creator looking for representation or a brand looking to innovate, let’s build together.</p>
          <Link to="/register" className="btn-cta">
            Get Started With Us <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutUsPage;
