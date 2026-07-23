import React from 'react';
import PageLayout from '../../components/PageLayout';
import { GraduationCap, Award, Video, Users, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const TrainingMentorshipPage = () => {
  const masterclasses = [
    { icon: <GraduationCap size={28} />, title: "ELVOORIQ Creator Academy", desc: "Exclusive masterclasses taught by top-tier streamers covering camera confidence, community building, and monetization." },
    { icon: <Video size={28} />, title: "OBS & Broadcasting Workshops", desc: "Technical training on scene transitions, audio mixing, bitrates, dual PC setups, and broadcast troubleshooting." },
    { icon: <Award size={28} />, title: "1-on-1 Executive Coaching", desc: "Personalized mentorship sessions to help you conquer burnout, refine your voice, and scale your personal brand." },
    { icon: <Users size={28} />, title: "Peer Creator Networking", desc: "Private VIP masterminds and collaboration hubs with leading women streamers globally." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">SERVICES</div>
        <h1 className="page-hero-title">Training & <span className="title-accent">Creator Mentorship</span></h1>
        <p className="page-hero-subtitle">
          Master the art and business of live streaming with technical workshops, camera coaching, and VIP peer masterminds.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {masterclasses.map((item, idx) => (
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
          <h2 className="cta-title">Level Up Your Streaming Skills</h2>
          <p className="cta-desc">Enroll in ELVOORIQ Creator Academy and learn directly from industry leaders.</p>
          <Link to="/register" className="btn-cta">
            Join Creator Academy <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default TrainingMentorshipPage;
