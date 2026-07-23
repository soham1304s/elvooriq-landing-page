import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import './JournalSection.css';

const articles = [
  {
    id: 1,
    category: 'CREATOR ECONOMY',
    title: 'How Women Creators Are Rewriting the Rules of Digital Media in 2026',
    date: 'Jan 12, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    category: 'GROWTH STRATEGY',
    title: 'The 7 Revenue Streams Every Creator Must Activate This Year',
    date: 'Jan 8, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    category: 'LIVE STREAMING',
    title: 'Mastering Viewer Engagement: Techniques That Convert Viewers to Loyal Fans',
    date: 'Dec 28, 2025',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const JournalSection = () => {
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
            <a href="#" className="all-articles-link">
              All Articles <ArrowRight size={16} />
            </a>
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
          {articles.map((article) => (
            <motion.div variants={fadeInUp} className="article-card" key={article.id}>
              
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
    </section>
  );
};

export default JournalSection;
