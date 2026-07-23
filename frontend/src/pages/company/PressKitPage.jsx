import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Download, FileText, Image, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../PageStyles.css';

const PressKitPage = () => {
  const assets = [
    { icon: <Image size={28} />, title: "Brand Logos & Vectors", desc: "Official ELVOORIQ primary logo, icon marks, dark/light variants, and vector SVG files." },
    { icon: <FileText size={28} />, title: "Executive Bios & Headshots", desc: "High-res leadership portraits, founder story background, and agency executive team biographies." },
    { icon: <Download size={28} />, title: "Press Release Archive", desc: "Download recent agency announcements, brand partnership milestones, and platform feature launches." },
    { icon: <Mail size={28} />, title: "Media Relations Contact", desc: "Direct inquiries line for journalists, podcast hosts, industry researchers, and event organizers." }
  ];

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">PRESS & MEDIA</div>
        <h1 className="page-hero-title">Official <span className="title-accent">Press Kit</span> & Assets</h1>
        <p className="page-hero-subtitle">
          Download official ELVOORIQ brand assets, logos, press releases, and media contact info.
        </p>
      </div>

      <div className="container page-content-section">
        <div className="features-grid">
          {assets.map((item, idx) => (
            <motion.div 
              key={idx} 
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="card-icon">{item.icon}</div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-desc">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="cta-banner">
          <h2 className="cta-title">Need Custom Media Assets?</h2>
          <p className="cta-desc">Reach out to our media relations team for interview requests or custom brand assets.</p>
          <Link to="/company/contact" className="btn-cta">
            Contact Press Team <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default PressKitPage;
