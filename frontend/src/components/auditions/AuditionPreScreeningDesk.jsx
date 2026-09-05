import React, { useState, useEffect } from 'react';
import {
  Mic,
  Activity,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileSignature,
  Sparkles,
  Zap,
  Volume2,
  Sliders,
  ShieldCheck,
  Search,
  Users,
  Video
} from 'lucide-react';
import axios from 'axios';
import './AuditionPreScreeningDesk.css';

export default function AuditionPreScreeningDesk({ onOpenContractModal }) {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState([35, 60, 45, 80, 65, 90, 50, 75, 40, 85, 70, 60]);

  const token = localStorage.getItem('elvooriq_token') || localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Animate audio levels during playback
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioLevel(prev => prev.map(() => Math.floor(Math.random() * 65) + 30));
      }, 180);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/auditions/candidates', { headers });
      if (res.data.success && res.data.candidates) {
        setCandidates(res.data.candidates);
        if (res.data.candidates.length > 0 && !selectedCandidate) {
          setSelectedCandidate(res.data.candidates[0]);
        } else if (selectedCandidate) {
          const updated = res.data.candidates.find(c => c.id === selectedCandidate.id);
          if (updated) setSelectedCandidate(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching audition candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReAnalyze = async () => {
    if (!selectedCandidate) return;
    setAnalyzing(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/auditions/lead/${selectedCandidate.id}/audition`,
        {
          transcript: selectedCandidate.auditionTape?.transcript,
          durationSec: selectedCandidate.auditionTape?.durationSec || 60,
          fileUrl: selectedCandidate.auditionTape?.fileUrl
        },
        { headers }
      );
      if (res.data.success) {
        await fetchCandidates();
      }
    } catch (err) {
      console.error('Re-analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleEvaluate = async (status) => {
    if (!selectedCandidate?.auditionTape?.id) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/auditions/${selectedCandidate.auditionTape.id}/evaluate`,
        { status, notes: `Evaluated as ${status} by talent reviewer` },
        { headers }
      );
      if (res.data.success) {
        await fetchCandidates();
      }
    } catch (err) {
      console.error('Evaluation error:', err);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const tape = c.auditionTape;
    const matchesSearch = c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.platform?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'HIGH_CADENCE') return tape && tape.wordsPerMinute >= 125 && tape.wordsPerMinute <= 160;
    if (filter === 'REVIEW_REQ') return tape && tape.confidenceScore < 75;
    if (filter === 'APPROVED') return tape && tape.status === 'APPROVED';
    return true;
  });

  const currentTape = selectedCandidate?.auditionTape;
  const keywordsList = currentTape?.keywordsMatched ? JSON.parse(currentTape.keywordsMatched) : [];

  return (
    <div className="audition-desk-container">
      {/* Top Header */}
      <header className="audition-desk-header">
        <div className="audition-header-title">
          <div className="audition-icon-box">
            <Mic className="header-mic-icon" size={22} />
          </div>
          <div>
            <div className="audition-headline-row">
              <h2 className="audition-title">PRE-SCREENING AUDITION ANALYSIS DESK</h2>
              <span className="audition-tag">WIREFRAME B • CADENCE & VOCAL DYNAMICS</span>
            </div>
            <p className="audition-subtitle">
              Automated vocal pacing (WPM), speech cadence scoring, and real-time candidate suitability evaluation
            </p>
          </div>
        </div>

        <div className="audition-header-actions">
          <button
            className="audition-action-btn secondary"
            onClick={fetchCandidates}
            title="Refresh Candidate List"
          >
            <RotateCcw size={15} />
            <span>Sync Tapes</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="audition-body-grid">
        {/* Left Column: Candidate Tape Directory */}
        <aside className="audition-sidebar">
          <div className="sidebar-search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search talent auditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar-search-input"
            />
          </div>

          <div className="sidebar-filter-tabs">
            {['ALL', 'HIGH_CADENCE', 'REVIEW_REQ', 'APPROVED'].map((tab) => (
              <button
                key={tab}
                className={`filter-tab-pill ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="candidate-list-scroll">
            {filteredCandidates.length === 0 ? (
              <div className="empty-candidates">
                <Users size={28} className="empty-icon" />
                <p>No candidate tapes match filter</p>
              </div>
            ) : (
              filteredCandidates.map((cand) => {
                const tape = cand.auditionTape;
                const isSelected = selectedCandidate?.id === cand.id;
                return (
                  <div
                    key={cand.id}
                    className={`candidate-tape-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedCandidate(cand);
                      setIsPlaying(false);
                    }}
                  >
                    <div className="candidate-card-top">
                      <div className="candidate-avatar">
                        {cand.fullName ? cand.fullName.charAt(0).toUpperCase() : 'T'}
                      </div>
                      <div className="candidate-card-meta">
                        <span className="candidate-card-name">{cand.fullName}</span>
                        <span className="candidate-card-platform">
                          {cand.platform || 'YouTube'} • {cand.followers ? `${cand.followers.toLocaleString()} fans` : '5.2k fans'}
                        </span>
                      </div>
                      <span className={`status-chip ${tape?.status || 'PENDING'}`}>
                        {tape?.status || 'PENDING'}
                      </span>
                    </div>

                    {tape && (
                      <div className="candidate-card-metrics">
                        <span className="metric-pill">
                          <Activity size={12} /> {Math.round(tape.wordsPerMinute)} WPM
                        </span>
                        <span className={`confidence-pill ${tape.confidenceScore >= 75 ? 'high' : 'medium'}`}>
                          {Math.round(tape.confidenceScore)}% Conf
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Column: Audition HUD & Analysis Canvas */}
        <main className="audition-main-canvas">
          {selectedCandidate ? (
            <div className="audition-canvas-content">
              {/* Candidate Info Strip */}
              <div className="candidate-profile-strip">
                <div className="profile-left">
                  <div className="profile-badge">
                    {selectedCandidate.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="profile-name">{selectedCandidate.fullName}</h3>
                    <p className="profile-details">
                      {selectedCandidate.email} • {selectedCandidate.platform || 'Streaming Talent'} • Target: Diamond Live Roster
                    </p>
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    className="canvas-btn reanalyze-btn"
                    onClick={handleReAnalyze}
                    disabled={analyzing}
                  >
                    <Sparkles size={15} />
                    <span>{analyzing ? 'Evaluating Vocal CADENCE...' : 'Re-Run Vocal Analysis'}</span>
                  </button>
                </div>
              </div>

              {/* Tape Player & Waveform Visualizer */}
              <div className="tape-player-panel">
                <div className="player-viewport">
                  {currentTape?.fileUrl && currentTape.fileUrl.endsWith('.mp4') ? (
                    <video
                      src={currentTape.fileUrl}
                      className="tape-video-element"
                      controls
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  ) : (
                    <div className="tape-placeholder-display">
                      <Video size={42} className="tape-icon" />
                      <p className="tape-label">Audition Tape Master Recording</p>
                      <span className="tape-duration">Duration: {currentTape?.durationSec || 60}s</span>
                    </div>
                  )}

                  {/* Equalizer overlay */}
                  <div className="waveform-bar-container">
                    <div className="playback-toggle-btn" onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </div>
                    <div className="bars-track">
                      {audioLevel.map((height, i) => (
                        <div
                          key={i}
                          className="equalizer-bar"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <span className="live-vocal-tag">
                      <Volume2 size={13} /> {isPlaying ? 'LIVE AUDIO PLAYBACK' : 'PAUSED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Vocal Metrics HUD */}
              <div className="vocal-metrics-hud">
                {/* Metric 1: Pacing / WPM */}
                <div className="metric-hud-card">
                  <div className="hud-card-header">
                    <span className="hud-card-title">VOCAL PACING</span>
                    <span className="hud-target-pill">Target: 125-155 WPM</span>
                  </div>
                  <div className="hud-score-row">
                    <span className="hud-big-metric">{Math.round(currentTape?.wordsPerMinute || 135)}</span>
                    <span className="hud-metric-unit">WPM</span>
                  </div>
                  <div className="hud-progress-track">
                    <div
                      className="hud-progress-fill wpm"
                      style={{ width: `${Math.min(100, ((currentTape?.wordsPerMinute || 135) / 180) * 100)}%` }}
                    />
                  </div>
                  <p className="hud-evaluation-note">
                    {currentTape?.wordsPerMinute >= 120 && currentTape?.wordsPerMinute <= 160
                      ? '✅ Prime live streaming delivery pace'
                      : currentTape?.wordsPerMinute < 120
                      ? '⚠️ Hesitant / deliberate cadence'
                      : '⚠️ Fast-paced / hurried speech'}
                  </p>
                </div>

                {/* Metric 2: Vocal Energy */}
                <div className="metric-hud-card">
                  <div className="hud-card-header">
                    <span className="hud-card-title">VOCAL ENERGY & PITCH</span>
                    <span className="hud-target-pill">Dynamics</span>
                  </div>
                  <div className="hud-score-row">
                    <span className="hud-big-metric">{Math.round(currentTape?.energyLevel || 84)}</span>
                    <span className="hud-metric-unit">%</span>
                  </div>
                  <div className="hud-progress-track">
                    <div
                      className="hud-progress-fill energy"
                      style={{ width: `${currentTape?.energyLevel || 84}%` }}
                    />
                  </div>
                  <p className="hud-evaluation-note">
                    {currentTape?.energyLevel >= 75
                      ? '⚡ Exceptional vocal projection & charisma'
                      : 'Moderate vocal dynamics recorded'}
                  </p>
                </div>

                {/* Metric 3: System Confidence Rating */}
                <div className="metric-hud-card highlight">
                  <div className="hud-card-header">
                    <span className="hud-card-title">SYSTEM CONFIDENCE</span>
                    <span className="hud-target-pill accent">Formula v6</span>
                  </div>
                  <div className="hud-score-row">
                    <span className="hud-big-metric accent">{Math.round(currentTape?.confidenceScore || 88)}</span>
                    <span className="hud-metric-unit accent">%</span>
                  </div>
                  <div className="hud-progress-track">
                    <div
                      className="hud-progress-fill confidence"
                      style={{ width: `${currentTape?.confidenceScore || 88}%` }}
                    />
                  </div>
                  <p className="hud-evaluation-note accent">
                    {currentTape?.confidenceScore >= 75 ? 'RECOMMENDED FOR ONBOARDING' : 'PROBATIONARY TALENT ROSTER'}
                  </p>
                </div>
              </div>

              {/* AI Screening Evaluation Report */}
              <div className="ai-report-panel">
                <div className="ai-report-header">
                  <ShieldCheck size={18} className="report-shield-icon" />
                  <h4>AI AUDITION EVALUATION REPORT & VOCABULARY FREQUENCY</h4>
                </div>

                <div className="ai-report-body">
                  <p className="ai-summary-text">
                    {currentTape?.aiSummary ||
                      `Candidate demonstrates compelling vocal projection and broadcast confidence. Natural conversational pacing with high community engagement indicators.`}
                  </p>

                  <div className="keywords-section">
                    <span className="keywords-label">Streaming Vocabulary Detected:</span>
                    <div className="keywords-chips-grid">
                      {keywordsList.length > 0 ? (
                        keywordsList.map((item, i) => (
                          <span key={i} className="keyword-chip">
                            #{item.keyword} <strong className="kw-count">({item.count}x)</strong>
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="keyword-chip">#community (3x)</span>
                          <span className="keyword-chip">#chat (5x)</span>
                          <span className="keyword-chip">#stream (4x)</span>
                          <span className="keyword-chip">#discord (2x)</span>
                          <span className="keyword-chip">#energy (1x)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decision Control Action Bar */}
              <div className="decision-control-bar">
                <button
                  className="decision-btn reject-btn"
                  onClick={() => handleEvaluate('REJECTED')}
                >
                  <XCircle size={16} />
                  <span>Reject Candidate</span>
                </button>

                <div className="decision-right-actions">
                  <button
                    className="decision-btn approve-btn"
                    onClick={() => handleEvaluate('APPROVED')}
                  >
                    <CheckCircle2 size={16} />
                    <span>Approve Audition</span>
                  </button>

                  <button
                    className="decision-btn contract-btn"
                    onClick={() => {
                      if (onOpenContractModal) {
                        onOpenContractModal(selectedCandidate);
                      }
                    }}
                  >
                    <FileSignature size={16} />
                    <span>Generate Onboarding Agreement & Sign</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="canvas-no-selection">
              <Users size={48} className="no-select-icon" />
              <h3>No Candidate Selected</h3>
              <p>Choose an applicant from the left directory to analyze their vocal audition metrics.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
