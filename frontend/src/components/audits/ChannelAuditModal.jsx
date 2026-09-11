import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Sliders, FileText, AlertCircle, History } from 'lucide-react';
import './ChannelAuditModal.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default function ChannelAuditModal({ creator, onClose, onAuditSubmitted }) {
  const [videoQuality, setVideoQuality] = useState(8);
  const [audioClarity, setAudioClarity] = useState(8);
  const [engagementRate, setEngagementRate] = useState(7);
  const [brandingOverlay, setBrandingOverlay] = useState(8);
  const [scheduleAdherence, setScheduleAdherence] = useState(9);

  const [qualitativeComments, setQualitativeComments] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [priorAudits, setPriorAudits] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  const token = localStorage.getItem('elvooriq_token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Dynamically calculated overall average score (0 to 10)
  const overallAuditScore = parseFloat(
    ((videoQuality + audioClarity + engagementRate + brandingOverlay + scheduleAdherence) / 5).toFixed(2)
  );

  const fetchPriorAudits = async () => {
    if (!creator?.id) return;
    try {
      setLoadingHistory(true);
      const res = await fetch(`${API_URL}/api/audits/creator/${creator.id}`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok && data.success) {
        setPriorAudits(data.audits || []);
      }
    } catch (err) {
      console.error("Failed to load prior audits:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPriorAudits();
  }, [creator?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!qualitativeComments.trim() || !actionPlan.trim()) {
      alert("Please provide both qualitative comments and an actionable blueprint.");
      return;
    }

    setSubmitting(true);
    setSuccessNotice('');

    try {
      const res = await fetch(`${API_URL}/api/audits/submit`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          creatorId: creator.id,
          videoQuality,
          audioClarity,
          engagementRate,
          brandingOverlay,
          scheduleAdherence,
          qualitativeComments,
          actionPlan
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessNotice(`Channel audit for ${creator.fullName || 'Creator'} committed with score ${overallAuditScore}/10!`);
        fetchPriorAudits();
        if (onAuditSubmitted) onAuditSubmitted(data.audit);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        alert(data.message || "Failed to commit channel audit.");
      }
    } catch (err) {
      alert("Submission connection error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!creator) return null;

  return (
    <div className="audit-modal-overlay" onClick={onClose}>
      <div className="audit-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="audit-modal-header">
          <div>
            <div className="audit-header-title">
              <Award size={20} style={{ color: '#F5C542' }} />
              Creator Channel Coaching & Audit
            </div>
            <div className="audit-header-sub">
              Evaluating: <strong style={{ color: '#f8fafc' }}>{creator.fullName || creator.name}</strong> • Platform: {creator.platform || 'Twitch'}
            </div>
          </div>
          <button className="audit-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="audit-modal-content">
          {successNotice && (
            <div style={{ background: 'rgba(212, 175, 55,0.2)', border: '1px solid #D4AF37', color: '#F5C542', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem' }}>
              ✓ {successNotice}
            </div>
          )}

          {/* Dynamic Average Score Gauge */}
          <div className="audit-gauge-banner">
            <div className="gauge-left-info">
              <span className="gauge-score-label">Computed Channel Performance Score</span>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                Balanced arithmetic mean across 5 core broadcasting pillars
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="gauge-score-pill">{overallAuditScore}</div>
              <span className="gauge-score-label">OUT OF 10.0</span>
            </div>
          </div>

          {/* 5 Numerical Metric Sliders */}
          <div className="audit-metrics-grid">
            <div className="audit-metric-card">
              <div className="metric-card-top">
                <span className="metric-label-title">1. Video Quality & Bitrate</span>
                <span className="metric-score-display">{videoQuality}/10</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={videoQuality}
                onChange={(e) => setVideoQuality(parseInt(e.target.value))}
                className="metric-range-slider"
              />
            </div>

            <div className="audit-metric-card">
              <div className="metric-card-top">
                <span className="metric-label-title">2. Audio Clarity & Mix</span>
                <span className="metric-score-display">{audioClarity}/10</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={audioClarity}
                onChange={(e) => setAudioClarity(parseInt(e.target.value))}
                className="metric-range-slider"
              />
            </div>

            <div className="audit-metric-card">
              <div className="metric-card-top">
                <span className="metric-label-title">3. Chat & Engagement Rate</span>
                <span className="metric-score-display">{engagementRate}/10</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={engagementRate}
                onChange={(e) => setEngagementRate(parseInt(e.target.value))}
                className="metric-range-slider"
              />
            </div>

            <div className="audit-metric-card">
              <div className="metric-card-top">
                <span className="metric-label-title">4. Branding & Visual Overlays</span>
                <span className="metric-score-display">{brandingOverlay}/10</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={brandingOverlay}
                onChange={(e) => setBrandingOverlay(parseInt(e.target.value))}
                className="metric-range-slider"
              />
            </div>

            <div className="audit-metric-card" style={{ gridColumn: '1 / -1' }}>
              <div className="metric-card-top">
                <span className="metric-label-title">5. Schedule Adherence & Punctuality</span>
                <span className="metric-score-display">{scheduleAdherence}/10</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={scheduleAdherence}
                onChange={(e) => setScheduleAdherence(parseInt(e.target.value))}
                className="metric-range-slider"
              />
            </div>
          </div>

          {/* Qualitative Notes */}
          <div className="audit-input-group">
            <label className="audit-input-label">Qualitative Coaching Observations</label>
            <textarea 
              className="audit-textarea"
              placeholder="e.g. Excellent voice energy during peak viewer spike. Lighting was slightly underexposed in the first 30 minutes..."
              value={qualitativeComments}
              onChange={(e) => setQualitativeComments(e.target.value)}
              required
            />
          </div>

          {/* Action Plan */}
          <div className="audit-input-group">
            <label className="audit-input-label">Actionable Training Blueprint (Next 14 Days)</label>
            <textarea 
              className="audit-textarea"
              placeholder="e.g. 1. Calibrate keylight to 5500K color temp. 2. Introduce 5-minute pre-stream chat countdown..."
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              required
            />
          </div>

          {/* Prior Audits History */}
          {priorAudits.length > 0 && (
            <div className="prior-audits-section">
              <div className="prior-audits-title">
                <History size={13} style={{ display: 'inline', marginRight: '6px' }} />
                Historical Performance Evaluations ({priorAudits.length})
              </div>
              {priorAudits.slice(0, 3).map((a) => (
                <div key={a.id} className="prior-audit-item">
                  <div>
                    <span style={{ fontWeight: '700', color: '#f8fafc' }}>
                      Score: {a.overallAuditScore}/10
                    </span>
                    <span style={{ color: '#64748b', marginLeft: '10px' }}>
                      {new Date(a.auditDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.72rem', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.qualitativeComments}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Footer */}
          <div className="audit-modal-footer">
            <button type="button" className="audit-close-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="audit-submit-btn" disabled={submitting}>
              <CheckCircle2 size={15} />
              {submitting ? 'Recording Audit...' : 'Commit Channel Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
