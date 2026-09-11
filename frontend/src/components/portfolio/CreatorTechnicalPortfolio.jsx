import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GithubRepositoryCard from './GithubRepositoryCard';
import { RefreshCw, Code, LayoutGrid } from 'lucide-react';

export default function CreatorTechnicalPortfolio({ userId }) {
  const [profile, setProfile] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);

  const fetchPortfolioData = async () => {
    try {
      const targetUserId = userId || localStorage.getItem('elvooriq_userId');
      if (!targetUserId) {
        setLoading(false);
        return;
      }
      const response = await fetch(`/api/github/portfolio/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('elvooriq_token')}`
        }
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setProfile(resData.profile);
        setRepositories(resData.repositories || []);
      } else {
        setError(resData.message || 'No GitHub repository profile found.');
      }
    } catch (err) {
      setError('Connection to portfolio server failed.');
    } finally {
      setLoading(false);
    }
  };

  const executeLiveSync = async (overrideUsername) => {
    setSyncing(true);
    setError('');
    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('elvooriq_token')}`
        },
        body: JSON.stringify({
          username: overrideUsername || usernameInput || undefined
        })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setRepositories(resData.repositories || []);
        setShowLinkModal(false);
        await fetchPortfolioData();
      } else {
        setError(resData.message || 'Failed to sync live GitHub profiles.');
      }
    } catch (err) {
      setError('Sync operation timed out or failed.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ width: '100%', height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A8A29A' }}>
        <RefreshCw size={24} className="animate-spin" style={{ marginRight: '0.5rem', color: '#D4AF37' }} /> Loading technical portfolios...
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#141414',
        border: '1px solid #2A2520',
        borderRadius: '1rem',
        padding: '1.5rem',
        backdropFilter: 'blur(16px)',
        color: '#F5F5F0',
        margin: '1.5rem 0'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F5F5F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code size={20} color="#D4AF37" /> Linked Software Portfolios
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#A8A29A', marginTop: '0.2rem' }}>
            Verified software repositories ranked dynamically by Weighted Repository Influence Index (WRII).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {!profile && (
            <button
              onClick={() => setShowLinkModal(!showLinkModal)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f1f5f9',
                fontWeight: 600,
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg> Link GitHub
            </button>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => executeLiveSync()}
            disabled={syncing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#D4AF37',
              color: '#FFFFFF',
              fontWeight: 600,
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              cursor: syncing ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.25)'
            }}
          >
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Live GitHub'}
          </motion.button>
        </div>
      </div>

      {showLinkModal && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,201,136,0.3)', borderRadius: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
            Enter GitHub Username:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="e.g. torvalds or your-handle"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                background: '#07080a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                color: '#FFFFFF',
                fontSize: '0.8rem'
              }}
            />
            <button
              onClick={() => executeLiveSync(usernameInput)}
              disabled={syncing || !usernameInput.trim()}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #D4AF37, #F5C542)',
                color: '#0A0A0A',
                fontWeight: 700,
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              Connect & Sync
            </button>
          </div>
        </div>
      )}

      {profile && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1rem',
            backgroundColor: '#1A1512',
            padding: '1rem',
            border: '1px solid #2A2520',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}
        >
          <div>
            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#A8A29A' }}>
              Repositories
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'monospace', color: '#F5F5F0' }}>
              {profile.publicReposCount}
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#A8A29A' }}>
              Stars Accumulated
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'monospace', color: '#fbbf24' }}>
              {profile.totalStars}
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#A8A29A' }}>
              Forks
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'monospace', color: '#D4AF37' }}>
              {profile.totalForks}
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#64748b' }}>
              Last Synchronized
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
              {profile.lastSyncedAt ? new Date(profile.lastSyncedAt).toLocaleDateString() : 'Active'}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(136, 19, 55, 0.2)', border: '1px solid rgba(225, 29, 72, 0.3)', color: '#fb7185', borderRadius: '0.5rem', fontSize: '0.75rem', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
      )}

      {repositories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'rgba(7, 8, 10, 0.3)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '0.75rem' }}>
          <LayoutGrid size={28} color="#64748b" style={{ margin: '0 auto 0.5rem auto' }} />
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            No repositories mapped yet. Connect a GitHub handle to populate and calculate WRII ranking.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {repositories.map((repo, idx) => (
            <GithubRepositoryCard key={repo.id} repo={repo} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
