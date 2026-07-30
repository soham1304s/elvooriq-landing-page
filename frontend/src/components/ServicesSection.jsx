import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { servicesDetails } from '../data/servicesData';
import ServiceModal from './ServiceModal';
import './ServicesSection.css';

const iconMap = {
  Users,
  Award,
  Handshake,
  TrendingUp,
  UserPlus,
  Megaphone,
  GraduationCap,
  Wrench,
  Radio
};

const ServicesSection = () => {
  const [activeModalIndex, setActiveModalIndex] = useState(null);

  const handleOpenModal = (index) => {
    setActiveModalIndex(index);
  };

  const handleCloseModal = () => {
    setActiveModalIndex(null);
  };

  const handlePrevModal = () => {
    setActiveModalIndex((prevIndex) => 
      prevIndex === 0 ? servicesDetails.length - 1 : prevIndex - 1
    );
  };

  const handleNextModal = () => {
    setActiveModalIndex((prevIndex) => 
      prevIndex === servicesDetails.length - 1 ? 0 : prevIndex + 1
    );
  };

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
          {servicesDetails.map((service, index) => {
            const IconComponent = iconMap[service.iconName] || Users;
            return (
              <motion.div 
                variants={fadeInUp} 
                className="service-card" 
                key={service.id || index}
                onClick={() => handleOpenModal(index)}
              >
                <div className="service-icon-wrapper">
                  <IconComponent size={20} />
                </div>
                <h3 className="service-card-title">{service.title}</h3>
                <p className="service-card-desc">{service.subtitle}</p>
                <button 
                  type="button" 
                  className="service-read-more"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(index);
                  }}
                >
                  Read More <ArrowRight size={14} className="arrow-icon" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>

      </div>

      {/* Interactive Popup Modal for all 9 sections */}
      <AnimatePresence>
        {activeModalIndex !== null && (
          <ServiceModal
            service={servicesDetails[activeModalIndex]}
            currentIndex={activeModalIndex}
            totalServices={servicesDetails.length}
            onClose={handleCloseModal}
            onPrev={handlePrevModal}
            onNext={handleNextModal}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesSection;

