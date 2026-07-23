import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import '../PageStyles.css';

const PrivacyPolicyPage = () => {
  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">LEGAL & PRIVACY</div>
        <h1 className="page-hero-title">Privacy <span className="title-accent">Policy</span></h1>
        <p className="page-hero-subtitle">
          Last updated: July 23, 2026. Your privacy and creator data security are fundamental to everything we build at ELVOORIQ.
        </p>
      </div>

      <div className="container page-content-section" style={{ maxWidth: '900px' }}>
        <div className="glass-card" style={{ padding: '40px' }}>
          
          <section style={{ marginBottom: '32px' }}>
            <h2 className="card-title" style={{ fontSize: '1.5rem', color: '#00C988' }}>1. Information We Collect</h2>
            <p className="card-desc" style={{ marginBottom: '12px' }}>
              We collect information you provide directly to us when registering an account, filling out session forms, linking YouTube API credentials, or connecting streaming hardware:
            </p>
            <ul style={{ color: '#A0A0B0', paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Account credentials (Full Name, Email Address, Password, Country, WhatsApp)</li>
              <li>Streaming channel metrics (Subscriber count, live concurrent viewers, watch hours)</li>
              <li>YouTube OAuth 2.0 connection tokens for stream management</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 className="card-title" style={{ fontSize: '1.5rem', color: '#00C988' }}>2. How We Protect Your Data</h2>
            <p className="card-desc">
              All account information and streaming API tokens are encrypted in transit via SSL/TLS and at rest using AES-256 database encryption. We never sell creator personal data or channel tokens to third-party advertisers.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 className="card-title" style={{ fontSize: '1.5rem', color: '#00C988' }}>3. Third-Party Services</h2>
            <p className="card-desc">
              Our platform integrates with official API services including Google YouTube API Services, Twitch API, and PostgreSQL data infrastructure. By using ELVOORIQ, users agree to be bound by the Google Terms of Service and Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="card-title" style={{ fontSize: '1.5rem', color: '#00C988' }}>4. Your Rights & Data Deletion</h2>
            <p className="card-desc">
              Creators have full rights to request complete data deletion or export their session records at any time by contacting privacy@elvooriq.com.
            </p>
          </section>

        </div>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicyPage;
