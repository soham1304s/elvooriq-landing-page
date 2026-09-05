import React from 'react';
import { motion } from 'framer-motion';

const AnimatedButton = ({ onClick, disabled, children }) => {
  return (
    <motion.button
      className={`animated-btn ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, backgroundColor: '#147a6a' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <span className="btn-text">{children}</span>
      <span className="btn-icon">→</span>
    </motion.button>
  );
};

export default AnimatedButton;
