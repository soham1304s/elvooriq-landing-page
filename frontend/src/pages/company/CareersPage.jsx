import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Briefcase, Users, Star, Zap, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const CareersPage = () => {
  const jobs = [
    { title: "Senior Talent Manager (Gaming & Tech)", location: "Remote / New York", type: "Full-Time", desc: "Manage top-tier live streamers, drive brand strategy, and expand agency roster." },
    { title: "Lead Full-Stack Streaming Engineer", location: "Remote / San Francisco", type: "Full-Time", desc: "Build low-latency RTMP streaming features, WebRTC analytics, and creator dashboard APIs." },
    { icon: <Briefcase size={28} />, title: "Brand Partnerships Manager", location: "Remote / London", type: "Full-Time", desc: "Pitch high-value campaigns to lifestyle, beauty, and tech brands on behalf of our creators." },
    { title: "Creator Growth & Algorithmic Specialist", location: "Remote / Global", type: "Full-Time", desc: "Analyze streaming trends, optimize short-form video repurposing, and scale channel subscriber counts." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">CAREERS AT ELVOORIQ</div>
        <h1 className="page-hero-title">Build the Future of <span className="title-accent">Creator Tech</span></h1>
        <p className="page-hero-subtitle">
          Join a passionate, remote-first global team empowering digital creators to reach millions of viewers worldwide.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {jobs.map((item, idx) => (
            <motion.div 
              key={idx} 
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="card-icon"><Briefcase size={28} /></div>
              <h3 className="card-title">{item.title}</h3>
              <p style={{ color: '#00C988', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> {item.location} • {item.type}
              </p>
              <p className="card-desc">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="cta-banner">
          <h2 className="cta-title">Don't See Your Role?</h2>
          <p className="cta-desc">We are always looking for exceptional talent managers, engineers, and strategists.</p>
          <Link to="/company/contact" className="btn-cta">
            Send General Application <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default CareersPage;
