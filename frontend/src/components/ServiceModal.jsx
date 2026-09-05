import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Users,
  UserCheck,
  ShieldCheck,
  Target,
  HeartHandshake,
  Award,
  Crown,
  Sparkles,
  Star,
  Tv,
  Handshake,
  Globe,
  DollarSign,
  Briefcase,
  BarChart3,
  TrendingUp,
  Zap,
  BarChart2,
  Repeat,
  PieChart,
  UserPlus,
  CheckCircle2,
  Compass,
  Rocket,
  FileText,
  Megaphone,
  Search,
  Mail,
  Share2,
  GraduationCap,
  Brain,
  BookOpen,
  MessageSquare,
  Video,
  Wrench,
  Headphones,
  Cpu,
  Server,
  Monitor,
  Radio,
  ShieldAlert,
  Layers,
  Activity
} from 'lucide-react';
import './ServiceModal.css';

const iconMap = {
  Users,
  UserCheck,
  ShieldCheck,
  Target,
  HeartHandshake,
  Award,
  Crown,
  Sparkles,
  Star,
  Tv,
  Handshake,
  Globe,
  DollarSign,
  Briefcase,
  BarChart3,
  TrendingUp,
  Zap,
  BarChart2,
  Repeat,
  PieChart,
  UserPlus,
  CheckCircle2,
  Compass,
  Rocket,
  FileText,
  Megaphone,
  Search,
  Mail,
  Share2,
  GraduationCap,
  Brain,
  BookOpen,
  MessageSquare,
  Video,
  Wrench,
  Headphones,
  Cpu,
  Server,
  Monitor,
  Radio,
  ShieldAlert,
  Layers,
  Activity
};

const RenderIcon = ({ name, size = 22, className = '' }) => {
  const IconComponent = iconMap[name] || Sparkles;
  return <IconComponent size={size} className={className} />;
};

const ServiceModal = ({ service, totalServices, currentIndex, onClose, onPrev, onNext }) => {
  // Prevent background body scrolling when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!service) return null;

  return (
    <motion.div
      className="service-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="service-modal-container"
        initial={{ opacity: 0, scale: 0.93, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Controls */}
        <div className="service-modal-topbar">
          <div className="modal-badge-wrapper">
            <span className="modal-badge-dot"></span>
            <span className="modal-badge-text">{service.badge}</span>
          </div>

          {/* Service Carousel Controls */}
          <div className="modal-nav-controls">
            <button
              className="modal-nav-btn"
              onClick={onPrev}
              title="Previous Service (Left Arrow)"
              aria-label="Previous Service"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="modal-nav-counter">
              {currentIndex + 1} / {totalServices}
            </span>
            <button
              className="modal-nav-btn"
              onClick={onNext}
              title="Next Service (Right Arrow)"
              aria-label="Next Service"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Close X Button */}
          <button
            className="modal-close-btn"
            onClick={onClose}
            title="Close modal (Esc)"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="service-modal-body custom-scrollbar">
          {/* Main Service Header Section */}
          <div className="modal-hero-header">
            <div className="modal-icon-glow">
              <RenderIcon name={service.iconName} size={32} />
            </div>
            <div className="modal-header-text">
              <h2 className="modal-service-title">{service.title}</h2>
              <div className="modal-stat-pill">
                <Sparkles size={14} className="stat-sparkle-icon" />
                <span>{service.stat}</span>
              </div>
            </div>
          </div>

          <p className="modal-subtitle">{service.subtitle}</p>
          <div className="modal-divider"></div>

          {/* Service Overview */}
          <div className="modal-section-block">
            <h3 className="modal-block-heading">Service Overview</h3>
            <p className="modal-overview-text">{service.overview}</p>
          </div>

          {/* Core Features & Pillars Grid */}
          <div className="modal-section-block">
            <h3 className="modal-block-heading">Core Pillars & Capabilities</h3>
            <div className="modal-features-grid">
              {service.features.map((feat, idx) => (
                <div className="modal-feature-card" key={idx}>
                  <div className="feature-icon-wrapper">
                    <RenderIcon name={feat.iconName} size={20} />
                  </div>
                  <div className="feature-card-content">
                    <h4 className="feature-card-title">{feat.title}</h4>
                    <p className="feature-card-desc">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Execution Process */}
          <div className="modal-section-block">
            <h3 className="modal-block-heading">How We Execute</h3>
            <div className="modal-process-timeline">
              {service.process.map((stepItem, idx) => (
                <div className="timeline-item" key={idx}>
                  <div className="timeline-badge">{stepItem.step}</div>
                  <div className="timeline-content">
                    <h4 className="timeline-title">{stepItem.title}</h4>
                    <p className="timeline-desc">{stepItem.desc}</p>
                  </div>
                  {idx < service.process.length - 1 && <div className="timeline-connector"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Key Deliverables */}
          <div className="modal-section-block">
            <h3 className="modal-block-heading">Included Deliverables</h3>
            <div className="modal-deliverables-grid">
              {service.deliverables.map((del, idx) => (
                <div className="deliverable-item" key={idx}>
                  <div className="deliverable-check">
                    <Check size={14} />
                  </div>
                  <span className="deliverable-text">{del}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer CTA */}
        <div className="service-modal-footer">
          <div className="footer-info">
            <span className="footer-label">ELVOORIQ Creator Services</span>
          </div>
          <div className="footer-actions">
            <button className="footer-btn-secondary" onClick={onClose}>
              Close Preview
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ServiceModal;
