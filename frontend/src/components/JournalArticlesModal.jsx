import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Clock,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Share2,
  Bookmark,
  CheckCircle2,
  Calendar,
  User
} from 'lucide-react';
import { articlesData } from '../data/articlesData';
import './JournalArticlesModal.css';

const categories = [
  'ALL',
  'CREATOR ECONOMY',
  'GROWTH STRATEGY',
  'LIVE STREAMING',
  'BRAND DEALS',
  'TECH & TOOLS'
];

const JournalArticlesModal = ({ initialArticleId = null, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(
    initialArticleId !== null
      ? articlesData.find((a) => a.id === initialArticleId) || null
      : null
  );

  // Lock background scroll when modal is active
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedArticle) {
          setSelectedArticle(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArticle, onClose]);

  // Filter articles based on active category & search query
  const filteredArticles = articlesData.filter((article) => {
    const matchesCategory =
      activeCategory === 'ALL' || article.category === activeCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div
      className="journal-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="journal-modal-container"
        initial={{ opacity: 0, scale: 0.93, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="journal-modal-topbar">
          <div className="journal-topbar-left">
            <div className="journal-modal-badge">
              <BookOpen size={14} className="badge-icon" />
              <span>ELVOORIQ JOURNAL</span>
            </div>
            <h3 className="journal-topbar-title">
              {selectedArticle ? selectedArticle.title : 'Latest Insights & Articles'}
            </h3>
          </div>

          <button
            className="journal-close-btn"
            onClick={onClose}
            title="Close modal (Esc)"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="journal-modal-body custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedArticle ? (
              /* Full Article Reader View */
              <motion.div
                key="reader-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="article-reader-container"
              >
                {/* Back to catalog button */}
                <button
                  className="reader-back-btn"
                  onClick={() => setSelectedArticle(null)}
                >
                  <ArrowLeft size={16} /> Back to All Articles
                </button>

                {/* Article Header Info */}
                <div className="reader-header">
                  <span className="reader-category-pill">
                    {selectedArticle.category}
                  </span>
                  <h1 className="reader-title">{selectedArticle.title}</h1>

                  {/* Author & Publication Meta */}
                  <div className="reader-author-meta">
                    <div className="author-info">
                      <img
                        src={selectedArticle.author.avatar}
                        alt={selectedArticle.author.name}
                        className="author-avatar"
                      />
                      <div className="author-text">
                        <span className="author-name">
                          {selectedArticle.author.name}
                        </span>
                        <span className="author-role">
                          {selectedArticle.author.role}
                        </span>
                      </div>
                    </div>

                    <div className="article-pub-meta">
                      <span className="meta-item">
                        <Calendar size={14} /> {selectedArticle.date}
                      </span>
                      <span className="meta-item">
                        <Clock size={14} /> {selectedArticle.readTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hero Image */}
                <div className="reader-hero-image-wrapper">
                  <img
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    className="reader-hero-image"
                  />
                </div>

                {/* Key Takeaways Box */}
                {selectedArticle.takeaways && (
                  <div className="reader-takeaways-box">
                    <div className="takeaways-header">
                      <Sparkles size={18} className="takeaway-sparkle-icon" />
                      <h4>Key Takeaways</h4>
                    </div>
                    <ul className="takeaways-list">
                      {selectedArticle.takeaways.map((item, idx) => (
                        <li key={idx} className="takeaway-item">
                          <CheckCircle2 size={16} className="check-icon" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Article Content Paragraphs */}
                <div className="reader-content-body">
                  {selectedArticle.content.map((block, idx) => (
                    <div className="reader-section-block" key={idx}>
                      <h3 className="reader-block-heading">{block.heading}</h3>
                      <p className="reader-block-text">{block.text}</p>
                    </div>
                  ))}
                </div>

                {/* Reader Footer Actions */}
                <div className="reader-footer-bar">
                  <button
                    className="reader-footer-btn"
                    onClick={() => setSelectedArticle(null)}
                  >
                    <ArrowLeft size={16} /> Back to Catalog
                  </button>
                  <button className="reader-footer-btn-close" onClick={onClose}>
                    Close Reader
                  </button>
                </div>
              </motion.div>
            ) : (
              /* All Articles Catalog View */
              <motion.div
                key="catalog-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="journal-catalog-container"
              >
                {/* Search & Category Filter Controls */}
                <div className="catalog-controls">
                  {/* Search Bar */}
                  <div className="catalog-search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      className="catalog-search-input"
                      placeholder="Search articles by title, topic, or keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        className="search-clear-btn"
                        onClick={() => setSearchQuery('')}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="catalog-category-pills">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        className={`catalog-cat-pill ${
                          activeCategory === cat ? 'active' : ''
                        }`}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Article Cards Grid */}
                {filteredArticles.length > 0 ? (
                  <div className="catalog-articles-grid">
                    {filteredArticles.map((art) => (
                      <div
                        className="catalog-article-card"
                        key={art.id}
                        onClick={() => setSelectedArticle(art)}
                      >
                        <div className="catalog-card-image-wrapper">
                          <img
                            src={art.image}
                            alt={art.title}
                            className="catalog-card-image"
                          />
                          <span className="catalog-card-category">
                            {art.category}
                          </span>
                        </div>

                        <div className="catalog-card-content">
                          <h4 className="catalog-card-title">{art.title}</h4>
                          <p className="catalog-card-snippet">{art.snippet}</p>

                          <div className="catalog-card-footer">
                            <span className="card-date">{art.date}</span>
                            <span className="card-read-time">
                              <Clock size={12} /> {art.readTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="catalog-empty-state">
                    <Search size={40} className="empty-search-icon" />
                    <h4>No articles found</h4>
                    <p>Try searching for another keyword or selecting "ALL".</p>
                    <button
                      className="reset-filter-btn"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('ALL');
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky Footer */}
        <div className="journal-modal-footer">
          <span className="journal-footer-label">
            ELVOORIQ Creator Journal • Showing {filteredArticles.length} of{' '}
            {articlesData.length} Articles
          </span>
          <button className="journal-footer-close" onClick={onClose}>
            Close Articles Window
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JournalArticlesModal;
