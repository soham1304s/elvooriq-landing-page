import React from 'react';
import PageLayout from '../../components/PageLayout';
import { UserCheck, ShieldCheck, Target, HeartHandshake, Compass, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const CreatorManagementPage = () => {
  const services = [
    { icon: <UserCheck size={28} />, title: "Dedicated Talent Managers", desc: "A personal 1-on-1 manager assigned to handle your scheduling, platform relations, brand pitches, and career roadmap." },
    { icon: <ShieldCheck size={28} />, title: "Contract Negotiation & Legal", desc: "Legal representation ensuring your intellectual property rights, non-compete clauses, and revenue shares are protected." },
    { icon: <Target size={28} />, title: "Content Strategy & Branding", desc: "Custom branding toolkits, logo design, overlay packages, and channel positioning to stand out in the crowded creator market." },
    { icon: <HeartHandshake size={28} />, title: "Crisis Management & Wellness", desc: "Creator mental health counseling, crisis public relations, and community safety protection against online harassment." },
    { icon: <Compass size={28} />, title: "Long-Term Equity Building", desc: "Transitioning your channel influence into owned merchandise lines, brand ventures, podcasting, and long-term equity." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">OUR CORE SERVICE</div>
        <h1 className="page-hero-title">Premier <span className="title-accent">Creator Management</span></h1>
        <p className="page-hero-subtitle">
          End-to-end talent representation tailored exclusively for women creators, empowering you to turn passion into a sustainable multi-million dollar brand.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {services.map((item, idx) => (
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
          <h2 className="cta-title">Apply for ELVOORIQ Talent Management</h2>
          <p className="cta-desc">Work directly with dedicated talent managers who prioritize your safety, income, and career longevity.</p>
          <Link to="/register" className="btn-cta">
            Apply as a Creator <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreatorManagementPage;
