import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Handshake,
  Sparkles,
  ShieldCheck,
  Crown,
  DollarSign,
  Zap,
  Star,
  Wrench,
  Video,
  Cpu,
  Award,
  Quote
} from 'lucide-react';
import './StoryModal.css';

const iconMap = {
  TrendingUp,
  Handshake,
  Sparkles,
  ShieldCheck,
  Crown,
  DollarSign,
  Zap,
  Star,
  Wrench,
  Video,
  Cpu,
  Award
};

const RenderIcon = ({ name, size = 20, className = '' }) => {
  const IconComponent = iconMap[name] || Sparkles;
  return <IconComponent size={size} className={className} />;
};

const StoryModal = ({ story, totalStories, currentIndex, onClose, onPrev, onNext }) => {
  // Lock body scroll when modal is active
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Handle escape & arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!story) return null;

  return (
    <motion.div
      className="story-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="story-modal-container"
        initial={{ opacity: 0, scale: 0.93, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="story-modal-topbar">
          <div className="story-badge-wrapper">
            <span className="story-badge-dot"></span>
            <span className="story-badge-text">{story.badge || 'SUCCESS STORY'}</span>
          </div>

          {/* Carousel Navigation Controls */}
          <div className="story-nav-controls">
            <button
              className="story-nav-btn"
              onClick={onPrev}
              title="Previous Story (Left Arrow)"
              aria-label="Previous Story"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="story-nav-counter">
              {currentIndex + 1} / {totalStories}
            </span>
            <button
              className="story-nav-btn"
              onClick={onNext}
              title="Next Story (Right Arrow)"
              aria-label="Next Story"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Close Button */}
          <button
            className="story-close-btn"
            onClick={onClose}
            title="Close modal (Esc)"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Story Body */}
        <div className="story-modal-body custom-scrollbar">
          {/* Creator Hero Header */}
          <div className="story-hero">
            <div className="story-hero-image-wrapper">
              <img src={story.image} alt={story.name} className="story-hero-image" />
              <span className="story-journey-pill">{story.journey}</span>
            </div>
            <div className="story-hero-details">
              <span className="story-category-tag">{story.category}</span>
              <h2 className="story-creator-name">{story.name}</h2>
              <p className="story-creator-handle">{story.handle}</p>
              <p className="story-summary-text">{story.summary}</p>
            </div>
          </div>

          <div className="story-divider"></div>

          {/* Side-by-Side Transformation Cards */}
          <div className="story-section-block">
            <h3 className="story-block-heading">The Transformation Breakdown</h3>
            <div className="story-comparison-grid">
              
              {/* Before Card */}
              <div className="story-comp-card before-card">
                <div className="story-comp-header">
                  <span className="comp-dot dot-gray"></span>
                  <span className="comp-header-title">BEFORE ELVOORIQ</span>
                </div>
                <div className="comp-status-badge status-before">{story.before.status}</div>
                <div className="comp-metrics-list">
                  <div className="metric-row">
                    <span className="metric-label">Followers</span>
                    <span className="metric-val">{story.before.followers}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Monthly Revenue</span>
                    <span className="metric-val">{story.before.revenue}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Brand Deals</span>
                    <span className="metric-val">{story.before.brandDeals}</span>
                  </div>
                </div>
                <p className="comp-details-text">{story.before.details}</p>
              </div>

              {/* After Card */}
              <div className="story-comp-card after-card">
                <div className="story-comp-header">
                  <span className="comp-dot dot-green"></span>
                  <span className="comp-header-title text-green">AFTER ELVOORIQ</span>
                </div>
                <div className="comp-status-badge status-after">{story.after.status}</div>
                <div className="comp-metrics-list">
                  <div className="metric-row">
                    <span className="metric-label text-green">Followers</span>
                    <span className="metric-val text-green-bold">{story.after.followers}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label text-green">Monthly Revenue</span>
                    <span className="metric-val text-green-bold">{story.after.revenue}</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label text-green">Brand Deals</span>
                    <span className="metric-val text-green-bold">{story.after.brandDeals}</span>
                  </div>
                </div>
                <p className="comp-details-text">{story.after.details}</p>
              </div>

            </div>
          </div>

          {/* The Initial Challenge */}
          <div className="story-section-block">
            <h3 className="story-block-heading">The Challenge</h3>
            <div className="story-challenge-box">
              <p className="story-challenge-text">{story.challenge}</p>
            </div>
          </div>

          {/* Strategic Growth Blueprint */}
          <div className="story-section-block">
            <h3 className="story-block-heading">Strategic Blueprint Executed</h3>
            <div className="story-strategy-grid">
              {story.strategy.map((strat, idx) => (
                <div className="story-strategy-card" key={idx}>
                  <div className="strat-icon-wrapper">
                    <RenderIcon name={strat.iconName} size={20} />
                  </div>
                  <div className="strat-content">
                    <h4 className="strat-title">{strat.title}</h4>
                    <p className="strat-desc">{strat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Milestones & Achievements */}
          <div className="story-section-block">
            <h3 className="story-block-heading">Key Results & Milestones</h3>
            <div className="story-milestones-list">
              {story.milestones.map((ms, idx) => (
                <div className="milestone-item" key={idx}>
                  <div className="milestone-icon">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="milestone-text">{ms}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="story-quote-banner">
            <Quote size={28} className="quote-mark-icon" />
            <blockquote className="story-quote-text">
              "{story.quote}"
            </blockquote>
            <span className="quote-author">— {story.name}, {story.category}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="story-modal-footer">
          <div className="story-footer-info">
            <span className="story-footer-label">ELVOORIQ Success Story Case Study</span>
          </div>
          <div className="story-footer-actions">
            <button className="story-footer-close-btn" onClick={onClose}>
              Close Story
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StoryModal;
