import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Flame, 
  Clock, 
  Users, 
  Award, 
  RefreshCw,
  AlertTriangle,
  Zap,
  LineChart
} from 'lucide-react';
import './CreatorGrowthForecastModal.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default function CreatorGrowthForecastModal({ creator, onClose }) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const token = localStorage.getItem('elvooriq_token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const fetchForecast = async () => {
    if (!creator?.id) return;
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await fetch(`${API_URL}/api/analytics/creator/${creator.id}/forecast`, {
        headers: authHeaders
      });
      const data = await res.json();
      if (res.ok) {
        setForecastData(data);
      } else {
        setErrorMessage(data.message || 'Failed to calculate forecast trajectory.');
      }
    } catch (err) {
      setErrorMessage('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedStreams = async () => {
    if (!creator?.id) return;
    try {
      setSeeding(true);
      const res = await fetch(`${API_URL}/api/analytics/creator/${creator.id}/seed-streams`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ count: 8, baseViewers: 180, growthStep: 32 })
      });
      if (res.ok) {
        await fetchForecast();
      }
    } catch (err) {
      console.error("Seeding error:", err);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [creator?.id]);

  if (!creator) return null;

  const isBreakout = forecastData?.recommendedTalentTier?.includes('A+');
  const isSteady = forecastData?.recommendedTalentTier?.includes('B -');
  const heroTierClass = isBreakout ? 'tier-hero-breakout' : isSteady ? 'tier-hero-steady' : 'tier-hero-standard';

  return (
    <div className="forecast-modal-overlay" onClick={onClose}>
      <div className="forecast-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="forecast-modal-header">
          <div>
            <div className="forecast-header-title">
              <TrendingUp size={20} style={{ color: '#2dd4bf' }} />
              Predictive Creator Growth Analytics
            </div>
            <div className="forecast-header-sub">
              Talent Forecaster for: <strong style={{ color: '#f8fafc' }}>{creator.fullName || creator.name}</strong> • Platform: {creator.platform || 'Twitch'}
            </div>
          </div>
          <button className="forecast-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="forecast-modal-content">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px' }} />
              <p>Aggregating historical streams and running linear regression forecasting ($y = mx + c$)...</p>
            </div>
          ) : forecastData && forecastData.success ? (
            <>
              {/* Talent Tier Recommendation Card */}
              <div className={`forecast-tier-hero ${heroTierClass}`}>
                <div>
                  <span className="tier-badge-pill" style={{
                    background: isBreakout ? 'rgba(45,212,191,0.2)' : 'rgba(96,165,250,0.2)',
                    color: isBreakout ? '#2dd4bf' : '#60a5fa',
                    border: `1px solid ${isBreakout ? '#2dd4bf' : '#60a5fa'}`
                  }}>
                    Recommended Roster Assignment
                  </span>
                  <h3 className="tier-title-h3">{forecastData.recommendedTalentTier}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '6px 0 0 0' }}>
                    Algorithm computed regression slope: <strong>+{forecastData.performanceGrowthRate} viewers/session</strong> ({forecastData.growthRateIndicator})
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="tier-slope-stat">+{forecastData.performanceGrowthRate}</div>
                  <span className="tier-slope-label">Viewer Velocity Rate</span>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="forecast-kpi-grid">
                <div className="forecast-kpi-box">
                  <span className="forecast-kpi-lbl">Historical Sessions</span>
                  <span className="forecast-kpi-val">{forecastData.historicalPointsAnalyzed} streams</span>
                </div>
                <div className="forecast-kpi-box">
                  <span className="forecast-kpi-lbl">Trajectory Status</span>
                  <span className="forecast-kpi-val" style={{ color: '#2dd4bf' }}>{forecastData.growthRateIndicator}</span>
                </div>
                <div className="forecast-kpi-box">
                  <span className="forecast-kpi-lbl">Forecasting Horizon</span>
                  <span className="forecast-kpi-val">Next 5 Sessions</span>
                </div>
              </div>

              {/* Next 5 Forecasted Sessions Cards */}
              <div className="forecast-table-wrapper">
                <div className="forecast-table-title">
                  <Sparkles size={14} />
                  Linear Regression Projected Trajectory (Next 5 Sessions)
                </div>

                <div className="forecast-cards-row">
                  {(forecastData.forecastedNextSessions || []).map((sess, idx) => (
                    <div key={idx} className="forecast-projection-card">
                      <span className="proj-session-tag">Session #{sess.projectedSessionIndex}</span>
                      <span className="proj-viewers-val">{sess.projectedAverageViewers}</span>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Est. Avg Viewers</span>
                      <span className="proj-duration-tag">{sess.projectedDurationMinutes} min</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical Trend Peek */}
              {forecastData.historicalSessions && forecastData.historicalSessions.length > 0 && (
                <div style={{ background: 'rgba(3,5,6,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}>
                    Historical Regression Baseline Data Points ({forecastData.historicalSessions.length})
                  </div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                    {forecastData.historicalSessions.slice(-6).map((h, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 10px', minWidth: '95px', textAlign: 'center', fontSize: '0.72rem' }}>
                        <div style={{ color: '#64748b' }}>Stream #{h.index}</div>
                        <div style={{ fontWeight: '800', color: '#f1f5f9' }}>{h.avgViewers} vws</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{h.durationMin}m</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Insufficient Historical Data State */
            <div className="forecast-empty-state">
              <AlertTriangle size={36} style={{ color: '#f59e0b' }} />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
                  Insufficient Historical Streaming Telemetry
                </h4>
                <p style={{ fontSize: '0.8rem', maxWidth: '440px', margin: 0 }}>
                  {forecastData?.message || errorMessage || 'Creator must complete at least 5 stream sessions to compile a linear regression model.'}
                </p>
                <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                  Current historical points available: {forecastData?.historicalPointsCount || 0} / 5 required
                </div>
              </div>

              <button 
                className="seed-streams-btn"
                onClick={handleSeedStreams}
                disabled={seeding}
              >
                <Zap size={13} style={{ display: 'inline', marginRight: '6px' }} />
                {seeding ? 'Generating Streams...' : 'Seed 8 Historical Streams for Regression Test'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
