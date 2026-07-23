import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DashboardFAQ.css';

const faqs = [
  {
    id: 1,
    question: 'Do I need a large following to apply?',
    answer: 'No. We work with creators from 1,000 to 10M+ followers. What matters more than size is your consistency, engagement rate, and the niche you serve. We have seen micro-streamers grow faster than established accounts.'
  },
  {
    id: 2,
    question: 'Which platforms do you support?',
    answer: 'We officially support YouTube Live, Twitch, TikTok Live, Facebook Gaming, and Kick. We also offer beta support for smaller niche streaming platforms depending on your specific audience.'
  },
  {
    id: 3,
    question: 'How quickly can I start earning?',
    answer: 'Most creators see their first brand deal or monetization increase within the first 30 days of onboarding. It depends on your current metrics, but our management team works quickly to optimize your revenue streams.'
  },
  {
    id: 4,
    question: 'What equipment do I need to get started?',
    answer: 'At a minimum, you need a reliable internet connection, a 1080p camera, and a good quality microphone. If you lack equipment, we offer equipment grants to creators who pass our initial probation period.'
  },
  {
    id: 5,
    question: 'Is there a cost to join ELVOORIQ?',
    answer: 'No upfront costs whatsoever. We operate on a pure revenue-share model. We only make money when you make money, ensuring our incentives are completely aligned with your growth.'
  },
  {
    id: 6,
    question: 'How is ELVOORIQ different from other agencies?',
    answer: 'Unlike traditional agencies that just forward you emails, we provide full technical studio support, real-time analytics dashboards, and a dedicated manager who actively pitches your channel to premium brands.'
  },
  {
    id: 7,
    question: 'What does the onboarding process look like?',
    answer: 'After you apply, you will have a 30-minute discovery call with a manager. If approved, we spend week one auditing your channel, week two upgrading your tech/assets, and week three launching your new strategy.'
  },
  {
    id: 8,
    question: 'Can I keep my existing brand deals?',
    answer: 'Absolutely. Any brand deals or sponsorships you secured prior to joining ELVOORIQ remain 100% yours. We only take a commission on the new revenue and deals that our team brings to you.'
  }
];

const DashboardFAQ = () => {
  const [openId, setOpenId] = useState(1); // Default first item open

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="dfaq-section">
      <div className="dfaq-container">
        
        {/* Header Area */}
        <motion.div 
          className="dfaq-header-area"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="dfaq-label">
            <span className="dfaq-line"></span> FAQ
          </div>
          <h2 className="dfaq-title">
            Everything You<br />
            <span className="dfaq-highlight">Want to Know</span>
          </h2>
        </motion.div>

        {/* Accordion List */}
        <div className="dfaq-list">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            
            return (
              <motion.div 
                key={faq.id} 
                className={`dfaq-item ${isOpen ? 'active' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: faq.id * 0.1 }}
              >
                <button 
                  className="dfaq-question-btn" 
                  onClick={() => toggleAccordion(faq.id)}
                >
                  <span className="dfaq-question-text">{faq.question}</span>
                  <div className="dfaq-icon">
                    {isOpen ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="dfaq-answer-container"
                    >
                      <div className="dfaq-answer-content">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default DashboardFAQ;
