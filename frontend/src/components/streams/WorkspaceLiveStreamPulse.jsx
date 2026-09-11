import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Tv, 
  Users, 
  Clock, 
  Flame, 
  Star, 
  TrendingUp, 
  Award, 
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';
import { socket } from '../../socket/socketManager';
import './WorkspaceLiveStreamPulse.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default function WorkspaceLiveStreamPulse({ workspaceId, onOpenAudit, onOpenForecast }) {
  const [creators, setCreators] = useState([]);
  const [activeStreams, setActiveStreams] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [telemetryEvents, setTelemetryEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('elvooriq_token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const addTelemetryLog = (tag, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setTelemetryEvents(prev => [
      { id: Date.now() + Math.random(), time: timestamp, tag, message },
      ...prev.slice(0, 30)
    ]);
  };

  // Fetch workspace creators & stream logs
  const fetchStreamsData = async () => {
    try {
      setLoading(true);
      // Fetch active streams from webhook engine
      const streamRes = await fetch(`${API_URL}/api/webhooks/active`);
      const streamData = await streamRes.json();
      const liveList = streamData.activeStreams || [];
      setActiveStreams(liveList);

      // Fetch workspace members or creators
      if (workspaceId) {
        const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, { headers: authHeaders });
        const data = await res.json();
        if (res.ok && data.success && data.workspace) {
          const creatorMembers = (data.workspace.members || [])
            .filter(m => m.user && (m.user.role === 'CREATOR' || m.user.platform))
            .map(m => {
              const live = liveList.find(s => s.creatorId === m.user.id);
              return {
                id: m.user.id,
                fullName: m.user.fullName || m.user.name || 'Creator',
                platform: m.user.platform || 'Twitch',
                platformId: m.user.platformId,
                isLive: !!live,
                streamTitle: live?.streamTitle || 'Channel Offline',
                peakViewers: live?.peakViewers || 0,
                avgViewers: live?.avgViewers || 0,
                startedAt: live?.startedAt || null
              };
            });
          setCreators(creatorMembers);
        }
      } else {
        // Fallback: load all active creators
        const res = await fetch(`${API_URL}/api/creators`, { headers: authHeaders });
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.creators || []).map(c => {
            const live = liveList.find(s => s.creatorId === c.id);
            return {
              id: c.id,
              fullName: c.fullName || c.name || 'Creator',
              platform: c.platform || 'Twitch',
              platformId: c.platformId,
              isLive: !!live,
              streamTitle: live?.streamTitle || 'Channel Offline',
              peakViewers: live?.peakViewers || 0,
              avgViewers: live?.avgViewers || 0,
              startedAt: live?.startedAt || null
            };
          });
          setCreators(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to fetch stream data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreamsData();

    if (workspaceId) {
      socket.emit('workspace:join', { workspaceId });
      addTelemetryLog('ROOM_JOIN', `Joined Workspace stream room: workspace-${workspaceId}`);
    }

    // Socket.IO Listeners for Stream State Transitions
    const handleStreamStarted = (payload) => {
      addTelemetryLog('STREAM_STARTED', `Creator @${payload.creatorName} went LIVE on ${payload.platform}: "${payload.streamTitle}"`);
      setCreators(prev => prev.map(c => 
        c.id === payload.creatorId 
          ? { ...c, isLive: true, streamTitle: payload.streamTitle, peakViewers: payload.currentViewers || 10, avgViewers: payload.currentViewers || 10, startedAt: new Date().toISOString() }
          : c
      ));
    };

    const handleStreamStopped = (payload) => {
      addTelemetryLog('STREAM_STOPPED', `Creator @${payload.creatorName} concluded stream on ${payload.platform} (Duration: ${payload.duration} min)`);
      setCreators(prev => prev.map(c => 
        c.id === payload.creatorId 
          ? { ...c, isLive: false, streamTitle: 'Channel Offline' }
          : c
      ));
    };

    const handleStreamUpdated = (payload) => {
      setCreators(prev => prev.map(c => 
        c.id === payload.creatorId 
          ? { ...c, peakViewers: payload.peakViewers, avgViewers: payload.avgViewers }
          : c
      ));
    };

    socket.on('stream:started', handleStreamStarted);
    socket.on('stream:stopped', handleStreamStopped);
    socket.on('stream:updated', handleStreamUpdated);

    return () => {
      socket.off('stream:started', handleStreamStarted);
      socket.off('stream:stopped', handleStreamStopped);
      socket.off('stream:updated', handleStreamUpdated);
    };
  }, [workspaceId]);

  // Live Webhook Dispatch with Real Cryptographic HMAC-SHA256 Signature
  const handleSimulateWebhook = async (creator, action) => {
    try {
      const eventType = action === 'start' ? 'stream.online' : 'stream.offline';
      const targetPlatformId = creator.platformId || creator.id;
      const timestamp = Date.now().toString();

      const payload = {
        eventType,
        creatorPlatformId: targetPlatformId,
        platform: creator.platform || 'Twitch',
        streamTitle: `Live Session: High Engagement Showcase`,
        timestamp: new Date().toISOString(),
        streamId: `stream_${Date.now()}`,
        viewers: Math.floor(Math.random() * 400) + 120
      };

      // Compute Cryptographic HMAC-SHA256 using Web Crypto API
      const secret = 'elvooriq_webhook_secret_key_v5';
      const encoder = new TextEncoder();
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const messageToSign = timestamp + JSON.stringify(payload);
      const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(messageToSign));
      const hexSignature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      const hmacSignature = `sha256=${hexSignature}`;

      const res = await fetch(`${API_URL}/api/webhooks/platform-stream-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': hmacSignature,
          'x-hub-signature-timestamp': timestamp
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addTelemetryLog('WEBHOOK_SIM', `Dispatched simulated ${eventType} for @${creator.fullName}`);
        fetchStreamsData();
      }
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  const filteredCreators = creators.filter(c => {
    if (selectedPlatform === 'ALL') return true;
    return (c.platform || '').toUpperCase() === selectedPlatform;
  });

  const totalLiveCount = creators.filter(c => c.isLive).length;
  const totalViewers = creators.reduce((acc, c) => acc + (c.isLive ? (c.peakViewers || 0) : 0), 0);

  return (
    <div className="stream-pulse-container">
      {/* Header with KPI indicators */}
      <div className="stream-pulse-header">
        <div className="stream-pulse-title-group">
          <div className="stream-live-indicator-ring">
            <div className="stream-live-indicator-core" />
            <div className="stream-live-indicator-wave" />
          </div>
          <div>
            <h3 className="stream-pulse-main-title">Real-Time Live-Status & Telemetry Desk</h3>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Connected to Workspace Telemetry Stream • v5.0 Live Operations
            </span>
          </div>
        </div>

        <div className="stream-pulse-kpi-bar">
          <div className="stream-kpi-badge">
            <Radio size={13} style={{ color: '#F5C542' }} />
            <span>Active Live Streams:</span>
            <span className="stream-kpi-val">{totalLiveCount}</span>
          </div>
          <div className="stream-kpi-badge">
            <Users size={13} style={{ color: '#60a5fa' }} />
            <span>Combined Peak Viewers:</span>
            <span className="stream-kpi-val">{totalViewers.toLocaleString()}</span>
          </div>
          <button 
            onClick={fetchStreamsData}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '6px 10px',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
            title="Refresh stream statuses"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Platform Filter Tabs */}
      <div className="stream-platform-filters">
        {['ALL', 'TWITCH', 'BIGO', 'YOUTUBE', 'TIKTOK'].map((plat) => (
          <button 
            key={plat}
            className={`stream-filter-btn ${selectedPlatform === plat ? 'active' : ''}`}
            onClick={() => setSelectedPlatform(plat)}
          >
            {plat}
          </button>
        ))}
      </div>

      {/* Stream Monitoring Grid */}
      <div className="stream-cards-grid">
        {filteredCreators.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', background: 'rgba(13,17,19,0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>
            <Tv size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <p>No creators match the current filter in this workspace cluster.</p>
          </div>
        ) : (
          filteredCreators.map((c) => {
            const platClass = `platform-pill-${(c.platform || 'twitch').toLowerCase()}`;
            return (
              <div key={c.id} className={`stream-monitor-card ${c.isLive ? 'is-live' : ''}`}>
                <div>
                  <div className="stream-card-top">
                    <div>
                      <div className="stream-creator-name">
                        {c.fullName}
                        {c.isLive && (
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#F5C542', boxShadow: '0 0 8px #F5C542' }} />
                        )}
                      </div>
                      <span className={`stream-platform-pill ${platClass}`}>
                        {c.platform || 'Twitch'}
                      </span>
                    </div>

                    <span className={`stream-status-tag ${c.isLive ? 'live' : 'offline'}`}>
                      {c.isLive ? '⚡ LIVE' : 'OFFLINE'}
                    </span>
                  </div>

                  <div className="stream-card-body" style={{ marginTop: '12px' }}>
                    <div className="stream-current-title" title={c.streamTitle}>
                      {c.streamTitle}
                    </div>
                    <div className="stream-metrics-row">
                      <div className="stream-metric-item">
                        <span className="stream-metric-label">Peak Viewers</span>
                        <span className={`stream-metric-val ${c.isLive ? 'highlight' : ''}`}>
                          {c.isLive ? c.peakViewers : '—'}
                        </span>
                      </div>
                      <div className="stream-metric-item">
                        <span className="stream-metric-label">Avg Viewers</span>
                        <span className="stream-metric-val">
                          {c.isLive ? c.avgViewers : '—'}
                        </span>
                      </div>
                      <div className="stream-metric-item">
                        <span className="stream-metric-label">Status</span>
                        <span className="stream-metric-val" style={{ color: c.isLive ? '#F5C542' : '#94a3b8' }}>
                          {c.isLive ? 'Streaming' : 'Standby'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="stream-card-actions">
                  <button 
                    className="stream-action-btn primary"
                    onClick={() => onOpenAudit && onOpenAudit(c)}
                    title="Conduct creator coaching channel audit"
                  >
                    <Award size={12} />
                    Audit Channel
                  </button>

                  <button 
                    className="stream-action-btn"
                    onClick={() => onOpenForecast && onOpenForecast(c)}
                    title="View predictive follower growth analytics"
                  >
                    <TrendingUp size={12} />
                    Forecast
                  </button>

                  <button 
                    className="stream-action-btn"
                    style={{ gridColumn: '1 / -1', fontSize: '0.68rem', padding: '4px' }}
                    onClick={() => handleSimulateWebhook(c, c.isLive ? 'stop' : 'start')}
                    title="Simulate external Twitch/Bigo webhook"
                  >
                    <Zap size={11} style={{ color: '#F5C542' }} />
                    {c.isLive ? 'Trigger Webhook: Stream Offline' : 'Trigger Webhook: Stream Online'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Live Workspace Telemetry Feed Terminal */}
      <div className="stream-telemetry-terminal">
        <div className="telemetry-terminal-header">
          <div className="telemetry-terminal-title">
            <Activity size={13} />
            Live Webhook Telemetry Stream Log
          </div>
          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
            Socket.IO Room: workspace-{workspaceId || 'global'}
          </span>
        </div>

        <div className="telemetry-log-lines">
          {telemetryEvents.length === 0 ? (
            <div style={{ color: '#475569', fontStyle: 'italic' }}>
              Awaiting real-time stream state transitions from streaming platform webhooks...
            </div>
          ) : (
            telemetryEvents.map((evt) => (
              <div key={evt.id} className="telemetry-line">
                <span className="telemetry-time">[{evt.time}]</span>
                <span className="telemetry-event-tag">[{evt.tag}]</span>
                <span>{evt.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
