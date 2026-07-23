import React from 'react';
import PageLayout from '../../components/PageLayout';
import { TrendingUp, BarChart2, Share2, Layers, Cpu, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const GrowthStrategyPage = () => {
  const strategies = [
    { icon: <TrendingUp size={28} />, title: "Algorithmic Channel Optimization", desc: "Data-driven title, thumbnail, and metadata tuning engineered to maximize click-through rates and YouTube algorithm recommendations." },
    { icon: <Share2 size={28} />, title: "Short-Form Content Repurposing", desc: "Extracting high-engagement stream highlights into viral TikToks, YouTube Shorts, and Instagram Reels." },
    { icon: <Layers size={28} />, title: "Cross-Platform Audience Funnels", desc: "Converting short-form viewers into loyal live stream subscribers across Twitch, YouTube, and Discord." },
    { icon: <BarChart2 size={28} />, title: "Content Calendar Planning", desc: "Structured broadcast schedules and trending topic intelligence to ensure constant audience retention." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">SERVICES</div>
        <h1 className="page-hero-title">Algorithmic <span className="title-accent">Growth Strategy</span></h1>
        <p className="page-hero-subtitle">
          Scale your viewership exponentially with data-backed content optimization, cross-platform funnels, and short-form repurposing.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {strategies.map((item, idx) => (
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
          <h2 className="cta-title">Scale Your Audience 10x Faster</h2>
          <p className="cta-desc">Get custom growth blueprints engineered by top creator strategy specialists.</p>
          <Link to="/register" className="btn-cta">
            Get Growth Strategy <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default GrowthStrategyPage;
