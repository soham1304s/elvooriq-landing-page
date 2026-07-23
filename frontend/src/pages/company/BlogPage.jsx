import React from 'react';
import PageLayout from '../../components/PageLayout';
import { BookOpen, Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const BlogPage = () => {
  const articles = [
    { title: "10 Live Streaming Monetization Strategies for 2026", category: "Monetization", date: "July 20, 2026", author: "ELVOORIQ Insights", desc: "Discover how top creators diversify income beyond ads through brand deals, memberships, and digital merchandise." },
    { title: "How Women VTubers & Streamers Are Reshaping Twitch", category: "Industry Trends", date: "July 15, 2026", author: "Sarah Jenkins", desc: "An in-depth analysis of audience demographic shifts, community safety features, and female-led streaming growth." },
    { title: "Optimizing Your OBS Bitrate for 1080p60 Multi-Streaming", category: "Technical Guide", date: "July 10, 2026", author: "Tech Support Team", desc: "A step-by-step technical guide to eliminating dropped frames and audio latency across YouTube and Twitch." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">CREATOR INSIGHTS</div>
        <h1 className="page-hero-title">The ELVOORIQ <span className="title-accent">Journal & Blog</span></h1>
        <p className="page-hero-subtitle">
          Expert guides, creator economy research, live streaming tips, and platform updates.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {articles.map((item, idx) => (
            <motion.div 
              key={idx} 
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="card-icon"><BookOpen size={28} /></div>
              <p style={{ color: '#00C988', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                <Tag size={12} style={{ display: 'inline', marginRight: '4px' }} /> {item.category} • <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> {item.date}
              </p>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-desc">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="cta-banner">
          <h2 className="cta-title">Subscribe to Creator Insights</h2>
          <p className="cta-desc">Get weekly streaming tips and brand partnership opportunities delivered to your inbox.</p>
          <Link to="/register" className="btn-cta">
            Join Newsletter <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default BlogPage;
