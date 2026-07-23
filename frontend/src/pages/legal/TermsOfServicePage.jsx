import React from 'react';
import PageLayout from '../../components/PageLayout';
import { FileText, ShieldCheck, Scale, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import '../PageStyles.css';

const TermsOfServicePage = () => {
  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">LEGAL TERMS</div>
        <h1 className="page-hero-title">Terms of <span className="title-accent">Service</span></h1>
        <p className="page-hero-subtitle">
          Last updated: July 23, 2026. Please read these terms carefully before using the ELVOORIQ platform and talent services.
        </p>
      </div>

      <div className="container page-content-section" style={{ maxWidth: '900px' }}>
        <div className="glass-card" style={{ padding: '40px' }}>
          
          <section style={{ marginBottom: '32px' }}>
            <h2 className="card-title" style={{ fontSize: '1.5rem', color: '#00C988' }}>1. Acceptance of Terms</h2>
            <p className="card-desc">
              By accessing ELVOORIQ web services, mobile application, or signing talent management agreements, you agree to comply with and be bound by these Terms of Service and all applicable streaming platform guidelines.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 className="card-title" style={{ fontSize: '1.5rem', color: '#00C988' }}>2. Creator Intellectual Property</h2>
            <p className="card-desc">
              Creators retain 100% ownership of all broadcast content, video recordings, branding assets, and personal likeness. ELVOORIQ receives a limited license strictly to manage, promote, and pitch campaigns on your behalf.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 className="card-title" style={{ fontSize: '1.5rem', color: '#00C988' }}>3. Code of Conduct</h2>
            <p className="card-desc">
              ELVOORIQ is built on empowerment, safety, and mutual respect. We maintain a zero-tolerance policy against hate speech, harassment, copyright infringement, or fraudulent viewer inflation.
            </p>
          </section>

          <section>
            <h2 className="card-title" style={{ fontSize: '1.5rem', color: '#00C988' }}>4. Termination & Account Status</h2>
            <p className="card-desc">
              Users or agency partners may terminate their platform account at any time pursuant to individual service tier agreements.
            </p>
          </section>

        </div>
      </div>
    </PageLayout>
  );
};

export default TermsOfServicePage;
