import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer, fadeInLeft } from '../utils/animations';
import { storiesDetails } from '../data/storiesData';
import StoryModal from './StoryModal';
import './SuccessStoriesSection.css';

const SuccessStoriesSection = () => {
  const [activeStoryId, setActiveStoryId] = useState('maya');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeStoryIndex = storiesDetails.findIndex(story => story.id === activeStoryId);
  const activeStory = storiesDetails[activeStoryIndex >= 0 ? activeStoryIndex : 0];

  const handlePrevStory = () => {
    const nextIndex = activeStoryIndex === 0 ? storiesDetails.length - 1 : activeStoryIndex - 1;
    setActiveStoryId(storiesDetails[nextIndex].id);
  };

  const handleNextStory = () => {
    const nextIndex = activeStoryIndex === storiesDetails.length - 1 ? 0 : activeStoryIndex + 1;
    setActiveStoryId(storiesDetails[nextIndex].id);
  };

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
              {storiesDetails.map((story) => (
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
                onClick={() => setIsModalOpen(true)}
                style={{ cursor: 'pointer' }}
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
                  
                  <button 
                    type="button" 
                    className="read-story-btn"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Read Full Story <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

          </motion.div>

        </div>

      </div>

      {/* Story Popup Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <StoryModal
            story={activeStory}
            currentIndex={activeStoryIndex}
            totalStories={storiesDetails.length}
            onClose={() => setIsModalOpen(false)}
            onPrev={handlePrevStory}
            onNext={handleNextStory}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default SuccessStoriesSection;

