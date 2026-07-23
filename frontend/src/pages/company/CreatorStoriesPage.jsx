import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Star, Trophy, Users, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const CreatorStoriesPage = () => {
  const stories = [
    { name: "Elena Rostova", metric: "+450K Subscribers", category: "Digital Art & VTubing", desc: "Elena scaled from a part-time illustrator into a top VTuber with ELVOORIQ's multi-platform strategy and tech support." },
    { name: "Marcus Vance", metric: "$120K Sponsorship Deals", category: "Tech & AI Streaming", desc: "Marcus secured exclusive brand partnerships with major hardware vendors through ELVOORIQ Brand Marketplace." },
    { name: "Sarah Chen", metric: "3.2M Monthly Views", category: "IRL Vlogging & Lifestyle", desc: "Sarah expanded her live broadcasts across Asia and North America with ELVOORIQ 24/7 technical fallback ingest." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">CREATOR SUCCESS</div>
        <h1 className="page-hero-title">Real <span className="title-accent">Creator Stories</span></h1>
        <p className="page-hero-subtitle">
          See how women creators are building thriving, multi-platform streaming careers with ELVOORIQ representation.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {stories.map((item, idx) => (
            <motion.div 
              key={idx} 
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="card-icon"><Trophy size={28} /></div>
              <h3 className="card-title">{item.name}</h3>
              <p style={{ color: '#00C988', fontWeight: 700, marginBottom: '8px' }}>{item.metric} • {item.category}</p>
              <p className="card-desc">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="cta-banner">
          <h2 className="cta-title">Write Your Own Success Story</h2>
          <p className="cta-desc">Join hundreds of creators building full-time sustainable streaming careers.</p>
          <Link to="/register" className="btn-cta">
            Become an ELVOORIQ Creator <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreatorStoriesPage;
