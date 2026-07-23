import React from 'react';
import { useAuthFlow } from '../../context/AuthFlowContext';
import AnimatedInput from './AnimatedInput';
import AnimatedButton from './AnimatedButton';
import './Auth.css';

const QuestionCard = ({ question }) => {
  const { answers, saveAnswer, nextStep } = useAuthFlow();
  
  const currentValue = answers[question.id] || '';

  const handleChange = (val) => {
    saveAnswer(question.id, val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      nextStep();
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'choice':
        return (
          <div className="choice-container">
            {question.options.map(opt => (
              <button 
                key={opt.value}
                className={`choice-btn ${currentValue === opt.value ? 'selected' : ''}`}
                onClick={() => {
                  handleChange(opt.value);
                  // Automatically advance on choice selection
                  setTimeout(nextStep, 300);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );
      case 'dropdown':
        return (
          <select 
            className="auth-dropdown"
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
          >
            <option value="" disabled>Select {question.title}</option>
            {question.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            className="auth-textarea"
            placeholder={question.placeholder}
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
          />
        );
      default:
        // text, email, password, tel, number, url
        return (
          <AnimatedInput
            type={question.type}
            placeholder={question.placeholder}
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        );
    }
  };

  return (
    <div className="question-card glass-panel">
      <div className="question-header">
        <span className="question-subtitle">{question.subtitle}</span>
        <h2 className="question-title">{question.title}</h2>
      </div>
      
      <div className="question-body">
        {renderInput()}
      </div>

      <div className="question-footer">
        {question.type !== 'choice' && (
          <AnimatedButton onClick={nextStep} disabled={question.required && !currentValue}>
            Continue
          </AnimatedButton>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
