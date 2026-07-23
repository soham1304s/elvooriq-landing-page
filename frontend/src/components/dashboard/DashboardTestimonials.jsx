import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DashboardTestimonials.css';
import amaraPortrait from '../../assets/images/amara_portrait.png';

const testimonials = [
  {
    id: 'amara',
    name: 'Amara Chen',
    platform: 'YouTube Live',
    tags: ['Lifestyle', 'Wellness'],
    image: amaraPortrait,
    avatar: 'https://i.pravatar.cc/150?u=amara', // Placeholder generic avatars for pills
    beforeMetrics: '8K followers, zero revenue',
    afterMetrics: '$24,000/mo',
    afterSub: '3.2M followers',
    quote: 'ELVOORIQ transformed my live streams from hobby sessions to a full-time business generating $24K a month. My manager handled brand deals while I focused on connecting with my audience.'
  },
  {
    id: 'sofia',
    name: 'Sofia Martinez',
    platform: 'Twitch',
    tags: ['Gaming', 'Esports'],
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop', // Temporary placeholder
    avatar: 'https://i.pravatar.cc/150?u=sofia',
    beforeMetrics: 'Struggling to monetize 500 viewers',
    afterMetrics: '$12,500/mo',
    afterSub: 'Partnered Status',
    quote: 'The technical assistance and brand connections provided by ELVOORIQ completely leveled up my stream quality. I finally secured the sponsorships I had been dreaming of.'
  },
  {
    id: 'maya',
    name: 'Maya Patel',
    platform: 'TikTok Live',
    tags: ['Fashion', 'Beauty'],
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop', // Temporary placeholder
    avatar: 'https://i.pravatar.cc/150?u=maya',
    beforeMetrics: 'Inconsistent viewership, burnout',
    afterMetrics: 'Top 1% Creator',
    afterSub: 'Consistent Growth',
    quote: 'Having a dedicated manager and streaming strategy changed my life. I went from burned out to thriving, with a structured content calendar and audience growth tactics that actually work.'
  }
];

const DashboardTestimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="dt-section">
      <div className="dt-container">
        
        {/* Header Area */}
        <motion.div 
          className="dt-header-area"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="dt-label">
            <span className="dt-line"></span> CREATOR TESTIMONIALS
          </div>
          <h2 className="dt-title">
            Creators Who<br />
            <span className="dt-highlight">Changed Everything</span>
          </h2>

          {/* Profile Switcher Pills */}
          <div className="dt-profile-switcher">
            {testimonials.map((t, idx) => (
              <button 
                key={t.id}
                className={`dt-profile-pill ${activeIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveIndex(idx)}
              >
                <img src={t.avatar} alt={t.name} className="dt-pill-avatar" />
                <span className="dt-pill-name">{t.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Split */}
        <div className="dt-content-split">
          
          {/* LEFT: Portrait Card */}
          <div className="dt-portrait-panel">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTestimonial.id}
                className="dt-portrait-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <img src={activeTestimonial.image} alt={activeTestimonial.name} className="dt-portrait-img" />
                
                <div className="dt-live-badge">
                  <span className="dt-live-dot"></span> LIVE
                </div>
                
                <div className="dt-portrait-overlay">
                  <div className="dt-stars">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <div className="dt-tags">
                    {activeTestimonial.tags.map((tag, i) => (
                      <span key={i} className="dt-tag">{tag}</span>
                    ))}
                  </div>
                  <h3 className="dt-portrait-name">{activeTestimonial.name}</h3>
                  <p className="dt-portrait-handle">@{activeTestimonial.id}live · {activeTestimonial.platform}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: Details & Quote */}
          <div className="dt-details-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="dt-details-content"
              >
                {/* Metrics Row */}
                <div className="dt-metrics-row">
                  <div className="dt-metric-card dt-before-card">
                    <div className="dt-metric-label">
                      <span className="dt-dot before"></span> BEFORE ELVOORIQ
                    </div>
                    <p className="dt-metric-value muted">{activeTestimonial.beforeMetrics}</p>
                  </div>
                  <div className="dt-metric-card dt-after-card">
                    <div className="dt-metric-label">
                      <span className="dt-dot after"></span> AFTER ELVOORIQ
                    </div>
                    <p className="dt-metric-value highlight">{activeTestimonial.afterMetrics}</p>
                    <p className="dt-metric-sub">{activeTestimonial.afterSub}</p>
                  </div>
                </div>

                {/* Quote Card */}
                <div className="dt-quote-card">
                  <div className="dt-quote-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M14.017 21L16.44 14.282C16.44 14.282 14.475 14.072 14.017 11.758C13.56 9.445 15.69 7.028 17.514 6.818C19.338 6.608 21.618 7.659 21.618 10.392C21.618 13.125 18.577 21 18.577 21H14.017ZM3 21L5.423 14.282C5.423 14.282 3.458 14.072 3 11.758C2.542 9.445 4.673 7.028 6.497 6.818C8.321 6.608 10.601 7.659 10.601 10.392C10.601 13.125 7.56 21 7.56 21H3Z"></path>
                    </svg>
                  </div>
                  <p className="dt-quote-text">
                    "{activeTestimonial.quote}"
                  </p>
                  
                  <div className="dt-quote-footer">
                    <div className="dt-quote-author">
                      <h4>{activeTestimonial.name}</h4>
                      <span>{activeTestimonial.platform}</span>
                    </div>
                    <button className="dt-apply-btn">
                      Apply Like {activeTestimonial.name.split(' ')[0]} <span>→</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>

            {/* Bottom Navigation */}
            <div className="dt-navigation">
              <div className="dt-nav-buttons">
                <button 
                  className="dt-nav-btn"
                  onClick={() => setActiveIndex(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
                >
                  ‹
                </button>
                <button 
                  className="dt-nav-btn"
                  onClick={() => setActiveIndex(prev => prev === testimonials.length - 1 ? 0 : prev + 1)}
                >
                  ›
                </button>
              </div>
              <div className="dt-progress-dots">
                {testimonials.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`dt-dot-indicator ${activeIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveIndex(idx)}
                  ></span>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default DashboardTestimonials;
