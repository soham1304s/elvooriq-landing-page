import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthFlow } from '../../context/AuthFlowContext';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';
import LoadingScreen from './LoadingScreen';
import SuccessAnimation from './SuccessAnimation';
import { useNavigate } from 'react-router-dom';

const FlowEngine = () => {
  const { currentQuestion, direction, isAuthenticating, authSuccess, prevStep, currentQuestionIndex } = useAuthFlow();
  const navigate = useNavigate();

  // Animation variants for the slide effect
  const slideVariants = {
    enter: (direction) => ({
      y: direction > 0 ? 50 : -50,
      opacity: 0,
      filter: 'blur(10px)',
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      y: direction < 0 ? 50 : -50,
      opacity: 0,
      filter: 'blur(10px)',
      scale: 1.05
    })
  };

  useEffect(() => {
    if (authSuccess) {
      // Redirect to dashboard after success animation
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [authSuccess, navigate]);

  if (authSuccess) {
    return <SuccessAnimation />;
  }

  if (isAuthenticating) {
    return <LoadingScreen />;
  }

  return (
    <div className="flow-engine-wrapper">
      {/* Top Bar for Back Navigation */}
      <div className="flow-header">
        {currentQuestionIndex > 0 && (
          <button onClick={prevStep} className="auth-back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
        )}
      </div>

      <div className="flow-question-container">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              y: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              filter: { duration: 0.3 }
            }}
            className="question-motion-wrapper"
          >
            <QuestionCard question={currentQuestion} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flow-footer">
        <ProgressBar />
      </div>
    </div>
  );
};

export default FlowEngine;
