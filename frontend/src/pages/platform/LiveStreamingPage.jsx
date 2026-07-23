import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Video, Zap, Radio, Shield, Cpu, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const LiveStreamingPage = () => {
  const features = [
    { icon: <Zap size={28} />, title: "Ultra-Low Latency", desc: "Sub-second RTMP live video broadcasting ensuring real-time interaction with your stream audience." },
    { icon: <Radio size={28} />, title: "Multi-Platform Streaming", desc: "Broadcast simultaneously to YouTube Live, Twitch, Kick, and custom RTMP endpoints with single ingest." },
    { icon: <Video size={28} />, title: "Interactive Stream Overlays", desc: "Custom branded overlays, subscriber alerts, live polling, and goal trackers designed for women creators." },
    { icon: <Shield size={28} />, title: "AI Moderation Shield", desc: "Automated real-time chat protection filtering toxicity, spam, and uninvited harassment automatically." },
    { icon: <Cpu size={28} />, title: "Cloud DVR Recording", desc: "Automatic 1080p60 cloud recording storage and instant VOD clip generation for social media highlighting." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">PLATFORM FEATURE</div>
        <h1 className="page-hero-title">Next-Gen <span className="title-accent">Live Streaming</span> Engine</h1>
        <p className="page-hero-subtitle">
          Broadcast with studio-grade reliability, ultra-low latency, and interactive community tools engineered specifically for modern creators.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {features.map((item, idx) => (
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
          <h2 className="cta-title">Ready to Stream at Studio Quality?</h2>
          <p className="cta-desc">Connect your YouTube or OBS encoder in seconds and launch your broadcast with ELVOORIQ.</p>
          <Link to="/login" className="btn-cta">
            Start Live Streaming <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default LiveStreamingPage;
