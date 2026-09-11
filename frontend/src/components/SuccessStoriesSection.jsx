import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer, fadeInLeft } from '../utils/animations';
import { storiesDetails as fallbackStories } from '../data/storiesData';
import StoryModal from './StoryModal';
import './SuccessStoriesSection.css';

const SuccessStoriesSection = () => {
  const [stories, setStories] = useState(fallbackStories);
  const [activeStoryId, setActiveStoryId] = useState('aishwarya');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/case-studies`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.caseStudies && data.caseStudies.length > 0) {
            // Merge with local fallback images and strategies
            const merged = data.caseStudies.map((cs, idx) => {
              const fallback = fallbackStories.find(f => 
                (cs.name && f.name.toLowerCase().includes(cs.name.toLowerCase().split(' ')[0])) ||
                (cs.id && f.id === cs.id)
              ) || fallbackStories[idx] || fallbackStories[0];
              return {
                ...fallback,
                ...cs,
                id: cs.id || fallback.id,
                category: cs.nicheCategory || cs.category || fallback.category,
                image: fallback.image,
                objectPosition: fallback.objectPosition || '50% 15%'
              };
            });
            setStories(merged);
            setActiveStoryId(merged[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch case studies, using verified records:', err);
      }
    };
    fetchStories();
  }, []);

  const activeStoryIndex = stories.findIndex(story => story.id === activeStoryId);
  const activeStory = stories[activeStoryIndex >= 0 ? activeStoryIndex : 0] || fallbackStories[0];

  const handlePrevStory = () => {
    const nextIndex = activeStoryIndex <= 0 ? stories.length - 1 : activeStoryIndex - 1;
    setActiveStoryId(stories[nextIndex].id);
  };

  const handleNextStory = () => {
    const nextIndex = activeStoryIndex >= stories.length - 1 ? 0 : activeStoryIndex + 1;
    setActiveStoryId(stories[nextIndex].id);
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
              {stories.map((story) => (
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
                <img 
                  src={activeStory.image} 
                  alt={activeStory.name} 
                  className="success-image" 
                  style={{ objectPosition: activeStory.objectPosition || '50% 15%' }}
                />
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
            totalStories={stories.length}
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

