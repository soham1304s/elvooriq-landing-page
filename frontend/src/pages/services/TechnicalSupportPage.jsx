import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Headset, Wrench, ShieldAlert, Cpu, Radio, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const TechnicalSupportPage = () => {
  const techServices = [
    { icon: <Headset size={28} />, title: "24/7 Live Stream Helpdesk", desc: "Real-time technical emergency support during broadcasts for frame drops, stream disconnects, or audio lag." },
    { icon: <Wrench size={28} />, title: "OBS Studio Configuration", desc: "Remote setup of OBS Studio, Streamlabs, vMix, and StreamElements custom overlays and plugin pipelines." },
    { icon: <Cpu size={28} />, title: "Hardware & Audio Tuning", desc: "Optimization for dual-PC setups, GoXLR/audio interfaces, capture cards, and GPU encoding bitrates." },
    { icon: <Radio size={28} />, title: "Backup Fallback Ingest", desc: "Automatic redundant RTMP backup servers so your stream never goes offline if primary internet fails." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">SERVICES</div>
        <h1 className="page-hero-title">24/7 <span className="title-accent">Technical Support</span></h1>
        <p className="page-hero-subtitle">
          Never let technical glitches ruin your broadcast. Dedicated stream engineers available 24/7 for zero downtime.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {techServices.map((item, idx) => (
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
          <h2 className="cta-title">Broadcast With Zero Technical Worry</h2>
          <p className="cta-desc">Get priority access to ELVOORIQ’s technical engineering team today.</p>
          <Link to="/company/contact" className="btn-cta">
            Contact Technical Team <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default TechnicalSupportPage;
