import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Smartphone, BellRing, Video, Zap, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const MobileAppPage = () => {
  const appFeatures = [
    { icon: <Smartphone size={28} />, title: "Mobile Live Broadcasts", desc: "Stream directly from iOS & Android with hardware acceleration, beauty filters, and mobile camera switching." },
    { icon: <BellRing size={28} />, title: "Instant Viewer Alerts", desc: "Send push notifications to your core fans the exact moment you go live on any platform." },
    { icon: <Video size={28} />, title: "IRL & Mobile Vlogging", desc: "Low-bitrate adaptive streaming optimized for mobile 5G/4G networks anywhere in the world." },
    { icon: <Shield size={28} />, title: "On-The-Go Chat Moderation", desc: "Moderate your live stream chat and manage ban lists directly from your phone screen." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">MOBILE PLATFORM</div>
        <h1 className="page-hero-title">ELVOORIQ <span className="title-accent">Mobile Studio</span></h1>
        <p className="page-hero-subtitle">
          Manage your channel, broadcast mobile live streams, and connect with your audience anywhere, anytime.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {appFeatures.map((item, idx) => (
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
          <h2 className="cta-title">Download ELVOORIQ for iOS & Android</h2>
          <p className="cta-desc">Take full control of your streaming empire right from your pocket.</p>
          <Link to="/register" className="btn-cta">
            Get Mobile App Access <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default MobileAppPage;
