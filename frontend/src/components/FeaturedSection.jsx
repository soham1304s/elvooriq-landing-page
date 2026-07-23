import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { socket } from '../socket/socketManager';
import { fadeInUp, staggerContainer } from '../utils/animations';
import './FeaturedSection.css';

const FeaturedSection = () => {
  const [talents, setTalents] = useState([]);

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/talent`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.talents && data.talents.length > 0) {
            setTalents(data.talents);
          }
        }
      } catch (error) {
        console.error('Failed to fetch talent:', error);
      }
    };
    fetchTalent();

    // Listen for live updates
    const handleContentUpdated = (data) => {
      if (data && data.type === 'talent') {
        fetchTalent();
      }
    };

    socket.on('content:updated', handleContentUpdated);

    return () => {
      socket.off('content:updated', handleContentUpdated);
    };
  }, []);

  if (talents.length === 0) {
    return null;
  }

  return (
    <section className="featured-section" id="creators">
      <div className="featured-container container">
        
        {/* Header */}
        <motion.div 
          className="featured-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="featured-header-left">
            <div className="section-header">
              <span className="section-line"></span>
              <span className="section-subtitle">FEATURED CREATORS</span>
            </div>
            <h2 className="featured-title">
              Meet the Talent<br/>
              <span className="title-highlight">We're Proud to Represent</span>
            </h2>
          </motion.div>
          <motion.div variants={fadeInUp} className="featured-header-right">
            <a href="#" className="view-all-link">
              View All Creators <ArrowRight size={16} className="arrow-icon" />
            </a>
          </motion.div>
        </motion.div>

        {/* Grid */}
        <motion.div 
          className="featured-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {talents.map((creator) => (
            <motion.div variants={fadeInUp} className="featured-card" key={creator.id}>
              
              <img src={creator.imageUrl} alt={creator.name} className="featured-card-img" />
              <div className="featured-card-overlay"></div>
              
              <div className="platform-badge">{creator.platform}</div>

              <div className="featured-card-content">
                <p className="creator-category">{creator.category}</p>
                <h3 className="creator-name">{creator.name}</h3>
                <p className="creator-handle">{creator.handle}</p>
                
                <div className="creator-stats-row">
                  <div className="creator-followers">
                    <span className="follower-count">{creator.followers}</span>
                    <span className="follower-label">Followers</span>
                  </div>
                  
                  <div className="creator-badges">
                    {(() => {
                      let badgesList = [];
                      if (Array.isArray(creator.badges)) {
                        badgesList = creator.badges;
                      } else if (typeof creator.badges === 'string') {
                        try {
                          badgesList = JSON.parse(creator.badges);
                        } catch (e) {
                          badgesList = [];
                        }
                      }
                      return Array.isArray(badgesList) ? badgesList.map((badge, index) => (
                        <span className="creator-badge" key={index}>{badge}</span>
                      )) : null;
                    })()}
                  </div>
                </div>
              </div>
              
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default FeaturedSection;
