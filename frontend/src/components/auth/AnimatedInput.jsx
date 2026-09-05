import React from 'react';
import { motion } from 'framer-motion';

const AnimatedInput = ({ type, placeholder, value, onChange, onKeyDown, autoFocus }) => {
  return (
    <motion.div 
      className="animated-input-wrapper"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <input
        type={type}
        className="animated-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
      />
      <div className="input-glow"></div>
    </motion.div>
  );
};

export default AnimatedInput;
