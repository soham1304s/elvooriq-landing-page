import React from 'react';
import { motion } from 'framer-motion';
import { useAuthFlow } from '../../context/AuthFlowContext';

const ProgressBar = () => {
  const { progress, currentQuestionIndex, totalSteps } = useAuthFlow();

  return (
    <div className="progress-container">
      <div className="progress-text">
        <span className="progress-percentage">{progress}% Completed</span>
        <span className="progress-steps">{currentQuestionIndex + 1} of {totalSteps}</span>
      </div>
      <div className="progress-bar-bg">
        <motion.div 
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
