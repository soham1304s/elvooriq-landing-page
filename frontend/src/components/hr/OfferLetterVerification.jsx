// frontend/src/components/hr/OfferLetterVerification.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Cpu, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Trash2, 
  RefreshCw, 
  FileCheck, 
  ShieldCheck, 
  UserCheck, 
  X 
} from 'lucide-react';
import './OfferLetterVerification.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default function OfferLetterVerification({ userId, employeeName, onSyncComplete }) {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  
  // Inline editable confirmation state models
  const [editableSalary, setEditableSalary] = useState('');
  const [editableCurrency, setEditableCurrency] = useState('INR');
  const [editableJobTitle, setEditableJobTitle] = useState('');
  const [editableStartDate, setEditableStartDate] = useState('');

  const processSelectedFile = (selectedFile) => {
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf'))) {
      setFile(selectedFile);
      setError('');
      setSuccess('');
    } else {
      setError('Unsupported file format. Please provide a standard vector PDF offer letter document.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processSelectedFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRunIngestion = async () => {
    if (!file) return;
    setLoading(true);
    setParsedData(null);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('offerLetter', file);

    try {
      const response = await fetch(`${API_URL}/api/hr/upload-offer-letter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('elvooriq_token')}`
        },
        body: formData
      });

      const json = await response.json();
      
      if (response.ok && json.data) {
        setParsedData(json.data);
        setEditableSalary(json.data.baseSalary || 0);
        setEditableCurrency(json.data.extractedCurrency || 'INR');
        setEditableJobTitle(json.data.jobTitle || 'Talent Agent');
        if (json.data.startDate) {
          setEditableStartDate(json.data.startDate.split('T')[0]);
        }
      } else {
        setError(json.message || 'Text extraction failed. Try a different contract PDF.');
      }
    } catch (err) {
      setError('Connection to document parser timed out.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalCommit = async () => {
    if (!userId) {
      setError('Please select an employee profile in the selector above before committing this offer letter.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/hr/employee/${userId}/employment-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('elvooriq_token')}`
        },
        body: JSON.stringify({
          jobTitle: editableJobTitle,
          baseSalary: parseFloat(editableSalary) || 0,
          currency: editableCurrency,
          startDate: editableStartDate,
          onboardingMethod: 'PARSED_OFFER',
          rawSnippet: parsedData?.matchedSnippet,
          rawExtractedValue: parsedData?.rawExtractedValue,
          extractedCurrency: parsedData?.extractedCurrency
        })
      });

      if (response.ok) {
        setSuccess('Employment compensation records successfully verified and written to database!');
        setError('');
        if (onSyncComplete) onSyncComplete();
      } else {
        const json = await response.json();
        setError(json.message || 'Verification rejected during database update.');
      }
    } catch (err) {
      setError('Database synchronization failed.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="offer-studio-container">
      {/* Header Bar */}
      <div className="offer-studio-header">
        <div className="offer-studio-title-box">
          <div className="offer-studio-icon-wrap">
            <Cpu size={20} />
          </div>
          <div>
            <h3 className="offer-studio-title">
              Offer Letter Ingestion Studio
              <span className="offer-studio-badge">NLP v4.0</span>
            </h3>
          </div>
        </div>

        {employeeName ? (
          <div className="offer-studio-target-pill">
            <UserCheck size={14} color="#34d399" />
            <span>Target: <strong className="target-pill-name">{employeeName}</strong></span>
          </div>
        ) : (
          <div className="offer-studio-target-pill" style={{ borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}>
            <AlertTriangle size={14} />
            <span>No employee selected</span>
          </div>
        )}
      </div>

      {/* Hidden File Input (Completely isolated) */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="application/pdf" 
        onChange={handleFileChange} 
        className="offer-hidden-input"
        id="offer-letter-file-input"
        tabIndex={-1}
      />

      {/* DROPZONE / FILE STAGING (Visible when not parsed yet and not loading) */}
      {!parsedData && !loading && (
        <div 
          className={`offer-dropzone ${isDragOver ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {!file ? (
            <div>
              <div className="offer-upload-graphic-wrap">
                <div className="offer-radar-ring" />
                <div className="offer-radar-ring ring-2" />
                <div className="offer-icon-box">
                  <UploadCloud size={28} />
                </div>
              </div>
              <h4 className="offer-dropzone-title">
                Drag & drop contract PDF here, or <span className="accent-browse">browse files</span>
              </h4>
              <p className="offer-dropzone-subtitle">
                Only vector PDF documents are supported • Max filesize: 10MB
              </p>
            </div>
          ) : (
            <div>
              <div className="offer-file-preview-card">
                <div className="file-preview-left">
                  <div className="file-badge-pdf">
                    <FileText size={20} />
                    <span>PDF</span>
                  </div>
                  <div className="file-meta-info">
                    <span className="file-name-text" title={file.name}>{file.name}</span>
                    <span className="file-size-text">{formatFileSize(file.size)} • Ready for NLP Parsing</span>
                  </div>
                </div>
                <button 
                  type="button"
                  className="file-remove-btn" 
                  onClick={handleRemoveFile}
                  title="Remove file"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="offer-action-btn-row">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRunIngestion();
                  }}
                  className="offer-parse-btn"
                >
                  <Sparkles size={16} />
                  <span>Initiate In-Memory NLP Extraction</span>
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LASER SCANNING ANIMATION STATE */}
      {loading && (
        <div className="offer-scanner-box">
          <div className="scanner-spinner-wrap">
            <RefreshCw size={24} />
          </div>
          <h4 className="scanner-title">Executing Heuristic Contract Parser</h4>
          <p className="scanner-subtitle">Decompiling vector PDF stream and scanning lookaround regex tokens...</p>
          
          <div className="scanner-steps-trail">
            <span className="scanner-step-tag">✓ PDF Stream Decoded</span>
            <span className="scanner-step-tag">⚡ CTC Lookaround Matrix</span>
            <span className="scanner-step-tag">🔍 Isolating Designation</span>
            <span className="scanner-step-tag">🌐 Normalizing ISO Currency</span>
          </div>
        </div>
      )}

      {/* EXTRACTION RESULTS STUDIO */}
      <AnimatePresence>
        {parsedData && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="offer-results-grid"
          >
            {/* Block A: Forensic Snippet Console */}
            <div className="offer-snippet-panel">
              <div>
                <div className="snippet-panel-header">
                  <span className="snippet-panel-title">
                    <FileCheck size={14} color="#D4AF37" />
                    Forensic Contract Context
                  </span>
                  <span className="snippet-match-badge">
                    {Math.round(parsedData.confidenceScore * 100)}% Confidence
                  </span>
                </div>

                <div className="snippet-terminal-box">
                  {parsedData.matchedSnippet || '"No contextual text snippet isolated near extracted metrics."'}
                </div>
              </div>

              <div className="snippet-footer-metrics">
                <div className="snippet-metric-chip">
                  <span>RAW VALUE:</span>
                  <span className="snippet-metric-val">{parsedData.rawExtractedValue || 'N/A'}</span>
                </div>
                <div className="snippet-metric-chip">
                  <span>INTERVAL:</span>
                  <span className="snippet-metric-val">{parsedData.intervalUsed?.toUpperCase() || 'ANNUAL'}</span>
                </div>
              </div>
            </div>

            {/* Block B: Metadata Verification Form */}
            <div className="offer-form-panel">
              <h4 className="form-panel-title">Payroll Verification Form</h4>

              <div className="offer-field-group">
                <label className="offer-field-label">
                  <Briefcase size={12} color="#D4AF37" />
                  Job Title / Official Designation
                </label>
                <div className="offer-input-wrapper">
                  <Briefcase size={16} className="offer-input-icon" />
                  <input 
                    type="text" 
                    value={editableJobTitle} 
                    onChange={(e) => setEditableJobTitle(e.target.value)}
                    className="offer-text-input"
                    placeholder="e.g. Senior YouTube Operations Lead"
                  />
                </div>
              </div>

              <div className="offer-grid-two">
                <div className="offer-field-group">
                  <label className="offer-field-label">
                    <DollarSign size={12} color="#D4AF37" />
                    Monthly Salary / Base
                  </label>
                  <div className="offer-input-wrapper">
                    <DollarSign size={16} className="offer-input-icon" />
                    <input 
                      type="number" 
                      value={editableSalary} 
                      onChange={(e) => setEditableSalary(e.target.value)}
                      className="offer-text-input"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="offer-field-group">
                  <label className="offer-field-label">Currency</label>
                  <select 
                    value={editableCurrency} 
                    onChange={(e) => setEditableCurrency(e.target.value)}
                    className="offer-select-input"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="offer-field-group">
                <label className="offer-field-label">
                  <Calendar size={12} color="#D4AF37" />
                  Effective Start Date
                </label>
                <div className="offer-input-wrapper">
                  <Calendar size={16} className="offer-input-icon" />
                  <input 
                    type="date" 
                    value={editableStartDate} 
                    onChange={(e) => setEditableStartDate(e.target.value)}
                    className="offer-text-input"
                  />
                </div>
              </div>

              <div className="offer-form-btn-row">
                <button
                  type="button"
                  onClick={() => { 
                    setParsedData(null); 
                    setFile(null); 
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="offer-discard-btn"
                >
                  Discard & Rescan
                </button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFinalCommit}
                  className="offer-commit-btn"
                >
                  <ShieldCheck size={16} />
                  <span>Commit to Record</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEEDBACK ALERTS */}
      {success && (
        <div className="offer-alert-box success">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="offer-alert-box error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
