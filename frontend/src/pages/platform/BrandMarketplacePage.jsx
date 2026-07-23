import React from 'react';
import PageLayout from '../../components/PageLayout';
import { ShoppingBag, Briefcase, Award, CheckCircle2, DollarSign, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const BrandMarketplacePage = () => {
  const marketplaceFeatures = [
    { icon: <Briefcase size={28} />, title: "Verified Brand Campaigns", desc: "Access high-paying sponsorship deals from global lifestyle, tech, gaming, and beauty brands curated for female creators." },
    { icon: <Award size={28} />, title: "Automated Pitch Matching", desc: "Our AI matches your channel niche and demographic profile directly to brand campaign requirements." },
    { icon: <DollarSign size={28} />, title: "Escrow Protected Payouts", desc: "Guaranteed prompt payouts backed by escrow contracts so you get paid on time for every sponsored integration." },
    { icon: <CheckCircle2 size={28} />, title: "Digital Contract Signing", desc: "Built-in legal protection with standardized, creator-friendly campaign agreements and deliverables tracking." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">PLATFORM FEATURE</div>
        <h1 className="page-hero-title">Exclusive <span className="title-accent">Brand Marketplace</span></h1>
        <p className="page-hero-subtitle">
          Connect directly with top brands, secure premium sponsorship deals, and manage campaign deliverables seamlessly.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {marketplaceFeatures.map((item, idx) => (
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
          <h2 className="cta-title">Monetize Your Influence With Premium Brands</h2>
          <p className="cta-desc">Join ELVOORIQ’s brand marketplace and start pitching for paid sponsorships today.</p>
          <Link to="/login" className="btn-cta">
            Join Marketplace <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default BrandMarketplacePage;
