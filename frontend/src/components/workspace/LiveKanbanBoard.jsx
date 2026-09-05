import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  X, 
  Sparkles, 
  Check, 
  ArrowUpRight 
} from 'lucide-react';
import './LiveKanbanBoard.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default function LiveKanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal tracking states
  const [activeTask, setActiveTask] = useState(null);
  const [progress, setProgress] = useState(0);
  const [hours, setHours] = useState('');
  const [summary, setSummary] = useState('');
  const [blockers, setBlockers] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch live tasks assigned to the authenticated employee on mount
  useEffect(() => {
    fetchLiveTasks();
  }, []);

  const fetchLiveTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('elvooriq_token');
      const response = await fetch(`${API_URL}/api/employee/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTasks(data.tasks || []);
      } else {
        setError(data.message || 'Failed to fetch tasks.');
      }
    } catch (err) {
      setError('Connection to backend database failed.');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (task) => {
    setActiveTask(task);
    setProgress(task.progressPercent || 0);
    setHours('');
    setSummary('');
    setBlockers('');
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!activeTask) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem('elvooriq_token');
      const response = await fetch(`${API_URL}/api/employee/tasks/${activeTask.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          progressPercent: parseInt(progress, 10),
          hoursSpent: parseFloat(hours) || 0,
          summary: summary || `Updated progress to ${progress}%`,
          blockers: blockers || null
        })
      });

      const resData = await response.json();
      if (response.ok) {
        // Refresh local tasks directly from DB transaction
        await fetchLiveTasks();
        setActiveTask(null);
      } else {
        alert(resData.message || 'Failed to save progress check-in.');
      }
    } catch (err) {
      alert('Network error while committing progress.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = {
    TODO: tasks.filter(t => t.status === 'TODO' || t.status === 'BACKLOG'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'REVIEW'),
    DONE: tasks.filter(t => t.status === 'DONE')
  };

  if (loading) {
    return (
      <div className="kanban-loader-container">
        <span className="kanban-pulse-text">
          <RotateCw className="spin-icon" size={18} />
          Querying Live Database Records...
        </span>
      </div>
    );
  }

  return (
    <div className="live-kanban-root">
      <div className="kanban-header-bar">
        <div>
          <h2 className="kanban-title">Workspace Tasks Kanban</h2>
          <p className="kanban-subtitle">Real-time task synchronization from live database records</p>
        </div>
        <button 
          onClick={fetchLiveTasks}
          className="kanban-refresh-btn"
        >
          <RotateCw size={13} />
          Force Refresh
        </button>
      </div>

      {error && (
        <div className="kanban-error-banner">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Columns */}
      <div className="kanban-columns-grid">
        {Object.entries(columns).map(([colName, colTasks]) => (
          <div key={colName} className="kanban-column-card">
            <div className="kanban-col-header">
              <span className="col-name">{colName.replace('_', ' ')}</span>
              <span className="col-badge">{colTasks.length}</span>
            </div>

            <div className="kanban-task-list">
              {colTasks.length === 0 ? (
                <div className="kanban-empty-placeholder">
                  No Active Tasks
                </div>
              ) : (
                colTasks.map(task => (
                  <motion.div
                    key={task.id}
                    whileHover={{ y: -3 }}
                    className="kanban-task-card"
                    onClick={() => openUpdateModal(task)}
                  >
                    <div className="task-top-row">
                      <h4 className="task-title">{task.title}</h4>
                      <ArrowUpRight size={14} className="task-arrow-icon" />
                    </div>
                    <p className="task-desc">{task.description || 'No description provided.'}</p>
                    
                    {/* Render Progress Bar */}
                    <div className="task-progress-track">
                      <div 
                        className="task-progress-fill" 
                        style={{ width: `${task.progressPercent || 0}%` }}
                      />
                    </div>
                    <div className="task-meta-row">
                      <span>Prog: <strong>{task.progressPercent || 0}%</strong></span>
                      <span className={`priority-pill priority-${(task.priority || 'MEDIUM').toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Modal */}
      <AnimatePresence>
        {activeTask && (
          <div className="kanban-modal-backdrop">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="kanban-modal-dialog"
            >
              <div className="modal-top-bar">
                <h3 className="modal-title">Submit Daily Progress Check-in</h3>
                <button 
                  onClick={() => setActiveTask(null)}
                  className="modal-close-icon-btn"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="modal-task-tag">Task: "{activeTask.title}"</p>

              <form onSubmit={handleProgressSubmit} className="kanban-modal-form">
                {/* Progress Slider */}
                <div className="form-item">
                  <div className="slider-label-row">
                    <span>Task Progress</span>
                    <span className="slider-value-display">{progress}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progress} 
                    onChange={(e) => setProgress(e.target.value)}
                    className="kanban-slider-input"
                  />
                </div>

                {/* Hours Input */}
                <div className="form-item">
                  <label className="field-label">Hours Spent Today</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0"
                    placeholder="e.g. 3.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    required
                    className="std-kanban-input"
                  />
                </div>

                {/* Log Summary */}
                <div className="form-item">
                  <label className="field-label">Progress Summary</label>
                  <textarea 
                    rows="3"
                    placeholder="Describe tasks completed or blockers encountered..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    required
                    className="std-kanban-textarea"
                  />
                </div>

                {/* Blockers */}
                <div className="form-item">
                  <label className="field-label">Blockers (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. API access limits, stream lag"
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    className="std-kanban-input"
                  />
                </div>

                {/* Action Buttons */}
                <div className="modal-actions-row">
                  <button
                    type="button"
                    onClick={() => setActiveTask(null)}
                    className="kanban-btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="kanban-btn-commit"
                  >
                    {submitting ? 'Committing...' : 'Commit Log'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
