import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Briefcase, Award, TrendingUp, DollarSign, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const BrandPartnershipsPage = () => {
  const offerings = [
    { icon: <Briefcase size={28} />, title: "Enterprise Brand Matching", desc: "We connect creators with Fortune 500 tech, gaming, cosmetics, and lifestyle brands seeking authentic creator integration." },
    { icon: <Award size={28} />, title: "Sponsored Live Broadcasts", desc: "Dedicated live stream integrations, product unboxings, custom chat commands, and stream banner placements." },
    { icon: <TrendingUp size={28} />, title: "Campaign ROI Reporting", desc: "Detailed post-campaign performance reports measuring click-throughs, impressions, brand sentiment, and conversion rates." },
    { icon: <DollarSign size={28} />, title: "Multi-Platform Deliverables", desc: "Bundled packages combining YouTube videos, TikTok shorts, Instagram Reels, and Twitch live broadcasts." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">SERVICES</div>
        <h1 className="page-hero-title">Strategic <span className="title-accent">Brand Partnerships</span></h1>
        <p className="page-hero-subtitle">
          Connecting top brands with influential women creators for impactful, authentic, and high-converting marketing campaigns.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {offerings.map((item, idx) => (
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
          <h2 className="cta-title">Are You a Brand Looking to Partner?</h2>
          <p className="cta-desc">Launch sponsored campaigns with our roster of verified, high-engagement digital talent.</p>
          <Link to="/company/contact" className="btn-cta">
            Inquire For Brand Partnerships <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default BrandPartnershipsPage;
