import React from 'react';
import { motion } from 'framer-motion';
import { Star, GitFork, AlertCircle, ExternalLink, Sparkles, Code2 } from 'lucide-react';

export default function GithubRepositoryCard({ repo, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative bg-[#0b0c0e]/80 hover:bg-[#121619] border border-white/5 hover:border-[#00C988]/40 rounded-xl p-4 transition-all duration-300 backdrop-blur-md shadow-lg flex flex-col justify-between"
      style={{
        background: 'rgba(11, 12, 14, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '0.85rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
        transition: 'all 0.3s ease'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <Code2 size={16} color="#00C988" style={{ flexShrink: 0 }} />
            <a
              href={repo.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={repo.name}
            >
              {repo.name}
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            {repo.isFeatured && (
              <span
                style={{
                  background: 'rgba(0, 201, 136, 0.15)',
                  border: '1px solid rgba(0, 201, 136, 0.3)',
                  color: '#00E599',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  letterSpacing: '0.05em'
                }}
              >
                FEATURED
              </span>
            )}
            <span
              style={{
                background: 'rgba(2, 132, 199, 0.15)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                color: '#38bdf8',
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
              title="Weighted Repository Influence Index"
            >
              <Sparkles size={10} /> {Number(repo.wriiScore || 0).toFixed(1)}
            </span>
          </div>
        </div>

        <p
          style={{
            color: '#94a3b8',
            fontSize: '0.8rem',
            lineHeight: 1.45,
            marginBottom: '0.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {repo.description || 'Verified software engineering repository.'}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {repo.language && (
            <span style={{ color: '#00C988', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00C988' }}></span>
              {repo.language}
            </span>
          )}
          <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Star size={12} fill="#fbbf24" /> {repo.stars}
          </span>
          <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <GitFork size={12} /> {repo.forks}
          </span>
          {repo.openIssues > 0 && (
            <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <AlertCircle size={12} /> {repo.openIssues}
            </span>
          )}
        </div>

        <a
          href={repo.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#64748b',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#00C988')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          View <ExternalLink size={12} />
        </a>
      </div>
    </motion.div>
  );
}
