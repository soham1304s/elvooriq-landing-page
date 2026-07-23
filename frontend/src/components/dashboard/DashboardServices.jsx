import React from 'react';
import { motion } from 'framer-motion';
import './DashboardServices.css';

const services = [
  {
    title: 'Live Streaming Management',
    description: 'Full-service management of your live streaming operations across all platforms — scheduling, production, and community moderation.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20v-8M6 20V12M18 20v-4M22 20v-2M2 20v-6"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    )
  },
  {
    title: 'Platform Optimization',
    description: 'Algorithm-backed optimization for each platform\'s unique mechanics to maximize your reach, watch time, and discoverability.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    )
  },
  {
    title: 'Streaming Strategy',
    description: 'Custom content calendars, niche positioning, and growth roadmaps engineered specifically for live creators.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
        <polyline points="16 7 22 7 22 13"></polyline>
      </svg>
    )
  },
  {
    title: 'Monetization Support',
    description: 'Unlock every revenue stream — subscriptions, gifting, brand deals, merchandise, and platform monetization programs.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    )
  },
  {
    title: 'Audience Growth',
    description: 'Proven tactics to convert casual viewers to loyal, paying community members who show up every stream.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    title: 'Brand Collaborations',
    description: 'Curated brand integrations with 500+ global partners vetted to authentically align with your content and audience.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M8 13h2"></path>
        <path d="M8 17h2"></path>
        <path d="M14 13h2"></path>
        <path d="M14 17h2"></path>
      </svg>
    )
  },
  {
    title: 'Technical Assistance',
    description: '24/7 support for equipment, encoding, simulcasting, overlays, and everything that keeps your stream running flawlessly.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>
    )
  },
  {
    title: 'Creator Coaching',
    description: 'One-on-one coaching from elite streamers who have built seven-figure audiences in your exact niche.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
      </svg>
    )
  }
];

const DashboardServices = () => {
  return (
    <section className="ds-services-section">
      <div className="ds-container">
        
        {/* Header Area */}
        <div className="ds-header-area">
          <motion.div 
            className="ds-header-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="ds-label">
              <span className="ds-line"></span> WHAT WE OFFER
            </div>
            <h2 className="ds-title">
              Everything You Need<br />
              <span className="ds-highlight">to Dominate Live</span>
            </h2>
          </motion.div>
          
          <motion.div 
            className="ds-header-right"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p>
              Eight specialised services, one integrated<br />
              system designed to turn your live presence into<br />
              a full-time career.
            </p>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="ds-grid">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              className="ds-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <div className="ds-card-icon">
                {service.icon}
              </div>
              <h3 className="ds-card-title">{service.title}</h3>
              <p className="ds-card-desc">{service.description}</p>
              <a href="#" className="ds-card-link">
                Learn More <span>→</span>
              </a>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default DashboardServices;
