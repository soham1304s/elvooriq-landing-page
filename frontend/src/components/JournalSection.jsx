import React, { useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { articlesData } from '../data/articlesData';
import JournalArticlesModal from './JournalArticlesModal';
import './JournalSection.css';

const JournalSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);

  const featuredArticles = articlesData.slice(0, 3);

  const handleOpenAll = (e) => {
    if (e) e.preventDefault();
    setSelectedArticleId(null);
    setIsModalOpen(true);
  };

  const handleOpenArticle = (id) => {
    setSelectedArticleId(id);
    setIsModalOpen(true);
  };

  return (
    <section className="journal-section" id="journal">
      <div className="journal-container container">
        
        {/* Header */}
        <motion.div 
          className="journal-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="journal-header-left">
            <div className="section-header">
              <span className="section-line"></span>
              <span className="section-subtitle">LATEST INSIGHTS</span>
            </div>
            <h2 className="journal-title">
              From the<br/>
              <span className="title-highlight">ELVOORIQ Journal</span>
            </h2>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="journal-header-right">
            <button 
              type="button"
              className="all-articles-link"
              onClick={handleOpenAll}
            >
              All Articles <ArrowRight size={16} />
            </button>
          </motion.div>
        </motion.div>

        {/* Article Grid */}
        <motion.div 
          className="journal-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {featuredArticles.map((article) => (
            <motion.div 
              variants={fadeInUp} 
              className="article-card" 
              key={article.id}
              onClick={() => handleOpenArticle(article.id)}
              style={{ cursor: 'pointer' }}
            >
              
              <div className="article-image-wrapper">
                <img src={article.image} alt={article.title} className="article-image" />
              </div>
              
              <div className="article-content">
                <span className="article-category">{article.category}</span>
                <h3 className="article-title">{article.title}</h3>
                
                <div className="article-meta">
                  <span className="article-date">{article.date}</span>
                  <span className="meta-dot">•</span>
                  <span className="article-read-time">
                    <Clock size={12} className="clock-icon" /> {article.readTime}
                  </span>
                </div>
              </div>
              
            </motion.div>
          ))}
        </motion.div>

      </div>

      {/* Articles Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <JournalArticlesModal
            initialArticleId={selectedArticleId}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default JournalSection;

