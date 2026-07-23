import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { 
  Users, 
  Award, 
  Handshake, 
  TrendingUp, 
  UserPlus, 
  Megaphone, 
  GraduationCap, 
  Wrench, 
  Radio,
  ArrowRight
} from 'lucide-react';
import './ServicesSection.css';

const services = [
  {
    title: 'Creator Management',
    description: 'Full-spectrum creator representation including contract negotiations, career roadmapping, and revenue optimization.',
    icon: <Users size={20} />
  },
  {
    title: 'Talent Representation',
    description: 'Elite-tier talent placement and brand positioning for creators ready to move from content to cultural icon.',
    icon: <Award size={20} />
  },
  {
    title: 'Brand Collaborations',
    description: 'Curated brand deals with 500+ premium partners across fashion, beauty, tech, wellness, and lifestyle.',
    icon: <Handshake size={20} />
  },
  {
    title: 'Growth Strategy',
    description: 'Proprietary analytics and algorithm intelligence to compound audience growth and maximize platform performance.',
    icon: <TrendingUp size={20} />
  },
  {
    title: 'Creator Onboarding',
    description: 'White-glove 90-day onboarding with platform audit, audience analysis, brand kit creation, and launch planning.',
    icon: <UserPlus size={20} />
  },
  {
    title: 'Digital Marketing',
    description: 'Multi-channel campaigns spanning social media, email, paid media, and SEO with luxury-grade production values.',
    icon: <Megaphone size={20} />
  },
  {
    title: 'Training & Mentorship',
    description: 'One-on-one mentorship from industry veterans who have built and scaled seven-figure creator businesses.',
    icon: <GraduationCap size={20} />
  },
  {
    title: 'Technical Support',
    description: '24/7 engineering support for streaming, platform integrations, equipment consulting, and broadcast troubleshooting.',
    icon: <Wrench size={20} />
  },
  {
    title: 'Live Streaming',
    description: 'End-to-end streaming operations from scheduling to real-time moderation, analytics, and simulcast infrastructure.',
    icon: <Radio size={20} />
  }
];

const ServicesSection = () => {
  return (
    <section className="services-section" id="all-services">
      <div className="services-container container">
        
        {/* Header */}
        <motion.div 
          className="services-header"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="section-header">
            <span className="section-line"></span>
            <span className="section-subtitle">SERVICES</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="services-title">
            Every Service Your<br/>
            <span className="title-highlight">Creator Career Deserves</span>
          </motion.h2>
        </motion.div>

        {/* Grid */}
        <motion.div 
          className="services-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service, index) => (
            <motion.div variants={fadeInUp} className="service-card" key={index}>
              <div className="service-icon-wrapper">
                {service.icon}
              </div>
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-desc">{service.description}</p>
              <a href="#" className="service-read-more">
                Read More <ArrowRight size={14} className="arrow-icon" />
              </a>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default ServicesSection;
