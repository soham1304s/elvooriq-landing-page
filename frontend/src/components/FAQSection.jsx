import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import './FAQSection.css';

const faqs = [
  {
    question: "How do I join ELVOORIQ?",
    answer: "You can apply to join ELVOORIQ through our Creator Application portal. Our talent team reviews all applications and reaches out to creators who align with our current roster and brand partnerships strategy."
  },
  {
    question: "What types of creators do you work with?",
    answer: "We represent a diverse range of creators across lifestyle, gaming, tech, fashion, and educational niches. We look for creators with strong, engaged communities rather than just high follower counts."
  },
  {
    question: "How does creator management actually work?",
    answer: "Our management acts as an extension of your team. We handle brand outreach, contract negotiation, content strategy, and administrative tasks, allowing you to focus entirely on creating high-quality content."
  },
  {
    question: "What streaming platforms do you support?",
    answer: "We support creators across all major platforms including YouTube, Twitch, TikTok, Instagram, and emerging platforms. We also help creators diversify their presence across multiple platforms."
  },
  {
    question: "How long until I see results?",
    answer: "While every creator's journey is unique, most of our partners see significant revenue growth and brand partnership opportunities within the first 3 to 6 months of joining our network."
  },
  {
    question: "Do you work with international creators?",
    answer: "Yes, we represent creators globally. Our brand network is international, allowing us to connect creators with global campaigns regardless of their home country."
  },
  {
    question: "What are your fees?",
    answer: "We operate on a transparent commission-based model. We only succeed when you succeed. Specific fee structures are discussed during the onboarding process based on the level of management required."
  },
  {
    question: "What makes ELVOORIQ different from other agencies?",
    answer: "Unlike traditional agencies that focus solely on transactional sponsorships, we focus on building sustainable, long-term businesses for our creators through diversified revenue streams, equity partnerships, and strategic growth."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq">
      <div className="faq-container container">
        
        {/* Header */}
        <motion.div 
          className="faq-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="section-header-center">
            <span className="section-line"></span>
            <span className="section-subtitle">FAQ</span>
          </motion.div>
          
          <motion.h2 variants={fadeInUp} className="faq-title">
            Questions We<br/>
            <span className="title-highlight">Hear Most Often</span>
          </motion.h2>
        </motion.div>

        {/* FAQ List */}
        <motion.div 
          className="faq-list"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {faqs.map((faq, index) => (
            <motion.div 
              variants={fadeInUp}
              className={`faq-card ${openIndex === index ? 'open' : ''}`} 
              key={index}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question-row">
                <h4 className="faq-question">{faq.question}</h4>
                <motion.button 
                  className="faq-toggle-btn"
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Plus size={16} />
                </motion.button>
              </div>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div 
                    className="faq-answer-wrapper"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="faq-answer">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default FAQSection;
