// frontend/src/components/employee/EmployeeTaskProgressSlider.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertTriangle, Send, Sparkles, Target } from 'lucide-react';
import './EmployeeTaskProgressSlider.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default function EmployeeTaskProgressSlider({ task, onUpdateSuccess }) {
  const [progress, setProgress] = useState(task?.progressPercent || 0);
  const [hoursSpent, setHoursSpent] = useState('');
  const [summary, setSummary] = useState('');
  const [blockers, setBlockers] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ success: '', error: '' });

  useEffect(() => {
    if (task) {
      setProgress(task.progressPercent || 0);
      setFeedback({ success: '', error: '' });
    }
  }, [task?.id, task?.progressPercent]);

  if (!task) return null;

  const handleSubmitProgress = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ success: '', error: '' });

    try {
      const response = await fetch(`${API_URL}/api/tasks/${task.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('elvooriq_token')}`
        },
        body: JSON.stringify({
          progressPercent: parseInt(progress, 10),
          hoursSpent: parseFloat(hoursSpent) || 0,
          summary: summary || `Routine progress logged at ${progress}%`,
          blockers: blockers || null
        })
      });

      const json = await response.json();

      if (response.ok) {
        setFeedback({ 
          success: `Routine progress updated successfully to ${progress}%!${progress === 100 ? ' (Delivered on-time)' : ''}`, 
          error: '' 
        });
        setHoursSpent('');
        setSummary('');
        setBlockers('');
        if (onUpdateSuccess) onUpdateSuccess(json.task);
      } else {
        setFeedback({ success: '', error: json.message || 'Failed to update progress.' });
      }
    } catch (err) {
      setFeedback({ success: '', error: 'Server communication failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const isCompleted = Number(progress) === 100;

  return (
    <div className="progress-slider-container">
      <div className="slider-task-header">
        <div className="slider-task-info">
          <div className="milestone-badge">
            <Target size={12} />
            <span>Assigned Operational Milestone</span>
          </div>
          <h3 className="slider-task-title">{task.title}</h3>
          {task.dueDate && (
            <p className="slider-task-deadline">
              <Clock size={13} className="clock-icon" />
              <span>Deadline: {new Date(task.dueDate).toLocaleString('en-US', { hour12: true })}</span>
            </p>
          )}
        </div>
        <div className="completion-hero-pill">
          <div className={`completion-percentage-tag ${isCompleted ? 'delivered' : ''}`}>
            {isCompleted && <Sparkles size={14} />}
            <span>{progress}%</span>
          </div>
          <span className="completion-status-sub">{isCompleted ? 'Target Reached' : 'In Progress'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmitProgress} className="progress-slider-form">
        {/* Dynamic Interactive Range Slider */}
        <div className="slider-control-card">
          <div className="slider-label-row">
            <label className="slider-section-label">
              Routine Progress Range Selector
            </label>
            <span className="slider-live-value">{progress}%</span>
          </div>

          <div className="slider-track-row">
            <span className="slider-limit-label">0%</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={progress} 
              onChange={(e) => setProgress(Number(e.target.value))}
              className="custom-progress-slider"
            />
            <span className="slider-limit-label max">100%</span>
          </div>

          {/* Quick Preset Selector Chips */}
          <div className="slider-presets-row">
            {[25, 50, 75, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                className={`preset-chip ${Number(progress) === preset ? 'active' : ''}`}
                onClick={() => setProgress(preset)}
              >
                {preset === 100 ? '100% (Complete)' : `${preset}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Input Row: Hours Worked & Active Blockers */}
        <div className="form-dual-row">
          <div className="form-field-group">
            <label>Hours Worked</label>
            <input 
              type="number" 
              step="0.5" 
              min="0"
              value={hoursSpent} 
              onChange={(e) => setHoursSpent(e.target.value)} 
              placeholder="e.g. 2.5" 
              required
            />
          </div>
          <div className="form-field-group">
            <label>Active Blockers (Optional)</label>
            <input 
              type="text" 
              value={blockers} 
              onChange={(e) => setBlockers(e.target.value)} 
              placeholder="Describe bottlenecks / dependencies" 
            />
          </div>
        </div>

        {/* Detailed Progress Log Summary */}
        <div className="form-field-group">
          <label>Detailed Progress Log Summary</label>
          <textarea 
            rows="3" 
            value={summary} 
            onChange={(e) => setSummary(e.target.value)} 
            placeholder="List tasks completed, details of implementation, or pending updates..." 
            required
          />
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="submit-routine-btn"
        >
          <Send size={14} />
          <span>{submitting ? "Committing Milestone Update..." : "Submit Routine Log Check"}</span>
        </motion.button>
      </form>

      {feedback.success && (
        <div className="feedback-banner success">
          <CheckCircle2 size={16} />
          <span>{feedback.success}</span>
        </div>
      )}
      
      {feedback.error && (
        <div className="feedback-banner error">
          <AlertTriangle size={16} />
          <span>{feedback.error}</span>
        </div>
      )}
    </div>
  );
}
