import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import { ArrowRight, CheckCircle2, TrendingUp, Sparkles, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { storiesDetails as fallbackStories } from '../../data/storiesData';
import StoryModal from '../../components/StoryModal';
import '../PageStyles.css';
import './CreatorStoriesPage.css';

const CreatorStoriesPage = () => {
  const [stories, setStories] = useState(fallbackStories);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeStory, setActiveStory] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/case-studies`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.caseStudies && data.caseStudies.length > 0) {
            const merged = data.caseStudies.map((cs, idx) => {
              const fallback = fallbackStories[idx] || fallbackStories[0];
              return {
                ...fallback,
                ...cs,
                id: cs.id || fallback.id,
                image: fallback.image
              };
            });
            setStories(merged);
          }
        }
      } catch (err) {
        console.error('Failed to load live case studies, displaying certified records:', err);
      }
    };
    fetchStories();
  }, []);

  const categories = ['ALL', 'LIFESTYLE', 'GAMING', 'TECH'];

  const filteredStories = selectedCategory === 'ALL'
    ? stories
    : stories.filter(s => s.category?.toUpperCase().includes(selectedCategory));

  return (
    <PageLayout>
      <div className="page-hero hero-creator-stories">
        <div className="page-hero-badge">
          <Sparkles size={14} style={{ color: '#00f59b' }} />
          <span>CREATOR CASE STUDIES</span>
        </div>
        <h1 className="page-hero-title">
          Real Creator <span className="title-accent">Transformations</span>
        </h1>
        <p className="page-hero-subtitle">
          Explore how premier digital talent scales audience reach, revenue streams, and enterprise brand partnerships with ELVOORIQ talent representation.
        </p>

        {/* Filter Pills */}
        <div className="category-filter-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'ALL' ? 'All Stories' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="container page-content-section">
        <div className="creator-stories-grid">
          {filteredStories.map((story, idx) => (
            <motion.div
              key={story.id}
              className="case-study-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.12 }}
              onClick={() => setActiveStory(story)}
            >
              {/* Creator Card Image Header */}
              <div className="card-image-header">
                <img src={story.image} alt={story.name} className="case-creator-image" />
                <div className="card-image-gradient"></div>
                <div className="card-badge-top">
                  <span className="case-journey-tag">{story.journey}</span>
                  <span className="case-multiplier-pill">{story.badge || '+44x Growth'}</span>
                </div>
              </div>

              {/* Creator Card Content */}
              <div className="case-card-body">
                <div className="case-header-row">
                  <div>
                    <span className="case-cat-label">{story.category}</span>
                    <h3 className="case-name">
                      {story.name}
                      <CheckCircle2 size={16} className="verified-icon" />
                    </h3>
                    <p className="case-handle">{story.handle}</p>
                  </div>
                </div>

                {/* Before vs After Metric Chips */}
                <div className="case-stats-row">
                  <div className="case-stat-chip chip-before">
                    <span className="chip-label">BEFORE</span>
                    <span className="chip-value">{story.before.revenue}</span>
                    <span className="chip-sub">{story.before.followers} followers</span>
                  </div>
                  <div className="case-stat-chip chip-after">
                    <span className="chip-label text-emerald">AFTER ELVOORIQ</span>
                    <span className="chip-value text-emerald">{story.after.revenue}</span>
                    <span className="chip-sub text-emerald">{story.after.followers} followers</span>
                  </div>
                </div>

                {/* Quote */}
                <p className="case-quote">"{story.quote}"</p>

                {/* Trigger Button */}
                <div className="case-card-footer">
                  <span className="btn-read-case">
                    View Full Case Study <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="cta-banner">
          <div className="cta-badge">
            <Award size={14} style={{ color: '#00f59b' }} />
            <span>JOIN THE TALENT ROSTER</span>
          </div>
          <h2 className="cta-title">Write Your Own Success Story</h2>
          <p className="cta-desc">
            Partner with dedicated talent managers who handle brand deals, live stream operations, and long-term career monetization.
          </p>
          <Link to="/register" className="btn-cta">
            Apply for Representation <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Story Popup Modal */}
      <AnimatePresence>
        {activeStory && (
          <StoryModal
            story={activeStory}
            currentIndex={stories.findIndex(s => s.id === activeStory.id)}
            totalStories={stories.length}
            onClose={() => setActiveStory(null)}
            onPrev={() => {
              const currIdx = stories.findIndex(s => s.id === activeStory.id);
              const prevIdx = currIdx <= 0 ? stories.length - 1 : currIdx - 1;
              setActiveStory(stories[prevIdx]);
            }}
            onNext={() => {
              const currIdx = stories.findIndex(s => s.id === activeStory.id);
              const nextIdx = currIdx >= stories.length - 1 ? 0 : currIdx + 1;
              setActiveStory(stories[nextIdx]);
            }}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default CreatorStoriesPage;
