import React from 'react';
import PageLayout from '../../components/PageLayout';
import { BarChart3, TrendingUp, Users, DollarSign, PieChart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const AnalyticsPage = () => {
  const analyticsFeatures = [
    { icon: <TrendingUp size={28} />, title: "Peak Concurrent Viewer Tracking", desc: "Monitor live audience spikes, drop-off timestamps, and chat engagement velocity during every broadcast stream." },
    { icon: <DollarSign size={28} />, title: "Real-Time Revenue Dashboard", desc: "Track earnings across subscriptions, brand sponsorships, super chats, and affiliate conversions in one central view." },
    { icon: <Users size={28} />, title: "Audience Demographics", desc: "Understand your core viewer geography, age groups, active watch hours, and platform preference breakdown." },
    { icon: <BarChart3 size={28} />, title: "Retention Heatmaps", desc: "Visual timelines showing exactly which stream segments kept viewers hooked or led to audience drop-offs." },
    { icon: <PieChart size={28} />, title: "Cross-Platform Benchmarking", desc: "Compare growth trajectories across YouTube, Twitch, Instagram, and TikTok with AI-driven growth recommendations." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">PLATFORM FEATURE</div>
        <h1 className="page-hero-title">Real-Time <span className="title-accent">Creator Analytics</span></h1>
        <p className="page-hero-subtitle">
          Turn stream data into actionable growth strategies. Deep-dive into viewer retention, earnings, and audience metrics.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {analyticsFeatures.map((item, idx) => (
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
          <h2 className="cta-title">Unlock Your Creator Insights Today</h2>
          <p className="cta-desc">Access deep analytics tailored for women creators aiming to monetize their digital presence.</p>
          <Link to="/login" className="btn-cta">
            View Your Dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default AnalyticsPage;
