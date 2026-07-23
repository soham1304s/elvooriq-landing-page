import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import './BrandCollabsSection.css';

const brands = ['Apple', 'Dior', 'Chanel', 'Samsung', 'Gucci', 'Amazon', 'H&M', 'Sephora', 'Nike', 'LVMH'];

const campaigns = [
  {
    id: 1,
    image: '/campaigns/sephora.png',
    title: 'SEPHORA × ELVOORIQ',
    description: '12 creators, ₹2.4M campaign reach, 340% ROAS'
  },
  {
    id: 2,
    image: '/campaigns/nike.png',
    title: 'NIKE × ELVOORIQ',
    description: '8 athletes, global campaign, 180M combined impressions'
  },
  {
    id: 3,
    image: '/campaigns/spotify.png',
    title: 'SPOTIFY × ELVOORIQ',
    description: 'Creator podcast series, 5M listeners, 6 markets'
  }
];

const BrandCollabsSection = () => {
  return (
    <section className="brand-collabs-section" id="brands">
      <div className="brand-collabs-container container">
        
        {/* Header */}
        <motion.div 
          className="brand-collabs-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="section-header-center">
            <span className="section-line"></span>
            <span className="section-subtitle">BRAND COLLABORATIONS</span>
            <span className="section-line"></span>
          </motion.div>
          
          <motion.h2 variants={fadeInUp} className="brand-collabs-title">
            500+ Global Brands.<br/>
            <span className="title-highlight">One Trusted Network.</span>
          </motion.h2>
          
          <motion.p variants={fadeInUp} className="brand-collabs-desc">
            From luxury houses to tech giants, we connect your creators with<br/>
            brands that align authentically with their voice.
          </motion.p>
        </motion.div>

        {/* Brands Marquee */}
        <div className="brands-marquee-wrapper">
          <div className="brands-marquee-track">
            <div className="brands-marquee-content">
              {brands.map((brand, index) => (
                <span key={`brand-1-${index}`} className="brand-name">{brand}</span>
              ))}
            </div>
            <div className="brands-marquee-content" aria-hidden="true">
              {brands.map((brand, index) => (
                <span key={`brand-2-${index}`} className="brand-name">{brand}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Cards */}
        <motion.div 
          className="campaign-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {campaigns.map((campaign) => (
            <motion.div variants={fadeInUp} className="campaign-card" key={campaign.id}>
              
              <div className="campaign-image-wrapper">
                <img src={campaign.image} alt={campaign.title} className="campaign-image" />
              </div>
              
              <div className="campaign-content">
                <h4 className="campaign-title">{campaign.title}</h4>
                <p className="campaign-desc">{campaign.description}</p>
              </div>
              
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default BrandCollabsSection;
