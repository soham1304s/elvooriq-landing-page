import React from 'react';
import { motion } from 'framer-motion';
import { Star, GitFork, AlertCircle, ExternalLink, Sparkles, Code2 } from 'lucide-react';

export default function GithubRepositoryCard({ repo, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative bg-[#141414]/90 hover:bg-[#1A1512] border border-[#2A2520] hover:border-[#D4AF37]/50 rounded-xl p-4 transition-all duration-300 backdrop-blur-md shadow-lg flex flex-col justify-between"
      style={{
        background: '#141414',
        border: '1px solid #2A2520',
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
            <Code2 size={16} color="#D4AF37" style={{ flexShrink: 0 }} />
            <a
              href={repo.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#F5F5F0',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {repo.repoName}
            </a>
          </div>
          {repo.isPinned && (
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'rgba(212, 175, 55, 0.15)',
                color: '#F5C542',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              Featured
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: '0.8rem',
            color: '#A8A29A',
            lineHeight: 1.4,
            margin: '0 0 0.75rem 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {repo.description || 'Enterprise platform automation repository.'}
        </p>

        {repo.topics && repo.topics.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
            {repo.topics.slice(0, 4).map((topic, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(212, 175, 55, 0.08)',
                  color: '#D4AF37',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                #{topic}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #2A2520', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {repo.language && (
            <span style={{ color: '#D4AF37', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4AF37' }}></span>
              {repo.language}
            </span>
          )}
          <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Star size={12} fill="#fbbf24" /> {repo.stars}
          </span>
          <span style={{ color: '#A8A29A', display: 'flex', alignItems: 'center', gap: '3px' }}>
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
            color: '#A8A29A',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F5C542')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#A8A29A')}
        >
          View <ExternalLink size={12} />
        </a>
      </div>
    </motion.div>
  );
}
