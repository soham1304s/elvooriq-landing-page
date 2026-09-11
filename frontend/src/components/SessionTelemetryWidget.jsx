import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, ShieldCheck, Laptop, Globe, LogOut, History, X, CheckCircle2 } from 'lucide-react';
import { performLogout, formatSessionDuration } from '../utils/authSession';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default function SessionTelemetryWidget() {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [stats, setStats] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const loginTimeStr = localStorage.getItem('elvooriq_login_time');
  const sessionId = localStorage.getItem('elvooriq_session_id');

  // Live ticking timer for session duration
  useEffect(() => {
    if (!loginTimeStr) return;
    const loginTimestamp = new Date(loginTimeStr).getTime();

    const updateElapsed = () => {
      const diffSec = Math.max(0, Math.floor((Date.now() - loginTimestamp) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [loginTimeStr]);

  // Fetch session history from Neon database
  const fetchSessionHistory = async () => {
    const token = localStorage.getItem('elvooriq_token');
    if (!token) return;

    setLoadingSessions(true);
    try {
      const res = await axios.get(`${API_URL}/api/auth/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSessions(res.data.sessions || []);
        setStats(res.data.userStats || null);
      }
    } catch (err) {
      console.warn('Failed to load session history:', err.message);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleOpenModal = () => {
    setShowHistoryModal(true);
    fetchSessionHistory();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Session Pill */}
      <div 
        onClick={handleOpenModal}
        title="Click to view Neon session audit history"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#10b981',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontWeight: '500'
        }}
      >
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 8px #10b981',
          display: 'inline-block'
        }} />
        <span>Active Session:</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#34d399' }}>
          {formatSessionDuration(elapsedSeconds)}
        </span>
        <History size={13} style={{ opacity: 0.7, marginLeft: '2px' }} />
      </div>

      {/* Session History Modal */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            color: '#f8fafc',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#0b1120'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="#10b981" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                    Account Session & Neon Audit Logs
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                    Real-time login/logout tracking saved in Neon PostgreSQL
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Stats Summary Bar */}
            {stats && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                padding: '16px 24px',
                background: '#131d35',
                borderBottom: '1px solid #1e293b'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Total Logins</span>
                  <strong style={{ fontSize: '18px', color: '#38bdf8' }}>{stats.totalLoginCount || 1}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Total Active Time</span>
                  <strong style={{ fontSize: '18px', color: '#34d399' }}>
                    {formatSessionDuration((stats.totalTimeSpentSec || 0) + elapsedSeconds)}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Current Session ID</span>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#cbd5e1' }}>
                    {sessionId ? sessionId.substring(0, 14) + '...' : 'Active'}
                  </span>
                </div>
              </div>
            )}

            {/* Sessions Table */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {loadingSessions ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  Loading session audit logs from Neon...
                </div>
              ) : sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No historical sessions recorded.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sessions.map((s) => {
                    const isActive = s.status === 'ACTIVE';
                    const duration = s.durationSeconds 
                      ? formatSessionDuration(s.durationSeconds) 
                      : (isActive ? formatSessionDuration(elapsedSeconds) : '0s');

                    return (
                      <div 
                        key={s.id}
                        style={{
                          background: isActive ? 'rgba(16, 185, 129, 0.05)' : '#1e293b',
                          border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #334155',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: isActive ? '#10b981' : '#64748b'
                          }} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600' }}>
                                {isActive ? 'Current Active Session' : 'Logged Out Session'}
                              </span>
                              <span style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: isActive ? '#065f46' : '#334155',
                                color: isActive ? '#34d399' : '#94a3b8',
                                fontWeight: 'bold'
                              }}>
                                {s.status}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', display: 'flex', gap: '14px' }}>
                              <span>
                                <strong>Login:</strong> {new Date(s.loginAt).toLocaleString()}
                              </span>
                              {s.logoutAt && (
                                <span>
                                  <strong>Logout:</strong> {new Date(s.logoutAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: isActive ? '#34d399' : '#f1f5f9' }}>
                            Duration: {duration}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            {s.deviceType || 'DESKTOP'} • {s.city || 'India'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid #1e293b',
              background: '#0b1120',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Neon Database: ep-silent-rain-b315l2mw
              </span>
              <button
                onClick={() => performLogout('USER_ACTION')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={15} /> End Session & Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
