import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer, fadeInLeft, fadeInRight } from '../utils/animations';
import './SuccessStoriesSection.css';

const successStories = [
  {
    id: 'maya',
    name: 'Maya Lin',
    handle: '@mayastreams',
    category: 'LIFESTYLE CREATOR',
    journey: '18 months journey',
    image: '/creators/maya.png',
    before: {
      followers: '8.2K',
      revenue: '₹420/mo',
      brandDeals: '0'
    },
    after: {
      followers: '1.4M',
      revenue: '₹18,500/mo',
      brandDeals: '12'
    },
    quote: "ELVOORIQ gave me the infrastructure I didn't know I needed. Within a year my revenue grew 44x and I quit my 9-to-5."
  },
  {
    id: 'zara',
    name: 'Zara Williams',
    handle: '@zaracreates',
    category: 'FASHION & BEAUTY',
    journey: '24 months journey',
    image: '/creators/zara.png',
    before: {
      followers: '15K',
      revenue: '₹800/mo',
      brandDeals: '1'
    },
    after: {
      followers: '2.7M',
      revenue: '₹32,000/mo',
      brandDeals: '25'
    },
    quote: "The strategic guidance from ELVOORIQ transformed my channel from a hobby into a multi-million dollar business empire."
  },
  {
    id: 'nia',
    name: 'Nia Osei',
    handle: '@niatech',
    category: 'TECH & GAMING',
    journey: '12 months journey',
    image: '/creators/priya.png', // Reusing Priya's image for Nia
    before: {
      followers: '45K',
      revenue: '₹1,200/mo',
      brandDeals: '2'
    },
    after: {
      followers: '980K',
      revenue: '₹14,500/mo',
      brandDeals: '8'
    },
    quote: "They negotiated contracts I didn't even know were possible. I can finally focus just on creating content while they handle the business."
  }
];

const SuccessStoriesSection = () => {
  const [activeStoryId, setActiveStoryId] = useState('maya');

  const activeStory = successStories.find(story => story.id === activeStoryId);

  return (
    <section className="success-section" id="success">
      <div className="success-container container">
        
        {/* Header */}
        <motion.div 
          className="success-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="success-header-left">
            <div className="section-header">
              <span className="section-line"></span>
              <span className="section-subtitle">SUCCESS STORIES</span>
            </div>
            <h2 className="success-title">
              The Transformation<br/>
              <span className="title-highlight">Is Real</span>
            </h2>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="success-header-right">
            <div className="toggle-pills">
              {successStories.map((story) => (
                <button
                  key={story.id}
                  className={`toggle-pill ${activeStoryId === story.id ? 'active' : ''}`}
                  onClick={() => setActiveStoryId(story.id)}
                >
                  {story.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Content Layout */}
        <div className="success-content-grid">
          
          {/* Left: Image */}
          <motion.div 
            className="success-image-col"
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeStory.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="success-image-wrapper"
              >
                <img src={activeStory.image} alt={activeStory.name} className="success-image" />
                <div className="journey-badge">{activeStory.journey}</div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right: Details */}
          <motion.div 
            className="success-details-col"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeStory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                
                <div className="success-creator-info">
                  <p className="success-category">{activeStory.category}</p>
                  <h3 className="success-name">{activeStory.name}</h3>
                  <p className="success-handle">{activeStory.handle}</p>
                </div>

                {/* Before / After Cards */}
                <div className="comparison-cards">
                  
                  <div className="comp-card before-card">
                    <div className="comp-header">
                      <span className="dot dot-gray"></span> BEFORE
                    </div>
                    
                    <div className="comp-stats">
                      <div className="comp-stat-group">
                        <h4 className="comp-number">{activeStory.before.followers}</h4>
                        <p className="comp-label">FOLLOWERS</p>
                      </div>
                      <div className="comp-stat-group">
                        <h4 className="comp-number">{activeStory.before.revenue}</h4>
                        <p className="comp-label">MONTHLY REVENUE</p>
                      </div>
                      <div className="comp-stat-group">
                        <h4 className="comp-number">{activeStory.before.brandDeals}</h4>
                        <p className="comp-label">BRAND DEALS</p>
                      </div>
                    </div>
                  </div>

                  <div className="comp-card after-card">
                    <div className="comp-header">
                      <span className="dot dot-green"></span> AFTER ELVOORIQ
                    </div>
                    
                    <div className="comp-stats">
                      <div className="comp-stat-group">
                        <h4 className="comp-number-green">{activeStory.after.followers}</h4>
                        <p className="comp-label-green">FOLLOWERS</p>
                      </div>
                      <div className="comp-stat-group">
                        <h4 className="comp-number-green">{activeStory.after.revenue}</h4>
                        <p className="comp-label-green">MONTHLY REVENUE</p>
                      </div>
                      <div className="comp-stat-group">
                        <h4 className="comp-number-green">{activeStory.after.brandDeals}</h4>
                        <p className="comp-label-green">BRAND DEALS</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Quote and CTA */}
                <div className="success-quote-container">
                  <blockquote className="success-quote">
                    "{activeStory.quote}"
                  </blockquote>
                  
                  <button className="read-story-btn">
                    Read Full Story <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default SuccessStoriesSection;
