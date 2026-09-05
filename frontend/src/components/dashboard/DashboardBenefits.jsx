import React from 'react';
import { motion } from 'framer-motion';
import './DashboardBenefits.css';

const benefits = [
  {
    title: 'Professional Support',
    description: 'A dedicated manager handles the business side so you can focus entirely on creating.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    )
  },
  {
    title: 'Revenue Growth',
    description: 'Creators on ELVOORIQ average 3x revenue increase within the first 12 months.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    )
  },
  {
    title: 'Dedicated Manager',
    description: 'One point of contact who knows your brand, your audience, and your goals intimately.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    title: 'Technical Guidance',
    description: 'Studio setup consulting, encoding optimization, and 24/7 technical support for every stream.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>
    )
  },
  {
    title: 'Exclusive Campaigns',
    description: 'Access to premium brand campaigns reserved exclusively for ELVOORIQ creator network members.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    )
  },
  {
    title: 'Deep Analytics',
    description: 'Proprietary dashboard tracking retention, engagement, revenue, and audience growth in real time.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    )
  }
];

const DashboardBenefits = () => {
  return (
    <section className="db-section">
      <div className="db-container">
        
        {/* Header Area */}
        <motion.div 
          className="db-header-area"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="db-label">
            <span className="db-line"></span> CREATOR BENEFITS
          </div>
          <h2 className="db-title">
            What You Get When<br />
            <span className="db-highlight">You Stream With Us</span>
          </h2>
        </motion.div>

        {/* Benefits Grid */}
        <div className="db-grid">
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              className="db-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="db-card-icon">
                {benefit.icon}
              </div>
              <h3 className="db-card-title">{benefit.title}</h3>
              <p className="db-card-desc">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default DashboardBenefits;
