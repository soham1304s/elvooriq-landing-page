import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import authFlowConfig from '../config/authFlowConfig';
import { socket } from '../socket/socketManager';

const AuthFlowContext = createContext();

export const useAuthFlow = () => useContext(AuthFlowContext);

export const AuthFlowProvider = ({ children }) => {
  const [currentStepId, setCurrentStepId] = useState(authFlowConfig.questions[0].id);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward (for animations)
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const API_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';

  // Restore state from sessionStorage or start a new session on backend
  useEffect(() => {
    const initializeFlow = async () => {
      const savedState = sessionStorage.getItem('elvooriq_auth_progress');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.currentStepId && parsed.answers && parsed.sessionId) {
          setCurrentStepId(parsed.currentStepId);
          setAnswers(parsed.answers);
          setSessionId(parsed.sessionId);
          return;
        }
      }

      // Start new session
      try {
        const response = await axios.post(`${API_URL}/api/auth/start`, {
          initialStep: authFlowConfig.questions[0].id
        });
        setSessionId(response.data.sessionId);
        
        socket.emit('auth:start', {
          sessionId: response.data.sessionId,
          step: authFlowConfig.questions[0].id
        });
      } catch (err) {
        console.error("Failed to start auth session", err);
      }
    };
    
    initializeFlow();
  }, []);

  // Save state to sessionStorage on change
  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem('elvooriq_auth_progress', JSON.stringify({
        currentStepId,
        answers,
        sessionId
      }));
    }
  }, [currentStepId, answers, sessionId]);

  const currentQuestionIndex = authFlowConfig.questions.findIndex(q => q.id === currentStepId);
  const currentQuestion = authFlowConfig.questions[currentQuestionIndex];
  
  // Calculate Progress (0-100) dynamically based on reachable questions
  // For simplicity right now, we use a flat percentage.
  const totalSteps = authFlowConfig.questions.length;
  const progress = Math.round((currentQuestionIndex / (totalSteps - 1)) * 100);

  const saveAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const nextStep = () => {
    // Basic validation check
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      return; 
    }

    setDirection(1);
    
    // Save progress to backend
    if (sessionId) {
      axios.post(`${API_URL}/api/auth/save-progress`, {
        sessionId,
        step: currentQuestion.id,
        answers,
        progress
      }).catch(err => console.error("Failed to save progress", err));

      socket.emit('auth:progress', {
        sessionId,
        step: currentQuestion.id,
        progress
      });
    }
    
    // Evaluate conditions for the next step (smart flow logic)
    let nextIndex = currentQuestionIndex + 1;
    
    while (nextIndex < authFlowConfig.questions.length) {
      const nextQ = authFlowConfig.questions[nextIndex];
      // If there is no condition, or the condition evaluates to true
      if (!nextQ.condition || nextQ.condition(answers)) {
        setCurrentStepId(nextQ.id);
        return;
      }
      nextIndex++;
    }
    
    // Reached the end - authenticate
    submitAuthentication();
  };

  const submitAuthentication = async () => {
    setIsAuthenticating(true);
    try {
      const endpoint = answers.flow_type === 'register' ? '/api/auth/register' : '/api/auth/login';
      const response = await axios.post(`${API_URL}${endpoint}`, {
        sessionId
      });

      if (response.data.success) {
        // Store JWT token (you'd typically put this in a secure cookie or local storage)
        localStorage.setItem('elvooriq_token', response.data.token);
        setAuthSuccess(true);
        sessionStorage.removeItem('elvooriq_auth_progress');
        
        socket.emit('auth:success', {
          sessionId,
          flowType: answers.flow_type
        });
      }
    } catch (error) {
      console.error("Authentication failed", error.response?.data?.message);
      // Here we would typically show an error animation/toast
    } finally {
      setIsAuthenticating(false);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    let prevIndex = currentQuestionIndex - 1;
    
    while (prevIndex >= 0) {
      const prevQ = authFlowConfig.questions[prevIndex];
      if (!prevQ.condition || prevQ.condition(answers)) {
        setCurrentStepId(prevQ.id);
        return;
      }
      prevIndex--;
    }
  };

  const value = {
    currentQuestion,
    currentQuestionIndex,
    totalSteps,
    progress,
    answers,
    direction,
    isAuthenticating,
    authSuccess,
    saveAnswer,
    nextStep,
    prevStep,
  };

  return (
    <AuthFlowContext.Provider value={value}>
      {children}
    </AuthFlowContext.Provider>
  );
};
