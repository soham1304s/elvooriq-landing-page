import React from 'react';
import { motion } from 'framer-motion';

const SuccessAnimation = () => {
  return (
    <motion.div 
      className="success-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <div className="success-icon-wrapper">
        <motion.svg 
          className="checkmark-svg" 
          viewBox="0 0 52 52"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.circle 
            cx="26" cy="26" r="25" fill="none" 
            className="checkmark-circle" 
          />
          <motion.path 
            className="checkmark-check" 
            fill="none" 
            d="M14.1 27.2l7.1 7.2 16.7-16.8" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          />
        </motion.svg>
      </div>
      <motion.h2 
        className="success-title"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        Welcome to Elvooriq
      </motion.h2>
      <motion.p 
        className="success-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Redirecting to your dashboard...
      </motion.p>
    </motion.div>
  );
};

export default SuccessAnimation;
